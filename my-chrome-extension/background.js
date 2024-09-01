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
    return Array.from(jobElements).map(jobElement => {
        const titleElement = jobElement.querySelector('.job-tile-title a');
        const descriptionElement = jobElement.querySelector('[data-test="job-description-text"]');
        const budgetElement = jobElement.querySelector('[data-test="budget"]');
        const postedElement = jobElement.querySelector('[data-test="posted-on"]');
        const proposalsElement = jobElement.querySelector('[data-test="proposals"]');
        const clientCountryElement = jobElement.querySelector('[data-test="client-country"]');
        
        return {
            title: titleElement ? titleElement.textContent.trim() : '',
            url: titleElement ? titleElement.href : '',
            description: descriptionElement ? descriptionElement.textContent.trim() : '',
            budget: budgetElement ? budgetElement.textContent.trim() : '',
            posted: postedElement ? postedElement.textContent.trim() : '',
            proposals: proposalsElement ? proposalsElement.textContent.trim() : '',
            clientCountry: clientCountryElement ? clientCountryElement.textContent.trim() : ''
        };
    });
}

function processJobs(newJobs) {
    addToActivityLog(`Found ${newJobs.length} jobs`);

    chrome.storage.local.get('scrapedJobs', (data) => {
        let existingJobs = data.scrapedJobs || [];
        let updatedJobs = [];
        let newJobsCount = 0;

        newJobs.forEach(newJob => {
            if (!existingJobs.some(job => job.url === newJob.url)) {
                updatedJobs.push(newJob);
                newJobsCount++;
            }
        });

        // Combine existing jobs with new unique jobs
        let allJobs = [...updatedJobs, ...existingJobs];

        // Store the updated scraped jobs
        chrome.storage.local.set({ scrapedJobs: allJobs }, () => {
            addToActivityLog(`Added ${newJobsCount} new jobs. Total jobs: ${allJobs.length}`);
            
            // Send message to update the settings page if it's open
            chrome.runtime.sendMessage({ type: 'jobsUpdate', jobs: allJobs });

            chrome.storage.sync.get('webhookUrl', (data) => {
                if (data.webhookUrl) {
                    sendToWebhook(data.webhookUrl, updatedJobs);
                } else {
                    addToActivityLog('Webhook URL not set. Please set it in the extension settings.');
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
    .then(response => response.json())
    .then(result => {
        addToActivityLog('Jobs sent to webhook successfully!');
    })
    .catch(error => {
        addToActivityLog('Error sending jobs to webhook. Check the console for details.');
        console.error('Error:', error);
    });
}