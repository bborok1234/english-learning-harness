# M7-10 Public Source Release Policy

Issue: #110
Decision: continue

## Why

M7 originally kept both public source repository and separate artifact publication paths open. After the product direction was clarified as open source, the policy needed to make the source repository the primary public distribution surface and keep artifact publication as a fallback only.

## What Changed

- Updated `docs/distribution-policy.json` so public release requirements are grouped by chosen surface.
- Updated `scripts/phase6-distribution-policy-smoke.mjs` to verify:
  - common #90 decision requirement.
  - public source repository path requires the default public clone smoke.
  - artifact release path remains a fallback requiring checksum-aware real public release URL smoke.
  - Git-backed plugin install remains unclaimed unless separately proven.

## Verified Behavior

```bash
node scripts/phase6-distribution-policy-smoke.mjs
```

It verifies the current recommendation points to the public source repository path without deleting the artifact fallback path.

## Claim Boundary

This aligns policy wording only. It does not create a public repository, publish a release, prove public URL access, approve #90, or complete #83.
