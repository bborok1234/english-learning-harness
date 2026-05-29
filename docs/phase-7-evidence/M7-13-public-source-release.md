# M7-13 Public Source Release

Issue: #83, #90
Decision: continue

## Why

The product direction is open source, so the public distribution surface is the source repository itself. After open-source readiness and git history audit passed, repository visibility was changed to public and the default public clone smoke needed to prove clone-to-local-learning.

## Verified Behavior

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
```

Current output verifies:

- `repositoryVisibility=PUBLIC`
- `publicAccessStatus=public`
- `git clone https://github.com/bborok1234/english-learning-harness.git`
- setup, daily, today, weekly, home, and export commands pass from a disposable clone.
- `cloneGitStatusClean=true`

## Claim Boundary

This proves public source clone-to-local-learning. It does not prove public Git-backed plugin install, realtime voice conversation, or long-term learner outcomes.
