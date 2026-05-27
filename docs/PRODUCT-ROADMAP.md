# Product Roadmap

Last updated: 2026-05-27
Status: Active

## Current Truth

The repo has useful pieces, but it is not yet a real daily language-learning product.

Working pieces:

- local learner store,
- direct script session persistence,
- mini mirror skeleton,
- progress schema validation,
- local marketplace packaging smoke.

Hard blockers:

- native hook runtime is not proven end-to-end,
- vocabulary tracking is semantically wrong,
- daily session is not yet a true learning loop,
- setup is developer-oriented,
- no persona validation,
- no longitudinal evidence.

## North-Star Product Shape

English Learning Harness should become:

- a daily AI conversation partner,
- a Korean adult learner memory system,
- a scenario-based speaking practice engine,
- a gentle feedback and review coach,
- a local-first progress journal,
- eventually a voice-capable tutor.

## Workstreams

### W1 — Platform Reliability

Goal: make installation, hooks, local data, and packaging boring.

Deliverables:

- safe `~/.codex/hooks.json` merge/install tool,
- uninstall/restore path,
- isolated hook runtime proof,
- local marketplace package smoke,
- crash-safe writes or backup-on-write for learner data,
- schema migration strategy.

### W2 — Learning Engine

Goal: make each session pedagogically meaningful.

Deliverables:

- learner model v3,
- vocabulary history and review queue,
- scenario task bank,
- session planner,
- mini mirror generator,
- weekly/monthly reflection logic,
- persona-specific adaptation.

### W3 — Conversation UX

Goal: make the learner want to return tomorrow.

Deliverables:

- low-pressure session script,
- easy/normal/stretch mode,
- Korean fallback rules,
- repair phrase coaching,
- anxiety-safe correction policy,
- transcript-first conversation UI/CLI flow,
- eventually push-to-talk transcription.

### W4 — Measurement And Evaluation

Goal: measure learning without pretending noisy metrics are truth.

Deliverables:

- metric semantics test suite,
- persona fixtures,
- longitudinal simulated learner tests,
- human review rubric,
- 7-day pilot protocol,
- dashboard views for progress and evidence.

## Immediate Execution Plan

### PH1-FIX-1 — Native Hook Install Proof

Why:

Without this, the project is not a reliable Codex harness.

Done when:

- explicit command-wrapper fallback is implemented as the supported path,
- native hook installer remains optional and does not block daily use,
- README shows one safe setup path,
- hook trust-state limitation is documented honestly.

### PH1-FIX-2 — Vocabulary History

Why:

Current `new_vocabulary_count` is wrong across sessions.

Done when:

- `vocabulary.json` stores vocabulary history and `progress.json` records only supported summary metrics,
- repeated words are not counted as new,
- useful phrases can be marked for review,
- migration from current v2 shape is tested.

### PH1-FIX-3 — Daily Learning Loop

Why:

Current session is a transcript processor, not yet a tutor.

Done when:

- session planner chooses a scenario,
- conversation has a task goal,
- mini mirror includes one pattern and one review phrase,
- output adapts to profile/anxiety/mode,
- persona fixture harness can execute the scenario loop.

The four target persona fixtures must pass before Stage 2 / first-usable completion, not as the PH1-FIX-3 local loop gate.

### PH1-FIX-4 — Stop/Finalization Contract

Why:

Current hook claims do not match behavior.

Done when:

- either Stop hook finalizes pending session artifacts,
- or docs and setup clearly say finalization belongs to explicit session command,
- tests prove whichever contract is chosen.

### PH1-FIX-5 — Setup UX

Why:

Daily usage cannot require reading internal implementation details.

Done when:

- one command prepares local learner directory,
- one command runs a session,
- one command verifies health,
- failure messages explain recovery.

## Validation Plan

### Persona Fixtures

Create fixtures for:

- 지은: freezes, wants gentle low-pressure practice.
- 민호: anxious, trauma from correction, needs repair and safety.
- 수진: expressive identity learner, wants creative global self.
- 혜원: dormant English major, needs reactivation without shame.

Each fixture must verify:

- session does not overcorrect,
- mini mirror starts from communicated meaning,
- next phrase is useful,
- progress writes correctly,
- no real-person confidence guarantee is made.

### Seven-Day Pilot Protocol

For each pilot learner:

- Day 0: baseline profile and comfort rating.
- Days 1-7: daily session, mini mirror, one review phrase.
- Day 7: compare first and latest transcript.

Evidence:

- return rate,
- voluntary words,
- phrase reuse,
- repair phrase usage,
- learner comfort note,
- qualitative friction.

## Definition Of "First Usable"

The project may be called first usable only when:

- a user can set it up without editing internals,
- daily session produces a useful interaction and journal,
- vocabulary and progress semantics are correct,
- hooks or explicit fallback are honestly wired,
- four persona fixtures pass,
- dashboard shows evidence, not aspiration.

Until then, status remains hardening.
