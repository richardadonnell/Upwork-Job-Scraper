# Upwork Job Scraper — Copilot Instructions

## Project Overview

**Use subagents for tasks!**

Chrome MV3 extension built with **WXT + React 19 + TypeScript**. All active source lives in `app-v3/`. The `KEEP-DO-NOT-DELETE/` folder contains the legacy v1 extension for reference only — do not modify it.

**ALWAYS** use `context7` mcp tools to check the official docs and reference code examples before writing new code. The docs are comprehensive and up-to-date, and the tools can save you a lot of time.

## Context7 URLs to Official Docs

- [WXT](https://context7.com/websites/wxt_dev)
- [React](https://context7.com/websites/react_dev)
- [TypeScript](https://context7.com/websites/typescriptlang)

## Architecture

Three layers communicate via Chrome messaging APIs:

```
background.ts (service worker)
  │  browser.alarms → runScrape()
  │  browser.runtime.onMessage → manualScrape | settingsUpdated
  ▼
scraper.ts (runScrape)
  │  Creates a hidden tab → waits for load → scripting.executeScript
  ▼
upwork-scraper.content.ts (runtime-registered content script)
  │  Parses DOM → returns ScrapeResult
  ▼
storage.ts → webhook (fetch) → notifications
```

**Key design decision**: The content script uses `registration: 'runtime'` — it is NOT declared statically in the manifest. `scraper.ts` injects it on-demand via `browser.scripting.executeScript({ files: ['content-scripts/upwork-scraper.js'] })`.

## Storage Schema (`app-v3/utils/storage.ts`)

| Key | Store | Type | Notes |
|-----|-------|------|-------|
| `sync:settings` | sync | `Settings` | Synced across devices; defaults in `DEFAULT_SETTINGS` |
| `local:seenJobIds` | local | `string[]` | Deduplication set; keyed on `Job.uid` |
| `local:jobHistory` | local | `Job[]` | Capped at `JOB_HISTORY_MAX = 100` (newest first) |

Always use the typed WXT storage wrappers (`settingsStorage`, `seenJobIdsStorage`, `jobHistoryStorage`) — never call `browser.storage` directly.

## Data Types (`app-v3/utils/types.ts`)

All shared interfaces live here: `Job`, `Settings`, `ScrapeResult`, `MessageType`. Import from `../utils/types` (never redeclare inline).

## DOM Parsing Quirks

Upwork has a **typo in their own HTML** — the published date attribute is `data-test="job-pubilshed-date"` (misspelled). This is intentional in the scraper; do not "fix" it.

Job tiles are identified by `article[data-ev-job-uid]`. If none are found and a login link is present, `ScrapeResult` returns `{ ok: false, reason: 'logged_out' }`.

## Messaging Contract

Only two message types exist (defined in `MessageType`):
- `{ type: 'manualScrape' }` — triggers `runScrape()`, responds `{ ok: boolean }`
- `{ type: 'settingsUpdated' }` — triggers `setupAlarm()`, responds `{ ok: boolean }`

Both handlers return `true` from `onMessage` to keep the channel open for async response.

## Developer Workflows

**Production build** (from project root):
```powershell
.\build.ps1
```

**Dev mode with HMR** (options page only):
```powershell
cd app-v3
npm run dev
```

**Type-check without building:**
```powershell
cd app-v3
npm run compile
```

**Load in Chrome:** `app-v3/.output/chrome-mv3/` → Chrome DevTools → Extensions → Load unpacked.

## Versioning

The version lives in exactly one place: `app-v3/package.json` (`"version"` field). WXT propagates it to `manifest.json` at build time — never edit the manifest directly.

After making any code changes to `app-v3/`, bump the version following semantic versioning:
- **patch** (`x.x.X`) — bug fixes, copy tweaks, minor style changes
- **minor** (`x.X.0`) — new non-breaking features or behaviour
- **major** (`X.0.0`) — breaking changes

## Conventions

- Inline styles via `React.CSSProperties` objects (no CSS modules or Tailwind)
- `browser.*` globals are provided by WXT — no import needed in `entrypoints/` and `utils/`
- Settings changes always follow: update local state → `settingsStorage.setValue()` → `sendMessage({ type: 'settingsUpdated' })`
- All console logs are prefixed with `[Upwork Scraper]`
- MV3 permissions declared in `wxt.config.ts` manifest block, not a separate `manifest.json`
