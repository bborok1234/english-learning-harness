# SLA 단계 이론 — 회화 자신감 관점

학습자의 발달 단계를 인식하고 단계에 맞는 접근을 한다. 단, **학습자에게 단계를 라벨링하지 않는다** (매니페스토 "AI는 거울"). 백그라운드 추정에만 사용. 의존성 순서 네 번째 영역 (E).

확정일: 2026-05-26

---

## 1. SLA 5단계 개요

표준 5단계 모델 (Krashen / Terrell 기반, 현대 SLA 통합):

| 단계 | 정의 | 발화 특성 | Receptive 어휘 |
|---|---|---|---|
| **Pre-production** (Silent Period) | 듣고 흡수. 출력 거의 0 | yes/no, 단어 이해 | ~500 |
| **Early Production** | 1-2 단어 phrase | "I like coffee" | ~1,000 |
| **Speech Emergence** | 짧은 문장. 오류 많지만 의미 통함 | 잡담 가능, 시제 흔들림 | ~3,000 |
| **Intermediate Fluency** | 의견 표현, 자신감 증가 | 회화 자연스러움, 정확도 증가 | ~6,000 |
| **Advanced Fluency** | near-native | 다양한 컨텍스트, idiomatic | 10,000+ |

---

## 2. 성인 학습자와 Silent Period의 긴장 — 우리에게 중요한 결정점

