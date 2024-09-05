// Wrap the main logic in a try-catch block
try {
  // Initialize Sentry
  if (typeof Sentry !== "undefined") {
    Sentry.init({
      dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
      tracesSampleRate: 1.0,
      release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
      environment: "production",
    });
  }

  // Open settings page when extension icon is clicked
  chrome.action.onClicked.addListener(() => {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error("Error opening options page:", error);
      window.logAndReportError("Error opening options page", error);
    }
  });

  // Add these variables at the top of the file
  let selectedFeedSource = "most-recent";
  let customSearchUrl = "";
  let checkFrequency = 5; // Default to 5 minutes
  let webhookEnabled = false;
  let jobScrapingEnabled = true; // Default to true, but we'll load the actual state
  let notificationsEnabled = true;

  const ERROR_LOGGING_URL =
    "https://hook.us1.make.com/nzeveapbb4wihpkc5xbixkx9sr397jfa";
  const APP_VERSION = "1.30"; // Update this when you change your extension version

  // Function to log and report errors
  function logAndReportError(context, error) {
    const errorInfo = {
      context: context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent,
    };

    console.error("Error logged:", errorInfo);

    // Send error to Sentry
    Sentry.captureException(error, {
      extra: errorInfo,
    });
  }

  // Modify the existing chrome.runtime.onStartup and chrome.runtime.onInstalled listeners
  chrome.runtime.onStartup.addListener(initializeExtension);
  chrome.runtime.onInstalled.addListener(initializeExtension);

  // Add this new function to initialize the extension state
  function initializeExtension() {
    chrome.storage.sync.get(
      [
        "jobScrapingEnabled",
        "webhookEnabled",
        "notificationsEnabled",
        "checkFrequency",
      ],
      (data) => {
        jobScrapingEnabled = data.jobScrapingEnabled !== false; // Default to true if not set
        webhookEnabled = data.webhookEnabled !== false;
        notificationsEnabled = data.notificationsEnabled !== false;
        checkFrequency = data.checkFrequency || 5; // Default to 5 minutes if not set

        console.log(
          "Extension initialized. Job scraping enabled:",
          jobScrapingEnabled
        );

        if (jobScrapingEnabled) {
          updateAlarm();
        } else {
          chrome.alarms.clear("checkJobs");
        }

        loadFeedSourceSettings();
        initializeLastViewedTimestamp();
      }
    );
  }

  function updateAlarm() {
    if (jobScrapingEnabled) {
      chrome.alarms.clear("checkJobs");
      chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
      console.log("Alarm updated. Check frequency:", checkFrequency, "minutes");
    } else {
      chrome.alarms.clear("checkJobs");
      console.log("Alarm cleared because job scraping is disabled");
    }
  }

  // Wrap your main functions with try-catch blocks
  async function checkForNewJobs() {
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
        chrome.tabs.create({ url: url, active: false }, (tab) => {
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
        });
      });
    } catch (error) {
      window.logAndReportError("Error in checkForNewJobs", error);
    }
  }

  // Modify the chrome.alarms.onAlarm listener
  chrome.alarms.onAlarm.addListener((alarm) => {
    try {
      if (alarm.name === "checkJobs" && jobScrapingEnabled) {
        checkForNewJobs();
      }
    } catch (error) {
      window.logAndReportError("Error in onAlarm listener", error);
    }
  });

  let newJobsCount = 0;
  let lastViewedTimestamp = 0;

  function addToActivityLog(message) {
    const logEntry = `${new Date().toLocaleString()}: ${message}`;
    console.log(logEntry); // Log to console for debugging

    chrome.storage.local.get("activityLog", (data) => {
      const log = data.activityLog || [];
      log.unshift(logEntry);
      // Keep only the last 100 entries
      if (log.length > 100) log.pop();
      chrome.storage.local.set({ activityLog: log });
    });

    // Send message to update the settings page if it's open
    chrome.runtime.sendMessage(
      { type: "logUpdate", content: logEntry },
      (response) => {
        if (chrome.runtime.lastError) {
          // This will happen if the settings page is not open, which is fine
          console.log("Settings page not available for log update");
        }
      }
    );
  }

  function scrapeJobs() {
    let jobElements;
    if (window.location.href.includes("find-work/most-recent")) {
      jobElements = document.querySelectorAll(
        '[data-test="job-tile-list"] > section'
      );
    } else {
      jobElements = document.querySelectorAll("article.job-tile");
    }

    const jobs = Array.from(jobElements).map((jobElement) => {
      let titleElement,
        descriptionElement,
        budgetElement,
        postedElement,
        proposalsElement,
        clientCountryElement,
        paymentVerifiedElement,
        clientSpentElement,
        clientRatingElement,
        jobTypeElement,
        experienceLevelElement,
        projectLengthElement,
        skillsElements;

      if (window.location.href.includes("find-work/most-recent")) {
        titleElement = jobElement.querySelector(".job-tile-title a");
        descriptionElement = jobElement.querySelector(
          '[data-test="job-description-text"]'
        );
        budgetElement = jobElement.querySelector('[data-test="job-type"]');
        postedElement = jobElement.querySelector('[data-test="posted-on"]');
        proposalsElement = jobElement.querySelector('[data-test="proposals"]');
        clientCountryElement = jobElement.querySelector(
          '[data-test="client-country"]'
        );
        paymentVerifiedElement = jobElement.querySelector(
          '[data-test="payment-verification-status"]'
        );
        clientSpentElement = jobElement.querySelector(
          '[data-test="client-spendings"] strong'
        );
        clientRatingElement = jobElement.querySelector(
          '[data-test="client-feedback"] .air3-rating-value-text'
        );
        experienceLevelElement = jobElement.querySelector(
          '[data-test="contractor-tier"]'
        );
        projectLengthElement = jobElement.querySelector(
          '[data-test="duration"]'
        );
        skillsElements = jobElement.querySelectorAll(
          ".air3-token-wrap .air3-token"
        );
      } else {
        titleElement = jobElement.querySelector(".job-tile-title a");
        descriptionElement = jobElement.querySelector(
          '[data-test="UpCLineClamp JobDescription"] .mb-0'
        );
        budgetElement = jobElement.querySelector(
          'ul[data-test="JobInfo"] li:first-child strong'
        );
        postedElement = jobElement.querySelector(
          'small[data-test="job-pubilshed-date"] span:last-child'
        );
        proposalsElement = jobElement.querySelector(
          'li[data-test="proposals-tier"] strong'
        );
        clientCountryElement = jobElement.querySelector(
          'li[data-test="location"] .air3-badge-tagline'
        );
        paymentVerifiedElement = jobElement.querySelector(
          'li[data-test="payment-verified"]'
        );
        clientSpentElement = jobElement.querySelector(
          'li[data-test="total-spent"] strong'
        );
        clientRatingElement = jobElement.querySelector(
          ".air3-rating-value-text"
        );
        experienceLevelElement = jobElement.querySelector(
          'li[data-test="experience-level"] strong'
        );
        projectLengthElement = jobElement.querySelector(
          'li[data-test="duration-label"] strong:last-child'
        );
        skillsElements = jobElement.querySelectorAll(
          ".air3-token-container .air3-token"
        );
      }

      let budget = "";
      let jobType = "";
      if (budgetElement) {
        const budgetText = budgetElement.textContent.trim();
        if (budgetText.includes("Fixed price")) {
          jobType = "Fixed price";
          const fixedPriceElement = jobElement.querySelector(
            'li[data-test="is-fixed-price"] strong'
          );
          budget = fixedPriceElement
            ? fixedPriceElement.textContent.trim()
            : "";
        } else {
          jobType = "Hourly";
          budget = budgetText;
        }
      }

      const clientRating = clientRatingElement
        ? parseFloat(clientRatingElement.textContent.trim().split(" ")[0])
        : null;

      return {
        title: titleElement ? titleElement.textContent.trim() : "",
        url: titleElement ? titleElement.href : "",
        description: descriptionElement
          ? descriptionElement.textContent.trim()
          : "",
        budget: budget,
        jobType: jobType,
        posted: postedElement ? postedElement.textContent.trim() : "",
        proposals: proposalsElement ? proposalsElement.textContent.trim() : "",
        clientCountry: clientCountryElement
          ? clientCountryElement.textContent.trim()
          : "",
        paymentVerified: paymentVerifiedElement ? true : false,
        clientSpent: clientSpentElement
          ? clientSpentElement.textContent.trim()
          : "",
        clientRating: clientRating,
        experienceLevel: experienceLevelElement
          ? experienceLevelElement.textContent.trim()
          : "",
        projectLength: projectLengthElement
          ? projectLengthElement.textContent.trim()
          : "",
        skills: Array.from(skillsElements).map((skill) =>
          skill.textContent.trim()
        ),
        scrapedAt: Date.now(),
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

      chrome.storage.local.get(
        ["scrapedJobs", "lastViewedTimestamp"],
        (data) => {
          let existingJobs = data.scrapedJobs || [];
          let updatedJobs = [];
          let addedJobsCount = 0;

          // Update lastViewedTimestamp from storage
          lastViewedTimestamp = data.lastViewedTimestamp || 0;

          // Sort new jobs by posted time, newest first
          newJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));

          newJobs.forEach((newJob) => {
            if (!existingJobs.some((job) => job.url === newJob.url)) {
              updatedJobs.push(newJob);
              addedJobsCount++;

              // Increment newJobsCount if the job was scraped after the last viewed timestamp
              if (newJob.scrapedAt > lastViewedTimestamp) {
                newJobsCount++;
              }

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
                `Found ${addedJobsCount} new job${
                  addedJobsCount > 1 ? "s" : ""
                }!`
              );
            }
          });
        }
      );
    } catch (error) {
      window.logAndReportError("Error in processJobs", error);
    }
  }

  function updateBadge() {
    if (newJobsCount > 0) {
      chrome.action.setBadgeText({ text: newJobsCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }

  // Modify the message listener to include error handling
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let handled = false;

    try {
      if (message.type === "settingsPageOpened") {
        // Update the last viewed timestamp
        lastViewedTimestamp = Date.now();
        chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });

        // Reset the newJobsCount and update the badge
        newJobsCount = 0;
        updateBadge();

        handled = true;
      } else if (message.type === "updateCheckFrequency") {
        checkFrequency = message.frequency;
        updateAlarm();
        addToActivityLog(
          `Check frequency updated to ${checkFrequency} minute(s)`
        );
        handled = true;
      } else if (message.type === "updateFeedSources") {
        loadFeedSourceSettings().then(() => {
          sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
      } else if (message.type === "manualScrape") {
        if (jobScrapingEnabled) {
          checkForNewJobs().then(() => {
            sendResponse({ success: true });
          });
        } else {
          addToActivityLog(
            "Job scraping is disabled. Manual scrape not performed."
          );
          sendResponse({ success: false, reason: "Job scraping is disabled" });
        }
        return true; // Will respond asynchronously
      } else if (message.type === "ping") {
        sendResponse({ status: "ready" });
        return false; // Responded synchronously
      } else if (message.type === "updateWebhookSettings") {
        loadFeedSourceSettings().then(() => {
          sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
      } else if (message.type === "updateJobScraping") {
        jobScrapingEnabled = message.enabled;
        chrome.storage.sync.set(
          { jobScrapingEnabled: jobScrapingEnabled },
          () => {
            addToActivityLog(
              `Job scraping ${jobScrapingEnabled ? "enabled" : "disabled"}`
            );
            if (jobScrapingEnabled) {
              updateAlarm();
            } else {
              chrome.alarms.clear("checkJobs");
            }
            sendResponse({ success: true });
          }
        );
        return true; // Will respond asynchronously
      }

      if (handled) {
        sendResponse({ success: true });
      }
    } catch (error) {
      window.logAndReportError("Error in message listener", error);
      sendResponse({ error: "An error occurred" });
    }

    return handled; // Only keep the message channel open if we handled the message
  });

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  function sendToWebhook(webhookUrl, jobs) {
    try {
      if (!webhookEnabled) {
        addToActivityLog("Webhook is disabled. Skipping send.");
        return;
      }

      if (!isValidUrl(webhookUrl)) {
        addToActivityLog("Invalid webhook URL. Skipping send.");
        return;
      }

      addToActivityLog(`Sending job to webhook...`);
      const payload = jobs.map((job) => ({
        title: job.title,
        url: job.url,
        description: job.description,
        jobType: job.jobType,
        budget: job.budget,
        experienceLevel: job.experienceLevel,
        projectLength: job.projectLength,
        posted: job.posted,
        proposals: job.proposals,
        clientCountry: job.clientCountry,
        paymentVerified: job.paymentVerified,
        clientSpent: job.clientSpent,
        clientRating: job.clientRating,
        skills: job.skills,
        scrapedAt: job.scrapedAt,
      }));

      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (
            response.headers.get("content-type")?.includes("application/json")
          ) {
            return response.json();
          } else {
            return response.text();
          }
        })
        .then((result) => {
          if (typeof result === "string") {
            addToActivityLog(`Webhook response: ${result}`);
          } else {
            addToActivityLog("Job sent to webhook successfully!");
          }
        })
        .catch((error) => {
          addToActivityLog(
            "Error sending job to webhook. Check the console for details."
          );
          console.error("Error:", error);
        });
    } catch (error) {
      window.logAndReportError("Error in sendToWebhook", error);
    }
  }

  function sendNotification(message, duration = 30000) {
    // Default duration: 30 seconds
    if (!notificationsEnabled) {
      addToActivityLog(
        "Push notifications are disabled. Skipping notification."
      );
      return;
    }

    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("icon48.png"),
        title: "Upwork Job Scraper",
        message: message,
        requireInteraction: false, // Change this to false
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Notification error: ",
            chrome.runtime.lastError.message
          );
        } else {
          // Set a timeout to clear the notification after the specified duration
          setTimeout(() => {
            chrome.notifications.clear(notificationId);
          }, duration);
        }
      }
    );
  }

  // Add this new listener for notification clicks
  chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.runtime.openOptionsPage();
  });

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
          webhookEnabled = data.webhookEnabled || false;

          // If a custom URL is saved, use it regardless of the selectedFeedSource
          if (customSearchUrl) {
            selectedFeedSource = "custom-search";
          }

          resolve();
        }
      );
    });
  }

  // Add this function to initialize lastViewedTimestamp when the extension starts
  function initializeLastViewedTimestamp() {
    chrome.storage.local.get("lastViewedTimestamp", (data) => {
      lastViewedTimestamp = data.lastViewedTimestamp || Date.now();
      chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });
    });
  }

  // Function to send a test error
  function sendTestError(customMessage = "This is a test error") {
    const testError = new Error(customMessage);
    window.logAndReportError("Test Error", testError);
    console.log("Test error sent. Check the webhook for the report.");
  }

  // Expose the function to the global scope so it can be called from the console
  globalThis.sendTestError = sendTestError;
} catch (error) {
  console.error("Uncaught error in background script:", error);
  window.logAndReportError("Uncaught error in background script", error);
}
