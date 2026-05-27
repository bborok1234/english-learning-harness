# 하네스 베스트 패턴 적용 가이드

2026년 5월 시점의 agent harness engineering 베스트 프랙티스를 우리 영어 학습 하네스에 매핑한 문서. 구현자는 이 문서 + `09-decisions.md`를 들고 작업한다.

확정일: 2026-05-26

---

## 1. 2026 트렌드 — 핵심 4가지

| 트렌드 | 인사이트 | 우리의 입장 |
|---|---|---|
| **컨텍스트 인프라가 차이를 만든다** | "65% of enterprise AI failures = harness defects (context drift, schema misalignment, state degradation), not raw reasoning" | profile/progress/handoff text 같은 structured artifact가 이미 우리 design의 척추 |
| **Compaction에만 의존 X — structured handoff** | Factory 36k 메시지 평가: 새 세션 + persistent state merge가 정확도/연속성 최고 | 우리는 매일 단절 세션이 자연스러운 핸드오프. 이미 베스트와 일치 |
| **AGENTS.md = durable rule only** | 충돌 지시 + priority 없음 → resolve rate 48.8% → 28% 폭락 (ICLR 2026) | 매니페스토 6신념 + 5모드 정의만. 어제 한 마디는 hook으로 |
| **Skills 5 패턴 표준화** | Generator / Pipeline / Reviewer / Tool Wrapper / Inversion. Codex / Claude Code / Cursor / Gemini CLI / Copilot 통일 | 우리 4개 스킬을 이 분류로 명시 |
| **Hooks = policy-as-code** | "Best practice guidelines → enforced rules" | 음성 한도, 인라인 교정 금지 등을 hook으로 enforcement |

---

## 2. AGENTS.md 작성 원칙

### 들어가야 할 것 (durable rule only)
1. 파트너의 정체성 (이름, 톤, 역할)
2. **매니페스토 6개 신념**과 그것을 어기는 행동 금지
3. 5가지 모드 (Coach / Sparring Partner / Editor / Archivist / Strategist)의 정의와 전환 조건
4. **언어 정책** (메타 = 한국어, 학습 = 영어, 학습자 톤 미러링)
5. self-labeling 처리 규칙
6. 영어 학습 도메인 지식 (Krashen, comprehensible input 등의 핵심 한 줄)
7. **명시적 priority 순서** (충돌 시 어느 원칙이 우선)

### 들어가면 안 되는 것
- ❌ 어제 학습자가 한 말
- ❌ 오늘의 토픽
- ❌ 학습자의 현재 자신감 점수
- ❌ "이번 주 가정법 연습" 같은 일시 학습 목표
- ❌ 구체적 분기 처리 ("학습자가 '커피'라고 하면 ~")

→ 위는 모두 SessionStart hook의 `additionalContext`로 inject

### Priority 순서 (충돌 시 우선)

AGENTS.md에 다음 순서로 명시한다:

1. **안전** — 학습자가 부담스러워하면 무조건 한 박자 쉼
2. **흐름** — 대화 중에는 절대 인라인 교정 X
3. **인정** — 학습자가 한 답은 그대로 받음 (라벨링 X)
4. **간결** — 한 번에 한 가지 옵션만
5. **다음 약속** — 모든 세션 끝에 다음 만남 약속

> "If two rules conflict, follow the lower-numbered one."

---

## 3. Skills 5 패턴 매핑

### 우리 스킬 매핑표

| 스킬 | 패턴 | 입력 | 출력 | 호출 시점 |
|---|---|---|---|---|
| `profile_intake` | **Generator** | 학습자의 인터뷰 답변 | `profile.md` | Day 0 (자동) |
| `daily_session` | **Pipeline** | 학습자 발화 + 어제 핸드오프 | 일지 + progress 업데이트 | Day 1+ (자동) |
| `mini_mirror` | **Reviewer** | 지난 7일 일지 | `mirrors/week-N.md` + 다음 주 노트 | Day 7, 14, 21... |
| `monthly_mirror` | **Reviewer** | 지난 30일 일지 + baseline | `mirrors/month-N.md` + baseline 비교 | Day 30, 60, 90... |
| `pronunciation_check` (옵션) | **Tool Wrapper** | 학습자 녹음 | word-level confidence 리스트 | 학습자 명시 요청 시 |
| `mock_meeting` (v2) | **Inversion** | 학습자 시나리오 ("내일 미팅") | 역할극 대본 + 사후 디브리프 | v2 |

### Pipeline 패턴 안 — daily_session의 단계

```
Re-entry (10초, hook이 컨텍스트 inject)
  ↓
Warm-up (1~2분)
  ↓
Main Activity (5~30분)
  ↓
Closing (Day별 분기 — see 03-learning-loop.md)
  ↓
Archive (Stop hook)
```

각 단계는 독립적 검증 가능 (베스트 프랙티스: pipeline은 단계마다 fail-fast).

### 패턴 조합 메모

- Pipeline (`daily_session`) 안에 Tool Wrapper (`pronunciation_check`)가 학습자 요청 시 호출 가능
- Reviewer (`mini_mirror`)는 Generator의 산출물(`profile.md`)을 입력으로 사용

---

## 4. Hooks 활용표 — 우리 영어 학습 하네스에서

