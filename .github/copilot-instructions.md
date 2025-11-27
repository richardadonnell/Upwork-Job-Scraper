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

## MCP Tools Workflow

### Project Management with Plane (Required)
Use **Plane MCP tools** for all project and task management. This is mandatory for every step of development.

**Plane Workspace:** https://plane.richardadonnell.com/rad/projects/f998dcfa-1178-42dc-a275-a3f22a65e528/issues

**Workflow:**
1. **Before starting any work:**
   - Check existing issues in Plane for context
   - Create a new issue for the task if one doesn't exist
   - Break down large tasks into sub-issues

2. **During development:**
   - Update issue status as you progress (To Do → In Progress → Done)
   - Add comments to issues documenting decisions, blockers, or findings
   - Log work time using worklogs for time tracking

3. **After completing work:**
   - Update the issue with final notes
   - Link any related issues or dependencies
   - Move issue to appropriate state (Done, Review, etc.)

**Key Plane MCP tools to use:**
- `create_issue` — create new tasks/bugs/features
- `update_issue` — change status, assignees, priority
- `add_issue_comment` — document progress and decisions
- `create_worklog` — track time spent on issues
- `list_cycle_issues` — view sprint/cycle progress

### Task Planning (Always First)
Before starting any work, use the **manage_todo_list** tool to:
1. Break down the request into small, manageable steps
2. Create a todo list with specific, actionable items
3. Mark each todo as in-progress before starting, completed when done
4. Keep only ONE todo in-progress at a time

**Why this matters:**
- Prevents scope creep and getting lost in complex changes
- Provides clear checkpoints to verify progress
- Makes it easy to pause and resume work
- Ensures nothing gets forgotten in multi-step tasks

### Research Before Coding (Critical)
**Never make assumptions.** Before implementing any feature or fix:

1. **Use Perplexity search MCP** to research thoroughly:
   - Search for official documentation first (Chrome Extensions API, MDN, React docs, Vite docs)
   - Do NOT accept the first search result — perform multiple searches with different query angles
   - Cross-reference information across multiple authoritative sources
   - If uncertain, search again with more specific queries until 100% confident

2. **Prioritize official sources** (in order):
   - Official documentation (developer.chrome.com, react.dev, vitejs.dev)
   - GitHub repos/issues from the library maintainers
   - Stack Overflow answers with high votes and recent dates
   - Blog posts only if they reference official docs

3. **Verify before coding:**
   - Confirm API signatures match the version used in this project
   - Check for deprecations or breaking changes
   - Only proceed with code changes when fully confident in the approach

### Build & Test Cycle with BrowserOS
After making code changes, use this workflow:

```powershell
cd app
npm run build
```

Then use **personal-browserOS MCP tools** to:

1. **Reload the extension:**
   - Navigate to `chrome://extensions/`
   - Click the reload button for "Upwork Job Scraper"

2. **Test the settings UI:**
   - Navigate to extension settings page (URL changes during development, check manifest or use `chrome.runtime.getURL('dist/src/ui/main.html')`)
   - Current dev URL: `chrome-extension://nflajldeanelekfefhjcgneibgdkoccn/dist/src/ui/main.html`

3. **Test scraping functionality:**
   - Navigate to Upwork job search pages
   - Trigger manual scrape via settings UI
   - Verify console output in DevTools

### BrowserOS Tool Tips
- Use `browser_get_page_content` to verify DOM changes
- Use `browser_execute_javascript` to test extension messaging: `chrome.runtime.sendMessage({type: 'manualScrape'})`
- Use `browser_get_screenshot` to document visual states
- Check Service Worker console at `chrome://extensions/` → Details → Inspect views

## Reference Workspace

The `extension.js/` workspace contains example patterns for Chrome extension development. When implementing new features, reference its `templates/typescript/` for patterns.
