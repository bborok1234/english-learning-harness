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
    start_command: state.start_commands?.text ?? "",
    generated_at: state.generated_at,
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

function buildGeneratedMissionState(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const dailyCockpit = buildDailyCockpit(paths.root, date);
  const backlogItem = dailyCockpit.speaking_os.next_item;
  const skill = backlogItem?.skill || dailyCockpit.suggested_scenario.speaking_backlog?.skill || dailyCockpit.suggested_scenario.cefr_skill || "starts";
  const scene = sceneForSkill(skill, dailyCockpit.suggested_scenario.goal);
  const dateKey = todayStamp(date);
  const missionId = `daily-generated-${dateKey}-${skill}`;
  const startText = backlogItem?.drill_prompt || scene.example;
  return {
    schema_version: 1,
    generated_at: date.toISOString(),
    learner_root: paths.root,
    mission_id: missionId,
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
      <details open>
        <summary>Text-first</summary>
        <code>${escapeHtml(state.start_commands.text)}</code>
      </details>
      <details>
        <summary>Voice transcript</summary>
        <code>${escapeHtml(state.start_commands.voice)}</code>
      </details>
      <details>
        <summary>Image information-gap</summary>
        <code>${escapeHtml(state.start_commands.image)}</code>
      </details>
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

    <section class="boundary">
      <h2>경계</h2>
      <p>${escapeHtml(state.claim_boundary)}</p>
    </section>
  </main>
</body>
</html>
`;
}

export function writeGeneratedDailyMission(learnerRoot = defaultLearnerRoot(), date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const state = buildGeneratedMissionState(paths.root, date);
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
  const latestMission = readLatestGeneratedMission(paths.root);
  const nextBacklog = dailyCockpit.speaking_os.next_item;
  const nextCommand = commandLine(paths.root, "today", [
    "--say",
    JSON.stringify(nextBacklog?.drill_prompt || "I want to practice today."),
  ]);

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
      start_command: nextCommand,
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
      latest_generated_mission: latestMission,
    },
    next_actions: [
      {
        label: "오늘 미션 시작",
        command: nextCommand,
      },
      {
        label: "복습 확인",
        command: commandLine(paths.root, "review"),
      },
      {
        label: "7일 요약 만들기",
        command: commandLine(paths.root, "weekly"),
      },
      {
        label: "증거 리포트 내보내기",
        command: commandLine(paths.root, "export", ["--json"]),
      },
    ],
    files: {
      state: relative(paths.root, paths.learnerCockpitState),
      html: relative(paths.root, paths.learnerCockpit),
      home: relative(paths.root, paths.learnerHome),
      latest_journal: dailyCockpit.latest_journal,
      latest_weekly_mirror: dailyCockpit.latest_weekly_mirror,
      latest_generated_mission: latestMission?.html ?? "",
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
    .command {
      display: block;
      margin-top: 12px;
      padding: 12px;
      border-radius: 8px;
      background: #162019;
      color: #f7fbf7;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
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
          <code class="command">${escapeHtml(state.today.start_command)}</code>
        </section>

        <section aria-labelledby="generated-mission">
          <h2 id="generated-mission">생성된 장면 artifact</h2>
          ${
            state.journey.latest_generated_mission
              ? `<div class="panel blue">
            <h3>${escapeHtml(state.journey.latest_generated_mission.title)}</h3>
            <p>${escapeHtml(state.journey.latest_generated_mission.transfer_test)}</p>
            <p class="subtle">file: ${escapeHtml(state.journey.latest_generated_mission.html)}</p>
            <code class="command">${escapeHtml(state.journey.latest_generated_mission.start_command)}</code>
          </div>`
              : `<p class="subtle">아직 생성된 장면 artifact가 없습니다.</p>
          <code class="command">${escapeHtml(`node scripts/english-learning-harness.mjs mission --learner-root "${state.learner_root}" --json`)}</code>`
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
            <code class="command">${escapeHtml(action.command)}</code>
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
