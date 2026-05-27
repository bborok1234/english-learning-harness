# 외부 Critic 보고서 + 결정 매핑

외부 critic (oh-my-claudecode:critic, Opus) 에이전트가 22개 design 문서 전체를 검토. self-critic이 못 본 구조적 위험을 짚음. **Verdict: REVISE. Implementation-ready: NO**.

검토일: 2026-05-26

---

## 1. Critic의 종합 평가

> "기술 디테일은 충분하나, 플랫폼 전략과 자신감 전이 가정이 미해결. **Self-critic은 안에서 바깥을 못 봤다**. 문서 간 정합성은 꼼꼼하게 봤지만, '이 제품이 세상에서 작동하는가'라는 질문을 하지 않았다."

## 2. CRITICAL 발견 (2개, 결정 즉시 필요)

### C1. 플랫폼-타겟 정면 충돌
- Codex CLI = 개발자 도구. 타겟 = 비개발자 한국 직장인
- 페르소나 5명 중 수진(스타트업 디자이너)만 설치 가능. 4명 탈락
- 06-voice-ux 본문: "비개발자 친화성 떨어지지만…" — 스스로 인정하고도 디폴트 선택
- **사용자 결정 (2026-05-26)**: Phase 0 = 개발자 얼리어답터 + Phase 1 = 일반인 채널 → **D81**

### C2. AI → 대인 자신감 전이 미검증
- 우리 인용 AI chatbot WTC 연구는 **교실 보조 도구** 맥락. AI 단독 학습 전이는 미입증
- "회화학원 대체" 비전이 학술 근거를 절반만 얻음
- **사용자 결정 (2026-05-26)**: 좁아진 목표를 더 좁힘 — "AI 파트너와 편안하게 영어 대화" → **D82**

## 3. MAJOR 발견 (4개, 다음 라운드 처리)

### M1. 과잉 설계
- 5분 세션 × 14 활동 × 13 지표 = 통계 의미 없음 (MTLD/MLU는 2-3분 연속 발화 필요)
- **다음 라운드**: MVP 지표 5개 이하로 축소 (단어 수 / 영어 비율 / 출석 / 자발 발화 시간 / 새 어휘)

### M2. 페르소나 재훈(D) 재분류
- "우리 적합 아닐 수 있음"인데 검증 게이트(D50)에 포함 → 모든 결정이 불가능한 타협
- **다음 라운드**: 재훈을 "비-타겟 인접"으로 재분류, 4명 페르소나에 집중

### M3. "인라인 교정 X"의 단계별 부작용
- Early Production에서 fossilization 위험 (DeKeyser feedback 필수 원칙과 충돌)
- **다음 라운드**: Recast (자연스러운 되풀이) 허용. AGENTS.md에 "recast OK, explicit correction X"

### M4. 01-vision "면접 합격 통보까지" vs 좁아진 목표 충돌
- 비전 문서가 좁아진 목표 이전에 쓰여서 scope 불일치
- **다음 라운드**: 01-vision의 "면접/이직/비즈니스" 표현 정합 또는 Phase 2 확장 영역 분리

## 4. MINOR 발견 (5개)
1. README "23개" vs self-critic 본문 25개 카운트 불일치
2. profile.md의 typology 필드 ↔ flags.json anxiety_level 중복
3. Day 1-2 알림이 영어 일변도 (한국어 비중 고려 부족)
4. SM-2 알고리즘 ≠ 고정 +1/+3/+7 (Leitner에 가까움)
5. 21-integration Phase 5 시뮬레이션이 Day 0-7만 (Month 2-3 dropout zone 누락)

## 5. 빠진 것 — Missing (6개)
1. **Discovery** — 타겟 학습자가 우리를 어떻게 발견? GitHub 레포가 한국 직장인에게 도달할 경로 0
2. **오프라인/저연결** — 출근길 지하철 시나리오 (음성 불가)
3. **학습자 실제 영어 수준 분포 데이터** — 페르소나 단계 배정이 추정
4. **비용 정당성** — ChatGPT Plus $20/월의 영어 학습 단독 ROI 미검증
5. **Sol 인격 일관성 보장** — 22 문서에 산재, compaction 후 무너질 가능성
6. **Week 2-52 정밀 설계 부재 — 1년 제품의 96%가 미설계**

## 6. 모호 위험 (2개)
- "i+1"의 차원 미정 (어휘? 문법? 길이?)
- "자연스럽게 활동 제안" 인터페이스 미정 (자연어? 버튼?)

