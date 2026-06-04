#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/daily-practice-reply-routing");
const learnerRoot = resolve(smokeRoot, "learner");
const freeformRoot = resolve(smokeRoot, "freeform-learner");
const invalidRoot = resolve(smokeRoot, "invalid-learner");
const require = createRequire(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args, options = {}) {
  return JSON.parse(
    execFileSync(process.execPath, args, {
      cwd: repoRoot,
      encoding: "utf8",
      ...options,
    }),
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoInternalLeak(text, label) {
  const lower = String(text).toLowerCase();
  for (const forbidden of [
    "node scripts/",
    "practice-next",
    "practice-reply",
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
    throw new Error("Playwright is required for daily practice reply routing smoke");
  }
}

async function renderReplyCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    coachingCount: document.querySelectorAll(".line").length,
    linkCount: document.querySelectorAll(".links a").length,
  }));
  await browser.close();
  return result;
}

function setupLearner(root) {
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    root,
    "--name",
    "learner",
    "--motivation",
    "I want Codex to route daily quick replies.",
    "--json",
  ]);
}

function generateStart(root) {
  return runJson([
    "scripts/english-learning-harness.mjs",
    "practice-next",
    "--learner-root",
    root,
    "--scene-preset",
    "cafe-repair",
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  setupLearner(learnerRoot);
  const start = generateStart(learnerRoot);
  const quickReplyText = start.quickReplies[0].text;

  const routed = runJson([
    "scripts/english-learning-harness.mjs",
    "practice-reply",
    "--learner-root",
    learnerRoot,
    "--quick-reply",
    "1",
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  assert(routed.status === "pass", "practice-reply quick reply should pass");
  assert(routed.path === "codex-operated-practice-reply", "practice-reply path mismatch");
  assert(routed.savedFrom === "quick_reply", "practice-reply should record quick_reply source");
  assert(routed.savedAnswer === quickReplyText, "practice-reply should save the selected quick reply text");
  assert(routed.diagnosis === null, "practice-reply should not diagnose before preserving the current mission");
  assert(
    routed.futureDiagnosis?.timing === "after_current_session",
    "practice-reply should defer diagnosis until after current session persistence",
  );
  assert(
    routed.futureDiagnosis?.purpose === "future_practice_planning",
    "practice-reply future diagnosis should be marked as future planning",
  );
  assert(existsSync(routed.replyCardPath), "practice reply-card JSON missing");
  assert(existsSync(routed.replyCardHtmlPath), "practice reply-card HTML missing");
  assert(existsSync(routed.report.htmlPath), "practice reply should write learner report HTML");
  assert(existsSync(routed.cockpit.htmlPath), "practice reply should refresh cockpit HTML");
  assert(routed.scene.title.includes("scene"), "practice reply should write generated scene");
  assert(routed.mission.title === "The Cafe Word Gap", "practice reply should preserve the start-card scene preset");
  assert(routed.mission.id === start.mission.id, "practice reply should preserve the start-card mission id");
  assert(
    routed.mission.targetSkill === start.mission.target_skill,
    "practice reply should preserve the start-card target skill",
  );
  assert(
    routed.mission.scenePreset === start.mission.scene_preset,
    "practice reply should preserve the start-card scene preset id",
  );
  assertNoInternalLeak(JSON.stringify(routed.learnerFacing), "learner-facing practice reply summary");

  const replyCard = readJson(routed.replyCardPath);
  assert(replyCard.saved === true, "reply card should mark saved");
  assert(replyCard.reply.source === "quick_reply", "reply card should preserve quick reply source");
  assert(replyCard.reply.answer === quickReplyText, "reply card should preserve saved answer");
  assert(replyCard.mission.id === start.mission.id, "reply card should preserve the start-card mission id");
  assert(
    replyCard.mission.target_skill === start.mission.target_skill,
    "reply card should preserve the start-card target skill",
  );
  assert(
    replyCard.mission.scene_preset === start.mission.scene_preset,
    "reply card should preserve the start-card scene preset id",
  );
  assert(
    replyCard.scene.id.endsWith(`-${start.mission.target_skill}`),
    "reply card scene should stay attached to the start-card target skill",
  );
  assert(replyCard.coaching.next_phrase, "reply card should include next phrase");
  assert(replyCard.cockpit.html === "cockpit.html", "reply card should link cockpit");
  assert(replyCard.claim_boundary.includes("does not prove learning outcomes"), "reply card should keep claim boundary");

  const html = readFileSync(routed.replyCardHtmlPath, "utf8");
  assert(html.includes("오늘 답변 저장됨"), "reply card HTML should show saved status");
  assert(html.includes(quickReplyText), "reply card HTML should show saved answer");
  assert(html.includes("Cockpit 열기"), "reply card HTML should link cockpit");
  assert(html.includes("Learner report 열기"), "reply card HTML should link report");
  assertNoInternalLeak(html, "practice reply-card HTML");

  const rendered = await renderReplyCard(routed.replyCardUrl);
  assert(rendered.h1 === "오늘 답변 저장됨", "rendered reply card should show saved title");
  assert(rendered.coachingCount === 4, "rendered reply card should show four coaching cells");
  assert(rendered.linkCount === 2, "rendered reply card should show report and cockpit links");
  assertNoInternalLeak(rendered.text, "rendered practice reply card");

  setupLearner(freeformRoot);
  const freeformStart = generateStart(freeformRoot);
  const freeform = runJson([
    "scripts/english-learning-harness.mjs",
    "practice-reply",
    "--learner-root",
    freeformRoot,
    "--say",
    "I don't know how to say it, but I want cold coffee with milk.",
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  assert(freeform.savedFrom === "freeform", "freeform practice reply should record freeform source");
  assert(freeform.savedAnswer.includes("cold coffee"), "freeform practice reply should save learner answer");
  assert(freeform.diagnosis === null, "freeform practice reply should not diagnose before current mission");
  assert(
    freeform.futureDiagnosis?.skill === "repair",
    "freeform practice reply should create future repair diagnosis after preserving current mission",
  );
  assert(freeform.mission.id === freeformStart.mission.id, "freeform practice reply should preserve start-card mission id");
  assert(
    freeform.mission.targetSkill === freeformStart.mission.target_skill,
    "freeform practice reply should preserve start-card target skill",
  );

  setupLearner(invalidRoot);
  generateStart(invalidRoot);
  let failed = false;
  try {
    runJson(
      [
        "scripts/english-learning-harness.mjs",
        "practice-reply",
        "--learner-root",
        invalidRoot,
        "--quick-reply",
        "99",
        "--date",
        "2026-06-04T09:00:00.000Z",
        "--json",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    failed = true;
    assert(String(error.stderr).includes("Unknown quick reply selection"), "invalid quick reply should fail clearly");
  }
  assert(failed, "invalid quick reply selection should fail");
  assert(
    !existsSync(resolve(invalidRoot, "artifacts/missions/practice-reply-card.json")),
    "invalid quick reply should not write a reply card",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-23",
        learnerRoot,
        replyCardHtmlPath: routed.replyCardHtmlPath,
        quickReplySaved: routed.savedAnswer,
        renderedCoachingCount: rendered.coachingCount,
        claimBoundary:
          "This validates daily practice reply routing and deferred future diagnosis with fixture data only. It does not save a real learner answer.",
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
        issue: "AIOS-23",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
