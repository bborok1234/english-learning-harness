# GitHub Issue Index

Last updated: 2026-05-28
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

| Issue | Epic | Area |
|---|---|---|
| #1 | E1 Platform reliability | platform |
| #2 | E2 Learner memory and data contracts | learning-engine |
| #3 | E3 Scenario-based daily session | learning-engine / conversation-ux |
| #4 | E4 Tutor policy enforcement | conversation-ux |
| #5 | E5 Persona fixture evaluation | evaluation |
| #6 | E6 Dashboard and human-readable progress | evaluation |
| #7 | E7 Multimodal interaction event graph | multimodal |
| #8 | E8 Voice image video learning loops | multimodal |
| #9 | E9 Seven-day validation protocol | evaluation |
| #10 | E10 Public onboarding and distribution | distribution |

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

Start #17 after #16 merges:

```bash
git switch -c issue-17-clean-clone-first-usable-smoke
```

From #12 onward, implementation issues close through linked PRs.
