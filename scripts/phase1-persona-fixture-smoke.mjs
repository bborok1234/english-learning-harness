#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { personaFixtures, prohibitedFixtureClaims } from "./lib/persona-fixtures.mjs";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = resolve(repoRoot, "tmp/phase-1-persona-fixtures");

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

function assertNoProhibitedClaims(text, fixtureId) {
  const lower = text.toLowerCase();
  for (const claim of prohibitedFixtureClaims) {
    assert(!lower.includes(claim), `${fixtureId}: prohibited claim appeared: ${claim}`);
  }
}

function runFixture(fixture) {
  const learnerRoot = resolve(fixtureRoot, fixture.id);
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

  const args = [
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    fixture.scenario,
    "--json",
  ];
  for (const turn of fixture.learnerTurns) {
    args.push("--say", turn);
  }

  const session = runJson(args);
  const progressPath = resolve(learnerRoot, "progress.json");
  const progress = readJson(progressPath);
  const artifact = readJson(session.artifactPath);
  const journal = readFileSync(session.journalPath, "utf8");
  const allText = JSON.stringify(artifact) + "\n" + journal;
  const errors = validateProgress(progress, progressPath);

  assert(errors.length === 0, `${fixture.id}: progress validation failed: ${errors.join("; ")}`);
  assert(artifact.scenario.id === fixture.scenario, `${fixture.id}: wrong scenario`);
  assert(artifact.scenario.goal, `${fixture.id}: missing scenario goal`);
  assert(artifact.mirror.communicated, `${fixture.id}: missing communicated meaning`);
  assert(artifact.mirror.recast, `${fixture.id}: missing recast`);
  assert(artifact.mirror.pattern, `${fixture.id}: missing pattern`);
  assert(artifact.mirror.reviewPhrase, `${fixture.id}: missing review phrase`);
  assert(artifact.mirror.retryPrompt, `${fixture.id}: missing retry prompt`);
  assert(journal.includes("### Scenario"), `${fixture.id}: journal missing scenario`);
  assertNoProhibitedClaims(allText, fixture.id);

  return {
    fixture: fixture.id,
    persona: fixture.persona,
    scenario: artifact.scenario.id,
    artifactPath: session.artifactPath,
  };
}

function main() {
  rmSync(fixtureRoot, { recursive: true, force: true });
  const results = personaFixtures.map(runFixture);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-3",
        fixtureCount: results.length,
        results,
      },
      null,
      2,
    ),
  );
}

main();
