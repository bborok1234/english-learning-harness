맞아. 내 실수야. 아래가 처음 생성했던 원문 그대로야.

# 디자인 목표: Codex 기반 영어 학습용 에이전트 하네스
## 1. 연구 요약 및 사용 가능한 도구
### Codex 하네스의 기본 개념
* **에이전트 루프** – Codex/Claude Code 등의 코딩 에이전트는 단순한 반복 루프를 사용한다. `turn.rs` 의 의사 코드에 따르면 에이전트는 대화 내역을 모아 LLM에 전달하고, 도구 호출 응답이면 실행하여 결과를 기록한 뒤 반복한다 [oai_citation:0‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176). 복잡한 별도의 추론엔진이 없으며, 반복되는 LLM 호출과 도구 실행으로 ‘에이전트적’ 행동이 나온다.
* **프롬프트 계층화** – Codex 하네스는 시스템 인스트럭션을 계층화해 모델에 전달한다. 기본 지침(모델 성격), `<user_instructions>` 태그로 감싼 사용자 지침, 스킬 지침(필요에 따라 추가), 연결된 도구의 앱/플러그인 지침을 레이어로 쌓아 `instructions` 필드에 전달한다 [oai_citation:1‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176). 이 방식은 기본 프롬프트를 오염시키지 않고 상황별 지침을 삽입할 수 있다.
* **대화 내역 관리** – 대화 내역(`input` 배열)은 사용자 메시지, 어시스턴트 메시지, 함수 호출 및 결과 등 구조적 요소를 보존한다. 도구 호출과 결과는 `call_id` 로 연결되며 모델이 인과관계를 이해하도록 한다 [oai_citation:2‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176).
* **도구 정의** – 도구는 JSON-Schema로 정의되며, 하네스는 권한과 컨텍스트에 따라 도구 목록을 동적으로 조정한다 [oai_citation:3‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176). 답변 스트림에서는 `parallel_tool_calls` 와 `tool_choice` 등 Responses API 기능을 활용해 여러 도구 호출을 병렬 실행할 수 있다 [oai_citation:4‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176).
* **컨텍스트 관리** – 하네스는 메시지 길이를 추정하고 모델의 컨텍스트 한도에 가까워지면 자동으로 대화를 요약해 새 히스토리로 교체한다 [oai_citation:5‡medium.com](https://medium.com/jonathans-musings/inside-the-agent-harness-how-codex-and-claude-code-actually-work-63593e26c176). 이는 장기 세션에서 중요하다.
### 음성/텍스트-음성(STT/TTS) 기능
* **STT – 정적 파일 및 스트리밍**  
  * `gpt-4o-mini-transcribe` / `gpt-4o-transcribe`는 파일 기반 또는 요청-응답 워크플로에 적합하다. 스트리밍 대역이 필요할 경우 `stream=True` 파라미터를 통해 처리할 수 있으며 모델은 파일의 일부를 완성하는 즉시 `transcript.text.delta` 이벤트를 반환한다 [oai_citation:6‡developers.openai.com](https://developers.openai.com/api/docs/guides/speech-to-text).  
  * **실시간(Realtime) STT** – `gpt-realtime-whisper` 모델은 WebSocket/WebRTC 세션에서 실시간 스트리밍과 낮은 지연 시간에 최적화되어 있다 [oai_citation:7‡developers.openai.com](https://developers.openai.com/api/docs/guides/realtime-transcription).  세션은 `type: "transcription"`으로 시작하며 `audio.input.transcription.model` 필드에 `gpt-realtime-whisper`를 설정한다 [oai_citation:8‡developers.openai.com](https://developers.openai.com/api/docs/guides/realtime-transcription).  
    - `audio.input.transcription.delay` 값(`minimal`, `low`, `medium`, `high`, `xhigh`)으로 지연-정확도 트레이드오프를 조정한다 [oai_citation:9‡developers.openai.com](https://developers.openai.com/api/docs/guides/realtime-transcription). 
    - 실시간 세션은 오디오 버퍼를 `input_audio_buffer.append` 로 보내고, 턴 경계 감지가 비활성화된 경우 `input_audio_buffer.commit` 메시지로 전송을 완료한다 [oai_citation:10‡developers.openai.com](https://developers.openai.com/api/docs/guides/realtime-transcription).  
    - 모델은 `conversation.item.input_audio_transcription.delta` 이벤트로 부분 문장을, `...completed` 이벤트로 완전한 전사를 전송한다 [oai_citation:11‡developers.openai.com](https://developers.openai.com/api/docs/guides/realtime-transcription).  
  * STT 모델은 흔치 않은 단어를 잘 인식하지 못할 수 있다. Whisper 기반 모델에서는 `prompt` 파라미터를 사용해 핵심 단어를 포함한 짧은 키워드 리스트를 전달하여 정확도를 높일 수 있다 [oai_citation:12‡developers.openai.com](https://developers.openai.com/api/docs/guides/speech-to-text).
* **TTS – gpt-4o mini TTS**  
  * `gpt-4o-mini-tts` 모델은 최적화된 TTS 서비스로, 13가지 음성(`alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `nova`, `onyx`, `sage`, `shimmer`, `verse`, `marin`, `cedar`)과 속도 조절 옵션을 제공한다 [oai_citation:13‡developers.openai.com](https://developers.openai.com/api/docs/guides/text-to-speech). `marin` 또는 `cedar` 음성이 가장 자연스럽게 들린다는 권고가 있다 [oai_citation:14‡developers.openai.com](https://developers.openai.com/api/docs/guides/text-to-speech).  
  * 요청에서 `voice` 매개변수와 `speed`, `instructions`(감정, 억양 등을 조절) 등을 지정할 수 있으며, 스트리밍 방식(`with_streaming_response`)을 사용하면 음성을 다운로드하지 않고 바로 재생할 수 있다 [oai_citation:15‡developers.openai.com](https://developers.openai.com/api/docs/guides/text-to-speech).
### 하네스의 도구 확장
* **스킬(Skills)** – Codex는 특정 작업을 위한 스킬 파일을 통해 지침과 보조 스크립트를 캡슐화한다. 스킬은 전역 또는 프로젝트 로컬 위치에 저장할 수 있으며, 자연어 또는 `/skill` 명령으로 불러올 수 있다 [oai_citation:16‡mindstudio.ai](https://www.mindstudio.ai/blog/openai-codex-super-app-9-hidden-features). 이는 교육용 루틴을 재사용 가능한 모듈로 관리하는 데 적합하다.
* **Agents.md** – 프로젝트 맥락(사용자 설정, 제약 등)을 설명하는 `agents.md` 파일을 추가해 에이전트가 작업 환경을 이해하도록 할 수 있다 [oai_citation:17‡mindstudio.ai](https://www.mindstudio.ai/blog/openai-codex-super-app-9-hidden-features).
* **Plan mode** – 코드를 실행하지 않고 계획만 세우도록 강제하는 “Plan mode”가 제공되며, 위험한 명령 실행을 방지하거나 학습 계획을 브레인스토밍할 때 유용하다 [oai_citation:18‡mindstudio.ai](https://www.mindstudio.ai/blog/openai-codex-super-app-9-hidden-features).
* **GPT-Image-2 통합** – Codex는 GPT-Image-2를 통해 화면 스케치, 상황극용 배경 그림, 플래시 카드 일러스트 등을 생성하고 프로젝트 디렉터리에 저장할 수 있다 [oai_citation:19‡mindstudio.ai](https://www.mindstudio.ai/blog/openai-codex-super-app-9-hidden-features).
### Harness Engineering 관점
* **Harness = 에이전트의 런타임** – 코드 에이전트의 성능은 모델뿐 아니라 하네스(도구, 스킬, MCP 서버, 컨텍스트 관리 등)의 구성에 크게 좌우된다 [oai_citation:20‡humanlayer.dev](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents). 잘 설계된 하네스는 반복적으로 나타나는 실패를 해결하고 에이전트의 성공률을 높인다 [oai_citation:21‡humanlayer.dev](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents).
* **컨텍스트 엔지니어링** – 스킬, MCP 서버, 서브-에이전트, 후크 등을 통해 프롬프트와 컨텍스트를 체계적으로 설계하는 접근이다 [oai_citation:22‡humanlayer.dev](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents). 영어 학습 하네스를 만들 때도 이러한 원칙을 적용해 사용자 맞춤형 맥락과 도구 구성을 설계해야 한다.
## 2. 영어 학습 하네스 설계
### 2.1 목표와 원칙
* **목표** – 사용자가 매일 AI와 함께 영어 실력을 향상시키도록 돕는 에이전트. 학습 환경은 사용자 수준과 관심사에 적응하며, 음성 대화·읽기·쓰기·상황극 등 다양한 학습 형태를 지원한다.
* **유연한 도구 조합** – 기존 교재 위에 AI를 얹는 것이 아니라, STT, TTS, 이미지 생성, 코드/문서 편집 등 다양한 도구를 제공하고 에이전트가 필요에 따라 조합한다. 이는 개발 업무에서 느낀 ‘엄격한 워크플로는 AI의 가능성을 제한한다’는 교훈을 반영한다.
* **사용자 맞춤형 맥락** – Agents.md, 스킬, 학습 프로파일을 통해 학습자의 레벨, 관심사, 목표를 캡처하고 컨텍스트 관리 기능으로 대화 기록을 요약하여 부담 없는 길이로 유지한다.
* **학습 일지 및 아티팩트 저장** – GitHub 레포를 “학습 일지 저장소”로 활용하여 세션 로그, 발음 피드백, 역할극 스크립트, 생성된 이미지 등을 저장하고 버전 관리한다.
### 2.2 아키텍처 개요
**1. 파일 구조** (예시)
```txt
english-learning-harness/
├─ agents.md              # 하네스의 기본/사용자 지침
├─ skills/
│   ├─ roleplay.md        # 역할극 스킬 정의
│   ├─ grammar_review.md  # 문법 교정 스킬
│   ├─ vocabulary.md      # 어휘 퀴즈 생성 스킬
│   └─ …
├─ learning-profile.md    # 사용자의 목표·레벨·불안 포인트를 기록
├─ daily-log/
│   └─ 2026-05-26.md      # 오늘 세션 기록, 성과, 발음 오류 등
├─ sessions/
│   └─ recruiter-call-001.md # 특정 상황극의 스크립트와 교정 내용
├─ artifacts/
│   ├─ audio/
│   ├─ images/
│   └─ transcripts/
└─ progress.json          # 어휘/회화 능력 발전을 추적하는 요약

2. 에이전트 기본 설정 (agents.md)

agents.md에는 다음 내용을 포함한다:

* 역할 정의 – “너는 맞춤형 영어 튜터로서, 학습자의 직업·목표·선호를 참고해 매 세션을 설계한다.”
* 도구 설명 – STT(gpt-realtime-whisper 또는 gpt-4o-transcribe), TTS(gpt-4o-mini-tts), 이미지 생성(GPT-Image-2), 파일 편집, 버추얼 화이트보드 등 이용 가능한 도구와 용도 설명.
* 안전 및 승인 정책 – 시스템 명령 실행, 외부 API 호출 등에 대한 승인 규칙.
* 학습 원칙 – 짧은 질문–응답 루프 유지, 긍정적 피드백 제공, 사용자가 불안해하지 않도록 비판보다 교정에 집중 등.

3. 스킬 정의 (skills/roleplay.md 등)

스킬은 특정 학습 활동을 캡슐화한다. 예:

* roleplay.md – 상황극 생성 스킬. 입력(상황·역할·난이도)을 받아 GPT-Image-2로 배경 이미지를 생성하고, 에이전트가 대화 시나리오를 구성한다. 학습자 발화는 STT로 인식하고, 에이전트는 TTS로 응답한다. 대화 종료 후 스크립트와 발음·문법 오류를 정리하여 sessions/에 저장한다.
* grammar_review.md – 사용자가 작성한 문장/이메일을 분석하여 오류를 설명하고 수정한 버전을 제공한다. 수정 과정은 Plan mode로 실행해 학습자가 확인한 뒤 적용되도록 한다.
* vocabulary.md – 최근 대화에서 학습자가 낯설어한 단어를 기록하고, 다음 세션에서 플래시 카드나 퀴즈 형태로 복습한다.
* pronunciation.md – STT의 logprobs 출력을 사용하여 발음이 틀린 단어를 감지하고, TTS의 느린 속도(speed 옵션)를 활용해 정확한 발음을 재생한다.

스킬 파일은 YAML/markdown 구조로 지침과 예제 프롬프트, 도구 호출 스크립트를 포함할 수 있다. Codex는 이러한 스킬을 자연어 명령이나 /skill roleplay 형태로 불러온다 ￼.

4. 세션 흐름 예 (리크루터 전화 시뮬레이션)

1. 사용자 상태 읽기: learning-profile.md와 이전 세션 요약을 불러와 학습자의 직업, 영어 수준, 최근 어려움을 파악한다.
2. STT 모델 결정:  실시간 대화를 원하면 gpt-realtime-whisper를 사용하고, 음성 파일 전송 후 피드백을 제공하는 경우 gpt-4o-transcribe를 사용한다 ￼.
    * 실시간 모드에서는 delay를 medium으로 설정해 적당한 지연과 정확도를 유지하고 필요 시 minimal로 낮춰 인터랙션을 부드럽게 만든다 ￼.
3. 역할극 준비: roleplay 스킬을 호출하여 채용 담당자 역의 대사와 예상 질문을 생성하고, GPT-Image-2로 가상의 회의실 이미지를 생성하여 몰입감을 높인다 ￼.
4. 대화 진행: 학습자의 발화를 STT로 받아 부분 전사를 델타 이벤트로 표시하고, 에이전트는 TTS를 통해 응답한다. 에이전트는 문법/어휘 오류를 즉시 수정하지 않고 메모리에 기록해 대화 흐름을 끊지 않는다.
5. 세션 정리: 대화가 끝나면 에이전트는 오류 목록과 수정된 표현을 sessions/recruiter-call-001.md에 저장하고, TTS로 요약을 읽어준다. progress.json을 업데이트해 사용자가 자주 틀리는 패턴과 개선 점수를 기록한다.
6. 후속 학습 제안: 다음 세션을 위한 목표(예: 발음 교정, 특정 어휘 복습)를 제안하고 스케줄링 기능(자동화 도구 또는 캘린더 통합)을 이용해 리마인더를 설정한다.

2.3 기술 세부 사항

1. STT 구성
    * gpt-4o-transcribe/gpt-4o-mini-transcribe 호출 시 response_format="text"와 stream=True를 사용하면 부분 전사를 바로 받을 수 있으며, transcript.text.delta 이벤트에서 부분 텍스트를 처리할 수 있다 ￼.
    * gpt-realtime-whisper 세션에서는 audio.input.transcription.model에 모델 이름을 지정하고 language 힌트를 주며, delay 값으로 지연을 조절한다 ￼.  오디오 버퍼를 input_audio_buffer.append 하고, 필요 시 commit 메시지를 전송해 턴을 끝낸다 ￼.
    * 전문 용어 인식이 필요한 경우 prompt 파라미터에 키워드 목록을 제공하여 Whisper 계열 모델의 정확도를 개선한다 ￼.
2. TTS 구성
    * gpt-4o-mini-tts는 기본 모델이며, voice 파라미터로 13가지 음성 중 선택할 수 있다 ￼. 한국인 학습자에게는 듣기 편한 marin 또는 cedar 음성이 권장된다 ￼.
    * 속도 조절(speed)과 instructions(톤/감정)으로 발음 연습, 강조, 감정 표현을 구체적으로 설정한다. 예를 들어 슬로우 모드로 정확한 발음 샘플을 제공하고, 빠른 속도로 실전 듣기 연습을 할 수 있다.
    * 스트리밍 모드(with_streaming_response=True)를 사용하면 대사 길이가 길어도 지연 없이 재생할 수 있어 대화형 학습에 적합하다 ￼.
3. 컨텍스트 및 기억 관리
    * Codex 하네스의 ContextManager는 메시지 길이를 추정하고 필요 시 대화 요약을 수행해 토큰 사용량을 관리한다 ￼.  영어 학습처럼 반복 세션이 잦은 경우, 하루 단위나 주제별로 요약을 저장해 장기 컨텍스트를 압축할 수 있다.
    * skills 내 vocabulary.md 스킬은 최근 요약에서 등장한 낯선 단어를 추출해 학습자의 약점을 추적하고, 단어 리스트를 플래시카드 형식으로 생성한다.
4. GitHub 저장소 활용
    * 학습 저장소는 코드/파일 편집 도구와 버전 관리 기능을 제공하므로, 영어 일지와 아티팩트를 체계적으로 보관할 수 있다. Codex는 .md 파일을 열고 편집하거나 새로운 세션 폴더를 만드는 데 적합하다.
    * apply_patch 도구를 사용하면 파일 내용을 수정할 때 생산자 AI가 명시적으로 변경사항을 제안하고 적용할 수 있어, 학습자가 수정 내역을 검토한 뒤 병합할 수 있다.
    * 레포지토리는 다른 협력자(튜터, 팀 동료)와 공유 가능하며, PR 리뷰를 통해 피드백을 받을 수도 있다.
5. 확장 옵션
    * 서브-에이전트 – 난이도별·주제별 하위 에이전트를 만들어 전체 컨텍스트를 오염시키지 않고 특정 과제를 수행할 수 있다 ￼. 예를 들어 “발음 교정 서브 에이전트”는 발음 피드백만 담당한다.
    * MCP/커넥터 – 이메일 클라이언트나 캘린더, 소셜 네트워크와 연결해 실제 업무 상황(구직 이메일, 회의 일정)을 학습 데이터로 사용할 수 있다.
    * 웹 검색 도구 – 뉴스/기사 등을 검색해 실시간 주제에 대한 영어 토론 자료를 수집할 수 있다.
    * 안전장치 – 음성 입력에서 욕설 등을 필터링하고, 모욕적 내용을 학습자가 들을 일 없도록 적절한 검열 도구를 포함한다.

3. 실현 가능성 및 다음 단계

1. 프로토타입 구현 – 첫 번째 버전은 english-learning-harness 저장소를 생성하고 간단한 agents.md와 한두 개의 스킬(roleplay.md, grammar_review.md)을 작성한 뒤, Codex CLI 또는 Claude Code에서 하네스를 로딩해 테스트한다.
2. 실시간 모드 vs 파일 기반 모드 – 학습자의 환경(PC vs 모바일)과 회화 형태에 따라 gpt-realtime-whisper 세션 또는 파일 기반 STT를 선택한다. 초기엔 파일 전사를 사용해 구현 난도를 낮추고, 이후 WebRTC를 통한 실시간 음성 세션을 실험한다.
3. 사용자 피드백 루프 구축 – 에이전트가 생성한 피드백이 학습자에게 부담이 되지 않는지 검증하고, 수정 정도와 표현을 조정한다.
4. 한국어 인터페이스 – Agents.md와 스킬 설명은 한국어로 작성하여 사용자 경험을 높이되, 에이전트의 영어 출력과 학습 내용은 영어로 유지한다.
5. 평가 지표 설정 – STT 정확도, 학습자의 영어 말하기 길이 증가, 오류 감소, 사용자 만족도 등 지표를 정의하고 주기적으로 측정한다.
6. 오픈 소스 커뮤니티 – 다른 학습자들과 스킬을 공유하고 개선할 수 있는 커뮤니티를 만든다. 스킬은 모듈화되어 있으므로 새로운 상황극, 문법 설명, 발음 게임 등을 쉽게 추가할 수 있다.

결론

Codex/Claude Code 하네스는 단순한 코딩 자동화를 넘어 맞춤형 영어 학습 환경을 만들 수 있는 유연한 플랫폼이다. 핵심은 모델 성능이 아니라 하네스 설계에 있다는 점이다. STT/TTS와 이미지 생성 도구, 스킬 시스템, GitHub 기반 상태 저장, 컨텍스트 관리 등을 조합하면 사용자의 수준과 목적에 맞는 개인화된 학습 루프를 구축할 수 있다. 이를 통해 학습자는 기존 학원이나 유치원에 의존하지 않고도 매일 AI와 함께 영어를 연습하며 성장할 수 있다.
