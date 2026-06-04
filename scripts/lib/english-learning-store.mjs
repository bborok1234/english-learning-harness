import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { relative, resolve } from "node:path";
import { mvpSessionMetricKeys, validateProgress } from "../validate-progress.mjs";
import { defaultScenario, planScenario, scenarioFollowUp, scenarioOpening } from "./scenario-engine.mjs";

export const defaultLearnerRoot = () =>
  resolve(process.env.ENGLISH_LEARNING_HOME || `${homedir()}/english-learning`);

export const todayStamp = (date = new Date()) => date.toISOString().slice(0, 10);

const learnerSkillKeys = ["starts", "follow_ups", "clarification", "repair", "soft_disagreement"];
const reviewIntervals = [1, 3, 7, 14];
const speakingBacklogStatuses = ["open", "in_progress", "passed", "needs_review"];
const interactionEventModalities = ["text", "voice", "image", "video", "realtime"];
const mediationLevels = ["prompt-first", "hint", "recast", "explicit-model", "retry"];
const unsupportedEventClaims = [
  "native speaker",
  "confident with foreigners",
  "guaranteed",
  "fluent",
  "your level",
  "pronunciation score",
];

export function learnerPaths(learnerRoot = defaultLearnerRoot()) {
  const root = resolve(learnerRoot);
  return {
    root,
    profile: resolve(root, "profile.md"),
    progress: resolve(root, "progress.json"),
    learnerModel: resolve(root, "learner-model.json"),
    speakingBacklog: resolve(root, "speaking-backlog.json"),
    vocabulary: resolve(root, "vocabulary.json"),
    reviewQueue: resolve(root, "review-queue.json"),
    journalDir: resolve(root, "journal"),
    artifactDir: resolve(root, "artifacts/sessions"),
    missionArtifactDir: resolve(root, "artifacts/missions"),
    reportArtifactDir: resolve(root, "artifacts/reports"),
    sceneArtifactDir: resolve(root, "artifacts/scenes"),
    assetArtifactDir: resolve(root, "artifacts/assets"),
    storyboardArtifactDir: resolve(root, "artifacts/storyboards"),
    speakingOsDir: resolve(root, "artifacts/speaking-os"),
    weeklyMirrorDir: resolve(root, "artifacts/weekly"),
    learnerHome: resolve(root, "home.html"),
    learnerCockpitState: resolve(root, "cockpit-state.json"),
    learnerCockpit: resolve(root, "cockpit.html"),
  };
}

export function emptyMetrics() {
  return Object.fromEntries(mvpSessionMetricKeys.map((key) => [key, 0]));
}

export function emptyVocabulary() {
  return {
    schema_version: 1,
    known_tokens: [],
    known_phrases: [],
    emerging_tokens: [],
    personal_phrases: [],
  };
}

export function emptyLearnerModel(date = new Date()) {
  return {
    schema_version: 1,
    baseline: {
      created_at: date.toISOString(),
      comfort_rating: 0,
      freeze_triggers: [],
      average_utterance_words: 0,
      repair_phrase_count: 0,
    },
    interaction_skills: {
      starts: { evidence_count: 0 },
      follow_ups: { evidence_count: 0 },
      clarification: { evidence_count: 0 },
      repair: { evidence_count: 0 },
      soft_disagreement: { evidence_count: 0 },
    },
    affect: {
      last_energy: "easy",
      last_confidence_note: "",
    },
  };
}

export function emptyReviewQueue() {
  return {
    schema_version: 1,
    items: [],
  };
}

export function emptySpeakingBacklog() {
  return {
    schema_version: 1,
    items: [],
  };
}

export function ensureLearnerStore(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  mkdirSync(paths.journalDir, { recursive: true });
  mkdirSync(paths.artifactDir, { recursive: true });
  mkdirSync(paths.missionArtifactDir, { recursive: true });
  mkdirSync(paths.reportArtifactDir, { recursive: true });
  mkdirSync(paths.sceneArtifactDir, { recursive: true });
  mkdirSync(paths.assetArtifactDir, { recursive: true });
  mkdirSync(paths.storyboardArtifactDir, { recursive: true });
  mkdirSync(paths.speakingOsDir, { recursive: true });
  mkdirSync(paths.weeklyMirrorDir, { recursive: true });

  if (!existsSync(paths.profile)) {
    writeFileSync(
      paths.profile,
      [
        "# English Learning Profile",
        "",
        "- preferred_name: learner",
        "- primary_motivation: build comfort speaking with an AI partner",
        "- correction_style: gentle recast first",
        "- session_mode: text-first",
        "- familiar_topics: coffee, daily routine, weather",
        "- topics_to_avoid: tests, public ranking",
        "",
      ].join("\n"),
    );
  }

  if (!existsSync(paths.progress)) {
    writeProgress(paths.progress, {
      version: 2,
      mvp_session_metrics: emptyMetrics(),
      monthly_optional_metrics: {},
      sessions: [],
    });
  }

  if (!existsSync(paths.learnerModel)) {
    writeLearnerModel(paths.learnerModel, emptyLearnerModel());
  }

  if (!existsSync(paths.speakingBacklog)) {
    writeSpeakingBacklog(paths.speakingBacklog, emptySpeakingBacklog());
  }

  if (!existsSync(paths.vocabulary)) {
    writeVocabulary(paths.vocabulary, emptyVocabulary());
  }

  if (!existsSync(paths.reviewQueue)) {
    writeReviewQueue(paths.reviewQueue, emptyReviewQueue());
  }

  const progress = readProgress(paths.progress);
  const errors = validateProgress(progress, paths.progress);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }

  readVocabulary(paths.vocabulary);
  readLearnerModel(paths.learnerModel);
  readSpeakingBacklog(paths.speakingBacklog);
  readReviewQueue(paths.reviewQueue);

  return paths;
}

export function readProgress(progressPath) {
  return JSON.parse(readFileSync(progressPath, "utf8"));
}

export function writeProgress(progressPath, progress) {
  const errors = validateProgress(progress, progressPath);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }
  writeFileSync(progressPath, `${JSON.stringify(progress, null, 2)}\n`);
}

function assertObject(value, path, field) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${path}: ${field} must be an object`);
  }
}

export function readLearnerModel(learnerModelPath) {
  const model = JSON.parse(readFileSync(learnerModelPath, "utf8"));
  if (model.schema_version !== 1) {
    throw new Error(`${learnerModelPath}: schema_version must be 1`);
  }
  assertObject(model.baseline, learnerModelPath, "baseline");
  assertObject(model.interaction_skills, learnerModelPath, "interaction_skills");
  assertObject(model.affect, learnerModelPath, "affect");

  if (typeof model.baseline.created_at !== "string" || !model.baseline.created_at) {
    throw new Error(`${learnerModelPath}: baseline.created_at must be a string`);
  }
  if (!Array.isArray(model.baseline.freeze_triggers)) {
    throw new Error(`${learnerModelPath}: baseline.freeze_triggers must be an array`);
  }
  for (const key of ["comfort_rating", "average_utterance_words", "repair_phrase_count"]) {
    if (typeof model.baseline[key] !== "number") {
      throw new Error(`${learnerModelPath}: baseline.${key} must be a number`);
    }
  }

  for (const skill of learnerSkillKeys) {
    assertObject(model.interaction_skills[skill], learnerModelPath, `interaction_skills.${skill}`);
    if (typeof model.interaction_skills[skill].evidence_count !== "number") {
      throw new Error(`${learnerModelPath}: interaction_skills.${skill}.evidence_count must be a number`);
    }
  }
  if (typeof model.affect.last_energy !== "string") {
    throw new Error(`${learnerModelPath}: affect.last_energy must be a string`);
  }
  if (typeof model.affect.last_confidence_note !== "string") {
    throw new Error(`${learnerModelPath}: affect.last_confidence_note must be a string`);
  }
  return model;
}

export function writeLearnerModel(learnerModelPath, learnerModel) {
  const defaults = emptyLearnerModel();
  const normalized = {
    ...defaults,
    ...learnerModel,
    baseline: {
      ...defaults.baseline,
      ...(learnerModel.baseline ?? {}),
      created_at: learnerModel.baseline?.created_at || defaults.baseline.created_at,
      freeze_triggers: learnerModel.baseline?.freeze_triggers ?? defaults.baseline.freeze_triggers,
    },
    interaction_skills: Object.fromEntries(
      learnerSkillKeys.map((skill) => [
        skill,
        {
          evidence_count:
            learnerModel.interaction_skills?.[skill]?.evidence_count ??
            defaults.interaction_skills[skill].evidence_count,
        },
      ]),
    ),
    affect: {
      ...defaults.affect,
      ...(learnerModel.affect ?? {}),
    },
  };
  writeFileSync(learnerModelPath, `${JSON.stringify(normalized, null, 2)}\n`);
  readLearnerModel(learnerModelPath);
}

export function readVocabulary(vocabularyPath) {
  const vocabulary = JSON.parse(readFileSync(vocabularyPath, "utf8"));
  const arrays = ["known_tokens", "known_phrases", "emerging_tokens", "personal_phrases"];
  if (vocabulary.schema_version !== 1) {
    throw new Error(`${vocabularyPath}: schema_version must be 1`);
  }
  for (const key of arrays) {
    if (!Array.isArray(vocabulary[key])) {
      throw new Error(`${vocabularyPath}: ${key} must be an array`);
    }
  }
  return vocabulary;
}

export function writeVocabulary(vocabularyPath, vocabulary) {
  const normalized = {
    ...emptyVocabulary(),
    ...vocabulary,
    known_tokens: uniqueSorted(vocabulary.known_tokens ?? []),
    known_phrases: uniqueSorted(vocabulary.known_phrases ?? []),
    emerging_tokens: uniqueSorted(vocabulary.emerging_tokens ?? []),
    personal_phrases: uniqueSorted(vocabulary.personal_phrases ?? []),
  };
  writeFileSync(vocabularyPath, `${JSON.stringify(normalized, null, 2)}\n`);
}

export function readReviewQueue(reviewQueuePath) {
  const reviewQueue = JSON.parse(readFileSync(reviewQueuePath, "utf8"));
  if (reviewQueue.schema_version !== 1) {
    throw new Error(`${reviewQueuePath}: schema_version must be 1`);
  }
  if (!Array.isArray(reviewQueue.items)) {
    throw new Error(`${reviewQueuePath}: items must be an array`);
  }
  return reviewQueue;
}

export function writeReviewQueue(reviewQueuePath, reviewQueue) {
  writeFileSync(
    reviewQueuePath,
    `${JSON.stringify({ schema_version: 1, items: reviewQueue.items ?? [] }, null, 2)}\n`,
  );
}

function normalizeSpeakingBacklogItem(item, index = 0) {
  const now = new Date().toISOString();
  const normalized = {
    id: item.id || `speaking-skill-${index + 1}`,
    skill: item.skill || "starts",
    label: item.label || "Start one small English turn",
    status: item.status || "open",
    priority: item.priority || "medium",
    created_at: item.created_at || now,
    updated_at: item.updated_at || now,
    source: item.source || "manual",
    diagnosis: item.diagnosis || "",
    target_behavior: item.target_behavior || "",
    drill_prompt: item.drill_prompt || "",
    transfer_test: item.transfer_test || "",
    pass_criteria: item.pass_criteria || "",
    evidence_count: item.evidence_count ?? 0,
    attempts: Array.isArray(item.attempts) ? item.attempts : [],
  };
  if (!learnerSkillKeys.includes(normalized.skill)) {
    throw new Error(`speaking-backlog.json: invalid skill ${normalized.skill}`);
  }
  if (!speakingBacklogStatuses.includes(normalized.status)) {
    throw new Error(`speaking-backlog.json: invalid status ${normalized.status}`);
  }
  return normalized;
}

export function readSpeakingBacklog(speakingBacklogPath) {
  const backlog = JSON.parse(readFileSync(speakingBacklogPath, "utf8"));
  if (backlog.schema_version !== 1) {
    throw new Error(`${speakingBacklogPath}: schema_version must be 1`);
  }
  if (!Array.isArray(backlog.items)) {
    throw new Error(`${speakingBacklogPath}: items must be an array`);
  }
  return {
    schema_version: 1,
    items: backlog.items.map(normalizeSpeakingBacklogItem),
  };
}

export function writeSpeakingBacklog(speakingBacklogPath, speakingBacklog) {
  const normalized = {
    schema_version: 1,
    items: (speakingBacklog.items ?? []).map(normalizeSpeakingBacklogItem),
  };
  writeFileSync(speakingBacklogPath, `${JSON.stringify(normalized, null, 2)}\n`);
  readSpeakingBacklog(speakingBacklogPath);
}

export function readProfile(profilePath) {
  return readFileSync(profilePath, "utf8");
}

export function writeProfile(learnerRoot, profile) {
  const paths = ensureLearnerStore(learnerRoot);
  const lines = [
    "# English Learning Profile",
    "",
    `- preferred_name: ${profile.preferredName || "learner"}`,
    `- primary_motivation: ${profile.motivation || "build comfort speaking with an AI partner"}`,
    `- correction_style: ${profile.correctionStyle || "gentle recast first"}`,
    `- session_mode: ${profile.sessionMode || "text-first"}`,
    `- familiar_topics: ${profile.familiarTopics || "coffee, daily routine, weather"}`,
    `- topics_to_avoid: ${profile.topicsToAvoid || "tests, public ranking"}`,
    "",
  ];
  writeFileSync(paths.profile, lines.join("\n"));
  return paths.profile;
}

export function extractEnglishTokens(learnerTurns) {
  const utteranceText = learnerTurns.join(" ").trim();
  const tokens = utteranceText ? utteranceText.split(/\s+/).filter(Boolean) : [];
  return tokens
    .filter((token) => /[A-Za-z]/.test(token))
    .map((token) => token.toLowerCase().replace(/[^a-z']/g, ""))
    .filter(Boolean);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function knownVocabularyTokenSet(vocabulary = emptyVocabulary()) {
  return new Set([...(vocabulary.known_tokens ?? []), ...(vocabulary.emerging_tokens ?? [])]);
}

export function estimateSessionMetrics(learnerTurns, options = {}) {
  const utteranceText = learnerTurns.join(" ").trim();
  const tokens = utteranceText ? utteranceText.split(/\s+/).filter(Boolean) : [];
  const englishTokens = extractEnglishTokens(learnerTurns);
  const uniqueEnglish = new Set(englishTokens);
  const knownTokens = knownVocabularyTokenSet(options.vocabulary);
  const newEnglish = [...uniqueEnglish].filter((token) => !knownTokens.has(token));

  return {
    attendance: learnerTurns.length > 0 ? 1 : 0,
    english_word_ratio: tokens.length ? Number((englishTokens.length / tokens.length).toFixed(3)) : 0,
    new_vocabulary_count: Math.min(newEnglish.length, 5),
    utterance_word_count: englishTokens.length,
    voluntary_speaking_seconds: englishTokens.length ? Math.max(5, Math.round(englishTokens.length * 0.45)) : 0,
  };
}

function addMetricTotals(current, sessionMetrics) {
  return {
    attendance: (current.attendance ?? 0) + sessionMetrics.attendance,
    english_word_ratio: sessionMetrics.english_word_ratio,
    new_vocabulary_count: (current.new_vocabulary_count ?? 0) + sessionMetrics.new_vocabulary_count,
    utterance_word_count: (current.utterance_word_count ?? 0) + sessionMetrics.utterance_word_count,
    voluntary_speaking_seconds:
      (current.voluntary_speaking_seconds ?? 0) + sessionMetrics.voluntary_speaking_seconds,
  };
}

export function buildMiniMirror(learnerTurns, scenario = defaultScenario()) {
  const firstTurn = learnerTurns[0] || "I want to practice English.";
  const lastTurn = learnerTurns.at(-1) || firstTurn;
  const recast = recastUtterance(lastTurn);
  return {
    communicated: `You communicated a real daily idea: "${firstTurn}"`,
    recast,
    pattern: scenario.pattern,
    reviewPhrase: recast,
    retryPrompt: scenario.retry_prompt,
    nextPhrase: recast,
  };
}

function eventId(sessionId, index) {
  return `${sessionId}-event-${index + 1}`;
}

function inferTroubleSource(session, learnerOutput) {
  if (session.scenario?.due_review?.text) return "needs saved phrase reuse in context";
  if (session.scenario?.cefr_skill === "repair") return "missing word or stuck moment";
  if (session.scenario?.cefr_skill === "clarification") return "unclear intended meaning";
  if (/\b(korean|hangul|[가-힣])\b/i.test(learnerOutput)) return "needs bridge from Korean to English";
  return "needs more natural phrasing";
}

function transferTargetsForScenario(scenario = {}) {
  const skill = scenario.cefr_skill || "conversation";
  if (skill === "repair") return ["stuck moment", "daily explanation", "work chat"];
  if (skill === "clarification") return ["planning conversation", "misunderstanding repair", "follow-up question"];
  if (skill === "turn-taking") return ["small talk", "daily routine", "friendly check-in"];
  return ["personal opinion", "recommendation", "casual conversation"];
}

export function buildInteractionEvents(session, options = {}) {
  const learnerTurns = session.learner_turns ?? [];
  return learnerTurns.map((learnerOutput, index) => {
    const retryOutput = index === learnerTurns.length - 1
      ? session.mirror?.recast ?? learnerOutput
      : learnerTurns[index + 1];
    const event = {
      schema_version: 1,
      event_id: eventId(session.id, index),
      modality: options.modality || (session.mode === "text-first" ? "text" : session.mode),
      scenario_id: session.scenario?.id ?? "",
      learner_intent: session.scenario?.goal ?? "complete a small English interaction",
      learner_output: learnerOutput,
      trouble_source: inferTroubleSource(session, learnerOutput),
      mediation_level: "recast",
      repair_move: session.mirror?.pattern
        ? `Try the pattern: ${session.mirror.pattern}`
        : "Try one clearer version.",
      retry_output: retryOutput,
      saved_phrase: session.mirror?.reviewPhrase ?? session.mirror?.recast ?? retryOutput,
      transfer_targets: transferTargetsForScenario(session.scenario),
      claim_boundary:
        "This event records local interaction evidence only. It does not prove real-world fluency.",
    };
    if (options.sourceArtifact) {
      event.source_artifact = options.sourceArtifact;
    }
    return event;
  });
}

function assertNonEmptyString(value, field, source) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${source}: ${field} must be a non-empty string`);
  }
}

function assertNoUnsupportedEventClaims(event, source) {
  const text = JSON.stringify(event).toLowerCase();
  for (const claim of unsupportedEventClaims) {
    if (text.includes(claim)) {
      throw new Error(`${source}: unsupported learning claim appeared: ${claim}`);
    }
  }
}

export function validateInteractionEvent(event, source = "interaction_event") {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error(`${source}: event must be an object`);
  }
  if (event.schema_version !== 1) {
    throw new Error(`${source}: schema_version must be 1`);
  }
  assertNonEmptyString(event.event_id, "event_id", source);
  if (!interactionEventModalities.includes(event.modality)) {
    throw new Error(`${source}: modality must be one of ${interactionEventModalities.join(", ")}`);
  }
  for (const field of [
    "scenario_id",
    "learner_intent",
    "learner_output",
    "trouble_source",
    "repair_move",
    "retry_output",
    "saved_phrase",
    "claim_boundary",
  ]) {
    assertNonEmptyString(event[field], field, source);
  }
  if (!mediationLevels.includes(event.mediation_level)) {
    throw new Error(`${source}: mediation_level must be one of ${mediationLevels.join(", ")}`);
  }
  if (!Array.isArray(event.transfer_targets) || event.transfer_targets.length === 0) {
    throw new Error(`${source}: transfer_targets must be a non-empty array`);
  }
  for (const [index, target] of event.transfer_targets.entries()) {
    assertNonEmptyString(target, `transfer_targets[${index}]`, source);
  }
  assertNoUnsupportedEventClaims(event, source);
  return event;
}

