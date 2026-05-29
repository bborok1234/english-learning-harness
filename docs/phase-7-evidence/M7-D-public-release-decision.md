# M7-D Public Release Decision Gate

Issue: #90
Decision: research

## Why

The artifact mechanics and GitHub Actions packaging path are verified, but publishing a public artifact is an external release action. The project needs a visible decision gate before any public release claim can close.

## What Changed

- Added `scripts/phase7-public-release-decision-smoke.mjs`.
- The smoke reads `docs/distribution-policy.json` and verifies that the public release decision is explicit.
- The smoke keeps publication blocked unless the owner decision is recorded.

## Verified Behavior

```bash
node scripts/phase7-public-release-decision-smoke.mjs
```

It verifies:

- `publicReleaseDecision.issue` is `90`.
- the current status is either `owner_decision_required` or `approved`.
- the recommended surface remains `manual_github_release_asset`.
- Codex may not publish a public release asset without explicit approval.
- public release requirements mention the #90 decision gate.

## Claim Boundary

This proves the release decision gate is explicit. It does not publish a release asset, prove a public URL, or close #83.
