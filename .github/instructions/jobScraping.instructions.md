---
description: "Scoped Copilot instructions for jobScraping.js (scraping & locking)"
applyTo: "upwork-job-scraper/jobScraping.js"
---

# jobScraping.js — file-scoped rules

Purpose: give concise, actionable guidance to any AI editing `jobScraping.js` so changes are safe and compatible with the rest of the extension.

Quick rules
- Preserve the public/global helpers used elsewhere: `acquireLock`, `releaseLock`, `checkForNewJobs`, `processJobs`, and `scrapeJobsFromPage` (the last runs in page context).
- Do NOT change `chrome.storage` keys: `scrapedJobs`, `scrapingLock`, `lockTimestamp`, `lockId`, `activityLog` unless adding a migration in `storage.js`.
- Keep tab lifecycle management robust: always close tabs created with `chrome.tabs.create()` in finally blocks.
- Respect lock semantics: `acquireLock()` must detect and break stale locks (> ~10 minutes) and verify lock ownership via `lockId`.

Contract (short)
- checkForNewJobs(jobScrapingEnabled)
  - Inputs: boolean `jobScrapingEnabled`.
  - Behavior: for each enabled search-webhook pair, create a non-active tab, inject `scrapeJobsFromPage`, attach `source` info to each job, call `processJobs()`.
  - Errors: should log to activity log and not leave unclosed tabs; on failures continue to next pair.

- scrapeJobsFromPage()
  - Runs in page context via `chrome.scripting.executeScript`.
  - Must return an Array of job objects or `[]`.
  - Each job must include at least: `title`, `url`, `scrapedAt` (timestamp), and optional `company`, `summary`.

- processJobs(newJobs)
  - Deduplicate against `chrome.storage.local.scrapedJobs` by `url`, prepend new jobs, truncate list to 100 entries.
  - For each new job with `source.webhookUrl`, call `globalThis.sendToWebhook(webhookUrl, [job])` (or `sendToWebhook` import).

Edge cases & expectations
- Logged-out pages: use `isUserLoggedOut()` detection and emit a login warning (via `addToActivityLog()` and `chrome.runtime.sendMessage({ type: 'loginWarning' })`).
- Page load timeouts: use a timeout (~30s) and fail gracefully, closing the tab.
- Stale locks: `acquireLock()` must break locks older than ~10 minutes and log the event.
- Concurrency: background scheduler may trigger multiple attempts; rely on storage-based locking, not in-memory flags.

Observability
- Use `addToActivityLog("message")` for human-visible events.
- Use operation breadcrumbs (startOperation/addOperationBreadcrumb/endOperation) around network or long-running tasks.
- Call `logAndReportError(context, error)` for unexpected exceptions so Sentry captures them.

Manual test steps (PR verification)
1. Load the unpacked extension from `upwork-job-scraper/` in chrome://extensions.
2. Open the background service worker console and settings page console.
3. From the settings page console, run:

```javascript
chrome.runtime.sendMessage({ type: 'manualScrape' }, (r) => console.log(r));
```

4. Verify `chrome.storage.local.scrapedJobs` was updated (via Application tab or `chrome.storage.local.get(['scrapedJobs'], console.log)`).
5. Check `chrome.storage.local.activityLog` for expected log entries.
6. Confirm no leftover tabs remain from the scrape run.

PR checklist (file-specific)
- All new selectors in `scrapeJobsFromPage()` are as specific as necessary and handle logged-out or empty-result states.
- `acquireLock()` / `releaseLock()` behavior unchanged unless intentionally improved; include tests verifying stale-lock handling.
- Added migration? Update `storage.js`'s `migrateStorage()` and include migration steps in PR description.
- Manual test steps above executed and results included in PR description.

Notes
- If you change any exported/global symbol used by content scripts, search the repo for references and update callers.
- Keep edits compact and testable; prefer adding small helper functions to reduce surface risk.
