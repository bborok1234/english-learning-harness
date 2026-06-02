# M9-2 Pilot Report AIOS Bridge Evidence

## Why

The owner/self pilot report should not be a detached transcript review. If the product is an AI-native learning OS, pilot evidence must connect the learner's daily speech samples to the same mission, scene, learner report, and cockpit surfaces used in ordinary practice.

## What Changed

- `pilot-day` now uses the Codex-operated `practice` flow.
- Each pilot day records generated mission, generated scene, learner report, and cockpit paths.
- `pilot-finish` adds an AIOS artifact bridge to the JSON and Markdown pilot reports.
- The final learner report and final cockpit are regenerated at pilot closeout.

## Verification

```bash
node scripts/phase9-pilot-aios-readiness-smoke.mjs
node scripts/phase9-owner-pilot-smoke.mjs
```

The new smoke verifies five pilot days, daily mission/scene/report/cockpit files, final learner report linkage, final cockpit linkage, and unsupported-claim guardrails.

## Claim Boundary

This proves local pilot report mechanics and AIOS artifact linkage. It does not prove generalized fluency, real-world speaking ability, or realtime voice support.
