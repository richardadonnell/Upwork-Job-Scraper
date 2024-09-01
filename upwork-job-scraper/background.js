// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

// Add these variables at the top of the file
let selectedFeedSource = 'most-recent';
let customSearchUrl = '';
let checkFrequency = 1; // Default to 1 minute

function updateAlarm() {
    chrome.alarms.clear("checkJobs");
    chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
}

// Function to check for new jobs
function checkForNewJobs() {
    addToActivityLog('Starting job check...');
    
    let url;
    if (selectedFeedSource === 'most-recent') {
        url = "https://www.upwork.com/nx/find-work/most-recent";
    } else if (selectedFeedSource === 'custom-search' && customSearchUrl) {
        url = customSearchUrl;
    } else {
        addToActivityLog('No valid feed source selected');
        return;
    }

    chrome.tabs.create({ url: url, active: false }, (tab) => {
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
}

// Load saved check frequency when the extension starts
chrome.storage.sync.get('checkFrequency', (data) => {
    if (data.checkFrequency) {
        checkFrequency = data.checkFrequency;
    }
    updateAlarm();
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkJobs") {
        checkForNewJobs();
    }
});

// Run initial job check when extension is activated
chrome.runtime.onStartup.addListener(() => {
    loadFeedSourceSettings();
    checkForNewJobs();
});
chrome.runtime.onInstalled.addListener(() => {
    loadFeedSourceSettings();
    checkForNewJobs();
});

let newJobsCount = 0;

function addToActivityLog(message) {
    const logEntry = `${new Date().toLocaleString()}: ${message}`;
    console.log(logEntry); // Log to console for debugging

    chrome.storage.local.get('activityLog', (data) => {
        const log = data.activityLog || [];
        log.unshift(logEntry);
        // Keep only the last 100 entries
        if (log.length > 100) log.pop();
        chrome.storage.local.set({ activityLog: log });
    });

    // Send message to update the settings page if it's open
    chrome.runtime.sendMessage({ type: 'logUpdate', content: logEntry });
}

function scrapeJobs() {
    let jobElements;
    if (window.location.href.includes("find-work/most-recent")) {
        jobElements = document.querySelectorAll('[data-test="job-tile-list"] > section');
    } else {
        jobElements = document.querySelectorAll('.job-tile');
    }
    
    const jobs = Array.from(jobElements).map(jobElement => {
        let titleElement, descriptionElement, budgetElement, postedElement, proposalsElement, clientCountryElement, paymentVerificationElement;
        
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
            budgetElement = jobElement.querySelector('.text-base-sm.mb-4 li:nth-child(3)');
            postedElement = jobElement.querySelector('small[data-test="job-pubilshed-date"] span:last-child');
            proposalsElement = jobElement.querySelector('li[data-test="proposals-tier"]');
            clientCountryElement = jobElement.querySelector('li[data-test="location"] .air3-badge-tagline');
            paymentVerificationElement = jobElement.querySelector('li[data-test="payment-verified"]');
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
            scrapedAt: Date.now()
        };
    });

    return jobs;
}

function processJobs(newJobs) {
    chrome.storage.local.get(['scrapedJobs', 'lastViewedTimestamp'], (data) => {
        let existingJobs = data.scrapedJobs || [];
        let updatedJobs = [];
        let addedJobsCount = 0;

        // Sort new jobs by posted time, newest first
        newJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));

        newJobs.forEach(newJob => {
            if (!existingJobs.some(job => job.url === newJob.url)) {
                updatedJobs.push(newJob);
                addedJobsCount++;
                
                // Increment newJobsCount if the job was scraped after the last viewed timestamp
                if (!data.lastViewedTimestamp || newJob.scrapedAt > data.lastViewedTimestamp) {
                    newJobsCount++;
                }

                // Send each new job individually to the webhook
                chrome.storage.sync.get('webhookUrl', (data) => {
                    if (data.webhookUrl) {
                        sendToWebhook(data.webhookUrl, [newJob]);
                    }
                });
            }
        });

        // Combine new jobs with existing jobs, keeping the most recent ones
        let allJobs = [...updatedJobs, ...existingJobs];
        
        // Limit to a maximum of 100 jobs (or any other number you prefer)
        allJobs = allJobs.slice(0, 100);

        // Store the updated scraped jobs
        chrome.storage.local.set({ scrapedJobs: allJobs }, () => {
            addToActivityLog(`Added ${addedJobsCount} new jobs. Total jobs: ${allJobs.length}`);
            
            // Update the badge
            updateBadge();

            // Send message to update the settings page if it's open
            chrome.runtime.sendMessage({ type: 'jobsUpdate', jobs: allJobs });

            chrome.storage.sync.get('notificationsEnabled', (data) => {
                if (data.notificationsEnabled && addedJobsCount > 0) {
                    sendNotification(`Found ${addedJobsCount} new job${addedJobsCount > 1 ? 's' : ''}!`);
                }
            });
        });
    });
}

function updateBadge() {
    if (newJobsCount > 0) {
        chrome.action.setBadgeText({text: newJobsCount.toString()});
        chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
    } else {
        chrome.action.setBadgeText({text: ''});
    }
}

// Reset the newJobsCount when the settings page is opened
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsPageOpened') {
        newJobsCount = 0;
        updateBadge();
        
        // Update the last viewed timestamp
        chrome.storage.local.set({ lastViewedTimestamp: Date.now() });
    } else if (message.type === 'updateCheckFrequency') {
        checkFrequency = message.frequency;
        updateAlarm();
        addToActivityLog(`Check frequency updated to ${checkFrequency} minute(s)`);
    } else if (message.type === 'updateFeedSources') {
        loadFeedSourceSettings();
    }
});

function sendToWebhook(url, data) {
    addToActivityLog(`Sending job to webhook...`);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.headers.get("content-type")?.includes("application/json")) {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then(result => {
        if (typeof result === 'string') {
            addToActivityLog(`Webhook response: ${result}`);
        } else {
            addToActivityLog('Job sent to webhook successfully!');
        }
    })
    .catch(error => {
        addToActivityLog('Error sending job to webhook. Check the console for details.');
        console.error('Error:', error);
    });
}

function sendNotification(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon48.png'),
        title: 'Upwork Job Scraper',
        message: message
    }, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error("Notification error: ", chrome.runtime.lastError.message);
        }
    });
}

// Add this function to load feed source settings
function loadFeedSourceSettings() {
    chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl'], (data) => {
        selectedFeedSource = data.selectedFeedSource || 'most-recent';
        customSearchUrl = data.customSearchUrl || '';
    });
}

// Call this function when the extension starts
chrome.runtime.onStartup.addListener(loadFeedSourceSettings);
chrome.runtime.onInstalled.addListener(loadFeedSourceSettings);

// Add this message listener to handle feed source updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateFeedSources') {
        loadFeedSourceSettings();
    }
    // ... existing message handlers ...
});