# M7-9 Public Release Approval Packet

Issue: #108
Decision: continue

## Why

M7 cannot complete until #90 records owner approval and #83 proves a real public artifact URL. Before asking for that approval, the project needs a compact packet that makes the decision auditable: target repository, release tag, files, checksum, commands, forbidden actions, and the exact proof command required after publication.

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
- the packet points to #90 for owner decision and #83 for public URL proof.
- the packet preserves `approvalRequired=true`, `decisionStatus=owner_decision_required`, `publicationPerformed=false`, `canPublishNow=false`, and `canClosePublicDistribution=false`.
- the packet includes the owner-approval-time workflow command, manual fallback command, forbidden-before-approval list, and checksum-aware real public URL proof command.

## Claim Boundary

This is non-publishing preparation only. It does not approve publication, create a public repository, publish a release, prove public URL access, or complete #83/#90.
