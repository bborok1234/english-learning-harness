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

M6 remains open until #72/#75/#78 are closed with the private-beta pivot. Epic #10 has been moved to M7 for unauthenticated public distribution, and #78 resolves repository visibility by choosing private beta / invited-user clone-to-learn for M6.

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
| #83 | M7-1: Prove unauthenticated public distribution path | research |

M7 remains open for a future public repository clone or separate public artifact. Do not advertise public clone/install claims until M7 evidence exists.
