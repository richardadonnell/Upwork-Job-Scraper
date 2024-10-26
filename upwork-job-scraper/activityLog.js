function addToActivityLog(message) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp}: ${message}`;
  console.log(logEntry); // Log to console for debugging

  // Store in chrome.storage
  chrome.storage.local.get("activityLog", (data) => {
    const log = data.activityLog || [];
    log.unshift(logEntry);
    // Keep only the last 100 entries
    if (log.length > 100) log.pop();
    chrome.storage.local.set({ activityLog: log });
  });

  // Send message to update any open settings pages
  chrome.runtime.sendMessage(
    { type: "logUpdate", content: logEntry },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("No settings pages available for log update");
      }
    }
  );
}
