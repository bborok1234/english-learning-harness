# GitHub Issue Index

Last updated: 2026-06-02
Repository: https://github.com/bborok1234/english-learning-harness

## Operating Rule

Issues are hypotheses. Each issue must close with one decision:

- continue
- split
- pivot
- kill
- research

See `docs/ADAPTIVE-EXECUTION-PLAN.md`.

## Epics

| Issue | Epic | Area | Status |
|---|---|---|---|
| #1 | E1 Platform reliability | platform | closed |
| #2 | E2 Learner memory and data contracts | learning-engine | closed |
| #3 | E3 Scenario-based daily session | learning-engine / conversation-ux | closed |
| #4 | E4 Tutor policy enforcement | conversation-ux | closed |
| #5 | E5 Persona fixture evaluation | evaluation | closed |
| #6 | E6 Dashboard and human-readable progress | evaluation | closed |
| #7 | E7 Multimodal interaction event graph | multimodal | closed |
| #8 | E8 Voice image video learning loops | multimodal | closed |
| #9 | E9 Seven-day validation protocol | evaluation | closed |
| #10 | E10 Public onboarding and distribution | distribution | closed |

## M1 First-Usable Codex Harness

| Issue | Work | Default Decision |
|---|---|---|
| #11 | PH1-FIX-1: Implement explicit command-wrapper fallback | continue |
| #12 | PH1-FIX-2: Implement vocabulary history and review queue | continue |
| #13 | PH1-FIX-3: Build scenario-based daily loop and fixture harness | continue |
| #14 | PH1-FIX-4: Align Stop/finalization contract | continue |
| #15 | PH1-FIX-5: Make setup UX one-command and recoverable | continue |
| #16 | PH1-FIX-6: Dashboard evidence sync for first-usable gate | continue |
| #17 | PH1-FIX-7: Clean clone first-usable smoke | continue |

## Next Execution

#11 is complete but was closed by direct commit `204dbec`, not by PR. That is now treated as a process gap.

M1 execution issues #11-#17 are complete. M1 milestone is closed.

## M2 Pedagogical Learning Engine

| Issue | Work | Default Decision |
|---|---|---|
| #25 | M2-1: Implement learner model baseline and skill memory | continue |
| #26 | M2-2: Add due review queue command and phrase vault | continue |
| #27 | M2-3: Make scenario planner use memory and review needs | continue |
| #28 | M2-4: Enforce tutor policy with rubric smoke tests | continue |
| #29 | M2-5: Generate weekly mirror from local evidence | continue |

M2 execution issues #25-#29 are complete. M2 milestone is closed.

## M3 Daily Return Experience

| Issue | Work | Default Decision |
|---|---|---|
| #37 | M3-1: Add daily cockpit command | continue |
| #38 | M3-2: Generate learner home HTML from local evidence | continue |
| #39 | M3-3: Add no-streak return and resume guidance | continue |
| #40 | M3-4: Add seven-day local return simulation smoke | continue |
| #41 | M3-5: Close M3 gate with clone-to-daily evidence | continue |

Current branch:

```bash
git switch -c m4-multimodal-task-reconciliation
```

Current implementation target:

```bash
gh issue list --milestone "M4 Multimodal Interaction Lab"
```

From #12 onward, implementation issues close through linked PRs.

M3-1 is merged through PR #43 and closed #37.
M3-2 is merged through PR #44 and closed #38.
M3-3 is merged through PR #45 and closed #39.
M3-4 is merged through PR #46 and closed #40.
M3-5 is merged through PR #47 and closed #41.
M3 epic #6 is closed. M3 milestone is closed.

## M4 Multimodal Interaction Lab

| Issue | Work | Default Decision |
|---|---|---|
| #50 | M4-1: Add interaction event graph schema | continue |
| #49 | M4-2: Persist text sessions as interaction events | continue |
| #53 | M4-3: Add transcription-first voice event import | continue |
| #52 | M4-4: Add image information-gap event fixture | continue |
| #54 | M4-5: Close multimodal-ready event graph gate | continue |

Current implementation target:

```bash
gh issue view 9
```

M4 is closed. Epics #7 and #8 were split into executable issues #50, #49, #53, #52, and #54 tied to `docs/MULTIMODAL-GENAI-PLAN.md`.
M4-1 is merged through PR #56 and closed #50.
M4-2 is merged through PR #57 and closed #49.
M4-3 is merged through PR #58 and closed #53.
M4-4 is merged through PR #59 and closed #52.
M4-5 is merged through PR #60 and closed #54.
M4 epics #7/#8 are closed with evidence comments.
M4 Multimodal Interaction Lab milestone is closed with `open_issues=0`.

## M5 Real Learning Validation

| Issue | Work | Default Decision |
|---|---|---|
| #9 | E9: Seven-day validation protocol | split |
| #62 | M5-1: Define seven-day validation protocol | continue |
| #63 | M5-2: Export seven-day pilot evidence pack | continue |
| #64 | M5-3: Add before-after transcript review rubric | continue |
| #65 | M5-4: Run target-persona seven-day validation fixture | continue |
| #66 | M5-5: Close real learning validation gate | continue |

Current implementation target:

```bash
gh issue view 72
```

M5 is closed. Epic #9 was split into executable issues #62-#66.
M5-1 is merged through PR #68 and closed #62.
M5-2 is merged through PR #69 and closed #63.
M5-3 is merged through PR #70 and closed #64.
M5-4 is merged through PR #71 and closed #65.
M5-5 is merged through PR #76 and closed #66.
M5 epic #9 is closed with evidence comments.
M5 Real Learning Validation milestone is closed with `open_issues=0`.

## M6 Private Beta Clone-to-Learn Release

| Issue | Work | Default Decision |
|---|---|---|
| #72 | M6-1: Verify private beta / invited-user clean clone setup path | pivot |
| #73 | M6-2: Verify marketplace packaging and install docs | continue |
| #74 | M6-3: Harden first-run onboarding and support diagnostics | continue |
| #75 | M6-4: Close private beta clone-to-learn release gate | continue |
| #78 | M6-D: Decide repository visibility for clone-to-learn | pivot |

Current implementation target:

```bash
gh issue view 75
```

M6 is closed as private beta / invited-user clone-to-learn. Epic #10 has been moved to M7 for unauthenticated public distribution, and #78 resolved repository visibility by choosing private beta / invited-user clone-to-learn for M6.

#78 evidence currently shows:

- `docs/distribution-policy.json` sets `currentPolicy=private-beta`.
- M6 release claim is `invited-user clone-to-learn`.
- unauthenticated public release is deferred to M7 #83.

#72 evidence currently shows:

- authenticated clone mechanics pass with `ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE=1 node scripts/phase6-public-clean-clone-smoke.mjs`.
- default public clone smoke fails by design while repository visibility is `PRIVATE`.
- M6 may claim private beta / invited-user clone-to-learn, not unauthenticated public clone-to-learn.

#73 evidence currently shows:

