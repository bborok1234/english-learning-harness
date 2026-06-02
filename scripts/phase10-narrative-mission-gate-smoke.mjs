#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(script) {
  const output = execFileSync("node", [script], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const parsed = JSON.parse(output);
  assert(parsed.status === "pass", `${script} did not pass`);
  return parsed;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function main() {
  const checks = {
    planning: run("scripts/phase10-narrative-mission-plan-smoke.mjs"),
    worldState: run("scripts/phase10-world-state-smoke.mjs"),
    validator: run("scripts/phase10-mission-spec-validator-smoke.mjs"),
    parity: run("scripts/phase10-narrative-mission-parity-smoke.mjs"),
    fallback: run("scripts/phase10-no-gen-fallback-smoke.mjs"),
    claimGuard: run("scripts/phase10-narrative-claim-guard-smoke.mjs"),
  };
  const state = readJson("docs/ops/project-state.json");
  const gateIds = new Set((state.gates ?? []).map((gate) => gate.id));
  for (const gate of ["GATE-10", "GATE-11", "GATE-12", "GATE-13", "GATE-14", "GATE-15"]) {
    assert(gateIds.has(gate), `project-state missing ${gate}`);
  }
  assert(
    (state.board ?? []).some((column) =>
      (column.cards ?? []).some(
        (card) =>
          card.id === "M10-6" &&
          /M10 gate smoke/.test(card.done ?? "") &&
          /next goal/.test(card.done ?? ""),
      ),
    ),
    "project-state missing M10 closeout completion card",
  );
  assert(
    (state.verification ?? []).some((item) => item.name === "M10 closeout gate" && item.status === "Pass"),
    "project-state verification missing M10 closeout gate pass",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-6",
        checked: Object.keys(checks),
        nextGoal: state.project?.nextGoal,
        claimBoundary:
          "M10 closeout proves validated local narrative-transfer mechanics only, not real learner outcomes.",
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
        issue: "M10-6",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
