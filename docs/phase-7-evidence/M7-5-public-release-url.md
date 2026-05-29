# M7-5 Public Release URL Smoke

Issue: #100
Decision: continue

## Why

The public artifact repository README instructs users to download both the artifact and `SHA256SUMS`. Public distribution proof should verify that checksum-aware path, not only the tarball download.

## What Changed

- Added `scripts/phase7-public-release-url-smoke.mjs`.
- The smoke downloads `english-learning-harness-public.tar.gz` and `SHA256SUMS`.
- It verifies the checksum before extracting and starting the learning loop.
- It defaults to local loopback and supports real public URLs through environment variables.

## Verified Behavior

```bash
node scripts/phase7-public-release-url-smoke.mjs
```

For real public verification after publication:

```bash
ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://example.com/english-learning-harness-public.tar.gz" \
ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL="https://example.com/SHA256SUMS" \
  node scripts/phase7-public-release-url-smoke.mjs
```

It verifies:

- artifact URL and checksum URL are reachable.
- `SHA256SUMS` references the artifact filename.
- `shasum -a 256 -c SHA256SUMS` passes before extraction.
- the artifact excludes `.git`, `.omx`, `tmp`, and `node_modules`.
- the extracted harness can run setup, daily, and today.

## Claim Boundary

Local loopback mode proves mechanics only. #83 can close only when real non-local HTTPS artifact and checksum URLs report `hostedAccessStatus=public_url_candidate` and `canClosePublicDistribution=true`.
