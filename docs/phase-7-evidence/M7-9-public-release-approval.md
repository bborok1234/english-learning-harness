# M7-9 Public Release Approval Packet

Issue: #108
Decision: continue

## Why

M7 cannot complete until #90 records the public source repository decision and #83 proves a default public clone. Before changing repository visibility, the project needs a compact packet that makes the decision auditable: target repository, visibility command, forbidden actions, and the exact proof command required after visibility changes.

## What Changed

- Added `scripts/prepare-public-release-approval.mjs`.
- Added `scripts/phase7-public-release-approval-smoke.mjs`.
- Added the approval smoke to scaffold verification and dashboard commands.

## Verified Behavior

```bash
node scripts/phase7-public-release-approval-smoke.mjs
```

It verifies:

- generated `PUBLIC-RELEASE-APPROVAL.md` and `PUBLIC-RELEASE-APPROVAL.json` exist under `tmp/`.
- the packet points to #90 for owner decision and #83 for public clone proof.
- the packet preserves `approvalRequired=true`, `repositoryVisibilityChanged=false`, `publicationPerformed=false`, `canPublishNow=false`, and `canClosePublicDistribution=false`.
- the packet includes the owner-approval-time repository visibility command, forbidden-before-approval list, and default public clone proof command.

## Claim Boundary

This is non-publishing preparation only. It does not change repository visibility, prove public clone access, or complete #83/#90.
