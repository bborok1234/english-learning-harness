# M8-2 Speaking Skill OS Queue Evidence

Issue: #130
Decision: continue

## Why

M8-1 proved one repair backlog item. A useful Speaking Skill OS must handle multiple simultaneous speaking weaknesses and keep unresolved failed transfer work ahead of generic practice.

## Change

- `diagnose` can now create multiple backlog items from one learner sample.
- Backlog sorting prioritizes `needs_review`, open high-priority items, and skill order before passed items.
- `diagnose` still returns the primary item for compatibility, plus `diagnoses` and `backlogItems`.
- Added `scripts/phase8-speaking-skill-os-queue-smoke.mjs`.

## Verification

```bash
node scripts/phase8-speaking-skill-os-smoke.mjs
node scripts/phase8-speaking-skill-os-queue-smoke.mjs
```

The queue smoke proves:

- one sample can create repair, clarification, soft disagreement, and follow-up backlog items,
- repair is selected first,
- passing repair advances daily practice to clarification,
- failing clarification keeps it at the front as `needs_review`.

## Boundary

This proves heuristic local queue mechanics. It does not certify speaking ability or prove long-term improvement.
