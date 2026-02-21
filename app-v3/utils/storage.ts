import type { ActivityLog, Job, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  masterEnabled: false,
  searchTargets: [{ id: crypto.randomUUID(), searchUrl: '', webhookEnabled: false, webhookUrl: '' }],
  checkFrequency: { days: 0, hours: 1, minutes: 0 },
  notificationsEnabled: true,
  lastRunAt: null,
  lastRunStatus: null,
};

export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 2,
  migrations: {
    2: (old: Record<string, unknown>): Settings => {
      // Migrate from the v1 flat shape (searchUrl / webhookUrl / webhookEnabled)
      // to the v2 searchTargets array shape.
      const searchUrl = typeof old.searchUrl === 'string' ? old.searchUrl : '';
      const webhookUrl = typeof old.webhookUrl === 'string' ? old.webhookUrl : '';
      const webhookEnabled = typeof old.webhookEnabled === 'boolean' ? old.webhookEnabled : false;
      return {
        ...(old as unknown as Settings),
        searchTargets: [{ id: crypto.randomUUID(), searchUrl, webhookEnabled, webhookUrl }],
      };
    },
  },
});

export const seenJobIdsStorage = storage.defineItem<string[]>('local:seenJobIds', {
  fallback: [],
});

export const jobHistoryStorage = storage.defineItem<Job[]>('local:jobHistory', {
  fallback: [],
});

export const JOB_HISTORY_MAX = 100;

export const activityLogsStorage = storage.defineItem<ActivityLog[]>('local:activityLogs', {
  fallback: [],
});

export const ACTIVITY_LOG_MAX = 200;

export async function appendActivityLog(
  level: ActivityLog['level'],
  event: string,
  detail?: string,
): Promise<void> {
  const entry: ActivityLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    level,
    event,
    detail,
  };
  const current = await activityLogsStorage.getValue();
  await activityLogsStorage.setValue([entry, ...current].slice(0, ACTIVITY_LOG_MAX));
}
