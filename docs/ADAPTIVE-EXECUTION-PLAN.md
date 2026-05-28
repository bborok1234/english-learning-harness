# Adaptive Execution Plan

Last updated: 2026-05-28
Status: Proposed operating system

## Purpose

This repository should not execute a static issue list blindly.

English Learning Harness is a research-heavy education product. Implementation will reveal that some assumptions are wrong, some issues should be split, some should be killed, and some require new research before continuing.

This plan defines the operating system that lets Codex keep moving while still changing direction when evidence says the plan is wrong.

## Operating Thesis

```text
North Star -> Milestone Hypothesis -> Issue -> Implementation -> Evidence
         -> Review Gate -> Continue / Split / Pivot / Kill / Research
```

The issue list is not the source of truth. The issue list is a queue of hypotheses.

The source of truth is:

- `docs/PRODUCT-ROADMAP.md`
- `docs/RALPLAN-CONSENSUS-STARTUP-GRADE.md`
- `docs/MULTIMODAL-GENAI-PLAN.md`
- `docs/project-state.json`
- current GitHub issues and review decisions

## External Practice Anchors

- Scrum inspect/adapt: Sprint Review inspects the increment and adapts the product backlog when needed.
  Source: https://scrumguides.org/scrum-guide-2017.html
- Backlog refinement includes clarifying, reprioritizing, and removing no-longer-needed work.
  Source: https://www.atlassian.com/agile/project-management/backlog-refinement-meeting
- Retrospectives protect continuous improvement by inspecting how work is being done.
  Source: https://www.atlassian.com/agile/scrum/retrospectives
- Lean Startup validated learning warns against building without measuring and learning.
  Source: https://lean.st/principles/validated-learning/
- DORA-style delivery metrics are useful as health signals, but must not replace product learning.
  Source: https://dora.dev/research/

## Cadences

### Per Issue: Evidence Gate

Every issue must end with one of these decisions:

- `continue`: acceptance criteria passed and evidence supports the claim.
- `split`: implementation revealed multiple separate problems.
- `pivot`: original approach is wrong; create replacement issue and close/park the old one.
- `kill`: issue should not be done because it no longer supports the north star.
- `research`: implementation is blocked by unknown pedagogy, API/runtime behavior, UX evidence, or evaluation design.

Required issue closeout:

- linked pull request for implementation work,
- implementation summary,
- verification commands and outputs,
- changed files,
- claim boundary,
- dashboard/SSOT update,
- next decision.

### Per Milestone: Direction Review

Before closing a milestone, run a direction review:

- Did this milestone move the learner toward real speaking ability?
- Did evidence invalidate any planned issues?
- Are there new risks from implementation?
- Is the dashboard honest?
- Should next milestone scope change?

Output:

- milestone review comment,
- updated `docs/project-state.json`,
- updated dashboard,
- new/split/killed issues as needed.

### Weekly Or Every 5 Issues: Product Steering Review

Run a higher-level check after five issue completions or when a major blocker appears.

Questions:

- Are we building a Codex-native harness or drifting into a generic app?
- Are learning claims still honest?
- Are issue priorities still aligned with the first-usable gate?
- Has any research or implementation evidence changed the roadmap?
- Is there a cheaper or more direct path to daily use?

Output:

- `docs/STATUS.md` update,
- issue triage changes,
- optional new research issue,
- optional Ralplan refresh if the architecture changes.

## Review Lanes

### Product Direction Reviewer

Owns:

- north-star alignment,
- learner value,
- daily return,
- claim boundaries,
- whether an issue should continue, pivot, or die.

Rejects work if:

- it is impressive but not useful for speaking improvement,
- it turns the harness into a generic app shell,
- it creates unsupported learning claims.

### Pedagogy Reviewer

Owns:

- speaking acquisition logic,
- tutor policy,
- feedback timing,
- repair/clarification/turn-taking,
- persona fixture adequacy.

Rejects work if:

- it rewards grammar scoring over interaction,
- it overcorrects anxious learners,
- it lacks retry/transfer evidence.

### Engineering Reviewer

Owns:

- local-first data integrity,
- command/setup reliability,
- testability,
- schema migration,
- dependency risk.

Rejects work if:

- it cannot be run from a clean clone,
- it writes unsupported state,
- it makes native hooks required before trust-state is solved.

### Verification Reviewer

Owns:

- acceptance evidence,
- smoke tests,
- fixture results,
- dashboard honesty,
- issue closeout quality.

Rejects work if:

- the dashboard shows aspiration as progress,
- tests do not cover the claim,
- issue evidence is missing or not reproducible.

## Research Triggers

Create a research issue instead of implementing when:

- the issue depends on a learning-science claim not already covered by SSOT;
- the issue depends on current API/runtime behavior that may have changed;
- an implementation spike contradicts the current plan;
- persona fixtures fail for reasons the code cannot explain;
- a modality feature risks becoming decorative media rather than conversation training;
- measurement would create false confidence.

Research issue output must include:

- question,
- decision needed,
- sources reviewed,
- recommendation,
- rejected alternatives,
- implementation consequence,
- follow-up issue changes.

## Backlog Mutation Rules

