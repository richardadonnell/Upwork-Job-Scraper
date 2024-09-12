export function addToActivityLog(message) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${message}`;

  chrome.storage.local.get("activityLog", (data) => {
    const activityLog = data.activityLog || [];
    activityLog.push(logEntry);
    chrome.storage.local.set({ activityLog: activityLog });
  });
}