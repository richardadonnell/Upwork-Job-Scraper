import { addToActivityLog } from './activity_log.js';
import { sendToWebhook } from './webhooks.js';
import { sendNotification } from './notifications.js';
import { updateBadge } from './badge.js';
import { jobScrapingEnabled, webhookEnabled, notificationsEnabled, newJobsCount, lastViewedTimestamp, scrapedJobs } from './extension_state.js';

export async function processJobs(newJobs) {
  try {
    if (newJobs.length > 0) {
      newJobsCount += newJobs.length;
      scrapedJobs = [...scrapedJobs, ...newJobs];
      await chrome.storage.local.set({ scrapedJobs, newJobsCount });
      updateBadge();

      if (webhookEnabled) {
        await sendToWebhook(newJobs);
      }

      if (notificationsEnabled) {
        await sendNotification(newJobs);
      }

      addToActivityLog(`Found ${newJobs.length} new job(s)`);
    }
  } catch (error) {
    logAndReportError('Error processing jobs', error);
  }
}