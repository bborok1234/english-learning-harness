#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import {
  buildAdditionalContext,
  buildDailyCockpit,
  buildSession,
  diagnoseSpeakingSample,
  emptyLearnerModel,
  defaultLearnerRoot,
  emptyMetrics,
  emptyReviewQueue,
  emptySpeakingBacklog,
  emptyVocabulary,
  ensureLearnerStore,
  learnerPaths,
  listDueReviewItems,
  listSpeakingBacklog,
  markReviewItem,
  nextSpeakingBacklogItem,
  persistSession,
  phraseVault,
  readLearnerModel,
  readProgress,
  readProfile,
  readReviewQueue,
  readSpeakingBacklog,
  readVocabulary,
  writeWeeklyMirror,
  writeLearnerModel,
  writeProgress,
  writeReviewQueue,
  writeSpeakingBacklog,
  writeVocabulary,
  writeLearnerHome,
  writeProfile,
} from "./lib/english-learning-store.mjs";
import { planScenario } from "./lib/scenario-engine.mjs";
import { evaluateTranscriptReview } from "./lib/transcript-review-rubric.mjs";

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
    } else if (arg === "--audio-file") {
      options.audioFile = argv[index + 1];
      index += 1;
    } else if (arg === "--image-file") {
      options.imageFile = argv[index + 1];
      index += 1;
    } else if (arg === "--hidden-detail") {
      options.hiddenDetail = argv[index + 1];
      index += 1;
    } else if (arg === "--clarification-prompt") {
      options.clarificationPrompt = argv[index + 1];
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
    } else if (arg === "--day") {
      options.day = Number(argv[index + 1]);
      if (!Number.isInteger(options.day) || options.day < 1 || options.day > 7) {
        throw new Error(`Invalid --day: ${argv[index + 1]}`);
      }
      index += 1;
    } else if (arg === "--comfort-rating") {
      options.comfortRating = Number(argv[index + 1]);
      if (!Number.isFinite(options.comfortRating) || options.comfortRating < 0 || options.comfortRating > 5) {
        throw new Error("--comfort-rating must be a number from 0 to 5");
      }
      index += 1;
    } else if (arg === "--friction-note") {
      options.frictionNote = argv[index + 1];
      index += 1;
    } else if (arg === "--consent") {
      options.consent = argv[index + 1];
      index += 1;
    } else if (arg === "--date") {
      const date = new Date(argv[index + 1]);
      if (!Number.isFinite(date.getTime())) {
        throw new Error(`Invalid --date: ${argv[index + 1]}`);
      }
      options.date = date;
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
    "  node scripts/english-learning-harness.mjs daily [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs home [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs diagnose [--say TEXT ...] [--transcript FILE] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs backlog [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-start [--say TEXT ...] [--comfort-rating 0-5] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-status [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-day [--day 1-7] [--say TEXT ...] [--friction-note TEXT] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-finish [--say TEXT ...] [--comfort-rating 0-5] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs today [--say TEXT ...] [--transcript FILE] [--scenario ID] [--learner-root DIR] [--date ISO]",
    "  node scripts/english-learning-harness.mjs voice [--say TEXT ...] [--transcript FILE] [--audio-file FILE] [--scenario ID] [--learner-root DIR] [--date ISO]",
    "  node scripts/english-learning-harness.mjs image [--image-file FILE] [--hidden-detail TEXT] [--clarification-prompt TEXT] [--say TEXT ...] [--scenario ID] [--learner-root DIR] [--date ISO]",
    "  node scripts/english-learning-harness.mjs health [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs status [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs context [--learner-root DIR]",
    "  node scripts/english-learning-harness.mjs review [--review-id ID --result success|fail] [--learner-root DIR] [--date ISO]",
    "  node scripts/english-learning-harness.mjs vault [--learner-root DIR]",
    "  node scripts/english-learning-harness.mjs weekly [--learner-root DIR] [--date ISO]",
    "  node scripts/english-learning-harness.mjs export [--learner-root DIR] [--date ISO] [--json]",
    "",
    "Native hooks are optional. This wrapper is the reliable first-usable path.",
  ].join("\n");
}

function commandWithRoot(command, learnerRoot, extraArgs = []) {
  return [
    "node scripts/english-learning-harness.mjs",
    command,
    "--learner-root",
    JSON.stringify(learnerRoot),
    ...extraArgs,
  ].join(" ");
}

