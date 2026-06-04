# AIOS-30 Pilot Handoff

Date: 2026-06-04
Issue: #246
Decision: continue

## Why

The real owner/self pilot can span multiple Codex turns or days.

`pilot-run-sheet` prepares the moment before asking for a real answer. After partial progress exists, Codex also needs a redacted continuity handoff: what was saved in counts, what to ask next, where the local surfaces are, and what must not be shared publicly.

## What Changed

- Added `pilot-handoff`.
- The command writes:
  - `artifacts/pilot/pilot-handoff.json`
  - `artifacts/pilot/pilot-handoff.html`
- The handoff includes:
  - progress counts,
  - local-only consent status,
  - next learner-facing prompt,
  - quick reply candidates,
  - next-card and cockpit links,
  - redaction flags and public sharing boundary.
- The handoff excludes transcript text and friction note text.
- Owner-pilot skill and data contracts now describe the handoff as an internal Codex continuity surface.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-handoff-smoke.mjs
node scripts/phase15-owner-pilot-run-sheet-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
node scripts/phase15-owner-pilot-reply-routing-smoke.mjs
```

The smoke validates:

- fresh `pilot-handoff` does not save an answer.
- fresh `pilot-handoff` shows zero baseline answers and unmarked consent.
- partial handoff shows one saved baseline answer by count only.
- partial handoff shows existing `local-only` consent.
- rendered HTML links next card and cockpit.
- JSON, HTML, and rendered text do not leak fixture transcript text, fixture friction notes, issue/PR/smoke/rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is redacted local pilot continuity evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
