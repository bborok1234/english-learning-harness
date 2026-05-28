# PH1-FIX-1 Command Wrapper Fallback

Date: 2026-05-28
Status: Pass for explicit command-wrapper path
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/11

## Decision

The supported first-usable path is now an explicit command wrapper:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs today --say "I want to practice today."
node scripts/english-learning-harness.mjs health
```

Native hooks remain optional until Codex hook trust-state is proven in the target environment.

## Why

`docs/phase-1-evidence/PH1-FIX-1-hook-install-proof.md` showed that hook file merging improved, but real Codex hook execution is still blocked by trust-state behavior. Daily use cannot depend on that blocker.

## Implementation

Added:

- `scripts/english-learning-harness.mjs`
- `scripts/phase1-command-wrapper-smoke.mjs`

The wrapper exposes:

- `setup`
- `today`
- `health`
- `status`
- `context`

Every wrapper command reports `nativeHooksRequired: false` for the supported path.

## Verification

Command:

```bash
node scripts/phase1-command-wrapper-smoke.mjs
```

Expected:

- setup creates profile/progress;
- health passes before and after a session;
- today persists journal/artifact/progress;
- native hook status is optional;
- claim boundary says this proves the command-wrapper path, not native hook runtime.

## Claim Boundary

This fixes the supported fallback path. It does not prove native Codex hook execution.

