# 결정 레지스트리

design 단계에서 implementation-ready를 위해 닫은 모든 결정을 한 곳에 모은다. 구현자는 이 문서 + `06-voice-ux.md` 하단의 음성 정책만 보면 모호함 없이 작업 가능해야 한다.

확정일: 2026-05-26

---

## 충돌 해소

### CR-01: Phase 4 "Mirror"의 정의 통일

기존 충돌: `03-learning-loop.md`는 매 세션 Phase 4를 mirror로 정의, `08-first-7-days.md`는 Day 7부터 첫 mirror.

**해소**:
- **Day 1~6의 Phase 4** = "오늘의 한 줄 선물" (자연스러운 변형 1개). 패턴 발견 없음
- **Day 7부터의 Phase 4** = mini-mirror (지난 7일 패턴 3가지)
- **Day 30부터의 Phase 4** = monthly mirror (baseline 비교 포함)

`03-learning-loop.md`의 Phase 4 섹션은 이 정의로 수정됨.

---

## 결정 (D01–D30)

### A. 배포 / 설치 / 첫 실행

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D01 | Plugin 패키징 형태 | Codex 공식 plugin 형식 (skills + hooks + automations + AGENTS.md 한 패키지) | Codex 1급 사양 따름 |
| D02 | 배포 채널 | **GitHub 레포만 (Phase 0)** | 사용자 결정. 마켓플레이스 등록은 v1 안정화 후 |
| D03 | 첫 실행 시 디렉터리 초기화 | SessionStart hook이 `~/english-learning/` 존재 체크 → 없으면 디폴트 구조 자동 생성 + onboarding 진입 | Codex hook의 stdout `additionalContext` 활용 |
| D04 | Onboarding 진입 트리거 | `~/english-learning/profile.md` 없으면 자동 onboarding 시작. 학습자는 `codex` 명령만 | 비개발자 친화성 |
| D05 | Codex 환경 요구사항 | Codex CLI v0.105.0+, ChatGPT Plus 이상 (voice용), 데스크탑 앱 macOS 우선 | spike 결과 |
| D06 | `experimentalApi` 플래그 | plugin 첫 실행 시 1회 안내 + 학습자 동의 후 `~/.codex/config.toml`에 자동 추가 | 실험 플래그 자동 처리 |

### B. 알림 / 자동화 / 시간

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D07 | 매일 알림 메커니즘 | Codex Automations (1급 기능). macOS notification 자동 | Codex 2026-04-16 changelog 기능 |
| D08 | 학습자 시간대 | 시스템 시간대 자동 감지 → `profile.md`에 저장. 명시 변경 가능 | 비개발자 친화성 |
| D09 | 알림 텍스트 생성 | 결정론적 템플릿 + 어제 마지막 한 마디 슬롯. 모델 호출 X | 안정성, 비용 절감 |
| D10 | Day 7 mirror 트리거 | Day 7 학습자 진입 시 SessionStart hook이 감지 + mirror 모드 켬. 못 오면 첫 진입일 트리거 | 학습자 부담 0 |

### C. 데이터 / 파일 디테일

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D11 | 오디오 포맷 | mp3 (호환성). Codex가 webm으로 떨구면 변환 | 학습자 디스크 호환 |
| D12 | 오디오 저장 정책 | **베이스라인 + 마일스톤(Day 0, 30, 90, 180, 365)만 보존.** 일상 세션은 전사 텍스트만 | 사용자 결정. 1년 용량 ~30MB |
| D13 | 약점 망각 곡선 | Anki SM-2 간단 버전. 첫 등장 후 +1/+3/+7/+14/+30일 토픽 재등장 | 검증된 SRS 알고리즘 |
| D14 | 어휘 CEFR 분류 | 외부 사전 X. 모델 즉석 분류 (새 어휘만, 응답 캐싱) | 빠른 구현, 정확도 충분 |
| D15 | 한국어 STT 지원 | OpenAI Whisper의 한국어 인식 활용. dictation은 영어 디폴트지만 한국어 발화도 수용 | Codex realtime + Whisper 기본 다국어 |

