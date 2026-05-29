# Project Status

Last updated: 2026-05-29

## Current State

The project is in **M3 Daily Return Experience implementation active / #40 next** state.

What is complete:
- Product north star is synchronized to D82: **AI 파트너와 편안하게 영어로 대화하는 능력**.
- Implementation-readiness claims were corrected: design is not "fully implementation-ready" until Phase 0 spike passes.
- MVP metrics are synchronized to D83: only five metrics are updated every session.
- `progress.json` is synchronized to D100: v2 is canonical; v1 is deprecated.
- Persona gate is synchronized to D84: four target personas are blocking validation; 재훈 is non-target-adjacent redirect/smoke only.
- Plugin install/scaffold claims are synchronized to current evidence: `.codex-plugin/plugin.json` is the manifest shape, and exact install/distribution commands remain Phase 0 verification items.
- N001 is complete: Phase 0 now has a concrete spike plan, evidence rules, pass/fail criteria, and execution order in `docs/PHASE-0-SPIKE.md`.
- P0-3 is complete: current Codex CLI plugin installation was reproduced through a local marketplace root.
- P0-2 is complete: Codex hook surfaces are available, but plugin-scoped hook auto-execution was not proven; MVP should use setup-owned/native hook registration.
- P0-4 is complete: local-first learner persistence passed with progress v2, D83 five MVP metrics, journal, and artifact reference path. Automated CLI image generation remains deferred with an accepted fallback.
- P0-1 is complete: current Codex CLI does not expose a stable realtime voice path; MVP should default to text-first or transcription-first conversation.
- PH1-1 is complete: plugin manifest, skill skeletons, setup-owned/native hook registration path, progress schema validator, and local marketplace install smoke are in place.
- PH1-2 is partially complete: first-run onboarding, text-first session persistence, mini mirror, journal/artifact persistence, and `progress.json` shape validation work in direct script smoke.
- README setup guidance exists, but it is still developer-oriented and does not yet provide a safe one-command native hook install/merge path.
- Product ambition has been reset from "local smoke tool" to a research-backed daily language-learning engine in `docs/LEARNING-ENGINE.md`.
- Execution roadmap has been expanded in `docs/PRODUCT-ROADMAP.md`.
- Startup-grade Ralplan draft now includes `docs/STARTUP-GRADE-PLAN.md`, `docs/TUTOR-POLICY.md`, `docs/PERSONA-FIXTURE-SPEC.md`, and `docs/DATA-CONTRACTS.md`.
- Startup-grade Ralplan consensus passed: Architect APPROVE and Critic OKAY are recorded in `docs/RALPLAN-CONSENSUS-STARTUP-GRADE.md`.
- Multimodal GenAI usage is now explicit in `docs/MULTIMODAL-GENAI-PLAN.md`: modalities are tied to an Interaction Event Graph, not treated as media features.
- Adaptive execution governance is defined in `docs/ADAPTIVE-EXECUTION-PLAN.md`: issues are treated as hypotheses and may continue, split, pivot, die, or trigger research based on evidence.
- GitHub execution structure is created: labels, milestones M1-M6, epics #1-#10, and M1 issues #11-#17.
- PH1-FIX-1 is complete for the supported fallback path: `scripts/english-learning-harness.mjs` provides setup/today/health/status/context without native hooks.
- PR-first execution is now required for implementation issues after the #11 direct-commit closeout exposed a missing review trail.
- PH1-FIX-2 is implemented on the PR branch: `vocabulary.json`, `review-queue.json`, historical `new_vocabulary_count`, and migration smoke are in place.
- PH1-FIX-3 is implemented on the PR branch: scenario engine, tutor repair prompts, and four-persona fixture smoke are in place.
- PH1-FIX-4 is implemented on the PR branch: command-wrapper owns session finalization and Stop hook is marker-only with smoke coverage.
- PH1-FIX-5 is implemented on the PR branch: setup is idempotent, health reports recovery commands, and `setup --repair` backs up corrupt local JSON files.
- PH1-FIX-6 is complete: the generated dashboard now has an explicit First-Usable Gate.
- PH1-FIX-7 is implemented on the PR branch: a fresh clone from `origin` can run setup, today, health, progress validation, and dashboard generation.
- M2 executable issues #25-#29 are created under the Pedagogical Learning Engine milestone.
- M2-1 is implemented on the PR branch: `learner-model.json` baseline, setup migration, session skill-memory updates, artifact evidence, context summary, and setup repair support are in place.
- M2-2 is implemented on the PR branch: due review listing, success/fail review updates, 1/3/7/14 interval progression, and phrase vault inspection are in place.
- M2-3 is implemented on the PR branch: scenario planning now uses due review phrases, learner model state, mode selection, avoided topics, and artifact selection reasons.
- M2-4 is implemented on the PR branch: tutor policy rubric, negative violation fixtures, Korean bridge behavior, and persona fixture rubric enforcement are in place.
- M2-5 is implemented on the PR branch: weekly mirror generation summarizes local themes, saved/reused phrases, repair attempts, skill evidence, and next focus from local evidence only.
- M1 and M2 milestones are closed after completed evidence review.
- M3 Daily Return Experience implementation issues #37-#41 are created.
- M3-1 is implemented on the PR branch: `daily` returns due review, suggested scenario, learner model summary, latest weekly mirror/journal pointers, and exact next commands from local files.
- M3-2 is implemented on the PR branch: `home` writes learner-owned `home.html` from local evidence and excludes project process logs.
- M3-3 is implemented on the PR branch: return state now has `gap_kind` and `restart_action` with same-day, next-day, and long-gap fixture coverage.

