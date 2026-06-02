#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(import.meta.dirname, "..");

function parseArgs(argv) {
  const options = {
    learnerRoot: null,
    statusOutput: "docs/ops/local-pilot-status.json",
    dashboardOutput: "docs/ops/local-engineering-dashboard.html",
    legacyOutput: "docs/local-dashboard.html",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--learner-root") {
      options.learnerRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--status-output") {
      options.statusOutput = argv[index + 1];
      index += 1;
    } else if (arg === "--dashboard-output") {
      options.dashboardOutput = argv[index + 1];
      index += 1;
    } else if (arg === "--legacy-output") {
      options.legacyOutput = argv[index + 1];
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function runHarness(command, options) {
  const args = ["scripts/english-learning-harness.mjs", command, "--json"];
  if (options.learnerRoot) args.push("--learner-root", options.learnerRoot);
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function summarizeNextAction(nextAction) {
  if (!nextAction) return null;
  return {
    phase: nextAction.command === "pilot-capture" ? nextAction.phase : nextAction.command?.replace(/^pilot-/, ""),
    day: nextAction.day ?? null,
    title: nextAction.guide?.title ?? nextAction.card?.title ?? nextAction.command ?? "Next pilot action",
    cardId: nextAction.card?.id ?? (nextAction.day ? `day-${nextAction.day}` : null),
  };
}

function sync(options) {
  const cockpit = runHarness("cockpit", options);
  const status = runHarness("pilot-status", options);
  const summary = status.summary;
  const overlay = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    source: "scripts/sync-local-pilot-dashboard.mjs",
    redaction: "Transcript, private notes, audio, image, and local learner paths are intentionally excluded.",
    pilot: {
      status: summary.status,
      baselineReady: summary.baselineReady,
      completedDailySessions: summary.completedDailySessions,
      minimumValidDailySessions: summary.minimumValidDailySessions,
      targetDays: summary.targetDays,
      finalReady: summary.finalReady,
      reportReady: summary.reportReady,
      readyToFinish: summary.readyToFinish,
      next: summarizeNextAction(summary.nextAction),
    },
  };

  const statusPath = resolve(repoRoot, options.statusOutput);
  const dashboardPath = resolve(repoRoot, options.dashboardOutput);
  const legacyPath = resolve(repoRoot, options.legacyOutput);
  mkdirSync(dirname(statusPath), { recursive: true });
  mkdirSync(dirname(dashboardPath), { recursive: true });
  mkdirSync(dirname(legacyPath), { recursive: true });
  writeFileSync(statusPath, `${JSON.stringify(overlay, null, 2)}\n`, "utf8");

  execFileSync(
    process.execPath,
    [
      "scripts/generate-dashboard.mjs",
      "--local",
      "--local-status",
      options.statusOutput,
      "--output",
      options.dashboardOutput,
      "--legacy-output",
      options.legacyOutput,
    ],
    { cwd: repoRoot, stdio: "pipe" },
  );

  return {
    status: "pass",
    localStatusPath: statusPath,
    localDashboardPath: dashboardPath,
    localDashboardUrl: pathToFileURL(dashboardPath).href,
    learnerCockpitUrl: cockpit.cockpitUrl,
    redaction: overlay.redaction,
    pilot: overlay.pilot,
    claimBoundary: "Local pilot dashboard sync shows redacted owner/self progress only. It does not prove the pilot is complete.",
  };
}

try {
  const result = sync(parseArgs(process.argv));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
