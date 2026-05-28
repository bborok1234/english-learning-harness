# PH1-FIX-6 Dashboard Gate Sync

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/16

## Decision

The dashboard now has an explicit First-Usable Gate rendered from structured state.

The gate separates:

- evidence that has passed,
- the exact smoke/evidence source,
- the claim allowed by that evidence,
- the remaining clean-clone blocker.

## Why

The dashboard should help a human see progress without turning aspiration into status. `docs/dashboard.html` is generated, so the gate must live in `docs/project-state.json`.

## Implementation

Updated:

- `docs/project-state.json`
- `scripts/generate-dashboard.mjs`
- `docs/dashboard.html`

## Verification

Commands:

```bash
node -e "JSON.parse(require('fs').readFileSync('docs/project-state.json','utf8'))"
node scripts/generate-dashboard.mjs
rg "First-Usable Gate|GATE-6|clean clone" docs/dashboard.html
```

Observed:

- GATE-1 through GATE-5 are `Pass`;
- GATE-6 is `Pending`;
- project stage says first-usable gate is pending clean-clone proof;
- dashboard does not claim first-usable completion.

## Claim Boundary

This proves dashboard honesty and generated-state rendering. It does not prove the clean-clone first-use path.
