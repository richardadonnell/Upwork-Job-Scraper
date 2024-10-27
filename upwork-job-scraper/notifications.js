let notificationsEnabled = true; // Default value

function updateNotificationsEnabled(value) {
  notificationsEnabled = value;
}

function sendNotification(message, duration = 30000) {
  // Check storage directly before sending notification
  chrome.storage.sync.get(['notificationsEnabled'], (data) => {
    if (!data.notificationsEnabled) {
      console.log('Push notifications are disabled. Skipping notification.');
      addToActivityLog("Push notifications are disabled. Skipping notification.");
      return;
    }

    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: chrome.runtime.getURL("icon48.png"),
        title: "Upwork Job Scraper",
        message: message,
        buttons: [{ title: "Close" }],
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("Notification error: ", chrome.runtime.lastError.message);
        }
      }
    );
  });
}
