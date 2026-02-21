import type { Job, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  masterEnabled: false,
  searchTargets: [{ id: crypto.randomUUID(), searchUrl: '', webhookEnabled: false, webhookUrl: '' }],
  checkFrequency: { days: 0, hours: 1, minutes: 0 },
  notificationsEnabled: true,
  lastRunAt: null,
  lastRunStatus: null,
};

export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  defaultValue: DEFAULT_SETTINGS,
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
  defaultValue: [],
});

export const jobHistoryStorage = storage.defineItem<Job[]>('local:jobHistory', {
  defaultValue: [],
});

export const JOB_HISTORY_MAX = 100;
