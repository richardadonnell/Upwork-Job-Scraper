var addToActivityLog = function(message) {
  var timestamp = new Date().toLocaleString();
  var logEntry = "[" + timestamp + "] " + message;

  chrome.storage.local.get("activityLog", function(data) {
    var activityLog = data.activityLog || [];
    activityLog.push(logEntry);
    chrome.storage.local.set({ activityLog: activityLog });
  });
};

var sendToWebhook = function(newJobs) {
  var webhookUrl = 'https://your-webhook-url.com';

  if (!webhookUrl || !isValidUrl(webhookUrl)) {
    console.error('Invalid webhook URL');
    addToActivityLog('Failed to send jobs to webhook: Invalid URL');
    return;
  }

  var payload = {
    content: "Found " + newJobs.length + " new job(s)",
    embeds: newJobs.map(function(job) {
      return {
        title: job.title,
        url: job.url,
        description: job.description,
        // Add more job details as needed
      };
    }),
  };

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(function(response) {
      if (response.ok) {
        addToActivityLog("Successfully sent " + newJobs.length + " new job(s) to webhook");
      } else {
        throw new Error("Webhook request failed with status " + response.status);
      }
    })
    .catch(function(error) {
      console.error('Error sending webhook:', error);
      addToActivityLog("Failed to send " + newJobs.length + " new job(s) to webhook");
    });
};

var sendNotification = function(newJobs, duration) {
  if (!chrome.notifications) {
    console.warn('chrome.notifications API not supported');
    return;
  }

  var notificationOptions = {
    type: 'basic',
    iconUrl: 'path/to/icon.png',
    title: 'New Jobs Found',
    message: newJobs.length + " new job(s) found!",
  };

  chrome.notifications.create(notificationOptions, function(notificationId) {
    setTimeout(function() {
      chrome.notifications.clear(notificationId);
    }, duration || 30000);
  });

  addToActivityLog("Sent notification for " + newJobs.length + " new job(s)");
};

var updateBadge = function() {
  if (newJobsCount > 0) {
    chrome.action.setBadgeText({ text: newJobsCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#108a00' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
};

var jobScrapingEnabled = true;
var webhookEnabled = false;
var notificationsEnabled = true;
var newJobsCount = 0;
var lastViewedTimestamp = 0;
var scrapedJobs = [];

var processJobs = async function(newJobs) {
  try {
    if (newJobs.length > 0) {
      newJobsCount += newJobs.length;
      scrapedJobs = scrapedJobs.concat(newJobs);
      await chrome.storage.local.set({ scrapedJobs: scrapedJobs, newJobsCount: newJobsCount });
      updateBadge();

      if (webhookEnabled) {
        await sendToWebhook(newJobs);
      }

      if (notificationsEnabled) {
        await sendNotification(newJobs);
      }

      addToActivityLog("Found " + newJobs.length + " new job(s)");
    }
  } catch (error) {
    logAndReportError('Error processing jobs', error);
  }
};