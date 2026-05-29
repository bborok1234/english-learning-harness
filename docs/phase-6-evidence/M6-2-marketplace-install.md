# M6-2 Marketplace Packaging and Install Docs

Issue: #73
Decision: continue

## Why

The harness should be support-ready for a friend or invited user without claiming unverified Git-backed plugin distribution. Local marketplace packaging is the verified Codex plugin install path today.

## What Changed

- Added `scripts/phase6-marketplace-install-smoke.mjs`.
- Updated README to state that the verified install claim is local marketplace packaging only.
- Added the M6 marketplace smoke to scaffold required-file verification.

## Verified Path

The smoke clones the repository into a disposable directory, packages the plugin from that clone, installs it into an isolated `CODEX_HOME`, and checks that Codex lists it as installed/enabled.

Verified commands:

```bash
node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace
CODEX_HOME="$PWD/tmp/codex-home" codex plugin marketplace add "$PWD/tmp/english-learning-marketplace"
CODEX_HOME="$PWD/tmp/codex-home" codex plugin add english-learning-harness@english-learning-local
CODEX_HOME="$PWD/tmp/codex-home" codex plugin list
```

The smoke also verifies:

- packaged `.codex-plugin/plugin.json` exists.
- packaged command wrapper exists.
- isolated `CODEX_HOME` install succeeds.
- README keeps public Git-backed install marked as unverified.
- README does not advertise unsupported URL/GitHub-backed plugin install commands.
- the clean clone remains `git status --short` clean.

## Claim Boundary

This proves local marketplace packaging and isolated Codex plugin install only. Public Git-backed install remains unverified until a separate smoke proves that path under the chosen distribution policy.
