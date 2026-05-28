#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-1-vocabulary-history");
const learnerRoot = resolve(smokeRoot, "learner");
const migrationRoot = resolve(smokeRoot, "migration-learner");

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

function runRepeatedSessionCheck() {
  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--json",
  ]);

  const first = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I like coffee.",
    "--json",
  ]);
  assert(first.sessionMetrics.new_vocabulary_count === 3, "first session should count three new tokens");

  const second = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I like coffee.",
    "--json",
  ]);
  assert(second.sessionMetrics.new_vocabulary_count === 0, "repeated tokens should not count as new");

  const progress = readJson(setup.progressPath);
  const errors = validateProgress(progress, setup.progressPath);
  assert(errors.length === 0, `progress validation failed: ${errors.join("; ")}`);
  assert(progress.mvp_session_metrics.new_vocabulary_count === 3, "cumulative new vocabulary should not double count");

  const vocabulary = readJson(resolve(learnerRoot, "vocabulary.json"));
  assert(vocabulary.emerging_tokens.includes("coffee"), "vocabulary should persist emerging token");
  assert(vocabulary.emerging_tokens.includes("like"), "vocabulary should persist emerging token");
  assert(vocabulary.emerging_tokens.includes("i"), "vocabulary should persist emerging token");
  assert(
    vocabulary.personal_phrases.includes("I like drinking coffee."),
    "vocabulary should persist the personal review phrase",
  );

  const reviewQueue = readJson(resolve(learnerRoot, "review-queue.json"));
  assert(reviewQueue.items.length === 1, "same review phrase should not create duplicate queue items");
  assert(reviewQueue.items[0].text === "I like drinking coffee.", "review queue should schedule recast phrase");

  const firstArtifact = readJson(first.artifactPath);
  const secondArtifact = readJson(second.artifactPath);
  assert(firstArtifact.vocabulary_evidence.new_tokens.length === 3, "first artifact should record new tokens");
  assert(secondArtifact.vocabulary_evidence.new_tokens.length === 0, "second artifact should record no new tokens");
  assert(
    secondArtifact.vocabulary_evidence.repeated_tokens.length === 3,
    "second artifact should record repeated tokens",
  );

  return {
    progressPath: setup.progressPath,
    vocabularyPath: resolve(learnerRoot, "vocabulary.json"),
    reviewQueuePath: resolve(learnerRoot, "review-queue.json"),
    firstNewVocabularyCount: first.sessionMetrics.new_vocabulary_count,
    secondNewVocabularyCount: second.sessionMetrics.new_vocabulary_count,
    cumulativeNewVocabularyCount: progress.mvp_session_metrics.new_vocabulary_count,
    reviewQueueItems: reviewQueue.items.length,
  };
}

function runMigrationCheck() {
  mkdirSync(migrationRoot, { recursive: true });
  writeFileSync(
    resolve(migrationRoot, "profile.md"),
    [
      "# English Learning Profile",
      "",
      "- preferred_name: migration learner",
      "",
    ].join("\n"),
  );
  writeFileSync(
    resolve(migrationRoot, "progress.json"),
    `${JSON.stringify(
      {
        version: 2,
        mvp_session_metrics: {
          attendance: 0,
          english_word_ratio: 0,
          new_vocabulary_count: 0,
          utterance_word_count: 0,
          voluntary_speaking_seconds: 0,
        },
        monthly_optional_metrics: {},
        sessions: [],
      },
      null,
      2,
    )}\n`,
  );

  const health = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    migrationRoot,
    "--json",
  ]);
  assert(health.status === "pass", "migration health should pass");
  assert(existsSync(resolve(migrationRoot, "vocabulary.json")), "migration should create vocabulary.json");
  assert(existsSync(resolve(migrationRoot, "review-queue.json")), "migration should create review-queue.json");

  return {
    learnerRoot: migrationRoot,
    vocabularyCreated: true,
    reviewQueueCreated: true,
  };
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const repeatedSession = runRepeatedSessionCheck();
  const migration = runMigrationCheck();

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-2",
        repeatedSession,
        migration,
      },
      null,
      2,
    ),
  );
}

main();
