# 003: Revive payout exploit

**Status:** done (2026-11-28, commit 221bcb2; report `_reports/2026-11-28-003-revive-payout.md`)

**Goal:** fix items 6–7 of `_reports/2026-11-28-001-fresh-review.md`. Eugene approved on 28 Nov 2026.
- Coins and XP for a run are paid once in total: after a revive, a later game over pays only for what was earned since the last payout (score and perfects). The player's final total for a run must equal what a no-revive run with the same final score and perfects would pay.
- `runsPlayed` and "play N runs" missions count a run once, in `startRun`, not on every game over.
- The rewarded 2× XP offer is once per run and doubles only XP not already doubled.
- The game-over screen still shows sensible numbers (what this payout added, and the running total).

**Done when:** a deterministic node test (run from `tools/check.sh`) simulates die → revive → die → revive → die and asserts total coins, XP, `runsPlayed` and the 2× XP limit; it fails on the old code. `bash tools/check.sh` passes. Report, brief marked done, `NOTES.md` updated.

**Out of scope:** changing any `CONFIG` value, revive prices, anything in ads/billing beyond calling the existing functions. Never push.
