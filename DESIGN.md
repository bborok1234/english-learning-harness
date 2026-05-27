# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-05-27
- Primary product surfaces: Codex plugin/harness, daily English session, onboarding, mirrors, local learner data, progress dashboard, future transcription/voice surface
- Evidence reviewed: `design/README.md`, `design/00-manifesto.md` through `design/23-critic-report.md`, `REPORT.md`, `AGENTS.md`, `docs/LEARNING-ENGINE.md`, `docs/PRODUCT-ROADMAP.md`, `docs/STARTUP-GRADE-PLAN.md`, `docs/TUTOR-POLICY.md`, `docs/PERSONA-FIXTURE-SPEC.md`, `docs/DATA-CONTRACTS.md`, `docs/MULTIMODAL-GENAI-PLAN.md`, `docs/RALPLAN-CONSENSUS-STARTUP-GRADE.md`, `docs/phase-1-evidence/PH1-review-gap-audit.md`

This file is the repo-local design contract. `.omx/` may contain execution logs or temporary workflow artifacts, but it is not the source of truth for product, UX, or implementation status.

## Brand
- Personality: calm, patient, low-pressure, private, everyday companion
- Trust signals: local-first learner data, explicit non-goals, gentle correction, no public scoring, no inflated claims
- Avoid: exam-prep tone, streak pressure, native-speaker perfectionism, business-English overreach, generic AI productivity aesthetics

## Product goals
- Goals:
  - Help Korean adults with no English environment build comfort speaking English with an AI partner.
  - Make daily 5-minute English contact feel safe enough to repeat for a year.
  - Preserve learner-owned history as local journals, baselines, vocabulary, and progress data.
  - Build an evidence-backed learning engine that improves everyday interaction ability through scenario practice, review, feedback, and longitudinal memory.
- Non-goals:
  - Guarantee real-person confidence transfer.
  - Teach TOEIC/OPIc, academic writing, native pronunciation, or business document writing.
  - Require a polished web or mobile app for the first validation phase.
- Success signals:
  - Day 0 onboarding completed without shame or overload.
  - Day 1-7 repeated contact happens.
  - Learner avoids less and voluntarily speaks more over time.
  - MVP session metrics update reliably after each session.
  - Learner reuses personal phrases and repair strategies across sessions.
  - Four target persona fixtures pass without overcorrection or inflated promises.

## Personas and jobs
- Primary personas:
  - 지은: ideal-driven introvert, wants not to freeze in English.
  - 민호: trauma-driven high-anxiety worker, needs safe recovery from bad English experiences.
  - 수진: identity-driven extrovert, wants English to support a global creative identity.
  - 혜원: dormant English major, wants reactivation without self-labeling as failed.
- Non-target-adjacent:
  - 재훈: ought-to/test-pressure learner. Redirect honestly; if he still enters, welcome him, but dropout is not a product failure.
- User jobs:
  - Start a short daily English moment without preparation.
  - Be understood and gently stretched without being corrected inline.
  - See progress by self-comparison, not external ranking.
  - Keep data private and inspectable.
- Key contexts of use:
  - Commute, lunch break, before sleep, quiet desktop sessions.
  - Phase 0 assumes developer/early-adopter Codex CLI users.
  - Phase 1 may later target non-developer users through a friendlier wrapper.

## Information architecture
- Primary navigation:
  - Setup and use instructions in `README.md`.
  - Design docs in `design/`.
  - Current status in `docs/STATUS.md`.
  - Shared dashboard in `docs/dashboard.html`.
- Core product modules:
  - Onboarding/profile intake.
  - Daily learning loop: check-in, warm start, scenario task, mini mirror, review scheduling.
  - Mini mirror.
  - Vocabulary/review queue.
  - Weekly/monthly mirror.
  - Local data store and hook automation.
  - Local marketplace package builder.
- Content hierarchy:
  - Manifesto and north star first.
  - Decisions and constraints second.
  - Implementation checklist third.
  - Historical critique reports last.

## Design principles
- Gentle before impressive: protect willingness to communicate over feature density.
- Self-referenced progress only: compare learner to their own past, not exams, levels, or peers.
- Local-first memory: learner data lives on disk and remains inspectable.
- Minimal MVP: five reliable session metrics beat thirteen noisy metrics.
- Learning engine before interface polish: retention and conversation improvement require scenario design, review, feedback, and longitudinal memory, not just a chat shell.
- Research-backed, evidence-honest claims: every learning-impact claim needs either literature support, simulated/persona evidence, or real learner validation.
- Claim only what is verified: Phase 0 must prove hooks, realtime voice, image generation, and plugin distribution before implementation-ready claims.
- Tradeoffs: CLI is acceptable for Phase 0 validation, but it is not the final mass-market surface.

## Visual language
- Color: quiet, high-contrast, warm-neutral base with a few semantic accents; avoid dominant purple/blue AI gradients.
- Typography: readable Korean-first body sizing, compact but calm hierarchy.
- Spacing/layout rhythm: dense enough for repeated operational use; avoid marketing hero layouts for work dashboards.
- Shape/radius/elevation: subtle surfaces, restrained borders, low shadow use.
- Motion: optional and minimal; no pressure-inducing streak animation.
- Imagery/iconography: icons only when they clarify state or action; product dashboards should prioritize evidence and next steps.

