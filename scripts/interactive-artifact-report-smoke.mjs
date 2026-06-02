#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/interactive-artifact-report-smoke");
const learnerRoot = resolve(tmpRoot, "learner");
const audioPath = resolve(tmpRoot, "voice-note.wav");
const imagePath = resolve(tmpRoot, "station-scene.txt");
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

function assertNoProductSurfaceLeak(text, label) {
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
    assert(!lower.includes(forbidden), `${label} leaked engineering language: ${forbidden}`);
  }
}

function assertNoUnsupportedClaims(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "generated worlds increase retention",
    "realtime voice adventure is supported",
    "native speaker",
    "your level",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
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
    throw new Error("Playwright is required for interactive artifact report smoke");
  }
}

async function inspectMission(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(url);
  const initial = await page.evaluate(() => ({
    title: document.title,
    text: document.body.innerText,
    tabCount: document.querySelectorAll("[data-mode-tab]").length,
    panelCount: document.querySelectorAll("[data-mode-panel]").length,
    textHidden: document.querySelector('[data-mode-panel="text"]')?.hidden ?? true,
    voiceHidden: document.querySelector('[data-mode-panel="voice"]')?.hidden ?? false,
  }));
  await page.click('[data-mode-tab="voice"]');
  const afterVoice = await page.evaluate(() => ({
    textHidden: document.querySelector('[data-mode-panel="text"]')?.hidden ?? false,
    voiceHidden: document.querySelector('[data-mode-panel="voice"]')?.hidden ?? true,
    selected: document.querySelector('[data-mode-tab="voice"]')?.getAttribute("aria-selected") ?? "",
  }));
  await page.click('[data-mode-tab="image"]');
  const afterImage = await page.evaluate(() => ({
    imageHidden: document.querySelector('[data-mode-panel="image"]')?.hidden ?? true,
    selected: document.querySelector('[data-mode-tab="image"]')?.getAttribute("aria-selected") ?? "",
  }));
  await browser.close();
  return { initial, afterVoice, afterImage };
}

