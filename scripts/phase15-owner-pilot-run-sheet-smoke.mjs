#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-run-sheet");
const freshRoot = resolve(smokeRoot, "fresh-learner");
const resumeRoot = resolve(smokeRoot, "resume-learner");
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

function assertNoInternalLeak(text, label) {
  const lower = String(text).toLowerCase();
  for (const forbidden of [
    "node scripts/",
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
    throw new Error("Playwright is required for pilot run-sheet render smoke");
  }
}

async function renderRunSheet(url) {
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
    "pilot-run-sheet",
    "--learner-root",
    freshRoot,
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--json",
  ]);
  assert(fresh.action === "pilot-run-sheet", "fresh run sheet action mismatch");
  assert(fresh.savedAnswer === false, "fresh run sheet should not save an answer");
  assert(fresh.pilotStateExists === false, "fresh run sheet should not create pilot state");
  assert(!existsSync(resolve(freshRoot, "pilot-state.json")), "fresh run sheet should not mark consent");
  assert(fresh.consent.marked === false, "fresh run sheet consent should be unmarked");
  assert(fresh.consent.scope === "not-marked-until-first-save", "fresh run sheet should defer consent scope");
  assert(fresh.nextAction.phase === "baseline", "fresh run sheet should expose baseline next action");
  assert(fresh.nextAction.title === "첫 장면 고르기", "fresh run sheet should start at scene chooser");
  assert(fresh.nextAction.quick_replies.length >= 3, "fresh run sheet should expose quick replies");
  assert(existsSync(fresh.jsonPath), "fresh run sheet JSON missing");
  assert(existsSync(fresh.htmlPath), "fresh run sheet HTML missing");
  assert(existsSync(resolve(freshRoot, fresh.localSurfaces.launch_card.html)), "fresh run sheet launch card link missing");
  assert(existsSync(resolve(freshRoot, fresh.localSurfaces.cockpit.html)), "fresh run sheet cockpit link missing");
  const freshHtml = read(fresh.htmlPath);
  assert(freshHtml.includes("실제 말하기 여정 진행표"), "fresh run sheet HTML missing heading");
  assert(freshHtml.includes("첫 저장 전"), "fresh run sheet HTML should show unmarked consent");
  assert(freshHtml.includes("This run sheet and launch card do not save a learner answer."), "fresh run sheet missing save boundary");
  assertNoInternalLeak(freshHtml, "fresh run sheet HTML");
  const freshRendered = await renderRunSheet(fresh.url);
  assert(freshRendered.h1 === "실제 말하기 여정 진행표", "rendered fresh run sheet heading mismatch");
  assert(freshRendered.metricText.includes("첫 저장 전"), "rendered fresh run sheet should show consent boundary");
  assert(freshRendered.linkCount === 2, "rendered fresh run sheet should link launch card and cockpit");
  assertNoInternalLeak(freshRendered.text, "rendered fresh run sheet");

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-capture",
    "--learner-root",
    resumeRoot,
    "--phase",
    "baseline",
    "--card-id",
    "today_snapshot",
    "--date",
    "2026-06-04T09:00:00.000Z",
    "--say",
    "I had a quiet day and did a few small tasks.",
    "--json",
  ]);
  const resume = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-run-sheet",
    "--learner-root",
    resumeRoot,
    "--date",
    "2026-06-04T09:10:00.000Z",
    "--json",
  ]);
  assert(resume.savedAnswer === false, "resume run sheet should not save another answer");
  assert(resume.pilotStateExists === true, "resume run sheet should see pilot state");
  assert(resume.consent.marked === true, "resume run sheet should show existing consent");
  assert(resume.consent.scope === "local-only", "resume run sheet should show local-only consent");
  assert(resume.consent.accepted_at === "2026-06-04T09:00:00.000Z", "resume run sheet should preserve first-save consent timestamp");
  const resumeHtml = read(resume.htmlPath);
  assert(resumeHtml.includes("이미 기록됨"), "resume run sheet HTML should show marked consent");
  assertNoInternalLeak(resumeHtml, "resume run sheet HTML");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-29",
        freshHtmlPath: fresh.htmlPath,
        resumeHtmlPath: resume.htmlPath,
        freshConsentMarked: fresh.consent.marked,
        resumeConsentMarked: resume.consent.marked,
        claimBoundary:
          "This validates local real-pilot run-sheet mechanics with fixture data only. It does not save a real owner/self pilot answer.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-29", error: error.message }, null, 2));
  process.exitCode = 1;
}
