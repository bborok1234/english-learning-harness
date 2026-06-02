# M10-2 Mission Data Contracts

Date: 2026-06-02
Issue: #144
Decision: continue

## What Changed

- Added canonical JSON Schema files for `mission-spec`, `world-state`, and `tool-capabilities`.
- Added positive M10 fixtures for the first text-first mission: `usual-place-clarification`.
- Added runtime validators for world state and tool capabilities in `scripts/lib/narrative-mission.mjs`.
- Added `scripts/phase10-world-state-smoke.mjs` to reject over-scoped world state and missing text fallback.

## Verification

```bash
node scripts/phase10-world-state-smoke.mjs
```

Expected result:

- valid `daily-life.world-state.json` passes,
- valid `light.tool-capabilities.json` passes,
- multiple NPCs fail,
- child mode fails,
- long lore before learner output fails,
- disabled text capability fails,
- missing text scene fallback fails.

## Claim Boundary

This proves local data-contract enforcement only. It does not prove narrative learning outcomes, child mode readiness, realtime voice readiness, or multimodal efficacy.
