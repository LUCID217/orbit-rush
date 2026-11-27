#!/usr/bin/env bash
# Claude Code Stop hook: an agent can't finish its run while the check fails.
cd "$(dirname "$0")/.."
if ! out=$(bash tools/check.sh 2>&1); then
  echo "$out" | tail -20 >&2
  echo "tools/check.sh failed: fix it before finishing." >&2
  exit 2
fi
exit 0
