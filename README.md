# Upwork Job Scraper Extension

A Chrome extension (MV3) that automatically scrapes Upwork job listings from a saved search URL and delivers new results via browser notifications and/or a webhook.

## How it works

1. You provide a search URL from Upwork (e.g. a filtered job search)
2. The extension opens a hidden background tab to that URL on a set schedule
3. It injects a content script, extracts job listings, and closes the tab
4. New jobs (not seen before) are saved to history, and optionally sent to a webhook or shown as browser notifications

## Features

- Scheduled automatic scraping (configurable days / hours / minutes)
- Manual "Run scrape now" trigger from the options page
- Job deduplication — only new listings are surfaced per run
- Job history view (last 100 jobs)
- Webhook delivery (HTTP POST with job data as JSON)
- Browser notifications for new jobs
- Master enable/disable toggle

## Webhook payload contract

For n8n filtering, branch on the top-level `status` field.

- `status: "success"` → successful scrape payload with new jobs
- `status: "captcha_required" | "logged_out" | "error"` → issue payload
- `status: "no_results"` is not sent to webhook

Minimal success payload:

```json
{
  "status": "success",
  "targetName": "...",
  "jobs": [{ "uid": "...", "title": "...", "url": "...", "postedAtMs": 1700000000000, "postedAtIso": "2026-02-21T12:34:56.000Z", "postedAtSource": "upwork_absolute" }],
  "timestamp": "..."
}
```

Minimal issue payload:

```json
{
  "status": "captcha_required",
  "type": "issue",
  "targetName": "...",
  "reason": "captcha_required",
  "message": "...",
  "targetUrl": "...",
  "timestamp": "..."
}
```

### Webhook field reference (posted time)

- `postedAtMs`: Canonical posted time as Unix epoch milliseconds (UTC). Use this for sorting, filtering, and numeric comparisons.
- `postedAtIso`: Same canonical posted time encoded as an ISO-8601 UTC string. Use this for human-readable logs and systems that prefer string datetimes.
- `postedAtSource`: Confidence/source marker for the canonical posted time:
  - `upwork_absolute` → extracted from Upwork absolute timestamp data (most reliable)
  - `relative_estimate` → derived from Upwork relative text like "17 minutes ago"
  - `fallback_scraped_at` → fallback to scrape run time when no posted-time signal is available

## Project structure

```text (WXT + React + TypeScript)
  entrypoints/
    background.ts           # Service worker — alarms, messages, toolbar click
    upwork-scraper.content.ts  # Content script injected into Upwork tabs
    options/                # Options page (settings + job history)
  components/               # React UI components
  utils/
    types.ts                # Shared TypeScript interfaces
    storage.ts              # WXT typed storage wrappers
    scraper.ts              # Core scrape pipeline
  wxt.config.ts             # WXT build config + manifest metadata
app/                        # v2 codebase (deprecated, kept for reference)
build.ps1                   # Build script (see below)
```

## Building & loading

Run the build script from the project root:

```powershell
.\build.ps1
```

Then load (or reload) the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `app-v3/.output/chrome-mv3/`
4. On subsequent builds, click the **refresh icon** on the extension card

## Development

```powershell
cd app-v3
npm run dev       # Watch mode with HMR for the options page
npm run build     # Production build
npm run compile   # TypeScript type-check only (no output)
```
