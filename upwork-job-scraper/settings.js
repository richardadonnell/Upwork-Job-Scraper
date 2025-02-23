function waitForBackgroundScript() {
  console.log("Waiting for background script...");
  return new Promise((resolve) => {
    const checkBackgroundScript = () => {
      chrome.runtime.sendMessage({ type: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Background script not ready, retrying...");
          setTimeout(checkBackgroundScript, 100);
        } else {
          console.log("Background script is ready");
          resolve();
        }
      });
    };
    checkBackgroundScript();
  });
}

// Add this function near the top of the file, after the waitForBackgroundScript function

function sendMessageToBackground(message, retries = 3) {
  return new Promise((resolve, reject) => {
    const attemptSend = (remainingRetries) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message send error:", chrome.runtime.lastError);
          if (remainingRetries > 0) {
            console.log(
              `Retrying message send, ${remainingRetries} attempts left`
            );
            setTimeout(() => attemptSend(remainingRetries - 1), 1000);
          } else {
            reject(chrome.runtime.lastError);
          }
        } else if (!response) {
          const error = new Error(
            "No response received from background script"
          );
          if (remainingRetries > 0) {
            console.log(
              `Retrying due to no response, ${remainingRetries} attempts left`
            );
            setTimeout(() => attemptSend(remainingRetries - 1), 1000);
          } else {
            reject(error);
          }
        } else {
          resolve(response);
        }
      });
    };

    attemptSend(retries);
  });
}

// Add these functions at the top of your settings.js file

let countdownInterval;

// Add this function to calculate the next valid check time
function calculateNextValidCheckTime(currentSchedule, baseNextCheck) {
  const now = new Date();
  const nextCheck = new Date(baseNextCheck);

  // Get day of week for the next check
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const nextCheckDay = days[nextCheck.getDay()];

  // Convert times to minutes since midnight
  const nextCheckMinutes = nextCheck.getHours() * 60 + nextCheck.getMinutes();
  const [startHour, startMinute] = currentSchedule.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = currentSchedule.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // If the next check falls on a disabled day or outside active hours
  if (
    !currentSchedule.days[nextCheckDay] ||
    nextCheckMinutes < startMinutes ||
    nextCheckMinutes > endMinutes
  ) {
    // Find the next enabled day
    let daysToAdd = 1;
    let nextValidDay = new Date(nextCheck);
    let foundValidDay = false;

    while (!foundValidDay && daysToAdd <= 7) {
      nextValidDay = new Date(
        nextCheck.getTime() + daysToAdd * 24 * 60 * 60 * 1000
      );
      const dayIndex = nextValidDay.getDay();
      const dayKey = days[dayIndex];

      if (currentSchedule.days[dayKey]) {
        foundValidDay = true;
        // Set time to start of active hours
        nextValidDay.setHours(startHour, startMinute, 0, 0);
      } else {
        daysToAdd++;
      }
    }

    if (!foundValidDay) {
      // No valid days found in the next week
      return null;
    }

    return nextValidDay.getTime();
  }

  return nextCheck.getTime();
}

function updateCountdown() {
  chrome.storage.sync.get(["schedule"], (data) => {
    const currentSchedule = data.schedule || {
      days: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].reduce(
        (acc, day) => Object.assign(acc, { [day]: true }),
        {}
      ),
      startTime: "00:00",
      endTime: "23:59",
    };

    chrome.alarms.get("checkJobs", (alarm) => {
      if (alarm) {
        const now = new Date().getTime();
        const nextValidCheck = calculateNextValidCheckTime(
          currentSchedule,
          alarm.scheduledTime
        );

        if (!nextValidCheck) {
          document.getElementById("next-check-countdown").textContent =
            "No valid check times in the next week";
          return;
        }

        const timeLeft = nextValidCheck - now;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          let countdownText = "⏲️ Next check in: ";
          if (days > 0) {
            countdownText += `${days}d `;
          }
          countdownText += `${hours}h ${minutes}m ${seconds}s`;

          if (nextValidCheck > alarm.scheduledTime) {
            countdownText += " (adjusted for schedule)";
          }

          document.getElementById("next-check-countdown").textContent =
            countdownText;
        } else {
          document.getElementById("next-check-countdown").textContent =
            "Check imminent...";
        }
      } else {
        document.getElementById("next-check-countdown").textContent =
          "Countdown not available";
      }
    });
  });
}

