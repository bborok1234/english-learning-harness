# 도구 카탈로그 — 14개 활동을 작동시키는 도구

15-activities.md의 14가지 활동을 작동시키려면 어떤 도구가 필요한지 전체 매핑. MVP 안/옵션/밖을 결정. 의존성 순서 여섯 번째 영역 (C).

확정일: 2026-05-26

---

## 1. 6개 도구 카테고리

### A. 입력 도구 (학습자 → 모델)
- **STT (Codex realtime)** — 실시간 음성 인식, gpt-realtime
- **STT (Whisper fallback)** — 파일 기반 전사, gpt-4o-transcribe
- **텍스트 입력** — 키보드
- **이미지/PDF 첨부** — Codex `view_image` 도구
- **음성 파일 업로드** — 사후 분석용

### B. 출력 도구 (모델 → 학습자)
- **TTS (gpt-realtime)** — 양방향 실시간 음성
- **TTS (gpt-4o-mini-tts)** — 파일 기반, 속도/음성 조절. marin/cedar 권장
- **텍스트 출력**
- **이미지 생성** — gpt-image-2 (Codex 내장)
- **간단한 표/다이어그램** — Markdown

### C. 분석 도구 (백그라운드, 학습자 안 봄)
- **발화 분석** — 단어 수, 발화 시간, 망설임 (uh/um/멈춤)
- **어휘 분석** — 새 어휘 추출, CEFR 즉석 분류 (D14)
- **패턴 인식** — L1 transfer 자동 감지 (D46), 자주 시도하는 chunks
- **Word-level confidence** — gpt-4o-transcribe + logprobs (D42 발음 평가)
- **Fluency metric** — Speaking rate (분당 단어), MTLD (어휘 다양성), MLU (평균 문장 길이) — D41
- **시제·문법 다양성** — 단계 추정 (D51)에 입력

### D. 콘텐츠 생성 도구 (학습 자료)
- **시나리오 생성** — Roleplay 배경 (모델 호출)
- **단계 적합 텍스트** — i+1 (D36) 원칙으로 모델이 생성
- **짧은 스토리 / 키워드** — Storytelling 활동용
- **Tongue twisters** — 단계별 (모델 생성)
- **음소 단어 리스트** — 학습자 약한 음소 (l/r 등) 단어 (모델)
- **받아쓰기 텍스트** — Dictation용

### E. 외부 통합 (MCP) — 선택적
- **Dictionary MCP** — Free Dictionary API, Merriam Webster (어휘 풍부화)
- **YouTube Transcript MCP** — 학습자 추천 영상 자막 (콘텐츠 소싱, H 영역)
- **Anki MCP** — 어휘 동기화 (학습자가 이미 Anki 사용 시)
- **Notion MCP** — 학습자가 Notion 일지 작성 시 통합

### F. 메타 도구 (운영)
- **페이스 조정** — Stop hook이 학습자 분량 추세 추적, 적응 (Day 8+ 슬쩍 늘림)
- **약점 큐 (SM-2)** — Anki-style 망각 곡선 (D13)
- **토픽 큐** — 다음 토픽 추천 (관심사 + 단계)
- **발화 시간 모니터링** — voice_seconds_today (D22)
- **한도 가드** — PreToolUse hook (D35 voice 정책)

---

## 2. 14 활동 × 도구 매핑 매트릭스

각 활동이 어떤 도구를 호출하는지:

| 활동 | 입력 | 출력 | 분석 | 콘텐츠 |
|---|---|---|---|---|
| 1 Free conversation | STT/text | TTS/text | 발화+어휘+패턴 | — |
| 2 Roleplay | STT/text | TTS+이미지(배경) | 발화+L1 transfer | 시나리오 생성 |
| 3 **Shadowing** | STT | TTS (slow 옵션) | **word-confidence** | 짧은 단계 적합 문장 |
| 4 Retell | STT/text | TTS | 발화+의미 매칭 | 짧은 입력 |
| 5 Read-aloud | STT | — | **word-confidence** | 단계 적합 텍스트 |
| 6 Picture description | STT/text | — | 발화+어휘 | **이미지 생성 (gpt-image-2)** |
| 7 Storytelling | STT/text | — | 발화+창의성 | 키워드 3개 |
| 8 Vocabulary stretching | — | text | (없음) | 자연 변형 (옵션: Dictionary MCP) |
| 9 Comparing | STT/text | text | (없음) | 자연 변형 |
| 10 Continuous 4/3/2 | STT | TTS+카운트 | **Speaking rate** | 학습자 정한 주제 |
| 11 Tongue twisters | STT | TTS | word-confidence | 단계 적합 twister |
| 12 Pronunciation drill | STT | TTS (slow) | **logprobs (음소)** | 음소 단어 5개 |
| 13 Listening (passive) | (yes/no) | TTS | (이해 추정) | 짧은 문장 |
| 14 Dictation | text | TTS | 철자 일치 | 짧은 문장 |

