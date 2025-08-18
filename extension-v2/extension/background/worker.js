console.log('Background worker loaded (v2)');
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === 'manualScrape') {
        console.log('manualScrape received');
        import('./scraperController.js')
            .then((m) => m.runManualScrape())
            .then((result) => sendResponse({ ok: true, result }))
            .catch((err) => sendResponse({ ok: false, error: String(err) }));
        // return true to indicate async response
        return true;
    }
});
