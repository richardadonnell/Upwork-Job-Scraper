function waitForBackgroundScript() {
    console.log('Waiting for background script...');
    return new Promise((resolve) => {
        const checkBackgroundScript = () => {
            chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('Background script not ready, retrying...');
                    setTimeout(checkBackgroundScript, 100);
                } else {
                    console.log('Background script is ready');
                    resolve();
                }
            });
        };
        checkBackgroundScript();
    });
}

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

function initializeSettings() {
    console.log('Initializing settings...');
    chrome.runtime.sendMessage({ type: 'settingsPageOpened' });

    chrome.runtime.sendMessage({ type: 'checkForNewVersion' }, (response) => {
        if (response && response.success) {
            chrome.storage.local.get('newVersionAvailable', (data) => {
                if (data.newVersionAvailable) {
                    showNewVersionNotification();
                }
            });
        } else {
            console.error('Error checking for new version:', response ? response.error : 'Unknown error');
        }
    });

    document.getElementById('save').addEventListener('click', () => {
        const webhookUrl = document.getElementById('webhook-url').value;
        const webhookEnabled = document.getElementById('webhook-toggle').checked;

        chrome.storage.sync.set({ webhookUrl: webhookUrl, webhookEnabled: webhookEnabled }, () => {
            console.log('Webhook settings saved');
            addLogEntry('Webhook settings saved');
            chrome.runtime.sendMessage({ 
                type: 'updateWebhookSettings', 
                webhookUrl: webhookUrl, 
                webhookEnabled: webhookEnabled 
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error updating webhook settings:', chrome.runtime.lastError);
                    addLogEntry('Error saving webhook settings');
                } else {
                    addLogEntry('Webhook settings updated successfully');
                }
            });
        });
    });

    document.getElementById('test-webhook').addEventListener('click', () => {
        const webhookUrl = document.getElementById('webhook-url').value;
        const webhookEnabled = document.getElementById('webhook-toggle').checked;
        if (!webhookEnabled || !webhookUrl) {
            addLogEntry('Please enable the webhook and enter a URL before testing.');
            return;
        }

        const testPayload = [
            {
                title: "Comprehensive Test Job",
                url: "https://www.upwork.com/test-job-comprehensive",
                description: "This is a comprehensive test job posting to verify webhook functionality for all possible fields.",
                budget: "Fixed price and Hourly",
                estimatedBudget: "$100-$500",
                estimatedTime: "Less than 1 month",
                postedTime: "Just now",
                skills: ["JavaScript", "React", "Node.js", "Python", "Django", "PostgreSQL"],
                clientCountry: "United States",
                clientRating: "100%",
                clientSpent: "$1M+",
                proposals: "5 to 10",
                paymentVerified: true,
                scrapedAt: new Date().toISOString(),
                experienceLevel: "Entry Level to Expert",
                clientInfo: {
                    totalSpent: "$5M+",
                    totalHires: 100,
                    activeContracts: 10,
                    openJobs: 5,
                    memberSince: "Jan 1, 2010",
                    lastSeen: "1 hour ago"
                },
                jobType: "One-time project",
                projectLength: "Long term",
                workload: "Full time",
                tierRequirement: "Top Rated and Up",
                numberOfApplicants: 20,
                clientTimeZone: "UTC-5",
                preferredQualifications: ["5+ years of experience", "Fluent English", "Bachelor's degree"],
                attachments: ["job_description.pdf", "wireframes.png"],
                questionnaire: [
                    "What is your experience with React?",
                    "How do you handle state management in large applications?"
                ],
                visibility: "Anyone",
                connects: 4,
                projectID: "1234567890",
                categoryID: "531770282580668418",
                subcategoryID: "531770282580668419",
                specializationID: "531770282589057033"
            }
        ];

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
        })
        .catch(error => {
            console.error('Error:', error);
            addLogEntry('Error sending test webhook');
        });
    });

    chrome.storage.sync.get(['webhookUrl', 'webhookEnabled'], (data) => {
        if (data.webhookUrl) {
            document.getElementById('webhook-url').value = data.webhookUrl;
        }
        const webhookToggle = document.getElementById('webhook-toggle');
        if (data.webhookEnabled === undefined) {
            webhookToggle.checked = true;
            chrome.storage.sync.set({ webhookEnabled: true });
        } else {
            webhookToggle.checked = data.webhookEnabled;
        }
        updateWebhookInputState();
    });

    chrome.storage.sync.get('notificationsEnabled', (data) => {
        const notificationToggle = document.getElementById('notification-toggle');
        if (data.notificationsEnabled === undefined) {
            notificationToggle.checked = true;
            chrome.storage.sync.set({ notificationsEnabled: true });
        } else {
            notificationToggle.checked = data.notificationsEnabled;
        }
    });

    document.getElementById('notification-toggle').addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        chrome.storage.sync.set({ notificationsEnabled: isEnabled }, () => {
            console.log('Notification setting saved:', isEnabled);
            addLogEntry(`Notifications ${isEnabled ? 'enabled' : 'disabled'}`);
        });
    });

    document.getElementById('webhook-toggle').addEventListener('change', (event) => {
        const webhookEnabled = event.target.checked;
        chrome.storage.sync.set({ webhookEnabled: webhookEnabled }, () => {
            console.log('Webhook ' + (webhookEnabled ? 'enabled' : 'disabled'));
            addLogEntry(`Webhook ${webhookEnabled ? 'enabled' : 'disabled'}`);
            updateWebhookInputState();
            chrome.runtime.sendMessage({ type: 'updateWebhookSettings' });
        });
    });

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
            startCountdown();
        });
    });

    chrome.storage.sync.get('checkFrequency', (data) => {
        if (data.checkFrequency) {
            document.getElementById('days').value = Math.floor(data.checkFrequency / 1440) || '';
            document.getElementById('hours').value = Math.floor((data.checkFrequency % 1440) / 60) || '';
            document.getElementById('minutes').value = data.checkFrequency % 60 || 1;
        }
        startCountdown();
    });

    function addLogEntry(message) {
        const logContainer = document.getElementById('log-container');
        const logEntry = document.createElement('p');
        logEntry.textContent = `${new Date().toLocaleString()}: ${message}`;
        logContainer.insertBefore(logEntry, logContainer.firstChild);
    }

    chrome.storage.local.get('activityLog', (data) => {
        if (data.activityLog) {
            data.activityLog.forEach(entry => addLogEntry(entry));
        }
    });

    function addJobEntries(jobs) {
        const jobsContainer = document.getElementById('jobs-container');
        jobsContainer.innerHTML = '';

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
                e.stopPropagation();
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
                ${job.estimatedBudget ? `<p><strong>Estimated Budget:</strong> ${job.estimatedBudget}</p>` : ''}
                ${job.estimatedTime ? `<p><strong>Estimated Time:</strong> ${job.estimatedTime}</p>` : ''}
                <p><strong>Experience Level:</strong> ${job.experienceLevel}</p>
                <p><strong>Proposals:</strong> ${job.proposals}</p>
                <p><strong>Client Country:</strong> ${job.clientCountry}</p>
                <p><strong>Client Rating:</strong> ${job.clientRating}</p>
                <p><strong>Client Spent:</strong> ${job.clientSpent}</p>
                <p><strong>Payment Verified:</strong> ${job.paymentVerified ? 'Yes' : 'No'}</p>
                <p><strong>Skills:</strong> ${job.skills && job.skills.length > 0 ? job.skills.join(', ') : 'N/A'}</p>
            `;

            jobItem.appendChild(jobHeader);
            jobItem.appendChild(jobDetails);
            jobsContainer.appendChild(jobItem);
        });

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

    chrome.storage.local.get('scrapedJobs', (data) => {
        if (data.scrapedJobs) {
            addJobEntries(data.scrapedJobs);
        }
    });

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
        const scrapedAt = new Date(timestamp).getTime();
        const diff = now - scrapedAt;
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

    function updateWebhookInputState() {
        const webhookUrl = document.getElementById('webhook-url');
        const testWebhookButton = document.getElementById('test-webhook');
        const isEnabled = document.getElementById('webhook-toggle').checked;

        webhookUrl.disabled = !isEnabled;
        testWebhookButton.disabled = !isEnabled;
    }

    document.querySelectorAll('input[name="feed-source"]').forEach((radio) => {
        radio.addEventListener('change', (event) => {
            const customSearchUrl = document.getElementById('custom-search-url');
            if (event.target.value === 'custom-search') {
                customSearchUrl.disabled = false;
            } else {
                customSearchUrl.disabled = true;
                customSearchUrl.value = '';
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
            chrome.runtime.sendMessage({ type: 'updateFeedSources' }, (response) => {
                if (response && response.success) {
                    addLogEntry('Feed sources updated successfully');
                } else {
                    addLogEntry('Failed to update feed sources');
                }
            });
        });
    });

    chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl'], (data) => {
        const customSearchUrl = data.customSearchUrl || '';
        const selectedFeedSource = customSearchUrl ? 'custom-search' : (data.selectedFeedSource || 'most-recent');
        
        document.querySelector(`input[name="feed-source"][value="${selectedFeedSource}"]`).checked = true;
        
        const customSearchUrlInput = document.getElementById('custom-search-url');
        customSearchUrlInput.value = customSearchUrl;
        customSearchUrlInput.disabled = selectedFeedSource !== 'custom-search';
        
        updateFeedSourceUI(selectedFeedSource);
    });

    document.querySelectorAll('input[name="feed-source"]').forEach((radio) => {
        radio.addEventListener('change', (event) => {
            updateFeedSourceUI(event.target.value);
        });
    });

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

    function updateUIBasedOnMasterToggle(isEnabled) {
        masterToggle.checked = isEnabled;
        document.getElementById('webhook-toggle').disabled = !isEnabled;
        document.getElementById('webhook-url').disabled = !isEnabled;
        document.getElementById('notification-toggle').disabled = !isEnabled;
    }

    function syncMasterToggleState() {
        chrome.runtime.sendMessage({ type: 'getMasterToggleState' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error getting master toggle state:', chrome.runtime.lastError);
            } else if (response && response.state !== undefined) {
                document.getElementById('master-toggle').checked = response.state;
                updateUIBasedOnMasterToggle(response.state);
                console.log('Master toggle state synchronized with background script');
            }
        });
    }

    syncMasterToggleState();
    setInterval(syncMasterToggleState, 5000);

    document.getElementById('master-toggle').addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        chrome.runtime.sendMessage({ type: 'updateMasterToggle', enabled: isEnabled }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error updating master toggle state:', chrome.runtime.lastError);
                event.target.checked = !isEnabled;
            } else if (response && response.success) {
                console.log('Background script updated with new master toggle state');
                updateUIBasedOnMasterToggle(isEnabled);
            }
        });
    });

    function showNewVersionNotification() {
        const notification = document.createElement('div');
        notification.id = 'version-notification';
        notification.style.backgroundColor = '#b22222';
        notification.style.color = '#ffffff';
        notification.style.padding = '10px';
        notification.style.marginBottom = '10px';
        notification.style.textAlign = 'center';
        notification.innerHTML = `
            <strong>New Version Available!</strong> 
            <a href="https://github.com/warezit/Upwork-Job-Scraper" target="_blank" style="color: #ffffff; text-decoration: underline;">Visit GitHub to download the latest version.</a>
        `;
        document.body.insertBefore(notification, document.body.firstChild);
        addLogEntry('New version available. Visit GitHub to download the latest version.');
    }
}

waitForBackgroundScript().then(() => {
    console.log('Starting initialization...');
    initializeSettings();
}).catch(error => {
    console.error('Error during initialization:', error);
});