What is not started:
- Seven-day local return simulation.
- Real user validation.
- Realtime voice path.
- Public Git-backed marketplace install.

What failed review:
- Native hook runtime is not proven end-to-end through Codex; direct hook invocation is not enough.
- PH1-FIX-1 native hook proof remains blocked, but the product no longer depends on it for first use because the explicit command-wrapper path is implemented and verified.
- Public marketplace distribution, real learner validation, and native hook runtime are still outside the local first-usable claim.

Strategic reset:
- This is now treated as a language-learning product/engine, not a small plugin script.
- "First usable" requires setup UX, hook proof or honest fallback, vocabulary history, scenario-based daily loop, persona fixtures, and evidence-backed progress semantics.

## Completed Execution Goals

| ID | Status | Result |
|---|---|---|
| G001 | Complete | Readiness/completion wording now requires Phase 0 spike and doc sync. |
| G002 | Complete | North star aligned to AI partner English conversation comfort. |
| G003 | Complete | Metrics/schema aligned to MVP five metrics and monthly optional metrics. |
| G004 | Complete | Persona gate aligned to four target personas. |
| G005 | Complete | Plugin scaffold/install claims corrected and downgraded to verification items. |
| G006 | Complete | Static audit, ai-slop-cleaner pass, and review gate passed. |

## Verification Evidence

