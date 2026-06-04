# AIOS-35 Pilot Friction Attach

Date: 2026-06-04
Issue: #256
Decision: continue

## Why

Real pilot conversation is naturally two-step:

1. The learner answers the English card.
2. Codex asks a small follow-up about what felt hard.

Before this change, friction could be saved when the answer and note arrived together, but there was no dedicated route to attach the follow-up note after the answer was already saved. That made honest friction evidence too brittle for the real owner/self pilot.

## What Changed

- Added `pilot-friction`.
- The command attaches a friction note to an existing completed daily pilot record.
- It updates:
  - `days[].friction_note`,
  - matching `partial.days[].friction_note`,
  - redacted evidence gap,
  - learner cockpit,
  - learner-safe `pilot-friction-card.json/html`.
- It does not create a new learner answer, duplicate a daily session, change transcript text, or mark new consent.
- The confirmation card and returned public-safe JSON do not expose the friction note text.
- The owner-pilot skill now tells Codex to use this route when a daily friction follow-up arrives after the saved answer.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-friction-attach-smoke.mjs
```

The smoke validates:

- a daily answer saved without friction keeps a follow-up prompt.
- `pilot-friction` attaches the note to the latest completed daily record.
- daily session count and session id remain unchanged.
- local `pilot-state.json` stores the friction note.
- redacted evidence gap count increases.
- cockpit links the latest friction confirmation card.
- confirmation card renders in a browser.
- command output, confirmation HTML, cockpit HTML, and rendered text do not leak fixture friction note text, engine command tokens, issue/PR language, rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is honest friction evidence collection mechanics only.

It does not run the real owner/self pilot, save a new real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
