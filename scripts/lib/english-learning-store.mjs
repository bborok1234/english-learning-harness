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
import { defaultScenario, scenarioFollowUp, scenarioOpening } from "./scenario-engine.mjs";

export const defaultLearnerRoot = () =>
  resolve(process.env.ENGLISH_LEARNING_HOME || `${homedir()}/english-learning`);

export const todayStamp = (date = new Date()) => date.toISOString().slice(0, 10);

const learnerSkillKeys = ["starts", "follow_ups", "clarification", "repair", "soft_disagreement"];
const reviewIntervals = [1, 3, 7, 14];

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

  return {
    id: options.sessionId || `${todayStamp()}-${Date.now()}`,
    mode: "text-first",
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
