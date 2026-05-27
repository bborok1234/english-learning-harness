# 언어 습득 이론과 우리 design에의 함의

회화 숙련의 메커니즘을 떠받치는 이론 6개를 정리하고, 그것이 우리의 매니페스토/학습 루프/도구 설계에 어떤 함의를 갖는지를 명시한다. 의존성 순서의 첫 영역 (B).

확정일: 2026-05-26

---

## 1. 핵심 이론 6개

### 1.1 Input Hypothesis — Krashen (1985)

**핵심**: 학습자는 본인 수준 +1 (i+1)의 **이해 가능한 입력**(comprehensible input)을 충분히 받으면 언어가 자연스럽게 습득된다. Affective filter가 낮을수록 효율 증가.

**약점 (2026 시점)**: 입력만으론 출력이 따라오지 않는다는 게 캐나다 French immersion 연구로 입증됨. 학생들이 near-native 청해를 가졌음에도 production에서 못 따라옴.

### 1.2 Output Hypothesis — Swain (1985)

**핵심**: 출력 (특히 **pushed output** — 정확하고 적절한 표현을 강요받는 상황)은 단순한 fluency 연습을 넘어, 학습자가 본인 interlanguage의 **gap을 noticing**하게 한다. 표현하려고 노력하는 순간 본인이 모르는 것을 발견한다.

**3가지 기능**: noticing, hypothesis testing, metalinguistic reflection.

### 1.3 Interaction Hypothesis — Long (1996)

**핵심**: **negotiation of meaning** (서로 이해 안 될 때 다시 묻고 고치는 상호작용)이 SLA의 핵심. 단순 입력보다 **피드백 있는 대화**가 syntactic processing을 강화.

**2026 신경과학 증거**: 대화 + 피드백 그룹이 동일 시간 수동 시청 그룹보다 brain activity (syntactic processing) 크게 증가.

### 1.4 Skill Acquisition Theory — Anderson / DeKeyser / Suzuki

**핵심**: 학습은 3단계로 진행
1. **Declarative** (사실로 안다 — "should have + p.p.가 과거 후회")
2. **Procedural** (절차로 안다 — 의식적으로 적용)
3. **Automatization** (자동으로 한다 — 무의식 사용)

**DeKeyser의 5 원칙** (효과적 연습):
- **Deliberate** — 의도적, 목적 있는 활동
- **Systematic** — 일정한 진행
- **Transfer-appropriate** — 학습 조건이 사용 조건과 유사
- **Feedback** — 결과 피드백 필수
- **Desirable difficulty** — 살짝 어려워야 (= i+1과 닿음)

**핵심 주장**: "**Mere exposure is insufficient**" — Krashen 비판. 단순 입력만으론 자동화 안 일어남.

### 1.5 Automatization

**핵심**: 통제된 처리(controlled processing)가 자동 처리(automatic processing)로 전환되는 과정. 인지 자원이 풀려야 실시간 회화 가능.

**측정 가능한 지표**: speaking rate (분당 단어), 망설임 빈도 (uh, um, 멈춤), reaction time, **lexical access speed**.

### 1.6 The "Big Four" Cognitive Strategies (Roediger, Rohrer, Kim & Webb)

| 전략 | 핵심 | L2 회화에의 효과 |
|---|---|---|
| **Retrieval practice** | 단순 노출이 아닌, 기억에서 꺼내는 행위가 학습 | 어휘 + 패턴 retrieval 양쪽 효과 큼 |
| **Spaced repetition** | 시간 간격을 두고 다시 마주침 | 메타분석으로 효과 강함 |
| **Interleaving** | 여러 활동/주제를 섞음 (blocked의 반대) | speed + breakdown fluency 향상 |
| **Desirable difficulty** | 너무 쉽지도 너무 어렵지도 않은 살짝 어려움 | 자동화 가속 |

---

## 2. 우리 design을 다시 보는 7가지 함의

### 함의 1: Krashen 단독 의존은 위험. Output + Interaction이 필수

**현재 우리 design**: 매니페스토 3번에서 Krashen만 인용 ("affective filter").

**보강**: Output Hypothesis와 Interaction Hypothesis를 매니페스토에 함께. 우리는 이미 출력 중심 (베이스라인, 매일 발화)이라 큰 문제는 아니지만, 명시적으로 들어가야 함.

→ **00-manifesto.md 보강 제안**.

### 함의 2: "인라인 교정 X"는 Interaction Hypothesis와 정합 가능

**걱정**: 매니페스토 3번이 "대화 중 빨간 줄 X"인데, Interaction Hypothesis는 피드백이 syntactic processing을 강화한다고 말함.

