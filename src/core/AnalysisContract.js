/*
  MTI — Analysis Contract
  -----------------------
  Standard data contract for MTI Reel Analysis.

  Responsibility:
  - Define the expected structure of analysis input/output.
  - Keep Engine, Intelligence, Memory and UI speaking
    the same language.
  - Provide safe defaults and normalization.
  - Support MTI V3 Local-First architecture.
  - Preserve account isolation.
*/

export const ANALYSIS_VERSION = "3.0.0";


export const ANALYSIS_FEATURES = Object.freeze([
  "hook",
  "retention",
  "psychology",
  "visual",
  "audio",
  "text",
  "pacing",
  "storytelling",
  "speech",
  "idea",
  "technical",
  "dropOff",
  "diagnosis",
  "attentionMap",
  "sceneAnalysis",
  "viewerJourney",
  "curiosity",
  "cognition",
  "emotion",
  "narrative",
  "recommendations",
  "prediction",
  "learning"
]);


/* =====================================================
   INPUT
===================================================== */

export function createAnalysisInput(data = {}) {

  return {

    id:
      data.id ||
      null,

    jobId:
      data.jobId ||
      null,

    experimentId:
      data.experimentId ||
      null,

    accountId:
      data.accountId ||
      null,

    video:
      data.video ||
      null,

    file:
      data.file ||
      null,


    metadata: {

      filename:
        data.metadata?.filename ||
        data.filename ||
        null,

      mimeType:
        data.metadata?.mimeType ||
        data.mimeType ||
        null,

      size:
        data.metadata?.size ??
        data.size ??
        null,

      duration:
        data.metadata?.duration ??
        data.duration ??
        null,

      width:
        data.metadata?.width ??
        data.width ??
        null,

      height:
        data.metadata?.height ??
        data.height ??
        null,

      fps:
        data.metadata?.fps ??
        data.fps ??
        null

    },


    context: {

      niche:
        data.context?.niche ||
        data.niche ||
        null,

      baselineViews:
        data.context?.baselineViews ??
        data.baselineViews ??
        null,

      platform:
        data.context?.platform ||
        "instagram",

      language:
        data.context?.language ||
        "ar",

      audience:
        data.context?.audience ||
        null

    },


    options: {

      features:
        Array.isArray(
          data.options?.features
        )
          ? [
              ...data.options.features
            ]
          : [
              ...ANALYSIS_FEATURES
            ],

      includeScenes:
        data.options?.includeScenes !== false,

      includeAttentionMap:
        data.options?.includeAttentionMap !== false,

      includePrediction:
        data.options?.includePrediction !== false,

      includeRecommendations:
        data.options?.includeRecommendations !== false,

      includeIntelligence:
        data.options?.includeIntelligence !== false,

      includeLearning:
        data.options?.includeLearning !== false

    }

  };

}


/* =====================================================
   EMPTY SCORE
===================================================== */

export function createEmptyScore() {

  return {

    score: null,

    confidence: null,

    explanation: null,

    evidence: []

  };

}


/* =====================================================
   INTELLIGENCE
===================================================== */

export function createEmptyIntelligence() {

  return {

    available:
      false,

    version:
      null,

    summary:
      null,

    overallConfidence:
      null,

    viewerJourney:
      null,

    attention:
      [],

    curiosity:
      null,

    cognition:
      null,

    emotion:
      null,

    narrative:
      null,

    pacing:
      null,

    visual:
      null,

    audio:
      null,

    text:
      null,

    mechanisms:
      [],

    evidence:
      [],

    dropOffRisks:
      [],

    continuationDrivers:
      [],

    recommendations:
      [],

    prediction:
      null,

    limitations:
      []

  };

}


/* =====================================================
   PREDICTION
===================================================== */

export function createEmptyPrediction() {

  return {

    expectedViews:
      null,

    lowerRange:
      null,

    upperRange:
      null,

    confidence:
      null,

    reasoning:
      null

  };

}


