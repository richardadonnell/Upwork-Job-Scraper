// Variables
let selectedFeedSource = 'most-recent';
let customSearchUrl = '';
let checkFrequency = 5;
let webhookEnabled = false;
let masterEnabled = true;
const ERROR_LOGGING_URL = 'https://hook.us1.make.com/nzeveapbb4wihpkc5xbixkx9sr397jfa';
const APP_VERSION = '1.9';
let newJobsCount = 0;

// Error logging function
function logAndReportError(context, error) {
    const errorInfo = {
        context,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        appVersion: APP_VERSION,
        userAgent: navigator.userAgent
    };
    console.error('Error logged:', errorInfo);
    fetch(ERROR_LOGGING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errorInfo }),
    }).then(response => response.json())
      .then(result => console.log('Error report sent:', result))
      .catch(error => console.error('Failed to send error report:', error));
}

// Add to activity log function
function addToActivityLog(message) {
    const logEntry = `${new Date().toLocaleString()}: ${message}`;
    console.log(logEntry);

    chrome.storage.local.get('activityLog', (data) => {
        const log = data.activityLog || [];
        log.unshift(logEntry);
        if (log.length > 100) log.pop();
        chrome.storage.local.set({ activityLog: log });
    });

    chrome.runtime.sendMessage({ type: 'logUpdate', content: logEntry }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("Settings page not available for log update");
        }
    });
}

// Update alarm
function updateAlarm() {
    chrome.alarms.clear("checkJobs");
    chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
}

// Check for new jobs
async function checkForNewJobs() {
    try {
        await loadFeedSourceSettings();
        await checkForNewVersion();
        if (!masterEnabled) {
            addToActivityLog('Extension is disabled. Skipping job check.');
            return;
        }
        addToActivityLog('Starting job check...');
        const url = (selectedFeedSource === 'custom-search' && customSearchUrl) ? customSearchUrl : "https://www.upwork.com/nx/find-work/most-recent";
        chrome.tabs.create({ url, active: false }, (tab) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: scrapeJobs,
            }, (results) => {
                if (chrome.runtime.lastError) {
                    addToActivityLog('Error: ' + chrome.runtime.lastError.message);
                } else if (results && results[0]) {
                    const jobs = results[0].result;
                    addToActivityLog(`Scraped ${jobs.length} jobs from ${url}`);
                    processJobs(jobs);
                } else {
                    addToActivityLog('No jobs scraped or unexpected result');
                }
                chrome.tabs.remove(tab.id);
                addToActivityLog('Job check completed for ' + url);
            });
        });
    } catch (error) {
        logAndReportError('Error in checkForNewJobs', error);
    }
}

// Process jobs
function processJobs(newJobs) {
    try {
        if (!masterEnabled) {
            addToActivityLog('Extension is disabled. Skipping job processing.');
            return;
        }
        chrome.storage.local.get(['scrapedJobs', 'lastViewedTimestamp'], (data) => {
            let existingJobs = data.scrapedJobs || [];
            let updatedJobs = [];
            let addedJobsCount = 0;
            newJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
            newJobs.forEach(newJob => {
                if (!existingJobs.some(job => job.url === newJob.url)) {
                    updatedJobs.push(newJob);
                    addedJobsCount++;
                    if (!data.lastViewedTimestamp || newJob.scrapedAt > data.lastViewedTimestamp) {
                        newJobsCount++;
                    }
                    if (webhookEnabled && webhookUrl) {
                        sendToWebhook(webhookUrl, [newJob]);
                    }
                }
            });
            let allJobs = [...updatedJobs, ...existingJobs].slice(0, 100);
            chrome.storage.local.set({ scrapedJobs: allJobs }, () => {
                addToActivityLog(`Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`);
                updateBadge();
                chrome.runtime.sendMessage({ type: 'jobsUpdate', jobs: allJobs });
                chrome.storage.sync.get('notificationsEnabled', (data) => {
                    if (data.notificationsEnabled && addedJobsCount > 0) {
                        sendNotification(`Found ${addedJobsCount} new job${addedJobsCount > 1 ? 's' : ''}!`);
                    }
                });
            });
        });
    } catch (error) {
        logAndReportError('Error in processJobs', error);
    }
}