function supportDiagnostics(options, paths) {
  const learnerRoot = paths?.root ?? options.learnerRoot;
  const supportFiles = paths
    ? [
        paths.profile,
        paths.progress,
        paths.learnerModel,
        paths.speakingBacklog,
        paths.vocabulary,
        paths.reviewQueue,
        paths.journalDir,
        paths.artifactDir,
      ]
    : [];

  return {
    summary: "Use the explicit command-wrapper path. Native hooks are optional.",
    learnerRoot,
    nativeHooksRequired: false,
    nativeHooksStatus: "optional",
    nextCommands: [
      commandWithRoot("daily", learnerRoot, ["--json"]),
      commandWithRoot("diagnose", learnerRoot, ["--say", JSON.stringify("I get stuck when I speak."), "--json"]),
      commandWithRoot("backlog", learnerRoot, ["--json"]),
      commandWithRoot("pilot-status", learnerRoot, ["--json"]),
      commandWithRoot("today", learnerRoot, ["--say", JSON.stringify("I want to practice today."), "--json"]),
      commandWithRoot("weekly", learnerRoot, ["--json"]),
      commandWithRoot("home", learnerRoot, ["--json"]),
      commandWithRoot("export", learnerRoot, ["--json"]),
      commandWithRoot("health", learnerRoot, ["--json"]),
    ],
    recoveryCommands: [
      `${commandWithRoot("setup", learnerRoot)} --repair --json`,
      commandWithRoot("health", learnerRoot, ["--json"]),
    ],
    supportFiles,
    claimBoundary:
      "These diagnostics explain local command-wrapper recovery and next steps only. They do not modify files unless --repair is used.",
  };
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
  mkdirSync(paths.speakingOsDir, { recursive: true });
  mkdirSync(paths.weeklyMirrorDir, { recursive: true });

  const backups = [
    backupIfExists(paths.progress, stamp),
    backupIfExists(paths.learnerModel, stamp),
    backupIfExists(paths.speakingBacklog, stamp),
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
  writeSpeakingBacklog(paths.speakingBacklog, emptySpeakingBacklog());
  writeVocabulary(paths.vocabulary, emptyVocabulary());
  writeReviewQueue(paths.reviewQueue, emptyReviewQueue());
  return backups;
}

function recoverableFailure(error, options) {
  const support = supportDiagnostics(options);
  return {
    status: "fail",
    path: "explicit-command-wrapper",
    learnerRoot: options.learnerRoot,
    error: error.message,
    recovery: support.recoveryCommands,
    support,
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
    next: supportDiagnostics(options, paths).nextCommands,
    support: supportDiagnostics(options, paths),
  };
}

function daily(options) {
  const cockpit = buildDailyCockpit(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: cockpit.learner_root,
    cockpit,
    claimBoundary: cockpit.claim_boundary,
  };
}

function home(options) {
  const result = writeLearnerHome(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: result.cockpit.learner_root,
    homePath: result.homePath,
    homeUrl: result.homeUrl,
    todayAction: result.cockpit.suggested_scenario,
    dueReviewCount: result.cockpit.due_review.count,
    claimBoundary:
      "This generates a local learner HTML surface from local files only; it is not a hosted app.",
  };
}

function diagnose(options) {
  const date = options.date || new Date();
  const result = diagnoseSpeakingSample(options.learnerRoot, transcriptInputs(options), date);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: result.learnerRoot,
    action: "speaking-diagnosis",
    diagnosis: result.diagnosis,
    diagnoses: result.diagnoses,
    backlogItem: result.backlogItem,
    backlogItems: result.backlogItems,
    backlogPath: result.backlogPath,
    artifactPath: result.artifactPath,
    created: result.created,
    createdCount: result.createdCount,
    nextCommand: commandWithRoot("today", result.learnerRoot, ["--say", JSON.stringify(result.backlogItem.drill_prompt), "--json"]),
    claimBoundary: result.claimBoundary,
  };
}

function backlog(options) {
  const paths = ensureLearnerStore(options.learnerRoot);
  const items = listSpeakingBacklog(paths.root);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: paths.root,
    backlogPath: paths.speakingBacklog,
    itemCount: items.length,
    openCount: items.filter((item) => ["open", "needs_review", "in_progress"].includes(item.status)).length,
    passedCount: items.filter((item) => item.status === "passed").length,
    nextItem: nextSpeakingBacklogItem(paths.root),
    items,
    claimBoundary:
      "This is a local speaking skill backlog. It tracks practice targets and transfer attempts, not certified fluency.",
  };
}

const pilotPromptSet = ["warm_start", "clarification", "reuse", "image_info_gap", "reflection"];

function pilotPaths(learnerRoot) {
  const paths = ensureLearnerStore(learnerRoot);
  const pilotDir = resolve(paths.root, "artifacts/pilot");
  mkdirSync(pilotDir, { recursive: true });
  return {
    ...paths,
    pilotState: resolve(paths.root, "pilot-state.json"),
    pilotDir,
  };
}

