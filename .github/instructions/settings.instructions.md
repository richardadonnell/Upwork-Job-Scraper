---
description: "Scoped Copilot instructions for settings.js (UI & background comms)"
applyTo: "upwork-job-scraper/settings.js"
---

# settings.js — file-scoped rules

Purpose: ensure settings UI communicates reliably with the background service worker and exposes diagnostics.

Quick rules
- Use `waitForBackgroundScript()` backoff logic; do not remove exponential backoff behavior.
- `sendMessageToBackground(message, retries)` should include retry/backoff and surface errors to the UI for important operations (`manualScrape`, `updateSchedule`).
- Keep the "Copy log to GitHub issue" flow intact (reads `chrome.storage.local.activityLog`).
- Keep countdown UI logic (`updateCountdown()` / `startCountdown()`) consistent with `background.js` scheduling algorithm.

Key symbols
- `waitForBackgroundScript()`, `sendMessageToBackground()`, `initializeSettings()`, `updateCountdown()`

Manual verification
1. Open `settings.html` via extension Options page.
2. Verify "Copy log to GitHub issue" copies the activity log and opens issue creation tab.
3. From the settings console, run a `ping` and a `manualScrape` via `chrome.runtime.sendMessage` and confirm responses.

PR checklist (file-specific)
- Do not remove user-facing diagnostics (alerts and copy-log features).
- Update `sentry-init.js` references only if changing Sentry configuration; avoid editing `sentry.js`.
- Include manual test steps in PR description.
