#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { personaFixtures, prohibitedFixtureClaims } from "./lib/persona-fixtures.mjs";
import { evaluateTranscriptReview } from "./lib/transcript-review-rubric.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = resolve(repoRoot, "tmp/phase-5-persona-validation");
const promptSet = ["warm_start", "clarification", "reuse", "image_info_gap", "reflection"];
const days = [
  "2026-05-23T12:00:00.000Z",
  "2026-05-24T12:00:00.000Z",
  "2026-05-25T12:00:00.000Z",
  "2026-05-26T12:00:00.000Z",
  "2026-05-27T12:00:00.000Z",
  "2026-05-28T12:00:00.000Z",
  "2026-05-29T12:00:00.000Z",
];

const personaPlans = {
  jieun: {
    comfort: [2, 3],
    days: [
      { scenario: "stuck-repair", say: "I don't know how to say it, but coffee good." },
      { scenario: "coffee-small-talk", say: "Coffee helps me start slowly." },
      { scenario: "stuck-repair", say: "I don't know how to say it, but today was quiet." },
      { scenario: "reactivation-check-in", say: "What I want to say is I can answer one small thing." },
      { scenario: "coffee-small-talk", say: "Could you repeat that? I want one small coffee." },
      { scenario: "creative-opinion", say: "The music feels soft, and I mean it helps me relax." },
      {
        scenario: "stuck-repair",
        say: "Could you repeat that? I don't know how to say it, but coffee helps me start slowly.",
      },
    ],
  },
  minho: {
    comfort: [1, 2],
    days: [
      { scenario: "stuck-repair", say: "I don't know how to say it, but lunch was okay." },
      { scenario: "stuck-repair", say: "Let me try again. The commute was busy but okay." },
      { scenario: "coffee-small-talk", say: "Could you repeat that? I want tea today." },
      { scenario: "reactivation-check-in", say: "What I want to say is correction feels less scary." },
      { scenario: "stuck-repair", say: "I mean the meeting was long, not bad." },
      { scenario: "coffee-small-talk", say: "Lunch was okay and I can say one more sentence." },
      {
        scenario: "stuck-repair",
        say: "Could you repeat that? I don't know how to say it, but lunch was okay and I can keep talking.",
      },
    ],
  },
  sujin: {
    comfort: [3, 4],
    days: [
      { scenario: "creative-opinion", say: "This song feels kind of blue and warm." },
      { scenario: "creative-opinion", say: "I mean the color feels calm, not sad." },
      { scenario: "coffee-small-talk", say: "Could you repeat that? I want to describe the cafe mood." },
      { scenario: "reactivation-check-in", say: "What I want to say is English can sound like my style." },
      { scenario: "creative-opinion", say: "This song feels kind of blue and warm in a good way." },
      { scenario: "stuck-repair", say: "I don't know how to say it, but the story feels brave." },
      {
        scenario: "creative-opinion",
        say: "Could you repeat that? This song feels kind of blue and warm, and I mean it sounds brave.",
      },
    ],
  },
  hyewon: {
    comfort: [2, 3],
    days: [
      { scenario: "reactivation-check-in", say: "What I want to say is I used to read more often." },
      { scenario: "reactivation-check-in", say: "I mean I miss reading slowly on weekends." },
      { scenario: "coffee-small-talk", say: "Could you repeat that? I want quiet tea." },
      { scenario: "stuck-repair", say: "I don't know how to say it, but I remember some words." },
      { scenario: "creative-opinion", say: "The book feels gentle, not boring." },
      { scenario: "reactivation-check-in", say: "What I want to say is I can return without shame." },
      {
        scenario: "reactivation-check-in",
        say: "Could you repeat that? What I want to say is I used to read more often, and I can return slowly.",
      },
    ],
  },
};

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

function assertNoProhibitedClaims(value, label) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of prohibitedFixtureClaims) {
    assert(!text.includes(claim), `${label}: prohibited persona claim appeared: ${claim}`);
  }
  for (const claim of ["native speaker", "you are fluent", "guaranteed improvement", "your level is"]) {
    assert(!text.includes(claim), `${label}: unsupported validation claim appeared: ${claim}`);
  }
}

function reviewDueItems(learnerRoot, date) {
  return runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--date",
    date,
    "--json",
  ]);
}

function markDueItems(learnerRoot, dueItems, date) {
  for (const item of dueItems) {
    runJson([
      "scripts/english-learning-harness.mjs",
      "review",
      "--learner-root",
      learnerRoot,
      "--review-id",
      item.id,
      "--result",
      "success",
      "--date",
      date,
      "--json",
    ]);
  }
}

