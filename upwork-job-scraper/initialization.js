var addToActivityLog = function(message) {
  var timestamp = new Date().toLocaleString();
  var logEntry = "[" + timestamp + "] " + message;

  chrome.storage.local.get("activityLog", function(data) {
    var activityLog = data.activityLog || [];
    activityLog.push(logEntry);
    chrome.storage.local.set({ activityLog: activityLog });
  });
};

var updateAlarm = function() {
  chrome.alarms.clear("checkJobs");

  if (jobScrapingEnabled) {
    chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
    checkForNewJobs();
  }
};

var loadFeedSourceSettings = function() {
  chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl'], function(result) {
    selectedFeedSource = result.selectedFeedSource || 'default';
    customSearchUrl = result.customSearchUrl || '';
  });
};

var initializeLastViewedTimestamp = function() {
  chrome.storage.local.get('lastViewedTimestamp', function(data) {
    if (data.lastViewedTimestamp) {
      lastViewedTimestamp = data.lastViewedTimestamp;
    } else {
      lastViewedTimestamp = Date.now();
      chrome.storage.local.set({ lastViewedTimestamp: lastViewedTimestamp });
    }
  });
};

var jobScrapingEnabled = true;
var updateBadge = function() {
  if (newJobsCount > 0) {
    chrome.action.setBadgeText({ text: newJobsCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#108a00' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
};

var scrapedJobs = [];
var newJobsCount = 0;

var initializeStorageListeners = function() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      if (changes.selectedFeedSource) {
        selectedFeedSource = changes.selectedFeedSource.newValue;
      }
      if (changes.customSearchUrl) {
        customSearchUrl = changes.customSearchUrl.newValue;
      }
      if (changes.checkFrequency) {
        checkFrequency = changes.checkFrequency.newValue;
        updateAlarm();
      }
      if (changes.webhookEnabled) {
        webhookEnabled = changes.webhookEnabled.newValue;
      }
      if (changes.jobScrapingEnabled) {
        jobScrapingEnabled = changes.jobScrapingEnabled.newValue;
        updateAlarm();
      }
      if (changes.notificationsEnabled) {
        notificationsEnabled = changes.notificationsEnabled.newValue;
      }
    } else if (namespace === 'local') {
      if (changes.scrapedJobs) {
        scrapedJobs = changes.scrapedJobs.newValue;
      }
      if (changes.newJobsCount) {
        newJobsCount = changes.newJobsCount.newValue;
        updateBadge();
      }
      if (changes.lastViewedTimestamp) {
        lastViewedTimestamp = changes.lastViewedTimestamp.newValue;
      }
    }
  });
};

var initializeExtension = async function() {
  try {
    addToActivityLog("Extension initialized");
    loadFeedSourceSettings();
    initializeLastViewedTimestamp();
    updateBadge();

    chrome.storage.local.get(['scrapedJobs', 'newJobsCount'], function(data) {
      if (data.scrapedJobs) {
        scrapedJobs = data.scrapedJobs;
      }
      if (data.newJobsCount) {
        newJobsCount = data.newJobsCount;
      }
    });

    chrome.storage.sync.get('checkFrequency', function(data) {
      if (!data.checkFrequency) {
        chrome.storage.sync.set({ checkFrequency: 5 });
      }
    });

    initializeStorageListeners();
  } catch (error) {
    logAndReportError('Error initializing extension', error);
  }
};

// Initialize the extension
try {
  initializeExtension();
  console.log('Extension initialized successfully');
} catch (error) {
  logAndReportError("Error initializing extension", error);
}

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(function() {
  try {
    chrome.tabs.create({ url: 'settings.html' });
  } catch (error) {
    logAndReportError("Error opening settings page", error);
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener(function(alarm) {
  try {
    if (alarm.name === "checkJobs" && jobScrapingEnabled) {
      checkForNewJobs();
    }
  } catch (error) {
    logAndReportError("Error in onAlarm listener", error);
  }
});

// Handle messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'setCustomSearchURL') {
    customSearchUrl = request.url;
    sendResponse({ success: true });
  } else {
    handleMessage(request, sender, sendResponse);
  }
});

// Expose sendTestError for debugging
self.sendTestError = sendTestError;

// Initialize Sentry only if running in the background context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
  try {
    // Check if window is defined before initializing Sentry
    if (typeof window !== 'undefined') {
      initializeSentry();
      console.log('Sentry initialized successfully');
    } else {
      console.warn('window is not defined, skipping Sentry initialization');
    }
  } catch (error) {
    console.error('Error initializing Sentry:', error);
    logAndReportError("Error initializing Sentry", error);
  }
}

function scrapeJobs() {
  // ... scrapeJobs function code ...
}

// Initialize Sentry
initializeSentry();

// Example usage
try {
  // Your code
} catch (error) {
  logAndReportError("Error in background script", error);
}