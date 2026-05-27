# 측정 — judgmental 아니게

매니페스토 "평가 X"와 비전 "진보가 보여야 한다"의 조화. 측정은 한다. 단, **본인 baseline 대비 + multi-dimensional + mirror 형태**로. 의존성 순서 일곱 번째 영역 (F).

확정일: 2026-05-26

---

## 1. 측정의 5가지 원칙

### 원칙 1: Self-referenced only — 외부 기준 X
CEFR, TOEIC, 학원 레벨 같은 외부 기준 사용 X. **본인 baseline (Day 0) 대비** 변화만 측정한다.

**근거**: 한국 학습자의 self-labeling 트라우마 (`12-korean-speaker.md`) + Ideal-L2-Self 활성화 (`13-learner-typology.md` Dörnyei). 외부 라벨은 자기 인식을 외부 기준에 종속시킨다.

### 원칙 2: Multi-dimensional — 단일 점수 X
"당신은 65점입니다" 같은 단일 수치 X. 5개 카테고리 × 13개 지표를 따로따로 본다. 어느 한 지표가 정체해도 다른 지표가 발전하면 진보다.

### 원칙 3: Mirror, not grade
지표는 학습자 자기 자각용. 모델이 평가하지 않는다. mirror에서 자연어 한 줄로 보여줌 ("이번 주 발화 시간이 지난주보다 길어졌어요").

### 원칙 4: 학습자가 보고 싶을 때
디폴트 = Day 7 mini-mirror + Day 30 monthly mirror에 간략 요약. 더 보고 싶으면 학습자 명시 요청 → detailed view. 강요 0.

### 원칙 5: 진보 정체 시점 처리
"변한 게 없어요" (Day 60) — 정량 변화는 있어도 학습자가 못 느낌. 그때 baseline 재청취 + 누적 자산 시각화로 직접 자각 유도.

---

## 2. 5개 카테고리 × 13개 지표

### A. Fluency (유창성) — 4개 지표
| 지표 | 측정 방식 | 단위 | 학습자가 보는 형태 |
|---|---|---|---|
| **Speaking rate** | 단어 수 / 발화 시간(초) × 60 | wpm | "지난주보다 분당 단어 더 늘어남" |
| **Mean Length of Run (MLR)** | pause 사이 평균 발화 단어 수 | 단어 | "한 번에 더 길게 말함" |
| **Disfluency rate** | (uh + um + 멈춤 1초+) / 총 단어 | 비율 | "망설임이 줄어들고 있어요" |
| **자발적 발화 시간** | 학습자가 자발적으로 발화한 총 시간 | 분 | "이번 주 평균 발화 시간 [X]초" |

### B. Lexical (어휘) — 3개 지표
| 지표 | 측정 방식 | 학습자가 보는 형태 |
|---|---|---|
| **MTLD** (Measure of Textual Lexical Diversity) | 표준 알고리즘 | "어휘 다양성이 늘어남" (절댓값 X) |
| **누적 unique vocabulary** | vocab_seen.json에서 추출 | "이번 주 새 단어 [N]개" |
| **자주 쓰는 표현 Top 3** | patterns.json에서 추출 | "자주 시도한 표현 3개" |

### C. Syntactic (문장 구조) — 2개 지표
| 지표 | 측정 방식 | 학습자가 보는 형태 |
|---|---|---|
| **MLU** (Mean Length of Utterance) | 문장당 평균 단어 수 | "문장이 더 길어지고 있어요" |
| **Tense diversity** | 사용한 시제 종류 수 | "이번 주 [N]개 시제 시도" |

### D. Confidence / WTC (자신감) — 3개 지표
| 지표 | 측정 방식 | 학습자가 보는 형태 |
|---|---|---|
| **Self-reported confidence** | 학습자 자기 보고 1-5 (선택, 강요 X) | "오늘 자신감 [N]/5" |
| **알림 응답률** | (응답한 알림 수) / (보낸 알림 수) | 백그라운드만, 학습자 안 봄 |
| **영어 발화 비율** | 영어 단어 / (영어 + 한국어) 단어 | "이번 주 영어 비율 [X]%" |

### E. Pronunciation (발음) — 1개 지표 (필요 시)
| 지표 | 측정 방식 | 학습자가 보는 형태 |
|---|---|---|
| **Word-level confidence** | gpt-4o-transcribe logprobs (D42) | "이번 주 자신감 낮은 단어 3개" (옵션) |

**전체 후보는 13개다.** MVP 자동 누적 대상은 아래 5개뿐이고, 나머지는 Month 1+ monthly mirror에서만 채운다. mirror에서 학습자가 보는 형태로 변환한다.

### MVP 안 / Month 1+ 분리 (D83, 2026-05-26 critic M1)

5분 일상 세션에서 통계 의미 있는 지표만 MVP. 나머지는 monthly mirror (긴 baseline)에서만 수집:

**MVP 안 — 매 세션 (5개)**:
1. 발화 단어 수
2. 영어 비율 (영어 / (영어 + 한국어) 단어)
3. 출석 여부
4. 자발 발화 시간 (초)
5. 새 어휘 수

