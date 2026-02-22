# Plan: Rewrite Extension with WXT

**TL;DR:** Discard the current codebase. Scaffold a brand-new MV3 extension with WXT into a new folder (e.g., `app-v3/`). The same core concept is preserved — open a hidden background tab to the user's saved Upwork search URL (authenticated via the browser's shared cookie session), inject a content script, scrape job data, close the tab — but this time every feature that was only "designed" before (scheduler, webhook delivery, notifications, job history, full settings UI) is actually built. The DOM selectors are now verified from the real logged-in HTML.

---

## Steps

### 1. Scaffold project
Run `npx wxt@latest init app-v3` and select the TypeScript + React template. Confirm `wxt.config.ts` sets MV3 and includes permissions: `storage`, `tabs`, `scripting`, `alarms`, `notifications`, and host permission `https://www.upwork.com/*`.

### 2. Define storage
In `utils/storage.ts` using `wxt/storage`'s `storage.defineItem()`:
- `sync:settings` — `{ masterEnabled, searchUrl, checkFrequency: {days,hours,minutes}, webhookEnabled, webhookUrl, notificationsEnabled }`
- `local:seenJobIds` — `string[]` (the `data-ev-job-uid` values from each article) — used for deduplication
- `local:jobHistory` — `Job[]` (capped at 100) — for the history view in the options page

### 3. Write the scraping content script
At `entrypoints/upwork-scraper.content.ts` using `defineContentScript({ matches: ['https://www.upwork.com/*'], registration: 'runtime' })`. This replaces the two-step injection pattern with a proper WXT-managed content script. It extracts all job tiles using the verified selectors below and returns them along with a `loggedOut` boolean:

**Verified DOM selectors (from actual logged-in Upwork HTML):**

| Field | Selector | Notes |
|---|---|---|
| Job tiles (container) | `article[data-ev-job-uid]` | Each article element is one job |
| UID (for dedup) | `article.dataset.evJobUid` | Attribute: `data-ev-job-uid` |
| Title | `[data-test="job-tile-title-link"]` → `textContent` | |
| URL | `[data-test="job-tile-title-link"]` → `href` | Relative path — prefix with `https://www.upwork.com` |
| Date posted | `[data-test="job-pubilshed-date"]` → last `span` text | **Typo in attribute is intentional — Upwork's actual attribute name** |
| Description | `.air3-line-clamp-wrapper.clamp p` → `textContent` | No `data-test` available |
| Job type | `[data-test="job-type-label"]` → `textContent` | e.g., "Fixed price" |
| Budget (fixed) | `[data-test="is-fixed-price"] strong.rr-mask` → `textContent` | e.g., "$250.00" |
| Budget (hourly) | `[data-test="is-hourly"] strong.rr-mask` → `textContent` | Same pattern, different job type |
| Experience level | `[data-test="experience-level"]` → `textContent` | e.g., "Expert" |
| Skills/tags | `[data-test="token"] span` → `textContent` (all, into array) | Each skill is a button with `data-test="token"` |
| Payment verified | `[data-test="payment-verified"]` | Presence check (boolean) |
| Client rating | `[data-test="total-feedback"] .air3-rating-value-text` → `textContent` | e.g., "5.0" |
| Client total spent | `[data-test="total-spent"] strong.rr-mask` → `textContent` | e.g., "$200+" |
| Proposals | `[data-test="proposals-tier"] strong` → `textContent` | e.g., "Less than 5" |
| Logged-out check | Absence of `article[data-ev-job-uid]` + presence of login link | |

### 4. Write the background entrypoint
At `entrypoints/background.ts` using `defineBackground()`. Three responsibilities:
- **Alarm setup:** `setupAlarm()` creates/updates a named alarm using `browser.alarms.create()` based on `checkFrequency`. Called on install and on `settingsUpdated` message.
- **Alarm listener:** `browser.alarms.onAlarm` fires the full scrape pipeline.
- **Message listener:** handles `{ type: 'manualScrape' }` and `{ type: 'settingsUpdated' }`.
- **Toolbar click:** `browser.action.onClicked` calls `browser.runtime.openOptionsPage()`.

