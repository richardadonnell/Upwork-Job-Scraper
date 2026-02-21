import type { Job, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  masterEnabled: false,
  searchUrl: '',
  checkFrequency: { days: 0, hours: 1, minutes: 0 },
  webhookEnabled: false,
  webhookUrl: '',
  notificationsEnabled: true,
  lastRunAt: null,
  lastRunStatus: null,
};

export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  defaultValue: DEFAULT_SETTINGS,
});

export const seenJobIdsStorage = storage.defineItem<string[]>('local:seenJobIds', {
  defaultValue: [],
});

export const jobHistoryStorage = storage.defineItem<Job[]>('local:jobHistory', {
  defaultValue: [],
});

export const JOB_HISTORY_MAX = 100;
