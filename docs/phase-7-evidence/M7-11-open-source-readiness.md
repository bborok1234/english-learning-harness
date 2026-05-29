# M7-11 Open-Source Readiness

Issue: #112
Decision: continue

## Why

The product direction is open source, so the public distribution surface should be this source repository rather than a separate artifact repository. Before changing repository visibility, the repository needs standard open-source community files, public clone-oriented README framing, and a readiness smoke.

## What Changed

- Added `LICENSE` with MIT terms.
- Added `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, and `GOVERNANCE.md`.
- Added GitHub issue templates and pull request template.
- Updated README to frame the source repository as the primary public distribution path.
- Updated distribution policy to `open-source-public`, `public_source_repository`, and `public-git-clone`.
- Added `scripts/phase7-open-source-readiness-smoke.mjs`.

## Verified Behavior

```bash
node scripts/phase7-open-source-readiness-smoke.mjs
```

It verifies:

- required community files exist.
- README contains public clone and open-source readiness commands.
- distribution policy recommends the public source repository path.
- obvious local secret/token/key files are not present outside ignored runtime directories.
- repository visibility is reported separately and now returns `PUBLIC`.

## Claim Boundary

This verifies open-source readiness. Public clone access is proven separately by `phase6-public-clean-clone-smoke`.
