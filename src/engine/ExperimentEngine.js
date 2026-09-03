/*
  MTI — EXPERIMENT ENGINE
  -----------------------
  مسؤول عن دورة حياة تجربة الريل:

  DRAFT
    ↓
  ANALYZED
    ↓
  PUBLISHED
    ↓
  LEARNING

  مسؤولياته:
  - إنشاء التجارب
  - حفظها
  - تحديث حالتها
  - ربط التحليل
  - ربط التوقع
  - حفظ الأداء الحقيقي
  - مقارنة التوقع بالواقع
  - تسجيل التعلم

  لا يقوم بتحليل الفيديو بنفسه.
  لا يتصل بـ Gemini أو Claude.
  لا يتعامل مع واجهة المستخدم.
*/

const STORAGE_KEY =
  "mti_experiments_v1";

const ENGINE_VERSION =
  "2.0.0";


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
   STORAGE
===================================================== */

function readExperiments() {

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


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }

}


function writeExperiments(
  experiments
) {

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(
      experiments
    )

  );

}


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


  const experiment = {

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


  return experiment;

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

  return clone(
    readExperiments()
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


  const experiments =
    readExperiments();


  const experiment =
    experiments.find(
      item =>
        item.id === id
    );


  return experiment
    ? clone(experiment)
    : null;

}


/* =====================================================
   SAVE
===================================================== */

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

      validation.errors.join(
        " "
      )

    );

  }


  const experiments =
    readExperiments();


  const index =
    experiments.findIndex(
      item =>
        item.id ===
        experiment.id
    );


  const saved =
    clone({

      ...experiment,

      updatedAt:
        now()

    });


  if (index === -1) {

    experiments.push(
      saved
    );

  } else {

    experiments[index] =
      saved;

  }


  writeExperiments(
    experiments
  );


  return clone(
    saved
  );

}


/* =====================================================
   DELETE
===================================================== */

export function deleteExperiment(
  id
) {

  const experiments =
    readExperiments();


  const next =
    experiments.filter(
      experiment =>
        experiment.id !== id
    );


  const deleted =
    next.length !==
    experiments.length;


  writeExperiments(
    next
  );


  return deleted;

}


/* =====================================================
   UPDATE
===================================================== */

export function updateExperiment(
  id,
  updater
) {

  const experiments =
    readExperiments();


  const index =
    experiments.findIndex(
      experiment =>
        experiment.id === id
    );


  if (index === -1) {

    throw new Error(
      "التجربة غير موجودة."
    );

  }


  const current =
    clone(
      experiments[index]
    );


  let updated;


  if (
    typeof updater ===
    "function"
  ) {

    updated =
      updater(
        current
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


  experiments[index] =
    clone(updated);


  writeExperiments(
    experiments
  );


  return clone(
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

          ...clone(note),

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
    readExperiments();


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
      "localStorage",

    storageKey:
      STORAGE_KEY,

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

      "extracted-data"

    ]

  };

}
