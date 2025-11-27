# Upwork Job Scraper v2

A rewritten starter of the original Upwork Job Scraper — built with TypeScript, React (Vite), Tailwind, small ShadCN-style components, Sentry (placeholder) and Cheerio for optional server-side parsing.

This README documents the local dev workflow, build/packaging steps, how to load the extension in Chrome, and common troubleshooting tips.

Table of contents

- Prerequisites
- Quick start
- Loading the extension in Chrome
- Packaging helper (`npm run package:open`)
- Project layout & important files
- Developer tips
- Troubleshooting
- Sentry and telemetry
- Useful commands

Prerequisites

- Node.js (18+ recommended)
- npm (or your preferred Node package manager)
- Chromium/Chrome for loading the unpacked extension

Quick start

1. From the `extension-v2` folder install dependencies:

```powershell
npm install
```

2. Run the dev UI (Vite) for fast frontend iteration:

```powershell
npm run dev
```

3. Build for production (this builds the UI, compiles TypeScript, and assembles the `extension/` folder):

```powershell
npm run build
```

Loading the extension in Chrome

- After running `npm run build` the packaging script creates a ready-to-load folder at `extension-v2/extension`.
- In Chrome open chrome://extensions, enable Developer mode, click **Load unpacked**, and select the `extension-v2/extension` folder.

Notes about the UI and settings

- Clicking the toolbar icon now opens the settings page in a new tab (not a popup). The settings page is located at `dist/src/ui/main.html` inside the packaged extension.

Packaging helper: `npm run package:open`

- Purpose: convenience helper that opens the packaged `extension/` folder in Explorer and opens Chrome's Extensions page so you can quickly load the unpacked extension.
- What it runs: `pwsh ./scripts/load-extension.ps1` (PowerShell). The script will:
  - Verify `extension/` exists (if not, it prints a message and exits).
  - Open File Explorer at the `extension/` folder.
  - Open Chrome's extensions page (chrome://extensions) to make it easy to click **Load unpacked** and select the folder.

Usage

```powershell
# build first (creates extension/)
npm run build

# open the packaged extension folder and Chrome's extensions page
npm run package:open
```

Project layout & important files

- `src/` — TypeScript sources (background worker, content injector, scraping helpers, UI sources)
- `public/manifest.json` — source manifest used by the packaging script. The packaging script may rewrite paths to point at built assets.
- `scripts/generate-manifest.js` — assembles `extension/` from the built assets and compiled JS.
- `build-ts/` — intermediate TypeScript compilation output (created by `tsc --outDir build-ts` during build).
- `extension/` — final packaged extension folder (what you load in Chrome after `npm run build`).

Developer tips

- If you change background or content script code, run `npm run build` to regenerate `extension/` (service worker changes need a new package).
- For quick UI edits you can run `npm run dev` and open the UI URL shown by Vite, but to test extension integration you'll still need to `npm run build` and reload the unpacked extension.

Troubleshooting

- Blank or white popup/settings UI: open DevTools for the popup or the settings tab (right-click → Inspect) and check the console for missing asset errors or runtime exceptions. Also check the Service Worker console at chrome://extensions → Details → Service worker → Inspect.
- "Could not load background script": ensure you built the project and that `extension/manifest.json`'s `background.service_worker` points to an actual JS file inside `extension/background` or `extension/dist`.

Sentry and telemetry

- A Sentry placeholder is included. Add your DSN in `src/shared/sentry.ts` to enable error reporting in builds that include Sentry.

Useful commands

```powershell
# install deps
npm install

# dev UI (Vite)
npm run dev

# build and package the extension
npm run build

# open the packaged extension folder in Explorer (PowerShell)
ii .\extension\

