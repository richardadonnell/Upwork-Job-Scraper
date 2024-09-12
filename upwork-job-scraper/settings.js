import { logAndReportError } from "./sentry-init.js";

// Initialize Sentry only if running in the extension context
// if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
//   initializeSentry();
// }

// Initialize Sentry
if (typeof Sentry !== "undefined") {
  Sentry.init({
    dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
    tracesSampleRate: 1.0,
    release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
    environment: "production",
  });
}

async function waitForBackgroundScript() {
  console.log("Waiting for background script...");
  return new Promise((resolve) => {
    const checkBackgroundScript = async () => {
      try {
        await chrome.runtime.sendMessage({ type: "ping" });
        resolve();
      } catch (error) {
        if (error.message.includes("Receiving end does not exist")) {
          console.log("Background script not ready, retrying...");
          setTimeout(checkBackgroundScript, 100);
        } else {
          logAndReportError("Error waiting for background script", error);
          resolve(); // Resolve to avoid hanging
        }
      }
    };
    checkBackgroundScript();
  });
}

// Add this function near the top of the file, after the waitForBackgroundScript function

function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Add these functions at the top of your settings.js file

let countdownInterval;

function updateCountdown() {
  chrome.alarms.get("checkJobs", (alarm) => {
    if (alarm) {
      const now = new Date().getTime();
      const nextAlarm = alarm.scheduledTime;
      const timeUntilNextCheck = nextAlarm - now;
      const countdownElement = document.getElementById("countdown");
      countdownElement.textContent = `Next job check in: ${formatTime(
        timeUntilNextCheck
      )}`;
    }
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startCountdownUpdates() {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function stopCountdownUpdates() {
  clearInterval(countdownInterval);
}

async function initializeSettings() {
  try {
    await Promise.all([
      waitForBackgroundScript(),
      new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "getSettings" }, resolve);
      }),
    ]);

    const { logAndReportError } = await import("./error_handling.js");

    const settings = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getSettings" }, resolve);
    });

    document.getElementById("feed-source").value = settings.selectedFeedSource;
    document.getElementById("custom-search-url").value =
      settings.customSearchUrl;
    document.getElementById("check-frequency").value = settings.checkFrequency;
    document.getElementById("webhook-enabled").checked =
      settings.webhookEnabled;
    document.getElementById("job-scraping-enabled").checked =
      settings.jobScrapingEnabled;
    document.getElementById("notifications-enabled").checked =
      settings.notificationsEnabled;

    startCountdownUpdates();

    document
      .getElementById("save-settings")
      .addEventListener("click", async () => {
        const selectedFeedSource = document.getElementById("feed-source").value;
        const customSearchUrl =
          document.getElementById("custom-search-url").value;
        const checkFrequency = document.getElementById("check-frequency").value;
        const webhookEnabled =
          document.getElementById("webhook-enabled").checked;
        const jobScrapingEnabled = document.getElementById(
          "job-scraping-enabled"
        ).checked;
        const notificationsEnabled = document.getElementById(
          "notifications-enabled"
        ).checked;

        await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "saveSettings",
              selectedFeedSource: selectedFeedSource,
              customSearchUrl: customSearchUrl,
              checkFrequency: checkFrequency,
              webhookEnabled: webhookEnabled,
              jobScrapingEnabled: jobScrapingEnabled,
              notificationsEnabled: notificationsEnabled,
            },
            resolve
          );
        });

        addLogEntry("Settings saved");
      });

    document
      .getElementById("manual-scrape")
      .addEventListener("click", async () => {
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: "manualScrape" }, resolve);
        });
        addLogEntry("Manual scrape triggered");
      });

    document
      .getElementById("clear-jobs")
      .addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear all scraped jobs?")) {
          await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "clearJobs" }, resolve);
          });
          addLogEntry("All scraped jobs cleared");
          addJobEntries([]); // Add this line
        }
      });

    document.getElementById("open-custom-url").addEventListener("click", () => {
      const customSearchUrl =
        document.getElementById("custom-search-url").value;
      if (customSearchUrl) {
        window.open(customSearchUrl, "_blank");
      } else {
        alert("Please enter a custom search URL first.");
      }
    });

    document
      .getElementById("send-test-error")
      .addEventListener("click", async () => {
        const customMessage = prompt(
          "Enter a custom error message (optional):"
        );
        await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: "sendTestError", customMessage: customMessage },
            resolve
          );
        });
        addLogEntry("Test error sent");
      });

    chrome.runtime.sendMessage({ type: "getJobs" }, (response) => {
      addJobEntries(response.jobs);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "jobsUpdate") {
        addJobEntries(message.jobs);
      } else if (message.type === "jobsCleared") {
        addJobEntries([]);
      }
    });

    function updateTimeDifference(timestamp, element) {
      if (!timestamp) {
        element.textContent = "(unknown time)";
        return;
      }

      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let timeString;
      if (days > 0) {
        timeString = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        timeString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        timeString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        timeString = `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
      }

      element.textContent = timeString;
    }

    window.timeUpdateInterval = setInterval(() => {
      document.querySelectorAll(".time-difference").forEach((element) => {
        const timestamp = parseInt(element.getAttribute("data-timestamp"), 10);
        updateTimeDifference(timestamp, element);
      });
    }, 1000);

    function addJobEntries(jobs) {
      const jobList = document.getElementById("job-list");
      jobList.innerHTML = "";

      jobs.forEach((job) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = job.url;
        link.target = "_blank";
        link.textContent = job.title;
        listItem.appendChild(link);
        jobList.appendChild(listItem);
      });
    }

    function addLogEntry(message) {
      const logList = document.getElementById("log-list");
      const listItem = document.createElement("li");
      listItem.textContent = message;
      logList.appendChild(listItem);
    }

    document
      .getElementById("notifications-enabled")
      .addEventListener("change", async (event) => {
        const isEnabled = event.target.checked;
        await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "saveSettings",
              notificationsEnabled: isEnabled,
            },
            resolve
          );
        });
        addLogEntry(`Push notifications ${isEnabled ? "enabled" : "disabled"}`);
      });

    // Add this function near the top of the file, after other function declarations
    function clearAllJobs() {
      chrome.storage.local.set({ scrapedJobs: [] }, () => {
        addLogEntry("All scraped jobs cleared");
        addJobEntries([]);
        chrome.runtime.sendMessage({ type: "jobsCleared" });
      });
    }

    // Add this inside the initializeSettings function
    document.getElementById("clear-jobs").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all scraped jobs?")) {
        clearAllJobs();
      }
    });

    // Add this new event listener for the "Open Custom URL" button
    document.getElementById("open-custom-url").addEventListener("click", () => {
      const customSearchUrl =
        document.getElementById("custom-search-url").value;
      if (customSearchUrl) {
        window.open(customSearchUrl, "_blank");
      } else {
        alert("Please enter a custom search URL first.");
      }
    });

    const activityLog = await sendMessageToBackground({
      type: "getActivityLog",
    });
    activityLog.forEach((entry) => {
      addLogEntry(entry);
    });

    document.getElementById("clear-log").addEventListener("click", async () => {
      if (confirm("Are you sure you want to clear the activity log?")) {
        await sendMessageToBackground({ type: "clearActivityLog" });
        document.getElementById("log-list").innerHTML = "";
        addLogEntry("Activity log cleared");
      }
    });

    await sendMessageToBackground({
      type: "updateLastViewedTimestamp",
      timestamp: Date.now(),
    });

    // Add this function to handle saving the custom search URL
    async function saveCustomSearchURL() {
      const customSearchURL =
        document.getElementById("custom-search-url").value;
      await sendMessageToBackground({
        type: "setCustomSearchURL",
        url: customSearchURL,
      });
      alert("Custom search URL saved successfully!");
    }

    // Add an event listener to the save button
    document
      .getElementById("save-custom-search-url")
      .addEventListener("click", saveCustomSearchURL);

    // Add this function to handle manual job scraping
    async function manuallyCheckForNewJobs() {
      await sendMessageToBackground({ type: "checkJobs" });
      alert("Job scraping triggered manually!");
    }

    // Add an event listener to the manual scrape button
    document
      .getElementById("manual-scrape-button")
      .addEventListener("click", manuallyCheckForNewJobs);

    // Remove this line
    // initializeSentry();
  } catch (error) {
    console.error("Error initializing settings:", error);
    logAndReportError("Error initializing settings", error);
  }
}

// Use this to initialize the settings page:
Promise.all([waitForBackgroundScript(), initializeSettings()]).catch(
  (error) => {
    console.error("Error during initialization:", error);
  }
);

// Add this to your initialization function or at the end of the file
window.addEventListener("beforeunload", () => {
  if (window.timeUpdateInterval) {
    clearInterval(window.timeUpdateInterval);
  }
});
