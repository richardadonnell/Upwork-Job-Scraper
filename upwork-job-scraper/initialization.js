import { addToActivityLog } from './activity_log.js';
import { updateAlarm } from './alarms.js';
import { loadFeedSourceSettings } from './feed_sources.js';
import { initializeLastViewedTimestamp } from './last_viewed_timestamp.js';
import { jobScrapingEnabled } from './extension_state.js';
import { updateBadge } from './badge.js';
import { scrapedJobs, newJobsCount } from './extension_state.js';
import { initializeStorageListeners } from './storage_listeners.js';

export async function initializeExtension() {
  addToActivityLog("Extension initialized");
  loadFeedSourceSettings();
  initializeLastViewedTimestamp();
  updateBadge();

  chrome.storage.local.get(['scrapedJobs', 'newJobsCount'], (data) => {
    if (data.scrapedJobs) {
      scrapedJobs = data.scrapedJobs;
    }
    if (data.newJobsCount) {
      newJobsCount = data.newJobsCount;
    }
  });

  if (jobScrapingEnabled) {
    updateAlarm();
  }

  chrome.storage.sync.get('checkFrequency', (data) => {
    if (!data.checkFrequency) {
      chrome.storage.sync.set({ checkFrequency: 5 });
    }
  });

  initializeStorageListeners();
}