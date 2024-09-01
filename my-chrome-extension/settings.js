chrome.runtime.sendMessage({ type: 'settingsPageOpened' });

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

// Load saved notification setting when the page opens
chrome.storage.sync.get('notificationsEnabled', (data) => {
    const notificationToggle = document.getElementById('notification-toggle');
    if (data.notificationsEnabled === undefined) {
        // Default to enabled if not set
        notificationToggle.checked = true;
        chrome.storage.sync.set({ notificationsEnabled: true });
    } else {
        notificationToggle.checked = data.notificationsEnabled;
    }
});

// Save notification setting when toggled
document.getElementById('notification-toggle').addEventListener('change', (event) => {
    const isEnabled = event.target.checked;
    chrome.storage.sync.set({ notificationsEnabled: isEnabled }, () => {
        console.log('Notification setting saved:', isEnabled);
        addLogEntry(`Notifications ${isEnabled ? 'enabled' : 'disabled'}`);
    });
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
        
        const timeSpan = document.createElement('span');
        timeSpan.id = `job-time-${index}`;
        updateTimeDifference(job.scrapedAt, timeSpan);

        jobTitle.textContent = `${job.title} `;
        jobTitle.appendChild(timeSpan);
        
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
            <p><strong>Payment Verified:</strong> ${job.paymentVerified ? 'Yes' : 'No'}</p>
        `;

        jobItem.appendChild(jobTitle);
        jobItem.appendChild(jobDetails);
        jobsContainer.appendChild(jobItem);
    });

    // Start updating time differences
    setInterval(() => updateAllTimeDifferences(jobs), 1000);
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

function updateTimeDifference(timestamp, element) {
    if (!timestamp) {
        element.textContent = '(unknown time)';
        return;
    }

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeString;
    if (days > 0) {
        timeString = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        timeString = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        timeString = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        timeString = `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }

    element.textContent = `(${timeString})`;
}

function updateAllTimeDifferences(jobs) {
    jobs.forEach((job, index) => {
        const timeSpan = document.getElementById(`job-time-${index}`);
        if (timeSpan) {
            updateTimeDifference(job.scrapedAt, timeSpan);
        }
    });
}