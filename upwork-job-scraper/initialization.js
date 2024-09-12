import { addToActivityLog } from './activity_log.js';
import { updateAlarm } from './alarms.js';
import { loadFeedSourceSettings } from './feed_sources.js';
import { initializeLastViewedTimestamp } from './last_viewed_timestamp.js';
import { jobScrapingEnabled } from './extension_state.js';
import { updateBadge } from './badge.js';
import { scrapedJobs, newJobsCount } from './extension_state.js';
import { initializeStorageListeners } from './storage_listeners.js';

export async function initializeExtension() {
  try {
    addToActivityLog("Extension initialized");
    await loadFeedSourceSettings();
    initializeLastViewedTimestamp();
    updateBadge();

    const { scrapedJobs: storedJobs, newJobsCount: storedCount } = await chrome.storage.local.get(['scrapedJobs', 'newJobsCount']);
    if (storedJobs) {
      scrapedJobs = storedJobs;
    }
    if (storedCount) {
      newJobsCount = storedCount;
    }

    if (jobScrapingEnabled) {
      await updateAlarm();
    }

    const { checkFrequency } = await chrome.storage.sync.get('checkFrequency');
    if (!checkFrequency) {
      await chrome.storage.sync.set({ checkFrequency: 5 });
    }

    initializeStorageListeners();
  } catch (error) {
    logAndReportError('Error initializing extension', error);
  }
}