### D. 분기 / 인격 / 일관성

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D16 | 5가지 역할 모드 전환 | 자동 (컨텍스트로 추론). 학습자 명시 ("지금 글쓰기 리뷰 하고 싶어")도 가능 | AGENTS.md에 명시 |
| D17 | 베이스라인 실패 처리 | Day 1~3 부드러운 권유. Day 4 input-only 모드 전환. 한 달 뒤 재시도 | 매니페스토 "대화 흐름 우선" |
| D18 | 한/영 톤 전환 일반 규칙 | 메타 대화 = 한국어. 학습 발화 = 영어. **학습자 톤 미러링** (학습자 영어 → 영어, 한국어 → 한국어) | AGENTS.md에 명시 |
| D19 | 파트너 이름 변경 | `profile.md`의 `partner_name` 필드. mid-session에 자연어로 변경 가능 | 관계 락인 자연스럽게 |
| D20 | self-labeling 처리 | AGENTS.md 명시 — "'초급/영포자' 라벨은 받지 않고 한 박자 쉰 후 활동으로" | 매니페스토 "AI는 거울" |

### E. 사용자 변형

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D21 | ChatGPT 무료 사용자 | 텍스트 모드만 작동. onboarding 1회 안내: "음성은 Plus 필요해요. 텍스트로 시작 OK" | spike 결과 |
| D22 | Pro vs Plus 차이 | Pro = 안전망 임계치 60분/일, Plus = 30분/일. `profile.md`에 plan 저장 | 06-voice-ux 정책 |
| D23 | 다중 학습자 (가족) | MVP 밖. v2 도입 | 범위 축소 |
| D24 | OS 지원 범위 | **macOS 우선 + CLI는 Linux/Windows도 작동 (Phase 0).** 알림/Notification 자동화는 macOS 한정 | 사용자 결정 |
| D25 | 모바일 지원 | MVP 밖. v2에서 ChatGPT 모바일 안 Codex preview 활용 검토 | Codex 모바일은 task 제어 중심, 풀 에이전트 X |

### F. 기능 디테일