- Static audit found no active blockers for obsolete implementation-ready claims, `progress.json` v1 canonical schema, `.agents/skills`, `codex /plugins install`, five-persona gate, or D83 metric drift.
- JSON code blocks in `design/07-background-data.md` and `design/17-measurement.md` parse successfully.
- Local CLI evidence: `codex-cli 0.133.0`; plugin install surface is `codex plugin add <plugin>@<marketplace>`.
- Realtime evidence: `realtime_conversation` is `under development` and disabled; no stable CLI realtime/voice command is exposed.
- Scaffold evidence: `node scripts/phase1-scaffold-smoke.mjs` passes and isolated `codex plugin list` shows `english-learning-harness@phase1-scaffold installed, enabled 0.1.0`.
- Runtime evidence: `node scripts/phase1-full-flow-smoke.mjs` passes and proves profile, session, mini mirror, journal, artifact, metrics, and hook context.
- Review evidence: `docs/phase-1-evidence/PH1-review-gap-audit.md` identifies P1/P2 gaps that invalidate the broad "first usable complete" claim.
- Research/planning evidence: `docs/LEARNING-ENGINE.md` and `docs/PRODUCT-ROADMAP.md` define the learning model, roadmap gates, and validation criteria.
- Ralplan evidence: `docs/STARTUP-GRADE-PLAN.md` records options, ADR, architecture, execution stages, and critic-gate revisions.
- Ralplan consensus evidence: `docs/RALPLAN-CONSENSUS-STARTUP-GRADE.md` records the durable Architect -> Critic approval handoff.
- Multimodal evidence: `docs/MULTIMODAL-GENAI-PLAN.md` records voice, image, and video usage boundaries with SLA, conversation analysis, multimodal learning, and official OpenAI API references.
- Execution governance evidence: `docs/ADAPTIVE-EXECUTION-PLAN.md` defines review lanes, research triggers, backlog mutation rules, milestones, and stop conditions.
- Hook evidence: `docs/phase-1-evidence/PH1-FIX-1-hook-install-proof.md` records installer improvements and the remaining Codex trust-state blocker.
- Command-wrapper evidence: `docs/phase-1-evidence/PH1-FIX-1-command-wrapper-fallback.md` records the supported fallback path and smoke verification.
- Vocabulary evidence: `docs/phase-1-evidence/PH1-FIX-2-vocabulary-history.md` records repeated-session and migration smoke verification.
- Scenario evidence: `docs/phase-1-evidence/PH1-FIX-3-scenario-loop-fixtures.md` records scenario-loop and persona fixture smoke verification.
- Stop contract evidence: `docs/phase-1-evidence/PH1-FIX-4-stop-finalization-contract.md` records explicit finalization and marker-only Stop hook smoke verification.
- Setup recovery evidence: `docs/phase-1-evidence/PH1-FIX-5-setup-recovery.md` records idempotent setup and repair smoke verification.
- Dashboard evidence: `docs/project-state.json` now includes a First-Usable Gate rendered into `docs/dashboard.html`.
- Clean clone evidence: `docs/phase-1-evidence/PH1-FIX-7-clean-clone-smoke.md` records fresh clone setup/today/health/dashboard smoke verification.
- M2 planning evidence: `docs/ISSUE-INDEX.md` records M2 executable issues #25-#29.
- Learner model evidence: `docs/phase-2-evidence/M2-1-learner-model.md` records learner model setup, migration, session update, context summary, and regression smoke verification.
- Review/vault evidence: `docs/phase-2-evidence/M2-2-review-vault.md` records due review listing, success/fail updates, interval behavior, phrase vault output, and regression smoke verification.
- Scenario planner evidence: `docs/phase-2-evidence/M2-3-scenario-planner.md` records due phrase planning, avoided topic handling, mode choice, selection reason artifacts, and persona regression verification.
- Tutor policy evidence: `docs/phase-2-evidence/M2-4-tutor-policy-rubric.md` records rubric violation codes, Korean bridge behavior, persona fixture integration, and negative fixture verification.
- Weekly mirror evidence: `docs/phase-2-evidence/M2-5-weekly-mirror.md` records local-only weekly reflection generation, saved/reused phrase summaries, repair attempts, next focus, and M2 regression smoke verification.
- M3 planning evidence: `docs/phase-3-evidence/M3-0-roadmap-issue-alignment.md` records M1/M2 milestone closeout and M3 execution issues #37-#41.
- Daily cockpit evidence: `docs/phase-3-evidence/M3-1-daily-cockpit.md` records `daily` command behavior and fresh/returning learner smoke verification.
- Learner home evidence: `docs/phase-3-evidence/M3-2-learner-home.md` records `home.html` generation and Playwright render smoke verification.
- No-streak return evidence: `docs/phase-3-evidence/M3-3-no-streak-return.md` records deterministic gap fixtures and safe restart copy.
- Issue system evidence: `docs/ISSUE-INDEX.md` records epics #1-#10 and M1 issues #11-#17.
- Process evidence: #11 was closed by commit `204dbec` without PR; future implementation issues must close through linked PRs.
- Final review recommendation: APPROVE.
- Architectural status: CLEAR.

## Next Work

### Phase 0 Spike