export function validateInteractionEvents(events, source = "interaction_events") {
  if (!Array.isArray(events)) {
    throw new Error(`${source}: must be an array`);
  }
  for (const [index, event] of events.entries()) {
    validateInteractionEvent(event, `${source}[${index}]`);
  }
  return events;
}

export function recastUtterance(text) {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (/today morning coffee/i.test(normalized)) {
    return "I had coffee this morning.";
  }
  if (/i like coffee/i.test(normalized)) {
    return "I like drinking coffee.";
  }
  if (!normalized) {
    return "I want to practice a little today.";
  }
  return normalized.endsWith(".") ? normalized : `${normalized}.`;
}

export function buildSession(learnerTurns, options = {}) {
  const scenario = options.scenario || defaultScenario();
  const opening = options.opening
    ? `${options.opening}\n\n${scenarioOpening(scenario)}`
    : scenarioOpening(scenario);
  const turns = [];
  turns.push({
    role: "assistant",
    text: opening,
  });

  for (const learnerText of learnerTurns) {
    const recast = recastUtterance(learnerText);
    turns.push({ role: "learner", text: learnerText });
    turns.push({
      role: "assistant",
      text: scenarioFollowUp(scenario, recast),
    });
  }

  const mirror = buildMiniMirror(learnerTurns, scenario);
  turns.push({
    role: "assistant",
    text: [
      "Mini mirror:",
      `오늘 전달한 것: ${mirror.communicated}`,
      `자연스럽게 바꾸면: ${mirror.recast}`,
      `오늘의 패턴: ${mirror.pattern}`,
      `내 문장으로 저장: ${mirror.reviewPhrase}`,
      `작게 다시 말해보기: ${mirror.retryPrompt}`,
    ].join("\n"),
  });

  const session = {
    id: options.sessionId || `${todayStamp()}-${Date.now()}`,
    mode: options.mode || "text-first",
    scenario: {
      id: scenario.id,
      title: scenario.title,
      mode: scenario.mode,
      goal: scenario.goal,
      role_context: scenario.role_context,
      cefr_skill: scenario.cefr_skill,
      rescue_phrase: scenario.rescue_phrase,
      retry_prompt: scenario.retry_prompt,
      due_review: scenario.due_review,
      speaking_backlog: scenario.speaking_backlog,
      selection_reason: options.selectionReason || scenario.selection_reason || {
        source: "unspecified",
      },
    },
    learner_turns: learnerTurns,
    turns,
    mirror,
    session_metrics: estimateSessionMetrics(learnerTurns),
  };
  session.interaction_events = buildInteractionEvents(session, {
    modality: options.modality,
    sourceArtifact: options.sourceArtifact,
  });
  validateInteractionEvents(session.interaction_events, "session.interaction_events");
  return session;
}

function reviewItemId(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `phrase-${slug || "review"}`;
}

function nextDayIso(date) {
  const due = new Date(date.getTime());
  due.setUTCDate(due.getUTCDate() + 1);
  return due.toISOString();
}

function addDaysIso(date, days) {
  const due = new Date(date.getTime());
  due.setUTCDate(due.getUTCDate() + days);
  return due.toISOString();
}

function updateVocabulary(vocabulary, session) {
  const tokens = uniqueSorted(extractEnglishTokens(session.learner_turns));
  const knownBefore = knownVocabularyTokenSet(vocabulary);
  const newTokens = tokens.filter((token) => !knownBefore.has(token));
  const repeatedTokens = tokens.filter((token) => knownBefore.has(token));
  const reviewPhrase = session.mirror.reviewPhrase || session.mirror.recast;

  return {
    vocabulary: {
      ...vocabulary,
      emerging_tokens: uniqueSorted([...(vocabulary.emerging_tokens ?? []), ...newTokens]),
      personal_phrases: uniqueSorted([...(vocabulary.personal_phrases ?? []), reviewPhrase]),
    },
    evidence: {
      tokens,
      new_tokens: newTokens,
      repeated_tokens: repeatedTokens,
      review_phrase: reviewPhrase,
    },
  };
}

function updateReviewQueue(reviewQueue, session, reviewPhrase, date) {
  const existing = reviewQueue.items.find((item) => item.text === reviewPhrase);
  if (existing) {
    return {
      reviewQueue,
      scheduledReviewId: existing.id,
      scheduled: false,
    };
  }

  const item = {
    id: reviewItemId(reviewPhrase),
    type: "phrase",
    text: reviewPhrase,
    source_session_id: session.id,
    due_at: nextDayIso(date),
    interval_days: 1,
    success_count: 0,
  };

  return {
    reviewQueue: {
      schema_version: 1,
      items: [...reviewQueue.items, item],
    },
    scheduledReviewId: item.id,
    scheduled: true,
  };
}

function reviewPrompt(item) {
  return `Use this phrase in one tiny real-life context: "${item.text}"`;
}

function reviewIntervalAfterSuccess(successCount) {
  return reviewIntervals[Math.min(successCount, reviewIntervals.length - 1)];
}

function decorateReviewItem(item) {
  return {
    ...item,
    prompt: reviewPrompt(item),
  };
}

export function listDueReviewItems(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const now = date.getTime();
  return reviewQueue.items
    .filter((item) => Number.isFinite(Date.parse(item.due_at)) && Date.parse(item.due_at) <= now)
    .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at))
    .map(decorateReviewItem);
}

export function markReviewItem(learnerRoot, reviewId, result, date = new Date()) {
  if (!["success", "fail"].includes(result)) {
    throw new Error("review result must be success or fail");
  }

  const paths = ensureLearnerStore(learnerRoot);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const item = reviewQueue.items.find((entry) => entry.id === reviewId);
  if (!item) {
    throw new Error(`review item not found: ${reviewId}`);
  }

  const nextSuccessCount = result === "success" ? (item.success_count ?? 0) + 1 : 0;
  const nextIntervalDays = result === "success" ? reviewIntervalAfterSuccess(nextSuccessCount) : 1;
  const nextItem = {
    ...item,
    interval_days: nextIntervalDays,
    success_count: nextSuccessCount,
    due_at: addDaysIso(date, nextIntervalDays),
    last_reviewed_at: date.toISOString(),
    last_result: result,
  };
  writeReviewQueue(paths.reviewQueue, {
    schema_version: 1,
    items: reviewQueue.items.map((entry) => (entry.id === reviewId ? nextItem : entry)),
  });

  return decorateReviewItem(nextItem);
}

export function phraseVault(learnerRoot = defaultLearnerRoot()) {
  const paths = ensureLearnerStore(learnerRoot);
  const vocabulary = readVocabulary(paths.vocabulary);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const reviewByText = new Map(reviewQueue.items.map((item) => [item.text, item]));
  return uniqueSorted(vocabulary.personal_phrases).map((text) => {
    const review = reviewByText.get(text);
    return {
      text,
      review_id: review?.id ?? "",
      due_at: review?.due_at ?? "",
      prompt: review ? reviewPrompt(review) : `Use this phrase in one tiny real-life context: "${text}"`,
    };
  });
}

function speakingBacklogItemId(skill) {
  return `speaking-${skill.replaceAll("_", "-")}`;
}

function skillDiagnosisTemplate(skill) {
  const templates = {
    starts: {
      label: "Start a useful English turn",
      target_behavior: "Start with one complete low-pressure English sentence.",
      drill_prompt: "Say one small thing about today in English.",
      transfer_test: "Can you start without waiting for a model sentence?",
      pass_criteria: "Learner produces at least one English turn.",
      priority: "medium",
    },
    follow_ups: {
      label: "Keep a follow-up going",
      target_behavior: "Add one extra detail after the first answer.",
      drill_prompt: "Answer, then add one because/when/where detail.",
      transfer_test: "Can you add one extra detail without a new full prompt?",
      pass_criteria: "Learner produces more than one turn or adds a clear detail.",
      priority: "medium",
    },
    clarification: {
      label: "Ask for clarification",
      target_behavior: "Use a clarification phrase when meaning is unclear.",
      drill_prompt: "Ask one clarification question before answering.",
      transfer_test: "Can you ask what the other person means?",
      pass_criteria: "Learner uses a question or clarification phrase.",
      priority: "high",
    },
    repair: {
      label: "Repair a stuck moment",
      target_behavior: "Keep speaking with a rescue phrase when a word is missing.",
      drill_prompt: "Use: I don't know how to say it, but + simple idea.",
      transfer_test: "Can you continue after getting stuck?",
      pass_criteria: "Learner uses a repair phrase such as I don't know how to say it, but / I mean / what I want to say is.",
      priority: "high",
    },
    soft_disagreement: {
      label: "Disagree softly",
      target_behavior: "Disagree or qualify an opinion without sounding abrupt.",
      drill_prompt: "Use: I see your point, but...",
      transfer_test: "Can you soften a different opinion?",
      pass_criteria: "Learner uses but/however/not really/I see your point.",
      priority: "medium",
    },
  };
  return templates[skill] || templates.starts;
}

function diagnoseSkills(learnerTurns) {
  const text = learnerTurns.join(" ").trim();
  const englishTokens = extractEnglishTokens(learnerTurns);
  const hasKorean = /[가-힣]/.test(text);
  const skills = new Set();
  if (hasKorean || /\b(i don't know how to say|dont know how to say|stuck|i mean|what i want to say)\b/i.test(text)) {
    skills.add("repair");
  }
  if (/\?|\b(could you repeat|what does|do you mean|can you explain)\b/i.test(text)) {
    skills.add("clarification");
  }
  if (/\b(however|not really|i see your point|i don't think|i dont think)\b/i.test(text)) {
    skills.add("soft_disagreement");
  }
  if (learnerTurns.length > 1 || /\b(because|when|where|also|and then)\b/i.test(text)) {
    skills.add("follow_ups");
  }
  if (englishTokens.length <= 6) {
    skills.add("starts");
  }
  if (!skills.size) {
    skills.add("follow_ups");
  }
  const priority = ["repair", "clarification", "soft_disagreement", "follow_ups", "starts"];
  return priority.filter((skill) => skills.has(skill));
}

function upsertSpeakingBacklogItem(backlog, diagnosis, date) {
  const template = skillDiagnosisTemplate(diagnosis.skill);
  const id = speakingBacklogItemId(diagnosis.skill);
  const existing = backlog.items.find((item) => item.id === id);
  const timestamp = date.toISOString();
  const base = {
    id,
    skill: diagnosis.skill,
    ...template,
    status: existing?.status === "passed" ? "needs_review" : existing?.status || "open",
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
    source: "diagnose",
    diagnosis: diagnosis.reason,
    evidence_count: existing?.evidence_count ?? 0,
    attempts: existing?.attempts ?? [],
  };
  if (existing) {
    return {
      backlog: {
        schema_version: 1,
        items: backlog.items.map((item) => (item.id === id ? normalizeSpeakingBacklogItem(base) : item)),
      },
      item: normalizeSpeakingBacklogItem(base),
      created: false,
    };
  }
  return {
    backlog: {
      schema_version: 1,
      items: [normalizeSpeakingBacklogItem(base), ...backlog.items],
    },
    item: normalizeSpeakingBacklogItem(base),
    created: true,
  };
}

export function diagnoseSpeakingSample(learnerRoot, learnerTurns, date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  let backlog = readSpeakingBacklog(paths.speakingBacklog);
  const skills = diagnoseSkills(learnerTurns);
  const diagnoses = skills.map((skill) => ({
    skill,
    reason: `Detected ${skill.replaceAll("_", " ")} practice need from ${learnerTurns.length} learner turn(s).`,
    sample: learnerTurns,
  }));
  const updates = [];
  for (const diagnosis of diagnoses) {
    const updated = upsertSpeakingBacklogItem(backlog, diagnosis, date);
    backlog = updated.backlog;
    updates.push(updated);
  }
  writeSpeakingBacklog(paths.speakingBacklog, backlog);
  const primaryUpdate = updates[0];
  const primaryDiagnosis = diagnoses[0];
  const artifactPath = resolve(paths.speakingOsDir, `diagnosis-${todayStamp(date)}-${date.getTime()}.json`);
  const artifact = {
    schema_version: 1,
    generated_at: date.toISOString(),
    diagnosis: primaryDiagnosis,
    diagnoses,
    backlog_item: primaryUpdate.item,
    backlog_items: updates.map((update) => update.item),
    created: primaryUpdate.created,
    created_count: updates.filter((update) => update.created).length,
    claim_boundary:
      "This is a local heuristic speaking-skill diagnosis. It assigns practice work; it does not measure real-world fluency.",
  };
  writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
  return {
    learnerRoot: paths.root,
    backlogPath: paths.speakingBacklog,
    artifactPath,
    diagnosis: primaryDiagnosis,
    diagnoses,
    backlogItem: primaryUpdate.item,
    backlogItems: updates.map((update) => update.item),
    created: primaryUpdate.created,
    createdCount: artifact.created_count,
    claimBoundary: artifact.claim_boundary,
  };
}

export function listSpeakingBacklog(learnerRoot = defaultLearnerRoot()) {
  const paths = ensureLearnerStore(learnerRoot);
  const backlog = readSpeakingBacklog(paths.speakingBacklog);
  return backlog.items.sort((a, b) => {
    const statusRank = { needs_review: 0, open: 1, in_progress: 2, passed: 3 };
    const priorityRank = { high: 0, medium: 1, low: 2 };
    const skillRank = { repair: 0, clarification: 1, soft_disagreement: 2, follow_ups: 3, starts: 4 };
    return (
      (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) ||
      (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) ||
      (skillRank[a.skill] ?? 9) - (skillRank[b.skill] ?? 9) ||
      a.updated_at.localeCompare(b.updated_at)
    );
  });
}

export function nextSpeakingBacklogItem(learnerRoot = defaultLearnerRoot()) {
  return listSpeakingBacklog(learnerRoot).find((item) => ["open", "needs_review", "in_progress"].includes(item.status)) || null;
}

function transferTestPassed(session, item) {
  const text = learnerText(session);
  if (!text.trim()) return false;
  if (item.skill === "starts") return extractEnglishTokens(session.learner_turns).length > 0;
  if (item.skill === "follow_ups") {
    return (session.learner_turns ?? []).length > 1 || /\b(because|when|where|also|and then)\b/i.test(text);
  }
  if (item.skill === "clarification") {
    return /\?|\b(could you repeat|what does|do you mean|can you explain|what do you mean)\b/i.test(text);
  }
  if (item.skill === "repair") {
    return /\b(i don't know how to say|dont know how to say|i mean|what i want to say|let me try again)\b/i.test(text);
  }
  if (item.skill === "soft_disagreement") {
    return /\b(however|not really|i see your point|i don't think|i dont think)\b/i.test(text);
  }
  return false;
}

function updateSpeakingBacklogFromSession(paths, session, date) {
  const itemId = session.scenario?.selection_reason?.speaking_backlog_item_id;
  if (!itemId) return null;
  const backlog = readSpeakingBacklog(paths.speakingBacklog);
  const item = backlog.items.find((entry) => entry.id === itemId);
  if (!item) return null;
  const passed = transferTestPassed(session, item);
  const attempt = {
    session_id: session.id,
    at: date.toISOString(),
    scenario_id: session.scenario?.id ?? "",
    result: passed ? "pass" : "needs_review",
    learner_turns: session.learner_turns ?? [],
  };
  const nextItem = normalizeSpeakingBacklogItem({
    ...item,
    status: passed ? "passed" : "needs_review",
    updated_at: date.toISOString(),
    evidence_count: item.evidence_count + (passed ? 1 : 0),
    attempts: [...(item.attempts ?? []), attempt],
  });
  writeSpeakingBacklog(paths.speakingBacklog, {
    schema_version: 1,
    items: backlog.items.map((entry) => (entry.id === itemId ? nextItem : entry)),
  });
  return {
    item_id: itemId,
    skill: nextItem.skill,
    result: attempt.result,
    status: nextItem.status,
    evidence_count: nextItem.evidence_count,
    transfer_test: nextItem.transfer_test,
    pass_criteria: nextItem.pass_criteria,
  };
}

function learnerText(session) {
  return (session.learner_turns ?? []).join(" ").toLowerCase();
}

function detectSkillEvidence(session) {
  const text = learnerText(session);
  const skills = new Set();
  if ((session.learner_turns ?? []).length > 0) skills.add("starts");
  if ((session.learner_turns ?? []).length > 1 || session.scenario?.cefr_skill === "turn-taking") {
    skills.add("follow_ups");
  }
  if (
    session.scenario?.cefr_skill === "clarification" ||
    /\b(what i want to say|i mean|clarify|can you say|what does)\b/i.test(text)
  ) {
    skills.add("clarification");
  }
  if (
    session.scenario?.cefr_skill === "repair" ||
    /\b(i don't know how to say|dont know how to say|i mean|rescue|stuck)\b/i.test(text)
  ) {
    skills.add("repair");
  }
  if (/\b(but|however|not really|i don't think|i dont think)\b/i.test(text)) {
    skills.add("soft_disagreement");
  }
  return [...skills];
}

function updateLearnerModel(learnerModel, session, options = {}) {
  const evidenceSkills = detectSkillEvidence(session);
  const nextModel = {
    ...learnerModel,
    baseline: {
      ...learnerModel.baseline,
    },
    interaction_skills: Object.fromEntries(
      learnerSkillKeys.map((skill) => [
        skill,
        { evidence_count: learnerModel.interaction_skills[skill].evidence_count },
      ]),
    ),
    affect: {
      ...learnerModel.affect,
    },
  };

  for (const skill of evidenceSkills) {
    nextModel.interaction_skills[skill].evidence_count += 1;
  }

  const previousSessionCount = options.previousSessionCount ?? 0;
  const totalSessions = previousSessionCount + 1;
  const previousAverage = learnerModel.baseline.average_utterance_words ?? 0;
  const currentWords = session.session_metrics?.utterance_word_count ?? 0;
  nextModel.baseline.average_utterance_words = Number(
    (((previousAverage * previousSessionCount) + currentWords) / totalSessions).toFixed(2),
  );
  nextModel.baseline.repair_phrase_count = options.personalPhraseCount ?? 0;
  nextModel.affect.last_energy = session.scenario?.mode || learnerModel.affect.last_energy || "easy";
  nextModel.affect.last_confidence_note = `completed scenario: ${session.scenario?.id || "unknown"}`;

  return {
    learnerModel: nextModel,
    evidence: {
      updated_skills: evidenceSkills,
      average_utterance_words: nextModel.baseline.average_utterance_words,
      repair_phrase_count: nextModel.baseline.repair_phrase_count,
    },
  };
}

export function persistSession(learnerRoot, session, date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const stamp = todayStamp(date);
  const artifactPath = resolve(paths.artifactDir, `${session.id}.json`);
  const journalPath = resolve(paths.journalDir, `${stamp}.md`);
  const relativeArtifactPath = relative(paths.root, artifactPath);

  const vocabulary = readVocabulary(paths.vocabulary);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const progress = readProgress(paths.progress);
  const vocabularyUpdate = updateVocabulary(vocabulary, session);
  const reviewQueueUpdate = updateReviewQueue(
    reviewQueue,
    session,
    vocabularyUpdate.evidence.review_phrase,
    date,
  );

  session.date = stamp;
  session.session_metrics = estimateSessionMetrics(session.learner_turns, {
    vocabulary,
  });
  session.vocabulary_evidence = {
    ...vocabularyUpdate.evidence,
    scheduled_review_id: reviewQueueUpdate.scheduledReviewId,
    scheduled_review_created: reviewQueueUpdate.scheduled,
  };
  const learnerModelUpdate = updateLearnerModel(learnerModel, session, {
    previousSessionCount: Array.isArray(progress.sessions) ? progress.sessions.length : 0,
    personalPhraseCount: vocabularyUpdate.vocabulary.personal_phrases.length,
  });
  session.learner_model_evidence = learnerModelUpdate.evidence;
  session.speaking_backlog_evidence = updateSpeakingBacklogFromSession(paths, session, date);

  writeLearnerModel(paths.learnerModel, learnerModelUpdate.learnerModel);
  writeVocabulary(paths.vocabulary, vocabularyUpdate.vocabulary);
  writeReviewQueue(paths.reviewQueue, reviewQueueUpdate.reviewQueue);
  writeFileSync(artifactPath, `${JSON.stringify(session, null, 2)}\n`);

  progress.mvp_session_metrics = addMetricTotals(
    progress.mvp_session_metrics ?? emptyMetrics(),
    session.session_metrics,
  );
  progress.sessions = Array.isArray(progress.sessions) ? progress.sessions : [];
  progress.sessions.push({
    id: session.id,
    date: stamp,
    mode: session.mode,
    artifact: relativeArtifactPath,
    session_metrics: session.session_metrics,
  });
  progress.last_session_at = date.toISOString();
  writeProgress(paths.progress, progress);

  const journalEntry = [
    `## ${stamp} ${session.id}`,
    "",
    `Mode: ${session.mode}`,
    `Artifact: ${relativeArtifactPath}`,
    "",
    "### Scenario",
    `- Goal: ${session.scenario.goal}`,
    `- Context: ${session.scenario.role_context}`,
    `- Rescue phrase: ${session.scenario.rescue_phrase}`,
    "",
    "### Learner turns",
    ...session.learner_turns.map((turn) => `- ${turn}`),
    "",
    "### Mini mirror",
    `- 오늘 전달한 것: ${session.mirror.communicated}`,
    `- 자연스럽게 바꾸면: ${session.mirror.recast}`,
    `- 오늘의 패턴: ${session.mirror.pattern}`,
    `- 내 문장으로 저장: ${session.mirror.reviewPhrase}`,
    `- 작게 다시 말해보기: ${session.mirror.retryPrompt}`,
    "",
  ].join("\n");

  const existing = existsSync(journalPath) ? readFileSync(journalPath, "utf8") : `# ${stamp}\n\n`;
  writeFileSync(journalPath, `${existing.trimEnd()}\n\n${journalEntry}`);

  return {
    learnerRoot: paths.root,
    progressPath: paths.progress,
    journalPath,
    artifactPath,
    relativeArtifactPath,
    session,
  };
}

export function latestJournalPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.journalDir)) return "";
  const entries = readdirSync(paths.journalDir)
    .filter((entry) => entry.endsWith(".md"))
    .sort();
  return entries.length ? resolve(paths.journalDir, entries.at(-1)) : "";
}

export function latestWeeklyMirrorPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.weeklyMirrorDir)) return "";
  const entries = readdirSync(paths.weeklyMirrorDir)
    .filter((entry) => entry.endsWith(".json"))
    .sort();
  return entries.length ? resolve(paths.weeklyMirrorDir, entries.at(-1)) : "";
}

