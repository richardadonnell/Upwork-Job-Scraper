---
description: "Workspace-wide Copilot instructions for Upwork Job Scraper"
applyTo: "**"
---

# Upwork Job Scraper — Copilot agent instructions

Purpose: a Manifest V3 Chrome extension that scrapes Upwork job listings and optionally posts them to configured webhooks.

Note: See `.github/instructions/extension-v2-typescript.instructions.md` and `.github/instructions/reference-extension-js-examples.instructions.md` for guidance when working in `extension-v2` (prefer TypeScript ESM and reuse `extension.js` examples where relevant).

High-level plan: I'll keep this file concise and organized so an AI agent can be productive immediately. Sections below cover the big-picture architecture, conventions, key files/symbols to inspect, a short file tree, technologies used, concrete examples (storage shape, sample message), and a small PR checklist.

## Quick rules
- Edit only inside `./upwork-job-scraper/`.
- Do NOT modify `sentry.js` (in `misc/` and `upwork-job-scraper/`).
- Preserve global exports used by content scripts (e.g., `globalThis.getEnabledPairs`, `globalThis.addToActivityLog`, `globalThis.sendToWebhook`).
 - NEVER modify or make changes inside `extension-v2/extension`.
	 - Rationale: `extension-v2/extension` is a build output folder produced by `npm run build` and will be overwritten on each build; edits there will be lost and may introduce hard-to-debug runtime issues. Make source changes under `extension-v2/src` or `extension-v2/public` instead.

## Architecture & important flows
- Background service worker: `background.js` — handles initialization, scheduling (`chrome.alarms`), routing messages, and coordinating scrapes.
- Scraping flow: `jobScraping.js` creates non-active tabs via `chrome.tabs.create`, injects `scrapeJobsFromPage` using `chrome.scripting.executeScript`, collects job objects, then calls `processJobs()` to dedupe, store, and optionally POST to webhooks.
- Storage: settings and configuration live in `chrome.storage.sync` (`searchWebhookPairs`); runtime data, locks and activity logs live in `chrome.storage.local` (e.g., `scrapedJobs`, `scrapingLock`, `activityLog`).
- Webhooks: `webhook.js` implements `sendToWebhook(webhookUrl, jobs)` — validates URLs (`isValidUrl`), uses `fetch` to POST JSON, and records breadcrumbs and activity log entries on success/failure.
- Locking & concurrency: locking is implemented via `scrapingLock`, `lockTimestamp`, `lockId` keys in `chrome.storage.local` with helpers `acquireLock()` and `releaseLock()` in `jobScraping.js`.

## Project-specific conventions
- Storage rule: `chrome.storage.sync` for persistent user settings; `chrome.storage.local` for transient scraped data, locks, and activity logs.
- Scheduling semantics: preserve `calculateNextCheckTime()` / `updateAlarm()` logic in `background.js` when changing alarm behavior — the settings UI and countdowns depend on the same algorithm.
- Message compatibility: message `type` strings are used across the extension. Common types: `ping`, `settingsPageOpened`, `manualScrape`, `jobsUpdate`, `logUpdate`. Keep handlers' contract intact when editing.
- Minimal UI build: no JS bundler. Make changes directly and reload the unpacked extension to test.

## Key files & symbols (inspect these first)
- `upwork-job-scraper/background.js`
	- calculateNextCheckTime(), updateAlarm(), initializeExtension(), chrome.runtime.onMessage handlers.
- `upwork-job-scraper/jobScraping.js`
	- acquireLock(), releaseLock(), checkForNewJobs(jobScrapingEnabled), scrapeJobsFromPage(), processJobs().
- `upwork-job-scraper/storage.js`
	- getAllPairs(), getEnabledPairs(), addPair(), updatePair(), migrateStorage(), validatePair().
- `upwork-job-scraper/webhook.js`
	- isValidUrl(), sendToWebhook(webhookUrl, jobs), addOperationBreadcrumb(), startOperation()/endOperation() calls.
