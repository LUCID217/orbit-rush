# 0004: The app ID is permanent once uploaded

**Date:** 2026-11 · **Status:** Accepted

**Decision:** Package `com.etsholdings.orbitrush` (in `capacitor.config.json` and `android/app/build.gradle`). Once uploaded to Play it can never change. The same goes for `SAVE_KEY` once players have saves.

**Don't:** change either without Eugene's sign-off; changing them after release loses the listing or players' progress.
