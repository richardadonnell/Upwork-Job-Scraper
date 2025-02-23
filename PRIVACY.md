# Privacy Policy for Upwork Job Scraper + Webhook Extension

Last updated: March 2024

## Overview
This privacy policy describes how the Upwork Job Scraper + Webhook Extension ("we", "our", or "the extension") collects, uses, and handles your information.

## Information We Collect

### Job Data
- Job listings from Upwork.com that match your search criteria
- Job details including:
  - Title
  - URL
  - Job type
  - Skill level
  - Budget information
  - Job description
  - Required skills
  - Client information (rating, spent amount, country)
  - Job posting time
  - Attachments (names and URLs only)
  - Screening questions

### User Settings
- Search-webhook pairs (including names, search URLs, and webhook URLs)
- Job check frequency preferences
- Schedule settings (days and times for job checking)
- Notification preferences
- Extension enable/disable state

### Activity Logs
- Extension operation logs
- Job scraping results
- Webhook delivery status
- Error messages

## How We Use Information

### Local Storage
- Job data is stored locally using `chrome.storage.local`
- Limited to 100 most recent jobs
- Activity logs are limited to 100 most recent entries

### Sync Storage
- User settings are synced across devices using `chrome.storage.sync`
- Includes search-webhook pairs and preferences

### Webhook Integration
- Job data is sent to user-specified webhook URLs
- Each webhook receives only jobs from its associated search URL
- Webhook communication uses HTTPS for security

## Data Retention
- Job data is automatically limited to the 100 most recent entries
- Activity logs are automatically limited to the 100 most recent entries
- Settings are retained until manually cleared or the extension is uninstalled

## Third-Party Services

### Upwork.com
- The extension interacts only with Upwork.com to fetch job listings
- No data is sent to Upwork.com; the extension only reads publicly available job data

### User-Specified Webhooks
- Job data is sent only to webhook URLs specified by the user
- The extension does not validate or store data after webhook delivery
- Users are responsible for the security and handling of data at their webhook endpoints

### Error Reporting
- The extension uses Sentry.io for error reporting
- Only technical error information is sent to help improve the extension
- No personal data or job content is included in error reports

## Data Security
- All data is stored locally on your device
- Settings sync uses Chrome's secure sync infrastructure
- Webhook communications use secure HTTPS connections
- No data is shared with third parties except as specified above

## User Controls
You can:
- Enable/disable the extension completely
- Control which job searches are active
- Manage webhook destinations
- Clear stored jobs and activity logs
- Control notification settings
- Set custom schedules for job checking
- Uninstall the extension to remove all stored data

## Browser Permissions
The extension requires these permissions:
- `storage`: For saving settings and job data
- `alarms`: For scheduling job checks
- `notifications`: For new job alerts
- `scripting`: For reading job data from Upwork
- `tabs`: For opening settings and job pages

## Changes to This Policy
We will post any privacy policy changes on this page and update the "Last updated" date.

## Contact
For questions about this privacy policy or the extension's data handling, please create an issue in our GitHub repository. 