function readSessionArtifacts(paths, progress) {
  const sessions = Array.isArray(progress.sessions) ? progress.sessions : [];
  return sessions
    .map((session) => {
      const artifactPath = resolve(paths.root, session.artifact ?? "");
      if (!existsSync(artifactPath)) return null;
      return JSON.parse(readFileSync(artifactPath, "utf8"));
    })
    .filter(Boolean);
}

function weakestLearnerSkill(learnerModel) {
  return learnerSkillKeys
    .map((skill) => ({
      skill,
      count: learnerModel.interaction_skills[skill]?.evidence_count ?? 0,
    }))
    .sort((a, b) => a.count - b.count)[0];
}

function uniqueRecent(values, limit = 5) {
  return [...new Set(values.filter(Boolean))].slice(-limit);
}

function interactionEventsFromArtifacts(artifacts) {
  return artifacts.flatMap((artifact) => artifact.interaction_events ?? []);
}

function buildInteractionEventSummary(events) {
  return {
    event_count: events.length,
    modalities: uniqueRecent(events.map((event) => event.modality), 6),
    trouble_sources: uniqueRecent(events.map((event) => event.trouble_source), 6),
    mediation_levels: uniqueRecent(events.map((event) => event.mediation_level), 6),
    saved_phrases: uniqueRecent(events.map((event) => event.saved_phrase), 7),
    transfer_targets: uniqueRecent(events.flatMap((event) => event.transfer_targets ?? []), 7),
  };
}

export function buildWeeklyMirror(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const vocabulary = readVocabulary(paths.vocabulary);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const speakingBacklog = readSpeakingBacklog(paths.speakingBacklog);
  const artifacts = readSessionArtifacts(paths, progress).slice(-7);
  const interactionEvents = interactionEventsFromArtifacts(artifacts);
  const dueItems = listDueReviewItems(paths.root, date);
  const weakSkill = weakestLearnerSkill(learnerModel);
  const communicatedThemes = uniqueRecent(
    artifacts.map((artifact) => artifact.mirror?.communicated?.replace(/^You communicated a real daily idea: /, "")),
  );
  const savedPhrases = uniqueRecent(vocabulary.personal_phrases, 7);
  const reusedPhrases = reviewQueue.items
    .filter((item) => (item.success_count ?? 0) > 0 || item.last_result === "success")
    .map((item) => item.text);
  const repairAttempts = artifacts
    .filter((artifact) => artifact.learner_model_evidence?.updated_skills?.includes("repair"))
    .map((artifact) => ({
      session_id: artifact.id,
      phrase: artifact.mirror?.reviewPhrase ?? artifact.mirror?.recast ?? "",
    }));

  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    window: {
      session_count: artifacts.length,
      from: artifacts[0]?.date ?? "",
      to: artifacts.at(-1)?.date ?? "",
    },
    communicated_themes: communicatedThemes,
    saved_phrases: savedPhrases,
    reused_phrases: uniqueRecent(reusedPhrases, 5),
    repair_attempts: repairAttempts,
    interaction_event_summary: buildInteractionEventSummary(interactionEvents),
    speaking_os_summary: {
      backlog_count: speakingBacklog.items.length,
      open_count: speakingBacklog.items.filter((item) => ["open", "needs_review", "in_progress"].includes(item.status)).length,
      passed_count: speakingBacklog.items.filter((item) => item.status === "passed").length,
      next_item: nextSpeakingBacklogItem(paths.root),
    },
    skill_evidence: Object.fromEntries(
      learnerSkillKeys.map((skill) => [skill, learnerModel.interaction_skills[skill].evidence_count]),
    ),
    next_focus: {
      skill: weakSkill.skill,
      reason: `Lowest local evidence count (${weakSkill.count}).`,
      suggested_phrase: dueItems[0]?.text || savedPhrases.at(-1) || "I want to practice a little today.",
      prompt: dueItems[0]
        ? `Reuse due phrase in a tiny real-life context: "${dueItems[0].text}"`
        : "Start one small conversation and save one phrase.",
    },
    claim_boundary:
      "This mirror summarizes local practice evidence only. It does not rank level or guarantee real-world fluency.",
  };
}

export function writeWeeklyMirror(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const mirror = buildWeeklyMirror(paths.root, date);
  const mirrorPath = resolve(paths.weeklyMirrorDir, `weekly-mirror-${todayStamp(date)}.json`);
  writeFileSync(mirrorPath, `${JSON.stringify(mirror, null, 2)}\n`);
  return {
    mirrorPath,
    mirror,
  };
}

function daysSince(isoDate, date = new Date()) {
  if (!isoDate || !Number.isFinite(Date.parse(isoDate))) return null;
  return Math.max(0, Math.floor((date.getTime() - Date.parse(isoDate)) / 86400000));
}

function returnGapKind(sessionCount, daysSinceLastSession) {
  if (!sessionCount) return "fresh";
  if (daysSinceLastSession === 0) return "same-day";
  if (daysSinceLastSession === 1) return "next-day";
  return "long-gap";
}

function returnMessage(gapKind) {
  if (gapKind === "fresh") return "Start with one small text-first session.";
  if (gapKind === "same-day") return "You already practiced today. Review or save one phrase; no streak penalty.";
  if (gapKind === "next-day") return "Continue with one small return session; no streak penalty.";
  return "Restart gently with one useful sentence; no streak penalty.";
}

function restartAction(gapKind, dueReviewCount) {
  if (gapKind === "fresh") return "Say one useful sentence about today.";
  if (gapKind === "same-day") return dueReviewCount
    ? "Review one due phrase in a tiny real-life context."
    : "Save or repeat one phrase while practice still feels easy.";
  if (gapKind === "next-day") return dueReviewCount
    ? "Start with one due phrase, then add one new detail."
    : "Continue with one useful sentence and one gentle repair.";
  return dueReviewCount
    ? "Restart with the first due phrase; one sentence is enough."
    : "Restart with one familiar topic and one useful sentence.";
}

function commandLine(root, command, extraArgs = []) {
  return [
    "node",
    "scripts/english-learning-harness.mjs",
    command,
    "--learner-root",
    JSON.stringify(root),
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

function htmlList(items, renderItem, emptyText) {
  if (!items.length) {
    return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  }
  return `<ul>${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`;
}

function skillEvidenceSummary(learnerModel) {
  return Object.fromEntries(
    learnerSkillKeys.map((skill) => [
      skill,
      learnerModel.interaction_skills[skill]?.evidence_count ?? 0,
    ]),
  );
}

export function buildDailyCockpit(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const profileText = readProfile(paths.profile);
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const vocabulary = readVocabulary(paths.vocabulary);
  const dueReviewItems = listDueReviewItems(paths.root, date);
  const speakingBacklogItem = nextSpeakingBacklogItem(paths.root);
  const scenarioPlan = planScenario({
    profileText,
    learnerModel,
    vocabulary,
    dueReviewItems,
    speakingBacklogItem,
  });
  const latestJournal = latestJournalPath(paths.root);
  const latestWeeklyMirror = latestWeeklyMirrorPath(paths.root);
  const sessionCount = Array.isArray(progress.sessions) ? progress.sessions.length : 0;
  const daysSinceLastSession = daysSince(progress.last_session_at, date);
  const gapKind = returnGapKind(sessionCount, daysSinceLastSession);
  const dueReviewPreview = dueReviewItems.slice(0, 3);

  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    return_state: {
      session_count: sessionCount,
      last_session_at: progress.last_session_at ?? "",
      days_since_last_session: daysSinceLastSession,
      gap_kind: gapKind,
      message: returnMessage(gapKind),
      restart_action: restartAction(gapKind, dueReviewItems.length),
    },
    due_review: {
      count: dueReviewItems.length,
      items: dueReviewPreview,
    },
    suggested_scenario: {
      id: scenarioPlan.scenario.id,
      title: scenarioPlan.scenario.title,
      mode: scenarioPlan.scenario.mode,
      goal: scenarioPlan.scenario.goal,
      rescue_phrase: scenarioPlan.scenario.rescue_phrase,
      due_review: scenarioPlan.scenario.due_review,
      speaking_backlog: scenarioPlan.scenario.speaking_backlog,
      selection_reason: scenarioPlan.selectionReason,
    },
    speaking_os: {
      backlog_count: listSpeakingBacklog(paths.root).length,
      next_item: speakingBacklogItem,
    },
    learner_model_summary: {
      skill_evidence: skillEvidenceSummary(learnerModel),
      average_utterance_words: learnerModel.baseline.average_utterance_words,
      repair_phrase_count: learnerModel.baseline.repair_phrase_count,
      energy: learnerModel.affect.last_energy,
    },
    saved_phrase_count: vocabulary.personal_phrases.length,
    latest_weekly_mirror: latestWeeklyMirror ? relative(paths.root, latestWeeklyMirror) : "",
    latest_journal: latestJournal ? relative(paths.root, latestJournal) : "",
    next_commands: [
      ...(dueReviewItems.length ? [commandLine(paths.root, "review")] : []),
      commandLine(paths.root, "today", ["--say", JSON.stringify("I want to practice today.")]),
      commandLine(paths.root, "home"),
      commandLine(paths.root, "weekly"),
      commandLine(paths.root, "vault"),
    ],
    claim_boundary:
      "This cockpit chooses the next local practice action from local files only. It does not measure long-term skill transfer.",
  };
}

function readLatestWeeklyMirror(learnerRoot) {
  const latestPath = latestWeeklyMirrorPath(learnerRoot);
  if (!latestPath) return null;
  return JSON.parse(readFileSync(latestPath, "utf8"));
}

function learnerHomeHtml({ cockpit, weeklyMirror, savedPhrases }) {
  const scenario = cockpit.suggested_scenario;
  const nextCommand = cockpit.next_commands.find((command) => command.includes(" today ")) ?? cockpit.next_commands[0];
  const weeklyThemes = weeklyMirror?.communicated_themes ?? [];
  const weeklyPhrases = weeklyMirror?.saved_phrases ?? [];
  const nextFocus = weeklyMirror?.next_focus;
  const eventSummary = weeklyMirror?.interaction_event_summary;
  const speakingOs = cockpit.speaking_os;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Home</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17201b;
      --muted: #5d6b63;
      --line: #d7ded8;
      --paper: #f7f8f5;
      --panel: #ffffff;
      --accent: #2f6f5e;
      --warm: #a85d32;
      --soft: #e8f1ed;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--paper);
      line-height: 1.5;
    }
    main {
      width: min(1080px, calc(100% - 32px));
      margin: 0 auto;
      padding: 32px 0 48px;
    }
    header {
      display: grid;
      gap: 10px;
      margin-bottom: 24px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(30px, 5vw, 56px); line-height: 1; }
    h2 { font-size: 18px; }
    h3 { font-size: 15px; }
    .subtle { color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
      gap: 16px;
      align-items: start;
    }
    section {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      padding: 18px;
    }
    .stack { display: grid; gap: 16px; }
    .hero {
      display: grid;
      gap: 16px;
      border-left: 6px solid var(--accent);
    }
    .scenario {
      display: grid;
      gap: 8px;
      padding: 14px;
      background: var(--soft);
      border-radius: 8px;
    }
    .label {
      display: inline-flex;
      width: fit-content;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 3px 9px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    code {
      display: block;
      white-space: pre-wrap;
      word-break: break-word;
      padding: 12px;
      border-radius: 8px;
      background: #17201b;
      color: #f8fbf7;
      font-size: 13px;
    }
    ul {
      display: grid;
      gap: 8px;
      margin: 12px 0 0;
      padding-left: 18px;
    }
    li strong { color: var(--accent); }
    .empty {
      margin-top: 10px;
      color: var(--muted);
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcfa;
    }
    .metric b {
      display: block;
      font-size: 22px;
      color: var(--accent);
    }
    .boundary {
      border-left: 6px solid var(--warm);
    }
    @media (max-width: 820px) {
      main { width: min(100% - 24px, 720px); padding-top: 24px; }
      .grid, .meta { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="label">Local learner home</p>
      <h1>오늘의 영어 연습</h1>
      <p class="subtle">${escapeHtml(cockpit.return_state.message)}</p>
      <p>${escapeHtml(cockpit.return_state.restart_action)}</p>
    </header>

    <div class="grid">
      <div class="stack">
        <section class="hero" aria-labelledby="today-action">
          <div>
            <p class="label">Today</p>
            <h2 id="today-action">${escapeHtml(scenario.title)}</h2>
          </div>
          <div class="scenario">
            <h3>Goal</h3>
            <p>${escapeHtml(scenario.goal)}</p>
            <h3>Rescue phrase</h3>
            <p>${escapeHtml(scenario.rescue_phrase)}</p>
          </div>
          <div>
            <h3>Start command</h3>
            <code>${escapeHtml(nextCommand)}</code>
          </div>
        </section>

        <section aria-labelledby="due-review">
          <h2 id="due-review">복습할 문장</h2>
          ${htmlList(
            cockpit.due_review.items,
            (item) => `<strong>${escapeHtml(item.text)}</strong><br><span class="subtle">${escapeHtml(item.prompt)}</span>`,
            "지금 due review는 없습니다. 오늘 문장 하나를 저장하면 다음 복습이 생깁니다.",
          )}
        </section>

        <section aria-labelledby="speaking-os">
          <h2 id="speaking-os">Speaking Skill OS</h2>
          ${
            speakingOs?.next_item
              ? `<div class="scenario">
            <h3>${escapeHtml(speakingOs.next_item.label)}</h3>
            <p>${escapeHtml(speakingOs.next_item.target_behavior)}</p>
            <p class="subtle">Transfer test: ${escapeHtml(speakingOs.next_item.transfer_test)}</p>
          </div>`
              : '<p class="empty">아직 speaking backlog가 없습니다. diagnose로 첫 약점 카드를 만들 수 있습니다.</p>'
          }
        </section>

        <section aria-labelledby="weekly-mirror">
          <h2 id="weekly-mirror">최근 weekly mirror</h2>
          ${
            weeklyMirror
              ? `<p class="subtle">${escapeHtml(weeklyMirror.window.from || "start")} - ${escapeHtml(weeklyMirror.window.to || "now")}</p>
          ${htmlList(weeklyThemes, (theme) => escapeHtml(theme), "아직 요약할 대화 주제가 없습니다.")}
          ${
            nextFocus
              ? `<div class="scenario"><h3>Next focus</h3><p>${escapeHtml(nextFocus.prompt)}</p></div>`
              : ""
          }`
              : '<p class="empty">아직 weekly mirror가 없습니다. 몇 번 연습한 뒤 weekly 명령을 실행하세요.</p>'
          }
        </section>

        <section aria-labelledby="interaction-evidence">
          <h2 id="interaction-evidence">Interaction evidence</h2>
          ${
            eventSummary?.event_count
              ? `<div class="meta">
            <div class="metric"><span>Events</span><b>${escapeHtml(eventSummary.event_count)}</b></div>
            <div class="metric"><span>Modalities</span><b>${escapeHtml(eventSummary.modalities.join(", "))}</b></div>
            <div class="metric"><span>Mediation</span><b>${escapeHtml(eventSummary.mediation_levels.join(", "))}</b></div>
          </div>
          <h3>Transfer targets</h3>
          ${htmlList(eventSummary.transfer_targets ?? [], (target) => escapeHtml(target), "No transfer targets yet.")}`
              : '<p class="empty">No interaction events have been summarized yet.</p>'
          }
        </section>
      </div>

      <aside class="stack">
        <section aria-labelledby="journey">
          <h2 id="journey">내 여정</h2>
          <div class="meta">
            <div class="metric"><span>Sessions</span><b>${escapeHtml(cockpit.return_state.session_count)}</b></div>
            <div class="metric"><span>Due</span><b>${escapeHtml(cockpit.due_review.count)}</b></div>
            <div class="metric"><span>Saved</span><b>${escapeHtml(cockpit.saved_phrase_count)}</b></div>
          </div>
        </section>

        <section aria-labelledby="saved-phrases">
          <h2 id="saved-phrases">최근 저장한 표현</h2>
          ${htmlList(
            savedPhrases,
            (phrase) => `<strong>${escapeHtml(phrase.text)}</strong><br><span class="subtle">${escapeHtml(phrase.prompt)}</span>`,
            "저장한 표현이 아직 없습니다.",
          )}
          ${weeklyPhrases.length ? `<p class="empty">Weekly mirror phrases: ${escapeHtml(weeklyPhrases.join(", "))}</p>` : ""}
        </section>

        <section class="boundary" aria-labelledby="boundary">
          <h2 id="boundary">Claim boundary</h2>
          <p>${escapeHtml(cockpit.claim_boundary)}</p>
          <p class="subtle">This page is generated from your local learner files only.</p>
        </section>
      </aside>
    </div>
  </main>
</body>
</html>
`;
}

export function writeLearnerHome(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const cockpit = buildDailyCockpit(paths.root, date);
  const weeklyMirror = readLatestWeeklyMirror(paths.root);
  const savedPhrases = phraseVault(paths.root).slice(-5).reverse();
  const html = learnerHomeHtml({ cockpit, weeklyMirror, savedPhrases });
  writeFileSync(paths.learnerHome, html);
  return {
    homePath: paths.learnerHome,
    homeUrl: `file://${paths.learnerHome}`,
    cockpit,
  };
}

function latestGeneratedMissionPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.missionArtifactDir)) return "";
  const entries = readdirSync(paths.missionArtifactDir)
    .filter((entry) => /^daily-mission-.*\.json$/.test(entry))
    .sort();
  return entries.length ? resolve(paths.missionArtifactDir, entries.at(-1)) : "";
}