function defaultPilotState(paths, date = new Date()) {
  return {
    schema_version: 1,
    pilot_id: `owner-self-${date.toISOString().slice(0, 10)}`,
    participant: {
      type: "owner_self",
      label: "repository owner / self pilot participant",
    },
    protocol: "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md",
    status: "awaiting_baseline",
    started_at: date.toISOString(),
    target_days: 7,
    minimum_valid_daily_sessions: 5,
    prompt_set: pilotPromptSet,
    consent: {
      scope: "local-only",
      accepted_at: "",
      note:
        "Pilot data stays local by default. Do not post transcripts, private notes, local paths, audio, or image files publicly without explicit review.",
    },
    baseline: null,
    days: [],
    final_sample: null,
    report: null,
    claim_boundary:
      "This owner/self pilot can produce early local behavioral evidence only. It does not prove generalized fluency or real-world speaking ability.",
  };
}

function normalizePilotState(state, paths, date = new Date()) {
  const base = defaultPilotState(paths, date);
  const normalized = {
    ...base,
    ...state,
    participant: {
      ...base.participant,
      ...(state?.participant ?? {}),
      label: "repository owner / self pilot participant",
    },
    consent: {
      ...base.consent,
      ...(state?.consent ?? {}),
    },
    prompt_set: Array.isArray(state?.prompt_set) ? state.prompt_set : base.prompt_set,
    days: Array.isArray(state?.days) ? state.days : [],
  };
  if (normalized.schema_version !== 1) {
    throw new Error(`${paths.pilotState}: schema_version must be 1`);
  }
  if (!["awaiting_baseline", "in_progress", "ready_to_finish", "complete", "incomplete"].includes(normalized.status)) {
    throw new Error(`${paths.pilotState}: invalid status ${normalized.status}`);
  }
  return normalized;
}

function readPilotState(paths, date = new Date()) {
  if (!existsSync(paths.pilotState)) {
    return defaultPilotState(paths, date);
  }
  return normalizePilotState(JSON.parse(readFileSync(paths.pilotState, "utf8")), paths, date);
}

function writePilotState(paths, state, date = new Date()) {
  const normalized = normalizePilotState(state, paths, date);
  writeFileSync(paths.pilotState, `${JSON.stringify(normalized, null, 2)}\n`);
  return normalized;
}

function relativeToRoot(paths, filePath) {
  return filePath ? relative(paths.root, filePath) : "";
}

function pilotNextAction(state) {
  if (!state.baseline) {
    return {
      command: "pilot-start",
      prompt:
        "Day 0 baseline: answer in English with 3-5 short lines: one thing you did today, one clarification question, one stuck-moment repair phrase, one scene/detail description, and one comfort note.",
    };
  }
  const completedDays = state.days.filter((day) => day.status === "complete").length;
  if (completedDays < state.minimum_valid_daily_sessions) {
    return {
      command: "pilot-day",
      day: completedDays + 1,
      prompt: `Pilot Day ${completedDays + 1}: do one low-pressure Speaking Skill OS session and leave one friction note if anything felt annoying.`,
    };
  }
  if (!state.final_sample) {
    return {
      command: "pilot-finish",
      prompt:
        "Final sample: repeat the same Day 0 prompt categories so the rubric can compare baseline and final evidence.",
    };
  }
  return {
    command: "pilot-complete",
    prompt: "Pilot report is ready. Review the local report before sharing anything publicly.",
  };
}

function pilotStatusSummary(state) {
  const completedDailySessions = state.days.filter((day) => day.status === "complete").length;
  const readyToFinish = Boolean(state.baseline) && completedDailySessions >= state.minimum_valid_daily_sessions;
  return {
    pilotId: state.pilot_id,
    status: state.status,
    participant: state.participant.label,
    baselineReady: Boolean(state.baseline),
    completedDailySessions,
    minimumValidDailySessions: state.minimum_valid_daily_sessions,
    targetDays: state.target_days,
    finalReady: Boolean(state.final_sample),
    reportReady: Boolean(state.report),
    readyToFinish,
    nextAction: pilotNextAction(state),
    claimBoundary: state.claim_boundary,
  };
}