function startCountdown() {
  updateCountdown(); // Initial update
  clearInterval(countdownInterval); // Clear any existing interval
  countdownInterval = setInterval(updateCountdown, 1000); // Update every second
}

// Add this near the top of the file, after other function declarations
function trackEvent(eventName, eventParams) {
  console.log(`Event tracked: ${eventName}`, eventParams);
}

// Add this function at the top of your settings.js file
async function initializeSettings() {
  console.log("Initializing settings...");

  // Initialize Sentry
  if (typeof Sentry !== "undefined") {
    Sentry.init({
      dsn: "https://5394268fe023ea7d082781a6ea85f4ce@o4507890797379584.ingest.us.sentry.io/4507891889471488",
      tracesSampleRate: 1.0,
      release: `upwork-job-scraper@${chrome.runtime.getManifest().version}`,
      environment: "production",
    });
  }

  chrome.runtime.sendMessage({ type: "settingsPageOpened" });
  trackEvent("settings_page_opened", {});

  try {
    // Initialize pairs
    await loadPairs();

    // Add new pair button handler
    document.getElementById("add-pair").addEventListener("click", addNewPair);

    // Load saved notification setting when the page opens
    chrome.storage.sync.get("notificationsEnabled", (data) => {
      const notificationToggle = document.getElementById("notification-toggle");
      if (data.notificationsEnabled === undefined) {
        // Default to enabled if not set
        notificationToggle.checked = true;
        chrome.storage.sync.set({ notificationsEnabled: true });
      } else {
        notificationToggle.checked = data.notificationsEnabled;
      }
    });

    // Save notification setting when toggled
    document
      .getElementById("notification-toggle")
      .addEventListener("change", (event) => {
        const isEnabled = event.target.checked;
        chrome.storage.sync.set({ notificationsEnabled: isEnabled }, () => {
          console.log("Notification setting saved:", isEnabled);
          addLogEntry(`Notifications ${isEnabled ? "enabled" : "disabled"}`);
          // Send message to background script to update notification state
          chrome.runtime.sendMessage({
            type: "updateNotificationSettings",
            enabled: isEnabled,
          });
          trackEvent("notification_setting_changed", { enabled: isEnabled });
        });
      });

    // Update the check frequency input event listeners
    document.getElementById("minutes").addEventListener("input", saveFrequency);

    // Add event listeners for schedule days
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    for (const day of days) {
      document
        .getElementById(`day-${day}`)
        .addEventListener("change", saveSchedule);
    }

    // Add event listeners for schedule times
    document
      .getElementById("start-time")
      .addEventListener("change", saveSchedule);
    document
      .getElementById("end-time")
      .addEventListener("change", saveSchedule);

    // Add event listeners for schedule buttons
    document.getElementById("set-weekdays").addEventListener("click", () => {
      days.forEach((day) => {
        document.getElementById(`day-${day}`).checked =
          day !== "sun" && day !== "sat";
      });
      saveSchedule();
      trackEvent("set_weekdays", {});
    });

    document.getElementById("reset-days").addEventListener("click", () => {
      days.forEach((day) => {
        document.getElementById(`day-${day}`).checked = true;
      });
      saveSchedule();
      trackEvent("reset_days", {});
    });

    document
      .getElementById("set-business-hours")
      .addEventListener("click", () => {
        document.getElementById("start-time").value = "08:00";
        document.getElementById("end-time").value = "17:00";
        saveSchedule();
        trackEvent("set_business_hours", {});
      });

    document.getElementById("reset-hours").addEventListener("click", () => {
      document.getElementById("start-time").value = "00:00";
      document.getElementById("end-time").value = "23:59";
      saveSchedule();
      trackEvent("reset_hours", {});
    });

    // Load saved schedule when the page opens
    chrome.storage.sync.get(["schedule"], (data) => {
      const defaultSchedule = {
        days: days.reduce(
          (acc, day) => Object.assign(acc, { [day]: true }),
          {}
        ),
        startTime: "00:00",
        endTime: "23:59",
      };

      const schedule = data.schedule || defaultSchedule;

      // Set the days checkboxes
      for (const day of days) {
        document.getElementById(`day-${day}`).checked = schedule.days[day];
      }

      // Set the time inputs
      document.getElementById("start-time").value = schedule.startTime;
      document.getElementById("end-time").value = schedule.endTime;
    });

    // Load saved check frequency when the page opens
    chrome.storage.sync.get("checkFrequency", (data) => {
      if (data.checkFrequency) {
        const savedFrequency = data.checkFrequency || 5;
        document.getElementById("minutes").value =
          savedFrequency < 5 ? 5 : savedFrequency;
      }
      startCountdown(); // Start the countdown after loading the frequency
    });

    // Load existing scraped jobs
    chrome.storage.local.get("scrapedJobs", (data) => {
      if (data.scrapedJobs) {
        addJobEntries(data.scrapedJobs);
      }
    });

    // Listen for log updates and job updates from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "logUpdate") {
        addLogEntry(message.content);
        sendResponse({ received: true });
        return true; // Keep the message channel open
      } else if (message.type === "jobsUpdate") {
        addJobEntries(message.jobs);
      }
    });

    // Master toggle (Job Scraping)
    const masterToggle = document.getElementById("master-toggle");
    chrome.storage.sync.get("jobScrapingEnabled", (data) => {
      masterToggle.checked = data.jobScrapingEnabled !== false; // Default to true if not set
    });

    masterToggle.addEventListener("change", (event) => {
      const isEnabled = event.target.checked;
      chrome.storage.sync.set({ jobScrapingEnabled: isEnabled }, () => {
        addLogEntry(`Job scraping ${isEnabled ? "enabled" : "disabled"}`);
        chrome.runtime.sendMessage({
          type: "updateJobScraping",
          enabled: isEnabled,
        });
        trackEvent("job_scraping_toggle_changed", { enabled: isEnabled });
      });
    });

    // Clear jobs button
    document
      .getElementById("clear-jobs")
      .addEventListener("click", clearAllJobs);

    // Manual scrape button
    document
      .getElementById("manual-scrape")
      .addEventListener("click", manualScrape);
  } catch (error) {
    console.error("Error initializing settings:", error);
    showAlert(
      "Error initializing settings: " + error.message,
      "alert-container",
      "error"
    );
  }
}

