# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension (Manifest V3) that scrapes job listings from Upwork and sends them to configured webhooks. The extension provides a user interface for configuration, activity monitoring, and manual job scraping.

## Development Commands

This project uses vanilla JavaScript with no build system or bundler. To develop:

1. **Load the extension**: Navigate to `chrome://extensions/`, enable Developer mode, and click "Load unpacked" to select the `upwork-job-scraper/` directory
2. **Reload after changes**: Click the reload button on the extension card in `chrome://extensions/` to apply changes
3. **Test manual scraping**: Open extension settings and use "Manually Scrape Jobs" button
4. **Debug**: Check the background service worker console for errors in `chrome://extensions/`

## Architecture

### Core Components

- **Background Service Worker**: `background.js` - handles initialization, scheduling via `chrome.alarms`, message routing, and scrape coordination
- **Job Scraping**: `jobScraping.js` - creates tabs, injects scraping scripts, processes and deduplicates jobs
- **Storage Management**: `storage.js` - manages search/webhook pairs in `chrome.storage.sync` and runtime data in `chrome.storage.local`
- **Webhook Integration**: `webhook.js` - validates URLs and POSTs job data to configured endpoints
- **Settings UI**: `settings.html` + `settings.js` + `settings.css` - user interface for configuration

### Data Flow

1. Background script schedules periodic checks via `chrome.alarms`
2. `checkForNewJobs()` creates non-active tabs and injects `scrapeJobsFromPage()`
3. `processJobs()` deduplicates, stores locally, and sends to webhooks
4. Activity logging and notifications update the UI

### Storage Architecture

- **chrome.storage.sync**: Persistent user settings (searchWebhookPairs)
- **chrome.storage.local**: Transient data (scrapedJobs, scrapingLock, activityLog)

### Locking & Concurrency

Uses `scrapingLock`, `lockTimestamp`, `lockId` in `chrome.storage.local` with `acquireLock()` and `releaseLock()` helpers to prevent concurrent scraping operations.

## Key Files and Functions

### Critical Functions to Preserve

- `calculateNextCheckTime()` / `updateAlarm()` in `background.js` - scheduling logic used by UI countdowns
- `acquireLock()` / `releaseLock()` in `jobScraping.js` - concurrency control
- `scrapeJobsFromPage()` in `jobScraping.js` - injected content script for job extraction
- `processJobs()` in `jobScraping.js` - deduplication and webhook posting
- `getAllPairs()` / `getEnabledPairs()` in `storage.js` - search/webhook configuration management

### Global Exports (DO NOT BREAK)

These are exposed via `web_accessible_resources` for content scripts:

- `globalThis.getEnabledPairs`
- `globalThis.addToActivityLog`
- `globalThis.sendToWebhook`

## Development Rules

### Critical Restrictions

- **Edit only inside `./upwork-job-scraper/`** - all extension code lives here
- **DO NOT modify `sentry.js`** (exists in both `misc/` and `upwork-job-scraper/`) - use `sentry-init.js` or `logAndReportError()` instead
- **Preserve message contracts** - message `type` strings are used across the extension (common types: `ping`, `settingsPageOpened`, `manualScrape`, `jobsUpdate`, `logUpdate`)

### Storage Conventions

- Keep `chrome.storage` keys unchanged unless adding migration logic in `migrateStorage()` in `storage.js`
- Use `chrome.storage.sync` for persistent user settings only
- Use `chrome.storage.local` for transient scraped data, locks, and activity logs

### Testing Manual Scraping

```javascript
// From DevTools console on settings page:
chrome.runtime.sendMessage({ type: "manualScrape" }, (response) =>
  console.log(response)
);
```

## Common Development Tasks

### Modifying Scraping Logic

1. Update selectors in `scrapeJobsFromPage()` in `jobScraping.js`
2. Run manual scrape to verify `processJobs()` receives proper job objects
3. Check background service worker console for errors

### Adding New Message Types

1. Add handler in `chrome.runtime.onMessage` in `background.js`
2. Update message senders in `settings.js` or other components
3. Ensure proper error handling and response format

### Updating Storage Schema

1. Increment version in `migrateStorage()` in `storage.js`
2. Add migration logic for new/changed fields
3. Test with existing and new installations

## Error Handling

- Use `logAndReportError()` from `errorHandling.js` for consistent error reporting
- Sentry integration handles automatic error reporting
- Activity logs are available in Settings UI with "Copy log to GitHub issue" feature
- Background service worker can be inactive - `settings.js` uses retry/backoff in `waitForBackgroundScript()`

## Edge Cases

- Locks can become stale - `acquireLock()` breaks locks older than ~10 minutes
- Background service worker inactivity requires message retry logic
- Manifest has broad `host_permissions` (`<all_urls>`) - be careful adding new remote hosts
