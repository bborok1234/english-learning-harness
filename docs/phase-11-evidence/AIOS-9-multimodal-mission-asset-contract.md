# AIOS-9 Multimodal Mission Asset Contract

## Why

The harness already generated missions, scenes, reports, and first-use variants. The remaining risk was that image, voice, HTML, Remotion-style, or future realtime assets could become decorative media prompts that do not require learner output or write evidence.

## What Changed

- Generated mission JSON now includes `asset_contract`.
- The contract keeps `text-first` as the canonical completion path.
- Optional assets include interactive HTML scene, image information-gap, voice transcript, Remotion-style storyboard, and future realtime hook entries.
- Every asset must map to the same target skill, required learner action, expected session evidence, and claim boundary.
- `validateMissionAssetContract()` rejects decorative assets, assets without learner output, contracts without canonical text, missing evidence, and unsupported claims.
- Mission HTML now renders an asset evidence contract summary.

## Verification

```bash
node scripts/multimodal-mission-asset-contract-smoke.mjs
node scripts/generated-scene-artifact-smoke.mjs
node scripts/skill-conversation-variants-smoke.mjs
```

The smoke verifies the positive contract, rendered mission HTML, scene evidence alignment, and negative fixtures.

## Claim Boundary

This proves local multimodal mission asset contract mechanics. It does not prove realtime voice support, generated-media efficacy, retention, engagement, fluency, or real-world speaking improvement.
