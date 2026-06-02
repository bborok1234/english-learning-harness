# AIOS-4: Codex-Operated Daily Practice Flow

Issue: #160

## Why

The public product promise is that the learner stays in a Codex conversation. If the daily loop requires learners to manually run engine commands, the harness becomes a developer tool instead of an English learning OS.

AIOS-4 adds a single agent-operated practice path so Codex can update the daily learning system behind the conversation.

## What Changed

- `node scripts/english-learning-harness.mjs practice` composes the daily loop:
  - optional Speaking Skill OS diagnosis from learner turns,
  - generated daily mission artifact,
  - persisted session evidence,
  - weekly mirror,
  - 7-day/30-day learner report,
  - personal cockpit.
- `skills/daily-session/SKILL.md` now makes this `practice` path the preferred internal persistence route after collecting learner answers.
- `skills/onboarding/SKILL.md` now hands first practice to the daily-session flow.
- README Korean/English surfaces clarify that Codex operates the daily engine after the learner answers.
- `scripts/codex-operated-practice-flow-smoke.mjs` verifies the flow.

## Verification

Passing local checks:

```bash
node scripts/codex-operated-practice-flow-smoke.mjs
node scripts/interactive-artifact-report-smoke.mjs
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

The new smoke verifies:

- the daily-session skill names the agent-operated `practice` path;
- the learner-facing summary does not leak internal Node/GitHub/smoke language;
- one `practice` run creates mission HTML, session artifact, weekly mirror, learner report JSON/HTML, and cockpit state/HTML;
- the practice run can create and target a Speaking Skill OS backlog item from the learner sample;
- the learner report links the generated mission;
- the cockpit links both the generated mission and learner report.

## Claim Boundary

This proves Codex-operated local learning-flow mechanics only.

It does not prove long-term learning improvement, realtime voice, pronunciation quality, or real-world conversation transfer.
