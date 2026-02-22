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

## v1 → v3 migration (settings + compatibility)

Version `3.x` includes a one-time migration that imports key user data from the legacy `1.x` storage format.

- Migrated from v1: search targets, webhook URLs, enable flags, schedule/frequency, notifications, and legacy job history
- Migration is idempotent: it runs once and stores a completion marker
- Imported legacy targets default to `legacy-v1` webhook payload mode to avoid breaking existing automations
- Newly created targets default to `v3` payload mode

Important: this migration only works when users update the **same Chrome Web Store extension listing** (same extension ID).

## Release identity gate (required)

Before publishing `3.x`, verify release identity:

- Publish as an update to the same Web Store item used by `1.x`
- Do not change extension identity between public versions (ID continuity is required for storage continuity)
- Treat identity continuity as a hard gate before release

## Webhook payload contract

For n8n filtering, branch on the top-level `status` field.

Per target, you can choose one of two webhook payload modes:

- `v3` (default): object envelope with `status`, `targetName`, `jobs`, `timestamp`
- `legacy-v1`: array payload compatible with existing `1.x` automations

- `status: "success"` → successful scrape payload with new jobs
- `status: "captcha_required" | "logged_out" | "error"` → issue payload
- `status: "no_results"` is not sent to webhook

### Complete v3 success payload (all keys)

```json
{
  "status": "success",
  "targetName": "Frontend React Jobs",
  "jobs": [
    {
      "uid": "~01exampleJobUid12345",
      "title": "Senior React Developer Needed",
      "url": "https://www.upwork.com/jobs/~01exampleJobUid12345",
      "datePosted": "Posted 2 hours ago",
      "postedAtMs": 1763901296000,
      "postedAtSource": "upwork_absolute",
      "description": "We are looking for an experienced React developer...",
      "jobType": "Fixed-price",
      "budget": "$500",
      "experienceLevel": "Intermediate",
      "skills": ["React", "TypeScript", "Node.js"],
      "paymentVerified": true,
      "clientRating": "4.95",
      "clientTotalSpent": "$10k+",
      "proposals": "10 to 15",
      "scrapedAt": "2026-02-22T11:34:56.000Z",
      "postedAtIso": "2026-02-22T09:34:56.000Z"
    }
  ],
  "timestamp": "2026-02-22T11:34:56.000Z"
}
```

Legacy v1-compatible success payload (array):

```json
[
  {
    "title": "...",
    "url": "...",
    "jobType": "...",
    "skillLevel": "...",
    "budget": "...",
    "description": "...",
    "source": {
      "name": "...",
      "searchUrl": "...",
      "webhookUrl": "..."
    }
  }
]
```

### Complete v3 issue payload (all keys)

```json
{
  "status": "captcha_required",
  "type": "issue",
  "targetName": "Frontend React Jobs",
  "reason": "captcha_required",
  "message": "Cloudflare verification requires manual interaction before scraping can continue.",
  "targetUrl": "https://www.upwork.com/nx/search/jobs/?sort=recency&page=1&per_page=50",
  "timestamp": "2026-02-22T11:34:56.000Z"
}
```

Issue payload status/reason values are one of:

- `captcha_required`
- `logged_out`
- `error`

### v3 field-by-field schema table (n8n/Make mapping)

Use the **JSON Path** column as your mapping reference in n8n/Make.

#### Envelope fields

| JSON Path | Type | Sent on | Notes |
| --- | --- | --- | --- |
| `status` | string | success + issue | `success` for job payloads, otherwise `captcha_required \| logged_out \| error` |
| `targetName` | string | success + issue | Name of the configured search target |
| `jobs` | array | success only | Array of job objects; omitted on issue payloads |
| `timestamp` | string (ISO-8601) | success + issue | Webhook send timestamp |
| `type` | string | issue only | Always `issue` |
| `reason` | string | issue only | Same value as issue `status` |
| `message` | string | issue only | Human-readable issue detail |
| `targetUrl` | string | issue only | Search URL for the affected target |

#### Success job fields (`jobs[]`)

| JSON Path | Type | Notes |
| --- | --- | --- |
| `jobs[].uid` | string | Stable unique job identifier used for dedupe |
| `jobs[].title` | string | Job title |
| `jobs[].url` | string | Job posting URL |
| `jobs[].datePosted` | string | Upwork posted text (human-readable) |
| `jobs[].postedAtMs` | number | Canonical posted time (epoch ms, UTC) |
| `jobs[].postedAtSource` | string | `upwork_absolute \| relative_estimate \| fallback_scraped_at` |
| `jobs[].description` | string | Job description text |
| `jobs[].jobType` | string | E.g. `Fixed-price`, `Hourly` |
| `jobs[].budget` | string | Budget/range text from listing |
| `jobs[].experienceLevel` | string | Upwork experience level |
| `jobs[].skills` | string[] | Extracted skills/tags |
| `jobs[].paymentVerified` | boolean | Client payment verification flag |
| `jobs[].clientRating` | string | Client rating text |
| `jobs[].clientTotalSpent` | string | Client spend text |
| `jobs[].proposals` | string | Proposal range text |
| `jobs[].scrapedAt` | string (ISO-8601) | Scrape timestamp |
| `jobs[].postedAtIso` | string (ISO-8601) | Same canonical posted time as `postedAtMs`, formatted as ISO |

### Webhook field reference (posted time)

- `postedAtMs`: Best available posted timestamp as Unix epoch milliseconds (UTC). Use this for sorting, filtering, and numeric comparisons.
- `postedAtIso`: Same best-available posted timestamp encoded as an ISO-8601 UTC string (`new Date(postedAtMs).toISOString()`). Use this for human-readable logs and systems that prefer string datetimes.
- `postedAtSource`: Indicates how `postedAtMs` / `postedAtIso` were derived:
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
KEEP-DO-NOT-DELETE/         # legacy v1 codebase (reference only)
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
