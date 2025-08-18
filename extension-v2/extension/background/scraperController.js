import { getSettings } from '../shared/storage.js';
export async function runManualScrape() {
    const settings = await getSettings();
    const searchUrl = settings.searchUrl || 'https://www.upwork.com/nx/search/jobs/?q=javascript&sort=recency';
    const tab = await chrome.tabs.create({ url: searchUrl, active: false });
    try {
        // inject the compiled scraping function file from the built `dist/` output and then call the global
        // Use the packaged .js path so the runtime can fetch it after building.
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['dist/src/content/dom-inject.js'] });
        const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => window.__upworkScrape() });
        return res?.result;
    }
    finally {
        if (tab.id)
            await chrome.tabs.remove(tab.id);
    }
}
