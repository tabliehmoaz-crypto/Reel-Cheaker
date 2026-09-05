/*
  MTI — Intelligence Schema
  -------------------------
  Defines the structured language used by MTI AI.

  The AI does NOT return random prose.

  Every insight must be connected to:
  - observable evidence
  - psychological mechanism
  - viewer decision
  - confidence
  - expected effect
  - recommendation

  This schema is the foundation of MTI Intelligence.
*/


export const INTELLIGENCE_VERSION =
  "1.0.0";


export const VIEWER_DECISIONS = {

  CONTINUE:
    "continue",

  PAUSE:
    "pause",

  REWATCH:
    "rewatch",

  SHARE:
    "share",

  SAVE:
    "save",

  SKIP:
    "skip",

  EXIT:
    "exit"

};


export const INTELLIGENCE_DOMAINS = {

  ATTENTION:
    "attention",

  CURIOSITY:
    "curiosity",

  COGNITION:
    "cognition",

  EMOTION:
    "emotion",

  NARRATIVE:
    "narrative",

  PACING:
    "pacing",

  VISUAL:
    "visual",

  AUDIO:
    "audio",

  TEXT:
    "text",

  RELEVANCE:
    "relevance",

  TRUST:
    "trust",

  REWARD:
    "reward"

};


export const PSYCHOLOGICAL_MECHANISMS = {

  NOVELTY:
    "novelty",

  CURIOSITY_GAP:
    "curiosity_gap",

  PREDICTION_ERROR:
    "prediction_error",

  PATTERN_INTERRUPT:
    "pattern_interrupt",

  COGNITIVE_LOAD:
    "cognitive_load",

  PROCESSING_FLUENCY:
    "processing_fluency",

  EMOTIONAL_AROUSAL:
    "emotional_arousal",

  NARRATIVE_TENSION:
    "narrative_tension",

  INFORMATION_GAIN:
    "information_gain",

  EXPECTATION_CONFIRMATION:
    "expectation_confirmation",

  EXPECTATION_VIOLATION:
    "expectation_violation",

  SOCIAL_RELEVANCE:
    "social_relevance",

  SELF_RELEVANCE:
    "self_relevance",

  REWARD_ANTICIPATION:
    "reward_anticipation",

  REWARD_DELIVERY:
    "reward_delivery",

  MESSAGE_CLARITY:
    "message_clarity",

  CREDIBILITY:
    "credibility"

};


export const EVIDENCE_TYPES = {

  VISUAL:
    "visual",

  AUDIO:
    "audio",

  TEXT:
    "text",

  TEMPORAL:
    "temporal",

  SPEECH:
    "speech",

  STRUCTURAL:
    "structural",

  PERFORMANCE:
    "performance",

  MEMORY:
    "memory"

};


export const CONFIDENCE_LEVELS = {

  LOW:
    "low",

  MEDIUM:
    "medium",

  HIGH:
    "high"

};


/*
  A single observable event detected
  in the video.
*/
export function createEvidence(
  data = {}
) {

  return {

    type:
      data.type ||
      EVIDENCE_TYPES.STRUCTURAL,

    timestamp:
      data.timestamp ??
      null,

    duration:
      data.duration ??
      null,

    description:
      data.description ||
      "",

    value:
      data.value ??
      null,

    source:
      data.source ||
      null

  };

}


/*
  Psychological interpretation of evidence.
*/
export function createMechanism(
  data = {}
) {

  return {

    domain:
      data.domain ||
      INTELLIGENCE_DOMAINS.COGNITION,

    mechanism:
      data.mechanism ||
      null,

    explanation:
      data.explanation ||
      "",

    evidence:
      Array.isArray(data.evidence)
        ? data.evidence
        : [],

    confidence:
      data.confidence ||
      CONFIDENCE_LEVELS.MEDIUM

  };

}


/*
  Viewer decision prediction.
*/
export function createViewerDecision(
  data = {}
) {

  return {

    decision:
      data.decision ||
      VIEWER_DECISIONS.CONTINUE,

    probability:
      clamp(
        data.probability ??
        0,
        0,
        1
      ),

    timestamp:
      data.timestamp ??
      null,

    reason:
      data.reason ||
      "",

    mechanisms:
      Array.isArray(
        data.mechanisms
      )
        ? data.mechanisms
        : [],

    confidence:
      data.confidence ||
      CONFIDENCE_LEVELS.MEDIUM

  };

}


