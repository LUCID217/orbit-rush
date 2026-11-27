# Coding standards

Every agent reads this before writing code. The reviewer checks every change against it. When a review or playtest finds a new mistake, add a rule here, or better, a check in `tools/check.mjs`.

## Language and naming
- Use the terms in `GLOSSARY.md` exactly.
- Top-level systems are `PascalCase` objects (`Game`, `UI`, `Ads`); functions and variables `camelCase`; config keys `UPPER_SNAKE`.

## Data, not hard-coding
- Every tuning number lives in the `CONFIG` block (ADR 0002). `JUICE_*` keys are presentation only and must never affect hit detection, scoring or difficulty.
- Every word the player sees lives in `STR` and is read with `tr("key")`; a new key goes in every language block (`check.sh` fails on a key missing from English and warns on gaps elsewhere).
- On-screen text that states a tuning number builds it from `CONFIG`.

## Fair play
- Hit detection and scoring use one function (`classifyShot()`); assists such as the traffic light read from it, never approximate it.
- No hidden rigging of outcomes. Any comeback mechanic is visible to the player and described in an ADR first (ADR 0006).

## Robustness
- `"use strict"`. Storage access is wrapped in `try/catch`; a corrupt or missing save falls back to `DEFAULT_SAVE`.
- Native plugins (AdMob, purchases, haptics, keep-awake) are optional: in a browser or on failure the game keeps running and the related buttons hide.
- No per-frame allocation in the game loop (pooled particles); respect `lowFX()` and `DPR_CAP`.
- Plugin versions stay pinned (ADR 0003).

## Checks
- `bash tools/check.sh` must pass before any commit.

## Scope
- Build only what the current brief asks for. Ideas go in `NOTES.md` under "Ideas".
