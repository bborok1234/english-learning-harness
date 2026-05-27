# 첫 7일 일자별 패턴

Onboarding (Day 0) 다음의 일주일이 학습자의 1년을 가른다. 학원이 망하는 지점이 첫 수업이 아니라 그 다음 일주일인 것처럼.

이 문서는 Day 1~7 각각의 정밀 인터랙션 패턴.

## 첫 7일을 떠받치는 두 원칙

1. **답 안 해도 OK** — 매 알림과 인터랙션의 톤에 이게 깔려 있다
2. **부담 절대 0** — 분량은 첫 7일 거의 안 늘림. Day 7 끝에서야 살짝

학습자가 첫 7일 중 1-2일을 빠뜨려도 정상이다. 모든 알림에 죄책감 트리거 0.

---

## Day 1 (Onboarding 다음날)

### 알림 (학습자가 정한 시간)

> **Good morning. Yesterday: 'I like coffee.' What kind?**

(영어 1줄. 어제 한 말에서 자연스러운 follow-up.)

### 학습자가 들어왔을 때

**파트너 (영어)**: "Good to see you."

학습자가 답을 시작하면 1-2 turn 후 자연스럽게 마무리.

### 응답 분기

| 학습자 응답 | 파트너 응답 | 다음 |
|---|---|---|
| 한 단어 ("Iced americano") | "Nice. Hot or iced person?" | 1 turn 더 |
| 한 문장 ("I like iced coffee in summer.") | "Iced in summer. Got it. What about winter?" | 1 turn 더 |
| 한국어 ("아이스 아메리카노") | "Ah. In English: 'iced americano.' Same person. Anything else about coffee?" | 1 turn 더 (영어 살짝 유도) |
| 답 안 함 (알림 무시) | (그날은 그걸로 끝. Day 2 알림에서 더 부드럽게) | — |
| 답하고 바로 닫음 | "OK, see you tomorrow." | 다음날 |

### 끝맺음 (2-3 turn 후)

**파트너 (영어)**: "That's enough for today. See you tomorrow, same time."

**선물 (텍스트, 외울 필요 없음 명시)**: 오늘 학습자가 시도한 표현의 자연스러운 변형 1개. 길지 않게.

### 백그라운드 처리
- 일지 저장
- 어휘 추가
- `progress.json` 업데이트
- 내일 알림 메시지 미리 계산

### 분량
- 알림 1줄
- 대화 1-2 turn (총 1-2분)
- 마무리 1줄

---

## Day 2

### 알림

> **Morning. Yesterday: '[학습자의 Day 1 마지막 한 마디]'. Today: 'how's your morning so far?'**

(어제 한 말이 인용된다는 게 핵심 신호 — "이 사람은 나를 기억하고 있다")

### 첫 인터랙션
**파트너 (영어)**: "Hi again. How's your morning so far?"

### 분기
- 답: "Tired" / "Good" / "Busy" 등 한 단어
  - **파트너**: "Tired morning. What's something you'd want right now?"
- 답: 한국어 ("피곤해요")
  - **파트너**: "In English: 'I'm tired.' Quick: what would help?" (영어 살짝 유도, 강요 X)
- 답 안 함: Day 3 알림에서 더 부드럽게

### Day 2 특별 안내 (한 번)

음성 출력 옵션 등장:
> **파트너 (텍스트)**: "Hey, want me to talk back in voice too? You can turn it off anytime."

학습자가 yes → TTS 켜짐. no → 텍스트만 유지.

### 분량
- Day 1과 동일. 1-2분.

---

## Day 3

### 알림

> **Morning. Quick one: 'what's one thing you're doing today?'**

### 의도
첫 활동 다양화 시작. 어제 토픽(아침)에서 오늘 활동(일)로 자연스럽게 넓힘.

### 첫 인터랙션
**파트너**: "Morning. What's one thing on your plate today?"

### 분기
- 답: "Meeting" / "Workout" 등 명사 한 단어
  - **파트너**: "A meeting. Got a feeling about it?"
- 답: "회의" (한국어)
  - **파트너**: "A meeting. In English: 'I have a meeting.' Got a feeling about it?"
- 답: 한 문장 영어
  - **파트너**: 그 문장의 한 부분 follow-up