- `upwork-job-scraper/activityLog.js`
	- addToActivityLog(message) — updates `chrome.storage.local.activityLog` and emits `logUpdate` messages.
- `upwork-job-scraper/settings.js` + `settings.html`
	- waitForBackgroundScript(), sendMessageToBackground(), initializeSettings(), updateCountdown()/startCountdown(), "Copy log to GitHub issue" flow.
- `upwork-job-scraper/manifest.json`
	- background.service_worker, host_permissions, web_accessible_resources (content script helpers exposed here).
- Helpers: `utils.js`, `notifications.js`, `errorHandling.js`, `sentry-init.js`.

## Repository file tree (top-level — relevant files)
- LICENSE
- README.md
- PLANNING.md
- PRIVACY.md
- misc/
	- sentry.js (do NOT edit)
	- icons, screenshots
- releases/
- scripts/
- tasks/
- upwork-job-scraper/
	- activityLog.js
	- background.js
	- errorHandling.js
	- jobScraping.js
	- storage.js
	- webhook.js
	- settings.js
	- settings.html
	- settings.css
	- sentry-init.js
	- sentry.js
	- utils.js
	- notifications.js
	- manifest.json
	- icon48.png, icon128.png
	- styles/

## Technologies & integrations used
- Chrome Extension (Manifest V3) — background service worker in `background.js`.
- Vanilla JavaScript (ES2020+) — no build system or bundler.
- Chrome Extension APIs: `chrome.storage` (sync/local), `chrome.alarms`, `chrome.notifications`, `chrome.scripting`, `chrome.tabs`, `chrome.runtime`.
- Fetch API for webhook POSTs (`webhook.js`).
- Sentry for error reporting (`sentry.js`, `sentry-init.js`) — DO NOT EDIT `sentry.js`.
- Content scripts + `web_accessible_resources` for sharing helper modules (`activityLog.js`, `webhook.js`, `utils.js`).

## Concrete examples (copy/paste ready)
- Example `searchWebhookPairs` stored in `chrome.storage.sync`:
```json
{
	"searchWebhookPairs": [
		{
			"id": "1627384950000",
			"name": "My Upwork Search",
			"searchUrl": "https://www.upwork.com/nx/search/jobs/?q=javascript&sort=recency",
			"webhookUrl": "https://example.com/webhook",
			"enabled": true,
			"createdAt": "2023-08-01T12:00:00.000Z"
		}
	]
}
```

How to trigger a manual scrape from DevTools console (settings page or extension page):

```javascript
chrome.runtime.sendMessage({ type: 'manualScrape' }, (response) => console.log(response));
```

Activity log entries live in `chrome.storage.local.activityLog` as an array of timestamped strings. Use the Settings UI "Copy log to GitHub issue" button for diagnostics.

## PR checklist (small, practical)
- Code edits only in `upwork-job-scraper/`.
 - Code edits only in `upwork-job-scraper/` or the appropriate `extension-v2/src` / `extension-v2/public` sources — do NOT edit `extension-v2/extension` (build output).
- Don't change `sentry.js` content; update `sentry-init.js` or use `logAndReportError()` where necessary.
- If modifying exported globals (e.g., `globalThis.getEnabledPairs`), update all usages (search the repo).
- When changing scraping selectors: update `scrapeJobsFromPage()` in `jobScraping.js`, run a manual scrape locally, and verify `processJobs()` receives an array of job objects.
- Keep `chrome.storage` keys unchanged unless migrating; add migration in `migrateStorage()` in `storage.js`.
- Verify behavior by loading unpacked extension and checking background service worker console for errors.

## Edge cases & notes
- Background service worker can be inactive; `settings.js` uses retry/backoff in `waitForBackgroundScript()` — be aware when testing message passing.
- Locks can become stale; `acquireLock()` breaks stale locks older than ~10 minutes (see `jobScraping.js`).
- Manifest `host_permissions` are broad (`<all_urls>` present) — be careful when adding new remote hosts.
