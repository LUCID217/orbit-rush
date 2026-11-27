# 0001: The whole game is one HTML file, no build step

**Date:** 2026-07 · **Status:** Accepted

**Decision:** `www/index.html` holds all HTML, CSS and JS. Netlify publishes `www/`; Capacitor wraps the same folder for Android.

**Why:** tiny, fast, deploys anywhere, nothing to break between source and shipped build.

**Don't:** add a bundler, framework or CDN.
