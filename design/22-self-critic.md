# Design Self-Critic — 자체 모순 / 갭 / 검증 안 된 가정

23개 design 문서를 비판적 시각으로 재검토. 당시 "Design 단계 종료" 선언이 구현 진입 기준으로 충분한지 확인한 자체 audit.

작성일: 2026-05-26

---

## 0. 갭 카운트 (D98 정정, 2026-05-26)

본문의 실제 갭 = **총 25개** (A4 + B5 + C6 + D3 + E7). 초기 작성 시 "23개"라고 잘못 기록한 부분은 25개로 수정.

## 0. Audit 범위

5 카테고리로 분류:
- **A. 명백한 충돌 / 모순** — 두 문서가 같은 항목에 대해 다르게 명시
- **B. 검증 안 된 기술 가정** — Codex가 실제로 지원하는지 확인 안 한 것
- **C. 모호한 알고리즘 / 세부 사항** — 구현자가 헷갈릴 부분
- **D. 매니페스토 vs 디테일 미세 충돌** — 원칙 vs 결정의 결
- **E. 누락된 결정** — 발견 안 된 갭

---

## A. 명백한 충돌 / 모순 (4개)

### A1. progress.json 스키마 충돌
- `07-background-data.md`의 v1 스키마 vs `17-measurement.md`의 v2 스키마가 분리됨
- 두 곳을 합치는 명시 없음. 구현자가 어느 것을 쓸지 모호
- **해결 필요**: 07을 v2로 갱신하거나, 17에서 "07 대체"로 명시

### A2. content_queue.json ↔ patterns.json 의 `favorite_topics` 중복
- `19-content-sourcing.md`의 content_queue 스키마에 `favorite_topics`
- `07-background-data.md`의 patterns.json에도 `favorite_topics`
- Source of truth가 어디? 동기화 어떻게?
- **해결 필요**: 한 곳을 source로 명시. 다른 곳은 derived

### A3. D03 vs D04 첫 실행 순서 모호
- D03: SessionStart hook이 `~/english-learning/` 자동 생성
- D04: `profile.md` 없으면 자동 onboarding 진입
- 첫 실행 시 어느 게 먼저? Hook이 디렉터리 생성 → profile 없음 감지 → onboarding 진입의 흐름인지 명시 X
- **해결 필요**: 시퀀스 다이어그램 한 줄

### A4. 베이스라인 실패 처리 (D17) vs Pre-production 보호 (D54)
- D17: Day 1~3 권유 + Day 4 input-only 모드. 한 달 뒤 재시도
- D54: Pre-production 학습자는 한 달 input-only 후 자연 emerge 기다림
- 두 결정이 같은 행동을 다르게 표현. 통합 명시 필요
- **해결 필요**: D54가 D17의 확장임을 명시 (또는 D17 폐기 후 D54 단독)

---

## B. 검증 안 된 기술 가정 (5개)

### B1. PreCompact hook의 존재
- D32: PreCompact hook이 학습자 식별자 + 약점 + baseline을 재주입
- 06-voice-ux의 spike에서 PreCompact는 직접 확인 안 됨. 10-harness-patterns.md는 9개 lifecycle event 중 PreCompact를 언급하지만 사용 가능성 미확인
- **해결 필요**: spike Phase 0에서 PreCompact 작동 확인 → 안 되면 D32 우회 설계

### B2. Codex Goal mode가 영어 학습에 작동
- D27, D26: Week 3에 Codex Goal mode 자동 활성화
- Goal mode는 코딩 에이전트가 며칠/주 단위 자율 작업하는 기능. 영어 학습 토픽 호환성 미검증
- **해결 필요**: Phase 0에서 "Goal mode가 비-코딩 도메인에서 어떻게 보이는지" 확인. 어색하면 자체 메커니즘 대체

### B3. Voice 토큰 실시간 추적 가능성
- D22, D35: `voice_seconds_today` 추적해서 30/60분 임계치 가드
- Codex realtime API가 사용량 신호를 도구에 주는지 미확인. 우리가 자체 측정해야 한다면 부정확할 가능성
- **해결 필요**: spike Phase 0에서 Codex realtime 사용량 노출 여부 확인

