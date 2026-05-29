# M7-14 Learner-First README Evidence

Issue: #117
Decision: continue

## Problem

The public README explained implementation status, smoke tests, and distribution mechanics before it explained the learner experience. A first-time visitor could clone the repository but still not quickly understand why Codex is useful for English speaking practice, how to start, what improves, or what gets tracked.

## Change

- Reframed the README around the learner promise, five-minute quick start, daily practice loop, conversation-improvement mechanisms, progress tracking, privacy, and current boundaries.
- Moved maintainer verification and public distribution evidence below learner onboarding.
- Preserved verified public clone and local marketplace commands required by existing smoke tests.
- Added `scripts/phase7-learner-readme-smoke.mjs` so the README cannot regress into an operator-only implementation inventory without failing validation.

## Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
node scripts/phase6-public-clean-clone-smoke.mjs
```

All checks passed locally on 2026-05-29.

## Boundary

This improves first-time public understanding and onboarding. It does not claim realtime voice conversation, accent scoring, public Git-backed plugin install, or long-term learner outcome proof.
