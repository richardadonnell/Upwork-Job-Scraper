/**
 * Default settings for new installations
 */
export const DEFAULT_SETTINGS = {
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
};
const SETTINGS_KEY = 'upwork_v2_settings';
export async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([SETTINGS_KEY], (items) => {
            const stored = items[SETTINGS_KEY] || {};
            // Merge stored settings with defaults to ensure all fields exist
            resolve({ ...DEFAULT_SETTINGS, ...stored });
        });
    });
}
export async function setSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve());
    });
}
