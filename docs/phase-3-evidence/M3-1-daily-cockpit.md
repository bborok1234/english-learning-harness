# M3-1 Daily Cockpit Command

Date: 2026-05-29
Issue: #37

## Decision

Continue.

The harness already had separate `today`, `review`, `vault`, `weekly`, and `context` commands. That was mechanically useful but still asked the learner to decide which command mattered today. M3-1 adds `daily` as a deterministic local cockpit that reads the learner store and returns the next practice action.

## Implementation

- Added `buildDailyCockpit()` to the learner store.
- Added `daily` to `scripts/english-learning-harness.mjs`.
- Setup now suggests `daily` before the lower-level `today` command.
- Added `scripts/phase3-daily-cockpit-smoke.mjs`.
- Added the daily cockpit output contract to `docs/DATA-CONTRACTS.md`.

The cockpit returns:

- return state and no-streak message,
- due review count and preview items,
- suggested scenario and selection reason,
- learner model summary,
- saved phrase count,
- latest weekly mirror and journal pointers,
- exact next commands.

## Verification

Run:

```bash
node scripts/phase3-daily-cockpit-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase2-scenario-planner-smoke.mjs
node scripts/phase2-weekly-mirror-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- fresh learner cockpit has zero sessions, zero due review, a suggested scenario, and next commands;
- returning learner cockpit sees one due phrase, points scenario selection at `due-review`, shows latest weekly mirror and journal, and includes review/today commands;
- output avoids unsupported learning claims.

## Claim Boundary

This proves local daily planning mechanics. It does not prove habit formation, measured retention, or real-world transfer.
