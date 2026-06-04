#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
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
  writeGeneratedDailyMission,
  writeGeneratedMissionScene,
  writeGeneratedMissionAssetDeck,
  writeGeneratedMissionStoryboard,
  writeLearnerReport,
  writeLearnerModel,
  writeProgress,
  writePersonalLearnerCockpit,
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
    } else if (arg === "--quick-reply") {
      options.quickReply = argv[index + 1];
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
    } else if (arg === "--scene-preset") {
      options.scenePreset = argv[index + 1];
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
    } else if (arg === "--phase") {
      options.phase = argv[index + 1];
      index += 1;
    } else if (arg === "--card-id") {
      options.cardId = argv[index + 1];
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
    "  node scripts/english-learning-harness.mjs mission [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs scene [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs storyboard [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs asset-deck [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs cockpit [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs report [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs practice-next [--scene-preset ID] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs practice-reply [--say TEXT|--quick-reply INDEX_OR_ID] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs practice [--say TEXT ...] [--transcript FILE] [--scene-preset ID] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs home [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs diagnose [--say TEXT ...] [--transcript FILE] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs backlog [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-start [--say TEXT ...] [--comfort-rating 0-5] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-status [--learner-root DIR] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-launch [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-next [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-reply [--say TEXT|--quick-reply INDEX_OR_ID] [--friction-note TEXT] [--comfort-rating 0-5] [--learner-root DIR] [--date ISO] [--json]",
    "  node scripts/english-learning-harness.mjs pilot-capture [--phase baseline|day|final] [--card-id ID] [--say TEXT] [--comfort-rating 0-5] [--friction-note TEXT] [--learner-root DIR] [--date ISO] [--json]",
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
        paths.missionArtifactDir,
        paths.reportArtifactDir,
        paths.sceneArtifactDir,
        paths.assetArtifactDir,
        paths.storyboardArtifactDir,
      ]
    : [];

  return {
    summary: "Use the explicit command-wrapper path. Native hooks are optional.",
    learnerRoot,
    nativeHooksRequired: false,
    nativeHooksStatus: "optional",
    nextCommands: [
      commandWithRoot("daily", learnerRoot, ["--json"]),
      commandWithRoot("mission", learnerRoot, ["--json"]),
      commandWithRoot("scene", learnerRoot, ["--json"]),
      commandWithRoot("storyboard", learnerRoot, ["--json"]),
      commandWithRoot("practice", learnerRoot, ["--say", JSON.stringify("I want to practice today."), "--json"]),
      commandWithRoot("cockpit", learnerRoot, ["--json"]),
      commandWithRoot("report", learnerRoot, ["--json"]),
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
  mkdirSync(paths.missionArtifactDir, { recursive: true });
  mkdirSync(paths.reportArtifactDir, { recursive: true });
  mkdirSync(paths.sceneArtifactDir, { recursive: true });
  mkdirSync(paths.assetArtifactDir, { recursive: true });
  mkdirSync(paths.storyboardArtifactDir, { recursive: true });
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

function mission(options) {
  const result = writeGeneratedDailyMission(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: result.state.learner_root,
    missionStatePath: result.missionStatePath,
    missionHtmlPath: result.missionHtmlPath,
    missionUrl: result.missionUrl,
    mission: {
      id: result.state.mission_id,
      title: result.state.learner_visible_scene.title,
      targetSkill: result.state.target_skill,
      transferTest: result.state.transfer_test,
      startCommands: result.state.start_commands,
    },
    claimBoundary: result.state.claim_boundary,
  };
}

function scene(options) {
  const date = options.date || new Date();
  const missionResult = writeGeneratedDailyMission(options.learnerRoot, date);
  const sceneResult = writeGeneratedMissionScene(options.learnerRoot, date, missionResult.state);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: sceneResult.state.learner_root,
    missionStatePath: missionResult.missionStatePath,
    sceneStatePath: sceneResult.sceneStatePath,
    sceneHtmlPath: sceneResult.sceneHtmlPath,
    sceneUrl: sceneResult.sceneUrl,
    scene: {
      id: sceneResult.state.scene_id,
      title: sceneResult.state.title,
      missionId: sceneResult.state.mission_id,
      targetSkill: sceneResult.state.target_skill,
      transferTest: sceneResult.state.transfer_test,
      frameCount: sceneResult.state.frames.length,
    },
    claimBoundary: sceneResult.state.claim_boundary,
  };
}

function storyboard(options) {
  const date = options.date || new Date();
  const missionResult = writeGeneratedDailyMission(options.learnerRoot, date, {
    scenePreset: options.scenePreset,
  });
  const storyboardResult = writeGeneratedMissionStoryboard(options.learnerRoot, date, missionResult.state);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: storyboardResult.state.learner_root,
    missionStatePath: missionResult.missionStatePath,
    storyboardStatePath: storyboardResult.storyboardStatePath,
    storyboardHtmlPath: storyboardResult.storyboardHtmlPath,
    storyboardUrl: storyboardResult.storyboardUrl,
    storyboard: {
      id: storyboardResult.state.storyboard_id,
      missionId: storyboardResult.state.mission_id,
      title: storyboardResult.state.mission_title,
      targetSkill: storyboardResult.state.target_skill,
      frameCount: storyboardResult.state.frames.length,
      evidenceRequired: storyboardResult.state.expected_evidence.session_artifact,
    },
    claimBoundary: storyboardResult.state.claim_boundary,
  };
}

function assetDeck(options) {
  const date = options.date || new Date();
  const missionResult = writeGeneratedDailyMission(options.learnerRoot, date, {
    scenePreset: options.scenePreset,
  });
  const deckResult = writeGeneratedMissionAssetDeck(options.learnerRoot, date, missionResult.state);
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: deckResult.state.learner_root,
    missionStatePath: missionResult.missionStatePath,
    deckStatePath: deckResult.deckStatePath,
    deckHtmlPath: deckResult.deckHtmlPath,
    deckUrl: deckResult.deckUrl,
    deck: {
      id: deckResult.state.deck_id,
      missionId: deckResult.state.mission_id,
      targetSkill: deckResult.state.target_skill,
      assetCount: deckResult.state.assets.length,
      canonicalCompletionPath: deckResult.state.canonical_completion_path,
      evidenceRequired: deckResult.state.evidence_required,
      storyboardArtifact: deckResult.state.storyboard_artifact,
    },
    claimBoundary: deckResult.state.claim_boundary,
  };
}

function cockpit(options) {
  const result = writePersonalLearnerCockpit(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: result.state.learner_root,
    cockpitStatePath: result.cockpitStatePath,
    cockpitPath: result.cockpitPath,
    cockpitUrl: result.cockpitUrl,
    todayAction: result.state.today,
    speakingSkillOS: result.state.speaking_skill_os,
    activePilot: result.state.active_pilot,
    nextAssetAction: result.state.next_asset_action,
    nextActions: result.state.next_actions,
    journey: result.state.journey,
    claimBoundary: result.state.claim_boundary,
  };
}

function report(options) {
  const result = writeLearnerReport(options.learnerRoot, options.date || new Date());
  return {
    status: "pass",
    path: "explicit-command-wrapper",
    learnerRoot: result.report.learner_root,
    reportPath: result.reportPath,
    reportHtmlPath: result.reportHtmlPath,
    reportUrl: result.reportUrl,
    windows: result.report.windows,
    speakingSkillOS: result.report.speaking_skill_os,
    nextFocus: result.report.next_focus,
    claimBoundary: result.report.claim_boundary,
  };
}

function dailyQuickReplies(missionState) {
  const scene = missionState.learner_visible_scene ?? {};
  const bySkill = {
    clarification: [
      "Which one do you mean?",
      "Could you tell me which one you mean?",
      "Do you mean the usual place or a different one?",
    ],
    repair: [
      "I do not know the exact word, but I can explain it.",
      "I forgot the word, but I mean something small and useful.",
      "Let me say it in an easier way.",
    ],
    follow_ups: [
      "That sounds nice. What did you do there?",
      "How was it?",
      "Did you go there with friends?",
    ],
    soft_disagreement: [
      "I see your point, but I prefer another option.",
      "I understand, but that is difficult for me today.",
      "Maybe we can choose something lighter.",
    ],
    starts: [
      "I had a quiet day and did a few small tasks.",
      "I feel okay today, but I am a little tired.",
      "I want to practice one simple sentence today.",
    ],
  };
  const fallbackReplies = bySkill[missionState.target_skill] ?? [];
  const replies = [...new Set([scene.example, ...fallbackReplies].filter(Boolean))].slice(0, 3);
  return replies.map((text, index) => ({
    id: `quick-${index + 1}`,
    text,
    note: index === 0 ? "가장 짧고 안전한 시작" : "조금 더 구체적인 변형",
  }));
}

function dailyAssistantPrompt(missionState, quickReplies) {
  const scene = missionState.learner_visible_scene ?? {};
  const quickLine = quickReplies.length
    ? `막히면 번호로 골라도 됩니다: ${quickReplies.map((reply, index) => `${index + 1}. ${reply.text}`).join(" / ")}`
    : "";
  return [
    "오늘은 영어 한 문장만 먼저 시작합니다.",
    scene.title ? `장면: ${scene.title}` : "",
    scene.setup ? `상황: ${scene.setup}` : "",
    scene.situation ? `대화 맥락: ${scene.situation}` : "",
    scene.ask ? `질문: ${scene.ask}` : "",
    scene.example ? `예시: ${scene.example}` : "",
    quickLine,
    "답은 영어 한 문장이면 충분합니다. Codex가 저장과 cockpit 갱신은 내부적으로 처리합니다.",
  ]
    .filter(Boolean)
    .join("\n");
}

