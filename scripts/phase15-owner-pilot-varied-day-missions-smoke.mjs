#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-varied-day-missions");
const learnerRoot = resolve(smokeRoot, "learner");

const expectedDays = [
  { day: 1, title: "확인 질문 만들기", marker: "Which place do you mean?", answer: "Which place do you mean?" },
  { day: 2, title: "말실수 고치기", marker: "I meant iced latte", answer: "Sorry, I meant iced latte, not hot latte." },
  { day: 3, title: "보이는 정보 설명하기", marker: "meeting room", answer: "It looks like a meeting room with a long table." },
  { day: 4, title: "부드럽게 다르게 말하기", marker: "cannot stay late", answer: "I understand, but I cannot stay late today." },
  { day: 5, title: "대화를 이어가기", marker: "Where did you go hiking?", answer: "That sounds nice. Where did you go hiking?" },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--learner-root",
    learnerRoot,
    "--say",
    "I opened the app and practiced one sentence.",
    "--say",
    "Which place do you mean?",
    "--say",
    "Sorry, I made a mistake.",
    "--say",
    "There are desks, chairs, and people working.",
    "--say",
    "I feel okay but a little tired.",
    "--comfort-rating",
    "3",
    "--json",
  ]);

  const seenTitles = [];
  for (const expected of expectedDays) {
    const next = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-next",
      "--learner-root",
      learnerRoot,
      "--json",
    ]);
    assert(next.nextCard.day === expected.day, `expected day ${expected.day}`);
    assert(next.nextCard.title === expected.title, `day ${expected.day} title mismatch`);
    assert(
      `${next.nextCard.ask} ${next.nextCard.example}`.includes(expected.marker),
      `day ${expected.day} marker missing: ${expected.marker}`,
    );
    seenTitles.push(next.nextCard.title);
    runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-day",
      "--learner-root",
      learnerRoot,
      "--day",
      String(expected.day),
      "--say",
      expected.answer,
      "--friction-note",
      `fixture day ${expected.day}`,
      "--json",
    ]);
  }

  const finalStatus = runJson(["scripts/english-learning-harness.mjs", "pilot-status", "--learner-root", learnerRoot, "--json"]);
  assert(finalStatus.summary.readyToFinish === true, "pilot should be ready for final sample after five varied days");
  assert(new Set(seenTitles).size === expectedDays.length, "daily pilot missions should not repeat across first five days");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        dayTitles: seenTitles,
        claimBoundary: "This validates varied fixture day missions only. It does not run the real owner/self pilot.",
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
        issue: "AIOS-12",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