**Month 1+ — monthly mirror만 (8개)**:
- MTLD (어휘 다양성) — 긴 발화 필요
- MLU (평균 문장 길이)
- Speaking rate (분당 단어)
- Disfluency rate (망설임 비율)
- Tense diversity
- Top patterns
- Self-reported confidence
- Word-level confidence (logprobs)

**근거**: 5분 발화 (10~30단어)로는 MTLD/MLU/speaking rate 같은 통계 의미 0. Month 1+ baseline은 더 긴 발화 가능. 매 세션 데이터 부풀림은 학습자에게도 우리에게도 noise.

---

## 3. 학습자에게 보여주는 것 vs 안 보여주는 것

### ✅ 보여주는 것 (자기 비교)
- "이번 주 평균 발화 시간 [X]초 (지난주 [Y]초)"
- "Day 1: 'I like coffee.' 오늘: '[학습자 발화]'" — 직접 비교 가능
- "이번 주 처음 시도한 표현 3개" — 새 것
- "자주 시도한 패턴 3개" — 자기 패턴 자각
- "이번 주 새 단어 [N]개"
- "이번 주 자신감 낮은 단어 3개" (옵션 — 학습자가 발음 분석 요청 시만)

### ❌ 보여주지 않는 것
- 외부 기준 점수 (CEFR B1 등)
- 절대 수치 (MTLD 0.72 등 — 학습자에게 의미 없음)
- 비교 ranking
- "초급/중급/고급" 라벨
- 다른 학습자 평균과의 비교
- 오류 횟수 / 정확도 점수
- "당신은 X점" 단일 수치

---

## 4. 시각화 방식

**디폴트 = 자연어 한 줄, 한 번에 1-3개 발견만**.

### Day 7 mini-mirror 예시
```
이번 주 같이 한 거 30초로 정리할게요.

- 5일 만났어요 (Day 2, Day 4 빠지셨어요)
- 가장 길게 말한 날: 5월 30일 (about 22 words, 평균 14 words)
- 자주 시도한 표현 3개:
  1. "I like X" (5번)
  2. "It's a X morning" (3번)
  3. "I had X" (2번)
- 새 단어 8개 추가됨

한 가지 발견: "커피"가 매일 등장했어요. 다음 주 그쪽 어휘 늘려볼까요?
```

### Day 30 monthly mirror 예시
```
한 달 같이 했어요. 직접 비교해볼게요.

[재생 버튼] Day 0 발화 (9초, 7 단어): "My name is Jieun. I... I like coffee."
[재생 버튼] 오늘 발화 (24초, 19 단어): "[학습자 새 baseline]"

- 발화 시간 3배, 단어 수 2.7배
- 망설임 마커 줄었어요 ("I... I" → 0)
- 시제 3개 시도 (Day 0: 1개)

다음 달 한 가지 방향 정해볼까요? 잘 모르겠으면 "그냥 같은 페이스"도 답이에요.
```

**핵심**: 절댓값보다 **상대 비교**. 그래프보다 **재생 비교**. 점수보다 **나의 변화**.

### Detailed view (학습자 명시 요청 시)
학습자가 "더 자세히 보고 싶어요" 또는 한 줄 명령으로 detailed view 호출:
- 13개 지표 모두 일별/주별 추이
- 시계열 그래프 (간단 ASCII / Markdown 표)
- 약점 큐 전체 보기
- baseline 비교 (Day 0/30/90/180/365)

이건 일종의 "옵션 깊이". 평소엔 안 보임.

---

## 5. 진보 정체 시점 처리

가장 어려운 순간. Day 60에 학습자가 "변한 게 없어요"라고 할 때.

### 진단
모델이 백그라운드에서 다음을 체크:
- 지난 30일 13개 지표 추이 — 실제로 변화 있나
- 변화는 있는데 학습자가 못 느낌 = 우리가 mirror에서 안 보여준 신호

### 대응 (3단계)

**1단계 — Baseline 재청취**:
> "지은님, 잠깐 두 개만 같이 들어볼래요?"
> [Day 0 녹음 재생]
> [어제 발화 재생]
> "어떠세요?"

직접 듣기가 가장 강력한 mirror. 거의 항상 차이 느낌.

**2단계 — 누적 자산 시각화**:
> "그동안 우리가 같이 만든 거 보여드릴게요.
> - 700개 단어 사용
> - 60일치 일지
> - 영어 사용 비율 12% → 67%
> 안 보이는 변화도 있어요."

**3단계 — 옵션 제시**:
> "그래도 정체된 느낌이라면 — 한 가지 바꿔볼까요?
> 1. 새로운 활동 (지금까지 안 해본 거)
> 2. 새로운 시나리오 / 토픽
> 3. 같은 페이스 유지 (정체는 자연스러운 단계예요)"

학습자 선택. 강요 X.

---

## 6. 학습자가 측정에 대해 가질 권리