function writePracticeStartCard({ paths, date, missionResult, cockpitResult }) {
  const missionState = missionResult.state;
  const scene = missionState.learner_visible_scene ?? {};
  const quickReplies = dailyQuickReplies(missionState);
  const assistantPrompt = {
    language: "ko",
    text: dailyAssistantPrompt(missionState, quickReplies),
    answer_rule: "영어 한 문장만 답하면 됩니다. 번호를 골라도 되고 직접 바꿔 말해도 됩니다.",
    after_answer: "Codex가 내부적으로 practice flow를 실행해 mission, report, cockpit을 갱신합니다.",
  };
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    surface: "learner-facing daily practice start card",
    mission: {
      id: missionState.mission_id,
      title: scene.title ?? "",
      target_skill: missionState.target_skill,
      scene_preset: missionState.scene_preset ?? "",
      transfer_test: missionState.transfer_test,
      mission_html: relative(paths.root, missionResult.missionHtmlPath),
    },
    prompt: {
      setup: scene.setup ?? "",
      situation: scene.situation ?? "",
      ask: scene.ask ?? "",
      example: scene.example ?? "",
    },
    assistant_prompt: assistantPrompt,
    quick_replies: quickReplies,
    cockpit: {
      html: relative(paths.root, cockpitResult.cockpitPath),
      url: cockpitResult.cockpitUrl,
    },
    privacy: "답변 원문은 기본적으로 내 컴퓨터의 학습 기록에만 저장됩니다.",
    claim_boundary:
      "This card helps start a local daily practice session. It does not save an answer or prove learning outcomes.",
  };
  const jsonPath = resolve(paths.missionArtifactDir, "practice-start-card.json");
  const htmlPath = resolve(paths.missionArtifactDir, "practice-start-card.html");
  writeFileSync(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(scene.title ?? "Daily Practice Start")}</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #657067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(800px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; }
    .eyebrow { color: var(--accent); font-weight: 760; font-size: 13px; letter-spacing: 0; text-transform: uppercase; }
    h1 { margin: 8px 0 10px; font-size: clamp(28px, 5vw, 44px); line-height: 1.12; letter-spacing: 0; }
    p { margin: 0; }
    .setup { color: var(--muted); font-size: 16px; }
    .ask { margin-top: 20px; padding: 18px; border-radius: 8px; background: var(--warm); font-size: 22px; font-weight: 760; line-height: 1.32; }
    .prompt { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; }
    .prompt h2, .quick h2 { margin: 0 0 8px; font-size: 16px; letter-spacing: 0; }
    .prompt pre { margin: 0; white-space: pre-wrap; word-break: keep-all; overflow-wrap: anywhere; color: var(--ink); font: inherit; }
    .quick { margin-top: 18px; }
    .quick ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .quick li { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .quick .choice { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 780; }
    .quick strong { display: block; font-size: 16px; overflow-wrap: anywhere; }
    .quick span { display: block; margin-top: 2px; color: var(--muted); font-size: 13px; }
    .copy-reply { appearance: none; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; color: var(--ink); padding: 7px 10px; font: inherit; font-size: 13px; font-weight: 720; cursor: pointer; white-space: nowrap; }
    .meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fbfcfa; }
    .metric span { display: block; color: var(--muted); font-size: 13px; }
    .metric strong { display: block; margin-top: 2px; font-size: 17px; overflow-wrap: anywhere; }
    .rule, .privacy { margin-top: 14px; color: var(--muted); }
    footer { margin-top: 16px; color: var(--muted); font-size: 13px; }
    @media (max-width: 640px) { .meta { grid-template-columns: 1fr; } .quick li { grid-template-columns: auto 1fr; } .copy-reply { grid-column: 2; justify-self: start; } .ask { font-size: 19px; } }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <p class="eyebrow">English Learning Harness · Daily Practice</p>
      <h1>${escapeHtml(scene.title ?? "오늘의 한 문장")}</h1>
      <p class="setup">${escapeHtml(scene.setup ?? "")}</p>
      <div class="meta" aria-label="daily practice metadata">
        <div class="metric"><span>Target skill</span><strong>${escapeHtml(missionState.target_skill)}</strong></div>
        <div class="metric"><span>Evidence</span><strong>session artifact</strong></div>
        <div class="metric"><span>Mode</span><strong>text-first</strong></div>
      </div>
      ${scene.situation ? `<p class="setup">${escapeHtml(scene.situation)}</p>` : ""}
      <p class="ask">${escapeHtml(scene.ask ?? "")}</p>
      ${scene.example ? `<p class="rule">예시: ${escapeHtml(scene.example)}</p>` : ""}
      <section class="prompt" aria-label="learner-ready prompt">
        <h2>Codex가 바로 말할 다음 문장</h2>
        <pre>${escapeHtml(assistantPrompt.text)}</pre>
      </section>
      <section class="quick" aria-label="daily quick replies">
        <h2>번호로 고를 수 있는 답변 후보</h2>
        <ul>
          ${quickReplies
            .map(
              (reply, index) => `<li><b class="choice" aria-label="${index + 1}번 선택지">${index + 1}</b><div><strong>${escapeHtml(reply.text)}</strong><span>${escapeHtml(reply.note)}</span></div><button class="copy-reply" type="button" data-reply="${escapeHtml(reply.text)}">복사</button></li>`,
            )
            .join("")}
        </ul>
      </section>
      <p class="rule">${escapeHtml(assistantPrompt.answer_rule)}</p>
      <p class="privacy">${escapeHtml(artifact.privacy)}</p>
    </section>
    <footer>${escapeHtml(artifact.claim_boundary)}</footer>
  </main>
  <script>
    for (const button of document.querySelectorAll(".copy-reply")) {
      button.addEventListener("click", async () => {
        const text = button.dataset.reply || "";
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "복사됨";
        } catch {
          button.textContent = "선택해서 복사";
        }
      });
    }
  </script>
</body>
</html>
`,
    "utf8",
  );
  return {
    artifact,
    jsonPath,
    htmlPath,
    url: pathToFileURL(htmlPath).href,
  };
}

function practiceNext(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const missionResult = writeGeneratedDailyMission(paths.root, date, {
    scenePreset: options.scenePreset,
  });
  const cockpitResult = cockpit({ ...options, learnerRoot: paths.root, date });
  const card = writePracticeStartCard({ paths, date, missionResult, cockpitResult });
  return {
    status: "pass",
    path: "codex-operated-practice-start-card",
    learnerRoot: paths.root,
    cardPath: card.jsonPath,
    htmlPath: card.htmlPath,
    url: card.url,
    mission: card.artifact.mission,
    assistantPrompt: card.artifact.assistant_prompt,
    quickReplies: card.artifact.quick_replies,
    cockpit: card.artifact.cockpit,
    claimBoundary: card.artifact.claim_boundary,
  };
}

function readPracticeStartCard(paths) {
  const cardPath = resolve(paths.missionArtifactDir, "practice-start-card.json");
  if (!existsSync(cardPath)) {
    throw new Error("practice-reply requires a practice-start-card first. Generate it internally with practice-next.");
  }
  return {
    cardPath,
    card: JSON.parse(readFileSync(cardPath, "utf8")),
  };
}

function resolvePracticeReplyAnswer(card, options) {
  if (options.quickReply) {
    const raw = String(options.quickReply).trim();
    const quickReplies = card.quick_replies ?? [];
    const match = quickReplies.find((reply, index) => reply.id === raw || String(index + 1) === raw);
    if (!match) {
      throw new Error(`Unknown quick reply selection: ${raw}`);
    }
    return {
      answer: match.text,
      source: "quick_reply",
      quickReplyId: match.id,
    };
  }
  const answer = (options.input ?? []).filter(Boolean).join(" ").trim();
  if (!answer) {
    throw new Error("practice-reply requires one --say answer or --quick-reply selection.");
  }
  return {
    answer,
    source: "freeform",
    quickReplyId: "",
  };
}

function writePracticeReplyCard({ paths, date, startCard, reply, practiceResult }) {
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    surface: "learner-facing daily practice saved-reply card",
    saved: true,
    reply: {
      source: reply.source,
      quick_reply_id: reply.quickReplyId,
      answer: reply.answer,
    },
    coaching: {
      communicated: practiceResult.learnerFacing.today,
      recast: practiceResult.learnerFacing.recast,
      next_phrase: practiceResult.learnerFacing.nextPhrase,
      next_focus: practiceResult.learnerFacing.nextFocus,
      artifact_hint: practiceResult.learnerFacing.artifactHint,
    },
    mission: {
      id: practiceResult.mission.id,
      title: practiceResult.mission.title,
      target_skill: practiceResult.mission.targetSkill,
      scene_preset: practiceResult.mission.scenePreset,
      html: relative(paths.root, practiceResult.mission.htmlPath),
    },
    scene: {
      id: practiceResult.scene.id,
      title: practiceResult.scene.title,
      html: relative(paths.root, practiceResult.scene.htmlPath),
    },
    report: {
      html: relative(paths.root, practiceResult.report.htmlPath),
      url: practiceResult.report.url,
    },
    cockpit: {
      html: relative(paths.root, practiceResult.cockpit.htmlPath),
      url: practiceResult.cockpit.url,
    },
    start_card: {
      title: startCard.mission?.title ?? "",
      target_skill: startCard.mission?.target_skill ?? "",
    },
    privacy: "답변 원문은 기본적으로 내 컴퓨터의 학습 기록에만 저장됩니다.",
    claim_boundary:
      "This card confirms a local daily practice answer was saved. It does not prove learning outcomes or real-world speaking ability.",
  };
  const jsonPath = resolve(paths.missionArtifactDir, "practice-reply-card.json");
  const htmlPath = resolve(paths.missionArtifactDir, "practice-reply-card.html");
  writeFileSync(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Daily Practice Saved Reply</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #657067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(820px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; }
    .eyebrow { color: var(--accent); font-weight: 760; font-size: 13px; letter-spacing: 0; text-transform: uppercase; }
    h1 { margin: 8px 0 10px; font-size: clamp(28px, 5vw, 44px); line-height: 1.12; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 17px; letter-spacing: 0; }
    p { margin: 0; }
    .saved { margin-top: 14px; padding: 14px; border-radius: 8px; background: var(--warm); font-size: 18px; font-weight: 760; overflow-wrap: anywhere; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
    .line { border: 1px solid var(--line); border-radius: 8px; padding: 13px; background: #fbfcfa; }
    .line strong { display: block; color: var(--muted); font-size: 13px; }
    .line p { margin-top: 4px; overflow-wrap: anywhere; }
    .links { margin-top: 18px; display: grid; gap: 8px; }
    .links a { display: block; padding: 11px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; color: inherit; text-decoration: none; font-weight: 720; }
    .rule, footer { margin-top: 14px; color: var(--muted); font-size: 13px; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <p class="eyebrow">English Learning Harness · Daily Practice</p>
      <h1>오늘 답변 저장됨</h1>
      <p class="saved">${escapeHtml(artifact.reply.answer)}</p>
      <div class="grid" aria-label="daily practice coaching">
        <div class="line"><strong>전달한 뜻</strong><p>${escapeHtml(artifact.coaching.communicated)}</p></div>
        <div class="line"><strong>자연스럽게 바꾸면</strong><p>${escapeHtml(artifact.coaching.recast)}</p></div>
        <div class="line"><strong>다음에 쓸 표현</strong><p>${escapeHtml(artifact.coaching.next_phrase)}</p></div>
        <div class="line"><strong>다음 작은 초점</strong><p>${escapeHtml(artifact.coaching.next_focus)}</p></div>
      </div>
      <section class="links" aria-label="updated learner artifacts">
        <h2>갱신된 학습 표면</h2>
        <a href="${escapeHtml(relative(dirname(htmlPath), practiceResult.cockpit.htmlPath))}">Cockpit 열기</a>
        <a href="${escapeHtml(relative(dirname(htmlPath), practiceResult.report.htmlPath))}">Learner report 열기</a>
      </section>
      <p class="rule">${escapeHtml(artifact.privacy)}</p>
    </section>
    <footer>${escapeHtml(artifact.claim_boundary)}</footer>
  </main>
</body>
</html>
`,
    "utf8",
  );
  return {
    artifact,
    jsonPath,
    htmlPath,
    url: pathToFileURL(htmlPath).href,
  };
}