**연구 합의**:
> "The silent period is more common and more noticeable in children, but **adults can experience it too, especially at the start**, or when entering a new context."  
> ([Silent Period — Eslbase](https://www.eslbase.com/teaching/silent-period-second-language-acquisition/))

> "Adolescent and adult learners **need, even want**, the chance to work on phonology and prosody. The developmental path to productive speech in the L2 **requires opportunity for output**."  
> ([Wikipedia: Silent Period](https://en.wikipedia.org/wiki/Silent_period))

**긴장**: silent period 보호 vs output 강요. 학교/학원은 출력 강요 ("이번 주에 발표"). 우리는?

**우리의 입장**:
- silent period가 자연스러운 학습자는 **존중**. Day 0 baseline 거부해도 Day 4까지 자연스럽게 권유. 그래도 못 하면 input-only 모드 한 달 (`09-decisions.md` D17 이미 박혀 있음).
- 그러나 **input + light pressure** 조합이 최적. 매일 5분 알림은 노출 기회. 강요는 X.
- 좁아진 목표 (회화 자신감)는 결국 output을 요함. silent period가 끝없이 가면 자신감 못 생김. 그래서 부드럽게 emerge하도록 설계.

---

## 3. 단계 식별 — 학습자에게 라벨링 X, 백그라운드 추정 O

### 라벨링하지 않는 이유 (매니페스토 재확인)
"당신은 Early Production 단계입니다" 같은 라벨은:
1. 학습자 자신감을 깎음 (한국 학습자 self-labeling 트라우마 — `12-korean-speaker.md`)
2. 학습자가 라벨대로 행동하기 시작
3. 매니페스토 "AI는 거울이지 평가 X" 위반

### 백그라운드 추정 신호

매 세션 누적 분석으로 다음 신호 → 단계 추정:

| 신호 | 측정 방식 | Pre | Early | Emergence | Intermediate | Advanced |
|---|---|---|---|---|---|---|
| 평균 발화 단어 수 | 세션당 평균 | 0~5 | 5~15 | 15~40 | 40~100 | 100+ |
| MLU (Mean Length of Utterance) | 문장당 평균 단어 | 1~2 | 2~4 | 4~8 | 8~12 | 12+ |
| 어휘 다양성 (TTR) | unique/total | 매우 낮음 | 낮음 | 중간 | 높음 | 매우 높음 |
| 시제 다양성 | 사용된 시제 종류 | 1 (현재) | 1~2 | 2~3 | 3~4 | 4+ |
| 망설임 비율 | 망설임/총 단어 | 매우 높음 | 높음 | 중간 | 낮음 | 매우 낮음 |
| 한국어 섞임 비율 | 한국어/총 단어 | 매우 높음 | 높음 | 중간 | 낮음 | 0~낮음 |
| 자기 수정 빈도 | 한 세션 self-correction | 0 | 가끔 | 자주 | 능숙 | 자동 |

추정된 단계는 `_internal/stage_estimate.json`에 저장. 학습자 안 봄. 모델이 자기 행동 조정에 사용.

### 단계 전환 신호 (학습자가 발전했을 때)

학습자가 단계를 넘어가는 순간:
- Pre → Early: 학습자가 자발적으로 1-2 단어 답
- Early → Emergence: 학습자가 자발적 문장 생성 (도움 없이)
- Emergence → Intermediate: 의견 표현, 시제 일관성 개선, 자기 수정 등장
- Intermediate → Advanced: idiomatic 표현 자연스럽게, register 다양화

전환 시 mirror에서 자연스러운 한 줄로만 신호. **"단계가 올라갔다" X**, **"최근에 ~를 더 일관되게 쓰고 있어요" O**.

---

## 4. 단계별 활동 매트릭스

각 단계에 효과적인 활동과 피해야 할 활동:

| 단계 | 효과적 | 피해야 함 |
|---|---|---|
| **Pre-production** | 듣기, yes/no 질문, 한 단어 답, 따라하기 (반복) | 자유 회화, 긴 답 강요, 시제 강조 |
| **Early Production** | 패턴 반복 (chunks: "I like X", "I'm Y"), 단어+짧은 문장 | 복잡한 시나리오, 추상 토론 |
| **Speech Emergence** | 짧은 잡담, picture description, retell (들은 거 본인 말로), 일상 시나리오 | 학술 토론, 정확도 강조 |
| **Intermediate Fluency** | Roleplay, **shadowing**, deliberate practice, 의견 표현, 직장 시나리오 | 비현실적 native 기준, 미세 모음 |
| **Advanced Fluency** | 뉘앙스 토론, idiomatic 확장, register 다양화, debate | (우리 영역 밖 — 시험/학술) |

**핵심**: 활동을 단계에 매핑. 학습자 단계 추정에 따라 모델이 자연스럽게 다른 활동 제안. 강제 X.

**다음 D 영역 (활동 다양화)에서 이 매트릭스를 더 정밀화.**

---

## 5. 페르소나 5명의 단계 매핑

좁아진 목표 안에서 우리 타겟 페르소나의 단계 분포:

| 페르소나 | 추정 단계 | 근거 | 운영 메모 |
|---|---|---|---|
| **A. 지은** | Early Production / Speech Emergence 경계 | 듀오링고 200일, baseline "I like coffee" — 단어 한두 개 | 7일 안에 Speech Emergence 진입 목표 |
| **B. 민호** | Speech Emergence / Intermediate 경계 (위축으로 실제보다 낮게 보임) | 부장급 직장인, 본사 미팅 참여 이력 | trauma 풀리면 Intermediate 진입 가능 |
| **C. 수진** | Intermediate Fluency | 워홀 1년, 잡담 가능, 자신감만 부족 | 빠른 분량 증가, deliberate practice 빠른 도입 |
| **D. 재훈** | Early Production | 학원 4회 끊김, 발화 기회 적었음 | 첫 7일 부담 절대 0. Output 강요 X |
| **E. 혜원** | Intermediate (잠재력) — 일시적 Speech Emergence | 영어 전공, 10년 휴면 | Reactivation 1-2주면 Intermediate 회복 가능 |

**관찰**:
- 좁아진 목표 학습자 대부분 **Early Production ~ Intermediate Fluency** 범위. Pre-production은 드물고 Advanced는 우리 영역 밖
- **Speech Emergence ~ Intermediate가 우리 sweet spot**
- 자가 평가 ("초급") vs 실제 단계 차이 큼 — 한국 학습자의 self-labeling 트라우마와 일치

---

## 6. 우리 design에의 4가지 함의

### 함의 1: 단계는 백그라운드만, 학습자에게 라벨 X (재확인)
07-background-data.md의 `_internal/`에 `stage_estimate.json` 추가. 모델이 매 세션 SessionStart에서 참조.

### 함의 2: 활동을 단계에 매핑 — D 영역의 토대
다음 D 영역에서 14가지 활동 카탈로그를 단계 매트릭스로 정리. 학습자 단계 추정 → 모델이 적합한 활동 자연스럽게 제안.

### 함의 3: 단계 전환 신호는 mirror에서 자연어로
"진보가 보여야 한다" (비전) + "라벨링 X" (매니페스토)의 조화. mirror에서 **"이번 주에 의견 표현이 늘었어요"** 같은 자연어 신호. 단계 라벨 X.

### 함의 4: Pre-production 학습자 (드물지만 있음) 보호 강화
D17 ("베이스라인 실패 처리")을 확장: 4일 input-only 후에도 silent period면 한 달간 **input + 따라하기만**. 자연스러운 emerge 기다림. 좁아진 목표상 결국 output을 향해야 하지만, 강요 0.

---

## 7. 새 결정 후보 D51-D54

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D51 | 단계 백그라운드 추정 | `_internal/stage_estimate.json`. 매 세션 신호 누적 → 단계 추정. 학습자 안 봄 | 07 보강 |
| D52 | 단계별 활동 매트릭스 | 5단계 × 활동 14가지 매핑. 모델이 자연스럽게 적합한 활동 제안 | D 영역에서 본격 |
| D53 | 단계 전환 mirror 자연어 신호 | "단계 올라감" 라벨 X. "최근에 ~를 더 자주 쓰네요" 자연어 | mirror 작성 시 |
| D54 | Pre-production 학습자 input-only 모드 확장 | D17 보강: 4일 후 한 달 input + 따라하기. 강요 0 | 09 보강 |

---

## 8. 다음 영역 연결

- **D (학습 활동 다양화)** — 14가지 활동을 단계 매트릭스로 정리. 바로 이어짐
- **C (도구 카탈로그)** — 단계별 다른 도구 필요 (Pre-production은 듣기 도구, Intermediate는 shadowing 도구 등)
- **F (측정)** — 단계 추정 신호가 측정 지표의 일부

---

## 9. 출처

- [The 6 SLA Stages (Ensemble Learning)](https://ensemblelearning.org/second-language-acquisition-stages/)
- [Silent Period in SLA (Eslbase)](https://www.eslbase.com/teaching/silent-period-second-language-acquisition/)
- [Silent Period — Wikipedia](https://en.wikipedia.org/wiki/Silent_period)
- [Understanding the Silent Period (Second Language Strategies)](https://www.secondlanguagestrategies.com/p/understanding-the-silent-period-of)
- [Silent Period — Multilingual Pedagogy (Georgia Tech)](https://multilingualpedagogy.lmc.gatech.edu/silent-period/)
- [The Basics of SLA (Rosetta Stone)](https://blog.rosettastone.com/the-secrets-of-second-language-acquisition/)
- [5 Stages of Language Learning (Moomin LS)](https://blog.moominls.com/en/5-stages-of-language-learning)
- [Speaking Tasks Intermediate & Advanced (ESL Gold)](https://eslgold.com/practice-speaking/speaking-tasks/intermediate/)
- [14 Strategies for Teaching Intermediate ELLs (EdWeek)](https://www.edweek.org/teaching-learning/opinion-14-strategies-for-teaching-intermediate-english-language-learners/2022/02)
