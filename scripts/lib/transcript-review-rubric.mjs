export const prohibitedTranscriptReviewClaims = [
  "native speaker",
  "you are fluent",
  "certified fluent",
  "guaranteed improvement",
  "guaranteed to improve",
  "your level is",
  "real-world speaking ability proved",
];

const defaultPromptSet = ["warm_start", "clarification", "reuse", "image_info_gap", "reflection"];

function textOf(value) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "string") return value;
  if (value?.transcript) return textOf(value.transcript);
  return "";
}

function normalizePromptSet(sample) {
  return sample?.prompt_set ?? sample?.promptSet ?? defaultPromptSet;
}

function countEnglishWords(text) {
  return (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? []).length;
}

function countMatches(text, patterns) {
  const lower = text.toLowerCase();
  return patterns.reduce((sum, pattern) => sum + (lower.match(pattern) ?? []).length, 0);
}

function phraseReuseCount(text, phrases = []) {
  const lower = text.toLowerCase();
  return phrases.filter((phrase) => phrase && lower.includes(phrase.toLowerCase())).length;
}

function sampleMetrics(sample, savedPhrases = []) {
  const text = textOf(sample);
  return {
    word_count: countEnglishWords(text),
    clarification_markers: countMatches(text, [
      /could you repeat/g,
      /can you explain/g,
      /what do you mean/g,
      /sorry,? what/g,
      /i don't understand/g,
    ]),
    repair_markers: countMatches(text, [
      /i mean/g,
      /what i want to say/g,
      /i don't know how to say/g,
      /let me try again/g,
      /not .+ but/g,
    ]),
    reused_phrase_count: phraseReuseCount(text, savedPhrases),
    comfort_rating: typeof sample?.comfort_rating === "number" ? sample.comfort_rating : null,
  };
}

function pushViolation(violations, code, message) {
  violations.push({ code, message });
}

function scanUnsupportedClaims(value, violations) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of prohibitedTranscriptReviewClaims) {
    if (text.includes(claim)) {
      pushViolation(violations, "unsupported_claim", `Unsupported transcript review claim appeared: ${claim}`);
    }
  }
}

function samePromptSet(baselineSet, finalSet) {
  return (
    baselineSet.length === finalSet.length &&
    baselineSet.every((prompt, index) => prompt === finalSet[index])
  );
}

function evidenceDeltas(baseline, final) {
  return {
    word_count_delta: final.word_count - baseline.word_count,
    clarification_delta: final.clarification_markers - baseline.clarification_markers,
    repair_delta: final.repair_markers - baseline.repair_markers,
    reused_phrase_delta: final.reused_phrase_count - baseline.reused_phrase_count,
    comfort_delta:
      baseline.comfort_rating === null || final.comfort_rating === null
        ? null
        : final.comfort_rating - baseline.comfort_rating,
  };
}

function passSignals(deltas) {
  return [
    deltas.word_count_delta > 0 ? "voluntary_output" : "",
    deltas.clarification_delta > 0 ? "clarification" : "",
    deltas.repair_delta > 0 ? "repair" : "",
    deltas.reused_phrase_delta > 0 ? "phrase_reuse" : "",
    deltas.comfort_delta !== null && deltas.comfort_delta >= 0 ? "comfort_stable_or_up" : "",
  ].filter(Boolean);
}

function decisionFromSignals(signals, deltas, violations) {
  if (violations.length) return "invalid";
  if (deltas.comfort_delta !== null && deltas.comfort_delta < 0) return "pivot";
  if (signals.length >= 3) return "continue";
  if (signals.length >= 1) return "research";
  return "kill_claim";
}

export function evaluateTranscriptReview(input) {
  const violations = [];
  scanUnsupportedClaims(input, violations);

  if (!input?.baseline || !input?.final) {
    pushViolation(violations, "missing_sample", "Both baseline and final transcript samples are required");
  }

  const baselinePromptSet = normalizePromptSet(input?.baseline);
  const finalPromptSet = normalizePromptSet(input?.final);
  if (!Array.isArray(baselinePromptSet) || !Array.isArray(finalPromptSet)) {
    pushViolation(violations, "prompt_set_missing", "Both samples need comparable prompt sets");
  } else if (!samePromptSet(baselinePromptSet, finalPromptSet)) {
    pushViolation(violations, "prompt_set_mismatch", "Baseline and final prompt sets must match in order");
  }

  const savedPhrases = input?.saved_phrases ?? input?.savedPhrases ?? [];
  const baseline = sampleMetrics(input?.baseline, savedPhrases);
  const final = sampleMetrics(input?.final, savedPhrases);
  const deltas = evidenceDeltas(baseline, final);
  const signals = passSignals(deltas);

  return {
    status: violations.length ? "fail" : "pass",
    decision: decisionFromSignals(signals, deltas, violations),
    prompt_set: baselinePromptSet,
    metrics: {
      baseline,
      final,
      deltas,
    },
    pass_signals: signals,
    violations,
    claim_boundary:
      "This rubric scores observable transcript evidence only. It does not certify fluency, level, or real-world speaking ability.",
  };
}

export function assertTranscriptReview(input, label = "transcript_review") {
  const result = evaluateTranscriptReview(input);
  if (result.violations.length) {
    const details = result.violations
      .map((violation) => `${violation.code}: ${violation.message}`)
      .join("; ");
    throw new Error(`${label}: transcript review failed: ${details}`);
  }
  return result;
}
