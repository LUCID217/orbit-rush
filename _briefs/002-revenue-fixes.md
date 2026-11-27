# 002: Revenue fixes (ads and billing)

**Status:** done (2026-11-28, commits 7748e37, bc93753, 7760131, af4b4b7, d239236, 640a675; report `_reports/2026-11-28-002-revenue-fixes.md`)

**Goal:** fix items 1–5 of `_reports/2026-11-28-001-fresh-review.md`. Eugene approved all five on 28 Nov 2026.
1. Interstitial listeners use the event names the pinned `@capacitor-community/admob` 7.2.0 actually emits.
2. Coin packs are bought as consumables (`isConsumable:true`); Remove Ads is not.
3. Restore works: after `restorePurchases()`, read `getPurchases({productType:"inapp"})` and re-grant Remove Ads if owned. Also do this silently at boot on native, so a reinstall gets its ad-free state back with no tap. Never show an error or a toast for the silent boot check.
4. Grant only on a completed purchase (`purchaseState` "1" / PURCHASED, per the 7.19.3 API). At boot on native, reconcile `getPurchases()`: grant and consume any completed coin pack not yet granted, and set Remove Ads if owned. Never grant the same purchase twice: remember granted purchase tokens/order IDs in the save (a new optional field with a default in `DEFAULT_SAVE`; `SAVE_KEY` must not change). Pending purchases show a short "payment pending" message from `STR` in all five languages.
5. Ads retry after a failed load: add the FailedToLoad listeners for interstitial and rewarded, and retry with backoff (values in `CONFIG`, e.g. 5 s doubling to a cap of 120 s; reset on success).

**Verify the API first:** confirm every event name, option and return shape against the pinned packages' own type definitions (`npm pack @capacitor-community/admob@7.2.0` and `@capgo/native-purchases@7.19.3`, read the `.d.ts`). Don't rely on memory or newer docs. Note what you confirmed in the report.

**Done when:**
- The five fixes are in `www/index.html`, each its own commit.
- In `tools/check.mjs`, the three warnings from brief 001 (wrong AdMob event names, packs without `isConsumable:true`, reading the result of `restorePurchases()`) become `fail()`, plus a new fail if a `prepare*` ad call has no matching FailedToLoad listener. Make each check pass today and fail on the old code (test that by reverting temporarily).
- `CODING_STANDARDS.md` gets: "Grant IAP only on a completed purchase; reconcile getPurchases() at boot; never grant a purchase token twice."
- `bash tools/check.sh` passes. Web build still works with no plugins (ads/IAP hide themselves; nothing throws).
- Report in `_reports/`, brief marked done, `NOTES.md` updated, including a short "test on a device before upload" list (real interstitial shows, buy the same coin pack twice, reinstall then Restore, a pending/slow payment with a Play test card, airplane mode at launch then reconnect).

**Out of scope:** the revive/XP economy bugs (brief 003), consent/UMP, real ad or product IDs, the app ID, `SAVE_KEY`, any other ad cadence changes. Never push.
