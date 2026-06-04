#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-launch-card");
const freshRoot = resolve(smokeRoot, "fresh-learner");
const resumeRoot = resolve(smokeRoot, "resume-learner");
const require = createRequire(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertNoInternalLeak(text, label) {
  const lower = String(text).toLowerCase();
  for (const forbidden of [
    "node scripts/",
    "pilot-next",
    "pilot-reply",
    "pilot-capture",
    "pilot-start",
    "pilot-day",
    "pilot-finish",
    "github",
    "pull request",
    "issue #",
    "smoke",
    "rubric",
    "product_journey_audit",
    "native speaker",
    "guaranteed",
    "proves fluency",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked ${forbidden}`);
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
    if (existsSync(bundledPlaywright)) return require(bundledPlaywright).chromium;
    throw new Error("Playwright is required for pilot launch-card render smoke");
  }
}

async function renderLaunchCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    quickReplyCount: document.querySelectorAll(".quick li").length,
    linkCount: document.querySelectorAll(".links a").length,
    progressText: document.querySelector(".progress")?.textContent ?? "",
  }));
  await browser.close();
  return result;
}

function status(root) {
  return runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-status",
    "--learner-root",
    root,
    "--json",
  ]);
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const freshBefore = status(freshRoot);
  const fresh = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-launch",
    "--learner-root",
    freshRoot,
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  const freshAfter = status(freshRoot);
  assert(fresh.action === "pilot-launch", "pilot-launch action mismatch");
  assert(fresh.savedAnswer === false, "pilot-launch should not save an answer");
  assert(!existsSync(resolve(freshRoot, "pilot-state.json")), "fresh launch should not create pilot-state consent or answers");
  assert(fresh.nextCard.phase === "baseline", "fresh launch should start at baseline");
  assert(fresh.nextCard.title === "첫 장면 고르기", "fresh launch should show the immersive first card");
  assert(fresh.quickReplies.length >= 3, "fresh launch should include quick replies");
  assert(existsSync(fresh.jsonPath), "fresh launch JSON missing");
  assert(existsSync(fresh.htmlPath), "fresh launch HTML missing");
  assert(
    freshBefore.summary.baselineReady === freshAfter.summary.baselineReady,
    "fresh launch should not change baseline state",
  );
  assert(freshAfter.summary.completedDailySessions === 0, "fresh launch should not create daily sessions");
  const freshState = readJson(fresh.jsonPath);
  assert(freshState.saved_answer === false, "fresh launch artifact should mark no saved answer");
  assert(freshState.links.cockpit_html === "cockpit.html", "launch should link cockpit");
  assert(freshState.learner_message.includes("새 답변을 저장하지 않습니다"), "launch should explain no answer is saved yet");
  assertNoInternalLeak(JSON.stringify(freshState), "fresh launch JSON");
  const freshHtml = read(fresh.htmlPath);
  assert(freshHtml.includes("첫 스냅샷 시작"), "fresh launch HTML should show baseline heading");
  assert(freshHtml.includes("답변 저장"), "fresh launch HTML should show save state");
  assert(freshHtml.includes("아직 안 됨"), "fresh launch HTML should say answer is not saved yet");
  assertNoInternalLeak(freshHtml, "fresh launch HTML");
  const freshRendered = await renderLaunchCard(fresh.url);
  assert(freshRendered.h1 === "첫 스냅샷 시작", "rendered fresh launch should show baseline heading");
  assert(freshRendered.quickReplyCount >= 3, "rendered fresh launch should show quick replies");
  assert(freshRendered.linkCount === 1, "rendered fresh launch should link cockpit");
  assertNoInternalLeak(freshRendered.text, "rendered fresh launch");

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--learner-root",
    resumeRoot,
    "--say",
    "I opened the app and practiced one sentence.",
    "--comfort-rating",
    "3",
    "--json",
  ]);
  const resumeBefore = status(resumeRoot);
  const resume = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-launch",
    "--learner-root",
    resumeRoot,
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  const resumeAfter = status(resumeRoot);
  assert(resume.nextCard.phase === "day", "resume launch should show daily card");
  assert(resume.nextCard.day === 1, "resume launch should show day 1");
  assert(resume.nextCard.title === "확인 질문 만들기", "resume launch should show clarification card");
  assert(resume.savedAnswer === false, "resume launch should not save an answer");
  assert(
    resumeBefore.summary.completedDailySessions === resumeAfter.summary.completedDailySessions,
    "resume launch should not create a daily session",
  );
  assert(resumeAfter.summary.completedDailySessions === 0, "resume launch should keep day count unchanged");
  assert(resume.assistantPrompt.text.includes("Let's meet at the usual place after work."), "resume prompt should include concrete situation");
  assert(resume.quickReplies.some((reply) => reply.text === "Which place do you mean?"), "resume launch should include shortest answer");
  const resumeHtml = read(resume.htmlPath);
  assert(resumeHtml.includes("오늘의 말하기 카드"), "resume launch HTML should show daily heading");
  assert(resumeHtml.includes("Which place do you mean?"), "resume launch HTML should show quick answer");
  assert(resumeHtml.includes("답변하면 저장되는 것"), "resume launch HTML should explain persistence boundary");
  assertNoInternalLeak(resumeHtml, "resume launch HTML");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-25",
        freshHtmlPath: fresh.htmlPath,
        resumeHtmlPath: resume.htmlPath,
        resumeDay: resume.nextCard.day,
        renderedFreshQuickReplies: freshRendered.quickReplyCount,
        claimBoundary:
          "This validates learner-facing pilot launch-card mechanics with fixture data only. It does not save a real owner/self pilot answer.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-25", error: error.message }, null, 2));
  process.exitCode = 1;
}
