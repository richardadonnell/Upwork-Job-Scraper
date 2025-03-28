function waitForBackgroundScript() {
  console.log("Waiting for background script...");
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkBackgroundScript = () => {
      attempts++;
      console.log(
        `Background script connection attempt ${attempts}/${maxAttempts}`
      );

      chrome.runtime.sendMessage({ type: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          console.error("Background script connection error:", {
            message: error.message,
            attempt: attempts,
            extensionId: chrome.runtime.id || "unknown",
            timestamp: new Date().toISOString(),
          });

          // Log detailed error for 'Receiving end does not exist' errors
          if (
            error.message &&
            error.message.includes("Receiving end does not exist")
          ) {
            console.error("Connection error diagnostic information:", {
              extensionId: chrome.runtime.id,
              manifestVersion: chrome.runtime.getManifest().manifest_version,
              extensionVersion: chrome.runtime.getManifest().version,
              serviceWorkerStatus: "checking...",
              browser: navigator.userAgent,
            });

            // Try to check if background page is registered
            try {
              chrome.management.getSelf((info) => {
                console.log("Extension info:", info);
              });
            } catch (mgmtError) {
              console.error("Failed to get extension info:", mgmtError);
            }
          }

          if (attempts < maxAttempts) {
            // Increasing backoff time with each attempt
            const backoffTime = Math.min(100 * Math.pow(2, attempts), 10000); // Exponential backoff, max 10 seconds
            console.log(`Retrying in ${backoffTime}ms...`);
            setTimeout(checkBackgroundScript, backoffTime);
          } else {
            console.error(
              "Maximum connection attempts reached. Background script may not be running properly."
            );
            // Show error to user
            alert(
              "Could not connect to extension background script. Please try refreshing the page or reinstalling the extension."
            );
            // Resolve anyway to allow partial functionality
            resolve({ error: "Failed to connect to background script" });
          }
        } else {
          console.log("Background script is ready");
          resolve(response);
        }
      });
    };

    checkBackgroundScript();
  });
}

