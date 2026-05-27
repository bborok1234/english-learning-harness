# Persona Fixture Spec

Last updated: 2026-05-27
Status: Active planning contract

## Purpose

Persona fixtures are executable product-quality tests for the learning experience.

They are not marketing personas. They are scenario files that prove the tutor policy, local persistence, metrics, and claim boundaries behave correctly for the four target learners.

## Fixture Shape

Each fixture must define:

```json
{
  "id": "jieun-freeze-day1",
  "persona": "jieun",
  "profile": {
    "motivation": "...",
    "anxiety_triggers": ["..."],
    "correction_style": "gentle recast first",
    "familiar_topics": ["..."],
    "avoid_topics": ["..."]
  },
  "session": {
    "mode": "easy",
    "scenario": "ordering coffee with unexpected follow-up",
    "learner_turns": ["..."]
  },
  "expected": {
    "must_include": ["communicated meaning", "one recast", "one review phrase"],
    "must_not_include": ["guarantee real-person confidence", "native speaker ranking"],
    "metrics": {
      "attendance": 1,
      "new_vocabulary_count_max": 5
    }
  }
}
```

## Required Fixtures

### 지은

Risk:

- freezes because English feels like identity exposure.

Must test:

- warm start,
- no shame,
- one rescue phrase,
- recast without lecture.

### 민호

Risk:

- correction trauma, high anxiety, avoidance.

Must test:

- after-session correction only,
- Korean fallback bridge,
- repair phrase coaching,
- no harsh error language.

### 수진

Risk:

- wants expressive/global identity, may get bored by dull drills.

Must test:

- creative topic personalization,
- identity-safe phrase vault,
- scenario variation,
- no generic textbook tone.

### 혜원

Risk:

- dormant English major, shame around lost ability.

Must test:

- reactivation without "failed former English major" framing,
- slightly richer language option,
- self-comparison only,
- one elegant recast.

## Pass Criteria

A fixture passes only when:

- local files are created under the fixture learner root,
- `progress.json` validates,
- vocabulary history semantics pass,
- journal includes scenario, learner turns, mirror, and artifact reference,
- mini mirror satisfies `docs/TUTOR-POLICY.md`,
- no prohibited claim appears,
- the generated next phrase is usable in a future scenario.

## Failure Examples

Fail:

```text
You made several grammar mistakes. Your level is low, but if you keep going you will be confident with foreigners.
```

Reasons:

- starts with errors,
- level judgment,
- real-person confidence guarantee,
- foreigner-confidence framing.

Pass:

```text
오늘 전달한 것: You explained that coffee helps your morning.
자연스럽게 바꾸면: Coffee helps me start my morning.
오늘의 패턴: "helps me + verb"
내 문장으로 저장: Coffee helps me wake up.
작게 다시 말해보기: Coffee helps me ___.
```
