# PH1-FIX-7 Clean Clone Smoke

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/17

## Decision

The local command-wrapper first-use path is now proven from a fresh clone.

## Why

Working-tree smoke tests can accidentally depend on local state. The first-usable claim needs a clean clone check using the repository URL.

## Implementation

Added:

- `scripts/phase1-clean-clone-smoke.mjs`

The smoke:

1. clones `origin` into `tmp/phase-1-clean-clone/repo`;
2. runs `setup` with an external learner root;
3. runs `today`;
4. runs `health`;
5. validates `progress.json`;
6. regenerates the dashboard in the clone;
7. confirms runtime tmp files remain ignored.

## Verification

Command:

```bash
node scripts/phase1-clean-clone-smoke.mjs
```

Observed:

- fresh clone setup passed;
- daily session created journal and artifact;
- health saw one session;
- progress validation passed;
- dashboard still rendered First-Usable Gate;
- runtime tmp files did not appear in `git status --short`.

## Claim Boundary

This proves local clone usability through the explicit command-wrapper path. It does not prove public marketplace distribution, long-term learning outcomes, or native hook execution.
