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

export const defaultLearnerRoot = () =>
  resolve(process.env.ENGLISH_LEARNING_HOME || `${homedir()}/english-learning`);

export const todayStamp = (date = new Date()) => date.toISOString().slice(0, 10);

export function learnerPaths(learnerRoot = defaultLearnerRoot()) {
  const root = resolve(learnerRoot);
  return {
    root,
    profile: resolve(root, "profile.md"),
    progress: resolve(root, "progress.json"),
    journalDir: resolve(root, "journal"),
    artifactDir: resolve(root, "artifacts/sessions"),
  };
}

export function emptyMetrics() {
  return Object.fromEntries(mvpSessionMetricKeys.map((key) => [key, 0]));
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

  const progress = readProgress(paths.progress);
  const errors = validateProgress(progress, paths.progress);
  if (errors.length) {
    throw new Error(errors.join("; "));
  }

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

export function estimateSessionMetrics(learnerTurns) {
  const utteranceText = learnerTurns.join(" ").trim();
  const tokens = utteranceText ? utteranceText.split(/\s+/).filter(Boolean) : [];
  const englishTokens = tokens.filter((token) => /[A-Za-z]/.test(token));
  const uniqueEnglish = new Set(
    englishTokens.map((token) => token.toLowerCase().replace(/[^a-z']/g, "")).filter(Boolean),
  );

  return {
    attendance: learnerTurns.length > 0 ? 1 : 0,
    english_word_ratio: tokens.length ? Number((englishTokens.length / tokens.length).toFixed(3)) : 0,
    new_vocabulary_count: Math.min(uniqueEnglish.size, 5),
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

export function buildMiniMirror(learnerTurns) {
  const firstTurn = learnerTurns[0] || "I want to practice English.";
  const lastTurn = learnerTurns.at(-1) || firstTurn;
  return {
    communicated: `You communicated a real daily idea: "${firstTurn}"`,
    recast: recastUtterance(lastTurn),
    nextPhrase: "I want to say it a little more naturally.",
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
  const turns = [];
  turns.push({
    role: "assistant",
    text: options.opening || "Let's keep it easy. What is one small thing from your day?",
  });

  for (const learnerText of learnerTurns) {
    turns.push({ role: "learner", text: learnerText });
    turns.push({
      role: "assistant",
      text: `${recastUtterance(learnerText)} One gentle follow-up: can you add one more detail?`,
    });
  }

  const mirror = buildMiniMirror(learnerTurns);
  turns.push({
    role: "assistant",
    text: [
      "Mini mirror:",
      `오늘 전달한 것: ${mirror.communicated}`,
      `자연스럽게 바꾸면: ${mirror.recast}`,
      `다음에 써볼 한 문장: ${mirror.nextPhrase}`,
    ].join("\n"),
  });

  return {
    id: options.sessionId || `${todayStamp()}-${Date.now()}`,
    mode: "text-first",
    learner_turns: learnerTurns,
    turns,
    mirror,
    session_metrics: estimateSessionMetrics(learnerTurns),
  };
}

export function persistSession(learnerRoot, session, date = new Date()) {
  const paths = ensureLearnerStore(learnerRoot);
  const stamp = todayStamp(date);
  const artifactPath = resolve(paths.artifactDir, `${session.id}.json`);
  const journalPath = resolve(paths.journalDir, `${stamp}.md`);
  const relativeArtifactPath = relative(paths.root, artifactPath);

  writeFileSync(artifactPath, `${JSON.stringify(session, null, 2)}\n`);

  const progress = readProgress(paths.progress);
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
    "### Learner turns",
    ...session.learner_turns.map((turn) => `- ${turn}`),
    "",
    "### Mini mirror",
    `- 오늘 전달한 것: ${session.mirror.communicated}`,
    `- 자연스럽게 바꾸면: ${session.mirror.recast}`,
    `- 다음에 써볼 한 문장: ${session.mirror.nextPhrase}`,
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

  return [
    "English Learning Harness context:",
    "- Default mode: text-first or transcription-first. Do not assume realtime voice.",
    "- North star: AI 파트너와 편안하게 영어로 대화하는 능력.",
    `- Learner root: ${paths.root}`,
    `- MVP metrics: ${mvpSessionMetricKeys.map((key) => `${key}=${metrics[key] ?? 0}`).join(", ")}`,
    latestJournal ? `- Latest journal: ${relative(paths.root, latestJournal)}` : "- Latest journal: none",
    "",
    "Profile:",
    profile.trim() || "(no profile yet)",
  ].join("\n");
}
