function waitForBackgroundScript() {
    return new Promise((resolve) => {
        const checkBackgroundScript = () => {
            chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
                if (chrome.runtime.lastError) {
                    // Background script not ready, check again in 100ms
                    setTimeout(checkBackgroundScript, 100);
                } else {
                    // Background script is ready
                    resolve();
                }
            });
        };
        checkBackgroundScript();
    });
}

// Add this function near the top of the file, after the waitForBackgroundScript function

function sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// Add these functions at the top of your settings.js file

let countdownInterval;

function updateCountdown() {
    chrome.alarms.get('checkJobs', (alarm) => {
        if (alarm) {
            const now = new Date().getTime();
            const nextAlarm = alarm.scheduledTime;
            const timeLeft = nextAlarm - now;

            if (timeLeft > 0) {
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                document.getElementById('next-check-countdown').textContent = 
                    `Next check in: ${hours}h ${minutes}m ${seconds}s`;
            } else {
                document.getElementById('next-check-countdown').textContent = 'Check imminent...';
            }
        } else {
            document.getElementById('next-check-countdown').textContent = 'Countdown not available';
        }
    });
}

function startCountdown() {
    updateCountdown(); // Initial update
    clearInterval(countdownInterval); // Clear any existing interval
    countdownInterval = setInterval(updateCountdown, 1000); // Update every second
}

