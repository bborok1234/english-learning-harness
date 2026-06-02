# AIOS-3: Interactive Mission Artifacts and Learner Reports

Issue: #158

## Why

The AI-native OS goal requires more than a chatbot-style daily prompt. A generated mission should become a learner-operable artifact, and the learner should be able to see recent practice evidence as a 7-day/30-day journey.

This slice moves two product surfaces forward:

- generated daily missions now render selectable text, voice-transcript, and image information-gap practice modes;
- learner reports summarize local sessions, interaction modalities, saved phrases, Speaking Skill OS status, next focus, and linked mission artifacts.

## What Changed

- `node scripts/english-learning-harness.mjs mission` still writes `artifacts/missions/daily-mission-YYYY-MM-DD.json/html`, but the HTML now includes interactive practice-mode tabs and a learner draft area.
- `node scripts/english-learning-harness.mjs report` writes `artifacts/reports/learner-report-YYYY-MM-DD.json/html`.
- `cockpit` state and HTML link the latest learner report under the 7-day/30-day journey section.
- README Korean/English surfaces now mention interactive mission artifacts and learner reports as Codex-operated surfaces, not learner chores.
- `scripts/interactive-artifact-report-smoke.mjs` validates the new loop.

## Verification

Passing local checks:

```bash
node scripts/interactive-artifact-report-smoke.mjs
node scripts/generated-daily-mission-smoke.mjs
node scripts/personal-learner-cockpit-smoke.mjs
```

The new smoke verifies:

- mission HTML renders three practice-mode tabs and panels;
- Playwright can switch voice/image tabs and observe panel visibility changes;
- text, voice, and image sessions produce three 30-day interaction events;
- learner report JSON/HTML is generated under `artifacts/reports/`;
- the report links the latest generated mission;
- personal cockpit links the latest learner report;
- learner product surfaces do not leak PR/issue/smoke/milestone language;
- unsupported outcome claims remain blocked.

## Claim Boundary

This proves local product-surface mechanics and local evidence aggregation only.

It does not prove long-term learning improvement, realtime voice tutoring, generated-world retention, pronunciation quality, or real-world conversation transfer.
