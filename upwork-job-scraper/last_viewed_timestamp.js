import { lastViewedTimestamp } from './extension_state.js';

export function initializeLastViewedTimestamp() {
  chrome.storage.local.get('lastViewedTimestamp', (data) => {
    if (data.lastViewedTimestamp) {
      lastViewedTimestamp = data.lastViewedTimestamp;
    } else {
      lastViewedTimestamp = Date.now();
      chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });
    }
  });
}