#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of [
    "native speaker",
    "confident with foreigners",
    "guaranteed",
    "your level",
    "certified fluency",
    "proven improvement",
  ]) {
    assert(!text.includes(claim), `unsupported evidence export claim appeared: ${claim}`);
  }
}

function main() {
  const simulation = runJson(["scripts/phase3-seven-day-simulation-smoke.mjs"]);
  const exported = runJson([
    "scripts/english-learning-harness.mjs",
    "export",
    "--learner-root",
    simulation.learnerRoot,
    "--date",
    "2026-05-29T12:30:00.000Z",
    "--json",
  ]);

  assert(exported.status === "pass", "export command failed");
  assert(existsSync(exported.evidencePackPath), "evidence JSON pack missing");
  assert(existsSync(exported.evidenceMarkdownPath), "evidence Markdown pack missing");
  assert(exported.summary.session_count === 7, "export summary should include seven sessions");
  assert(exported.summary.reused_review_item_count >= 1, "export summary missing review reuse evidence");
  assert(exported.summary.interaction_event_count >= 7, "export summary missing interaction events");

  const pack = readJson(exported.evidencePackPath);
  assert(pack.schema_version === 1, "evidence pack schema mismatch");
  assert(pack.protocol === "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md", "protocol reference missing");
  assert(pack.learner_root.local_path_redacted === true, "learner root should be redacted");
  assert(pack.summary.session_count === 7, "pack should include seven sessions");
  assert(pack.sessions.length === 7, "pack sessions mismatch");
  assert(pack.weekly_mirrors.length >= 1, "pack should include weekly mirror summary");
  assert(pack.review_queue.item_count >= 7, "pack should include review queue summary");
  assert(pack.source_files.learner_home === "home.html", "pack should point to learner home");
  assertNoUnsupportedClaims(pack);

  const markdown = readFileSync(exported.evidenceMarkdownPath, "utf8");
  assert(markdown.includes("## Claim Boundary"), "evidence markdown missing claim boundary");
  assert(!markdown.includes(simulation.learnerRoot), "evidence markdown should not expose learner root path");
  assertNoUnsupportedClaims(markdown);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot: simulation.learnerRoot,
        evidencePackPath: exported.evidencePackPath,
        evidenceMarkdownPath: exported.evidenceMarkdownPath,
        sessionCount: pack.summary.session_count,
        interactionEventCount: pack.summary.interaction_event_count,
        reusedReviewItemCount: pack.summary.reused_review_item_count,
      },
      null,
      2,
    ),
  );
}

main();
