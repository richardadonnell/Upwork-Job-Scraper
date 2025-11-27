export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['upwork_v2_settings'], (items) => {
      resolve(items['upwork_v2_settings'] || {})
    })
  })
}

export async function setSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ upwork_v2_settings: settings }, () => resolve())
  })
}
