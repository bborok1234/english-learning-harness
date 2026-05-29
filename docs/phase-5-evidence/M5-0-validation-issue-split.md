# M5-0 Validation Issue Split

Date: 2026-05-29
Parent epic: #9

## Decision

Split.

M5 is about earning the right to make learning-effect claims. A single broad validation epic would mix study design, export mechanics, transcript review, persona rehearsal, and final claim review. Those need separate evidence trails.

## Created Issues

| Issue | Purpose |
|---|---|
| #62 | Define the seven-day validation protocol. |
| #63 | Export a seven-day pilot evidence pack. |
| #64 | Add the before/after transcript review rubric. |
| #65 | Run target-persona seven-day validation fixtures. |
| #66 | Close the real learning validation gate. |

## Next Target

#62 is next because protocol must come before export, rubric implementation, or pilot claims. It should define the pilot schedule, comparable before/after prompts, observable evidence, privacy handling, and stop/pivot rules.

## Verification

Run:

```bash
gh issue list --milestone "M5 Real Learning Validation"
gh issue view 62
node scripts/generate-dashboard.mjs
```

Expected evidence:

- #9 remains the M5 epic;
- #62-#66 exist in the M5 milestone;
- dashboard current target is #62;
- no real learning impact claim is made before pilot evidence.

## Claim Boundary

This is execution planning for validation. It does not produce real learner evidence or prove learning impact.
