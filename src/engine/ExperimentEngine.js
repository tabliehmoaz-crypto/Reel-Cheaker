/*
  CONTENT GROWTH ENGINE
  --------------------------------------------------
  Experiment Engine v1

  مسؤول عن دورة حياة كل Reel كـ Experiment مستقل:

  DRAFT
    ↓
  ANALYZED
    ↓
  PUBLISHED
    ↓
  LEARNING

  هذا الملف لا يقوم بالتحليل نفسه.
  ولا يقوم بالتنبؤ نفسه.
  ولا يعتمد على UI.

  مهمته:
  - إنشاء Experiment
  - حفظه
  - تحديثه
  - استرجاعه
  - حفظ Prediction
  - حفظ Actual Performance
  - حفظ Comparison
  - حفظ Context
  - حفظ Learning

  مصمم ليكون قابلاً للتوسع لاحقاً إلى:
  PredictionEngine
  LearningEngine
  AccountMemory
  ConversationEngine
*/


// ==================================================
// VERSION
// ==================================================

const ENGINE_VERSION = "1.0.0";


// ==================================================
// STORAGE
// ==================================================

const STORAGE_KEY =
  "content_growth_experiments_v1";


// ==================================================
// EXPERIMENT STATUS
// ==================================================

export const EXPERIMENT_STATUS = Object.freeze({

  DRAFT: "DRAFT",

  ANALYZED: "ANALYZED",

  PUBLISHED: "PUBLISHED",

  LEARNING: "LEARNING"

});


// ==================================================
// PERFORMANCE METRICS
// ==================================================

export const PERFORMANCE_METRICS = Object.freeze([

  "views",

  "reach",

  "averageWatchTime",

  "averageWatchTimePercentage",

  "retention",

  "likes",

  "shares",

  "saves",

  "comments",

  "follows",

  "profileVisits"

]);


// ==================================================
// ID GENERATOR
// ==================================================

function generateId() {

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();

  }


  return (

    "reel_" +

    Date.now().toString(36) +

    "_" +

    Math.random()
      .toString(36)
      .slice(2, 10)

  );

}


// ==================================================
// SAFE DATE
// ==================================================

function now() {

  return new Date().toISOString();

}


// ==================================================
// EMPTY LEARNING OBJECT
// ==================================================

function createEmptyLearning() {

  return {

    observations: [],

    hypotheses: [],

    patterns: [],

    confidence: 0,

    generatedAt: null

  };

}


// ==================================================
// EMPTY CONTEXT
// ==================================================

function createEmptyContext() {

  return {

    variables: [],

    userNotes: [],

    publishingContext: {},

    experimentNotes: []

  };

}


// ==================================================
// CREATE EXPERIMENT
// ==================================================

export function createExperiment(
  initialData = {}
) {

  const timestamp =
    now();


  const experiment = {

    schemaVersion:
      ENGINE_VERSION,

    id:
      generateId(),

    status:
      EXPERIMENT_STATUS.DRAFT,

    createdAt:
      timestamp,

    updatedAt:
      timestamp,


    platform:
      initialData.platform ||
      "instagram",


    content: {

      type:
        initialData.content?.type ??
        null,

      topic:
        initialData.content?.topic ??
        null,

      hook:
        initialData.content?.hook ??
        null,

      script:
        initialData.content?.script ??
        null,

      duration:
        initialData.content?.duration ??
        null,

      visualStructure:
        initialData.content?.visualStructure ??
        null,

      audio:
        initialData.content?.audio ??
        null

    },


    analysis:
      null,


    prediction:
      null,


    actualPerformance:
      null,


    comparison:
      null,


    context:
      createEmptyContext(),


    learning:
      createEmptyLearning(),


    conversation: {

      messages: [],

      extractedData: []

    }

  };


  return experiment;

}


// ==================================================
// VALIDATE EXPERIMENT
// ==================================================

