## Plan: Centralize Versioning in app-v3

We’ll make app-v3/package.json the single canonical version source and remove all other hardcoded version definitions in app-v3 configuration. WXT will then populate manifest version from package metadata automatically, which keeps runtime/UI version display, release workflow tagging, and Sentry release naming aligned without manual syncing. This is the simplest, lowest-risk path because your existing GitHub release workflow already reads package version today. The plan also includes a lightweight guardrail check so CI/build output confirms manifest version stays in sync with package version.

**Steps**
1. Baseline audit and freeze current version touchpoints.
   - Confirm current duplicated sources in [app-v3/package.json](app-v3/package.json) and [app-v3/wxt.config.ts](app-v3/wxt.config.ts).
   - Confirm runtime consumers already use manifest version in [app-v3/components/OptionsApp.tsx](app-v3/components/OptionsApp.tsx), [app-v3/components/OptionsSidebar.tsx](app-v3/components/OptionsSidebar.tsx), and [app-v3/utils/sentry.ts](app-v3/utils/sentry.ts).
2. Make package.json the only source of truth for extension version.
   - Remove explicit manifest version hardcoding from [app-v3/wxt.config.ts](app-v3/wxt.config.ts) (including EXTENSION_VERSION-style constants).
   - Keep manifest config otherwise unchanged so WXT derives version from package metadata.
3. Align Sentry fallback release computation to the same source.
   - Update fallback release logic in [app-v3/wxt.config.ts](app-v3/wxt.config.ts) to derive from package version (not a duplicated literal).
   - Preserve CI override behavior via WXT_SENTRY_RELEASE so release pipeline naming remains intact.
4. Keep runtime version display behavior as-is.
   - No structural UI changes; continue reading browser.runtime.getManifest().version through existing flow.
   - Validate nothing in options UI relies on removed config constants.
5. Clean docs/examples that can drift.
   - Update stale version examples in [.env.example](.env.example) to avoid hardcoded numeric drift.
   - Update versioning guidance in [README.md](README.md) only where it implies multiple version sources.
6. Validate workflow compatibility explicitly.
   - Reconfirm [release-publish.yml](.github/workflows/release-publish.yml) still reads version from package and produces tag/release/Sentry values.
   - Confirm [ci-validate.yml](.github/workflows/ci-validate.yml) requires no logic changes.
7. Add a verification guard (process-level or script-level, minimal).
   - During build validation, compare generated manifest version in [app-v3/.output/chrome-mv3/manifest.json](app-v3/.output/chrome-mv3/manifest.json) with package version from [app-v3/package.json](app-v3/package.json).
   - Fail fast in CI/local validation if mismatch is detected.

**Verification**
- In app-v3 run compile/build pipeline and ensure success.
- Check generated manifest version equals package version.
- Confirm options UI still shows the expected extension version.
- Confirm release metadata path in [release-publish.yml](.github/workflows/release-publish.yml#L41-L54) remains unchanged and correct.

**Decisions**
- Canonical version source: [app-v3/package.json](app-v3/package.json).
- Version format policy: stable numeric x.y.z only.
- Local Sentry fallback: upwork-job-scraper@<package-version> when env override is absent.
- GitHub workflows: keep behavior; only validate alignment, no functional workflow redesign.
