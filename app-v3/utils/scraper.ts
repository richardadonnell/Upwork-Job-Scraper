import {
  JOB_HISTORY_MAX,
  jobHistoryStorage,
  seenJobIdsStorage,
  settingsStorage,
} from './storage';

import type { ScrapeResult } from './types';

const ALARM_NAME = 'upwork-scrape';

export async function setupAlarm(): Promise<void> {
  const settings = await settingsStorage.getValue();
  await browser.alarms.clearAll();

  if (!settings.masterEnabled) return;

  const { days, hours, minutes } = settings.checkFrequency;
  const periodInMinutes = days * 24 * 60 + hours * 60 + minutes;
  if (periodInMinutes < 1) return;

  browser.alarms.create(ALARM_NAME, { periodInMinutes });
}

export async function runScrape(): Promise<void> {
  const settings = await settingsStorage.getValue();

  if (!settings.masterEnabled || !settings.searchUrl) {
    console.warn('[Upwork Scraper] Skipping scrape — disabled or no searchUrl configured.');
    return;
  }

  let tab: browser.tabs.Tab | undefined;

  try {
    tab = await browser.tabs.create({ url: settings.searchUrl, active: false });

    if (!tab.id) throw new Error('Failed to get tab ID');
    const tabId = tab.id;

    // Wait for tab to finish loading
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Tab load timeout')), 30_000);

      const listener = (
        id: number,
        _changeInfo: browser.tabs.TabChangeInfo,
        updatedTab: browser.tabs.Tab,
      ) => {
        if (id === tabId && updatedTab.status === 'complete') {
          clearTimeout(timeout);
          browser.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };

      browser.tabs.onUpdated.addListener(listener);
    });

    const results = await browser.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/upwork-scraper.js'],
    });

    const result = results?.[0]?.result as ScrapeResult | undefined;

    if (!result?.ok || !result.jobs) {
      await settingsStorage.setValue({
        ...settings,
        lastRunAt: new Date().toISOString(),
        lastRunStatus: result?.reason === 'logged_out' ? 'logged_out' : 'error',
      });
      return;
    }

    // Deduplication
    const seenIds = await seenJobIdsStorage.getValue();
    const seenSet = new Set(seenIds);
    const newJobs = result.jobs.filter((job) => !seenSet.has(job.uid));

    if (newJobs.length === 0) {
      await settingsStorage.setValue({
        ...settings,
        lastRunAt: new Date().toISOString(),
        lastRunStatus: 'success',
      });
      return;
    }

    // Persist new jobs
    const existingHistory = await jobHistoryStorage.getValue();
    const updatedHistory = [...newJobs, ...existingHistory].slice(0, JOB_HISTORY_MAX);
    const updatedSeenIds = [...seenSet, ...newJobs.map((j) => j.uid)];

    await Promise.all([
      jobHistoryStorage.setValue(updatedHistory),
      seenJobIdsStorage.setValue(updatedSeenIds),
      settingsStorage.setValue({
        ...settings,
        lastRunAt: new Date().toISOString(),
        lastRunStatus: 'success',
      }),
    ]);

    // Webhook delivery
    if (settings.webhookEnabled && settings.webhookUrl) {
      try {
        await fetch(settings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobs: newJobs, timestamp: new Date().toISOString() }),
        });
      } catch (err) {
        console.error('[Upwork Scraper] Webhook delivery failed:', err);
      }
    }

    // Notifications
    if (settings.notificationsEnabled) {
      for (const job of newJobs.slice(0, 3)) {
        browser.notifications.create({
          type: 'basic',
          iconUrl: '/icon/128.png',
          title: 'New Upwork Job',
          message: job.title,
        });
      }

      if (newJobs.length > 3) {
        browser.notifications.create({
          type: 'basic',
          iconUrl: '/icon/128.png',
          title: 'New Upwork Jobs',
          message: `${newJobs.length} new jobs found — open the extension to view them.`,
        });
      }
    }
  } catch (err) {
    console.error('[Upwork Scraper] Scrape error:', err);
    const settings = await settingsStorage.getValue();
    await settingsStorage.setValue({
      ...settings,
      lastRunAt: new Date().toISOString(),
      lastRunStatus: 'error',
    });
  } finally {
    if (tab?.id) {
      browser.tabs.remove(tab.id).catch(() => {});
    }
  }
}
