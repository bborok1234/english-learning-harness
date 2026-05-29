# English Learning Harness

[한국어](README.md) | [English](README.en.md)

한국인을 위한 Codex-native 영어 회화 학습 하네스.

North star: **AI 파트너와 편안하게 영어로 대화하는 능력.**

이 제품은 학습자가 `node` 명령어를 직접 치는 CLI가 아닙니다. 학습자가 보는 표면은 **Codex와의 대화**입니다. GitHub 주소를 Codex에 붙여넣으면 Codex가 하네스 skill을 설치하고, 그 다음부터 매일 영어 회화 연습은 자연어 대화로 진행됩니다.

현재 1차 버전은 text/transcription-first입니다. 안정적인 realtime voice command가 아직 local Codex CLI에 없기 때문에 실시간 음성 대화는 기본 경로로 주장하지 않습니다.

## Codex에 붙여넣기

Codex를 열고 아래 프롬프트를 붙여넣으세요.

```text
Install English Learning Harness from:
https://github.com/bborok1234/english-learning-harness

Use the repo setup script to install the Codex skills, then start my first 5-minute English speaking practice.
Do not ask me to clone the repo or run Node commands manually. You operate the harness and local engine for me.

내 이름은 지은이야.
영어로 말해야 할 때 자주 얼어붙어.
부드럽게 고쳐주고, 실제로 다시 쓸 수 있는 표현을 남겨줘.
```

Codex가 skill 설치, 학습자 설정, 첫 연습, progress 저장, mini mirror까지 처리해야 합니다. 학습자가 할 일은 스크립트를 조작하는 것이 아니라 Codex의 질문에 영어로 대답하는 것입니다.

이미 이 repo 안에서 Codex를 쓰고 있다면 짧게 이렇게 말해도 됩니다.

```text
이 repository를 내 English Learning Harness로 사용해.
필요하면 Codex skills를 설치하고, 오늘 5분 영어 회화 연습을 시작해줘.
나는 대화만 할게. 진행 기록 저장이 필요하면 local engine은 네가 내부적으로 실행해.
```

## 이렇게 말하면 됩니다

```text
오늘 5분 영어 회화 연습 시작하자. 너무 어렵게 하지 말고 한 질문씩 해줘.
```

```text
어제 내가 틀렸던 표현을 하나만 다시 연습시켜줘.
```

```text
카페에서 주문하는 상황으로 연습하자. 내가 막히면 쓸 수 있는 rescue phrase도 줘.
```

```text
방금 연습한 걸 mini mirror로 정리해줘. 내가 실제로 다음에 써볼 한 문장만 남겨줘.
```

```text
이번 주 내 영어 회화 진행 상황을 보여줘. 좋아진 점, 반복되는 막힘, 다음 focus를 알려줘.
```

## Codex가 해주는 일

하네스가 제대로 작동하면 Codex는 튜터이자 운영자입니다.

- 학습자 프로필을 만들거나 갱신합니다.
- 한 번에 한 가지 쉬운 질문만 던집니다.
- 말하는 중에는 과하게 문법 설명을 하지 않고 부드럽게 recast합니다.
- 세션 증거를 로컬에 저장합니다.
- 유용한 표현과 반복되는 막힘을 기억합니다.
- 복습할 표현과 다음 상황 연습을 제안합니다.
- 연습 후 mini mirror를 만듭니다.
- 주간 mirror로 학습 흐름을 보여줍니다.
- 필요하면 learner home page를 로컬에 생성합니다.

이 repo의 스크립트는 그 경험 아래에서 움직이는 엔진입니다. Codex, maintainer, setup, verification을 위한 것이지 학습자가 직접 조작해야 하는 제품 표면이 아닙니다.

## 누구를 위한 제품인가

- 영어를 읽을 수는 있지만 막상 말하려면 얼어붙는 한국인 학습자
- 학원/앱보다 더 자주, 더 낮은 부담으로 영어 output을 만들고 싶은 사람
- Codex를 코딩뿐 아니라 영어 회화 파트너로 쓰고 싶은 사람
- AI-native 언어 학습 하네스를 직접 고치고 확장하고 싶은 builder

이건 강의 목록 앱, streak 앱, 일반 챗봇이 아닙니다. 매일 조금씩 영어로 말하고, 쓸만한 표현을 남기고, 내 진행 과정을 다시 보게 해주는 로컬 우선 학습 하네스입니다.

## 매일 학습 루프