function readLatestGeneratedMission(learnerRoot = defaultLearnerRoot()) {
  const missionPath = latestGeneratedMissionPath(learnerRoot);
  if (!missionPath) return null;
  const state = JSON.parse(readFileSync(missionPath, "utf8"));
  return {
    path: relative(learnerPaths(learnerRoot).root, missionPath),
    html: relative(learnerPaths(learnerRoot).root, missionPath.replace(/\.json$/, ".html")),
    mission_id: state.mission_id,
    title: state.learner_visible_scene?.title ?? "",
    target_skill: state.target_skill,
    transfer_test: state.transfer_test,
    generated_at: state.generated_at,
  };
}

function latestMissionAssetDeckPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.assetArtifactDir)) return "";
  const entries = readdirSync(paths.assetArtifactDir)
    .filter((entry) => /^mission-assets-.*\.json$/.test(entry))
    .sort();
  return entries.length ? resolve(paths.assetArtifactDir, entries.at(-1)) : "";
}

function readLatestMissionAssetDeck(learnerRoot = defaultLearnerRoot()) {
  const deckPath = latestMissionAssetDeckPath(learnerRoot);
  if (!deckPath) return null;
  const paths = learnerPaths(learnerRoot);
  const deck = JSON.parse(readFileSync(deckPath, "utf8"));
  const topAssetAction = deck.top_asset_action
    ? {
        asset_id: deck.top_asset_action.asset_id,
        mode: deck.top_asset_action.mode,
        label: deck.top_asset_action.label,
        reason: deck.top_asset_action.reason,
        expected_evidence: deck.top_asset_action.expected_evidence,
      }
    : null;
  return {
    path: relative(paths.root, deckPath),
    html: relative(paths.root, deckPath.replace(/\.json$/, ".html")),
    deck_id: deck.deck_id,
    mission_id: deck.mission_id,
    target_skill: deck.target_skill,
    asset_count: deck.assets?.length ?? 0,
    canonical_completion_path: deck.canonical_completion_path,
    evidence_required: deck.evidence_required,
    top_asset_action: topAssetAction,
    generated_at: deck.generated_at,
  };
}

function latestGeneratedStoryboardPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.storyboardArtifactDir)) return "";
  const entries = readdirSync(paths.storyboardArtifactDir)
    .filter((entry) => /^mission-storyboard-.*\.json$/.test(entry))
    .sort();
  return entries.length ? resolve(paths.storyboardArtifactDir, entries.at(-1)) : "";
}

function readLatestGeneratedStoryboard(learnerRoot = defaultLearnerRoot()) {
  const storyboardPath = latestGeneratedStoryboardPath(learnerRoot);
  if (!storyboardPath) return null;
  const paths = learnerPaths(learnerRoot);
  const storyboard = JSON.parse(readFileSync(storyboardPath, "utf8"));
  return {
    path: relative(paths.root, storyboardPath),
    html: relative(paths.root, storyboardPath.replace(/\.json$/, ".html")),
    storyboard_id: storyboard.storyboard_id,
    mission_id: storyboard.mission_id,
    title: storyboard.mission_title,
    target_skill: storyboard.target_skill,
    evidence_required: storyboard.expected_evidence?.session_artifact ?? "",
    frame_count: storyboard.frames?.length ?? 0,
    generated_at: storyboard.generated_at,
    claim_boundary: storyboard.claim_boundary,
  };
}

function sceneForSkill(skill, fallbackGoal) {
  if (skill === "clarification") {
    return {
      title: "The Unclear Plan",
      setup: "친구가 약속 장소를 애매하게 말했습니다.",
      situation: '친구: "Let\'s meet at the usual place after work."',
      ask: "어디에서 만나자는 뜻인지 확인하는 질문을 영어로 한 문장 말해보세요.",
      example: "Which place do you mean?",
      image_prompt:
        "A simple everyday scene card: two friends planning after work near a subway station, one speech bubble is intentionally unclear.",
      hidden_detail: "the exact meeting place is missing",
    };
  }
  if (skill === "repair") {
    return {
      title: "Keep Talking When Stuck",
      setup: "말하려는 단어가 바로 떠오르지 않는 상황입니다.",
      situation: "상대가 지금 있는 곳이 어떤 느낌인지 물었습니다.",
      ask: '"정확한 단어는 모르겠지만..."으로 시작해서 한 문장 더 이어가세요.',
      example: "I do not know the exact word, but it feels comfortable.",
      image_prompt:
        "A cozy desk scene with a laptop, mug, and notebook; the learner must describe the feeling without knowing one exact word.",
      hidden_detail: "the learner does not know the exact word for the atmosphere",
    };
  }
  if (skill === "follow_ups") {
    return {
      title: "One More Question",
      setup: "상대가 주말 이야기를 짧게 했습니다.",
      situation: '상대: "I went to a small cafe this weekend."',
      ask: "대화를 이어가기 위해 follow-up question을 하나 말해보세요.",
      example: "What did you order there?",
      image_prompt:
        "A warm small cafe weekend scene with a counter and two cups; the learner asks one follow-up question.",
      hidden_detail: "the learner needs one more question to keep the conversation going",
    };
  }
  if (skill === "soft_disagreement") {
    return {
      title: "Say It Gently",
      setup: "친구가 별로 동의하기 어려운 제안을 했습니다.",
      situation: '친구: "Let\'s skip lunch and work more."',
      ask: "부드럽게 다른 의견을 영어로 한 문장 말해보세요.",
      example: "I see your point, but I think we should eat something first.",
      image_prompt:
        "A quiet office lunch decision scene; the learner gently disagrees without making conflict.",
      hidden_detail: "the learner disagrees but wants to keep the tone friendly",
    };
  }
  return {
    title: "Start Small Today",
    setup: "오늘 있었던 작은 일을 누군가에게 말하는 상황입니다.",
    situation: "상대가 오늘 하루가 어땠는지 물었습니다.",
    ask: fallbackGoal || "오늘 실제로 한 일을 영어로 한 문장 말해보세요.",
    example: "I had coffee and worked on one important task today.",
    image_prompt:
      "A simple daily life scene with a calendar, coffee, and a short to-do note; the learner starts with one sentence.",
    hidden_detail: "the learner only needs one small start",
  };
}

function firstUseScenePreset(preset) {
  const presets = {
    "office-clarification": {
      title: "The Office File Check",
      setup: "사무실에서 동료가 어떤 파일을 말하는지 애매한 상황입니다.",
      situation: '동료: "Can you send me the usual file?"',
      ask: "어떤 파일을 말하는지 확인하는 질문을 영어로 한 문장 말해보세요.",
      example: "Which file do you mean?",
      image_prompt:
        "A focused office desk scene with monitors, folders, and a chat notification asking for the usual file.",
      hidden_detail: "the exact file name is missing",
    },
    "cafe-repair": {
      title: "The Cafe Word Gap",
      setup: "카페에서 원하는 음료 이름이 바로 생각나지 않는 상황입니다.",
      situation: "직원이 주문을 기다리고 있고, 차가운 우유 커피를 원합니다.",
      ask: "모르는 단어를 피해서 주문을 이어가는 문장을 영어로 말해보세요.",
      example: "I do not know the name, but I want cold coffee with milk.",
      image_prompt:
        "A friendly cafe counter with a menu board, iced coffee, milk, and a learner trying to order without knowing the drink name.",
      hidden_detail: "the learner does not know the exact drink name",
    },
    "desk-description": {
      title: "The Desk Snapshot",
      setup: "책상 위와 주변 분위기를 짧게 묘사하는 상황입니다.",
      situation: "상대가 지금 주변에 무엇이 보이는지 물었습니다.",
      ask: "보이는 물건 세 가지와 사람들의 분위기를 영어로 짧게 말해보세요.",
      example: "There are desks, chairs, and monitors. People are working quietly.",
      image_prompt:
        "A typical office desk area with chairs, monitors, notebooks, and people working quietly in the background.",
      hidden_detail: "the learner needs to mention visible objects and current activity",
    },
    "lunch-soft-disagreement": {
      title: "The Lunch Boundary",
      setup: "친구의 점심 제안에 부드럽게 다른 선택을 말하는 상황입니다.",
      situation: '친구: "Let\'s eat something spicy today."',
      ask: "배고프지만 매운 음식이 부담스럽다는 뜻을 부드럽게 영어로 말해보세요.",
      example: "I see your point, but I want something light today.",
      image_prompt:
        "A lunch decision scene with two friends looking at spicy food and lighter menu options.",
      hidden_detail: "the learner is hungry but does not want spicy food",
    },
  };
  return presets[preset] ?? null;
}

export function validateMissionAssetContract(contract) {
  const errors = [];
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return ["asset_contract must be an object"];
  }
  if (contract.schema_version !== 1) errors.push("asset_contract.schema_version must be 1");
  if (contract.canonical_completion_path !== "text-first") {
    errors.push("asset_contract.canonical_completion_path must be text-first");
  }
  if (!contract.target_skill) errors.push("asset_contract.target_skill is required");
  if (!contract.required_learner_action) errors.push("asset_contract.required_learner_action is required");
  if (!contract.expected_evidence?.session_artifact) {
    errors.push("asset_contract.expected_evidence.session_artifact is required");
  }
  if (!Array.isArray(contract.assets) || !contract.assets.length) {
    errors.push("asset_contract.assets must be a non-empty array");
  }

  const assets = Array.isArray(contract.assets) ? contract.assets : [];
  const ids = new Set();
  const requiredIds = ["text-practice", "interactive-html-scene", "image-information-gap", "voice-transcript", "remotion-storyboard"];
  for (const requiredId of requiredIds) {
    if (!assets.some((asset) => asset.id === requiredId)) {
      errors.push(`asset_contract.assets missing ${requiredId}`);
    }
  }
  for (const asset of assets) {
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
      errors.push("asset_contract.assets entries must be objects");
      continue;
    }
    if (!asset.id) errors.push("asset id is required");
    if (asset.id && ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`);
    if (asset.id) ids.add(asset.id);
    if (!asset.mode) errors.push(`${asset.id || "asset"} mode is required`);
    if (!asset.target_skill || asset.target_skill !== contract.target_skill) {
      errors.push(`${asset.id || "asset"} target_skill must match contract target_skill`);
    }
    if (!asset.required_learner_action) errors.push(`${asset.id || "asset"} required_learner_action is required`);
    if (asset.requires_learner_output !== true) {
      errors.push(`${asset.id || "asset"} must require learner output`);
    }
    if (!asset.expected_evidence?.session_artifact) {
      errors.push(`${asset.id || "asset"} expected_evidence.session_artifact is required`);
    }
    if (!asset.completion_role) errors.push(`${asset.id || "asset"} completion_role is required`);
    if (asset.completion_role === "decorative") {
      errors.push(`${asset.id || "asset"} cannot be decorative`);
    }
    const lowerClaim = `${asset.claim_boundary || ""}`.toLowerCase();
    for (const forbidden of ["proves fluency", "guaranteed", "native speaker", "your level", "improves retention"]) {
      if (lowerClaim.includes(forbidden)) {
        errors.push(`${asset.id || "asset"} claim_boundary contains unsupported claim: ${forbidden}`);
      }
    }
  }
  if (!assets.some((asset) => asset.completion_role === "canonical" && asset.mode === "text")) {
    errors.push("asset_contract must include a canonical text asset");
  }
  if (!contract.blocked_claims?.includes("realtime voice is supported")) {
    errors.push("asset_contract must keep realtime voice support blocked");
  }
  if (!contract.blocked_claims?.includes("generated media improves learning outcomes")) {
    errors.push("asset_contract must keep generated-media learning outcomes blocked");
  }
  return errors;
}

function buildMissionAssetContract({ missionState, scene, paths, startText }) {
  const expectedEvidence = {
    session_artifact: "artifacts/sessions/*.json",
    interaction_event_modalities: ["text", "voice", "image"],
    speaking_backlog_item_id: missionState.expected_evidence?.speaking_backlog_item_id ?? "",
    transfer_test: missionState.transfer_test,
  };
  const base = {
    target_skill: missionState.target_skill,
    required_learner_action: missionState.required_learner_action,
    expected_evidence: expectedEvidence,
    claim_boundary:
      "This asset supports local speaking practice and evidence collection. It does not prove fluency, retention, realtime voice, or generated-media learning gains.",
  };
  return {
    schema_version: 1,
    contract_id: `${missionState.mission_id}-asset-contract`,
    mission_id: missionState.mission_id,
    canonical_completion_path: "text-first",
    target_skill: missionState.target_skill,
    required_learner_action: missionState.required_learner_action,
    transfer_test: missionState.transfer_test,
    expected_evidence: expectedEvidence,
    assets: [
      {
        id: "text-practice",
        mode: "text",
        completion_role: "canonical",
        surface: "Codex conversation",
        prompt: scene.ask,
        start_command: commandLine(paths.root, "today", ["--say", JSON.stringify(startText)]),
        requires_learner_output: true,
        ...base,
      },
      {
        id: "interactive-html-scene",
        mode: "html",
        completion_role: "evidence-guided",
        surface: "generated daily mission and scene HTML",
        prompt: "Use the generated scene frames to prepare one spoken or typed answer, then save the answer as session evidence.",
        start_command: commandLine(paths.root, "scene"),
        requires_learner_output: true,
        ...base,
      },
      {
        id: "image-information-gap",
        mode: "image",
        completion_role: "optional-evidence-path",
        surface: "local image information-gap prompt",
        prompt: scene.image_prompt,
        hidden_detail: scene.hidden_detail,
        start_command: commandLine(paths.root, "image", [
          "--image-file",
          JSON.stringify("path/to/local-image.png"),
          "--hidden-detail",
          JSON.stringify(scene.hidden_detail),
          "--say",
          JSON.stringify(startText),
        ]),
        requires_learner_output: true,
        ...base,
      },
      {
        id: "voice-transcript",
        mode: "voice-transcript",
        completion_role: "optional-evidence-path",
        surface: "transcript-backed voice practice",
        prompt: "Read the scene out loud, save or paste the transcript, then preserve the transcript as voice interaction evidence.",
        start_command: commandLine(paths.root, "voice", [
          "--transcript",
          JSON.stringify("path/to/voice-transcript.txt"),
          "--say",
          JSON.stringify(startText),
        ]),
        requires_learner_output: true,
        ...base,
      },
      {
        id: "remotion-storyboard",
        mode: "remotion-storyboard",
        completion_role: "optional-preparation-asset",
        surface: "generated storyboard plan",
        prompt:
          "Render or describe a short scene timeline only when it leads back to the same learner answer and session artifact requirement.",
        storyboard_frames: ["scene setup", "speaking cue", "repair cue", "transfer check"],
        requires_learner_output: true,
        ...base,
      },
      {
        id: "future-realtime-hook",
        mode: "future-realtime",
        completion_role: "blocked-future-capability",
        surface: "future realtime voice hook",
        prompt:
          "Realtime voice is a future capability and cannot be required for mission completion until a stable runtime is proven.",
        requires_learner_output: true,
        ...base,
      },
    ],
    blocked_claims: [
      "realtime voice is supported",
      "generated media improves learning outcomes",
      "multimodal assets prove fluency",
      "Remotion artifacts improve retention",
    ],
    claim_boundary:
      "Mission assets are local practice supports. Text-first evidence remains canonical; optional media assets do not prove learning outcomes.",
  };
}

function buildGeneratedMissionState(learnerRoot = defaultLearnerRoot(), date = new Date(), options = {}) {
  const paths = ensureLearnerStore(learnerRoot);
  const dailyCockpit = buildDailyCockpit(paths.root, date);
  const backlogItem = dailyCockpit.speaking_os.next_item;
  const skill = backlogItem?.skill || dailyCockpit.suggested_scenario.speaking_backlog?.skill || dailyCockpit.suggested_scenario.cefr_skill || "starts";
  const scene = firstUseScenePreset(options.scenePreset) || sceneForSkill(skill, dailyCockpit.suggested_scenario.goal);
  const dateKey = todayStamp(date);
  const missionId = `daily-generated-${dateKey}-${skill}`;
  const startText = backlogItem?.drill_prompt || scene.example;
  const missionState = {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    mission_id: missionId,
    scene_preset: options.scenePreset || "",
    source: {
      type: backlogItem ? "speaking-skill-os" : "daily-scenario",
      backlog_item_id: backlogItem?.id || "",
      scenario_id: dailyCockpit.suggested_scenario.id,
      selection_reason: dailyCockpit.suggested_scenario.selection_reason,
    },
    target_skill: skill,
    learner_visible_scene: scene,
    required_learner_action: backlogItem?.target_behavior || dailyCockpit.suggested_scenario.goal,
    transfer_test: backlogItem?.transfer_test || "Can you complete one small English turn?",
    start_commands: {
      text: commandLine(paths.root, "today", ["--say", JSON.stringify(startText)]),
      voice: commandLine(paths.root, "voice", [
        "--transcript",
        JSON.stringify("path/to/voice-transcript.txt"),
        "--say",
        JSON.stringify(startText),
      ]),
      image: commandLine(paths.root, "image", [
        "--image-file",
        JSON.stringify("path/to/local-image.png"),
        "--hidden-detail",
        JSON.stringify(scene.hidden_detail),
        "--say",
        JSON.stringify(startText),
      ]),
    },
    optional_artifacts: {
      image_prompt: scene.image_prompt,
      voice_prompt: "Read the scene out loud, then answer in one sentence. Save the transcript through the voice command.",
      html_card_required: true,
    },
    expected_evidence: {
      session_artifact: "artifacts/sessions/*.json",
      interaction_event_modalities: ["text", "voice", "image"],
      speaking_backlog_item_id: backlogItem?.id || "",
      transfer_test: backlogItem?.transfer_test || "",
    },
    claim_boundary:
      "This generated mission is a local practice scene. It can guide Speaking Skill OS transfer evidence, but it does not prove fluency, retention, or generated-world learning gains.",
  };
  missionState.asset_contract = buildMissionAssetContract({
    missionState,
    scene,
    paths,
    startText,
  });
  const contractErrors = validateMissionAssetContract(missionState.asset_contract);
  if (contractErrors.length) {
    throw new Error(`Generated mission asset contract invalid: ${contractErrors.join("; ")}`);
  }
  return missionState;
}

function generatedMissionHtml(state) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Daily Mission</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #142019;
      --muted: #5d685f;
      --line: #d7ded8;
      --paper: #f7f8f3;
      --panel: #ffffff;
      --green: #2f7655;
      --blue: #2e6689;
      --amber: #9a6400;
      --soft: #e8f3ec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1040px, calc(100% - 32px));
      margin: 0 auto;
      padding: 30px 0 48px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 22px; }
    h3 { font-size: 16px; }
    header {
      display: grid;
      gap: 10px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 20px;
    }
    section {
      margin-top: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
    }
    .scene {
      background: var(--soft);
      border-color: #cfe2d5;
    }
    .ask {
      margin-top: 12px;
      font-size: 24px;
      font-weight: 760;
      line-height: 1.25;
    }
    .subtle { color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .mode-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .mode-tabs button {
      appearance: none;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      color: var(--ink);
      padding: 9px 12px;
      font: inherit;
      font-weight: 720;
      cursor: pointer;
    }
    .mode-tabs button[aria-selected="true"] {
      border-color: var(--green);
      background: var(--soft);
      color: var(--green);
    }
    .mode-panel {
      display: grid;
      gap: 12px;
      margin-top: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #fbfcfa;
    }
    .mode-panel[hidden] { display: none; }
    .practice-note {
      width: 100%;
      min-height: 86px;
      resize: vertical;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      font: inherit;
      background: #fff;
      color: var(--ink);
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #fbfcfa;
    }
    code {
      display: block;
      margin-top: 10px;
      padding: 12px;
      border-radius: 8px;
      background: #162019;
      color: #f7fbf7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    details {
      margin-top: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcfa;
    }
    summary { cursor: pointer; font-weight: 700; }
    .boundary { border-left: 6px solid var(--amber); }
    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="subtle">Generated daily mission</p>
      <h1>${escapeHtml(state.learner_visible_scene.title)}</h1>
      <p>${escapeHtml(state.learner_visible_scene.setup)}</p>
    </header>

    <section class="scene">
      <h2>오늘의 장면</h2>
      <p>${escapeHtml(state.learner_visible_scene.situation)}</p>
      <p class="ask">${escapeHtml(state.learner_visible_scene.ask)}</p>
      <p class="subtle">예시: ${escapeHtml(state.learner_visible_scene.example)}</p>
    </section>

    <section>
      <h2>Speaking Skill OS 연결</h2>
      <div class="grid">
        <div class="card"><h3>Target</h3><p>${escapeHtml(state.target_skill)}</p></div>
        <div class="card"><h3>Action</h3><p>${escapeHtml(state.required_learner_action)}</p></div>
        <div class="card"><h3>Transfer test</h3><p>${escapeHtml(state.transfer_test)}</p></div>
      </div>
    </section>

    <section>
      <h2>바로 시작</h2>
      <div class="mode-tabs" role="tablist" aria-label="practice modes">
        <button type="button" role="tab" aria-selected="true" data-mode-tab="text">Text</button>
        <button type="button" role="tab" aria-selected="false" data-mode-tab="voice">Voice transcript</button>
        <button type="button" role="tab" aria-selected="false" data-mode-tab="image">Image info-gap</button>
      </div>
      <div class="mode-panel" data-mode-panel="text" role="tabpanel">
        <h3>Text-first path</h3>
        <p>지금 한 문장으로 시작합니다. 완벽한 답보다 먼저 말하는 것이 목표입니다.</p>
        <textarea class="practice-note" aria-label="text practice draft" placeholder="${escapeHtml(state.learner_visible_scene.example)}"></textarea>
        <code>${escapeHtml(state.start_commands.text)}</code>
      </div>
      <div class="mode-panel" data-mode-panel="voice" role="tabpanel" hidden>
        <h3>Voice transcript path</h3>
        <p>소리 내어 말한 뒤 transcript를 저장합니다. 발음 점수는 매기지 않습니다.</p>
        <code>${escapeHtml(state.start_commands.voice)}</code>
      </div>
      <div class="mode-panel" data-mode-panel="image" role="tabpanel" hidden>
        <h3>Image information-gap path</h3>
        <p>이미지에서 빠진 정보를 묻는 한 문장을 만듭니다.</p>
        <code>${escapeHtml(state.start_commands.image)}</code>
      </div>
    </section>

    <section>
      <h2>생성형 확장 프롬프트</h2>
      <p class="subtle">이미지나 음성은 선택적 장면 보강입니다. 학습 증거는 learner output과 interaction event에 남습니다.</p>
      <details>
        <summary>Image prompt</summary>
        <p>${escapeHtml(state.optional_artifacts.image_prompt)}</p>
      </details>
      <details>
        <summary>Voice prompt</summary>
        <p>${escapeHtml(state.optional_artifacts.voice_prompt)}</p>
      </details>
    </section>

    <section>
      <h2>Asset evidence contract</h2>
      <p class="subtle">Text-first가 기본 완료 경로입니다. 선택 asset도 learner output과 session evidence로 돌아와야 합니다.</p>
      <div class="grid">
        ${(state.asset_contract?.assets ?? [])
          .map(
            (asset) => `
        <div class="card">
          <h3>${escapeHtml(asset.mode)}</h3>
          <p>${escapeHtml(asset.completion_role)}</p>
          <p class="subtle">${escapeHtml(asset.expected_evidence?.session_artifact ?? "")}</p>
        </div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="boundary">
      <h2>경계</h2>
      <p>${escapeHtml(state.claim_boundary)}</p>
    </section>
  </main>
  <script>
    const tabs = [...document.querySelectorAll("[data-mode-tab]")];
    const panels = [...document.querySelectorAll("[data-mode-panel]")];
    for (const tab of tabs) {
      tab.addEventListener("click", () => {
        const mode = tab.dataset.modeTab;
        for (const candidate of tabs) {
          candidate.setAttribute("aria-selected", String(candidate === tab));
        }
        for (const panel of panels) {
          panel.hidden = panel.dataset.modePanel !== mode;
        }
      });
    }
  </script>
</body>
</html>
`;
}

export function writeGeneratedDailyMission(learnerRoot = defaultLearnerRoot(), date = new Date(), options = {}) {
  const paths = ensureLearnerStore(learnerRoot);
  const state = buildGeneratedMissionState(paths.root, date, options);
  const stamp = todayStamp(date);
  const missionStatePath = resolve(paths.missionArtifactDir, `daily-mission-${stamp}.json`);
  const missionHtmlPath = resolve(paths.missionArtifactDir, `daily-mission-${stamp}.html`);
  writeFileSync(missionStatePath, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(missionHtmlPath, generatedMissionHtml(state));
  return {
    missionStatePath,
    missionHtmlPath,
    missionUrl: `file://${missionHtmlPath}`,
    state,
  };
}

