# AIOS-22 Preserve Practice Start Mission

Date: 2026-06-04
Issue: #230
Decision: continue

## Why

During the active AI-native OS goal audit, `practice-reply` showed a product-flow integrity bug:

- `practice-next` could show a daily start card for one Speaking Skill OS target, such as `starts`.
- `practice-reply` then saved the learner answer through `practice()`.
- `practice()` diagnosed the answer before regenerating mission artifacts.
- That diagnosis could add a new backlog target, so the saved reply card attached the answer to a different mission, such as `follow_ups`.

For the learner, this means "the card I answered" and "the evidence that got saved" can diverge.

## What Changed

- `practice-reply` now marks the call as preserving the current start-card mission.
- `practice()` skips pre-mission diagnosis when saving a current start-card reply, so diagnosis cannot silently retarget the mission receiving the current answer.
- The saved reply card now includes `target_skill` and `scene_preset` inside its mission summary.
- `daily-practice-reply-routing-smoke` now fails if reply persistence changes the start-card `mission.id`, `target_skill`, or `scene_preset`.

## Verification

Passed:

```bash
node scripts/daily-practice-reply-routing-smoke.mjs
```

The smoke validates:

- quick-reply selection saves the selected sentence.
- freeform reply saves through the same route.
- invalid quick-reply selection fails before writing a reply card.
- reply-card HTML renders in Playwright.
- learner-facing output does not leak internal command, issue, PR, smoke, or rubric language.
- the saved reply preserves the start-card mission id, target skill, scene preset, and scene attachment.

Observed fixture evidence after the fix:

```json
{
  "mission": {
    "id": "daily-generated-2026-06-04-starts",
    "target_skill": "starts",
    "scene_preset": "cafe-repair"
  },
  "scene": {
    "id": "daily-scene-2026-06-04-starts"
  }
}
```

## Claim Boundary

This is mechanics evidence for daily reply persistence integrity only.

It does not save a real learner answer, prove engagement, prove speaking improvement, complete #179, or complete the active AI-native OS goal.
