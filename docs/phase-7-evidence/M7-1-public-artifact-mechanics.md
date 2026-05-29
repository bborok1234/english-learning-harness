# M7-1 Public Artifact Mechanics

Issue: #83
Decision: continue

## Why

The repository is private, so unauthenticated public clone is not currently available. A separate public distribution artifact is the safest next path toward public release without changing repository visibility.

## What Changed

- Added `scripts/package-public-artifact.mjs`.
- Added `scripts/phase7-public-artifact-smoke.mjs`.
- Added scaffold verification for the public artifact scripts.

## Verified Behavior

The smoke creates a tarball candidate, extracts it into a disposable directory, and runs the learner path from the extracted artifact:

```bash
node scripts/package-public-artifact.mjs --target tmp/public-artifact
node scripts/phase7-public-artifact-smoke.mjs
node scripts/phase7-hosted-artifact-smoke.mjs
```

It verifies:

- the artifact contains README, docs, scripts, skills, hooks, and plugin metadata.
- the artifact excludes `.git`, `.omx`, `tmp`, and `node_modules`.
- the extracted artifact can run setup, daily, today, weekly, home, export, and progress validation.
- generated learner files stay outside the extracted artifact root.
- hosted-download mechanics work through a local loopback URL.

## Remaining Blocker

This does not yet prove a public user can download the artifact. The artifact must be hosted through a public GitHub release, public repository, or another public URL before #83 can close.

To verify an actual public URL later:

```bash
ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://example.com/english-learning-harness-public.tar.gz" \
  node scripts/phase7-hosted-artifact-smoke.mjs
```

The public distribution claim can close only when the smoke reports `hostedAccessStatus: public_url_candidate` and `canClosePublicDistribution: true`.

## Claim Boundary

This proves public artifact mechanics from a tarball candidate only. It does not prove public hosting, public download, public Git-backed plugin install, realtime voice, or learning outcomes.
