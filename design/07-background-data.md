# 백그라운드 분석과 학습자 디스크 구조

학습자에게 안 보여주는 데이터가 한 달 뒤 mirror의 재료가 된다. 이 문서는 그 데이터가 어디에, 어떤 형태로 저장되는지의 명세. 매니페스토 5번 ("데이터는 학습자의 것이다")의 구체 형태.

## 디렉터리 구조

```
~/english-learning/
├── profile.md              ← 학습자 프로파일 (인터뷰 결과)
├── baseline.md             ← Day 0 1문장 + 메타
├── progress.json           ← 누적 진도 요약 (모델이 자주 참조)
├── README.md               ← 학습자가 본인 폴더 처음 열었을 때 안내
│
├── sessions/
│   ├── 2026-05-26-day-0-onboarding.md
│   ├── 2026-05-27-day-1.md
│   ├── 2026-05-28-day-2.md
│   └── ...
│
├── mirrors/
│   ├── 2026-06-02-week-1.md     ← Day 7 자동 생성
│   ├── 2026-06-26-month-1.md    ← Day 30 자동 생성
│   └── ...
│
└── _internal/                   ← 학습자가 볼 수 있지만 일반적으로 안 봄
    ├── session_errors.md         ← 오류 누적 raw
    ├── vocab_seen.json           ← 본 어휘 + 빈도
    ├── patterns.json             ← 자주 시도하는 표현 패턴
    ├── flags.json                ← 운영 플래그 (high_anxiety 등)
    └── audio/
        ├── 2026-05-26-baseline.mp3
        ├── 2026-05-27-day-1.mp3
        └── ...
```

**원칙**: 학습자가 텍스트 에디터로 어떤 파일이든 열 수 있다. `_internal/`은 '비공개'가 아니라 '평소엔 안 보는' 폴더. 학습자가 본인 데이터를 보고 싶으면 언제든.

`~/english-learning/README.md`는 학습자가 처음 폴더를 열었을 때 어디에 무엇이 있는지 한 화면으로 보여주는 안내. 매니페스토의 데이터 소유권 약속을 손에 잡히게 만든다.

---

## profile.md (Day 0 onboarding 결과)

```yaml
---
name: 지은
created: 2026-05-26
last_session: 2026-05-26
preferred_time: 08:00
preferred_mode: voice  # voice | text | text_first
language_for_meta: ko
language_for_practice: en
partner_name: Sol  # 학습자가 변경 가능
---

## 자기 정의
- 영어 마지막 사용: 3년 전 회사 메일
- 과거 시도: 학원 2회 (각 한 달), 전화영어 1회 (2주), 듀오링고 200일
- 자가 평가: "초급" (학습자 라벨 — 신뢰 X)

## 목표 (학습자 발화 그대로)
"외국인 만나도 안 도망가고 싶다"

## 두려움 (학습자가 명시한 것)
- "또 작심삼일이 될까봐"
- "영어 부끄럽다"

## 환경
- 회사에서 영어 안 씀
- 외국인 동료 없음
- 해외 여행: 1년 1-2회

## 운영 메모 (모델만 봄)
- 죄책감 트리거 금지 ("어제 안 오셨네요" X)
- 첫 7일은 답 강요 0
- 베이스라인 비교는 +30일 이후
- 학습자 톤: 망설임형. 안전망 충분히 깔 것
```

**왜 마크다운 + frontmatter인가**: 학습자가 메모장으로 열어도 읽힌다. 텍스트 에디터 호환. AGENTS.md 패턴과 일관.

---

## baseline.md

```yaml
---
date: 2026-05-26
mode: voice
duration_sec: 9
word_count: 7
audio: _internal/audio/2026-05-26-baseline.mp3
---

## 학습자가 한 말 (그대로)
"My name is Jieun. I... I like coffee."

## 자연스러운 변형 (Phase 5에서 들려준 것)
"I'm Jieun, and I'm a coffee person."

## 다음 비교 시점
- +30 days: 첫 mirror에서 학습자와 같이 들음
- +90 days: 분기 milestone
- +365 days: 1년 마일스톤
```

이 파일은 **학습자도 봐도 OK**. 학습자가 "내가 처음에 뭐라고 했더라?" 궁금해서 열면 그게 학습이다. 단, 백그라운드 분석 (망설임 횟수 등)은 여기 안 적힘. 그건 `_internal/`.

---

## progress.json (모델이 매 세션 참조)

