# Project Status

Last updated: 2026-06-04

## Current State

The project is in **Korean-first public source live with agent-installed Codex onboarding** state.

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
- README setup guidance is now Korean-first and Codex-native: the first screen speaks to Korean learners, says the learner talks to Codex, while Codex uses the local engine internally for setup, practice, mini mirror, review memory, and progress files. `node` commands are maintainer/internal engine details, not the learner-facing product surface.
- Current harness benchmark (`oh-my-openagent`, `gstack`) is captured in `docs/BENCHMARK-HARNESS-TRENDS.md`: the public path should be paste prompt into agent -> agent installs skills -> learner invokes workflows by natural language, not human clone/download -> manual command operation.
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
- M3-1 is merged: `daily` returns due review, suggested scenario, learner model summary, latest weekly mirror/journal pointers, and exact next commands from local files.
- M3-2 is merged: `home` writes learner-owned `home.html` from local evidence and excludes project process logs.
- M3-3 is merged: return state now has `gap_kind` and `restart_action` with same-day, next-day, and long-gap fixture coverage.
- M3-4 is merged: seven simulated days run through setup, daily, review, today, weekly mirror, and learner home generation.
- M3-5 is merged: clean clone reaches daily cockpit, review/vault, weekly mirror, learner home, and seven-day simulation.
- M3 epic #6 and the M3 Daily Return Experience milestone are closed.
- M4-0 is complete: multimodal epics #7/#8 were split into executable issues #50, #49, #53, #52, and #54.
- M4-1 is merged: text-first sessions now write valid `interaction_events` and invalid event fixtures are rejected.
- M4-2 is merged: weekly mirror and learner home now summarize text interaction events with transfer targets.
- M4-3 is merged: `voice` imports transcript-first practice as validated `modality: voice` interaction events with local audio metadata.
- M4-4 is merged: `image` creates local image information-gap practice as validated `modality: image` interaction events with hidden-detail prompt context and local image metadata.
- M4-5 is merged: one gate smoke proves text, voice, and image events share the same interaction-event contract and weekly event summary.
- M4 epics #7/#8 and the M4 Multimodal Interaction Lab milestone are closed.
- M5-0 is complete: #9 is split into executable validation issues #62-#66.
- M5-1 is complete: the seven-day validation protocol defines pilot schedule, prompt set, evidence fields, thresholds, privacy handoff, and claim boundaries.
- M5-2 is merged: `export` writes a redacted JSON+Markdown evidence pack from a seven-day learner store.
- M5-3 is merged: before/after transcript rubric scores observable behavior and rejects unsupported claims.
- M5-4 is merged: four target personas complete seven-day validation fixtures with evidence export and transcript rubric decisions.
- M5-5 is merged: M5 gate smoke approves continuing to M6 while blocking real learner outcome claims.
- M5 epic #9 and the M5 Real Learning Validation milestone are closed.
- M6 is split into executable issues #72-#75.
- M6-D issue #78 is resolved by policy: M6 first-complete release claim is private beta / invited-user clone-to-learn; unauthenticated public release is deferred to M7 #83.
- M6-1 authenticated clone mechanics pass from a disposable clone, but the default public clone smoke fails by design until repository visibility or distribution policy is resolved.
- M6-2 local marketplace packaging/install path passes from a disposable clone with isolated `CODEX_HOME`; public Git-backed install remains unverified.
- M6-3 onboarding diagnostics pass: setup/health/status/context expose next commands, support files, repair commands, and native-hook optionality.
- M6-4 release gate audit passes with decision `ready_to_close_m6_private_beta`; M6 can close as private beta, while unauthenticated public distribution remains deferred.
- M7 Public Distribution Release milestone and issue #83 are created for unauthenticated public clone/artifact work.
- M6 Private Beta Clone-to-Learn Release milestone is closed with `open_issues=0`.
- M7 public artifact mechanics pass from a tarball candidate; public hosting/download remains unproven.
- M7 hosted-artifact smoke passes through local loopback and is ready to verify a real public URL via `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL`.
- M7 manual GitHub Actions workflow is wired to package/verify the artifact and optionally upload a release asset when explicitly dispatched.
- GitHub Actions run `26618527553` completed successfully with `publish_release=false` and uploaded workflow artifact `english-learning-harness-public`.
- M7 decision issue #90 selected the current source repository as the open-source public release surface.
- M7 decision gate smoke is in place: public release completion requires repository visibility public plus public clone proof.
- M7-2 public artifact repository handoff is prepared locally with tarball, checksum, manifest, and release notes; it does not publish.
- M7-3 public artifact repository README is prepared in the handoff bundle so a public repo visitor can download, verify, extract, setup, and start practice.
- M7-4 public artifact workflow is aligned to the separate artifact repository path: `publish_release=false` by default, `artifact_repo` input, and `PUBLIC_ARTIFACT_REPO_TOKEN` required for publication.
- M7-5 public release URL smoke verifies artifact plus `SHA256SUMS` before setup/daily/today; current evidence is local loopback only until real public URLs exist.
- M7-6 GitHub Actions run `26619701714` verifies the separate artifact repo workflow path in no-publication mode with artifact upload and skipped release publication.
- M7-7 publication preflight now reports the source repository is `PUBLIC`, `publicationReady=true`, and the next proof is public clone smoke.
- M7-8 public artifact install smoke verifies a checksum-verified downloaded artifact can package a local marketplace and install the plugin into isolated `CODEX_HOME`.
- M7-9 owner approval packet smoke now prepares a non-publishing public source repository visibility-change packet and the required #83 public clone proof command.
- M7-10 distribution policy branches public release requirements by chosen surface: public source repo requires public clone smoke, while artifact release remains a fallback path.
- M7-11 open-source readiness smoke verifies MIT license, contribution docs, code of conduct, security/support/governance docs, issue templates, PR template, README public clone framing, policy alignment, and absence of obvious local secret files.
- M7-12 git history audit smoke scans committed history for obvious secret patterns, forbidden local/runtime paths, and oversized accidental artifacts before repository visibility changes.
- M7-13 public source clone smoke verifies unauthenticated clone from `https://github.com/bborok1234/english-learning-harness.git` plus setup, daily, today, weekly, home, and export from a disposable clone.
- M7-14 learner-first README smoke verifies public onboarding leads with learner value and daily practice before maintainer verification, while preserving public clone and marketplace command audits.
- M7-15 Codex-native user surface smoke verifies README natural-language prompts and Codex conversation appear before internal `node` engine commands; skill instructions now tell Codex not to ask learners to run `node` for ordinary practice.
- M7-16 agent-installed harness onboarding adds `setup --host codex`, installs skills into `~/.codex/skills`, and strengthens README smoke so the first public path is paste-into-Codex installation rather than clone/download.
- M7-17 Korean-primary README makes `README.md` the Korean public entry point, adds `README.en.md` as the secondary English surface, and updates public artifact/readiness smokes to verify the bilingual structure.
- M8-1 Speaking Skill OS core adds `speaking-backlog.json`, `diagnose`, `backlog`, backlog-driven `daily`/`today`, transfer-test evidence, and smoke coverage so the harness is no longer just generic English chat.
- M8-2 Speaking Skill OS queue adds multi-skill diagnosis and adaptive ordering, so failed transfer work stays ahead of generic practice.
- M8-3 Speaking Skill OS seven-day gate proves the local multi-day loop: seeded backlog, daily queue targeting, failed transfer retry, weekly mirror, and evidence export.
- M8-4 research basis citation map ties output practice, interaction repair, corrective feedback, retrieval, task-based scenarios, CEFR online interaction, and claim boundaries to visible product surfaces.
- M9 Real Learner Pilot Bridge is open. M9-1 adds owner/self pilot state and command surface without assuming a personal name. M9-3 now replaces internal pilot labels with learner-facing mission cards.
- M10 Narrative Mission Layer is complete as a local mechanics gate. M10-1 defines the PRD/test contract, M10-2 adds machine-readable contracts, M10-3 rejects decorative missions, M10-4 proves narrative/plain transfer parity, M10-5 proves no-generation fallback, and M10-6 records closeout with blocked claims still visible.
- AIOS-1 personal cockpit runtime is implemented for #154. It connects real learner-root state to `cockpit-state.json` and `cockpit.html` so today's mission, Speaking Skill OS, multimodal evidence, and 7-day/30-day journey windows appear in one learner product surface.
- AIOS-2 generated daily mission artifacts are implemented for #156. The `mission` command writes learner-root mission state/html, links it to the current Speaking Skill OS item, and the personal cockpit points to the latest generated mission.
- AIOS-14 learner cockpit boundary is implemented for #214. Personal cockpit state/HTML uses Korean Codex-facing prompts for ordinary learner actions instead of exposing `node scripts/...` engine commands.
- AIOS-15 active pilot cockpit replies are implemented for #216. The cockpit now links the current pilot card, shows the learner-safe assistant prompt, and renders quick reply choices with copy buttons.
- AIOS-16 honest pilot friction mechanics are implemented for #218. `pilot-reply` no longer saves placeholder friction notes, and saved-reply cards ask a short learner-facing friction follow-up when no note was captured.
- AIOS-17 immersive pilot start is implemented for #220. The fresh Day 0 pilot card now starts with a learner-facing scene chooser and low-pressure quick replies instead of assuming a project/work premise.
- AIOS-18 owner-pilot skill contract alignment is implemented for #222. The Codex-facing owner-pilot skill and canonical pilot prompt contract now describe the same `첫 장면 고르기` start path as the engine.
- AIOS-19 goal completion audit is implemented for #224. `docs/ops/goal-audit.json/html` maps the active AI-native OS goal stop conditions to current evidence and keeps the overall goal `not_complete` while real owner/self pilot evidence is missing.
- AIOS-20 daily practice start card is implemented for #226. Ordinary daily practice now has a learner-ready `practice-next` JSON/HTML card with a concrete scene, quick replies, and no answer persistence before the learner responds.
- AIOS-21 daily practice reply routing is implemented for #228. `practice-reply` resolves start-card quick replies or direct learner sentences, runs the practice persistence flow, and writes a learner-facing saved-reply card.
- AIOS-22 daily reply mission integrity is implemented for #230. `practice-reply` now preserves the start-card mission id, target skill, scene preset, and scene attachment when saving a quick reply or direct sentence.
- AIOS-23 deferred daily reply diagnosis is implemented for #232. Current start-card replies keep their mission evidence, while future Speaking Skill OS diagnosis can be created after session persistence.
- AIOS-24 PR body auto-close guard is implemented for #234. `#179` is reopened, PR-body wording is guarded, and goal audit now checks GitHub issue state for the real-pilot blocker.

