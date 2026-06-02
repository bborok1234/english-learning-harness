# Product/Ops Surface Boundary

Last updated: 2026-06-02
Status: active SSOT boundary

## Principle

English Learning Harness has two different surfaces.

The learner-facing product surface helps a Korean learner start, continue, and reflect on speaking practice. It must feel like a learning harness, not an engineering tracker.

The engineering/ops surface helps maintainers and Codex inspect implementation status, evidence, issue direction, gates, and claim boundaries. It can expose PRs, issues, smoke tests, and internal decisions.

These surfaces must not collapse into one dashboard.

## Learner-Facing Product Surface

Canonical state:

- `docs/product/learner-cockpit-state.json`

Generated surface:

- `docs/product/learner-cockpit.html`

Runtime learner surfaces:

- learner-root `home.html`
- learner-root journals, weekly mirrors, pilot reports, and local evidence packs

Allowed language:

- today mission
- speaking action
- review cue
- progress reflection
- privacy/local-first explanation
- Korean Codex prompt the learner can say in the conversation

Forbidden language:

- GitHub issue or PR status
- smoke-test status
- milestone closeout jargon
- implementation readiness claims
- internal board/archive history
- `node scripts/...` engine commands for ordinary learner actions
- `--learner-root` or other shell flags
- internal command field names such as `start_command`

## Engineering/Ops Surface

Canonical state:

- `docs/ops/project-state.json`

Generated surface:

- `docs/ops/engineering-dashboard.html`

Legacy redirect:

- `docs/dashboard.html`

Allowed language:

- issue and PR status
- evidence paths
- gate status
- blocked claims
- verification commands
- milestone review and next-goal decisions

Forbidden language:

- presenting the engineering board as the learner's product cockpit
- marking aspiration as validated learning progress
- hiding blocked or deferred claims from the ops board

## Generation Rules

- Do not edit generated HTML directly.
- Edit `docs/product/learner-cockpit-state.json`, then run `node scripts/generate-learner-cockpit.mjs` for learner-facing cockpit changes.
- Edit `docs/ops/project-state.json`, then run `node scripts/generate-dashboard.mjs` for engineering/ops dashboard changes.
- Run `node scripts/product-surface-smoke.mjs` and `node scripts/ops-dashboard-smoke.mjs` whenever either surface boundary changes.

## Decision Rule

When adding a new feature or document, classify it first:

- If it helps the learner practice or reflect today, it belongs in the product surface.
- If it helps maintainers plan, verify, audit, or close work, it belongs in the engineering/ops surface.
- If both need visibility, keep two representations: learner copy for the product surface and evidence copy for the ops surface.
