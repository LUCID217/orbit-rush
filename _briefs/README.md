# Briefs

One file per job, written by the manager (or Eugene) for an agent to pick up, usually overnight.
Name: `NNN-short-name.md`. An agent works one brief per session, in number order, then moves on.

Each brief says: the goal, what "done" means (a check that can pass or fail), what's out of scope, and which files to read.
When a brief is finished, the agent adds `Status: done (<date>, commit <hash>)` at the top and writes its report in `_reports/`.
