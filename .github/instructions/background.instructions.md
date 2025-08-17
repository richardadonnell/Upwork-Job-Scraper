---
description: "Scoped Copilot instructions for background.js (scheduling & lifecycle)"
applyTo: "upwork-job-scraper/background.js"
---

# background.js — file-scoped rules

Purpose: preserve reliable scheduling, initialization, and message handling in the service worker.

Quick rules
- Preserve the alarm name `checkJobs` and the semantics of `calculateNextCheckTime()` / `updateAlarm()`.
- Keep initialization idempotent: `tryInitializeExtension()` and `initializeExtension()` must guard against concurrent runs.
- Message handlers must use the async pattern: if responding asynchronously, ensure `sendResponse` is called and `return true` when needed.
- Avoid long-running synchronous work in the service worker; prefer async operations and small tasks.
- Use `logAndReportError()` for unexpected errors so Sentry captures them.

Key symbols to inspect
- `calculateNextCheckTime()`, `updateAlarm()`, `initializeExtension()`, `tryInitializeExtension()`
- `chrome.alarms.onAlarm` listener (handles `checkJobs`)
- `chrome.runtime.onMessage` handling for `manualScrape`, `settingsPageOpened`, `ping`.

Edge cases & expectations
- Service worker lifecycle: it may be restarted; don't rely on in-memory state.
- Duplicate initialization: guard with `isInitializing` and time-based deduplication.
- Unhandled promise rejections: there's an `unhandledrejection` handler — ensure new async code doesn't break it.

Manual verification
1. Load unpacked extension.
2. Open background service worker console and observe logs.
3. Trigger a manual scrape from the settings page console and observe `checkForNewJobs` executing and alarms scheduling.

PR checklist (file-specific)
- Keep alarm naming and scheduling logic unchanged unless intentionally refactoring; include test notes.
- If adding new message types, update `settings.js` if it expects responses.
- Include manual verification steps and sample log output in PR description.
