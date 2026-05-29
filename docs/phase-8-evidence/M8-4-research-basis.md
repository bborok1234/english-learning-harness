# M8-4 Research Basis Citation Map

Issue: #134
Status: implemented on PR branch
Decision: continue

## Why

Speaking Skill OS should not look like a generic AI chat product with a few education words added later. The repo needs a clear source-to-feature map so a learner, maintainer, or reviewer can see why the harness uses output-first practice, repair, feedback, retrieval, and task-based scenarios.

## What Changed

- Added `docs/RESEARCH-BASIS.md` as the product evidence map.
- Linked the research basis from Korean and English README surfaces.
- Linked `docs/LEARNING-ENGINE.md` to the citation map and added a Speaking Skill OS research anchor.
- Added `scripts/phase8-research-basis-smoke.mjs` so required sources and claim boundaries do not silently disappear.

## Source Families

- CEFR Companion Volume and online interaction.
- Nation's four strands.
- Swain output / noticing work.
- Interactionist SLA review.
- Corrective feedback and learner uptake.
- Corrective feedback timing review.
- Retrieval practice / testing effect.
- Task-based language teaching.

## Claim Boundary

This work supports the design rationale. It does not prove real learner outcomes. Long-term speaking improvement still requires real multi-day learner pilot evidence.

## Verification

Expected checks:

```bash
node scripts/phase8-research-basis-smoke.mjs
node scripts/phase8-speaking-skill-os-seven-day-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
node scripts/phase7-learner-readme-smoke.mjs
node scripts/generate-dashboard.mjs
```
