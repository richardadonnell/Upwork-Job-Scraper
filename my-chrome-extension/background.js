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

// Set up alarm to check for new jobs every minute
chrome.alarms.create("checkJobs", { periodInMinutes: 1 });

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkJobs") {
        checkForNewJobs();
    }
});

// Run initial job check when extension is activated
chrome.runtime.onStartup.addListener(checkForNewJobs);
chrome.runtime.onInstalled.addListener(checkForNewJobs);

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
    chrome.storage.local.get('scrapedJobs', (data) => {
        let existingJobs = data.scrapedJobs || [];
        let updatedJobs = [];
        let newJobsCount = 0;

        // Sort new jobs by posted time, newest first
        newJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));

        newJobs.forEach(newJob => {
            if (!existingJobs.some(job => job.url === newJob.url)) {
                updatedJobs.push(newJob);
                newJobsCount++;
            }
        });

        // Combine new jobs with existing jobs, keeping the most recent ones
        let allJobs = [...updatedJobs, ...existingJobs];
        
        // Limit to a maximum of 100 jobs (or any other number you prefer)
        allJobs = allJobs.slice(0, 100);

        // Store the updated scraped jobs
        chrome.storage.local.set({ scrapedJobs: allJobs }, () => {
            addToActivityLog(`Added ${newJobsCount} new jobs. Total jobs: ${allJobs.length}`);
            
            // Send message to update the settings page if it's open
            chrome.runtime.sendMessage({ type: 'jobsUpdate', jobs: allJobs });

            chrome.storage.sync.get(['webhookUrl', 'notificationsEnabled'], (data) => {
                if (data.webhookUrl) {
                    sendToWebhook(data.webhookUrl, updatedJobs);
                } else if (data.notificationsEnabled && newJobsCount > 0) {
                    sendNotification(`Found ${newJobsCount} new job${newJobsCount > 1 ? 's' : ''}!`);
                } else {
                    addToActivityLog('Webhook URL not set and notifications disabled or no new jobs found.');
                }
            });
        });
    });
}

function sendToWebhook(url, data) {
    addToActivityLog(`Sending ${data.length} jobs to webhook...`);
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
            addToActivityLog('Jobs sent to webhook successfully!');
        }
    })
    .catch(error => {
        addToActivityLog('Error sending jobs to webhook. Check the console for details.');
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