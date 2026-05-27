# 콘텐츠 소싱 — 영어 환경 없는 학습자에게 재료를

영어 환경에 노출되지 않은 한국 학습자에게 학습 재료를 어디서 발굴할지. Flow의 personal interest + 매니페스토 "본인 관심사" + 저작권 안전을 모두 충족. 의존성 순서 아홉 번째 영역 (H).

확정일: 2026-05-26

---

## 1. 왜 콘텐츠 소싱이 핵심인가

**연구 근거**:
> "Personalized reading passages가 비개인화 대비 comprehension + motivation 우위" (한국 EFL 학습자 실증)  
> ([One-Topic-Doesn't-Fit-All 2025](https://arxiv.org/pdf/2511.09135))

> "Standardized content fails to connect with students' individual backgrounds, leading to **crisis of relevance** and **affective disengagement**."

좁아진 목표 ("회화 자신감") 안에서:
- Flow의 **personal interest** 조건 (`18-motivation.md`)
- transfer-appropriate processing (`11-acquisition-theory.md`)
- 매니페스토 6번 "영어는 도구다"

콘텐츠가 학습자 일상과 안 닿으면 위 셋이 모두 무너진다.

---

## 2. 5가지 소싱 카테고리

### A. 학습자 직접 입력 (가장 안전, 매니페스토 정합)
- onboarding Phase 4에서 학습자가 명시한 관심사 / 목표 시나리오
- 학습자 일상에서 마주친 영어 (직접 입력 — "오늘 회사 메일에서 본 표현")
- 학습자 본인이 쓴 한국어 텍스트 → 영어 변환 연습 (학습자 콘텐츠 100%)
- 학습자 사진 / 영문 글 첨부 (Codex `view_image`)

### B. 학습자 미디어 (옵션 통합)
- 학습자가 명시한 YouTube URL — MCP로 자막 추출 (v2)
- Netflix / Disney+ — ToS 문제로 자동 추출 불가. 학습자가 자막 텍스트 직접 붙여넣기 (MVP)
- 학습자 책상 위 영문 글 → 사진 첨부로 텍스트 추출
- 학습자가 좋아하는 음악 가사 (학습자가 직접 가져옴)

### C. 모델 생성 (가장 자유로움)
- 학습자 관심사 + 단계 → 모델이 시나리오 생성
- 한국 직장인 일상 (회사 미팅, 점심 대화, 출근길) — 학습자 페르소나 반영
- 학습자 어휘 안에서 변형 (Vocabulary stretching)
- 단계 적합 짧은 이야기 (Storytelling 활동용)
- Tongue twisters, 발음 단어 리스트 (`15-activities.md` 활동들)

### D. 한국 환경 영어 (한국 학습자 특화)
- Konglish 대비 진짜 영어 (`12-korean-speaker.md`)
- 한국에서 자주 마주치는 간판 / 메뉴 / 영화 제목의 영어
- 한국 뉴스의 영어 표현 (KOREA HERALD, 영문 신문 — 헤드라인만 fair use)
- K-pop / K-drama 학습자 잘 아는 콘텐츠의 영어 가사·자막 (학습자가 직접)

### E. 공개 자료 (저작권 안전)
- Wikipedia 짧은 글 (CC 라이선스)
- Common Voice 같은 오픈 코퍼스 (음성)
- Public domain 영문 짧은 글 (Project Gutenberg)
- 학습자 단계 적합 — 우리가 큐레이션

---

## 3. MVP 안 / 옵션 / 밖

| 카테고리 | MVP | v2 | 이유 |
|---|---|---|---|
| A 학습자 직접 입력 | ✅ | — | 가장 안전, 매니페스토 정합 |
| B 학습자 미디어 (직접 붙여넣기) | ✅ | — | 학습자 책임 영역 |
| B 학습자 미디어 (자동 추출 — YouTube MCP) | ❌ | ✅ | 학습자 명시 동의 필요 |
| C 모델 생성 | ✅ | — | 자유로움, 저작권 X |
| D 한국 환경 영어 (모델 생성) | ✅ | — | 학습자 일상 닿음 |
| D 외부 신문 / 뉴스 콘텐츠 직접 가져오기 | ❌ | 🟡 | ToS / 저작권 신중 |
| E 공개 자료 (큐레이션) | 🟡 | ✅ | MVP에선 모델 생성으로 대체 가능 |

---

## 4. 콘텐츠 큐 운영

### `_internal/content_queue.json` 스키마
```json
{
  "favorite_topics": ["coffee", "morning routine", "design conferences"],
  "active_scenarios": [
    { "name": "Monday meeting", "next_use": "2026-06-03" },
    { "name": "Coffee shop order", "last_used": "2026-05-28" }
  ],
  "user_provided_content": [
    { "type": "user-sentence", "added": "2026-05-26", "text": "..." },
    { "type": "youtube-url", "added": "2026-05-27", "url": "..." }
  ],
  "model_generated_pool": {
    "scenarios": [...],
    "stories": [...]
  },
  "korea_specific": {
    "konglish_corrections": ["service", "notebook"],
    "weekly_focus": "office English"
  }
}
```

### 큐 운영 원칙
- 매 SessionStart에서 큐 참조 → 활동 자동 제안 (`D56`) 입력
- 학습자가 같은 토픽 깊이 가다가 다음 토픽 자연스럽게 전환
- Interleaving (`D39`) 원칙: 어제 한 토픽과 다른 것 우선
- 학습자 명시 거부 가능 ("이 토픽 그만")

---

## 5. 페르소나 × 콘텐츠 매핑

| 페르소나 | 주요 콘텐츠 소스 | 회피 |
|---|---|---|
| **A 지은** | 일상 시나리오 (출근, 카페), 학습자 자체 토픽 (coffee 등) | 학술/시험 콘텐츠 |
| **B 민호** | 일반 일상 (회사 X) Week 1-4, 회사 시나리오 Week 5+ | 본사 미팅 시나리오 첫 한 달 |
| **C 수진** | 디자인 토픽 영어 자료, 컨퍼런스 시뮬레이션, K-design 글로벌 비교 | 너무 일반적 일상 (지루함) |
| **D 재훈** | 일반 일상 + 학습자 발견 토픽 점진적 | 시험 콘텐츠 (정직하게 안내 후) |
| **E 혜원** | 가족 시나리오, 아이용 영어 자료, 여행 | 자가 평가 트리거 콘텐츠 |

---

## 6. 저작권 안전 정책

### MVP 안전 위치
1. **학습자 본인 작성** → 100% 안전 (학습자 자산)
2. **모델 생성** → 학습자 디스크 (매니페스토 5)
3. **학습자가 직접 가져온 외부 콘텐츠** → 학습자 책임. 우리는 보관만
4. **공개 자료 (CC / Public domain)** → 출처 명시 보관

### 명시적 회피
- 자동 미디어 스크래핑 (Netflix, 신문 사이트) → MVP 0
- 학습자 동의 없이 외부 미디어 다운로드 → 절대 X
- AI 학습 데이터 활용 (학습자 콘텐츠를 우리가 외부로) → 절대 X (매니페스토 5)

### v2 정책 (YouTube MCP 통합 시)
- 학습자가 명시적으로 URL 입력
- 학습자가 자막 사용 권리 인지 명시
- 추출한 자막은 학습자 디스크에만
- 학습자 책임 명시 (UI에 한 줄 안내)

---

## 7. 한국 환경 영어 — 특화 콘텐츠 시리즈

좁아진 목표 (한국 직장인 회화 자신감)에 특별히 유용한 콘텐츠 카테고리:

### Series 1: Konglish → Real English
- service / notebook / handphone / cunning / eye shopping 등
- 학습자가 무심코 쓰면 mirror에서 자연 변형 1개
- D43 (Konglish trap 대응)와 일치

### Series 2: 한국 직장 영어
- 외국인 동료와 점심
- 화상 회의 (Korean meeting English vs natural)
- 영어 이메일 격식 (한국식 과한 격식 → 자연스러움)
- 한국 office 농담 → 영어 등가물

### Series 3: 한국에서 마주치는 영어
- 카페 메뉴 영어 (실제 메뉴판 자주 보는 표현)
- 영화관 / 공항 / 호텔 영어 (한국 특화 시나리오)
- 한국 거리 영어 (간판, 광고)

### Series 4: 여행 영어 (한국인 자주 가는 곳)
- 일본 / 동남아 (영어 lingua franca)
- 미국 / 유럽 (자주 가는 도시별)

학습자 페르소나에 맞춰 자동 큐레이션. 모델 생성으로 무제한 변형 가능.

---

## 8. Flow personal interest와의 연결

`18-motivation.md`의 Flow 조건 중 **personal interest**를 직접 충족:

| 학습자 신호 | 콘텐츠 큐 반응 |
|---|---|
| Coffee 매일 등장 | coffee 관련 시나리오 / 어휘 확장 |
| 회사 미팅 자주 언급 | 회사 시나리오 큐 활성 |
| 여행 시즌 (여름) | 여행 영어 시리즈 추가 |
| K-drama 시청 언급 | 해당 드라마 표현 큐 (학습자가 자막 가져오면) |

학습자가 자기 일상에 닿는 콘텐츠를 마주칠 때 Flow 도달 가능성 ↑.

---

## 9. 새 결정 후보 D71-D75

| 후보 ID | 항목 | 제안 |
|---|---|---|
| D71 | 콘텐츠 소싱 5 카테고리 확정 | 직접 입력 / 학습자 미디어 / 모델 생성 / 한국 환경 / 공개 자료 | 운영 |
| D72 | MVP 콘텐츠 = A + B(붙여넣기) + C + D(모델) + E(부분) | 자동 추출은 v2 | MVP 범위 |
| D73 | 저작권 안전 4원칙 | 학습자 작성 100% / 모델 생성 디스크 / 학습자 가져온 건 학습자 책임 / 공개 자료 출처 명시 | 정책 |
| D74 | 한국 환경 영어 4 시리즈 | Konglish↔Real / 직장 / 한국 거리 / 여행 | 콘텐츠 큐 시드 |
| D75 | content_queue.json 스키마 | favorite_topics + active_scenarios + user_provided + model_pool + korea_specific | 07-background-data 보강 |

---

## 10. 다음 영역 연결

- **J (부정 시나리오)** — 콘텐츠 관련 edge case (학습자가 부적절 콘텐츠 가져오기, ToS 위반 우려 등) 처리
- **통합 커리큘럼** — 콘텐츠 × 활동 × 단계 × 페르소나의 곱집합으로 학습 여정 완성

---

## 11. 출처

- [One-Topic-Doesn't-Fit-All: Personalized Reading Comprehension (2025)](https://arxiv.org/pdf/2511.09135)
- [AI English Learning Support System for Learner-Generated Context (Springer)](https://link.springer.com/article/10.1007/s11423-022-10172-2)
- [Role of Relevance in Learner Engagement (Cambridge ELT)](https://www.cambridge.org/elt/blog/2022/02/10/role-relevance-learner-engagement/)
- [Language Learning with Netflix (ResearchGate)](https://www.researchgate.net/publication/353543301_Language_learning_with_Netflix_Exploring_the_effects_of_dual_subtitles_on_vocabulary_learning_and_listening_comprehension)
- [Language Reactor (Chrome Web Store)](https://chromewebstore.google.com/detail/language-reactor/hoombieeljmmljlkjmnheibnpciblicm)
- [Fair Use and AI — Copyright Reference Guide (UIUC)](https://guides.library.illinois.edu/c.php?g=636811&p=11371498)
- [Generative AI Copyright at UC Davis Library](https://guides.library.ucdavis.edu/genai/copyright)
- [Copyright Office on AI Training and Fair Use (Skadden 2025)](https://www.skadden.com/insights/publications/2025/05/copyright-office-report)