- clean clone can package a local marketplace root with `scripts/package-local-marketplace.mjs`.
- isolated `CODEX_HOME` can add that marketplace and install `english-learning-harness@phase6-marketplace`.
- README explicitly keeps public Git-backed install unverified and avoids unsupported URL/GitHub install commands.

#74 evidence currently shows:

- setup/health/status JSON outputs include support diagnostics.
- context output includes a support diagnostics section.
- corrupt local progress returns explicit `setup --repair` recovery.
- repair backs up broken local JSON files and restores valid progress v2.

#75 gate audit currently shows:

- M6 release gate audit returns `ready_to_close_m6_private_beta`.
- #73 and #74 are complete.
- unauthenticated public distribution remains deferred to M7 #83.

## M7 Public Distribution Release

| Issue | Work | Default Decision |
|---|---|---|
| #10 | E10: Public onboarding and distribution | split |
| #83 | M7-1: Prove unauthenticated public distribution path | continue |
| #90 | M7-D: Decide public distribution surface and publish authority | continue |
| #94 | M7-2: Prepare public artifact repository handoff bundle | continue |
| #96 | M7-3: Prepare public artifact repository onboarding README | continue |
| #98 | M7-4: Align release workflow with separate public artifact repository | continue |
| #100 | M7-5: Verify public release URL with checksum handoff | continue |
| #102 | M7-6: Record no-publish artifact repo workflow evidence | continue |
| #104 | M7-7: Add public publication preflight | continue |
| #106 | M7-8: Verify plugin install from downloaded public artifact | continue |
| #108 | M7-9: Prepare owner approval packet for public artifact publication | continue |
| #110 | M7-10: Align public release policy with artifact-first path | continue |
| #112 | M7-11: Prepare repository for open-source public launch | continue |
| #114 | M7-12: Audit git history before public visibility change | continue |

M7 now targets the current source repository as the open-source public distribution surface. Do not advertise public clone/install claims until the repository is public and public clone smoke passes.

#90 decision currently shows:

- the recommended public surface is now this source repository as an open-source public repository.
- a separate public artifact repository is no longer the primary path; it remains an optional fallback if the source repository must stay private.
- Codex must not change repository visibility until open-source readiness smoke passes and the owner intentionally approves the final visibility change.
- `scripts/phase7-public-release-decision-smoke.mjs` verifies the decision gate and prevents public distribution completion from being claimed before public clone proof.
- #94 prepares a local handoff bundle for a separate public artifact repository without publishing.
- #96 adds a public artifact repository README to that handoff so the public repository URL can explain download, verification, extraction, setup, and first practice.
- #98 aligns the manual workflow so optional publication targets `artifact_repo` with `PUBLIC_ARTIFACT_REPO_TOKEN`, not the private source repository.
- #100 adds checksum-aware public release URL smoke for artifact plus `SHA256SUMS`.
- #102 records a successful no-publication GitHub Actions run for the artifact repo workflow.
- #104 adds a non-publishing preflight that reports owner decision and artifact repository readiness before any release action.
- #106 verifies local Codex plugin install from a checksum-verified downloaded public artifact.
- #108 now prepares the non-publishing owner approval packet for the source repository visibility change and required public clone proof.
- #110 keeps artifact release as a fallback but makes public source clone the primary path.
- #112 adds open-source community files and readiness smoke before repository visibility changes.
- #114 adds git history audit before repository visibility changes.
- repository visibility is now public, and #83 can close because `node scripts/phase6-public-clean-clone-smoke.mjs` passes without `ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE`.

#94 evidence currently shows:

- `scripts/prepare-public-artifact-handoff.mjs` generates a handoff directory containing the tarball, `SHA256SUMS`, `PUBLIC-ARTIFACT-MANIFEST.json`, and `RELEASE-NOTES.md`.
- `scripts/phase7-public-artifact-handoff-smoke.mjs` verifies checksum, manifest, tarball required files, forbidden path exclusions, and `publicationPerformed=false`.
- the handoff manifest includes a publication command as text and the real public URL smoke command.
- the handoff includes top-level `README.md` for the future public artifact repository with latest release download, checksum, extract, setup, daily, today, and public URL smoke guidance.
- this does not create a public repository, publish a release, prove a public URL, or close #83/#90.

#98 evidence currently shows:

- `.github/workflows/public-artifact.yml` keeps `publish_release=false` as the default.
- the workflow has an `artifact_repo` input defaulting to `bborok1234/english-learning-harness-public`.
- optional publication requires `PUBLIC_ARTIFACT_REPO_TOKEN`.
- `gh release view/create/upload` commands target `--repo "$ARTIFACT_REPO"`.
- source repository workflow permissions are read-only.
- no publication is executed by the smoke or PR.

#100 evidence currently shows:

- `scripts/phase7-public-release-url-smoke.mjs` downloads `english-learning-harness-public.tar.gz` and `SHA256SUMS`.
- the smoke verifies `shasum -a 256 -c SHA256SUMS` before extraction.
- the extracted artifact can run setup, daily, and today.
- local loopback mode reports `hostedAccessStatus=local_loopback_only` and `canClosePublicDistribution=false`.
- real public URL mode requires both `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL` and `ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL`.

#102 evidence currently shows:

- GitHub Actions run `26619701714` completed successfully with `publish_release=false`.
- `artifact_repo` input was set to `bborok1234/english-learning-harness-public`.
- workflow artifact `english-learning-harness-public` was uploaded.
- publish release asset step was skipped.
- downloaded workflow artifact exists at `tmp/phase-7-artifact-repo-workflow-run/english-learning-harness-public/english-learning-harness-public.tar.gz` and is `317395` bytes.
- this does not create a public repository, publish a release, prove a public URL, or close #83/#90.

#104 evidence currently shows:

- `scripts/phase7-publication-preflight.mjs` verifies distribution policy, workflow target/token boundary, and handoff bundle readiness.
- current output reports `decisionStatus=owner_decision_required`.
- current output reports `artifactRepoStatus=unavailable` for `bborok1234/english-learning-harness-public`.
- current output reports `publicationReady=false` and `canPublishNow=false`.
- this does not create a public repository, publish a release, prove a public URL, or close #83/#90.

#106 evidence currently shows:

- `scripts/phase7-public-artifact-install-smoke.mjs` downloads the artifact and `SHA256SUMS` through local loopback.
- checksum verification passes before extraction.
- the extracted artifact packages a local marketplace.
- isolated `CODEX_HOME` installs `english-learning-harness@phase7-public-artifact`.
- public Git-backed plugin install remains unclaimed.

#108 evidence currently shows:

- `scripts/prepare-public-release-approval.mjs` generates `PUBLIC-RELEASE-APPROVAL.md` and `PUBLIC-RELEASE-APPROVAL.json` under `tmp/`.
- `scripts/phase7-public-release-approval-smoke.mjs` verifies the packet keeps `approvalRequired=true`, `repositoryVisibilityChanged=false`, `canPublishNow=false`, and `canClosePublicDistribution=false`.
- the packet includes the explicit repository visibility command and required public clone smoke command.
- this does not change repository visibility, prove public clone access, or resolve #90/#83.

