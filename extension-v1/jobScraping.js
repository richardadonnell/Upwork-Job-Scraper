// Simple lock functions with improved error handling
async function acquireLock() {
  try {
    // Generate a unique lock ID for this operation
    const lockId =
      "lock_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);

    // Get the current lock state first
    const data = await chrome.storage.local.get([
      "scrapingLock",
      "lockTimestamp",
    ]);

    // Check if there's an existing lock
    if (data.scrapingLock) {
      // If lock exists, check if it's stale (older than 10 minutes)
      const now = Date.now();
      const lockTime = data.lockTimestamp || 0;
      const lockAgeMinutes = (now - lockTime) / (1000 * 60);

      if (lockAgeMinutes < 10) {
        // Lock is still valid
        addToActivityLog(
          "Lock acquisition failed: Another job scraping operation is in progress (running for " +
            lockAgeMinutes.toFixed(1) +
            " minutes)"
        );
        return false;
      }

      // Lock is stale, we'll force release it
      addToActivityLog(
        "Breaking stale lock (" + lockAgeMinutes.toFixed(1) + " minutes old)"
      );
    }

    // Set the lock with timestamp in a single operation
    await chrome.storage.local.set({
      scrapingLock: true,
      lockTimestamp: Date.now(),
      lockId: lockId,
    });

    // Verify our lock was set (check if our lockId was stored)
    const verification = await chrome.storage.local.get(["lockId"]);
    if (verification.lockId !== lockId) {
      addToActivityLog(
        "Lock verification failed: Another process acquired the lock first"
      );
      return false;
    }

    addToActivityLog("Job scraping lock acquired successfully");
    return true;
  } catch (error) {
    console.error("Error acquiring lock:", error);
    addToActivityLog("Failed to acquire job scraping lock: " + error.message);
    return false;
  }
}

async function releaseLock() {
  try {
    await chrome.storage.local.remove([
      "scrapingLock",
      "lockTimestamp",
      "lockId",
    ]);
    addToActivityLog("Job scraping lock released");
    return true;
  } catch (error) {
    console.error("Error releasing lock:", error);
    addToActivityLog("Failed to release job scraping lock: " + error.message);
    return false;
  }
}

// Wrap your main functions with try-catch blocks
// Remove the redundant declaration that conflicts with background.js
// const jobScrapingEnabled = true; // or load the value from storage

