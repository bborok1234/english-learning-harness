# M8-3 Speaking Skill OS Seven-Day Evidence

Issue: #132
Decision: continue

## Why

M8-1 and M8-2 prove mechanics in short flows. The local end-to-end gate needs to show that Speaking Skill OS can run across a multi-day journey, preserve backlog state, retry failed transfer work, produce a weekly mirror, and export evidence.

## Change

- Added `scripts/phase8-speaking-skill-os-seven-day-smoke.mjs`.
- The smoke seeds a multi-skill backlog through `diagnose`.
- It runs seven daily `daily`/`today` cycles.
- It intentionally fails clarification once, verifies it remains `needs_review`, then passes it later.
- It verifies weekly mirror and export evidence include Speaking Skill OS summary fields.

## Verification

```bash
node scripts/phase8-speaking-skill-os-seven-day-smoke.mjs
```

Current fixture result:

- seeded backlog count: 4,
- passed backlog count: 4,
- transfer attempt count: 5,
- one failed transfer attempt retained before later pass,
- weekly mirror generated,
- evidence pack generated.

## Boundary

This proves a local seven-day Speaking Skill OS fixture. It does not prove real learner outcomes or generalized English proficiency.
