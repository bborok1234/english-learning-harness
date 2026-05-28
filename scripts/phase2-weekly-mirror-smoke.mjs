#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-2-weekly-mirror/learner");

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

function assertNoUnsupportedClaims(mirror) {
  const text = JSON.stringify(mirror).toLowerCase();
  for (const claim of ["native speaker", "confident with foreigners", "guaranteed", "fluent", "your level"]) {
    assert(!text.includes(claim), `unsupported claim appeared: ${claim}`);
  }
}

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-2-weekly-mirror"), { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want a daily speaking habit.",
    "--json",
  ]);

  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but coffee good.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "coffee-small-talk",
    "--say",
    "I like coffee.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "reactivation-check-in",
    "--say",
    "What I want to say is I can practice slowly.",
    "--json",
  ]);

  const vault = runJson([
    "scripts/english-learning-harness.mjs",
    "vault",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(vault.phraseCount >= 3, "fixture should create multiple personal phrases");

  const reviewId = vault.phrases.find((phrase) => phrase.review_id)?.review_id;
  assert(reviewId, "expected a review id in vault");
  runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--review-id",
    reviewId,
    "--result",
    "success",
    "--json",
  ]);

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(weekly.status === "pass", "weekly command failed");
  assert(existsSync(weekly.mirrorPath), "weekly mirror file missing");
  assert(weekly.mirror.window.session_count === 3, "weekly mirror session count mismatch");
  assert(weekly.mirror.communicated_themes.length >= 3, "weekly mirror missing communicated themes");
  assert(weekly.mirror.saved_phrases.length >= 3, "weekly mirror missing saved phrases");
  assert(weekly.mirror.reused_phrases.length >= 1, "weekly mirror missing reused phrases");
  assert(weekly.mirror.repair_attempts.length >= 1, "weekly mirror missing repair attempts");
  assert(weekly.mirror.next_focus.skill, "weekly mirror missing next focus skill");
  assert(weekly.mirror.next_focus.prompt, "weekly mirror missing next focus prompt");
  assertNoUnsupportedClaims(weekly.mirror);

  const persisted = readJson(weekly.mirrorPath);
  assert(persisted.schema_version === 1, "persisted weekly mirror schema mismatch");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        mirrorPath: weekly.mirrorPath,
        sessionCount: weekly.mirror.window.session_count,
        communicatedThemeCount: weekly.mirror.communicated_themes.length,
        savedPhraseCount: weekly.mirror.saved_phrases.length,
        reusedPhraseCount: weekly.mirror.reused_phrases.length,
        repairAttemptCount: weekly.mirror.repair_attempts.length,
        nextFocus: weekly.mirror.next_focus,
      },
      null,
      2,
    ),
  );
}

main();
