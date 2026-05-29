# M6-1 Public Clean Clone Setup Path

Issue: #72
Decision: blocked-by-repository-visibility

## Why

M5 proved local simulated learning flows, but a friend or public user still needs a verified path from the GitHub repository URL to a first useful learner-owned session without relying on internal `.omx` context or native Codex hooks.

## What Changed

- Added `scripts/phase6-public-clean-clone-smoke.mjs`.
- Documented the fresh public clone command path in `README.md`.
- Added the M6 smoke script to scaffold required-file verification.

## Verified Path

The smoke clones the repository into a disposable directory and runs:

```bash
git clone https://github.com/bborok1234/english-learning-harness.git
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

It verifies:

- setup creates a ready learner profile.
- daily returns a cockpit with next commands.
- today finalizes a session and writes journal/artifact evidence.
- weekly writes a learner-owned weekly mirror.
- home writes learner-owned `home.html`.
- export writes redacted JSON and Markdown evidence packs.
- `progress.json` validates.
- the cloned repository remains `git status --short` clean.
- README contains the same verified command path.

## Current Result

The authenticated clone mechanics pass with:

```bash
ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE=1 node scripts/phase6-public-clean-clone-smoke.mjs
```

Current output reports:

- `repositoryVisibility`: `PRIVATE`
- `publicAccessStatus`: `private_authenticated_clone_only`
- `cloneGitStatusClean`: `true`
- `sessionCount`: `1`

The default public smoke intentionally fails while the GitHub repository is private:

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
```

This is the correct release-gate behavior. M6 cannot honestly claim public clone-to-learn readiness until repository visibility or distribution policy is resolved.

## Claim Boundary

Authenticated clone mechanics are proven. Public GitHub clone-to-local-learning remains blocked while the repository is private. This does not prove long-term learner outcomes, realtime voice quality, or public marketplace installation.
