import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(root, "tmp/phase-0-learner");

rmSync(learnerRoot, { recursive: true, force: true });

const dirs = [
  learnerRoot,
  `${learnerRoot}/journal`,
  `${learnerRoot}/artifacts/images`
];

for (const dir of dirs) mkdirSync(dir, { recursive: true });

const profile = `# Phase 0 Learner Fixture

Name: Jieun
Mode: daily_session
North star: AI 파트너와 편안하게 영어로 대화하는 능력.
`;

const progress = {
  version: 2,
  started: "2026-05-27",
  last_session: "2026-05-27",
  mvp_session_metrics: {
    utterance_word_count: { today: 7, week_avg: 7, baseline: 7 },
    english_word_ratio: { today: 1, week_avg: 1, baseline: 1 },
    attendance: { today: true, days_active: 1, days_total: 1 },
    voluntary_speaking_seconds: { today: 9, week_total: 9, baseline: 9 },
    new_vocabulary_count: { today: 5, week_total: 5 }
  },
  monthly_optional_metrics: {
    fluency: {
      speaking_rate_wpm: null,
      mean_length_of_run: null,
      disfluency_rate: null
    },
    lexical: {
      mtld: null,
      unique_vocabulary_total: 5,
      top_patterns_week: []
    },
    syntactic: {
      mlu: null,
      tense_diversity_week: 0
    },
    confidence: {
      self_reported_confidence: null,
      weak_words: []
    }
  },
  artifacts: {
    images: [
      {
        id: "phase0-picture-coffee",
        path: "artifacts/images/2026-05-27-picture-coffee-placeholder.txt",
        kind: "placeholder",
        prompt: "A simple morning coffee scene for English picture description practice."
      }
    ]
  }
};

const journal = `# 2026-05-27

Learner: I like coffee.
Assistant: What kind of coffee do you like?

Artifact: artifacts/images/2026-05-27-picture-coffee-placeholder.txt
`;

writeFileSync(`${learnerRoot}/profile.md`, profile, "utf8");
writeFileSync(`${learnerRoot}/progress.json`, JSON.stringify(progress, null, 2) + "\n", "utf8");
writeFileSync(`${learnerRoot}/journal/2026-05-27.md`, journal, "utf8");
writeFileSync(
  `${learnerRoot}/artifacts/images/2026-05-27-picture-coffee-placeholder.txt`,
  "placeholder for generated image artifact path\n",
  "utf8"
);

const parsed = JSON.parse(readFileSync(`${learnerRoot}/progress.json`, "utf8"));
const mvpKeys = Object.keys(parsed.mvp_session_metrics).sort();
const expectedMvpKeys = [
  "attendance",
  "english_word_ratio",
  "new_vocabulary_count",
  "utterance_word_count",
  "voluntary_speaking_seconds"
].sort();

if (parsed.version !== 2) {
  throw new Error(`expected progress version 2, got ${parsed.version}`);
}

if (JSON.stringify(mvpKeys) !== JSON.stringify(expectedMvpKeys)) {
  throw new Error(`unexpected MVP keys: ${mvpKeys.join(", ")}`);
}

if (!parsed.monthly_optional_metrics) {
  throw new Error("missing monthly_optional_metrics");
}

console.log(JSON.stringify({
  learnerRoot,
  progressVersion: parsed.version,
  mvpKeys,
  artifactPath: parsed.artifacts.images[0].path,
  status: "pass"
}, null, 2));
