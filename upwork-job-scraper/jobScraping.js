// Wrap your main functions with try-catch blocks
const jobScrapingEnabled = true; // or load the value from storage

async function checkForNewJobs(jobScrapingEnabled) {
  // Check if scraping is already in progress
  const backgroundPage = await chrome.runtime.getBackgroundPage();
  if (backgroundPage.isScrapingInProgress) {
    addToActivityLog("Job scraping already in progress, skipping this check");
    return;
  }

  const opId = startOperation("checkForNewJobs");
  try {
    // Set the lock
    backgroundPage.isScrapingInProgress = true;

    if (!jobScrapingEnabled) {
      addOperationBreadcrumb("Job scraping disabled, skipping check");
      addToActivityLog("Job scraping is disabled. Skipping job check.");
      return;
    }

    addOperationBreadcrumb("Loading feed source settings");
    await loadFeedSourceSettings();

    addToActivityLog("Starting job check...");
    addOperationBreadcrumb("Starting job check");

    let url;
    if (selectedFeedSource === "custom-search" && customSearchUrl) {
      url = customSearchUrl;
      addOperationBreadcrumb("Using custom search URL", { url });
    } else {
      url = "https://www.upwork.com/nx/find-work/most-recent";
      addOperationBreadcrumb("Using default most recent URL", { url });
    }

    await new Promise((resolve, reject) => {
      addOperationBreadcrumb("Creating new tab for scraping");
      chrome.tabs.create({ url: url, active: false }, async (tab) => {
        try {
          // Wait for the page to load
          addOperationBreadcrumb("Waiting for page to load");
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Page load timeout after 30 seconds"));
            }, 30000);

            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (tabId === tab.id && info.status === "complete") {
                chrome.tabs.onUpdated.removeListener(listener);
                clearTimeout(timeout);
                resolve();
              }
            });
          });

          addOperationBreadcrumb("Page loaded, checking login status");
          // Check if the user is "fake" logged out
          const loginCheckResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: isUserLoggedOut,
          });

          if (loginCheckResults?.[0]?.result) {
            addOperationBreadcrumb("User is logged out, attempting login");
            // User is "fake" logged out, click the "Log In" link
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: clickLoginLink,
            });

            // Wait for the redirect to happen and the user to be logged in
            addOperationBreadcrumb("Waiting for login redirect");
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Navigate back to the custom search URL
            addOperationBreadcrumb("Navigating back to search URL", { url });
            await chrome.tabs.update(tab.id, { url: url });

            // Wait for the page to load again
            addOperationBreadcrumb("Waiting for page to reload");
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Page reload timeout after 30 seconds"));
              }, 30000);

              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                  chrome.tabs.onUpdated.removeListener(listener);
                  clearTimeout(timeout);
                  resolve();
                }
              });
            });

            // Check if the user is still "fake" logged out after the login attempt
            addOperationBreadcrumb("Verifying login status");
            const secondLoginCheck = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: isUserLoggedOut,
            });

            if (secondLoginCheck?.[0]?.result) {
              const warningMessage =
                "Warning: You need to log in to Upwork to ensure all available jobs are being scraped. Click the notification to log in.";
              addOperationBreadcrumb("Still logged out after attempt", {
                warning: warningMessage,
              });
              addToActivityLog(warningMessage);

              chrome.runtime.sendMessage({
                type: "loginWarning",
                message: warningMessage,
              });

              sendLoginNotification(warningMessage);
              await chrome.tabs.remove(tab.id);
              throw new Error(warningMessage);
            }
          }

          // User is logged in, proceed with scraping jobs
          addOperationBreadcrumb("Starting job scraping");
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scrapeJobs,
          });

          if (results?.[0]?.result) {
            const jobs = await results[0].result;
            if (jobs.length > 0) {
              addOperationBreadcrumb("Jobs found", { count: jobs.length });
              addToActivityLog(`Scraped ${jobs.length} jobs from ${url}`);
              await processJobs(jobs);
            } else {
              addOperationBreadcrumb("No jobs found");
              addToActivityLog("No jobs found on the page");
            }
          } else {
            addOperationBreadcrumb("No scraping results");
            addToActivityLog("No jobs scraped or unexpected result");
          }

          await chrome.tabs.remove(tab.id);
          addToActivityLog(`Job check completed for ${url}`);
          addOperationBreadcrumb("Job check completed");
          resolve();
        } catch (error) {
          addOperationBreadcrumb(
            "Error during job check",
            { error: error.message },
            "error"
          );
          if (tab?.id) {
            chrome.tabs.remove(tab.id).catch(console.error);
          }
          reject(error);
        }
      });
    });
  } catch (error) {
    addOperationBreadcrumb(
      "Fatal error in checkForNewJobs",
      { error: error.message },
      "error"
    );
    logAndReportError("Error in checkForNewJobs", error, { url });
    throw error; // Re-throw to be handled by the caller
  } finally {
    // Release the lock in finally block to ensure it's always released
    backgroundPage.isScrapingInProgress = false;
    endOperation();
  }
}

