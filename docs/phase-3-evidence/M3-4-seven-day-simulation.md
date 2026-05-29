# M3-4 Seven-Day Local Return Simulation

Date: 2026-05-29
Issue: #40

## Decision

Continue.

Individual smokes proved commands in isolation. M3-4 adds a deterministic seven-day fixture to prove the local loop survives repeated use before real learner validation.

## Implementation

- Added `--date ISO` fixture support to command-wrapper paths that depend on time: `daily`, `home`, `today`, `review`, and `weekly`.
- Added `scripts/phase3-seven-day-simulation-smoke.mjs`.
- The simulation uses command-wrapper paths only for setup, daily cockpit, review listing/marking, today sessions, weekly mirror, and learner home generation.

## Verification

Run:

```bash
node scripts/phase3-seven-day-simulation-smoke.mjs
node scripts/phase3-no-streak-return-smoke.mjs
node scripts/phase3-learner-home-smoke.mjs
node scripts/phase3-daily-cockpit-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- seven sessions are persisted;
- review queue items are created and multiple due items are marked successful;
- at least one review interval reaches seven days;
- saved phrases and weekly mirror evidence are generated;
- learner model skill evidence grows;
- generated home pages stay under ignored `tmp/`;
- unsupported claims do not appear.

## Claim Boundary

This is simulated local validation. It does not replace real learner validation.
