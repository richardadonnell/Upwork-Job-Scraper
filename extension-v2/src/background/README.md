Background code lives here. The final `manifest.json` to load in Chrome should reference the built files under `dist` (e.g., `dist/background/worker.js`).

During development you can build with `npm run build` and then load `extension-v2/src/background/manifest-copy.json` in Chrome (adjust paths if needed). This is a minimal hack to simplify loading while iterating.