function pilotStart(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  let state = readPilotState(paths, date);
  const turns = transcriptInputs({ ...options, input: options.input ?? [] }).filter(Boolean);
  const hasExplicitSample = (options.input?.length ?? 0) > 0 || Boolean(options.transcript);
  const consentScope = options.consent || "local-only";

  state = {
    ...state,
    status: hasExplicitSample ? "in_progress" : "awaiting_baseline",
    started_at: state.started_at || date.toISOString(),
    consent: {
      ...state.consent,
      scope: consentScope,
      accepted_at: state.consent.accepted_at || date.toISOString(),
    },
  };

  let diagnosis = null;
  let baselineArtifactPath = "";
  if (hasExplicitSample) {
    diagnosis = diagnoseSpeakingSample(paths.root, turns, date);
    const baseline = {
      collected_at: date.toISOString(),
      prompt_set: state.prompt_set,
      transcript: turns,
      comfort_rating: options.comfortRating ?? null,
      diagnosis_artifact: relativeToRoot(paths, diagnosis.artifactPath),
    };
    baselineArtifactPath = resolve(paths.pilotDir, `baseline-${date.toISOString().slice(0, 10)}-${date.getTime()}.json`);
    writeFileSync(
      baselineArtifactPath,
      `${JSON.stringify({
        schema_version: 1,
        pilot_id: state.pilot_id,
        baseline,
        claim_boundary: state.claim_boundary,
      }, null, 2)}\n`,
    );
    state.baseline = {
      ...baseline,
      artifact: relativeToRoot(paths, baselineArtifactPath),
    };
  }

  state = writePilotState(paths, state, date);
  return {
    status: "pass",
    action: "pilot-start",
    learnerRoot: paths.root,
    pilotStatePath: paths.pilotState,
    baselineArtifactPath,
    diagnosis,
    summary: pilotStatusSummary(state),
    privacy:
      "Local-only by default. Review and redact transcripts before posting any pilot evidence publicly.",
    claimBoundary: state.claim_boundary,
  };
}

function pilotStatus(options) {
  const paths = pilotPaths(options.learnerRoot);
  const state = readPilotState(paths, options.date || new Date());
  return {
    status: "pass",
    action: "pilot-status",
    learnerRoot: paths.root,
    pilotStatePath: paths.pilotState,
    summary: pilotStatusSummary(state),
    state,
  };
}

function pilotDay(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  let state = readPilotState(paths, date);
  if (!state.baseline) {
    throw new Error("pilot-day requires a baseline first. Run pilot-start with a learner sample.");
  }
  const completedDays = state.days.filter((day) => day.status === "complete").length;
  const dayNumber = options.day ?? completedDays + 1;
  const sessionResult = today({
    ...options,
    learnerRoot: paths.root,
    date,
  });
  const dayRecord = {
    day: dayNumber,
    date: date.toISOString(),
    status: "complete",
    session_id: sessionResult.sessionId,
    artifact: relativeToRoot(paths, sessionResult.artifactPath),
    friction_note: options.frictionNote || "",
    speaking_backlog_evidence: sessionResult.speakingBacklogEvidence,
  };
  const withoutSameDay = state.days.filter((day) => day.day !== dayNumber);
  state = {
    ...state,
    status:
      withoutSameDay.length + 1 >= state.minimum_valid_daily_sessions
        ? "ready_to_finish"
        : "in_progress",
    days: [...withoutSameDay, dayRecord].sort((a, b) => a.day - b.day),
  };
  state = writePilotState(paths, state, date);
  return {
    status: "pass",
    action: "pilot-day",
    learnerRoot: paths.root,
    day: dayRecord,
    session: sessionResult,
    summary: pilotStatusSummary(state),
    claimBoundary: state.claim_boundary,
  };
}

function pilotReportMarkdown(report) {
  return [
    "# English Learning Harness Owner Pilot Report",
    "",
    `Generated: ${report.generated_at}`,
    `Pilot: ${report.pilot_id}`,
    "",
    "## Status",
    "",
    `- Decision: ${report.rubric.decision}`,
    `- Daily sessions: ${report.daily_session_count}/${report.minimum_valid_daily_sessions} minimum`,
    `- Pass signals: ${report.rubric.pass_signals.join(", ") || "none"}`,
    "",
    "## Rubric Deltas",
    "",
    ...Object.entries(report.rubric.metrics.deltas).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Friction Notes",
    "",
    ...(report.friction_notes.length ? report.friction_notes.map((note) => `- Day ${note.day}: ${note.note}`) : ["- none"]),
    "",
    "## Claim Boundary",
    "",
    report.claim_boundary,
    "",
  ].join("\n");
}

