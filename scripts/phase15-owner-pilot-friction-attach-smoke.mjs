#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-friction-attach");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);
const privateFriction = "I froze because this private calendar detail felt sensitive.";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoLeak(text, label) {
  for (const forbidden of [
    privateFriction,
    "private calendar",
    "sensitive",
    "pilot-capture",
    "pilot-reply ",
    "pilot-day",
    "pilot-finish",
    "pull request",
    "issue #",
    "rubric",
    "product_journey_audit",
    "proves fluency",
  ]) {
    assert(!String(text).toLowerCase().includes(forbidden.toLowerCase()), `${label} leaked ${forbidden}`);
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
    throw new Error("Playwright is required for pilot friction attach render smoke");
  }
}

async function renderCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    linkCount: document.querySelectorAll(".links a").length,
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  for (const [cardId, answer] of [
    ["today_snapshot", "I had a quiet day and checked a few plans."],
    ["meaning_check", "Which place do you mean?"],
    ["stuck_rescue", "I do not know the exact word, but I mean it feels calm."],
    ["scene_snap", "There are two chairs and a small screen near me."],
    ["comfort_check", "My comfort score is 3 because I can answer slowly."],
  ]) {
    runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-capture",
      "--learner-root",
      learnerRoot,
      "--phase",
      "baseline",
      "--card-id",
      cardId,
      "--date",
      "2026-06-04T12:00:00.000Z",
      "--say",
      answer,
      "--json",
    ]);
  }

  const dayReply = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-05T12:00:00.000Z",
    "--say",
    "Which place do you mean?",
    "--json",
  ]);
  assert(dayReply.routedTo.phase === "day", "fixture should save a daily pilot answer");
  assert(dayReply.learnerFacing.frictionNoteCaptured === false, "daily reply should ask for friction later");
  const beforeState = readJson(resolve(learnerRoot, "pilot-state.json"));
  assert(beforeState.days.length === 1, "fixture should have exactly one completed day before friction attach");
  assert(beforeState.days[0].friction_note === "", "fixture day should start without friction note");
  const beforeSessionId = beforeState.days[0].session_id;

  const friction = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-friction",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-05T12:05:00.000Z",
    "--friction-note",
    privateFriction,
    "--json",
  ]);
  assert(friction.action === "pilot-friction", "friction action mismatch");
  assert(friction.savedAnswer === false, "friction attach should not save a new answer");
  assert(friction.day === 1, "friction attach should target latest daily day");
  assert(friction.previousFrictionCaptured === false, "friction attach should report previous missing note");
  assert(friction.frictionNoteCaptured === true, "friction note should be captured");
  assert(friction.dailySessionCount === 1, "friction attach should not duplicate daily sessions");
  assert(friction.evidenceGap.requiredEvidence.find((item) => item.id === "friction_notes").collected === 1, "evidence gap should count attached friction");
  assertNoLeak(JSON.stringify(friction), "pilot-friction JSON output");

  const afterState = readJson(resolve(learnerRoot, "pilot-state.json"));
  assert(afterState.days.length === 1, "friction attach should keep one completed day");
  assert(afterState.days[0].session_id === beforeSessionId, "friction attach should not replace the day session");
  assert(afterState.days[0].friction_note === privateFriction, "pilot state should store the local friction note");
  assert(afterState.partial.days[0].friction_note === privateFriction, "partial day record should store the local friction note");

  const cockpitState = readJson(friction.cockpit.statePath);
  assert(
    cockpitState.active_pilot.latest_friction_card?.html === "artifacts/pilot/pilot-friction-card.html",
    "cockpit should link latest friction card HTML",
  );
  assert(
    cockpitState.active_pilot.latest_friction_card?.json === "artifacts/pilot/pilot-friction-card.json",
    "cockpit should link latest friction card JSON",
  );
  const cockpitHtml = readFileSync(friction.cockpit.htmlPath, "utf8");
  assert(cockpitHtml.includes("최근 마찰 메모 카드"), "cockpit HTML should link latest friction card");
  assert(cockpitHtml.includes("pilot-friction-card.html"), "cockpit HTML should include friction card file");
  assertNoLeak(cockpitHtml, "cockpit HTML");

  const card = readFileSync(friction.frictionCard.htmlPath, "utf8");
  assert(card.includes("마찰 메모 저장됨"), "friction card missing confirmation heading");
  assertNoLeak(card, "friction card HTML");
  const rendered = await renderCard(friction.frictionCard.url);
  assert(rendered.h1 === "마찰 메모 저장됨", "rendered friction card heading mismatch");
  assert(rendered.linkCount === 2, "friction card should link evidence gap and cockpit");
  assertNoLeak(rendered.text, "rendered friction card");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-35",
        learnerRoot,
        day: friction.day,
        dailySessionCount: friction.dailySessionCount,
        frictionCardHtml: friction.frictionCard.htmlPath,
        claimBoundary:
          "This validates post-answer pilot friction attachment with fixture data only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-35", error: error.message }, null, 2));
  process.exitCode = 1;
}
