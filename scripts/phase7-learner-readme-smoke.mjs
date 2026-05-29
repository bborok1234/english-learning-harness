#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const readme = readFileSync(resolve(repoRoot, "README.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function indexOfRequired(text) {
  const index = readme.indexOf(text);
  assert(index >= 0, `README missing ${text}`);
  return index;
}

const firstScreenMarkers = [
  "Open-source, local-first Codex harness",
  "Try It In 5 Minutes",
  "Who This Is For",
  "What You Practice",
  "How It Helps Conversation",
  "What Gets Tracked",
];

for (const marker of firstScreenMarkers) {
  indexOfRequired(marker);
}

const tryItIndex = indexOfRequired("## Try It In 5 Minutes");
const maintainerIndex = indexOfRequired("## Maintainer Verification");
assert(tryItIndex < maintainerIndex, "learner quick start must appear before maintainer verification");

const learnerSignals = [
  "The most important first command is `today`.",
  "speak or type imperfect English",
  "Personal phrase memory",
  "mini mirror",
  "weekly mirror",
  "home.html",
  "Do not put private learner journals",
  "Long-term real learner improvement still needs real multi-day human use",
];

for (const signal of learnerSignals) {
  indexOfRequired(signal);
}

for (const requiredCommand of [
  "git clone https://github.com/bborok1234/english-learning-harness.git",
  "node scripts/english-learning-harness.mjs setup",
  "node scripts/english-learning-harness.mjs daily --json",
  'node scripts/english-learning-harness.mjs today --say "I want to practice today." --json',
  "node scripts/english-learning-harness.mjs weekly --json",
  "node scripts/english-learning-harness.mjs home --json",
  "node scripts/english-learning-harness.mjs export --json",
]) {
  indexOfRequired(requiredCommand);
}

assert(!readme.includes("## What Works"), "README should not lead with implementation inventory");
assert(!readme.includes("From a fresh private beta / invited-user clone"), "README still frames quick start as private beta");

console.log(
  JSON.stringify(
    {
      status: "pass",
      issue: "D1",
      claim: "README leads with learner-first onboarding before maintainer verification",
      checkedMarkers: firstScreenMarkers.length + learnerSignals.length,
    },
    null,
    2,
  ),
);