function scrapeJobs() {
  console.log("Starting job scraping...");
  console.log("Current URL:", window.location.href);

  // Wait for job elements to appear
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
          console.log("Title element found:", Boolean(titleElement));

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
          const attachmentsElement = jobElement.querySelector(
            '[data-test="attachments"]'
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

          const attachments = attachmentsElement
            ? Array.from(attachmentsElement.querySelectorAll("a")).map((a) => ({
                name: a.textContent.trim(),
                url: a.href,
              }))
            : [];

          const questions = questionsElement
            ? Array.from(questionsElement.querySelectorAll("li")).map((li) =>
                li.textContent.trim()
              )
            : [];

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

          const jobPostingTime =
            jobElement
              ?.querySelector(".job-tile-timestamp")
              ?.textContent?.trim() ?? "N/A";
          const clientLocation =
            jobElement
              ?.querySelector(".client-location")
              ?.textContent?.trim() ?? "N/A";

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
            attachments: attachments,
            questions: questions,
            scrapedAt: scrapedAt,
            scrapedAtHuman: humanReadableTime,
            jobPostingTime: jobPostingTime,
            clientLocation: clientLocation,
          };
        });
        console.log(`Successfully processed ${jobs.length} jobs`);
        resolve(jobs);
      } else if (attempts < maxAttempts) {
        // No jobs found yet, try again
        attempts++;
        console.log("Waiting for job elements to load...");
        console.log(
          "Job feed container:",
          document.querySelector('[data-test="JobsList"]')?.innerHTML ||
            "No job feed found"
        );
        setTimeout(checkForJobs, checkInterval);
      } else {
        // Max attempts reached, return empty array
        console.log("Max attempts reached. No jobs found.");
        console.log("Page title:", document.title);
        console.log(
          "Main content area:",
          document.querySelector("main")?.innerHTML || "No main content found"
        );
        resolve([]);
      }
    }

    checkForJobs();
  });
}

async function processJobs(newJobs) {
  const opId = startOperation("processJobs");
  try {
    addOperationBreadcrumb("Starting job processing", {
      jobCount: newJobs.length,
    });
    console.log("Starting processJobs with", newJobs.length, "new jobs");

    // Get webhook settings
    addOperationBreadcrumb("Fetching webhook settings");
    const webhookSettings = await chrome.storage.sync.get([
      "webhookUrl",
      "webhookEnabled",
    ]);
    console.log("Current webhook settings:", webhookSettings);

    // Get existing jobs
    addOperationBreadcrumb("Fetching existing jobs");
    const data = await chrome.storage.local.get(["scrapedJobs"]);
    const existingJobs = data.scrapedJobs || [];
    const updatedJobs = [];
    let addedJobsCount = 0;

    // Sort new jobs by scraped time, newest first
    newJobs.sort((a, b) => b.scrapedAt - a.scrapedAt);
    addOperationBreadcrumb("Sorted new jobs by timestamp");

    // Process each new job
    for (const newJob of newJobs) {
      if (!existingJobs.some((job) => job.url === newJob.url)) {
        updatedJobs.push(newJob);
        addedJobsCount++;

        // Send to webhook if enabled and URL is set
        if (webhookSettings.webhookEnabled && webhookSettings.webhookUrl) {
          addOperationBreadcrumb("Sending job to webhook", {
            jobTitle: newJob.title,
            jobUrl: newJob.url,
          });

          try {
            await sendToWebhook(webhookSettings.webhookUrl, [newJob]);
            addOperationBreadcrumb("Successfully sent job to webhook");
            addToActivityLog(
              `Successfully sent job to webhook: ${newJob.title}`
            );
          } catch (error) {
            addOperationBreadcrumb(
              "Failed to send job to webhook",
              { error: error.message },
              "error"
            );
            console.error("Failed to send job to webhook:", error);
            addToActivityLog(`Failed to send job to webhook: ${error.message}`);
          }
        } else {
          addOperationBreadcrumb(
            "Webhook not enabled or URL not set",
            webhookSettings
          );
        }
      }
    }

    // Combine and store jobs
    const allJobs = [...updatedJobs, ...existingJobs].slice(0, 100);
    addOperationBreadcrumb("Storing updated jobs", {
      newJobsCount: addedJobsCount,
      totalJobs: allJobs.length,
    });

    await chrome.storage.local.set({ scrapedJobs: allJobs });
    addToActivityLog(
      `Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`
    );

    // Update badge and notify
    addOperationBreadcrumb("Updating badge and sending notifications");
    updateBadge();

    if (addedJobsCount > 0) {
      try {
        await chrome.runtime.sendMessage({
          type: "jobsUpdate",
          jobs: allJobs,
        });
      } catch (error) {
        addOperationBreadcrumb(
          "Settings page not available for job update",
          { error: error.message },
          "info"
        );
      }

      if (notificationsEnabled) {
        sendNotification(
          `Found ${addedJobsCount} new job${addedJobsCount > 1 ? "s" : ""}!`
        );
      }
    }

    addOperationBreadcrumb("Job processing completed successfully");
  } catch (error) {
    addOperationBreadcrumb(
      "Fatal error in processJobs",
      { error: error.message },
      "error"
    );
    logAndReportError("Error in processJobs", error, {
      jobCount: newJobs?.length,
      addedJobsCount,
    });
    throw error; // Re-throw to be handled by the caller
  } finally {
    endOperation();
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

// Export functions to the global scope
globalThis.checkForNewJobs = checkForNewJobs;
globalThis.scrapeJobs = scrapeJobs;
