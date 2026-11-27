# NOTES: Orbit Rush

The living state of the project. Each run updates it.

## State (2026-11-27)
- Web build live on Netlify from `main`. Android wrapper (Capacitor 7) set up; not yet on Play.
- Five languages: en, es, pt-BR, id, fil. Store listing text in `fastlane/metadata/android/`.
- Release blockers (from README): real AdMob IDs, real in-app product IDs, launcher icon, privacy policy, Play Console forms.
- Agent kit added: `GLOSSARY.md`, `CODING_STANDARDS.md`, `REVIEW.md`, `docs/adr/`, `_briefs/`, `_reports/`, `tools/check.sh`, `.claude/settings.json`.

## Plan (Eugene)
- Prime candidate for active users and ad revenue before end of 2026.
- User acquisition: LATAM and Southeast Asia first, baseline paid-install spend US$100/day.

## Review
- 2026-11-28, brief 001 (fresh review): full report in `_reports/2026-11-28-001-fresh-review.md`.
  - Accepted and committed (two-way, small): HUD combo outline now translated; home "REBIRTH ×/XP ×" text moved to `STR`; Android back no longer exits during the death slow-mo or from the shop (`3c158cf`). `tools/check.mjs` now checks `data-i18n` keys and warns on plugin-API mistakes (`f6702d8`).
  - Waiting on Eugene (ads/billing/economy, so big blast radius): coins and 2× XP paid again after each revive (brief 003); `structuredClone` stops old WebViews from booting; items 9–22.
- 2026-11-28, brief 002 (revenue fixes), report `_reports/2026-11-28-002-revenue-fixes.md`. Items 1–5 fixed:
  - `7748e37` interstitial event names
  - `bc93753` coin packs consumable
  - `7760131` restore via `getPurchases()`, plus a silent check at boot
  - `af4b4b7` grant only on `purchaseState "1"`, reconcile at boot, `S.iapGranted` token list, `iap_pending` message
  - `d239236` FailedToLoad listeners and retry backoff (`ADS_RETRY_*`)
  - `640a675` the check now fails on all of these

## Test on a device before upload (brief 002)
- A real interstitial shows: die 3 times with 60 s or more since the last one, decline revive, and the ad appears; after it closes, the next one loads.
- Buy the same coin pack twice with a Play license tester: both go through and coins are added each time. Kill and relaunch: no extra coins.
- Buy Remove Ads, uninstall, reinstall: the banner is gone at launch with no tap and no toast. Then tap Restore: it shows "Ads removed".
- A pending or slow payment ("Slow test card, approves after a few minutes"): the pending message shows and no coins are added. After it approves, relaunch: coins are added once and the pack can be bought again.
- Airplane mode at launch, then reconnect: within about 2 minutes, CONTINUE and 2× XP work again (logcat shows `[ads] … retry in Ns`).

## Interpretations
- Brief 002: the "silent" boot check shows no toast for anything, including coins from a pending payment that cleared. Asked Eugene whether he wants a toast (002 report, Needs Eugene 1).
- Brief 002: Remove Ads is restored from ownership (`getPurchases`) every time and never gated on the token list. Only coin packs use `S.iapGranted`.

## Known bugs
- See "Needs Eugene" items 6–9 in `_reports/2026-11-28-001-fresh-review.md` (found 2026-11-28, not fixed yet). Items 1–5 were fixed by brief 002.

## Ideas
- Run `Billing.reconcile(true)` on app resume too, so a pending payment that clears while the game is in the background is added without a relaunch.
- Show a toast when Restore fails (no network), rather than only logging it.
- "Rogue asteroid": after a couple of bad runs, randomly turn a miss into a hit. Not decided; must pass ADR 0006 (fair, never hidden rigging) before it's built.
