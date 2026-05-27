# Startup-Grade Plan

Last updated: 2026-05-27
Status: Approved by Ralplan Architect/Critic review

## Task Statement

Build English Learning Harness into a product that a user or their friend can discover from a GitHub URL, install locally, start learning immediately, speak/practice every day, improve real English conversation ability, and see their learning journey managed over time.

This plan replaces the earlier small-tool framing. The target is a serious AI language-education product.

## RALPLAN-DR Summary

### Principles

1. **Learning impact before feature spectacle**: every shipped feature must increase daily speaking, repair, reuse, or retention.
2. **Safety before correction**: anxious learners must keep talking; correction should support flow, not interrupt identity.
3. **Scenario before open chat**: real conversation ability improves through bounded tasks, repair, replay, and transfer.
4. **Memory before novelty**: personal phrase memory and spaced reuse matter more than endless fresh prompts.
5. **Evidence before claims**: the product must not call itself effective until persona fixtures and longitudinal pilots support the claim.

### Decision Drivers

1. **Daily return**: the learner must want to come back tomorrow.
2. **Transfer to real interaction**: practice must include turn-taking, clarification, repair, and scenario completion.
3. **Local trust**: GitHub-local install and inspectable learner data are differentiators.

### Viable Options

#### Option A — Codex-Local Learning Engine First

Build a GitHub-installable local harness with CLI/plugin flow, local learner data, scenario engine, review queue, and transcript-first practice.

Pros:

- Fits current repo and local-first promise.
- Faster to iterate on learning engine and data model.
- Strong privacy/trust story.

Cons:

- Developer-ish setup unless aggressively simplified.
- Voice UX is weaker until transcription wrapper exists.
- Codex hook trust-state is currently a platform blocker.

#### Option B — App Shell First

Build a small desktop/web app around the learning engine with polished Today, Session, Mirror, Review, Progress surfaces.

Pros:

- Better daily usability and emotional design.
- Easier for friends/non-developers.
- Clear product feel.

Cons:

- Requires frontend/app architecture before learning engine is proven.
- Risks building a pretty shell over a weak tutor.
- More moving pieces.

#### Option C — Voice Tutor First

Prioritize push-to-talk or realtime voice early with pronunciation/fluency telemetry.

Pros:

- Strong market resonance and more authentic speaking practice.
- Better competitive parity with Speak, Duolingo Video Call, ELSA, Praktika.

Cons:

- Current Codex realtime path is not stable.
- Voice scoring can be noisy and unfair for Korean-accented English.
- Risks delaying the core pedagogy.

### Recommended Synthesis

Use Option A as the spine, but design toward Option B and C:

- Phase 1 hardens the local learning engine and one-command GitHub install.
- Phase 2 adds scenario/review/persona validation.
- Phase 3 adds a minimal app-like daily dashboard or terminal UI.
- Phase 4 adds push-to-talk transcription and pronunciation microcoach.

Do not pursue full realtime voice until text/transcription learning mechanics prove useful.

## Evidence Matrix

