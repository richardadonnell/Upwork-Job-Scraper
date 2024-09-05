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

function updateCountdown() {
  chrome.alarms.get("checkJobs", (alarm) => {
    if (alarm) {
      const now = new Date().getTime();
      const nextAlarm = alarm.scheduledTime;
      const timeLeft = nextAlarm - now;

      if (timeLeft > 0) {
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById(
          "next-check-countdown"
        ).textContent = `⏲️ Next check in: ${hours}h ${minutes}m ${seconds}s`;
      } else {
        document.getElementById("next-check-countdown").textContent =
          "Check imminent...";
      }
    } else {
      document.getElementById("next-check-countdown").textContent =
        "Countdown not available";
    }
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
function initializeSettings() {
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
    document.getElementById("save").addEventListener("click", () => {
      const webhookUrl = document.getElementById("webhook-url").value;
      const webhookEnabled = document.getElementById("webhook-toggle").checked;
      chrome.storage.sync.set(
        { webhookUrl: webhookUrl, webhookEnabled: webhookEnabled },
        () => {
          console.log("Webhook settings saved");
          addLogEntry("Webhook settings saved");
          chrome.runtime.sendMessage({ type: "updateWebhookSettings" });
          trackEvent("webhook_settings_saved", { enabled: webhookEnabled });
        }
      );
    });

    document.getElementById("test-webhook").addEventListener("click", () => {
      const webhookUrl = document.getElementById("webhook-url").value;
      const webhookEnabled = document.getElementById("webhook-toggle").checked;
      if (!webhookEnabled) {
        alert("Please enable the webhook before testing.");
        return;
      }
      if (!webhookUrl) {
        alert("Please enter a webhook URL before testing.");
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
        description: "This is a test job posting to verify webhook functionality.",
        skills: ["Test Skill 1", "Test Skill 2", "Test Skill 3"],
        paymentVerified: true,
        clientRating: 4.9,
        clientSpent: "$10k+",
        clientCountry: "Test Country",
        attachments: [
          { name: "Test Document", url: "https://www.upwork.com/test-document" }
        ],
        questions: [
          "What is your experience with this type of project?",
          "How soon can you start?"
        ],
        scrapedAt: Date.now(),
        scrapedAtHuman: new Date().toLocaleString()
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
          alert(
            "Test webhook sent successfully. Check your webhook endpoint for the received data."
          );
          trackEvent("test_webhook_sent", { success: true });
        })
        .catch((error) => {
          console.error("Error:", error);
          addLogEntry("Error sending test webhook");
          alert("Error sending test webhook. Check the console for details.");
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

    // Add this after the other event listeners

    document.getElementById("save-frequency").addEventListener("click", () => {
      const days = parseInt(document.getElementById("days").value) || 0;
      const hours = parseInt(document.getElementById("hours").value) || 0;
      const minutes = parseInt(document.getElementById("minutes").value) || 1;

      const totalMinutes = days * 1440 + hours * 60 + minutes;

      if (totalMinutes < 1) {
        alert("Please set a frequency of at least 1 minute.");
        return;
      }

      chrome.storage.sync.set({ checkFrequency: totalMinutes }, () => {
        console.log("Check frequency saved");
        addLogEntry(`Check frequency saved: ${days}d ${hours}h ${minutes}m`);
        chrome.runtime.sendMessage({
          type: "updateCheckFrequency",
          frequency: totalMinutes,
        });
        startCountdown(); // Restart the countdown with the new frequency
        trackEvent("check_frequency_changed", { days, hours, minutes });
      });
    });

    // Load saved check frequency when the page opens
    chrome.storage.sync.get("checkFrequency", (data) => {
      if (data.checkFrequency) {
        document.getElementById("days").value =
          Math.floor(data.checkFrequency / 1440) || "";
        document.getElementById("hours").value =
          Math.floor((data.checkFrequency % 1440) / 60) || "";
        document.getElementById("minutes").value =
          data.checkFrequency % 60 || 1;
      }
      startCountdown(); // Start the countdown after loading the frequency
    });

    // Function to add log entries
    function addLogEntry(message) {
      const logContainer = document.getElementById("log-container");
      const logEntry = document.createElement("p");
      logEntry.textContent = `${new Date().toLocaleString()}: ${message}`;
      logContainer.insertBefore(logEntry, logContainer.firstChild);
    }

    // Load existing log entries
    chrome.storage.local.get("activityLog", (data) => {
      if (data.activityLog) {
        data.activityLog.forEach((entry) => addLogEntry(entry));
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
        jobItem.dataset.jobId = job.url || '';

        const jobHeader = document.createElement("div");
        jobHeader.className = "job-header";

        const jobTitle = document.createElement("div");
        jobTitle.className = "job-title";

        const timeSpan = document.createElement("span");
        timeSpan.className = "job-time";
        timeSpan.dataset.timestamp = job.scrapedAt || Date.now();
        updateTimeDifference(job.scrapedAt || Date.now(), timeSpan);

        jobTitle.textContent = job.title || 'Untitled Job';
        jobTitle.appendChild(document.createElement("br"));
        jobTitle.appendChild(timeSpan);

        jobTitle.onclick = () => toggleJobDetails(job.url || '');

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
        jobDetails.id = `job-details-${job.url || ''}`;
        jobDetails.innerHTML = `
          <p><strong>URL:</strong> ${job.url ? `<a href="${job.url}" target="_blank">${job.url}</a>` : 'N/A'}</p>
          <p><strong>Job Type:</strong> ${job.jobType || 'N/A'}</p>
          <p><strong>Skill Level:</strong> ${job.skillLevel || 'N/A'}</p>
          <p><strong>${job.jobType === 'Fixed price' ? 'Budget' : 'Hourly Range'}:</strong> ${job.jobType === 'Fixed price' ? (job.budget || 'N/A') : (job.hourlyRange || 'N/A')}</p>
          ${job.jobType === 'Hourly' ? `<p><strong>Estimated Time:</strong> ${job.estimatedTime || 'N/A'}</p>` : ''}
          <p><strong>Description:</strong> ${job.description || 'N/A'}</p>
          <p><strong>Skills:</strong> ${Array.isArray(job.skills) ? job.skills.join(", ") : 'N/A'}</p>
          <p><strong>Payment Verified:</strong> ${job.paymentVerified ? "Yes" : "No"}</p>
          <p><strong>Client Rating:</strong> ${job.clientRating || 'N/A'}</p>
          <p><strong>Client Spent:</strong> ${job.clientSpent || 'N/A'}</p>
          <p><strong>Client Country:</strong> ${job.clientCountry || 'N/A'}</p>
          ${Array.isArray(job.attachments) && job.attachments.length > 0 ? `<p><strong>Attachments:</strong> ${job.attachments.map(a => `<a href="${a.url}" target="_blank">${a.name}</a>`).join(", ")}</p>` : ''}
          ${Array.isArray(job.questions) && job.questions.length > 0 ? `<p><strong>Questions:</strong><ul>${job.questions.map(q => `<li>${q}</li>`).join("")}</ul></p>` : ''}
          <p><strong>Scraped At:</strong> ${job.scrapedAtHuman || 'N/A'}</p>
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

    // Listen for log updates and job updates from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "logUpdate") {
        addLogEntry(message.content);
      } else if (message.type === "jobsUpdate") {
        addJobEntries(message.jobs);
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

    // Modify the save-feed-sources event listener
    document
      .getElementById("save-feed-sources")
      .addEventListener("click", () => {
        const selectedFeedSource = document.querySelector(
          'input[name="feed-source"]:checked'
        ).value;
        const customSearchUrl =
          document.getElementById("custom-search-url").value;

        if (selectedFeedSource === "custom-search") {
          if (
            !customSearchUrl.startsWith(
              "https://www.upwork.com/nx/search/jobs/?"
            )
          ) {
            showCustomUrlError(
              "Custom Search URL must start with https://www.upwork.com/nx/search/jobs/?"
            );
            return;
          }
        }

        // Clear any existing error message
        showCustomUrlError("");

        chrome.storage.sync.set(
          {
            selectedFeedSource: selectedFeedSource,
            customSearchUrl: customSearchUrl,
          },
          () => {
            console.log("Feed sources saved");
            addLogEntry("Feed sources saved");
            chrome.runtime.sendMessage({ type: "updateFeedSources" });
            trackEvent("feed_sources_changed", {
              selectedFeedSource,
              customSearchUrl,
            });
          }
        );
      });

    // Modify the updateFeedSourceUI function
    function updateFeedSourceUI(selectedFeedSource) {
      const customSearchUrl = document.getElementById("custom-search-url");
      if (selectedFeedSource === "custom-search") {
        customSearchUrl.disabled = false;
        customSearchUrl.placeholder =
          "https://www.upwork.com/nx/search/jobs/...";
      } else {
        customSearchUrl.disabled = true;
        customSearchUrl.placeholder = "";
        // Clear any existing error message when switching to 'most-recent'
        showCustomUrlError("");
      }
    }

    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="feed-source"]').forEach((radio) => {
      radio.addEventListener("change", (event) => {
        updateFeedSourceUI(event.target.value);
      });
    });

    // Load saved feed source settings when the page opens
    chrome.storage.sync.get(
      ["selectedFeedSource", "customSearchUrl"],
      (data) => {
        const customSearchUrl = data.customSearchUrl || "";
        const selectedFeedSource = customSearchUrl
          ? "custom-search"
          : data.selectedFeedSource || "most-recent";

        document.querySelector(
          `input[name="feed-source"][value="${selectedFeedSource}"]`
        ).checked = true;

        const customSearchUrlInput =
          document.getElementById("custom-search-url");
        customSearchUrlInput.value = customSearchUrl;
        customSearchUrlInput.disabled = selectedFeedSource !== "custom-search";

        // Update the UI based on the selected feed source
        updateFeedSourceUI(selectedFeedSource);
      }
    );

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
