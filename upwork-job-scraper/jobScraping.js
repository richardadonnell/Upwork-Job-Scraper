// Wrap your main functions with try-catch blocks
let jobScrapingEnabled = true; // or load the value from storage

async function checkForNewJobs(jobScrapingEnabled) {
  try {
    if (!jobScrapingEnabled) {
      addToActivityLog("Job scraping is disabled. Skipping job check.");
      return;
    }

    await loadFeedSourceSettings();

    addToActivityLog("Starting job check...");

    let url;
    if (selectedFeedSource === "custom-search" && customSearchUrl) {
      url = customSearchUrl;
    } else {
      url = "https://www.upwork.com/nx/find-work/most-recent";
    }

    await new Promise((resolve, reject) => {
      chrome.tabs.create({ url: url, active: false }, async (tab) => {
        // Wait for the page to load
        await new Promise((resolve) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          });
        });

        // Check if the user is "fake" logged out
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            function: isUserLoggedOut,
          },
          async (results) => {
            if (results && results[0] && results[0].result) {
              // User is "fake" logged out, click the "Log In" link
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: clickLoginLink,
              });

              // Wait for the redirect to happen and the user to be logged in
              await new Promise((resolve) => setTimeout(resolve, 5000));

              // Navigate back to the custom search URL
              await chrome.tabs.update(tab.id, { url: url });

              // Wait for the page to load again
              await new Promise((resolve) => {
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                  if (tabId === tab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                  }
                });
              });

              // Check if the user is still "fake" logged out after the login attempt
              chrome.scripting.executeScript(
                {
                  target: { tabId: tab.id },
                  function: isUserLoggedOut,
                },
                (results) => {
                  if (results && results[0] && results[0].result) {
                    // User is still "fake" logged out, show a warning and send a notification
                    const warningMessage = "Warning: User is still logged out after the login attempt. Please log in manually.";
                    addToActivityLog(warningMessage);
                    chrome.runtime.sendMessage({ type: "loginWarning", message: warningMessage });

                    if (notificationsEnabled) {
                      sendNotification(warningMessage);
                    }

                    chrome.tabs.remove(tab.id);
                    reject(new Error(warningMessage));
                  } else {
                    // User is logged in, proceed with scraping jobs
                    chrome.scripting.executeScript(
                      {
                        target: { tabId: tab.id },
                        function: scrapeJobs,
                      },
                      (results) => {
                        if (chrome.runtime.lastError) {
                          addToActivityLog("Error: " + chrome.runtime.lastError.message);
                          reject(chrome.runtime.lastError);
                        } else if (results && results[0] && results[0].result) {
                          const jobs = results[0].result;
                          addToActivityLog(`Scraped ${jobs.length} jobs from ${url}`);
                          processJobs(jobs);
                        } else {
                          addToActivityLog("No jobs scraped or unexpected result");
                        }
                        chrome.tabs.remove(tab.id);
                        addToActivityLog("Job check completed for " + url);
                        resolve();
                      }
                    );
                  }
                }
              );
            } else {
              // User is logged in, proceed with scraping jobs
              chrome.scripting.executeScript(
                {
                  target: { tabId: tab.id },
                  function: scrapeJobs,
                },
                (results) => {
                  if (chrome.runtime.lastError) {
                    addToActivityLog("Error: " + chrome.runtime.lastError.message);
                    reject(chrome.runtime.lastError);
                  } else if (results && results[0] && results[0].result) {
                    const jobs = results[0].result;
                    addToActivityLog(`Scraped ${jobs.length} jobs from ${url}`);
                    processJobs(jobs);
                  } else {
                    addToActivityLog("No jobs scraped or unexpected result");
                  }
                  chrome.tabs.remove(tab.id);
                  addToActivityLog("Job check completed for " + url);
                  resolve();
                }
              );
            }
          }
        );
      });
    });
  } catch (error) {
    logAndReportError("Error in checkForNewJobs", error);
  }
}

