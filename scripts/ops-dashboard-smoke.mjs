#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function main() {
  const statePath = "docs/ops/project-state.json";
  const dashboardPath = "docs/ops/engineering-dashboard.html";
  const legacyPath = "docs/dashboard.html";
  assert(existsSync(resolve(repoRoot, statePath)), `${statePath} missing`);
  assert(existsSync(resolve(repoRoot, dashboardPath)), `${dashboardPath} missing`);
  assert(existsSync(resolve(repoRoot, legacyPath)), `${legacyPath} missing`);

  const state = JSON.parse(readText(statePath));
  const dashboard = readText(dashboardPath);
  const legacy = readText(legacyPath);
  assert(state.project?.stage === "Product/Ops surface split complete", "ops state stage mismatch");
  assert(dashboard.includes("Engineering Board"), "engineering dashboard title missing");
  assert(dashboard.includes("docs/ops/project-state.json"), "engineering dashboard should cite ops state");
  assert(dashboard.includes("engineering/ops board"), "engineering dashboard should identify itself as ops board");
  assert(dashboard.includes("docs/product/learner-cockpit.html"), "engineering dashboard should link learner cockpit SSOT");
  assert(legacy.includes("./ops/engineering-dashboard.html"), "legacy dashboard should redirect to engineering dashboard");
  assert(legacy.includes("./product/learner-cockpit.html"), "legacy dashboard should point to learner cockpit");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        surface: "ops",
        statePath,
        dashboardPath,
        legacyPath,
        claimBoundary:
          "Engineering dashboard is an internal ops surface and is separated from the learner product cockpit.",
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
        surface: "ops",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
