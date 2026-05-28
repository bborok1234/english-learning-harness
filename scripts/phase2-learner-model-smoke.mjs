#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-2-learner-model");
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

function runText(args) {
  return execFileSync("node", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Minho",
    "--motivation",
    "I freeze when I cannot find a word.",
    "--json",
  ]);

  assert(setup.status === "pass", "setup failed");
  assert(existsSync(setup.learnerModelPath), "learner model missing after setup");

  const initialModel = readJson(setup.learnerModelPath);
  assert(initialModel.schema_version === 1, "learner model schema version mismatch");
  assert(initialModel.interaction_skills.starts.evidence_count === 0, "new model should start at zero");
  assert(Array.isArray(initialModel.baseline.freeze_triggers), "freeze_triggers must be an array");

  const today = runJson([
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

  assert(today.status === "pass", "today failed");
  assert(today.learnerModelEvidence.updated_skills.includes("starts"), "starts evidence missing");
  assert(today.learnerModelEvidence.updated_skills.includes("repair"), "repair evidence missing");

  const updatedModel = readJson(setup.learnerModelPath);
  assert(updatedModel.interaction_skills.starts.evidence_count === 1, "starts count not updated");
  assert(updatedModel.interaction_skills.repair.evidence_count === 1, "repair count not updated");
  assert(updatedModel.baseline.average_utterance_words > 0, "average utterance words not updated");
  assert(updatedModel.baseline.repair_phrase_count >= 1, "repair phrase count not updated");
  assert(updatedModel.affect.last_energy === "easy", "last energy should follow scenario mode");
  assert(
    updatedModel.affect.last_confidence_note === "completed scenario: stuck-repair",
    "confidence note did not record scenario",
  );

  const artifact = readJson(today.artifactPath);
  assert(
    artifact.learner_model_evidence.updated_skills.includes("repair"),
    "artifact did not persist learner model evidence",
  );

  const context = runText([
    "scripts/english-learning-harness.mjs",
    "context",
    "--learner-root",
    learnerRoot,
  ]);
  assert(context.includes("Learner model:"), "context missing learner model summary");
  assert(context.includes("repair=1"), "context missing repair evidence count");

  mkdirSync(migrationRoot, { recursive: true });
  writeFileSync(
    resolve(migrationRoot, "profile.md"),
    ["# English Learning Profile", "", "- preferred_name: Migrating learner", ""].join("\n"),
  );
  writeFileSync(
    resolve(migrationRoot, "progress.json"),
    `${JSON.stringify(
      {
        version: 2,
        mvp_session_metrics: {
          attendance: 2,
          english_word_ratio: 1,
          new_vocabulary_count: 3,
          utterance_word_count: 12,
          voluntary_speaking_seconds: 10,
        },
        monthly_optional_metrics: {},
        sessions: [{ id: "old-session", date: "2026-05-27", mode: "text-first" }],
      },
      null,
      2,
    )}\n`,
  );
  const migrationHealth = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    migrationRoot,
    "--json",
  ]);
  const migratedModelPath = resolve(migrationRoot, "learner-model.json");
  const migratedProgress = readJson(resolve(migrationRoot, "progress.json"));
  assert(migrationHealth.status === "pass", "migration health failed");
  assert(existsSync(migratedModelPath), "migration did not create learner model");
  assert(migratedProgress.mvp_session_metrics.attendance === 2, "migration changed progress totals");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        learnerModelPath: setup.learnerModelPath,
        sessionId: today.sessionId,
        updatedSkills: today.learnerModelEvidence.updated_skills,
        learnerModel: {
          starts: updatedModel.interaction_skills.starts.evidence_count,
          repair: updatedModel.interaction_skills.repair.evidence_count,
          averageUtteranceWords: updatedModel.baseline.average_utterance_words,
          repairPhraseCount: updatedModel.baseline.repair_phrase_count,
        },
        migration: {
          learnerRoot: migrationRoot,
          learnerModelCreated: existsSync(migratedModelPath),
          preservedAttendance: migratedProgress.mvp_session_metrics.attendance,
        },
      },
      null,
      2,
    ),
  );
}

main();