### B4. Codex 데스크탑 앱에서 macOS `say` 명령 hook 사용
- 06-voice-ux: 데스크탑 앱 TTS 폴백으로 PostTaskComplete hook → `say` 명령
- Codex 데스크탑 앱 hook 권한이 임의 shell 명령 실행을 허용하는지 미확인 (보안 정책 영향 가능)
- **해결 필요**: spike에서 hook → `say` 명령 작동 확인

### B5. 모델 응답 latency (실시간 대화 자연스러움)
- 실시간 대화 모드에서 학습자 발화 후 모델 응답까지 얼마? <1초가 자연스러움
- Codex realtime의 실제 latency 미측정
- **해결 필요**: spike에서 latency 측정. 2초+이면 conversational mode UX 재설계

---

## C. 모호한 알고리즘 / 세부 사항 (6개)

### C1. 단계 추정 알고리즘 정밀화
- D51: 7개 신호 (MLU, TTR, 시제 다양성 등) → 단계 추정
- 가중치 / threshold 미정. "단어 수 5~15 = Early Production" 같은 분기점만 있음
- 신호들이 충돌하면? (예: MLU는 Early지만 시제 다양성은 Intermediate)
- **해결 필요**: 우선순위 가중치 명시 또는 보수적 분류 규칙

### C2. 약점 SM-2 알고리즘 영역별 차이
- D13: Anki SM-2 (어휘 + 패턴 + 발음 모두 적용)
- 어휘 망각 곡선과 패턴/발음 망각 곡선이 같은 모양일지 검증 X
- **해결 필요**: 영역별 ease factor 분리 또는 단일 알고리즘 명시

### C3. 알림 텍스트와 민감 정보 충돌
- D09: 알림 텍스트 = 어제 마지막 한 마디 슬롯
- Edge case 13: 학습자가 민감 정보 (비밀번호, 의료) 발화 가능
- 알림 텍스트 슬롯에 민감 정보가 들어가면? 잠금 화면 노출 위험
- **해결 필요**: 알림 텍스트 생성 시 민감 정보 필터 또는 안전 토픽 fallback

### C4. AGENTS.md 정밀 명세 부재
- D33, D49, D77이 모두 "AGENTS.md에 명시"라고 함
- 그러나 AGENTS.md의 실제 구조 / 섹션 / 길이 미정의
- 구현 Phase 1에서 즉시 막힘
- **해결 필요**: AGENTS.md 템플릿/스켈레톤 별도 문서 또는 21-integration 보강

### C5. Onboarding에서 typology 추정 정밀도 (D47)
- 5분 가벼운 대화로 7개 축 모두 추정?
- 너무 짧으면 부정확 → 첫 7일 동안 점진 갱신 필요
- 명시 X
- **해결 필요**: Day 0 = 초기 추정, Day 1~7 = 갱신 패턴 명시

### C6. Ought-to → Ideal 전환 메커니즘 (페르소나 D)
- 13, 18: 재훈 같은 Ought-to 학습자를 Ideal로 전환 유도
- "전환을 어떻게 일으키는지" 메커니즘 모호. 구체 인터벤션 없음
- **해결 필요**: Week 2-3에서 "내가 원하는 거 뭐예요?" 인터뷰 패턴 구체화

---

## D. 매니페스토 vs 디테일 미세 충돌 (3개)

### D-conflict-1. Streak 표시 정책 (D70)
- 매니페스토 안티: streak 외재 동기 금지
- D70: 일수 표시는 OK ("30일 같이 했어요"), 죄책감 트리거만 X
- "30일 같이 했어요" 자체가 streak 신호로 작용할 수 있음. 학습자가 "끊으면 안 되겠다" 느끼면 외재 동기
- **해결 필요**: 일수 표시 톤 더 명확히. 단순 사실 vs 자랑 vs 압박의 결 차이

### D-conflict-2. "외울 필요 없어요" + Phase 5 선물 (변형 문장)
- 05-onboarding-script Phase 5: 자연스러운 변형 1개 제시 + "외울 필요 없어요"
- 그러나 변형 제시 자체가 학습자에게 "이게 더 맞는 표현" 평가 신호
- 매니페스토 "AI는 거울이지 평가 X"와 미세 충돌
- **해결 필요**: 변형 제시 톤을 "더 좋은" 표현 X, "이렇게도 들려요" O로 명시