// Function to create a new pair element
function createPairElement(pair) {
  const template = document.getElementById("pair-template");
  const pairElement = template.content
    .cloneNode(true)
    .querySelector(".pair-item");

  pairElement.dataset.pairId = pair.id;

  const nameInput = pairElement.querySelector(".pair-name");
  nameInput.value = pair.name;
  nameInput.addEventListener("change", (e) =>
    updatePairField(pair.id, "name", e.target.value)
  );

  const enabledToggle = pairElement.querySelector(".pair-enabled");
  enabledToggle.checked = pair.enabled;
  enabledToggle.addEventListener("change", () => togglePairEnabled(pair.id));

  const searchUrlInput = pairElement.querySelector(".search-url");
  searchUrlInput.value = pair.searchUrl || "";
  searchUrlInput.addEventListener("input", (e) => {
    // Immediate update on any change
    updatePairField(pair.id, "searchUrl", e.target.value.trim());
  });

  const webhookUrlInput = pairElement.querySelector(".webhook-url");
  webhookUrlInput.value = pair.webhookUrl || "";
  webhookUrlInput.addEventListener("input", (e) => {
    // Immediate update on any change
    updatePairField(pair.id, "webhookUrl", e.target.value.trim());
  });

  const openUrlButton = pairElement.querySelector(".open-search-url");
  openUrlButton.addEventListener("click", () => {
    if (searchUrlInput.value.trim()) {
      chrome.tabs.create({ url: searchUrlInput.value.trim() });
    } else {
      alert("Please enter a valid search URL first.");
    }
  });

  const testWebhookButton = pairElement.querySelector(".test-webhook");
  testWebhookButton.addEventListener("click", () => testPairWebhook(pair.id));

  const removeButton = pairElement.querySelector(".remove-pair");
  removeButton.addEventListener("click", () => removePairElement(pair.id));

  return pairElement;
}

