# AIOS-23 Deferred Daily Reply Diagnosis

Date: 2026-06-04
Issue: #232
Decision: continue

## Why

AIOS-22 fixed mission drift by preventing `practice-reply` from diagnosing a learner answer before the current start-card mission was persisted.

That solved the integrity bug, but it also risked losing an adaptive-learning signal: a learner answer can reveal the next Speaking Skill OS target even when the current answer must stay attached to the current card.

## What Changed

- `practice()` now remembers whether an active backlog item existed before current mission generation.
- For current start-card replies, `practice()` still skips pre-mission diagnosis.
- After the current session is persisted, `practice()` runs diagnosis as `futureDiagnosis` when there was no active backlog before the reply.
- Returned JSON distinguishes:
  - `diagnosis.timing = before_current_mission`
  - `futureDiagnosis.timing = after_current_session`
  - `futureDiagnosis.purpose = future_practice_planning`

## Verification

Passed:

```bash
node scripts/daily-practice-reply-routing-smoke.mjs
```

The smoke validates:

- current reply persistence does not run pre-mission diagnosis.
- the saved reply preserves the start-card mission id, target skill, scene preset, and scene attachment.
- quick-reply and freeform reply paths both preserve the current mission.
- a freeform repair sentence creates a future `repair` diagnosis after the current mission is persisted.
- invalid quick-reply selection still fails before writing a reply card.
- learner-facing saved-reply HTML still avoids internal command, issue, PR, smoke, and rubric language.

Observed fixture evidence:

```json
{
  "saved_mission": {
    "id": "daily-generated-2026-06-04-starts",
    "target_skill": "starts",
    "scene_preset": "cafe-repair"
  },
  "future_backlog": [
    {
      "id": "speaking-repair",
      "skill": "repair",
      "status": "open"
    }
  ]
}
```

## Claim Boundary

This is adaptive planning mechanics evidence only.

It does not save a real learner answer, prove engagement, prove speaking improvement, complete #179, or complete the active AI-native OS goal.