function scrapeJobs() {
  const jobElements = document.querySelectorAll(
    'article.job-tile, [data-test="JobTile"]'
  );
  const jobs = Array.from(jobElements).map((jobElement) => {
    const titleElement = jobElement.querySelector(
      '.job-tile-title a, [data-test="job-tile-title-link"]'
    );
    const descriptionElement = jobElement.querySelector(
      '[data-test="job-description-text"], [data-test="UpCLineClamp JobDescription"]'
    );
    const jobInfoList = jobElement.querySelector('ul[data-test="JobInfo"]');
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

    let jobType, budget, hourlyRange, estimatedTime, skillLevel;

    if (jobInfoList) {
      const jobInfoItems = jobInfoList.querySelectorAll("li");
      jobInfoItems.forEach((item) => {
        if (item.getAttribute("data-test") === "job-type-label") {
          jobType = item.textContent.trim();
        } else if (item.getAttribute("data-test") === "experience-level") {
          skillLevel = item.textContent.trim();
        } else if (item.getAttribute("data-test") === "is-fixed-price") {
          budget = item.querySelector("strong:last-child").textContent.trim();
        } else if (item.getAttribute("data-test") === "duration-label") {
          estimatedTime = item
            .querySelector("strong:last-child")
            .textContent.trim();
        }
      });

      if (jobType && jobType.includes("Hourly")) {
        hourlyRange = jobType.split(":")[1].trim();
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
        if (jobTypeElement.textContent.includes("Fixed-price")) {
          jobType = "Fixed price";
          const budgetElement = jobElement.querySelector(
            '[data-test="budget"]'
          );
          budget = budgetElement ? budgetElement.textContent.trim() : "N/A";
        } else if (jobTypeElement.textContent.includes("Hourly")) {
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
      if (clientRatingElement.classList.contains("air3-rating-value-text")) {
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
      if (paymentVerifiedElement.textContent.includes("Payment verified")) {
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
    const clientSpendingElementMostRecent = jobElement.querySelector(
      '[data-test="client-spendings"] strong'
    );
    const clientSpendingElementCustomSearch = jobElement.querySelector(
      '[data-test="total-spent"] strong'
    );

    if (clientSpendingElementMostRecent) {
      clientSpent =
        clientSpendingElementMostRecent.textContent.trim() + " spent";
    } else if (clientSpendingElementCustomSearch) {
      clientSpent =
        clientSpendingElementCustomSearch.textContent.trim() + " spent";
    }

    return {
      title: titleElement ? titleElement.textContent.trim() : "N/A",
      url: titleElement ? titleElement.href : "N/A",
      jobType: jobType || "N/A",
      skillLevel: skillLevel || "N/A",
      budget: budget || "N/A",
      hourlyRange: hourlyRange || "N/A",
      estimatedTime: estimatedTime || "N/A",
      description: descriptionElement
        ? descriptionElement.textContent.trim()
        : "N/A",
      skills: Array.from(skillsElements).map((skill) =>
        skill.textContent.trim()
      ),
      paymentVerified: paymentVerified,
      clientRating: clientRating,
      clientSpent: clientSpent,
      clientCountry: clientCountry,
      attachments: attachments,
      questions: questions,
      scrapedAt: scrapedAt,
      scrapedAtHuman: humanReadableTime,
    };
  });

  return jobs;
}

// Wrap other important functions similarly
function processJobs(newJobs) {
  try {
    if (!jobScrapingEnabled) {
      addToActivityLog("Job scraping is disabled. Skipping job processing.");
      return;
    }

    chrome.storage.local.get(["scrapedJobs"], (data) => {
      let existingJobs = data.scrapedJobs || [];
      let updatedJobs = [];
      let addedJobsCount = 0;

      // Sort new jobs by scraped time, newest first
      newJobs.sort((a, b) => b.scrapedAt - a.scrapedAt);

      newJobs.forEach((newJob) => {
        if (!existingJobs.some((job) => job.url === newJob.url)) {
          updatedJobs.push(newJob);
          addedJobsCount++;

          // Only send to webhook if it's enabled
          if (webhookEnabled && webhookUrl) {
            sendToWebhook(webhookUrl, [newJob]);
          }
        }
      });

      // Combine new jobs with existing jobs, keeping the most recent ones
      let allJobs = [...updatedJobs, ...existingJobs];

      // Limit to a maximum of 100 jobs (or any other number you prefer)
      allJobs = allJobs.slice(0, 100);

      // Store the updated scraped jobs
      chrome.storage.local.set({ scrapedJobs: allJobs }, () => {
        addToActivityLog(
          `Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`
        );

        // Update the badge
        updateBadge();

        // Send message to update the settings page if it's open
        chrome.runtime.sendMessage(
          { type: "jobsUpdate", jobs: allJobs },
          (response) => {
            if (chrome.runtime.lastError) {
              // This will happen if the settings page is not open, which is fine
              console.log("Settings page not available for job update");
            }
          }
        );

        if (notificationsEnabled && addedJobsCount > 0) {
          sendNotification(
            `Found ${addedJobsCount} new job${addedJobsCount > 1 ? "s" : ""}!`
          );
        }
      });
    });
  } catch (error) {
    logAndReportError("Error in processJobs", error);
  }
}

// Update this function to load feed source settings
function loadFeedSourceSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [
        "selectedFeedSource",
        "customSearchUrl",
        "webhookUrl",
        "webhookEnabled",
      ],
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
  const loginLink = document.querySelector('a[data-test="UpLink"]');
  return loginLink !== null;
}

function clickLoginLink() {
  const loginLink = document.querySelector('a[data-test="UpLink"]');
  if (loginLink) {
    loginLink.click();
  }
}