// Function to update a pair field
async function updatePairField(pairId, field, value) {
  try {
    console.log(`Updating ${field} for pair ${pairId} to:`, value);
    const pairs = await getAllPairs();
    const pair = pairs.find((p) => p.id === pairId);
    if (!pair) {
      throw new Error("Pair not found");
    }

    // Create a copy of the pair for updating
    const updatedPair = { ...pair };
    updatedPair[field] = value;

    // Special handling for URL fields
    if (field === "webhookUrl" || field === "searchUrl") {
      const trimmedValue = value.trim();
      updatedPair[field] = trimmedValue;
    }

    // Validate and save the updated pair
    try {
      validatePair(updatedPair);
      await updatePair(pairId, updatedPair);
      console.log(`Successfully updated ${field} for pair ${pairId}`);

      // Only show success alert for major changes
      if (field === "name" || field === "enabled") {
        showAlert(
          "Pair updated successfully",
          "pairs-alert-container",
          "success"
        );
      }
    } catch (validationError) {
      console.error(`Validation error for ${field}:`, validationError);
      showAlert(validationError.message, "pairs-alert-container", "error");

      // Revert the UI to the last valid state
      const pairElement = document.querySelector(`[data-pair-id="${pairId}"]`);
      if (pairElement) {
        const input = pairElement.querySelector(`.${field.toLowerCase()}`);
        if (input) input.value = pair[field] || "";
      }
    }
  } catch (error) {
    console.error(`Error updating ${field} for pair ${pairId}:`, error);
    showAlert(error.message, "pairs-alert-container", "error");
  }
}

// Function to toggle pair enabled state
async function togglePairEnabled(pairId) {
  try {
    await togglePair(pairId);
    showAlert("Pair status updated", "pairs-alert-container", "success");
  } catch (error) {
    console.error("Error toggling pair:", error);
    showAlert(error.message, "pairs-alert-container", "error");
  }
}

// Function to test a pair's webhook
async function testPairWebhook(pairId) {
  try {
    const pairs = await getAllPairs();
    const pair = pairs.find((p) => p.id === pairId);
    if (!pair) throw new Error("Pair not found");

    const testPayload = {
      title: "Test Job",
      url: "https://www.upwork.com/jobs/test",
      description: "This is a test job posting.",
      source: {
        name: pair.name,
        searchUrl: pair.searchUrl,
      },
    };

    await sendMessageToBackground({
      type: "testWebhook",
      webhookUrl: pair.webhookUrl,
      testPayload,
    });

    showAlert("Webhook test successful!", "pairs-alert-container", "success");
  } catch (error) {
    console.error("Error testing webhook:", error);
    showAlert(
      `Webhook test failed: ${error.message}`,
      "pairs-alert-container",
      "error"
    );
  }
}

// Function to remove a pair
async function removePairElement(pairId) {
  if (!confirm("Are you sure you want to remove this pair?")) return;

  try {
    await removePair(pairId);
    const element = document.querySelector(`[data-pair-id="${pairId}"]`);
    if (element) element.remove();
    showAlert("Pair removed successfully", "pairs-alert-container", "success");
  } catch (error) {
    console.error("Error removing pair:", error);
    showAlert(error.message, "pairs-alert-container", "error");
  }
}

// Function to load all pairs
async function loadPairs() {
  try {
    const pairs = await getAllPairs();
    const pairsContainer = document.getElementById("pairs-container");
    pairsContainer.innerHTML = ""; // Clear existing pairs

    for (const pair of pairs) {
      const pairElement = createPairElement(pair);
      pairsContainer.appendChild(pairElement);
    }
  } catch (error) {
    console.error("Error loading pairs:", error);
    showAlert(
      `Error loading pairs: ${error.message}`,
      "pairs-alert-container",
      "error"
    );
  }
}

// Function to add a new pair
async function addNewPair() {
  try {
    console.log("Adding new pair...");
    const pair = createDefaultPair();
    console.log("Created default pair:", pair);
    await addPair(pair);
    console.log("Pair added to storage");
    const pairElement = createPairElement(pair);
    console.log("Created pair element");
    document.getElementById("pairs-container").appendChild(pairElement);
    console.log("Pair element added to DOM");
    showAlert("success", "New pair added successfully!");
  } catch (error) {
    console.error("Error adding new pair:", error);
    showAlert("error", error.message);
  }
}

