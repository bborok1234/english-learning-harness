# M10-5 Capability Router And No-Generation Fallback

Date: 2026-06-02
Issue: #147
Decision: continue

## What Changed

- Added `routeMissionCapabilities()` to `scripts/lib/narrative-mission.mjs`.
- The router chooses `light`, `rich`, or `cinematic` presentation mode from current tool capabilities.
- Text remains the required learning path.
- Generated media, voice, web, browser, and MCP are optional presentation capabilities only in M10.
- `persistNarrativeMissionSession()` now persists the selected capability route in the session artifact.

## Verification

```bash
node scripts/phase10-no-gen-fallback-smoke.mjs
```

The smoke verifies:

- text-only tool capabilities route to `light`,
- text scene card is required,
- `usual-place-clarification` completes and writes Speaking Skill OS evidence without generated media,
- missions requiring generated image are rejected,
- missions requiring realtime voice are rejected,
- missing text scene fallback is rejected.

## Claim Boundary

This proves local text-first fallback and capability routing only. It does not prove multimodal efficacy, realtime voice readiness, or learner outcome improvement.
