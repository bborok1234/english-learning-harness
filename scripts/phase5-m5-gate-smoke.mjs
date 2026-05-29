#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredEvidence = [
  "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md",
  "docs/M5-TRANSCRIPT-REVIEW-RUBRIC.md",
  "docs/phase-5-evidence/M5-0-validation-issue-split.md",
  "docs/phase-5-evidence/M5-1-validation-protocol.md",
  "docs/phase-5-evidence/M5-2-evidence-export.md",
  "docs/phase-5-evidence/M5-3-transcript-rubric.md",
  "docs/phase-5-evidence/M5-4-persona-validation.md",
  "docs/phase-5-evidence/M5-5-validation-gate.md",
];

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

function main() {
  for (const file of requiredEvidence) {
    assert(existsSync(resolve(repoRoot, file)), `missing M5 evidence file: ${file}`);
  }

  const transcript = runJson(["scripts/phase5-transcript-rubric-smoke.mjs"]);
  const exportPack = runJson(["scripts/phase5-evidence-export-smoke.mjs"]);
  const persona = runJson(["scripts/phase5-persona-validation-smoke.mjs"]);

  assert(transcript.status === "pass", "transcript rubric smoke failed");
  assert(transcript.decision === "continue", "transcript rubric should continue");
  assert(exportPack.status === "pass", "evidence export smoke failed");
  assert(exportPack.sessionCount === 7, "evidence export should summarize seven sessions");
  assert(persona.status === "pass", "persona validation smoke failed");
  assert(persona.fixtureCount === 4, "persona validation should cover four target personas");
  assert(
    persona.results.every((result) => result.rubricDecision === "continue"),
    "all target personas should have continue rubric decisions",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        decision: "continue_to_m6",
        approvedClaims: [
          "simulated target-persona validation passes",
          "local evidence export and transcript review tooling are ready",
        ],
        blockedClaims: [
          "real learner improvement",
          "generalized English proficiency",
          "production realtime voice quality",
        ],
        nextMilestone: "M6 Public Clone-to-Learn Release",
        transcriptSignals: transcript.passSignals,
        personaCount: persona.fixtureCount,
        personaDecisions: Object.fromEntries(
          persona.results.map((result) => [result.persona, result.rubricDecision]),
        ),
      },
      null,
      2,
    ),
  );
}

main();
