# M5-5 Real Learning Validation Gate

Date: 2026-05-29
Issue: #66
Parent epic: #9

## Decision

Continue to M6 with claim boundaries.

M5 evidence supports the next release-readiness milestone because the local validation protocol, evidence export, transcript rubric, and target-persona fixtures are implemented and smoke-tested. M5 does not support claims of real learner improvement yet because no real learner pilot has been run.

## Evidence Reviewed

| Issue | Evidence | Result |
|---|---|---|
| #62 | `docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md` | Protocol defines Day 0-7 schedule, prompt set, evidence fields, thresholds, privacy, and claim boundaries. |
| #63 | `scripts/phase5-evidence-export-smoke.mjs` | Seven-session evidence pack export passes with redaction and review reuse summary. |
| #64 | `scripts/phase5-transcript-rubric-smoke.mjs` | Before/after rubric passes positive fixture and rejects unsupported claims, prompt mismatch, and missing sample. |
| #65 | `scripts/phase5-persona-validation-smoke.mjs` | Four target personas complete seven sessions with evidence export and transcript rubric `continue` decisions. |

## Approved Claims

- The repo has a local seven-day validation protocol.
- The repo can export local seven-day evidence packs for review.
- The repo can compare before/after transcripts using observable behavior only.
- Simulated target-persona validation passes for 지은, 민호, 수진, and 혜원.

## Blocked Claims

- Real learner improvement is not proven.
- Generalized English proficiency is not proven.
- Production realtime voice quality is not proven.
- Public clone-to-learn support readiness is not proven until M6.

## M6 Split

M6 is split into executable issues:

| Issue | Purpose |
|---|---|
| #72 | Verify public clean clone setup path. |
| #73 | Verify marketplace packaging and install docs. |
| #74 | Harden first-run onboarding and support diagnostics. |
| #75 | Close public clone-to-learn release gate. |

## Verification

Run:

```bash
node scripts/phase5-m5-gate-smoke.mjs
node scripts/phase5-persona-validation-smoke.mjs
node scripts/phase5-transcript-rubric-smoke.mjs
node scripts/phase5-evidence-export-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- M5 evidence files exist;
- transcript rubric smoke passes;
- evidence export smoke passes;
- persona validation smoke passes for four target personas;
- gate decision is `continue_to_m6`.

## Claim Boundary

This closes simulated/local validation readiness. It does not prove real learner outcomes.
