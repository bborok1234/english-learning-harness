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

function profileValue(profileText, key) {
  const line = profileText
    .split(/\r?\n/)
    .find((entry) => entry.toLowerCase().startsWith(`- ${key}:`));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function avoidedTopics(profileText) {
  return profileValue(profileText, "topics_to_avoid")
    .split(/[,;]/)
    .map((topic) => topic.trim().toLowerCase())
    .filter(Boolean);
}

function selectionAvoidedTopics(profileText) {
  return [
    ...new Set(
      avoidedTopics(profileText).map((topic) =>
        /^[a-z0-9-]+$/.test(topic) ? topic : "sensitive-profile-topic",
      ),
    ),
  ];
}

function scenarioText(scenario) {
  return [
    scenario.id,
    scenario.title,
    scenario.goal,
    scenario.role_context,
    scenario.rescue_phrase,
    scenario.pattern,
    scenario.retry_prompt,
  ]
    .join(" ")
    .toLowerCase();
}

function scenarioHasAvoidedTopic(scenario, topics) {
  const text = scenarioText(scenario);
  return topics.some((topic) => text.includes(topic));
}

function firstAllowedScenario(candidates, topics) {
  return candidates.find((scenario) => !scenarioHasAvoidedTopic(scenario, topics));
}

function scenarioForSkill(skill) {
  if (skill === "repair") return scenarios.find((scenario) => scenario.id === "stuck-repair");
  if (skill === "clarification") return scenarios.find((scenario) => scenario.id === "reactivation-check-in");
  if (skill === "follow_ups") return scenarios.find((scenario) => scenario.id === "coffee-small-talk");
  if (skill === "soft_disagreement") return scenarios.find((scenario) => scenario.id === "creative-opinion");
  return defaultScenario();
}

function weakestSkill(learnerModel) {
  const skills = learnerModel?.interaction_skills ?? {};
  return ["repair", "clarification", "follow_ups", "soft_disagreement", "starts"]
    .map((skill) => ({ skill, count: skills[skill]?.evidence_count ?? 0 }))
    .sort((a, b) => a.count - b.count)[0].skill;
}

function modeFromLearnerState(learnerModel) {
  const averageWords = learnerModel?.baseline?.average_utterance_words ?? 0;
  const starts = learnerModel?.interaction_skills?.starts?.evidence_count ?? 0;
  if (averageWords >= 12 && starts >= 5) return "stretch";
  if (averageWords >= 7 && starts >= 2) return "normal";
  return "easy";
}

function withMode(scenario, mode) {
  return {
    ...scenario,
    mode,
  };
}

function withDueReview(scenario, dueItem) {
  return {
    ...scenario,
    goal: `Reuse a saved phrase in a tiny real-life context: "${dueItem.text}"`,
    role_context: `${scenario.role_context} Your continuity phrase for today is "${dueItem.text}".`,
    follow_up_prompt: `Use the saved phrase, then add one specific detail. ${scenario.follow_up_prompt}`,
    retry_prompt: `Use "${dueItem.text}" and add one detail.`,
    due_review: {
      id: dueItem.id,
      text: dueItem.text,
      due_at: dueItem.due_at,
    },
  };
}

function withSpeakingBacklog(scenario, item) {
  return {
    ...scenario,
    goal: `${item.target_behavior} Transfer test: ${item.transfer_test}`,
    role_context: `${scenario.role_context} Today's Speaking Skill OS backlog item is "${item.label}".`,
    follow_up_prompt: `${item.drill_prompt} ${scenario.follow_up_prompt}`,
    retry_prompt: item.drill_prompt || scenario.retry_prompt,
    speaking_backlog: {
      id: item.id,
      skill: item.skill,
      label: item.label,
      status: item.status,
      transfer_test: item.transfer_test,
      pass_criteria: item.pass_criteria,
    },
  };
}

export function chooseScenario({ profileText = "", preferredId = "" } = {}) {
  const topics = avoidedTopics(profileText);
  if (preferredId) {
    const exact = scenarios.find((scenario) => scenario.id === preferredId);
    if (exact && !scenarioHasAvoidedTopic(exact, topics)) return exact;
  }

  const lowerProfile = profileText.toLowerCase();
  const profileCandidates = [];
  if (lowerProfile.includes("stuck") || lowerProfile.includes("frozen") || lowerProfile.includes("anxiety")) {
    profileCandidates.push(scenarios.find((scenario) => scenario.id === "stuck-repair"));
  }
  if (lowerProfile.includes("creative") || lowerProfile.includes("identity") || lowerProfile.includes("expressive")) {
    profileCandidates.push(scenarios.find((scenario) => scenario.id === "creative-opinion"));
  }
  if (lowerProfile.includes("english major") || lowerProfile.includes("lost ability") || lowerProfile.includes("reactivate")) {
    profileCandidates.push(scenarios.find((scenario) => scenario.id === "reactivation-check-in"));
  }
  profileCandidates.push(defaultScenario(), ...scenarios);
  return firstAllowedScenario(profileCandidates.filter(Boolean), topics) || defaultScenario();
}

export function planScenario({
  profileText = "",
  preferredId = "",
  learnerModel,
  dueReviewItems = [],
  speakingBacklogItem = null,
} = {}) {
  const topics = avoidedTopics(profileText);
  const selectionTopics = selectionAvoidedTopics(profileText);
  const mode = modeFromLearnerState(learnerModel);
  const weakSkill = weakestSkill(learnerModel);
  const dueItem = dueReviewItems.find((item) =>
    !scenarioHasAvoidedTopic(
      {
        id: "",
        title: "",
        goal: item.text,
        role_context: "",
        rescue_phrase: "",
        pattern: "",
        retry_prompt: "",
      },
      topics,
    ),
  );

  if (preferredId) {
    const preferred = chooseScenario({ profileText, preferredId });
    return {
      scenario: withMode(preferred, mode),
      selectionReason: {
        source: "preferred",
        preferred_id: preferredId,
        mode,
        avoided_topics: selectionTopics,
      },
    };
  }

  if (speakingBacklogItem) {
    const skillScenario = scenarioForSkill(speakingBacklogItem.skill);
    const allowedSkillScenario = firstAllowedScenario([skillScenario, ...scenarios], topics) || defaultScenario();
    return {
      scenario: withSpeakingBacklog(withMode(allowedSkillScenario, mode), speakingBacklogItem),
      selectionReason: {
        source: "speaking-backlog",
        speaking_backlog_item_id: speakingBacklogItem.id,
        speaking_backlog_skill: speakingBacklogItem.skill,
        mode,
        avoided_topics: selectionTopics,
      },
    };
  }

  if (dueItem) {
    const skillScenario = scenarioForSkill(weakSkill);
    const allowedSkillScenario = firstAllowedScenario([skillScenario, ...scenarios], topics) || defaultScenario();
    return {
      scenario: withDueReview(withMode(allowedSkillScenario, mode), dueItem),
      selectionReason: {
        source: "due-review",
        due_review_id: dueItem.id,
        due_review_phrase: dueItem.text,
        weak_skill: weakSkill,
        mode,
        avoided_topics: selectionTopics,
      },
    };
  }

  const profileScenario = chooseScenario({ profileText });
  return {
    scenario: withMode(profileScenario, mode),
    selectionReason: {
      source: "profile-memory",
      weak_skill: weakSkill,
      mode,
      avoided_topics: selectionTopics,
    },
  };
}

export function scenarioOpening(scenario) {
  const lines = [
    `Scenario: ${scenario.title}`,
    `Goal: ${scenario.goal}`,
    `Context: ${scenario.role_context}`,
    `Rescue phrase: "${scenario.rescue_phrase}"`,
  ];
  if (scenario.due_review?.text) {
    lines.push(`Saved phrase: "${scenario.due_review.text}"`);
  }
  lines.push("Start with one useful sentence. We will repair only one thing.");
  return lines.join("\n");
}

export function scenarioFollowUp(scenario, recast) {
  if (/[가-힣]/.test(recast)) {
    return [
      "I understand. Let's bridge it back to one small English phrase.",
      `Use: "${scenario.rescue_phrase}"`,
      "Try one easy word after it.",
    ].join(" ");
  }
  return [
    `Small repair: try the pattern "${scenario.pattern}".`,
    `A natural version is: "${recast}"`,
    scenario.follow_up_prompt,
  ].join(" ");
}