export function validateExperiment(
  experiment
) {

  const errors = [];


  if (
    !experiment ||
    typeof experiment !== "object"
  ) {

    return {

      valid: false,

      errors: [
        "Experiment must be an object."

      ]

    };

  }


  if (
    typeof experiment.id !== "string" ||
    !experiment.id
  ) {

    errors.push(
      "Experiment ID is missing."
    );

  }


  if (
    !Object.values(
      EXPERIMENT_STATUS
    ).includes(
      experiment.status
    )
  ) {

    errors.push(
      "Experiment status is invalid."
    );

  }


  if (
    typeof experiment.createdAt !== "string"
  ) {

    errors.push(
      "Experiment createdAt is missing."
    );

  }


  if (
    typeof experiment.updatedAt !== "string"
  ) {

    errors.push(
      "Experiment updatedAt is missing."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


// ==================================================
// STORAGE SUPPORT
// ==================================================

function storageAvailable() {

  try {

    if (
      typeof window === "undefined" ||
      !window.localStorage
    ) {

      return false;

    }


    const testKey =
      "__content_growth_test__";


    window.localStorage.setItem(
      testKey,
      "1"
    );


    window.localStorage.removeItem(
      testKey
    );


    return true;

  } catch {

    return false;

  }

}


// ==================================================
// READ ALL EXPERIMENTS
// ==================================================

export function getAllExperiments() {

  if (
    !storageAvailable()
  ) {

    return [];

  }


  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {

      return [];

    }


    const parsed =
      JSON.parse(raw);


    if (
      !Array.isArray(parsed)
    ) {

      return [];

    }


    return parsed;

  } catch (error) {

    console.warn(
      "[ExperimentEngine] Failed to read experiments.",
      error
    );


    return [];

  }

}


// ==================================================
// SAVE ALL EXPERIMENTS
// ==================================================

function saveAllExperiments(
  experiments
) {

  if (
    !storageAvailable()
  ) {

    return false;

  }


  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        experiments
      )
    );


    return true;

  } catch (error) {

    console.error(
      "[ExperimentEngine] Failed to save experiments.",
      error
    );


    return false;

  }

}


// ==================================================
// SAVE EXPERIMENT
// ==================================================

export function saveExperiment(
  experiment
) {

  const validation =
    validateExperiment(
      experiment
    );


  if (
    !validation.valid
  ) {

    throw new Error(
      "Invalid experiment: " +
      validation.errors.join(" ")
    );

  }


  experiment.updatedAt =
    now();


  const experiments =
    getAllExperiments();


  const existingIndex =
    experiments.findIndex(
      item =>
        item.id === experiment.id
    );


  if (
    existingIndex === -1
  ) {

    experiments.unshift(
      experiment
    );

  } else {

    experiments[
      existingIndex
    ] =
      experiment;

  }


  const saved =
    saveAllExperiments(
      experiments
    );


  if (!saved) {

    throw new Error(
      "Unable to save experiment locally."
    );

  }


  return experiment;

}


// ==================================================
// GET ONE EXPERIMENT
// ==================================================

export function getExperiment(
  id
) {

  if (!id)
    return null;


  return getAllExperiments()
    .find(
      experiment =>
        experiment.id === id
    ) || null;

}


// ==================================================
// DELETE EXPERIMENT
// ==================================================

export function deleteExperiment(
  id
) {

  if (!id)
    return false;


  const experiments =
    getAllExperiments();


  const filtered =
    experiments.filter(
      experiment =>
        experiment.id !== id
    );


  if (
    filtered.length ===
    experiments.length
  ) {

    return false;

  }


  return saveAllExperiments(
    filtered
  );

}


// ==================================================
// UPDATE EXPERIMENT
// ==================================================

export function updateExperiment(
  id,
  updater
) {

  const experiment =
    getExperiment(
      id
    );


  if (!experiment) {

    throw new Error(
      "Experiment not found: " +
      id
    );

  }


  if (
    typeof updater !== "function"
  ) {

    throw new Error(
      "Updater must be a function."
    );

  }


  const updated =
    updater(
      experiment
    );


  if (!updated) {

    throw new Error(
      "Updater must return the experiment."
    );

  }


  return saveExperiment(
    updated
  );

}


// ==================================================
// CHANGE STATUS
// ==================================================

