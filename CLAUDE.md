# Orbit Rush: agent brief

You are working on **Orbit Rush**, Eugene's one-tap hypercasual orbit game (ETS / Deadweight Developments). The whole game is `www/index.html`: plain HTML/CSS/JS, no build step. It's wrapped for Android with Capacitor 7. `README.md` is the reference for setup, release steps and languages.

## Current milestone
Pre-release. The web build is live on Netlify (every push to `main` deploys it). Aim: first ad-revenue launch on Google Play, starting with LATAM and Southeast Asia. Still on Google's test AdMob IDs and placeholder in-app product IDs. Brief 001 (fresh review) done 2026-11-28: Eugene to decide on the ads/billing/economy fixes in `_reports/2026-11-28-001-fresh-review.md` (interstitials never fire, coin packs not consumable, restore broken) before any Play upload. No open brief. Keep this line up to date at the end of every run.

## Read first, every session
1. `GLOSSARY.md`: the shared language. Use these exact terms.
2. `CODING_STANDARDS.md`: how code must be written.
3. `docs/adr/`: decisions already made and why. Don't reopen them.
4. `NOTES.md`: what the last run did and what's outstanding.
5. The task: the brief you were given in `_briefs/` (lowest-numbered open brief if none was named).

## Rules for every run
1. **Never push to `main`: it deploys to the public site.** Work on a branch; ask Eugene before any `git push`.
2. A task is done only when `bash tools/check.sh` passes (the Stop hook in `.claude/settings.json` enforces it).
3. If something fails twice, stop. Commit what works, write the blocker in `NOTES.md`, end the run.
4. Never touch keystores, `keystore.properties`, real ad IDs or `scripts/set-ad-ids.js`; the app ID `com.etsholdings.orbitrush` is one-way once uploaded (ADR 0004).
5. Every player-facing word goes through `tr()` with a key in every `STR` language block.
6. Build only what the task asks for. Ideas go in `NOTES.md` under "Ideas".
7. At the end of every run, write a report in `_reports/` (done, blocked, needs Eugene), mark the brief done and update `NOTES.md`.

## Staying sharp
- One task per session. Read only what the task needs: the file is long, so use the section banners and `grep` to go straight to the right object (`CONFIG`, `STR`, `Game`, `Juice`, `UI`, `Ads`, `Billing`, `Crew`...).
- Hand over through files, not memory.
- A different, fresh agent reviews the work using `REVIEW.md`. Don't review your own work.

## Tone
Clean arcade feel. Fair, never rigged: retention comes from pacing rewards and difficulty, not from manipulating the player (ADR 0006).
