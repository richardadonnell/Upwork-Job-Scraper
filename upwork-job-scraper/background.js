import { logAndReportError } from './error_handling.js';
import { initializeExtension } from './initialization.js';
import { handleMessage } from './message_handlers.js';
import { checkForNewJobs } from './job_scraping.js';
import { jobScrapingEnabled, customSearchURL } from './extension_state.js';
import { sendTestError } from './test_error.js';

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(async () => {
  try {
    await chrome.tabs.create({ url: 'settings.html' });
  } catch (error) {
    logAndReportError("Error opening settings page", error);
  }
});

// Handle both onStartup and onInstalled events
chrome.runtime.onStartup.addListener(initializeExtension);
chrome.runtime.onInstalled.addListener(initializeExtension);

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    if (alarm.name === "checkJobs" && jobScrapingEnabled) {
      await checkForNewJobs();
    }
  } catch (error) {
    logAndReportError("Error in onAlarm listener", error);
  }
});

// Handle messages
chrome.runtime.onMessage.addListener(handleMessage);

// Expose sendTestError for debugging
globalThis.sendTestError = sendTestError;

// Handle setting the custom search URL
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