function pilotFinish(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  let state = readPilotState(paths, date);
  if (!state.baseline) {
    throw new Error("pilot-finish requires a baseline first.");
  }
  const completedDays = state.days.filter((day) => day.status === "complete").length;
  if (completedDays < state.minimum_valid_daily_sessions) {
    throw new Error(
      `pilot-finish requires at least ${state.minimum_valid_daily_sessions} completed daily sessions; current=${completedDays}`,
    );
  }
  const turns = transcriptInputs(options);
  const vocabulary = readVocabulary(paths.vocabulary);
  const finalSample = {
    collected_at: date.toISOString(),
    prompt_set: state.prompt_set,
    transcript: turns,
    comfort_rating: options.comfortRating ?? null,
  };
  const rubric = evaluateTranscriptReview({
    saved_phrases: vocabulary.personal_phrases ?? [],
    baseline: state.baseline,
    final: finalSample,
  });
  const report = {
    schema_version: 1,
    generated_at: date.toISOString(),
    pilot_id: state.pilot_id,
    daily_session_count: completedDays,
    minimum_valid_daily_sessions: state.minimum_valid_daily_sessions,
    baseline: state.baseline,
    final_sample: finalSample,
    rubric,
    friction_notes: state.days
      .filter((day) => day.friction_note)
      .map((day) => ({ day: day.day, note: day.friction_note })),
    claim_boundary:
      "This owner/self pilot report summarizes one local learner's behavioral evidence. It does not prove generalized fluency or real-world speaking ability.",
  };
  const reportPath = resolve(paths.pilotDir, `pilot-report-${date.toISOString().slice(0, 10)}.json`);
  const reportMarkdownPath = resolve(paths.pilotDir, `pilot-report-${date.toISOString().slice(0, 10)}.md`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(reportMarkdownPath, pilotReportMarkdown(report));
  state = writePilotState(
    paths,
    {
      ...state,
      status: "complete",
      final_sample: {
        ...finalSample,
        report: relativeToRoot(paths, reportPath),
      },
      report: {
        json: relativeToRoot(paths, reportPath),
        markdown: relativeToRoot(paths, reportMarkdownPath),
        decision: rubric.decision,
        pass_signals: rubric.pass_signals,
      },
    },
    date,
  );
  return {
    status: "pass",
    action: "pilot-finish",
    learnerRoot: paths.root,
    reportPath,
    reportMarkdownPath,
    rubric,
    summary: pilotStatusSummary(state),
    claimBoundary: report.claim_boundary,
  };
}

function today(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const profileText = readProfile(paths.profile);
  const scenarioPlan = planScenario({
    profileText,
    preferredId: options.scenario,
    learnerModel: readLearnerModel(paths.learnerModel),
    vocabulary: readVocabulary(paths.vocabulary),
    dueReviewItems: listDueReviewItems(paths.root, date),
    speakingBacklogItem: options.scenario ? null : nextSpeakingBacklogItem(paths.root),
  });
  const session = buildSession(transcriptInputs(options), {
    sessionId: `${date.toISOString().slice(0, 10)}-${date.getTime()}`,
    opening:
      "Let's keep this low pressure. Say one useful sentence, then we will repair it once.",
    scenario: scenarioPlan.scenario,
    selectionReason: scenarioPlan.selectionReason,
  });
  const persisted = persistSession(options.learnerRoot, session, date);
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
    speakingBacklogEvidence: session.speaking_backlog_evidence,
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

function voice(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const profileText = readProfile(paths.profile);
  const scenarioPlan = planScenario({
    profileText,
    preferredId: options.scenario,
    learnerModel: readLearnerModel(paths.learnerModel),
    vocabulary: readVocabulary(paths.vocabulary),
    dueReviewItems: listDueReviewItems(paths.root, date),
    speakingBacklogItem: options.scenario ? null : nextSpeakingBacklogItem(paths.root),
  });
  const sourceArtifact = options.audioFile
    ? {
        type: "audio",
        path: options.audioFile,
        claim_boundary: "Audio path is local metadata only; no speech-quality judgment is inferred.",
      }
    : undefined;
  const session = buildSession(transcriptInputs(options), {
    sessionId: `${date.toISOString().slice(0, 10)}-${date.getTime()}-voice`,
    mode: "voice-transcript",
    modality: "voice",
    sourceArtifact,
    opening:
      "Let's treat this as transcription-first voice practice. We will use the transcript as learning evidence.",
    scenario: scenarioPlan.scenario,
    selectionReason: scenarioPlan.selectionReason,
  });
  const persisted = persistSession(options.learnerRoot, session, date);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: persisted.learnerRoot,
    sessionId: session.id,
    mode: session.mode,
    eventModality: "voice",
    audioFile: options.audioFile || "",
    scenario: session.scenario,
    interactionEvents: session.interaction_events,
    journalPath: persisted.journalPath,
    artifactPath: persisted.artifactPath,
    finalizesSession: true,
    claimBoundary:
      "This imports transcription-first voice evidence only. It does not prove live voice exchange or speech quality.",
  };
}

function image(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const profileText = readProfile(paths.profile);
  const scenarioPlan = planScenario({
    profileText,
    preferredId: options.scenario || "reactivation-check-in",
    learnerModel: readLearnerModel(paths.learnerModel),
    vocabulary: readVocabulary(paths.vocabulary),
    dueReviewItems: listDueReviewItems(paths.root, date),
    speakingBacklogItem: null,
  });
  const sourceArtifact = {
    type: "image",
    path: options.imageFile || "",
    hidden_detail: options.hiddenDetail || "one important visual detail is missing from the learner description",
    clarification_prompt:
      options.clarificationPrompt || "Ask one clarification question about the missing visual detail.",
    claim_boundary: "Image path is local prompt context only; the image itself is not proof of learning.",
  };
  const session = buildSession(transcriptInputs(options), {
    sessionId: `${date.toISOString().slice(0, 10)}-${date.getTime()}-image`,
    mode: "image-info-gap",
    modality: "image",
    sourceArtifact,
    opening:
      "Let's use this image as an information-gap speaking task. Describe what matters, then clarify one missing detail.",
    scenario: scenarioPlan.scenario,
    selectionReason: {
      ...scenarioPlan.selectionReason,
      source: "image-information-gap",
      hidden_detail: sourceArtifact.hidden_detail,
    },
  });
  const persisted = persistSession(options.learnerRoot, session, date);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: persisted.learnerRoot,
    sessionId: session.id,
    mode: session.mode,
    eventModality: "image",
    imageFile: options.imageFile || "",
    hiddenDetail: sourceArtifact.hidden_detail,
    clarificationPrompt: sourceArtifact.clarification_prompt,
    scenario: session.scenario,
    interactionEvents: session.interaction_events,
    journalPath: persisted.journalPath,
    artifactPath: persisted.artifactPath,
    finalizesSession: true,
    claimBoundary:
      "This creates a local image information-gap event only. It does not evaluate generated media or real-world transfer.",
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
      { name: "speakingBacklog", status: existsSync(paths.speakingBacklog) ? "pass" : "fail" },
      { name: "vocabulary", status: existsSync(paths.vocabulary) ? "pass" : "fail" },
      { name: "reviewQueue", status: existsSync(paths.reviewQueue) ? "pass" : "fail" },
    ],
    recovery: [],
    nativeHooksRequired: false,
    nativeHooksStatus: "optional",
    support: supportDiagnostics(options, paths),
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
    speakingBacklog: readSpeakingBacklog(paths.speakingBacklog),
    support: supportDiagnostics(options, paths),
  };
}

