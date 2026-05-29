# M7-7 Public Publication Preflight

Issue: #104
Decision: continue

## Why

The project has local and no-publication CI evidence for the public artifact repository path, but it still needs a compact preflight that tells the owner why publication cannot proceed yet and what proof is required next.

## What Changed

- Added `scripts/phase7-publication-preflight.mjs`.
- The preflight checks:
  - `docs/distribution-policy.json` public release decision gate.
  - `.github/workflows/public-artifact.yml` artifact repository target and token boundary.
  - generated handoff bundle contents.
  - target artifact repository visibility when `gh repo view` can inspect it.

## Verified Behavior

```bash
node scripts/phase7-publication-preflight.mjs
```

Current expected result:

- `status=pass`
- `decisionStatus=owner_decision_required`
- `publicationReady=false`
- `canPublishNow=false`
- blockers name the unresolved owner decision and any artifact repository visibility gap.

## Claim Boundary

This is readiness inspection only. It does not create a repository, publish a release, verify a real public URL, or close #83/#90.