/* =====================================================
   RESULT
===================================================== */

export function createAnalysisResult(data = {}) {

  return {

    version:
      ANALYSIS_VERSION,

    id:
      data.id ||
      null,

    jobId:
      data.jobId ||
      null,

    experimentId:
      data.experimentId ||
      null,

    accountId:
      data.accountId ||
      null,

    engine:
      data.engine ||
      "reel-engine",


    status:
      data.status ||
      "completed",


    createdAt:
      data.createdAt ||
      new Date().toISOString(),

    updatedAt:
      data.updatedAt ||
      new Date().toISOString(),


    /* ---------------------------------------------
       OVERALL
    --------------------------------------------- */

    overall: {

      score:
        data.overall?.score ??
        null,

      confidence:
        data.overall?.confidence ??
        null

    },


    /* ---------------------------------------------
       SCORES
    --------------------------------------------- */

    scores: {

      hook:
        data.scores?.hook ||
        createEmptyScore(),

      retention:
        data.scores?.retention ||
        createEmptyScore(),

      psychology:
        data.scores?.psychology ||
        createEmptyScore(),

      visual:
        data.scores?.visual ||
        createEmptyScore(),

      audio:
        data.scores?.audio ||
        createEmptyScore(),

      text:
        data.scores?.text ||
        createEmptyScore(),

      pacing:
        data.scores?.pacing ||
        createEmptyScore(),

      storytelling:
        data.scores?.storytelling ||
        createEmptyScore(),

      speech:
        data.scores?.speech ||
        createEmptyScore(),

      idea:
        data.scores?.idea ||
        createEmptyScore(),

      technical:
        data.scores?.technical ||
        createEmptyScore()

    },


    /* ---------------------------------------------
       DROP OFF
    --------------------------------------------- */

    dropOff:
      data.dropOff ||
      null,


    /* ---------------------------------------------
       DIAGNOSIS
    --------------------------------------------- */

    diagnosis:
      data.diagnosis ||
      null,


    /* ---------------------------------------------
       INTELLIGENCE
    --------------------------------------------- */

    intelligence: {

      ...createEmptyIntelligence(),

      ...(data.intelligence || {})

    },


    /* ---------------------------------------------
       ATTENTION MAP
    --------------------------------------------- */

    attentionMap:
      Array.isArray(
        data.attentionMap
      )
        ? [
            ...data.attentionMap
          ]
        : [],


    /* ---------------------------------------------
       SCENES
    --------------------------------------------- */

    scenes:
      Array.isArray(
        data.scenes
      )
        ? [
            ...data.scenes
          ]
        : [],


    /* ---------------------------------------------
       PREDICTION
    --------------------------------------------- */

    prediction: {

      ...createEmptyPrediction(),

      ...(data.prediction || {})

    },


    /* ---------------------------------------------
       RECOMMENDATIONS
    --------------------------------------------- */

    recommendations:
      Array.isArray(
        data.recommendations
      )
        ? [
            ...data.recommendations
          ]
        : [],


    /* ---------------------------------------------
       STRENGTHS / WEAKNESSES
    --------------------------------------------- */

    strengths:
      Array.isArray(
        data.strengths
      )
        ? [
            ...data.strengths
          ]
        : [],


    weaknesses:
      Array.isArray(
        data.weaknesses
      )
        ? [
            ...data.weaknesses
          ]
        : [],


    /* ---------------------------------------------
       EVIDENCE
    --------------------------------------------- */

    evidence:
      Array.isArray(
        data.evidence
      )
        ? [
            ...data.evidence
          ]
        : [],


    /* ---------------------------------------------
       PERFORMANCE
    --------------------------------------------- */

    performance:
      data.performance ||
      null,


    /* ---------------------------------------------
       COMPARISON
    --------------------------------------------- */

    comparison:
      data.comparison ||
      null,


    /* ---------------------------------------------
       LEARNING
    --------------------------------------------- */

    learning:
      data.learning ||
      null,


    /* ---------------------------------------------
       ERRORS
    --------------------------------------------- */

    errors:
      Array.isArray(
        data.errors
      )
        ? [
            ...data.errors
          ]
        : [],


    /* ---------------------------------------------
       METADATA
    --------------------------------------------- */

    metadata: {

      source:
        data.metadata?.source ||
        "local",

      externalAI:
        data.metadata?.externalAI === true
          ? true
          : false,

      localFirst:
        data.metadata?.localFirst !== false,

      ...(data.metadata || {})

    },


    /* ---------------------------------------------
       RAW
    --------------------------------------------- */

    raw:
      data.raw ||
      null

  };

}


