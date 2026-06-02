#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureLearnerStore,
  learnerPaths,
  readSpeakingBacklog,
  writeSpeakingBacklog,
} from "./lib/english-learning-store.mjs";
import {
  persistNarrativeMissionSession,
} from "./lib/narrative-mission.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-10-narrative-mission-parity");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function seedBacklog(learnerRoot) {
  ensureLearnerStore(learnerRoot);
  const paths = learnerPaths(learnerRoot);
  writeSpeakingBacklog(paths.speakingBacklog, {
    schema_version: 1,
    items: [
      {
        id: "speaking-clarification",
        skill: "clarification",
        label: "Ask for clarification",
        status: "open",
        priority: "high",
        created_at: "2026-06-02T00:00:00.000Z",
        updated_at: "2026-06-02T00:00:00.000Z",
        source: "diagnose",
        diagnosis: "Detected clarification practice need from learner output.",
        target_behavior: "Use a clarification phrase when meaning is unclear.",
        drill_prompt: "Ask one clarification question before answering.",
        transfer_test: "Can you ask what the other person means?",
        pass_criteria: "Learner uses a question or clarification phrase.",
        evidence_count: 0,
        attempts: [],
      },
    ],
  });
  return readSpeakingBacklog(paths.speakingBacklog);
}

function runPlainToday({ learnerRoot, learnerTurn, date }) {
  return JSON.parse(
    execFileSync(
      "node",
      [
        "scripts/english-learning-harness.mjs",
        "today",
        "--learner-root",
        learnerRoot,
        "--date",
        date.toISOString(),
        "--say",
        learnerTurn,
        "--json",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
      },
    ),
  );
}

function comparableEvidence(evidence) {
  return {
    item_id: evidence?.item_id ?? "",
    skill: evidence?.skill ?? "",
    result: evidence?.result ?? "",
    status: evidence?.status ?? "",
    transfer_test: evidence?.transfer_test ?? "",
  };
}

function assertSameEvidence(label, plainEvidence, narrativeEvidence) {
  const plain = comparableEvidence(plainEvidence);
  const narrative = comparableEvidence(narrativeEvidence);
  assert(
    JSON.stringify(plain) === JSON.stringify(narrative),
    `${label} evidence mismatch: ${JSON.stringify({ plain, narrative })}`,
  );
}

function runNarrative({ learnerRoot, learnerTurn, date, missionSpec, worldState, toolCapabilities }) {
  const speakingBacklog = seedBacklog(learnerRoot);
  return persistNarrativeMissionSession({
    learnerRoot,
    learnerTurns: [learnerTurn],
    missionSpec,
    speakingBacklog,
    worldState,
    toolCapabilities,
    date,
  });
}

function readArtifact(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertStoryAfterEvidence(label, artifact, expectedText) {
  assert(artifact.speaking_backlog_evidence, `${label} should persist speaking backlog evidence`);
  const consequence = artifact.narrative_mission?.story_consequence;
  assert(consequence, `${label} should persist narrative story consequence`);
  assert(
    consequence.recorded_after_transfer_evidence === true,
    `${label} story consequence should be recorded after transfer evidence`,
  );
  assert(
    consequence.transfer_result === artifact.speaking_backlog_evidence.result,
    `${label} story consequence result should match transfer evidence`,
  );
  assert(consequence.text === expectedText, `${label} story consequence text mismatch`);
}

function runPair({ label, learnerTurn, date, expectedResult, expectedConsequence }) {
  const missionSpec = readJson("docs/narrative-missions/fixtures/usual-place-clarification.mission-spec.json");
  const worldState = readJson("docs/narrative-missions/fixtures/daily-life.world-state.json");
  const toolCapabilities = readJson("docs/narrative-missions/fixtures/light.tool-capabilities.json");
  const plainRoot = resolve(smokeRoot, `${label}-plain`);
  const narrativeRoot = resolve(smokeRoot, `${label}-narrative`);
  seedBacklog(plainRoot);

  const plain = runPlainToday({ learnerRoot: plainRoot, learnerTurn, date });
  const narrative = runNarrative({
    learnerRoot: narrativeRoot,
    learnerTurn,
    date,
    missionSpec,
    worldState,
    toolCapabilities,
  });
  const narrativeArtifact = readArtifact(narrative.persisted.artifactPath);

  assert(plain.scenarioSelection.source === "speaking-backlog", `${label} plain path should use speaking backlog`);
  assert(
    narrative.session.scenario.selection_reason.source === "narrative-mission",
    `${label} narrative path should use narrative mission selection`,
  );
  assert(
    plain.speakingBacklogEvidence?.result === expectedResult,
    `${label} plain result should be ${expectedResult}`,
  );
  assert(
    narrative.session.speaking_backlog_evidence?.result === expectedResult,
    `${label} narrative result should be ${expectedResult}`,
  );
  assertSameEvidence(label, plain.speakingBacklogEvidence, narrative.session.speaking_backlog_evidence);
  assertStoryAfterEvidence(label, narrativeArtifact, expectedConsequence);

  return {
    label,
    plainArtifact: plain.artifactPath,
    narrativeArtifact: narrative.persisted.artifactPath,
    evidence: comparableEvidence(narrative.session.speaking_backlog_evidence),
    storyConsequence: narrative.storyConsequence,
  };
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const pass = runPair({
    label: "pass",
    learnerTurn: "Which place do you mean?",
    date: new Date("2026-06-02T02:00:00.000Z"),
    expectedResult: "pass",
    expectedConsequence: "The friend names the meeting place.",
  });
  const needsReview = runPair({
    label: "needs-review",
    learnerTurn: "Okay, I will go there.",
    date: new Date("2026-06-02T02:10:00.000Z"),
    expectedResult: "needs_review",
    expectedConsequence: "The friend gives a simpler hint and asks you to try again.",
  });

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-4",
        mission: "usual-place-clarification",
        checkedPairs: [pass, needsReview],
        claimBoundary:
          "This proves deterministic local parity between plain Speaking Skill OS evidence and one text-first narrative mission. It does not prove real learner outcomes.",
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
        issue: "M10-4",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
