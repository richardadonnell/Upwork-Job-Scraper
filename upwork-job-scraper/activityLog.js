function addToActivityLog(message) {
  const logEntry = `${new Date().toLocaleString()}: ${message}`;
  console.log(logEntry); // Log to console for debugging

  chrome.storage.local.get("activityLog", (data) => {
    const log = data.activityLog || [];
    log.unshift(logEntry);
    // Keep only the last 100 entries
    if (log.length > 100) log.pop();
    chrome.storage.local.set({ activityLog: log });
  });

  // Send message to update the settings page if it's open
  chrome.runtime.sendMessage(
    { type: "logUpdate", content: logEntry },
    (response) => {
      if (chrome.runtime.lastError) {
        // This will happen if the settings page is not open, which is fine
        console.log("Settings page not available for log update");
      }
    }
  );
}
