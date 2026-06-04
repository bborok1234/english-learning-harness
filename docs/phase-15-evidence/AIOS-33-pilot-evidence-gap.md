# AIOS-33 Pilot Evidence Gap

Date: 2026-06-04
Issue: #252
Decision: continue

## Why

The remaining real-pilot blocker should be visible as concrete missing evidence, not as a vague open issue.

Codex can already generate launch, handoff, turn, cockpit, and saved-reply surfaces. Before asking for more real answers, Codex also needs a redacted operator surface that says exactly what is still missing: Day 0 cards, daily sessions, final sample, friction notes, local report, and direction decision.

## What Changed

- Added `pilot-evidence-gap`.
- The command writes:
  - `artifacts/pilot/pilot-evidence-gap.json`
  - `artifacts/pilot/pilot-evidence-gap.html`
- The gap includes:
  - required, collected, and remaining counts,
  - next safe learner-facing prompt,
  - quick replies,
  - links to turn packet, next card, handoff, and cockpit,
  - redaction flags and sharing boundary.
- The gap excludes transcript text and friction note text.
- Owner-pilot skill and data contracts now describe the gap as an internal Codex review surface.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-evidence-gap-smoke.mjs
```

The smoke validates:

- fresh `pilot-evidence-gap` does not save an answer.
- fresh gap shows zero Day 0 baseline cards and five remaining daily sessions.
- partial fixture gap shows complete Day 0, two daily sessions, two friction notes, no final sample, no local report, and no direction decision.
- rendered HTML links four local continuation surfaces.
- JSON, HTML, and rendered text do not leak fixture transcript text, fixture friction note text, internal command tokens, issue/PR language, rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is redacted evidence-gap navigation only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
