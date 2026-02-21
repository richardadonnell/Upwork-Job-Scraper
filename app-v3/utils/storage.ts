import type { ActivityLog, Job, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  masterEnabled: false,
  searchTargets: [
    {
      id: crypto.randomUUID(),
      name: 'Target 1',
      searchUrl: '',
      webhookEnabled: false,
      webhookUrl: '',
    },
  ],
  minuteInterval: 5,
  activeDays: [false, true, true, true, true, true, false],
  timeWindow: { start: '00:00', end: '23:59' },
  notificationsEnabled: true,
  lastRunAt: null,
  lastRunStatus: null,
};

export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 4,
  migrations: {
    2: (old: Record<string, unknown>): Settings => {
      // Migrate from the v1 flat shape (searchUrl / webhookUrl / webhookEnabled)
      // to the v2 searchTargets array shape.
      const searchUrl = typeof old.searchUrl === 'string' ? old.searchUrl : '';
      const webhookUrl = typeof old.webhookUrl === 'string' ? old.webhookUrl : '';
      const webhookEnabled = typeof old.webhookEnabled === 'boolean' ? old.webhookEnabled : false;
      return {
        ...(old as unknown as Settings),
        searchTargets: [
          {
            id: crypto.randomUUID(),
            name: 'Target 1',
            searchUrl,
            webhookEnabled,
            webhookUrl,
          },
        ],
      };
    },
    3: (old: Record<string, unknown>): Settings => {
      const oldFrequency =
        typeof old.checkFrequency === 'object' && old.checkFrequency
          ? (old.checkFrequency as { days?: unknown; hours?: unknown; minutes?: unknown })
          : null;

      const days = typeof oldFrequency?.days === 'number' ? oldFrequency.days : 0;
      const hours = typeof oldFrequency?.hours === 'number' ? oldFrequency.hours : 0;
      const minutes = typeof oldFrequency?.minutes === 'number' ? oldFrequency.minutes : 0;
      const legacyTotalMinutes = days * 24 * 60 + hours * 60 + minutes;

      const rawMinuteInterval =
        typeof old.minuteInterval === 'number' ? old.minuteInterval : legacyTotalMinutes;

      return {
        ...(old as unknown as Settings),
        minuteInterval: Math.max(5, Math.floor(rawMinuteInterval || 5)),
        activeDays: [false, true, true, true, true, true, false],
        timeWindow: { start: '00:00', end: '23:59' },
      };
    },
    4: (old: Record<string, unknown>): Settings => {
      const base = old as unknown as Settings;
      const priorTargets = Array.isArray(base.searchTargets)
        ? base.searchTargets
        : DEFAULT_SETTINGS.searchTargets;

      const searchTargets = priorTargets.map((target, index) => {
        const typed = target as Partial<Settings['searchTargets'][number]>;
        const existingName = typeof typed.name === 'string' ? typed.name.trim() : '';
        return {
          id: typeof typed.id === 'string' ? typed.id : crypto.randomUUID(),
          name: existingName || `Target ${index + 1}`,
          searchUrl: typeof typed.searchUrl === 'string' ? typed.searchUrl : '',
          webhookEnabled:
            typeof typed.webhookEnabled === 'boolean' ? typed.webhookEnabled : false,
          webhookUrl: typeof typed.webhookUrl === 'string' ? typed.webhookUrl : '',
        };
      });

      return {
        ...base,
        searchTargets:
          searchTargets.length > 0 ? searchTargets : DEFAULT_SETTINGS.searchTargets,
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
