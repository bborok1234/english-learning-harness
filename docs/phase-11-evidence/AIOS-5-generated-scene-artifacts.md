# AIOS-5: Generated Scene Artifacts

Issue: #162

## Why

The AI-native OS goal calls for generated interactive artifacts that are not decorative. A richer artifact should make the daily speaking behavior more visible and easier to act on while still preserving the text-first evidence path.

AIOS-5 adds a generated scene/timeline artifact derived from the daily mission.

## What Changed

- `node scripts/english-learning-harness.mjs scene` writes `artifacts/scenes/daily-scene-YYYY-MM-DD.json/html`.
- Scene artifacts derive from the generated daily mission target skill, required learner action, and transfer test.
- Scene HTML includes interactive frame controls for:
  - scene entry,
  - speaking cue,
  - repair attempt,
  - transfer checkpoint.
- `practice` now refreshes scene artifacts together with mission, session evidence, weekly mirror, learner report, and cockpit.
- Learner reports and personal cockpit link the latest generated scene artifact.
- README Korean/English surfaces include scene artifacts as Codex-operated learner surfaces.

## Verification

Passing local checks:

```bash
node scripts/generated-scene-artifact-smoke.mjs
node scripts/codex-operated-practice-flow-smoke.mjs
node scripts/interactive-artifact-report-smoke.mjs
```

The new smoke verifies:

- scene JSON/HTML are generated under `artifacts/scenes/`;
- the scene has four learning frames and a required session-evidence path;
- rendered HTML exposes Previous / Play / Next controls;
- Playwright can move frames and toggle play/pause state;
- `practice` generates a scene artifact;
- learner report links the latest scene;
- personal cockpit links the latest scene;
- product surfaces do not leak GitHub/PR/issue/smoke language;
- unsupported outcome claims remain blocked.

## Claim Boundary

This proves local rich artifact mechanics and learning-loop linkage only.

It does not prove Remotion efficacy, generated-world retention, realtime voice, pronunciation quality, or real-world conversation transfer.