// Enhanced function for sending messages to background script with improved error handling
function sendMessageToBackground(message, retries = 3) {
  return new Promise((resolve, reject) => {
    // Add diagnostic information to all outgoing messages
    const enhancedMessage = {
      ...message,
      _metadata: {
        timestamp: Date.now(),
        sender: "settings.js",
        retryCount: retries,
      },
    };

    console.log(`Sending message to background script: ${message.type}`, {
      message: enhancedMessage,
      retriesLeft: retries,
    });

    const attemptSend = (remainingRetries) => {
      chrome.runtime.sendMessage(enhancedMessage, (response) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          console.error("Message send error:", {
            errorMessage: error.message,
            messageType: message.type,
            remainingRetries,
            timestamp: new Date().toISOString(),
          });

          // Add detailed diagnostic info for connection errors
          if (error.message?.includes("Receiving end does not exist")) {
            console.error("Connection error in sendMessageToBackground:", {
              extensionId: chrome.runtime.id,
              messageDetails: message,
              browserInfo: navigator.userAgent,
              timestamp: Date.now(),
            });

            // Try to check if service worker is still registered
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker
                .getRegistrations()
                .then((registrations) => {
                  console.log("Service worker registrations:", registrations);
                })
                .catch((err) => {
                  console.error("Error checking service workers:", err);
                });
            }
          }

          if (remainingRetries > 0) {
            console.log(
              `Retrying message send (${message.type}), ${remainingRetries} attempts left`
            );
            // Exponential backoff
            const backoffTime = Math.min(
              1000 * 2 ** (retries - remainingRetries),
              5000
            );
            setTimeout(() => attemptSend(remainingRetries - 1), backoffTime);
          } else {
            const finalError = new Error(
              `Failed to send message to background script: ${error.message}`
            );
            console.error("All retry attempts failed:", finalError);
            reject(finalError);

            // Show UI error if it's an important operation
            if (
              message.type === "manualScrape" ||
              message.type === "updateSchedule" ||
              message.type === "updateCheckFrequency"
            ) {
              showAlert(
                "Communication with extension background failed. Try reloading the page.",
                "error"
              );
            }
          }
        } else if (!response) {
          const error = new Error(
            "No response received from background script"
          );
          if (remainingRetries > 0) {
            console.log(
              `Retrying due to no response (${message.type}), ${remainingRetries} attempts left`
            );
            setTimeout(() => attemptSend(remainingRetries - 1), 1000);
          } else {
            console.error("No response after all retries:", error);
            reject(error);
          }
        } else {
          console.log(
            `Message ${message.type} successfully processed`,
            response
          );
          resolve(response);
        }
      });
    };

    attemptSend(retries);
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

  // Add copy log and open GitHub issue functionality
  document
    .getElementById("copy-log-github")
    .addEventListener("click", async () => {
      try {
        // Get the activity log
        const data = await new Promise((resolve) => {
          chrome.storage.local.get("activityLog", resolve);
        });

        // Format the log entries with markdown code block
        const formattedLog = `\`\`\`\n${(data.activityLog || []).join(
          "\n"
        )}\n\`\`\``;

        // Copy to clipboard
        await navigator.clipboard.writeText(formattedLog);

        // Open GitHub issue page
        chrome.tabs.create({
          url: "https://github.com/richardadonnell/Upwork-Job-Scraper/issues/new",
        });

        showAlert("Activity log copied to clipboard!", "success");
      } catch (error) {
        console.error("Error handling copy log:", error);
        showAlert(`Failed to copy log: ${error.message}`, "error");
      }
    });

  // Add setup instructions accordion functionality
  const setupInstructions = document.getElementById("setup-instructions");
  const accordionContent =
    setupInstructions.querySelector(".accordion-content");
  setupInstructions.addEventListener("click", () => {
    accordionContent.style.display =
      accordionContent.style.display === "block" ? "none" : "block";
    const header = setupInstructions.querySelector(".accordion-header");
    header.querySelector("p").textContent =
      accordionContent.style.display === "block"
        ? "click to collapse"
        : "click to expand";
  });

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
          addToActivityLog(
            `Notifications ${isEnabled ? "enabled" : "disabled"}`
          );
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
      for (const day of days) {
        document.getElementById(`day-${day}`).checked =
          day !== "sun" && day !== "sat";
      }
      saveSchedule();
      trackEvent("set_weekdays", {});
    });

    document.getElementById("reset-days").addEventListener("click", () => {
      for (const day of days) {
        document.getElementById(`day-${day}`).checked = true;
      }
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
        addToActivityLog(message.content);
        sendResponse({ received: true });
        return true; // Keep the message channel open
      }

      if (message.type === "jobsUpdate") {
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
        addToActivityLog(`Job scraping ${isEnabled ? "enabled" : "disabled"}`);
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

    // Load existing activity log entries from storage
    loadActivityLog();
  } catch (error) {
    console.error("Error initializing settings:", error);
    showAlert(`Error initializing settings: ${error.message}`, "error");
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
        showAlert("Pair updated successfully", "success");
      }
    } catch (validationError) {
      console.error(`Validation error for ${field}:`, validationError);
      showAlert(validationError.message, "error");

      // Revert the UI to the last valid state
      const pairElement = document.querySelector(`[data-pair-id="${pairId}"]`);
      if (pairElement) {
        const input = pairElement.querySelector(`.${field.toLowerCase()}`);
        if (input) input.value = pair[field] || "";
      }
    }
  } catch (error) {
    console.error(`Error updating ${field} for pair ${pairId}:`, error);
    showAlert(error.message, "error");
  }
}

// Function to toggle pair enabled state
async function togglePairEnabled(pairId) {
  try {
    await togglePair(pairId);
    showAlert("Pair status updated", "success");
  } catch (error) {
    console.error("Error toggling pair:", error);
    showAlert(error.message, "error");
  }
}

// Function to test a pair's webhook
async function testPairWebhook(pairId) {
  try {
    const pairs = await getAllPairs();
    const pair = pairs.find((p) => p.id === pairId);
    if (!pair) throw new Error("Pair not found");

    const testPayload = {
      title: "Example Job Title",
      url: "https://www.upwork.com/jobs/example",
      jobType: "Hourly",
      skillLevel: "Expert",
      budget: "N/A",
      hourlyRange: "$30-50",
      estimatedTime: "Less than 30 hrs/week",
      description:
        "This is an example job description that demonstrates all available fields.",
      skills: ["JavaScript", "React", "Node.js", "API Development"],
      paymentVerified: true,
      clientRating: "4.95",
      clientSpent: "$10K+ spent",
      clientCountry: "United States",
      attachments: [
        {
          name: "Project Brief.pdf",
          url: "https://www.upwork.com/jobs/example/attachment1",
        },
      ],
      questions: [
        "What similar projects have you worked on?",
        "What is your experience with React?",
      ],
      scrapedAt: Date.now(),
      scrapedAtHuman: new Date().toLocaleString(),
      jobPostingTime: "4 minutes ago",
      clientLocation: "San Francisco, CA",
      sourceUrl: "https://www.upwork.com/nx/search/jobs/?sort=recency",
      source: {
        name: pair.name,
        searchUrl: pair.searchUrl,
        webhookUrl: pair.webhookUrl,
      },
    };

    await sendMessageToBackground({
      type: "testWebhook",
      webhookUrl: pair.webhookUrl,
      testPayload,
    });

    showAlert("Webhook test successful!", "success");
  } catch (error) {
    console.error("Error testing webhook:", error);
    showAlert(`Webhook test failed: ${error.message}`, "error");
  }
}

