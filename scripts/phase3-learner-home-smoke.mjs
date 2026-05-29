#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-3-learner-home");
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

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function makeReviewDue() {
  const reviewQueuePath = resolve(learnerRoot, "review-queue.json");
  const queue = readJson(reviewQueuePath);
  assert(queue.items.length >= 1, "fixture should create a review queue item");
  queue.items[0] = {
    ...queue.items[0],
    due_at: "2026-05-28T00:00:00.000Z",
  };
  writeJson(reviewQueuePath, queue);
}

function assertNoUnsupportedPageClaims(text) {
  const lower = text.toLowerCase();
  for (const claim of [
    "native speaker",
    "confident with foreigners",
    "guaranteed",
    "fluent",
    "your level",
    "github",
    "pull request",
    "implementation log",
  ]) {
    assert(!lower.includes(claim), `learner home leaked unsupported/project claim: ${claim}`);
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
    throw new Error("Playwright is required for learner home render smoke");
  }
}

async function renderHome(homeUrl) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(homeUrl);
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

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want a daily speaking habit without feeling judged.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but coffee good.",
    "--json",
  ]);
  makeReviewDue();
  runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);

  const home = runJson([
    "scripts/english-learning-harness.mjs",
    "home",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);

  assert(home.status === "pass", "home command failed");
  assert(home.homePath === resolve(learnerRoot, "home.html"), "home path should live under learner root");
  assert(existsSync(home.homePath), "home HTML file missing");
  assert(home.todayAction.id, "home command missing today action");
  assert(home.dueReviewCount === 1, "home command should report due review count");

  const html = readFileSync(home.homePath, "utf8");
  for (const expected of [
    "오늘의 영어 연습",
    "복습할 문장",
    "최근 weekly mirror",
    "최근 저장한 표현",
    "Claim boundary",
    "coffee good",
  ]) {
    assert(html.includes(expected), `home HTML missing section/content: ${expected}`);
  }
  assertNoUnsupportedPageClaims(html);

  const rendered = await renderHome(home.homeUrl);
  assert(rendered.title === "English Learning Home", "rendered title mismatch");
  assert(rendered.h1.includes("오늘의 영어 연습"), "rendered h1 missing");
  assert(rendered.sectionCount >= 5, "learner home should render key sections");
  assert(rendered.text.includes("Start command"), "rendered page missing start command");
  assert(rendered.text.includes("복습할 문장"), "rendered page missing due review section");
  assert(rendered.text.includes("최근 weekly mirror"), "rendered page missing weekly mirror section");
  assertNoUnsupportedPageClaims(rendered.text);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        homePath: home.homePath,
        homeUrl: home.homeUrl,
        todayAction: home.todayAction.id,
        dueReviewCount: home.dueReviewCount,
        sectionCount: rendered.sectionCount,
      },
      null,
      2,
    ),
  );
}

main();
