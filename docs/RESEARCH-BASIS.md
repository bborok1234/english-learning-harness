# Research Basis And Citation Map

Last updated: 2026-05-29
Status: active product evidence map

## Purpose

This document explains why the harness teaches the way it does.

The goal is not to decorate the product with academic names. The goal is to make every important learning behavior traceable:

- learning principle
- harness behavior
- implementation surface
- claim boundary
- source

## Claim Boundary

These sources justify the design direction. They do not prove that this repository already improves every learner's real-world speaking ability.

Allowed product claim:

> The harness is designed around output practice, interaction repair, corrective feedback, retrieval, transfer practice, and task-based conversation.

Blocked until real learner evidence:

- guaranteed fluency improvement
- native-like pronunciation or accent scoring
- exam score improvement
- confidence with real people after fixture-only testing
- long-term retention beyond the observed learner data

## Evidence Map

| Harness behavior | Learning basis | Product implementation | Claim boundary | Source |
|---|---|---|---|---|
| Daily conversation is short, output-first, and low-pressure. | Output can push learners to notice gaps in what they can say, not only what they understand. | `today` and Codex daily-session skills ask the learner to produce spoken-style English before explanation. Mini mirror records the next attempt. | We can claim output practice is intentionally built in; we cannot claim output alone is sufficient. | Swain and Lapkin, "Problems in Output and the Cognitive Processes They Generate" |
| The harness tracks clarification, repair, follow-up, refusal, and soft disagreement as speaking skills. | Interaction competence includes more than grammar accuracy; online interaction and mediation are explicit CEFR Companion Volume areas. | `learner-model.json`, `speaking-backlog.json`, daily cockpit, weekly mirror, and export summaries track interaction behaviors. | CEFR alignment is a design reference, not an official CEFR level certification. | Council of Europe CEFR Companion Volume |
| Speaking Skill OS turns a weak sample into a backlog item and later transfer test. | Negotiated interaction, output, and feedback are core constructs in instructed SLA interaction research. | `diagnose -> backlog -> daily -> today -> transfer evidence -> weekly/export` creates a closed loop for observable interaction behavior. | Fixture smokes prove mechanics, not real-world transfer. | Mackey, "Interaction and instructed second language acquisition" |
| During conversation, correction is gentle; after the task, feedback is explicit and small. | Corrective feedback and learner uptake are established SLA constructs; timing and modality matter, and evidence is not one-size-fits-all. | Tutor policy prefers recasts/repair prompts during conversation and a one-pattern mini mirror afterward. | We should not dump many corrections or claim a universal best timing. | Lyster and Ranta; Fu and Li systematic review |
| Review queue asks learners to retrieve and reuse personal phrases. | Retrieval practice/testing can improve later retention compared with restudy-only approaches. | `review-queue.json`, due review in `daily`, success/fail intervals, and phrase vault reuse make recall part of the loop. | Retrieval evidence supports recall practice; conversational fluency transfer still needs learner data. | Roediger and Karpicke |
| Scenarios have communicative tasks, not only free chat. | Task-based language teaching emphasizes meaning-focused tasks with communicative outcomes. | Scenario planner chooses concrete situations such as ordering, explaining, asking, refusing, clarifying, and recovering. | A scenario is only valid if the learner has an actual communicative goal, not if it is decorative roleplay. | Ellis |
| The engine keeps input, output, focused learning, and fluency in balance. | Nation's four strands argues for a balanced language course across meaning-focused input, meaning-focused output, language-focused learning, and fluency development. | Daily session, mini lesson/mirror, review queue, and listening/reading prompts are separated in the learning engine plan. | The current product is strongest in output and review; richer input work remains future scope. | Nation |
| Voice/image/video are modeled as interaction events, not separate media features. | Multimodal practice should still train interaction: noticing, clarification, repair, description, and transfer. | Text, transcript-backed voice, and image information-gap events share an interaction-event schema. | Realtime voice and full computer-vision tutoring are not default product claims yet. | CEFR online interaction; multimodal plan sources |

## Product Translation

### 1. Output Before Explanation

The harness should ask the learner to say something first. This protects the core learning event: the learner notices where speech gets stuck.

Implementation rule:

- ask one simple prompt
- let the learner produce imperfect English
- avoid grammar lectures before the learner attempts output
- keep one next attempt in the mini mirror

### 2. Repair Is A Skill, Not A Failure

For Korean adult learners, freezing is often the main practical blocker. The product therefore treats repair phrases as first-class skills:

- "Can I say it another way?"
- "I mean..."
- "Let me try again."
- "What I want to say is..."
- "Could you ask that more simply?"

Implementation rule:

- diagnose repair/clarification/follow-up gaps
- create backlog items for observable behavior
- retry failed transfer work before generic practice

### 3. Feedback Must Preserve Conversation

Correction should not turn a five-minute speaking attempt into a grammar lecture.

Implementation rule:

- in-flow: recast or ask a repair prompt
- after-flow: one pattern, one natural alternative, one retry
- no broad scoring unless a rubric explicitly supports it

### 4. Practice Must Return

A phrase that appears once in a chat is not a learning asset yet. It becomes useful only when the learner retrieves, adapts, and reuses it.

Implementation rule:

- store useful phrases locally
- schedule due review
- mark success/fail from later attempts
- prefer personal phrases over generic vocabulary lists

### 5. Scenarios Need Transfer Evidence

The differentiator is not "AI chat in English." The differentiator is a harness that says:

> You avoided clarification yesterday. Today we will make one clarification request in a new situation and record whether you did it.

Implementation rule:

- every targeted drill has an observable transfer check
- transfer pass/fail updates the speaking backlog
- weekly mirror explains what behavior improved and what still repeats

## Source List

- Council of Europe. "Common European Framework of Reference for Languages: Learning, Teaching, Assessment - Companion volume." https://www.coe.int/en/web/education/-/common-european-framework-of-reference-for-languages-learning-teaching-assessment-14
- Council of Europe. "Online interaction." https://www.coe.int/en/web/common-european-framework-reference-languages/online-interaction
- Ellis, Rod. "Task-based research and language pedagogy." https://journals.sagepub.com/doi/10.1177/136216880000400302
- Fu, Meng and Li, Shaofeng. "Optimal timing of treatment for errors in second language learning - A systematic review of corrective feedback timing." https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/
- Lyster, Roy and Ranta, Leila. "Corrective Feedback and Learner Uptake." https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/corrective-feedback-and-learner-uptake/59229F0CA2F085F5F5016FB4674877BF
- Mackey, Alison. "Interaction and instructed second language acquisition." https://www.cambridge.org/core/journals/language-teaching/article/interaction-and-instructed-second-language-acquisition/78A156EE200F744F5978F99BFB073DBE
- Nation, Paul. "The Four Strands." https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf
- Roediger, Henry L. and Karpicke, Jeffrey D. "Test-enhanced learning: taking memory tests improves long-term retention." https://pubmed.ncbi.nlm.nih.gov/16507066/
- Swain, Merrill and Lapkin, Sharon. "Problems in Output and the Cognitive Processes They Generate: A Step Towards Second Language Learning." https://academic.oup.com/applij/article/16/3/371/184113
