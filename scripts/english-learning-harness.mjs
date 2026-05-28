#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import {
  buildAdditionalContext,
  buildSession,
  emptyLearnerModel,
  defaultLearnerRoot,
  emptyMetrics,
  emptyReviewQueue,
  emptyVocabulary,
  ensureLearnerStore,
  learnerPaths,
  listDueReviewItems,
  markReviewItem,
  persistSession,
  phraseVault,
  readLearnerModel,
  readProgress,
  readProfile,
  readVocabulary,
  writeLearnerModel,
  writeProgress,
  writeReviewQueue,
  writeVocabulary,
  writeProfile,
} from "./lib/english-learning-store.mjs";
import { planScenario } from "./lib/scenario-engine.mjs";

function parseArgs(argv) {
  const command = argv[2] || "help";
  const options = { input: [] };

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--learner-root") {
      options.learnerRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--name") {
      options.preferredName = argv[index + 1];
      index += 1;
    } else if (arg === "--motivation") {
      options.motivation = argv[index + 1];
      index += 1;
    } else if (arg === "--correction-style") {
      options.correctionStyle = argv[index + 1];
      index += 1;
    } else if (arg === "--familiar-topics") {
      options.familiarTopics = argv[index + 1];
      index += 1;
    } else if (arg === "--topics-to-avoid") {
      options.topicsToAvoid = argv[index + 1];
      index += 1;
    } else if (arg === "--say" || arg === "--input") {
      options.input.push(argv[index + 1] ?? "");
      index += 1;
    } else if (arg === "--transcript") {
      options.transcript = argv[index + 1];
      index += 1;
    } else if (arg === "--scenario") {
      options.scenario = argv[index + 1];
      index += 1;
    } else if (arg === "--review-id") {
      options.reviewId = argv[index + 1];
      index += 1;
    } else if (arg === "--result") {
      options.result = argv[index + 1];
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--repair") {
      options.repair = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.learnerRoot ||= defaultLearnerRoot();
  return { command, options };
}

function output(result, json = false) {
  if (json || typeof result !== "string") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(result);
}

function transcriptInputs(options) {
  const inputs = [...options.input].filter(Boolean);
  if (options.transcript) {
    inputs.push(
      ...readFileSync(options.transcript, "utf8")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    );
  }
  if (!inputs.length) {
    inputs.push("I want to practice a little today.");
  }
  return inputs;
}

function helpText() {
  return [
    "English Learning Harness supported command-wrapper path",
    "",
    "Usage:",
    "  node scripts/english-learning-harness.mjs setup [--name NAME] [--motivation TEXT] [--learner-root DIR] [--repair]",
    "  node scripts/english-learning-harness.mjs today [--say TEXT ...] [--transcript FILE] [--scenario ID] [--learner-root DIR]",
    "  node scripts/english-learning-harness.mjs health [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs status [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs context [--learner-root DIR]",
    "  node scripts/english-learning-harness.mjs review [--review-id ID --result success|fail] [--learner-root DIR]",
    "  node scripts/english-learning-harness.mjs vault [--learner-root DIR]",
    "",
    "Native hooks are optional. This wrapper is the reliable first-usable path.",
  ].join("\n");
}

function recoveryCommand(command, options) {
  return `node scripts/english-learning-harness.mjs ${command} --learner-root ${JSON.stringify(options.learnerRoot)}`;
}

function backupIfExists(path, stamp) {
  if (!existsSync(path)) return "";
  const backupPath = `${path}.broken-${stamp}`;
  renameSync(path, backupPath);
  return backupPath;
}

function repairLearnerStore(learnerRoot) {
  const paths = learnerPaths(learnerRoot);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(paths.root, { recursive: true });
  mkdirSync(paths.journalDir, { recursive: true });
  mkdirSync(paths.artifactDir, { recursive: true });

  const backups = [
    backupIfExists(paths.progress, stamp),
    backupIfExists(paths.learnerModel, stamp),
    backupIfExists(paths.vocabulary, stamp),
    backupIfExists(paths.reviewQueue, stamp),
  ].filter(Boolean);

  writeProgress(paths.progress, {
    version: 2,
    mvp_session_metrics: emptyMetrics(),
    monthly_optional_metrics: {},
    sessions: [],
  });
  writeLearnerModel(paths.learnerModel, emptyLearnerModel());
  writeVocabulary(paths.vocabulary, emptyVocabulary());
  writeReviewQueue(paths.reviewQueue, emptyReviewQueue());
  return backups;
}

function recoverableFailure(error, options) {
  return {
    status: "fail",
    path: "explicit-command-wrapper",
    learnerRoot: options.learnerRoot,
    error: error.message,
    recovery: [
      `${recoveryCommand("setup", options)} --repair`,
      recoveryCommand("health", options),
    ],
    claimBoundary:
      "This reports local setup health and recovery guidance; it does not modify files unless --repair is used.",
  };
}

