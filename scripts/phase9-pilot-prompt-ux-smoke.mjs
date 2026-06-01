#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-9-pilot-prompt-ux");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(
    execFileSync("node", args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
      encoding: "utf8",
    }),
  );
}

function publicPromptText(value) {
  const clone = structuredClone(value);
  delete clone.state;
  return JSON.stringify(clone);
}

function assertPromptUx(value, label) {
  const text = publicPromptText(value);
  for (const required of [
    "3분 영어 스냅샷",
    "친구",
    "오늘 실제로 한 일",
    "Let's meet at the usual place after work",
    "Which place do you mean?",
    "한 문장",
    "로컬",
  ]) {
    assert(text.includes(required), `${label}: missing user-facing prompt marker: ${required}`);
  }
  for (const forbidden of [
    "A clarification question I can ask",
    "Your project sounds useful",
    "main users",
    "side project",
    "answer in English with 3-5 short lines",
    "one clarification question",
    "prompt categories",
  ]) {
    assert(!text.includes(forbidden), `${label}: internal/ambiguous prompt leaked: ${forbidden}`);
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "owner self participant",
    "--json",
  ]);

  const start = runJson(["scripts/english-learning-harness.mjs", "pilot-start", "--json"]);
  assert(start.summary.status === "awaiting_baseline", "pilot should await baseline without sample");
  assert(start.conversationGuide.cards.length === 5, "Day 0 should expose five mission cards");
  assert(start.summary.nextAction.guide.cards.length === 5, "next action should include mission cards");
  assertPromptUx(start, "pilot-start");

  const status = runJson(["scripts/english-learning-harness.mjs", "pilot-status", "--json"]);
  assert(status.conversationGuide.cards.length === 5, "pilot status should keep Day 0 cards");
  assertPromptUx(status, "pilot-status");

  const promptDoc = readFileSync(resolve(repoRoot, "docs/PILOT-PROMPTS.md"), "utf8");
  assert(promptDoc.includes("Do not ask"), "prompt doc should document bad prompt pattern");
  assert(promptDoc.includes("A clarification question I can ask"), "prompt doc should record the rejected bad prompt");
  assert(promptDoc.includes("Which place do you mean?"), "prompt doc should include concrete replacement");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M9-3",
        promptDoc: "docs/PILOT-PROMPTS.md",
        checkedCards: start.conversationGuide.cards.length,
        claimBoundary:
          "This verifies learner-facing prompt clarity, not real learner outcome improvement.",
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
        issue: "M9-3",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
