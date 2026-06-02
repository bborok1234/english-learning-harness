#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/personal-learner-cockpit-smoke");
const learnerRoot = resolve(tmpRoot, "learner");
const audioPath = resolve(tmpRoot, "voice-note.wav");
const imagePath = resolve(tmpRoot, "market-scene.txt");
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

function assertNoProductSurfaceLeak(text) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "github",
    "pull request",
    "pr #",
    "issue #",
    "smoke pass",
    "implementation log",
    "m10 narrative mission layer complete",
  ]) {
    assert(!lower.includes(forbidden), `personal cockpit leaked engineering language: ${forbidden}`);
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
    throw new Error("Playwright is required for personal cockpit render smoke");
  }
}

async function renderCockpit(cockpitUrl) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(cockpitUrl);
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
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(audioPath, "Fixture placeholder for learner-recorded voice.");
  writeFileSync(imagePath, "Fixture placeholder for a market scene with a hidden receipt.");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want daily speaking scenes that connect to my weak spots.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I often stop when I do not understand the place or meaning.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-01T09:00:00.000Z",
    "--say",
    "Which place do you mean?",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "voice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-01T09:05:00.000Z",
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
    "2026-06-01T09:10:00.000Z",
    "--image-file",
    imagePath,
    "--hidden-detail",
    "the receipt is behind the apple basket",
    "--clarification-prompt",
    "Ask where the receipt is.",
    "--say",
    "Where is the receipt exactly?",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:15:00.000Z",
    "--json",
  ]);

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T09:20:00.000Z",
    "--json",
  ]);

  assert(cockpit.status === "pass", "cockpit command failed");
  assert(existsSync(cockpit.cockpitStatePath), "cockpit state missing");
  assert(existsSync(cockpit.cockpitPath), "cockpit html missing");
  assert(cockpit.journey.seven_day.session_count === 3, "seven-day journey should count three sessions");
  assert(cockpit.journey.thirty_day.session_count === 3, "thirty-day journey should count three sessions");
  assert(cockpit.journey.thirty_day.modalities.includes("text"), "journey missing text modality");
  assert(cockpit.journey.thirty_day.modalities.includes("voice"), "journey missing voice modality");
  assert(cockpit.journey.thirty_day.modalities.includes("image"), "journey missing image modality");
  assert(cockpit.speakingSkillOS.backlog_count >= 1, "cockpit should include speaking backlog");
  assert(cockpit.todayAction.start_command.includes(" today "), "cockpit should expose today start command");

  const stateText = readFileSync(cockpit.cockpitStatePath, "utf8");
  const html = readFileSync(cockpit.cockpitPath, "utf8");
  for (const expected of [
    "오늘의 영어 cockpit",
    "Speaking Skill OS",
    "멀티모달 학습 증거",
    "7일 / 30일 여정",
    "다음 행동",
    "Which place do you mean?",
  ]) {
    assert(html.includes(expected), `cockpit HTML missing: ${expected}`);
  }
  assertNoProductSurfaceLeak(stateText);
  assertNoProductSurfaceLeak(html);

  const rendered = await renderCockpit(cockpit.cockpitUrl);
  assert(rendered.title === "English Learning Personal Cockpit", "rendered title mismatch");
  assert(rendered.h1.includes("오늘의 영어 cockpit"), "rendered h1 mismatch");
  assert(rendered.sectionCount >= 6, "cockpit should render product sections");
  assert(rendered.detailsCount >= 3, "cockpit should include interactive disclosure controls");
  assert(rendered.text.includes("멀티모달 학습 증거"), "rendered page missing multimodal section");
  assert(rendered.text.includes("7일 / 30일 여정"), "rendered page missing journey section");
  assertNoProductSurfaceLeak(rendered.text);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        cockpitPath: cockpit.cockpitPath,
        cockpitStatePath: cockpit.cockpitStatePath,
        sessionCount7d: cockpit.journey.seven_day.session_count,
        sessionCount30d: cockpit.journey.thirty_day.session_count,
        modalities: cockpit.journey.thirty_day.modalities,
        sectionCount: rendered.sectionCount,
        detailsCount: rendered.detailsCount,
      },
      null,
      2,
    ),
  );
}

main();
