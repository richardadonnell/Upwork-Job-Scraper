const SETTINGS_KEY = 'upwork_v2_settings';
export async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([SETTINGS_KEY], (items) => {
            resolve(items[SETTINGS_KEY] || {});
        });
    });
}
export async function setSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve());
    });
}
