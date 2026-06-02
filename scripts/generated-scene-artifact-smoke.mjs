#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/generated-scene-artifact-smoke");
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
    throw new Error("Playwright is required for generated scene artifact smoke");
  }
}

async function inspectScene(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(url);
  const initial = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    label: document.querySelector("[data-scene-label]")?.textContent ?? "",
    visual: document.querySelector("[data-scene-visual]")?.textContent ?? "",
    sectionCount: document.querySelectorAll("section").length,
  }));
  await page.click("[data-scene-next]");
  const afterNext = await page.evaluate(() => ({
    label: document.querySelector("[data-scene-label]")?.textContent ?? "",
    visual: document.querySelector("[data-scene-visual]")?.textContent ?? "",
  }));
  await page.click("[data-scene-play]");
  const playState = await page.evaluate(() => ({
    active: document.querySelector("[data-scene-play]")?.dataset.active ?? "",
    text: document.querySelector("[data-scene-play]")?.textContent ?? "",
  }));
  await page.click("[data-scene-play]");
  const stopState = await page.evaluate(() => ({
    active: document.querySelector("[data-scene-play]")?.dataset.active ?? "",
    text: document.querySelector("[data-scene-play]")?.textContent ?? "",
  }));
  await browser.close();
  return { initial, afterNext, playState, stopState };
}

function mainAssertions({ scene, sceneState, rendered }) {
  assert(scene.status === "pass", "scene command failed");
  assert(existsSync(scene.sceneStatePath), "scene state missing");
  assert(existsSync(scene.sceneHtmlPath), "scene HTML missing");
  assert(scene.scene.frameCount === 4, "scene should have four learning frames");
  assert(sceneState.required_evidence.session_artifact === "artifacts/sessions/*.json", "scene should require session evidence");
  assert(sceneState.controls.primary_path === "text-first", "scene should preserve text-first path");
  assert(sceneState.frames.some((frame) => frame.id === "transfer"), "scene should include transfer frame");
  const html = readFileSync(scene.sceneHtmlPath, "utf8");
  assert(html.includes("data-scene-next"), "scene HTML missing next control");
  assert(html.includes("Speaking Skill OS 연결"), "scene HTML missing learning link section");
  assertNoProductSurfaceLeak(JSON.stringify(sceneState), "scene state");
  assertNoProductSurfaceLeak(html, "scene html");
  assertNoUnsupportedClaims(JSON.stringify(sceneState), "scene state");
  assertNoUnsupportedClaims(html, "scene html");
  assert(rendered.initial.title === "English Learning Generated Scene", "rendered scene title mismatch");
  assert(rendered.initial.sectionCount >= 3, "rendered scene should have sections");
  assert(rendered.afterNext.label !== rendered.initial.label, "next control should move to another frame");
  assert(rendered.playState.active === "true" && rendered.playState.text === "Pause", "play control should activate");
  assert(rendered.stopState.active === "false" && rendered.stopState.text === "Play", "play control should stop");
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
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I get stuck when I need to ask what someone means.",
    "--json",
  ]);

  const scene = runJson([
    "scripts/english-learning-harness.mjs",
    "scene",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T13:00:00.000Z",
    "--json",
  ]);
  const sceneState = readJson(scene.sceneStatePath);
  const rendered = await inspectScene(scene.sceneUrl);
  mainAssertions({ scene, sceneState, rendered });

  const practice = runJson([
    "scripts/english-learning-harness.mjs",
    "practice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T13:05:00.000Z",
    "--say",
    "Which place do you mean?",
    "--json",
  ]);
  assert(practice.scene?.htmlPath && existsSync(practice.scene.htmlPath), "practice should generate scene HTML");
  assert(practice.scene.frameCount === 4, "practice scene should have four frames");

  const report = readJson(practice.report.path);
  assert(report.generated_artifacts.latest_scene?.scene_id === practice.scene.id, "report should link latest scene");
  const cockpit = readJson(practice.cockpit.statePath);
  assert(cockpit.journey.latest_generated_scene?.scene_id === practice.scene.id, "cockpit should link latest scene");
  assert(cockpit.files.latest_generated_scene === "artifacts/scenes/daily-scene-2026-06-02.html", "cockpit files should expose scene path");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        sceneStatePath: scene.sceneStatePath,
        sceneHtmlPath: scene.sceneHtmlPath,
        practiceSceneHtmlPath: practice.scene.htmlPath,
        missionId: scene.scene.missionId,
        frameCount: scene.scene.frameCount,
        linkedReportScene: report.generated_artifacts.latest_scene.scene_id,
        linkedCockpitScene: cockpit.journey.latest_generated_scene.scene_id,
      },
      null,
      2,
    ),
  );
}

main();