```json
{
  "version": 2,
  "started": "2026-05-26",
  "last_session": "2026-05-26",
  "days_active": 1,
  "days_total": 1,
  "current_streak": 1,
  "longest_streak": 1,

  "mvp_session_metrics": {
    "utterance_word_count": { "today": 7, "week_avg": 7 },
    "english_word_ratio": { "today": 1.0, "week_avg": 1.0 },
    "attendance": { "today": true, "days_active": 1, "days_total": 1 },
    "voluntary_speaking_seconds": { "today": 9, "week_total": 9 },
    "new_vocabulary_count": { "today": 5, "week_total": 5 }
  },

  "monthly_optional_metrics": {
    "speaking_rate_wpm": null,
    "disfluency_rate": null,
    "mtld": null,
    "mlu": null,
    "tense_diversity": null,
    "top_patterns": [],
    "self_reported_confidence": null,
    "weak_words": []
  },

  "vocabulary": {
    "unique_words": 5,
    "by_level": { "a1": 5, "a2": 0, "b1": 0, "b2": 0, "c1": 0 },
    "new_today": 5
  },
  
  "patterns_tried": {
    "self_introduction": 1,
    "i_like_X": 1
  },
  
  "errors": {
    "pending": [],
    "resolved": [],
    "recurring": []
  },
  
  "weekly_targets": [],
  "monthly_milestones": [],
  
  "voice_samples": [
    {
      "date": "2026-05-26",
      "type": "baseline",
      "duration_sec": 9,
      "word_count": 7,
      "audio_path": "_internal/audio/2026-05-26-baseline.mp3"
    }
  ],
  
  "flags": {
    "high_anxiety": false,
    "self_labeling": true,
    "voice_locked_until": null,
    "playful": false
  }
}
```

`version: 1`은 폐기한다 (D100). 매 세션 Stop hook은 `mvp_session_metrics`의 5개 지표만 안정적으로 업데이트한다. `monthly_optional_metrics`는 Day 30 이후 monthly mirror나 학습자 명시 요청 시 채운다.

**누가 읽나**:
- 모델: SessionStart hook에서 매번 (요약된 형태로 컨텍스트 주입)
- 학습자: 자기 진도 보려고 가끔. 또는 mirror가 이 파일을 시각화해서 보여줌

**누가 쓰나**:
- Stop hook이 매 세션 후 업데이트
- 학습자는 직접 안 씀 (필요시 가능하긴 함)

---

## 세션 일지 — sessions/YYYY-MM-DD-day-N.md

```yaml
---
date: 2026-05-26
day: 0
type: onboarding
duration_min: 5
mode: voice+text
partner_name: Sol
---

## 오늘 한 일
- Onboarding 인터뷰 (한국어)
- 베이스라인 영어 1문장 녹음
- 목표 등록: "외국인 만나도 안 도망가고 싶다"
- 매일 시간 등록: 오전 8시

## 학습자의 발화 (영어)
- "My name is Jieun. I... I like coffee."

## 학습자에게 보여준 것
- 자연스러운 변형: "I'm Jieun, and I'm a coffee person."
- (외울 필요 없다고 명시)

## 학습자가 한 약속
- 매일 오전 8시 다시 만나기
- 한 달 뒤 baseline 같이 비교

## 내일 (Day 1)
- 08:00 알림
- 알림 메시지: "Good morning. Yesterday: 'I like coffee.' What kind?"
- 모드: voice 우선, 텍스트 fallback
- 목표 발화: 1-2 단어 답이라도 충분
```

학습자가 며칠 후 본인 일지를 열어보는 행위 자체가 학습 의식의 일부. 그래서 일지는 학습자가 읽기 좋은 형태로 쓴다 (raw 분석 X, 정제된 서사).

---

## _internal/session_errors.md (학습자 안 보는 raw 분석)

```markdown
# Session Error Log
(이 파일은 평소 학습자에게 안 보여줌. 한 달 mirror에서 일부만 정제되어 노출됨.)

## 2026-05-26 (Day 0)

발화: "My name is Jieun. I... I like coffee."

### 발견
- 망설임 마커 2회 ("I... I")
- 문법 오류 0
- 자기소개 패턴 시도 (success)
- 발음 분석: 권한/안정화 미확인으로 스킵

### 다음 mirror 후보
- (Day 0은 데이터 부족, 후보 0)

### 모델 메모
- 학습자 첫 발화가 망설임 있음 — Day 1~7 동안 안전망 충분히
- 어휘 레벨 A1 — 분량 절대 늘리지 말 것
```

---

## _internal/vocab_seen.json

```json
{
  "my":      { "first_seen": "2026-05-26", "count": 1, "level": "a1" },
  "name":    { "first_seen": "2026-05-26", "count": 1, "level": "a1" },
  "is":      { "first_seen": "2026-05-26", "count": 1, "level": "a1" },
  "jieun":   { "first_seen": "2026-05-26", "count": 1, "type": "proper_noun" },
  "i":       { "first_seen": "2026-05-26", "count": 1, "level": "a1" },
  "like":    { "first_seen": "2026-05-26", "count": 1, "level": "a1" },
  "coffee":  { "first_seen": "2026-05-26", "count": 1, "level": "a1" }
}
```

