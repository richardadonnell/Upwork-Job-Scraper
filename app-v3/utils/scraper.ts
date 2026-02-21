import {
  JOB_HISTORY_MAX,
  jobHistoryStorage,
  seenJobIdsStorage,
  settingsStorage,
} from './storage';
import type { ScrapeResult, SearchTarget } from './types';

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

async function scrapeTarget(target: SearchTarget): Promise<ScrapeResult> {
  let tabIdToRemove: number | undefined;

  try {
    // browser.tabs.create types resolve differently in plain tsc vs WXT's bundler;
    // cast through unknown to extract the id safely in both environments.
    const tab = (await browser.tabs.create({
      url: target.searchUrl,
      active: false,
    })) as unknown as { id?: number };

    if (!tab.id) throw new Error('Failed to get tab ID');
    const tabId = tab.id;
    tabIdToRemove = tabId;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Tab load timeout')), 30_000);

      const listener = (id: number, _changeInfo: unknown, updatedTab: { status?: string }) => {
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

    return (results?.[0]?.result as ScrapeResult | undefined) ?? { ok: false, reason: 'error' };
  } finally {
    if (tabIdToRemove !== undefined) {
      browser.tabs.remove(tabIdToRemove).catch(() => {});
    }
  }
}

async function processTargetResult(
  target: SearchTarget,
  result: ScrapeResult,
  notificationsEnabled: boolean,
): Promise<void> {
  if (!result.ok || !result.jobs) return;

  const seenIds = await seenJobIdsStorage.getValue();
  const seenSet = new Set(seenIds);
  const newJobs = result.jobs.filter((job) => !seenSet.has(job.uid));

  if (newJobs.length === 0) return;

  const existingHistory = await jobHistoryStorage.getValue();
  const updatedHistory = [...newJobs, ...existingHistory].slice(0, JOB_HISTORY_MAX);
  const updatedSeenIds = [...seenSet, ...newJobs.map((j) => j.uid)];

  await Promise.all([
    jobHistoryStorage.setValue(updatedHistory),
    seenJobIdsStorage.setValue(updatedSeenIds),
  ]);

  if (target.webhookEnabled && target.webhookUrl) {
    try {
      await fetch(target.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: newJobs, timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      console.error(`[Upwork Scraper] Webhook delivery failed for ${target.searchUrl}:`, err);
    }
  }

  if (notificationsEnabled) {
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
}

function resolveRunStatus(
  anyLoggedOut: boolean,
  anyError: boolean,
): 'success' | 'error' | 'logged_out' {
  if (anyLoggedOut) return 'logged_out';
  if (anyError) return 'error';
  return 'success';
}

export async function runScrape(): Promise<void> {
  const settings = await settingsStorage.getValue();

  const activeTargets = settings.searchTargets.filter((t) => t.searchUrl.trim() !== '');

  if (!settings.masterEnabled || activeTargets.length === 0) {
    console.warn('[Upwork Scraper] Skipping scrape — disabled or no search URLs configured.');
    return;
  }

  let anyError = false;
  let anyLoggedOut = false;

  for (const target of activeTargets) {
    try {
      const result = await scrapeTarget(target);

      if (!result.ok || !result.jobs) {
        if (result.reason === 'logged_out') anyLoggedOut = true;
        else anyError = true;
        continue;
      }

      await processTargetResult(target, result, settings.notificationsEnabled);
    } catch (err) {
      console.error(`[Upwork Scraper] Scrape error for ${target.searchUrl}:`, err);
      anyError = true;
    }
  }

  await settingsStorage.setValue({
    ...settings,
    lastRunAt: new Date().toISOString(),
    lastRunStatus: resolveRunStatus(anyLoggedOut, anyError),
  });
}
