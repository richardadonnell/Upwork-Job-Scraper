# Copilot Instructions — Upwork Job Scraper

## Project Overview

Chrome extension (MV3) that scrapes Upwork job listings and sends them to webhooks. Currently being rewritten as v2 under `app/` with TypeScript, React (Vite), and Tailwind.

## Architecture

```
app/
├── src/                    # TypeScript sources
│   ├── background/         # Service worker (worker.ts → scraperController.ts)
│   ├── content/            # Content scripts injected into Upwork pages
│   ├── scraping/           # DOM scraping logic (runs in page context)
│   ├── shared/             # Shared utilities (storage.ts, sentry.ts)
│   └── ui/                 # React settings UI (App.tsx, SettingsForm.tsx)
├── build-ts/               # tsc output (intermediate)
├── extension/              # Final packaged extension (load this in Chrome)
└── public/manifest.json    # Source manifest template
```

**Data Flow:**
1. Background worker (`worker.ts`) receives toolbar click or message
2. `scraperController.ts` opens Upwork tab, injects `dom-inject.ts` via `chrome.scripting.executeScript`
3. Injected script exposes `window.__upworkScrape()` which extracts jobs from DOM
4. Results returned to background, sent to webhook if configured

## Developer Workflow

```powershell
cd app
npm install
npm run build          # Builds UI (Vite) + compiles TS + packages to extension/
npm run package:open   # Opens extension/ folder + Chrome extensions page
```

**Testing changes:**
- UI changes: `npm run dev` for Vite HMR, but reload extension for integration testing
- Background/content script changes: Always run `npm run build` then reload extension in Chrome

## Code Conventions

### TypeScript & ESM (Critical)
- **All runtime code must be ES modules** — no CommonJS (`require`/`module.exports`)
- Use `.js` extensions in imports for Chrome compatibility: `import { fn } from './file.js'`
- `tsconfig.json` uses `"module": "ESNext"`, `"target": "ES2022"`

### Injected Scripts Pattern
Scripts injected via `chrome.scripting.executeScript` cannot use imports. Pattern used:
```typescript
// dom-inject.ts — self-contained, no imports
;(window as any).__upworkScrape = function() {
  // All logic inline, exposed as global
}
export {}  // Keeps TS happy
```

### Chrome Storage
Use the typed wrapper in `src/shared/storage.ts`:
```typescript
import { getSettings, setSettings, ExtensionSettings } from '../shared/storage.js'
```
Storage key: `upwork_v2_settings` in `chrome.storage.sync`

### UI Components
Small ShadCN-style components in `src/ui/components/` (Button, Input). Use Tailwind classes.

## Build Pipeline

`npm run build` runs:
1. `vite build` — bundles UI to `dist/`, background worker to `dist/background/worker.js`
2. `tsc --outDir build-ts` — compiles for fallback/type-checking
3. `scripts/generate-manifest.js` — assembles `extension/` folder, rewrites manifest paths
4. `scripts/validate-extension.js` — validates packaged extension

**Manifest handling:** `public/manifest.json` is the source template; `generate-manifest.js` rewrites paths to point to built assets.

## Key Files

| File | Purpose |
|------|---------|
| `src/background/worker.ts` | Service worker entry, message handlers |
| `src/background/scraperController.ts` | Orchestrates tab creation, script injection, scraping |
| `src/content/dom-inject.ts` | Injected into Upwork pages, extracts job data |
| `src/shared/storage.ts` | Typed chrome.storage wrapper |
| `src/ui/SettingsForm.tsx` | Main settings UI component |
| `scripts/generate-manifest.js` | Build script that packages extension |

## Upwork DOM Selectors

Job scraping relies on these selectors (may break if Upwork changes):
- Job list: `[data-test="job-tile-list"] article`
- Title: `h4` inside article
- Description: `[data-test="job-description-text"]`
- Login detection: `a[href*="/login"]`, `button[data-qa="login-button"]`

## Reference Workspace

The `extension.js/` workspace contains example patterns for Chrome extension development. When implementing new features, reference its `templates/typescript/` for patterns.
