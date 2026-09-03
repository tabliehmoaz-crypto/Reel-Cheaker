/*
  MTI — EXPERIMENT ENGINE
  -----------------------
  مسؤول عن دورة حياة تجربة الريل.

  IMPORTANT:
  - لا يوجد localStorage مستقل هنا.
  - التخزين يتم عبر MTIMemoryService.
  - MTIMemoryService يستخدم reel-memory.js.
  - كل حساب Google له Memory مستقلة.
  - لا يتم خلط بيانات الحسابات.
  - نحافظ على الـ API القديم للـ Experiment Engine.
*/

import {
  memoryService
} from "../core/MTIMemoryService.js";


const ENGINE_VERSION =
  "3.0.0";


/* =====================================================
   STATUS
===================================================== */

export const EXPERIMENT_STATUS = {

  DRAFT:
    "DRAFT",

  ANALYZED:
    "ANALYZED",

  PUBLISHED:
    "PUBLISHED",

  LEARNING:
    "LEARNING"

};


/* =====================================================
   PERFORMANCE METRICS
===================================================== */

export const PERFORMANCE_METRICS = [

  "views",
  "likes",
  "comments",
  "shares",
  "saves",
  "reach",
  "watchTime",
  "averageWatchTime",
  "completionRate",
  "skipRate",
  "followersGained"

];


/* =====================================================
   HELPERS
===================================================== */

function generateId() {

  return (

    "exp_" +

    Date.now().toString(36) +

    "_" +

    Math.random()
      .toString(36)
      .slice(2, 9)

  );

}


function now() {

  return new Date()
    .toISOString();

}


function clone(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return value;

  }


  try {

    return structuredClone(
      value
    );

  } catch {

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

}


function clamp(
  value,
  min = 0,
  max = 100
) {

  return Math.min(
    max,
    Math.max(
      min,
      Number(value) || 0
    )
  );

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
    Number(value);


  if (
    Number.isNaN(number)
  ) {

    return null;

  }


  return clamp(
    number
  );

}


/* =====================================================
   ACCOUNT ISOLATION
===================================================== */

async function ensureAccount(
  accountId
) {

  if (
    accountId &&
    memoryService.getActiveAccountId() !==
      accountId
  ) {

    await memoryService.setAccount({

      id:
        accountId

    });

  } else {

    await memoryService.ensureInitialized();

  }

}


/* =====================================================
   STORAGE ADAPTER
=====================================================

   ExperimentEngine historically used:

   context      → Array
   notes        → Array
   conversation → Array
   extractedData → Array

   Reel Memory uses the canonical structure:

   context:
   {
     variables,
     notes,
     publishingContext,
     experimentNotes
   }

   conversation:
   {
     messages,
     extractedData
   }

   We convert between both so existing callers
   don't break.
===================================================== */

function toStoredExperiment(
  experiment
) {

  const source =
    clone(
      experiment
    );


  const contextArray =
    Array.isArray(
      source.context
    )
      ? source.context
      : [];


  const contextObject =
    !Array.isArray(
      source.context
    ) &&
    source.context &&
    typeof source.context ===
      "object"

      ? clone(
          source.context
        )

      : {


          variables:
            contextArray,


          notes:
            Array.isArray(
              source.notes
            )
              ? source.notes
              : [],


          publishingContext:
            {},


          experimentNotes:
            []

        };


  if (
    !contextObject.variables
  ) {

    contextObject.variables =
      [];

  }


  if (
    !contextObject.notes
  ) {

    contextObject.notes =
      [];

  }


  if (
    !contextObject.publishingContext
  ) {

    contextObject.publishingContext =
      {};

  }


  if (
    !contextObject.experimentNotes
  ) {

    contextObject.experimentNotes =
      [];

  }


  const conversationArray =
    Array.isArray(
      source.conversation
    )
      ? source.conversation
      : [];


  const conversationObject =
    !Array.isArray(
      source.conversation
    ) &&
    source.conversation &&
    typeof source.conversation ===
      "object"

      ? clone(
          source.conversation
        )

      : {


          messages:
            conversationArray,


          extractedData:
            Array.isArray(
              source.extractedData
            )
              ? source.extractedData
              : []

        };


  if (
    !conversationObject.messages
  ) {

    conversationObject.messages =
      [];

  }


  if (
    !conversationObject.extractedData
  ) {

    conversationObject.extractedData =
      [];

  }


  return {

    ...source,


    /*
      Compatibility metadata.

      Keeps accountId and input available
      even though the canonical memory schema
      stores the account separately.
    */

    metadata: {

      ...(source.metadata || {}),


      ...(source.accountId
        ? {
            accountId:
              source.accountId
          }
        : {}),


      ...(source.input !== undefined
        ? {
            input:
              clone(
                source.input
              )
          }
        : {})

    },


    context:
      contextObject,


    conversation:
      conversationObject

  };

}


