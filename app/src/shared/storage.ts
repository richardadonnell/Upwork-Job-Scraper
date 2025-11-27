/**
 * Feed source options for job scraping
 * - 'recent': Scrape from Upwork's "Most Recent Jobs" feed
 * - 'custom': Scrape from a user-defined search URL
 */
export type FeedSource = 'recent' | 'custom'

/**
 * Check frequency configuration
 * Total interval = (days * 1440) + (hours * 60) + minutes (in minutes)
 */
export type CheckFrequency = {
  days: number
  hours: number
  minutes: number
}

/**
 * Complete extension settings type
 * All fields are optional to support partial updates and migrations
 */
export type ExtensionSettings = {
  // === Core Toggle ===
  /** Master toggle to enable/disable all extension functionality */
  masterEnabled?: boolean

  // === Feed Source Configuration ===
  /** Which feed source to scrape from */
  feedSource?: FeedSource
  /** Custom Upwork search URL (used when feedSource is 'custom') */
  searchUrl?: string

  // === Scheduling ===
  /** How often to check for new jobs */
  checkFrequency?: CheckFrequency
  /** ISO timestamp of the last successful scrape */
  lastCheckTime?: string
  /** ISO timestamp of when the next check is scheduled */
  nextCheckTime?: string

  // === Webhook Configuration ===
  /** Toggle to enable/disable webhook sending */
  webhookEnabled?: boolean
  /** URL to send scraped jobs to */
  webhookUrl?: string

  // === Notifications ===
  /** Toggle to enable/disable browser push notifications */
  notificationsEnabled?: boolean

  // === Badge/UI State ===
  /** Timestamp of when user last viewed the jobs (for badge calculation) */
  lastViewedAt?: string
}

/**
 * Default settings for new installations
 */
export const DEFAULT_SETTINGS: ExtensionSettings = {
  masterEnabled: false,
  feedSource: 'recent',
  searchUrl: '',
  checkFrequency: { days: 0, hours: 1, minutes: 0 }, // Default: check every hour
  lastCheckTime: undefined,
  nextCheckTime: undefined,
  webhookEnabled: false,
  webhookUrl: '',
  notificationsEnabled: true,
  lastViewedAt: undefined,
}

const SETTINGS_KEY = 'upwork_v2_settings'

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SETTINGS_KEY], (items: Record<string, unknown>) => {
      const stored = (items[SETTINGS_KEY] as ExtensionSettings) || {}
      // Merge stored settings with defaults to ensure all fields exist
      resolve({ ...DEFAULT_SETTINGS, ...stored })
    })
  })
}

export async function setSettings(settings: ExtensionSettings): Promise<void> {
  return new Promise((resolve) => {
  chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve())
  })
}