export function setExperimentStatus(
  id,
  status
) {

  if (
    !Object.values(
      EXPERIMENT_STATUS
    ).includes(
      status
    )
  ) {

    throw new Error(
      "Invalid experiment status: " +
      status
    );

  }


  return updateExperiment(
    id,
    experiment => {

      const current =
        experiment.status;


      /*
        منع الانتقالات العشوائية.

        المراحل الطبيعية:

        DRAFT → ANALYZED
        ANALYZED → PUBLISHED
        PUBLISHED → LEARNING

        ويمكن الرجوع من ANALYZED إلى DRAFT
        لأن المستخدم قد يعدل الريل قبل النشر.
      */

      const allowed = {

        DRAFT: [
          "DRAFT",
          "ANALYZED"
        ],

        ANALYZED: [
          "DRAFT",
          "ANALYZED",
          "PUBLISHED"
        ],

        PUBLISHED: [
          "PUBLISHED",
          "LEARNING"
        ],

        LEARNING: [
          "LEARNING"
        ]

      };


      if (
        !allowed[current]?.includes(
          status
        )
      ) {

        throw new Error(

          `Invalid status transition: ${current} → ${status}`

        );

      }


      experiment.status =
        status;


      return experiment;

    }

  );

}


// ==================================================
// ATTACH ANALYSIS
// ==================================================

export function attachAnalysis(
  id,
  analysis
) {

  if (
    !analysis ||
    typeof analysis !== "object"
  ) {

    throw new Error(
      "Analysis must be an object."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      experiment.analysis =
        structuredCloneSafe(
          analysis
        );


      /*
        بمجرد وجود تحليل صالح
        ننتقل إلى ANALYZED.
      */

      experiment.status =
        EXPERIMENT_STATUS.ANALYZED;


      return experiment;

    }

  );

}


// ==================================================
// ATTACH PREDICTION
// ==================================================

export function attachPrediction(
  id,
  prediction
) {

  if (
    !prediction ||
    typeof prediction !== "object"
  ) {

    throw new Error(
      "Prediction must be an object."
    );

  }


  const normalized = {

    performanceScore:
      normalizeScore(
        prediction.performanceScore
      ),

    hookStrength:
      normalizeScore(
        prediction.hookStrength
      ),

    expectedRetention:
      normalizeNullableNumber(
        prediction.expectedRetention
      ),

    expectedWatchTime:
      normalizeNullableNumber(
        prediction.expectedWatchTime
      ),

    shareability:
      normalizeScore(
        prediction.shareability
      ),

    mainStrength:
      prediction.mainStrength ??
      null,

    mainRisk:
      prediction.mainRisk ??
      null,

    confidence:
      normalizeScore(
        prediction.confidence
      ),

    generatedAt:
      prediction.generatedAt ||
      now(),

    modelVersion:
      prediction.modelVersion ||
      "unknown"

  };


  return updateExperiment(
    id,
    experiment => {

      experiment.prediction =
        normalized;


      return experiment;

    }

  );

}


// ==================================================
// ATTACH ACTUAL PERFORMANCE
// ==================================================

export function attachActualPerformance(
  id,
  performance
) {

  if (
    !performance ||
    typeof performance !== "object"
  ) {

    throw new Error(
      "Performance must be an object."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      const actual = {};


      for (
        const metric of PERFORMANCE_METRICS
      ) {

        if (
          performance[metric] !== undefined &&
          performance[metric] !== null
        ) {

          actual[metric] =
            normalizeNullableNumber(
              performance[metric]
            );

        } else {

          actual[metric] =
            null;

        }

      }


      actual.recordedAt =
        performance.recordedAt ||
        now();


      actual.source =
        performance.source ||
        "manual";


      experiment.actualPerformance =
        actual;


      /*
        وجود Actual Performance
        يعني أن الريل نشر فعلياً.
      */

      if (
        experiment.status ===
        EXPERIMENT_STATUS.ANALYZED
      ) {

        experiment.status =
          EXPERIMENT_STATUS.PUBLISHED;

      }


      return experiment;

    }

  );

}


// ==================================================
// PREDICTION VS REALITY
// ==================================================

