/*
  MTI — Analysis Result
  ---------------------
  Unified result contract for MTI analysis.

  هذا الملف لا يحلل الفيديو.
  ولا يتصل بأي AI خارجي.

  وظيفته:
  - توحيد نتيجة Reel Engine
  - احتواء Local Intelligence
  - الحفاظ على Prediction / Performance / Learning
  - إعطاء Core نتيجة ثابتة يمكن تخزينها لاحقاً في Memory
*/


export const RESULT_VERSION =
  "3.0.0";


export const RESULT_STATUS = {

  PENDING:
    "pending",

  COMPLETED:
    "completed",

  PARTIAL:
    "partial",

  FAILED:
    "failed"

};



/* =========================================================
   CREATE
========================================================= */


export function createAnalysisResult(
  data = {}
) {

  const localAnalysis =
    data.localAnalysis ||
    data.analysis ||
    data;


  const intelligence =
    data.intelligence ||
    null;


  return {

    version:
      data.version ||
      RESULT_VERSION,


    id:
      data.id ||
      generateResultId(),


    status:
      data.status ||
      RESULT_STATUS.COMPLETED,


    createdAt:
      data.createdAt ||
      new Date().toISOString(),


    updatedAt:
      new Date().toISOString(),



    /* -----------------------------------------------------
       IDENTIFICATION
    ----------------------------------------------------- */


    experimentId:
      data.experimentId ||
      null,


    engine:
      data.engine ||
      null,



    /* -----------------------------------------------------
       VIDEO
    ----------------------------------------------------- */


    video:
      localAnalysis.video ||
      data.video ||
      null,



    /* -----------------------------------------------------
       LOCAL ANALYSIS
    ----------------------------------------------------- */


    scores:
      localAnalysis.scores ||
      data.scores ||
      {},


    overall:
      localAnalysis.overall ??
      data.overall ??
      null,


    hook:
      localAnalysis.hook ||
      data.hook ||
      null,


    retention:
      localAnalysis.retention ||
      data.retention ||
      null,


    visual:
      localAnalysis.visual ||
      data.visual ||
      null,


    audio:
      localAnalysis.audio ||
      data.audio ||
      null,


    text:
      localAnalysis.text ||
      data.text ||
      null,


    pacing:
      localAnalysis.pacing ||
      data.pacing ||
      null,


    storytelling:
      localAnalysis.storytelling ||
      data.storytelling ||
      null,


    psychology:
      localAnalysis.psychology ||
      data.psychology ||
      null,


    speech:
      localAnalysis.speech ||
      data.speech ||
      null,


    idea:
      localAnalysis.idea ||
      data.idea ||
      null,


    technical:
      localAnalysis.technical ||
      data.technical ||
      null,


    dropOff:
      localAnalysis.dropOff ||
      data.dropOff ||
      null,


    diagnosis:
      localAnalysis.diagnosis ||
      data.diagnosis ||
      null,



    /* -----------------------------------------------------
       LOCAL INTELLIGENCE
    ----------------------------------------------------- */


    intelligence: {

      available:
        !!intelligence,


      version:
        intelligence?.version ||
        null,


      summary:
        intelligence?.summary ||
        null,


      overallConfidence:
        intelligence?.overallConfidence ||
        null,


      viewerJourney:
        intelligence?.viewerJourney ||
        [],


      attention:
        intelligence?.attention ||
        null,


      curiosity:
        intelligence?.curiosity ||
        null,


      cognition:
        intelligence?.cognition ||
        null,


      emotion:
        intelligence?.emotion ||
        null,


      narrative:
        intelligence?.narrative ||
        null,


      pacing:
        intelligence?.pacing ||
        null,


      visual:
        intelligence?.visual ||
        null,


      audio:
        intelligence?.audio ||
        null,


      text:
        intelligence?.text ||
        null,


      mechanisms:
        intelligence?.mechanisms ||
        [],


      evidence:
        intelligence?.evidence ||
        [],


      dropOffRisks:
        intelligence?.dropOffRisks ||
        [],


      continuationDrivers:
        intelligence?.continuationDrivers ||
        [],


      recommendations:
        intelligence?.recommendations ||
        [],


      prediction:
        intelligence?.prediction ||
        null,


      limitations:
        intelligence?.limitations ||
        []

    },



    /* -----------------------------------------------------
       PREDICTION
    ----------------------------------------------------- */


    prediction:
      data.prediction ||
      intelligence?.prediction ||
      null,



    /* -----------------------------------------------------
       RECOMMENDATIONS
    ----------------------------------------------------- */


    recommendations:
      data.recommendations ||
      intelligence?.recommendations ||
      localAnalysis.recommendations ||
      [],



    /* -----------------------------------------------------
       PERFORMANCE
    ----------------------------------------------------- */


    performance:
      data.performance ||
      null,



    /* -----------------------------------------------------
       COMPARISON
    ----------------------------------------------------- */


    comparison:
      data.comparison ||
      null,



    /* -----------------------------------------------------
       LEARNING
    ----------------------------------------------------- */


    learning:
      data.learning ||
      null,



    /* -----------------------------------------------------
       ERRORS
    ----------------------------------------------------- */


    errors:
      data.errors ||
      [],



    /* -----------------------------------------------------
       METADATA
    ----------------------------------------------------- */


    metadata:
      data.metadata ||
      {

        source:
          "local",

        externalAI:
          false

      }

  };

}