async function checkForNewJobs(jobScrapingEnabled) {
  let activeTab = null;
  let lockAcquired = false;

  try {
    if (!jobScrapingEnabled) {
      addToActivityLog("Job scraping is disabled. Skipping job check.");
      return;
    }

    // Try to acquire lock and set the flag
    lockAcquired = await acquireLock();
    if (!lockAcquired) {
      addToActivityLog(
        "Another job scraping operation is in progress. Skipping."
      );
      return;
    }

    try {
      // Get enabled pairs
      const enabledPairs = await getEnabledPairs();
      if (enabledPairs.length === 0) {
        addToActivityLog(
          "No enabled search-webhook pairs found. Skipping job check."
        );
        return;
      }

      addToActivityLog("Starting job check...");

      // Process each enabled pair
      for (const pair of enabledPairs) {
        try {
          if (!pair.searchUrl) {
            addToActivityLog(
              `Skipping pair ${pair.name}: No search URL configured`
            );
            continue;
          }

          addToActivityLog(`Checking jobs for pair: ${pair.name}`);

          // Create a new tab with the search URL
          try {
            activeTab = await chrome.tabs.create({
              url: pair.searchUrl,
              active: false,
            });
          } catch (error) {
            throw new Error(
              `Failed to create tab for ${pair.name}: ${error.message}`
            );
          }

          try {
            // Wait for the page to load
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Page load timeout after 30 seconds"));
              }, 30000);

              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === activeTab.id && info.status === "complete") {
                  chrome.tabs.onUpdated.removeListener(listener);
                  clearTimeout(timeout);
                  resolve();
                }
              });
            });

            // Check if the user is logged out
            const loginCheckResults = await chrome.scripting
              .executeScript({
                target: { tabId: activeTab.id },
                function: isUserLoggedOut,
              })
              .catch((error) => {
                throw new Error(
                  `Failed to check login status: ${error.message}`
                );
              });

            if (loginCheckResults?.[0]?.result) {
              const warningMessage =
                "Warning: You need to log in to Upwork to ensure all available jobs are being scraped. Click the notification to log in.";
              addToActivityLog(warningMessage);
              chrome.runtime.sendMessage({
                type: "loginWarning",
                message: warningMessage,
              });
              sendLoginNotification(warningMessage);
              throw new Error(warningMessage);
            }

            // Execute the scraping script
            const results = await chrome.scripting
              .executeScript({
                target: { tabId: activeTab.id },
                function: scrapeJobsFromPage,
              })
              .catch((error) => {
                throw new Error(
                  `Failed to execute scraping script: ${error.message}`
                );
              });

            if (results?.[0]?.result) {
              const jobs = results[0].result;
              if (!Array.isArray(jobs)) {
                throw new Error("Unexpected scraping result format");
              }

              // Add source information to jobs
              for (const job of jobs) {
                job.source = {
                  name: pair.name,
                  searchUrl: pair.searchUrl,
                  webhookUrl: pair.webhookUrl,
                };
              }

              if (jobs.length > 0) {
                addToActivityLog(
                  `Scraped ${jobs.length} jobs from ${pair.name}`
                );
                await processJobs(jobs).catch((error) => {
                  throw new Error(`Failed to process jobs: ${error.message}`);
                });
              } else {
                addToActivityLog(`No jobs found for ${pair.name}`);
              }
            } else {
              addToActivityLog(
                `No jobs scraped or unexpected result for ${pair.name}`
              );
            }
          } finally {
            // Always try to close the tab
            if (activeTab) {
              try {
                const tabToCloseId = activeTab.id;
                await chrome.tabs.remove(tabToCloseId);
                activeTab = null;
              } catch (error) {
                console.error(`Failed to close tab for ${pair.name}:`, error);
                addToActivityLog(
                  `Warning: Failed to close tab for ${pair.name}`
                );
              }
            }
          }

          addToActivityLog(`Job check completed for ${pair.name}`);
        } catch (error) {
          console.error(`Error checking jobs for pair ${pair.name}:`, error);
          addToActivityLog(
            `Failed to check jobs for ${pair.name}: ${error.message}`
          );

          // Ensure tab is closed even if there's an error
          if (activeTab) {
            try {
              const tabToCloseId = activeTab.id;
              await chrome.tabs.remove(tabToCloseId);
              activeTab = null;
            } catch (closeError) {
              console.error(
                `Failed to close tab after error for ${pair.name}:`,
                closeError
              );
            }
          }
        }
      }
    } finally {
      console.log("Inner finally block executed (lock release removed).");
    }
  } catch (error) {
    console.error("Error in checkForNewJobs:", error);
    addToActivityLog(`Error in job check: ${error.message}`);

    // Final attempt to clean up any leftover tab
    if (activeTab) {
      try {
        await chrome.tabs.remove(activeTab.id);
      } catch (closeError) {
        console.error(
          "Failed to close tab in outer error handler:",
          closeError
        );
      }
    }
  } finally {
    if (lockAcquired) {
      await releaseLock();
    }
  }
}

async function processJobs(newJobs) {
  try {
    console.log("Starting processJobs with", newJobs.length, "new jobs");
    addToActivityLog(`Processing ${newJobs.length} new jobs`);

    // Get existing jobs
    const data = await chrome.storage.local.get(["scrapedJobs"]);
    const existingJobs = data.scrapedJobs || [];
    const updatedJobs = [];
    let addedJobsCount = 0;

    // Sort new jobs by scraped time, newest first
    newJobs.sort((a, b) => b.scrapedAt - a.scrapedAt);

    // Process each new job
    for (const newJob of newJobs) {
      // Skip if job already exists
      if (existingJobs.some((job) => job.url === newJob.url)) {
        continue;
      }

      updatedJobs.push(newJob);
      addedJobsCount++;

      // Only send to webhook if a webhook URL is configured
      if (newJob.source?.webhookUrl?.trim()) {
        try {
          await sendToWebhook(newJob.source.webhookUrl, [newJob]);
          addToActivityLog(
            `Successfully sent job to webhook: ${newJob.title} (${newJob.source.name})`
          );
        } catch (error) {
          console.error("Failed to send job to webhook:", error);
          addToActivityLog(
            `Failed to send job to webhook for ${newJob.source.name}: ${error.message}`
          );
        }
      } else {
        console.log(
          `Job from ${
            newJob.source?.name || "unknown source"
          } will not be sent to webhook (no webhook URL configured)`
        );
      }
    }

    // Combine and store jobs
    const allJobs = [...updatedJobs, ...existingJobs].slice(0, 100);
    await chrome.storage.local.set({ scrapedJobs: allJobs });
    addToActivityLog(
      `Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`
    );

    // Update badge and notify
    if (addedJobsCount > 0) {
      try {
        chrome.runtime.sendMessage({ type: "jobsUpdate", jobs: allJobs });
      } catch (error) {
        console.error("Failed to update settings page:", error);
      }

      if (notificationsEnabled) {
        sendNotification(
          `Found ${addedJobsCount} new job${addedJobsCount > 1 ? "s" : ""}!`
        );
      }
    }
  } catch (error) {
    console.error("Error in processJobs:", error);
    addToActivityLog(`Error processing jobs: ${error.message}`);
  }
}

