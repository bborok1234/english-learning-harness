# Ralplan Consensus: Startup-Grade English Learning Harness

Last updated: 2026-05-27
Status: Approved planning handoff

## Task

Make English Learning Harness into a GitHub-local product that a user or friend can clone, install, use daily, speak/practice English, manage the learning journey, and improve real conversational ability without unsupported learning claims.

## Planning Artifacts

- `docs/STARTUP-GRADE-PLAN.md`
- `docs/LEARNING-ENGINE.md`
- `docs/PRODUCT-ROADMAP.md`
- `docs/TUTOR-POLICY.md`
- `docs/PERSONA-FIXTURE-SPEC.md`
- `docs/DATA-CONTRACTS.md`

## Consensus Gate

```json
{
  "complete": true,
  "architect_review": "APPROVE",
  "critic_review": "OKAY",
  "order": ["architect", "critic"]
}
```

## Architect Review

Verdict: **APPROVE**

Key finding:

- Hook fallback is now aligned: explicit command-wrapper fallback is the reliable path; native hooks are optional until trust-state is proven.
- Persona fixture boundary is aligned: Stage 1 creates fixture harness plumbing; Stage 2 / first-usable requires all four persona fixtures to pass.
- Vocabulary storage is aligned: `vocabulary.json` stores vocabulary history; `progress.json` keeps supported summary metrics.

Architect synthesis:

> Approve the plan because it now treats native hooks as opportunistic and fallback commands as the reliable product path. Execution should start with PH1-FIX-1 fallback implementation, then PH1-FIX-2 vocabulary semantics, then PH1-FIX-3 scenario loop plus fixture harness plumbing.

## Critic Review

Verdict: **OKAY**

Key finding:

- The plan is actionable for execution.
- It acknowledges current product gaps instead of hiding them.
- It defines tutor behavior, data contracts, persona fixtures, staged gates, and verification.
- It keeps app shell and voice as later product surfaces until the local learning engine is proven.

Representative simulations passed:

- PH1-FIX-1 can proceed through explicit command-wrapper fallback because native hooks are optional until trust-state is proven.
- PH1-FIX-2 has concrete `vocabulary.json`, `review-queue.json`, and historical `new_vocabulary_count` semantics.
- PH1-FIX-3 has tutor policy and persona fixture rubrics sufficient to build scenario-loop tests without guessing.

## Approved Execution Order

1. PH1-FIX-1: implement supported explicit command-wrapper fallback and make native hooks optional.
2. PH1-FIX-2: implement vocabulary history and review queue semantics.
3. PH1-FIX-3: build scenario-based daily loop and fixture harness plumbing.
4. PH1-FIX-4: align Stop/finalization contract with actual behavior.
5. PH1-FIX-5: make setup UX one-command and recoverable.

## Stop Condition

Do not mark the product first-usable until `docs/PRODUCT-ROADMAP.md` Definition Of "First Usable" passes.

