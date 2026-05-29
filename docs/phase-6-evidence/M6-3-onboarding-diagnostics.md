# M6-3 First-Run Onboarding and Support Diagnostics

Issue: #74
Decision: continue

## Why

A new learner or invited tester needs clear next steps and recovery guidance without reading implementation docs. Native hooks remain optional, so setup and support output must explain the command-wrapper path.

## What Changed

- Added shared support diagnostics to `setup`, `health`, and `status` JSON output.
- Added support diagnostics to `context` text output.
- Expanded setup `next` commands to include daily cockpit, today, weekly mirror, learner home, evidence export, and health.
- Added `scripts/phase6-onboarding-diagnostics-smoke.mjs`.
- Updated README with the support block contract.

## Verified Behavior

The smoke verifies:

- setup returns support diagnostics and complete next commands.
- health returns support files and keeps native hooks optional.
- status returns the same recovery/next-step diagnostics.
- context includes a support diagnostics section.
- corrupt `progress.json` health failure returns explicit non-destructive recovery commands.
- `setup --repair` backs up broken local JSON files and recreates valid progress v2.

## Claim Boundary

This improves onboarding and support readiness for the command-wrapper path. It does not prove marketplace distribution, public clone visibility, native hook runtime, or learning impact.