1. Codex가 local learner memory를 읽고 오늘의 focus를 제안합니다.
2. 학습자가 짧은 spoken-style English로 대답합니다.
3. Codex가 한 번에 하나씩 부드러운 follow-up을 줍니다.
4. 마지막에 mini mirror를 남깁니다: 전달한 것, 자연스러운 recast, 다음에 써볼 표현.
5. 유용한 표현과 반복되는 막힘은 나중에 다시 복습됩니다.
6. weekly mirror가 흩어진 세션을 하나의 학습 여정으로 보여줍니다.

목표는 오늘 완벽한 영어를 하는 것이 아닙니다. 목표는 더 빨리 시작하고, 막혔을 때 수리하고, 질문을 이어가고, 내 표현을 다시 쓰며, 증거를 통해 나아지는 감각을 갖는 것입니다.

## 회화 능력에 도움이 되는 방식

- **낮은 부담의 output 반복:** 짧은 세션으로 완벽하지 않은 영어를 매일 꺼낼 수 있습니다.
- **부드러운 correction:** 문법 강의보다 recast, repair prompt, next attempt를 우선합니다.
- **개인 phrase memory:** 내가 실제로 쓴 표현과 고친 표현이 복습 재료가 됩니다.
- **상황 기반 연습:** Codex가 learner model과 history를 바탕으로 오늘의 scenario를 제안합니다.
- **Mini mirror:** 매 세션 후 무엇을 전달했고 다음에 무엇을 시도할지 짧게 남깁니다.
- **Weekly mirror:** 여러 날의 연습을 묶어 반복 패턴과 다음 focus를 보여줍니다.
- **Multimodal-ready evidence:** text, transcript-backed voice, image information-gap event가 같은 interaction-event 구조를 공유합니다.

## 무엇이 기록되나

학습자 데이터는 기본적으로 로컬에 저장됩니다.

```text
~/english-learning/
├── profile.md
├── progress.json
├── learner-model.json
├── vocabulary.json
├── review-queue.json
├── home.html
├── journal/
└── artifacts/
    ├── sessions/
    └── weekly/
```

기록되는 것은 다음과 같습니다.

- 이름, 동기, 선호 correction style
- session count, date, MVP progress metrics
- journal과 session artifact
- vocabulary와 phrase history
- review queue 상태
- learner model signal
- weekly mirror
- local validation export

## 첫 세션 후 기대하는 느낌

첫 Codex-led session 뒤에는 다음이 있어야 합니다.

- 로컬 learner root 아래 학습자 프로필
- 저장된 practice artifact
- 업데이트된 progress file
- 세션을 설명하는 mini mirror
- 다음 연습 제안
- 선택적으로 열어볼 수 있는 `home.html` journey view

경험은 단순해야 합니다. 조금 말하고, 유용한 mirror를 받고, 표현 하나를 남기고, 내일 다시 돌아옵니다.

## Privacy

기본 학습 상태는 내 컴퓨터의 `~/english-learning/` 아래에 저장됩니다. 음성, transcript, journal, 개인 정보는 의도적으로 공유하기 전까지 GitHub issue에 올리지 마세요.

## 현재 한계

- Realtime voice conversation은 아직 기본 경로로 주장하지 않습니다.
- Accent scoring은 구현되어 있지 않습니다.
- Image practice는 local prompt context와 learner output을 저장하지만, 완전한 computer-vision tutor라고 주장하지 않습니다.
- Public Git-backed install remains unverified and should not be documented as the default install path yet.
- 실제 장기 회화 능력 향상은 fixture smoke가 아니라 real multi-day learner use로 검증해야 합니다.

## Codex Skill Surface

이 repo는 다음 Codex skill을 제공합니다.

- `english-onboarding`
- `english-daily-session`
- `english-mini-mirror`
- `english-picture-description`

Skill contract: 학습자는 계속 대화 안에 두고, durable state가 필요하면 local engine은 Codex가 내부적으로 실행합니다. ordinary learning을 command-line chore로 만들지 않습니다.

설치 후 Codex skill은 다음 위치에 놓입니다.

```text
~/.codex/skills/english-learning-onboarding
~/.codex/skills/english-learning-daily-session
~/.codex/skills/english-learning-mini-mirror
~/.codex/skills/english-learning-picture-description
```

## Agent Install Details

위 install prompt는 Codex가 내부적으로 아래와 같은 작업을 하도록 의도되어 있습니다.

```bash
mkdir -p ~/.english-learning-harness
git clone --single-branch --depth 1 https://github.com/bborok1234/english-learning-harness.git ~/.english-learning-harness/repo
~/.english-learning-harness/repo/setup --host codex
```

