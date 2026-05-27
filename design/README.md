# Design

영어 학습 하네스의 제품 설계 문서. 코드를 작성하기 전 단계의 결정들이 여기 산다.

## 읽는 순서

### 큰 그림 (왜/무엇을)
1. **[00-manifesto.md](./00-manifesto.md)** — 행동 원칙 6개. 모든 결정의 토대
2. **[01-vision.md](./01-vision.md)** — 북극성, 5가지 전환, 1년 여정, 2년 후 자산
3. **[02-target.md](./02-target.md)** — 영어 환경 없는 학습자가 누구인지

### 흐름 (어떻게)
4. **[03-learning-loop.md](./03-learning-loop.md)** — 일/주/월 매크로 + 한 세션의 5단계 마이크로
5. **[04-onboarding.md](./04-onboarding.md)** — 첫 5분 + 24시간 + 7일 큰 그림

### 정밀 설계 (얼마나 구체적으로)
6. **[05-onboarding-script.md](./05-onboarding-script.md)** — Phase별 분초 발화, 분기 처리, 페르소나 시드
7. **[06-voice-ux.md](./06-voice-ux.md)** — 부담 0의 음성 입력/출력 UX
8. **[07-background-data.md](./07-background-data.md)** — 학습자 디스크 구조, 데이터 스키마, hook 처리
9. **[08-first-7-days.md](./08-first-7-days.md)** — Day 1~7 일자별 인터랙션 패턴

### 결정 (구현용 single source of truth)
10. **[09-decisions.md](./09-decisions.md)** — 충돌 해소 + implementation 결정 35개
11. **[10-harness-patterns.md](./10-harness-patterns.md)** — 2026 베스트 매핑 (AGENTS.md / Skills 5 패턴 / Hooks / Compaction 안전판)

### 깊이 추가 (B → I → A → E → D → C → F → G → H → J 순)
12. **[11-acquisition-theory.md](./11-acquisition-theory.md)** — 회화 숙련 메커니즘 (Krashen, Swain, Long, DeKeyser, Big Four) + 우리 design에의 7가지 함의 [B]
13. **[12-korean-speaker.md](./12-korean-speaker.md)** — 한국 화자 특수성 (음운/L1 transfer/WTC·Anxiety/Konglish trap) + 5가지 함의 [I]
14. **[13-learner-typology.md](./13-learner-typology.md)** — 7개 분류 축 + 페르소나 5명 (지은/민호/수진/재훈/혜원) + 타입별 톤·속도 매트릭스 [A]
15. **[14-stage-theory.md](./14-stage-theory.md)** — SLA 5단계 + 백그라운드 단계 추정 + 페르소나 5명 단계 매핑 + 활동 매트릭스 토대 [E]
16. **[15-activities.md](./15-activities.md)** — 14가지 활동 카탈로그 + 단계×활동 매트릭스 + 페르소나 매핑 + 자동 제안 로직 + Week 1~5 로드맵 [D]
17. **[16-tools.md](./16-tools.md)** — 6개 도구 카테고리 + 활동×도구 매핑 + MVP 안/옵션/밖 분류 + MCP 통합 [C]
18. **[17-measurement.md](./17-measurement.md)** — MVP 매 세션 5개 지표 + Month 1+ optional 지표 + mirror 디자인 + 진보 정체 처리 3단계 [F]
19. **[18-motivation.md](./18-motivation.md)** — SDT × Atomic Habits × Flow × L2MSS × WTC 통합 + 페르소나별 동기 전략 + Dropout zone 대응 [G]
20. **[19-content-sourcing.md](./19-content-sourcing.md)** — 5 소싱 카테고리 + 콘텐츠 큐 + 한국 환경 영어 4 시리즈 + 저작권 안전 정책 [H]
21. **[20-edge-cases.md](./20-edge-cases.md)** — 18개 edge case 응답 패턴 + 5 메타 원칙 + 페르소나 빈도 매핑 + Silent fallback [J]
22. **[21-integration.md](./21-integration.md)** — 통합 capstone: 1년 마스터 타임라인 + 페르소나 5명 1년 시뮬레이션 + 전체 80개 결정 인덱스 + 구현 진입 체크리스트
23. **[22-self-critic.md](./22-self-critic.md)** — 자체 audit: 25개 갭 (충돌 4 / 검증 안 된 가정 5 / 모호 6 / 매니페스토 미세 3 / 누락 7) + 우선순위
24. **[23-critic-report.md](./23-critic-report.md)** — 외부 critic 보고서: CRITICAL 2 / MAJOR 4 / MINOR 5 / Missing 6 + 결정 매핑 + 진행 상태

## 진행 상태