async function inspectReport(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    sectionCount: document.querySelectorAll("section").length,
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(audioPath, "Fixture placeholder for transcript-backed voice practice.");
  writeFileSync(imagePath, "Fixture placeholder for an unclear subway station scene.");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want daily speaking missions that connect to my weak points.",
    "--json",
  ]);
  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I stop when I need to ask what someone means.",
    "--json",
  ]);

  const mission = runJson([
    "scripts/english-learning-harness.mjs",
    "mission",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:00:00.000Z",
    "--json",
  ]);
  assert(mission.status === "pass", "mission command failed");
  assert(existsSync(mission.missionHtmlPath), "mission HTML missing");

  const missionState = readJson(mission.missionStatePath);
  assert(
    missionState.expected_evidence.speaking_backlog_item_id === diagnosis.backlogItem.id,
    "mission should target diagnosed Speaking Skill OS item",
  );

  const missionHtml = readFileSync(mission.missionHtmlPath, "utf8");
  assert(missionHtml.includes('data-mode-tab="text"'), "mission should expose text mode tab");
  assert(missionHtml.includes('data-mode-panel="voice"'), "mission should expose voice mode panel");
  assert(missionHtml.includes("practice-note"), "mission should include learner draft surface");
  assertNoProductSurfaceLeak(missionHtml, "mission");
  assertNoUnsupportedClaims(missionHtml, "mission");

  const renderedMission = await inspectMission(mission.missionUrl);
  assert(renderedMission.initial.title === "English Learning Daily Mission", "mission render title mismatch");
  assert(renderedMission.initial.tabCount === 3, "mission should render three practice mode tabs");
  assert(renderedMission.initial.panelCount === 3, "mission should render three practice mode panels");
  assert(renderedMission.initial.textHidden === false, "text panel should be visible first");
  assert(renderedMission.initial.voiceHidden === true, "voice panel should be hidden first");
  assert(renderedMission.afterVoice.selected === "true", "voice tab should become selected");
  assert(renderedMission.afterVoice.voiceHidden === false, "voice panel should become visible");
  assert(renderedMission.afterVoice.textHidden === true, "text panel should hide after voice selection");
  assert(renderedMission.afterImage.selected === "true", "image tab should become selected");
  assert(renderedMission.afterImage.imageHidden === false, "image panel should become visible");

  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:05:00.000Z",
    "--say",
    missionState.learner_visible_scene.example,
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "voice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:10:00.000Z",
    "--audio-file",
    audioPath,
    "--say",
    "Could you say that again more slowly?",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "image",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:15:00.000Z",
    "--image-file",
    imagePath,
    "--hidden-detail",
    "the exact meeting place is missing",
    "--clarification-prompt",
    "Ask which place they mean.",
    "--say",
    "Which place do you mean?",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:20:00.000Z",
    "--json",
  ]);

  const report = runJson([
    "scripts/english-learning-harness.mjs",
    "report",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:25:00.000Z",
    "--json",
  ]);
  assert(report.status === "pass", "report command failed");
  assert(existsSync(report.reportPath), "report JSON missing");
  assert(existsSync(report.reportHtmlPath), "report HTML missing");
  assert(report.windows.seven_day.session_count === 3, "7-day report should count three sessions");
  assert(report.windows.thirty_day.event_count === 3, "30-day report should count three events");
  assert(report.windows.thirty_day.modalities.includes("text"), "report missing text modality");
  assert(report.windows.thirty_day.modalities.includes("voice"), "report missing voice modality");
  assert(report.windows.thirty_day.modalities.includes("image"), "report missing image modality");

  const reportState = readJson(report.reportPath);
  assert(reportState.generated_artifacts.latest_mission?.mission_id === mission.mission.id, "report should link latest mission");
  assert(reportState.next_focus?.prompt, "report should include next focus prompt");
  const reportHtml = readFileSync(report.reportHtmlPath, "utf8");
  assert(reportHtml.includes("내 영어 회화 여정 리포트"), "report HTML missing learner title");
  assert(reportHtml.includes("7일 / 30일 변화"), "report HTML missing journey section");
  assertNoProductSurfaceLeak(JSON.stringify(reportState), "report state");
  assertNoProductSurfaceLeak(reportHtml, "report");
  assertNoUnsupportedClaims(JSON.stringify(reportState), "report state");
  assertNoUnsupportedClaims(reportHtml, "report");

  const renderedReport = await inspectReport(report.reportUrl);
  assert(renderedReport.title === "English Learning Learner Report", "rendered report title mismatch");
  assert(renderedReport.h1.includes("내 영어 회화 여정 리포트"), "rendered report h1 mismatch");
  assert(renderedReport.sectionCount >= 5, "report should render learner sections");

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:30:00.000Z",
    "--json",
  ]);
  assert(
    cockpit.journey.latest_learner_report?.html === "artifacts/reports/learner-report-2026-06-02.html",
    "cockpit should link latest learner report",
  );
  const cockpitHtml = readFileSync(cockpit.cockpitPath, "utf8");
  assert(cockpitHtml.includes("최근 learner report"), "cockpit HTML missing latest learner report");
  assertNoProductSurfaceLeak(cockpitHtml, "cockpit");
  assertNoUnsupportedClaims(cockpitHtml, "cockpit");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        missionHtmlPath: mission.missionHtmlPath,
        reportPath: report.reportPath,
        reportHtmlPath: report.reportHtmlPath,
        cockpitPath: cockpit.cockpitPath,
        sessionCount7d: report.windows.seven_day.session_count,
        eventCount30d: report.windows.thirty_day.event_count,
        modalities: report.windows.thirty_day.modalities,
      },
      null,
      2,
    ),
  );
}

main();
