# M7-10 Artifact-First Public Release Policy

Issue: #110
Decision: continue

## Why

M7 now recommends a separate public artifact repository release, but the distribution policy still described the default public clone smoke as if it were always required. That mixed two valid surfaces: making the source repository public, or publishing a separate artifact while the source repository remains private.

## What Changed

- Updated `docs/distribution-policy.json` so public release requirements are grouped by chosen surface.
- Updated `scripts/phase6-distribution-policy-smoke.mjs` to verify:
  - common #90 decision requirement.
  - public source repository path still requires the default public clone smoke.
  - artifact-first path requires checksum-aware real public release URL smoke.
  - artifact-first path keeps Git-backed plugin install unclaimed unless separately proven.

## Verified Behavior

```bash
node scripts/phase6-distribution-policy-smoke.mjs
```

It verifies the current recommendation points to the artifact-first path without deleting the public source repository path.

## Claim Boundary

This aligns policy wording only. It does not create a public repository, publish a release, prove public URL access, approve #90, or complete #83.