### 권리 1: 보고 싶을 때 보기
- Day 7 / Day 30 / Day 90 mirror가 디폴트
- 학습자가 "이번 주 어땠어?" 같이 자연어로 물으면 즉시 mini-mirror

### 권리 2: 안 보고 싶을 때 안 보기
- 학습자가 "오늘 mirror 패스" 명시 → 그 주 mini-mirror 생략
- 학습자가 "측정 잠시 끄고 싶어" → 한 달 mirror 중지 가능. 측정 자체는 백그라운드 계속

### 권리 3: 본인 데이터 보기
- `~/english-learning/progress.json` 직접 열람 가능
- mirror 외 detailed view 옵션
- raw 데이터를 텍스트 에디터로 보는 자유

### 권리 4: 본인 데이터 지우기
- 학습자가 특정 일자 일지 삭제 요청 → 즉시
- baseline 재녹음 요청 → 새 baseline 저장, 기존도 보관 (학습자가 원하면 삭제 가능)

이게 매니페스토 "데이터는 학습자의 것"의 구체 실행.

---

## 7. 새 결정 후보 D63-D66

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D63 | 측정 지표 후보군 확정 | Fluency / Lexical / Syntactic / Confidence-WTC / Pronunciation 후보군. D83 이후 MVP 자동 누적은 5개로 축소 | progress.json 스키마 보강 |
| D64 | Self-referenced only — 외부 기준 사용 금지 | CEFR/TOEIC/학원 레벨 라벨 0. AGENTS.md에 명시 | AGENTS.md |
| D65 | 진보 정체 시점 처리 3단계 | (1) Baseline 재청취 (2) 누적 자산 시각화 (3) 옵션 제시 | daily_session 스킬 |
| D66 | Detailed view 학습자 옵션 | 디폴트 = 간략 mirror. 학습자 명시 요청 시 13개 지표 전체 추이 | mirror 스킬 |

---

## 8. progress.json 스키마 보강 (D63 + D83 + D100 적용)

```json
{
  "version": 2,
  "started": "2026-05-26",
  "last_session": "2026-05-26",

  "mvp_session_metrics": {
    "utterance_word_count": { "today": 0, "week_avg": 0, "baseline": 0 },
    "english_word_ratio": { "today": 0, "week_avg": 0, "baseline": 0 },
    "attendance": { "today": false, "days_active": 0, "days_total": 0 },
    "voluntary_speaking_seconds": { "today": 0, "week_total": 0, "baseline": 0 },
    "new_vocabulary_count": { "today": 0, "week_total": 0 }
  },

  "monthly_optional_metrics": {
    "fluency": {
      "speaking_rate_wpm": null,
      "mean_length_of_run": null,
      "disfluency_rate": null
    },
    "lexical": {
      "mtld": null,
      "unique_vocabulary_total": 0,
      "top_patterns_week": []
    },
    "syntactic": {
      "mlu": null,
      "tense_diversity_week": 0
    },
    "confidence": {
      "self_reported_today": null,
      "notification_response_rate": 0
    },
    "pronunciation": {
      "weak_words_week": []
    }
  },
  
  "history": {
    "baseline_recordings": [
      { "date": "2026-05-26", "type": "baseline", "audio_path": "..." }
    ]
  }
}
```

매 세션 MVP는 `mvp_session_metrics`의 5개만 업데이트한다. `monthly_optional_metrics`는 Day 30 이후 baseline 비교, monthly mirror, 또는 학습자 명시 요청 시만 채운다.

---

## 9. 다음 영역 연결

- **G (동기 유지)** — 측정이 동기를 깎는 vs 살리는 차이. mirror 디자인이 핵심
- **H (콘텐츠 소싱)** — 학습자 관심사 누적 → 토픽 추천
- **J (부정 시나리오)** — "변한 게 없어요" + "점수 매겨주세요" 같은 정체/평가 요청 처리

---

## 10. 출처

- [Utterance-Based Measurement of L2 Fluency (ERIC)](https://files.eric.ed.gov/fulltext/EJ1266988.pdf)
- [Quantitative L2 Fluency Investigation (ResearchGate)](https://www.researchgate.net/publication/335004658_A_quantitative_investigation_of_L2_learners'_fluency_using_a_learner_corpus_and_fluency_analysis_tools)
- [Fluency-related Temporal Features Prosodic Predictors (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9326808/)
- [Self-Evaluation of L2 Speech Learning (MDPI)](https://www.mdpi.com/2226-471X/9/3/109)
- [Self-regulation + Learner Engagement via Intelligent Personal Assistants (Springer)](https://link.springer.com/article/10.1186/s40359-024-01917-0)
- [Enhancing L2 Speaking via Self/Peer Assessment (Taiwan TESOL)](https://eric.ed.gov/?id=EJ1375584)
- [Cultivating Proficient L2 Speakers via VoiceThread (Nature HSS)](https://www.nature.com/articles/s41599-025-05674-2)
- [Foreign Language Enjoyment + Proficiency + L2 Motivation (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9948615/)
