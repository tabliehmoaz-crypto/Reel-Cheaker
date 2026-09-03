/*
  MTI — Analysis Contract
  Standard data contract for Reel Analysis.

  Responsibility:
  - Define the expected structure of analysis input/output.
  - Keep Engine, AI, Memory and UI speaking the same language.
  - Provide safe defaults and normalization.
*/

export const ANALYSIS_VERSION = "2.0.0";


export const ANALYSIS_FEATURES = Object.freeze([
  "hook",
  "retention",
  "psychology",
  "visuals",
  "audio",
  "text",
  "pacing",
  "storytelling",
  "attentionMap",
  "prediction",
  "sceneAnalysis",
  "recommendations"
]);


export function createAnalysisInput(data = {}) {

  return {

    id:
      data.id || null,

    accountId:
      data.accountId || null,

    video: data.video || null,

    file: data.file || null,

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
        data.metadata?.size ||
        data.size ||
        null,

      duration:
        data.metadata?.duration ||
        data.duration ||
        null,

      width:
        data.metadata?.width ||
        data.width ||
        null,

      height:
        data.metadata?.height ||
        data.height ||
        null,

      fps:
        data.metadata?.fps ||
        data.fps ||
        null

    },

    context: {

      niche:
        data.context?.niche ||
        data.niche ||
        null,

      baselineViews:
        data.context?.baselineViews ||
        data.baselineViews ||
        null,

      platform:
        data.context?.platform ||
        "instagram",

      language:
        data.context?.language ||
        "ar"

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
        data.options?.includeRecommendations !== false

    }

  };

}


export function createEmptyScore() {

  return {

    score: null,

    confidence: null,

    explanation: null,

    evidence: []

  };

}


export function createAnalysisResult(data = {}) {

  return {

    version:
      ANALYSIS_VERSION,

    jobId:
      data.jobId || null,

    accountId:
      data.accountId || null,

    createdAt:
      data.createdAt ||
      new Date().toISOString(),

    overall: {
      score:
        data.overall?.score ??
        null,

      confidence:
        data.overall?.confidence ??
        null
    },


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
        createEmptyScore()

    },


    attentionMap:
      Array.isArray(
        data.attentionMap
      )
        ? [
            ...data.attentionMap
          ]
        : [],


    scenes:
      Array.isArray(data.scenes)
        ? [
            ...data.scenes
          ]
        : [],


    prediction: {

      expectedViews:
        data.prediction?.expectedViews ??
        null,

      lowerRange:
        data.prediction?.lowerRange ??
        null,

      upperRange:
        data.prediction?.upperRange ??
        null,

      confidence:
        data.prediction?.confidence ??
        null,

      reasoning:
        data.prediction?.reasoning ||
        null

    },


    strengths:
      Array.isArray(data.strengths)
        ? [
            ...data.strengths
          ]
        : [],


    weaknesses:
      Array.isArray(data.weaknesses)
        ? [
            ...data.weaknesses
          ]
        : [],


    recommendations:
      Array.isArray(data.recommendations)
        ? [
            ...data.recommendations
          ]
        : [],


    evidence:
      Array.isArray(data.evidence)
        ? [
            ...data.evidence
          ]
        : [],


    raw:
      data.raw || null

  };

}


export function normalizeScore(value) {

  if (value === null || value === undefined) {
    return null;
  }


  const number =
    Number(value);


  if (!Number.isFinite(number)) {
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

      accountId:
        result.accountId ||
        context.accountId ||
        null

    });


  for (
    const key of Object.keys(
      normalized.scores
    )
  ) {

    const score =
      normalized.scores[key];


    if (
      score &&
      typeof score === "object"
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


  normalized.overall.score =
    normalizeScore(
      normalized.overall.score
    );


  normalized.overall.confidence =
    normalizeScore(
      normalized.overall.confidence
    );


  normalized.prediction.confidence =
    normalizeScore(
      normalized.prediction.confidence
    );


  return normalized;

}


export function validateAnalysisInput(
  input
) {

  const errors = [];


  if (!input) {

    errors.push(
      "Analysis input is required."
    );

    return {
      valid: false,
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


export function validateAnalysisResult(
  result
) {

  const errors = [];


  if (!result) {

    errors.push(
      "Analysis result is required."
    );

    return {
      valid: false,
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
    typeof result.scores !== "object"
  ) {

    errors.push(
      "Analysis scores are missing."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


export default {

  ANALYSIS_VERSION,

  ANALYSIS_FEATURES,

  createAnalysisInput,

  createEmptyScore,

  createAnalysisResult,

  normalizeScore,

  normalizeAnalysisResult,

  validateAnalysisInput,

  validateAnalysisResult

};