// Function to remove a pair
async function removePairElement(pairId) {
  if (!confirm("Are you sure you want to remove this pair?")) return;

  try {
    await removePair(pairId);
    const element = document.querySelector(`[data-pair-id="${pairId}"]`);
    if (element) element.remove();
    showAlert("Pair removed successfully", "success");
  } catch (error) {
    console.error("Error removing pair:", error);
    showAlert(error.message, "error");
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
    showAlert(`Error loading pairs: ${error.message}`, "error");
  }
}

// Function to add a new pair
async function addNewPair() {
  try {
    console.log("Adding new pair...");
    const pair = createDefaultPair();
    console.log("Created default pair:", pair);
    
    // Call addPair with individual parameters instead of the whole pair object
    const savedPair = await addPair(pair.name, pair.searchUrl, pair.webhookUrl);
    console.log("Pair added to storage:", savedPair);
    
    // Use the returned pair from storage which has the correct ID
    const pairElement = createPairElement(savedPair);
    console.log("Created pair element");
    document.getElementById("pairs-container").appendChild(pairElement);
    console.log("Pair element added to DOM");
    showAlert("New pair added successfully", "success");
  } catch (error) {
    console.error("Error adding new pair:", error);
    showAlert(error.message, "error");
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

function showAlert(message, type = "success", timeout = 5000) {
  const alertContainer = document.getElementById("alert-container");
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert", type);

  // Create message paragraph
  const alertMessage = document.createElement("p");
  alertMessage.textContent = message;
  alertElement.appendChild(alertMessage);

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-btn");
  closeButton.innerHTML = "×";
  closeButton.addEventListener("click", () => {
    clearTimeout(alertTimeout);
    alertElement.style.opacity = "0";
    setTimeout(() => alertElement.remove(), 300);
  });
  alertElement.appendChild(closeButton);

  // Create countdown element
  const countdownElement = document.createElement("span");
  countdownElement.classList.add("countdown");
  alertElement.appendChild(countdownElement);

  // Update countdown
  const startTime = Date.now();
  const updateCountdown = () => {
    const remaining = Math.ceil((timeout - (Date.now() - startTime)) / 1000);
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      alertElement.style.opacity = "0";
      setTimeout(() => alertElement.remove(), 300);
    } else {
      countdownElement.textContent = `${remaining}s`;
    }
  };
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);

  // Add to container
  alertContainer.appendChild(alertElement);

  // Set timeout for removal
  const alertTimeout = setTimeout(() => {
    alertElement.style.opacity = "0";
    setTimeout(() => alertElement.remove(), 300);
  }, timeout);

  // Limit the number of visible alerts
  const maxAlerts = 3;
  const alerts = alertContainer.getElementsByClassName("alert");
  if (alerts.length > maxAlerts) {
    for (let i = 0; i < alerts.length - maxAlerts; i++) {
      alerts[i].remove();
    }
  }
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
    // Remove the timestamp from the message if it's already there
    const cleanMessage = message.replace(
      /^\d{1,2}\/\d{1,2}\/\d{4},\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M:\s+/,
      ""
    );
    logElement.textContent = `${timestamp}: ${cleanMessage}`;
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

// Function to load existing activity log entries from storage
function loadActivityLog() {
  const logContainer = document.getElementById("log-container");
  if (logContainer) {
    chrome.storage.local.get("activityLog", (data) => {
      const log = data.activityLog || [];

      // Clear the container first
      logContainer.innerHTML = "";

      // Add each log entry to the log container
      for (const entry of log) {
        const logElement = document.createElement("div");
        logElement.textContent = entry;
        logContainer.appendChild(logElement);
      }
    });
  }
}

// Add this before initializeSettings
function saveFrequency() {
  const minutes = document.getElementById("minutes").value;
  const frequency = Math.max(5, Number.parseInt(minutes, 10) || 5);

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
  for (const interval of timeUpdateIntervals) {
    clearInterval(interval);
  }
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
      showAlert("Manual scrape started successfully", "success");
      addToActivityLog("Manual scrape initiated");
    } else {
      showAlert(`Manual scrape failed: ${response.error}`, "error");
      addToActivityLog(`Manual scrape failed: ${response.error}`);
    }
  } catch (error) {
    console.error("Error during manual scrape:", error);
    showAlert(`Manual scrape failed: ${error.message}`, "error");
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
    showAlert("All jobs cleared successfully", "success");
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
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}
