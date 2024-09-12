// Wrap the main logic in a try-catch block
try {
  // Open settings page when extension icon is clicked
  chrome.action.onClicked.addListener(() => {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error("Error opening options page:", error);
      logAndReportError("Error opening options page", error);
    }
  });

  // Add these variables at the top of the file
  let selectedFeedSource = "most-recent";
  let customSearchUrl = "";
  let checkFrequency = 5; // Default to 5 minutes
  let webhookEnabled = false;
  let jobScrapingEnabled = true; // Default to true, but we'll load the actual state
  let notificationsEnabled = true;

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
        "lastViewedTimestamp", // Add this
      ],
      (data) => {
        jobScrapingEnabled = data.jobScrapingEnabled !== false; // Default to true if not set
        webhookEnabled = data.webhookEnabled !== false;
        notificationsEnabled = data.notificationsEnabled !== false;
        checkFrequency = data.checkFrequency || 5; // Default to 5 minutes if not set
        lastViewedTimestamp = data.lastViewedTimestamp || Date.now(); // Initialize lastViewedTimestamp

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

  let newJobsCount = 0;
  let lastViewedTimestamp = 0;

  // Modify the chrome.alarms.onAlarm listener
  chrome.alarms.onAlarm.addListener((alarm) => {
    try {
      if (alarm.name === "checkJobs" && jobScrapingEnabled) {
        checkForNewJobs();
      }
    } catch (error) {
      logAndReportError("Error in onAlarm listener", error);
    }
  });

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
      logAndReportError("Error in message listener", error);
      sendResponse({ error: "An error occurred" });
    }

    return handled; // Only keep the message channel open if we handled the message
  });

  // Add this new listener for notification clicks
  chrome.notifications.onClicked.addListener((notificationId) => {
    chrome.runtime.openOptionsPage();
  });

  // Add this function to initialize lastViewedTimestamp when the extension starts
  function initializeLastViewedTimestamp() {
    chrome.storage.local.get("lastViewedTimestamp", (data) => {
      lastViewedTimestamp = data.lastViewedTimestamp || Date.now();
      chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });
    });
  }

  // Import the functions from the new files
  importScripts("errorHandling.js");
  importScripts("jobScraping.js");
  importScripts("activityLog.js");
  importScripts("webhook.js");
  importScripts("notifications.js");
  importScripts("utils.js");
} catch (error) {
  console.error("Uncaught error in background script:", error);
  logAndReportError("Uncaught error in background script", error);
}