| ID | 항목 | 결정 | 근거 / 적용 |
|---|---|---|---|
| D26 | `baseline.md` "자연스러운 변형" 생성 | Phase 5에서 모델 1회 호출. 학습자 발화 한 단어면 변형 생략 + 마무리만 | 05-onboarding-script Phase 5 |
| D27 | Goal mode 호출 | Week 3 mini-mirror에서 학습자가 한 가지 목표 정하면 자동 Codex Goal mode 활성화 | Codex Goal mode (2026-05-21 GA) |
| D28 | `_internal/` 가시성 | 점(.) 안 붙임 → 보이지만 README.md에 "평소 안 보셔도 돼요" 명시 | 매니페스토 "데이터 소유" |
| D29 | 다음 알림 메시지 미리 계산 | Stop hook이 결정론적 템플릿 + 어제 마지막 한 마디 슬롯 → `profile.md`의 `next_notification_text`에 저장 | D09와 일관 |
| D30 | mid-session 모드 전환 (음성↔텍스트) | 마이크 토글 버튼 항상 보임. 즉시 전환. 모델 응답은 어떤 모드든 동일 | 06-voice-ux 안전망 |
| (D31) | mirror 생성 실패 폴백 | 7일 일지 < 3일이면 "데이터 적네요. 다음 주에 더 봐요." 한 줄, 파일 미생성 | 매니페스토 "죄책감 0" |
| D32 | Compaction 안전판 (3중) | (1) AGENTS.md에 매니페스토/모드 정의 박음 (2) 매 SessionStart에서 학습자 컨텍스트 재주입 (3) 긴 세션(>15분)에서 PreCompact hook이 학습자 식별자 + 최근 3개 약점 + 오늘 baseline 재주입 | 2026 베스트 — 자세한 패턴은 `10-harness-patterns.md` §5 |
| D33 | AGENTS.md priority 순서 명시 | "안전 > 흐름 > 인정 > 간결 > 다음 약속". 충돌 시 lower-numbered 우선 | ICLR 2026: priority 없으면 resolve rate 48.8% → 28% |
| D34 | 스킬 패턴 분류 명시 | `profile_intake` = Generator / `daily_session` = Pipeline / `mini_mirror` & `monthly_mirror` = Reviewer / `pronunciation_check` = Tool Wrapper | Agent Skills 5 패턴 표준 — 자세한 매핑은 `10-harness-patterns.md` §3 |
| D35 | PreToolUse voice 한도 policy-as-code | voice 도구 호출 직전 `voice_seconds_today` 체크. 임계치 넘으면 deny + 텍스트 폴백 메시지 | D22 + 2026 hook 베스트 |
| **D81** | **플랫폼-타겟 Phase 분리** (2026-05-26 critic C1) | Phase 0 = 개발자 얼리어답터 (Codex CLI, primary 페르소나 수진). Phase 1 = 일반인 채널 (Custom GPT / 웹앱 래퍼, primary 페르소나 지은). Phase 0 검증 후 Phase 1 | 02-target / 01-vision / 모든 페르소나 매핑 |
| **D82** | **좁아진 목표 추가 좁힘** (2026-05-26 critic C2) | "외국인과 대화" → "AI 파트너와 편안하게 영어 대화". 대인 자신감 전이는 부수 효과로 가능, 보장 X. Month 6+ 외부 언어 교환 앱 권장 | 01-vision / 02-target / 18-motivation / 21-integration |
| **D83** | **MVP 지표 5개로 축소** (2026-05-26 critic M1) | MVP 안 (매 세션) 5개: 발화 단어 수 / 영어 비율 / 출석 / 자발 발화 시간 / 새 어휘 수. Month 1+ (monthly mirror만) 8개: MTLD/MLU/Speaking rate/Disfluency/Tense/Top patterns/Self-reported/Word-level | 17-measurement |
| **D84** | **페르소나 D 재훈 비-타겟 인접 재분류** (2026-05-26 critic M2) | 페르소나 검증 게이트(D50)는 4명 (지은/민호/수진/혜원). 재훈은 onboarding self-screen 후 우아한 redirect. 진입하면 환영, dropout 매니페스토 위반 아님 | 02-target / 13-learner-typology / 21-integration |
| **D85** | **Recast 허용** (2026-05-26 critic M3) | "인라인 교정 X" 유지. 그러나 Recast (학습자 오류를 모델이 자기 응답에 자연 올바른 형태로 포함) 허용. 예: 학습자 "I goed there" → 모델 "Oh, you went there too?" Early Production fossilization 방지 | AGENTS.md / 11-acquisition-theory |
| **D86** | **01-vision scope 좁아진 목표 정합** (2026-05-26 critic M4) | 비전에서 "면접/이직/비즈니스" 표현 제거. 학습자의 1년 표 정합. AI 파트너 영어 의식 정착이 본질 | 01-vision |
| **D87** | 알림 언어 정책 (Round 4 MINOR-3) | Day 1~3 알림 = 한국어 디폴트 ("안녕 지은님, 어제 한 마디 이어가볼까요?"). Day 4+ 영어 시도 ("Yesterday: '...' What kind?") | 08-first-7-days |
| **D88** | 약점 큐 알고리즘 명명 정정 (Round 4 MINOR-4) | D13의 "Anki SM-2"는 실제로 Leitner (고정 +1/+3/+7/+14/+30). 명명 정정. 진짜 SM-2 (응답 기반 동적) 도입은 v2 | 09-decisions D13 / 17-measurement |
| **D89** | Discovery 채널 정책 (Round 4 MISS-1) | Phase 0 = 학습자 자가 발견 (기술 미디어, 개발자 SNS, GitHub trending). Phase 1 = 본격 채널 (블로그 / 유튜브 / 학습자 추천) | 02-target / Phase 1 로드맵 |
| **D90** | 오프라인 / 저연결 처리 (Round 4 MISS-2) | profile.md에 `offline_friendly` 플래그. 텍스트 우선 모드 + 음성 자동 폴백. 출근길 지하철 시나리오 대비 | 06-voice-ux / 07-background-data |
| **D91** | 페르소나 단계 배정 = 추정 (Round 4 MISS-3) | 13/14의 단계 배정은 추정. Phase 0 학습자 5~20명 데이터로 갱신. 갱신 후 페르소나 stage 필드 수정 | 13/14 |
| **D92** | 비용 정당성 정책 (Round 4 MISS-4) | MVP = "이미 ChatGPT Plus 사용자" 가정. Plus 단독 ROI는 Phase 1 검증 항목 | 02-target / Phase 1 검증 |
| **D93** | Sol 인격 single source (Round 4 MISS-5) | AGENTS.md = Sol 정의의 single source. 22+ 문서에 산재된 톤은 AGENTS.md를 참조. Compaction 안전판 D32 강화 | AGENTS.md / 10-harness-patterns |
| **D94** | Week 2-52 정밀 설계 = MVP 밖 (Round 4 MISS-6) | Week 1~5 정밀 설계 (08, 15). Week 6+ 학습자 데이터로 적응 (자동 흐름). 정밀 설계는 v2. 학습자 첫 코호트 데이터로 회고 후 본격 | 21 |
| **D95** | i+1 차원 명시 (Round 4 AMB-1) | i+1 우선순위: 어휘 레벨 > 문장 길이 > 문법 복잡도. 학습자 발화 어휘 분석 시 +1단계가 핵심 신호 | AGENTS.md / 11-acquisition-theory |
| **D96** | 활동 제안 인터페이스 (Round 4 AMB-2) | 자연어 한 줄 ("Quick chat or shadowing today?"). UI 버튼 X (Codex CLI 환경). Phase 1 웹앱에서는 옵션 칩 가능 | AGENTS.md / 15-activities |
| **D97** | profile typology vs flags 중복 제거 (Round 4 MINOR-2) | typology가 source. flags.json의 anxiety_level 같은 중복 필드는 typology에서 derived (제거 또는 참조) | 07-background-data / 13-learner-typology |
| **D98** | self-critic 갭 카운트 정정 (Round 4 MINOR-1) | 실제 갭 = 25개 (A4 + B5 + C6 + D3 + E7). 22-self-critic 본문에 명시 추가 | 22-self-critic |
| **D99** | 페르소나 시뮬레이션 범위 확장 (Round 4 MINOR-5) | 21-integration Phase 5 시뮬레이션 = Day 0~7 + Month 2~3 dropout zone. Day 14/30/60 mini-mirror 시뮬레이션 포함 | 21-integration |