// Update this function to load feed source settings
function loadFeedSourceSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      ["selectedFeedSource", "customSearchUrl", "webhookUrl", "webhookEnabled"],
      (data) => {
        selectedFeedSource = data.selectedFeedSource || "most-recent";
        customSearchUrl = data.customSearchUrl || "";
        webhookUrl = data.webhookUrl || "";
        webhookEnabled = data.webhookEnabled !== false; // Default to true if not set

        // If a custom URL is saved, use it regardless of the selectedFeedSource
        if (customSearchUrl) {
          selectedFeedSource = "custom-search";
        }

        resolve();
      }
    );
  });
}

function isUserLoggedOut() {
  const loginLink = document.querySelector(
    'a[href="/ab/account-security/login"][data-test="UpLink"]'
  );
  return loginLink !== null;
}

function clickLoginLink() {
  const loginLink = document.querySelector('a[data-test="UpLink"]');
  if (loginLink) {
    loginLink.click();
  }
}

// Function that runs in the context of the job search page
function scrapeJobsFromPage() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 1000; // 1 second

    function checkForJobs() {
      const jobElements = document.querySelectorAll(
        'article.job-tile, [data-test="JobTile"]'
      );
      console.log(
        `Attempt ${attempts + 1}: Found ${jobElements.length} job elements`
      );

      if (jobElements.length > 0) {
        // Jobs found, proceed with scraping
        const jobs = Array.from(jobElements).map((jobElement, index) => {
          console.log(`Processing job ${index + 1}/${jobElements.length}`);

          const titleElement = jobElement.querySelector(
            '.job-tile-title a, [data-test="job-tile-title-link"]'
          );
          const descriptionElement = jobElement.querySelector(
            '[data-test="job-description-text"], [data-test="UpCLineClamp JobDescription"]'
          );
          const jobInfoList = jobElement.querySelector(
            'ul[data-test="JobInfo"]'
          );
          const skillsElements = jobElement.querySelectorAll(
            '.air3-token-container .air3-token, [data-test="TokenClamp JobAttrs"] .air3-token'
          );
          const paymentVerifiedElement = jobElement.querySelector(
            '[data-test="payment-verified"], [data-test="payment-verification-status"]'
          );
          const clientRatingElement = jobElement.querySelector(
            ".air3-rating-value-text"
          );
          const clientSpendingElement = jobElement.querySelector(
            '[data-test="client-spendings"] strong, [data-test="client-spend"]'
          );
          const clientCountryElement = jobElement.querySelector(
            '[data-test="client-country"], [data-test="location"] .air3-badge-tagline'
          );
          const questionsElement = jobElement.querySelector(
            '[data-test="additional-questions"]'
          );

          let jobType;
          let budget;
          let hourlyRange;
          let estimatedTime;
          let skillLevel;

          if (jobInfoList) {
            const jobInfoItems = jobInfoList.querySelectorAll("li");
            for (const item of jobInfoItems) {
              if (item.getAttribute("data-test") === "job-type-label") {
                jobType = item.textContent.trim();
              } else if (
                item.getAttribute("data-test") === "experience-level"
              ) {
                skillLevel = item.textContent.trim();
              } else if (item.getAttribute("data-test") === "is-fixed-price") {
                const strongElement = item.querySelector("strong:last-child");
                budget = strongElement?.textContent.trim() ?? "N/A";
              } else if (item.getAttribute("data-test") === "duration-label") {
                const strongElement = item.querySelector("strong:last-child");
                estimatedTime = strongElement?.textContent.trim() ?? "N/A";
              }
            }

            if (jobType?.includes("Hourly")) {
              const parts = jobType.split(":");
              hourlyRange = parts.length > 1 ? parts[1].trim() : "N/A";
              jobType = "Hourly";
            } else if (jobType) {
              jobType = "Fixed price";
            }
          } else {
            // Fallback for Most Recent job feed structure
            const jobTypeElement = jobElement.querySelector(
              '[data-test="job-type"]'
            );
            if (jobTypeElement) {
              const jobTypeText = jobTypeElement.textContent || "";
              if (jobTypeText.includes("Fixed-price")) {
                jobType = "Fixed price";
                const budgetElement = jobElement.querySelector(
                  '[data-test="budget"]'
                );
                budget = budgetElement
                  ? budgetElement.textContent.trim()
                  : "N/A";
              } else if (jobTypeText.includes("Hourly")) {
                jobType = "Hourly";
                const hourlyRangeElement = jobElement.querySelector(
                  '[data-test="hourly-rate"]'
                );
                hourlyRange = hourlyRangeElement
                  ? hourlyRangeElement.textContent.trim()
                  : "N/A";
              }
            }

            const skillLevelElement = jobElement.querySelector(
              '[data-test="contractor-tier"]'
            );
            if (skillLevelElement) {
              skillLevel = skillLevelElement.textContent.trim();
            }

            const estimatedTimeElement = jobElement.querySelector(
              '[data-test="duration"]'
            );
            if (estimatedTimeElement) {
              estimatedTime = estimatedTimeElement.textContent.trim();
            }
          }

          const scrapedAt = Date.now();
          const humanReadableTime = new Date(scrapedAt).toLocaleString();

          let clientRating = "N/A";
          if (clientRatingElement) {
            if (
              clientRatingElement.classList.contains("air3-rating-value-text")
            ) {
              // Custom Search URL feed
              clientRating = clientRatingElement.textContent.trim();
            } else {
              // Most Recent feed
              const ratingText = jobElement.querySelector(".sr-only");
              if (ratingText) {
                const match = ratingText.textContent.match(
                  /Rating is (\d+(\.\d+)?) out of 5/
                );
                if (match) {
                  clientRating = match[1];
                }
              }
            }
          }

          let clientCountry = "N/A";
          if (clientCountryElement) {
            // Remove any child elements (like the icon) and get only the text content
            const clone = clientCountryElement.cloneNode(true);
            for (const child of clone.children) {
              child.remove();
            }
            clientCountry = clone.textContent.trim().replace(/\s+/g, " ");
          }

          let paymentVerified = false;
          if (paymentVerifiedElement) {
            // Custom Search URL feed
            if (
              paymentVerifiedElement.textContent.includes("Payment verified")
            ) {
              paymentVerified = true;
            }
            // Most Recent feed
            else if (
              paymentVerifiedElement.textContent.includes("Payment unverified")
            ) {
              paymentVerified = false;
            }
            // If neither text is found, we keep the default false value
          }

          let clientSpent = "N/A";
          const clientSpendingElementMostRecent = jobElement?.querySelector(
            ".client-spent-tier-badge"
          );
          const clientSpendingElementCustomSearch =
            jobElement?.querySelector(".client-spent");

          if (clientSpendingElementMostRecent) {
            clientSpent = `${clientSpendingElementMostRecent.textContent.trim()} spent`;
          } else if (clientSpendingElementCustomSearch) {
            clientSpent = `${clientSpendingElementCustomSearch.textContent.trim()} spent`;
          }

          const clientLocation =
            jobElement
              ?.querySelector(".client-location")
              ?.textContent?.trim() ?? "N/A";

          const questions = questionsElement
            ? Array.from(questionsElement.querySelectorAll("li")).map((li) =>
                li.textContent.trim()
              )
            : [];

          return {
            title: titleElement?.textContent?.trim() ?? "N/A",
            url: titleElement?.href ?? "N/A",
            jobType: jobType ?? "N/A",
            skillLevel: skillLevel ?? "N/A",
            budget: budget ?? "N/A",
            hourlyRange: hourlyRange ?? "N/A",
            estimatedTime: estimatedTime ?? "N/A",
            description: descriptionElement?.textContent?.trim() ?? "N/A",
            skills: Array.from(skillsElements).map(
              (skill) => skill?.textContent?.trim() ?? ""
            ),
            paymentVerified: paymentVerified,
            clientRating: clientRating,
            clientSpent: clientSpent,
            clientCountry: clientCountry,
            questions: questions,
            scrapedAt: scrapedAt,
            scrapedAtHuman: humanReadableTime,
            clientLocation: clientLocation,
            sourceUrl: window.location.href,
          };
        });

        console.log(`Successfully processed ${jobs.length} jobs`);
        resolve(jobs);
      } else if (attempts < maxAttempts) {
        // No jobs found yet, try again
        attempts++;
        console.log("Waiting for job elements to load...");
        setTimeout(checkForJobs, checkInterval);
      } else {
        // Max attempts reached, return empty array
        console.log("Max attempts reached. No jobs found.");
        resolve([]);
      }
    }

    checkForJobs();
  });
}

// Export functions using globalThis
globalThis.checkForNewJobs = checkForNewJobs;
globalThis.scrapeJobsFromPage = scrapeJobsFromPage;
globalThis.isUserLoggedOut = isUserLoggedOut;
globalThis.clickLoginLink = clickLoginLink;
