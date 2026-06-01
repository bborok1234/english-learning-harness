# M9-1 Owner Pilot State And Command Surface

Issue: #136
Status: implemented on PR branch
Decision: continue

## Why

M8 proved local Speaking Skill OS mechanics through fixtures. The next product proof is a real local pilot for the repository owner / self participant, without assuming a personal name and without turning ordinary learning into manual script operation.

## What Changed

- Added `pilot-start`, `pilot-status`, `pilot-day`, and `pilot-finish` to the command wrapper.
- Added local `pilot-state.json` under the learner root.
- Added local pilot artifacts under `artifacts/pilot/`.
- Connected Day 0 baseline to Speaking Skill OS diagnosis.
- Connected final sample to the existing transcript review rubric.
- Kept participant identity generic: `repository owner / self pilot participant`.

## Verification

Expected checks:

```bash
node scripts/phase9-owner-pilot-smoke.mjs
node scripts/phase8-speaking-skill-os-seven-day-smoke.mjs
node scripts/phase5-transcript-rubric-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

## Claim Boundary

This creates a real pilot lane and report mechanics. It still does not prove generalized fluency or real-world speaking ability. The next real step is to run the actual owner pilot with real Day 0 and Day 7 samples.
