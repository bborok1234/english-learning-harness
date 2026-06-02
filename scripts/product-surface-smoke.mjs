#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function main() {
  const statePath = "docs/product/learner-cockpit-state.json";
  const htmlPath = "docs/product/learner-cockpit.html";
  assert(existsSync(resolve(repoRoot, statePath)), `${statePath} missing`);
  assert(existsSync(resolve(repoRoot, htmlPath)), `${htmlPath} missing`);

  const state = JSON.parse(readText(statePath));
  const html = readText(htmlPath);
  assert(state.surface?.audience === "한국인 영어 회화 학습자", "learner cockpit audience mismatch");
  assert(html.includes("오늘의 미션"), "learner cockpit missing today's mission");
  assert(html.includes("Codex에게 이렇게 말하세요"), "learner cockpit missing Codex start prompt");
  assert(html.includes("오늘의 말하기 행동"), "learner cockpit missing skill focus");
  assert(html.includes("7일 리포트"), "learner cockpit missing learner journey surface");
  assert(html.includes("engineering dashboard"), "learner cockpit should link to separated internal board");

  for (const forbidden of [
    "GitHub plan",
    "Pull Request",
    "PR #",
    "issue #",
    "smoke pass",
    "phase10",
    "M10 Narrative Mission Layer complete",
    "node scripts/english-learning-harness.mjs",
    "--learner-root",
    "start_command",
  ]) {
    assert(!html.includes(forbidden), `learner cockpit leaks engineering language: ${forbidden}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        surface: "product",
        statePath,
        htmlPath,
        claimBoundary:
          "Learner cockpit is a product surface. It does not expose issue/PR/smoke progress as learner value.",
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        surface: "product",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
