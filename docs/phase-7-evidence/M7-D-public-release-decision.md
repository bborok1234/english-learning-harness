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
- the recommended surface is `public_artifact_repository_release`.
- Codex may not publish a public release asset without explicit approval.
- public release requirements mention the #90 decision gate.

## Recommendation Correction

The first recommendation was too loose: a release asset in the private source repository should not be treated as public evidence. GitHub's repository visibility documentation says private repositories are only accessible to the owner, explicitly shared users, and certain organization members, while public repositories are accessible to everyone on the internet.

Source: [GitHub Docs: About repositories](https://docs.github.com/github/creating-cloning-and-archiving-repositories/creating-a-repository-on-github/limits-for-viewing-content-and-diffs-in-a-repository).

Current recommendation: keep this source repository private if needed, but publish the distributable tarball from a separate public artifact repository release or another public static URL, then verify that URL with `phase7-hosted-artifact-smoke`.

## Claim Boundary

This proves the release decision gate is explicit. It does not publish a release asset, prove a public URL, or close #83.