function setup(options) {
  let repairBackups = [];
  let profilePath;
  try {
    profilePath = writeProfile(options.learnerRoot, options);
  } catch (error) {
    if (!options.repair) return recoverableFailure(error, options);
    repairBackups = repairLearnerStore(options.learnerRoot);
    profilePath = writeProfile(options.learnerRoot, options);
  }
  const paths = ensureLearnerStore(options.learnerRoot);
  const healthResult = health({ ...options, repair: false });
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: paths.root,
    profilePath,
    progressPath: paths.progress,
    learnerModelPath: paths.learnerModel,
    repairPerformed: options.repair,
    repairBackups,
    health: {
      profileReady: healthResult.profileReady,
      sessionCount: healthResult.sessionCount,
      checks: healthResult.checks,
    },
    nativeHooksRequired: false,
    next: [
      `node scripts/english-learning-harness.mjs today --learner-root ${JSON.stringify(paths.root)} --say "I want to practice today."`,
      `node scripts/english-learning-harness.mjs health --learner-root ${JSON.stringify(paths.root)}`,
    ],
  };
}

function today(options) {
  const paths = ensureLearnerStore(options.learnerRoot);
  const profileText = readProfile(paths.profile);
  const scenarioPlan = planScenario({
    profileText,
    preferredId: options.scenario,
    learnerModel: readLearnerModel(paths.learnerModel),
    vocabulary: readVocabulary(paths.vocabulary),
    dueReviewItems: listDueReviewItems(paths.root),
  });
  const session = buildSession(transcriptInputs(options), {
    opening:
      "Let's keep this low pressure. Say one useful sentence, then we will repair it once.",
    scenario: scenarioPlan.scenario,
    selectionReason: scenarioPlan.selectionReason,
  });
  const persisted = persistSession(options.learnerRoot, session);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: persisted.learnerRoot,
    sessionId: session.id,
    mode: session.mode,
    scenario: session.scenario,
    scenarioSelection: session.scenario.selection_reason,
    sessionMetrics: session.session_metrics,
    learnerModelEvidence: session.learner_model_evidence,
    mirror: session.mirror,
    journalPath: persisted.journalPath,
    artifactPath: persisted.artifactPath,
    relativeArtifactPath: persisted.relativeArtifactPath,
    finalizesSession: true,
    nativeHooksRequired: false,
    claimBoundary:
      "This proves the supported explicit command-wrapper session finalization path, not native hook runtime.",
  };
}

function health(options) {
  let paths;
  try {
    paths = ensureLearnerStore(options.learnerRoot);
  } catch (error) {
    return recoverableFailure(error, options);
  }
  const progress = readProgress(paths.progress);
  const profile = readProfile(paths.profile);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: paths.root,
    profilePath: paths.profile,
    progressPath: paths.progress,
    journalDir: paths.journalDir,
    artifactDir: paths.artifactDir,
    profileReady: profile.includes("preferred_name"),
    sessionCount: Array.isArray(progress.sessions) ? progress.sessions.length : 0,
    checks: [
      { name: "profile", status: profile.includes("preferred_name") ? "pass" : "warn" },
      { name: "progress", status: "pass" },
      { name: "learnerModel", status: existsSync(paths.learnerModel) ? "pass" : "fail" },
      { name: "vocabulary", status: existsSync(paths.vocabulary) ? "pass" : "fail" },
      { name: "reviewQueue", status: existsSync(paths.reviewQueue) ? "pass" : "fail" },
    ],
    recovery: [],
    nativeHooksRequired: false,
    nativeHooksStatus: "optional",
    claimBoundary:
      "Health checks local learner store readiness for the command-wrapper path only.",
  };
}

function status(options) {
  const paths = ensureLearnerStore(options.learnerRoot);
  return {
    status: "pass",
    learnerRoot: paths.root,
    profile: readProfile(paths.profile),
    progress: readProgress(paths.progress),
    learnerModel: readLearnerModel(paths.learnerModel),
  };
}

function review(options) {
  ensureLearnerStore(options.learnerRoot);
  if (options.reviewId || options.result) {
    if (!options.reviewId || !options.result) {
      throw new Error("review requires both --review-id and --result when marking an item");
    }
    const reviewedItem = markReviewItem(options.learnerRoot, options.reviewId, options.result);
    return {
      status: "pass",
      path: "explicit-command-wrapper",
      action: "review-marked",
      reviewedItem,
      claimBoundary: "This proves local review scheduling mechanics, not long-term retention.",
    };
  }

  const dueItems = listDueReviewItems(options.learnerRoot);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    action: "due-review-list",
    dueCount: dueItems.length,
    dueItems,
    claimBoundary: "This lists locally due phrases and asks for use in context, not flashcard-only recall.",
  };
}

function vault(options) {
  const phrases = phraseVault(options.learnerRoot);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    phraseCount: phrases.length,
    phrases,
    claimBoundary: "This exposes saved personal phrases only; it does not claim retention or fluency gains.",
  };
}

function run() {
  const { command, options } = parseArgs(process.argv);

  if (command === "help") {
    output(helpText(), options.json);
    return;
  }
  if (command === "setup") {
    output(setup(options), options.json);
    return;
  }
  if (command === "today") {
    output(today(options), options.json);
    return;
  }
  if (command === "health") {
    output(health(options), options.json);
    return;
  }
  if (command === "status") {
    output(status(options), options.json);
    return;
  }
  if (command === "context") {
    output(buildAdditionalContext(options.learnerRoot), options.json);
    return;
  }
  if (command === "review") {
    output(review(options), options.json);
    return;
  }
  if (command === "vault") {
    output(vault(options), options.json);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

try {
  run();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", error: error.message }, null, 2));
  process.exit(1);
}
