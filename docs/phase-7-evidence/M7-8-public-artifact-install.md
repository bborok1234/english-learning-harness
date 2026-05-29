# M7-8 Public Artifact Plugin Install

Issue: #106
Decision: continue

## Why

The public artifact path can start learning through direct scripts, but M7 also tracks a public install claim gate. A learner should be able to download the artifact, verify it, extract it, package a local Codex marketplace from that extracted artifact, and install the plugin into an isolated `CODEX_HOME`.

## What Changed

- Added `scripts/phase7-public-artifact-install-smoke.mjs`.
- Added optional Codex plugin install guidance to the generated public artifact repository README.

## Verified Behavior

```bash
node scripts/phase7-public-artifact-install-smoke.mjs
```

It verifies:

- the artifact and `SHA256SUMS` are downloaded through local loopback.
- `shasum -a 256 -c SHA256SUMS` passes before extraction.
- the extracted artifact can package a local marketplace.
- isolated `CODEX_HOME` can add the marketplace and install `english-learning-harness@phase7-public-artifact`.
- `codex plugin list` shows the plugin installed and enabled.

## Claim Boundary

This proves plugin installation from a checksum-verified downloaded public artifact through local loopback only. It does not prove public hosting, public Git-backed plugin install, or real public URL access.