#110 evidence currently shows:

- `docs/distribution-policy.json` now groups public release requirements by `publicSourceRepository`, `publicArtifactRepositoryRelease`, and `publicStaticArtifactUrl`.
- `scripts/phase6-distribution-policy-smoke.mjs` verifies the default public clone smoke remains required for the public source repository path.
- the same smoke verifies the artifact release path is now a fallback requiring `scripts/phase7-public-release-url-smoke.mjs` with artifact and `SHA256SUMS` URLs, while keeping Git-backed plugin install unclaimed.
- this does not create a public repository, publish a release, prove public URL access, or resolve #90/#83.

#112 evidence currently shows:

- `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, and `GOVERNANCE.md` exist.
- `.github` issue templates and pull request template exist.
- `scripts/phase7-open-source-readiness-smoke.mjs` verifies README public clone framing, policy alignment, required community files, and absence of obvious local secret files.
- current output reports `visibilityReady=true` because `bborok1234/english-learning-harness` is now `PUBLIC`.
- this does not change repository visibility or prove public clone access.

#114 evidence currently shows:

- `scripts/phase7-open-source-history-audit-smoke.mjs` scans all git revisions and committed paths.
- current output reports `forbiddenPathFindings=0`, `secretContentFindings=0`, and `largeObjectFindings=0`; revision and path scan counts are intentionally not treated as stable dashboard facts because they change with every merge.
- this does not change repository visibility or prove public clone access.

#83/#90 final public source evidence currently shows:

- `gh repo view bborok1234/english-learning-harness` reports `visibility=PUBLIC` and `isPrivate=false`.
- `node scripts/phase6-public-clean-clone-smoke.mjs` passes without `ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE`.
- the smoke verifies public `git clone`, setup, daily, today, weekly, home, export, progress validation, and clean clone git status.
- public Git-backed plugin install, realtime voice, and long-term learner outcomes remain unclaimed.

#117/#120 Codex-native README evidence currently shows:

- `README.md` now leads with Codex as the learner-facing surface: open the repo in Codex, speak to Codex in natural language, and let Codex use the local engine internally.
- the learner prompt examples no longer present `node scripts/...` as the product path.
- `node` commands are moved under `Internal Engine For Maintainers`.
- Codex skill instructions now explicitly say not to ask learners to run `node` commands for ordinary onboarding, daily practice, mini mirror, or picture-description practice.
- maintainer verification and public distribution details are below learner onboarding instead of being the first thing a visitor sees.
- `scripts/phase7-learner-readme-smoke.mjs` verifies the README keeps Codex-native natural-language onboarding before internal engine commands and preserves the public clone commands.
- existing public clone, open-source readiness, and local marketplace README audits still pass.
- this improves first-time public understanding; it does not claim realtime voice, accent scoring, public Git-backed plugin install, or long-term learner outcomes.

#122 agent-installed harness evidence currently shows:

- `docs/BENCHMARK-HARNESS-TRENDS.md` records the `oh-my-openagent` and `gstack` pattern: paste prompt into agent, agent installs skills/setup, user invokes workflows by natural language or slash commands.
- `setup --host codex` installs `english-learning-onboarding`, `english-learning-daily-session`, `english-learning-mini-mirror`, and `english-learning-picture-description` into `~/.codex/skills`.
- `scripts/phase7-agent-install-smoke.mjs` verifies setup in an isolated temp Codex skills dir, including default symlink mode and `--copy` mode.
- README now leads with a paste-into-Codex install prompt and rejects human clone/download as the primary path.
- this does not publish an npm/binary installer or prove public Git-backed plugin install.

#124 Korean-primary README evidence currently shows:

- `README.md` is now Korean-first because the primary target learner is Korean.
- `README.en.md` is the secondary English surface.
- the first public path remains paste prompt into Codex, not human clone/download or learner-operated Node commands.
- `scripts/phase7-learner-readme-smoke.mjs` verifies Korean-first target positioning, natural-language Codex onboarding, and maintainer commands below the learner surface.
- public artifact packaging and open-source readiness smokes now verify the bilingual README surface.
- this does not add realtime voice, accent scoring, a binary installer, or real multi-day learner outcome proof.

#83 artifact fallback evidence currently shows:

- `scripts/package-public-artifact.mjs` creates a tarball candidate.
- `scripts/phase7-public-artifact-smoke.mjs` extracts the tarball and verifies setup, daily, today, weekly, home, export, and progress validation from the extracted artifact.
- `scripts/phase7-hosted-artifact-smoke.mjs` verifies URL download/extract/first-session mechanics through local loopback, and can verify a real public URL through `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL`.
- `.github/workflows/public-artifact.yml` can build and verify the artifact in GitHub Actions and optionally upload a release asset when manually dispatched.
- GitHub Actions run `26618527553` passed with `publish_release=false` and uploaded workflow artifact `english-learning-harness-public`.
- the tarball excludes `.git`, `.omx`, `tmp`, and `node_modules`.
- public artifact hosting/download remains optional fallback evidence; #83 closed through public source repository visibility plus public clone proof.

## M8 Speaking Skill OS

| Issue | Work | Default Decision |
|---|---|---|
| #128 | M8-1: Implement Speaking Skill OS diagnosis and backlog loop | continue |
| #130 | M8-2: Add multi-skill diagnosis and adaptive speaking queue | continue |
| #132 | M8-3: Add seven-day Speaking Skill OS simulation gate | continue |
| #134 | M8-4: Add research basis citation map | continue |

#128 evidence currently shows:

- `speaking-backlog.json` is created in the learner store.
- `diagnose` creates or refreshes a concrete speaking skill backlog item from learner output.
- `backlog` lists open/passed speaking skill items.
- `daily` and `today` prioritize an open backlog item before generic practice.
- `today` records transfer-test evidence back to the backlog and session artifact.
- `scripts/phase8-speaking-skill-os-smoke.mjs` proves diagnose -> backlog -> targeted practice -> pass evidence.
- this proves local harness mechanics, not real-world fluency or long-term learner outcomes.

#130 evidence currently shows:

- `diagnose` can create multiple speaking backlog items from one sample.
- backlog ordering prioritizes failed `needs_review` transfer work ahead of open generic practice.
- after repair passes, `daily` advances to the next unresolved skill.
- if clarification fails, the item stays at the front as `needs_review`.
- `scripts/phase8-speaking-skill-os-queue-smoke.mjs` proves multi-skill diagnosis and adaptive queue advancement.
- this remains heuristic local diagnosis, not certified speaking assessment.

#132 evidence currently shows:

- `scripts/phase8-speaking-skill-os-seven-day-smoke.mjs` seeds a multi-skill backlog and runs 7 daily sessions.
- the fixture records both passed and failed transfer attempts.
- failed clarification stays `needs_review` until a later pass.
- weekly mirror includes `speaking_os_summary`.
- export evidence includes speaking backlog counts.
- this is a local fixture gate, not real learner outcome proof.

#134 evidence currently shows:

- `docs/RESEARCH-BASIS.md` maps source families to product behaviors, implementation surfaces, and claim boundaries.
- README Korean/English surfaces link to the research basis instead of leaving citations hidden in planning docs.
- `docs/LEARNING-ENGINE.md` now points to the citation map and adds a Speaking Skill OS research anchor.
- `scripts/phase8-research-basis-smoke.mjs` verifies required source URLs, README links, and unsupported-claim guardrails.
- this justifies the instructional design direction; it does not prove real learner outcome improvement.

## M9 Real Learner Pilot Bridge

| Issue | Work | Default Decision |
|---|---|---|
| #136 | M9-1: Add owner pilot state and command surface | continue |
| #137 | M9-2: Generate owner pilot report and transcript review bridge | continue |
| #138 | M9-3: Add learner-facing pilot prompts and privacy handoff | continue |
| #139 | M9-4: Close owner pilot readiness gate and dashboard | continue |

#136 evidence currently shows:

- M9 milestone description uses `repository owner / self pilot participant`, not an assumed personal name.
- `pilot-start` creates `pilot-state.json`, local-only consent boundary, and Day 0 baseline prompt/state.
- `pilot-start --say ...` stores baseline evidence and seeds Speaking Skill OS diagnosis.
- `pilot-day` records daily session artifact references and optional friction notes.
- `pilot-status` reports baseline, daily-session count, readiness, and next action.
- `pilot-finish` compares baseline/final samples through the transcript review rubric and writes local JSON/Markdown pilot reports.
- `scripts/phase9-owner-pilot-smoke.mjs` verifies the end-to-end mechanics and fails if the state assumes the wrong personal name.
- this creates owner-pilot mechanics; it does not run the actual owner pilot or prove real learner outcomes yet.

#138 evidence currently shows:

- `pilot-start` and `pilot-status` return learner-facing conversation guides.
- Day 0 is framed as a "3분 영어 스냅샷" with five concrete mission cards.
- The old ambiguous style `A clarification question I can ask` is recorded as a rejected bad prompt in `docs/PILOT-PROMPTS.md`.
- The replacement prompt gives a concrete situation, unclear phrase, one-sentence ask, and example answer.
- README includes a Korean pilot start prompt and local-only privacy reminder.
- `scripts/phase9-pilot-prompt-ux-smoke.mjs` verifies mission cards, concrete examples, privacy copy, and absence of ambiguous internal prompt wording.

#137/#139 evidence currently shows:

- `pilot-day` now runs through the Codex-operated `practice` flow instead of a standalone `today` session.
- Each pilot day stores learner-root relative links to the generated mission, generated scene, learner report, and cockpit.
- `pilot-finish` writes JSON and Markdown reports that include the AIOS artifact bridge plus transcript rubric decision.
- The final learner report and final cockpit are regenerated at pilot closeout and linked from the pilot report.
- `scripts/phase9-pilot-aios-readiness-smoke.mjs` verifies five pilot days, all daily AIOS artifact links, final report/cockpit linkage, and unsupported-claim guardrails.
- this closes local owner/self pilot readiness mechanics; it still does not prove real learner outcome improvement or realtime voice support.

## M10 Narrative Mission Layer

| Issue | Work | Default Decision |
|---|---|---|
| #143 | M10-1: Define Narrative Mission Layer PRD and test spec | continue |
| #144 | M10-2: Add mission-spec and world-state data contracts | continue |
| #145 | M10-3: Implement mission validator and decorative-mission rejection | continue |
| #146 | M10-4: Implement one narrative mission parity fixture | continue |
| #147 | M10-5: Add capability router and no-gen fallback gate | continue |
| #148 | M10-6: Close narrative mission gate and update dashboard | continue |

M10 turns "immersive world" from cosmetic roleplay into a verified transfer wrapper over Speaking Skill OS. A mission is valid only when story progress requires the same speaking behavior that the backlog item is trying to train.

#143 evidence currently shows:

- `docs/M10-NARRATIVE-MISSION-PRD.md` defines the product boundary: narrative missions must be rejected if they can be completed without the target speaking skill.
- `docs/M10-NARRATIVE-MISSION-TEST-SPEC.md` defines planning, validator, world-state, parity, no-generation fallback, claim guard, and dashboard gates.
- `docs/DATA-CONTRACTS.md` now includes M10 `mission-spec.json`, `world-state.json`, and `tool-capabilities.json` contracts.
- `docs/phase-10-evidence/M10-1-narrative-mission-design.md` records the Claude cross-review finding that a mission win condition must be equivalent to a Speaking Skill OS transfer test.
- `scripts/phase10-narrative-mission-plan-smoke.mjs` verifies the planning artifacts, issue linkage, status/dashboard state, and claim boundaries.
- This does not implement generated worlds yet; it creates the gate that future generated worlds must pass.

#144 evidence currently shows:

- `docs/narrative-missions/schemas/mission-spec.schema.json`, `world-state.schema.json`, and `tool-capabilities.schema.json` define the machine-readable M10 contracts.
- `docs/narrative-missions/fixtures/usual-place-clarification.mission-spec.json`, `daily-life.world-state.json`, and `light.tool-capabilities.json` provide the first positive text-first fixture.
- `scripts/lib/narrative-mission.mjs` validates world state and tool capabilities before mission state can progress.
- `scripts/phase10-world-state-smoke.mjs` rejects multiple NPCs, child mode, long lore before output, disabled text capability, and missing text scene fallback.
- This proves data-contract admission only; it does not implement narrative session parity.

#145 evidence currently shows:

- `scripts/lib/narrative-mission.mjs` validates mission specs against a Speaking Skill OS backlog item.
- `target_skill`, `transfer_test`, and `win_condition.must_pass_backlog_item` must match the linked backlog item.
- generated/media capabilities are optional only; text must be the required path.
- `scripts/phase10-mission-spec-validator-smoke.mjs` rejects missing backlog links, skill mismatch, win-condition mismatch, missing real-world transfer target, media-required missions, unsupported learning claims, and decorative story-completion missions.
- This proves decorative-mission rejection; it does not yet persist narrative mission learner evidence.

#146 evidence currently shows:

- `persistNarrativeMissionSession()` wraps a validated narrative mission around the existing `persistSession()` path.
- `scripts/phase10-narrative-mission-parity-smoke.mjs` compares plain `today` with the `usual-place-clarification` narrative mission.
- pass and needs-review fixture pairs produce the same backlog item id, skill, transfer result, backlog status, and transfer test.
- story consequence is persisted only after `speaking_backlog_evidence` exists and records the matching transfer result.
- This proves one text-first narrative mission parity fixture; it does not yet add richer generation, realtime voice, or multimodal scenes.

#147 evidence currently shows:

- `routeMissionCapabilities()` routes missions to `light`, `rich`, or `cinematic` presentation mode from available Codex capabilities.
- text remains the required learning path; generated media, voice, web, browser, and MCP stay optional presentation capabilities.
- `scripts/phase10-no-gen-fallback-smoke.mjs` proves `usual-place-clarification` completes and writes evidence with text-only capabilities.
- the same smoke rejects required image, required realtime voice, and missing text scene fallback.
- This proves no-generation fallback; it does not prove multimodal efficacy.

#148 evidence currently shows:

- `scripts/phase10-narrative-claim-guard-smoke.mjs` verifies blocked narrative, engagement, child-mode, and realtime claims remain visible without becoming allowed claims.
- `scripts/phase10-narrative-mission-gate-smoke.mjs` runs M10 planning, world-state, validator, parity, fallback, and claim-guard smokes.
- `docs/phase-10-evidence/M10-6-narrative-mission-closeout.md` records the M10 direction review and next goal candidate.
- M10 can close as local narrative-transfer mechanics complete, not as real learner outcome proof.

## Phase 11 AI-Native Learning OS

| Issue | Work | Default Decision |
|---|---|---|
| #154 | AIOS-1: Generate personal learner cockpit from runtime state | continue |
| #156 | AIOS-2: Generate daily mission artifacts linked to learner cockpit | continue |
| #158 | AIOS-3: Add interactive mission artifacts and learner reports | continue |
| #160 | AIOS-4: Add Codex-operated daily practice flow | continue |
| #162 | AIOS-5: Add generated scene artifacts to the daily practice loop | continue |
| #164 | AIOS-6: Add skill-level learner conversation simulation | continue |
| #166 | AIOS-7: Add adaptive generated scene variants | continue |
| #169 | AIOS-8: Add first-use conversation variant gate | continue |
| #171 | AIOS-9: Define multimodal mission asset contract | continue |
| #174 | AIOS-10: Generate learner-operable mission asset deck | continue |
| #176 | AIOS-11: Adapt mission asset priorities from learner evidence | continue |
| #210 | AIOS-13: Generate mission storyboard artifact | continue |
| #212 | AIOS-13: Link storyboard artifacts into report and cockpit | continue |
| #179 | AIOS-12: Run real owner/self AIOS pilot and journey audit | continue |

#154 evidence currently shows:

- `node scripts/english-learning-harness.mjs cockpit` writes `cockpit-state.json` and `cockpit.html` under the learner root.
- The cockpit connects today's mission, Speaking Skill OS, due review, multimodal interaction evidence, and 7-day/30-day journey windows.
- `scripts/personal-learner-cockpit-smoke.mjs` creates text, voice, and image session evidence, generates a weekly mirror, renders the cockpit HTML, and verifies no engineering PR/issue/smoke language leaks into the learner product surface.
- This proves local personal cockpit mechanics and evidence aggregation only. It does not prove learning outcomes or realtime voice.

#156 evidence currently shows:

- `node scripts/english-learning-harness.mjs mission` writes `artifacts/missions/daily-mission-YYYY-MM-DD.json` and `.html` under the learner root.
- The generated mission links to the current Speaking Skill OS item or daily scenario and includes required learner action, transfer test, text-first start command, optional voice/image commands, and prompt material.
- `scripts/generated-daily-mission-smoke.mjs` verifies mission generation, rendered HTML, product-surface leak guard, post-mission `today` evidence, and personal cockpit linkage.
- This proves generated mission artifact mechanics only. It does not prove learning outcomes, generated-world retention, or realtime voice.

#158 evidence currently shows:

- Generated mission HTML now includes selectable text, voice-transcript, and image information-gap practice modes.
- `node scripts/english-learning-harness.mjs report` writes `artifacts/reports/learner-report-YYYY-MM-DD.json` and `.html` under the learner root.
- Learner reports summarize 7-day/30-day session and interaction-event windows, modalities, saved phrases, Speaking Skill OS status, next focus, and latest generated mission linkage.
- Personal cockpit links the latest learner report from the journey section.
- `scripts/interactive-artifact-report-smoke.mjs` verifies Playwright tab interaction, report generation, cockpit linkage, text/voice/image evidence counts, product-surface leak guard, and unsupported-claim guard.
- This proves local interactive artifact/report mechanics only. It does not prove learning outcomes, generated-world retention, realtime voice, or real-world transfer.

#160 evidence currently shows:

- `node scripts/english-learning-harness.mjs practice` composes mission generation, session persistence, weekly mirror, learner report, and cockpit refresh into one Codex-operated daily flow.
- `skills/daily-session/SKILL.md` tells Codex to use the agent-operated `practice` path after collecting learner answers and not paste internal engine commands into learner-facing output.
- `scripts/codex-operated-practice-flow-smoke.mjs` verifies one practice run creates mission HTML, session artifact, weekly mirror, learner report JSON/HTML, cockpit state/HTML, Speaking Skill OS evidence, and no learner-facing command leakage.
- This proves local Codex-operated flow mechanics only. It does not prove learning outcomes, realtime voice, or real-world transfer.

#162 evidence currently shows:

- `node scripts/english-learning-harness.mjs scene` writes `artifacts/scenes/daily-scene-YYYY-MM-DD.json` and `.html`.
- Scene artifacts derive from the generated mission target skill, required speaking action, and transfer test.
- Scene HTML includes interactive Previous / Play / Next controls over scene entry, speaking cue, repair, and transfer checkpoint frames.
- `practice` now generates a scene artifact and learner report/cockpit link the latest scene.
- `scripts/generated-scene-artifact-smoke.mjs` verifies rendered interaction, report/cockpit linkage, session-evidence requirement, product-surface leak guard, and unsupported-claim guard.
- This proves local rich-artifact mechanics only. It does not prove Remotion efficacy, generated-world retention, realtime voice, or learning outcomes.

#164 evidence currently shows:

- `skills/daily-session/SKILL.md` rejects exposed rubric labels and project-specific first-use prompts.
- The daily-session skill defines a learner-facing transcript shape with an everyday prompt, learner answer, gentle recast, and mini mirror.
- `scripts/skill-conversation-simulation-smoke.mjs` verifies the simulated transcript has no Node/GitHub/PR/issue/smoke/rubric/project-planning/level/native-speaker/guaranteed-outcome/fluency-proof leakage.
- The same smoke runs the real `practice` engine and verifies mission HTML, scene HTML, session artifact, learner report, cockpit, report scene linkage, and cockpit report linkage.
- This proves a local skill-contract conversation fixture only. It does not prove real learner outcomes, hosted distribution, realtime voice, or perfect future LLM adherence.

#166 evidence currently shows:

- Generated scene state now includes skill/date-based `variant` metadata: id, label, setting, mood, prop, and cue style.
- Variant frames enrich setting and cue style while preserving mission target skill, transfer test, required session evidence, and Speaking Skill OS backlog link.
- Scene HTML, learner report, and cockpit expose latest scene variant labels.
- `scripts/adaptive-scene-variants-smoke.mjs` verifies clarification, repair, and soft-disagreement samples produce different variants with preserved evidence links and blocked unsupported claims.
- This proves local adaptive variant mechanics only. It does not prove engagement, retention, realtime voice, or learning outcomes.

#169 evidence currently shows:

- `skills/daily-session/SKILL.md` defines first-use variant coverage across clarification, repair, description, soft disagreement, and comfort/status scenes.
- `scripts/skill-conversation-variants-smoke.mjs` verifies four concrete first-use transcript variants: office clarification, cafe repair, nearby object description, and lunch soft disagreement.
- Each variant avoids Node/GitHub/PR/issue/smoke/rubric/project-planning/level/native-speaker/guaranteed-outcome leakage.
- Each variant runs the real `practice` flow and verifies generated mission, generated scene, session artifact, learner report, cockpit, and required scene evidence.
- This proves local first-use conversation variety and persistence mechanics only. It does not prove real learner outcomes, engagement, retention, or realtime voice.

#171 evidence currently shows:

- generated mission JSON includes a machine-readable `asset_contract`, not ad hoc decorative prompts.
- text-first fallback is the canonical completion path.
- interactive HTML scene, image information-gap prompt, voice transcript prompt, Remotion-style storyboard, and future realtime hook entries map to the same Speaking Skill OS target, required learner action, transfer test, and session evidence.
- `validateMissionAssetContract()` rejects decorative assets, assets that do not require learner output, contracts without canonical text, missing session evidence, and unsupported claims.
- `scripts/multimodal-mission-asset-contract-smoke.mjs` verifies the positive contract, rendered mission HTML summary, scene evidence alignment, and negative fixtures.
- realtime voice and generated-media learning gains remain blocked claims unless separately proven.

#174 evidence currently shows:

- `node scripts/english-learning-harness.mjs asset-deck` writes learner-root `artifacts/assets/mission-assets-YYYY-MM-DD.json/html`.
- `practice` now refreshes the mission asset deck together with mission, scene, session, weekly mirror, learner report, and cockpit.
- The deck renders all contract assets, including text-first, interactive HTML scene, image information-gap, voice transcript, Remotion-style storyboard, and future realtime hook.
- The deck completion policy says it cannot complete the mission without learner output saved as session evidence.
- Learner report and cockpit link the latest mission asset deck.
- `scripts/generated-mission-asset-deck-smoke.mjs` verifies command path, practice path, report/cockpit linkage, no engineering language leakage, and blocked unsupported claims.

#176 evidence currently shows:

- mission asset deck JSON includes deterministic asset priority and reason fields.
- different learner evidence states produce different top asset actions.
- cockpit exposes the next asset action while preserving the latest deck link.
- completion evidence requirements and blocked claims remain intact.
- `scripts/adaptive-mission-asset-priority-smoke.mjs` verifies the no-evidence -> text, text -> image, text+image -> voice, and text+image+voice -> interactive scene priority path.
- `docs/phase-11-evidence/AIOS-11-adaptive-mission-asset-priority.md` records the decision, verification commands, and claim boundary.

#210 evidence currently shows:

- `node scripts/english-learning-harness.mjs storyboard` writes learner-root `artifacts/storyboards/mission-storyboard-YYYY-MM-DD.json/html`.
- The generated storyboard is derived from the current generated mission, Speaking Skill OS target, required learner action, transfer test, and session evidence requirement.
- Storyboard HTML includes Previous / Play / Next controls over scene setup, speaking cue, model answer, and evidence checkpoint frames.
- `asset-deck` links the generated storyboard from the `remotion-storyboard` asset card.
- Learner reports and the personal cockpit link the latest storyboard artifact from their generated artifact sections.
- `scripts/generated-mission-storyboard-smoke.mjs` verifies command output, JSON/HTML existence, frame structure, interactive controls, asset deck linkage, learner report linkage, personal cockpit linkage, product-surface leak guards, and unsupported-claim guards.
- This proves local Remotion-style storyboard artifact mechanics only. It does not prove video rendering, realtime voice, retention, fluency, or real-world speaking improvement.

#214 evidence currently shows:

- Personal cockpit state/HTML no longer expose `node scripts/...`, `--learner-root`, or `start_command` for ordinary learner actions.
- Today mission, generated artifact empty state, and next actions are rendered as Korean Codex-facing prompts.
- `scripts/personal-learner-cockpit-smoke.mjs` checks cockpit JSON, HTML, and rendered text for internal command-token leakage.
- `scripts/adaptive-mission-asset-priority-smoke.mjs` checks the asset-deck-linked cockpit state does not reintroduce internal command fields.
- `scripts/product-surface-smoke.mjs` applies the same product-surface boundary to the tracked learner cockpit preview.
- This improves product/ops surface separation only. It does not close the real owner/self pilot or prove learning outcomes.

M14 Adaptive Asset Journey is closed with #176 complete.

## M15 Real Owner AIOS Pilot

| Issue | Work | Default Decision |
|---|---|---|
| #179 | AIOS-12: Run real owner/self AIOS pilot and journey audit | continue |
| #198 | AIOS-12: Add learner-ready pilot next prompt | continue |
| #200 | AIOS-12: Show learner-ready prompt in pilot next-card HTML | continue |
| #202 | AIOS-12: Add quick reply choices to pilot next card | continue |
| #204 | AIOS-12: Save pilot replies from quick reply selection | continue |
| #206 | AIOS-12: Make pilot quick replies visually selectable | continue |
| #208 | AIOS-12: Add copy buttons to pilot quick replies | continue |
| #214 | AIOS-14: Remove internal commands from learner cockpit product surface | continue |
| #216 | AIOS-15: Expose current pilot card and quick replies in learner cockpit | continue |
| #218 | AIOS-16: Do not store fake friction notes for pilot replies | continue |
| #220 | AIOS-17: Make the first pilot card an immersive scene chooser | continue |
| #222 | AIOS-18: Align owner-pilot skill contract with immersive first-card start | continue |
| #224 | AIOS-19: Add goal completion audit for AI-native OS objective | continue |
| #226 | AIOS-20: Add learner-ready daily practice start card | continue |
| #228 | AIOS-21: Route daily practice quick replies into persistence | continue |
| #230 | AIOS-22: Preserve daily start-card mission when saving practice replies | continue |
| #232 | AIOS-23: Defer daily reply diagnosis until after current mission persistence | continue |
| #234 | AIOS-24: Guard PR bodies from accidentally closing real-pilot blocker issues | continue |
| #236 | AIOS-25: Add learner-facing real pilot launch card | continue |
| #238 | AIOS-26: Surface real pilot launch card in learner cockpit | continue |
| #240 | AIOS-27: Guard learner-facing learning claims across product surfaces | continue |
| #242 | AIOS-28: Record local-only consent on first real pilot save | continue |
| #244 | AIOS-29: Generate local real-pilot run sheet before saving answers | continue |
| #246 | AIOS-30: Generate redacted real-pilot continuity handoff | continue |
| #248 | AIOS-31: Generate conversation-native pilot turn packet | continue |

#179 planned evidence should show:

- at least five real owner/self daily practice sessions through the Codex-operated flow.
- each day keeps learner transcript, mission, scene, asset deck top action, cockpit/report links, and friction notes.
- final audit compares baseline/final transcript behavior without claiming unsupported fluency outcomes.
- dashboard separates learner product evidence from engineering status and records continue/split/pivot/kill/research.

#179 current mechanics evidence shows:

- `pilot-day` preserves mission, scene, asset deck, next asset action, learner report, cockpit, session artifact, and friction note.
- `pilot-finish` writes `product_journey_audit` into the local pilot report.
- `scripts/phase15-owner-pilot-journey-audit-smoke.mjs` verifies the five-day fixture audit mechanics and claim boundaries.
- `docs/phase-15-evidence/AIOS-12-owner-pilot-journey-audit-mechanics.md` records that this is not a substitute for the real owner/self pilot run.
- `skills/owner-pilot/SKILL.md` lets Codex run Day 0, daily pilot days, and final sample collection inside conversation while using the local engine internally.
- `scripts/phase15-owner-pilot-skill-smoke.mjs` verifies the skill contract and keeps real pilot completion separate from fixture mechanics.
- `pilot-next` now writes a learner-facing `artifacts/pilot/pilot-next-card.html/json` card for the current pilot prompt without exposing internal commands.
- `pilot-next` now returns `assistantPrompt.text`, a Korean-first prompt Codex can say directly to the learner without assembling scattered state fields.
- `pilot-next-card.html` now renders the same learner-ready prompt section so the local HTML card and Codex conversation prompt stay aligned.
- `pilot-next` now returns quick reply choices and renders them as numbered choices in `pilot-next-card.html` so blocked learners can answer with a visible option number, copy, or lightly edit one sentence.
- `pilot-next-card.html` now gives each quick reply a local copy button so the learner can bring the sentence back to Codex without manually selecting text.
- `scripts/phase15-owner-pilot-next-card-smoke.mjs` verifies baseline/day card generation, learner-ready assistant prompt, quick replies, rendered prompt, numbered quick-reply choices, copy button wiring, cockpit linkage, progress advance, learner-facing privacy copy, and no internal command leakage.
- `pilot-reply --quick-reply` now resolves the selected current quick reply and saves its English sentence through the existing capture path.
- `scripts/phase15-owner-pilot-reply-routing-smoke.mjs` verifies invalid quick-reply selections fail before saving, `quick-1` persists Day 1 clarification, and numeric selection persists Day 2 repair.
- The first five daily pilot missions now cover clarification, repair, image/scene description, soft disagreement, and follow-up instead of repeating the same prompt.
- `scripts/phase15-owner-pilot-varied-day-missions-smoke.mjs` verifies the first five fixture pilot days expose distinct learner-facing speaking actions and become ready for final sample after five days.
- `pilot-day`/`pilot-finish` now preserve per-day `pilot_mission` metadata so final reports and product journey audit can see which speaking action was sampled.
- `pilot-day`/`pilot-finish` now preserve per-day `learner_coaching` so final reports can show the learner-facing recast/next phrase/focus produced by practice.
- `scripts/phase15-owner-pilot-journey-audit-smoke.mjs` verifies `days_with_pilot_mission_metadata`, `days_with_learner_coaching`, distinct pilot mission skills, and Markdown pilot action/coaching output.
- `pilot-capture` now durably stores one pilot card answer at a time and auto-commits the Day 0/final sample when the fifth card is captured.
- `pilot-capture` now refreshes the learner cockpit after each captured card, including partial Day 0/final answers and daily pilot captures.
- `scripts/phase15-owner-pilot-capture-smoke.mjs` verifies card-level baseline capture, automatic baseline commit, daily capture, next asset action preservation, and cockpit refresh.
- `pilot-reply` now lets Codex route the learner's current answer to the next baseline, daily, or final pilot slot without asking the learner for phase/card/day internals, then refreshes the next learner-facing card artifact, returns a learner-safe coaching summary, and writes a saved-reply HTML card.
- `scripts/phase15-owner-pilot-reply-routing-smoke.mjs` verifies baseline, daily, and final routing through `pilot-capture`, cockpit refresh, next-card refresh, learner-facing summary fields, saved-reply card generation, and no learner-facing command-token leakage.
- `scripts/phase15-owner-pilot-reply-card-render-smoke.mjs` verifies the saved-reply card renders in a browser with saved status, coaching cells, next phrase, next card content, and no internal command/issue/audit leakage.
- `docs/phase-15-evidence/AIOS-12-owner-pilot-codex-skill.md` records the Codex-facing pilot skill and install evidence.
- Personal cockpit now exposes active pilot progress and the next learner-facing pilot card while avoiding internal pilot command leakage.
- Personal cockpit now links the latest saved-reply card when `pilot-reply-card.html` exists.
- `scripts/personal-learner-cockpit-active-pilot-smoke.mjs` verifies one captured Day 0 card appears as active pilot progress in cockpit, next card remains learner-facing, and the saved-reply card link is present without command leakage.
- `docs/phase-15-evidence/AIOS-12-active-pilot-cockpit.md` records the active pilot cockpit evidence.
- Personal cockpit now links the current `pilot-next-card.html/json`, renders the learner-safe assistant prompt, and shows quick reply choices with copy buttons.
- `scripts/personal-learner-cockpit-active-pilot-smoke.mjs` verifies the current pilot card link, assistant prompt, quick replies, and copy buttons appear in cockpit without internal command leakage.
- `docs/phase-15-evidence/AIOS-15-active-pilot-cockpit-card-replies.md` records the active pilot cockpit current-card/quick-reply evidence.
- `pilot-reply` no longer saves `No explicit friction note captured.` as if it were a real learner friction note.
- Saved-reply cards now show a short learner-facing friction follow-up prompt when a daily reply did not include a friction note.
- `scripts/phase15-owner-pilot-reply-card-render-smoke.mjs` verifies no fake friction note is stored and the follow-up prompt renders; `scripts/phase15-owner-pilot-reply-routing-smoke.mjs` verifies explicit friction notes still count.
- `docs/phase-15-evidence/AIOS-16-honest-pilot-friction.md` records the honest friction evidence boundary.
- The fresh Day 0 pilot card now starts with `첫 장면 고르기`, three opening scene choices, and low-pressure quick replies that do not assume a project/work premise.
- `pilot-next-card.html/json` and the personal cockpit active pilot state can expose opening scene choices while keeping actual answer persistence separate.
- `scripts/phase15-owner-pilot-next-card-smoke.mjs` now renders the first pilot card in Playwright and verifies three scene choices, quick replies, copy buttons, and no internal command leakage.
- `docs/phase-15-evidence/AIOS-17-immersive-pilot-start.md` records the immersive pilot start evidence boundary.
- `skills/owner-pilot/SKILL.md` now tells Codex to begin a fresh Day 0 pilot from the generated `첫 장면 고르기` card and accept `1`, `2`, `3`, quick-reply ids, or a direct English sentence without exposing engine commands.
- `docs/PILOT-PROMPTS.md` now matches the immersive first-card contract instead of documenting the old fixed "오늘 뭐 했어?" start.
- `scripts/phase15-owner-pilot-skill-smoke.mjs` verifies the owner-pilot skill and prompt contract include the scene chooser and fail on stale fixed-start guidance.
- `docs/phase-15-evidence/AIOS-18-owner-pilot-skill-contract.md` records the Codex-facing contract alignment boundary.
- `scripts/aios-goal-audit.mjs` writes `docs/ops/goal-audit.json/html`, mapping the active AI-native OS stop conditions to current evidence and blockers.
- `scripts/aios-goal-audit-smoke.mjs` verifies the audit covers all eight stop conditions and keeps `overall_status=not_complete` while real owner/self pilot evidence is missing.
- `docs/phase-15-evidence/AIOS-19-goal-completion-audit.md` records the goal audit evidence boundary.
- `practice-next` now writes `artifacts/missions/practice-start-card.json/html` before answer persistence so ordinary daily practice has a learner-ready scene card with quick replies.
- `skills/daily-session/SKILL.md` now tells Codex to generate the `practice-next` card before asking the first daily prompt.
- `scripts/daily-practice-start-card-smoke.mjs` verifies the card JSON/HTML, scene-matched quick replies, copy buttons, cockpit link, and no internal command/issue/audit leakage.
- `docs/phase-15-evidence/AIOS-20-daily-practice-start-card.md` records the daily start-card evidence boundary.
- `practice-reply --quick-reply` now resolves selected start-card quick replies, runs the existing practice persistence flow, and writes a learner-facing saved-reply card.
- `practice-reply --say` saves direct learner sentences through the same reply route.
- `scripts/daily-practice-reply-routing-smoke.mjs` verifies quick-reply routing, freeform routing, invalid quick-reply rejection, saved-reply card rendering, cockpit/report links, and no internal command/issue/audit leakage.
- `docs/phase-15-evidence/AIOS-21-daily-practice-reply-routing.md` records the daily reply routing evidence boundary.
- `practice-reply` now preserves the start-card mission id, target skill, scene preset, and scene attachment when saving quick replies or direct learner sentences.
- `scripts/daily-practice-reply-routing-smoke.mjs` now fails if reply persistence silently retargets the current answer to a different Speaking Skill OS mission.
- `docs/phase-15-evidence/AIOS-22-preserve-practice-start-mission.md` records the daily reply mission-integrity fix and claim boundary.
- `practice-reply` now defers diagnosis until after current mission/session persistence when saving a start-card reply, so current evidence remains attached to the answered card while future Speaking Skill OS planning still updates.
- `scripts/daily-practice-reply-routing-smoke.mjs` now verifies `futureDiagnosis.timing=after_current_session` and a repair freeform answer creates a future `repair` backlog item without changing the saved mission.
- `docs/phase-15-evidence/AIOS-23-deferred-daily-reply-diagnosis.md` records the deferred diagnosis mechanics and claim boundary.
- `#179` was reopened after an accidental PR-body auto-close event; real owner/self pilot evidence is still missing.
- `scripts/pr-body-autoclose-guard.mjs` rejects GitHub issue-completion wording for protected blocker issue references.
- `scripts/pr-body-autoclose-guard-smoke.mjs` verifies unsafe protected wording fails and safe protected wording passes.
- `scripts/aios-goal-audit.mjs` now checks GitHub issue state for the real-pilot blocker and reports `closed_external_mismatch` if the protected tracker is not open.
- `docs/phase-15-evidence/AIOS-24-pr-body-autoclose-guard.md` records the tracker-integrity repair and guardrail evidence.
- `pilot-launch` now writes learner-facing JSON/HTML launch cards before saving any new real pilot answer.
- `scripts/phase15-owner-pilot-launch-card-smoke.mjs` verifies fresh/resume launch cards, browser render, no answer persistence, cockpit link, quick replies, privacy, and no internal language leakage.
- `skills/owner-pilot/SKILL.md` now tells Codex to generate the launch card before asking the learner for a real pilot answer.
- `docs/phase-15-evidence/AIOS-25-real-pilot-launch-card.md` records the launch-card mechanics and claim boundary.
- Personal cockpit now links `pilot-launch-card.html` as the primary active-pilot start/resume surface when the launch card exists.
- `scripts/personal-learner-cockpit-active-pilot-smoke.mjs` verifies launch card state/HTML linkage while keeping next-card and reply-card checks.
- `docs/phase-15-evidence/AIOS-26-cockpit-pilot-launch-link.md` records the cockpit launch-card discovery evidence.
- `scripts/product-claim-guard-smoke.mjs` verifies README.md, README.en.md, learner cockpit state/html, and RESEARCH-BASIS keep allowed learning-design claims separate from blocked outcome claims.
- `docs/phase-15-evidence/AIOS-27-product-claim-guard.md` records the product claim-governance evidence boundary.
- `pilot-capture` now records local-only consent metadata before the first saved pilot answer, while `pilot-launch` remains a no-save/no-consent preview surface.
- `scripts/phase15-owner-pilot-launch-card-smoke.mjs` verifies fresh launch does not create `pilot-state.json`; `scripts/phase15-owner-pilot-capture-smoke.mjs` verifies first saved answer records consent scope/timestamp.
- `docs/phase-15-evidence/AIOS-28-pilot-consent-save.md` records the first-save consent mechanics boundary.
- `pilot-run-sheet` now writes local JSON/HTML with the next learner prompt, quick replies, consent state, save boundary, launch-card link, and cockpit link before any real answer is saved.
- `scripts/phase15-owner-pilot-run-sheet-smoke.mjs` verifies fresh run sheets do not create `pilot-state.json`, rendered HTML shows `첫 저장 전`, and resume run sheets show existing local-only consent.
- `docs/phase-15-evidence/AIOS-29-pilot-run-sheet.md` records the local real-pilot run sheet evidence boundary.
- `pilot-handoff` now writes redacted local JSON/HTML with progress counts, next learner prompt, consent status, redaction flags, next-card link, and cockpit link for cross-turn/day pilot continuity.
- `scripts/phase15-owner-pilot-handoff-smoke.mjs` verifies handoff output excludes transcript text, friction notes, issue/PR/smoke/rubric/audit internals, and unsupported fluency claims while preserving next action counts.
- `docs/phase-15-evidence/AIOS-30-pilot-handoff.md` records the redacted continuity handoff evidence boundary.
- `pilot-turn` now writes a Codex operator turn packet with learner-only prompt copy, quick replies, operator-only save policy, and local launch/next/handoff/cockpit links for the next real-pilot conversation turn.
- `scripts/phase15-owner-pilot-turn-packet-smoke.mjs` verifies fresh/partial packets save no answer, expose Korean-first one-turn learner copy, render four local links, and exclude fixture transcript/friction text plus internal command, issue/PR, rubric, audit, and unsupported fluency language.
- `docs/phase-15-evidence/AIOS-31-pilot-turn-packet.md` records the conversation-native turn packet evidence boundary.
- `scripts/sync-local-pilot-dashboard.mjs` writes an ignored, redacted local pilot status overlay and local engineering dashboard without committing transcripts, private notes, media, or learner paths.
- `scripts/local-pilot-dashboard-sync-smoke.mjs` verifies the local overlay/dashboard sync with fixture data and redaction checks.
