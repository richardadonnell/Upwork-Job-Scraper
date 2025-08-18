function addToActivityLog(message) {
  // Remove any existing timestamp from the message
  const cleanMessage = message.replace(
    /^\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s[AP]M:\s/,
    ""
  );

  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp}: ${cleanMessage}`;
  console.log(logEntry); // Log to console for debugging

  // Store in chrome.storage
  chrome.storage.local.get("activityLog", (data) => {
    const log = data.activityLog || [];

    // Check if this exact message was logged in the last second (prevent duplicates)
    const isDuplicate = log[0] === logEntry;

    if (!isDuplicate) {
      log.unshift(logEntry);
      // Keep only the last 100 entries
      if (log.length > 100) log.pop();
      chrome.storage.local.set({ activityLog: log });
    }
  });

  // Send message to update any open settings pages
  chrome.runtime.sendMessage(
    { type: "logUpdate", content: logEntry },
    (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.debug(`Message passing error: ${error.message}`);
      } else if (!response) {
        console.debug("No response from settings page");
      }
    }
  );
}

// Export the function to the global scope
globalThis.addToActivityLog = addToActivityLog;