## 7. 위험한 가정 Top 5 (critic 의견)
1. 한국 비개발자가 Codex CLI 설치 가능 — **거의 확실히 틀림** → C1으로 해소 시도
2. AI 파트너 연습 → 대인 자신감 전이 — **미검증** → C2로 정직성 확보
3. 5분 세션 학습 데이터 의미성 — 초기 몇 주는 불가 → M1로 처리
4. PreCompact hook 존재 — self-critic B1 → Phase 0 spike에서 검증
5. ChatGPT Plus 영어 학습 단독 ROI — 미검증 → Phase 1 자체 검증 항목

## 8. 닫아야 할 결정 Top 10 (critic 순서)
1. ✅ 플랫폼 전략 — **D81 (2026-05-26 닫음)**
2. ✅ 타겟 재정의 — D81에 포함
3. ✅ AI→대인 자신감 전이 입장 — **D82 (2026-05-26 닫음)**
4. ⏳ MVP 지표 5개 이하 (M1)
5. ⏳ 비전 scope 정합 (M4)
6. ⏳ 재훈 재분류 (M2)
7. ⏳ Recast 허용 (M3)
8. ⏳ AGENTS.md 템플릿 (self-critic C4)
9. ⏳ Phase 0 spike 5개 (self-critic B1-B5)
10. ⏳ progress.json 단일화 (self-critic A1)

## 9. 학술적/실용적 작동 가능성 (critic 판단)
- **학술**: 우수. Krashen + Swain + Long + DeKeyser + SDT + Atomic Habits 통합 논리적. 한국 WTC 연구 인용 적절. 단, AI 단독 학습 실증은 부족한 영역 → **우리는 선구자이자 실험자**임을 인정 필요
- **실용**: C1 해결 시 중간-높음. 5분 습관화 / 죄책감 0 / self-referenced 측정 강함. 단, 현재 형태로는 타겟 도달률 극히 낮음 (C1 해소 후 평가)

## 10. 매니페스토/비전의 진짜 위험
- 매니페스토 "평가 X" — Speech Emergence 이하에서 fossilization (M3)
- 매니페스토 "데이터는 학습자 디스크" — 모바일 확장 시 깨짐 (Phase 1)
- 비전 "평생의 파트너" — OpenAI 정책 변경 (가격/API/voice 한도)에 전적 의존

## 11. 진행 상태

| Critical/Major | 항목 | 상태 |
|---|---|---|
| C1 | 플랫폼-타겟 정합 | ✅ D81로 닫음 |
| C2 | 자신감 전이 가정 | ✅ D82로 닫음 |
| M1 | 과잉 설계 (지표 축소) | ✅ D83으로 닫음 (2026-05-26) |
| M2 | 재훈 재분류 | ✅ D84로 닫음 (2026-05-26) |
| M3 | Recast 허용 | ✅ D85로 닫음 (2026-05-26) |
| M4 | 비전 scope 정합 | ✅ D86으로 닫음 (2026-05-26) |
| MINOR 5개 | 카운트/중복/SM-2 등 | ⏳ Round 4 |
| Missing 6개 | Discovery/오프라인/비용 등 | ⏳ Round 4 |
| Self-critic 25개 | A/B/C/D/E | ⏳ Round 5 (B는 Phase 0 spike) |

**Round 2 진행 중 (2026-05-26)** — C1, C2 closed. M1-M4는 다음 라운드.

## 12. Round 4 닫음 (2026-05-26)

MINOR 5개 + Missing 6개 + 모호 위험 2개 모두 D87-D99로 닫음 (`09-decisions.md` 참조).

| 항목 | 결정 ID |
|---|---|
| MINOR-1 카운트 정정 | D98 |
| MINOR-2 typology/flags 중복 | D97 |
| MINOR-3 Day 1~3 한국어 알림 | D87 |
| MINOR-4 SM-2 → Leitner 명명 | D88 |
| MINOR-5 시뮬레이션 범위 확장 | D99 |
| MISS-1 Discovery | D89 |
| MISS-2 오프라인 | D90 |
| MISS-3 학습자 단계 배정 | D91 |
| MISS-4 비용 정당성 | D92 |
| MISS-5 Sol 인격 single source | D93 |
| MISS-6 Week 2-52 정밀 | D94 |
| AMB-1 i+1 차원 | D95 |
| AMB-2 활동 제안 인터페이스 | D96 |

남은 라운드: Round 5 (self-critic 25개. B 영역 5개는 Phase 0 spike에서)

## 13. Critic의 한 줄 결론

> "Design implementation-ready: NO. NEEDS [플랫폼-타겟 정합 결정 + AI→대인 자신감 전이 가정 명시 + MVP scope 축소]"

C1, C2 닫음으로 첫 두 NEEDS 해소. MVP scope 축소는 Round 3에서.