### D-conflict-3. Mirror에서 "발견" vs "평가"의 결
- 17-measurement, 18-motivation: mirror에서 "이번 주 자주 시도한 표현 3개"
- 학습자가 이 정보를 "내 평가 결과"로 해석할 가능성
- **해결 필요**: mirror 톤 강한 가이드라인 — 발견 ≠ 평가의 구체 차이

---

## E. 누락된 결정 (7개)

### E1. 백업 / 디스크 풀 정책
- 학습자 디스크가 가득 차면? 1년 ~30MB로 작긴 하지만 음성 파일이 점점 쌓이면 부담
- 자동 정리 정책 없음
- **결정 필요**: 베이스라인은 영구, 마일스톤만 보관 (이미 D12). 일상 세션 오디오는 7일 보관?

### E2. Plugin 설치/배포 경로 검증
- D02: GitHub 레포만 (Phase 0)
- 그러나 비개발자가 복사해서 실행할 1줄 설치/배포 경로는 아직 검증 전
- 16-tools, 19-content-sourcing의 설치 언급은 Phase 0에서 현재 Codex CLI 기준으로 재확인 필요
- **결정 필요**: 검증된 설치 경로를 README에 한 줄로 확정

### E3. 모바일 진입 시 거절 / 안내 패턴
- D24: macOS 우선 + CLI Linux/Windows. 모바일은 v2
- 학습자가 ChatGPT 모바일에서 우리 plugin 발견했을 때 어떤 안내?
- **결정 필요**: 모바일 진입 시 거절 메시지 패턴

### E4. AGENTS.md priority와 매니페스토 6신념의 관계
- D33: priority "안전 > 흐름 > 인정 > 간결 > 다음 약속"
- 매니페스토는 6개 신념. 이게 priority보다 위? 아래? 같이?
- **결정 필요**: AGENTS.md 명시 — 매니페스토가 최상위, priority는 행동 결정 시 적용

### E5. 학습자가 자기 단계 추정 결과를 알고 싶다고 할 때
- D51: 단계 백그라운드 추정, 학습자에게 라벨 X
- 학습자가 명시 요청 ("내 단계 알려주세요") = Edge case 6 "내 레벨 알려주세요"
- 처리는 D77 (정직 거절)인데 그러면 raw 데이터도 안 보여줌?
- **결정 필요**: 라벨 거절은 유지하되, raw 신호 (단어 수 등)는 보여줄지

### E6. 페르소나 D 재훈 — 우아한 거절 메커니즘
- 13: "우리 적합 아닐 수 있음"
- 그러나 학습자가 그래도 시작하면 어떻게? 시작 → 끊김의 시나리오가 더 흔할 가능성
- 우리 retention 낮은 cohort 인정 필요
- **결정 필요**: 적합도 self-screen 강화. onboarding에서 정직 안내 후 "그래도 진행" 옵션의 결과 책임 명시

### E7. 알림 시간이 학습자 캘린더와 충돌
- D07: Codex Automations로 매일 알림
- 학습자가 휴가/주말/회의 중일 때 알림은 어떻게?
- **결정 필요**: 알림 응답률 추적 (이미 D63) + 자동 시간 조정 (학습자가 자주 응답하는 시간으로 슬쩍 이동)

---

## 1. 우선순위

| 우선 | 카테고리 | ID 목록 | 영향 |
|---|---|---|---|
| 🔴 가장 시급 | B 검증 안 된 가정 | B1~B5 (특히 B1 PreCompact, B2 Goal mode) | 검증 안 되면 D32, D27 무너짐. spike Phase 0 필수 |
| 🟠 구현 직전 | A 충돌, C 알고리즘 | A1~A4, C1~C6 | 구현 막힘 |
| 🟡 중요 | E 누락 결정 | E1~E7 | 학습자 경험 갭 |
| 🟢 톤 미세 조정 | D 매니페스토 결 | D-conflict-1~3 | AGENTS.md 작성 시 |

---

## 2. 해결 방식 제안

**Phase A (가장 시급)**: B 영역 = Phase 0 spike에서 일괄 검증. 결과에 따라 D32, D27, D22, 음성 정책 수정