function latestGeneratedScenePath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.sceneArtifactDir)) return "";
  const entries = readdirSync(paths.sceneArtifactDir)
    .filter((entry) => /^daily-scene-.*\.json$/.test(entry))
    .sort();
  return entries.length ? resolve(paths.sceneArtifactDir, entries.at(-1)) : "";
}

function readLatestGeneratedScene(learnerRoot = defaultLearnerRoot()) {
  const scenePath = latestGeneratedScenePath(learnerRoot);
  if (!scenePath) return null;
  const paths = learnerPaths(learnerRoot);
  const state = JSON.parse(readFileSync(scenePath, "utf8"));
  return {
    path: relative(paths.root, scenePath),
    html: relative(paths.root, scenePath.replace(/\.json$/, ".html")),
    scene_id: state.scene_id,
    title: state.title,
    mission_id: state.mission_id,
    target_skill: state.target_skill,
    variant_id: state.variant?.id ?? "",
    variant_label: state.variant?.label ?? "",
    transfer_test: state.transfer_test,
    frame_count: state.frames?.length ?? 0,
    generated_at: state.generated_at,
  };
}

function sceneVariantForSkill(skill, date = new Date()) {
  const daySeed = Number(todayStamp(date).replaceAll("-", "")) || 0;
  const variants = {
    clarification: [
      {
        id: "subway-usual-place",
        label: "Subway meet-up",
        setting: "퇴근 후 지하철역 근처에서 약속 장소가 애매한 상황",
        mood: "calm-clarifying",
        prop: "지도 앱과 메시지 알림",
        cue_style: "짧고 직접적인 확인 질문",
      },
      {
        id: "cafe-order-detail",
        label: "Cafe detail check",
        setting: "카페에서 주문 옵션을 다시 확인하는 상황",
        mood: "friendly-check",
        prop: "메뉴판과 컵 사이즈",
        cue_style: "정중한 의미 확인 질문",
      },
    ],
    repair: [
      {
        id: "desk-missing-word",
        label: "Desk missing word",
        setting: "책상 앞에서 정확한 단어가 떠오르지 않는 상황",
        mood: "low-pressure-repair",
        prop: "노트북, 머그컵, 메모지",
        cue_style: "쉬운 단어로 돌아오는 rescue phrase",
      },
      {
        id: "travel-description-gap",
        label: "Travel description gap",
        setting: "여행 중 본 장소를 설명하려다 단어가 막히는 상황",
        mood: "curious-repair",
        prop: "사진 한 장과 작은 표지판",
        cue_style: "I mean / what I want to say is로 이어가기",
      },
    ],
    follow_ups: [
      {
        id: "weekend-cafe-followup",
        label: "Weekend cafe follow-up",
        setting: "친구가 주말 카페 이야기를 짧게 꺼낸 상황",
        mood: "warm-followup",
        prop: "커피잔 두 개와 작은 영수증",
        cue_style: "한 가지 더 묻는 follow-up question",
      },
      {
        id: "office-smalltalk-followup",
        label: "Office small talk follow-up",
        setting: "동료가 어제 늦게까지 일했다고 말한 상황",
        mood: "quiet-office",
        prop: "모니터와 빈 커피컵",
        cue_style: "because/when/where detail을 끌어내는 질문",
      },
    ],
    soft_disagreement: [
      {
        id: "lunch-boundary",
        label: "Lunch boundary",
        setting: "점심을 건너뛰자는 제안에 부드럽게 다른 의견을 말하는 상황",
        mood: "gentle-boundary",
        prop: "회의실 문 앞과 점심 메뉴 알림",
        cue_style: "I see your point, but...로 부드럽게 말하기",
      },
      {
        id: "movie-choice",
        label: "Movie choice",
        setting: "친구의 영화 선택에 살짝 다른 의견을 말하는 상황",
        mood: "friendly-disagreement",
        prop: "영화 포스터와 예매 화면",
        cue_style: "not really / maybe 대신 부드러운 제안",
      },
    ],
    starts: [
      {
        id: "morning-snapshot",
        label: "Morning snapshot",
        setting: "오늘 아침 한 일을 한 문장으로 시작하는 상황",
        mood: "easy-start",
        prop: "캘린더, 커피, 짧은 할 일",
        cue_style: "완벽하지 않아도 먼저 시작하는 한 문장",
      },
      {
        id: "evening-checkin",
        label: "Evening check-in",
        setting: "하루가 어땠는지 묻는 메시지에 짧게 답하는 상황",
        mood: "gentle-return",
        prop: "휴대폰 메시지와 조용한 방",
        cue_style: "I did / I felt / I want로 시작하기",
      },
    ],
  };
  const choices = variants[skill] || variants.starts;
  return choices[daySeed % choices.length];
}

function firstUseSceneVariantPreset(preset) {
  const variants = {
    "office-clarification": {
      id: "office-clarification",
      label: "Office clarification",
      setting: "사무실 책상 앞에서 동료의 파일 요청이 애매한 상황",
      mood: "focused-clarifying",
      prop: "모니터, 폴더, 채팅 알림",
      cue_style: "정중하고 짧은 확인 질문",
    },
    "cafe-repair": {
      id: "cafe-repair",
      label: "Cafe repair",
      setting: "카페 카운터에서 음료 이름이 생각나지 않는 상황",
      mood: "friendly-repair",
      prop: "메뉴판, 얼음컵, 우유",
      cue_style: "I do not know the name, but...로 이어가기",
    },
    "desk-description": {
      id: "desk-description",
      label: "Desk description",
      setting: "책상과 모니터가 많은 평범한 사무실을 묘사하는 상황",
      mood: "observant-description",
      prop: "책상, 의자, 모니터",
      cue_style: "There are / I can see로 구체적으로 말하기",
    },
    "lunch-soft-disagreement": {
      id: "lunch-soft-disagreement",
      label: "Lunch soft disagreement",
      setting: "점심 메뉴를 정하면서 매운 음식을 부드럽게 거절하는 상황",
      mood: "gentle-boundary",
      prop: "점심 메뉴 알림과 물컵",
      cue_style: "I see your point, but...로 부드럽게 말하기",
    },
  };
  return variants[preset] ?? null;
}

function buildGeneratedSceneState(missionState, learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const scene = missionState.learner_visible_scene;
  const variant = firstUseSceneVariantPreset(missionState.scene_preset) || sceneVariantForSkill(missionState.target_skill, date);
  const frames = [
    {
      id: "enter",
      label: "장면 진입",
      visual: `${variant.setting}. ${scene.setup}`,
      cue: `${scene.situation} (${variant.prop})`,
      learner_action: "상황을 한 번 읽고, 말할 준비를 합니다.",
    },
    {
      id: "speak",
      label: "말하기 cue",
      visual: scene.ask,
      cue: `${variant.cue_style}: ${scene.ask}`,
      learner_action: missionState.required_learner_action,
    },
    {
      id: "repair",
      label: "막힘 수리",
      visual: `예시: ${scene.example}`,
      cue: `막히면 ${variant.cue_style} 방식으로 쉬운 단어에 돌아옵니다.`,
      learner_action: "recast 또는 rescue phrase를 사용해 다시 시도합니다.",
    },
    {
      id: "transfer",
      label: "전이 체크",
      visual: missionState.transfer_test,
      cue: "같은 말하기 행동을 다른 상황에도 옮길 수 있는지 확인합니다.",
      learner_action: missionState.transfer_test,
    },
  ];
  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    scene_id: `daily-scene-${todayStamp(date)}-${missionState.target_skill}`,
    mission_id: missionState.mission_id,
    title: `${scene.title} scene`,
    target_skill: missionState.target_skill,
    variant,
    transfer_test: missionState.transfer_test,
    required_evidence: {
      session_artifact: "artifacts/sessions/*.json",
      interaction_event_modalities: missionState.expected_evidence?.interaction_event_modalities ?? ["text"],
      speaking_backlog_item_id: missionState.expected_evidence?.speaking_backlog_item_id ?? "",
    },
    controls: {
      primary_path: "text-first",
      optional_modes: ["voice-transcript", "image-information-gap"],
      start_command: missionState.start_commands.text,
    },
    frames,
    claim_boundary:
      "This generated scene artifact supports local speaking practice and evidence collection. It does not prove learning outcomes, retention, realtime voice, or generated-media efficacy.",
  };
}

function generatedSceneHtml(state) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Generated Scene</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #162019;
      --muted: #5c6a60;
      --line: #d7ded8;
      --paper: #f7f8f3;
      --panel: #ffffff;
      --green: #2f7655;
      --blue: #2e6689;
      --amber: #9a6400;
      --soft: #e8f3ec;
      --soft-blue: #eaf2f7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1080px, calc(100% - 32px));
      margin: 0 auto;
      padding: 30px 0 48px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 22px; }
    h3 { font-size: 16px; }
    header {
      display: grid;
      gap: 10px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--line);
    }
    section {
      margin-top: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
    }
    .stage {
      display: grid;
      gap: 16px;
      min-height: 300px;
      background: linear-gradient(135deg, var(--soft), var(--soft-blue));
      border-color: #cfe2d5;
    }
    .frame-label {
      color: var(--green);
      font-weight: 800;
      text-transform: uppercase;
      font-size: 13px;
    }
    .visual {
      font-size: clamp(25px, 4vw, 42px);
      line-height: 1.12;
      font-weight: 780;
    }
    .cue {
      border-left: 5px solid var(--green);
      padding-left: 12px;
      color: var(--muted);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    button {
      appearance: none;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      color: var(--ink);
      padding: 9px 12px;
      font: inherit;
      font-weight: 720;
      cursor: pointer;
    }
    button[data-active="true"] {
      border-color: var(--green);
      background: var(--soft);
      color: var(--green);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #fbfcfa;
    }
    code {
      display: block;
      margin-top: 10px;
      padding: 12px;
      border-radius: 8px;
      background: #162019;
      color: #f7fbf7;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-size: 13px;
    }
    .boundary { border-left: 6px solid var(--amber); }
    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="frame-label">Generated scene artifact</p>
      <h1>${escapeHtml(state.title)}</h1>
      <p>${escapeHtml(state.variant.label)} · ${escapeHtml(state.variant.mood)}</p>
      <p class="cue">${escapeHtml(state.transfer_test)}</p>
    </header>

    <section class="stage" aria-live="polite">
      <p class="frame-label" data-scene-label>${escapeHtml(state.frames[0].label)}</p>
      <p class="visual" data-scene-visual>${escapeHtml(state.frames[0].visual)}</p>
      <p class="cue" data-scene-cue>${escapeHtml(state.frames[0].cue)}</p>
      <p data-scene-action>${escapeHtml(state.frames[0].learner_action)}</p>
      <div class="controls">
        <button type="button" data-scene-prev>Previous</button>
        <button type="button" data-scene-play data-active="false">Play</button>
        <button type="button" data-scene-next>Next</button>
      </div>
    </section>

    <section>
      <h2>Speaking Skill OS 연결</h2>
      <div class="grid">
        <div class="card"><h3>Target</h3><p>${escapeHtml(state.target_skill)}</p></div>
        <div class="card"><h3>Variant</h3><p>${escapeHtml(state.variant.setting)}</p></div>
        <div class="card"><h3>Evidence</h3><p>${escapeHtml(state.required_evidence.session_artifact)}</p></div>
        <div class="card"><h3>Mode</h3><p>${escapeHtml(state.controls.primary_path)}</p></div>
      </div>
      <code>${escapeHtml(state.controls.start_command)}</code>
    </section>

    <section class="boundary">
      <h2>경계</h2>
      <p>${escapeHtml(state.claim_boundary)}</p>
    </section>
  </main>
  <script>
    const frames = ${JSON.stringify(state.frames)};
    let index = 0;
    let timer = null;
    const label = document.querySelector("[data-scene-label]");
    const visual = document.querySelector("[data-scene-visual]");
    const cue = document.querySelector("[data-scene-cue]");
    const action = document.querySelector("[data-scene-action]");
    const play = document.querySelector("[data-scene-play]");
    function show(nextIndex) {
      index = (nextIndex + frames.length) % frames.length;
      const frame = frames[index];
      label.textContent = frame.label;
      visual.textContent = frame.visual;
      cue.textContent = frame.cue;
      action.textContent = frame.learner_action;
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      play.dataset.active = "false";
      play.textContent = "Play";
    }
    document.querySelector("[data-scene-prev]").addEventListener("click", () => {
      stop();
      show(index - 1);
    });
    document.querySelector("[data-scene-next]").addEventListener("click", () => {
      stop();
      show(index + 1);
    });
    play.addEventListener("click", () => {
      if (timer) {
        stop();
        return;
      }
      play.dataset.active = "true";
      play.textContent = "Pause";
      timer = setInterval(() => show(index + 1), 900);
    });
  </script>
</body>
</html>
`;
}

export function writeGeneratedMissionScene(learnerRoot = defaultLearnerRoot(), date = new Date(), missionState = null) {
  const paths = ensureLearnerStore(learnerRoot);
  const state = buildGeneratedSceneState(missionState || buildGeneratedMissionState(paths.root, date), paths.root, date);
  const stamp = todayStamp(date);
  const sceneStatePath = resolve(paths.sceneArtifactDir, `daily-scene-${stamp}.json`);
  const sceneHtmlPath = resolve(paths.sceneArtifactDir, `daily-scene-${stamp}.html`);
  writeFileSync(sceneStatePath, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(sceneHtmlPath, generatedSceneHtml(state));
  return {
    sceneStatePath,
    sceneHtmlPath,
    sceneUrl: `file://${sceneHtmlPath}`,
    state,
  };
}

function buildGeneratedStoryboardState(missionState, learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const contract = missionState.asset_contract;
  const storyboardAsset = contract.assets.find((asset) => asset.id === "remotion-storyboard");
  if (!storyboardAsset) {
    throw new Error("Generated storyboard requires remotion-storyboard asset in the mission contract.");
  }
  const scene = missionState.learner_visible_scene;
  const frames = [
    {
      label: "Scene setup",
      visual: scene.situation,
      narration: scene.setup,
      learner_action: "상황을 이해하고 답변을 한 문장으로 준비합니다.",
    },
    {
      label: "Speaking cue",
      visual: scene.ask,
      narration: `Target skill: ${missionState.target_skill}`,
      learner_action: missionState.required_learner_action,
    },
    {
      label: "Model answer",
      visual: scene.example,
      narration: "예시는 복사 정답이 아니라 시작점입니다.",
      learner_action: "예시를 그대로 쓰거나 나에게 맞게 조금 바꿉니다.",
    },
    {
      label: "Evidence checkpoint",
      visual: missionState.transfer_test,
      narration: `Evidence: ${contract.expected_evidence.session_artifact}`,
      learner_action: "실제 learner output을 session evidence로 저장해야 완료를 주장할 수 있습니다.",
    },
  ];
  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    storyboard_id: `mission-storyboard-${todayStamp(date)}-${missionState.target_skill}`,
    mission_id: missionState.mission_id,
    mission_title: scene.title,
    target_skill: missionState.target_skill,
    required_learner_action: missionState.required_learner_action,
    transfer_test: missionState.transfer_test,
    mode: storyboardAsset.mode,
    completion_role: storyboardAsset.completion_role,
    expected_evidence: storyboardAsset.expected_evidence,
    frames,
    blocked_claims: contract.blocked_claims,
    claim_boundary:
      "This generated storyboard is a local preparation artifact. It is not a video export, realtime voice, or learning-outcome evidence; completion still requires learner output saved as session evidence.",
  };
}