### Continue

Use when:

- acceptance criteria still fit,
- implementation evidence supports the approach,
- no new product or pedagogy risk appeared.

### Split

Use when:

- one issue contains platform + learning + UX concerns;
- tests reveal multiple independent failure modes;
- a smaller issue can ship a useful increment.

### Pivot

Use when:

- the intended implementation path is wrong,
- a fallback path better serves daily learning,
- a dependency/API/runtime assumption changed.

Pivot requires:

- old issue closed with evidence,
- new issue linked,
- SSOT updated if direction changed.

### Kill

Use when:

- the issue no longer supports the north star,
- it is a feature spectacle,
- it increases complexity without learning evidence,
- it belongs to a later milestone.

Kill requires:

- explicit reason,
- rejected alternative note,
- dashboard/roadmap correction if needed.

## GitHub Issue Model

### Pull Request Contract

Implementation issues must close through a pull request, not a direct `main` commit.

Default flow:

1. Create a branch named `issue-<number>-<short-slug>`.
2. Commit implementation, evidence, and dashboard/SSOT updates on that branch.
3. Open a PR linked to the issue.
4. Put verification commands, claim boundary, and backlog decision in the PR body.
5. Merge the PR only after verification evidence is present.
6. Close the issue from the PR merge or a final issue comment that links the PR.

Allowed direct commits:

- emergency repository repair,
- generated dashboard sync after an already-reviewed PR merge,
- documentation typo fixes that do not close an implementation issue.

If a direct commit is used, the issue must stay open until a follow-up PR records the missing review trail or the issue comment explicitly explains why a PR would be empty.

Every issue should include:

```markdown
## Problem

## Product Intent

## Scope

## Acceptance Criteria

## Verification

## Files Likely Touched

## Review Gate
- Product:
- Pedagogy:
- Engineering:
- Verification:

## Backlog Mutation Rule
Default: continue
Allowed: continue / split / pivot / kill / research

## Claim Boundary
```

Labels:

- `type:epic`
- `type:feature`
- `type:research`
- `type:test`
- `type:docs`
- `priority:p0`
- `priority:p1`
- `priority:p2`
- `area:platform`
- `area:learning-engine`
- `area:conversation-ux`
- `area:evaluation`
- `area:multimodal`
- `area:distribution`
- `decision:continue`
- `decision:split`
- `decision:pivot`
- `decision:kill`
- `decision:research`

## Milestones

### M1 — First-Usable Codex Harness

Hypothesis:

A learner can clone the repo, run a reliable command path, complete a scenario-based daily session, and see honest local evidence without native hook proof.

Decision gate:

- if explicit command-wrapper fallback works, continue;
- if setup remains confusing, add setup UX issues;
- if scenario loop feels fake, trigger pedagogy/design review before expanding features.

### M2 — Pedagogical Learning Engine

Hypothesis:

Scenario planning, review queue, phrase vault, and mini mirror can create useful daily speaking practice.

Decision gate:

- if persona fixtures fail, split by persona failure mode;
- if metrics feel performative, pivot measurement model;
- if review queue does not create reuse, research spaced retrieval design.

### M3 — Daily Return Experience

Hypothesis:

Generated HTML surfaces and Codex session memory can make the learner want to return without turning the product into a full app.

Decision gate:

- if dashboard is confusing, add information architecture issue;
- if usage friction remains high, consider local TUI/web helper;
- if app shell becomes necessary, Ralplan refresh required.

### M4 — Multimodal Interaction Lab

Hypothesis:

Voice, image, and video can become interaction-event generators rather than media features.

Decision gate:

- if modality does not produce retry/transfer evidence, kill or defer it;
- if realtime bypasses local memory, reject it;
- if generated media distracts from speaking, pivot to simpler prompts.

### M5 — Real Learning Validation

Hypothesis:

A 7-day pilot can show increased voluntary output, phrase reuse, repair behavior, and learner comfort without overclaiming.

Decision gate:

- if pilot evidence is weak, downgrade claims and adjust product loop;
- if retention is poor, research daily return friction;
- if improvement appears persona-specific, split roadmap by learner segment.

### M6 — Public Clone-to-Learn Release

Hypothesis:

A public/private friend can clone and use the harness without internal help.

Decision gate:

- if clone-to-learn fails, block release;
- if onboarding needs external accounts/API keys, document and test the credential path;
- if support burden is high, simplify before adding features.

## Automation Prep

Before autonomous implementation begins:

1. Create GitHub labels.
2. Create milestones.
3. Create epic issues.
4. Create M1 executable issues.
5. Add issue templates or reusable issue body snippets.
6. Create a `docs/ISSUE-INDEX.md` mapping epics to milestones.
7. Require every implementation PR to update `docs/project-state.json` and regenerate `docs/dashboard.html`.

## Stop Conditions

Autonomous execution must stop or re-plan when:

- the north star changes;
- real user validation contradicts core assumptions;
- modality work requires credentials/cost decisions not yet authorized;
- security/privacy risk appears;
- an issue cannot produce reproducible evidence;
- more than two consecutive issues end in `pivot` or `research`, indicating the roadmap needs a Ralplan refresh.
