# M5 Seven-Day Validation Protocol

Date: 2026-05-29
Issue: #62

## Purpose

M5 validates whether English Learning Harness is ready to claim evidence-backed learning value. It does not try to prove fluency. It checks whether a learner returns for seven days, speaks or writes more voluntarily, reuses phrases, repairs breakdowns, and feels safe enough to continue.

## Participant Types

Use two evidence lanes and never mix their claims.

| Lane | Who | What It Can Prove | What It Cannot Prove |
|---|---|---|---|
| Persona fixture | 지은, 민호, 수진, 혜원 simulated profiles | Protocol mechanics, obvious persona-specific failure modes, claim-boundary enforcement | Real learner impact |
| Real learner pilot | User or invited learner using a local learner store | Early behavioral and self-report evidence | Generalized efficacy, fluency, native-like ability |

재훈 remains non-target-adjacent redirect/smoke only. He must not become a blocking validation persona.

## Day Schedule

| Day | Required Action | Required Artifact |
|---|---|---|
| Day 0 | Run setup, profile, baseline prompt set, comfort note | profile, baseline transcript, comfort rating |
| Day 1 | Daily cockpit, one session, one review phrase | session artifact, journal, review state |
| Day 2 | Daily cockpit, one session, one repair attempt if stuck | session artifact, repair evidence |
| Day 3 | Daily cockpit, one session, phrase reuse check | session artifact, phrase reuse evidence |
| Day 4 | Daily cockpit, one session, learner friction note | session artifact, friction note |
| Day 5 | Daily cockpit, one session, review phrase reuse | session artifact, review update |
| Day 6 | Daily cockpit, one session, self-selected topic | session artifact, voluntary output evidence |
| Day 7 | Final session, final prompt set, comfort note, weekly mirror | final transcript, comfort rating, weekly mirror |

Minimum valid pilot: Day 0 plus at least five of seven daily sessions plus Day 7 final sample. Below that, mark the pilot as incomplete and review friction before making product claims.

## Comparable Prompt Set

Use the same prompt categories on Day 0 and Day 7.

| Prompt | Intent | Example |
|---|---|---|
| Warm start | Voluntary output without pressure | "Tell me one small thing you did today." |
| Clarification | Repair behavior | "Ask me to explain something you did not understand." |
| Reuse | Phrase transfer | "Use one phrase you learned this week in a new sentence." |
| Image/info gap | Situated description | "Describe what matters in this scene and ask one missing-detail question." |
| Reflection | Comfort and friction | "What felt easier or harder today?" |

The exact words may be localized for learner comfort, but Day 0 and Day 7 must stay comparable.

## Evidence Fields

Collect only evidence the local harness can support.

| Evidence | Source | Pass Signal | Fail/Pivot Signal |
|---|---|---|---|
| Return behavior | daily/session artifacts | Five or more daily sessions completed | Drop before Day 3 or repeated setup confusion |
| Voluntary output | transcripts/interactions | More learner-initiated words or turns by Day 7 | Shorter output caused by pressure or unclear task |
| Repair behavior | interaction events, mini mirror | Learner attempts clarification or repair | Learner avoids repair or receives overcorrection |
| Phrase reuse | review queue, transcript text | Learned phrase appears in a later session | Review phrases never reappear |
| Comfort | Day 0/Day 7 note | Same or improved comfort with lower shame/friction | Comfort drops or correction feels unsafe |
| Friction | learner notes | Setup/session loop is understandable | Requires agent intervention for normal use |

## Thresholds

Use these as decision thresholds, not marketing claims.

| Outcome | Condition | Decision |
|---|---|---|
| Continue | 3 or more pass signals, no safety regression | Proceed to evidence export and rubric work |
| Split | Strong results for some personas but not others | Split roadmap by learner segment |
| Pivot | Return or comfort fails but mechanics work | Rework daily return, correction tone, or onboarding |
| Research | Evidence is inconclusive or noisy | Run smaller focused study before implementation |
| Kill claim | Pilot contradicts learning-impact claim | Downgrade claims and remove unsupported copy |

## Privacy And Handoff

- Learner data stays local by default.
- Evidence export must be explicit and reviewable before sharing.
- Local file paths for audio/image artifacts are metadata, not shareable proof.
- Real learner notes should avoid unnecessary sensitive personal detail.
- Public repo examples must use fixtures or redacted samples.

## Required Reviewer Questions

Before M5 can close, answer:

1. Did the learner return without repeated agent intervention?
2. Did voluntary output, repair, or phrase reuse improve in observable artifacts?
3. Did comfort stay stable or improve?
4. Which persona or learner segment struggled?
5. Which claim is supported, downgraded, or blocked?

## Claim Boundary

Passing this protocol supports an early, local, evidence-backed product decision. It does not prove generalized English proficiency, native-like speech, production realtime voice quality, or guaranteed learning outcomes.
