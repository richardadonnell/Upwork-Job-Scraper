<p align="center">
  <img src="upwork-job-scraper/icon128.png" width="128" height="128" alt="UPWORK-JOB-SCRAPER-logo">
</p>
<p align="center">
    <h1 align="center">UPWORK JOB SCRAPER + WEBHOOK</h1>
</p>
<p align="center">
    <em><code>⭐ Chrome Browser Extension ⭐</code></em>
</p>
<p align="center">
	<img src="https://img.shields.io/github/license/warezit/Upwork-Job-Scraper?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/warezit/Upwork-Job-Scraper?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/warezit/Upwork-Job-Scraper?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/warezit/Upwork-Job-Scraper?style=default&color=0080ff" alt="repo-language-count">
</p>

<br>

# Upwork Job Scraper + Webhook Chrome Extension

![Upwork Job Scraper Screenshot](upwork-job-scraper/screenshot-1.3.1.png)

## Overview

This Chrome extension automatically scrapes job listings from Upwork and sends them to a specified webhook URL. It provides a user-friendly interface for configuring settings, viewing scraped jobs, and monitoring the extension's activity.

## Features

1. 🔍 **Job Scraping**: Automatically scrapes job listings from Upwork at regular intervals.
2. 📊 **Multiple Feed Sources**: Supports scraping from "Most Recent Jobs" or a custom search URL.
3. 🔗 **Webhook Integration**: Sends newly scraped jobs to a user-defined webhook URL.
4. ⏱️ **Customizable Check Frequency**: Allows users to set how often the extension checks for new jobs (in days, hours, and minutes).
5. 🔔 **Browser Notifications**: Optional push notifications for new job alerts.
6. 📝 **Activity Logging**: Keeps a log of the extension's activities for user review.
7. 👀 **Job Viewing**: Displays scraped jobs within the extension's interface.
8. 🔛 **Webhook Toggle**: Enable or disable webhook functionality.
9. 🖱️ **Manual Scraping**: Allows users to trigger a job scrape manually.
10. 🔢 **Badge Notifications**: Shows the number of new jobs since last viewed on the extension icon.
11. 🎛️ **Master Toggle**: Enable or disable all extension functionality.
12. ⏳ **Next Check Countdown**: Displays a countdown to the next scheduled job check.
13. 🐞 **Error Logging**: Automatically logs and reports errors to a specified webhook for debugging.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `upwork-job-scraper` folder from the downloaded repository.

## Usage

### Accessing Settings

Click on the extension icon in Chrome to open the settings page.

### Master Toggle

Use the master toggle at the top of the settings page to enable or disable all extension functionality.

### Webhook Configuration

1. Toggle the switch to enable or disable webhook functionality.
2. Enter your webhook URL in the provided input field.
3. Click "Save" to store the URL.
4. Use the "Test Webhook" button to verify your webhook is working correctly.

### Job Check Frequency

Set the frequency for job checks using the following fields:
- Days
- Hours
- Minutes

Click "Save Frequency" to apply the changes.

### Feed Sources

Choose between:
1. Most Recent Jobs
2. Custom Search URL

For Custom Search URL:
1. Select "Custom Search URL" option.
2. Enter the Upwork search URL in the provided field.
3. Click "Save Feed Sources" to apply the changes.

### Notifications

Toggle the switch to enable or disable browser push notifications for new jobs.

### Manual Scraping

Use the "Manually Scrape Jobs" button to initiate an immediate job scrape.

## Development

The extension consists of the following main components:

1. `manifest.json`: Defines the extension's permissions and structure.
2. `background.js`: Handles background processes, job scraping, webhook communication, and error logging.
3. `settings.html` and `settings.js`: Manage the user interface and settings.
4. `settings.css`: Styles the settings page.

To modify the extension:

1. Edit the relevant files.
2. Reload the extension in `chrome://extensions/` to apply changes.

## Testing

To test the webhook functionality:

1. Enable the webhook in the settings.
2. Enter a webhook URL in the settings.
3. Click the "Test Webhook" button.
4. Check your webhook endpoint for the received test data.

To test job scraping:

1. Configure your desired feed source.
2. Click the "Manually Scrape Jobs" button.
3. Check the Activity Log and Scraped Jobs sections for results.

## Permissions

This extension requires the following permissions:

- `storage`: To save user preferences and scraped job data
- `alarms`: For scheduling periodic job checks
- `tabs`: To create a tab for job scraping
- `scripting`: To run scripts on the Upwork website
- `notifications`: For sending browser notifications
- `action`: To handle extension icon clicks

## Limitations

- The extension is designed to work specifically with Upwork's job listing pages.
- Frequent scraping may be detected by Upwork and could lead to IP blocking.
- The extension relies on Upwork's current HTML structure; changes to their website may break the scraping functionality.

## Support

If you found this project helpful, consider supporting the developer:

<a href="https://buymeacoffee.com/warezitb" target="_blank">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=warezitb&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me A Coffee">
</a>
