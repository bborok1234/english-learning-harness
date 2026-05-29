#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const readme = readFileSync(resolve(repoRoot, "README.md"), "utf8");
const englishReadme = readFileSync(resolve(repoRoot, "README.en.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function indexOfRequired(text) {
  const index = readme.indexOf(text);
  assert(index >= 0, `README missing ${text}`);
  return index;
}

const firstScreenMarkers = [
  "[한국어](README.md) | [English](README.en.md)",
  "한국인을 위한 Codex-native 영어 회화 학습 하네스.",
  "이 제품은 학습자가 `node` 명령어를 직접 치는 CLI가 아닙니다.",
  "Codex에 붙여넣기",
  "이렇게 말하면 됩니다",
  "Codex가 해주는 일",
  "누구를 위한 제품인가",
  "매일 학습 루프",
  "회화 능력에 도움이 되는 방식",
  "무엇이 기록되나",
];

for (const marker of firstScreenMarkers) {
  indexOfRequired(marker);
}

const startIndex = indexOfRequired("## Codex에 붙여넣기");
const promptIndex = indexOfRequired("## 이렇게 말하면 됩니다");
const installDetailsIndex = indexOfRequired("## Agent Install Details");
const engineIndex = indexOfRequired("## Maintainer용 내부 엔진");
const maintainerIndex = indexOfRequired("## Maintainer Verification");
assert(installDetailsIndex < engineIndex, "agent install details should appear before maintainer engine internals");
assert(startIndex < engineIndex, "Codex-first learner start must appear before internal engine commands");
assert(promptIndex < engineIndex, "natural-language learner prompts must appear before internal engine commands");
assert(engineIndex < maintainerIndex, "internal engine commands should stay in maintainer-facing area");

const firstNodeIndex = readme.indexOf("node scripts/");
assert(firstNodeIndex > engineIndex, "README exposes node commands before the internal engine section");

const learnerSignals = [
  "Install English Learning Harness from:",
  "Do not ask me to clone the repo or run Node commands manually.",
  "Codex가 skill 설치, 학습자 설정, 첫 연습, progress 저장, mini mirror까지 처리해야 합니다.",
  "Codex는 튜터이자 운영자입니다.",
  "학습자가 직접 조작해야 하는 제품 표면이 아닙니다.",
  "~/.codex/skills/english-learning-daily-session",
  "이것은 agent-operated install path입니다.",
  "영어를 읽을 수는 있지만 막상 말하려면 얼어붙는 한국인 학습자",
  "개인 phrase memory",
  "mini mirror",
  "weekly mirror",
  "Skill contract: 학습자는 계속 대화 안에 두고",
  "개인 정보는 의도적으로 공유하기 전까지 GitHub issue에 올리지 마세요",
  "실제 장기 회화 능력 향상은 fixture smoke가 아니라 real multi-day learner use로 검증해야 합니다.",
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
assert(!readme.includes("Clone or download this repository."), "README still uses human clone/download as the primary path");
assert(!readme.includes("The most important first command is `today`."), "README still frames the CLI command as the learner's first command");
assert(!readme.includes("From a fresh private beta / invited-user clone"), "README still frames quick start as private beta");
assert(englishReadme.includes("[한국어](README.md) | [English](README.en.md)"), "English README missing language switcher");
assert(englishReadme.includes("Codex-native English conversation practice harness for Korean learners."), "English README missing target positioning");

console.log(
  JSON.stringify(
    {
      status: "pass",
      issue: "D4",
      claim: "README.md is Korean-first and leads with paste-into-Codex install before internal engine commands",
      checkedMarkers: firstScreenMarkers.length + learnerSignals.length,
    },
    null,
    2,
  ),
);
