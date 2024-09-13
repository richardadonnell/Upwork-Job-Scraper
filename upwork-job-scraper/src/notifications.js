let notificationsEnabled = true; // Default value

function updateNotificationsEnabled(value) {
  notificationsEnabled = value;
}

function sendNotification(message, duration = 30000) {
  // Default duration: 30 seconds
  if (!notificationsEnabled) {
    addToActivityLog("Push notifications are disabled. Skipping notification.");
    return;
  }

  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon48.png"),
      title: "Upwork Job Scraper",
      message: message,
      buttons: [{ title: "Close" }], // Add a "Close" button
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("Notification error: ", chrome.runtime.lastError.message);
      }
    }
  );
}
