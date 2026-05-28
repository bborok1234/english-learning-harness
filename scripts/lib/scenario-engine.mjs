export const scenarios = [
  {
    id: "coffee-small-talk",
    title: "Coffee Small Talk",
    mode: "easy",
    goal: "Say one small morning preference and answer one gentle follow-up.",
    role_context: "You are chatting with a friendly AI partner before starting the day.",
    cefr_skill: "turn-taking",
    rescue_phrase: "I mean, it helps me start my day.",
    follow_up_prompt: "What detail can you add about when or why?",
    pattern: "helps me + verb",
    retry_prompt: "Coffee helps me ___.",
  },
  {
    id: "stuck-repair",
    title: "Stuck Repair",
    mode: "easy",
    goal: "Keep the conversation alive when you do not know a word.",
    role_context: "You are trying to explain a simple daily moment but get stuck.",
    cefr_skill: "repair",
    rescue_phrase: "I don't know how to say it, but...",
    follow_up_prompt: "Use the rescue phrase, then add one easy word you do know.",
    pattern: "I don't know how to say it, but + simple idea",
    retry_prompt: "I don't know how to say it, but it was ___.",
  },
  {
    id: "creative-opinion",
    title: "Creative Opinion",
    mode: "normal",
    goal: "Share one personal taste without sounding like a textbook answer.",
    role_context: "You are talking with an AI partner about music, design, stories, or a favorite place.",
    cefr_skill: "expressive-choice",
    rescue_phrase: "It feels kind of...",
    follow_up_prompt: "Add one feeling word or one reason.",
    pattern: "It feels kind of + adjective",
    retry_prompt: "It feels kind of ___.",
  },
  {
    id: "reactivation-check-in",
    title: "Reactivation Check-In",
    mode: "normal",
    goal: "Reactivate a slightly richer sentence without comparing yourself to the past.",
    role_context: "You are explaining something familiar with one more precise phrase.",
    cefr_skill: "clarification",
    rescue_phrase: "What I want to say is...",
    follow_up_prompt: "Try one clearer version, not a perfect version.",
    pattern: "What I want to say is + clause",
    retry_prompt: "What I want to say is ___.",
  },
];

export function defaultScenario() {
  return scenarios[0];
}

export function chooseScenario({ profileText = "", preferredId = "" } = {}) {
  if (preferredId) {
    const exact = scenarios.find((scenario) => scenario.id === preferredId);
    if (exact) return exact;
  }

  const lowerProfile = profileText.toLowerCase();
  if (lowerProfile.includes("stuck") || lowerProfile.includes("frozen") || lowerProfile.includes("anxiety")) {
    return scenarios.find((scenario) => scenario.id === "stuck-repair");
  }
  if (lowerProfile.includes("creative") || lowerProfile.includes("identity") || lowerProfile.includes("expressive")) {
    return scenarios.find((scenario) => scenario.id === "creative-opinion");
  }
  if (lowerProfile.includes("english major") || lowerProfile.includes("lost ability") || lowerProfile.includes("reactivate")) {
    return scenarios.find((scenario) => scenario.id === "reactivation-check-in");
  }
  return defaultScenario();
}

export function scenarioOpening(scenario) {
  return [
    `Scenario: ${scenario.title}`,
    `Goal: ${scenario.goal}`,
    `Context: ${scenario.role_context}`,
    `Rescue phrase: "${scenario.rescue_phrase}"`,
    "Start with one useful sentence. We will repair only one thing.",
  ].join("\n");
}

export function scenarioFollowUp(scenario, recast) {
  return [
    `I understand. A natural version is: "${recast}"`,
    `Small repair: try the pattern "${scenario.pattern}".`,
    scenario.follow_up_prompt,
  ].join(" ");
}
