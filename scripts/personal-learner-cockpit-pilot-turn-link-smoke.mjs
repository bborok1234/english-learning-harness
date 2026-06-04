#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/personal-learner-cockpit-pilot-turn-link");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(
    execFileSync(process.execPath, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
      encoding: "utf8",
    }),
  );
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
    throw new Error("Playwright is required for cockpit pilot turn link render smoke");
  }
}

function assertNoLeak(text, label) {
  for (const forbidden of [
    "node ",
    "scripts/",
    "pilot-capture",
    "pilot-reply ",
    "pilot-start",
    "pilot-day",
    "pilot-finish",
    "product_journey_audit",
    "pull request",
    "issue #",
    "rubric",
    "proves fluency",
  ]) {
    assert(!String(text).toLowerCase().includes(forbidden.toLowerCase()), `${label} leaked ${forbidden}`);
  }
}

async function renderCockpit(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    turnLinkText: [...document.querySelectorAll("a")]
      .map((link) => link.textContent || "")
      .find((text) => text.includes("Codex 진행 카드")) || "",
    turnHref: [...document.querySelectorAll("a")]
      .map((link) => link.getAttribute("href") || "")
      .find((href) => href.includes("pilot-turn-packet.html")) || "",
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "owner self participant",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--say",
    "I worked on a small plan and had coffee today.",
    "--json",
  ]);
  const turn = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-turn",
    "--json",
  ]);
  assert(turn.savedAnswer === false, "pilot-turn should not save an answer");

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const state = JSON.parse(readFileSync(cockpit.cockpitStatePath, "utf8"));
  assert(state.active_pilot?.partial.baseline_answers === 1, "turn link generation should not add pilot answers");
  assert(
    state.active_pilot.turn_packet_artifact?.html === "artifacts/pilot/pilot-turn-packet.html",
    "cockpit state should link pilot turn packet HTML",
  );
  assert(
    state.active_pilot.turn_packet_artifact?.json === "artifacts/pilot/pilot-turn-packet.json",
    "cockpit state should link pilot turn packet JSON",
  );
  assert(existsSync(resolve(learnerRoot, state.active_pilot.turn_packet_artifact.html)), "turn packet HTML missing");
  assert(existsSync(resolve(learnerRoot, state.active_pilot.turn_packet_artifact.json)), "turn packet JSON missing");

  const html = readFileSync(cockpit.cockpitPath, "utf8");
  assert(html.includes("Codex 진행 카드 열기"), "cockpit HTML should link Codex turn packet");
  assert(html.includes("pilot-turn-packet.html"), "cockpit HTML should include turn packet href");
  assert(html.includes("Pilot 시작/재개 카드 열기"), "cockpit should preserve launch card link");
  assert(html.includes("현재 pilot 카드 열기"), "cockpit should preserve current card link");
  assert(html.includes("방금 저장된 답변 카드"), "cockpit should preserve latest reply card link");
  assertNoLeak(html, "cockpit HTML");

  const rendered = await renderCockpit(cockpit.cockpitUrl);
  assert(rendered.turnLinkText === "Codex 진행 카드 열기", "rendered cockpit should show Codex turn link");
  assert(rendered.turnHref.includes("pilot-turn-packet.html"), "rendered cockpit should link turn packet file");
  assertNoLeak(rendered.text, "rendered cockpit");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-32",
        learnerRoot,
        cockpitPath: cockpit.cockpitPath,
        turnPacketHtml: state.active_pilot.turn_packet_artifact.html,
        baselineAnswers: state.active_pilot.partial.baseline_answers,
        claimBoundary:
          "This validates active cockpit linkage to the local pilot turn packet only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", issue: "AIOS-32", error: error.message }, null, 2));
  process.exitCode = 1;
}
