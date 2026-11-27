# 003: Revive payout (2026-11-28)

Fixed items 6–7 of `_reports/2026-11-28-001-fresh-review.md` in `www/index.html` and added a node test that `tools/check.sh` runs. Branch `agent-kit`, nothing pushed, nothing run on a device.

**Bottom line:** a revive no longer pays the run's coins and XP again. A run that is revived twice now pays exactly what a run with no revives pays for the same final score and perfects. It counts as one run, and 2× XP can be taken once per run. No `CONFIG` value, revive price or `SAVE_KEY` changed.

## Done
- `221bcb2` **Fix 6 and 7, plus the test.**
  - **Coins:** new `runCoins(score, perfects)` (the old formula). `Game.payout()` pays `runCoins(now)` minus `runCoins(at last payout)`, so the sum across all game overs equals the no-revive amount exactly, rounding included.
  - **XP:** already granted live per landing, so it was never paid twice. The bug was 2× XP: it reset on every game over, and it doubled `runXPGained`, which included the earlier bonus.
    - The 2× flag now lives on the run (`Game.doubleXPUsed`, reset in `startRun`). `Ads` checks it and calls `Game.doubleXP()`.
    - The bonus goes into a separate `runXPBonus`, so only landing XP is ever doubled.
  - **Runs:** `S.runsPlayed++` and `Missions.progress({run:true})` moved to `startRun`. `S.deaths` still counts every death, so the interstitial cadence is unchanged.
  - **Over screen:** the first game over of a run looks as before (`+N XP`, `+N 🪙 (balance)`). After a revive it shows what this payout added and the run's total: `+110 XP · run total 385` and `+16 🪙 · run total 42 (9982)`. The new `STR` key `run_total` is in all five languages. The 2× XP button is greyed out once used in the run.
  - **Test:** `tools/test-revive.mjs` loads every inline script into a node `vm` with stub DOM, canvas and `localStorage`, plus a seeded `Math.random` and a fake AdMob. It then plays one run: land, die, 2× XP, ad CONTINUE, land, die, 2× XP again, coin CONTINUE, land, die. Then a second run. It asserts:
    - total coins, total XP, `runsPlayed` and the runs mission
    - that the second 2× XP in the run is refused
    - the over-screen lines
    - that a new run can take 2× XP again

    It is added to `tools/check.sh`.
  - **Proof against the old code:** `node tools/test-revive.mjs <file>` fails 8 asserts on `f0277ba` and on `fcab0a2` (the commit before mine). On the old code it got coins 83 instead of 42, XP 660 instead of 385, `runsPlayed` 3 instead of 1, and the second 2× was granted.
- Docs commit: this report, brief marked done, `NOTES.md`, `CLAUDE.md` milestone, and a new glossary term, **Payout**.
- `bash tools/check.sh` passes (0 fail, 3 warn: test ad IDs, `ADS_TESTING_MODE`, `structuredClone`; all three are known).

## Blocked
- Nothing.

## Needs Eugene
1. **Ads code was touched, minimally.** The 2× XP fix lives in `Ads`, so `Ads.doubleXPUsed` moved to `Game`, the reset was removed from `Ads.onGameOver`, and `grantPendingReward` now calls `Game.doubleXP()`/`UI.showPayout()`. There were no other ads or billing changes. I read this as inside the brief. Say if you want it done differently.
2. **2× XP once per run (as the brief says).** If a player takes it at the first death and then revives, XP earned after the revive can't be doubled at later deaths. The other option is "double only XP since the last payout" at each death, which earns more rewarded impressions. Your call.
3. **Runs now count at start.** A run abandoned from pause (Home or Restart) counts towards `runsPlayed` and "play N runs". Restart-from-pause can tick that mission, but it is no faster than dying on purpose was before.
4. **Translations of "run total"** (es "total de la partida", pt-BR "total da partida", id "total permainan", fil "kabuuan ng laro") are mine. A native check would help. I also added a device check to `NOTES.md` that the longer line fits on small phones.
