export type ExtensionSettings = {
  searchUrl?: string
  webhookUrl?: string
  enabled?: boolean
}

const SETTINGS_KEY = 'upwork_v2_settings'

export async function getSettings(): Promise<ExtensionSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SETTINGS_KEY], (items: any) => {
      resolve(items[SETTINGS_KEY] || {})
    })
  })
}

export async function setSettings(settings: ExtensionSettings): Promise<void> {
  return new Promise((resolve) => {
  chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve())
  })
}
