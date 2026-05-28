# PH1-FIX-4 Stop Finalization Contract

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/14

## Decision

Session finalization belongs to the explicit command-wrapper `today` command.

The Stop hook is marker-only:

- writes `last_stop_at`;
- writes `last_stop_contract: marker-only`;
- emits context;
- explicitly reports `finalizesSession: false`.

## Why

Native hook runtime is optional for first use. If Stop hook claimed session finalization, the product would imply a hook dependency that is not proven in the target Codex trust-state.

## Implementation

Updated:

- `hooks/english-learning-hook.mjs`
- `scripts/english-learning-harness.mjs`
- `scripts/phase1-stop-finalization-smoke.mjs`
- `scripts/phase1-full-flow-smoke.mjs`

## Verification

Command:

```bash
node scripts/phase1-stop-finalization-smoke.mjs
```

Observed:

- `today` returned `finalizesSession: true`;
- Stop hook returned `finalizesSession: false`;
- Stop hook did not create an extra session artifact;
- Stop hook did not append a session record;
- progress still validated after writing the marker-only Stop contract.

## Claim Boundary

This proves truthful local contract separation. It does not prove native Codex hook execution in a trusted runtime.
