#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-next-card");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertCleanLearnerHtml(html) {
  for (const forbidden of ["pilot-capture", "pilot-start", "pilot-day", "pilot-finish", "product_journey_audit", "PR #", "issue #"]) {
    assert(!html.includes(forbidden), `learner next card leaked ${forbidden}`);
  }
}

function assertCleanAssistantPrompt(prompt) {
  assert(prompt?.text, "pilot-next should return assistantPrompt.text");
  assert(prompt.text.includes("답은 영어 한 문장만 보내주세요"), "assistant prompt should ask for one English sentence");
  assert(prompt.text.includes("후보 중 하나"), "assistant prompt should mention quick reply choices");
  for (const forbidden of [
    "pilot-next",
    "pilot-reply",
    "pilot-capture",
    "pilot-start",
    "pilot-day",
    "pilot-finish",
    "product_journey_audit",
    "PR",
    "issue",
    "rubric",
    "artifact",
  ]) {
    assert(!prompt.text.includes(forbidden), `assistant prompt leaked ${forbidden}`);
  }
}

function assertCleanQuickReplies(replies) {
  assert(Array.isArray(replies), "pilot-next should return quickReplies");
  assert(replies.length >= 2, "pilot-next should return at least two quick replies");
  for (const reply of replies) {
    assert(reply.id, "quick reply should have id");
    assert(reply.text?.split(/\s+/).length >= 3, "quick reply should be a usable English sentence");
    assert(reply.note, "quick reply should include learner-facing note");
    for (const forbidden of ["pilot-", "product_journey_audit", "PR", "issue", "rubric", "artifact"]) {
      assert(!reply.text.includes(forbidden), `quick reply leaked ${forbidden}`);
      assert(!reply.note.includes(forbidden), `quick reply note leaked ${forbidden}`);
    }
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });

  const baseline = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(baseline.nextCard.phase === "baseline", "fresh pilot should ask baseline card");
  assertCleanAssistantPrompt(baseline.assistantPrompt);
  assertCleanQuickReplies(baseline.quickReplies);
  assert(baseline.assistantPrompt.text.includes("오늘 뭐 했어?"), "baseline assistant prompt should include concrete first scene");
  assert(baseline.quickReplies.some((reply) => reply.text.includes("project")), "baseline quick replies should include a copyable daily answer");
  assert(existsSync(baseline.htmlPath), "baseline next-card html missing");
  assertCleanLearnerHtml(read(baseline.htmlPath));

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--learner-root",
    learnerRoot,
    "--say",
    "I opened the app and practiced one sentence.",
    "--say",
    "Which place do you mean?",
    "--say",
    "Sorry, I made a mistake.",
    "--say",
    "There are desks, chairs, and people working.",
    "--say",
    "I feel okay but a little tired.",
    "--comfort-rating",
    "3",
    "--json",
  ]);

  const day = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(day.nextCard.phase === "day", "after baseline should ask daily card");
  assert(day.nextCard.day === 1, "daily card should point to day 1");
  assertCleanAssistantPrompt(day.assistantPrompt);
  assertCleanQuickReplies(day.quickReplies);
  assert(day.assistantPrompt.text.includes("Let's meet at the usual place after work."), "daily assistant prompt should include concrete situation");
  assert(day.assistantPrompt.text.includes("Which place do you mean?"), "daily assistant prompt should include example");
  assert(day.quickReplies.some((reply) => reply.text === "Which place do you mean?"), "day 1 quick replies should include the shortest clarification answer");
  assert(read(day.htmlPath).includes("Which place do you mean?"), "daily card should show learner-facing example");
  assert(read(day.htmlPath).includes("Codex가 바로 말할 다음 문장"), "daily card should show learner-ready prompt section");
  assert(read(day.htmlPath).includes("번호로 고를 수 있는 답변 후보"), "daily card should show numbered quick replies section");
  assert(read(day.htmlPath).includes("aria-label=\"1번 선택지\""), "daily card should render first quick reply as a selectable numbered choice");
  assert(read(day.htmlPath).includes("aria-label=\"2번 선택지\""), "daily card should render second quick reply as a selectable numbered choice");
  assert(read(day.htmlPath).includes("답은 영어 한 문장만 보내주세요"), "daily card should render assistant prompt answer rule");
  assert(day.nextCard.title === "확인 질문 만들기", "day 1 should test clarification");
  assertCleanLearnerHtml(read(day.htmlPath));

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-day",
    "--learner-root",
    learnerRoot,
    "--day",
    "1",
    "--say",
    "Which place do you mean?",
    "--friction-note",
    "fixture day 1",
    "--json",
  ]);
  const nextDay = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(nextDay.nextCard.day === 2, "next daily card should advance after completed day");
  assertCleanAssistantPrompt(nextDay.assistantPrompt);
  assertCleanQuickReplies(nextDay.quickReplies);
  assert(nextDay.nextCard.title === "말실수 고치기", "day 2 should test repair instead of repeating day 1");
  assert(nextDay.nextCard.example.includes("I meant iced latte"), "day 2 should expose repair example");
  assert(nextDay.quickReplies.some((reply) => reply.text.includes("I meant iced latte")), "day 2 quick replies should include repair wording");
  assert(!nextDay.nextCard.ask.includes("usual place"), "day 2 should not repeat the usual-place clarification prompt");
  assert(read(nextDay.htmlPath).includes(nextDay.assistantPrompt.text.split("\n")[0]), "next-day HTML should render assistant prompt");

  const state = JSON.parse(read(nextDay.jsonPath));
  assert(state.cockpit.html === "cockpit.html", "next card should link learner cockpit");
  assert(state.privacy.includes("내 컴퓨터의 학습 기록"), "next card should preserve learner-facing privacy boundary");
  assert(!state.privacy.includes("PR"), "next card privacy should avoid platform labels");
  assert(!state.privacy.includes("issue"), "next card privacy should avoid platform labels");
  assert(state.next_card.title === "말실수 고치기", "next-card state should persist varied day title");
  assert(state.assistant_prompt.text === nextDay.assistantPrompt.text, "next-card state should persist assistant prompt");
  assert(state.quick_replies.length === nextDay.quickReplies.length, "next-card state should persist quick replies");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        htmlPath: nextDay.htmlPath,
        nextPhase: nextDay.nextCard.phase,
        nextDay: nextDay.nextCard.day,
        claimBoundary: "This validates learner-facing pilot next-card generation only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "AIOS-12",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
