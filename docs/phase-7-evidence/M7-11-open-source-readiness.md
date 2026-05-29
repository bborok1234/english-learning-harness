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
- Updated distribution policy to `open-source-prep`, `public_source_repository`, and `public-git-clone`.
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
- repository visibility is reported separately.

Current expected blocker:

- `source repository is not public yet`

## Claim Boundary

This prepares the repository for open-source launch. It does not change repository visibility, prove public clone access, or complete #83/#90.