function fromStoredExperiment(
  stored
) {

  if (!stored) {

    return null;

  }


  const source =
    clone(
      stored
    );


  const context =
    source.context;


  const conversation =
    source.conversation;


  return {

    ...source,


    accountId:
      source.accountId ||
      source.metadata?.accountId ||
      null,


    input:
      source.input !== undefined
        ? source.input
        : (
            source.metadata?.input ||
            {}
          ),


    context:
      Array.isArray(
        context
      )
        ? context
        : (
            context?.variables ||
            []
          ),


    notes:
      Array.isArray(
        source.notes
      )
        ? source.notes
        : (
            context?.notes ||
            []
          ),


    conversation:
      Array.isArray(
        conversation
      )
        ? conversation
        : (
            conversation?.messages ||
            []
          ),


    extractedData:
      Array.isArray(
        source.extractedData
      )
        ? source.extractedData
        : (
            conversation?.extractedData ||
            []
          )

  };

}


/* =====================================================
   PERFORMANCE SCORE
===================================================== */

function calculatePerformanceScore(
  performance
) {

  if (!performance) {

    return 0;

  }


  const signals = [];


  if (
    performance.completionRate !==
    undefined
  ) {

    signals.push(
      Number(
        performance.completionRate
      )
    );

  }


  if (
    performance.averageWatchTime !==
      undefined &&
    performance.duration
  ) {

    signals.push(

      (
        Number(
          performance.averageWatchTime
        ) /
        Number(
          performance.duration
        )
      ) * 100

    );

  }


  if (
    performance.skipRate !==
    undefined
  ) {

    signals.push(

      100 -
      Number(
        performance.skipRate
      )

    );

  }


  if (
    performance.shareRate !==
    undefined
  ) {

    signals.push(

      Number(
        performance.shareRate
      ) * 10

    );

  }


  if (
    performance.saveRate !==
    undefined
  ) {

    signals.push(

      Number(
        performance.saveRate
      ) * 10

    );

  }


  if (!signals.length) {

    return 0;

  }


  const average =
    signals.reduce(

      (sum, value) =>
        sum +
        (
          Number(value) || 0
        ),

      0

    ) /
    signals.length;


  return Math.round(
    clamp(
      average
    )
  );

}


/* =====================================================
   CREATE
===================================================== */

export function createExperiment(
  data = {}
) {

  const timestamp =
    now();


  return {

    id:
      data.id ||
      generateId(),


    accountId:
      data.accountId ||
      null,


    type:
      data.type ||
      "reel-analysis",


    status:
      data.status ||
      EXPERIMENT_STATUS.DRAFT,


    createdAt:
      data.createdAt ||
      timestamp,


    updatedAt:
      timestamp,


    input:
      clone(
        data.input || {}
      ),


    metadata:
      clone(
        data.metadata || {}
      ),


    analysis:
      clone(
        data.analysis || null
      ),


    prediction:
      clone(
        data.prediction || null
      ),


    actualPerformance:
      clone(
        data.actualPerformance || null
      ),


    comparison:
      clone(
        data.comparison || null
      ),


    context:
      clone(
        data.context || []
      ),


    notes:
      clone(
        data.notes || []
      ),


    learning:
      clone(
        data.learning || {

          observations: [],

          hypotheses: [],

          patterns: []

        }
      ),


    conversation:
      clone(
        data.conversation || []
      ),


    extractedData:
      clone(
        data.extractedData || []
      )

  };

}


/* =====================================================
   VALIDATION
===================================================== */