// Initialize settings when the page loads
document.addEventListener("DOMContentLoaded", initializeSettings);

// Add this to your initialization function or at the end of the file
window.addEventListener("beforeunload", () => {
  if (window.timeUpdateInterval) {
    clearInterval(window.timeUpdateInterval);
  }
});

function showAlert(message, timeout = "15000") {
  const alertContainer = document.getElementById("alert-container");
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  const alertMessage = document.createElement("p");
  alertMessage.textContent = message;
  alertElement.appendChild(alertMessage);

  const closeButton = document.createElement("button");
  closeButton.classList.add("close-btn");
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", () => {
    clearTimeout(alertTimeout);
    alertElement.remove();
  });
  alertElement.appendChild(closeButton);

  const countdownElement = document.createElement("span");
  countdownElement.classList.add("countdown");
  alertElement.appendChild(countdownElement);

  const parsedTimeout = Number.parseInt(timeout, 10);
  let remainingTime = Number.isNaN(parsedTimeout) ? 15000 : parsedTimeout;

  // Update the countdown immediately
  const seconds = Math.ceil(remainingTime / 1000);
  countdownElement.textContent = `Closing in ${seconds}s`;

  const countdownInterval = setInterval(() => {
    remainingTime -= 1000;
    const seconds = Math.ceil(remainingTime / 1000);
    countdownElement.textContent = `Closing in ${seconds}s`;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      alertElement.remove();
    }
  }, 1000);

  alertContainer.appendChild(alertElement);

  const alertTimeout = setTimeout(() => {
    alertElement.remove();
  }, remainingTime);
}

