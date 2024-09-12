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
      requireInteraction: false,
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("Notification error: ", chrome.runtime.lastError.message);
      } else {
        // Set a timeout to clear the notification after the specified duration
        setTimeout(() => {
          chrome.notifications.clear(notificationId);
        }, duration);
      }
    }
  );
}