| Evidence | What It Establishes | Product Implication |
|---|---|---|
| CEFR Companion Volume / online interaction descriptors | Interaction ability includes turn-taking, clarification, repair, mediation, and sustained spontaneous exchange. | Benchmark interaction behaviors, not only grammar or word count. |
| Nation four strands | Balanced learning needs meaning-focused input, meaning-focused output, fluency development, and language-focused learning. | Daily sessions need output plus review/input, not pure chatbot conversation. |
| Corrective feedback research | Feedback can improve learning, but timing/type matters; prompts and self-repair can be more durable than answer-giving. | Use prompt-first repair and delayed feedback; no correction dumps. |
| Willingness to Communicate research | Perceived competence, motivation, and anxiety strongly shape willingness to speak. | Build anxiety-aware warm starts and visible low-pressure wins. |
| Spaced practice/vocabulary meta-analyses | Spaced retrieval supports retention; incidental vocabulary gains need revisiting. | Mine conversations for personal phrases and schedule reuse. |
| Task-based learning and task repetition | Scenario repetition can improve oral fluency/accuracy/lexis when varied and spaced. | Build scenario replay with controlled variation. |
| AI tutor benchmarks: LLF-Bench, TutorGym, TutorBench | Generic chat benchmarks miss tutoring quality, hinting, adaptation, and multi-turn state tracking. | Build a tutor benchmark harness with persona fixtures and rubrics. |
| Competitor benchmark: Speak | Strong speaking-first positioning, AI tutor, personalized curriculum, open speaking. | Compete on daily speaking volume and tutor relationship, but differentiate with local memory and Korean anxiety model. |
| Competitor benchmark: Duolingo Max Video Call | Character-led AI conversation, adapts to skill, avoids direct grammar correction in conversation. | Character/persona and non-corrective conversation can make practice less scary. |
| Competitor benchmark: ELSA | Pronunciation scoring and speech analytics are powerful but narrow. | Add pronunciation microcoach later, one correction at a time. |
| Competitor benchmark: Praktika/TalkPal-like products | Avatars/characters simulate conversations but may lack durable learning journey. | Do not over-index on avatars; use memory, replay, and evidence. |

## Product Thesis

Most AI language apps help users talk to an AI.

English Learning Harness should help a learner become the kind of person who can keep talking when English gets uncomfortable.

That means the core product is not "chat". It is:

- safe start,
- scenario action,
- repair when stuck,
- recast without shame,
- personal phrase capture,
- spaced replay,
- weekly identity reinforcement.

## Killer Product Ideas

1. **Freeze Recovery Gym**: micro-practice for "Let me think", "I mean...", "Can you say that simply?", "I don't know the word, but...".
2. **CEFR Mission Ladder**: daily missions mapped to spoken interaction descriptors rather than school grammar units.
3. **Personal Phrase Vault**: phrases from the learner's own life become review cards and future conversation seeds.
4. **Scenario Replay Engine**: repeat a scenario with one changed constraint: different person, emotion, time limit, missing word, surprise follow-up.
5. **Prompt-First Repair Tutor**: before giving the answer, the tutor nudges: "Try saying that again with 'this morning'."
6. **Anxiety-Aware Warm Start**: session difficulty starts from learner energy and freeze history, not from arbitrary level.
7. **Korean Re-entry Bridge**: learner can ask in Korean, but the system always gives a small English re-entry phrase.
8. **One-Pattern Mirror**: after each session, show only one pattern to improve and one phrase to keep.
9. **No-Streak Habit Memory**: if absent, the product says "welcome back; let's restart easy" and uses prior wins.
10. **Fluency Telemetry**: response latency, repair phrase use, phrase reuse, and voluntary output trend.
11. **Conversation Debt Ledger**: tracks unfinished communicative intentions: "You wanted to explain X but didn't have words yet."
12. **Tiny Retry Button**: after mirror, redo one answer immediately with the new phrase.
13. **Life Topic Map**: learner's recurring personal topics become curriculum: coffee, work, family, hobbies, travel.
14. **Social Readiness Simulator**: practice "friend asks unexpectedly", "coworker interrupts", "barista asks follow-up" without shame.
15. **Accent-Safe Pronunciation Coach**: later voice module focuses intelligibility, stress, rhythm, and one sound at a time, not native accent.
16. **Weekly Identity Mirror**: "You are becoming someone who can ask for clarification."
17. **Human Handoff Pack**: exports a low-pressure practice brief for a real tutor/friend/language partner.
18. **Tutor Quality Benchmark**: tests the AI for overcorrecting, overhelping, ignoring profile, and failing to prompt repair.
19. **Private Speaking Ledger**: local transcripts, audio references, phrases, and progress remain inspectable.
20. **Seven-Day Proof Mode**: structured first week designed to prove return, comfort, and measurable output change.

## Target Architecture

### Core Local Engine

Files/modules to evolve:

- `scripts/lib/english-learning-store.mjs`
- `scripts/english-learning.mjs`
- `scripts/validate-progress.mjs`
- future `scripts/lib/scenario-engine.mjs`
- future `scripts/lib/review-queue.mjs`
- future `scripts/lib/persona-fixtures.mjs`