이미 repo가 있다면 두 번째 clone을 만들지 말고 업데이트합니다.

```bash
cd ~/.english-learning-harness/repo
git pull --ff-only
./setup --host codex
```

이것은 agent-operated install path입니다. 학습자가 직접 타이핑할 필요가 없습니다.

## Maintainer용 내부 엔진

Command wrapper는 local persistence와 verification engine입니다. maintainer, smoke test, debugging에는 유용하지만 학습자용 제품 표면은 아닙니다.

별도 테스트 learner가 필요하면 `ENGLISH_LEARNING_HOME` 또는 `--learner-root`를 사용합니다.

Internal setup and practice commands:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

Transcript file:

```bash
node scripts/english-learning-harness.mjs today --transcript path/to/transcript.txt
```

Transcription-first voice practice:

```bash
node scripts/english-learning-harness.mjs voice \
  --transcript path/to/voice-transcript.txt \
  --audio-file path/to/local-audio.wav \
  --json
```

Image information-gap practice:

```bash
node scripts/english-learning-harness.mjs image \
  --image-file path/to/local-image.png \
  --hidden-detail "the wallet is partly hidden near the cup" \
  --clarification-prompt "Where is the wallet compared with the cup?" \
  --say "The cup is on the left." \
  --json
```

Review and mirror:

```bash
node scripts/english-learning-harness.mjs review --json
node scripts/english-learning-harness.mjs review \
  --review-id phrase-i-like-drinking-coffee \
  --result success
node scripts/english-learning-harness.mjs vault --json
node scripts/english-learning-harness.mjs weekly --json
```

Health:

```bash
node scripts/english-learning-harness.mjs health --json
node scripts/english-learning-harness.mjs status --json
node scripts/validate-progress.mjs ~/english-learning/progress.json
```

## Native Codex Hooks

Native hooks are optional and not required for the learner-facing Codex conversation path.

P0-2 did not prove automatic plugin-scoped hook execution for this plugin, and PH1-FIX-1 found Codex hook trust-state limitations. Use native hooks only after accepting that hook trust-state may require manual intervention in the local Codex environment.

Stop hook contract: the Stop hook records a marker and emits context only. Session finalization, journal writes, artifacts, metrics, vocabulary, and review queue updates are owned by the internal session engine.

```bash
node scripts/install-native-hooks.mjs --print
node scripts/install-native-hooks.mjs --install --target /tmp/english-learning-hooks.json
node scripts/install-native-hooks.mjs --install
node scripts/install-native-hooks.mjs --uninstall
```

## Local Marketplace Package

Local marketplace packaging is available for isolated plugin install testing:

```bash
node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace
CODEX_HOME="$PWD/tmp/codex-home" codex plugin marketplace add "$PWD/tmp/english-learning-marketplace"
CODEX_HOME="$PWD/tmp/codex-home" codex plugin add english-learning-harness@english-learning-local
CODEX_HOME="$PWD/tmp/codex-home" codex plugin list
```

The verified install claim is local marketplace packaging only: a clean repository can package the plugin into a local marketplace root, install that marketplace into an isolated `CODEX_HOME`, and list the plugin as installed/enabled.

## Public Distribution

The primary open-source distribution path is this source repository:

```bash
git clone https://github.com/bborok1234/english-learning-harness.git
cd english-learning-harness
node scripts/english-learning-harness.mjs setup --json
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

Before claiming public distribution, verify a default public clone:

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
```

The tarball artifact path remains optional for release assets or mirrors:

```bash
node scripts/package-public-artifact.mjs --target tmp/public-artifact
tar -xzf tmp/public-artifact/english-learning-harness-public.tar.gz -C tmp/public-artifact
cd tmp/public-artifact/english-learning-harness
node scripts/english-learning-harness.mjs setup --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
```

This proves artifact mechanics only after `node scripts/phase7-public-artifact-smoke.mjs` passes. It does not prove public hosting or public download until the artifact is actually published.

## Open Source

- License: `LICENSE`
- Contributing guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Support guidance: `SUPPORT.md`
- Governance notes: `GOVERNANCE.md`

## Maintainer Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase7-agent-install-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase6-public-clean-clone-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase7-open-source-history-audit-smoke.mjs
node scripts/phase7-publication-preflight.mjs
node scripts/phase1-scaffold-smoke.mjs
node scripts/generate-dashboard.mjs
```
