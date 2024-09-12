import { addToActivityLog } from './activity_log.js';

export function sendNotification(newJobs, duration = 30000) {
  if (!chrome.notifications) {
    console.warn('chrome.notifications API not supported');
    return;
  }

  const notificationOptions = {
    type: 'basic',
    iconUrl: 'path/to/icon.png',
    title: 'New Jobs Found',
    message: `${newJobs.length} new job(s) found!`,
  };

  chrome.notifications.create(notificationOptions, (notificationId) => {
    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, duration);
  });

  addToActivityLog(`Sent notification for ${newJobs.length} new job(s)`);
}