function generatedStoryboardHtml(state) {
  const framesJson = JSON.stringify(state.frames).replaceAll("</", "<\\/");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Mission Storyboard</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #657067; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --accent: #2f7d55; --warm: #fff3da; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(920px, calc(100% - 30px)); margin: 0 auto; padding: 32px 0 44px; }
    header, section { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); padding: 18px; margin-top: 14px; }
    header { background: var(--warm); }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(30px, 5vw, 48px); line-height: 1.08; letter-spacing: 0; }
    .subtle { color: var(--muted); }
    .stage { min-height: 260px; display: grid; gap: 14px; align-content: center; border-color: #ccd8ce; background: #fbfcfa; }
    .stage-label { color: var(--accent); font-weight: 780; }
    .visual { font-size: clamp(24px, 5vw, 44px); line-height: 1.15; font-weight: 800; }
    .cue { font-size: 18px; }
    .controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { appearance: none; border: 1px solid var(--line); border-radius: 8px; background: #fff; color: var(--ink); padding: 9px 12px; font: inherit; font-weight: 720; cursor: pointer; }
    button:focus-visible { outline: 3px solid rgba(47, 125, 85, 0.24); outline-offset: 2px; }
    .boundary { border-left: 6px solid #9a6400; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="subtle">Generated mission storyboard · Remotion-style preparation</p>
      <h1>${escapeHtml(state.mission_title)}</h1>
      <p>${escapeHtml(state.required_learner_action)}</p>
    </header>

    <section class="stage" aria-label="storyboard frame">
      <p class="stage-label" data-storyboard-label>${escapeHtml(state.frames[0].label)}</p>
      <p class="visual" data-storyboard-visual>${escapeHtml(state.frames[0].visual)}</p>
      <p class="cue" data-storyboard-narration>${escapeHtml(state.frames[0].narration)}</p>
      <p class="subtle" data-storyboard-action>${escapeHtml(state.frames[0].learner_action)}</p>
    </section>

    <section>
      <h2>Controls</h2>
      <div class="controls">
        <button type="button" data-storyboard-prev>Previous</button>
        <button type="button" data-storyboard-play data-active="false">Play</button>
        <button type="button" data-storyboard-next>Next</button>
      </div>
    </section>

    <section>
      <h2>Evidence link</h2>
      <p>Target: ${escapeHtml(state.target_skill)}</p>
      <p class="subtle">Required evidence: ${escapeHtml(state.expected_evidence.session_artifact)}</p>
      <p class="subtle">Transfer test: ${escapeHtml(state.transfer_test)}</p>
    </section>

    <section class="boundary">
      <h2>Boundary</h2>
      <p>${escapeHtml(state.claim_boundary)}</p>
    </section>
  </main>
  <script>
    const frames = ${framesJson};
    let index = 0;
    let timer = null;
    const label = document.querySelector("[data-storyboard-label]");
    const visual = document.querySelector("[data-storyboard-visual]");
    const narration = document.querySelector("[data-storyboard-narration]");
    const action = document.querySelector("[data-storyboard-action]");
    const play = document.querySelector("[data-storyboard-play]");
    function show(nextIndex) {
      index = (nextIndex + frames.length) % frames.length;
      const frame = frames[index];
      label.textContent = frame.label;
      visual.textContent = frame.visual;
      narration.textContent = frame.narration;
      action.textContent = frame.learner_action;
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
      play.dataset.active = "false";
      play.textContent = "Play";
    }
    document.querySelector("[data-storyboard-prev]").addEventListener("click", () => {
      stop();
      show(index - 1);
    });
    document.querySelector("[data-storyboard-next]").addEventListener("click", () => {
      stop();
      show(index + 1);
    });
    play.addEventListener("click", () => {
      if (timer) {
        stop();
        return;
      }
      play.dataset.active = "true";
      play.textContent = "Pause";
      timer = setInterval(() => show(index + 1), 1000);
    });
  </script>
</body>
</html>
`;
}

export function writeGeneratedMissionStoryboard(learnerRoot = defaultLearnerRoot(), date = new Date(), missionState = null) {
  const paths = ensureLearnerStore(learnerRoot);
  const state = buildGeneratedStoryboardState(missionState || buildGeneratedMissionState(paths.root, date), paths.root, date);
  const stamp = todayStamp(date);
  const storyboardStatePath = resolve(paths.storyboardArtifactDir, `mission-storyboard-${stamp}.json`);
  const storyboardHtmlPath = resolve(paths.storyboardArtifactDir, `mission-storyboard-${stamp}.html`);
  writeFileSync(storyboardStatePath, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(storyboardHtmlPath, generatedStoryboardHtml(state));
  return {
    storyboardStatePath,
    storyboardHtmlPath,
    storyboardUrl: `file://${storyboardHtmlPath}`,
    state,
  };
}

function missionAssetPriority(asset, context) {
  if (asset.id === "future-realtime-hook") {
    return {
      score: 95,
      action_label: "Realtime voice는 아직 선택하지 않음",
      reason: "Stable realtime runtime이 검증되기 전까지 mission completion path가 아닙니다.",
    };
  }
  if (!context.hasTextEvidence) {
    if (asset.id === "text-practice") {
      return {
        score: 10,
        action_label: "먼저 한 문장으로 시작",
        reason: "아직 text-first session evidence가 없어 canonical completion path를 먼저 열어야 합니다.",
      };
    }
    return {
      score: asset.id === "interactive-html-scene" ? 45 : 60,
      action_label: "text-first evidence 이후 사용",
      reason: "선택 asset은 learner output session evidence가 생긴 뒤 보조 경로로 쓰는 것이 안전합니다.",
    };
  }
  if (!context.hasImageEvidence && asset.id === "image-information-gap") {
    return {
      score: 15,
      action_label: "이미지 정보차 질문으로 확장",
      reason: "text evidence는 있으나 image modality evidence가 아직 없어 같은 speaking target을 시각 정보차로 전이합니다.",
    };
  }
  if (!context.hasVoiceEvidence && asset.id === "voice-transcript") {
    return {
      score: context.hasImageEvidence ? 15 : 35,
      action_label: "음성 transcript로 다시 말하기",
      reason: context.hasImageEvidence
        ? "text와 image evidence가 있으므로 transcript-backed voice path를 다음 전이로 시도합니다."
        : "voice evidence가 아직 없지만 image information-gap이 먼저 더 구체적인 단서를 줄 수 있습니다.",
    };
  }
  if (context.hasTextEvidence && context.hasImageEvidence && context.hasVoiceEvidence && asset.id === "interactive-html-scene") {
    return {
      score: 12,
      action_label: "scene frame으로 transfer review",
      reason: "text, image, voice evidence가 모두 있어 generated scene frame으로 전이 행동을 복습합니다.",
    };
  }
  if (asset.id === "remotion-storyboard") {
    return {
      score: context.hasTextEvidence && context.hasImageEvidence && context.hasVoiceEvidence ? 25 : 70,
      action_label: "storyboard는 준비 asset으로 보류",
      reason: "storyboard는 learner output을 대체하지 않으므로 core evidence path 뒤에 둡니다.",
    };
  }
  if (asset.id === "interactive-html-scene") {
    return {
      score: 30,
      action_label: "scene cue로 답변 준비",
      reason: "generated scene은 말하기 cue를 정리하지만 session evidence를 직접 대체하지 않습니다.",
    };
  }
  if (asset.id === "text-practice") {
    return {
      score: context.nextBacklog?.status === "needs_review" ? 20 : 55,
      action_label: "text-first로 약점 재시도",
      reason: context.nextBacklog?.status === "needs_review"
        ? "Speaking Skill OS에 needs-review 항목이 있어 text-first retry가 유효합니다."
        : "이미 text evidence가 있어 다른 modality 전이를 먼저 시도할 수 있습니다.",
    };
  }
  return {
    score: 80,
    action_label: "나중에 사용",
    reason: "현재 learner evidence state에서 우선순위가 낮습니다.",
  };
}

function buildMissionAssetDeckState(missionState, learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const contract = missionState.asset_contract;
  const contractErrors = validateMissionAssetContract(contract);
  if (contractErrors.length) {
    throw new Error(`Mission asset deck requires a valid contract: ${contractErrors.join("; ")}`);
  }
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const artifacts = readSessionArtifacts(paths, progress);
  const events = interactionEventsFromArtifacts(artifacts);
  const modalities = new Set(events.map((event) => event.modality));
  const nextBacklog = nextSpeakingBacklogItem(paths.root);
  const weakSkill = weakestLearnerSkill(learnerModel);
  const priorityContext = {
    hasTextEvidence: modalities.has("text"),
    hasImageEvidence: modalities.has("image"),
    hasVoiceEvidence: modalities.has("voice"),
    eventCount: events.length,
    nextBacklog,
    weakSkill,
  };
  const prioritizedAssets = contract.assets
    .map((asset) => ({
      ...asset,
      priority: missionAssetPriority(asset, priorityContext),
    }))
    .sort((a, b) => a.priority.score - b.priority.score || a.id.localeCompare(b.id))
    .map((asset, index) => ({
      ...asset,
      priority: {
        ...asset.priority,
        rank: index + 1,
        recommended_next: index === 0,
      },
    }));
  const topAsset = prioritizedAssets[0];
  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    deck_id: `mission-assets-${todayStamp(date)}`,
    mission_id: missionState.mission_id,
    mission_title: missionState.learner_visible_scene?.title ?? "",
    target_skill: contract.target_skill,
    required_learner_action: contract.required_learner_action,
    canonical_completion_path: contract.canonical_completion_path,
    evidence_required: contract.expected_evidence.session_artifact,
    transfer_test: contract.transfer_test,
    priority_context: {
      event_count: priorityContext.eventCount,
      modalities: [...modalities].sort(),
      next_backlog_item_id: nextBacklog?.id ?? "",
      next_backlog_skill: nextBacklog?.skill ?? "",
      weakest_skill: weakSkill?.skill ?? "",
    },
    top_asset_action: {
      asset_id: topAsset.id,
      mode: topAsset.mode,
      label: topAsset.priority.action_label,
      reason: topAsset.priority.reason,
      start_command: topAsset.start_command ?? "",
      expected_evidence: topAsset.expected_evidence,
    },
    assets: prioritizedAssets.map((asset) => ({
      id: asset.id,
      mode: asset.mode,
      completion_role: asset.completion_role,
      surface: asset.surface,
      prompt: asset.prompt,
      start_command: asset.start_command ?? "",
      requires_learner_output: asset.requires_learner_output,
      expected_evidence: asset.expected_evidence,
      storyboard_frames: asset.storyboard_frames ?? [],
      priority: asset.priority,
    })),
    completion_policy: {
      can_mark_complete_without_session_evidence: false,
      canonical_completion_path: "text-first",
      required_evidence: contract.expected_evidence.session_artifact,
    },
    blocked_claims: contract.blocked_claims,
    claim_boundary:
      "This asset deck is a local preparation surface. It does not complete the mission or prove learning until learner output is saved as session evidence.",
  };
}

