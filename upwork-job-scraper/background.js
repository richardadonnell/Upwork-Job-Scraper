// Wrap the main logic in a try-catch block
try {
    // Open settings page when extension icon is clicked
    chrome.action.onClicked.addListener(() => {
        try {
            chrome.runtime.openOptionsPage();
        } catch (error) {
            console.error('Error opening options page:', error);
            logAndReportError('Error opening options page', error);
        }
    });

    // Add these variables at the top of the file
    let selectedFeedSource = 'most-recent';
    let customSearchUrl = '';
    let checkFrequency = 5; // Default to 5 minutes
    let webhookEnabled = false;
    let masterEnabled = true; // Default to true

    const ERROR_LOGGING_URL = 'https://hook.us1.make.com/nzeveapbb4wihpkc5xbixkx9sr397jfa';
    const APP_VERSION = '1.7';  // Update this when you change your extension version

    // Function to log and report errors
    function logAndReportError(context, error) {
        const errorInfo = {
            context: context,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            appVersion: APP_VERSION,
            userAgent: navigator.userAgent
        };

        console.error('Error logged:', errorInfo);

        // Send error report to your server
        fetch(ERROR_LOGGING_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: errorInfo }),
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
                console.log('Error report sent. Response:', result);
            } else {
                console.log('Error report sent:', result);
            }
        })
        .catch(error => console.error('Failed to send error report:', error));
    }

    function updateAlarm() {
        chrome.alarms.clear("checkJobs");
        chrome.alarms.create("checkJobs", { periodInMinutes: checkFrequency });
    }

    // Wrap your main functions with try-catch blocks
    async function checkForNewJobs() {
        try {
            await loadFeedSourceSettings();
            
            // Check for new version before scraping jobs
            await checkForNewVersion();

            if (!masterEnabled) {
                addToActivityLog('Extension is disabled. Skipping job check.');
                return;
            }

            addToActivityLog('Starting job check...');
            
            let url;
            if (selectedFeedSource === 'custom-search' && customSearchUrl) {
                url = customSearchUrl;
            } else {
                url = "https://www.upwork.com/nx/find-work/most-recent";
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
        } catch (error) {
            logAndReportError('Error in checkForNewJobs', error);
        }
    }

    // Load saved check frequency when the extension starts
    chrome.storage.sync.get('checkFrequency', (data) => {
        if (data.checkFrequency) {
            checkFrequency = data.checkFrequency;
        } else {
            // If no saved frequency, use the default and save it
            chrome.storage.sync.set({ checkFrequency: checkFrequency });
        }
        updateAlarm();
    });

    // Listen for alarm
    chrome.alarms.onAlarm.addListener((alarm) => {
        try {
            if (alarm.name === "checkJobs") {
                checkForNewJobs();
            }
        } catch (error) {
            logAndReportError('Error in onAlarm listener', error);
        }
    });

    // Run initial job check when extension is activated
    chrome.runtime.onStartup.addListener(() => {
        try {
            checkForNewJobs();
            loadFeedSourceSettings();
        } catch (error) {
            logAndReportError('Error in onStartup listener', error);
        }
    });
    chrome.runtime.onInstalled.addListener(() => {
        try {
            checkForNewJobs();
            loadFeedSourceSettings();
        } catch (error) {
            logAndReportError('Error in onInstalled listener', error);
        }
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
        chrome.runtime.sendMessage({ type: 'logUpdate', content: logEntry }, (response) => {
            if (chrome.runtime.lastError) {
                // This will happen if the settings page is not open, which is fine
                console.log("Settings page not available for log update");
            }
        });
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

    // Wrap other important functions similarly
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

                        // Only send to webhook if it's enabled
                        if (webhookEnabled && webhookUrl) {
                            sendToWebhook(webhookUrl, [newJob]);
                        }
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
                    chrome.runtime.sendMessage({ type: 'jobsUpdate', jobs: allJobs }, (response) => {
                        if (chrome.runtime.lastError) {
                            // This will happen if the settings page is not open, which is fine
                            console.log("Settings page not available for job update");
                        }
                    });

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

    function updateBadge() {
        if (newJobsCount > 0) {
            chrome.action.setBadgeText({text: newJobsCount.toString()});
            chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
        } else {
            chrome.action.setBadgeText({text: ''});
        }
    }

    // Modify the message listener to include error handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        let handled = false;

        try {
            if (message.type === 'settingsPageOpened') {
                newJobsCount = 0;
                updateBadge();
                
                // Update the last viewed timestamp
                chrome.storage.local.set({ lastViewedTimestamp: Date.now() });
                handled = true;
            } else if (message.type === 'updateCheckFrequency') {
                checkFrequency = message.frequency;
                updateAlarm();
                addToActivityLog(`Check frequency updated to ${checkFrequency} minute(s)`);
                handled = true;
            } else if (message.type === 'updateFeedSources') {
                loadFeedSourceSettings().then(() => {
                    sendResponse({ success: true });
                });
                return true; // Will respond asynchronously
            } else if (message.type === 'manualScrape') {
                if (masterEnabled) {
                    checkForNewJobs().then(() => {
                        sendResponse({ success: true });
                    });
                } else {
                    addToActivityLog('Extension is disabled. Manual scrape not performed.');
                    sendResponse({ success: false, reason: 'Extension is disabled' });
                }
                return true; // Will respond asynchronously
            } else if (message.type === 'ping') {
                sendResponse({ status: 'ready' });
                return false; // Responded synchronously
            } else if (message.type === 'updateWebhookSettings') {
                loadFeedSourceSettings().then(() => {
                    sendResponse({ success: true });
                });
                return true; // Will respond asynchronously
            } else if (message.type === 'updateMasterToggle') {
                masterEnabled = message.enabled;
                addToActivityLog(`Extension ${masterEnabled ? 'enabled' : 'disabled'} (all features)`);
                if (masterEnabled) {
                    updateAlarm();
                } else {
                    chrome.alarms.clear("checkJobs");
                }
                handled = true;
            } else if (message.type === 'checkForNewVersion') {
                checkForNewVersion().then(() => sendResponse({ success: true })).catch(error => sendResponse({ success: false, error: error.message }));
                return true; // Will respond asynchronously
            }

            if (handled) {
                sendResponse({ success: true });
            }
        } catch (error) {
            logAndReportError('Error in message listener', error);
            sendResponse({ error: 'An error occurred' });
        }

        return handled; // Only keep the message channel open if we handled the message
    });

    function sendToWebhook(url, data) {
        try {
            if (!masterEnabled) {
                addToActivityLog('Extension is disabled. Skipping webhook send.');
                return;
            }

            if (!webhookEnabled) {
                addToActivityLog('Webhook is disabled. Skipping send.');
                return;
            }
            
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
        } catch (error) {
            logAndReportError('Error in sendToWebhook', error);
        }
    }

    function sendNotification(message) {
        if (!masterEnabled) {
            addToActivityLog('Extension is disabled. Skipping notification.');
            return;
        }

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

    // Update this function to load feed source settings
    function loadFeedSourceSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['selectedFeedSource', 'customSearchUrl', 'webhookUrl', 'webhookEnabled'], (data) => {
                selectedFeedSource = data.selectedFeedSource || 'most-recent';
                customSearchUrl = data.customSearchUrl || '';
                webhookUrl = data.webhookUrl || '';
                webhookEnabled = data.webhookEnabled || false;

                // If a custom URL is saved, use it regardless of the selectedFeedSource
                if (customSearchUrl) {
                    selectedFeedSource = 'custom-search';
                }

                resolve();
            });
        });
    }

    // Call this function when the extension starts
    chrome.runtime.onStartup.addListener(loadFeedSourceSettings);
    chrome.runtime.onInstalled.addListener(loadFeedSourceSettings);

    // Add this message listener to handle feed source updates
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'updateFeedSources') {
            loadFeedSourceSettings();
        } else if (message.type === 'updateWebhookSettings') {
            loadFeedSourceSettings();
        }
        // ... existing message handlers ...
    });

    // Function to send a test error
    function sendTestError(customMessage = "This is a test error") {
        const testError = new Error(customMessage);
        logAndReportError('Test Error', testError);
        console.log('Test error sent. Check the webhook for the report.');
    }

    // Expose the function to the global scope so it can be called from the console
    globalThis.sendTestError = sendTestError;

    // Add this function to fetch the manifest from GitHub and compare versions
    async function checkForNewVersion() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/warezit/Upwork-Job-Scraper/main/upwork-job-scraper/manifest.json');
            if (!response.ok) {
                throw new Error('Failed to fetch manifest from GitHub');
            }
            const githubManifest = await response.json();
            const githubVersion = githubManifest.version;

            // Fetch the current version from the local manifest
            const currentVersion = chrome.runtime.getManifest().version;

            if (githubVersion !== currentVersion) {
                chrome.storage.local.set({ newVersionAvailable: true });
                addToActivityLog('New version available. Visit GitHub to download the latest version.');
            } else {
                chrome.storage.local.set({ newVersionAvailable: false });
            }
        } catch (error) {
            console.error('Error checking for new version:', error);
            logAndReportError('Error checking for new version', error);
        }
    }

    // Add this message listener to handle version check requests
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'checkForNewVersion') {
            checkForNewVersion().then(() => sendResponse({ success: true })).catch(error => sendResponse({ success: false, error: error.message }));
            return true; // Will respond asynchronously
        }
        // ... existing message handlers ...
    });

} catch (error) {
    console.error('Uncaught error in background script:', error);
    logAndReportError('Uncaught error in background script', error);
}