# AIOS-15 Active Pilot Cockpit Card Replies

Issue: #216
Date: 2026-06-02
Decision: continue

## Why

The real owner/self pilot should be continue-able from the learner cockpit. Before this change, the active pilot section showed progress and the next prompt, but it did not surface the current `pilot-next-card.html` or quick reply choices directly in the cockpit.

## What Changed

- Active pilot cockpit state now links the current `artifacts/pilot/pilot-next-card.html/json` when it exists.
- Active pilot cockpit state exposes the learner-safe assistant prompt and quick reply choices from the current next-card artifact.
- Active pilot cockpit HTML renders a "현재 pilot 카드 열기" link, assistant prompt details, visible quick replies, and local copy buttons.
- The cockpit still avoids internal pilot engine commands, issue/PR language, and audit labels.

## Verification

- `node scripts/personal-learner-cockpit-active-pilot-smoke.mjs`
- `node scripts/personal-learner-cockpit-smoke.mjs`
- `node scripts/product-surface-smoke.mjs`
- Playwright render check on the fixture cockpit confirmed active pilot section, current card link, 3 quick reply buttons, clarification reply text, and no internal command text.

## Claim Boundary

This proves active pilot cockpit visibility and quick-reply affordance mechanics only. It does not run the real owner/self pilot, save a real new answer, prove learning outcomes, or close #179.
