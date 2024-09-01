// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

// Function to check for new jobs
function checkForNewJobs() {
    addToActivityLog('Starting job check...');
    chrome.tabs.create({ url: "https://www.upwork.com/nx/find-work/most-recent", active: false }, (tab) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: scrapeJobs,
        }, (results) => {
            if (chrome.runtime.lastError) {
                addToActivityLog('Error: ' + chrome.runtime.lastError.message);
            } else if (results && results[0]) {
                const jobs = results[0].result;
                processJobs(jobs);
            }
            chrome.tabs.remove(tab.id);
        });
    });
}

let checkFrequency = 60; // Default to 1 minute

function updateAlarm() {
    chrome.alarms.clear("checkJobs");
    chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency / 60 });
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
chrome.runtime.onStartup.addListener(checkForNewJobs);
chrome.runtime.onInstalled.addListener(checkForNewJobs);

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
    const jobElements = document.querySelectorAll('[data-test="job-tile-list"] > section');
    const jobs = Array.from(jobElements).map(jobElement => {
        const titleElement = jobElement.querySelector('.job-tile-title a');
        const descriptionElement = jobElement.querySelector('[data-test="job-description-text"]');
        const budgetElement = jobElement.querySelector('[data-test="budget"]');
        const postedElement = jobElement.querySelector('[data-test="posted-on"]');
        const proposalsElement = jobElement.querySelector('[data-test="proposals"]');
        const clientCountryElement = jobElement.querySelector('[data-test="client-country"]');
        const paymentVerificationElement = jobElement.querySelector('[data-test="payment-verification-status"]');
        
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

    // Check if there's a "Load More" button and click it if present
    const loadMoreButton = document.querySelector('button[data-ev-label="load_more_button"]');
    if (loadMoreButton) {
        loadMoreButton.click();
        // Wait for new content to load and scrape again
        setTimeout(scrapeJobs, 2000);
    }

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
        addToActivityLog(`Check frequency updated to ${checkFrequency} seconds`);
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