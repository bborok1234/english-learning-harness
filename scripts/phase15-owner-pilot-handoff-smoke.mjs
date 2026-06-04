#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-handoff");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);
const privateAnswer = "I had a private quiet day and checked a sensitive schedule.";
const privateFriction = "I felt nervous because this note is private.";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertRedacted(text, label) {
  for (const forbidden of [
    privateAnswer,
    privateFriction,
    "sensitive schedule",
    "this note is private",
    "pilot-capture",
    "pilot-day",
    "pilot-finish",
    "pull request",
    "issue #",
    "smoke",
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
    throw new Error("Playwright is required for pilot handoff render smoke");
  }
}

async function renderHandoff(url) {
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
    "pilot-handoff",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  assert(fresh.action === "pilot-handoff", "fresh handoff action mismatch");
  assert(fresh.savedAnswer === false, "fresh handoff should not save an answer");
  assert(fresh.pilot.baseline_ready === false, "fresh handoff should show no baseline");
  assert(fresh.pilot.partial_baseline_answers === 0, "fresh handoff should show zero baseline answers");
  assert(fresh.consent.marked === false, "fresh handoff should show no consent before save");
  assert(fresh.nextAction.phase === "baseline", "fresh handoff should expose baseline next action");
  assert(fresh.redaction.transcript_text_included === false, "fresh handoff should not include transcript text");
  assert(fresh.redaction.friction_notes_included === false, "fresh handoff should not include friction notes");
  assert(existsSync(fresh.jsonPath), "fresh handoff JSON missing");
  assert(existsSync(fresh.htmlPath), "fresh handoff HTML missing");
  assertRedacted(JSON.stringify(fresh), "fresh handoff JSON output");
  const freshHtml = read(fresh.htmlPath);
  assert(freshHtml.includes("실제 말하기 여정 이어받기"), "fresh handoff HTML missing heading");
  assert(freshHtml.includes("Transcript text included: false"), "fresh handoff HTML missing redaction signal");
  assertRedacted(freshHtml, "fresh handoff HTML");

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
    "2026-06-04T09:10:00.000Z",
    "--say",
    privateAnswer,
    "--json",
  ]);
  const partial = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-handoff",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T09:20:00.000Z",
    "--json",
  ]);
  assert(partial.savedAnswer === false, "partial handoff should not save another answer");
  assert(partial.pilot.partial_baseline_answers === 1, "partial handoff should show one baseline answer");
  assert(partial.consent.marked === true, "partial handoff should show saved consent");
  assert(partial.consent.scope === "local-only", "partial handoff should show local-only consent");
  assert(partial.nextAction.title === "잠깐, 무슨 뜻이야?", "partial handoff should show next baseline card");
  assert(partial.localSurfaces.next_card.html === "artifacts/pilot/pilot-next-card.html", "partial handoff should link next card");
  assert(partial.localSurfaces.cockpit.html === "cockpit.html", "partial handoff should link cockpit");
  assertRedacted(JSON.stringify(partial), "partial handoff JSON output");
  const partialHtml = read(partial.htmlPath);
  assert(partialHtml.includes("1/5"), "partial handoff HTML should show baseline progress count");
  assert(partialHtml.includes("local-only"), "partial handoff HTML should show consent scope");
  assertRedacted(partialHtml, "partial handoff HTML");
  const rendered = await renderHandoff(partial.url);
  assert(rendered.h1 === "실제 말하기 여정 이어받기", "rendered handoff heading mismatch");
  assert(rendered.metricText.includes("1/5"), "rendered handoff should show partial baseline count");
  assert(rendered.linkCount === 2, "rendered handoff should link next card and cockpit");
  assertRedacted(rendered.text, "rendered handoff");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-30",
        freshHtmlPath: fresh.htmlPath,
        partialHtmlPath: partial.htmlPath,
        partialBaselineAnswers: partial.pilot.partial_baseline_answers,
        redactedTranscriptText: partial.redaction.transcript_text_included === false,
        claimBoundary:
          "This validates redacted local pilot continuity handoff mechanics with fixture data only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-30", error: error.message }, null, 2));
  process.exitCode = 1;
}
