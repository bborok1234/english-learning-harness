# M2-3 Memory-Aware Scenario Planner

Date: 2026-05-28
Issue: #27
Decision: continue

## Why

Daily practice should not feel like a new disconnected prompt every day. The planner needs to reuse due phrases, respect learner profile boundaries, and adapt intensity from local learner state.

## What changed

- Added deterministic `planScenario` behavior.
- Planner reads learner model state, due review items, and profile text.
- Due review phrases are embedded in the next scenario goal/opening.
- Scenario artifacts record `selection_reason`.
- Planner avoids profile `topics_to_avoid`; sensitive avoided topics are masked in artifacts.
- Planner chooses easy/normal/stretch mode from average utterance words and start evidence.

## Verification

Commands run:

```bash
node scripts/phase2-scenario-planner-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase1-scenario-loop-smoke.mjs
node scripts/phase2-review-vault-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Result: all passed.

Key scenario planner smoke evidence:

```json
{
  "status": "pass",
  "avoidedScenario": "stuck-repair",
  "plannedScenario": "stuck-repair",
  "mode": "stretch",
  "selectionReason": {
    "source": "due-review",
    "due_review_id": "phrase-tea-helps-me-focus",
    "due_review_phrase": "Tea helps me focus.",
    "weak_skill": "repair",
    "mode": "stretch",
    "avoided_topics": ["coffee"]
  }
}
```

## Review Finding Fixed

The first persona fixture regression exposed a harmful `topics_to_avoid` phrase being echoed into `selection_reason`. The planner now uses exact avoided topics only for matching and stores masked labels for sensitive multi-word avoided topics.

## Remaining Boundary

This proves local deterministic planner behavior. It does not prove that personalization quality improves over weeks; that belongs to weekly mirror and real learner validation.