// Update badge
function updateBadge() {
    chrome.action.setBadgeText({ text: newJobsCount > 0 ? newJobsCount.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

// Load feed source settings
function loadFeedSourceSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl', 'webhookUrl', 'webhookEnabled'], (data) => {
            selectedFeedSource = data.selectedFeedSource || 'most-recent';
            customSearchUrl = data.customSearchUrl || '';
            webhookUrl = data.webhookUrl || '';
            webhookEnabled = data.webhookEnabled || false;
            if (customSearchUrl) {
                selectedFeedSource = 'custom-search';
            }
            resolve();
        });
    });
}

// Check for new version
async function checkForNewVersion() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/warezit/Upwork-Job-Scraper/main/upwork-job-scraper/manifest.json');
        if (!response.ok) throw new Error('Failed to fetch manifest from GitHub');
        const githubManifest = await response.json();
        const githubVersion = githubManifest.version;
        const currentVersion = chrome.runtime.getManifest().version;
        if (githubVersion !== currentVersion) {
            chrome.storage.local.set({ newVersionAvailable: true });
            addToActivityLog('New version available. Visit GitHub to download the latest version.');
        } else {
            chrome.storage.local.set({ newVersionAvailable: false });
        }
    } catch (error) {
        logAndReportError('Error checking for new version', error);
    }
}

// Event listeners
chrome.action.onClicked.addListener(() => {
    try {
        chrome.runtime.openOptionsPage();
    } catch (error) {
        logAndReportError('Error opening options page', error);
    }
});

chrome.storage.sync.get('checkFrequency', (data) => {
    checkFrequency = data.checkFrequency || checkFrequency;
    if (!data.checkFrequency) {
        chrome.storage.sync.set({ checkFrequency });
    }
    updateAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkJobs") {
        checkForNewJobs();
    }
});

chrome.runtime.onStartup.addListener(() => {
    checkForNewJobs();
    loadFeedSourceSettings();
});

chrome.runtime.onInstalled.addListener(() => {
    checkForNewJobs();
    loadFeedSourceSettings();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let handled = false;
    try {
        switch (message.type) {
            case 'settingsPageOpened':
                newJobsCount = 0;
                updateBadge();
                chrome.storage.local.set({ lastViewedTimestamp: Date.now() });
                handled = true;
                break;
            case 'updateCheckFrequency':
                checkFrequency = message.frequency;
                updateAlarm();
                addToActivityLog(`Check frequency updated to ${checkFrequency} minute(s)`);
                handled = true;
                break;
            case 'updateFeedSources':
            case 'updateWebhookSettings':
                loadFeedSourceSettings().then(() => sendResponse({ success: true }));
                return true;
            case 'manualScrape':
                if (masterEnabled) {
                    checkForNewJobs().then(() => sendResponse({ success: true }));
                } else {
                    addToActivityLog('Extension is disabled. Manual scrape not performed.');
                    sendResponse({ success: false, reason: 'Extension is disabled' });
                }
                return true;
            case 'ping':
                sendResponse({ status: 'ready' });
                return false;
            case 'updateMasterToggle':
                masterEnabled = message.enabled;
                addToActivityLog(`Extension ${masterEnabled ? 'enabled' : 'disabled'} (all features)`);
                if (masterEnabled) {
                    updateAlarm();
                } else {
                    chrome.alarms.clear("checkJobs");
                }
                handled = true;
                break;
            case 'checkForNewVersion':
                checkForNewVersion().then(() => sendResponse({ success: true })).catch(error => sendResponse({ success: false, error: error.message }));
                return true;
        }
        if (handled) {
            sendResponse({ success: true });
        }
    } catch (error) {
        logAndReportError('Error in message listener', error);
        sendResponse({ error: 'An error occurred' });
    }
    return handled;
});

