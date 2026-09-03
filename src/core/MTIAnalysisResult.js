/*
  MTI — Analysis Result
  ---------------------
  Unified result object for MTI.

  الهدف:
  - توحيد شكل نتيجة التحليل
  - حماية UI / AI / Memory من اختلافات المحركات
  - توفير Helpers بسيطة للوصول للنتيجة
*/

export const RESULT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  PARTIAL: "partial",
  FAILED: "failed"
};


function clone(value) {

  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value)
  );

}


function now() {

  return new Date().toISOString();

}


export function createAnalysisResult(
  data = {}
) {

  return {

    version:
      data.version ||
      "2.0.0",

    id:
      data.id ||
      `analysis_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    status:
      data.status ||
      RESULT_STATUS.COMPLETED,

    createdAt:
      data.createdAt ||
      now(),

    completedAt:
      data.completedAt ||
      now(),

    experimentId:
      data.experimentId ||
      null,

    engine:
      data.engine ||
      "reel-engine",

    video:
      clone(data.video) ||
      null,

    scores:
      clone(data.scores) ||
      {},

    overall:
      data.overall ??
      null,

    hook:
      clone(data.hook) ||
      null,

    retention:
      clone(data.retention) ||
      null,

    psychology:
      clone(data.psychology) ||
      null,

    visual:
      clone(data.visual) ||
      null,

    audio:
      clone(data.audio) ||
      null,

    text:
      clone(data.text) ||
      null,

    pacing:
      clone(data.pacing) ||
      null,

    storytelling:
      clone(data.storytelling) ||
      null,

    attentionMap:
      clone(data.attentionMap) ||
      null,

    prediction:
      clone(data.prediction) ||
      null,

    sceneAnalysis:
      clone(data.sceneAnalysis) ||
      null,

    diagnosis:
      clone(data.diagnosis) ||
      null,

    recommendations:
      clone(data.recommendations) ||
      [],

    performance:
      clone(data.performance) ||
      null,

    comparison:
      clone(data.comparison) ||
      null,

    learning:
      clone(data.learning) ||
      null,

    errors:
      clone(data.errors) ||
      [],

    metadata:
      clone(data.metadata) ||
      {}

  };

}


export function normalizeAnalysisResult(
  result = {}
) {

  const normalized =
    createAnalysisResult(
      result
    );


  if (
    typeof normalized.overall === "object" &&
    normalized.overall !== null
  ) {

    normalized.overall =
      normalized.overall.score ??
      null;

  }


  if (
    typeof normalized.overall === "number"
  ) {

    normalized.overall =
      Math.max(
        0,
        Math.min(
          100,
          normalized.overall
        )
      );

  }


  return normalized;

}


export function isAnalysisComplete(
  result
) {

  return (
    !!result &&
    result.status ===
      RESULT_STATUS.COMPLETED
  );

}


export function isAnalysisPartial(
  result
) {

  return (
    !!result &&
    result.status ===
      RESULT_STATUS.PARTIAL
  );

}


export function hasAnalysisErrors(
  result
) {

  return (
    !!result &&
    Array.isArray(result.errors) &&
    result.errors.length > 0
  );

}


export function getOverallScore(
  result
) {

  if (!result) {
    return null;
  }


  if (
    typeof result.overall ===
    "number"
  ) {

    return result.overall;

  }


  if (
    result.overall &&
    typeof result.overall.score ===
    "number"
  ) {

    return result.overall.score;

  }


  if (
    result.scores &&
    typeof result.scores.overall ===
    "number"
  ) {

    return result.scores.overall;

  }


  return null;

}


export function getScore(
  result,
  key
) {

  if (
    !result ||
    !key
  ) {

    return null;

  }


  const direct =
    result.scores?.[key];


  if (
    typeof direct ===
    "number"
  ) {

    return direct;

  }


  if (
    direct &&
    typeof direct.score ===
    "number"
  ) {

    return direct.score;

  }


  const section =
    result[key];


  if (
    section &&
    typeof section.score ===
    "number"
  ) {

    return section.score;

  }


  return null;

}


export function getRecommendations(
  result
) {

  if (
    !result ||
    !Array.isArray(
      result.recommendations
    )
  ) {

    return [];

  }


  return clone(
    result.recommendations
  );

}


export function getSummary(
  result
) {

  return {

    id:
      result?.id ||
      null,

    status:
      result?.status ||
      RESULT_STATUS.FAILED,

    engine:
      result?.engine ||
      null,

    overall:
      getOverallScore(result),

    hook:
      getScore(result, "hook"),

    pacing:
      getScore(result, "pacing"),

    visual:
      getScore(result, "visual"),

    recommendations:
      getRecommendations(result)
        .length,

    hasErrors:
      hasAnalysisErrors(result)

  };

}


export default createAnalysisResult;