**용도**:
- 매주 mirror에서 "이번 주 새로 시도한 어휘" 추출
- 한 달 뒤 "본인 표현 사전" 자동 생성 (high count 어휘)
- 망각 곡선 — 오래 안 본 어휘는 다음 세션 토픽에 자연스럽게 등장

---

## _internal/patterns.json

학습자가 자주 시도하는 표현 패턴 (정형화된 템플릿).

```json
{
  "templates": [
    {
      "pattern": "My name is X",
      "first": "2026-05-26",
      "count": 1,
      "success_rate": 1.0
    },
    {
      "pattern": "I like X",
      "first": "2026-05-26",
      "count": 1,
      "success_rate": 1.0
    }
  ],
  "recurring_errors": [
    // 예: { "pattern": "should + 동사원형 (대신 should have + p.p.)", "count": 3, "first": "2026-06-15" }
  ],
  "favorite_topics": ["coffee"]
}
```

**핵심 용도**: 한 달 mirror의 "당신이 자주 쓰는 표현 3개" 자동 추출.

---

## _internal/flags.json

운영 플래그. 모델의 톤/접근 조정 신호.

```json
{
  "high_anxiety": false,
  "self_labeling": true,
  "voice_locked_until": null,
  "playful": false,
  "preferred_topics": ["coffee", "morning routine"],
  "avoided_topics": [],
  "trauma_words": []
}
```

- `self_labeling: true` → 학습자가 "저 영포자예요" 같은 자기비하. 모델은 그 라벨을 받지 않고 회피
- `high_anxiety: true` → 모든 분기에서 안전망 1회 더
- `voice_locked_until: D+7` → 음성 권한 거부 후 1주일 권유 봉인
- `trauma_words: ["발음"]` → 특정 단어가 학습자 트리거. 모델이 그 단어 사용 절제

---

## mirror 파일 — 학습자가 읽는 정제본

```markdown
# Week 1 Mirror (2026-06-02)

지은님, 첫 주 같이 했어요. 짧게 보여드릴게요.

## 이번 주 한 마디로
- 총 5일 만났어요
- 가장 길게 말한 날: 5월 30일 (about 22 words)
- 그날 토픽: morning coffee

## 자주 시도한 표현 3개
1. "I like X" (5번)
2. "It's a X morning" (3번)
3. "I had X" (2번)

## 한 가지 발견
"커피"라는 단어가 매일 등장했어요. 다음 주에 그쪽으로 어휘 좀 더 늘려볼까요? 끄덕여도 되고, 다른 방향으로 가자고 해도 돼요.

## 다음 주
같은 시간, 같은 방식. 5분.
```

**원칙**:
- raw 데이터 그대로 X. 학습자가 읽고 싶은 형태로
- 1-3개 발견만. 너무 많으면 부담
- 항상 학습자 선택권 ("끄덕여도 되고, 다른 방향이어도 OK")
- 평가 톤 0

---

## hook들이 데이터를 다루는 방식

### SessionStart hook
- `profile.md` 읽음
- `progress.json` 읽음 (요약 추출)
- 최근 3-5개 일지 요약 추출
- `flags.json` 읽음
- 위 모두를 ~500 토큰으로 압축 → `additionalContext`로 모델에 주입

### UserPromptSubmit hook (옵션)
- 사용자가 한국어 톤 + 영어 시도 섞을 때 추가 안내 주입

### Stop hook
- 세션 일지 생성 (`sessions/YYYY-MM-DD-...md`)
- `progress.json` 업데이트
- `_internal/vocab_seen.json` 어휘 추가
- `_internal/patterns.json` 패턴 추가
- `_internal/flags.json` 플래그 업데이트
- (필요 시) `_internal/session_errors.md` 추가
- 다음 세션 알림 메시지 미리 계산해서 저장

### Weekly cron (Day 7, 14, 21, ...)
- mirror 파일 생성
- 다음 주 운영 노트 (예: 어휘 확장 방향)

---

## 데이터 마이그레이션과 백업

학습자가 다른 디바이스로 옮기거나 우리 제품을 떠나도 학습은 유지된다:

- `~/english-learning/` 전체를 통으로 복사하면 끝
- iCloud / Dropbox / Drive 동기화 자동 작동 (텍스트 위주라 용량 작음)
- 오디오 파일이 큰 경우 학습자가 별도 압축 가능
- 우리 제품이 사라져도: 학습자는 본인 일지를 텍스트 에디터로 읽을 수 있다. 다음 도구로 import할 수 있다.

이게 매니페스토 5번의 구체 실행.

---

## 다음 — 구현 단계

이 데이터 구조가 잡혀야 다음이 가능:
- AGENTS.md 페르소나 시드 작성 (이 데이터를 모델이 어떻게 읽는지 명시)
- SessionStart hook 스크립트 작성
- Stop hook 스크립트 작성
- progress.json 스키마 검증 도구
