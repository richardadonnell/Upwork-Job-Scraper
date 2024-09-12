import { checkFrequency, webhookEnabled } from './extension_state.js';
import { updateAlarm } from './alarms.js';

export function initializeStorageListeners() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      if (changes.checkFrequency) {
        checkFrequency = changes.checkFrequency.newValue;
        updateAlarm();
      }
      if (changes.webhookEnabled) {
        webhookEnabled = changes.webhookEnabled.newValue;
      }
    }
  });
}