import { selectedFeedSource, customSearchUrl, webhookEnabled } from './extension_state.js';

export function loadFeedSourceSettings() {
  chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl'], (result) => {
    selectedFeedSource = result.selectedFeedSource || 'default';
    customSearchUrl = result.customSearchUrl || '';
  });
}