## Components
- Existing components to reuse: none yet; this is currently a documentation/design repository.
- New/changed components:
  - Static status dashboard.
  - Plugin scaffold: `skills/`, `hooks/`, `.codex-plugin/plugin.json`.
  - Local runtime CLI: `scripts/english-learning.mjs`.
  - Setup-owned native hook installer: `scripts/install-native-hooks.mjs`.
  - Local marketplace packager: `scripts/package-local-marketplace.mjs`.
  - Progress schema validator: `scripts/validate-progress.mjs`.
- Variants and states:
  - Status badges: complete, in progress, blocked, pending, verified, deferred.
  - Risk rows: resolved, watch, blocked.
- Token/component ownership:
  - Until code exists, dashboard styles are local to `docs/dashboard.html`.

## Accessibility
- Target standard: readable static HTML with semantic sections and sufficient contrast.
- Keyboard/focus behavior: dashboard links must be normal anchors; no interaction should require pointer-only behavior.
- Contrast/readability: Korean text body should stay at 14px or larger.
- Screen-reader semantics: use headings, lists, tables, and meaningful link text.
- Reduced motion and sensory considerations: no required animation.

## Responsive behavior
- Supported breakpoints/devices: desktop first, readable on mobile.
- Layout adaptations: summary cards collapse to one column; timelines and tables scroll only when necessary.
- Touch/hover differences: dashboard should not hide essential information behind hover.

## Interaction states
- Loading: not applicable for static dashboard.
- Empty: show explicit "not started" or "not verified" rather than blank sections.
- Error: mark unknowns as open questions or Phase 0 verification items.
- Success: show evidence, command, or file reference.
- Disabled: use "deferred" status for out-of-scope items.
- Offline/slow network: dashboard is local file friendly.

## Content voice
- Tone: direct, calm, evidence-first.
- Terminology:
  - North star: "AI 파트너와 편안하게 영어로 대화하는 능력."
  - MVP session metrics: utterance word count, English word ratio, attendance, voluntary speaking seconds, new vocabulary count.
  - Phase 0 spike: technical verification before implementation-ready claim.
- Microcopy rules:
  - Do not promise real-person confidence transfer.
  - Do not call the design "done" without naming remaining verification.
  - Say "verified", "deferred", or "unverified" explicitly.

## Implementation constraints
- Framework/styling system: none yet. First implementation target is a Codex plugin/harness, not a web app.
- Design-token constraints: none until an app shell exists.
- Performance constraints: CLI daily session should stay lightweight and avoid noisy metrics.
- Compatibility constraints:
  - 2026-05-27 local observation: `codex-cli 0.133.0` supports `codex plugin add <plugin>@<marketplace>`.
  - P0-3 verified a local marketplace install path: `codex plugin marketplace add <marketplace-root>` followed by `codex plugin add english-learning-harness@personal`.
  - Marketplace metadata must live at `.agents/plugins/marketplace.json` under the marketplace root.
  - Direct GitHub URL plugin install remains unverified.
  - P0-2 verified native hook surfaces in Codex 0.133.0. It did not prove automatic execution of this plugin's `hooks/hooks.json`, so MVP should use setup-owned/native hook registration unless a later exact-install test proves plugin-scoped hooks.
  - P0-4 verified local learner persistence with `progress.json` v2, D83 five MVP session metrics, journal output, and learner-directory-relative artifact references. Automated CLI-side image generation remains optional/deferred.
  - P0-1 found `realtime_conversation` is still under development and disabled in Codex CLI 0.133.0, with no stable voice/realtime command exposed. MVP must default to text-first or transcription-first conversation; realtime voice is future optional work.
  - PH1-1 scaffold keeps `.codex-plugin/plugin.json` free of plugin-scoped hook assumptions. Native hooks are installed or printed through `scripts/install-native-hooks.mjs`.
  - PH1-1 scaffold smoke verifies local marketplace install by packaging `.codex-plugin/`, `skills/`, `hooks/`, and required runtime `scripts/` into an isolated marketplace fixture.
  - PH1-2 runtime verifies first-run onboarding, text-first daily session, mini mirror, journal/artifact persistence, five-metric `progress.json` v2 updates, and installed package hook execution.
  - PH1 self-review invalidated the broad "first usable complete" claim. Hardening must address native hook proof, vocabulary history, daily-session UX, Stop/finalization contract, and setup UX before calling the product first usable.
  - Ralplan planning now chooses explicit command-wrapper fallback as the supported delivery path unless native hook trust-state is proven.
- Test/screenshot expectations:
  - Static docs: regex/static audit and JSON code block parse.
  - Future UI: browser screenshot checks before claiming visual completion.

## Open questions
- [x] Phase 0: Does Codex realtime conversational mode work for the intended daily session? No. Current CLI does not expose a stable realtime voice path, so MVP defaults to text/transcription-first conversation.
- [x] Phase 0: Which hook surfaces are available and how are plugin hooks registered? Native surfaces verified; plugin-scoped auto-registration not proven, so use setup-owned/native registration for MVP.
- [x] Phase 0: What is the verified distribution/install path for this plugin? Local marketplace path verified in P0-3; Git-backed public handoff remains follow-up.
- [x] Phase 0: Can image generation and local disk persistence work within the intended user flow? Local persistence works; automated CLI image generation is deferred with text/image-input fallback.
- [ ] Phase 1: What wrapper is appropriate for non-developer Korean learners?
