# 0007: `main` is the public site

**Date:** 2026-11 · **Status:** Accepted

**Decision:** Every push to `main` deploys the web build on Netlify. Agents work on branches; Eugene merges.

**Don't:** push or merge to `main` from an agent run.