### 분량
- 1-2 turn (1-2분)

---

## Day 4

### 알림

> **Morning. How was yesterday?**

### 의도
**과거 시제 자연 등장**. 학습자가 어떻게 과거를 표현하는지 관찰. 모델은 인라인 교정 X.

### 분기
- 답: "Good" / "Tired" 등 형용사
  - **파트너**: "Good day. What made it good?"
- 답: "I went to gym" (시제 살짝 어긋남)
  - **파트너**: "Nice, the gym. How long?" (오류 메모만, 안 지적)
- 답: 길게 영어
  - **파트너**: "Got it. Highlight?"

### 백그라운드
오류가 있으면 `_internal/session_errors.md`에 기록만. mirror 때까지 안 보여줌.

### 분량
- 1-3 turn (2-3분, 학습자가 신난 날은 살짝 길어져도 OK)

---

## Day 5

### 알림

> **Morning. Tell me one word for today's mood.**

### 의도
**어휘 확장 시작**. 감정 단어 한 개. 학습자가 답하면 한 줄 사용 예 들려줌.

### 분기
- 답: "Tired"
  - **파트너**: "Tired. Try: 'I'm running on fumes.' (외울 필요 없어요, just heard it.)"
- 답: "Excited"
  - **파트너**: "Excited. Try: 'I'm pumped.' Same vibe, different word."
- 답: 한국어 ("피곤")
  - **파트너**: "Tired in English. 'I'm tired' is the base. 'I'm wiped' is heavier. Pick one for today."

### 분량
- 1-2 turn (2-3분)

---

## Day 6 (Saturday)

### 알림

> **Good morning. Weekend. What's your plan?**

### 의도
**미래 시제 자연 등장**. 동시에 주말 톤 — 약간 더 캐주얼, 학습자가 시간 있는 날.

### 분기
- 답: "Nothing"
  - **파트너**: "A nothing day. Sometimes the best kind. Anything you want to skip-do?"
- 답: 계획 한 줄
  - **파트너**: "Sounds good. What time?"
- 답: 한국어
  - **파트너**: 영어로 살짝 옮겨주고 한 줄 더

### 분량 약간 늘기 시작
- 2-3 turn (3-4분)
- 학습자가 길게 답하면 더 길어져도 OK (자연스러움 우선)

---

## Day 7 (Sunday) — 첫 mini-mirror

### 알림

> **Sunday. Want a quick 30-second look back?**

### 분기

**학습자 yes** → mini-mirror 진행

**학습자 no / no response** → 평소처럼:
- **파트너**: "OK. Just one word — how do you feel about this week?"
- 한 단어 답 받고 "See you tomorrow."

### mini-mirror (yes 시)

**파트너 (한국어 + 영어 섞임)**:

> "이번 주 같이 한 거 30초로 정리할게요.
>
> - 5일 만났어요 (Day 2랑 Day 4 빠지셨어요)
> - 가장 길게 말한 날: 금요일 (about 18 words)
> - 자주 시도한 표현: 'I like X' (4번), 'I have X' (3번)
> - 가장 자주 나온 단어: 'coffee', 'meeting', 'tired'
>
> 한 가지만 — 'coffee'가 매일 등장했어요. 다음 주에 그쪽 어휘 좀 더 늘려볼까요? 끄덕여도 되고, 다른 방향으로 가자고 해도 돼요."

### 분기 (mirror 후)
- 끄덕임 ("좋아요"): 다음 주 운영 노트에 "coffee 어휘 확장" 메모
- 다른 방향 ("일 영어로"): 다음 주 운영 노트 갱신
- "잘 모르겠어요": "괜찮아요. 그냥 계속 가요."

### 끝맺음
**파트너 (영어)**: "Good week. Same time tomorrow."

### 백그라운드
- `mirrors/2026-06-02-week-1.md` 생성
- 다음 주 운영 노트 업데이트
- Day 8부터 분량 살짝 늘리는 신호 켜기

### 분량
- mini-mirror 5분 (학습자 동의 시)
- 동의 안 하면 1-2분으로 종료

---

## 학습자가 빠뜨릴 때 — 죄책감 0의 알림

학원과 전화영어가 망하는 핵심 지점. 우리는 다음 패턴:

| 빠짐 | 다음날 알림 |
|---|---|
| 1일 빠짐 | 평소와 동일 |
| 2일 연속 빠짐 | "Hey. I'm still here. One word — how have you been?" |
| 3일 연속 빠짐 | "Hey, no rush. Whenever you come back. Same time tomorrow." |
| 5일 연속 빠짐 | "I'm here next Monday. You can come earlier whenever." |
| 7일 연속 빠짐 | 알림 빈도 주 1회로 자동 축소. "I'm here on Mondays now. Just tap whenever." |
| 30일 연속 빠짐 | 알림 정지. 학습자가 명시적으로 다시 활성화 |

**절대 안 쓰는 표현**:
- "어제 안 오셨네요"
- "약속 지키셔야죠"
- "이번 주 X일밖에 못 했어요"
- "이대로 가면 안 됩니다"

**핵심 메시지**: "여전히 여기 있어요. 화 안 내요." 학원과의 가장 큰 차이.

---

## 알림 언어 정책 (D87, 2026-05-26 Round 4)

Day 1~3의 알림이 영어 일변도면 학습자 부담 증가. 다음 정책 적용:

| 날 | 알림 언어 | 예시 |
|---|---|---|
| Day 1 | 한국어 디폴트 | "안녕 [이름]님. 어제 한 마디 이어가볼까요? 5분이면 돼요." |
| Day 2 | 한국어 + 영어 한 단어 | "굿모닝. 어제 'coffee' 얘기 — 오늘은 어땠어요?" |
| Day 3 | 한국어 + 영어 짧은 문구 | "좋은 아침. Yesterday: 'I like coffee.' 오늘 한 단어?" |
| Day 4+ | 영어 디폴트 (학습자 단계 +1) | "Yesterday: 'I like coffee.' What kind?" |

학습자 anxiety_level이 high면 Day 7까지 한국어 디폴트 연장 (D49 타입별 톤 매트릭스).

## 분량 점진 증가 곡선

| Day | 알림 | 대화 turn | 총 시간 |
|---|---|---|---|
| 0 | (onboarding) | (5 phase) | 5분 |
| 1 | 1줄 | 1-2 | 1-2분 |
| 2 | 1줄 | 1-2 | 1-2분 |
| 3 | 1줄 | 1-2 | 2분 |
| 4 | 1줄 | 1-3 | 2-3분 |
| 5 | 1줄 | 1-2 | 2-3분 |
| 6 | 1줄 (캐주얼) | 2-3 | 3-4분 |
| 7 | mini-mirror | 5-8 (동의 시) | 3-5분 |

**Day 8 이후**: 슬쩍 분량을 늘리되, 학습자가 의식 못 하게. Week 2 끝까지 평균 5-7분이 목표.

---

## 첫 7일 끝에 학습자가 갖고 있는 것

- 7일치 일지 (학습자가 디스크에서 열 수 있음)
- 사용한 표현 20-30개 누적
- 다양한 시간대 (현재/과거/미래) 한 번씩 시도
- 첫 주간 mini-mirror
- 감정 단어 1-2개 새로 시도
- "내일 또 와야지" 또는 "안 가도 OK"의 자유
- 본인 베이스라인 (Day 0 녹음) 가만히 보관 — 23일 뒤 비교용

---

## 모델이 첫 7일 동안 백그라운드에서 학습하는 것

학습자는 모르지만 모델은 매일 더 정밀해진다:

- 학습자 톤 (망설임형 / 적극형 / 짧게 답형)
- 자주 등장하는 토픽 (coffee, meeting, work...)
- 시제별 정확도
- 한국어 섞임 비율 변화
- 영어 발화 길이 추이
- 발화 시간대 패턴 (8시 정확히 vs 8:15~8:30 분산형)
- 답이 안 오는 요일 패턴 (목요일이 항상 빠지면 학습자에게 안 물어보고 운영 메모)

이 모두는 Day 30 mirror의 재료가 되거나, 학습자에게 안 보여주고 톤 조정에만 쓰임.

---

## 다음 — Week 2 이후 설계

Week 2부터는 분량이 늘고 학습자가 토픽 선택권을 더 갖기 시작한다. 이건 별도 문서 (필요 시).
