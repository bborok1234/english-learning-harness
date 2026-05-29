#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import {
  buildAdditionalContext,
  buildDailyCockpit,
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
  readReviewQueue,
  readVocabulary,
  writeWeeklyMirror,
  writeLearnerModel,
  writeProgress,
  writeReviewQueue,
  writeVocabulary,
  writeLearnerHome,
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
  mkdirSync(paths.weeklyMirrorDir, { recursive: true });

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

function summarizeEvidence({ sessions, weeklyMirrors, vocabulary, reviewQueue, learnerModel }) {
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
      vocabulary: "vocabulary.json",
      review_queue: "review-queue.json",
      learner_home: existsSync(paths.learnerHome) ? "home.html" : "",
    },
    profile_summary: readProfile(paths.profile)
      .split(/\r?\n/)
      .filter((line) => line.startsWith("- preferred_name") || line.startsWith("- primary_motivation")),
    summary: summarizeEvidence({ sessions, weeklyMirrors, vocabulary, reviewQueue, learnerModel }),
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
