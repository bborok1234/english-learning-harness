import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSession,
  persistSession,
} from "./english-learning-store.mjs";

const allowedSkills = ["starts", "follow_ups", "clarification", "repair", "soft_disagreement"];
const allowedLevelBands = ["beginner", "lower-intermediate", "intermediate", "advanced"];
const allowedCostModes = ["light", "rich", "cinematic"];
const allowedFallbackModes = ["light", "rich"];
const unsupportedClaimPhrases = [
  "narrative immersion improves fluency",
  "engagement proves learning",
  "generated worlds increase retention",
  "multimodal scenes prove speaking improvement",
  "child mode is ready",
  "child-safe mode is ready",
  "realtime voice adventure is supported",
];
const mediaCapabilities = ["image", "voice", "video", "web", "browser", "mcp", "realtime_voice"];
const richCapabilities = ["image_generation", "image_input", "voice_transcript"];
const cinematicCapabilities = ["web_search", "browser", "mcp"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function push(errors, source, message) {
  errors.push(`${source}: ${message}`);
}

function validateString(value, source, field, errors) {
  if (!stringValue(value)) {
    push(errors, source, `${field} must be a non-empty string`);
  }
}

function validateStringArray(value, source, field, errors) {
  if (!Array.isArray(value) || !value.length || value.some((item) => !stringValue(item))) {
    push(errors, source, `${field} must be a non-empty string array`);
  }
}

function allText(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allText);
  if (isPlainObject(value)) return Object.values(value).flatMap(allText);
  return [];
}

function claimBoundaryIsBounded(text) {
  const lower = stringValue(text).toLowerCase();
  return (
    lower.includes("local transfer evidence") &&
    (lower.includes("not proof") || lower.includes("does not prove") || lower.includes("cannot prove"))
  );
}

function unsupportedClaimErrors(value, source) {
  const text = allText(value).join("\n").toLowerCase();
  return unsupportedClaimPhrases
    .filter((claim) => text.includes(claim))
    .map((claim) => `${source}: unsupported claim phrase must be blocked, not asserted: ${claim}`);
}

function normalizeBacklogItems(speakingBacklog) {
  if (!isPlainObject(speakingBacklog) || !Array.isArray(speakingBacklog.items)) return [];
  return speakingBacklog.items;
}