What is not started:
- Real user validation.
- Realtime voice path.
- Public Git-backed marketplace install.
- Generated narrative worlds, NPC arcs, and multimodal story assets are not implemented until the M10 mission validator and no-generation fallback gates pass.

What failed review:
- Native hook runtime is not proven end-to-end through Codex; direct hook invocation is not enough.
- PH1-FIX-1 native hook proof remains blocked, but the product no longer depends on it for first use because the explicit command-wrapper path is implemented and verified.
- Public marketplace distribution, real learner validation, and native hook runtime are still outside the local first-usable claim.
- Public source release visibility is now live; artifact release remains optional and secondary.
- M7-D decision gate smoke verifies `owner_decision_required`, `public_artifact_repository_release`, and no Codex publication without explicit approval.
- M7-2 handoff smoke verifies checksum, manifest, tarball contents, forbidden path exclusions, and no-publication boundary.
- M7-3 handoff smoke verifies public README download, checksum, setup, daily, today, and public URL smoke guidance.
- M7-4 workflow smoke verifies separate artifact repo targeting, explicit token boundary, source repo read-only permission, and no-publication default.
- M7-5 public release URL smoke verifies checksum-aware download-to-learning mechanics and keeps `canClosePublicDistribution=false` in local mode.
- M7-6 no-publish workflow evidence verifies `publish_release=false`, `artifact_repo=bborok1234/english-learning-harness-public`, workflow artifact upload, and skipped publish step.
- M7-7 preflight verifies open-source publication readiness while keeping `canPublishNow=false` until the source repository is public.
- M7-8 install smoke verifies local marketplace plugin install from the downloaded public artifact path; public Git-backed plugin install remains unclaimed.
- M7-9 approval smoke verifies repository visibility remains unchanged while giving the owner the exact public-source visibility command and required #83 public clone proof.
- M7-10 policy smoke verifies the default public clone smoke is required for the public source repository path, while artifact release is optional fallback.
- M7-11 readiness smoke now reports `visibilityReady=true` after the repository was made public.
- M7-12 history audit reports zero forbidden historical paths, zero secret-like historical content findings, and zero large historical objects.
- M7-13 public clone smoke verifies `publicAccessStatus=public` and `cloneGitStatusClean=true`.

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
- M4-4 evidence: `docs/phase-4-evidence/M4-4-image-information-gap.md` records image information-gap event import, hidden-detail/clarification prompt context, and weekly modality summary.
- M4-5 evidence: `docs/phase-4-evidence/M4-5-multimodal-gate.md` records text/voice/image event graph gate evidence and claim boundaries.
- M5-1 evidence: `docs/phase-5-evidence/M5-1-validation-protocol.md` records the protocol definition and review criteria.
- M5-2 evidence: `docs/phase-5-evidence/M5-2-evidence-export.md` records export pack behavior, redaction, and smoke verification.
- M5-3 evidence: `docs/phase-5-evidence/M5-3-transcript-rubric.md` records before/after transcript rubric behavior and negative fixtures.
- M5-4 evidence: `docs/phase-5-evidence/M5-4-persona-validation.md` records target-persona seven-day fixture behavior and claim boundaries.
- M5-5 evidence: `docs/phase-5-evidence/M5-5-validation-gate.md` records M5 closeout decision, approved claims, blocked claims, and M6 split.
- M6-1 evidence: `docs/phase-6-evidence/M6-1-public-clean-clone.md` records authenticated clone mechanics, README command audit, clone git status cleanliness, and the private-repository blocker for public clone readiness.
- M6-D evidence: `docs/phase-6-evidence/M6-D-distribution-policy.md` and `docs/distribution-policy.json` record the private-beta policy and M7 public release deferral.
- M6-2 evidence: `docs/phase-6-evidence/M6-2-marketplace-install.md` records clean-clone local marketplace packaging, isolated `CODEX_HOME` install, README command audit, and the public Git-backed install boundary.
- M6-3 evidence: `docs/phase-6-evidence/M6-3-onboarding-diagnostics.md` records support diagnostics, next-step clarity, non-destructive repair guidance, and corrupt-store recovery verification.
- M6-4 evidence: `docs/phase-6-evidence/M6-4-release-gate.md` records the M6 gate audit and the blockers that prevent closing M6.
- M7-1 artifact evidence: `docs/phase-7-evidence/M7-1-public-artifact-mechanics.md` records tarball packaging, extraction, learner-loop smoke, and remaining public hosting blocker.
- Execution governance evidence: `docs/ADAPTIVE-EXECUTION-PLAN.md` defines review lanes, research triggers, backlog mutation rules, milestones, and stop conditions.
- Hook evidence: `docs/phase-1-evidence/PH1-FIX-1-hook-install-proof.md` records installer improvements and the remaining Codex trust-state blocker.
- Command-wrapper evidence: `docs/phase-1-evidence/PH1-FIX-1-command-wrapper-fallback.md` records the supported fallback path and smoke verification.
- Vocabulary evidence: `docs/phase-1-evidence/PH1-FIX-2-vocabulary-history.md` records repeated-session and migration smoke verification.
- Scenario evidence: `docs/phase-1-evidence/PH1-FIX-3-scenario-loop-fixtures.md` records scenario-loop and persona fixture smoke verification.
- Stop contract evidence: `docs/phase-1-evidence/PH1-FIX-4-stop-finalization-contract.md` records explicit finalization and marker-only Stop hook smoke verification.
- Setup recovery evidence: `docs/phase-1-evidence/PH1-FIX-5-setup-recovery.md` records idempotent setup and repair smoke verification.
- Dashboard evidence: `docs/ops/project-state.json` includes the First-Usable Gate rendered into `docs/ops/engineering-dashboard.html`; `docs/dashboard.html` is now only a legacy redirect.
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
- Seven-day simulation evidence: `docs/phase-3-evidence/M3-4-seven-day-simulation.md` records repeated local daily loop verification.
- M3 gate evidence: `docs/phase-3-evidence/M3-5-clone-to-daily-gate.md` records clone-to-daily verification.
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
- [x] M3-4: Add seven-day local return simulation smoke (#40).
- [x] M3-5: Close M3 gate with clone-to-daily evidence (#41).

### Phase 4 Multimodal Interaction Lab

- [x] M4-0: Reconcile multimodal event graph issues and create executable M4 implementation tasks.
- [x] M4-1: Add interaction event graph schema (#50).
- [x] M4-2: Persist text sessions as interaction events (#49).
- [x] M4-3: Add transcription-first voice event import (#53).
- [x] M4-4: Add image information-gap event fixture (#52).
- [x] M4-5: Close multimodal-ready event graph gate (#54).

### Phase 5 Real Learning Validation

- [x] M5-0: Split #9 seven-day validation protocol into executable validation issues.
- [x] M5-1: Define seven-day validation protocol (#62).
- [x] M5-2: Export seven-day pilot evidence pack (#63).
- [x] M5-3: Add before-after transcript review rubric (#64).
- [x] M5-4: Run target-persona seven-day validation fixture (#65).
- [x] M5-5: Close real learning validation gate (#66).

### Phase 6 Public Clone-to-Learn Release

- [x] M6-1: Verify private beta / invited-user clean clone setup path (#72). Authenticated clone mechanics pass; unauthenticated public clone deferred to M7.
- [x] M6-D: Decide repository visibility for public clone-to-learn (#78). Policy: private beta now, public distribution later.
- [x] M6-2: Verify marketplace packaging and install docs (#73).
- [x] M6-3: Harden first-run onboarding and support diagnostics (#74).
- [x] M6-4: Close private beta clone-to-learn release gate (#75).
- [x] Close M6 Private Beta Clone-to-Learn Release milestone.

### Phase 7 Public Distribution Release

- [x] M7-1: Prove unauthenticated public distribution path (#83). Public source clone-to-learn passes from the now-public repository.
- [x] D4: Make Korean README the primary public surface (#124). `README.md` is Korean-first, `README.en.md` is secondary English, and bilingual README checks pass.

### Phase 8 Speaking Skill OS

- [x] M8-1: Implement diagnosis and speaking backlog loop (#128). `diagnose -> backlog -> daily/today target -> transfer evidence` passes in local smoke.
- [x] M8-2: Add multi-skill diagnosis and adaptive speaking queue (#130). One learner sample can create multiple backlog items, and failed transfer stays at the front.
- [x] M8-3: Add seven-day Speaking Skill OS simulation gate (#132). The fixture completes 7 sessions with backlog attempts, retry, weekly mirror, and export evidence.
- [x] M8-4: Add research basis citation map (#134). Source-to-feature mapping now links Speaking Skill OS behaviors to output practice, interaction repair, corrective feedback, retrieval, task-based scenarios, and explicit claim boundaries.

### Phase 9 Real Learner Pilot Bridge

- [x] M9-1: Add owner/self pilot state and command surface (#136). `pilot-start/status/day/finish` creates local pilot state, baseline diagnosis, daily records, final rubric report, and generic owner/self participant identity.
- [x] M9-2: Generate owner pilot report and transcript review bridge (#137). `pilot-day` now runs through the Codex-operated `practice` loop, and the final pilot report links daily mission, scene, learner report, cockpit, and transcript rubric evidence.
- [x] M9-3: Add learner-facing pilot prompts and privacy handoff (#138). Day 0 is now a "3분 영어 스냅샷" mission-card flow with concrete situations, one-sentence answers, examples, and local-only privacy copy.
- [x] M9-4: Close owner pilot readiness gate and dashboard (#139). `phase9-pilot-aios-readiness-smoke` verifies five pilot days, final learner report, final cockpit linkage, and unsupported-claim guardrails.

### Phase 10 Narrative Mission Layer

- [x] M10-1: Define Narrative Mission Layer PRD and test spec (#143). Narrative missions must prove that story progress requires the target Speaking Skill OS transfer behavior.
- [x] M10-2: Add mission-spec and world-state data contracts (#144). JSON schemas, positive fixtures, world-state smoke, and capability fallback checks are in place.
- [x] M10-3: Implement mission validator and decorative-mission rejection (#145). Mission validator rejects missing backlog links, skill/win-condition mismatches, required media, unsupported claims, and decorative story completion.
- [x] M10-4: Implement one narrative mission parity fixture (#146). `usual-place-clarification` matches plain `today` transfer evidence for pass and needs-review outputs, and story consequence is recorded only after transfer evidence.
- [x] M10-5: Add capability router and no-gen fallback gate (#147). Text-only missions complete and write evidence; required image/realtime voice and missing text fallback are rejected.
- [x] M10-6: Close narrative mission gate and dashboard (#148). M10 gate smoke, claim guard, dashboard closeout, and milestone direction review are in place.

### Phase 11 AI-Native Learning OS

- [x] AIOS-1: Generate a personal learner cockpit from real learner-root state. `cockpit` writes `cockpit-state.json` and `cockpit.html`, connecting today's mission, Speaking Skill OS, due review, multimodal interaction evidence, and 7-day/30-day journey windows.
- [x] AIOS-2: Generate daily mission artifacts linked to the learner cockpit. `mission` writes `artifacts/missions/daily-mission-YYYY-MM-DD.json/html`, includes text/voice/image start paths, and preserves the claim boundary that generated scenes are practice prompts, not outcome proof.
- [x] AIOS-3: Add interactive mission artifacts and learner reports (#158). `mission` HTML now has selectable text/voice/image practice modes, `report` writes `artifacts/reports/learner-report-YYYY-MM-DD.json/html`, and `cockpit` links the latest learner report.
- [x] AIOS-4: Add Codex-operated daily practice flow (#160). `practice` lets Codex internally run mission generation, session persistence, weekly mirror, learner report, and cockpit refresh after learner answers, without making ordinary learners type engine commands.
- [x] AIOS-5: Add generated scene artifacts (#162). `scene` writes `artifacts/scenes/daily-scene-YYYY-MM-DD.json/html`, and `practice`, learner report, and cockpit now link mission-derived scene/timeline artifacts with speaking cue, repair, and transfer checkpoint frames.
- [x] AIOS-6: Add skill-level learner conversation simulation (#164). The daily-session skill now has learner-facing transcript guardrails, and `skill-conversation-simulation-smoke` verifies a concrete everyday prompt, mini mirror, no command/process leakage, and real `practice` artifact generation.
- [x] AIOS-7: Add adaptive scene variants (#166). Generated scenes now include skill/date-based variant metadata and cue styles, with smoke coverage proving clarification, repair, and soft-disagreement variants preserve Speaking Skill OS evidence links.
- [x] AIOS-8: Add first-use conversation variant gate (#169). The daily-session skill now defines first-use variant coverage, and `skill-conversation-variants-smoke` verifies office clarification, cafe repair, object description, and soft-disagreement transcripts through the real `practice` artifact loop.
- [x] AIOS-9: Define multimodal mission asset contract (#171). Mission JSON now includes an `asset_contract` for text-first fallback plus interactive HTML scene, image information-gap, voice transcript, Remotion-style storyboard, and future realtime hooks; `multimodal-mission-asset-contract-smoke` rejects decorative/generated-only assets.
- [x] AIOS-10: Generate learner-operable mission asset deck (#174). `asset-deck` writes `artifacts/assets/mission-assets-YYYY-MM-DD.json/html`, `practice` refreshes the deck, and learner report/cockpit link the latest deck without claiming completion before session evidence.
- [x] AIOS-11: Adapt mission asset priorities from learner evidence (#176). Asset deck cards now include priority rank/reason, different learner evidence states produce different top asset actions, and cockpit exposes the next useful asset action.
- [x] AIOS-13: Generate mission storyboard artifact (#210, #212). `storyboard` writes learner-root `artifacts/storyboards/mission-storyboard-YYYY-MM-DD.json/html`, renders interactive Remotion-style preparation frames, and `asset-deck`, learner report, and personal cockpit link the generated storyboard while keeping session evidence canonical.
- [x] AIOS-14: Remove internal commands from learner cockpit product surface (#214). Personal cockpit state/HTML now present today mission, generated artifact empty state, and next actions as Korean Codex-facing prompts instead of `node scripts/...` commands, with smoke guards for command-token leakage.
- [x] AIOS-15: Expose current pilot card and quick replies in learner cockpit (#216). Active pilot cockpit now links the current `pilot-next-card.html/json`, shows the learner-safe assistant prompt, and renders copyable quick replies without internal command or issue language.
- [x] AIOS-16: Keep pilot friction evidence honest (#218). Daily `pilot-reply` no longer stores fake placeholder friction notes; saved-reply cards ask a short follow-up when no friction note was captured, while explicit notes still count.
- [x] AIOS-22: Preserve daily start-card mission when saving practice replies (#230). `daily-practice-reply-routing-smoke` now guards against saved reply mission/skill/scene-preset drift.
- [x] AIOS-23: Defer daily reply diagnosis until after current mission persistence (#232). `practice-reply` can create future diagnosis/backlog evidence without retargeting the current saved answer.
- [x] AIOS-24: Guard protected real-pilot blocker issues from accidental PR-body auto-close (#234). `pr-body-autoclose-guard-smoke` and `aios-goal-audit-smoke` now cover the tracker-integrity failure mode.
- [ ] AIOS-12: Run real owner/self AIOS pilot and journey audit (#179). Audit mechanics, Codex owner-pilot skill, learner-facing `pilot-next` card generation with ready-to-say `assistantPrompt` and numbered/copyable quick replies rendered in HTML, quick-reply selection saving through `pilot-reply`, varied five-day pilot missions, per-day learner coaching report metadata, card-level `pilot-capture`, automatic `pilot-reply` routing with next-card refresh, honest friction-note mechanics, learner-safe reply summary, saved-reply HTML card with browser render smoke, active pilot cockpit visibility with current next-card link, assistant prompt, quick replies, latest reply-card link, automatic cockpit refresh after each captured pilot answer, and redacted local pilot dashboard sync now exist; the actual real owner/self five-day run is still required before closing the issue.

## SSOT Structure

- `DESIGN.md` — product/design/UX source of truth.
- `docs/SURFACE-BOUNDARY.md` — active boundary between learner-facing product surfaces and engineering/ops surfaces.
- `docs/ops/project-state.json` — structured engineering/ops execution state for the generated engineering dashboard.
- `docs/ops/engineering-dashboard.html` — generated internal engineering dashboard for evidence, gates, issues, and decisions. Do not edit this file directly; run `node scripts/generate-dashboard.mjs`.
- `docs/ops/local-pilot-status.example.json` — tracked example for the redacted local pilot overlay. The real `docs/ops/local-pilot-status.json` is ignored and generated by `node scripts/sync-local-pilot-dashboard.mjs`.
- `docs/product/learner-cockpit-state.json` — structured learner-facing cockpit state.
- `docs/product/learner-cockpit.html` — generated learner-facing cockpit preview. Do not edit this file directly; run `node scripts/generate-learner-cockpit.mjs`.
- `docs/dashboard.html` — legacy redirect to the engineering dashboard plus learner cockpit pointer.
- `docs/distribution-policy.json` — current private-beta/public distribution policy.
- `docs/RESEARCH-BASIS.md` — learning research source-to-feature map and claim boundaries.
- `docs/PHASE-0-SPIKE.md` — Phase 0 execution plan and pass/fail criteria.
- `docs/ISSUE-INDEX.md` — GitHub epics, milestones, and first-usable issue index.
- `docs/phase-0-evidence/` — Phase 0 spike evidence notes.
- `docs/phase-1-evidence/` — Phase 1 scaffold and implementation evidence notes.
- `docs/phase-2-evidence/` — Phase 2 learning-engine evidence notes.
- `docs/phase-3-evidence/` — Phase 3 daily return evidence notes.
- `docs/phase-4-evidence/` — Phase 4 multimodal evidence notes.
- `docs/phase-5-evidence/` — Phase 5 validation evidence notes.
- `docs/phase-6-evidence/` — Phase 6 public/private distribution evidence notes.
- `docs/phase-7-evidence/` — Phase 7 public distribution evidence notes.
- `docs/phase-9-evidence/` — Phase 9 real learner pilot bridge evidence notes.
- `docs/M10-NARRATIVE-MISSION-PRD.md` — Narrative Mission Layer product boundary and claim guardrails.
- `docs/M10-NARRATIVE-MISSION-TEST-SPEC.md` — M10 planning, validator, fallback, parity, and closeout gates.
- `docs/phase-10-evidence/` — Phase 10 narrative mission layer evidence notes.
- `docs/phase-11-evidence/` — AI-native learning operating-system integration evidence notes.
- `docs/phase-15-evidence/` — real owner/self AIOS pilot and journey-audit evidence notes.
- `docs/phase-15-evidence/AIOS-22-preserve-practice-start-mission.md` — daily practice reply mission-integrity evidence note.
- `docs/phase-15-evidence/AIOS-23-deferred-daily-reply-diagnosis.md` — daily practice reply future-diagnosis evidence note.
- `docs/phase-15-evidence/AIOS-24-pr-body-autoclose-guard.md` — PR body protected-issue auto-close guard evidence note.
- `docs/PILOT-PROMPTS.md` — learner-facing owner pilot prompt contract and rejected bad-prompt examples.
- `docs/STATUS.md` — human-readable execution status and next-step summary.
- `design/` — detailed design library and historical decision records.
- `.omx/` — workflow logs and generated runtime artifacts only; not SSOT.
