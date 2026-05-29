# M6-4 Public Clone-to-Learn Release Gate

Issue: #75
Decision: blocked-by-distribution-policy

## Why

M6 should close only when clone, install/setup docs, diagnostics, and claim boundaries are verified together. The local mechanics are strong, but public clone readiness depends on repository visibility and distribution policy.

## Current Gate Result

`node scripts/phase6-release-gate-smoke.mjs` passes as an audit and returns:

- `decision`: `blocked_by_distribution_policy`
- `canCloseM6`: `false`
- blocker: #72 public clone smoke is not passing in default mode
- blocker: #78 repository visibility / distribution policy is unresolved

## Evidence Reviewed

- M6-1 authenticated clone mechanics pass; default public clone remains blocked while the repo is private.
- M6-2 local marketplace packaging and isolated `CODEX_HOME` install pass.
- M6-3 onboarding/support diagnostics pass.

## Required Before Closing M6

Resolve #78 with one of these policies:

1. Make the repository public and rerun the default public clone smoke.
2. Keep the repository private and pivot M6 wording to private beta / invited-user clone-to-learn.
3. Publish a separate public distribution artifact and add a smoke for that artifact.

Then rerun the release gate and update #72/#75/#10/milestone state.

## Claim Boundary

This is a release-readiness audit. It does not change repository visibility, prove public distribution, or guarantee learning outcomes.
