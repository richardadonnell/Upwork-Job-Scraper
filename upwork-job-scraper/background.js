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
  let notificationsEnabled = true; // Default state
  let newJobsCount = 0;
  let lastViewedTimestamp = 0;
  let schedule = {
    days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].reduce(
      (acc, day) => ({ ...acc, [day]: true }),
      {}
    ),
    startTime: "00:00",
    endTime: "23:59",
  };

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
        "lastViewedTimestamp",
        "schedule",
      ],
      (data) => {
        jobScrapingEnabled = data.jobScrapingEnabled !== false;
        webhookEnabled = data.webhookEnabled !== false;
        notificationsEnabled = data.notificationsEnabled !== false;
        checkFrequency = data.checkFrequency || 5;
        lastViewedTimestamp = data.lastViewedTimestamp || Date.now();
        schedule = data.schedule || schedule; // Load saved schedule or use default

        chrome.storage.local.get(["newJobsCount"], (result) => {
          newJobsCount = result.newJobsCount || 0;
          updateBadge();
        });

        console.log(
          "Extension initialized. Job scraping enabled:",
          jobScrapingEnabled
        );
        console.log("Schedule loaded:", schedule);

        if (jobScrapingEnabled) {
          updateAlarm();
        } else {
          chrome.alarms.clear("checkJobs");
        }

        loadFeedSourceSettings();
        initializeLastViewedTimestamp();

        if (typeof updateNotificationsEnabled === "function") {
          updateNotificationsEnabled(notificationsEnabled);
        }
      }
    );
  }

  function updateAlarm() {
    if (jobScrapingEnabled) {
      chrome.alarms.clear("checkJobs");

      // Add random variation to the check frequency (±15 seconds)
      const randomVariationMs = Math.floor(Math.random() * 31 - 15) * 1000; // Random between -15 and +15 seconds
      const baseDelayMinutes = checkFrequency;
      const totalDelayMinutes =
        (baseDelayMinutes * 60000 + randomVariationMs) / 60000;

      chrome.alarms.create("checkJobs", {
        delayInMinutes: totalDelayMinutes,
        periodInMinutes: checkFrequency,
      });

      console.log(
        "Alarm updated. Base frequency:",
        checkFrequency,
        "minutes, with random variation"
      );
      addToActivityLog(
        `Job check scheduled with random variation (base: ${checkFrequency}m)`
      );
    } else {
      chrome.alarms.clear("checkJobs");
      console.log("Alarm cleared because job scraping is disabled");
    }
  }

  // Modify the chrome.alarms.onAlarm listener
  chrome.alarms.onAlarm.addListener((alarm) => {
    try {
      if (alarm.name === "checkJobs" && jobScrapingEnabled) {
        if (isWithinSchedule()) {
          checkForNewJobs(jobScrapingEnabled);
        } else {
          console.log("Skipping job check - outside of scheduled hours");
          addToActivityLog("Skipping job check - outside of scheduled hours");
        }
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

        // Reset the newJobsCount and persist it
        newJobsCount = 0;
        chrome.storage.local.set({ newJobsCount: 0 }, () => {
          updateBadge();
        });

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
          if (isWithinSchedule()) {
            checkForNewJobs(jobScrapingEnabled).then(() => {
              sendResponse({ success: true });
            });
          } else {
            const msg = "Manual scrape skipped - outside of scheduled hours";
            addToActivityLog(msg);
            sendResponse({ success: false, reason: msg });
          }
        } else {
          addToActivityLog(
            "Job scraping is disabled. Manual scrape not performed."
          );
          sendResponse({ success: false, reason: "Job scraping is disabled" });
        }
        return true;
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
      } else if (message.type === "updateNotificationSettings") {
        notificationsEnabled = message.enabled;
        // Save to storage to ensure persistence
        chrome.storage.sync.set(
          { notificationsEnabled: message.enabled },
          () => {
            console.log(
              "Notification settings saved to storage:",
              message.enabled
            );
          }
        );
        console.log(
          "Notification settings updated in memory:",
          notificationsEnabled
        );
        sendResponse({ success: true });
      } else if (message.type === "updateSchedule") {
        schedule = message.schedule;
        console.log("Schedule updated:", schedule);
        updateAlarm(); // Restart alarm with new schedule
        handled = true;
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

  // Add function to check if current time is within schedule
  function isWithinSchedule() {
    const now = new Date();
    const currentDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
      now.getDay()
    ];

    // Check if current day is enabled
    if (!schedule.days[currentDay]) {
      return false;
    }

    // Convert current time to minutes since midnight
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Convert schedule times to minutes since midnight
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // Import the functions from the new files
  importScripts("errorHandling.js");
  importScripts("jobScraping.js");
  importScripts("activityLog.js");
  importScripts("webhook.js");
  importScripts("notifications.js");
  importScripts("utils.js");

  // Import the webhook functions at the top of background.js
  importScripts("webhook.js", "activityLog.js");

  async function processJobs(newJobs) {
    try {
      console.log("Starting processJobs with", newJobs.length, "new jobs");

      // Get webhook settings
      const webhookSettings = await chrome.storage.sync.get([
        "webhookUrl",
        "webhookEnabled",
      ]);
      console.log("Current webhook settings:", webhookSettings);

      // Get existing jobs
      const data = await chrome.storage.local.get(["scrapedJobs"]);
      let existingJobs = data.scrapedJobs || [];
      let updatedJobs = [];
      let addedJobsCount = 0;

      // Sort new jobs by scraped time, newest first
      newJobs.sort((a, b) => b.scrapedAt - a.scrapedAt);

      // Process each new job
      for (const newJob of newJobs) {
        if (!existingJobs.some((job) => job.url === newJob.url)) {
          updatedJobs.push(newJob);
          addedJobsCount++;

          // Send to webhook if enabled and URL is set
          if (webhookSettings.webhookEnabled && webhookSettings.webhookUrl) {
            console.log("Sending job to webhook:", {
              jobTitle: newJob.title,
              webhookUrl: webhookSettings.webhookUrl,
            });

            try {
              await sendToWebhook(webhookSettings.webhookUrl, [newJob]);
              addToActivityLog(
                `Successfully sent job to webhook: ${newJob.title}`
              );
            } catch (error) {
              console.error("Failed to send job to webhook:", error);
              addToActivityLog(
                `Failed to send job to webhook: ${error.message}`
              );
            }
          } else {
            console.log("Webhook not enabled or URL not set:", webhookSettings);
          }
        }
      }

      // Combine and store jobs
      let allJobs = [...updatedJobs, ...existingJobs].slice(0, 100);

      await chrome.storage.local.set({ scrapedJobs: allJobs });
      addToActivityLog(
        `Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`
      );

      // Update badge and notify
      updateBadge();

      if (addedJobsCount > 0) {
        chrome.runtime.sendMessage({ type: "jobsUpdate", jobs: allJobs });

        // Use the sendNotification from notifications.js
        sendNotification(
          `Found ${addedJobsCount} new job${addedJobsCount > 1 ? "s" : ""}!`
        );
      }
    } catch (error) {
      console.error("Error in processJobs:", error);
      logAndReportError("Error in processJobs", error);
    }
  }

  function updateBadge() {
    // Always show the badge if there are accumulated new jobs
    chrome.action.setBadgeText({
      text: newJobsCount > 0 ? newJobsCount.toString() : "",
    });
    chrome.action.setBadgeBackgroundColor({ color: "#4688F1" });
  }

  // Update the storage change listener to be more specific
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync") {
      if (changes.notificationsEnabled) {
        notificationsEnabled = changes.notificationsEnabled.newValue;
        // Update the notifications module with the new state
        if (typeof updateNotificationsEnabled === "function") {
          updateNotificationsEnabled(notificationsEnabled);
        }
        console.log(
          "Notification state updated from storage:",
          notificationsEnabled
        );
      }
    }
  });

  // Add this near your other chrome.notifications listeners
  chrome.notifications.onButtonClicked.addListener(
    (notificationId, buttonIndex) => {
      if (buttonIndex === 0) {
        // First button (Login to Upwork)
        chrome.tabs.create({
          url: "https://www.upwork.com/ab/account-security/login",
        });
      }
      // Button index 1 is Close, which just dismisses the notification
    }
  );
} catch (error) {
  console.error("Uncaught error in background script:", error);
  logAndReportError("Uncaught error in background script", error);
}
