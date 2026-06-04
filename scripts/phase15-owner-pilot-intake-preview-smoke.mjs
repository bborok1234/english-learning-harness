#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-intake-preview");
const require = createRequire(import.meta.url);
const privateEnglishAnswer = "Which place do you mean before I choose the subway exit?";
const privateMetaRequest = "대시보드 보여줘";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoRawOrInternalLeak(text, label) {
  const lower = String(text).toLowerCase();
  for (const forbidden of [
    privateEnglishAnswer.toLowerCase(),
    privateMetaRequest.toLowerCase(),
    "pilot-reply ",
    "pilot-capture",
    "pilot-start",
    "pilot-finish",
    "pull request",
    "issue #",
    "rubric",
    "product_journey_audit",
    "proves fluency",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked raw/private/internal text: ${forbidden}`);
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
    throw new Error("Playwright is required for pilot intake preview render smoke");
  }
}

async function renderPreview(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 920, height: 720 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    cellCount: document.querySelectorAll(".cell").length,
  }));
  await browser.close();
  return result;
}

function assertNoSaveInvariant(result, expectedBefore) {
  assert(result.savedAnswer === false, "intake preview must not save a learner answer");
  assert(result.integrity.answerCountsUnchanged === true, "intake preview should report unchanged counts");
  assert(result.integrity.before.baselineAnswers === expectedBefore.baselineAnswers, "before baseline count mismatch");
  assert(result.integrity.after.baselineAnswers === expectedBefore.baselineAnswers, "after baseline count changed");
  assert(result.integrity.before.completedDailySessions === expectedBefore.completedDailySessions, "before day count mismatch");
  assert(result.integrity.after.completedDailySessions === expectedBefore.completedDailySessions, "after day count changed");
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  const freshRoot = resolve(smokeRoot, "fresh");
  const partialRoot = resolve(smokeRoot, "partial");

  const quick = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-intake",
    "--learner-root",
    freshRoot,
    "--date",
    "2026-06-04T12:00:00.000Z",
    "--say",
    "1",
    "--json",
  ]);
  assert(quick.classification === "quick_reply_selection", "numeric input should classify as quick reply");
  assert(quick.saveEligible === true, "quick reply should be save eligible");
  assert(quick.route === "pilot-reply-quick", "quick reply route mismatch");
  assert(quick.quickReply.id === "quick-1", "quick reply id mismatch");
  assertNoSaveInvariant(quick, { baselineAnswers: 0, completedDailySessions: 0 });

  const meta = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-intake",
    "--learner-root",
    freshRoot,
    "--date",
    "2026-06-04T12:02:00.000Z",
    "--say",
    privateMetaRequest,
    "--json",
  ]);
  assert(meta.classification === "korean_meta_or_control", "Korean dashboard request should classify as meta/control");
  assert(meta.saveEligible === false, "meta request must not be save eligible");
  assert(meta.route === "no-save", "meta request route mismatch");
  assertNoSaveInvariant(meta, { baselineAnswers: 0, completedDailySessions: 0 });
  assert(!existsSync(resolve(freshRoot, "pilot-state.json")), "fresh intake preview should not create pilot state");

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--learner-root",
    partialRoot,
    "--date",
    "2026-06-04T12:00:00.000Z",
    "--say",
    "I had a quiet day and checked a few plans.",
    "--json",
  ]);
  const beforePartialState = readJson(resolve(partialRoot, "pilot-state.json"));
  assert(beforePartialState.partial.baseline.answers.length === 1, "fixture should have one saved baseline answer");

  const direct = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-intake",
    "--learner-root",
    partialRoot,
    "--date",
    "2026-06-04T12:03:00.000Z",
    "--say",
    privateEnglishAnswer,
    "--json",
  ]);
  assert(direct.classification === "direct_english_answer", "English answer should classify as direct answer");
  assert(direct.saveEligible === true, "English answer should be save eligible");
  assert(direct.route === "pilot-reply-direct", "English answer route mismatch");
  assertNoSaveInvariant(direct, { baselineAnswers: 1, completedDailySessions: 0 });

  const afterPartialState = readJson(resolve(partialRoot, "pilot-state.json"));
  assert(afterPartialState.partial.baseline.answers.length === 1, "direct intake preview should not save a second answer");
  assert(
    afterPartialState.partial.baseline.answers[0].answer === beforePartialState.partial.baseline.answers[0].answer,
    "direct intake preview should not alter saved transcript text",
  );

  const previewJson = readFileSync(direct.previewArtifact.jsonPath, "utf8");
  const previewHtml = readFileSync(direct.previewArtifact.htmlPath, "utf8");
  assert(previewJson.includes('"saved_answer": false'), "preview JSON should mark no save");
  assert(previewHtml.includes("저장 전 확인"), "preview HTML should render learner-safe heading");
  assertNoRawOrInternalLeak(JSON.stringify(quick), "quick output");
  assertNoRawOrInternalLeak(JSON.stringify(meta), "meta output");
  assertNoRawOrInternalLeak(JSON.stringify(direct), "direct output");
  assertNoRawOrInternalLeak(previewJson, "preview JSON");
  assertNoRawOrInternalLeak(previewHtml, "preview HTML");

  const rendered = await renderPreview(direct.previewArtifact.url);
  assert(rendered.title === "Pilot Intake Preview", "rendered preview title mismatch");
  assert(rendered.h1 === "저장 전 확인", "rendered preview heading mismatch");
  assert(rendered.text.includes("아직 저장하지 않았어요"), "rendered preview should show no-save copy");
  assert(rendered.cellCount === 4, "rendered preview should show four status cells");
  assertNoRawOrInternalLeak(rendered.text, "rendered preview");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-36",
        freshRoot,
        partialRoot,
        previewHtml: direct.previewArtifact.htmlPath,
        claimBoundary:
          "This validates protected pilot intake preview mechanics with fixture data only. It does not run or complete the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-36", error: error.message }, null, 2));
  process.exitCode = 1;
}
