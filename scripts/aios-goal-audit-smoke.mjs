#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/aios-goal-audit-smoke");
const jsonPath = resolve(smokeRoot, "goal-audit.json");
const htmlPath = resolve(smokeRoot, "goal-audit.html");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  const result = runJson([
    "scripts/aios-goal-audit.mjs",
    "--json-output",
    jsonPath,
    "--html-output",
    htmlPath,
    "--real-pilot-issue-state",
    "OPEN",
    "--json",
  ]);

  assert(result.status === "pass", "goal audit command should pass");
  assert(result.overallStatus === "not_complete", "goal audit must not claim the active AIOS goal is complete");
  assert(result.localMechanicsStatus === "verified", "goal audit should recognize verified local mechanics");
  assert(existsSync(jsonPath), "goal audit JSON missing");
  assert(existsSync(htmlPath), "goal audit HTML missing");

  const audit = readJson(jsonPath);
  assert(audit.schema_version === 1, "goal audit schema version mismatch");
  assert(audit.surface === "engineering-governance", "goal audit should be an engineering governance surface");
  assert(audit.requirements.length === 8, "goal audit should cover the eight explicit stop conditions");
  assert(audit.requirements.every((item) => item.stop_condition), "each requirement should retain the original stop condition");
  assert(audit.requirements.every((item) => item.evidence.files.length > 0), "each requirement should have file evidence");
  assert(
    audit.requirements.some((item) => item.id === "REQ-08-ADAPTIVE-GOVERNANCE"),
    "goal audit should cover adaptive governance",
  );
  assert(
    audit.completion_blockers.some((item) => item.id === "BLOCK-REAL-PILOT-179" && item.status === "open"),
    "goal audit should keep real pilot blocker open",
  );
  assert(
    audit.next_decision.includes("Do not mark complete"),
    "goal audit should explicitly block premature completion",
  );
  assert(
    !JSON.stringify(audit).includes("proves fluency") || JSON.stringify(audit).includes("Do not claim fluency"),
    "goal audit should only mention fluency as a blocked claim",
  );

  const html = readFileSync(htmlPath, "utf8");
  assert(html.includes("AIOS Goal Audit"), "goal audit HTML missing title");
  assert(html.includes("Overall: not_complete"), "goal audit HTML should show not_complete status");
  assert(html.includes("Completion Blockers"), "goal audit HTML should show blockers");
  assert(html.includes("Stop Condition Evidence"), "goal audit HTML should show requirement evidence");
  assert(html.includes("BLOCK-REAL-PILOT-179"), "goal audit HTML should render real pilot blocker");

  const closedJsonPath = resolve(smokeRoot, "goal-audit-closed-mismatch.json");
  const closedHtmlPath = resolve(smokeRoot, "goal-audit-closed-mismatch.html");
  runJson([
    "scripts/aios-goal-audit.mjs",
    "--json-output",
    closedJsonPath,
    "--html-output",
    closedHtmlPath,
    "--real-pilot-issue-state",
    "CLOSED",
    "--json",
  ]);
  const closedAudit = readJson(closedJsonPath);
  const closedRealPilotBlocker = closedAudit.completion_blockers.find((item) => item.id === "BLOCK-REAL-PILOT-179");
  assert(
    closedRealPilotBlocker?.status === "closed_external_mismatch",
    "goal audit should detect externally closed real pilot tracker",
  );
  assert(
    closedAudit.overall_status === "not_complete",
    "closed real pilot tracker mismatch must still block completion",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-19",
        jsonPath,
        htmlPath,
        requirementCount: audit.requirements.length,
        overallStatus: audit.overall_status,
        claimBoundary: audit.claim_boundary,
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
        issue: "AIOS-19",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