export function validateExperiment(
  experiment
) {

  const errors = [];


  if (!experiment) {

    return {

      valid: false,

      errors: [
        "التجربة غير موجودة."
      ]

    };

  }


  if (!experiment.id) {

    errors.push(
      "معرف التجربة مفقود."
    );

  }


  if (!experiment.type) {

    errors.push(
      "نوع التجربة مفقود."
    );

  }


  const validStatuses =
    Object.values(
      EXPERIMENT_STATUS
    );


  if (
    !validStatuses.includes(
      experiment.status
    )
  ) {

    errors.push(
      "حالة التجربة غير صالحة."
    );

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


/* =====================================================
   GET ALL
===================================================== */

export function getAllExperiments() {

  const experiments =
    memoryService.getExperiments();


  return clone(

    experiments.map(
      fromStoredExperiment
    )

  );

}


/* =====================================================
   GET ONE
===================================================== */

export function getExperiment(
  id
) {

  if (!id) {

    return null;

  }


  const experiment =
    memoryService.getExperiment(
      id
    );


  return fromStoredExperiment(
    experiment
  );

}


/* =====================================================
   SAVE
===================================================== */

export async function saveExperiment(
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

      validation.errors.join(
        " "
      )

    );

  }


  await ensureAccount(
    experiment.accountId
  );


  const stored =
    toStoredExperiment({

      ...experiment,

      updatedAt:
        now()

    });


  const saved =
    await memoryService.saveExperiment(
      stored
    );


  return fromStoredExperiment(
    saved
  );

}


/* =====================================================
   DELETE
===================================================== */

export async function deleteExperiment(
  id
) {

  if (!id) {

    return false;

  }


  await memoryService.ensureInitialized();


  return memoryService.deleteExperiment(
    id
  );

}


/* =====================================================
   UPDATE
===================================================== */

export async function updateExperiment(
  id,
  updater
) {

  const current =
    getExperiment(
      id
    );


  if (!current) {

    throw new Error(
      "التجربة غير موجودة."
    );

  }


  let updated;


  if (
    typeof updater ===
    "function"
  ) {

    updated =
      updater(
        clone(current)
      );

  } else {

    updated = {

      ...current,

      ...clone(
        updater || {}
      )

    };

  }


  updated = {

    ...current,

    ...updated,

    id,

    updatedAt:
      now()

  };


  const validation =
    validateExperiment(
      updated
    );


  if (
    !validation.valid
  ) {

    throw new Error(

      validation.errors.join(
        " "
      )

    );

  }


  return saveExperiment(
    updated
  );

}


/* =====================================================
   STATUS
===================================================== */

export function setExperimentStatus(
  id,
  status
) {

  const validStatuses =
    Object.values(
      EXPERIMENT_STATUS
    );


  if (
    !validStatuses.includes(
      status
    )
  ) {

    throw new Error(
      "حالة التجربة غير صالحة."
    );

  }


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      status

    })

  );

}


/* =====================================================
   ATTACH ANALYSIS
===================================================== */

export function attachAnalysis(
  id,
  analysis
) {

  if (!analysis) {

    throw new Error(
      "نتيجة التحليل غير موجودة."
    );

  }


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      analysis:
        clone(
          analysis
        ),

      status:
        EXPERIMENT_STATUS.ANALYZED

    })

  );

}


/* =====================================================
   ATTACH PREDICTION
===================================================== */

export function attachPrediction(
  id,
  prediction
) {

  if (!prediction) {

    throw new Error(
      "التوقع غير موجود."
    );

  }


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      prediction:
        clone(
          prediction
        )

    })

  );

}


/* =====================================================
   ACTUAL PERFORMANCE
===================================================== */

export function attachActualPerformance(
  id,
  performance
) {

  if (!performance) {

    throw new Error(
      "بيانات الأداء غير موجودة."
    );

  }


  const normalized = {

    ...clone(
      performance
    ),


    score:
      calculatePerformanceScore(
        performance
      ),


    recordedAt:
      performance.recordedAt ||
      now()

  };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      actualPerformance:
        normalized,

      status:
        EXPERIMENT_STATUS.PUBLISHED

    })

  );

}


/* =====================================================
   PREDICTION VS REALITY
===================================================== */

