export const prohibitedPolicyClaims = [
  "confident with foreigners",
  "native speaker",
  "you are fluent",
  "you are cured",
  "you are fixed",
  "guaranteed to speak",
  "your level is low",
  "you made several grammar mistakes",
  "failed former english major",
];

const miniMirrorFields = ["communicated", "recast", "pattern", "reviewPhrase", "retryPrompt"];

function artifactText(artifact) {
  return JSON.stringify(artifact).toLowerCase();
}

function pushViolation(violations, code, message) {
  violations.push({ code, message });
}

function assistantAfter(turns, learnerIndex) {
  return turns.slice(learnerIndex + 1).find((turn) => turn.role === "assistant")?.text ?? "";
}

function hasKorean(text) {
  return /[가-힣]/.test(text);
}

function hasEnglishBridge(text) {
  return /[A-Za-z]/.test(text) && /\b(try|use|say|english|i don't know how to say|what i want to say)\b/i.test(text);
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

export function evaluateTutorPolicy(artifact) {
  const violations = [];
  const text = artifactText(artifact);

  for (const claim of prohibitedPolicyClaims) {
    if (text.includes(claim)) {
      pushViolation(violations, "prohibited_claim", `Prohibited claim appeared: ${claim}`);
    }
  }

  for (const field of miniMirrorFields) {
    if (!artifact.mirror?.[field]) {
      pushViolation(violations, "mini_mirror_missing_field", `Mini mirror missing field: ${field}`);
    }
  }

  if (!artifact.scenario?.goal || !artifact.scenario?.role_context || !artifact.scenario?.rescue_phrase) {
    pushViolation(violations, "scenario_contract_missing", "Scenario goal/context/rescue phrase is incomplete");
  }

  const correctionCount =
    countMatches(text, /\bcorrection\b/g) +
    countMatches(text, /\bmistake\b/g) +
    countMatches(text, /\berror\b/g) +
    countMatches(text, /\bwrong\b/g);
  if (correctionCount > 3) {
    pushViolation(violations, "overcorrection", "Tutor output contains too many correction/error markers");
  }

  for (const turn of artifact.turns ?? []) {
    if (turn.role !== "assistant") continue;
    const smallRepairIndex = turn.text.indexOf("Small repair:");
    const naturalVersionIndex = turn.text.indexOf("A natural version is:");
    if (smallRepairIndex >= 0 && naturalVersionIndex >= 0 && naturalVersionIndex < smallRepairIndex) {
      pushViolation(
        violations,
        "correction_ladder_order",
        "Natural version appeared before prompt-first repair",
      );
    }
  }

  for (const [index, turn] of (artifact.turns ?? []).entries()) {
    if (turn.role !== "learner" || !hasKorean(turn.text)) continue;
    const bridge = assistantAfter(artifact.turns, index);
    if (!hasEnglishBridge(bridge)) {
      pushViolation(
        violations,
        "korean_dead_end",
        "Korean fallback did not bridge back to a small English phrase",
      );
    }
  }

  return {
    status: violations.length ? "fail" : "pass",
    violations,
  };
}

export function assertTutorPolicy(artifact, label = "artifact") {
  const result = evaluateTutorPolicy(artifact);
  if (result.violations.length) {
    const details = result.violations
      .map((violation) => `${violation.code}: ${violation.message}`)
      .join("; ");
    throw new Error(`${label}: tutor policy failed: ${details}`);
  }
  return result;
}
