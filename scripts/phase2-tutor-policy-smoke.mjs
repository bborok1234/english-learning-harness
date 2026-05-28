#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateTutorPolicy } from "./lib/tutor-policy-rubric.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-2-tutor-policy/learner");

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

function assertViolation(artifact, code) {
  const result = evaluateTutorPolicy(artifact);
  assert(result.status === "fail", `${code}: negative fixture should fail`);
  assert(
    result.violations.some((violation) => violation.code === code),
    `${code}: expected violation not found in ${JSON.stringify(result.violations)}`,
  );
}

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-2-tutor-policy"), { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--json",
  ]);

  const session = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "이걸 영어로 뭐라고 하지?",
    "--json",
  ]);
  const artifact = readJson(session.artifactPath);
  const positive = evaluateTutorPolicy(artifact);
  assert(positive.status === "pass", `positive artifact failed: ${JSON.stringify(positive.violations)}`);
  assert(
    artifact.turns.some((turn) => turn.role === "assistant" && turn.text.includes("bridge it back")),
    "Korean fallback did not produce bridge text",
  );

  assertViolation(
    {
      ...artifact,
      turns: [
        ...artifact.turns,
        { role: "assistant", text: "You are now confident with foreigners like a native speaker." },
      ],
    },
    "prohibited_claim",
  );

  assertViolation(
    {
      ...artifact,
      mirror: { ...artifact.mirror, recast: "" },
    },
    "mini_mirror_missing_field",
  );

  assertViolation(
    {
      ...artifact,
      turns: [
        { role: "learner", text: "이걸 어떻게 말하지?" },
        { role: "assistant", text: "괜찮아요. 계속 말해보세요." },
      ],
    },
    "korean_dead_end",
  );

  assertViolation(
    {
      ...artifact,
      turns: [
        {
          role: "assistant",
          text: 'A natural version is: "I had coffee this morning." Small repair: try the pattern "this morning".',
        },
      ],
    },
    "correction_ladder_order",
  );

  assertViolation(
    {
      ...artifact,
      turns: [
        ...artifact.turns,
        {
          role: "assistant",
          text: "Mistake one. Mistake two. Error three. Wrong four.",
        },
      ],
    },
    "overcorrection",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        positiveArtifact: session.artifactPath,
        negativeViolations: [
          "prohibited_claim",
          "mini_mirror_missing_field",
          "korean_dead_end",
          "correction_ladder_order",
          "overcorrection",
        ],
      },
      null,
      2,
    ),
  );
}

main();