**Phase B (구현 직전)**:
- A1: 07-background-data.md를 v2로 갱신, 17-measurement.md에서 참조
- A2: content_queue가 source, patterns의 favorite_topics는 derived
- A3: 21-integration 또는 07 보강 — 첫 실행 시퀀스 명시
- A4: D17과 D54 통합, 09-decisions에 합산
- C1-C6: 각 문서에 알고리즘 보강 (특히 C4 AGENTS.md 템플릿 별도 문서로)

**Phase C (중요)**: E1~E7을 09-decisions에 D81~D87로 추가

**Phase D (톤)**: AGENTS.md 작성 시 D-conflict-1~3 가이드라인 명시

---

## 3. design 단계 진짜 종료 조건

20번까지 + 21 통합 후 "종료 선언" 했지만, 이 audit이 보여주듯 **23개 갭이 남아있음**.

**진짜 종료 = audit 23개 갭 모두 닫음**.

우선순위 순서:
1. **Phase 0 spike 결과 받기** (B 영역 5개) — 구현 시작 후 첫 주에 자연스럽게
2. **A 영역 4개 충돌 닫기** (1시간 작업)
3. **E 영역 7개 누락 결정 추가** (D81~D87)
4. **C 영역 6개 알고리즘 보강** (AGENTS.md 템플릿 작성과 같이)
5. **D 영역 3개 톤 조정** (AGENTS.md 작성 시)

이 5단계 닫으면 진짜 implementation-ready.

---

## 4. 비판적 결론

23개 문서가 풍부하지만 **완벽하지 않음**. 정직하게 — 우리는:
- ✅ 깊은 이론 토대 (B/I/A/E/G)
- ✅ 명확한 좁아진 목표 (회화 자신감)
- ✅ 80개 결정 인덱스
- ⚠️ 검증 안 된 기술 가정 5개 (Phase 0 spike 필수)
- ⚠️ 자체 충돌 4개
- ⚠️ 모호한 디테일 6개
- ⚠️ 누락 결정 7개
- ⚠️ 매니페스토 미세 충돌 3개

**진정한 implementation-ready = 위 23개 갭 닫음 + Phase 0 spike 통과**.

"Design 단계 종료" 선언은 너무 일렀음. 이 audit이 진짜 종료의 잣대.

---

## ✅ Round 5 닫음 (2026-05-26)

25개 갭 모두 닫음. 결정 ID 매핑:

| 영역 | 갭 | 결정 ID |
|---|---|---|
| A1 progress.json 충돌 | D100 |
| A2 favorite_topics 중복 | D101 |
| A3 첫 실행 순서 | D102 |
| A4 D17 vs D54 | D103 |
| B1-B5 기술 가정 | D104-D108 (Phase 0 spike) |
| C1 단계 추정 가중치 | D109 |
| C2 망각 곡선 영역별 | D110 |
| C3 알림 민감 정보 | D111 |
| C4 AGENTS.md 템플릿 | D112 |
| C5 typology 갱신 | D113 |
| C6 Ought-to 전환 | D114 |
| D-c1 Streak 톤 | D115 |
| D-c2 선물 변형 톤 | D116 |
| D-c3 Mirror 발견 vs 평가 | D117 |
| E1 디스크 풀 | D118 |
| E2 설치 명령 | D119 |
| E3 모바일 거절 | D120 |
| E4 priority↔매니페스토 | D121 |
| E5 단계 라벨 요청 | D122 |
| E6 페르소나 D 거절 | D123 |
| E7 알림 시간 조정 | D124 |

B 영역 5개 (D104-D108)는 Phase 0 spike에서 실제 검증 필요. 다른 20개는 design 확정.

## 5. 다음 행동 옵션 (이제 deprecated — 위 ✅로 닫힘)

사용자 선택:
- **A. 모든 갭 일괄 닫기** — 가장 시급한 A 영역 4개 + E 영역 7개 결정 즉시. C 영역은 AGENTS.md 작성과 묶음
- **B. Phase 0 spike 먼저** — B 영역 5개 기술 가정을 실제 Codex에서 확인. 결과에 따라 design 일부 수정
- **C. 우선순위만 닫고 구현 시작** — A 영역만 닫고 나머지는 구현 중 발견되면 처리
- **D. 외부 critic 에이전트에 위임** — 이 self-critic이 충분히 비판적인지 두 번째 의견
