import { runScrape, setupAlarm } from '../utils/scraper';

import type { MessageType } from '../utils/types';

export default defineBackground(() => {
  // Open options page on toolbar click
  browser.action.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
  });

  // Set up alarm on install/update
  browser.runtime.onInstalled.addListener(() => {
    setupAlarm();
  });

  // Fire scrape on alarm
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'upwork-scrape') {
      runScrape();
    }
  });

  // Handle messages from options page
  browser.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
    if (message.type === 'manualScrape') {
      runScrape({ manual: true }).then(() => sendResponse({ ok: true })).catch((err) => {
        sendResponse({ ok: false, error: String(err) });
      });
      return true; // keep message channel open for async response
    }

    if (message.type === 'settingsUpdated') {
      setupAlarm().then(() => sendResponse({ ok: true }));
      return true;
    }
  });
});
