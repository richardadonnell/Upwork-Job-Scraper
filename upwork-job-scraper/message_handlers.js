import { selectedFeedSource, customSearchUrl, checkFrequency, webhookEnabled, jobScrapingEnabled, notificationsEnabled, newJobsCount, lastViewedTimestamp } from './extension_state.js';
import { updateAlarm } from './alarms.js';
import { updateBadge } from './badge.js';
import { sendTestError } from './test_error.js';
import { logAndReportError } from './error_handling.js';

export function handleMessage(message, sender, sendResponse) {
  try {
    if (message.type === "getJobs") {
      chrome.storage.local.get("scrapedJobs", (data) => {
        sendResponse({ jobs: data.scrapedJobs || [] });
      });
      return true;
    } else if (message.type === "manualScrape") {
      checkForNewJobs();
      sendResponse({ success: true });
    } else if (message.type === "clearJobs") {
      chrome.storage.local.set({ scrapedJobs: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    } else if (message.type === "getSettings") {
      sendResponse({
        selectedFeedSource: selectedFeedSource,
        customSearchUrl: customSearchUrl,
        checkFrequency: checkFrequency,
        webhookEnabled: webhookEnabled,
        jobScrapingEnabled: jobScrapingEnabled,
        notificationsEnabled: notificationsEnabled,
      });
    } else if (message.type === "saveSettings") {
      Object.assign(selectedFeedSource, message.selectedFeedSource);
      customSearchUrl = message.customSearchUrl;
      checkFrequency = message.checkFrequency;
      webhookEnabled = message.webhookEnabled;
      jobScrapingEnabled = message.jobScrapingEnabled;
      notificationsEnabled = message.notificationsEnabled;

      chrome.storage.local.set({
        selectedFeedSource: selectedFeedSource,
        customSearchUrl: customSearchUrl,
        checkFrequency: checkFrequency,
        webhookEnabled: webhookEnabled,
        jobScrapingEnabled: jobScrapingEnabled,
        notificationsEnabled: notificationsEnabled,
      }, () => {
        updateAlarm();
        sendResponse({ success: true });
      });
      return true;
    } else if (message.type === "getLastViewedTimestamp") {
      sendResponse({ lastViewedTimestamp: lastViewedTimestamp });
    } else if (message.type === "updateLastViewedTimestamp") {
      lastViewedTimestamp = message.timestamp;
      chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });
      sendResponse({ success: true });
    } else if (message.type === "getNewJobsCount") {
      sendResponse({ newJobsCount: newJobsCount });
    } else if (message.type === "resetNewJobsCount") {
      newJobsCount = 0;
      chrome.storage.local.set({ newJobsCount: newJobsCount });
      updateBadge();
      sendResponse({ success: true });
    } else if (message.type === "sendTestError") {
      sendTestError(message.customMessage);
      sendResponse({ success: true });
    }
  } catch (error) {
    logAndReportError("Error in onMessage listener", error);
  }
}