// Webhook and notification functions
function sendToWebhook(url, data) {
    if (!masterEnabled || !webhookEnabled) return;
    addToActivityLog(`Sending job to webhook...`);
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Change this from response.json() to response.text()
    })
    .then(result => {
        addToActivityLog(`Job sent to webhook successfully! Response: ${result}`);
    })
    .catch(error => {
        logAndReportError('Error in sendToWebhook', error);
        addToActivityLog(`Error sending job to webhook: ${error.message}`);
    });
}

function sendNotification(message) {
    if (!masterEnabled) return;
    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon48.png'),
        title: 'Upwork Job Scraper',
        message
    });
}

// Expose test error function
globalThis.sendTestError = function(customMessage = "This is a test error") {
    const testError = new Error(customMessage);
    logAndReportError('Test Error', testError);
    console.log('Test error sent. Check the webhook for the report.');
};

// Scrape jobs function
function scrapeJobs() {
    let jobElements;
    if (window.location.href.includes("find-work/most-recent")) {
        jobElements = document.querySelectorAll('[data-test="job-tile-list"] > section');
    } else {
        jobElements = document.querySelectorAll('.job-tile');
    }
    
    const jobs = Array.from(jobElements).map(jobElement => {
        let titleElement, descriptionElement, budgetElement, postedElement, proposalsElement, clientCountryElement, paymentVerificationElement;
        let jobType, experienceLevel, duration, estimatedBudget;

        if (window.location.href.includes("find-work/most-recent")) {
            titleElement = jobElement.querySelector('.job-tile-title a');
            descriptionElement = jobElement.querySelector('[data-test="job-description-text"]');
            budgetElement = jobElement.querySelector('[data-test="budget"]');
            postedElement = jobElement.querySelector('[data-test="posted-on"]');
            proposalsElement = jobElement.querySelector('[data-test="proposals"]');
            clientCountryElement = jobElement.querySelector('[data-test="client-country"]');
            paymentVerificationElement = jobElement.querySelector('[data-test="payment-verification-status"]');
        } else {
            titleElement = jobElement.querySelector('.job-tile-title a');
            descriptionElement = jobElement.querySelector('.mb-0.text-body-sm');
            budgetElement = jobElement.querySelector('ul.job-tile-info-list li[data-test="job-type-label"] strong');
            postedElement = jobElement.querySelector('small[data-test="job-pubilshed-date"] span:last-child');
            proposalsElement = jobElement.querySelector('li[data-test="proposals-tier"]');
            clientCountryElement = jobElement.querySelector('li[data-test="location"] .air3-badge-tagline');
            paymentVerificationElement = jobElement.querySelector('li[data-test="payment-verified"]');

            // Additional elements for custom URL
            jobType = jobElement.querySelector('ul.job-tile-info-list li[data-test="job-type-label"] strong');
            experienceLevel = jobElement.querySelector('ul.job-tile-info-list li[data-test="experience-level"] strong');
            duration = jobElement.querySelector('ul.job-tile-info-list li[data-test="duration-label"] strong');
            estimatedBudget = jobElement.querySelector('ul.job-tile-info-list li[data-test="is-fixed-price"] strong');
        }
        
        return {
            title: titleElement ? titleElement.textContent.trim() : '',
            url: titleElement ? titleElement.href : '',
            description: descriptionElement ? descriptionElement.textContent.trim() : '',
            budget: budgetElement ? budgetElement.textContent.trim() : '',
            posted: postedElement ? postedElement.textContent.trim() : '',
            proposals: proposalsElement ? proposalsElement.textContent.trim() : '',
            clientCountry: clientCountryElement ? clientCountryElement.textContent.trim() : '',
            paymentVerified: paymentVerificationElement ? 
                paymentVerificationElement.textContent.includes('Payment verified') : false,
            jobType: jobType ? jobType.textContent.trim() : '',
            experienceLevel: experienceLevel ? experienceLevel.textContent.trim() : '',
            duration: duration ? duration.textContent.trim() : '',
            estimatedBudget: estimatedBudget ? estimatedBudget.textContent.trim() : '',
            scrapedAt: Date.now()
        };
    });

    return jobs;
}