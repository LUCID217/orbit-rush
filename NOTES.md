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
  - Waiting on Eugene (ads/billing/economy, so big blast radius): interstitial event names wrong for AdMob v7 (no interstitials ever show); coin packs not consumed (one purchase per player); Remove Ads restore reads a void result; pending (cash) purchases granted early; no ad reload after a failed load; coins and 2× XP paid again after each revive; `structuredClone` stops old WebViews from booting.

## Interpretations

## Known bugs
- See "Needs Eugene" items 1–9 in `_reports/2026-11-28-001-fresh-review.md` (found 2026-11-28, not fixed yet).

## Ideas
- "Rogue asteroid": after a couple of bad runs, randomly turn a miss into a hit. Not decided; must pass ADR 0006 (fair, never hidden rigging) before it's built.