**관찰**:
- 모든 활동이 **STT + TTS + 모델 콘텐츠 생성**의 조합으로 표현 가능
- **이미지 생성**은 Picture description + Roleplay 배경에 핵심
- **Word-level confidence (logprobs)**는 Shadowing/Read-aloud/Tongue twisters/Pronunciation drill에 모두 사용
- 외부 MCP 없이도 14 활동 전부 작동 가능 (MCP는 풍부함을 더할 뿐)

---

## 3. MVP 안 / 옵션 / 밖

### ✅ MVP 안 (반드시) — 14 활동 작동을 위한 최소 셋

**입력**:
- STT (Codex realtime)
- 텍스트 입력
- 이미지 입력 (Codex view_image)

**출력**:
- TTS (gpt-realtime + gpt-4o-mini-tts 폴백)
- 텍스트 출력
- 이미지 생성 (gpt-image-2)

**분석**:
- 발화 분석 (단어 수, 영어 비율, 자발 발화 시간)
- 출석 여부
- 어휘 분석 (CEFR 즉석 분류)
- 패턴 인식 (L1 transfer 기본)
- 새 어휘 수

**Month 1+ / 옵션 분석**:
- Word-level confidence (logprobs)
- Fluency metric (speaking rate, MTLD, MLU)
- Disfluency / tense diversity / self-reported confidence

**콘텐츠**: 모델 호출로 모든 시나리오/텍스트/이미지/twister/단어 생성

**메타**: 페이스 조정, 약점 큐 (SM-2), 토픽 큐, 한도 가드

### 🟡 MVP 옵션 (Phase 1, 학습자가 명시 켤 때)

- **Dictionary MCP** (Free Dictionary 또는 Merriam Webster) — 어휘 풍부화. 모델 즉석 분류로도 충분하지만 더 정확함을 원하면
- **음성 파일 업로드 + 사후 분석** — 학습자가 외부에서 녹음한 발화 분석

### ❌ MVP 밖 (v2 이후)

- **Anki MCP 동기화** — 학습자가 Anki 이미 쓸 때만 의미. v2
- **Notion MCP 통합** — 일지 외부 동기화. 매니페스토 "데이터는 학습자 디스크"와 큰 충돌은 X지만, MVP 범위 밖
- **YouTube Transcript MCP** — 콘텐츠 소싱 (H 영역). v2에서 본격
- **Calendar MCP** — "다음 미팅이 영어 미팅" 자동 감지. v2
- **다이어그램 / 화이트보드** — 시각 학습. MVP 부담
- **다중 디바이스 동기화** — iCloud/Drive 폴백만, 자체 sync 없음

---

## 4. 각 도구의 구현 (Codex 환경)

각 MVP 도구를 어떻게 호출하는지:

### STT
- **Codex realtime conversational**: `[realtime]` config + spacebar hold-to-talk
- **파일 폴백**: gpt-4o-transcribe with `include_logprobs=true` (D42)

### TTS
- **실시간**: gpt-realtime (양방향), voice = marin 또는 cedar
- **사후**: gpt-4o-mini-tts, speed=0.85 (slow 모드, 발음 모델용)

### 이미지 생성
- **Codex 내장**: gpt-image-2. Picture description / Roleplay 배경
- 비용: ChatGPT 구독 한도 안에서 (별도 키 X)

### 어휘 분석
- 새 단어 추출: 정규식 (간단한 토큰화)
- CEFR 분류: 매 세션 새 어휘만 모델 1회 호출 (배치) → vocab_seen.json에 캐싱

### L1 transfer 감지
- 모델 호출 (학습자 발화 → "한국어식 패턴 발견" 신호)
- 결정론적 규칙도 추가 (어순 SOV → SVO, 관사 누락 등)
- `_internal/patterns.json`의 `transfer_patterns` 누적 (D46)

### Word-level confidence
- gpt-4o-transcribe의 `include_logprobs=true` (D42)
- 음소 단위 timestamp는 없으니 단어 단위까지만

### Fluency metric
- 결정론적 계산
- Speaking rate = 단어 수 / 발화 시간(초) × 60
- MTLD: 표준 알고리즘 (텍스트 → 단순 Python)
- MLU: 문장당 평균 단어 수