export function comparePredictionToReality(
  id
) {

  const experiment =
    getExperiment(
      id
    );


  if (!experiment) {

    throw new Error(
      "التجربة غير موجودة."
    );

  }


  if (
    !experiment.prediction
  ) {

    throw new Error(
      "لا يوجد توقع للمقارنة."
    );

  }


  if (
    !experiment.actualPerformance
  ) {

    throw new Error(
      "لا يوجد أداء فعلي للمقارنة."
    );

  }


  const prediction =
    experiment.prediction;


  const actual =
    experiment.actualPerformance;


  const predictedOverall =
    normalizeScore(

      prediction.overall ??
      prediction.score ??
      prediction.predictedScore

    );


  const actualOverall =
    normalizeScore(

      actual.overall ??
      actual.score

    );


  let overallError =
    null;


  let accuracy =
    null;


  if (
    predictedOverall !== null &&
    actualOverall !== null
  ) {

    overallError =
      Math.round(

        Math.abs(
          predictedOverall -
          actualOverall
        )

      );


    accuracy =
      Math.round(

        clamp(

          100 -
          overallError

        )

      );

  }


  const metricComparisons =
    {};


  for (
    const metric of
    PERFORMANCE_METRICS
  ) {

    const predicted =
      prediction[metric];


    const observed =
      actual[metric];


    if (
      predicted ===
        undefined ||
      observed ===
        undefined
    ) {

      continue;

    }


    const p =
      Number(
        predicted
      );


    const a =
      Number(
        observed
      );


    if (
      Number.isNaN(p) ||
      Number.isNaN(a)
    ) {

      continue;

    }


    metricComparisons[
      metric
    ] = {

      predicted:
        p,

      actual:
        a,

      error:
        Math.round(

          Math.abs(
            p - a
          )

        ),

      direction:

        a > p
          ? "underestimated"
          : a < p
            ? "overestimated"
            : "accurate"

    };

  }


  const comparison = {

    comparedAt:
      now(),


    predictedOverall,

    actualOverall,


    overallError,


    accuracy,


    metrics:
      metricComparisons

  };


  updateExperiment(

    id,

    experiment => ({

      ...experiment,

      comparison,

      status:
        EXPERIMENT_STATUS.LEARNING

    })

  );


  return clone(
    comparison
  );

}


/* =====================================================
   CONTEXT
===================================================== */

export function addContextVariable(
  id,
  variable
) {

  if (!variable) {

    throw new Error(
      "متغير السياق غير موجود."
    );

  }


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      context: [

        ...(experiment.context || []),

        {

          ...clone(
            variable
          ),

          addedAt:
            variable.addedAt ||
            now()

        }

      ]

    })

  );

}


/* =====================================================
   USER NOTE
===================================================== */

export function addUserNote(
  id,
  note
) {

  if (!note) {

    throw new Error(
      "الملاحظة غير موجودة."
    );

  }


  const value =
    typeof note ===
    "string"

      ? {

          text:
            note,

          createdAt:
            now()

        }

      : {

          ...clone(
            note
          ),

          createdAt:
            note.createdAt ||
            now()

        };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      notes: [

        ...(experiment.notes || []),

        value

      ]

    })

  );

}


/* =====================================================
   LEARNING OBSERVATION
===================================================== */

export function addLearningObservation(
  id,
  observation
) {

  if (!observation) {

    throw new Error(
      "الملاحظة التعليمية غير موجودة."
    );

  }


  const value =
    typeof observation ===
    "string"

      ? {

          text:
            observation,

          createdAt:
            now()

        }

      : {

          ...clone(
            observation
          ),

          createdAt:
            observation.createdAt ||
            now()

        };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      learning: {

        ...(experiment.learning || {}),

        observations: [

          ...(experiment.learning
            ?.observations || []),

          value

        ]

      }

    })

  );

}


/* =====================================================
   LEARNING HYPOTHESIS
===================================================== */

export function addLearningHypothesis(
  id,
  hypothesis
) {

  if (!hypothesis) {

    throw new Error(
      "الفرضية التعليمية غير موجودة."
    );

  }


  const value =
    typeof hypothesis ===
    "string"

      ? {

          text:
            hypothesis,

          createdAt:
            now()

        }

      : {

          ...clone(
            hypothesis
          ),

          createdAt:
            hypothesis.createdAt ||
            now()

        };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      learning: {

        ...(experiment.learning || {}),

        hypotheses: [

          ...(experiment.learning
            ?.hypotheses || []),

          value

        ]

      }

    })

  );

}


