# M9-4 Owner Pilot Readiness Closeout Evidence

## Why

M9 should close only when the owner/self pilot can exercise the same product loop that a daily learner uses: speaking sample, Speaking Skill OS evidence, generated mission, generated scene, learner report, cockpit, and final pilot review.

## What Changed

- Added `scripts/phase9-pilot-aios-readiness-smoke.mjs` as the M9 readiness bridge gate.
- Added the smoke to `phase1-scaffold-smoke` required files so clean scaffold checks cannot drop it.
- Updated `STATUS`, `ISSUE-INDEX`, and the generated engineering dashboard SSOT to show M9-2 and M9-4 as locally closed mechanics.

## Verification

```bash
node scripts/phase9-pilot-aios-readiness-smoke.mjs
node scripts/phase9-pilot-prompt-ux-smoke.mjs
node scripts/phase9-owner-pilot-smoke.mjs
node scripts/product-surface-smoke.mjs
node scripts/ops-dashboard-smoke.mjs
```

## Claim Boundary

M9 readiness means the local owner/self pilot mechanics are connected and reviewable. It does not mean a real owner pilot has already produced outcome evidence, and it does not claim learning gains.