// Modify the existing initializeSettings function
function initializeSettings() {
    chrome.runtime.sendMessage({ type: 'settingsPageOpened' });

    document.getElementById('save').addEventListener('click', () => {
        const webhookUrl = document.getElementById('webhook-url').value;
        const webhookEnabled = document.getElementById('webhook-toggle').checked;
        chrome.storage.sync.set({ webhookUrl: webhookUrl, webhookEnabled: webhookEnabled }, () => {
            console.log('Webhook settings saved');
            addLogEntry('Webhook settings saved');
            chrome.runtime.sendMessage({ type: 'updateWebhookSettings' });
        });
    });

    document.getElementById('test-webhook').addEventListener('click', () => {
        const webhookUrl = document.getElementById('webhook-url').value;
        const webhookEnabled = document.getElementById('webhook-toggle').checked;
        if (!webhookEnabled) {
            alert('Please enable the webhook before testing.');
            return;
        }
        if (!webhookUrl) {
            alert('Please enter a webhook URL before testing.');
            return;
        }

        const testPayload = {
            title: "Test Job",
            url: "https://www.upwork.com/test-job",
            description: "This is a test job posting to verify webhook functionality.",
            budget: "$100-$500",
            posted: "Just now",
            proposals: "Less than 5",
            clientCountry: "Test Country",
            paymentVerified: true,
            scrapedAt: Date.now()
        };

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload),
        })
        .then(response => response.text())
        .then(result => {
            console.log('Test webhook response:', result);
            addLogEntry('Test webhook sent successfully');
            alert('Test webhook sent successfully. Check your webhook endpoint for the received data.');
        })
        .catch(error => {
            console.error('Error:', error);
            addLogEntry('Error sending test webhook');
            alert('Error sending test webhook. Check the console for details.');
        });
    });

    // Load saved webhook settings when the page opens
    chrome.storage.sync.get(['webhookUrl', 'webhookEnabled'], (data) => {
        if (data.webhookUrl) {
            document.getElementById('webhook-url').value = data.webhookUrl;
        }
        const webhookToggle = document.getElementById('webhook-toggle');
        if (data.webhookEnabled === undefined) {
            // Default to enabled if not set
            webhookToggle.checked = true;
            chrome.storage.sync.set({ webhookEnabled: true });
        } else {
            webhookToggle.checked = data.webhookEnabled;
        }
        updateWebhookInputState();
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

    // Save webhook setting when toggled
    document.getElementById('webhook-toggle').addEventListener('change', (event) => {
        const webhookEnabled = event.target.checked;
        chrome.storage.sync.set({ webhookEnabled: webhookEnabled }, () => {
            console.log('Webhook ' + (webhookEnabled ? 'enabled' : 'disabled'));
            addLogEntry(`Webhook ${webhookEnabled ? 'enabled' : 'disabled'}`);
            updateWebhookInputState();
            chrome.runtime.sendMessage({ type: 'updateWebhookSettings' });
        });
    });

    // Add this after the other event listeners

    document.getElementById('save-frequency').addEventListener('click', () => {
        const days = parseInt(document.getElementById('days').value) || 0;
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 1;

        const totalMinutes = (days * 1440) + (hours * 60) + minutes;

        if (totalMinutes < 1) {
            alert('Please set a frequency of at least 1 minute.');
            return;
        }

        chrome.storage.sync.set({ checkFrequency: totalMinutes }, () => {
            console.log('Check frequency saved');
            addLogEntry(`Check frequency saved: ${days}d ${hours}h ${minutes}m`);
            chrome.runtime.sendMessage({ type: 'updateCheckFrequency', frequency: totalMinutes });
            startCountdown(); // Restart the countdown with the new frequency
        });
    });

    // Load saved check frequency when the page opens
    chrome.storage.sync.get('checkFrequency', (data) => {
        if (data.checkFrequency) {
            document.getElementById('days').value = Math.floor(data.checkFrequency / 1440) || '';
            document.getElementById('hours').value = Math.floor((data.checkFrequency % 1440) / 60) || '';
            document.getElementById('minutes').value = data.checkFrequency % 60 || 1;
        }
        startCountdown(); // Start the countdown after loading the frequency
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

            const jobHeader = document.createElement('div');
            jobHeader.className = 'job-header';

            const jobTitle = document.createElement('div');
            jobTitle.className = 'job-title';
            
            const timeSpan = document.createElement('span');
            timeSpan.id = `job-time-${index}`;
            updateTimeDifference(job.scrapedAt, timeSpan);

            jobTitle.textContent = `${job.title} `;
            jobTitle.appendChild(timeSpan);
            
            jobTitle.onclick = () => toggleJobDetails(index);

            const openButton = document.createElement('button');
            openButton.className = 'open-job-button button-secondary';
            openButton.textContent = 'Open';
            openButton.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering the jobTitle click event
                window.open(job.url, '_blank');
            };

            jobHeader.appendChild(jobTitle);
            jobHeader.appendChild(openButton);

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

            jobItem.appendChild(jobHeader);
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

    // Function to update webhook input state
    function updateWebhookInputState() {
        const webhookUrl = document.getElementById('webhook-url');
        const testWebhookButton = document.getElementById('test-webhook');
        const isEnabled = document.getElementById('webhook-toggle').checked;

        webhookUrl.disabled = !isEnabled;
        testWebhookButton.disabled = !isEnabled;
    }

    // Add these event listeners after the existing ones

    document.querySelectorAll('input[name="feed-source"]').forEach((radio) => {
        radio.addEventListener('change', (event) => {
            const customSearchUrl = document.getElementById('custom-search-url');
            if (event.target.value === 'custom-search') {
                customSearchUrl.disabled = false;
            } else {
                customSearchUrl.disabled = true;
                customSearchUrl.value = ''; // Clear the custom URL when switching to Most Recent
            }
        });
    });

    document.getElementById('save-feed-sources').addEventListener('click', () => {
        const selectedFeedSource = document.querySelector('input[name="feed-source"]:checked').value;
        const customSearchUrl = document.getElementById('custom-search-url').value;

        chrome.storage.sync.set({
            selectedFeedSource: selectedFeedSource,
            customSearchUrl: customSearchUrl
        }, () => {
            console.log('Feed sources saved');
            addLogEntry('Feed sources saved');
            chrome.runtime.sendMessage({ type: 'updateFeedSources' });
        });
    });

    // Load saved feed source settings when the page opens
    chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl'], (data) => {
        const customSearchUrl = data.customSearchUrl || '';
        const selectedFeedSource = customSearchUrl ? 'custom-search' : (data.selectedFeedSource || 'most-recent');
        
        document.querySelector(`input[name="feed-source"][value="${selectedFeedSource}"]`).checked = true;
        
        const customSearchUrlInput = document.getElementById('custom-search-url');
        customSearchUrlInput.value = customSearchUrl;
        customSearchUrlInput.disabled = selectedFeedSource !== 'custom-search';
        
        // Update the UI based on the selected feed source
        updateFeedSourceUI(selectedFeedSource);
    });

    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="feed-source"]').forEach((radio) => {
        radio.addEventListener('change', (event) => {
            updateFeedSourceUI(event.target.value);
        });
    });

    // Add this new function to update the UI based on the selected feed source
    function updateFeedSourceUI(selectedFeedSource) {
        const customSearchUrl = document.getElementById('custom-search-url');
        if (selectedFeedSource === 'custom-search') {
            customSearchUrl.disabled = false;
        } else {
            customSearchUrl.disabled = true;
        }
    }

    document.getElementById('manual-scrape').addEventListener('click', () => {
        sendMessageToBackground({ type: 'manualScrape' })
            .then((response) => {
                if (response && response.success) {
                    addLogEntry('Manual scrape initiated');
                } else {
                    addLogEntry('Failed to initiate manual scrape');
                }
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                addLogEntry('Error initiating manual scrape');
            });
    });

    const masterToggle = document.getElementById('master-toggle');

    // Load master toggle state
    chrome.storage.sync.get('masterEnabled', (data) => {
        masterToggle.checked = data.masterEnabled !== false; // Default to true if not set
        updateUIState(masterToggle.checked);
    });

    // Master toggle event listener
    masterToggle.addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        chrome.storage.sync.set({ masterEnabled: isEnabled }, () => {
            console.log('Extension ' + (isEnabled ? 'enabled' : 'disabled'));
            addLogEntry(`Extension ${isEnabled ? 'enabled' : 'disabled'} (all features)`);
            updateUIState(isEnabled);
            chrome.runtime.sendMessage({ type: 'updateMasterToggle', enabled: isEnabled });
        });
    });

    function updateUIState(isEnabled) {
        const elements = document.querySelectorAll('input, button');
        elements.forEach(element => {
            if (element.id !== 'master-toggle') {
                element.disabled = !isEnabled;
            }
        });
    }
}

// Use this to initialize the settings page:
waitForBackgroundScript().then(() => {
    initializeSettings();
});