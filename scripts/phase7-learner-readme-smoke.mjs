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
  "This is not a learner-facing Node CLI product.",
  "Start In Codex",
  "Try These Prompts",
  "What Codex Does For You",
  "Who This Is For",
  "The Daily Learning Loop",
  "How It Helps Conversation",
  "What Gets Tracked",
];

for (const marker of firstScreenMarkers) {
  indexOfRequired(marker);
}

const startIndex = indexOfRequired("## Start In Codex");
const promptIndex = indexOfRequired("## Try These Prompts");
const engineIndex = indexOfRequired("## Internal Engine For Maintainers");
const maintainerIndex = indexOfRequired("## Maintainer Verification");
assert(startIndex < engineIndex, "Codex-first learner start must appear before internal engine commands");
assert(promptIndex < engineIndex, "natural-language learner prompts must appear before internal engine commands");
assert(engineIndex < maintainerIndex, "internal engine commands should stay in maintainer-facing area");

const firstNodeIndex = readme.indexOf("node scripts/");
assert(firstNodeIndex > engineIndex, "README exposes node commands before the internal engine section");

const learnerSignals = [
  "Do not ask me to run Node commands",
  "Codex should handle setup, practice, mini mirror, review memory, and progress files for you.",
  "Codex is the tutor and operator",
  "not the product surface a learner should have to operate by hand",
  "speak or type imperfect English",
  "Personal phrase memory",
  "mini mirror",
  "weekly mirror",
  "The skill contract is: keep the learner in conversation",
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
assert(!readme.includes("The most important first command is `today`."), "README still frames the CLI command as the learner's first command");
assert(!readme.includes("From a fresh private beta / invited-user clone"), "README still frames quick start as private beta");

console.log(
  JSON.stringify(
    {
      status: "pass",
      issue: "D2",
      claim: "README leads with Codex-native conversation before internal engine commands",
      checkedMarkers: firstScreenMarkers.length + learnerSignals.length,
    },
    null,
    2,
  ),
);
