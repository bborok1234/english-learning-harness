# AIOS-28 Pilot Consent Save

Date: 2026-06-04
Issue: #242
Decision: continue

## Why

The real owner/self pilot is still the active blocker. Before collecting real learner evidence, the save boundary needs to be explicit:

- launch/next-card preview surfaces must not save answers or mark consent.
- the first actual saved pilot answer must record local-only consent metadata.

## What Changed

- `pilot-capture` now ensures `pilot-state.json` has local-only consent metadata before saving any baseline, day, or final answer.
- `pilot-reply` inherits the same behavior because it delegates answer persistence to `pilot-capture`.
- `pilot-launch` remains a no-save/no-consent preview surface.
- Owner-pilot skill instructions now state that launch/next-card previews do not save answers or mark consent, and first saved answers record local-only consent metadata.
- `docs/DATA-CONTRACTS.md` now documents the launch/first-save consent boundary.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-launch-card-smoke.mjs
node scripts/phase15-owner-pilot-capture-smoke.mjs
node scripts/phase15-owner-pilot-reply-routing-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
```

The smoke coverage validates:

- fresh `pilot-launch` does not create `pilot-state.json`.
- first baseline `pilot-capture` records `consent.scope=local-only`.
- first baseline `pilot-capture` records `consent.accepted_at` at the capture timestamp.
- `pilot-reply` still routes baseline, day, and final answers through the capture path.
- owner-pilot skill wording keeps Codex in the product conversation and avoids command exposure.

## Claim Boundary

This is privacy and consent mechanics evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
