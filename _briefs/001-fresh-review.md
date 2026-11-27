# 001: Fresh review

**Status:** done (2026-11-28, commits 3c158cf, f6702d8; report `_reports/2026-11-28-001-fresh-review.md`)

**Goal:** review the whole game as it stands (`www/index.html`, the Android wrapper config, `scripts/`, store metadata) using `REVIEW.md`, with an eye on what blocks or risks the first Google Play release. You did not write this code: your job is to find problems, not to approve.

**Read:** `CLAUDE.md`, `GLOSSARY.md`, `CODING_STANDARDS.md`, `docs/adr/`, `README.md`, then the code section by section.

**Done when:** a report is in `_reports/` in the format of `_reports/README.md`, covering `REVIEW.md` sections 1–4, and `bash tools/check.sh` passes. Fix only what you rate two-way and small. Everything else goes under "Needs Eugene", each with a proposed automated check or rule.

**Out of scope:** new features, retuning difficulty or economy, real ad/billing IDs, keystores, anything pushed to `main`.
