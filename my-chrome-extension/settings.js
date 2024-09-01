document.getElementById('save').addEventListener('click', () => {
    const webhookUrl = document.getElementById('webhook-url').value;
    chrome.storage.sync.set({ webhookUrl: webhookUrl }, () => {
        console.log('Webhook URL saved');
        addLogEntry('Webhook URL saved');
    });
});

// Load saved webhook URL when the page opens
chrome.storage.sync.get('webhookUrl', (data) => {
    if (data.webhookUrl) {
        document.getElementById('webhook-url').value = data.webhookUrl;
    }
});

// Function to add log entries
function addLogEntry(message) {
    const logContainer = document.getElementById('log-container');
    const logEntry = document.createElement('p');
    logEntry.textContent = `${new Date().toLocaleString()}: ${message}`;
    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

// Load existing log entries
chrome.storage.local.get('activityLog', (data) => {
    if (data.activityLog) {
        data.activityLog.forEach(entry => addLogEntry(entry));
    }
});

// Function to add job entries
function addJobEntries(jobs) {
    const jobsContainer = document.getElementById('jobs-container');
    jobsContainer.innerHTML = ''; // Clear existing jobs

    jobs.forEach((job, index) => {
        const jobItem = document.createElement('div');
        jobItem.className = 'job-item';

        const jobTitle = document.createElement('div');
        jobTitle.className = 'job-title';
        jobTitle.textContent = `${job.title} (${job.posted})`;
        jobTitle.onclick = () => toggleJobDetails(index);

        const jobDetails = document.createElement('div');
        jobDetails.className = 'job-details';
        jobDetails.id = `job-details-${index}`;
        jobDetails.innerHTML = `
            <p><strong>URL:</strong> <a href="${job.url}" target="_blank">${job.url}</a></p>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Budget:</strong> ${job.budget}</p>
            <p><strong>Proposals:</strong> ${job.proposals}</p>
            <p><strong>Client Country:</strong> ${job.clientCountry}</p>
        `;

        jobItem.appendChild(jobTitle);
        jobItem.appendChild(jobDetails);
        jobsContainer.appendChild(jobItem);
    });
}

function toggleJobDetails(index) {
    const details = document.getElementById(`job-details-${index}`);
    if (details.style.display === 'block') {
        details.style.display = 'none';
    } else {
        details.style.display = 'block';
    }
}

// Load existing scraped jobs
chrome.storage.local.get('scrapedJobs', (data) => {
    if (data.scrapedJobs) {
        addJobEntries(data.scrapedJobs);
    }
});

// Listen for log updates and job updates from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'logUpdate') {
        addLogEntry(message.content);
    } else if (message.type === 'jobsUpdate') {
        addJobEntries(message.jobs);
    }
});