- [x] 매니페스토 확정
- [x] 비전/북극성 확정
- [x] 타겟 페르소나 확정
- [x] 학습 루프 구조 확정
- [x] Onboarding 큰 그림 확정
- [x] Onboarding 분초별 정밀 스크립트
- [x] 음성 UX 디자인
- [x] 백그라운드 데이터 구조 명세
- [x] 첫 7일 일자별 패턴
- [x] 회색지대 spike — Realtime auth / TTS playback / logprobs (`06-voice-ux.md` 하단)
- [x] 음성 한도 정책 확정 — voice 1차 + 가벼운 안전망 (`06-voice-ux.md` 하단)
- [x] **Implementation 결정 35개 + 충돌 1개 닫음 (`09-decisions.md`)**
- [x] **2026 하네스 베스트 매핑 (`10-harness-patterns.md`)**
- [x] **B 언어 습득 이론 깊이 (`11-acquisition-theory.md`)** — 7가지 함의 도출
- [x] **I 한국 화자 특수성 (`12-korean-speaker.md`)** — WTC + Konglish + Intelligibility 기준
- [x] **A 학습자 타입학 (`13-learner-typology.md`)** — 7개 축 + 페르소나 5명 + 타입별 톤 매트릭스
- [x] **E SLA 단계 이론 (`14-stage-theory.md`)** — 5단계 + 백그라운드 추정 + 페르소나 단계 매핑
- [x] **D 학습 활동 다양화 (`15-activities.md`)** — 14개 활동 + 단계×활동 + 페르소나 매핑 + Week 로드맵
- [x] **C 도구 카탈로그 (`16-tools.md`)** — 6 카테고리 + 활동×도구 + MVP 안/옵션/밖
- [x] **F 측정 (`17-measurement.md`)** — Self-referenced 5 카테고리 13 지표 + 진보 정체 3단계 처리
- [x] **G 동기 유지 (`18-motivation.md`)** — 5 이론 통합 + 페르소나별 전략 + Dropout zone 4시점
- [x] **H 콘텐츠 소싱 (`19-content-sourcing.md`)** — 5 카테고리 + 콘텐츠 큐 + 한국 4 시리즈 + 저작권 안전
- [x] **J 부정 시나리오 (`20-edge-cases.md`)** — 18개 응답 패턴 + 5 메타 원칙 + Silent fallback
- [x] **통합 커리큘럼 (`21-integration.md`)** — 1년 타임라인 + 페르소나 5명 1년 시뮬레이션 + D01~D80 인덱스 + 구현 체크리스트

## 🟠 Design 단계 — 라운드 1~5 완료 (2026-05-26)

10개 영역 + 통합 + self-audit + 외부 critic 완료.

**누적된 갭**:
- self-critic 25개 (충돌 4 / 기술 가정 5 / 알고리즘 6 / 매니페스토 미세 3 / 누락 7)
- critic 추가: CRITICAL 2 / MAJOR 4 / MINOR 5 / Missing 6 + 모호 위험 2

**닫은 결정 (Round 2, 2026-05-26)**:
- ✅ **D81 — 플랫폼-타겟 Phase 분리** (Phase 0 개발자 + Phase 1 일반인)
- ✅ **D82 — 좁아진 목표 추가 좁힘** (AI 파트너와 편안한 영어 대화. 대인 전이는 부수)

**닫은 결정 (Round 3, 2026-05-26)**:
- ✅ **D83 — MVP 지표 5개로 축소** (M1)
- ✅ **D84 — 페르소나 D 재훈 비-타겟 인접 재분류** (M2)
- ✅ **D85 — Recast 허용** (M3)
- ✅ **D86 — 01-vision scope 정합** (M4)

**닫은 결정 (Round 4, 2026-05-26)**:
- ✅ **D87-D99** — MINOR 5 + Missing 6 + 모호 2 (한국어 알림 / Leitner 명명 / Discovery / 오프라인 / 단계 배정 / 비용 / Sol single source / Week 2-52 / i+1 차원 / 활동 인터페이스 / typology 중복 / 카운트 / 시뮬레이션 범위)

**닫은 결정 (Round 5, 2026-05-26)**:
- ✅ **D100-D124** — self-critic 25개 모두 닫음
  - A 충돌 4개 (D100-D103)
  - B 기술 가정 5개 (D104-D108) → Phase 0 spike에서 실제 검증
  - C 알고리즘 6개 (D109-D114)
  - D 매니페스토 결 3개 (D115-D117)
  - E 누락 7개 (D118-D124)

## 🟡 Design 결정 레지스트리 완료 (2026-05-26)

**총 124개 결정 + 충돌 1개 해소**. critic 두 번째 의견 통과. self-critic 25개는 결정 레벨에서 닫힘.

**남은 것**: Phase 0 spike에서 B 영역 5개 (D104-D108) 기술 가정 실제 검증. spike 결과에 따라 D32/D27/D22 미세 수정 가능성. 또한 D82-D124가 반영된 문서 동기화가 끝나야 구현자가 충돌 없이 읽을 수 있다.

**진짜 implementation-ready** = 결정 레지스트리 반영 + Phase 0 spike 통과 + 아래 구현 준비 항목 완료.
- [ ] 결정 반영: 04/05/07/08/02 일괄 수정 (구현 1단계 직전)
- [ ] AGENTS.md 페르소나 시드 작성 (구현 1단계)
- [ ] 스킬 명세 (profile_intake, daily_session, mini_mirror, weekly_mirror)
- [ ] Hook 스크립트 (SessionStart, Stop, weekly cron)
- [ ] progress.json 스키마 검증 도구
- [ ] Plugin 패키지 manifest
- [ ] Week 2~4 인터랙션 패턴 (Day 7 이후)

## 좁아진 북극성 (모든 결정의 잣대)

> **"AI 파트너와 편안하게 영어로 대화하는 능력."**

시험 / 학술 / 비즈니스 문서 / 완벽한 문법 / Native 발음은 모두 우리 범위 밖. 실제 외국인 앞 자신감은 부수 효과로 가능하지만 보장하지 않는다. 모든 design 결정은 "이게 AI 파트너와의 영어 대화 능력을 더하는가?" 로 검증한다 (`02-target.md`).

## 참고 문서 (이 폴더 밖)

- `../REPORT.md` — 원본 리서치 (Codex 하네스 기반 영어 학습 가능성)
- `../CLAUDE.md` — 코딩 행동 가이드 (구현 단계용)

## 디자인 결정 추적

큰 결정은 가장 가까운 문서 안에 "왜 이 모양인지" 섹션으로 남긴다. 별도 ADR 폴더는 두지 않는다 (오버킬). 결정이 뒤집히면 해당 문서를 수정하고 변경 이유를 한 줄 남긴다.
