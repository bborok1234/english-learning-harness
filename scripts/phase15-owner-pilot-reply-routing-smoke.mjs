#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-reply-routing");
const learnerRoot = resolve(smokeRoot, "learner");
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

function read(path) {
  return readFileSync(path, "utf8");
}

function readState() {
  return JSON.parse(read(resolve(learnerRoot, "pilot-state.json")));
}

function assertNoLearnerCommandLeak(htmlPath) {
  const html = read(htmlPath);
  for (const forbidden of [
    "english-learning-harness.mjs pilot-reply",
    "english-learning-harness.mjs pilot-capture",
    "english-learning-harness.mjs pilot-start",
    "english-learning-harness.mjs pilot-day",
    "english-learning-harness.mjs pilot-finish",
    "product_journey_audit",
  ]) {
    assert(!html.includes(forbidden), `learner HTML leaked ${forbidden}`);
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const firstBaseline = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--date",
    isoDay(0),
    "--say",
    "I practiced English with Codex for a few minutes today.",
    "--json",
  ]);
  assert(firstBaseline.action === "pilot-reply", "first baseline reply action mismatch");
  assert(firstBaseline.routedTo.phase === "baseline", "fresh reply should route to baseline");
  assert(firstBaseline.routedTo.cardId === "today_snapshot", "fresh reply should route to first baseline card");
  assert(firstBaseline.result.committed === false, "first baseline card should not commit the baseline");
  assert(firstBaseline.cockpit?.htmlPath && existsSync(firstBaseline.cockpit.htmlPath), "baseline reply should refresh cockpit");
  assert(firstBaseline.nextCardArtifact?.htmlPath, "baseline reply should return refreshed next-card artifact");
  assert(existsSync(firstBaseline.nextCardArtifact.htmlPath), "baseline reply next-card HTML missing");
  assert(firstBaseline.nextCardArtifact.nextCard.phase === "baseline", "first reply next card should stay in baseline phase");
  assert(firstBaseline.nextCardArtifact.nextCard.title === "잠깐, 무슨 뜻이야?", "first reply should advance to second baseline card");
  assertNoLearnerCommandLeak(firstBaseline.cockpit.htmlPath);
  assertNoLearnerCommandLeak(firstBaseline.nextCardArtifact.htmlPath);

  let baselineCommit = null;
  for (const answer of [
    "Which place do you mean?",
    "I do not know the exact word, but I mean the small room.",
    "There are desks, monitors, chairs, and people working.",
    "My comfort score is three because I can answer but I pause.",
  ]) {
    baselineCommit = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-reply",
      "--date",
      isoDay(0),
      "--say",
      answer,
      "--json",
    ]);
  }
  assert(baselineCommit?.nextCardArtifact?.nextCard.phase === "day", "baseline commit should refresh next card to daily phase");
  assert(baselineCommit.nextCardArtifact.nextCard.day === 1, "baseline commit next card should be day 1");
  assertNoLearnerCommandLeak(baselineCommit.nextCardArtifact.htmlPath);
  const afterBaseline = readState();
  assert(afterBaseline.baseline?.transcript?.length === 5, "pilot-reply should commit baseline after five cards");
  assert(afterBaseline.partial.baseline.answers.length === 5, "partial baseline answers should remain auditable");

  const nextCard = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--date",
    isoDay(1),
    "--json",
  ]);
  assert(nextCard.nextCard.phase === "day", "after baseline next card should be daily");
  assert(nextCard.nextCard.day === 1, "after baseline next card should be day 1");
  assertNoLearnerCommandLeak(nextCard.htmlPath);

  const dayOne = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--date",
    isoDay(1),
    "--say",
    "Which place do you mean before I choose the subway exit?",
    "--friction-note",
    "Automatic reply routing kept the learner out of command details.",
    "--json",
  ]);
  assert(dayOne.routedTo.phase === "day", "daily reply should route to day phase");
  assert(dayOne.routedTo.day === 1, "daily reply should route to day 1");
  assert(dayOne.result.committed === true, "daily reply should commit through pilot-day");
  assert(dayOne.result.result.day.pilot_mission?.target_skill === "clarification", "daily reply should preserve pilot mission metadata");
  assert(dayOne.result.result.day.learner_coaching?.next_phrase, "daily reply should preserve learner coaching metadata");
  assert(dayOne.nextCardArtifact?.nextCard.day === 2, "day 1 reply should refresh next card to day 2");
  assertNoLearnerCommandLeak(dayOne.cockpit.htmlPath);
  assertNoLearnerCommandLeak(dayOne.nextCardArtifact.htmlPath);

  let dayFive = null;
  for (const [index, answer] of [
    "Sorry, I meant iced latte, not hot latte.",
    "It looks like a meeting room with a whiteboard.",
    "I understand, but I cannot stay late today.",
    "Where did you go hiking?",
  ].entries()) {
    const day = index + 2;
    const reply = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-reply",
      "--date",
      isoDay(day),
      "--say",
      answer,
      "--friction-note",
      `fixture friction day ${day}`,
      "--json",
    ]);
    assert(reply.routedTo.phase === "day", `day ${day} should route to day phase`);
    assert(reply.routedTo.day === day, `day ${day} route mismatch`);
    assert(reply.result.committed === true, `day ${day} should commit`);
    dayFive = reply;
  }
  assert(dayFive?.nextCardArtifact?.nextCard.phase === "final", "day 5 reply should refresh next card to final phase");
  assertNoLearnerCommandLeak(dayFive.nextCardArtifact.htmlPath);

  const finalOne = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--date",
    isoDay(6),
    "--say",
    "I wrote handoff notes and practiced a short English answer today.",
    "--json",
  ]);
  assert(finalOne.routedTo.phase === "final", "after five days reply should route to final phase");
  assert(finalOne.routedTo.cardId === "today_snapshot", "first final reply should route to first final card");
  assert(finalOne.result.committed === false, "first final card should not commit final sample");
  assert(finalOne.summary.partial.finalAnswers === 1, "summary should expose one captured final answer");
  assert(finalOne.nextCardArtifact?.nextCard.phase === "final", "first final reply should refresh next final card");
  assert(finalOne.nextCardArtifact.nextCard.title === "잠깐, 무슨 뜻이야?", "first final reply should advance to second final card");
  assertNoLearnerCommandLeak(finalOne.cockpit.htmlPath);
  assertNoLearnerCommandLeak(finalOne.nextCardArtifact.htmlPath);

  const finalState = runJson(["scripts/english-learning-harness.mjs", "pilot-status", "--json"]);
  assert(finalState.summary.completedDailySessions === 5, "pilot should have five completed daily sessions");
  assert(finalState.summary.finalReady === false, "single final card should not finish the pilot");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        routedPhases: ["baseline", "day", "final"],
        completedDailySessions: finalState.summary.completedDailySessions,
        claimBoundary:
          "This validates automatic pilot reply routing with fixture data only. It does not run or complete the real owner/self pilot.",
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
