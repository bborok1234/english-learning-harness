# M10 Narrative Mission Test Spec

Last updated: 2026-06-02
Status: active M10 test contract

## Test Principle

Narrative missions are valid only if they preserve the existing Speaking Skill OS evidence loop.

The test suite must prove:

```text
narrative mission evidence == plain Speaking Skill OS transfer evidence
```

The narrative layer may improve motivation and context. It must not weaken validation.

## Gate M10-1: Planning Contract

Pass when:

- `docs/M10-NARRATIVE-MISSION-PRD.md` exists.
- `docs/M10-NARRATIVE-MISSION-TEST-SPEC.md` exists.
- `docs/DATA-CONTRACTS.md` contains M10 mission/world/capability contracts.
- `docs/ISSUE-INDEX.md` lists M10 issues #143-#148.
- `docs/ops/project-state.json` has an M10 engineering dashboard gate.

Smoke:

```bash
node scripts/phase10-narrative-mission-plan-smoke.mjs
```

## Gate M10-2: Mission Spec Validator

Positive fixture must include:

- `schema_version: 1`
- `mission_id`
- `world_ref`
- `npc_ref`
- `backlog_item_id`
- `target_skill`
- `learner_visible_scene`
- `required_learner_action`
- `transfer_test`
- `win_condition`
- `real_world_transfer_target`
- `fallback_mode`
- `claim_boundary`

Negative fixtures must fail when:

- no backlog item exists,
- target skill does not match backlog item,
- win condition is not equivalent to transfer test,
- no real-world transfer target exists,
- mission requires image/voice/web with no text fallback,
- mission claims fluency or improvement from immersion.

Smoke:

```bash
node scripts/phase10-mission-spec-validator-smoke.mjs
```

## Gate M10-3: World State Contract

World state must stay small.

Positive fixture:

- one active arc,
- one NPC canon entry,
- taste tags,
- level band,
- safety constraints,
- updated timestamp.

Negative fixtures:

- more than one NPC in M10,
- no safety constraints,
- child mode enabled,
- long lore text before speaking action.

Smoke:

```bash
node scripts/phase10-world-state-smoke.mjs
```

## Gate M10-4: Narrative Mission Parity

The first narrative mission must:

- use next open Speaking Skill OS item,
- create a valid mission spec,
- ask the learner for one utterance,
- run the same transfer pass/fail logic as plain `today`,
- persist `speaking_backlog_evidence`,
- persist story consequence only after learner output.

Smoke:

```bash
node scripts/phase10-narrative-mission-parity-smoke.mjs
```

Pass condition:

- plain scenario and narrative mission both update the same backlog item status for equivalent learner output.

## Gate M10-5: No-Generation Fallback

Every M10 mission must run in light mode.

Positive fixture:

- no image,
- no voice,
- no web,
- no browser,
- text mission still completes and records evidence.

Negative fixture:

- mission requires generated image to understand the task,
- mission requires realtime voice to pass,
- mission cannot show a text scene card.

Smoke:

```bash
node scripts/phase10-no-gen-fallback-smoke.mjs
```

## Gate M10-6: Claim Guard

Rejected claims:

- "narrative immersion improves fluency"
- "engagement proves learning"
- "generated worlds increase retention"
- "child mode is ready"
- "realtime voice adventure is supported"

Smoke:

```bash
node scripts/phase10-narrative-claim-guard-smoke.mjs
```

## Gate M10-7: Dashboard Closeout

Dashboard may show:

- mission validator pass,
- parity pass,
- fallback pass,
- claim guard pass,
- remaining blocked claims.

Dashboard must not show:

- learner outcome proof,
- child mode readiness,
- realtime voice readiness,
- broad multimodal efficacy.

Smoke:

```bash
node scripts/phase10-narrative-mission-gate-smoke.mjs
```

## Manual Review Questions

Before M10 closes, answer:

1. Can the learner understand the mission without lore?
2. Does the mission require the target speech act?
3. Is the story consequence delayed until learner output?
4. Can the mission run without image, voice, web, or browser?
5. Does the output preserve Speaking Skill OS evidence semantics?
6. Are engagement claims blocked?

## Stop Condition

If narrative missions increase confusion, Korean fallback, or non-response compared with plain mission cards, M10 must pivot back to prompt UX before adding richer worlds.
