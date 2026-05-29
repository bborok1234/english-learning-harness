# M4-2 Text Event Persistence

Date: 2026-05-29
Issue: #49

## Decision

Continue.

M4-1 made text sessions write valid interaction events. M4-2 makes those events visible in learner-facing reflection surfaces so the event graph is not hidden implementation metadata.

## Implementation

- Weekly mirrors now include `interaction_event_summary`.
- Learner home renders an Interaction evidence section from the latest weekly mirror.
- Added `scripts/phase4-text-event-persistence-smoke.mjs`.

The summary includes:

- event count,
- modalities,
- trouble sources,
- mediation levels,
- saved phrases,
- transfer targets.

## Verification

Run:

```bash
node scripts/phase4-text-event-persistence-smoke.mjs
node scripts/phase4-interaction-event-schema-smoke.mjs
node scripts/phase2-weekly-mirror-smoke.mjs
node scripts/phase3-learner-home-smoke.mjs
node scripts/phase3-seven-day-simulation-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- text session artifacts contain valid interaction events;
- weekly mirror summarizes two text events;
- learner home renders Interaction evidence and transfer targets;
- unsupported progress claims do not appear;
- existing daily return smokes still pass.

## Claim Boundary

This proves event-backed persistence and summaries for text-first sessions only.