### Round 5 — self-critic 25개 닫음 (2026-05-26)

**A 영역 — 충돌 해소 (4개)**:

| ID | 항목 | 결정 |
|---|---|---|
| **D100** | A1: progress.json v1 → v2 단일화 | 07이 17의 v2 정의 참조. v1 폐기 |
| **D101** | A2: favorite_topics source 명시 | source = `_internal/patterns.json`. `content_queue.json`은 derived (캐싱 X) |
| **D102** | A3: 첫 실행 시퀀스 | codex 실행 → SessionStart hook → `~/english-learning/` 자동 생성 → profile.md 빈 상태 감지 → onboarding 모드 inject → profile_intake 호출 → Phase 1~5 → 종료 시 저장 |
| **D103** | A4: D17 → D54 통합 | D17 (베이스라인 실패 처리) 폐기, D54 (Pre-production 보호) 단독. trigger + 운영 정책 합산 |

**B 영역 — Phase 0 spike에서 검증 (5개, deferred)**:

| ID | 항목 | 결정 |
|---|---|---|
| **D104** | B1: PreCompact hook 존재 | Phase 0 spike에서 확인. 없으면 D32 우회 (UserPromptSubmit hook으로 상태 재주입 대체) |
| **D105** | B2: Goal mode 영어 학습 호환 | Phase 0 spike에서 어색하면 자체 long-term goal 메커니즘 (progress.json의 weekly_targets) 대체 |
| **D106** | B3: voice 사용량 자체 측정 | Phase 0 spike에서 Codex realtime API 사용량 신호 없으면, 우리가 audio 시간 측정 (정확도 ±10% 허용) |
| **D107** | B4: 데스크탑 hook `say` 명령 권한 | Phase 0 spike에서 차단되면 TTS playback 없음 (텍스트 only). 매니페스토 영향 X |
| **D108** | B5: realtime latency | Phase 0 spike에서 >2초 측정 시 conversational mode 비활성, transcription mode로 fallback |

**C 영역 — 모호 알고리즘 정밀화 (6개)**:

| ID | 항목 | 결정 |
|---|---|---|
| **D109** | C1: 단계 추정 가중치 | 보수적 (낮은 단계 우선). 가중치: MLU > 단어 수 > 한국어 섞임 비율 > 시제 다양성 > 망설임 > 자기 수정. 신호 충돌 시 더 낮은 단계로 분류 |
| **D110** | C2: 영역별 망각 곡선 | 어휘/패턴/발음 모두 동일 Leitner (D88, +1/+3/+7/+14/+30). 영역별 차등은 v2 |
| **D111** | C3: 알림 텍스트 민감 정보 필터 | 학습자 발화에서 비밀번호/의료/금융 키워드 감지 시 슬롯 사용 X. 안전 토픽 fallback ("어제 한 마디 — 이어서 한 마디?") |
| **D112** | C4: AGENTS.md 템플릿 | `design/agents-template.md` 별도 문서로 작성. 구현 1단계 진입 시 |
| **D113** | C5: typology Day 0 vs Day 1~7 갱신 | Day 0 = 초기 추정 (인터뷰 기반, 정확도 낮음). Day 1~7 = 신호 누적 후 갱신. Day 7 mini-mirror 시점에 최종 typology 확정 |
| **D114** | C6: Ought-to → Ideal 전환 메커니즘 | D84 (재훈 비-타겟 인접) 후 우선순위 ↓. 4 페르소나에 적용: Week 2-3 "내가 원하는 거 뭐예요?" 인터뷰가 자연스럽게 등장 가능. 강제 X |

