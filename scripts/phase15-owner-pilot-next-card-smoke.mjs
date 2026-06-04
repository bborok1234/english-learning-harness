#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-next-card");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);

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

async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    const bundledPlaywright = resolve(
      homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    );
    if (existsSync(bundledPlaywright)) {
      return require(bundledPlaywright).chromium;
    }
    throw new Error("Playwright is required for pilot next-card render smoke");
  }
}

async function renderNextCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    sceneCount: document.querySelectorAll(".scene").length,
    quickReplyCount: document.querySelectorAll(".quick li").length,
    copyButtonCount: document.querySelectorAll(".copy-reply").length,
  }));
  await browser.close();
  return result;
}

async function main() {
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
  assert(baseline.nextCard.title === "첫 장면 고르기", "fresh pilot should start with an immersive scene chooser");
  assert(baseline.nextCard.scene_choices?.length === 3, "fresh pilot should expose three opening scene choices");
  assert(
    baseline.nextCard.scene_choices.some((choice) => choice.label === "작은 모험"),
    "opening scene choices should include a non-office/non-project option",
  );
  assertCleanAssistantPrompt(baseline.assistantPrompt);
  assertCleanQuickReplies(baseline.quickReplies);
  assert(baseline.assistantPrompt.text.includes("선택 가능한 시작 장면"), "baseline assistant prompt should include scene choices");
  assert(baseline.assistantPrompt.text.includes("작은 모험"), "baseline assistant prompt should include the small adventure scene");
  assert(!baseline.assistantPrompt.text.includes("project"), "baseline assistant prompt should not assume a project/work start");
  assert(baseline.quickReplies.some((reply) => reply.text.includes("quiet day")), "baseline quick replies should include a low-pressure daily answer");
  assert(baseline.quickReplies.some((reply) => reply.text.includes("new to me")), "baseline quick replies should include a more imaginative scene answer");
  assert(existsSync(baseline.htmlPath), "baseline next-card html missing");
  const baselineHtml = read(baseline.htmlPath);
  assert(baselineHtml.includes("고를 수 있는 시작 장면"), "baseline card should render opening scene choices");
  assert(baselineHtml.includes("처음 가보는 장소"), "baseline card should render the small adventure scene");
  assert(baselineHtml.includes("I just arrived, and this place feels new to me."), "baseline card should render scene starter sentence");
  assert(!baselineHtml.includes("project"), "baseline card should not assume project/work content");
  assertCleanLearnerHtml(baselineHtml);
  const baselineRender = await renderNextCard(baseline.url);
  assert(baselineRender.h1 === "첫 장면 고르기", "rendered baseline card should show the scene chooser title");
  assert(baselineRender.sceneCount === 3, "rendered baseline card should show three scene choices");
  assert(baselineRender.quickReplyCount >= 3, "rendered baseline card should show quick replies");
  assert(baselineRender.copyButtonCount >= 3, "rendered baseline card should show quick reply copy buttons");

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
  assert(read(day.htmlPath).includes("class=\"copy-reply\""), "daily card should render quick reply copy buttons");
  assert(read(day.htmlPath).includes("data-reply=\"Which place do you mean?\""), "daily card should wire the copy button to the quick reply text");
  assert(read(day.htmlPath).includes("navigator.clipboard.writeText"), "daily card should include local copy behavior");
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
        renderedSceneCount: baselineRender.sceneCount,
        claimBoundary: "This validates learner-facing pilot next-card generation only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
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