Responsibilities:

- profile and baseline,
- learner model,
- vocabulary history,
- review queue,
- scenario planner,
- session artifacts,
- progress validation/migration,
- weekly/monthly mirrors.

Data contracts:

- `docs/DATA-CONTRACTS.md` is the implementation boundary for learner model, vocabulary, review queue, and session artifacts.
- Scenario planner may read profile, learner model, vocabulary, and review queue.
- Review queue may only schedule phrases that appear in session artifacts or tutor-approved phrase suggestions.
- Progress dashboard may only display metrics backed by schema, write path, validation, and fixture evidence.

### Tutor Policy Layer

Responsibilities:

- anxiety-safe tone,
- correction timing,
- prompt-first repair,
- Korean fallback/re-entry,
- persona adaptation,
- CEFR interaction skill targets.

Policy artifact:

- `docs/TUTOR-POLICY.md` is the required behavior contract.
- Future prompt/code policy must enforce the correction ladder, Korean fallback rule, prohibited claims, and mini mirror rubric.

### Delivery Layer

Immediate:

- GitHub-local install,
- one command setup,
- one command daily session,
- health check,
- explicit fallback if hooks cannot be trusted.

Later:

- terminal UI or local app dashboard,
- push-to-talk transcription,
- voice feedback,
- non-developer wrapper.

### Evaluation Layer

Required:

- metric semantics tests,
- persona fixtures,
- tutor quality benchmark,
- seven-day pilot protocol,
- dashboard evidence.

Fixture contract:

- `docs/PERSONA-FIXTURE-SPEC.md` defines the executable fixture schema.
- Stage 1 must create fixture harness plumbing.
- Stage 2 must populate and pass the four target persona fixtures.

## Roadmap

### Stage 1 — Trustworthy Local Harness

Goal: a user can clone GitHub, run setup, and start a real daily session without editing internals.

Required work:

- PH1-FIX-1: choose explicit command wrapper fallback as the supported path unless hook trust-state is proven.
- PH1-FIX-2: vocabulary history and review queue.
- PH1-FIX-3: scenario-based daily loop.
- PH1-FIX-4: truthful Stop/finalization contract.
- PH1-FIX-5: one-command setup and health check.

Exit gate:

- clean clone smoke,
- installed package smoke,
- no false hook claims,
- repeated-vocab test passes,
- persona fixture harness exists, but four fixtures do not need to pass until Stage 2.

### Stage 2 — Learning Engine MVP

Goal: daily sessions are pedagogically meaningful.

Required work:

- scenario bank v1: 30 daily missions,
- CEFR interaction skill tags,
- repair phrase trainer,
- personal phrase vault,
- spaced review schedule,
- mini mirror v2,
- weekly mirror.

Exit gate:

- four persona fixtures pass,
- 7-day simulated learner run,
- rubric score for tutor policy passes.

### Stage 3 — Daily Product Experience

Goal: learner wants to return.

Required work:

- Today dashboard,
- low-pressure onboarding,
- progress journey view,
- no-streak return flow,
- local HTML or app shell,
- transcript import/export.

Exit gate:

- user can use without reading code,
- dashboard shows journey and next action,
- friction audit passes.

### Stage 4 — Voice/Transcription Expansion

Goal: speech practice becomes first-class without sacrificing evidence.

Required work:

- push-to-talk transcription,
- transcript alignment,
- fluency telemetry,
- pronunciation microcoach,
- optional TTS playback,
- ASR bias checks for Korean-accented English.

Exit gate:

- voice smoke,
- pronunciation feedback limited to one actionable point,
- privacy and storage controls.

### Stage 5 — Real Learning Validation

Goal: support claims about actual improvement.

Required work:

- 7-day pilot,
- before/after transcript comparison,
- comfort/avoidance survey,
- phrase reuse analysis,
- dropout interviews.

Exit gate:

- evidence report,
- claim boundaries updated,
- product roadmap adjusted.

## Acceptance Criteria For "GitHub URL To Learning"

A friend should be able to:

1. Open GitHub.
2. Clone the repo.
3. Run one setup command.
4. Run one daily session command.
5. Speak or type a few learner turns.
6. See a useful mirror.
7. See progress and saved phrases.
8. Return tomorrow with memory from yesterday.
9. Never need to inspect `.omx`.
10. Never be told an unverified learning-impact claim.

## Verification Strategy

### Unit / Schema

- vocabulary history semantics,
- review schedule due dates,
- progress migration,
- journal/artifact path safety,
- no unsupported per-session metrics.

### Integration

- clean clone setup,
- local marketplace package,
- explicit command fallback,
- daily session persistence,
- weekly mirror.

### E2E

- four persona first-run fixtures,
- seven-day simulated learner,
- absent-learner return,
- Korean fallback/re-entry,
- repeated scenario replay.

### Observability

- local run logs,
- health check,
- dashboard evidence,
- setup failure recovery.

## ADR

Decision:

Build the local learning engine first, with scenario-based transcript-first practice, durable learner memory, explicit command-wrapper fallback, and evidence gates before voice/app expansion.

Drivers:

- User wants actual daily use and improvement, not a demo.
- Current repo already supports local-first Codex/plugin direction.
- Realtime voice is unverified; learning engine should not wait on it.

Alternatives considered:

- App shell first: rejected for now because it risks hiding a weak tutor behind UI polish.
- Voice first: rejected for now because current realtime path is unproven and ASR/pronunciation introduce new risk.
- Generic chatbot wrapper: rejected because it will not differentiate or reliably improve speaking.

Consequences:

- More upfront design/research/testing work.
- Stronger chance of defensible learning claims.
- Clearer path to market differentiation: Korean anxiety model + local memory + scenario replay.
- Native hooks remain opportunistic until Codex hook trust-state is solved; the reliable product path is explicit setup/session commands.

Follow-ups:

- Implement PH1-FIX-1 as explicit fallback first, then revisit native hooks.
- Implement vocabulary/review queue.
- Build scenario engine and persona fixtures.
- Start seven-day pilot only after persona fixtures pass.

## Critic Gate Revision

Architect review required four concrete revisions. This draft now includes:

- Hook fallback decision: explicit command-wrapper fallback is the supported path unless hook trust-state is proven.
- Tutor-policy contract: `docs/TUTOR-POLICY.md`.
- Persona fixture/rubric contract: `docs/PERSONA-FIXTURE-SPEC.md`.
- Data contracts: `docs/DATA-CONTRACTS.md`.
- Multimodal GenAI plan: `docs/MULTIMODAL-GENAI-PLAN.md`.
- Stage boundary clarification: Stage 1 creates fixture harness; Stage 2 populates and passes four persona fixtures.

## Ralplan Consensus

Consensus gate record: `docs/RALPLAN-CONSENSUS-STARTUP-GRADE.md`.

Result:

- Architect: APPROVE.
- Critic: OKAY.
- Durable handoff: complete.

## Available Agent Types And Staffing

- `researcher`: learning science, competitor evidence, standards.
- `architect`: learning engine architecture, data model, delivery boundaries.
- `critic`: claim discipline, plan consistency, risk pressure.
- `designer`: onboarding/session/progress UX.
- `executor`: implementation.
- `test-engineer`: fixture and benchmark harness.
- `verifier`: completion evidence and dashboard claims.
- `writer`: README, onboarding scripts, pilot protocol.

Recommended follow-up:

- `$ultragoal`: durable sequential goal ledger for the roadmap.
- `$team`: parallel lanes for W1 platform reliability, W2 learning engine, W3 UX, W4 evaluation once the plan is accepted.
- `$ralph`: fallback only for a narrow single-owner fix, such as PH1-FIX-1 hook trust-state.

## Team Verification Path

Every execution lane must produce:

- changed files,
- smoke command,
- failing-before/passing-after evidence where applicable,
- update to `docs/project-state.json`,
- dashboard regeneration,
- explicit claim boundary.

No lane may mark "first usable" complete until the Definition Of First Usable in `docs/PRODUCT-ROADMAP.md` passes.