function practiceReply(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const { cardPath, card } = readPracticeStartCard(paths);
  const reply = resolvePracticeReplyAnswer(card, options);
  const practiceResult = practice({
    ...options,
    learnerRoot: paths.root,
    date,
    scenePreset: card.mission?.scene_preset || options.scenePreset,
    preserveCurrentMission: true,
    input: [reply.answer],
    quickReply: undefined,
  });
  const replyCard = writePracticeReplyCard({ paths, date, startCard: card, reply, practiceResult });
  return {
    status: "pass",
    path: "codex-operated-practice-reply",
    learnerRoot: paths.root,
    startCardPath: cardPath,
    replyCardPath: replyCard.jsonPath,
    replyCardHtmlPath: replyCard.htmlPath,
    replyCardUrl: replyCard.url,
    savedAnswer: reply.answer,
    savedFrom: reply.source,
    learnerFacing: practiceResult.learnerFacing,
    diagnosis: practiceResult.diagnosis,
    futureDiagnosis: practiceResult.futureDiagnosis,
    mission: practiceResult.mission,
    scene: practiceResult.scene,
    report: practiceResult.report,
    cockpit: practiceResult.cockpit,
    claimBoundary: replyCard.artifact.claim_boundary,
  };
}

function practice(options) {
  const date = options.date || new Date();
  const paths = ensureLearnerStore(options.learnerRoot);
  const turns = transcriptInputs(options);
  const hasExplicitInput = (options.input?.length ?? 0) > 0 || Boolean(options.transcript);
  const backlogBeforeMission = nextSpeakingBacklogItem(paths.root);
  const shouldDiagnoseBeforeMission =
    !options.preserveCurrentMission && !backlogBeforeMission && hasExplicitInput;
  const diagnosis = shouldDiagnoseBeforeMission
    ? diagnoseSpeakingSample(paths.root, turns, date)
    : null;
  const missionResult = writeGeneratedDailyMission(paths.root, date, {
    scenePreset: options.scenePreset,
  });
  const sceneResult = writeGeneratedMissionScene(paths.root, date, missionResult.state);
  const assetDeckResult = writeGeneratedMissionAssetDeck(paths.root, date, missionResult.state);
  const sessionOptions = {
    ...options,
    learnerRoot: paths.root,
    date,
    input: turns,
    transcript: undefined,
  };
  const sessionResult = options.imageFile || options.hiddenDetail
    ? image(sessionOptions)
    : options.audioFile
      ? voice(sessionOptions)
      : today(sessionOptions);
  const futureDiagnosis = options.preserveCurrentMission && !backlogBeforeMission && hasExplicitInput
    ? diagnoseSpeakingSample(paths.root, turns, date)
    : null;
  const weeklyResult = weekly({ ...options, learnerRoot: paths.root, date });
  const reportResult = report({ ...options, learnerRoot: paths.root, date });
  const cockpitResult = cockpit({ ...options, learnerRoot: paths.root, date });
  const nextFocus = reportResult.nextFocus?.prompt || cockpitResult.journey.latest_weekly_mirror?.next_focus?.prompt || "";
  return {
    status: "pass",
    path: "codex-operated-practice-flow",
    learnerRoot: paths.root,
    learnerFacing: {
      today: sessionResult.mirror.communicated,
      recast: sessionResult.mirror.recast,
      nextPhrase: sessionResult.mirror.nextPhrase,
      nextFocus,
      artifactHint:
        "오늘의 mission, learner report, cockpit이 로컬에 갱신되었습니다. 학습자는 Codex 대화 안에 머무르면 됩니다.",
    },
    diagnosis: diagnosis
      ? {
          timing: "before_current_mission",
          skill: diagnosis.diagnosis.skill,
          backlogItemId: diagnosis.backlogItem.id,
          backlogItemLabel: diagnosis.backlogItem.label,
        }
      : null,
    futureDiagnosis: futureDiagnosis
      ? {
          timing: "after_current_session",
          purpose: "future_practice_planning",
          skill: futureDiagnosis.diagnosis.skill,
          backlogItemId: futureDiagnosis.backlogItem.id,
          backlogItemLabel: futureDiagnosis.backlogItem.label,
        }
      : null,
    mission: {
      id: missionResult.state.mission_id,
      title: missionResult.state.learner_visible_scene.title,
      targetSkill: missionResult.state.target_skill,
      scenePreset: missionResult.state.scene_preset,
      htmlPath: missionResult.missionHtmlPath,
      url: missionResult.missionUrl,
    },
    scene: {
      id: sceneResult.state.scene_id,
      title: sceneResult.state.title,
      htmlPath: sceneResult.sceneHtmlPath,
      url: sceneResult.sceneUrl,
      frameCount: sceneResult.state.frames.length,
    },
    assetDeck: {
      id: assetDeckResult.state.deck_id,
      htmlPath: assetDeckResult.deckHtmlPath,
      url: assetDeckResult.deckUrl,
      assetCount: assetDeckResult.state.assets.length,
      canonicalCompletionPath: assetDeckResult.state.canonical_completion_path,
      topAssetAction: assetDeckResult.state.top_asset_action,
      storyboardArtifact: assetDeckResult.state.storyboard_artifact,
    },
    session: {
      id: sessionResult.sessionId,
      mode: sessionResult.mode,
      artifactPath: sessionResult.artifactPath,
      speakingBacklogEvidence: sessionResult.speakingBacklogEvidence,
    },
    report: {
      path: reportResult.reportPath,
      htmlPath: reportResult.reportHtmlPath,
      url: reportResult.reportUrl,
      windows: reportResult.windows,
    },
    cockpit: {
      statePath: cockpitResult.cockpitStatePath,
      htmlPath: cockpitResult.cockpitPath,
      url: cockpitResult.cockpitUrl,
    },
    weekly: {
      mirrorPath: weeklyResult.mirrorPath,
      nextFocus: weeklyResult.mirror.next_focus,
    },
    claimBoundary:
      "This is a Codex-operated local practice flow. It creates local learning artifacts and evidence, but does not prove fluency, realtime voice, or real-world transfer.",
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
    partial: {
      baseline: { answers: [] },
      final: { answers: [] },
      days: [],
    },
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
    partial: {
      baseline: {
        answers: Array.isArray(state?.partial?.baseline?.answers) ? state.partial.baseline.answers : [],
        comfort_rating: state?.partial?.baseline?.comfort_rating ?? null,
      },
      final: {
        answers: Array.isArray(state?.partial?.final?.answers) ? state.partial.final.answers : [],
        comfort_rating: state?.partial?.final?.comfort_rating ?? null,
      },
      days: Array.isArray(state?.partial?.days) ? state.partial.days : [],
    },
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

function ensurePilotConsent(state, date, scope = "local-only") {
  return {
    ...state,
    consent: {
      ...state.consent,
      scope,
      accepted_at: state.consent?.accepted_at || date.toISOString(),
      note:
        state.consent?.note ||
        "Pilot data stays local by default. Do not post transcripts, private notes, local paths, audio, or image files publicly without explicit review.",
    },
  };
}

function relativeToRoot(paths, filePath) {
  return filePath ? relative(paths.root, filePath) : "";
}

function pilotOpeningSceneChoices() {
  return [
    {
      id: "daily-life",
      label: "일상 장면",
      setup: "친구가 오늘 하루를 물어봅니다.",
      starter: "I had a quiet day and did a few small tasks.",
    },
    {
      id: "small-adventure",
      label: "작은 모험",
      setup: "처음 가보는 장소에 막 도착했습니다.",
      starter: "I just arrived, and this place feels new to me.",
    },
    {
      id: "comfort-zone",
      label: "편한 공간",
      setup: "지금 내가 있는 공간을 누군가에게 소개합니다.",
      starter: "I am in a comfortable place with a few things around me.",
    },
  ];
}

function day0MissionCards() {
  return [
    {
      id: "today_snapshot",
      title: "첫 장면 고르기",
      setup: "영어 시험처럼 시작하지 않습니다. 지금 말하고 싶은 작은 장면 하나를 고릅니다.",
      ask: "아래 장면 중 하나를 고르거나, 바로 영어 한 문장만 말해보세요.",
      example: "I had a quiet day and did a few small tasks.",
      sceneChoices: pilotOpeningSceneChoices(),
    },
    {
      id: "meaning_check",
      title: "잠깐, 무슨 뜻이야?",
      setup:
        '친구가 이렇게 말했습니다: "Let\'s meet at the usual place after work."',
      ask: "어디에서 만나자는 뜻인지 영어로 한 번만 다시 물어보세요.",
      example: "Which place do you mean?",
    },
    {
      id: "stuck_rescue",
      title: "막혔을 때 도망가지 않기",
      setup: "말하려는 단어가 바로 떠오르지 않는 상황입니다.",
      ask: '영어로 "정확한 단어는 모르겠지만..." 하고 계속 이어가 보세요.',
      example: "I do not know the exact word, but I mean this place feels comfortable.",
    },
    {
      id: "scene_snap",
      title: "내 주변 스냅샷",
      setup: "누군가 화상 통화로 지금 있는 곳이 어떤지 물었습니다.",
      ask: "주변에 보이는 장소나 물건을 영어로 한두 문장 묘사해보세요.",
      example: "I am in an office. There are many desks, chairs, and monitors.",
    },
    {
      id: "comfort_check",
      title: "오늘의 체감",
      setup: "마지막으로 오늘 영어로 말하는 느낌을 기록합니다.",
      ask: "0부터 5까지 점수와 이유를 아주 짧게 말해보세요.",
      example: "My comfort score is 3. I feel okay, but I am a little tired.",
    },
  ];
}

function day0ConversationGuide() {
  return {
    title: "3분 영어 스냅샷",
    opening:
      "시험이 아니라 현재 말하기 상태를 찍어두는 첫 장면입니다. 먼저 말하고 싶은 작은 세계를 고릅니다.",
    howToRun:
      "Codex should ask one mission at a time, wait for the learner's answer, then move to the next card. Do not expose rubric labels or ask the learner to fill evaluation fields.",
    learnerRule: "한 번에 한 문장만 말해도 됩니다. 막히면 쉬운 단어로 돌아가면 됩니다.",
    privacy:
      "이 답변은 기본적으로 로컬에만 저장됩니다. 공개 이슈나 PR에는 원문을 올리지 않습니다.",
    firstQuestion: day0MissionCards()[0],
    sceneChoices: pilotOpeningSceneChoices(),
    cards: day0MissionCards(),
  };
}

function pilotDayMissions() {
  return [
    {
      id: "clarify-usual-place",
      skill: "clarification",
      title: "확인 질문 만들기",
      setup:
        '친구가 이렇게 말했습니다: "Let\'s meet at the usual place after work."',
      ask: "어디에서 만나자는 뜻인지 확인하는 영어 질문을 한 문장으로 해보세요.",
      example: "Which place do you mean?",
      evidence: "Learner asks a concrete clarification question instead of pretending to understand.",
    },
    {
      id: "repair-wrong-order",
      skill: "repair",
      title: "말실수 고치기",
      setup: "카페에서 주문하다가 음료 이름을 잘못 말했습니다.",
      ask: "방금 말한 주문을 정정하는 영어 문장을 한 문장으로 해보세요.",
      example: "Sorry, I meant iced latte, not hot latte.",
      evidence: "Learner uses a repair phrase and continues the conversation.",
    },
    {
      id: "image-info-gap",
      skill: "image_description",
      title: "보이는 정보 설명하기",
      setup: "상대가 사진을 못 보고 있고, 당신만 회의실 사진을 보고 있습니다.",
      ask: "사진 속 장소를 상대가 상상할 수 있게 영어 한두 문장으로 설명해보세요.",
      example: "It looks like a meeting room. There is a long table and a screen on the wall.",
      evidence: "Learner transfers visible details into concrete English description.",
    },
    {
      id: "soft-disagreement",
      skill: "soft_disagreement",
      title: "부드럽게 다르게 말하기",
      setup: "동료가 지금 바로 야근하자고 제안했지만, 당신은 오늘은 어렵습니다.",
      ask: "상대 기분을 상하게 하지 않고 오늘은 어렵다고 영어로 한 문장 말해보세요.",
      example: "I understand, but I cannot stay late today.",
      evidence: "Learner uses a soft disagreement phrase with a clear boundary.",
    },
    {
      id: "follow-up-invitation",
      skill: "follow_up",
      title: "대화를 이어가기",
      setup: "새로 만난 사람이 주말에 등산을 갔다고 말했습니다.",
      ask: "그 이야기를 이어가기 위한 자연스러운 follow-up 질문을 영어로 한 문장 해보세요.",
      example: "That sounds nice. Where did you go hiking?",
      evidence: "Learner asks a relevant follow-up question that keeps the conversation moving.",
    },
  ];
}

function pilotDayMission(dayNumber) {
  const missions = pilotDayMissions();
  return missions[(Math.max(1, dayNumber) - 1) % missions.length];
}

function dayPracticeGuide(dayNumber, state) {
  const nextTitle = state.baseline ? `Pilot Day ${dayNumber}` : "Day 0 먼저 필요";
  const mission = pilotDayMission(dayNumber);
  return {
    title: nextTitle,
    opening:
      `오늘은 ${mission.title}만 연습합니다. 긴 답보다 실제 대화에서 쓸 수 있는 한 문장이 목표입니다.`,
    howToRun:
      "Codex should give the concrete situation, ask for one English sentence, then save the attempt through pilot-day.",
    firstQuestion: {
      title: mission.title,
      setup: mission.setup,
      ask: mission.ask,
      example: mission.example,
    },
    targetSkill: mission.skill,
    transferEvidence: mission.evidence,
    learnerRule: "답은 한 문장이면 됩니다. 예시를 그대로 조금 바꿔도 됩니다.",
  };
}

function finalConversationGuide() {
  return {
    title: "Day 7 다시 찍는 영어 스냅샷",
    opening:
      "Day 0과 비슷한 장면을 다시 말해봅니다. 목적은 점수 매기기가 아니라 어떤 행동이 편해졌는지 보는 것입니다.",
    howToRun:
      "Codex should reuse the same five mission cards, ask one at a time, and then save the collected answers through pilot-finish.",
    learnerRule: "Day 0보다 완벽할 필요는 없습니다. 조금 더 자연스럽게 묻고 이어가면 충분합니다.",
    cards: day0MissionCards(),
  };
}

function pilotNextAction(state) {
  if (!state.baseline) {
    const captured = state.partial?.baseline?.answers?.length ?? 0;
    const cards = day0MissionCards();
    const nextCard = cards[Math.min(captured, cards.length - 1)];
    return {
      command: "pilot-capture",
      phase: "baseline",
      cardId: nextCard?.id,
      prompt:
        captured > 0
          ? `${captured + 1}번째 스냅샷입니다. ${nextCard?.ask ?? "영어로 한 문장만 말해보세요."}`
          : '3분 영어 스냅샷을 시작합니다. 첫 질문: 친구가 "오늘 뭐 했어?"라고 물었다고 생각하고, 오늘 실제로 한 일을 영어로 한 문장만 말해보세요.',
      guide: day0ConversationGuide(),
    };
  }
  const completedDays = state.days.filter((day) => day.status === "complete").length;
  if (completedDays < state.minimum_valid_daily_sessions) {
    const dayNumber = completedDays + 1;
    const mission = pilotDayMission(dayNumber);
    return {
      command: "pilot-day",
      day: dayNumber,
      missionId: mission.id,
      targetSkill: mission.skill,
      prompt: mission.ask,
      guide: dayPracticeGuide(dayNumber, state),
    };
  }
  if (!state.final_sample) {
    const captured = state.partial?.final?.answers?.length ?? 0;
    const cards = day0MissionCards();
    const nextCard = cards[Math.min(captured, cards.length - 1)];
    return {
      command: "pilot-capture",
      phase: "final",
      cardId: nextCard?.id,
      prompt:
        captured > 0
          ? `마지막 스냅샷 ${captured + 1}번째입니다. ${nextCard?.ask ?? "영어로 한 문장만 말해보세요."}`
          : "마지막 영어 스냅샷입니다. Day 0과 비슷한 다섯 장면을 한 문장씩 다시 말해보겠습니다.",
      guide: finalConversationGuide(),
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
    partial: {
      baselineAnswers: state.partial?.baseline?.answers?.length ?? 0,
      finalAnswers: state.partial?.final?.answers?.length ?? 0,
      dayCaptures: state.partial?.days?.length ?? 0,
    },
    reportReady: Boolean(state.report),
    readyToFinish,
    nextAction: pilotNextAction(state),
    claimBoundary: state.claim_boundary,
  };
}

function pilotAnswerRecord({ phase, card, answer, date, day, frictionNote = "" }) {
  return {
    phase,
    day: day ?? null,
    card_id: card?.id ?? "",
    title: card?.title ?? "",
    answer,
    friction_note: frictionNote,
    captured_at: date.toISOString(),
  };
}

function replaceByCardId(records, record) {
  return [...records.filter((item) => item.card_id !== record.card_id), record].sort((a, b) =>
    String(a.card_id).localeCompare(String(b.card_id)),
  );
}

function pilotCockpitRefresh(paths, date) {
  const result = cockpit({ learnerRoot: paths.root, date });
  return {
    statePath: result.cockpitStatePath,
    htmlPath: result.cockpitPath,
    url: result.cockpitUrl,
    activePilot: result.activePilot ?? null,
  };
}

function pilotCapture(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  let state = readPilotState(paths, date);
  const answer = transcriptInputs(options).filter(Boolean)[0] || "";
  if (!answer) {
    throw new Error("pilot-capture requires one --say answer.");
  }
  const completedDays = state.days.filter((day) => day.status === "complete").length;
  const phase = options.phase || (!state.baseline ? "baseline" : completedDays < state.minimum_valid_daily_sessions ? "day" : "final");
  if (!["baseline", "day", "final"].includes(phase)) {
    throw new Error("--phase must be baseline, day, or final");
  }
  state = ensurePilotConsent(state, date, options.consent || state.consent?.scope || "local-only");

  if (phase === "day") {
    const dayNumber = options.day ?? completedDays + 1;
    const capturedDay = pilotAnswerRecord({
      phase,
      day: dayNumber,
      card: { id: `day-${dayNumber}`, title: `Pilot Day ${dayNumber}` },
      answer,
      frictionNote: options.frictionNote || "",
      date,
    });
    state = writePilotState(
      paths,
      {
        ...state,
        partial: {
          ...state.partial,
          days: [...(state.partial?.days ?? []).filter((item) => item.day !== dayNumber), capturedDay].sort((a, b) => a.day - b.day),
        },
      },
      date,
    );
    const dayResult = pilotDay({ ...options, learnerRoot: paths.root, day: dayNumber, input: [answer], date });
    const cockpitSnapshot = pilotCockpitRefresh(paths, date);
    return {
      status: "pass",
      action: "pilot-capture",
      phase,
      committed: true,
      capture: capturedDay,
      result: dayResult,
      cockpit: cockpitSnapshot,
      summary: dayResult.summary,
      conversationGuide: dayResult.conversationGuide,
      claimBoundary: state.claim_boundary,
    };
  }

  const cards = day0MissionCards();
  const existing = phase === "baseline" ? state.partial?.baseline?.answers ?? [] : state.partial?.final?.answers ?? [];
  const card = cards.find((item) => item.id === options.cardId) || cards[Math.min(existing.length, cards.length - 1)];
  const record = pilotAnswerRecord({ phase, card, answer, date });
  const updatedAnswers = replaceByCardId(existing, record);
  state = writePilotState(
    paths,
    {
      ...state,
      partial: {
        ...state.partial,
        [phase]: {
          answers: updatedAnswers,
          comfort_rating: options.comfortRating ?? state.partial?.[phase]?.comfort_rating ?? null,
        },
      },
    },
    date,
  );

  const readyToCommit = updatedAnswers.length >= cards.length;
  if (phase === "baseline" && readyToCommit) {
    const result = pilotStart({
      ...options,
      learnerRoot: paths.root,
      input: updatedAnswers.map((item) => item.answer),
      date,
      comfortRating: options.comfortRating ?? state.partial?.baseline?.comfort_rating ?? null,
    });
    const cockpitSnapshot = pilotCockpitRefresh(paths, date);
    return {
      status: "pass",
      action: "pilot-capture",
      phase,
      committed: true,
      capture: record,
      capturedCount: updatedAnswers.length,
      result,
      cockpit: cockpitSnapshot,
      summary: result.summary,
      conversationGuide: result.conversationGuide,
      claimBoundary: result.claimBoundary,
    };
  }
  if (phase === "final" && readyToCommit) {
    const result = pilotFinish({
      ...options,
      learnerRoot: paths.root,
      input: updatedAnswers.map((item) => item.answer),
      date,
      comfortRating: options.comfortRating ?? state.partial?.final?.comfort_rating ?? null,
    });
    const cockpitSnapshot = pilotCockpitRefresh(paths, date);
    return {
      status: "pass",
      action: "pilot-capture",
      phase,
      committed: true,
      capture: record,
      capturedCount: updatedAnswers.length,
      result,
      cockpit: cockpitSnapshot,
      summary: result.summary,
      claimBoundary: result.claimBoundary,
    };
  }

  const nextCard = cards[Math.min(updatedAnswers.length, cards.length - 1)];
  const cockpitSnapshot = pilotCockpitRefresh(paths, date);
  return {
    status: "pass",
    action: "pilot-capture",
    phase,
    committed: false,
    capture: record,
    capturedCount: updatedAnswers.length,
    requiredCount: cards.length,
    nextPrompt: nextCard
      ? {
          card_id: nextCard.id,
          title: nextCard.title,
          ask: nextCard.ask,
          example: nextCard.example,
        }
      : null,
    summary: pilotStatusSummary(state),
    cockpit: cockpitSnapshot,
    claimBoundary: state.claim_boundary,
  };
}

function pilotReplyLearnerFacing({ routedTo, captureResult, nextCardArtifact }) {
  const nextCard = nextCardArtifact?.nextCard ?? null;
  const next = nextCard
    ? {
        title: nextCard.title,
        ask: nextCard.ask,
        example: nextCard.example,
        phase: nextCard.phase,
        day: nextCard.day,
      }
    : null;
  const dayRecord = captureResult.result?.day ?? null;
  const coaching = dayRecord?.learner_coaching ?? null;
  const frictionNote = dayRecord?.friction_note ?? "";
  const frictionPrompt =
    routedTo.phase === "day" && !frictionNote
      ? "방금 답하면서 막힌 지점이 있었다면 한 단어로만 남겨도 됩니다. 예: usual place, 너무 길다, 바로 안 떠오름"
      : "";
  if (coaching) {
    return {
      saved: true,
      phase: routedTo.phase,
      day: routedTo.day,
      communicated: coaching.communicated,
      recast: coaching.recast,
      nextPhrase: coaching.next_phrase,
      nextFocus: coaching.next_focus,
      artifactHint: coaching.artifact_hint,
      frictionNoteCaptured: Boolean(frictionNote),
      frictionPrompt,
      nextCard: next,
      learnerRule: "방금 답변은 저장됐습니다. 다음에도 영어 한 문장만 답하면 됩니다.",
    };
  }

  return {
    saved: true,
    phase: routedTo.phase,
    day: routedTo.day,
    capturedCount: captureResult.capturedCount ?? null,
    committed: Boolean(captureResult.committed),
    frictionNoteCaptured: Boolean(frictionNote),
    frictionPrompt,
    nextCard: next,
    learnerRule: "방금 답변은 저장됐습니다. 다음 카드도 영어 한 문장이면 충분합니다.",
  };
}

function pilotReplyCardArtifact({ paths, date, routedTo, learnerFacing, nextCardArtifact, cockpit, claimBoundary }) {
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    surface: "learner-facing pilot reply card",
    saved: learnerFacing.saved,
    routed_to: routedTo,
    coaching: {
      communicated: learnerFacing.communicated ?? "",
      recast: learnerFacing.recast ?? "",
      next_phrase: learnerFacing.nextPhrase ?? "",
      next_focus: learnerFacing.nextFocus ?? "",
      artifact_hint: learnerFacing.artifactHint ?? "",
    },
    friction: {
      captured: Boolean(learnerFacing.frictionNoteCaptured),
      follow_up_prompt: learnerFacing.frictionPrompt ?? "",
    },
    next_card: learnerFacing.nextCard ?? null,
    learner_rule: learnerFacing.learnerRule,
    cockpit: {
      html: cockpit?.htmlPath ? relativeToRoot(paths, cockpit.htmlPath) : "",
      url: cockpit?.url ?? "",
    },
    next_card_artifact: {
      html: nextCardArtifact?.htmlPath ? relativeToRoot(paths, nextCardArtifact.htmlPath) : "",
      url: nextCardArtifact?.url ?? "",
    },
    privacy: "답변 원문은 기본적으로 내 컴퓨터의 학습 기록에만 저장됩니다. 공개 협업 기록에는 올리지 않습니다.",
    claim_boundary: claimBoundary,
  };
  const jsonPath = resolve(paths.pilotDir, "pilot-reply-card.json");
  const htmlPath = resolve(paths.pilotDir, "pilot-reply-card.html");
  const hasCoaching = Boolean(artifact.coaching.recast || artifact.coaching.next_phrase || artifact.coaching.next_focus);
  writeFileSync(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>답변 저장됨</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #657067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; --cool: #e8f2ff; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(820px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0; }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; }
    .eyebrow { color: var(--accent); font-weight: 760; font-size: 13px; letter-spacing: 0; text-transform: uppercase; }
    h1 { margin: 8px 0 10px; font-size: clamp(28px, 5vw, 40px); line-height: 1.12; letter-spacing: 0; }
    h2 { margin: 22px 0 8px; font-size: 18px; letter-spacing: 0; }
    p { margin: 0; }
    .subtle { color: var(--muted); }
    .saved { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; border-radius: 999px; background: #e5f6ea; color: #225f3d; font-weight: 760; }
    .line { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; }
    .line + .line { margin-top: 10px; }
    .next { margin-top: 18px; padding: 18px; border-radius: 8px; background: var(--warm); }
    .friction { margin-top: 18px; padding: 18px; border-radius: 8px; background: var(--cool); }
    .ask { margin-top: 8px; font-size: 21px; font-weight: 760; line-height: 1.32; }
    .example, .rule, footer { margin-top: 14px; color: var(--muted); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .ask { font-size: 19px; } }
  </style>
</head>
<body>
  <main>
    <section class="panel">
      <p class="eyebrow">English Learning Harness · Saved Reply</p>
      <h1>답변이 저장됐어요</h1>
      <p class="subtle">${escapeHtml(artifact.learner_rule)}</p>
      <p class="saved">저장됨 · ${escapeHtml(artifact.routed_to.phase)}${artifact.routed_to.day ? ` Day ${escapeHtml(artifact.routed_to.day)}` : ""}</p>
      ${
        hasCoaching
          ? `<h2>오늘 남긴 말하기 증거</h2>
      <div class="grid">
        <div class="line"><strong>전달한 뜻</strong><p>${escapeHtml(artifact.coaching.communicated)}</p></div>
        <div class="line"><strong>자연스럽게 바꾸면</strong><p>${escapeHtml(artifact.coaching.recast)}</p></div>
        <div class="line"><strong>다음에 쓸 표현</strong><p>${escapeHtml(artifact.coaching.next_phrase)}</p></div>
        <div class="line"><strong>다음 작은 초점</strong><p>${escapeHtml(artifact.coaching.next_focus)}</p></div>
      </div>`
          : ""
      }
      ${
        artifact.friction.follow_up_prompt
          ? `<section class="friction" aria-label="friction follow up">
        <h2>짧은 마찰 메모</h2>
        <p>${escapeHtml(artifact.friction.follow_up_prompt)}</p>
      </section>`
          : ""
      }
      ${
        artifact.next_card
          ? `<section class="next" aria-label="next card">
        <h2>다음 카드</h2>
        <p class="subtle">${escapeHtml(artifact.next_card.title)}</p>
        <p class="ask">${escapeHtml(artifact.next_card.ask)}</p>
        ${artifact.next_card.example ? `<p class="example">예시: ${escapeHtml(artifact.next_card.example)}</p>` : ""}
      </section>`
          : ""
      }
      <p class="rule">${escapeHtml(artifact.privacy)}</p>
    </section>
    <footer>${escapeHtml(artifact.claim_boundary)}</footer>
  </main>
</body>
</html>
`,
    "utf8",
  );
  return {
    status: "pass",
    action: "pilot-reply-card",
    jsonPath,
    htmlPath,
    url: pathToFileURL(htmlPath).href,
    learnerFacing,
    claimBoundary,
  };
}

function resolvePilotReplyAnswer(options, nextCardArtifact) {
  const explicitAnswer = transcriptInputs(options).filter(Boolean)[0] || "";
  if (explicitAnswer && !options.quickReply) return { answer: explicitAnswer, quickReply: null };
  if (!options.quickReply) return { answer: explicitAnswer, quickReply: null };

  const selection = String(options.quickReply).trim();
  const quickReplies = nextCardArtifact.quickReplies ?? [];
  const selected =
    quickReplies.find((reply) => reply.id === selection) ??
    (Number.isInteger(Number(selection))
      ? quickReplies[Number(selection) - 1]
      : quickReplies.find((reply) => reply.text === selection));
  if (!selected) {
    throw new Error(`Unknown --quick-reply selection: ${selection}`);
  }
  return {
    answer: selected.text,
    quickReply: {
      selected: selection,
      id: selected.id,
      text: selected.text,
    },
  };
}

function pilotReply(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  const state = readPilotState(paths, date);
  const nextAction = pilotNextAction(state);
  const currentCardArtifact = pilotNext({ learnerRoot: paths.root, date });
  const { answer, quickReply } = resolvePilotReplyAnswer(options, currentCardArtifact);
  if (!answer) {
    throw new Error("pilot-reply requires one --say answer or --quick-reply selection.");
  }
  if (nextAction.command === "pilot-complete") {
    throw new Error("pilot-reply cannot save an answer because the pilot is already complete.");
  }

  const captureOptions = {
    ...options,
    learnerRoot: paths.root,
    date,
    input: [answer],
    transcript: undefined,
  };
  if (nextAction.command === "pilot-capture") {
    captureOptions.phase = nextAction.phase;
    captureOptions.cardId = nextAction.cardId;
  } else if (nextAction.command === "pilot-day") {
    captureOptions.phase = "day";
    captureOptions.day = nextAction.day;
    captureOptions.frictionNote = options.frictionNote || "";
  } else {
    throw new Error(`pilot-reply cannot route next action: ${nextAction.command}`);
  }

  const result = pilotCapture(captureOptions);
  const nextCardArtifact = pilotNext({ learnerRoot: paths.root, date });
  const routedTo = {
    phase: captureOptions.phase,
    cardId: captureOptions.cardId ?? null,
    day: captureOptions.day ?? null,
  };
  const learnerFacing = pilotReplyLearnerFacing({ routedTo, captureResult: result, nextCardArtifact });
  const claimBoundary =
    result.claimBoundary ||
    "This routes the next local pilot answer. It does not prove learning outcomes or pilot completion.";
  const replyCardArtifact = pilotReplyCardArtifact({
    paths,
    date,
    routedTo,
    learnerFacing,
    nextCardArtifact,
    cockpit: result.cockpit,
    claimBoundary,
  });
  return {
    status: "pass",
    action: "pilot-reply",
    routedTo,
    quickReply,
    result,
    summary: result.summary,
    cockpit: result.cockpit,
    nextCardArtifact,
    replyCardArtifact,
    learnerFacing,
    claimBoundary,
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
    conversationGuide: state.baseline ? dayPracticeGuide(1, state) : day0ConversationGuide(),
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
    conversationGuide: pilotNextAction(state).guide,
    state,
  };
}

function learnerFacingNextCard(nextAction) {
  const guide = nextAction.guide ?? {};
  if (nextAction.command === "pilot-capture" && nextAction.phase === "baseline") {
    const cards = guide.cards ?? [];
    const card = cards.find((item) => item.id === nextAction.cardId) ?? guide.firstQuestion ?? {};
    return {
      phase: "baseline",
      day: null,
      title: card.title ?? guide.title ?? "오늘의 영어 스냅샷",
      setup: card.setup ?? guide.opening ?? "",
      ask: card.ask ?? nextAction.prompt,
      example: card.example ?? "",
      learner_rule: guide.learnerRule ?? "한 문장이면 충분합니다.",
      scene_choices: card.sceneChoices ?? guide.sceneChoices ?? [],
    };
  }
  if (nextAction.command === "pilot-day") {
    const card = guide.firstQuestion ?? {};
    return {
      phase: "day",
      day: nextAction.day,
      title: card.title ?? guide.title ?? `Pilot Day ${nextAction.day}`,
      setup: card.setup ?? guide.opening ?? "",
      ask: card.ask ?? nextAction.prompt,
      example: card.example ?? "",
      learner_rule: guide.learnerRule ?? "한 문장이면 충분합니다.",
      scene_choices: card.sceneChoices ?? [],
    };
  }
  if (nextAction.command === "pilot-capture" && nextAction.phase === "final") {
    const cards = guide.cards ?? [];
    const card = cards.find((item) => item.id === nextAction.cardId) ?? cards[0] ?? {};
    return {
      phase: "final",
      day: null,
      title: card.title ?? guide.title ?? "마지막 영어 스냅샷",
      setup: card.setup ?? guide.opening ?? "",
      ask: card.ask ?? nextAction.prompt,
      example: card.example ?? "",
      learner_rule: guide.learnerRule ?? "한 문장이면 충분합니다.",
      scene_choices: card.sceneChoices ?? [],
    };
  }
  return {
    phase: "complete",
    day: null,
    title: "Pilot report ready",
    setup: "",
    ask: nextAction.prompt,
    example: "",
    learner_rule: "로컬 리포트를 먼저 확인합니다.",
    scene_choices: [],
  };
}

function buildPilotAssistantPrompt(nextCard, summary) {
  const progress =
    nextCard.phase === "day" && nextCard.day
      ? `오늘은 실제 연습 ${nextCard.day}일차입니다.`
      : nextCard.phase === "baseline"
        ? "오늘은 현재 말하기 상태를 찍는 짧은 스냅샷입니다."
        : nextCard.phase === "final"
          ? "오늘은 마지막 말하기 스냅샷입니다."
          : "로컬 리포트를 확인할 차례입니다.";
  const lines = [
    progress,
    nextCard.title ? `장면: ${nextCard.title}` : "",
    nextCard.setup ? `상황: ${nextCard.setup}` : "",
    nextCard.scene_choices?.length
      ? `선택 가능한 시작 장면:\n${nextCard.scene_choices
          .map((choice, index) => `${index + 1}. ${choice.label} - ${choice.setup}`)
          .join("\n")}`
      : "",
    nextCard.ask ? `질문: ${nextCard.ask}` : "",
    nextCard.example ? `막히면 이렇게 시작해도 됩니다: ${nextCard.example}` : "",
    nextCard.phase === "complete"
      ? "답변을 새로 만들기보다 로컬 리포트를 먼저 확인하면 됩니다."
      : "답은 영어 한 문장만 보내주세요. 아래 후보 중 하나를 그대로 보내거나 조금 바꿔도 괜찮습니다.",
  ];
  return {
    language: "ko",
    text: lines.filter(Boolean).join("\n"),
    answer_rule:
      nextCard.phase === "complete"
        ? "로컬 리포트를 먼저 확인합니다."
        : "영어 한 문장만 답하면 됩니다. 틀려도 현재 말하기 증거로 충분합니다.",
    after_answer: "Codex가 답변을 내부적으로 저장하고 다음 카드와 cockpit을 갱신합니다.",
    progress: {
      phase: nextCard.phase,
      day: nextCard.day ?? null,
      completed_daily_sessions: summary.completedDailySessions,
      minimum_valid_daily_sessions: summary.minimumValidDailySessions,
    },
  };
}

function buildPilotQuickReplies(nextCard) {
  if (nextCard.phase === "complete") return [];
  const byTitle = {
    "첫 장면 고르기": [
      "I had a quiet day and did a few small tasks.",
      "I just arrived, and this place feels new to me.",
      "I am in a comfortable place with a few things around me.",
    ],
    "잠깐, 무슨 뜻이야?": [
      "Which place do you mean?",
      "Where exactly should we meet?",
      "Do you mean the usual cafe or somewhere else?",
    ],
    "막혔을 때 도망가지 않기": [
      "I do not know the exact word, but I mean a small room.",
      "I do not know the exact word, but I can explain it.",
      "I am not sure of the word, but it is like a quiet place.",
    ],
    "내 주변 스냅샷": [
      "I am in an office with many desks and monitors.",
      "There are chairs, desks, and people working around me.",
      "It looks like a busy office.",
    ],
    "오늘의 체감": [
      "My comfort score is 3 because I can answer slowly.",
      "My comfort score is 2 because I still pause a lot.",
      "My comfort score is 4 because this sentence feels easy.",
    ],
    "확인 질문 만들기": [
      "Which place do you mean?",
      "Where exactly should we meet?",
      "Do you mean the usual cafe or somewhere else?",
    ],
    "말실수 고치기": [
      "Sorry, I meant iced latte, not hot latte.",
      "Sorry, I said that wrong. I meant iced latte.",
      "Actually, I wanted an iced latte.",
    ],
    "보이는 정보 설명하기": [
      "It looks like a meeting room with a long table.",
      "There is a screen on the wall and chairs around the table.",
      "It seems like a quiet office meeting room.",
    ],
    "부드럽게 다르게 말하기": [
      "I understand, but I cannot stay late today.",
      "I get it, but today is difficult for me.",
      "I am sorry, but I need to leave on time today.",
    ],
    "대화를 이어가기": [
      "That sounds nice. Where did you go hiking?",
      "How was the hiking trail?",
      "Did you go there with friends?",
    ],
  };
  const replies = byTitle[nextCard.title] ?? [nextCard.example].filter(Boolean);
  return replies.map((text, index) => ({
    id: `quick-${index + 1}`,
    text,
    note: index === 0 ? "가장 짧고 안전한 답변" : "조금 더 구체적인 변형",
  }));
}

function pilotNext(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  const state = readPilotState(paths, date);
  const summary = pilotStatusSummary(state);
  const nextCard = learnerFacingNextCard(summary.nextAction);
  const assistantPrompt = buildPilotAssistantPrompt(nextCard, summary);
  const quickReplies = buildPilotQuickReplies(nextCard);
  const cockpitSnapshot = pilotCockpitRefresh(paths, date);
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    surface: "learner-facing pilot next card",
    pilot: {
      status: summary.status,
      baseline_ready: summary.baselineReady,
      completed_daily_sessions: summary.completedDailySessions,
      minimum_valid_daily_sessions: summary.minimumValidDailySessions,
      target_days: summary.targetDays,
      ready_to_finish: summary.readyToFinish,
    },
    next_card: nextCard,
    assistant_prompt: assistantPrompt,
    quick_replies: quickReplies,
    answer_rule: "영어 한 문장만 답하면 됩니다. 틀려도 현재 말하기 증거로 충분합니다.",
    after_answer: "Codex가 답변을 내부적으로 저장하고 cockpit/report를 갱신합니다.",
    privacy: "답변 원문은 기본적으로 내 컴퓨터의 학습 기록에만 저장됩니다. 공개 협업 기록에는 올리지 않습니다.",
    cockpit: {
      html: relativeToRoot(paths, cockpitSnapshot.htmlPath),
      url: cockpitSnapshot.url,
    },
    claim_boundary:
      "This card helps continue the local owner/self pilot. It does not prove learning outcomes or pilot completion.",
  };
  const jsonPath = resolve(paths.pilotDir, "pilot-next-card.json");
  const htmlPath = resolve(paths.pilotDir, "pilot-next-card.html");
  writeFileSync(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(nextCard.title)}</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #657067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(760px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; }
    .eyebrow { color: var(--accent); font-weight: 760; font-size: 13px; letter-spacing: 0; text-transform: uppercase; }
    h1 { margin: 8px 0 10px; font-size: clamp(28px, 5vw, 42px); line-height: 1.12; letter-spacing: 0; }
    p { margin: 0; }
    .setup { color: var(--muted); font-size: 16px; }
    .ask { margin-top: 20px; padding: 18px; border-radius: 8px; background: var(--warm); font-size: 22px; font-weight: 760; line-height: 1.32; }
    .prompt { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; }
    .prompt h2 { margin: 0 0 8px; font-size: 16px; letter-spacing: 0; }
    .prompt pre { margin: 0; white-space: pre-wrap; word-break: keep-all; overflow-wrap: anywhere; color: var(--ink); font: inherit; }
    .scenes { margin-top: 18px; }
    .scenes h2 { margin: 0 0 10px; font-size: 16px; letter-spacing: 0; }
    .scene-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .scene { border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 13px; }
    .scene b { display: block; font-size: 15px; }
    .scene span { display: block; margin-top: 5px; color: var(--muted); font-size: 13px; }
    .scene em { display: block; margin-top: 8px; color: var(--ink); font-size: 14px; font-style: normal; overflow-wrap: anywhere; }
    .quick { margin-top: 18px; }
    .quick h2 { margin: 0 0 10px; font-size: 16px; letter-spacing: 0; }
    .quick ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .quick li { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .quick .choice { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: var(--accent); color: #fff; font-weight: 780; }
    .quick strong { display: block; font-size: 16px; overflow-wrap: anywhere; }
    .quick span { display: block; margin-top: 2px; color: var(--muted); font-size: 13px; }
    .copy-reply { appearance: none; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; color: var(--ink); padding: 7px 10px; font: inherit; font-size: 13px; font-weight: 720; cursor: pointer; white-space: nowrap; }
    .copy-reply:focus-visible { outline: 3px solid rgba(47, 125, 85, 0.24); outline-offset: 2px; }
    .example, .rule, .privacy { margin-top: 14px; color: var(--muted); }
    .progress { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fbfcfa; }
    .metric span { display: block; color: var(--muted); font-size: 13px; }
    .metric strong { display: block; margin-top: 2px; font-size: 22px; }
    footer { margin-top: 16px; color: var(--muted); font-size: 13px; }
    @media (max-width: 640px) { .progress, .scene-grid { grid-template-columns: 1fr; } .quick li { grid-template-columns: auto 1fr; } .copy-reply { grid-column: 2; justify-self: start; } .ask { font-size: 19px; } }
  </style>
</head>
<body>
  <main>
    <section class="card">
      <p class="eyebrow">English Learning Harness · Owner Pilot</p>
      <h1>${escapeHtml(nextCard.title)}</h1>
      <p class="setup">${escapeHtml(nextCard.setup)}</p>
      <div class="progress" aria-label="pilot progress">
        <div class="metric"><span>Daily sessions</span><strong>${escapeHtml(summary.completedDailySessions)} / ${escapeHtml(summary.minimumValidDailySessions)}</strong></div>
        <div class="metric"><span>Phase</span><strong>${escapeHtml(nextCard.phase)}</strong></div>
        <div class="metric"><span>Target days</span><strong>${escapeHtml(summary.targetDays)}</strong></div>
      </div>
      <p class="ask">${escapeHtml(nextCard.ask)}</p>
      ${nextCard.example ? `<p class="example">예시: ${escapeHtml(nextCard.example)}</p>` : ""}
      ${
        nextCard.scene_choices?.length
          ? `<section class="scenes" aria-label="opening scene choices">
        <h2>고를 수 있는 시작 장면</h2>
        <div class="scene-grid">
          ${nextCard.scene_choices
            .map(
              (choice, index) => `<article class="scene"><b>${index + 1}. ${escapeHtml(choice.label)}</b><span>${escapeHtml(choice.setup)}</span><em>${escapeHtml(choice.starter)}</em></article>`,
            )
            .join("")}
        </div>
      </section>`
          : ""
      }
      <section class="prompt" aria-label="learner-ready prompt">
        <h2>Codex가 바로 말할 다음 문장</h2>
        <pre>${escapeHtml(assistantPrompt.text)}</pre>
      </section>
      ${
        quickReplies.length
          ? `<section class="quick" aria-label="quick replies">
        <h2>번호로 고를 수 있는 답변 후보</h2>
        <ul>
          ${quickReplies
            .map(
              (reply, index) => `<li><b class="choice" aria-label="${index + 1}번 선택지">${index + 1}</b><div><strong>${escapeHtml(reply.text)}</strong><span>${escapeHtml(reply.note)}</span></div><button class="copy-reply" type="button" data-reply="${escapeHtml(reply.text)}">복사</button></li>`,
            )
            .join("")}
        </ul>
      </section>`
          : ""
      }
      <p class="rule">${escapeHtml(artifact.answer_rule)}</p>
      <p class="privacy">${escapeHtml(artifact.privacy)}</p>
    </section>
    <footer>${escapeHtml(artifact.claim_boundary)}</footer>
  </main>
  <script>
    for (const button of document.querySelectorAll(".copy-reply")) {
      button.addEventListener("click", async () => {
        const text = button.dataset.reply || "";
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "복사됨";
        } catch {
          button.textContent = "선택해서 복사";
        }
      });
    }
  </script>
</body>
</html>
`,
    "utf8",
  );
  return {
    status: "pass",
    action: "pilot-next",
    learnerRoot: paths.root,
    jsonPath,
    htmlPath,
    url: pathToFileURL(htmlPath).href,
    cockpit: cockpitSnapshot,
    nextCard,
    assistantPrompt,
    quickReplies,
    claimBoundary: artifact.claim_boundary,
  };
}

function pilotLaunch(options) {
  const date = options.date || new Date();
  const paths = pilotPaths(options.learnerRoot);
  const next = pilotNext({ ...options, learnerRoot: paths.root, date });
  const status = pilotStatus({ ...options, learnerRoot: paths.root, date });
  const quickReplySummary = next.quickReplies.map((reply, index) => ({
    number: index + 1,
    id: reply.id,
    text: reply.text,
    note: reply.note,
  }));
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    surface: "learner-facing real pilot launch card",
    saved_answer: false,
    pilot: {
      status: status.summary.status,
      baseline_ready: status.summary.baselineReady,
      completed_daily_sessions: status.summary.completedDailySessions,
      minimum_valid_daily_sessions: status.summary.minimumValidDailySessions,
      target_days: status.summary.targetDays,
      final_ready: status.summary.finalReady,
      report_ready: status.summary.reportReady,
    },
    next_card: next.nextCard,
    prompt: next.assistantPrompt,
    quick_replies: quickReplySummary,
    learner_message: [
      status.summary.baselineReady
        ? `현재 실제 말하기 여정은 ${status.summary.completedDailySessions}/${status.summary.minimumValidDailySessions}일차 증거가 저장된 상태입니다.`
        : "아직 첫 스냅샷이 완료되지 않았습니다.",
      "아래 질문에 영어 한 문장만 답하면 됩니다.",
      "번호 후보를 골라도 되고, 직접 바꿔 말해도 됩니다.",
      "이 launch card 자체는 새 답변을 저장하지 않습니다.",
    ].join(" "),
    after_answer:
      "답변을 보내면 Codex가 내부적으로 저장하고 다음 카드, cockpit, report를 갱신합니다.",
    privacy:
      "답변 원문은 기본적으로 내 컴퓨터의 학습 기록에만 저장됩니다. 공개 협업 기록에는 올리지 않습니다.",
    links: {
      cockpit_html: next.cockpit.htmlPath ? relativeToRoot(paths, next.cockpit.htmlPath) : "cockpit.html",
      cockpit_url: next.cockpit.url,
    },
    claim_boundary:
      "This launch card prepares the local owner/self pilot. It does not save a new answer, prove learning outcomes, or complete the pilot.",
  };
  const jsonPath = resolve(paths.pilotDir, "pilot-launch-card.json");
  const htmlPath = resolve(paths.pilotDir, "pilot-launch-card.html");
  writeFileSync(jsonPath, `${JSON.stringify(artifact, null, 2)}\n`);
  writeFileSync(
    htmlPath,
    `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>5일 말하기 여정 시작</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #647067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; --soft: #eef5f0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(860px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0; }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; }
    .eyebrow { color: var(--accent); font-weight: 760; font-size: 13px; letter-spacing: 0; }
    h1 { margin: 8px 0 10px; font-size: clamp(30px, 5vw, 46px); line-height: 1.12; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 17px; letter-spacing: 0; }
    p { margin: 0; }
    .subtle { color: var(--muted); }
    .progress { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fbfcfa; }
    .metric span { display: block; color: var(--muted); font-size: 13px; }
    .metric strong { display: block; margin-top: 2px; font-size: 22px; overflow-wrap: anywhere; }
    .ask { margin-top: 18px; padding: 18px; border-radius: 8px; background: var(--warm); font-size: 22px; font-weight: 760; line-height: 1.32; overflow-wrap: anywhere; }
    .prompt, .quick, .note, .links { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfa; }
    .prompt pre { margin: 0; white-space: pre-wrap; word-break: keep-all; overflow-wrap: anywhere; font: inherit; }
    .quick ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .quick li { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: start; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .quick b { display: inline-grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; background: var(--accent); color: #fff; }
    .quick strong { display: block; overflow-wrap: anywhere; }
    .quick span { display: block; margin-top: 2px; color: var(--muted); font-size: 13px; }
    .note { background: var(--soft); }
    .links { display: grid; gap: 8px; }
    .links a { display: block; padding: 11px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: inherit; text-decoration: none; font-weight: 720; }
    footer { margin-top: 16px; color: var(--muted); font-size: 13px; }
    @media (max-width: 640px) { .progress { grid-template-columns: 1fr; } .ask { font-size: 19px; } }
  </style>
</head>
<body>
  <main>
    <section class="panel">
      <p class="eyebrow">English Learning Harness · 5일 말하기 여정</p>
      <h1>${escapeHtml(next.nextCard.phase === "baseline" ? "첫 스냅샷 시작" : "오늘의 말하기 카드")}</h1>
      <p class="subtle">${escapeHtml(artifact.learner_message)}</p>
      <div class="progress" aria-label="pilot progress">
        <div class="metric"><span>저장된 연습일</span><strong>${escapeHtml(artifact.pilot.completed_daily_sessions)} / ${escapeHtml(artifact.pilot.minimum_valid_daily_sessions)}</strong></div>
        <div class="metric"><span>현재 단계</span><strong>${escapeHtml(next.nextCard.phase)}</strong></div>
        <div class="metric"><span>답변 저장</span><strong>아직 안 됨</strong></div>
      </div>
      <p class="subtle">${escapeHtml(next.nextCard.setup)}</p>
      <p class="ask">${escapeHtml(next.nextCard.ask)}</p>
      ${next.nextCard.example ? `<p class="subtle" style="margin-top: 12px;">예시: ${escapeHtml(next.nextCard.example)}</p>` : ""}
      <section class="prompt" aria-label="ready prompt">
        <h2>Codex가 바로 이어서 물어볼 말</h2>
        <pre>${escapeHtml(next.assistantPrompt.text)}</pre>
      </section>
      ${
        quickReplySummary.length
          ? `<section class="quick" aria-label="quick replies">
        <h2>번호로 고를 수 있는 답변 후보</h2>
        <ul>
          ${quickReplySummary
            .map(
              (reply) => `<li><b>${reply.number}</b><div><strong>${escapeHtml(reply.text)}</strong><span>${escapeHtml(reply.note)}</span></div></li>`,
            )
            .join("")}
        </ul>
      </section>`
          : ""
      }
      <section class="note" aria-label="save boundary">
        <h2>답변하면 저장되는 것</h2>
        <p>${escapeHtml(artifact.after_answer)}</p>
        <p class="subtle" style="margin-top: 8px;">${escapeHtml(artifact.privacy)}</p>
      </section>
      <section class="links" aria-label="related local surfaces">
        <h2>로컬 표면</h2>
        <a href="${escapeHtml(relative(dirname(htmlPath), next.cockpit.htmlPath))}">Cockpit 열기</a>
      </section>
    </section>
    <footer>${escapeHtml(artifact.claim_boundary)}</footer>
  </main>
</body>
</html>
`,
    "utf8",
  );
  return {
    status: "pass",
    action: "pilot-launch",
    learnerRoot: paths.root,
    jsonPath,
    htmlPath,
    url: pathToFileURL(htmlPath).href,
    savedAnswer: false,
    nextCard: next.nextCard,
    assistantPrompt: next.assistantPrompt,
    quickReplies: quickReplySummary,
    cockpit: next.cockpit,
    claimBoundary: artifact.claim_boundary,
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
  const mission = pilotDayMission(dayNumber);
  const practiceResult = practice({
    ...options,
    learnerRoot: paths.root,
    date,
  });
  const dayRecord = {
    day: dayNumber,
    date: date.toISOString(),
    status: "complete",
    session_id: practiceResult.session.id,
    artifact: relativeToRoot(paths, practiceResult.session.artifactPath),
    friction_note: options.frictionNote || "",
    pilot_mission: {
      id: mission.id,
      day: dayNumber,
      title: mission.title,
      target_skill: mission.skill,
      transfer_evidence: mission.evidence,
    },
    learner_coaching: {
      communicated: practiceResult.learnerFacing.today,
      recast: practiceResult.learnerFacing.recast,
      next_phrase: practiceResult.learnerFacing.nextPhrase,
      next_focus: practiceResult.learnerFacing.nextFocus,
      artifact_hint: practiceResult.learnerFacing.artifactHint,
    },
    speaking_backlog_evidence: practiceResult.session.speakingBacklogEvidence,
    aios_artifacts: {
      mission: relativeToRoot(paths, practiceResult.mission.htmlPath),
      scene: relativeToRoot(paths, practiceResult.scene.htmlPath),
      asset_deck: relativeToRoot(paths, practiceResult.assetDeck.htmlPath),
      next_asset_action: practiceResult.assetDeck.topAssetAction,
      learner_report: relativeToRoot(paths, practiceResult.report.htmlPath),
      cockpit: relativeToRoot(paths, practiceResult.cockpit.htmlPath),
    },
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
    session: practiceResult.session,
    practice: practiceResult,
    summary: pilotStatusSummary(state),
    conversationGuide: pilotNextAction(state).guide,
    claimBoundary: state.claim_boundary,
  };
}

function pilotReportMarkdown(report) {
  const artifactBridge = report.aios_artifacts ?? {};
  const bridgeDays = artifactBridge.days ?? [];
  const audit = report.product_journey_audit ?? {};
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
    `- Product decision: ${audit.decision || report.rubric.decision}`,
    `- Evidence complete: ${String(audit.evidence_complete ?? false)}`,
    "",
    "## Rubric Deltas",
    "",
    ...Object.entries(report.rubric.metrics.deltas).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Friction Notes",
    "",
    ...(report.friction_notes.length ? report.friction_notes.map((note) => `- Day ${note.day}: ${note.note}`) : ["- none"]),
    "",
    "## AIOS Artifact Bridge",
    "",
    `- Final learner report: ${artifactBridge.final_learner_report || "none"}`,
    `- Final cockpit: ${artifactBridge.final_cockpit || "none"}`,
    "",
    ...(bridgeDays.length
      ? bridgeDays.map(
          (day) =>
            `- Day ${day.day}: pilot_action=${day.pilot_mission?.target_skill || "none"}; coaching_next=${day.learner_coaching?.next_phrase || "none"}; mission=${day.mission || "none"}; scene=${day.scene || "none"}; asset_deck=${day.asset_deck || "none"}; next_asset=${day.next_asset_action?.asset_id || "none"}; report=${day.learner_report || "none"}; cockpit=${day.cockpit || "none"}`,
        )
      : ["- none"]),
    "",
    "## Product Journey Audit",
    "",
    `- Days with mission/scene/report/cockpit: ${audit.days_with_core_artifacts ?? 0}/${report.daily_session_count}`,
    `- Days with asset deck action: ${audit.days_with_asset_actions ?? 0}/${report.daily_session_count}`,
    `- Days with learner coaching: ${audit.days_with_learner_coaching ?? 0}/${report.daily_session_count}`,
    `- Friction note count: ${audit.friction_note_count ?? 0}`,
    `- Decision: ${audit.decision || report.rubric.decision}`,
    `- Decision reason: ${audit.decision_reason || "none"}`,
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
  const daysWithCoreArtifacts = state.days.filter(
    (day) =>
      day.aios_artifacts?.mission &&
      day.aios_artifacts?.scene &&
      day.aios_artifacts?.learner_report &&
      day.aios_artifacts?.cockpit,
  ).length;
  const daysWithAssetActions = state.days.filter(
    (day) => day.aios_artifacts?.asset_deck && day.aios_artifacts?.next_asset_action?.asset_id,
  ).length;
  const frictionNoteCount = state.days.filter((day) => day.friction_note).length;
  const pilotMissionCount = state.days.filter((day) => day.pilot_mission?.target_skill).length;
  const distinctPilotMissionSkills = [
    ...new Set(state.days.map((day) => day.pilot_mission?.target_skill).filter(Boolean)),
  ];
  const learnerCoachingCount = state.days.filter((day) => day.learner_coaching?.next_phrase).length;
  const evidenceComplete =
    completedDays >= state.minimum_valid_daily_sessions &&
    daysWithCoreArtifacts === completedDays &&
    daysWithAssetActions === completedDays &&
    pilotMissionCount === completedDays &&
    learnerCoachingCount === completedDays &&
    Boolean(state.baseline) &&
    turns.length > 0;
  const productDecision = evidenceComplete ? rubric.decision : "invalid";
  const productJourneyAudit = {
    decision: productDecision,
    decision_reason: evidenceComplete
      ? `Transcript rubric decision is ${rubric.decision}; all completed pilot days have mission, scene, asset deck action, learner report, and cockpit evidence.`
      : "Pilot journey evidence is incomplete; do not make product direction claims.",
    evidence_complete: evidenceComplete,
    daily_session_count: completedDays,
    minimum_valid_daily_sessions: state.minimum_valid_daily_sessions,
    days_with_core_artifacts: daysWithCoreArtifacts,
    days_with_asset_actions: daysWithAssetActions,
    days_with_pilot_mission_metadata: pilotMissionCount,
    distinct_pilot_mission_skills: distinctPilotMissionSkills,
    days_with_learner_coaching: learnerCoachingCount,
    friction_note_count: frictionNoteCount,
    required_decision_set: ["continue", "research", "pivot", "kill_claim", "invalid"],
    blocked_claims: [
      "generalized learning outcomes",
      "retention improvement",
      "realtime voice efficacy",
      "generated-media learning gains",
      "real-world speaking outcome claims",
    ],
  };
  const pilotReport = {
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
    aios_artifacts: {
      days: state.days.map((day) => ({
        day: day.day,
        session_id: day.session_id,
        pilot_mission: day.pilot_mission ?? null,
        learner_coaching: day.learner_coaching ?? null,
        mission: day.aios_artifacts?.mission ?? "",
        scene: day.aios_artifacts?.scene ?? "",
        asset_deck: day.aios_artifacts?.asset_deck ?? "",
        next_asset_action: day.aios_artifacts?.next_asset_action ?? null,
        learner_report: day.aios_artifacts?.learner_report ?? "",
        cockpit: day.aios_artifacts?.cockpit ?? "",
      })),
    },
    product_journey_audit: productJourneyAudit,
    claim_boundary:
      "This owner/self pilot report summarizes one local learner's behavioral evidence. It does not prove generalized fluency or real-world speaking ability.",
  };
  const reportPath = resolve(paths.pilotDir, `pilot-report-${date.toISOString().slice(0, 10)}.json`);
  const reportMarkdownPath = resolve(paths.pilotDir, `pilot-report-${date.toISOString().slice(0, 10)}.md`);
  const learnerReport = report({
    ...options,
    learnerRoot: paths.root,
    date,
  });
  const cockpitReport = cockpit({
    ...options,
    learnerRoot: paths.root,
    date,
  });
  pilotReport.aios_artifacts.final_learner_report = relativeToRoot(paths, learnerReport.reportHtmlPath);
  pilotReport.aios_artifacts.final_cockpit = relativeToRoot(paths, cockpitReport.cockpitPath);
  writeFileSync(reportPath, `${JSON.stringify(pilotReport, null, 2)}\n`);
  writeFileSync(reportMarkdownPath, pilotReportMarkdown(pilotReport));
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
        decision: productDecision,
        pass_signals: rubric.pass_signals,
        product_journey_audit: productJourneyAudit,
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
    claimBoundary: pilotReport.claim_boundary,
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
  if (command === "mission") {
    output(mission(options), options.json);
    return;
  }
  if (command === "scene") {
    output(scene(options), options.json);
    return;
  }
  if (command === "storyboard") {
    output(storyboard(options), options.json);
    return;
  }
  if (command === "asset-deck") {
    output(assetDeck(options), options.json);
    return;
  }
  if (command === "cockpit") {
    output(cockpit(options), options.json);
    return;
  }
  if (command === "report") {
    output(report(options), options.json);
    return;
  }
  if (command === "practice-next") {
    output(practiceNext(options), options.json);
    return;
  }
  if (command === "practice-reply") {
    output(practiceReply(options), options.json);
    return;
  }
  if (command === "practice") {
    output(practice(options), options.json);
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
  if (command === "pilot-launch") {
    output(pilotLaunch(options), options.json);
    return;
  }
  if (command === "pilot-next") {
    output(pilotNext(options), options.json);
    return;
  }
  if (command === "pilot-reply") {
    output(pilotReply(options), options.json);
    return;
  }
  if (command === "pilot-capture") {
    output(pilotCapture(options), options.json);
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
