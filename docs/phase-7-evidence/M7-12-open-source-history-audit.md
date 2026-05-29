# M7-12 Open-Source History Audit

Issue: #114
Decision: continue

## Why

Before changing the source repository visibility to public, the current tree is not enough. Git history also becomes visible, so public-readiness needs a repeatable audit for obvious secrets, forbidden local/runtime paths, and accidental large artifacts.

## What Changed

- Added `scripts/phase7-open-source-history-audit-smoke.mjs`.
- Added the history audit to scaffold verification and README open-source checks.

## Verified Behavior

```bash
node scripts/phase7-open-source-history-audit-smoke.mjs
```

Current output verifies:

- `revisionsScanned=119`
- `committedPathsScanned=181`
- `forbiddenPathFindings=0`
- `secretContentFindings=0`
- `largeObjectFindings=0`

## Claim Boundary

This scans git history for obvious public-release blockers only. It does not change repository visibility, prove public clone access, or guarantee that no sensitive data ever existed outside the checked patterns.
