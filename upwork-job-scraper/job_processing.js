import { addToActivityLog } from './activity_log.js';
import { sendToWebhook } from './webhooks.js';
import { sendNotification } from './notifications.js';
import { updateBadge } from './badge.js';
import { jobScrapingEnabled, webhookEnabled, notificationsEnabled, newJobsCount, lastViewedTimestamp, scrapedJobs } from './extension_state.js';

export function processJobs(newJobs) {
  if (newJobs.length > 0) {
    newJobsCount += newJobs.length;
    scrapedJobs = [...scrapedJobs, ...newJobs];
    chrome.storage.local.set({ scrapedJobs: scrapedJobs, newJobsCount: newJobsCount });
    updateBadge();

    if (webhookEnabled) {
      sendToWebhook(newJobs);
    }

    if (notificationsEnabled) {
      sendNotification(newJobs);
    }

    addToActivityLog(`Found ${newJobs.length} new job(s)`);
  }
}