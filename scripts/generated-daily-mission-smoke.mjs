#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/generated-daily-mission-smoke");
const learnerRoot = resolve(tmpRoot, "learner");
const require = createRequire(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  const output = execFileSync("node", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoProductSurfaceLeak(text) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "github",
    "pull request",
    "pr #",
    "issue #",
    "smoke pass",
    "implementation log",
    "milestone",
  ]) {
    assert(!lower.includes(forbidden), `generated mission leaked engineering language: ${forbidden}`);
  }
}

function assertNoUnsupportedClaims(text) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "generated worlds increase retention",
    "realtime voice adventure is supported",
    "native speaker",
    "your level",
  ]) {
    assert(!lower.includes(forbidden), `generated mission leaked unsupported claim: ${forbidden}`);
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
    throw new Error("Playwright is required for generated mission render smoke");
  }
}

async function render(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    sectionCount: document.querySelectorAll("section").length,
    detailsCount: document.querySelectorAll("details").length,
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I get stuck when I need to ask what someone means.",
    "--json",
  ]);
  assert(diagnosis.backlogItem?.id, "diagnose should create a Speaking Skill OS backlog item");

  const mission = runJson([
    "scripts/english-learning-harness.mjs",
    "mission",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T10:00:00.000Z",
    "--json",
  ]);
  assert(mission.status === "pass", "mission command failed");
  assert(existsSync(mission.missionStatePath), "mission state missing");
  assert(existsSync(mission.missionHtmlPath), "mission html missing");
  assert(mission.mission.startCommands.text.includes(" today "), "mission should include text-first start command");
  assert(mission.mission.startCommands.voice.includes(" voice "), "mission should include optional voice path");
  assert(mission.mission.startCommands.image.includes(" image "), "mission should include optional image path");

  const missionState = readJson(mission.missionStatePath);
  assert(
    missionState.source.backlog_item_id === diagnosis.backlogItem.id,
    "mission should link to the current Speaking Skill OS item",
  );
  assert(missionState.expected_evidence.speaking_backlog_item_id === diagnosis.backlogItem.id, "mission evidence link mismatch");
  assert(missionState.optional_artifacts.html_card_required === true, "mission should require HTML scene card");

  const missionHtml = readFileSync(mission.missionHtmlPath, "utf8");
  for (const expected of [
    "Generated daily mission",
    "오늘의 장면",
    "Speaking Skill OS 연결",
    "바로 시작",
    "생성형 확장 프롬프트",
  ]) {
    assert(missionHtml.includes(expected), `mission HTML missing ${expected}`);
  }
  assertNoProductSurfaceLeak(JSON.stringify(missionState));
  assertNoProductSurfaceLeak(missionHtml);
  assertNoUnsupportedClaims(JSON.stringify(missionState));
  assertNoUnsupportedClaims(missionHtml);

  const renderedMission = await render(mission.missionUrl);
  assert(renderedMission.title === "English Learning Daily Mission", "rendered mission title mismatch");
  assert(renderedMission.sectionCount >= 5, "mission should render key sections");
  assert(renderedMission.detailsCount >= 4, "mission should render interactive details");
  assert(renderedMission.text.includes("바로 시작"), "rendered mission missing start section");
  assertNoProductSurfaceLeak(renderedMission.text);
  assertNoUnsupportedClaims(renderedMission.text);

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T10:05:00.000Z",
    "--say",
    missionState.learner_visible_scene.example,
    "--json",
  ]);
  assert(today.status === "pass", "today after generated mission failed");
  assert(today.speakingBacklogEvidence?.item_id === diagnosis.backlogItem.id, "today should write backlog evidence for mission item");

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T10:10:00.000Z",
    "--json",
  ]);
  assert(
    cockpit.journey.latest_generated_mission?.mission_id === mission.mission.id,
    "cockpit should point to latest generated mission",
  );
  assert(cockpit.journey.thirty_day.session_count === 1, "cockpit should count post-mission practice session");
  assert(cockpit.journey.thirty_day.event_count === 1, "cockpit should count post-mission interaction event");

  const cockpitHtml = readFileSync(cockpit.cockpitPath, "utf8");
  assert(cockpitHtml.includes("생성된 장면 artifact"), "cockpit missing generated mission section");
  assert(cockpitHtml.includes(missionState.learner_visible_scene.title), "cockpit missing generated mission title");
  assertNoProductSurfaceLeak(cockpitHtml);
  assertNoUnsupportedClaims(cockpitHtml);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        missionStatePath: mission.missionStatePath,
        missionHtmlPath: mission.missionHtmlPath,
        missionId: mission.mission.id,
        backlogItemId: diagnosis.backlogItem.id,
        cockpitPath: cockpit.cockpitPath,
        sessionCount30d: cockpit.journey.thirty_day.session_count,
        eventCount30d: cockpit.journey.thirty_day.event_count,
      },
      null,
      2,
    ),
  );
}

main();
