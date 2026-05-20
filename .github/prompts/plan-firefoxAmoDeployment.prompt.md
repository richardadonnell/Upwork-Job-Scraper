# Plan: Deploy Extension to Firefox Add-ons (AMO)

**TL;DR**: The build tooling is already there (`build:firefox`, `zip:firefox` scripts exist). You need: two small code fixes for Firefox compat, an AMO account + first manual submission, and CI/CD additions to mirror what you already have for Chrome.

---

## Phase 1: Code Fixes (2 files, ~10 lines total)

**1. `app-v3/wxt.config.ts` — add gecko extension ID**

Add `browser_specific_settings` inside the `manifest()` return block. Chrome ignores this field, so no conditional needed:
```ts
browser_specific_settings: {
  gecko: {
    id: "upwork-job-scraper@richardadonnell.com", // or UUID format — pick one, it's permanent
    strict_min_version: "128.0",  // required: async func in executeScript needs FF 128+
  },
},
```
Without this, Firefox will refuse to install the extension via AMO.

**2. `app-v3/entrypoints/background.ts` — guard notification button handler**

`browser.notifications.onButtonClicked` is Chrome-only. Firefox simply doesn't have this API, so `.addListener(...)` on `undefined` will throw at runtime. Fix with optional chaining:
```ts
browser.notifications.onButtonClicked?.addListener(...)
```
Note: Notifications are already created without `buttons`, so this handler never fires anyway — this is safety-only.

---

## Phase 2: Local Build & Smoke Test

1. `npm run build:firefox` — verify it builds clean
2. Load `app-v3/.output/firefox-mv3/` in Firefox Developer Edition (via `about:debugging` → Load Temporary Add-on)
3. Verify options page opens, settings save, and a manual scrape runs

---

## Phase 3: AMO Account + First Submission (manual, one-time)

1. Create a developer account at https://addons.mozilla.org/en-US/developers/
2. Run `npm run zip:firefox` to produce the Firefox ZIP
3. Create the extension listing (name, description, category, privacy policy URL)
4. Submit the ZIP — **AMO requires you also upload a source code ZIP** because you use a build tool that minifies. Zip the `app-v3/` directory (or the whole repo) as the source
5. Note the AMO extension ID assigned after submission — update `id` in `wxt.config.ts` if needed
6. Wait for the first manual review (typically 1–7 days for reviewed extensions)

---

## Phase 4: CI/CD — Full AMO Parity in `.github/workflows/release-publish.yml`

This mirrors the pattern already used for Chrome Web Store upload-only.

AMO auth uses a short-lived JWT you generate per request from a static issuer+secret pair (from AMO → Developer Hub → API Keys → Credentials).

Steps to add to the release workflow:
1. **Build step**: add `npm run zip:firefox` alongside the existing Chrome zip command
2. **Locate Firefox ZIP**: same pattern as "Locate Chrome ZIP" step, look for `*-firefox.zip`
3. **Upload Firefox ZIP to GitHub release**: same `gh release upload` command
4. **Generate AMO JWT**: inline Node.js script to sign `{iss, jti, iat, exp}` with HS256 — AMO tokens expire in 5 minutes
5. **Upload to AMO (upload-only)**: POST to `https://addons.mozilla.org/api/v5/addons/upload/`, get UUID, then `POST /api/v5/addons/addon/{id}/versions/` to create the version

New secrets/vars needed (add to the `production` GitHub Environment):
- `AMO_JWT_ISSUER` (secret)
- `AMO_JWT_SECRET` (secret)
- `AMO_EXTENSION_ID` (var — the addon slug or GUID)

**Optional but recommended**: also add a `build:firefox` + `zip:firefox` step in `.github/workflows/ci-validate.yml` so Firefox build failures are caught on PRs before merging.

---

## Relevant Files

- `app-v3/wxt.config.ts` — add gecko settings (Phase 1)
- `app-v3/entrypoints/background.ts` — optional chaining fix (Phase 1)
- `.github/workflows/release-publish.yml` — add FF build + AMO upload (Phase 4)
- `.github/workflows/ci-validate.yml` — add FF validation (Phase 4)

---

## Key Decisions

- **Minimum Firefox version: 128.0** — `scripting.executeScript` with a Promise-returning `func` (used in the Cloudflare check in `app-v3/utils/scraper.ts`) requires FF 128+. This is ~August 2024 Firefox, covering the vast majority of active users.
- **AMO publish remains manual** — same pattern as Chrome Web Store: CI uploads, you publish in the dashboard.
- **Source code submission to AMO is required** — provide a ZIP of the unminified source on first submission (and any submission AMO flags for review). Can request "self-hosted" review policy for faster turnaround if needed.
