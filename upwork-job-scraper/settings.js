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
        (acc, day) => ({ ...acc, [day]: true }),
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
      release: "upwork-job-scraper@" + chrome.runtime.getManifest().version,
      environment: "production",
    });
  }

  chrome.runtime.sendMessage({ type: "settingsPageOpened" });
  trackEvent("settings_page_opened", {});

  try {
    // Update the webhook URL input event listener
    document.getElementById("webhook-url").addEventListener("input", () => {
      const webhookUrl = document.getElementById("webhook-url").value;
      const webhookEnabled = document.getElementById("webhook-toggle").checked;

      if (webhookUrl === "") {
        // If the URL is empty, clear the saved webhook URL
        chrome.storage.sync.remove("webhookUrl", () => {
          console.log("Webhook URL cleared");
          addLogEntry("Webhook URL cleared");
          chrome.runtime.sendMessage({ type: "updateWebhookSettings" });
          trackEvent("webhook_url_cleared", {});
        });
      } else {
        // Otherwise, save the new webhook URL
        chrome.storage.sync.set(
          { webhookUrl: webhookUrl, webhookEnabled: webhookEnabled },
          () => {
            console.log("Webhook settings saved");
            addLogEntry("Webhook settings saved");
            chrome.runtime.sendMessage({ type: "updateWebhookSettings" });
            trackEvent("webhook_settings_saved", { enabled: webhookEnabled });
          }
        );
      }
    });

    document.getElementById("test-webhook").addEventListener("click", () => {
      const webhookUrl = document.getElementById("webhook-url").value;
      const webhookEnabled = document.getElementById("webhook-toggle").checked;
      if (!webhookEnabled) {
        showAlert(
          "Please enable the webhook before testing.",
          "webhook-alert-container"
        );
        return;
      }
      if (!webhookUrl) {
        showAlert(
          "Please enter a webhook URL before testing.",
          "webhook-alert-container"
        );
        return;
      }

      const testPayload = {
        title: "Test Job",
        url: "https://www.upwork.com/test-job",
        jobType: "Fixed price",
        skillLevel: "Intermediate",
        budget: "$500",
        hourlyRange: "N/A",
        estimatedTime: "N/A",
        description:
          "This is a test job posting to verify webhook functionality.",
        skills: ["Test Skill 1", "Test Skill 2", "Test Skill 3"],
        paymentVerified: true,
        clientRating: 4.9,
        clientSpent: "$10k+",
        clientCountry: "Test Country",
        attachments: [
          {
            name: "Test Document",
            url: "https://www.upwork.com/test-document",
          },
        ],
        questions: [
          "What is your experience with this type of project?",
          "How soon can you start?",
        ],
        scrapedAt: Date.now(),
        scrapedAtHuman: new Date().toLocaleString(),
      };

      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([testPayload]),
      })
        .then((response) => response.text())
        .then((result) => {
          console.log("Test webhook response:", result);
          addLogEntry("Test webhook sent successfully");
          showAlert(
            "Test webhook sent successfully. Check your webhook endpoint for the received data.",
            "webhook-alert-container"
          );
          trackEvent("test_webhook_sent", { success: true });
        })
        .catch((error) => {
          console.error("Error:", error);
          addLogEntry("Error sending test webhook");
          showAlert(
            "Error sending test webhook. Check the console for details.",
            "webhook-alert-container"
          );
          trackEvent("test_webhook_sent", {
            success: false,
            error: error.message,
          });
        });
    });

    // Load saved webhook settings when the page opens
    chrome.storage.sync.get(["webhookUrl", "webhookEnabled"], (data) => {
      if (data.webhookUrl) {
        document.getElementById("webhook-url").value = data.webhookUrl;
      }
      const webhookToggle = document.getElementById("webhook-toggle");
      if (data.webhookEnabled === undefined) {
        // Default to enabled if not set
        webhookToggle.checked = true;
        chrome.storage.sync.set({ webhookEnabled: true });
      } else {
        webhookToggle.checked = data.webhookEnabled;
      }
      updateWebhookInputState();
    });

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

    // Save webhook setting when toggled
    document
      .getElementById("webhook-toggle")
      .addEventListener("change", (event) => {
        const webhookEnabled = event.target.checked;
        chrome.storage.sync.set({ webhookEnabled: webhookEnabled }, () => {
          console.log("Webhook " + (webhookEnabled ? "enabled" : "disabled"));
          addLogEntry(`Webhook ${webhookEnabled ? "enabled" : "disabled"}`);
          updateWebhookInputState();
          chrome.runtime.sendMessage({ type: "updateWebhookSettings" });
          trackEvent("webhook_setting_changed", { enabled: webhookEnabled });
        });
      });

    // Update the check frequency input event listeners
    document.getElementById("minutes").addEventListener("input", saveFrequency);

    // Add event listeners for days and time range
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    days.forEach((day) => {
      document
        .getElementById(`day-${day}`)
        .addEventListener("change", saveSchedule);
    });

    document
      .getElementById("start-time")
      .addEventListener("change", saveSchedule);
    document
      .getElementById("end-time")
      .addEventListener("change", saveSchedule);

    function saveSchedule() {
      const schedule = {
        days: days.reduce((acc, day) => {
          acc[day] = document.getElementById(`day-${day}`).checked;
          return acc;
        }, {}),
        startTime: document.getElementById("start-time").value,
        endTime: document.getElementById("end-time").value,
      };

      chrome.storage.sync.set({ schedule }, () => {
        console.log("Schedule saved:", schedule);
        addLogEntry(`Schedule updated: ${formatSchedule(schedule)}`);
        chrome.runtime.sendMessage({
          type: "updateSchedule",
          schedule: schedule,
        });
        trackEvent("schedule_changed", schedule);
      });
    }

    function formatSchedule(schedule) {
      const activeDays = Object.entries(schedule.days)
        .filter(([_, enabled]) => enabled)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
        .join(", ");
      return `Active on: ${activeDays} between ${schedule.startTime} and ${schedule.endTime}`;
    }

    function saveFrequency() {
      const minutes = parseInt(document.getElementById("minutes").value) || 5;

      if (minutes < 5) {
        showAlert(
          "Please set a frequency of at least 5 minutes.",
          "frequency-alert-container"
        );
        document.getElementById("minutes").value = 5;
        return;
      }

      chrome.storage.sync.set({ checkFrequency: minutes }, () => {
        console.log("Check frequency saved");
        addLogEntry(`Check frequency saved: ${minutes}m`);
        chrome.runtime.sendMessage({
          type: "updateCheckFrequency",
          frequency: minutes,
        });
        startCountdown(); // Restart the countdown with the new frequency
        trackEvent("check_frequency_changed", { minutes });
      });
    }

    // Load saved schedule when the page opens
    chrome.storage.sync.get(["schedule"], (data) => {
      const defaultSchedule = {
        days: days.reduce((acc, day) => ({ ...acc, [day]: true }), {}),
        startTime: "00:00",
        endTime: "23:59",
      };

      const schedule = data.schedule || defaultSchedule;

      // Set the days checkboxes
      days.forEach((day) => {
        document.getElementById(`day-${day}`).checked = schedule.days[day];
      });

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

    // Add function to check if current time is within schedule
    function isWithinSchedule(schedule) {
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
      const [startHour, startMinute] = schedule.startTime
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    // Add function to get randomized check interval
    function getRandomizedCheckInterval(baseMinutes) {
      // Convert minutes to milliseconds and add random seconds (±15 max)
      const baseMs = baseMinutes * 60 * 1000;
      const randomMs = Math.floor(Math.random() * 31 - 15) * 1000; // Random between -15 and +15 seconds
      return (baseMs + randomMs) / 60000; // Convert back to minutes
    }

    // Function to add log entries
    function addLogEntry(message) {
      const logContainer = document.getElementById("log-container");

      // Remove any existing timestamp from the message if it exists
      const cleanMessage = message.replace(
        /^\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M:\s/,
        ""
      );

      // Only add timestamp if message doesn't already have one
      const logEntry = message.includes(":")
        ? message
        : `${new Date().toLocaleString()}: ${cleanMessage}`;

      // Check if this exact message already exists at the top
      const existingTopEntry = logContainer.firstChild?.textContent;
      if (existingTopEntry !== logEntry) {
        const logElement = document.createElement("div");
        logElement.textContent = logEntry;
        logContainer.prepend(logElement);

        // Remove oldest log entry if there are more than 100
        while (logContainer.children.length > 100) {
          logContainer.removeChild(logContainer.lastChild);
        }
      }
    }

    // Load existing log entries
    chrome.storage.local.get("activityLog", (data) => {
      if (data.activityLog) {
        const logContainer = document.getElementById("log-container");
        logContainer.innerHTML = ""; // Clear existing entries

        // Add entries in reverse order (newest first)
        data.activityLog.forEach((entry) => {
          const logElement = document.createElement("div");
          logElement.textContent = entry;
          logContainer.appendChild(logElement);
        });
      }
    });

    // Function to add job entries
    function addJobEntries(jobs) {
      const jobsContainer = document.getElementById("jobs-container");
      jobsContainer.innerHTML = ""; // Clear existing jobs

      if (!Array.isArray(jobs) || jobs.length === 0) {
        jobsContainer.innerHTML = "<p>No jobs found.</p>";
        return;
      }

      jobs.forEach((job) => {
        if (!job) return; // Skip if job is undefined

        const jobItem = document.createElement("div");
        jobItem.className = "job-item";
        jobItem.dataset.jobId = job.url || "";

        const jobHeader = document.createElement("div");
        jobHeader.className = "job-header";

        const jobTitle = document.createElement("div");
        jobTitle.className = "job-title";

        const timeSpan = document.createElement("span");
        timeSpan.className = "job-time";
        timeSpan.dataset.timestamp = job.scrapedAt || Date.now();
        updateTimeDifference(job.scrapedAt || Date.now(), timeSpan);

        jobTitle.textContent = job.title || "Untitled Job";
        jobTitle.appendChild(document.createElement("br"));
        jobTitle.appendChild(timeSpan);

        jobTitle.onclick = () => toggleJobDetails(job.url || "");

        const openButton = document.createElement("button");
        openButton.className = "open-job-button button-secondary";
        openButton.textContent = "Open";
        openButton.onclick = (e) => {
          e.stopPropagation();
          if (job.url) window.open(job.url, "_blank");
        };

        jobHeader.appendChild(jobTitle);
        jobHeader.appendChild(openButton);

        const jobDetails = document.createElement("div");
        jobDetails.className = "job-details";
        jobDetails.id = `job-details-${job.url || ""}`;
        jobDetails.innerHTML = `
          <p><strong>URL:</strong> ${
            job.url
              ? `<a href="${job.url}" target="_blank">${job.url}</a>`
              : "N/A"
          }</p>
          <p><strong>Job Type:</strong> ${job.jobType || "N/A"}</p>
          <p><strong>Skill Level:</strong> ${job.skillLevel || "N/A"}</p>
          <p><strong>${
            job.jobType === "Fixed price" ? "Budget" : "Hourly Range"
          }:</strong> ${
          job.jobType === "Fixed price"
            ? job.budget || "N/A"
            : job.hourlyRange || "N/A"
        }</p>
          ${
            job.jobType === "Hourly"
              ? `<p><strong>Estimated Time:</strong> ${
                  job.estimatedTime || "N/A"
                }</p>`
              : ""
          }
          <p><strong>Description:</strong> ${job.description || "N/A"}</p>
          <p><strong>Skills:</strong> ${
            Array.isArray(job.skills) ? job.skills.join(", ") : "N/A"
          }</p>
          <p><strong>Payment Verified:</strong> ${
            job.paymentVerified ? "Yes" : "No"
          }</p>
          <p><strong>Client Rating:</strong> ${job.clientRating || "N/A"}</p>
          <p><strong>Client Spent:</strong> ${job.clientSpent || "N/A"}</p>
          <p><strong>Client Country:</strong> ${job.clientCountry || "N/A"}</p>
          ${
            Array.isArray(job.attachments) && job.attachments.length > 0
              ? `<p><strong>Attachments:</strong> ${job.attachments
                  .map(
                    (a) => `<a href="${a.url}" target="_blank">${a.name}</a>`
                  )
                  .join(", ")}</p>`
              : ""
          }
          ${
            Array.isArray(job.questions) && job.questions.length > 0
              ? `<p><strong>Questions:</strong><ul>${job.questions
                  .map((q) => `<li>${q}</li>`)
                  .join("")}</ul></p>`
              : ""
          }
          <p><strong>Scraped At:</strong> ${job.scrapedAtHuman || "N/A"}</p>
        `;

        jobItem.appendChild(jobHeader);
        jobItem.appendChild(jobDetails);
        jobsContainer.appendChild(jobItem);
      });

      // Start updating time differences
      if (!window.timeUpdateInterval) {
        window.timeUpdateInterval = setInterval(updateAllTimeDifferences, 1000);
      }
    }

    function toggleJobDetails(jobId) {
      const details = document.getElementById(`job-details-${jobId}`);
      if (details.style.display === "block") {
        details.style.display = "none";
      } else {
        details.style.display = "block";
      }
    }

    // Load existing scraped jobs
    chrome.storage.local.get("scrapedJobs", (data) => {
      if (data.scrapedJobs) {
        addJobEntries(data.scrapedJobs);
      }
    });

    // Listen for log updates, job updates, and login warnings from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "logUpdate") {
        // Prevent duplicate messages by checking if the exact same message exists
        const logContainer = document.getElementById("log-container");
        const existingTopEntry = logContainer.firstChild?.textContent;
        if (existingTopEntry !== message.content) {
          addLogEntry(message.content);
        }
      } else if (message.type === "jobsUpdate") {
        addJobEntries(message.jobs);
      } else if (message.type === "loginWarning") {
        showLoginWarning(message.message);
      }
    });

    function showLoginWarning(message) {
      const warningElement = document.createElement("div");
      warningElement.className = "alert alert-warning";
      warningElement.innerHTML = `
        <strong>Warning:</strong> ${message} Please check your Upwork login status and try again.
        If the issue persists, you may need to manually log in to Upwork and then restart the extension.
      `;

      const settingsContainer = document.querySelector(".settings-container");
      settingsContainer.insertBefore(
        warningElement,
        settingsContainer.firstChild
      );
    }

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

      element.textContent = `(${timeString})`;
    }

    function updateAllTimeDifferences() {
      const timeElements = document.querySelectorAll(".job-time");
      timeElements.forEach((element) => {
        const timestamp = parseInt(element.dataset.timestamp);
        updateTimeDifference(timestamp, element);
      });
    }

    // Function to update webhook input state
    function updateWebhookInputState() {
      const webhookUrl = document.getElementById("webhook-url");
      const testWebhookButton = document.getElementById("test-webhook");
      const isEnabled = document.getElementById("webhook-toggle").checked;

      webhookUrl.disabled = !isEnabled;
      testWebhookButton.disabled = !isEnabled;
    }

    // Add this new function to create and manage the error message element
    function showCustomUrlError(message) {
      let errorElement = document.getElementById("custom-url-error");
      if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.id = "custom-url-error";
        errorElement.style.color = "red";
        errorElement.style.marginTop = "5px";
        document
          .getElementById("custom-search-url")
          .insertAdjacentElement("afterend", errorElement);
      }
      errorElement.textContent = message;
    }

    // Update the custom search URL input event listener
    document
      .getElementById("custom-search-url")
      .addEventListener("input", () => {
        const customSearchUrl =
          document.getElementById("custom-search-url").value;

        if (customSearchUrl === "") {
          // If the URL is empty, clear the saved custom search URL
          chrome.storage.sync.remove(
            ["customSearchUrl", "selectedFeedSource"],
            () => {
              console.log("Custom search URL cleared");
              addLogEntry("Custom search URL cleared");
              chrome.runtime.sendMessage({ type: "updateFeedSources" });
              trackEvent("custom_search_url_cleared", {});
            }
          );
        } else if (
          !customSearchUrl.startsWith("https://www.upwork.com/nx/search/jobs/?")
        ) {
          showCustomUrlError(
            "Custom Search URL must start with https://www.upwork.com/nx/search/jobs/?"
          );
        } else {
          // Clear any existing error message
          showCustomUrlError("");

          // Save the new custom search URL
          chrome.storage.sync.set(
            {
              selectedFeedSource: "custom-search",
              customSearchUrl: customSearchUrl,
            },
            () => {
              console.log("Feed sources saved");
              addLogEntry(`Feed source saved: custom-search`);
              chrome.runtime.sendMessage({ type: "updateFeedSources" });
              trackEvent("feed_sources_changed", {
                selectedFeedSource: "custom-search",
                customSearchUrl,
              });
            }
          );
        }
      });

    // Load saved feed source settings when the page opens
    chrome.storage.sync.get(["customSearchUrl"], (data) => {
      const customSearchUrl = data.customSearchUrl || "";
      const customSearchUrlInput = document.getElementById("custom-search-url");
      customSearchUrlInput.value = customSearchUrl;
    });

    document.getElementById("manual-scrape").addEventListener("click", () => {
      sendMessageToBackground({ type: "manualScrape" })
        .then((response) => {
          if (response && response.success) {
            addLogEntry("Manual scrape initiated");
            trackEvent("manual_scrape_initiated", {});
          } else {
            addLogEntry("Failed to initiate manual scrape");
            trackEvent("manual_scrape_failed", {});
          }
        })
        .catch((error) => {
          console.error("Error sending message:", error);
          addLogEntry("Error initiating manual scrape");
          trackEvent("manual_scrape_error", { error: error.message });
        });
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

    // Webhook toggle
    const webhookToggle = document.getElementById("webhook-toggle");
    chrome.storage.sync.get("webhookEnabled", (data) => {
      webhookToggle.checked = data.webhookEnabled !== false; // Default to true if not set
    });

    webhookToggle.addEventListener("change", (event) => {
      const isEnabled = event.target.checked;
      chrome.storage.sync.set({ webhookEnabled: isEnabled }, () => {
        addLogEntry(`Webhook ${isEnabled ? "enabled" : "disabled"}`);
        chrome.runtime.sendMessage({ type: "updateWebhookSettings" });
        trackEvent("webhook_toggle_changed", { enabled: isEnabled });
      });
    });

    // Notification toggle
    const notificationToggle = document.getElementById("notification-toggle");
    chrome.storage.sync.get("notificationsEnabled", (data) => {
      notificationToggle.checked = data.notificationsEnabled !== false; // Default to true if not set
    });

    notificationToggle.addEventListener("change", (event) => {
      const isEnabled = event.target.checked;
      chrome.storage.sync.set({ notificationsEnabled: isEnabled }, () => {
        addLogEntry(`Push notifications ${isEnabled ? "enabled" : "disabled"}`);
        trackEvent("notification_toggle_changed", { enabled: isEnabled });
      });
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
    document.getElementById("clear-jobs").addEventListener("click", (event) => {
      const button = event.target;
      if (button.classList.contains("confirm")) {
        clearAllJobs();
        trackEvent("clear_all_jobs", {});
        button.classList.remove("confirm");
        button.textContent = "Clear All Jobs";
      } else {
        button.classList.add("confirm");
        button.textContent = "Click to Confirm";
      }
    });

    // Modify the existing chrome.runtime.onMessage listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "logUpdate") {
        addLogEntry(message.content);
      } else if (message.type === "jobsUpdate") {
        addJobEntries(message.jobs);
      } else if (message.type === "jobsCleared") {
        // Update the UI to reflect that jobs have been cleared
        addJobEntries([]);
      }
    });

    // Add this new event listener for the "Open Custom URL" button
    document.getElementById("open-custom-url").addEventListener("click", () => {
      const customSearchUrl =
        document.getElementById("custom-search-url").value;
      if (customSearchUrl) {
        window.open(customSearchUrl, "_blank");
        trackEvent("open_custom_url", { url: customSearchUrl });
      } else {
        showAlert(
          "Please enter a custom search URL first.",
          "feed-sources-alert-container"
        );
      }
    });

    // Add this code to handle the accordion functionality
    document
      .querySelector(".setup-instructions .accordion-header")
      .addEventListener("click", () => {
        const content = document.querySelector(
          ".setup-instructions .accordion-content"
        );
        content.style.display =
          content.style.display === "block" ? "none" : "block";
      });

    // Check if the user has previously dismissed the setup instructions
    chrome.storage.sync.get("setupInstructionsDismissed", (data) => {
      if (!data.setupInstructionsDismissed) {
        document.getElementById("setup-instructions").classList.add("show");
      }
    });

    // Add this to where you handle the webhook toggle and URL changes
    document
      .getElementById("webhook-toggle")
      .addEventListener("change", (e) => {
        const enabled = e.target.checked;
        console.log("Saving webhook enabled:", enabled);
        chrome.storage.sync.set({ webhookEnabled: enabled }, () => {
          console.log("Webhook enabled saved:", enabled);
          addToActivityLog(`Webhook ${enabled ? "enabled" : "disabled"}`);
        });
      });

    document.getElementById("webhook-url").addEventListener("change", (e) => {
      const url = e.target.value.trim();
      console.log("Saving webhook URL:", url);
      chrome.storage.sync.set({ webhookUrl: url }, () => {
        console.log("Webhook URL saved:", url);
        addToActivityLog(`Webhook URL updated: ${url}`);
      });
    });

    // Add this function to initialize webhook settings
    function loadWebhookSettings() {
      chrome.storage.sync.get(["webhookUrl", "webhookEnabled"], (settings) => {
        console.log("Loading webhook settings:", settings);
        const webhookToggle = document.getElementById("webhook-toggle");
        const webhookUrl = document.getElementById("webhook-url");

        if (webhookToggle) {
          webhookToggle.checked = settings.webhookEnabled !== false;
        }
        if (webhookUrl && settings.webhookUrl) {
          webhookUrl.value = settings.webhookUrl;
        }
      });
    }

    // Call this when the settings page loads
    document.addEventListener("DOMContentLoaded", () => {
      loadWebhookSettings();
      // ... other initialization code
    });

    // Add this inside the initializeSettings function
    document
      .getElementById("notification-toggle")
      .addEventListener("change", (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ notificationsEnabled: enabled }, () => {
          console.log("Notifications enabled:", enabled);
          addToActivityLog(
            `Push notifications ${enabled ? "enabled" : "disabled"}`
          );
        });
      });

    // Add event listener for copy log and open GitHub issue button
    document
      .getElementById("copy-log-github")
      .addEventListener("click", async () => {
        const logContainer = document.getElementById("log-container");
        const logText = logContainer.innerText;
        const formattedLog = `\`\`\`\n${logText}\n\`\`\``;

        try {
          await navigator.clipboard.writeText(formattedLog);
          showAlert(
            "Activity log copied to clipboard with markdown formatting!",
            "alert-container"
          );
          window.open(
            "https://github.com/richardadonnell/Upwork-Job-Scraper/issues/new",
            "_blank"
          );
        } catch (err) {
          console.error("Failed to copy text: ", err);
          showAlert(
            "Failed to copy activity log. Please try again.",
            "alert-container"
          );
        }
      });
  } catch (error) {
    console.error("Error initializing settings:", error);
    window.logAndReportError("Error initializing settings", error);
  }
}

// Use this to initialize the settings page:
waitForBackgroundScript()
  .then(() => {
    console.log("Starting initialization...");
    initializeSettings();
  })
  .catch((error) => {
    console.error("Error during initialization:", error);
  });

// Add this to your initialization function or at the end of the file
window.addEventListener("beforeunload", () => {
  if (window.timeUpdateInterval) {
    clearInterval(window.timeUpdateInterval);
  }
});

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

// Add this inside the initializeSettings function
sendMessageToBackground({ type: "settingsPageOpened" })
  .then(() => {
    console.log("Notified background script that settings page is open");
  })
  .catch((error) => {
    console.error("Error sending message to background script:", error);
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

  const parsedTimeout = parseInt(timeout, 10);
  let remainingTime = isNaN(parsedTimeout) ? 15000 : parsedTimeout;

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
