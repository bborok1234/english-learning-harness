# M3-2 Learner Home HTML

Date: 2026-05-29
Issue: #38

## Decision

Continue.

The shared project dashboard is for builder coordination. It is too long and too implementation-oriented for a learner. M3-2 adds a learner-owned `home.html` generated under the local learner root.

## Implementation

- Added `home.html` to the learner store path contract.
- Added `writeLearnerHome()` to generate a single local HTML file from structured local state.
- Added `home` to `scripts/english-learning-harness.mjs`.
- Added `scripts/phase3-learner-home-smoke.mjs` with HTML file and Playwright render checks.

The learner home shows:

- today's suggested scenario and start command,
- due review phrase preview,
- recent saved phrases,
- latest weekly mirror themes and next focus,
- local journey counts,
- claim boundary.

It intentionally excludes GitHub issue/PR logs, implementation progress, level ranking, native-speaker comparison, and guaranteed outcomes.

## Verification

Run:

```bash
node scripts/phase3-learner-home-smoke.mjs
node scripts/phase3-daily-cockpit-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase2-weekly-mirror-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- `home` writes `home.html` under the learner root;
- rendered page includes today action, due review, weekly mirror, saved phrases, and claim boundary;
- rendered page does not expose project process logs or unsupported claims.

## Claim Boundary

This proves a local learner-facing HTML surface. It does not prove hosted app readiness or real learner engagement.
