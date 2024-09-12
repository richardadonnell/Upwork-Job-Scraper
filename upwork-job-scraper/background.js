import { logAndReportError } from './error_handling.js';
import { initializeExtension } from './initialization.js';
import { handleMessage } from './message_handlers.js';
import { checkForNewJobs } from './job_scraping.js';
import { jobScrapingEnabled, customSearchURL } from './extension_state.js';
import { sendTestError } from './test_error.js';

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
  try {
    chrome.tabs.create({ url: 'settings.html' });
  } catch (error) {
    console.error("Error opening settings page:", error);
    logAndReportError("Error opening settings page", error);
  }
});

// Add this new listener to handle both onStartup and onInstalled events
chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});

// Modify the existing chrome.alarms.onAlarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  try {
    if (alarm.name === "checkJobs" && jobScrapingEnabled) {
      checkForNewJobs();
    }
  } catch (error) {
    logAndReportError("Error in onAlarm listener", error);
  }
});

// Modify the message listener to include error handling
chrome.runtime.onMessage.addListener(handleMessage);

// Expose the function to the global scope so it can be called from the console
globalThis.sendTestError = sendTestError;

// Add this listener to handle setting the custom search URL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'setCustomSearchURL') {
    customSearchURL = request.url;
    sendResponse({ success: true });
  }
});

// Initialize Sentry only if running in the background context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
  window.initializeSentry();
}
