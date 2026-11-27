#!/usr/bin/env bash
# Orbit Rush check: the one command that must pass before any commit.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/check.mjs
# Brief 003: a revived run pays coins/XP once, counts once, 2× XP once per run.
node tools/test-revive.mjs
