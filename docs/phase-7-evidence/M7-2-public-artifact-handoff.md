# M7-2 Public Artifact Repository Handoff

Issue: #94
Decision: continue

## Why

#90 recommends a separate public artifact repository release or public static URL when the source repository stays private. The project needs a reproducible handoff bundle before any owner-approved publication action.

## What Changed

- Added `scripts/prepare-public-artifact-handoff.mjs`.
- Added `scripts/phase7-public-artifact-handoff-smoke.mjs`.
- The handoff contains:
  - `README.md`
  - `english-learning-harness-public.tar.gz`
  - `SHA256SUMS`
  - `PUBLIC-ARTIFACT-MANIFEST.json`
  - `RELEASE-NOTES.md`

## Verified Behavior

```bash
node scripts/phase7-public-artifact-handoff-smoke.mjs
```

It verifies:

- the handoff bundle is generated locally without publishing.
- the checksum validates with `shasum -a 256 -c SHA256SUMS`.
- the tarball contains the expected harness files.
- forbidden paths such as `.git`, `.omx`, `tmp`, and `node_modules` are not included.
- the manifest includes the publication command as text and the real public URL smoke command.
- the public artifact repository README includes download, checksum, extract, setup, daily, today, and hosted URL smoke guidance.

## Claim Boundary

This prepares a handoff bundle only. It does not create a public repository, publish a release, prove a public URL, or close #83/#90.
