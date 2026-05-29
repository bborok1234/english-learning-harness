# GitHub Issue Index

Last updated: 2026-05-29
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
| #10 | E10 Public onboarding and distribution | distribution | open |

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
- current output reports `revisionsScanned=119`, `committedPathsScanned=181`, `forbiddenPathFindings=0`, `secretContentFindings=0`, and `largeObjectFindings=0`.
- this does not change repository visibility or prove public clone access.

#83/#90 final public source evidence currently shows:

- `gh repo view bborok1234/english-learning-harness` reports `visibility=PUBLIC` and `isPrivate=false`.
- `node scripts/phase6-public-clean-clone-smoke.mjs` passes without `ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE`.
- the smoke verifies public `git clone`, setup, daily, today, weekly, home, export, progress validation, and clean clone git status.
- public Git-backed plugin install, realtime voice, and long-term learner outcomes remain unclaimed.

#83 evidence currently shows:

- `scripts/package-public-artifact.mjs` creates a tarball candidate.
- `scripts/phase7-public-artifact-smoke.mjs` extracts the tarball and verifies setup, daily, today, weekly, home, export, and progress validation from the extracted artifact.
- `scripts/phase7-hosted-artifact-smoke.mjs` verifies URL download/extract/first-session mechanics through local loopback, and can verify a real public URL through `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL`.
- `.github/workflows/public-artifact.yml` can build and verify the artifact in GitHub Actions and optionally upload a release asset when manually dispatched.
- GitHub Actions run `26618527553` passed with `publish_release=false` and uploaded workflow artifact `english-learning-harness-public`.
- the tarball excludes `.git`, `.omx`, `tmp`, and `node_modules`.
- public hosting/download is still unproven, so #83 remains open until hosted access reports `public_url_candidate`.
