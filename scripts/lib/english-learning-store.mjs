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
    vocabulary: resolve(root, "vocabulary.json"),
    reviewQueue: resolve(root, "review-queue.json"),
    journalDir: resolve(root, "journal"),
    artifactDir: resolve(root, "artifacts/sessions"),
    weeklyMirrorDir: resolve(root, "artifacts/weekly"),
    learnerHome: resolve(root, "home.html"),
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

export function ensureLearnerStore(learnerRoot = defaultLearnerRoot()) {
  const paths = learnerPaths(learnerRoot);
  mkdirSync(paths.journalDir, { recursive: true });
  mkdirSync(paths.artifactDir, { recursive: true });
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
  const scenarioPlan = planScenario({
    profileText,
    learnerModel,
    vocabulary,
    dueReviewItems,
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
      selection_reason: scenarioPlan.selectionReason,
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

export function buildAdditionalContext(learnerRoot = defaultLearnerRoot()) {
  const paths = ensureLearnerStore(learnerRoot);
  const profile = readProfile(paths.profile);
  const progress = readProgress(paths.progress);
  const metrics = progress.mvp_session_metrics ?? emptyMetrics();
  const latestJournal = latestJournalPath(paths.root);
  const learnerModel = readLearnerModel(paths.learnerModel);
  const vocabulary = readVocabulary(paths.vocabulary);
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
    latestJournal ? `- Latest journal: ${relative(paths.root, latestJournal)}` : "- Latest journal: none",
    "",
    "Profile:",
    profile.trim() || "(no profile yet)",
  ].join("\n");
}