**해소**: Interaction Hypothesis가 강조하는 건 **negotiation of meaning** (의미가 막혔을 때 되묻고 고치는 상호작용)이지, 학습자의 문법 오류를 모두 즉시 교정하는 것이 아님. 우리의 **end-of-session mirror = 지연 피드백** 패턴은 noticing을 보존하면서 affective filter를 낮춤. **추가**: 대화 중 학습자 의미가 막힐 때는 **부드럽게 되묻기** (clarification request) OK. 이건 인라인 교정과 다름.

→ **05-onboarding-script.md / AGENTS.md에 "clarification request는 OK, 인라인 교정은 X" 명시**.

### 함의 3: DeKeyser 5 원칙 점검표

우리 design을 5 원칙으로 검증:

| 원칙 | 현재 상태 | 갭 |
|---|---|---|
| **Deliberate** | 🟡 잡담 위주 — 의도성 약함 | 학습 활동 다양화 필요 (다음 D 영역) |
| **Systematic** | ✅ 매일 5분 + 약점 누적 | — |
| **Transfer-appropriate** | 🟡 잡담은 자연스러움. 그러나 학습자가 실제 쓸 상황(미팅, 발표 등)과 transfer 매핑 모호 | 학습자 목표에 따라 활동 매칭 필요 |
| **Feedback** | ✅ Day 7부터 mirror | Day 1~6은 거의 없음 — 의도적 결정 |
| **Desirable difficulty** | ❌ i+1 명시 0 | 모델 출력 톤 명시 필요 |

→ **AGENTS.md에 i+1 원칙 명시 + D 영역에서 활동 다양화 + transfer-appropriate 매핑**.

### 함의 4: Interleaving — 우리는 blocked. 활동 다양화 필수

**현재**: 잡담 한 가지 활동 위주. 14가지 활동 카탈로그 중 1개만.

**증거**: Interleaved practice가 blocked보다 speed + breakdown fluency 향상 (Kim & Webb 메타분석).

**적용**: 매일 다른 활동이 아니라, **한 주에 3~4가지 활동을 섞음**. Week 2 이후 도입. Day 1~7은 잡담 위주로 안정시키되, Week 2부터 shadowing / read-aloud / picture description 등을 섞기.

→ **다음 D 영역에서 본격 다룸**. 우선 11에서는 원칙만 명시.

### 함의 5: Retrieval practice — 어휘만이 아닌 패턴도

**현재**: D13 망각 곡선이 약점에만 적용. 어휘는 별도.

**증거**: Repeated retrieval은 어휘 + 패턴 양쪽 효과. 우리는 어휘만.

**적용**: progress.json의 **patterns.json에도 SM-2 적용**. "should have + p.p." 같은 패턴이 첫 등장 후 +1, +3, +7일에 자연스러운 토픽으로 재등장.

→ **07-background-data.md의 patterns.json 스키마 보강**.

### 함의 6: "Mere exposure is insufficient" — 잡담만으론 자동화 안 됨

**경고**: Krashen 식 "comprehensible input만 받으면 된다"는 reject됨. 우리가 매일 잡담만 시키면 학습자 인지 자원이 자동화로 풀리지 않음.

**적용**: 일정 시점부터 **deliberate practice**가 필요. 잡담 + 의도적 연습 (shadowing, drilling, retrieval) 조합. Week 2~3부터 도입.

→ **D 영역 + 학습 단계 (E 영역)에서 시점 결정**.

### 함의 7: Automatization 측정은 측정 가능

**매니페스토 "평가 X"와 "진보 보여줘야 한다"의 조화**: 아래 지표는 학습자가 절대 점수로 안 보이지만, mirror에서 시각화 가능.

- Speaking rate (분당 단어 수)
- Disfluency markers (망설임, 멈춤)
- Lexical access speed (단어 떠올리는 시간 — 추정 가능)
- Type-Token Ratio (어휘 다양성)
- Mean Length of Utterance (MLU)

이 지표들이 **학습자 본인의 baseline 대비** 어떻게 변하는지 보여주는 게 우리의 정직한 진보 추적.

→ **다음 F 영역에서 본격. 우선 11에서는 지표 목록만**.

---

## 3. 매니페스토 보강 제안 (구체)

매니페스토 3번 ("대화의 흐름이 학습보다 우선")의 근거를 확장:

> 기존:
> "대화 중 빨간 줄을 긋는 순간 학습자의 affective filter가 올라간다 (Krashen)."
>
> 보강 제안:
> "대화 중 빨간 줄을 긋는 순간 affective filter가 올라가 입력 처리가 차단된다 (Krashen). 그러나 의미가 막힐 때의 **clarification request** (Long's Interaction Hypothesis)는 OK — 이건 negotiation of meaning이라 학습을 촉진한다. 인라인 교정과 clarification request는 다르다. 학습 효과의 핵심은 **세션 끝의 noticing 기회** (Swain's Output Hypothesis)에서 일어난다."

매니페스토 4번 ("학습은 누적되어야 한다") 보강:

> 기존:
> "망각 곡선을 따라 약한 부분이 자동으로 다시 등장한다."
>
> 보강 제안:
> "**Spaced retrieval** (Ebbinghaus의 망각 곡선 + Roediger의 retrieval practice)을 따라 어휘 + 패턴이 자연스러운 토픽으로 재등장한다. 단순 노출이 아닌, 학습자가 기억에서 꺼내는 행위가 자동화를 만든다 (DeKeyser)."

매니페스토 6번 ("영어는 공부가 아니라 도구다") 보강:

> 보강 제안:
> "학습 조건이 사용 조건과 닮아야 한다 (**transfer-appropriate processing**). 학습자의 실제 사용 시나리오를 재료로 한다. 그래서 학습 활동은 학습자의 목표와 매칭된다 — 잡담만이 아니라 학습자가 진짜 부딪힐 상황으로."

---

## 4. 새로운 design 결정 후보 (다음 영역으로 갈 때 같이 확정)

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D36 후보 | i+1 (desirable difficulty) | AGENTS.md에 모델 영어 출력 톤 규칙 — 학습자 직전 발화의 어휘 레벨 + 1단계 |
| D37 후보 | Clarification request 허용 | "의미가 막힐 때 부드러운 되묻기는 OK, 문법 교정은 X" — AGENTS.md |
| D38 후보 | 패턴 SM-2 적용 | patterns.json에도 망각 곡선. 어휘와 동일 알고리즘 |
| D39 후보 | Interleaving 도입 시점 | Week 2부터 활동 다양화 시작. Day 1~7은 잡담 안정화 |
| D40 후보 | Deliberate practice 도입 | Week 2~3부터 shadowing / drilling / retrieval 같은 의도적 활동 |
| D41 후보 | Automatization 지표 | speaking rate, disfluency, lexical diversity (MTLD), MLU — mirror에서 본인 baseline 대비 시각화 |

이 후보들은 **다음 영역들 (I/A/E/D/C/F) 진행하면서 확정**. 11 단독으로 닫지 않음.

---

## 5. 더 깊이 갈 영역 (다음 라운드 또는 G/I에서 다룰 것)

- **Motivation (Dörnyei의 L2 Motivational Self System)** — 다음 G 영역
- **Foreign Language Anxiety (Horwitz, MacIntyre)** — 다음 G 영역
- **Willingness to communicate (MacIntyre)** — 다음 G 영역
- **Identity (Norton)** — 다음 G 영역
- **성인 신경 가소성** — 한 줄로 충분 (성인도 가능, 단 시간 더 듦)
- **한국 학습자 L1 transfer** — 다음 I 영역
- **Dynamic Systems Theory (de Bot)** — 깊이 가면 도움. 우선순위 낮음

---

## 6. 출처

- Krashen, S. (1985). *The Input Hypothesis*. [PDF](https://www.sdkrashen.com/content/books/sl_acquisition_and_learning.pdf)
- Swain, M. (1985). Output Hypothesis. [Wikipedia overview](https://en.wikipedia.org/wiki/Comprehensible_output)
- Long, M. (1996). Interaction Hypothesis.
- DeKeyser & Suzuki (2025). *Skill Acquisition Theory* preprint. [PDF](https://yuichisuzuki.net/wp-content/uploads/2025/07/PreprintDeKeyser-R.-M.-Suzuki-Y.-2025.-Skill-acquisition-theory.-In-B.-VanPatten-G.-D.-Keating-S.-Wulff-Eds.-Theories-in-second-language-acquisition-An-introduction-4th-ed.-pp.-157-182-.pdf)
- Suzuki & DeKeyser. Research timeline: Automatization in L2 learning, *Language Teaching* 2025. [PDF](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/30C96770C708A4A9513570F47F40F054/S026144482500059Xa.pdf/research_timeline_automatization_in_second_language_learning.pdf)
- Kim & Webb. The Effects of Spaced Practice on L2 Learning: A Meta-Analysis. [Semantic Scholar](https://www.semanticscholar.org/paper/The-Effects-of-Spaced-Practice-on-Second-Language-A-Kim-Webb/43ba0227417465865bbfd8354ce50f84e896320e)
- Rogers (2026). Repetition, Retrieval, and Spaced Practice. *Encyclopedia of Applied Linguistics*. [Wiley](https://onlinelibrary.wiley.com/doi/10.1002/9781405198431.wbeal20349)
- 2026 neuroscience review: [Beyond Comprehensible Input — neuro-ecological critique](https://pmc.ncbi.nlm.nih.gov/articles/PMC12577063/)
- Deliberate practice framework for L2: [TESL-EJ](https://tesl-ej.org/wordpress/issues/volume29/ej115/ej115a5/)
- Abblino: [Science-Backed Language Learning 2026](https://abblino.com/science-backed-language-learning/)