function missionAssetDeckHtml(state) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Mission Asset Deck</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #162019;
      --muted: #5d685f;
      --line: #d7ded8;
      --paper: #f7f8f3;
      --panel: #ffffff;
      --green: #2f7655;
      --blue: #2e6689;
      --amber: #9a6400;
      --soft: #e8f3ec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1080px, calc(100% - 32px));
      margin: 0 auto;
      padding: 30px 0 48px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.05; letter-spacing: 0; }
    h2 { font-size: 22px; }
    h3 { font-size: 17px; }
    header, section {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
      margin-top: 16px;
    }
    header {
      display: grid;
      gap: 10px;
      background: var(--soft);
      border-color: #cfe2d5;
    }
    .subtle { color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .card {
      display: grid;
      gap: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      padding: 14px;
    }
    .mode {
      display: inline-flex;
      width: fit-content;
      border-radius: 999px;
      background: #e7f1ec;
      color: var(--green);
      padding: 3px 9px;
      font-size: 13px;
      font-weight: 750;
    }
    code {
      display: block;
      border-radius: 8px;
      padding: 10px;
      background: #162019;
      color: #f7fbf7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .boundary { border-left: 6px solid var(--amber); }
    @media (max-width: 840px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="subtle">Generated mission asset deck</p>
      <h1>${escapeHtml(state.mission_title)}</h1>
      <p>${escapeHtml(state.required_learner_action)}</p>
      <p class="subtle">Canonical path: ${escapeHtml(state.canonical_completion_path)} · evidence: ${escapeHtml(state.evidence_required)}</p>
    </header>

    <section>
      <h2>Next asset action</h2>
      <p>${escapeHtml(state.top_asset_action.label)}</p>
      <p class="subtle">${escapeHtml(state.top_asset_action.reason)}</p>
      ${state.top_asset_action.start_command ? `<code>${escapeHtml(state.top_asset_action.start_command)}</code>` : ""}
    </section>

    <section>
      <h2>Asset cards</h2>
      <div class="grid">
        ${state.assets
          .map(
            (asset) => `
        <article class="card" data-asset-id="${escapeHtml(asset.id)}">
          <span class="mode">${escapeHtml(asset.mode)}</span>
          <h3>#${escapeHtml(asset.priority?.rank ?? "")} ${escapeHtml(asset.completion_role)}</h3>
          <p>${escapeHtml(asset.prompt)}</p>
          <p class="subtle">${escapeHtml(asset.priority?.reason ?? "")}</p>
          <p class="subtle">learner output required: ${escapeHtml(String(asset.requires_learner_output))}</p>
          <p class="subtle">evidence: ${escapeHtml(asset.expected_evidence?.session_artifact ?? "")}</p>
          ${asset.artifact?.html ? `<p class="subtle">artifact: ${escapeHtml(asset.artifact.html)}</p>` : ""}
          ${asset.start_command ? `<code>${escapeHtml(asset.start_command)}</code>` : ""}
          ${
            asset.storyboard_frames?.length
              ? `<p class="subtle">storyboard: ${asset.storyboard_frames.map((frame) => escapeHtml(frame)).join(" / ")}</p>`
              : ""
          }
        </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="boundary">
      <h2>Completion policy</h2>
      <p>이 deck은 준비 표면입니다. 완료는 learner output이 session artifact로 저장될 때만 주장할 수 있습니다.</p>
      <p class="subtle">${escapeHtml(state.claim_boundary)}</p>
    </section>
  </main>
</body>
</html>
`;
}

export function writeGeneratedMissionAssetDeck(learnerRoot = defaultLearnerRoot(), date = new Date(), missionState = null) {
  const paths = ensureLearnerStore(learnerRoot);
  const sourceMissionState = missionState || buildGeneratedMissionState(paths.root, date);
  const storyboard = writeGeneratedMissionStoryboard(paths.root, date, sourceMissionState);
  const state = buildMissionAssetDeckState(sourceMissionState, paths.root, date);
  const stamp = todayStamp(date);
  const deckStatePath = resolve(paths.assetArtifactDir, `mission-assets-${stamp}.json`);
  const deckHtmlPath = resolve(paths.assetArtifactDir, `mission-assets-${stamp}.html`);
  const storyboardArtifact = {
    json: relative(paths.root, storyboard.storyboardStatePath),
    html: relative(paths.root, storyboard.storyboardHtmlPath),
    url: storyboard.storyboardUrl,
    frame_count: storyboard.state.frames.length,
    claim_boundary: storyboard.state.claim_boundary,
  };
  state.storyboard_artifact = storyboardArtifact;
  state.assets = state.assets.map((asset) =>
    asset.id === "remotion-storyboard"
      ? {
          ...asset,
          artifact: storyboardArtifact,
        }
      : asset,
  );
  writeFileSync(deckStatePath, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(deckHtmlPath, missionAssetDeckHtml(state));
  return {
    deckStatePath,
    deckHtmlPath,
    deckUrl: `file://${deckHtmlPath}`,
    state,
  };
}

function dateWithinDays(dateValue, now, days) {
  if (!dateValue || !Number.isFinite(Date.parse(dateValue))) return false;
  const then = new Date(dateValue.length === 10 ? `${dateValue}T00:00:00.000Z` : dateValue);
  const delta = now.getTime() - then.getTime();
  return delta >= 0 && delta <= days * 86400000;
}

function buildJourneyWindow(artifacts, now, days) {
  const windowArtifacts = artifacts.filter((artifact) => dateWithinDays(artifact.date, now, days));
  const events = interactionEventsFromArtifacts(windowArtifacts);
  return {
    days,
    session_count: windowArtifacts.length,
    event_count: events.length,
    modalities: buildInteractionEventSummary(events).modalities,
    saved_phrases: uniqueRecent(
      windowArtifacts.map((artifact) => artifact.mirror?.reviewPhrase ?? artifact.mirror?.recast ?? ""),
      8,
    ),
    transfer_targets: buildInteractionEventSummary(events).transfer_targets,
  };
}

function latestLearnerReportPath(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  if (!existsSync(paths.reportArtifactDir)) return "";
  const entries = readdirSync(paths.reportArtifactDir)
    .filter((entry) => /^learner-report-.*\.json$/.test(entry))
    .sort();
  return entries.length ? resolve(paths.reportArtifactDir, entries.at(-1)) : "";
}

function readLatestLearnerReport(learnerRoot = defaultLearnerRoot()) {
  const reportPath = latestLearnerReportPath(learnerRoot);
  if (!reportPath) return null;
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const paths = learnerPaths(learnerRoot);
  return {
    path: relative(paths.root, reportPath),
    html: relative(paths.root, reportPath.replace(/\.json$/, ".html")),
    generated_at: report.generated_at,
    seven_day: report.windows?.seven_day,
    thirty_day: report.windows?.thirty_day,
    next_focus: report.next_focus,
    claim_boundary: report.claim_boundary,
  };
}

export function buildLearnerReport(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const speakingBacklog = readSpeakingBacklog(paths.speakingBacklog);
  const vocabulary = readVocabulary(paths.vocabulary);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const artifacts = readSessionArtifacts(paths, progress);
  const events = interactionEventsFromArtifacts(artifacts);
  const weeklyMirror = readLatestWeeklyMirror(paths.root);
  const nextBacklog = nextSpeakingBacklogItem(paths.root);
  const sevenDay = buildJourneyWindow(artifacts, date, 7);
  const thirtyDay = buildJourneyWindow(artifacts, date, 30);

  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    report_id: `learner-report-${todayStamp(date)}`,
    windows: {
      seven_day: sevenDay,
      thirty_day: thirtyDay,
    },
    practice_evidence: {
      total_sessions: Array.isArray(progress.sessions) ? progress.sessions.length : 0,
      total_events: events.length,
      interaction_summary: buildInteractionEventSummary(events),
      recent_saved_phrases: uniqueRecent(vocabulary.personal_phrases, 8),
      due_review_count: listDueReviewItems(paths.root, date).length,
      total_review_items: reviewQueue.items.length,
    },
    speaking_skill_os: {
      backlog_count: speakingBacklog.items.length,
      open_count: speakingBacklog.items.filter((item) => ["open", "needs_review", "in_progress"].includes(item.status)).length,
      passed_count: speakingBacklog.items.filter((item) => item.status === "passed").length,
      next_item: nextBacklog,
      skill_evidence: skillEvidenceSummary(learnerModel),
      average_utterance_words: learnerModel.baseline.average_utterance_words,
      repair_phrase_count: learnerModel.baseline.repair_phrase_count,
    },
    next_focus: weeklyMirror?.next_focus ?? {
      skill: nextBacklog?.skill || "starts",
      reason: nextBacklog
        ? `Current Speaking Skill OS item: ${nextBacklog.label}`
        : "No weekly mirror yet; begin with one small English turn.",
      suggested_phrase:
        vocabulary.personal_phrases.at(-1) || nextBacklog?.drill_prompt || "I want to practice a little today.",
      prompt: nextBacklog?.drill_prompt || "Say one small sentence about today, then save one useful phrase.",
    },
    generated_artifacts: {
      latest_mission: readLatestGeneratedMission(paths.root),
      latest_scene: readLatestGeneratedScene(paths.root),
      latest_storyboard: readLatestGeneratedStoryboard(paths.root),
      latest_asset_deck: readLatestMissionAssetDeck(paths.root),
      latest_weekly_mirror: weeklyMirror
        ? {
            generated_at: weeklyMirror.generated_at,
            window: weeklyMirror.window,
            next_focus: weeklyMirror.next_focus,
          }
        : null,
    },
    claim_boundary:
      "This report summarizes local practice evidence only. It does not certify fluency, guarantee improvement, or replace real-world conversation evidence.",
  };
}

function learnerReportHtml(report) {
  const seven = report.windows.seven_day;
  const thirty = report.windows.thirty_day;
  const evidence = report.practice_evidence;
  const os = report.speaking_skill_os;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Learner Report</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #162019;
      --muted: #5d685f;
      --line: #d7ded8;
      --paper: #f7f8f3;
      --panel: #ffffff;
      --green: #2f7655;
      --blue: #2e6689;
      --amber: #9a6400;
      --soft: #e8f3ec;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 30px 0 48px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.06; letter-spacing: 0; }
    h2 { font-size: 21px; }
    h3 { font-size: 15px; }
    header {
      display: grid;
      gap: 10px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--line);
    }
    section {
      margin-top: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      background: #fbfcfa;
    }
    .metric b {
      display: block;
      color: var(--green);
      font-size: 28px;
      line-height: 1.1;
    }
    .focus {
      background: var(--soft);
      border-color: #cfe2d5;
    }
    .subtle { color: var(--muted); }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 9px;
      background: #fbfcfa;
      color: var(--muted);
      font-size: 13px;
    }
    ul { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 8px; }
    code {
      display: block;
      margin-top: 10px;
      padding: 12px;
      border-radius: 8px;
      background: #162019;
      color: #f7fbf7;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-size: 13px;
    }
    .boundary { border-left: 6px solid var(--amber); }
    @media (max-width: 820px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="subtle">Learner report · ${escapeHtml(report.generated_at.slice(0, 10))}</p>
      <h1>내 영어 회화 여정 리포트</h1>
      <p>최근 연습 증거를 7일과 30일 창으로 나누어 보여줍니다.</p>
    </header>

    <section class="focus">
      <h2>다음 focus</h2>
      <p>${escapeHtml(report.next_focus.prompt)}</p>
      <p class="subtle">${escapeHtml(report.next_focus.reason)}</p>
    </section>

    <section>
      <h2>7일 / 30일 변화</h2>
      <div class="grid">
        <div class="metric"><span>7일 세션</span><b>${escapeHtml(seven.session_count)}</b><span class="subtle">${escapeHtml(seven.event_count)} events</span></div>
        <div class="metric"><span>30일 세션</span><b>${escapeHtml(thirty.session_count)}</b><span class="subtle">${escapeHtml(thirty.event_count)} events</span></div>
        <div class="metric"><span>저장 표현</span><b>${escapeHtml(evidence.recent_saved_phrases.length)}</b><span class="subtle">${escapeHtml(evidence.due_review_count)} due</span></div>
      </div>
      <div class="chips">
        ${(thirty.modalities.length ? thirty.modalities : ["text-first"]).map((mode) => `<span class="chip">${escapeHtml(mode)}</span>`).join("")}
      </div>
    </section>

    <section>
      <h2>Speaking Skill OS</h2>
      <div class="grid">
        <div class="metric"><span>Open</span><b>${escapeHtml(os.open_count)}</b></div>
        <div class="metric"><span>Passed</span><b>${escapeHtml(os.passed_count)}</b></div>
        <div class="metric"><span>Avg words</span><b>${escapeHtml(os.average_utterance_words)}</b></div>
      </div>
      ${
        os.next_item
          ? `<h3>다음 약점 카드</h3><p>${escapeHtml(os.next_item.label)}</p><p class="subtle">${escapeHtml(os.next_item.transfer_test)}</p>`
          : '<p class="subtle">아직 다음 약점 카드가 없습니다.</p>'
      }
    </section>

    <section>
      <h2>내가 남긴 표현과 전이 목표</h2>
      ${htmlList(
        evidence.recent_saved_phrases,
        (phrase) => escapeHtml(phrase),
        "아직 저장된 표현이 없습니다.",
      )}
      <h3>Transfer targets</h3>
      ${htmlList(
        evidence.interaction_summary.transfer_targets,
        (target) => escapeHtml(target),
        "아직 전이 목표가 없습니다.",
      )}
    </section>

    <section>
      <h2>연결된 artifact</h2>
      ${
        report.generated_artifacts.latest_mission
          ? `<p>${escapeHtml(report.generated_artifacts.latest_mission.title)}</p><code>${escapeHtml(report.generated_artifacts.latest_mission.html)}</code>`
          : '<p class="subtle">아직 연결된 mission artifact가 없습니다.</p>'
      }
      ${
        report.generated_artifacts.latest_scene
          ? `<p>${escapeHtml(report.generated_artifacts.latest_scene.title)} · ${escapeHtml(report.generated_artifacts.latest_scene.variant_label)}</p><code>${escapeHtml(report.generated_artifacts.latest_scene.html)}</code>`
          : '<p class="subtle">아직 연결된 scene artifact가 없습니다.</p>'
      }
      ${
        report.generated_artifacts.latest_asset_deck
          ? `<p>Mission asset deck · ${escapeHtml(report.generated_artifacts.latest_asset_deck.asset_count)} assets</p><code>${escapeHtml(report.generated_artifacts.latest_asset_deck.html)}</code>`
          : '<p class="subtle">아직 연결된 asset deck이 없습니다.</p>'
      }
      ${
        report.generated_artifacts.latest_storyboard
          ? `<p>Mission storyboard · ${escapeHtml(report.generated_artifacts.latest_storyboard.frame_count)} frames</p><code>${escapeHtml(report.generated_artifacts.latest_storyboard.html)}</code>`
          : '<p class="subtle">아직 연결된 storyboard artifact가 없습니다.</p>'
      }
    </section>

    <section class="boundary">
      <h2>경계</h2>
      <p>${escapeHtml(report.claim_boundary)}</p>
    </section>
  </main>
</body>
</html>
`;
}

export function writeLearnerReport(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const report = buildLearnerReport(paths.root, date);
  const reportPath = resolve(paths.reportArtifactDir, `learner-report-${todayStamp(date)}.json`);
  const reportHtmlPath = resolve(paths.reportArtifactDir, `learner-report-${todayStamp(date)}.html`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(reportHtmlPath, learnerReportHtml(report));
  return {
    reportPath,
    reportHtmlPath,
    reportUrl: `file://${reportHtmlPath}`,
    report,
  };
}

function latestPilotReport(paths) {
  const pilotDir = resolve(paths.root, "artifacts/pilot");
  if (!existsSync(pilotDir)) return null;
  const reports = readdirSync(pilotDir)
    .filter((entry) => /^pilot-report-.*\.json$/.test(entry))
    .sort();
  if (!reports.length) return null;
  const reportPath = resolve(pilotDir, reports.at(-1));
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  return {
    path: relative(paths.root, reportPath),
    generated_at: report.generated_at,
    daily_session_count: report.daily_session_count,
    decision: report.rubric?.decision ?? "",
    claim_boundary: report.claim_boundary,
  };
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

function pilotCards() {
  return [
    {
      id: "today_snapshot",
      title: "첫 장면 고르기",
      ask: "아래 장면 중 하나를 고르거나, 바로 영어 한 문장만 말해보세요.",
      example: "I had a quiet day and did a few small tasks.",
      scene_choices: pilotOpeningSceneChoices(),
    },
    {
      id: "meaning_check",
      title: "잠깐, 무슨 뜻이야?",
      ask: "어디에서 만나자는 뜻인지 영어로 한 번만 다시 물어보세요.",
      example: "Which place do you mean?",
    },
    {
      id: "stuck_rescue",
      title: "막혔을 때 도망가지 않기",
      ask: '영어로 "정확한 단어는 모르겠지만..." 하고 계속 이어가 보세요.',
      example: "I do not know the exact word, but I mean this place feels comfortable.",
    },
    {
      id: "scene_snap",
      title: "내 주변 스냅샷",
      ask: "주변에 보이는 장소나 물건을 영어로 한두 문장 묘사해보세요.",
      example: "I am in an office. There are many desks, chairs, and monitors.",
    },
    {
      id: "comfort_check",
      title: "오늘의 체감",
      ask: "0부터 5까지 점수와 이유를 아주 짧게 말해보세요.",
      example: "My comfort score is 3. I feel okay, but I am a little tired.",
    },
  ];
}

function pilotDayCards() {
  return [
    {
      id: "clarify-usual-place",
      skill: "clarification",
      title: "확인 질문 만들기",
      ask: '친구가 "Let\'s meet at the usual place after work."라고 말했습니다. 어디에서 만나자는 뜻인지 확인하는 영어 질문을 한 문장만 해보세요.',
      example: "Which place do you mean?",
    },
    {
      id: "repair-wrong-order",
      skill: "repair",
      title: "말실수 고치기",
      ask: "카페에서 음료 이름을 잘못 말했습니다. 방금 말한 주문을 정정하는 영어 문장을 한 문장으로 해보세요.",
      example: "Sorry, I meant iced latte, not hot latte.",
    },
    {
      id: "image-info-gap",
      skill: "image_description",
      title: "보이는 정보 설명하기",
      ask: "상대가 사진을 못 보고 있습니다. 사진 속 장소를 상대가 상상할 수 있게 영어 한두 문장으로 설명해보세요.",
      example: "It looks like a meeting room. There is a long table and a screen on the wall.",
    },
    {
      id: "soft-disagreement",
      skill: "soft_disagreement",
      title: "부드럽게 다르게 말하기",
      ask: "동료가 지금 바로 야근하자고 제안했습니다. 상대 기분을 상하게 하지 않고 오늘은 어렵다고 영어로 한 문장 말해보세요.",
      example: "I understand, but I cannot stay late today.",
    },
    {
      id: "follow-up-invitation",
      skill: "follow_up",
      title: "대화를 이어가기",
      ask: "새로 만난 사람이 주말에 등산을 갔다고 말했습니다. 이야기를 이어갈 follow-up 질문을 영어로 한 문장 해보세요.",
      example: "That sounds nice. Where did you go hiking?",
    },
  ];
}

function pilotDayCard(dayNumber) {
  const cards = pilotDayCards();
  return cards[(Math.max(1, dayNumber) - 1) % cards.length];
}

function readActivePilotState(paths) {
  const pilotStatePath = resolve(paths.root, "pilot-state.json");
  if (!existsSync(pilotStatePath)) return null;
  const state = JSON.parse(readFileSync(pilotStatePath, "utf8"));
  if (state.status === "complete") return null;
  const nextCardJsonPath = resolve(paths.root, "artifacts/pilot/pilot-next-card.json");
  const nextCardHtmlPath = resolve(paths.root, "artifacts/pilot/pilot-next-card.html");
  const launchCardJsonPath = resolve(paths.root, "artifacts/pilot/pilot-launch-card.json");
  const launchCardHtmlPath = resolve(paths.root, "artifacts/pilot/pilot-launch-card.html");
  const turnPacketJsonPath = resolve(paths.root, "artifacts/pilot/pilot-turn-packet.json");
  const turnPacketHtmlPath = resolve(paths.root, "artifacts/pilot/pilot-turn-packet.html");
  const evidenceGapJsonPath = resolve(paths.root, "artifacts/pilot/pilot-evidence-gap.json");
  const evidenceGapHtmlPath = resolve(paths.root, "artifacts/pilot/pilot-evidence-gap.html");
  const launchCardArtifact =
    existsSync(launchCardJsonPath) && existsSync(launchCardHtmlPath)
      ? {
          json: relative(paths.root, launchCardJsonPath),
          html: relative(paths.root, launchCardHtmlPath),
          url: `file://${launchCardHtmlPath}`,
        }
      : null;
  const nextCardArtifact =
    existsSync(nextCardJsonPath) && existsSync(nextCardHtmlPath)
      ? {
          json: relative(paths.root, nextCardJsonPath),
          html: relative(paths.root, nextCardHtmlPath),
          url: `file://${nextCardHtmlPath}`,
      }
      : null;
  const turnPacketArtifact =
    existsSync(turnPacketJsonPath) && existsSync(turnPacketHtmlPath)
      ? {
          json: relative(paths.root, turnPacketJsonPath),
          html: relative(paths.root, turnPacketHtmlPath),
          url: `file://${turnPacketHtmlPath}`,
        }
      : null;
  const evidenceGapArtifact =
    existsSync(evidenceGapJsonPath) && existsSync(evidenceGapHtmlPath)
      ? {
          json: relative(paths.root, evidenceGapJsonPath),
          html: relative(paths.root, evidenceGapHtmlPath),
          url: `file://${evidenceGapHtmlPath}`,
        }
      : null;
  const nextCardState = nextCardArtifact ? JSON.parse(readFileSync(nextCardJsonPath, "utf8")) : null;
  const replyCardJsonPath = resolve(paths.root, "artifacts/pilot/pilot-reply-card.json");
  const replyCardHtmlPath = resolve(paths.root, "artifacts/pilot/pilot-reply-card.html");
  const latestReplyCard =
    existsSync(replyCardJsonPath) && existsSync(replyCardHtmlPath)
      ? {
          json: relative(paths.root, replyCardJsonPath),
          html: relative(paths.root, replyCardHtmlPath),
          url: `file://${replyCardHtmlPath}`,
        }
      : null;
  const cards = pilotCards();
  const completedDailySessions = (state.days ?? []).filter((day) => day.status === "complete").length;
  const baselineAnswers = state.partial?.baseline?.answers?.length ?? 0;
  const finalAnswers = state.partial?.final?.answers?.length ?? 0;
  const minimumValidDailySessions = state.minimum_valid_daily_sessions ?? 5;
  let nextPhase = "baseline";
  let nextCard = cards[Math.min(baselineAnswers, cards.length - 1)];
  let nextDay = null;

  if (state.baseline && completedDailySessions < minimumValidDailySessions) {
    nextPhase = "day";
    nextDay = completedDailySessions + 1;
    const dayCard = pilotDayCard(nextDay);
    nextCard = {
      id: `day-${nextDay}`,
      source_id: dayCard.id,
      skill: dayCard.skill,
      title: `Pilot Day ${nextDay}: ${dayCard.title}`,
      ask: dayCard.ask,
      example: dayCard.example,
    };
  } else if (state.baseline && completedDailySessions >= minimumValidDailySessions && !state.final_sample) {
    nextPhase = "final";
    nextCard = cards[Math.min(finalAnswers, cards.length - 1)];
  }

  return {
    pilot_id: state.pilot_id,
    status: state.status,
    participant: state.participant?.label ?? "repository owner / self pilot participant",
    baseline_ready: Boolean(state.baseline),
    completed_daily_sessions: completedDailySessions,
    minimum_valid_daily_sessions: minimumValidDailySessions,
    target_days: state.target_days ?? 7,
    partial: {
      baseline_answers: baselineAnswers,
      final_answers: finalAnswers,
      day_captures: state.partial?.days?.length ?? 0,
    },
    next_card: {
      phase: nextPhase,
      day: nextDay,
      card_id: nextCard?.id ?? "",
      title: nextCard?.title ?? "",
      ask: nextCard?.ask ?? "",
      example: nextCard?.example ?? "",
      scene_choices: nextCardState?.next_card?.scene_choices ?? nextCard?.scene_choices ?? [],
    },
    learner_prompt:
      nextPhase === "baseline" && baselineAnswers === 0
        ? nextCardState?.next_card?.ask ?? "아래 장면 중 하나를 고르거나, 바로 영어 한 문장만 말해보세요."
        : nextCard?.ask ?? "",
    launch_card_artifact: launchCardArtifact,
    turn_packet_artifact: turnPacketArtifact,
    evidence_gap_artifact: evidenceGapArtifact,
    current_card_artifact: nextCardArtifact,
    assistant_prompt: nextCardState?.assistant_prompt?.text ?? "",
    quick_replies: (nextCardState?.quick_replies ?? []).map((reply) => ({
      id: reply.id,
      text: reply.text,
      note: reply.note,
    })),
    latest_reply_card: latestReplyCard,
    state_file: relative(paths.root, pilotStatePath),
    claim_boundary:
      "Active pilot status shows local owner/self pilot progress only. It does not prove learning outcomes.",
  };
}

export function buildPersonalLearnerCockpit(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const dailyCockpit = buildDailyCockpit(paths.root, date);
  const progress = readProgress(paths.progress);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const reviewQueue = readReviewQueue(paths.reviewQueue);
  const speakingBacklog = readSpeakingBacklog(paths.speakingBacklog);
  const vocabulary = readVocabulary(paths.vocabulary);
  const artifacts = readSessionArtifacts(paths, progress);
  const interactionEvents = interactionEventsFromArtifacts(artifacts);
  const weeklyMirror = readLatestWeeklyMirror(paths.root);
  const latestReport = latestPilotReport(paths);
  const latestLearnerReport = readLatestLearnerReport(paths.root);
  const latestMission = readLatestGeneratedMission(paths.root);
  const latestScene = readLatestGeneratedScene(paths.root);
  const latestStoryboard = readLatestGeneratedStoryboard(paths.root);
  const latestAssetDeck = readLatestMissionAssetDeck(paths.root);
  const activePilot = readActivePilotState(paths);
  const nextBacklog = dailyCockpit.speaking_os.next_item;
  const todayCodexPrompt = nextBacklog
    ? `오늘은 "${nextBacklog.label}" 연습을 한 문장씩 해볼래. 내가 답하면 바로 자연스럽게 고쳐주고, 마지막에 다음에 쓸 표현 하나만 남겨줘.`
    : "오늘 5분 영어 미션 시작해줘. 한 문장씩 묻고, 내가 답하면 자연스럽게 고쳐줘.";
  const missionCodexPrompt = dailyCockpit.suggested_scenario.goal
    ? `오늘 미션으로 "${dailyCockpit.suggested_scenario.goal}" 상황을 영어로 연습하고 싶어.`
    : todayCodexPrompt;

  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    surface: {
      name: "English Learning Harness Personal Cockpit",
      audience: "한국인 영어 회화 학습자",
      purpose: "오늘의 말하기 미션, 내 약점, 복습, 멀티모달 증거, 7일/30일 여정을 한 화면에서 이어줍니다.",
    },
    today: {
      title: dailyCockpit.suggested_scenario.title,
      goal: dailyCockpit.suggested_scenario.goal,
      rescue_phrase: dailyCockpit.suggested_scenario.rescue_phrase,
      mode: dailyCockpit.suggested_scenario.mode,
      selection_reason: dailyCockpit.suggested_scenario.selection_reason,
      codex_start_prompt: todayCodexPrompt,
      mission_prompt: missionCodexPrompt,
    },
    return_state: dailyCockpit.return_state,
    speaking_skill_os: {
      backlog_count: speakingBacklog.items.length,
      open_count: speakingBacklog.items.filter((item) => ["open", "needs_review", "in_progress"].includes(item.status)).length,
      passed_count: speakingBacklog.items.filter((item) => item.status === "passed").length,
      next_item: nextBacklog,
      skill_evidence: skillEvidenceSummary(learnerModel),
      average_utterance_words: learnerModel.baseline.average_utterance_words,
      repair_phrase_count: learnerModel.baseline.repair_phrase_count,
    },
    review: {
      due_count: dailyCockpit.due_review.count,
      due_items: dailyCockpit.due_review.items,
      total_review_items: reviewQueue.items.length,
      saved_phrase_count: vocabulary.personal_phrases.length,
      recent_saved_phrases: phraseVault(paths.root).slice(-5).reverse(),
    },
    multimodal: {
      summary: buildInteractionEventSummary(interactionEvents),
      recent_events: interactionEvents.slice(-5).map((event) => ({
        modality: event.modality,
        learner_intent: event.learner_intent,
        trouble_source: event.trouble_source,
        saved_phrase: event.saved_phrase,
        transfer_targets: event.transfer_targets ?? [],
      })),
      claim_boundary:
        "Multimodal entries are local interaction events. They do not judge pronunciation, image understanding, or real-world transfer.",
    },
    journey: {
      seven_day: buildJourneyWindow(artifacts, date, 7),
      thirty_day: buildJourneyWindow(artifacts, date, 30),
      latest_weekly_mirror: weeklyMirror
        ? {
            generated_at: weeklyMirror.generated_at,
            window: weeklyMirror.window,
            next_focus: weeklyMirror.next_focus,
            interaction_event_summary: weeklyMirror.interaction_event_summary,
          }
        : null,
      latest_report: latestReport,
      latest_learner_report: latestLearnerReport,
      latest_generated_mission: latestMission,
      latest_generated_scene: latestScene,
      latest_generated_storyboard: latestStoryboard,
      latest_mission_asset_deck: latestAssetDeck,
      active_pilot: activePilot,
    },
    active_pilot: activePilot,
    next_asset_action: latestAssetDeck?.top_asset_action
      ? {
          deck: latestAssetDeck.html,
          asset_id: latestAssetDeck.top_asset_action.asset_id,
          mode: latestAssetDeck.top_asset_action.mode,
          label: latestAssetDeck.top_asset_action.label,
          reason: latestAssetDeck.top_asset_action.reason,
          expected_evidence: latestAssetDeck.top_asset_action.expected_evidence,
        }
      : null,
    next_actions: [
      {
        label: "오늘 미션 시작",
        codex_prompt: todayCodexPrompt,
      },
      ...(latestAssetDeck?.top_asset_action
        ? [
            {
              label: latestAssetDeck.top_asset_action.label,
              codex_prompt: `오늘 미션에 맞춰 ${latestAssetDeck.top_asset_action.label} 활동을 Codex 대화 안에서 바로 시작해줘.`,
              reason: latestAssetDeck.top_asset_action.reason,
            },
          ]
        : []),
      {
        label: "복습 확인",
        codex_prompt: "오늘 복습할 표현이 있으면 하나만 골라서 짧게 말하기 연습하자.",
      },
      {
        label: "7일 요약 만들기",
        codex_prompt: "최근 7일 영어 연습을 내가 이해하기 쉽게 요약해줘.",
      },
      {
        label: "학습 리포트 만들기",
        codex_prompt: "내 최근 영어 학습 리포트를 짧게 보여주고 다음 focus를 알려줘.",
      },
      {
        label: "증거 리포트 내보내기",
        codex_prompt: "내 로컬 학습 증거를 정리해서 어떤 자료가 쌓였는지 설명해줘.",
      },
    ],
    files: {
      state: relative(paths.root, paths.learnerCockpitState),
      html: relative(paths.root, paths.learnerCockpit),
      home: relative(paths.root, paths.learnerHome),
      latest_journal: dailyCockpit.latest_journal,
      latest_weekly_mirror: dailyCockpit.latest_weekly_mirror,
      latest_generated_mission: latestMission?.html ?? "",
      latest_generated_scene: latestScene?.html ?? "",
      latest_generated_storyboard: latestStoryboard?.html ?? "",
      latest_mission_asset_deck: latestAssetDeck?.html ?? "",
      latest_learner_report: latestLearnerReport?.html ?? "",
      active_pilot_state: activePilot?.state_file ?? "",
    },
    claim_boundary:
      "This cockpit is a local learner product surface. It connects practice evidence and next actions, but does not certify fluency or guarantee improvement.",
  };
}

function personalLearnerCockpitHtml(state) {
  const os = state.speaking_skill_os;
  const nextItem = os.next_item;
  const multimodal = state.multimodal.summary;
  const seven = state.journey.seven_day;
  const thirty = state.journey.thirty_day;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English Learning Personal Cockpit</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #152019;
      --muted: #5a675f;
      --line: #d7ded8;
      --paper: #f6f8f2;
      --panel: #ffffff;
      --green: #2f7655;
      --blue: #2e6689;
      --amber: #9a6400;
      --soft-green: #e8f3ec;
      --soft-blue: #eaf2f7;
      --soft-amber: #fff1d7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    main {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: clamp(30px, 5vw, 52px); line-height: 1.08; letter-spacing: 0; }
    h2 { font-size: 21px; line-height: 1.2; }
    h3 { font-size: 15px; }
    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 20px;
    }
    .subtle { color: var(--muted); }
    .badge {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      padding: 12px 14px;
      min-width: 190px;
    }
    .badge strong { display: block; font-size: 22px; color: var(--green); }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.75fr);
      gap: 16px;
      margin-top: 18px;
      align-items: start;
    }
    .stack { display: grid; gap: 16px; }
    section, .panel {
      border: 1px solid var(--line);
      background: var(--panel);
      border-radius: 8px;
      padding: 18px;
    }
    .mission {
      background: var(--soft-green);
      border-color: #cfe2d5;
    }
    .mission .ask {
      margin-top: 12px;
      font-size: 24px;
      font-weight: 760;
      line-height: 1.25;
    }
    .prompt {
      display: block;
      margin-top: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #f7fbf7;
      color: var(--ink);
      border: 1px solid #cfe2d5;
      font-size: 15px;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .metric {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcfa;
    }
    .metric b {
      display: block;
      color: var(--green);
      font-size: 24px;
      line-height: 1.1;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 9px;
      background: #fbfcfa;
      color: var(--muted);
      font-size: 13px;
    }
    .reply-grid {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }
    .reply-choice {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      padding: 12px;
    }
    .reply-choice p { font-weight: 700; }
    .copy-reply {
      border: 1px solid #b7cbbb;
      border-radius: 8px;
      background: #eef7f0;
      color: #225f3d;
      padding: 8px 10px;
      font: inherit;
      cursor: pointer;
      white-space: nowrap;
    }
    .copy-reply[data-copied="true"] {
      background: #dff1e5;
    }
    ul { margin: 12px 0 0; padding-left: 18px; display: grid; gap: 8px; }
    li strong { color: var(--green); }
    details {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      padding: 12px;
    }
    details + details { margin-top: 8px; }
    summary { cursor: pointer; font-weight: 700; }
    .blue { background: var(--soft-blue); border-color: #d2e3ec; }
    .amber { background: var(--soft-amber); border-color: #ead5a8; }
    .boundary { border-left: 6px solid var(--amber); }
    @media (max-width: 880px) {
      header, .layout { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>오늘의 영어 cockpit</h1>
        <p class="subtle">${escapeHtml(state.surface.purpose)}</p>
      </div>
      <div class="badge">
        <span>30일 여정</span>
        <strong>${escapeHtml(thirty.session_count)}회</strong>
        <span class="subtle">${escapeHtml(state.return_state.message)}</span>
      </div>
    </header>

    <div class="layout">
      <div class="stack">
        <section class="mission" aria-labelledby="today-mission">
          <h2 id="today-mission">오늘의 미션</h2>
          <p class="ask">${escapeHtml(state.today.goal)}</p>
          <p class="subtle">막히면: ${escapeHtml(state.today.rescue_phrase)}</p>
          <p class="prompt"><strong>Codex에게 이렇게 말하세요</strong><br>${escapeHtml(state.today.codex_start_prompt)}</p>
        </section>

        ${
          state.active_pilot
            ? `<section class="amber" aria-labelledby="active-pilot">
          <h2 id="active-pilot">진행 중인 owner pilot</h2>
          <p class="subtle">${escapeHtml(state.active_pilot.completed_daily_sessions)} / ${escapeHtml(state.active_pilot.minimum_valid_daily_sessions)} daily sessions · Day 0 cards ${escapeHtml(state.active_pilot.partial.baseline_answers)} / 5</p>
          <div class="panel">
            <h3>${escapeHtml(state.active_pilot.next_card.title)}</h3>
            <p class="ask">${escapeHtml(state.active_pilot.learner_prompt)}</p>
            <p class="subtle">예시: ${escapeHtml(state.active_pilot.next_card.example)}</p>
            ${
              state.active_pilot.next_card.scene_choices?.length
                ? `<div class="reply-grid" aria-label="pilot opening scene choices">
              ${state.active_pilot.next_card.scene_choices
                .map(
                  (choice, index) => `<div class="reply-choice">
                <div>
                  <p>${escapeHtml(index + 1)}. ${escapeHtml(choice.label)}</p>
                  <span class="subtle">${escapeHtml(choice.setup)}</span>
                  <span class="subtle">${escapeHtml(choice.starter)}</span>
                </div>
              </div>`,
                )
                .join("")}
            </div>`
                : ""
            }
            ${
              state.active_pilot.launch_card_artifact
                ? `<p class="subtle">시작/재개 카드: <a href="${escapeHtml(state.active_pilot.launch_card_artifact.url)}">Pilot 시작/재개 카드 열기</a></p>`
                : ""
            }
            ${
              state.active_pilot.turn_packet_artifact
                ? `<p class="subtle">다음 대화 턴: <a href="${escapeHtml(state.active_pilot.turn_packet_artifact.url)}">Codex 진행 카드 열기</a></p>`
                : ""
            }
            ${
              state.active_pilot.evidence_gap_artifact
                ? `<p class="subtle">여정 체크: <a href="${escapeHtml(state.active_pilot.evidence_gap_artifact.url)}">남은 연습 증거 보기</a></p>`
                : ""
            }
            ${
              state.active_pilot.current_card_artifact
                ? `<p class="subtle">현재 카드: <a href="${escapeHtml(state.active_pilot.current_card_artifact.url)}">현재 pilot 카드 열기</a></p>`
                : ""
            }
          </div>
          ${
            state.active_pilot.assistant_prompt
              ? `<details>
            <summary>Codex가 말할 진행 안내</summary>
            <p>${escapeHtml(state.active_pilot.assistant_prompt)}</p>
          </details>`
              : ""
          }
          ${
            state.active_pilot.quick_replies?.length
              ? `<div class="reply-grid" aria-label="pilot quick replies">
            ${state.active_pilot.quick_replies
              .map(
                (reply, index) => `<div class="reply-choice">
              <div>
                <p>${escapeHtml(index + 1)}. ${escapeHtml(reply.text)}</p>
                <span class="subtle">${escapeHtml(reply.note)}</span>
              </div>
              <button class="copy-reply" type="button" data-copy-reply="${escapeHtml(reply.text)}">복사</button>
            </div>`,
              )
              .join("")}
          </div>`
              : ""
          }
          ${
            state.active_pilot.latest_reply_card
              ? `<p class="subtle">방금 저장된 답변 카드: <a href="${escapeHtml(state.active_pilot.latest_reply_card.url)}">${escapeHtml(state.active_pilot.latest_reply_card.html)}</a></p>`
              : ""
          }
          <p class="subtle">${escapeHtml(state.active_pilot.claim_boundary)}</p>
        </section>`
            : ""
        }

        <section aria-labelledby="generated-mission">
          <h2 id="generated-mission">생성된 장면 artifact</h2>
          ${
            state.journey.latest_generated_mission
              ? `<div class="panel blue">
            <h3>${escapeHtml(state.journey.latest_generated_mission.title)}</h3>
            <p>${escapeHtml(state.journey.latest_generated_mission.transfer_test)}</p>
            <p class="subtle">file: ${escapeHtml(state.journey.latest_generated_mission.html)}</p>
          </div>`
              : `<p class="subtle">아직 생성된 장면 artifact가 없습니다.</p>
          <p class="prompt"><strong>Codex에게 이렇게 말하세요</strong><br>${escapeHtml(state.today.mission_prompt)}</p>`
          }
          ${
            state.journey.latest_generated_scene
              ? `<div class="panel blue">
            <h3>${escapeHtml(state.journey.latest_generated_scene.title)}</h3>
            <p class="subtle">${escapeHtml(state.journey.latest_generated_scene.variant_label)}</p>
            <p>${escapeHtml(state.journey.latest_generated_scene.transfer_test)}</p>
            <p class="subtle">scene: ${escapeHtml(state.journey.latest_generated_scene.html)}</p>
          </div>`
              : ""
          }
          ${
            state.journey.latest_generated_storyboard
              ? `<div class="panel blue">
            <h3>Mission storyboard</h3>
            <p>${escapeHtml(state.journey.latest_generated_storyboard.frame_count)} frames · ${escapeHtml(state.journey.latest_generated_storyboard.evidence_required)}</p>
            <p class="subtle">storyboard: ${escapeHtml(state.journey.latest_generated_storyboard.html)}</p>
          </div>`
              : ""
          }
          ${
            state.journey.latest_mission_asset_deck
              ? `<div class="panel blue">
            <h3>Mission asset deck</h3>
            <p>${escapeHtml(state.journey.latest_mission_asset_deck.asset_count)} assets · ${escapeHtml(state.journey.latest_mission_asset_deck.canonical_completion_path)}</p>
            <p class="subtle">deck: ${escapeHtml(state.journey.latest_mission_asset_deck.html)}</p>
          </div>`
              : ""
          }
          ${
            state.next_asset_action
              ? `<div class="panel amber">
            <h3>다음 asset action</h3>
            <p>${escapeHtml(state.next_asset_action.label)}</p>
            <p class="subtle">${escapeHtml(state.next_asset_action.reason)}</p>
          </div>`
              : ""
          }
        </section>

        <section aria-labelledby="speaking-os">
          <h2 id="speaking-os">Speaking Skill OS</h2>
          ${
            nextItem
              ? `<div class="panel blue">
            <h3>${escapeHtml(nextItem.label)}</h3>
            <p>${escapeHtml(nextItem.target_behavior)}</p>
            <p class="subtle">Transfer test: ${escapeHtml(nextItem.transfer_test)}</p>
          </div>`
              : '<p class="subtle">아직 약점 카드가 없습니다. diagnose로 첫 speaking backlog를 만들 수 있습니다.</p>'
          }
          <div class="metrics">
            <div class="metric"><span>Open</span><b>${escapeHtml(os.open_count)}</b></div>
            <div class="metric"><span>Passed</span><b>${escapeHtml(os.passed_count)}</b></div>
            <div class="metric"><span>Avg words</span><b>${escapeHtml(os.average_utterance_words)}</b></div>
          </div>
        </section>

        <section aria-labelledby="multimodal">
          <h2 id="multimodal">멀티모달 학습 증거</h2>
          <div class="metrics">
            <div class="metric"><span>Events</span><b>${escapeHtml(multimodal.event_count)}</b></div>
            <div class="metric"><span>7일</span><b>${escapeHtml(seven.event_count)}</b></div>
            <div class="metric"><span>30일</span><b>${escapeHtml(thirty.event_count)}</b></div>
          </div>
          <div class="chips">
            ${(multimodal.modalities.length ? multimodal.modalities : ["text-first"]).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          </div>
          <details>
            <summary>최근 interaction events</summary>
            ${htmlList(
              state.multimodal.recent_events,
              (event) => `<strong>${escapeHtml(event.modality)}</strong> ${escapeHtml(event.learner_intent)}<br><span class="subtle">${escapeHtml(event.saved_phrase)}</span>`,
              "아직 interaction event가 없습니다.",
            )}
          </details>
        </section>

        <section aria-labelledby="journey">
          <h2 id="journey">7일 / 30일 여정</h2>
          <div class="metrics">
            <div class="metric"><span>7일 세션</span><b>${escapeHtml(seven.session_count)}</b></div>
            <div class="metric"><span>30일 세션</span><b>${escapeHtml(thirty.session_count)}</b></div>
            <div class="metric"><span>저장 표현</span><b>${escapeHtml(state.review.saved_phrase_count)}</b></div>
          </div>
          ${
            state.journey.latest_learner_report
              ? `<div class="panel amber">
            <h3>최근 learner report</h3>
            <p>${escapeHtml(state.journey.latest_learner_report.next_focus?.prompt || "다음 focus가 준비되어 있습니다.")}</p>
            <p class="subtle">file: ${escapeHtml(state.journey.latest_learner_report.html)}</p>
          </div>`
              : ""
          }
          <details open>
            <summary>다음 focus</summary>
            <p>${escapeHtml(state.journey.latest_weekly_mirror?.next_focus?.prompt || "오늘 한 문장을 말하고 weekly mirror를 만들어보세요.")}</p>
          </details>
        </section>
      </div>

      <aside class="stack">
        <section aria-labelledby="review">
          <h2 id="review">복습과 내 표현</h2>
          <p class="subtle">오늘 due review: ${escapeHtml(state.review.due_count)}개</p>
          ${htmlList(
            state.review.due_items,
            (item) => `<strong>${escapeHtml(item.text)}</strong><br><span class="subtle">${escapeHtml(item.prompt)}</span>`,
            "지금 복습할 문장은 없습니다.",
          )}
        </section>

        <section aria-labelledby="actions">
          <h2 id="actions">다음 행동</h2>
          ${state.next_actions
            .map(
              (action) => `<details>
            <summary>${escapeHtml(action.label)}</summary>
            ${action.reason ? `<p class="subtle">${escapeHtml(action.reason)}</p>` : ""}
            <p class="prompt">${escapeHtml(action.codex_prompt)}</p>
          </details>`,
            )
            .join("")}
        </section>

        <section class="boundary" aria-labelledby="boundary">
          <h2 id="boundary">경계</h2>
          <p>${escapeHtml(state.claim_boundary)}</p>
          <p class="subtle">${escapeHtml(state.multimodal.claim_boundary)}</p>
        </section>
      </aside>
    </div>
  </main>
  <script>
  document.querySelectorAll("[data-copy-reply]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy-reply") || "";
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "복사됨";
        button.dataset.copied = "true";
      } catch {
        button.textContent = "직접 복사";
      }
    });
  });
</script>
</body>
</html>
`;
}

export function writePersonalLearnerCockpit(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const state = buildPersonalLearnerCockpit(paths.root, date);
  const html = personalLearnerCockpitHtml(state);
  writeFileSync(paths.learnerCockpitState, `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(paths.learnerCockpit, html);
  return {
    cockpitStatePath: paths.learnerCockpitState,
    cockpitPath: paths.learnerCockpit,
    cockpitUrl: `file://${paths.learnerCockpit}`,
    state,
  };
}