/* =====================================================
   LEARNING PATTERN
===================================================== */

export function addLearningPattern(
  id,
  pattern
) {

  if (!pattern) {

    throw new Error(
      "النمط التعليمي غير موجود."
    );

  }


  const value =
    typeof pattern ===
    "string"

      ? {

          text:
            pattern,

          createdAt:
            now()

        }

      : {

          ...clone(
            pattern
          ),

          createdAt:
            pattern.createdAt ||
            now()

        };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      learning: {

        ...(experiment.learning || {}),

        patterns: [

          ...(experiment.learning
            ?.patterns || []),

          value

        ]

      }

    })

  );

}


/* =====================================================
   CONVERSATION
===================================================== */

export function addConversationMessage(
  id,
  message
) {

  if (!message) {

    throw new Error(
      "رسالة المحادثة غير موجودة."
    );

  }


  const value =
    typeof message ===
    "string"

      ? {

          role:
            "user",

          content:
            message,

          createdAt:
            now()

        }

      : {

          ...clone(
            message
          ),

          createdAt:
            message.createdAt ||
            now()

        };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      conversation: [

        ...(experiment.conversation || []),

        value

      ]

    })

  );

}


/* =====================================================
   EXTRACTED DATA
===================================================== */

export function addExtractedConversationData(
  id,
  data
) {

  if (!data) {

    throw new Error(
      "البيانات المستخرجة غير موجودة."
    );

  }


  const value = {

    ...clone(
      data
    ),

    extractedAt:
      data.extractedAt ||
      now()

  };


  return updateExperiment(

    id,

    experiment => ({

      ...experiment,

      extractedData: [

        ...(experiment.extractedData || []),

        value

      ]

    })

  );

}


/* =====================================================
   SUMMARY
===================================================== */

export function getExperimentSummary() {

  const experiments =
    getAllExperiments();


  const total =
    experiments.length;


  const analyzed =
    experiments.filter(

      experiment =>
        experiment.status ===
        EXPERIMENT_STATUS.ANALYZED

    ).length;


  const published =
    experiments.filter(

      experiment =>
        experiment.status ===
        EXPERIMENT_STATUS.PUBLISHED

    ).length;


  const learning =
    experiments.filter(

      experiment =>
        experiment.status ===
        EXPERIMENT_STATUS.LEARNING

    ).length;


  const withComparison =
    experiments.filter(

      experiment =>
        experiment.comparison

    );


  const accuracies =
    withComparison

      .map(

        experiment =>
          experiment.comparison
            ?.accuracy

      )

      .filter(

        value =>
          typeof value ===
          "number"

      );


  const averagePredictionAccuracy =
    accuracies.length

      ? Math.round(

          accuracies.reduce(

            (sum, value) =>
              sum + value,

            0

          ) /
          accuracies.length

        )

      : null;


  return {

    total,

    analyzed,

    published,

    learning,

    withComparison:
      withComparison.length,

    averagePredictionAccuracy

  };

}


/* =====================================================
   ENGINE INFO
===================================================== */

export function getEngineInfo() {

  return {

    name:
      "MTI Experiment Engine",


    version:
      ENGINE_VERSION,


    storage:
      "MTIMemoryService → reel-memory.js",


    storageModel:
      "account-scoped-localStorage",


    accountIsolation:
      true,


    localFirst:
      true,


    externalAI:
      false,


    externalAPI:
      false,


    status:
      "ready",


    capabilities: [

      "create-experiment",

      "validate-experiment",

      "save-experiment",

      "update-experiment",

      "delete-experiment",

      "experiment-lifecycle",

      "attach-analysis",

      "attach-prediction",

      "attach-performance",

      "prediction-vs-reality",

      "context-tracking",

      "notes",

      "learning-observations",

      "learning-hypotheses",

      "learning-patterns",

      "conversation-memory",

      "extracted-data",

      "account-isolated-memory"

    ]

  };

}
