---
description: "Workspace instructions: prefer TypeScript ES modules (not CommonJS) when developing `extension-v2`"
applyTo: "extension-v2/**"
---

# extension-v2 — TypeScript / ESM guidance for Copilot

Scope
- These notes apply only to files under `extension-v2/`.

Quick rule
- Use TypeScript compiled to ES modules (ESNext / ES2022) — avoid producing CommonJS output for runtime assets (background service worker, content scripts, injected DOM scripts, UI bundles).

Why
- Chrome MV3 service workers and modern extension tooling work best with ESM-style code. Vite/ESBuild generate ESM bundles by default. tsc can emit ESM when configured; do not emit CommonJS for files that will run in the extension.

How to apply (concrete checklist)
- `tsconfig.json`: set "module" to `ESNext` (or `ES2022`), "target" to at least `ES2020`/`ES2022`, and keep `moduleResolution: "bundler"` or `node` depending on toolchain.
- `package.json` (in root and extension-v2): when running ESM Node scripts during dev, set `"type": "module"` if those scripts are ESM. For tooling that must remain CJS, keep scripts isolated.
- Build outputs that go into `extension/` must be runnable by Chrome: service worker and content scripts should be plain ES module JS files (no `require()`/CommonJS). Prefer producing bundled JS via Vite/ESBuild for background when possible.
- `public/manifest.json` used by the build should reference final built JS paths (e.g. `background/worker.js` or `dist/background/worker.js`) — do not reference `.ts` source files.
- For Node helpers (scripts under `scripts/`), prefer ESM but either CJS or ESM is OK as long as build scripts run reliably on CI/dev machine.

Edge cases
- If you must use `tsc` to produce runtime JS for the service worker, configure `tsconfig` so output is ESM (not `commonjs`). If a third-party tool forces CommonJS, wrap/convert with a small bundler step.
- Keep the UI (Vite) as the primary bundler for the popup/options/settings UI. Vite produces dist assets that are ESM-friendly.

Examples (recommended minimal settings)
- tsconfig.json (relevant fields):
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "esModuleInterop": true,
      "skipLibCheck": true,
      "outDir": "build-ts"
    }
  }

Verification
- After building, confirm `extension/manifest.json` points to JS files that exist in `extension/` and that those JS files use `import`/`export` (or are bundled ESM), not `require()`.

If in doubt
- Ask for a short check: I can read `tsconfig.json`, `package.json`, and the generated `extension/manifest.json` and suggest the minimal changes to ensure ESM output for runtime scripts.
