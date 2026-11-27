#!/usr/bin/env bash
# Orbit Rush check: the one command that must pass before any commit.
set -euo pipefail
cd "$(dirname "$0")/.."
node tools/check.mjs
