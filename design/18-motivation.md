# 동기 유지 메커니즘

매니페스토 "외재 동기 X" + "매일 5분" + 좁아진 목표 ("회화 자신감")가 어떤 학술 메커니즘으로 작동하는지 명시. 5개 이론을 우리 design에 정합 검증. 의존성 순서 여덟 번째 영역 (G).

확정일: 2026-05-26

---

## 1. 동기 이론 5개 통합

### 1.1 Self-Determination Theory (Deci & Ryan)
3가지 보편 심리 욕구:
- **Autonomy** (자율) — 선택과 통제 감각
- **Competence** (효능감) — 발전하고 있다는 감각
- **Relatedness** (연결감) — 누군가와 연결된 느낌

> "**Autonomous motivation**은 외재 동기보다 L2 학습에 가장 효과적"  
> ([SDT for L2 Achievement (2025)](https://selfdeterminationtheory.org/wp-content/uploads/2025/06/2025_AlamerRobatEtAl_L2.pdf))

### 1.2 Habit Formation (James Clear, Atomic Habits)
- **Identity-based habits** — "I am someone who..." 목표보다 정체성
- **Minimum viable habit** — 가장 작은 버전. "5분만"
- **Systems over goals** — 시스템이 결과를 만든다
- **Consistency > intensity** (특히 초기)
- "Habits form through **repetition in context**, not willpower"

### 1.3 Flow Theory (Csíkszentmihályi)
- **Challenge ↔ Skill 균형** — flow channel
- 도전 > 기술 = anxiety
- 도전 < 기술 = boredom
- **flow가 enjoyment 생성 → anxiety 균형** — 한국 학습자에게 핵심

> "Flow theory holds particular promise for students with language anxiety, as flow generates enjoyment which counterbalances anxiety."

### 1.4 L2 Motivational Self System (Dörnyei) — 13번에서 이미 다룸
- Ideal L2 Self (자율) > Ought-to L2 Self (외재) > L2 Learning Experience

### 1.5 WTC + Speaking Anxiety — 12번에서 이미 다룸
- 자신감 ↑ + 불안 ↓ = WTC ↑
- AI chatbot이 이 효과를 입증 (2025 연구)

---

## 2. 우리 design × 5 이론 정합 검증

### SDT × 우리 design

| SDT 욕구 | 우리 design 어디서 충족? |
|---|---|
| **Autonomy** | 학습자가 시간 정함 (D08) / 활동 선택 (D56) / mirror 거부 (17 권리) / 모드 전환 (D30) / 데이터 소유 (매니페스토 5) / 죄책감 0 알림 (08) |
| **Competence** | baseline vs 지금 비교 (17 monthly mirror) / 누적 자산 (17 정체 처리) / 작은 성공 (onboarding Phase 5) / 자기 비교 metric 13개 (17) |
| **Relatedness** | "내 파트너" 비전 / 학습자 이름 + 한 마디 인용 (05) / 어제 한 마디에서 이어짐 (08) / 매 세션 끝 다음 약속 |

→ 우리 design이 SDT 3개 모두 충족. 안티-패턴 (외재 동기 XP/스트릭)도 명시 회피 (매니페스토).

### Habit × 우리 design

| Atomic Habits 원칙 | 우리 design 정합 |
|---|---|
| **Identity-based** | 매니페스토 1 "언어는 학습이 아니라 습관이다". mirror에서 "30일 같이 했어요" (정체성 강화) |
| **Minimum viable** | Day 0 baseline = 1문장. 매일 5분 |
| **Systems over goals** | 매니페스토 1과 직접 일치 |
| **Consistency > intensity** | 매일 5분 > 주말 1시간. 안티-패턴에서 streak 외재 동기 금지 |
| **Repetition in context** | 매일 같은 시간 + 같은 파트너 (cue → routine) |

→ 우리 design이 Atomic Habits 모든 원칙과 정합.

### Flow × 우리 design

| Flow 조건 | 우리 design 적용 |
|---|---|
| **Challenge ↔ Skill 균형** | i+1 (D36) — 학습자 발화 +1 단계 / 활동 자동 제안 (D56) / 너무 어려우면 한국어 후퇴 |
| **Personal interest** | 학습자 관심사 누적 (`favorite_topics`) / 토픽 큐 자동 추천 |
| **Immediate feedback (작은 단위)** | 대화 중 자연스러운 응답 / mirror는 지연 |
| **Clear goals** | 한 세션 = 한 활동 (5분 안에 한 가지) |
| **Sense of control** | 자율성 = SDT autonomy와 일치 |

→ Flow 5조건 모두 충족. 특히 한국 학습자의 anxiety 해독제로 핵심.

### L2MSS × 우리 design (13번 보강)

- **Ideal L2 Self 활성화** — onboarding Phase 4에서 학습자가 "외국인 만나도 안 도망가고 싶다" 정체성 명시. mirror에서 그 정체성 강화
- **Ought-to L2 Self 회피** — 시험 동기 학습자 (페르소나 D 재훈)에게 정직하게 안내. Ought → Ideal 전환 유도
- **L2 Learning Experience** — 매 세션 자체가 즐거운 경험이어야. Flow 조건 + 매니페스토 6신념 결합

---

## 3. 페르소나별 동기 유지 전략

| 페르소나 | 주요 동기 메커니즘 | 위험 시점 | 대응 |
|---|---|---|---|
| **A. 지은** (Ideal, Low WTC) | Identity 강화 ("매일 만나는 사람") + Competence (작은 성공 자주) | Week 2 newness 빠짐 | 활동 다양화 빠르게 도입 |
| **B. 민호** (Trauma, High Anxiety) | Relatedness ("학원/회사 아님") + Flow (도전 최소부터) | Day 1~7 dropout 큰 위험 | 한국어 비중 ↑, baseline 무한 연기 OK |
| **C. 수진** (Extrovert, Identity) | Challenge (빠른 어려운 활동) + Autonomy (본인 토픽) | Day 30~60 "도전 부족" boredom | 4/3/2, Storytelling 일찍 도입 |
| **D. 재훈** (Ought-to → Ideal 전환 필요) | Autonomy 최대화 ("당신 선택") + 정직한 안내 ("적합 아닐 수도") | Day 7 이내 끊김 큰 위험 | Day 1~7에 명시적 자율성 강조, "맘 바뀌면 OK" |
| **E. 혜원** (Reactivation) | Competence 빠른 회복 ("이미 알고 있어요") + Identity ("다시 영어 하는 사람") | 첫 주 자가 라벨 ("다 까먹었어요") | 자가 라벨 안 받기, 잠재력 빠른 확인 |

---

## 4. Dropout Zone 예측 및 처리

가장 흔한 끊김 시점과 우리 대응:

### Week 2 끝 (Day 14)
**원인**: Newness 효과 사라짐. 매일 잡담이 지루해짐.
**대응**: D14 mini-mirror에서 활동 다양화 도입 (D57 Week 2 로드맵). Shadowing / Picture description / Read-aloud 새로 등장.

### Day 30 (월간 마일스톤)
**원인**: 한 달 — 첫 진정한 검증. "정말 늘었나?" 의심.
**대응**: monthly mirror에서 **baseline 재청취** (17번). Day 0 vs 오늘 직접 듣기 = 가장 강력한 evidence.

### Day 60 ("정체감")
**원인**: 분량/속도는 늘었지만 자기는 못 느낌.
**대응**: 17번 진보 정체 3단계 처리 (baseline 재청취 + 누적 자산 + 옵션).

### Day 90 (분기 마일스톤)
**원인**: 3개월 — 진짜 자각의 분기점.
**대응**: 분기 baseline 녹음. Day 0/30/60/90 4개 비교 가능. 다음 분기 방향 학습자가 정함 (autonomy).

### 외부 사건 (병원, 출장, 이사)
**원인**: 환경적 단절.
**대응**: 알림 빈도 자동 축소 → 학습자 돌아올 때 자연스럽게 (08-first-7-days 빠짐 처리).

---

## 5. 매니페스토와의 정합 재확인

매니페스토 5신념이 5개 동기 이론으로 모두 떠받쳐짐:

| 매니페스토 | 동기 이론 근거 |
|---|---|
| 1. "언어는 학습이 아니라 습관이다" | Atomic Habits (Identity + Minimum viable + Systems) |
| 2. "AI는 선생이 아니라 거울이다" | SDT Autonomy (학습자가 자기 자각) + WTC (judgement 없는 환경) |
| 3. "대화의 흐름이 학습보다 우선" | Flow (challenge-skill 균형) + L2 anxiety 감소 |
| 4. "학습은 누적되어야 한다" | SDT Competence (발전 감각) + Identity ("매일 하는 사람") |
| 5. "데이터는 학습자의 것이다" | SDT Autonomy (소유 = 통제) + Identity (700일 일지 = 자기 자산) |
| 6. "영어는 공부가 아니라 도구다" | Flow (personal interest) + transfer-appropriate (11번) |

안티-패턴 (XP/스트릭/리더보드/인라인 교정/일률 커리큘럼/평가 톤/클라우드 종속)이 SDT autonomous motivation을 깨뜨림. 매니페스토 정합 입증.

---

## 6. "이 도구를 매일 켜게 만드는 것" — 학술 답

조합 이론으로 답:

**SDT** 3개 욕구 충족 + **Atomic Habits**의 작은 의식 + **Flow**의 challenge-skill 균형 + **Identity**의 정체성 형성 + **Relatedness**의 일관된 파트너.

이 5개가 동시에 작동하면 학습자는:
- **켜고 싶어진다** (autonomy + identity)
- **켜기 쉽다** (minimum viable habit)
- **켜면 만족스럽다** (flow + competence)
- **다시 켜고 싶다** (relatedness + repetition in context)

각 요소가 따로 작동하면 약함. 5개가 같이 작동해야 강한 동기.

---

## 7. 새 결정 후보 D67-D70

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D67 | Identity-based 정체성 신호 | mirror에서 "매일 만나는 사람" 등 정체성 언어 사용. "공부하는 학생" X | AGENTS.md + mirror 스킬 |
| D68 | Dropout zone 자동 대응 | Day 14 / 30 / 60 / 90에 각각 다른 mirror + 활동 도입 | 운영 cron + mirror |
| D69 | Flow challenge-skill 모니터링 | 학습자 단계 + 활동 난이도 추적 → 너무 쉬우면 boredom, 너무 어려우면 anxiety 신호 → 자동 조정 | progress.json + 자동 제안 |
| D70 | Streak 사용 정책 | 일수 표시는 OK ("30일 같이 했어요"), 그러나 "끊겼다" 죄책감 트리거 X. streak 깨져도 알림 안 함 | mirror + 알림 패턴 |

---

## 8. 다음 영역 연결

- **H (콘텐츠 소싱)** — 학습자 관심사를 어떻게 발굴 (Flow personal interest)
- **J (부정 시나리오)** — "오늘 영어 진짜 싫어요" / "그만둘래요" 같은 동기 저하 표현 처리

---

## 9. 출처

- [SDT for L2 Achievement (2025)](https://selfdeterminationtheory.org/wp-content/uploads/2025/06/2025_AlamerRobatEtAl_L2.pdf)
- [Measuring Motivation for Generative AI Language Learning via SDT (Wiley 2025)](https://onlinelibrary.wiley.com/doi/10.1111/ijal.12868)
- [Social Reinforcement + SDT in Online Language Learning (Nature 2025)](https://www.nature.com/articles/s41598-025-18953-4)
- [Predicting Language Learning Strategies from Competence + Autonomous Motivation (Springer)](https://link.springer.com/article/10.1007/s44202-025-00488-4)
- [James Clear — Identity-Based Habits Guide (PDF)](https://jamesclear.com/wp-content/uploads/2016/05/CU-Identity-Based-Habits.pdf)
- [Daily Language Habit (Ling App)](https://ling-app.com/blog/build-a-daily-language-habit/)
- [Anxious Learners' Positive Flow Experiences in Speaking Tasks (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0346251X24001556)
- [Flow in L2 Classroom: Task Features + Learner Flow (Modern Language Journal 2023)](https://onlinelibrary.wiley.com/doi/10.1111/modl.12865)
- [EFL Learners' Flow Scale Development (ScienceDirect 2025)](https://www.sciencedirect.com/science/article/pii/S0001691825007371)