### 시나리오 / 콘텐츠 생성
- 모델 1회 호출. 입력: 학습자 정보 (관심사, 단계, 약점)
- 출력: 시나리오 텍스트 / 이미지 프롬프트 / 단어 리스트

---

## 5. MCP 통합 (옵션 도구)

학습자가 명시 활성화할 때:

### Dictionary MCP
- 설치: Phase 0에서 현재 Codex CLI/plugin marketplace 흐름 확인 후 고정. 2026-05-27 로컬 CLI 0.133.0 관찰값은 `codex plugin add <plugin>@<marketplace>` 계열이며, `dictionary-mcp`의 실제 배포 채널은 미검증
- 사용: 모델이 `dictionary.lookup(word)` 호출 → 정의/발음/예문/동의어
- 우리 활용: Vocabulary stretching 활동에서 더 정밀한 동의어 1-2개

### YouTube Transcript MCP (v2 예고)
- 학습자가 좋아하는 영상 URL 제공 → 자막 추출 → 짧은 클립 발췌 → Retell/Shadowing 자료
- MVP 밖이지만 v2 진입 1순위

### 비개발자 설치 친화성
- README.md에 한 줄 명령
- Plugin manifest에 MCP 의존성 명시
- Codex Plugin Marketplace는 ChatGPT Business 한정이라 MVP는 GitHub URL 기반

---

## 6. 학습자 디스크에 남는 산출물 (도구 사용 결과)

매니페스토 "데이터는 학습자의 것" 재확인. 도구 사용으로 다음이 학습자 디스크에 남음:

- 모든 발화 전사 텍스트 (sessions/)
- 베이스라인 + 분기 milestone 오디오 (_internal/audio/)
- 어휘 누적 (_internal/vocab_seen.json)
- 패턴 누적 (_internal/patterns.json)
- 약점 큐 (progress.json)
- 생성된 시나리오 (sessions/ 안에)
- 생성된 이미지 (artifacts/images/)
- 발음 신뢰도 (필요 시 _internal/confidence/)

---

## 7. 새 결정 후보 D59-D62

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D59 | MVP 도구 셋 확정 | 위 "MVP 안" 목록. STT + TTS + 이미지 생성 + 5가지 분석 + 콘텐츠 생성 + 4가지 메타 | 구현 시 적용 |
| D60 | Dictionary MCP 옵션 도입 | Vocabulary stretching 강화. 학습자가 명시 활성화 | MVP Phase 1 |
| D61 | MCP MVP 밖 정책 | Anki / Notion / YouTube / Calendar MCP는 v2. 매니페스토 "단순함" + "데이터 학습자 디스크" 우선 | v2 로드맵 |
| D62 | 오디오 저장 형식 = 베이스라인 + 마일스톤만 (D12 재확인) | 일상 세션은 전사 텍스트만. 1년 ~30MB | 이미 D12로 닫힘, C에서 재확인 |

---

## 8. 다음 영역 연결

- **F (측정 — judgmental 아니게)** — 위 분석 도구들의 결과를 어떻게 학습자에게 mirror로 돌려줄지. 본인 baseline 대비. CEFR 같은 외부 기준 X
- **G (동기 유지)** — 도구 다양성 자체가 지루함 방지. 그러나 도구 폭은 학습자에게 보이지 않음 (자동 흐름)
- **H (콘텐츠 소싱)** — YouTube Transcript MCP 같은 외부 도구가 본격 등장
- **J (부정 시나리오)** — 도구 실패 시 폴백 (STT 실패, 이미지 생성 실패 등)

---

## 9. 출처

- [Word of the Day MCP Server (GitHub)](https://github.com/traves-theberge/word_of_the_day)
- [Dictionary MCP (Lobe Hub)](https://lobehub.com/mcp/tannmaycoding-dictionary-mcp)
- [YouTube Transcript MCP (Apify)](https://apify.com/automation-lab/youtube-transcript/api/mcp)
- [YouTube Transcripts MCP (PulseMCP)](https://www.pulsemcp.com/servers/kimtaeyoon83-youtube-transcripts)
- [Anki MCP Server (GitHub)](https://github.com/ankimcp/anki-mcp-server)
- [Notion-Anki MCP Server (Glama)](https://glama.ai/mcp/servers/@bakhruhk/notion-anki-mcp)
- [Codex CLI Realtime Voice (Daniel Vaughan)](https://codex.danielvaughan.com/2026/03/31/codex-cli-realtime-sessions-voice-transcription/)
