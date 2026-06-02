#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-reply-card-render");
const learnerRoot = resolve(smokeRoot, "learner");
const require = createRequire(import.meta.url);
const startDate = new Date("2026-06-01T09:00:00.000Z");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isoDay(offset) {
  const date = new Date(startDate.getTime());
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString();
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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoInternalLeak(text) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "github",
    "pull request",
    "pr #",
    "issue #",
    "pilot-reply",
    "pilot-capture",
    "pilot-start",
    "pilot-finish",
    "product_journey_audit",
    "native speaker",
    "guaranteed",
    "proves fluency",
  ]) {
    assert(!lower.includes(forbidden), `reply card leaked internal or unsupported claim text: ${forbidden}`);
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
    throw new Error("Playwright is required for pilot reply card render smoke");
  }
}

async function renderReplyCard(url) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 920 } });
  await page.goto(url);
  const result = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent ?? "",
    text: document.body.innerText,
    sectionCount: document.querySelectorAll("section").length,
    gridItemCount: document.querySelectorAll(".line").length,
    nextCardLabel: document.querySelector('[aria-label="next card"]')?.textContent ?? "",
  }));
  await browser.close();
  return result;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  for (const answer of [
    "I practiced English with Codex for a few minutes today.",
    "Which place do you mean?",
    "I do not know the exact word, but I mean the small room.",
    "There are desks, monitors, chairs, and people working.",
    "My comfort score is three because I can answer but I pause.",
  ]) {
    runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-reply",
      "--date",
      isoDay(0),
      "--say",
      answer,
      "--json",
    ]);
  }

  const reply = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--date",
    isoDay(1),
    "--say",
    "Which place do you mean before I choose the subway exit?",
    "--friction-note",
    "Fixture checks that the saved-reply card renders without exposing command details.",
    "--json",
  ]);

  assert(reply.routedTo.phase === "day", "reply should route to daily phase");
  assert(reply.routedTo.day === 1, "reply should route to day 1");
  assert(reply.replyCardArtifact?.htmlPath, "reply should return reply card HTML path");
  assert(reply.replyCardArtifact?.jsonPath, "reply should return reply card JSON path");
  assert(reply.replyCardArtifact?.url?.startsWith("file://"), "reply should return file URL");
  assert(existsSync(reply.replyCardArtifact.htmlPath), "reply card HTML missing");
  assert(existsSync(reply.replyCardArtifact.jsonPath), "reply card JSON missing");
  assert(reply.learnerFacing.nextPhrase, "daily reply should include next phrase");
  assert(reply.learnerFacing.nextCard?.title, "daily reply should include next card");

  const card = readJson(reply.replyCardArtifact.jsonPath);
  assert(card.surface === "learner-facing pilot reply card", "reply card surface mismatch");
  assert(card.saved === true, "reply card should be saved");
  assert(card.coaching.next_phrase === reply.learnerFacing.nextPhrase, "reply card next phrase mismatch");
  assert(card.next_card.title === reply.learnerFacing.nextCard.title, "reply card next card mismatch");
  assertNoInternalLeak(
    [
      card.coaching.communicated,
      card.coaching.recast,
      card.coaching.next_phrase,
      card.coaching.next_focus,
      card.next_card.title,
      card.next_card.ask,
      card.next_card.example,
      card.learner_rule,
      card.privacy,
      card.claim_boundary,
    ].join("\n"),
  );

  const rendered = await renderReplyCard(reply.replyCardArtifact.url);
  assert(rendered.title === "답변 저장됨", "rendered title mismatch");
  assert(rendered.h1.includes("답변이 저장됐어요"), "rendered h1 mismatch");
  assert(rendered.text.includes("오늘 남긴 말하기 증거"), "rendered page missing speaking evidence section");
  assert(rendered.text.includes("자연스럽게 바꾸면"), "rendered page missing recast label");
  assert(rendered.text.includes("다음에 쓸 표현"), "rendered page missing next phrase label");
  assert(rendered.text.includes(reply.learnerFacing.nextPhrase), "rendered page missing next phrase value");
  assert(rendered.text.includes("다음 카드"), "rendered page missing next card section");
  assert(rendered.nextCardLabel.includes(reply.learnerFacing.nextCard.title), "rendered next card title mismatch");
  assert(rendered.nextCardLabel.includes(reply.learnerFacing.nextCard.ask), "rendered next card prompt mismatch");
  assert(rendered.sectionCount >= 2, "reply card should render panel and next-card sections");
  assert(rendered.gridItemCount === 4, "reply card should render four coaching evidence cells");
  assertNoInternalLeak(rendered.text);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: 196,
        learnerRoot,
        replyCardPath: reply.replyCardArtifact.htmlPath,
        replyCardJsonPath: reply.replyCardArtifact.jsonPath,
        sectionCount: rendered.sectionCount,
        gridItemCount: rendered.gridItemCount,
        claimBoundary:
          "This validates browser-rendered fixture reply-card mechanics only. It does not run or complete the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  await main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: 196,
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