### 5. Write the scrape pipeline
In `utils/scraper.ts`: opens a hidden tab to `searchUrl`, waits for load via `browser.tabs.onUpdated`, executes the content script via `browser.scripting.executeScript({ files: ['content-scripts/upwork-scraper.js'] })`, reads the returned jobs, closes the tab. On success:
1. Filter out job UIDs already in `seenJobIds`
2. Append new jobs to `jobHistory` (cap at 100)
3. Update `seenJobIds`
4. POST to webhook if `webhookEnabled`
5. Fire `browser.notifications.create()` per new job if `notificationsEnabled`

### 6. Build the options page
At `entrypoints/options/index.html` + `index.tsx`. Two tabs:
- **Settings tab:** master toggle, search URL input, check frequency (days/hours/minutes), webhook toggle + URL input, notifications toggle, last-run info. Saves via `settingsStorage.setValue()` and sends `{ type: 'settingsUpdated' }` to background.
- **Job History tab:** renders `local:jobHistory` — shows title, date, budget, skills, link to the job on Upwork.

### 7. Configure `wxt.config.ts`
Set manifest metadata: name, version, description, action title.

---

## Verification Checklist

- [ ] `npm run dev` inside `app-v3/` starts WXT in watch mode with HMR for the options page
- [ ] Load `.output/chrome-mv3/` in Chrome via `chrome://extensions` → Load unpacked
- [ ] Options page opens on toolbar click
- [ ] Manual scrape from options page returns jobs, they appear in the history tab
- [ ] Job IDs are stored — re-running the scrape on the same page shows 0 new jobs
- [ ] Set frequency to 1 minute → alarm fires and auto-scrape runs
- [ ] Browser notification appears when new jobs are found
- [ ] Enable webhook + submit to a `webhook.site` URL → verify POST body contains job data

---

## Decisions & Rationale

- **Job UID from `data-ev-job-uid`** rather than parsing URLs — cleaner, directly on the `article` element, uniquely identifies each job for deduplication
- **`registration: 'runtime'`** for the content script — fires only on demand from background, not on every Upwork page load
- **`wxt/storage` over raw `chrome.storage`** — typed, reactive, supports unit testing via `fakeBrowser`
- **Typo preserved** — `data-test="job-pubilshed-date"` must be used exactly as it appears in Upwork's DOM (not "published")
- **New folder `app-v3/`** rather than overwriting `app/` — keeps the old code as reference during the rewrite
- **Options page** over popup or full-page tab — standard UX for settings-heavy extensions; user-selected

---

## Current Codebase Analysis (for reference)

### What existed in `app/` (the skeleton we are replacing)

**Working:**
- Scrape-on-demand pipeline: trigger → open hidden tab → inject script → extract jobs → close tab
- Typed storage schema (`ExtensionSettings` in `chrome.storage.sync`)
- Basic settings UI (React/Tailwind) with `searchUrl` and `webhookUrl` inputs

**Never implemented (schema only):**
- `checkFrequency` / alarm-based scheduler (permission declared but unused)
- Webhook delivery (`webhookUrl` stored but no `fetch()` call existed)
- `notificationsEnabled` (stored but no `chrome.notifications` call)
- `masterEnabled` toggle (stored but never checked before scraping)
- `feedSource` ('recent' vs 'custom') (stored but ignored — always used `searchUrl`)
- Job deduplication (no `seenJobIds` storage)
- Job history (no persistence of scraped results)

**Dead code:**
- `src/scraping/domScraper.ts` — exact duplicate of `dom-inject.ts`, never imported
- `src/content/content.ts` — stub with only a `console.log`, not in manifest
- `src/background/index.ts` — single-line re-export with no purpose
