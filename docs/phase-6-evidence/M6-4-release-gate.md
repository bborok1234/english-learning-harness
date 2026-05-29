# M6-4 Public Clone-to-Learn Release Gate

Issue: #75
Decision: ready-to-close-private-beta

## Why

M6 should close only when clone, install/setup docs, diagnostics, and claim boundaries are verified together. The release claim has been narrowed to private beta / invited-user clone-to-learn because the repository is currently private.

## Current Gate Result

`node scripts/phase6-release-gate-smoke.mjs` passes as an audit and returns:

- `decision`: `ready_to_close_m6_private_beta`
- `canCloseM6`: `true`
- public release status: `deferred`
- current policy: `private-beta`

## Evidence Reviewed

- M6-D distribution policy selects private beta / invited-user clone-to-learn for M6 and defers unauthenticated public distribution to M7.
- M6-1 authenticated clone mechanics pass; default public clone remains blocked while the repo is private.
- M6-2 local marketplace packaging and isolated `CODEX_HOME` install pass.
- M6-3 onboarding/support diagnostics pass.

## Required Before Public Release

M7 issue #83 tracks unauthenticated public distribution. It must either make the repository public or publish a separate public artifact, then rerun a default public clone/download smoke and public install smoke before public-facing claims are allowed.

## Claim Boundary

This is a private beta release-readiness audit. It does not change repository visibility, prove unauthenticated public distribution, or guarantee learning outcomes.