export function buildAdditionalContext(learnerRoot = defaultLearnerRoot()) {
  const paths = ensureLearnerStore(learnerRoot);
  const profile = readProfile(paths.profile);
  const progress = readProgress(paths.progress);
  const metrics = progress.mvp_session_metrics ?? emptyMetrics();
  const latestJournal = latestJournalPath(paths.root);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const vocabulary = readVocabulary(paths.vocabulary);
  const speakingBacklog = readSpeakingBacklog(paths.speakingBacklog);
  const speakingBacklogNext = nextSpeakingBacklogItem(paths.root);
  const dueReviewCount = listDueReviewItems(paths.root).length;
  const skillSummary = learnerSkillKeys
    .map((skill) => `${skill}=${learnerModel.interaction_skills[skill].evidence_count}`)
    .join(", ");

  return [
    "English Learning Harness context:",
    "- Default mode: text-first or transcription-first. Do not assume realtime voice.",
    "- North star: AI 파트너와 편안하게 영어로 대화하는 능력.",
    `- Learner root: ${paths.root}`,
    `- MVP metrics: ${mvpSessionMetricKeys.map((key) => `${key}=${metrics[key] ?? 0}`).join(", ")}`,
    `- Learner model: ${skillSummary}; average_utterance_words=${learnerModel.baseline.average_utterance_words}; energy=${learnerModel.affect.last_energy}`,
    `- Vocabulary: ${vocabulary.emerging_tokens.length} emerging tokens, ${vocabulary.personal_phrases.length} personal phrases`,
    `- Review queue: ${dueReviewCount} open items`,
    `- Speaking Skill OS: ${speakingBacklog.items.length} backlog items; next=${speakingBacklogNext?.label ?? "none"}`,
    latestJournal ? `- Latest journal: ${relative(paths.root, latestJournal)}` : "- Latest journal: none",
    "",
    "Profile:",
    profile.trim() || "(no profile yet)",
  ].join("\n");
}
