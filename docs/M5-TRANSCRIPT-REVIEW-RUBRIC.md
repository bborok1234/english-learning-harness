# M5 Before/After Transcript Review Rubric

Date: 2026-05-29
Issue: #64

## Purpose

This rubric compares Day 0 and Day 7 transcript samples from the M5 validation protocol. It scores observable behavior only: voluntary output, clarification, repair, phrase reuse, and comfort proxy. It does not score accent, grammar perfection, CEFR level, fluency, or real-world speaking ability.

## Comparable Inputs

Both samples must use the same prompt set in the same order:

1. `warm_start`
2. `clarification`
3. `reuse`
4. `image_info_gap`
5. `reflection`

If the prompt set differs, the result is invalid. A reviewer may still read the transcripts qualitatively, but the local rubric should not report a before/after decision.

## Observable Metrics

| Metric | Signal | Positive Evidence |
|---|---|---|
| Voluntary output | English word count delta | Day 7 has more learner-initiated words than Day 0 |
| Clarification | clarification marker delta | Day 7 uses phrases like "Could you repeat?" or "What do you mean?" |
| Repair | repair marker delta | Day 7 uses phrases like "I mean..." or "Let me try again" |
| Phrase reuse | saved phrase reuse delta | Day 7 reuses phrases from the learner's review/vault evidence |
| Comfort proxy | comfort rating delta | Day 7 comfort is stable or improved |

## Decision Rules

| Decision | Rule |
|---|---|
| `continue` | Three or more pass signals and no safety regression |
| `research` | One or two pass signals, or evidence is too weak for a clear claim |
| `pivot` | Comfort decreases, even if other metrics improve |
| `kill_claim` | No pass signals |
| `invalid` | Missing baseline/final sample, mismatched prompt set, or unsupported claim |

## Unsupported Claims

The rubric must reject claims that imply:

- native-speaker comparison,
- fluency certification,
- guaranteed improvement,
- level ranking,
- proof of real-world speaking ability.

## Executable Rubric

The deterministic rubric lives in:

```text
scripts/lib/transcript-review-rubric.mjs
```

It is exercised by:

```bash
node scripts/phase5-transcript-rubric-smoke.mjs
```

## Claim Boundary

This rubric supports review of local transcript evidence. It does not certify proficiency, predict real-world outcomes, or replace real learner judgment.
