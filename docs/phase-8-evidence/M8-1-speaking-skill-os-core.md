# M8-1 Speaking Skill OS Core Evidence

Issue: #128
Decision: continue

## Why

Generic English chat is not enough. The harness needs an explicit learning operations loop that turns observed speaking breakdowns into durable practice work, assigns the next drill, tests transfer, and records evidence.

## Change

- Added `speaking-backlog.json` to the learner store.
- Added `diagnose` command to create or refresh a Speaking Skill OS backlog item from learner output.
- Added `backlog` command to inspect open, needs-review, and passed speaking skill items.
- Updated `daily` and `today` so open speaking backlog items can drive scenario selection before generic practice.
- Updated session artifacts, weekly mirror, learner home, context, status, and export evidence with speaking backlog data.
- Added `scripts/phase8-speaking-skill-os-smoke.mjs`.

## Verification

```bash
node scripts/phase8-speaking-skill-os-smoke.mjs
```

The smoke proves:

- `diagnose` creates a repair backlog item.
- `daily` selects a scenario from that backlog item.
- `today` runs the transfer attempt.
- the session artifact stores `speaking_backlog_evidence`.
- `backlog` reports the item as passed.
- `export` summarizes backlog count and passed count.

## Boundary

This proves local Speaking Skill OS mechanics. It does not prove real-world fluency, accent quality, or long-term learner outcomes.
