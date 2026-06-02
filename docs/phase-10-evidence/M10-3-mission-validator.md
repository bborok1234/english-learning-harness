# M10-3 Mission Validator

Date: 2026-06-02
Issue: #145
Decision: continue

## What Changed

- Added `validateMissionSpec()` and `validateNarrativeMissionBundle()` in `scripts/lib/narrative-mission.mjs`.
- The validator requires each mission to reference an existing Speaking Skill OS backlog item.
- `target_skill`, `transfer_test`, and `win_condition.must_pass_backlog_item` must match the linked backlog item.
- Generated/media capabilities are optional only in M10; text is the required path.
- Unsupported learning claims are rejected.
- Decorative missions that advance story without a speaking transfer test are rejected.

## Verification

```bash
node scripts/phase10-mission-spec-validator-smoke.mjs
```

Expected rejected fixtures:

- missing backlog item,
- target skill mismatch,
- win condition mismatch,
- missing real-world transfer target,
- media required without fallback,
- unsupported learning claim,
- decorative mission.

## Claim Boundary

This proves mission admission control only. It does not yet implement narrative session parity or record learner-state evidence; that remains M10-4.
