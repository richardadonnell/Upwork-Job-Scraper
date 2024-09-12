import { selectedFeedSource, customSearchUrl, checkFrequency, webhookEnabled, jobScrapingEnabled, notificationsEnabled, newJobsCount, lastViewedTimestamp } from './extension_state.js';
import { updateAlarm } from './alarms.js';
import { updateBadge } from './badge.js';
import { sendTestError } from './test_error.js';
import { logAndReportError } from './error_handling.js';

export async function handleMessage(request, sender, sendResponse) {
  try {
    // Handle different message types
    switch (request.type) {
      case 'getSettings':
        sendResponse({
          selectedFeedSource,
          customSearchUrl,
          checkFrequency,
          webhookEnabled,
          jobScrapingEnabled,
          notificationsEnabled,
          newJobsCount,
          lastViewedTimestamp
        });
        break;
      case 'updateSettings':
        // Update settings based on the received data
        Object.assign(selectedFeedSource, request.settings.selectedFeedSource);
        Object.assign(customSearchUrl, request.settings.customSearchUrl);
        Object.assign(checkFrequency, request.settings.checkFrequency);
        Object.assign(webhookEnabled, request.settings.webhookEnabled);
        Object.assign(jobScrapingEnabled, request.settings.jobScrapingEnabled);
        Object.assign(notificationsEnabled, request.settings.notificationsEnabled);
        
        // Update alarm based on the new settings
        await updateAlarm();
        
        // Update badge
        updateBadge();
        
        sendResponse({ success: true });
        break;
      case 'sendTestError':
        await sendTestError();
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    logAndReportError('Error handling message', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Required to use sendResponse asynchronously
}