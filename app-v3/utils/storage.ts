import type { ActivityLog, Job, Settings } from './types';

function createDefaultSearchTarget(index: number): Settings['searchTargets'][number] {
  return {
    id: crypto.randomUUID(),
    name: `Target ${index + 1}`,
    searchUrl: '',
    webhookEnabled: false,
    webhookUrl: '',
    payloadMode: 'v3',
    legacyCompatibilityEligible: false,
  };
}

function sanitizeSearchTarget(
  target: unknown,
  index: number,
): Settings['searchTargets'][number] {
  const typed = (target ?? {}) as Partial<Settings['searchTargets'][number]>;
  const fallback = createDefaultSearchTarget(index);
  const name = typeof typed.name === 'string' ? typed.name.trim() : '';
  const payloadMode: Settings['searchTargets'][number]['payloadMode'] =
    typed.payloadMode === 'legacy-v1' ? 'legacy-v1' : 'v3';
  const legacyCompatibilityEligible =
    typeof typed.legacyCompatibilityEligible === 'boolean'
      ? typed.legacyCompatibilityEligible
      : payloadMode === 'legacy-v1';

  return {
    id: typeof typed.id === 'string' && typed.id.trim() ? typed.id : fallback.id,
    name: name || fallback.name,
    searchUrl: typeof typed.searchUrl === 'string' ? typed.searchUrl : '',
    webhookEnabled:
      typeof typed.webhookEnabled === 'boolean' ? typed.webhookEnabled : false,
    webhookUrl: typeof typed.webhookUrl === 'string' ? typed.webhookUrl : '',
    payloadMode,
    legacyCompatibilityEligible,
  };
}

function sanitizeActiveDays(
  value: unknown,
): [boolean, boolean, boolean, boolean, boolean, boolean, boolean] {
  if (!Array.isArray(value) || value.length !== 7) {
    return DEFAULT_SETTINGS.activeDays;
  }

  return [
    Boolean(value[0]),
    Boolean(value[1]),
    Boolean(value[2]),
    Boolean(value[3]),
    Boolean(value[4]),
    Boolean(value[5]),
    Boolean(value[6]),
  ];
}

function sanitizeTimeWindow(
  value: unknown,
): { start: string; end: string } {
  const typed = (value ?? {}) as Partial<Settings['timeWindow']>;
  const start =
    typeof typed.start === 'string' && /^\d{2}:\d{2}$/.test(typed.start)
      ? typed.start
      : DEFAULT_SETTINGS.timeWindow.start;
  const end =
    typeof typed.end === 'string' && /^\d{2}:\d{2}$/.test(typed.end)
      ? typed.end
      : DEFAULT_SETTINGS.timeWindow.end;
  return { start, end };
}

export function sanitizeSettings(input: unknown): Settings {
  const typed = (input ?? {}) as Partial<Settings>;
  const searchTargetsInput = Array.isArray(typed.searchTargets)
    ? typed.searchTargets
    : DEFAULT_SETTINGS.searchTargets;
  const searchTargets = searchTargetsInput.map((target, index) =>
    sanitizeSearchTarget(target, index),
  );

  return {
    masterEnabled:
      typeof typed.masterEnabled === 'boolean'
        ? typed.masterEnabled
        : DEFAULT_SETTINGS.masterEnabled,
    searchTargets:
      searchTargets.length > 0
        ? searchTargets
        : [createDefaultSearchTarget(0)],
    minuteInterval:
      typeof typed.minuteInterval === 'number' && Number.isFinite(typed.minuteInterval)
        ? Math.max(5, Math.floor(typed.minuteInterval))
        : DEFAULT_SETTINGS.minuteInterval,
    activeDays: sanitizeActiveDays(typed.activeDays),
    timeWindow: sanitizeTimeWindow(typed.timeWindow),
    notificationsEnabled:
      typeof typed.notificationsEnabled === 'boolean'
        ? typed.notificationsEnabled
        : DEFAULT_SETTINGS.notificationsEnabled,
    lastRunAt:
      typeof typed.lastRunAt === 'string' || typed.lastRunAt === null
        ? typed.lastRunAt
        : DEFAULT_SETTINGS.lastRunAt,
    lastRunStatus:
      typed.lastRunStatus === 'success' ||
      typed.lastRunStatus === 'error' ||
      typed.lastRunStatus === 'logged_out' ||
      typed.lastRunStatus === 'captcha_required' ||
      typed.lastRunStatus === null
        ? typed.lastRunStatus
        : DEFAULT_SETTINGS.lastRunStatus,
  };
}

export const DEFAULT_SETTINGS: Settings = {
  masterEnabled: false,
  searchTargets: [createDefaultSearchTarget(0)],
  minuteInterval: 5,
  activeDays: [false, true, true, true, true, true, false],
  timeWindow: { start: '00:00', end: '23:59' },
  notificationsEnabled: true,
  lastRunAt: null,
  lastRunStatus: null,
};

export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 6,
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
            payloadMode: 'v3',
            legacyCompatibilityEligible: false,
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
        return sanitizeSearchTarget(target, index);
      });

      return {
        ...base,
        searchTargets:
          searchTargets.length > 0 ? searchTargets : DEFAULT_SETTINGS.searchTargets,
      };
    },
    5: (old: Record<string, unknown>): Settings => {
      const base = old as unknown as Settings;
      const priorTargets = Array.isArray(base.searchTargets)
        ? base.searchTargets
        : DEFAULT_SETTINGS.searchTargets;

      const searchTargets = priorTargets.map((target, index) => {
        return sanitizeSearchTarget(target, index);
      });

      return {
        ...base,
        searchTargets:
          searchTargets.length > 0 ? searchTargets : DEFAULT_SETTINGS.searchTargets,
      };
    },
    6: (old: Record<string, unknown>): Settings => {
      const base = old as unknown as Settings;
      const priorTargets = Array.isArray(base.searchTargets)
        ? base.searchTargets
        : DEFAULT_SETTINGS.searchTargets;

      const searchTargets = priorTargets.map((target, index) => {
        return sanitizeSearchTarget(target, index);
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

export const legacyV1MigrationAppliedStorage = storage.defineItem<boolean>(
  'local:legacyV1MigrationApplied',
  {
    fallback: false,
  },
);

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
