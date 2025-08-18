import { runManualScrape } from './scraperController';
console.log('Background worker loaded (v2)');
// Open settings page in a new tab when the toolbar icon is clicked
chrome.action.onClicked.addListener(() => {
    const settingsUrl = chrome.runtime.getURL('dist/src/ui/main.html');
    chrome.tabs.create({ url: settingsUrl });
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === 'manualScrape') {
        console.log('manualScrape received');
        runManualScrape()
            .then((result) => sendResponse({ ok: true, result }))
            .catch((err) => sendResponse({ ok: false, error: String(err) }));
        // return true to indicate async response
        return true;
    }
});