function context(options) {
  const paths = ensureLearnerStore(options.learnerRoot);
  const support = supportDiagnostics(options, paths);
  return [
    buildAdditionalContext(paths.root),
    "",
    "Support diagnostics:",
    `- Native hooks: ${support.nativeHooksStatus}; explicit command wrapper is supported.`,
    `- Recovery: ${support.recoveryCommands.join(" | ")}`,
    `- Next: ${support.nextCommands.join(" | ")}`,
  ].join("\n");
}

function review(options) {
  ensureLearnerStore(options.learnerRoot);
  if (options.reviewId || options.result) {
    if (!options.reviewId || !options.result) {
      throw new Error("review requires both --review-id and --result when marking an item");
    }
    const reviewedItem = markReviewItem(
      options.learnerRoot,
      options.reviewId,
      options.result,
      options.date || new Date(),
    );
    return {
      status: "pass",
      path: "explicit-command-wrapper",
      action: "review-marked",
      reviewedItem,
      claimBoundary: "This proves local review scheduling mechanics, not long-term retention.",
    };
  }

  const dueItems = listDueReviewItems(options.learnerRoot, options.date || new Date());
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

function weekly(options) {
  const result = writeWeeklyMirror(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    mirrorPath: result.mirrorPath,
    mirror: result.mirror,
    claimBoundary: result.mirror.claim_boundary,
  };
}

function redactLocalPath(value) {
  if (!value || typeof value !== "string") return value;
  return {
    local_path_redacted: true,
    basename: basename(value),
    note: "Local path is metadata only and is not included in the evidence pack.",
  };
}

function sanitizeEvent(event) {
  return {
    event_id: event.event_id,
    modality: event.modality,
    learner_intent: event.learner_intent,
    learner_output: event.learner_output,
    trouble_source: event.trouble_source,
    mediation_level: event.mediation_level,
    repair_attempt: event.repair_attempt,
    saved_phrase: event.saved_phrase,
    transfer_targets: event.transfer_targets ?? [],
    source_artifact: event.source_artifact
      ? {
          ...event.source_artifact,
          path: redactLocalPath(event.source_artifact.path),
        }
      : undefined,
  };
}

function collectSessionArtifacts(paths, progress) {
  return (progress.sessions ?? [])
    .map((session) => {
      const artifactPath = resolve(paths.root, session.artifact ?? "");
      if (!existsSync(artifactPath)) return null;
      const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
      const words = (artifact.learner_turns ?? []).join(" ").split(/\s+/).filter(Boolean).length;
      return {
        id: artifact.id,
        date: artifact.date,
        mode: artifact.mode,
        artifact: session.artifact,
        scenario: {
          id: artifact.scenario?.id,
          goal: artifact.scenario?.goal,
          rescue_phrase: artifact.scenario?.rescue_phrase,
        },
        turn_count: artifact.learner_turns?.length ?? 0,
        learner_word_count: words,
        saved_phrase: artifact.mirror?.reviewPhrase ?? "",
        repair_evidence: artifact.learner_model_evidence?.updated_skills?.includes("repair") ?? false,
        speaking_backlog_evidence: artifact.speaking_backlog_evidence,
        interaction_events: (artifact.interaction_events ?? []).map(sanitizeEvent),
      };
    })
    .filter(Boolean);
}

function collectWeeklyMirrors(paths) {
  if (!existsSync(paths.weeklyMirrorDir)) return [];
  return readdirSync(paths.weeklyMirrorDir)
    .filter((entry) => entry.endsWith(".json"))
    .sort()
    .map((entry) => {
      const mirror = JSON.parse(readFileSync(resolve(paths.weeklyMirrorDir, entry), "utf8"));
      return {
        file: relative(paths.root, resolve(paths.weeklyMirrorDir, entry)),
        generated_at: mirror.generated_at,
        window: mirror.window,
        communicated_themes: mirror.communicated_themes ?? [],
        saved_phrases: mirror.saved_phrases ?? [],
        reused_phrases: mirror.reused_phrases ?? [],
        repair_attempts: mirror.repair_attempts ?? [],
        interaction_event_summary: mirror.interaction_event_summary,
        next_focus: mirror.next_focus,
        claim_boundary: mirror.claim_boundary,
      };
    });
}

function summarizeEvidence({ sessions, weeklyMirrors, vocabulary, reviewQueue, learnerModel, speakingBacklog }) {
  const modalities = [...new Set(sessions.flatMap((session) => session.interaction_events.map((event) => event.modality)))];
  return {
    session_count: sessions.length,
    date_range: {
      from: sessions[0]?.date ?? "",
      to: sessions.at(-1)?.date ?? "",
    },
    total_learner_word_count: sessions.reduce((sum, session) => sum + session.learner_word_count, 0),
    repair_session_count: sessions.filter((session) => session.repair_evidence).length,
    interaction_event_count: sessions.reduce((sum, session) => sum + session.interaction_events.length, 0),
    modalities,
    saved_phrase_count: vocabulary.personal_phrases?.length ?? 0,
    review_item_count: reviewQueue.items?.length ?? 0,
    reused_review_item_count: (reviewQueue.items ?? []).filter((item) => (item.success_count ?? 0) > 0).length,
    speaking_backlog_count: speakingBacklog.items?.length ?? 0,
    speaking_backlog_passed_count: (speakingBacklog.items ?? []).filter((item) => item.status === "passed").length,
    weekly_mirror_count: weeklyMirrors.length,
    skill_evidence: learnerModel.interaction_skills,
  };
}

function evidenceMarkdown(pack) {
  return [
    "# English Learning Harness Evidence Pack",
    "",
    `Generated: ${pack.generated_at}`,
    `Protocol: ${pack.protocol}`,
    "",
    "## Summary",
    "",
    `- Sessions: ${pack.summary.session_count}`,
    `- Date range: ${pack.summary.date_range.from || "n/a"} to ${pack.summary.date_range.to || "n/a"}`,
    `- Learner words: ${pack.summary.total_learner_word_count}`,
    `- Interaction events: ${pack.summary.interaction_event_count}`,
    `- Modalities: ${pack.summary.modalities.join(", ") || "none"}`,
    `- Saved phrases: ${pack.summary.saved_phrase_count}`,
    `- Reused review items: ${pack.summary.reused_review_item_count}`,
    `- Speaking backlog: ${pack.summary.speaking_backlog_passed_count}/${pack.summary.speaking_backlog_count} passed`,
    "",
    "## Sessions",
    "",
    ...pack.sessions.map(
      (session) =>
        `- ${session.date} ${session.mode}: ${session.learner_word_count} words, phrase "${session.saved_phrase}"`,
    ),
    "",
    "## Weekly Mirrors",
    "",
    ...pack.weekly_mirrors.map(
      (mirror) =>
        `- ${mirror.file}: ${mirror.window.session_count} sessions, next focus ${mirror.next_focus?.skill ?? "n/a"}`,
    ),
    "",
    "## Claim Boundary",
    "",
    pack.claim_boundary,
    "",
  ].join("\n");
}

function exportEvidence(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const speakingBacklog = readSpeakingBacklog(paths.speakingBacklog);
  const vocabulary = readVocabulary(paths.vocabulary);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const sessions = collectSessionArtifacts(paths, progress);
  const weeklyMirrors = collectWeeklyMirrors(paths);
  const validationDir = resolve(paths.root, "artifacts/validation");
  mkdirSync(validationDir, { recursive: true });
  const stamp = date.toISOString().slice(0, 10);
  const pack = {
    schema_version: 1,
    generated_at: date.toISOString(),
    protocol: "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md",
    learner_root: redactLocalPath(paths.root),
    source_files: {
      profile: "profile.md",
      progress: "progress.json",
      learner_model: "learner-model.json",
      speaking_backlog: "speaking-backlog.json",
      vocabulary: "vocabulary.json",
      review_queue: "review-queue.json",
      learner_home: existsSync(paths.learnerHome) ? "home.html" : "",
    },
    profile_summary: readProfile(paths.profile)
      .split(/\r?\n/)
      .filter((line) => line.startsWith("- preferred_name") || line.startsWith("- primary_motivation")),
    summary: summarizeEvidence({ sessions, weeklyMirrors, vocabulary, reviewQueue, learnerModel, speakingBacklog }),
    sessions,
    weekly_mirrors: weeklyMirrors,
    review_queue: {
      item_count: reviewQueue.items.length,
      items: reviewQueue.items.map((item) => ({
        id: item.id,
        text: item.text,
        success_count: item.success_count ?? 0,
        interval_days: item.interval_days ?? 0,
        last_result: item.last_result ?? "",
        next_due_at: item.next_due_at ?? "",
      })),
    },
    speaking_backlog: {
      item_count: speakingBacklog.items.length,
      open_count: speakingBacklog.items.filter((item) => ["open", "needs_review", "in_progress"].includes(item.status)).length,
      passed_count: speakingBacklog.items.filter((item) => item.status === "passed").length,
      items: speakingBacklog.items.map((item) => ({
        id: item.id,
        skill: item.skill,
        label: item.label,
        status: item.status,
        evidence_count: item.evidence_count,
        transfer_test: item.transfer_test,
      })),
    },
    claim_boundary:
      "This evidence pack summarizes local practice artifacts for review. It does not prove learning improvement, fluency, or real-world speaking ability.",
  };
  const jsonPath = resolve(validationDir, `evidence-pack-${stamp}.json`);
  const markdownPath = resolve(validationDir, `evidence-pack-${stamp}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`);
  writeFileSync(markdownPath, evidenceMarkdown(pack));
  return {
    status: "pass",
    learnerRoot: paths.root,
    evidencePackPath: jsonPath,
    evidenceMarkdownPath: markdownPath,
    summary: pack.summary,
    claimBoundary: pack.claim_boundary,
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
  if (command === "daily") {
    output(daily(options), options.json);
    return;
  }
  if (command === "home") {
    output(home(options), options.json);
    return;
  }
  if (command === "diagnose") {
    output(diagnose(options), options.json);
    return;
  }
  if (command === "backlog") {
    output(backlog(options), options.json);
    return;
  }
  if (command === "pilot-start") {
    output(pilotStart(options), options.json);
    return;
  }
  if (command === "pilot-status") {
    output(pilotStatus(options), options.json);
    return;
  }
  if (command === "pilot-day") {
    output(pilotDay(options), options.json);
    return;
  }
  if (command === "pilot-finish") {
    output(pilotFinish(options), options.json);
    return;
  }
  if (command === "today") {
    output(today(options), options.json);
    return;
  }
  if (command === "voice") {
    output(voice(options), options.json);
    return;
  }
  if (command === "image") {
    output(image(options), options.json);
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
    output(context(options), options.json);
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
  if (command === "weekly") {
    output(weekly(options), options.json);
    return;
  }
  if (command === "export") {
    output(exportEvidence(options), options.json);
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
