#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/daily-practice-start-card");
const learnerRoot = resolve(smokeRoot, "learner");
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

function assertNoInternalLeak(text, label) {
  const lower = String(text).toLowerCase();
  for (const forbidden of [
    "node scripts/",
    "practice-next",
    "practice --",
    "learner-root",
    "github",
    "pull request",
    "issue #",
    "smoke",
    "product_journey_audit",
    "rubric",
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
    if (existsSync(bundledPlaywright)) {
      return require(bundledPlaywright).chromium;
    }
    throw new Error("Playwright is required for daily practice start-card smoke");
  }
}

async function renderCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    quickReplyCount: document.querySelectorAll(".quick li").length,
    copyButtonCount: document.querySelectorAll(".copy-reply").length,
    promptText: document.querySelector('[aria-label="learner-ready prompt"]')?.textContent ?? "",
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want a low-pressure daily start card.",
    "--json",
  ]);

  const start = runJson([
    "scripts/english-learning-harness.mjs",
    "practice-next",
    "--learner-root",
    learnerRoot,
    "--scene-preset",
    "cafe-repair",
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);

  assert(start.status === "pass", "practice-next should pass");
  assert(start.path === "codex-operated-practice-start-card", "practice-next path mismatch");
  assert(existsSync(start.cardPath), "practice start-card JSON missing");
  assert(existsSync(start.htmlPath), "practice start-card HTML missing");
  assert(existsSync(resolve(learnerRoot, start.mission.mission_html)), "linked mission HTML missing");
  assert(start.assistantPrompt.text.includes("오늘은 영어 한 문장만"), "assistant prompt should be learner-ready");
  assert(start.assistantPrompt.text.includes("번호로 골라도 됩니다"), "assistant prompt should mention quick replies");
  assert(start.quickReplies.length === 3, "practice start card should expose three quick replies");
  assert(
    start.quickReplies[0].text === "I do not know the name, but I want cold coffee with milk.",
    "first quick reply should match the current scene example",
  );
  assert(start.cockpit.html === "cockpit.html", "practice start card should link cockpit");
  assertNoInternalLeak(start.assistantPrompt.text, "assistant prompt");
  assertNoInternalLeak(JSON.stringify(start.quickReplies), "quick replies");

  const card = readJson(start.cardPath);
  assert(card.surface === "learner-facing daily practice start card", "card surface mismatch");
  assert(card.mission.target_skill, "card should expose target skill");
  assert(card.prompt.ask.includes("영어로"), "card prompt should ask for an English answer");
  assert(card.quick_replies[0].text === start.quickReplies[0].text, "card quick replies should match command output");
  assert(card.claim_boundary.includes("does not save an answer"), "card should preserve no-save boundary");

  const html = readFileSync(start.htmlPath, "utf8");
  assert(html.includes("English Learning Harness · Daily Practice"), "HTML should identify daily practice surface");
  assert(html.includes("번호로 고를 수 있는 답변 후보"), "HTML should render quick reply section");
  assert(html.includes("data-reply=\"I do not know the name, but I want cold coffee with milk.\""), "HTML should wire scene quick reply copy text");
  assertNoInternalLeak(html, "daily practice start-card HTML");

  const rendered = await renderCard(start.url);
  assert(rendered.h1 === "The Cafe Word Gap", "rendered card should show current scene title");
  assert(rendered.quickReplyCount === 3, "rendered card should show three quick replies");
  assert(rendered.copyButtonCount === 3, "rendered card should show three copy buttons");
  assert(rendered.promptText.includes("오늘은 영어 한 문장만"), "rendered prompt should show learner-ready prompt");
  assertNoInternalLeak(rendered.text, "rendered daily practice start card");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-20",
        learnerRoot,
        htmlPath: start.htmlPath,
        quickReplyCount: start.quickReplies.length,
        renderedTitle: rendered.h1,
        claimBoundary:
          "This validates the learner-ready daily practice start card only. It does not save a real learner answer.",
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
        issue: "AIOS-20",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