/* =========================================================
   NORMALIZE
========================================================= */


export function normalizeAnalysisResult(
  result
) {

  if (
    !result ||
    typeof result !==
    "object"
  ) {

    return createAnalysisResult();

  }


  return createAnalysisResult(
    result
  );

}



/* =========================================================
   VALIDATION
========================================================= */


export function isAnalysisComplete(
  result
) {

  return (

    !!result &&

    result.status ===
      RESULT_STATUS.COMPLETED &&

    (
      result.overall !== null ||
      result.intelligence?.available === true
    )

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

    Array.isArray(
      result?.errors
    ) &&

    result.errors.length > 0

  );

}



/* =========================================================
   SCORE HELPERS
========================================================= */


export function getOverallScore(
  result
) {

  if (
    result?.overall !== null &&
    result?.overall !== undefined
  ) {

    return normalizeScore(
      result.overall
    );

  }


  if (
    result?.intelligence?.prediction?.score !==
    undefined
  ) {

    return normalizeScore(
      result.intelligence
        .prediction.score
    );

  }


  return null;

}



export function getScore(
  result,
  name
) {

  if (
    !name
  ) {

    return null;

  }


  const localScore =
    result?.scores?.[name];


  if (
    localScore !==
    undefined
  ) {

    return normalizeScore(
      localScore
    );

  }


  const intelligenceScore =
    result?.intelligence?.[name]
      ?.score;


  if (
    intelligenceScore !==
    undefined
  ) {

    return normalizeScore(
      intelligenceScore
    );

  }


  return null;

}



/* =========================================================
   INTELLIGENCE HELPERS
========================================================= */


export function getIntelligence(
  result
) {

  return (
    result?.intelligence ||
    null
  );

}



export function hasIntelligence(
  result
) {

  return (
    result?.intelligence?.available ===
    true
  );

}



export function getViewerJourney(
  result
) {

  return (
    result?.intelligence?.viewerJourney ||
    []
  );

}



export function getDropOffRisks(
  result
) {

  return (
    result?.intelligence?.dropOffRisks ||
    []
  );

}



export function getContinuationDrivers(
  result
) {

  return (
    result?.intelligence?.continuationDrivers ||
    []
  );

}



export function getRecommendations(
  result
) {

  return (
    result?.intelligence?.recommendations ||
    result?.recommendations ||
    []
  );

}



/* =========================================================
   NORMALIZATION
========================================================= */


function normalizeScore(
  value
) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    )
  ) {

    return null;

  }


  return Math.min(

    100,

    Math.max(
      0,
      number
    )

  );

}



/* =========================================================
   ID
========================================================= */


function generateResultId() {

  return (

    "mti_result_" +

    Date.now().toString(36) +

    "_" +

    Math.random()
      .toString(36)
      .slice(2, 8)

  );

}



export default createAnalysisResult;
