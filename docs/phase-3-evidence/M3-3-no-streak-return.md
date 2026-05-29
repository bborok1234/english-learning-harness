# M3-3 No-Streak Return Guidance

Date: 2026-05-29
Issue: #39

## Decision

Continue.

The daily cockpit already avoided explicit streak punishment, but it did not expose a structured return state. M3-3 makes the return path testable with `gap_kind` and `restart_action`.

## Implementation

- Added `return_state.gap_kind` with `fresh`, `same-day`, `next-day`, and `long-gap`.
- Added `return_state.restart_action` so returning learners see one safe next move.
- Kept gap detection tied to `progress.last_session_at`.
- Rendered the restart action in learner `home.html`.
- Added `scripts/phase3-no-streak-return-smoke.mjs`.

## Verification

Run:

```bash
node scripts/phase3-no-streak-return-smoke.mjs
node scripts/phase3-daily-cockpit-smoke.mjs
node scripts/phase3-learner-home-smoke.mjs
node scripts/phase2-tutor-policy-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- fresh, same-day, next-day, and long-gap fixtures return the expected `gap_kind`;
- same-day, next-day, and long-gap copy includes no-streak safety;
- fixture proves `progress.last_session_at` drives gap detection;
- unsafe guilt/ranking/punishment phrases do not appear;
- learner home includes the restart action.

## Claim Boundary

This proves deterministic return-copy behavior. It does not prove long-term retention or habit formation.