/* =====================================================
   NORMALIZE SCORE
===================================================== */

export function normalizeScore(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return null;

  }


  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return null;

  }


  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );

}


/* =====================================================
   NORMALIZE RESULT
===================================================== */

export function normalizeAnalysisResult(
  result = {},
  context = {}
) {

  const normalized =
    createAnalysisResult({

      ...result,

      jobId:
        result.jobId ||
        context.jobId ||
        null,

      experimentId:
        result.experimentId ||
        context.experimentId ||
        null,

      accountId:
        result.accountId ||
        context.accountId ||
        null

    });


  /* ---------------------------------------------
     SCORE NORMALIZATION
  --------------------------------------------- */

  for (
    const key of Object.keys(
      normalized.scores
    )
  ) {

    const score =
      normalized.scores[key];


    if (
      score &&
      typeof score ===
      "object"
    ) {

      score.score =
        normalizeScore(
          score.score
        );

      score.confidence =
        normalizeScore(
          score.confidence
        );

    }

  }


  /* ---------------------------------------------
     OVERALL
  --------------------------------------------- */

  normalized.overall.score =
    normalizeScore(
      normalized.overall.score
    );


  normalized.overall.confidence =
    normalizeScore(
      normalized.overall.confidence
    );


  /* ---------------------------------------------
     INTELLIGENCE
  --------------------------------------------- */

  normalized.intelligence.overallConfidence =
    normalizeScore(
      normalized.intelligence.overallConfidence
    );


  /* ---------------------------------------------
     PREDICTION
  --------------------------------------------- */

  normalized.prediction.confidence =
    normalizeScore(
      normalized.prediction.confidence
    );


  return normalized;

}


/* =====================================================
   VALIDATE INPUT
===================================================== */

export function validateAnalysisInput(
  input
) {

  const errors = [];


  if (!input) {

    errors.push(
      "Analysis input is required."
    );


    return {

      valid:
        false,

      errors

    };

  }


  if (
    !input.video &&
    !input.file
  ) {

    errors.push(
      "A video or file is required."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


/* =====================================================
   VALIDATE RESULT
===================================================== */

export function validateAnalysisResult(
  result
) {

  const errors = [];


  if (!result) {

    errors.push(
      "Analysis result is required."
    );


    return {

      valid:
        false,

      errors

    };

  }


  if (!result.version) {

    errors.push(
      "Analysis result version is missing."
    );

  }


  if (
    !result.scores ||
    typeof result.scores !==
    "object"
  ) {

    errors.push(
      "Analysis scores are missing."
    );

  }


  if (
    result.accountId ===
    undefined
  ) {

    errors.push(
      "Analysis accountId is missing."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


/* =====================================================
   DEFAULT EXPORT
===================================================== */

export default {

  ANALYSIS_VERSION,

  ANALYSIS_FEATURES,

  createAnalysisInput,

  createEmptyScore,

  createEmptyIntelligence,

  createEmptyPrediction,

  createAnalysisResult,

  normalizeScore,

  normalizeAnalysisResult,

  validateAnalysisInput,

  validateAnalysisResult

};
