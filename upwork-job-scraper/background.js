// Add global unhandled promise rejection handler
globalThis.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  logAndReportError("Unhandled promise rejection", event.reason);
  event.preventDefault(); // Prevent the default handling
});

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
  const selectedFeedSource = "most-recent";
  const customSearchUrl = "";
  let checkFrequency = 5; // Default to 5 minutes
  let webhookEnabled = false;
  let jobScrapingEnabled = true; // Default to true, but we'll load the actual state
  let notificationsEnabled = true; // Default state
  let newJobsCount = 0;
  let lastViewedTimestamp = 0;
  let schedule = {
    days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].reduce(
      (acc, day) => {
        acc[day] = true;
        return acc;
      },
      {}
    ),
    startTime: "00:00",
    endTime: "23:59",
  };

  let isInitializing = false;
  let lastInitializationTime = 0;
  const MIN_INITIALIZATION_INTERVAL = 5000; // 5 seconds minimum between initializations

  // Initialize settings when extension starts
  chrome.storage.sync.get(
    ["jobScrapingEnabled", "checkFrequency", "schedule"],
    (data) => {
      jobScrapingEnabled =
        data.jobScrapingEnabled !== undefined ? data.jobScrapingEnabled : true;
      checkFrequency = data.checkFrequency || 5;
      schedule = data.schedule || schedule;
      updateAlarm();
    }
  );

  // Function to calculate next valid check time
  function calculateNextCheckTime() {
    const now = new Date();
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const currentDay = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Convert schedule times to minutes
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    let nextCheckTime = new Date();

    // If current day is not enabled or we're outside active hours
    if (
      !schedule.days[currentDay] ||
      currentMinutes < startMinutes ||
      currentMinutes > endMinutes
    ) {
      // Find next valid day
      let daysToAdd = 1;
      let foundValidDay = false;

      while (!foundValidDay && daysToAdd <= 7) {
        const nextDay = new Date(
          now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
        );
        const nextDayKey = days[nextDay.getDay()];

        if (schedule.days[nextDayKey]) {
          foundValidDay = true;
          nextCheckTime = nextDay;
          nextCheckTime.setHours(startHour, startMinute, 0, 0);
        } else {
          daysToAdd++;
        }
      }

      if (!foundValidDay) {
        return null;
      }
    } else if (currentMinutes < startMinutes) {
      // Same day, but before start time
      nextCheckTime.setHours(startHour, startMinute, 0, 0);
    } else if (currentMinutes > endMinutes) {
      // Move to next valid day
      nextCheckTime = calculateNextCheckTime(
        new Date(now.getTime() + 24 * 60 * 60 * 1000)
      );
    }

    return nextCheckTime;
  }

  function updateAlarm() {
    if (jobScrapingEnabled) {
      chrome.alarms.clear("checkJobs");

      const nextCheckTime = calculateNextCheckTime();
      if (!nextCheckTime) {
        console.log("No valid check times found in the next week");
        addToActivityLog("No valid check times found in the next week");
        return;
      }

      const now = new Date();
      const delayInMinutes = (nextCheckTime.getTime() - now.getTime()) / 60000;

      // Add random variation to the check frequency (±15 seconds)
      const randomVariationMs = Math.floor(Math.random() * 31 - 15) * 1000;
      const totalDelayMinutes =
        (delayInMinutes * 60000 + randomVariationMs) / 60000;

      chrome.alarms.create("checkJobs", {
        delayInMinutes: totalDelayMinutes,
        periodInMinutes: checkFrequency,
      });

      console.log("Alarm updated. Next check at:", nextCheckTime);
      addToActivityLog(
        `Job check scheduled for ${nextCheckTime.toLocaleString()}`
      );
    } else {
      chrome.alarms.clear("checkJobs");
      console.log("Alarm cleared because job scraping is disabled");
    }
  }

  // Modify the existing chrome.runtime.onStartup and chrome.runtime.onInstalled listeners
  chrome.runtime.onStartup.addListener(() => {
    tryInitializeExtension("onStartup");
  });

  chrome.runtime.onInstalled.addListener(() => {
    tryInitializeExtension("onInstalled");
  });

  // Add this new function to handle initialization attempts
  function tryInitializeExtension(source) {
    const now = Date.now();
    if (isInitializing) {
      console.log(
        `Skipping duplicate initialization from ${source} - already initializing`
      );
      return;
    }
    if (now - lastInitializationTime < MIN_INITIALIZATION_INTERVAL) {
      console.log(
        `Skipping duplicate initialization from ${source} - too soon after last initialization`
      );
      return;
    }

    initializeExtension(source);
  }

  // Add this new function to initialize the extension state
  async function initializeExtension(source) {
    if (isInitializing) {
      console.log(`Skipping duplicate initialization from ${source}`);
      return;
    }

    isInitializing = true;
    lastInitializationTime = Date.now();
    console.log(`Starting initialization from ${source}`);

    try {
      // Clear any existing alarms first
      await chrome.alarms.clear("checkJobs");

      // Migrate old storage to new format
      await migrateStorage();

      // Load other settings
      const data = await chrome.storage.sync.get([
        "jobScrapingEnabled",
        "notificationsEnabled",
        "checkFrequency",
        "lastViewedTimestamp",
        "schedule",
      ]);

      jobScrapingEnabled = data.jobScrapingEnabled !== false;
      notificationsEnabled = data.notificationsEnabled !== false;
      checkFrequency = data.checkFrequency || 5;
      lastViewedTimestamp = data.lastViewedTimestamp || Date.now();
      schedule = data.schedule || schedule;

      const result = await chrome.storage.local.get(["newJobsCount"]);
      newJobsCount = result.newJobsCount || 0;
      updateBadge();

      console.log(
        "Extension initialized. Job scraping enabled:",
        jobScrapingEnabled
      );
      console.log("Schedule loaded:", schedule);

      if (jobScrapingEnabled) {
        updateAlarm();
      }

      initializeLastViewedTimestamp();

      if (typeof updateNotificationsEnabled === "function") {
        updateNotificationsEnabled(notificationsEnabled);
      }
    } catch (error) {
      console.error("Error during initialization:", error);
      logAndReportError("Error during initialization", error);
    } finally {
      isInitializing = false;
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

    const handleAsyncOperation = async (operation) => {
      try {
        const result = await operation();
        sendResponse({ success: true, ...result });
      } catch (error) {
        console.error("Error in async operation:", error);
        logAndReportError("Error in async operation", error);
        sendResponse({ success: false, error: error.message });
      }
    };

    try {
      if (message.type === "settingsPageOpened") {
        // Update the last viewed timestamp
        lastViewedTimestamp = Date.now();
        chrome.storage.sync.set({ lastViewedTimestamp }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error saving lastViewedTimestamp:",
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }
          newJobsCount = 0;
          updateBadge();
          handled = true;
          sendResponse({ success: true });
        });
        return true; // Will respond asynchronously
      }

      if (message.type === "updateCheckFrequency") {
        checkFrequency = message.frequency;
        updateAlarm();
        addToActivityLog(
          `Check frequency updated to ${checkFrequency} minute(s)`
        );
        handled = true;
        sendResponse({ success: true });
      } else if (message.type === "updateFeedSources") {
        handled = true;
        handleAsyncOperation(async () => {
          await loadFeedSourceSettings();
          return {};
        });
        return true;
      } else if (message.type === "manualScrape") {
        handled = true;
        if (!jobScrapingEnabled) {
          addToActivityLog(
            "Job scraping is disabled. Manual scrape not performed."
          );
          sendResponse({ success: false, error: "Job scraping is disabled" });
          return true;
        }

        if (!isWithinSchedule()) {
          const msg = "Manual scrape skipped - outside of scheduled hours";
          addToActivityLog(msg);
          sendResponse({ success: false, error: msg });
          return true;
        }

        handleAsyncOperation(async () => {
          await checkForNewJobs(jobScrapingEnabled);
          return {};
        });
        return true;
      } else if (message.type === "ping") {
        handled = true;
        sendResponse({ success: true });
      } else if (message.type === "testWebhook") {
        handled = true;
        handleAsyncOperation(async () => {
          const response = await fetch(message.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify([message.testPayload]),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.text();
          console.log("Test webhook response:", result);
          return {};
        });
        return true;
      } else if (message.type === "updateWebhookSettings") {
        handled = true;
        handleAsyncOperation(async () => {
          await loadFeedSourceSettings();
          return {};
        });
        return true;
      } else if (message.type === "updateJobScraping") {
        handled = true;
        jobScrapingEnabled = message.enabled;
        chrome.storage.sync.set({ jobScrapingEnabled }, () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error saving job scraping setting:",
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }
          addToActivityLog(
            `Job scraping ${jobScrapingEnabled ? "enabled" : "disabled"}`
          );
          if (jobScrapingEnabled) {
            updateAlarm();
          } else {
            chrome.alarms.clear("checkJobs");
          }
          sendResponse({ success: true });
        });
        return true;
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
        updateAlarm(); // Recreate alarm with new schedule
        addToActivityLog("Schedule updated, next check time recalculated");
        handled = true;
      }
    } catch (error) {
      console.error("Error in message listener:", error);
      logAndReportError("Error in message listener", error);
      if (!handled) {
        sendResponse({ success: false, error: error.message });
      }
    }

    // If we haven't handled the message, send an error response
    if (!handled) {
      sendResponse({ success: false, error: "Unknown message type" });
    }
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
  importScripts(
    "errorHandling.js",
    "jobScraping.js",
    "activityLog.js",
    "webhook.js",
    "notifications.js",
    "utils.js",
    "storage.js"
  );

  // Import the webhook functions at the top of background.js
  importScripts("webhook.js", "activityLog.js");

  async function processJobs(newJobs) {
    try {
      console.log("Starting processJobs with", newJobs.length, "new jobs");
      addToActivityLog(`Processing ${newJobs.length} new jobs`);

      // Get enabled pairs
      const enabledPairs = await getEnabledPairs();
      console.log("Active search-webhook pairs:", enabledPairs.length);

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

        // Add source information to the job if not already present
        if (!newJob.source) {
          // Find the exact matching pair by search URL
          const sourcePair = enabledPairs.find(
            (pair) => pair.searchUrl === newJob.sourceUrl && pair.webhookUrl
          );
          if (sourcePair) {
            newJob.source = {
              name: sourcePair.name,
              searchUrl: sourcePair.searchUrl,
              webhookUrl: sourcePair.webhookUrl,
            };
          }
        }

        updatedJobs.push(newJob);
        addedJobsCount++;

        // Strict webhook pairing check
        if (newJob.source?.searchUrl && newJob.source?.webhookUrl) {
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
            logAndReportError("Webhook send error", error, {
              pairName: newJob.source.name,
              jobTitle: newJob.title,
            });
          }
        } else {
          console.log(
            `Skipping webhook for job: ${newJob.title} - No webhook URL configured`
          );
          addToActivityLog(
            `Skipped webhook for job from ${
              newJob.source?.name || "unknown source"
            } (no webhook URL configured)`
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
      newJobsCount += addedJobsCount;
      updateBadge();

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
      logAndReportError("Error in processJobs", error, {
        jobCount: newJobs?.length,
        addedJobsCount,
      });
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

  // Export functions to the global scope
  globalThis.calculateNextCheckTime = calculateNextCheckTime;
  globalThis.updateAlarm = updateAlarm;
  globalThis.tryInitializeExtension = tryInitializeExtension;
  globalThis.initializeExtension = initializeExtension;
  globalThis.initializeLastViewedTimestamp = initializeLastViewedTimestamp;
  globalThis.isWithinSchedule = isWithinSchedule;
  globalThis.processJobs = processJobs;
  globalThis.updateBadge = updateBadge;
} catch (error) {
  console.error("Uncaught error in background script:", error);
  logAndReportError("Uncaught error in background script", error);
}
