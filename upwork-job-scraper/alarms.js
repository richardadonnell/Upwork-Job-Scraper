import { checkFrequency, jobScrapingEnabled } from './extension_state.js';
import { checkForNewJobs } from './job_scraping.js';

export function updateAlarm() {
  chrome.alarms.clear("checkJobs");

  if (jobScrapingEnabled) {
    chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
    checkForNewJobs();
  }
}