export function comparePredictionToReality(
  id
) {

  const experiment =
    getExperiment(
      id
    );


  if (!experiment) {

    throw new Error(
      "Experiment not found."
    );

  }


  if (
    !experiment.prediction
  ) {

    throw new Error(
      "Prediction does not exist."
    );

  }


  if (
    !experiment.actualPerformance
  ) {

    throw new Error(
      "Actual performance does not exist."
    );

  }


  const prediction =
    experiment.prediction;


  const actual =
    experiment.actualPerformance;


  const comparison = {

    generatedAt:
      now(),

    metrics: {},

    overall: {

      predictedScore:
        prediction.performanceScore,

      actualScore:
        calculateActualPerformanceScore(
          actual
        ),

      difference:
        null

    },

    predictionWasWrong:
      false

  };


  const metricPairs = [

    [
      "expectedRetention",
      "retention"
    ],

    [
      "expectedWatchTime",
      "averageWatchTime"
    ],

    [
      "shareability",
      "shares"
    ]

  ];


  for (
    const [
      predictedKey,
      actualKey
    ]
    of metricPairs
  ) {

    const predicted =
      prediction[
        predictedKey
      ];


    const actualValue =
      actual[
        actualKey
      ];


    comparison.metrics[
      predictedKey
    ] = {

      predicted,

      actual:
        actualValue,

      difference:
        calculateDifference(
          predicted,
          actualValue
        )

    };

  }


  const actualScore =
    comparison.overall.actualScore;


  comparison.overall.difference =
    calculateDifference(
      prediction.performanceScore,
      actualScore
    );


  /*
    لا نقول إن التوقع خاطئ
    إلا إذا كان لدينا Actual Score
    صالح وقابل للمقارنة.
  */

  if (
    Number.isFinite(
      comparison.overall.difference
    )
  ) {

    comparison.predictionWasWrong =
      Math.abs(
        comparison.overall.difference
      ) >= 15;

  }


  updateExperiment(
    id,
    experiment => {

      experiment.comparison =
        comparison;


      experiment.status =
        EXPERIMENT_STATUS.LEARNING;


      return experiment;

    }

  );


  return comparison;

}


// ==================================================
// CONTEXT VARIABLES
// ==================================================

