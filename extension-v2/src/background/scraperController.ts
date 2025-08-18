import { getSettings } from '../shared/storage'

export async function runManualScrape() {
  const settings = await getSettings()
  const searchUrl = settings.searchUrl || 'https://www.upwork.com/nx/search/jobs/?q=javascript&sort=recency'
  const tab = await chrome.tabs.create({ url: searchUrl, active: false })
  try {
    // inject the scraping function file as a script and then call the global
    await chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['src/content/dom-inject.ts'] })
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id! }, func: () => (window as any).__upworkScrape() })
    return res?.result
  } finally {
    if (tab.id) await chrome.tabs.remove(tab.id)
  }
}