/*
  A concrete recommendation derived
  from evidence and psychology.
*/
export function createRecommendation(
  data = {}
) {

  return {

    priority:
      data.priority ||
      "medium",

    category:
      data.category ||
      INTELLIGENCE_DOMAINS.ATTENTION,

    problem:
      data.problem ||
      "",

    action:
      data.action ||
      "",

    reason:
      data.reason ||
      "",

    expectedEffect:
      data.expectedEffect ||
      "",

    evidence:
      Array.isArray(data.evidence)
        ? data.evidence
        : [],

    confidence:
      data.confidence ||
      CONFIDENCE_LEVELS.MEDIUM

  };

}


/*
  Main Intelligence Result.
*/
export function createIntelligenceResult(
  data = {}
) {

  return {

    version:
      data.version ||
      INTELLIGENCE_VERSION,

    createdAt:
      data.createdAt ||
      new Date().toISOString(),

    summary:
      data.summary ||
      "",

    overallConfidence:
      data.overallConfidence ||
      CONFIDENCE_LEVELS.MEDIUM,

    viewerJourney:
      Array.isArray(
        data.viewerJourney
      )
        ? data.viewerJourney
        : [],

    attention:
      data.attention ||
      null,

    curiosity:
      data.curiosity ||
      null,

    cognition:
      data.cognition ||
      null,

    emotion:
      data.emotion ||
      null,

    narrative:
      data.narrative ||
      null,

    pacing:
      data.pacing ||
      null,

    visual:
      data.visual ||
      null,

    audio:
      data.audio ||
      null,

    text:
      data.text ||
      null,

    mechanisms:
      Array.isArray(
        data.mechanisms
      )
        ? data.mechanisms
        : [],

    evidence:
      Array.isArray(
        data.evidence
      )
        ? data.evidence
        : [],

    dropOffRisks:
      Array.isArray(
        data.dropOffRisks
      )
        ? data.dropOffRisks
        : [],

    continuationDrivers:
      Array.isArray(
        data.continuationDrivers
      )
        ? data.continuationDrivers
        : [],

    recommendations:
      Array.isArray(
        data.recommendations
      )
        ? data.recommendations
        : [],

    prediction:
      data.prediction ||
      null,

    limitations:
      Array.isArray(
        data.limitations
      )
        ? data.limitations
        : []

  };

}


function clamp(
  value,
  min,
  max
) {

  const number =
    Number(value);


  if (
    Number.isNaN(number)
  ) {

    return min;

  }


  return Math.max(
    min,
    Math.min(
      max,
      number
    )
  );

}


export function validateIntelligenceResult(
  result
) {

  if (!result) {

    return {

      valid:
        false,

      errors: [
        "نتيجة الذكاء غير موجودة."
      ]

    };

  }


  const errors = [];


  if (
    !result.version
  ) {

    errors.push(
      "نسخة Intelligence غير موجودة."
    );

  }


  if (
    !Array.isArray(
      result.viewerJourney
    )
  ) {

    errors.push(
      "viewerJourney يجب أن تكون مصفوفة."
    );

  }


  if (
    !Array.isArray(
      result.mechanisms
    )
  ) {

    errors.push(
      "mechanisms يجب أن تكون مصفوفة."
    );

  }


  if (
    !Array.isArray(
      result.recommendations
    )
  ) {

    errors.push(
      "recommendations يجب أن تكون مصفوفة."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


export function normalizeIntelligenceResult(
  result = {}
) {

  const normalized =
    createIntelligenceResult(
      result
    );


  normalized.viewerJourney =
    normalized.viewerJourney.map(
      item =>
        createViewerDecision(item)
    );


  normalized.mechanisms =
    normalized.mechanisms.map(
      item =>
        createMechanism(item)
    );


  normalized.evidence =
    normalized.evidence.map(
      item =>
        createEvidence(item)
    );


  normalized.recommendations =
    normalized.recommendations.map(
      item =>
        createRecommendation(item)
    );


  return normalized;

}


export default createIntelligenceResult;
