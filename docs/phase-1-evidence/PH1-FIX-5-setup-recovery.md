# PH1-FIX-5 Setup Recovery

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/15

## Decision

The supported first-use command remains:

```bash
node scripts/english-learning-harness.mjs setup
```

It now returns health information and next commands. Recovery is explicit:

```bash
node scripts/english-learning-harness.mjs setup --repair
```

## Why

The harness must be usable from a clone without native hooks, and a learner should not have to understand the internal file layout to recover from a corrupt local JSON file.

## Implementation

Updated `scripts/english-learning-harness.mjs` so:

- `setup` is idempotent;
- `setup` returns health checks and next commands;
- `health` returns structured recovery commands on local store failure;
- `setup --repair` backs up broken local JSON files before recreating `progress.json`, `vocabulary.json`, and `review-queue.json`.

## Verification

Command:

```bash
node scripts/phase1-setup-recovery-smoke.mjs
```

Observed:

- first setup passed;
- repeated setup was safe and did not create a session;
- health passed after setup;
- corrupt `progress.json` produced a failure with a `--repair` command;
- `setup --repair` backed up broken JSON files and restored valid progress.

## Claim Boundary

This improves local command-wrapper setup and recovery. It does not prove public Git-backed marketplace install.
