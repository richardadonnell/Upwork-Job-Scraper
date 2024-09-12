import { newJobsCount } from './extension_state.js';

export function updateBadge() {
  if (newJobsCount > 0) {
    chrome.action.setBadgeText({ text: newJobsCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#108a00' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}