#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-evidence-gap");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);
const privateAnswer = "I privately discussed a family health schedule.";
const privateFriction = "I froze because the health detail felt private.";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function byId(gap, id) {
  return gap.requiredEvidence.find((item) => item.id === id);
}

function assertNoLeak(text, label) {
  for (const forbidden of [
    privateAnswer,
    privateFriction,
    "family health",
    "health detail",
    "pilot-capture",
    "pilot-reply",
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
    throw new Error("Playwright is required for pilot evidence gap render smoke");
  }
}

async function renderGap(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    linkCount: document.querySelectorAll(".links a").length,
    metricText: document.querySelector(".grid")?.textContent ?? "",
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const fresh = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-evidence-gap",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T11:00:00.000Z",
    "--json",
  ]);
  assert(fresh.action === "pilot-evidence-gap", "fresh action mismatch");
  assert(fresh.savedAnswer === false, "fresh gap should not save an answer");
  assert(fresh.overall.complete === false, "fresh gap should be incomplete");
  assert(byId(fresh, "day0_baseline").collected === 0, "fresh baseline count should be zero");
  assert(byId(fresh, "daily_sessions").remaining === 5, "fresh daily remaining should be five");
  assert(fresh.redaction.transcript_text_included === false, "fresh gap should not include transcript text");
  assert(fresh.redaction.friction_note_text_included === false, "fresh gap should not include friction text");
  assert(existsSync(fresh.jsonPath), "fresh gap JSON missing");
  assert(existsSync(fresh.htmlPath), "fresh gap HTML missing");
  assertNoLeak(JSON.stringify(fresh), "fresh gap JSON output");
  assertNoLeak(read(fresh.htmlPath), "fresh gap HTML");

  for (const [cardId, answer] of [
    ["today_snapshot", privateAnswer],
    ["meaning_check", "Which place do you mean?"],
    ["stuck_rescue", "I do not know the exact word, but I mean this place feels quiet."],
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
      "2026-06-04T11:10:00.000Z",
      "--say",
      answer,
      "--json",
    ]);
  }
  for (const day of [1, 2]) {
    runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-capture",
      "--learner-root",
      learnerRoot,
      "--phase",
      "day",
      "--day",
      String(day),
      "--date",
      `2026-06-0${4 + day}T11:20:00.000Z`,
      "--say",
      day === 1 ? "Which place do you mean?" : "Sorry, I ordered tea, not coffee.",
      "--friction-note",
      day === 1 ? privateFriction : "I paused before choosing a short repair phrase.",
      "--json",
    ]);
  }

  const partial = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-evidence-gap",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-07T11:30:00.000Z",
    "--json",
  ]);
  assert(partial.savedAnswer === false, "partial gap should not save another answer");
  assert(byId(partial, "day0_baseline").complete === true, "partial gap should show complete baseline");
  assert(byId(partial, "daily_sessions").collected === 2, "partial gap should count two daily sessions");
  assert(byId(partial, "daily_sessions").remaining === 3, "partial gap should show three daily sessions remaining");
  assert(byId(partial, "friction_notes").collected === 2, "partial gap should count friction notes by number only");
  assert(byId(partial, "final_sample").collected === 0, "partial gap should show no final sample");
  assert(byId(partial, "local_report").complete === false, "partial gap should show report missing");
  assert(partial.nextSafeStep.phase === "day", "partial gap should keep next safe step as daily phase");
  assert(partial.localSurfaces.turn_packet.html === "artifacts/pilot/pilot-turn-packet.html", "partial gap should link turn packet");
  assert(partial.localSurfaces.cockpit.html === "cockpit.html", "partial gap should link cockpit");
  assertNoLeak(JSON.stringify(partial), "partial gap JSON output");
  const partialHtml = read(partial.htmlPath);
  assert(partialHtml.includes("실제 pilot 증거 남은 것"), "partial gap HTML missing heading");
  assert(partialHtml.includes("2 / 5"), "partial gap HTML should show daily count");
  assertNoLeak(partialHtml, "partial gap HTML");
  const rendered = await renderGap(partial.url);
  assert(rendered.h1 === "실제 pilot 증거 남은 것", "rendered gap heading mismatch");
  assert(rendered.metricText.includes("2 / 5"), "rendered gap should show two of five daily sessions");
  assert(rendered.linkCount === 4, "rendered gap should link four local surfaces");
  assertNoLeak(rendered.text, "rendered gap");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-33",
        freshHtmlPath: fresh.htmlPath,
        partialHtmlPath: partial.htmlPath,
        dailyCollected: byId(partial, "daily_sessions").collected,
        frictionCollected: byId(partial, "friction_notes").collected,
        claimBoundary:
          "This validates redacted real-pilot evidence-gap mechanics with fixture data only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-33", error: error.message }, null, 2));
  process.exitCode = 1;
}
