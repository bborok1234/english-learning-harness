# M7-17 Korean-Primary README Evidence

Issue: #124
Decision: pivot

## Why

The target learner is primarily Korean. A public visitor should immediately understand, in Korean, that this is a Codex-native English speaking harness, not a Node CLI product. English remains useful as a secondary international/maintainer surface, but it should not be the main public entry point.

## Change

- Reframed `README.md` as the Korean-first public README.
- Added `README.en.md` as the secondary English README.
- Kept the first path as paste prompt into Codex, matching the agent-installed harness benchmark.
- Kept maintainer/internal engine commands below the learner-facing explanation.
- Updated README and distribution smokes so the bilingual public surface is verified.
- Included `README.en.md` in the public artifact package and artifact smoke.

## Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase7-public-artifact-smoke.mjs
```

## Boundary

This changes public positioning and documentation language. It does not add realtime voice, accent scoring, a binary installer, or real multi-day learner outcome proof.
