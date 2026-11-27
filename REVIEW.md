# Review checklist

Run by a **fresh** agent that did not write the code (start a new session). Its job is to find problems, not to approve. Write the report in `_reports/`, then fix only what it's asked to fix.

## 1. Spec review: did it build the right thing?
- [ ] What `README.md`, the `CONFIG` comments and the ADRs promise matches what the code does (difficulty curve, scoring, revives, ads cadence, purchases, languages, the email invite). Where they disagree, list both.
- [ ] Nothing was built that wasn't asked for.
- [ ] Every interpretation of an unclear rule is written down in `NOTES.md`.

## 2. Standards review: did it build it right?
- [ ] Follows every rule in `CODING_STANDARDS.md`.
- [ ] Names match `GLOSSARY.md`.
- [ ] No tuning numbers outside `CONFIG`; no player-facing text outside `STR`.
- [ ] Ads and purchases fail safe in a browser and when a plugin is missing; nothing is charged or shown twice.
- [ ] Release blockers are listed (test ad IDs, placeholder product IDs, default icon, privacy policy).
- [ ] `bash tools/check.sh` passes.

## 3. Merge danger
- **Door:** two-way (easy to undo) or one-way (hard to undo: the app ID, the save key or save format, anything uploaded to Play, real ad or billing IDs, anything pushed to `main`, which deploys publicly).
- **Blast radius:** small (one screen, one effect) or big (difficulty, scoring, economy, ads, billing, saves).

Two-way and small: fine to accept after a quick play. One-way or big: Eugene reviews before it's accepted.

## 4. Retro: make next time better
For every problem found, propose one of these, in order of preference:
1. An automated check (in `tools/check.mjs`, or a test). Deterministic beats instructions.
2. A new rule in `CODING_STANDARDS.md`.
3. A new term in `GLOSSARY.md`.
4. A new decision record in `docs/adr/`.
