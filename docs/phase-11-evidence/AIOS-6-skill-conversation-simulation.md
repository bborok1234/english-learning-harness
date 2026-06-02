# AIOS-6: Skill-Level Learner Conversation Simulation

Issue: #164

## Why

The engine can now generate missions, scenes, reports, and cockpit surfaces. That is not enough if the skill surface still feels like a developer workflow.

AIOS-6 adds a skill-level conversation simulation gate: a first-time Korean learner should receive a concrete everyday prompt, answer in English, get a short mini mirror, and let Codex run persistence internally without command-line/process leakage.

## What Changed

- `skills/daily-session/SKILL.md` now rejects exposed rubric labels and project-specific first-use prompts.
- `skills/daily-session/SKILL.md` now includes a learner-facing transcript shape.
- `scripts/skill-conversation-simulation-smoke.mjs` validates the transcript contract and the real `practice` persistence path together.
- README Korean/English surfaces now state that first practice starts from everyday conversation, not repository/command explanations.

## Verification

Passing local check:

```bash
node scripts/skill-conversation-simulation-smoke.mjs
```

The smoke verifies:

- onboarding/daily-session/mini-mirror skill contracts ban learner command chores;
- the daily-session skill defines learner-facing transcript shape;
- the simulated transcript avoids Node, GitHub, PR/issue, smoke, rubric, project-planning, level, native-speaker, guaranteed-outcome, and fluency-proof language;
- the transcript starts from an everyday ambiguity and ends with mini mirror sections;
- the real `practice` engine path creates mission HTML, scene HTML, session artifact, learner report, and cockpit;
- learner report and cockpit link the generated scene/report surfaces.

## Claim Boundary

This proves a local skill-contract conversation fixture and Codex-operated persistence path only.

It does not prove real learner outcomes, hosted distribution, realtime voice, or that every future LLM response will perfectly follow the contract.