function sentenceCount(text) {
  return stringValue(text)
    .split(/[.!?。！？]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

export function readJsonFile(path) {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}

export function validateToolCapabilities(toolCapabilities, { source = "tool-capabilities.json" } = {}) {
  const errors = [];
  if (!isPlainObject(toolCapabilities)) {
    return [`${source}: must be an object`];
  }
  if (toolCapabilities.schema_version !== 1) push(errors, source, "schema_version must be 1");
  validateString(toolCapabilities.generated_at, source, "generated_at", errors);
  if (!allowedCostModes.includes(toolCapabilities.cost_mode)) {
    push(errors, source, `cost_mode must be one of ${allowedCostModes.join(", ")}`);
  }
  if (!isPlainObject(toolCapabilities.capabilities)) {
    push(errors, source, "capabilities must be an object");
  } else {
    if (toolCapabilities.capabilities.text !== true) {
      push(errors, source, "capabilities.text must be true");
    }
    for (const [key, value] of Object.entries(toolCapabilities.capabilities)) {
      if (typeof value !== "boolean") {
        push(errors, source, `capabilities.${key} must be boolean`);
      }
    }
  }
  if (!isPlainObject(toolCapabilities.fallback)) {
    push(errors, source, "fallback must be an object");
  } else {
    if (!allowedFallbackModes.includes(toolCapabilities.fallback.default_mode)) {
      push(errors, source, `fallback.default_mode must be one of ${allowedFallbackModes.join(", ")}`);
    }
    if (toolCapabilities.fallback.text_scene_card_required !== true) {
      push(errors, source, "fallback.text_scene_card_required must be true");
    }
  }
  validateString(toolCapabilities.claim_boundary, source, "claim_boundary", errors);
  if (!claimBoundaryIsBounded(toolCapabilities.claim_boundary)) {
    push(errors, source, "claim_boundary must limit claims to local transfer evidence and say capabilities are not proof");
  }
  errors.push(...unsupportedClaimErrors(toolCapabilities, source));
  return errors;
}

export function validateWorldState(worldState, { source = "world-state.json" } = {}) {
  const errors = [];
  if (!isPlainObject(worldState)) {
    return [`${source}: must be an object`];
  }
  if (worldState.schema_version !== 1) push(errors, source, "schema_version must be 1");
  validateString(worldState.world_id, source, "world_id", errors);
  validateStringArray(worldState.taste_tags, source, "taste_tags", errors);
  if (!allowedLevelBands.includes(worldState.level_band)) {
    push(errors, source, `level_band must be one of ${allowedLevelBands.join(", ")}`);
  }
  if (!isPlainObject(worldState.current_arc)) {
    push(errors, source, "current_arc must be an object");
  } else {
    validateString(worldState.current_arc.id, source, "current_arc.id", errors);
    validateString(worldState.current_arc.summary, source, "current_arc.summary", errors);
    if (sentenceCount(worldState.current_arc.summary) > 2) {
      push(errors, source, "current_arc.summary must be two sentences or fewer before learner output");
    }
  }
  if (!Array.isArray(worldState.npc_canon) || worldState.npc_canon.length !== 1) {
    push(errors, source, "npc_canon must contain exactly one NPC in M10");
  } else {
    const npc = worldState.npc_canon[0];
    if (!isPlainObject(npc)) {
      push(errors, source, "npc_canon[0] must be an object");
    } else {
      validateString(npc.id, source, "npc_canon[0].id", errors);
      validateString(npc.name, source, "npc_canon[0].name", errors);
      validateString(npc.role, source, "npc_canon[0].role", errors);
      validateStringArray(npc.memory, source, "npc_canon[0].memory", errors);
    }
  }
  if (!isPlainObject(worldState.safety_constraints)) {
    push(errors, source, "safety_constraints must be an object");
  } else {
    if (worldState.safety_constraints.child_mode !== false) {
      push(errors, source, "safety_constraints.child_mode must be false in M10");
    }
    validateStringArray(worldState.safety_constraints.avoid_topics, source, "safety_constraints.avoid_topics", errors);
    if (
      typeof worldState.safety_constraints.max_lore_sentences_before_output !== "number" ||
      worldState.safety_constraints.max_lore_sentences_before_output > 2
    ) {
      push(errors, source, "safety_constraints.max_lore_sentences_before_output must be 2 or less");
    }
  }
  validateString(worldState.updated_at, source, "updated_at", errors);
  errors.push(...unsupportedClaimErrors(worldState, source));
  return errors;
}

export function validateMissionSpec(
  missionSpec,
  { speakingBacklog, worldState, toolCapabilities, source = "mission-spec.json" } = {},
) {
  const errors = [];
  if (!isPlainObject(missionSpec)) {
    return [`${source}: must be an object`];
  }
  if (missionSpec.schema_version !== 1) push(errors, source, "schema_version must be 1");

  for (const field of [
    "mission_id",
    "world_ref",
    "npc_ref",
    "backlog_item_id",
    "target_skill",
    "required_learner_action",
    "transfer_test",
    "fallback_mode",
    "claim_boundary",
  ]) {
    validateString(missionSpec[field], source, field, errors);
  }
  if (!allowedSkills.includes(missionSpec.target_skill)) {
    push(errors, source, `target_skill must be one of ${allowedSkills.join(", ")}`);
  }
  if (!allowedFallbackModes.includes(missionSpec.fallback_mode)) {
    push(errors, source, `fallback_mode must be one of ${allowedFallbackModes.join(", ")}`);
  }
  validateStringArray(missionSpec.real_world_transfer_target, source, "real_world_transfer_target", errors);

  if (!isPlainObject(missionSpec.learner_visible_scene)) {
    push(errors, source, "learner_visible_scene must be an object");
  } else {
    for (const field of ["title", "setup", "ask", "example"]) {
      validateString(missionSpec.learner_visible_scene[field], source, `learner_visible_scene.${field}`, errors);
    }
  }

  if (!isPlainObject(missionSpec.win_condition)) {
    push(errors, source, "win_condition must be an object");
  } else {
    if (missionSpec.win_condition.type !== "speaking_transfer_test") {
      push(errors, source, "win_condition.type must be speaking_transfer_test");
    }
    if (missionSpec.win_condition.must_pass_backlog_item !== missionSpec.backlog_item_id) {
      push(errors, source, "win_condition.must_pass_backlog_item must equal backlog_item_id");
    }
  }

  if (!isPlainObject(missionSpec.story_consequence)) {
    push(errors, source, "story_consequence must be an object");
  } else {
    validateString(missionSpec.story_consequence.on_pass, source, "story_consequence.on_pass", errors);
    validateString(
      missionSpec.story_consequence.on_needs_review,
      source,
      "story_consequence.on_needs_review",
      errors,
    );
  }

  if (!isPlainObject(missionSpec.capability_requirements)) {
    push(errors, source, "capability_requirements must be an object");
  } else {
    validateStringArray(missionSpec.capability_requirements.required, source, "capability_requirements.required", errors);
    if (!missionSpec.capability_requirements.required?.includes("text")) {
      push(errors, source, "capability_requirements.required must include text");
    }
    for (const capability of missionSpec.capability_requirements.required ?? []) {
      if (mediaCapabilities.includes(capability)) {
        push(errors, source, `generated/media capability may be optional only in M10: ${capability}`);
      }
    }
    if (!Array.isArray(missionSpec.capability_requirements.optional)) {
      push(errors, source, "capability_requirements.optional must be an array");
    }
  }

  const backlogItem = normalizeBacklogItems(speakingBacklog).find((item) => item.id === missionSpec.backlog_item_id);
  if (!backlogItem) {
    push(errors, source, "backlog_item_id must reference an existing Speaking Skill OS backlog item");
  } else {
    if (backlogItem.skill !== missionSpec.target_skill) {
      push(errors, source, "target_skill must match the linked backlog item skill");
    }
    if (stringValue(backlogItem.transfer_test) !== stringValue(missionSpec.transfer_test)) {
      push(errors, source, "transfer_test must match the linked backlog item transfer_test");
    }
  }

  if (worldState) {
    const npcs = Array.isArray(worldState.npc_canon) ? worldState.npc_canon : [];
    if (!npcs.some((npc) => npc.id === missionSpec.npc_ref)) {
      push(errors, source, "npc_ref must reference world_state.npc_canon");
    }
    if (!stringValue(missionSpec.world_ref).includes(stringValue(worldState.world_id))) {
      push(errors, source, "world_ref must include the linked world_id");
    }
  }

  if (toolCapabilities) {
    const available = toolCapabilities.capabilities ?? {};
    if (available.text !== true) push(errors, source, "text capability must be available");
    if (toolCapabilities.fallback?.text_scene_card_required !== true) {
      push(errors, source, "tool fallback must require a text scene card");
    }
    for (const capability of missionSpec.capability_requirements?.required ?? []) {
      if (available[capability] !== true) {
        push(errors, source, `required capability is not available: ${capability}`);
      }
    }
  }

  if (!claimBoundaryIsBounded(missionSpec.claim_boundary)) {
    push(errors, source, "claim_boundary must limit claims to local transfer evidence and say narrative is not proof");
  }
  errors.push(...unsupportedClaimErrors(missionSpec, source));
  return errors;
}

export function validateNarrativeMissionBundle({
  missionSpec,
  worldState,
  toolCapabilities,
  speakingBacklog,
} = {}) {
  return [
    ...validateWorldState(worldState),
    ...validateToolCapabilities(toolCapabilities),
    ...validateMissionSpec(missionSpec, {
      speakingBacklog,
      worldState,
      toolCapabilities,
    }),
  ];
}

function hasCapability(toolCapabilities, capability) {
  return toolCapabilities?.capabilities?.[capability] === true;
}

function optionalCapabilityAvailable(toolCapabilities, capability) {
  const capabilityMap = {
    image: ["image_generation", "image_input"],
    voice: ["voice_transcript"],
    web: ["web_search"],
    browser: ["browser"],
    mcp: ["mcp"],
    realtime_voice: ["realtime_voice"],
  };
  return (capabilityMap[capability] || [capability]).some((mapped) => hasCapability(toolCapabilities, mapped));
}

export function routeMissionCapabilities(missionSpec, toolCapabilities) {
  const capabilityErrors = validateToolCapabilities(toolCapabilities);
  if (capabilityErrors.length) {
    throw new Error(capabilityErrors.join("; "));
  }
  const missionRequired = missionSpec?.capability_requirements?.required ?? [];
  if (!missionRequired.includes("text")) {
    throw new Error("mission capability route requires text as the required capability");
  }
  for (const capability of missionRequired) {
    if (capability !== "text") {
      throw new Error(`mission capability route rejects required generated/media capability: ${capability}`);
    }
  }
  if (toolCapabilities.fallback?.text_scene_card_required !== true) {
    throw new Error("mission capability route requires a text scene card fallback");
  }

  const optional = missionSpec?.capability_requirements?.optional ?? [];
  const availableOptional = optional.filter((capability) => optionalCapabilityAvailable(toolCapabilities, capability));
  const hasCinematic = cinematicCapabilities.some((capability) => hasCapability(toolCapabilities, capability));
  const hasRich = richCapabilities.some((capability) => hasCapability(toolCapabilities, capability));
  const requestedMode = missionSpec?.fallback_mode || toolCapabilities.fallback.default_mode || "light";
  const presentationMode =
    toolCapabilities.cost_mode === "cinematic" && hasCinematic
      ? "cinematic"
      : toolCapabilities.cost_mode !== "light" && hasRich
        ? "rich"
        : "light";

  return {
    mission_id: missionSpec.mission_id,
    requested_mode: requestedMode,
    presentation_mode: presentationMode,
    can_complete_without_generation: true,
    required: ["text"],
    optional_requested: optional,
    optional_available: availableOptional,
    text_scene_card_required: true,
    fallback_reason:
      presentationMode === "light"
        ? "No generated media is required; text scene card is the canonical learning path."
        : "Optional capabilities may enrich presentation, but text scene card remains the learning path.",
    claim_boundary:
      "Capability routing changes presentation only. Speaking Skill OS transfer evidence remains text-first and local.",
  };
}

export function buildNarrativeScenario(missionSpec, backlogItem) {
  return {
    id: missionSpec.mission_id,
    title: missionSpec.learner_visible_scene.title,
    mode: missionSpec.fallback_mode,
    goal: `${missionSpec.required_learner_action} Transfer test: ${missionSpec.transfer_test}`,
    role_context: `${missionSpec.learner_visible_scene.setup} ${missionSpec.learner_visible_scene.ask}`,
    cefr_skill: missionSpec.target_skill,
    rescue_phrase: missionSpec.learner_visible_scene.example,
    follow_up_prompt: missionSpec.learner_visible_scene.ask,
    pattern: missionSpec.learner_visible_scene.example,
    retry_prompt: missionSpec.required_learner_action,
    speaking_backlog: {
      id: backlogItem.id,
      skill: backlogItem.skill,
      label: backlogItem.label,
      status: backlogItem.status,
      transfer_test: backlogItem.transfer_test,
      pass_criteria: backlogItem.pass_criteria,
    },
    narrative_mission: {
      mission_id: missionSpec.mission_id,
      world_ref: missionSpec.world_ref,
      npc_ref: missionSpec.npc_ref,
      learner_visible_scene: missionSpec.learner_visible_scene,
    },
  };
}

function storyConsequenceForEvidence(missionSpec, evidence) {
  const passed = evidence?.result === "pass";
  return {
    recorded_after_transfer_evidence: true,
    transfer_result: evidence?.result || "missing",
    text: passed ? missionSpec.story_consequence.on_pass : missionSpec.story_consequence.on_needs_review,
  };
}

export function persistNarrativeMissionSession({
  learnerRoot,
  learnerTurns,
  missionSpec,
  speakingBacklog,
  worldState,
  toolCapabilities,
  date = new Date(),
  sessionId,
}) {
  const validationErrors = validateNarrativeMissionBundle({
    missionSpec,
    speakingBacklog,
    worldState,
    toolCapabilities,
  });
  if (validationErrors.length) {
    throw new Error(validationErrors.join("; "));
  }

  const backlogItem = speakingBacklog.items.find((item) => item.id === missionSpec.backlog_item_id);
  const capabilityRoute = routeMissionCapabilities(missionSpec, toolCapabilities);
  const scenario = buildNarrativeScenario(missionSpec, backlogItem);
  const session = buildSession(learnerTurns, {
    sessionId: sessionId || `${date.toISOString().slice(0, 10)}-${date.getTime()}-narrative`,
    opening: "Narrative mission. Speak once, then the story can move only after the transfer check.",
    scenario,
    selectionReason: {
      source: "narrative-mission",
      mission_id: missionSpec.mission_id,
      speaking_backlog_item_id: missionSpec.backlog_item_id,
      speaking_backlog_skill: missionSpec.target_skill,
      mode: missionSpec.fallback_mode,
    },
  });
  session.narrative_mission = {
    mission_id: missionSpec.mission_id,
    world_ref: missionSpec.world_ref,
    npc_ref: missionSpec.npc_ref,
    capability_route: capabilityRoute,
    learner_visible_scene: missionSpec.learner_visible_scene,
    story_consequence: null,
    claim_boundary: missionSpec.claim_boundary,
  };

  const persisted = persistSession(learnerRoot, session, date);
  const storyConsequence = storyConsequenceForEvidence(missionSpec, session.speaking_backlog_evidence);
  session.narrative_mission.story_consequence = storyConsequence;

  const artifact = JSON.parse(readFileSync(persisted.artifactPath, "utf8"));
  artifact.narrative_mission = {
    ...artifact.narrative_mission,
    story_consequence: storyConsequence,
  };
  writeFileSync(persisted.artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

  return {
    session,
    persisted,
    storyConsequence,
  };
}