function runPersona(fixture) {
  const plan = personaPlans[fixture.persona];
  assert(plan, `${fixture.persona}: missing seven-day plan`);
  const learnerRoot = resolve(fixtureRoot, fixture.persona);

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    fixture.profile.preferredName,
    "--motivation",
    fixture.profile.motivation,
    "--correction-style",
    fixture.profile.correctionStyle,
    "--familiar-topics",
    fixture.profile.familiarTopics,
    "--topics-to-avoid",
    fixture.profile.topicsToAvoid,
    "--json",
  ]);

  for (const [index, date] of days.entries()) {
    const due = reviewDueItems(learnerRoot, date);
    markDueItems(learnerRoot, due.dueItems, date);
    const input = plan.days[index];
    const session = runJson([
      "scripts/english-learning-harness.mjs",
      "today",
      "--learner-root",
      learnerRoot,
      "--scenario",
      input.scenario,
      "--say",
      input.say,
      "--date",
      date,
      "--json",
    ]);
    assertNoProhibitedClaims(readJson(session.artifactPath), `${fixture.persona}:day${index + 1}`);
  }

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    days.at(-1),
    "--json",
  ]);
  const home = runJson([
    "scripts/english-learning-harness.mjs",
    "home",
    "--learner-root",
    learnerRoot,
    "--date",
    days.at(-1),
    "--json",
  ]);
  const exported = runJson([
    "scripts/english-learning-harness.mjs",
    "export",
    "--learner-root",
    learnerRoot,
    "--date",
    days.at(-1),
    "--json",
  ]);

  const progress = readJson(resolve(learnerRoot, "progress.json"));
  const vocabulary = readJson(resolve(learnerRoot, "vocabulary.json"));
  const reviewQueue = readJson(resolve(learnerRoot, "review-queue.json"));
  const evidencePack = readJson(exported.evidencePackPath);
  const savedPhrases = vocabulary.personal_phrases;
  const rubric = evaluateTranscriptReview({
    saved_phrases: savedPhrases,
    baseline: {
      prompt_set: promptSet,
      comfort_rating: plan.comfort[0],
      transcript: [plan.days[0].say, "This part is hard.", "I feel nervous."],
    },
    final: {
      prompt_set: promptSet,
      comfort_rating: plan.comfort[1],
      transcript: [
        plan.days.at(-1).say,
        "Let me try again. I mean I can use one saved phrase in a new sentence.",
      ],
    },
  });

  assert(progress.sessions.length === 7, `${fixture.persona}: expected seven sessions`);
  assert(weekly.mirror.window.session_count === 7, `${fixture.persona}: weekly mirror should include seven sessions`);
  assert(weekly.mirror.reused_phrases.length >= 1, `${fixture.persona}: missing reused phrases`);
  assert(weekly.mirror.repair_attempts.length >= 1, `${fixture.persona}: missing repair attempts`);
  assert(existsSync(home.homePath), `${fixture.persona}: learner home missing`);
  assert(existsSync(exported.evidencePackPath), `${fixture.persona}: evidence pack missing`);
  assert(evidencePack.summary.session_count === 7, `${fixture.persona}: evidence pack session count mismatch`);
  assert(reviewQueue.items.some((item) => (item.success_count ?? 0) > 0), `${fixture.persona}: review reuse missing`);
  assert(rubric.status === "pass", `${fixture.persona}: transcript rubric failed`);
  assert(rubric.pass_signals.length >= 3, `${fixture.persona}: transcript rubric has weak signals`);
  assertNoProhibitedClaims(weekly.mirror, `${fixture.persona}:weekly`);
  assertNoProhibitedClaims(evidencePack, `${fixture.persona}:evidence-pack`);
  assertNoProhibitedClaims(rubric, `${fixture.persona}:rubric`);

  return {
    persona: fixture.persona,
    learnerRoot,
    sessionCount: progress.sessions.length,
    savedPhraseCount: savedPhrases.length,
    reusedReviewItemCount: evidencePack.summary.reused_review_item_count,
    weeklyMirrorPath: weekly.mirrorPath,
    evidencePackPath: exported.evidencePackPath,
    rubricDecision: rubric.decision,
    rubricSignals: rubric.pass_signals,
  };
}

function main() {
  rmSync(fixtureRoot, { recursive: true, force: true });
  const targetFixtures = personaFixtures.filter((fixture) =>
    ["jieun", "minho", "sujin", "hyewon"].includes(fixture.persona),
  );
  assert(targetFixtures.length === 4, "expected four target persona fixtures");
  const results = targetFixtures.map(runPersona);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        fixtureCount: results.length,
        personas: results.map((result) => result.persona),
        results,
        claimBoundary:
          "Persona fixtures are simulated validation only. They do not prove real learner outcomes.",
      },
      null,
      2,
    ),
  );
}

main();