export function addContextVariable(
  id,
  variable
) {

  if (
    !variable ||
    typeof variable !== "object"
  ) {

    throw new Error(
      "Context variable must be an object."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      experiment.context.variables.push({

        id:
          generateId(),

        name:
          variable.name ??
          null,

        value:
          variable.value ??
          null,

        type:
          variable.type ??
          "unknown",

        source:
          variable.source ??
          "user",

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// USER NOTE
// ==================================================

export function addUserNote(
  id,
  note
) {

  if (
    typeof note !== "string" ||
    !note.trim()
  ) {

    throw new Error(
      "Note must be a non-empty string."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      experiment.context.userNotes.push({

        id:
          generateId(),

        text:
          note.trim(),

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// LEARNING DATA
// ==================================================

export function addLearningObservation(
  id,
  observation
) {

  return updateExperiment(
    id,
    experiment => {

      experiment.learning.observations.push({

        id:
          generateId(),

        text:
          observation.text ??
          null,

        evidence:
          observation.evidence ??
          null,

        confidence:
          normalizeScore(
            observation.confidence
          ),

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// HYPOTHESIS
// ==================================================

export function addLearningHypothesis(
  id,
  hypothesis
) {

  return updateExperiment(
    id,
    experiment => {

      experiment.learning.hypotheses.push({

        id:
          generateId(),

        statement:
          hypothesis.statement ??
          null,

        supportingEvidence:
          hypothesis.supportingEvidence ??
          [],

        contradictingEvidence:
          hypothesis.contradictingEvidence ??
          [],

        confidence:
          normalizeScore(
            hypothesis.confidence
          ),

        status:
          hypothesis.status ??
          "UNTESTED",

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// PATTERN
// ==================================================

export function addLearningPattern(
  id,
  pattern
) {

  return updateExperiment(
    id,
    experiment => {

      experiment.learning.patterns.push({

        id:
          generateId(),

        statement:
          pattern.statement ??
          null,

        evidenceCount:
          Number.isFinite(
            Number(
              pattern.evidenceCount
            )
          )
            ? Number(
                pattern.evidenceCount
              )
            : 1,

        confidence:
          normalizeScore(
            pattern.confidence
          ),

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// CONVERSATION MESSAGE
// ==================================================

export function addConversationMessage(
  id,
  message
) {

  if (
    !message ||
    typeof message !== "object"
  ) {

    throw new Error(
      "Message must be an object."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      experiment.conversation.messages.push({

        id:
          generateId(),

        role:
          message.role ??
          "user",

        content:
          String(
            message.content ??
            ""
          ),

        createdAt:
          now()

      });


      return experiment;

    }

  );

}


// ==================================================
// CONVERSATION → STRUCTURED DATA
// ==================================================

export function addExtractedConversationData(
  id,
  data
) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "Extracted conversation data must be an object."
    );

  }


  return updateExperiment(
    id,
    experiment => {

      experiment.conversation
        .extractedData
        .push({

          id:
            generateId(),

          type:
            data.type ??
            "unknown",

          field:
            data.field ??
            null,

          value:
            data.value ??
            null,

          confidence:
            normalizeScore(
              data.confidence
            ),

          source:
            "conversation",

          createdAt:
            now()

        });


      return experiment;

    }

  );

}


// ==================================================
// GET ACCOUNT EXPERIMENT SUMMARY
// ==================================================

export function getExperimentSummary() {

  const experiments =
    getAllExperiments();


  const total =
    experiments.length;


  const analyzed =
    experiments.filter(
      item =>
        item.status ===
        EXPERIMENT_STATUS.ANALYZED
    ).length;


  const published =
    experiments.filter(
      item =>
        item.status ===
        EXPERIMENT_STATUS.PUBLISHED ||
        item.status ===
        EXPERIMENT_STATUS.LEARNING
    ).length;


  const learning =
    experiments.filter(
      item =>
        item.status ===
        EXPERIMENT_STATUS.LEARNING
    ).length;


  return {

    total,

    draft:
      total -
      analyzed -
      published,

    analyzed,

    published,

    learning

  };

}


// ==================================================
// ACTUAL PERFORMANCE SCORE
// ==================================================

function calculateActualPerformanceScore(
  actual
) {

  /*
    حالياً لا نملك baseline خاص بالحساب.

    لذلك لا نخترع Score حقيقي من Views فقط.

    نستخدم score فقط عندما تتوفر
    إشارات نسبية مفيدة مثل:

    retention
    shares
    saves
    follows

    وإذا لم تتوفر بيانات كافية
    نرجع null.

    لاحقاً LearningEngine سيستبدل
    هذا بمنهج حسابي مبني على Account Memory.
  */


  const values = [];


  if (
    Number.isFinite(
      actual.retention
    )
  ) {

    values.push(
      clamp(
        actual.retention,
        0,
        100
      )
    );

  }


  if (
    Number.isFinite(
      actual.averageWatchTimePercentage
    )
  ) {

    values.push(
      clamp(
        actual.averageWatchTimePercentage,
        0,
        100
      )
    );

  }


  if (
    !values.length
  ) {

    return null;

  }


  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );

}


// ==================================================
// NUMBER HELPERS
// ==================================================

function normalizeNullableNumber(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : null;

}


function normalizeScore(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


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


  return clamp(
    number,
    0,
    100
  );

}


function clamp(
  value,
  min,
  max
) {

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );

}


function calculateDifference(
  predicted,
  actual
) {

  if (
    !Number.isFinite(
      Number(predicted)
    ) ||
    !Number.isFinite(
      Number(actual)
    )
  ) {

    return null;

  }


  return Math.round(
    (
      Number(actual) -
      Number(predicted)
    ) * 100
  ) / 100;

}


// ==================================================
// SAFE STRUCTURED CLONE
// ==================================================

function structuredCloneSafe(
  value
) {

  try {

    if (
      typeof structuredClone ===
      "function"
    ) {

      return structuredClone(
        value
      );

    }

  } catch {

    // fallback below

  }


  try {

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  } catch {

    return value;

  }

}


// ==================================================
// DEBUG API
// ==================================================

export function getEngineInfo() {

  return {

    name:
      "Content Growth Engine",

    module:
      "ExperimentEngine",

    version:
      ENGINE_VERSION,

    storageKey:
      STORAGE_KEY,

    storageAvailable:
      storageAvailable(),

    experimentCount:
      getAllExperiments().length

  };

}
