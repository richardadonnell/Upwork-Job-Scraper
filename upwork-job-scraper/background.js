import { logAndReportError } from './error_handling.js';
import { initializeExtension } from './initialization.js';
import { handleMessage } from './message_handlers.js';
import { checkForNewJobs } from './job_scraping.js';
import { jobScrapingEnabled, customSearchUrl } from './extension_state.js';
import { sendTestError } from './test_error.js';

// Initialize the extension
try {
  initializeExtension();
  console.log('Extension initialized successfully');
} catch (error) {
  logAndReportError("Error initializing extension", error);
}

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(async () => {
  try {
    await chrome.tabs.create({ url: 'settings.html' });
  } catch (error) {
    logAndReportError("Error opening settings page", error);
  }
});

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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'setCustomSearchURL') {
    customSearchUrl = request.url;
    sendResponse({ success: true });
  } else {
    handleMessage(request, sender, sendResponse);
  }
});

// Expose sendTestError for debugging
self.sendTestError = sendTestError;

// Initialize Sentry only if running in the background context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
  try {
    // Check if window is defined before initializing Sentry
    if (typeof window !== 'undefined') {
      // Check if initializeSentry is defined before calling it
      if (typeof self.initializeSentry === 'function') {
        self.initializeSentry();
        console.log('Sentry initialized successfully');
      } else {
        console.warn('initializeSentry is not defined');
      }
    } else {
      console.warn('window is not defined, skipping Sentry initialization');
    }
  } catch (error) {
    console.error('Error initializing Sentry:', error);
    logAndReportError("Error initializing Sentry", error);
  }
}

function scrapeJobs() {
  // ... scrapeJobs function code ...
}
