# Upwork Job Scraper + Webhook Chrome Extension

## Overview

This Chrome extension automatically scrapes job listings from Upwork and sends them to a specified webhook URL. It provides a user-friendly interface for configuring settings, viewing scraped jobs, and monitoring the extension's activity.

## Features

1. **Job Scraping**: Automatically scrapes recent job listings from Upwork at regular intervals.
2. **Webhook Integration**: Sends newly scraped jobs to a user-defined webhook URL.
3. **Customizable Check Frequency**: Allows users to set how often the extension checks for new jobs.
4. **Browser Notifications**: Optional push notifications for new job alerts.
5. **Activity Logging**: Keeps a log of the extension's activities for user review.
6. **Job Viewing**: Displays scraped jobs within the extension's interface.

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in Chrome to open the settings page.
2. Configure the webhook URL where you want to receive job data.
3. Set the desired job check frequency.
4. Enable or disable browser notifications as needed.
5. View scraped jobs and the activity log directly in the settings page.

## Configuration

### Webhook Setup

1. Enter your webhook URL in the provided input field.
2. Click "Save" to store the URL.
3. Use the "Test Webhook" button to verify your webhook is working correctly.

### Job Check Frequency

Set the frequency for job checks using the following fields:
- Days
- Hours
- Minutes
- Seconds

Click "Save Frequency" to apply the changes.

### Notifications

Toggle the switch to enable or disable browser push notifications for new jobs.

## Development

The extension is built using HTML, CSS, and JavaScript. Key files include:

- `manifest.json`: Chrome extension configuration
- `background.js`: Background script for job scraping and webhook sending
- `settings.html` and `settings.js`: User interface for configuration
- `settings.css`: Styles for the settings page

To modify the extension:

1. Edit the relevant files.
2. Reload the extension in `chrome://extensions/` to apply changes.

## Testing

To test the webhook functionality:

1. Enter a webhook URL in the settings.
2. Click the "Test Webhook" button.
3. Check your webhook endpoint for the received test data.

## Permissions

This extension requires the following permissions:

- `storage`: To save user preferences and scraped job data
- `alarms`: For scheduling periodic job checks
- `tabs`: To create a tab for job scraping
- `scripting`: To run scripts on the Upwork website
- `notifications`: For sending browser notifications
- `action`: To handle extension icon clicks

## Limitations

- The extension is designed to work specifically with Upwork's job listing page.
- Frequent scraping may be detected by Upwork and could lead to IP blocking.
- The extension relies on Upwork's current HTML structure; changes to their website may break the scraping functionality.

## Contributing

Contributions to improve the extension are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). For more details, see the [LICENSE](LICENSE) file in the project repository.

The GPL-3.0 license ensures that the software remains free and open source. It requires that any modifications or derivative works based on this project must also be released under the same license terms.

## Disclaimer

This extension is for educational purposes only. Use it responsibly and in accordance with Upwork's terms of service. The authors are not responsible for any misuse or violation of Upwork's policies.