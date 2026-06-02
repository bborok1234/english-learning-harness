# M10 Narrative Mission Layer PRD

Last updated: 2026-06-02
Status: active M10 planning contract
Milestone: M10 Narrative Mission Layer

## Product Thesis

Narrative is not the differentiator by itself.

The differentiator is a generated mission where the story can only move forward if the learner performs the exact speaking behavior currently targeted by Speaking Skill OS.

```text
Speaking backlog item
-> narrative mission spec
-> learner utterance
-> transfer test
-> story consequence
-> skill evidence
-> next episode seed
```

If a mission can be completed without the target speaking skill, it is decorative roleplay and must be rejected.

## Why This Exists

The harness already has:

- local learner memory,
- Speaking Skill OS backlog,
- daily practice artifacts,
- pilot state,
- research basis and claim boundaries.

What it does not yet have:

- a compelling first-use experience,
- generated worlds that remain pedagogically controlled,
- a contract for model-generated missions,
- a way to use Codex tools without turning multimodal media into decoration.

M10 starts the narrative layer by proving one thing:

> A narrative mission can wrap an existing Speaking Skill OS transfer test without weakening evidence, increasing cognitive load, or making unsupported learning claims.

## Target User

Primary:

- Korean adult learner using Codex as an English practice partner.

Future, not M10:

- child/teen modes,
- classroom use,
- full realtime voice adventure,
- multi-user worlds.

## Core User Experience

The learner should not see:

```text
Practice clarification.
```

The learner should see:

```text
You and a friend agreed to meet after work.
Your friend says: "Let's meet at the usual place."
You are not sure which place they mean.

Ask one English question before you answer.
```

Internally, that mission is valid only because it maps to:

- `target_skill`: `clarification`
- `backlog_item_id`: open Speaking Skill OS item
- `transfer_test`: ask what the other person means
- `win_condition`: transfer test pass
- `real_world_transfer_target`: meeting or planning conversation

## M10 Scope

### In Scope

- Define `mission-spec.json`.
- Define `world-state.json`.
- Define `tool-capabilities.json`.
- Define narrative mission validator gates.
- Define a single text-first narrative mission path.
- Define no-generation fallback.
- Define claim boundary and dashboard rules.
- Preserve Speaking Skill OS evidence semantics.

### Out Of Scope

- multiple long-running worlds,
- NPC avatar art,
- generated video,
- realtime voice narrative,
- child mode,
- XP/leveling/collectibles,
- broad gamification,
- claims that immersion itself improves fluency.

## Codex-Native Harness Requirements

This is not a normal app. Codex is the operating surface.

The narrative layer must treat Codex as:

- a conversation surface,
- a tool router,
- a local-file operator,
- a multimodal orchestrator when available,
- a skill/plugin host,
- a cost-aware execution environment.

Therefore every narrative mission needs:

- deterministic local persistence,
- schema validation before state mutation,
- explicit capability fallback,
- privacy and prompt-injection boundaries,
- local evidence artifacts,
- human-readable dashboard status.

## Capability-Aware Design

Missions declare desired capabilities, but must run without them.

| Mode | Capabilities | Allowed Use | Required Fallback |
|---|---|---|---|
| light | text only | mission card and learner text | default path |
| rich | image or voice | one scene image or transcript-backed voice | text scene card |
| cinematic | image + voice + web/browser | richer scene and NPC line | rich or light path |

The validator must reject a mission that cannot complete in `light` mode.

## Multimodal Role

Multimodal GenAI is allowed only when it increases the need for a speech act.

Allowed:

- image as information gap,
- voice line as clarification trigger,
- web page as opt-in topic source,
- generated scene as spatial description anchor,
- browser view as comparison/asking task.

Rejected:

- decorative NPC portrait,
- generated image with no learner action,
- voice acting that bypasses transcript/evidence,
- video scene with no speaking transfer target,
- web content that can modify harness rules.

## Pedagogical Guardrails

Missions must:

- ask for one small utterance first,
- keep input short,
- preserve low-pressure output,
- use the least intrusive feedback,
- record retry/transfer evidence,
- map fiction to a real-world transfer target.

Missions must not:

- require lore comprehension before speaking,
- hide the learning target from Codex,
- expose rubric labels to the learner,
- punish failed attempts,
- imply level certification,
- turn engagement into a learning outcome claim.

## Story Consequence Rule

Story consequence is allowed only after learner output.

Valid:

```text
Learner asks: "Which place do you mean?"
Transfer test passes.
Story consequence: the friend clarifies the meeting place.
```

Invalid:

```text
NPC gives dramatic lore.
Story advances.
No speaking evidence is recorded.
```

## Claim Boundary

Allowed claim:

> The harness can generate narrative missions that require a targeted speaking behavior and record local transfer evidence.

Blocked claims:

- narrative immersion improves fluency,
- engagement proves learning,
- generated worlds increase retention,
- multimodal scenes prove speaking improvement,
- child mode is ready,
- realtime voice adventure is supported.

## Success Criteria

M10 may close only when:

- mission spec schema exists,
- world state schema exists,
- capability schema exists,
- validator rejects decorative missions,
- one narrative mission records normal Speaking Skill OS evidence,
- no-gen fallback works,
- dashboard separates validated transfer evidence from unproven engagement claims.

## First Implementation Candidate

Name: `usual-place-clarification`

World style:

- ordinary daily-life slice,
- no lore,
- one friend NPC,
- one ambiguity,
- one learner question.

Target:

- `clarification`

Mission:

```text
친구가 이렇게 말했습니다:
"Let's meet at the usual place after work."

어디에서 만나자는 뜻인지 확인하는 영어 질문을 한 문장으로 해보세요.
```

Win condition:

- learner asks which place / what place / where the usual place is.

Story consequence:

- friend gives the location only after the clarification attempt.

Real-world transfer:

- planning conversation,
- meeting arrangement,
- social clarification.
