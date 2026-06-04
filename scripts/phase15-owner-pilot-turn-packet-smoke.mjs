#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-turn-packet");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);
const privateAnswer = "I privately checked a medical appointment and felt worried.";
const privateFriction = "This friction note should stay private.";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertTurnSafe(text, label) {
  for (const forbidden of [
    privateAnswer,
    privateFriction,
    "medical appointment",
    "should stay private",
    "node ",
    "scripts/",
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
    throw new Error("Playwright is required for pilot turn packet render smoke");
  }
}

async function renderTurn(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    linkCount: document.querySelectorAll(".links a").length,
    sayText: document.querySelector(".say")?.textContent ?? "",
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const fresh = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-turn",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T10:00:00.000Z",
    "--json",
  ]);
  assert(fresh.action === "pilot-turn", "fresh action mismatch");
  assert(fresh.savedAnswer === false, "fresh turn should not save an answer");
  assert(fresh.learnerTurn.language === "ko-first", "fresh turn should be Korean-first");
  assert(fresh.learnerTurn.say.includes("짧은 스냅샷"), "fresh turn should start with low-pressure snapshot copy");
  assert(fresh.learnerTurn.quick_replies.length >= 3, "fresh turn should include quick replies");
  assert(fresh.operatorOnly.save_policy.first_save_consent.includes("local-only"), "fresh turn should keep first-save consent boundary");
  assert(fresh.localSurfaces.launch_card.html === "artifacts/pilot/pilot-launch-card.html", "fresh turn should link launch card");
  assert(fresh.localSurfaces.handoff.html === "artifacts/pilot/pilot-handoff.html", "fresh turn should link handoff");
  assert(fresh.localSurfaces.next_card.html === "artifacts/pilot/pilot-next-card.html", "fresh turn should link next card");
  assert(fresh.localSurfaces.cockpit.html === "cockpit.html", "fresh turn should link cockpit");
  assert(existsSync(fresh.jsonPath), "fresh turn JSON missing");
  assert(existsSync(fresh.htmlPath), "fresh turn HTML missing");
  assertTurnSafe(JSON.stringify(fresh), "fresh turn JSON output");
  const freshHtml = read(fresh.htmlPath);
  assert(freshHtml.includes("다음 한 턴 준비"), "fresh turn HTML missing heading");
  assert(freshHtml.includes("학습자에게는 아래 문장만 말하고"), "fresh turn HTML missing operator boundary copy");
  assertTurnSafe(freshHtml, "fresh turn HTML");

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-capture",
    "--learner-root",
    learnerRoot,
    "--phase",
    "baseline",
    "--card-id",
    "today_snapshot",
    "--date",
    "2026-06-04T10:10:00.000Z",
    "--say",
    privateAnswer,
    "--friction-note",
    privateFriction,
    "--json",
  ]);
  const partial = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-turn",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T10:20:00.000Z",
    "--json",
  ]);
  assert(partial.savedAnswer === false, "partial turn should not save another answer");
  assert(partial.learnerTurn.say.includes("잠깐, 무슨 뜻이야?"), "partial turn should advance to the next baseline card");
  assert(partial.operatorOnly.phase === "baseline", "partial turn should keep baseline phase");
  assert(partial.redaction.transcript_text_included === false, "partial turn should not include transcript text");
  assert(partial.redaction.friction_notes_included === false, "partial turn should not include friction notes");
  assertTurnSafe(JSON.stringify(partial), "partial turn JSON output");
  const partialHtml = read(partial.htmlPath);
  assertTurnSafe(partialHtml, "partial turn HTML");
  const rendered = await renderTurn(partial.url);
  assert(rendered.h1 === "다음 한 턴 준비", "rendered turn heading mismatch");
  assert(rendered.sayText.includes("영어 한 문장"), "rendered turn should show learner-facing prompt");
  assert(rendered.linkCount === 4, "rendered turn should link launch, handoff, next card, and cockpit");
  assertTurnSafe(rendered.text, "rendered turn");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-31",
        freshHtmlPath: fresh.htmlPath,
        partialHtmlPath: partial.htmlPath,
        savedAnswer: partial.savedAnswer,
        linkCount: rendered.linkCount,
        claimBoundary:
          "This validates a Codex operator turn packet with fixture data only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-31", error: error.message }, null, 2));
  process.exitCode = 1;
}