**D 영역 — 매니페스토 미세 결 (3개)**:

| ID | 항목 | 결정 |
|---|---|---|
| **D115** | D-c1: Streak 표시 톤 | "30일 같이 했어요" = 사실 진술 OK. "끊으면 안 되겠다" 압박 톤 / "365일 연속!" 강조 / 알림에 "streak 위험" 같은 표현 절대 금지 |
| **D116** | D-c2: Phase 5 선물 변형 톤 | "더 좋은 표현이에요" X / "이게 더 자연스러워요" X. 톤: "이렇게도 들려요" / "외울 필요 없어요, 그냥 들려드린 거예요" |
| **D117** | D-c3: Mirror "발견 vs 평가" | 학습자 표현 인용 OK ("이번 주 'I like X' 5번 시도"). "잘 했어요" / "이건 틀렸어요" / "정확도 X%" 절대 X. mirror 톤 = "관찰자" 모드 |

**E 영역 — 누락 결정 (7개)**:

| ID | 항목 | 결정 |
|---|---|---|
| **D118** | E1: 디스크 풀 정책 | 베이스라인 + 분기 마일스톤 (Day 0/30/90/180/365) 오디오 영구. 일상 세션 오디오 보관 X (전사만). 1년 ~30MB |
| **D119** | E2: 설치/배포 명령 검증 (Phase 0) | direct GitHub URL 설치 명령은 확정하지 않는다. Phase 0에서 현재 Codex CLI의 plugin 설치 경로를 검증한 뒤 README.md에 한 줄로 고정한다. 2026-05-27 로컬 CLI 0.133.0 관찰값은 `codex plugin add <plugin>@<marketplace>` 계열이며, marketplace 설정 없는 GitHub URL 직설치 지원은 미검증 |
| **D120** | E3: 모바일 진입 시 거절 | "지금은 macOS + CLI만 지원해요. 모바일은 Phase 1 예정이에요." 한 줄. 우아한 redirect |
| **D121** | E4: priority ↔ 매니페스토 6신념 | 매니페스토 = 최상위 (불가침). D33 priority = 행동 결정 잣대. 매니페스토 위반 ≠ priority 충돌. AGENTS.md에 명시 |
| **D122** | E5: "내 단계 알려주세요" 요청 | 단계 라벨 거절. raw 지표 (발화 단어 수, 새 어휘 수, 영어 비율)는 detailed view (D66)에서 제공. "초급/중급" 라벨 X |
| **D123** | E6: 페르소나 D 우아한 거절 (D84 보강) | onboarding self-screen 메시지: "토익/오픽이면 학원이 더 잘해요. 회사 압박이면 우리 효과 약해요. 회화 자신감이면 매일 5분, 부담 없이." 학습자가 그래도 진입하면 환영 |
| **D124** | E7: 알림 시간 자동 조정 | 알림 응답률 < 50% 일주일 지속 시 자연어 제안: "지금 시간 잘 안 맞으시는 것 같아요. 다른 시간 어때요?" 학습자 선택 시 자동 변경 |

---

## 결정에 따른 변경이 필요한 design 문서

- `03-learning-loop.md` — Phase 4 정의 수정 (CR-01)
- `07-background-data.md` — D11/D12 (오디오 저장), D13 (망각 곡선), D14 (CEFR 분류) 명시
- `04-onboarding.md` & `05-onboarding-script.md` — D04 (자동 진입), D17 (실패 처리), D21 (무료 사용자) 반영
- `08-first-7-days.md` — D10 (Day 7 트리거) 반영
- `02-target.md` — D21 (무료 사용자 정책) 한 줄 추가

이 변경들은 구현 1단계 (AGENTS.md 시드 작성) 직전에 일괄 처리한다. 결정 자체는 이 문서가 single source of truth.

---

## 다음

이 문서가 닫히는 순간 결정 레지스트리는 닫힌다. 구현 진입 전 Phase 0 spike에서 설치/훅/음성/이미지 실행 가능성을 검증한다:
1. AGENTS.md 페르소나 시드 (D16, D18, D20 컴파일)
2. Plugin 디렉터리 스캐폴드 (D01, D03)
3. 스킬 4개 (profile_intake, daily_session, mini_mirror, weekly_mirror)
4. Hook 스크립트 (D03, D07, D10, D29)
5. progress.json 스키마 (D12, D13, D14, D22)