// Add this near the top of settings.js, before it's used
function addToActivityLog(message) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp}: ${message}`;
  console.log(logEntry); // Log to console for debugging

  // Add to the log container if it exists
  const logContainer = document.getElementById("log-container");
  if (logContainer) {
    const logElement = document.createElement("div");
    logElement.textContent = logEntry;
    logContainer.prepend(logElement);

    // Keep only the last 100 entries
    while (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }

  // Store in chrome.storage
  chrome.storage.local.get("activityLog", (data) => {
    const log = data.activityLog || [];
    log.unshift(logEntry);
    // Keep only the last 100 entries
    if (log.length > 100) log.pop();
    chrome.storage.local.set({ activityLog: log });
  });

  // Send message to update other open instances of the settings page
  chrome.runtime.sendMessage(
    { type: "logUpdate", content: logEntry },
    (response) => {
      if (chrome.runtime.lastError) {
        // This will happen if no other instances are open, which is fine
        console.log("No other settings pages available for log update");
      }
    }
  );
}

// Add this before initializeSettings
function saveFrequency() {
  const minutes = document.getElementById("minutes").value;
  const frequency = Math.max(5, parseInt(minutes) || 5);

  chrome.storage.sync.set({ checkFrequency: frequency }, () => {
    chrome.runtime.sendMessage({ type: "updateCheckFrequency", frequency });
    addToActivityLog(`Check frequency updated to ${frequency} minute(s)`);
    trackEvent("frequency_updated", { frequency });
  });
}

// Add this before initializeSettings
function saveSchedule() {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const schedule = {
    days: days.reduce((acc, day) => {
      acc[day] = document.getElementById(`day-${day}`).checked;
      return acc;
    }, {}),
    startTime: document.getElementById("start-time").value,
    endTime: document.getElementById("end-time").value,
  };

  chrome.storage.sync.set({ schedule }, () => {
    chrome.runtime.sendMessage({ type: "updateSchedule", schedule });
    addToActivityLog("Schedule updated");
    trackEvent("schedule_updated", schedule);
    startCountdown(); // Restart countdown with new schedule
  });
}

// Store intervals for cleanup
let timeUpdateIntervals = [];

function clearTimeUpdateIntervals() {
  timeUpdateIntervals.forEach((interval) => clearInterval(interval));
  timeUpdateIntervals = [];
}

function addJobEntries(jobs) {
  // Clear existing intervals before updating the job list
  clearTimeUpdateIntervals();

  const container = document.getElementById("jobs-container");
  container.innerHTML = ""; // Clear existing jobs

  // Sort jobs by scraped time, newest first
  jobs.sort((a, b) => b.scrapedAt - a.scrapedAt);

  for (const job of jobs) {
    const jobElement = document.createElement("div");
    jobElement.className = "job-item";

    const header = document.createElement("div");
    header.className = "job-header";

    const title = document.createElement("div");
    title.className = "job-title";
    title.textContent = job.title;
    if (job.source?.name) {
      const sourceSpan = document.createElement("span");
      sourceSpan.textContent = ` (${job.source.name})`;
      title.appendChild(sourceSpan);
    }
    title.addEventListener("click", () => toggleJobDetails(jobElement));

    const rightSection = document.createElement("div");
    rightSection.className = "job-header-right";
    rightSection.style.display = "flex";
    rightSection.style.alignItems = "center";
    rightSection.style.gap = "1em";

    const timeSpan = document.createElement("span");
    timeSpan.className = "job-time";
    timeSpan.style.color = "#8d8c8c";
    timeSpan.style.fontSize = "0.9em";
    timeSpan.style.whiteSpace = "nowrap";
    timeSpan.textContent = getRelativeTime(job.scrapedAt);

    // Update the time every second
    const interval = setInterval(() => {
      timeSpan.textContent = getRelativeTime(job.scrapedAt);
    }, 1000);
    timeUpdateIntervals.push(interval);

    const openButton = document.createElement("button");
    openButton.className = "open-job-button button-secondary";
    openButton.textContent = "Open Job";
    openButton.addEventListener("click", () => {
      chrome.tabs.create({ url: job.url });
    });

    rightSection.appendChild(timeSpan);
    rightSection.appendChild(openButton);

    header.appendChild(title);
    header.appendChild(rightSection);
    jobElement.appendChild(header);

    // Create details section (hidden by default)
    const details = document.createElement("div");
    details.className = "job-details";
    details.innerHTML = `
      <p><strong>Type:</strong> ${job.jobType} ${
      job.hourlyRange || job.budget || ""
    }</p>
      <p><strong>Skills:</strong> ${job.skills.join(", ")}</p>
      <p><strong>Posted:</strong> ${job.jobPostingTime}</p>
      <p><strong>Client:</strong> ${job.clientCountry} (Rating: ${
      job.clientRating
    })</p>
      <p><strong>Description:</strong> ${job.description}</p>
    `;
    jobElement.appendChild(details);

    container.appendChild(jobElement);
  }
}

function toggleJobDetails(jobElement) {
  const details = jobElement.querySelector(".job-details");
  if (details) {
    details.style.display = details.style.display === "none" ? "block" : "none";
  }
}

// Add this function before initializeSettings
async function manualScrape() {
  try {
    const response = await sendMessageToBackground({ type: "manualScrape" });
    if (response.success) {
      showAlert(
        "Manual scrape started successfully",
        "alert-container",
        "success"
      );
      addToActivityLog("Manual scrape initiated");
    } else {
      showAlert(
        `Manual scrape failed: ${response.error}`,
        "alert-container",
        "error"
      );
      addToActivityLog(`Manual scrape failed: ${response.error}`);
    }
  } catch (error) {
    console.error("Error during manual scrape:", error);
    showAlert(
      `Manual scrape failed: ${error.message}`,
      "alert-container",
      "error"
    );
    addToActivityLog(`Manual scrape failed: ${error.message}`);
  }
}

// Add cleanup on page unload
window.addEventListener("beforeunload", clearTimeUpdateIntervals);

// Add cleanup when the jobs container is cleared
function clearAllJobs() {
  if (!confirm("Are you sure you want to clear all scraped jobs?")) {
    return;
  }

  clearTimeUpdateIntervals();
  chrome.storage.local.remove(["scrapedJobs"], () => {
    document.getElementById("jobs-container").innerHTML = "";
    addToActivityLog("All scraped jobs cleared");
    trackEvent("jobs_cleared", {});
    showAlert("All jobs cleared successfully", "alert-container", "success");
  });
}

function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  }
}
