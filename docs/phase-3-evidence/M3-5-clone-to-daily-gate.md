# M3-5 Clone-to-Daily Gate

Date: 2026-05-29
Issue: #41

## Decision

Continue to M4 after merge closeout.

M3 should close only if a clean clone can reach the daily return experience, not merely setup or one text session.

## Implementation

- Added `scripts/phase3-m3-gate-smoke.mjs`.
- The gate smoke clones `origin`, runs the learner command path from the clone, and verifies:
  - setup,
  - daily cockpit,
  - today session,
  - next-day due review,
  - review success update,
  - phrase vault,
  - weekly mirror,
  - learner home,
  - seven-day simulation smoke,
  - dashboard generation,
  - ignored runtime tmp output.

## Verification

Run:

```bash
node scripts/phase3-m3-gate-smoke.mjs
node scripts/phase3-seven-day-simulation-smoke.mjs
node scripts/phase3-no-streak-return-smoke.mjs
node scripts/phase3-learner-home-smoke.mjs
node scripts/phase3-daily-cockpit-smoke.mjs
node scripts/phase1-clean-clone-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- clean clone reaches daily cockpit and learner home;
- due review and vault are visible;
- weekly mirror is generated;
- seven-day simulation passes from the clean clone;
- generated runtime artifacts remain under ignored `tmp/`;
- dashboard and SSOT point to M4 as the next milestone after gate closeout.

## Claim Boundary

This closes M3 local daily return readiness. It does not prove public marketplace distribution, real learner validation, or realtime voice.