Purpose: verify technical assumptions before claiming implementation readiness.

- [x] N001: Design the Phase 0 spike plan.
- [x] P0-3: Verify plugin distribution/install path.
- [x] P0-2: Verify hook availability and registration path.
- [x] P0-4: Verify image generation and local disk persistence.
- [x] P0-1: Verify Codex realtime conversational mode.
- [x] Verify `~/english-learning/`/`ENGLISH_LEARNING_HOME` data creation and update flow during Phase 1 runtime smoke.

Phase 0 result: implementation may proceed only with these constraints:

- Install path: local marketplace first; public Git-backed handoff remains unverified.
- Hooks: setup-owned/native hook registration first; plugin-scoped hook auto-execution remains unproven.
- Persistence: local-first `progress.json` v2 and journal/artifact references are verified.
- Conversation: text/transcription-first daily session first; realtime voice is not a Phase 1 dependency.

### Phase 1 Scaffold

Start from the verified/fallback Phase 0 constraints.

- [x] PH1-1: Create plugin manifest, skill skeletons, native hook path, validator, and scaffold smoke.
- [~] PH1-2: Implement daily-session command/update path. Direct script flow works; conversation surface needs hardening.
- [~] PH1-3: Implement runtime metrics update path with journal append behavior. Shape works; vocabulary metric semantics are wrong across sessions.
- [~] PH1-4: Add user-facing setup guidance in README. Basic guidance exists; safe native hook install path is incomplete.
- [x] PH1-FIX-1: Implement supported explicit command-wrapper fallback and keep setup-owned/native hook installation optional until Codex trust-state is proven.
- [x] PH1-FIX-2: Fix vocabulary history and `new_vocabulary_count`.
- [x] PH1-FIX-3: Strengthen daily-session UX beyond deterministic transcript processing.
- [x] PH1-FIX-4: Align Stop hook behavior with documentation.
- [x] PH1-FIX-5: Make setup UX one-command and recoverable.
- [x] PH1-FIX-6: Sync dashboard evidence for the first-usable gate.
- [x] PH1-FIX-7: Run clean clone first-usable smoke.
- [ ] PH1-5: Run real user validation against the four target personas.

### Phase 2 Pedagogical Learning Engine

- [x] M2-1: Implement learner model baseline and skill memory.
- [x] M2-2: Add due review queue command and phrase vault.
- [x] M2-3: Make scenario planner use memory and review needs.
- [x] M2-4: Enforce tutor policy with rubric smoke tests.
- [x] M2-5: Generate weekly mirror from local evidence.

### Phase 3 Daily Return Experience

- [x] M3-0: Align roadmap, close completed M1/M2 epics, and create M3 execution issues.
- [x] M3-1: Add daily cockpit command (#37).
- [x] M3-2: Generate learner home HTML from local evidence (#38).
- [x] M3-3: Add no-streak return and resume guidance (#39).
- [ ] M3-4: Add seven-day local return simulation smoke (#40).
- [ ] M3-5: Close M3 gate with clone-to-daily evidence (#41).

## SSOT Structure

- `DESIGN.md` — product/design/UX source of truth.
- `docs/project-state.json` — structured execution/status state for generated dashboards.
- `docs/PHASE-0-SPIKE.md` — Phase 0 execution plan and pass/fail criteria.
- `docs/ISSUE-INDEX.md` — GitHub epics, milestones, and first-usable issue index.
- `docs/phase-0-evidence/` — Phase 0 spike evidence notes.
- `docs/phase-1-evidence/` — Phase 1 scaffold and implementation evidence notes.
- `docs/phase-2-evidence/` — Phase 2 learning-engine evidence notes.
- `docs/phase-3-evidence/` — Phase 3 daily return evidence notes.
- `docs/STATUS.md` — human-readable execution status and next-step summary.
- `docs/dashboard.html` — generated shared visual dashboard for human/Codex review. Do not edit this file directly; run `node scripts/generate-dashboard.mjs`.
- `design/` — detailed design library and historical decision records.
- `.omx/` — workflow logs and generated runtime artifacts only; not SSOT.