| Hook | 역할 | 우리 처리 | policy enforcement |
|---|---|---|---|
| **SessionStart** | 컨텍스트 셋업 | `profile.md` + `progress.json` 요약 + 어제 핸드오프 텍스트를 `additionalContext`로 inject (~500 토큰) | 첫 실행 시 `~/english-learning/` 자동 생성 (D03) |
| **UserPromptSubmit** | 입력 가드 | (옵션) 학습자가 한국어로만 답할 때 영어 시도 권유 1회 inject | — |
| **PreToolUse** | 행동 차단 | **voice 도구 호출 직전** `voice_seconds_today` 체크. 임계치(30/60분) 넘으면 deny + 텍스트 폴백 (D22) | voice 한도 policy-as-code |
| **PostToolUse** | 백그라운드 기록 | 학습자 발화 분석을 `_internal/session_errors.md`, `vocab_seen.json`에 누적. 학습자에게 안 보임 | mirror 첫 등장(Day 7)까지 분석 결과 노출 X |
| **PreCompact** | 상태 보존 | **긴 세션 (>15분)에서만 발동**. 학습자 식별자 + 최근 3개 약점 + 오늘 baseline을 `additionalContext`로 재주입 (D32) | compaction 안전판 |
| **Stop** | 마무리 강제 | 세션 일지 저장 + `progress.json` 업데이트 + 다음 알림 메시지 미리 계산 (D29) | "다음 약속" 매니페스토 |
| **Cron / Automations** | 외부 트리거 | 매일 학습자 정한 시간 알림. Day 7/30에 mirror 트리거 (D07, D10) | — |

### Hook 작성 베스트

- 모든 hook은 **shell command + JSON stdin/stdout**
- 결정론적 처리 우선 (모델 호출 최소화) — D09 같은 템플릿 슬롯 패턴
- 실패해도 학습자 흐름 깨지지 않게 — hook 실패 시 silent fallback
- PreToolUse의 deny 메시지는 학습자에게 **부드러운 한 줄** ("오늘 voice 한도 차네요. 텍스트로 마저 할래요?")

---

## 5. Compaction 안전판 (D32)

### 위험
Codex 자동 compaction은 다음만 살림: 현재 task, 최근 에러, 파일 이름. 우리 학습 컨텍스트(약점, baseline, 학습자 톤)는 손실 위험.

### 안전판 3중

**1차 안전판 — AGENTS.md에 핵심 박기**
매니페스토 6신념, 5모드 정의, priority 순서는 AGENTS.md에 있으므로 compaction 영향 0. (시스템 프롬프트는 살아남음.)

**2차 안전판 — 매 세션 SessionStart hook의 재주입**
세션이 길어져 compaction이 발동하더라도, 매 SessionStart에서 다시 학습자 컨텍스트가 주입되므로 단절은 없음.

**3차 안전판 — PreCompact hook (긴 세션 한정)**
세션이 15분 넘어가면 PreCompact hook이 발동. 다음을 `additionalContext`로 재주입:
- 학습자 식별자 (`profile.md`의 name, partner_name)
- 최근 3개 활성 약점 (`progress.json`의 `errors.pending`)
- 오늘 baseline 발화 텍스트 (있다면)

이 3중으로 우리는 long session에서도 학습자 정체성/약점/오늘의 컨텍스트를 잃지 않는다.

---

## 6. 구현 시 체크리스트

AGENTS.md / 스킬 / hook을 작성할 때 이 문서로 검증:

- [ ] AGENTS.md에 일시 컨텍스트(어제 한 마디 등)가 안 들어갔나
- [ ] AGENTS.md에 priority 순서가 명시되었나
- [ ] 각 스킬이 5 패턴 중 하나로 명시 분류되었나
- [ ] Pipeline 스킬은 단계 fail-fast 가능한가
- [ ] PreToolUse가 voice 한도 정책을 enforce하는가
- [ ] PreCompact가 긴 세션에서 핵심 상태를 재주입하는가
- [ ] Hook들이 모두 shell + JSON 패턴인가
- [ ] Hook 실패 시 학습자 흐름이 깨지지 않는가 (silent fallback)

---

## 7. 출처

- [The Definitive Guide to Agent Harness Engineering (Medium)](https://engineeratheart.medium.com/the-definitive-guide-to-agent-harness-engineering-5f5edf25fd73)
- [Agent Harness Engineering — Rise of the AI Control Plane (Medium)](https://medium.com/@adnanmasood/agent-harness-engineering-the-rise-of-the-ai-control-plane-938ead884b1d)
- [Context Engineering — Memory, Compaction, Tool Clearing (Anthropic Cookbook)](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools)
- [Context Engineering — Short-Term Memory with Sessions (OpenAI Cookbook)](https://cookbook.openai.com/examples/agents_sdk/session_memory)
- [AGENTS.md Patterns: What Actually Changes Agent Behavior](https://blakecrosley.com/blog/agents-md-patterns)
- [Codex CLI Hooks: Complete Guide to Events, Policy Engines](https://codex.danielvaughan.com/2026/04/15/codex-cli-hooks-complete-guide-events-policy-patterns/)
- [Hooks: The Enforcement Layer (Ranjan Kumar)](https://ranjankumar.in/hooks-policy-as-code-agent-enforcement)
- [5 Agent Skill Design Patterns Every ADK Developer Should Know](https://lavinigam.com/posts/adk-skill-design-patterns/)
- [Long Context Compaction for AI Agents — Implementation and Evaluation](https://towardsai.net/p/machine-learning/long-context-compaction-for-ai-agents-part-2-implementation-and-evaluation)
- [Awesome Harness Engineering (GitHub)](https://github.com/ai-boost/awesome-harness-engineering)
