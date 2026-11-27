# 0002: Every tuning number and ad ID lives in CONFIG

**Date:** 2026-07 · **Status:** Accepted

**Decision:** The `CONFIG` block at the top of the script holds every tuning constant and every ad/billing ID. `JUICE_*` values are presentation only.

**Why:** tuning for retention means constant small changes; one place makes them safe and lets Eugene tune without reading the code.
