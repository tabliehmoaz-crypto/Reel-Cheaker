/**
 * MTI — Experiment Engine
 * Version: 3.0.0
 *
 * Responsibilities:
 * - Create and manage experiments
 * - Preserve the legacy Experiment Engine API
 * - Persist through MTIMemoryService → reel-memory.js
 * - Keep every Google account isolated
 * - Support analysis, prediction, performance and learning
 * - Never use independent localStorage
 */

import {
  memoryService
} from "../core/MTIMemoryService.js";


// ============================================================
// ENGINE CONFIG
// ============================================================

export const ENGINE_VERSION =
  "3.0.0";


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


// ============================================================
// HELPERS
// ============================================================

function generateId(
  prefix = "exp"
) {

  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );

}


function now() {

  return new Date()
    .toISOString();

}


function clone(value) {

  if (
    value ===
    undefined
  ) {

    return undefined;

  }


  if (
    value ===
    null
  ) {

    return null;

  }


  return JSON.parse(
    JSON.stringify(value)
  );

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
      value
    )
  );

}


function normalizeScore(
  value
) {

  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {

    return null;

  }


  const number =
    Number(value);


  if (
    Number.isNaN(
      number
    )
  ) {

    return null;

  }


  return Math.round(
    clamp(
      number
    )
  );

}


// ============================================================
// ACCOUNT
// ============================================================

export async function ensureAccount(
  accountId = null
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

    return;

  }


  await memoryService
    .ensureInitialized();

}


// ============================================================
// STORAGE ADAPTER
// ============================================================

function toStoredExperiment(
  experiment
) {

  const stored =
    clone(
      experiment
    );


  /*
   * Canonical memory uses object-based
   * context and conversation.
   *
   * Legacy Experiment Engine uses arrays.
   * Convert here without breaking
   * the public API.
   */

  stored.context = {

    variables:
      Array.isArray(
        experiment.context
      )
        ? experiment.context
        : [],

    notes:
      Array.isArray(
        experiment.notes
      )
        ? experiment.notes
        : [],

    publishingContext:
      experiment.metadata
        ?.publishingContext ||
      null,

    experimentNotes:
      experiment.metadata
        ?.experimentNotes ||
      []

  };


  stored.conversation = {

    messages:
      Array.isArray(
        experiment.conversation
      )
        ? experiment.conversation
        : (
            experiment.conversation
              ?.messages ||
            []
          ),

    extractedData:
      experiment.extractedData ||
      experiment.conversation
        ?.extractedData ||
      []

  };


  /*
   * Compatibility data.
   *
   * These values are kept inside metadata
   * because the canonical memory schema
   * owns the experiment structure.
   */

  stored.metadata = {

    ...(stored.metadata || {}),

    accountId:
      experiment.accountId ||
      null,

    input:
      experiment.input ||
      null,

    publishingContext:
      experiment.metadata
        ?.publishingContext ||
      null,

    experimentNotes:
      experiment.metadata
        ?.experimentNotes ||
      []

  };


  return stored;

}


function fromStoredExperiment(
  stored
) {

  if (
    !stored
  ) {

    return null;

  }


  const experiment =
    clone(
      stored
    );


  const context =
    stored.context || {};


  const conversation =
    stored.conversation || {};


  /*
   * Restore legacy public API.
   */

  experiment.context =
    Array.isArray(
      context.variables
    )
      ? context.variables
      : [];


  experiment.notes =
    Array.isArray(
      context.notes
    )
      ? context.notes
      : [];


  experiment.conversation =
    Array.isArray(
      conversation.messages
    )
      ? conversation.messages
      : [];


  experiment.extractedData =
    conversation.extractedData ||
    [];


  experiment.accountId =
    stored.metadata
      ?.accountId ||
    stored.accountId ||
    null;


  experiment.input =
    stored.metadata
      ?.input ||
    stored.input ||
    null;


  return experiment;

}


// ============================================================
// PERFORMANCE SCORE
// ============================================================

export function calculatePerformanceScore(
  performance = {}
) {

  const weights = {

    views:
      0.20,

    likes:
      0.10,

    comments:
      0.10,

    shares:
      0.15,

    saves:
      0.15,

    completionRate:
      0.15,

    averageWatchTime:
      0.10,

    followersGained:
      0.05

  };


  let score = 0;
  let totalWeight = 0;


  for (
    const metric of
    Object.keys(weights)
  ) {

    const value =
      Number(
        performance[
          metric
        ]
      );


    if (
      Number.isNaN(
        value
      )
    ) {

      continue;

    }


    /*
     * Values are normalized conservatively.
     * The score is an internal comparative
     * signal, not a platform ranking.
     */

    let normalized =
      value;


    if (
      metric ===
        "completionRate" ||
      metric ===
        "followersGained"
    ) {

      normalized =
        clamp(
          value
        );

    }


    if (
      metric ===
        "views" ||
      metric ===
        "likes" ||
      metric ===
        "comments" ||
      metric ===
        "shares" ||
      metric ===
        "saves" ||
      metric ===
        "averageWatchTime"
    ) {

      normalized =
        clamp(
          value /
          100
        );

    }


    score +=
      normalized *
      weights[metric];


    totalWeight +=
      weights[metric];

  }


  if (
    totalWeight ===
    0
  ) {

    return null;

  }


  return Math.round(

    clamp(
      (
        score /
        totalWeight
      ) *
      100
    )

  );

}


// ============================================================
// CREATE
// ============================================================

export function createExperiment(
  data = {}
) {

  const timestamp =
    now();


  const id =
    data.id ||
    generateId(
      "exp"
    );


  return {

    id,

    accountId:
      data.accountId ||
      memoryService.getActiveAccountId() ||
      null,

    type:
      data.type ||
      "reel",

    name:
      data.name ||
      data.title ||
      "Untitled Experiment",

    title:
      data.title ||
      data.name ||
      "Untitled Experiment",

    niche:
      data.niche ||
      null,

    status:
      data.status ||
      EXPERIMENT_STATUS.DRAFT,

    createdAt:
      data.createdAt ||
      timestamp,

    updatedAt:
      timestamp,

    input:
      data.input ||
      null,

    metadata:
      data.metadata ||
      {},

    platform:
      data.platform ||
      null,

    analysis:
      data.analysis ||
      null,

    prediction:
      data.prediction ||
      null,

    actualPerformance:
      data.actualPerformance ||
      null,

    comparison:
      data.comparison ||
      null,

    context:
      Array.isArray(
        data.context
      )
        ? data.context
        : [],

    notes:
      Array.isArray(
        data.notes
      )
        ? data.notes
        : [],

    learning:
      data.learning ||
      null,

    conversation:
      Array.isArray(
        data.conversation
      )
        ? data.conversation
        : [],

    extractedData:
      data.extractedData ||
      []

  };

}


// ============================================================
// VALIDATION
// ============================================================

export function validateExperiment(
  experiment
) {

  if (
    !experiment ||
    typeof experiment !==
      "object"
  ) {

    throw new Error(
      "التجربة غير صالحة."
    );

  }


  if (
    !experiment.id
  ) {

    throw new Error(
      "التجربة لا تحتوي على ID."
    );

  }


  if (
    !experiment.status
  ) {

    throw new Error(
      "التجربة لا تحتوي على Status."
    );

  }


  return true;

}


// ============================================================
// GET ALL
// ============================================================

export function getAllExperiments() {

  const experiments =
    memoryService
      .getExperiments();


  return experiments.map(
    fromStoredExperiment
  );

}


// ============================================================
// GET ONE
// ============================================================

export function getExperiment(
  id
) {

  if (
    !id
  ) {

    return null;

  }


  const experiment =
    memoryService
      .getExperiment(
        id
      );


  return fromStoredExperiment(
    experiment
  );

}


// ============================================================
// SAVE
// ============================================================

export async function saveExperiment(
  experiment
) {

  validateExperiment(
    experiment
  );


  await ensureAccount(
    experiment.accountId
  );


  const stored =
    toStoredExperiment(
      experiment
    );


  stored.updatedAt =
    now();


  const saved =
    await memoryService
      .saveExperiment(
        stored
      );


  return fromStoredExperiment(
    saved
  );

}


// ============================================================
// DELETE
// ============================================================

export async function deleteExperiment(
  id
) {

  if (
    !id
  ) {

    throw new Error(
      "Experiment ID مطلوب."
    );

  }


  const deleted =
    await memoryService
      .deleteExperiment(
        id
      );


  return deleted;

}


// ============================================================
// UPDATE
// ============================================================

export async function updateExperiment(
  id,
  updater
) {

  const current =
    getExperiment(
      id
    );


  if (
    !current
  ) {

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
      await updater(
        clone(
          current
        )
      );

  } else {

    updated = {

      ...current,

      ...updater

    };

  }


  updated.id =
    current.id;


  updated.accountId =
    current.accountId ||
    memoryService.getActiveAccountId() ||
    null;


  updated.updatedAt =
    now();


  validateExperiment(
    updated
  );


  return saveExperiment(
    updated
  );

}


// ============================================================
// STATUS
// ============================================================

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
      `حالة التجربة غير صالحة: ${status}`
    );

  }


  return updateExperiment(
    id,
    {
      status
    }
  );

}


// ============================================================
// ANALYSIS
// ============================================================

export function attachAnalysis(
  id,
  analysis
) {

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


// ============================================================
// PREDICTION
// ============================================================

export function attachPrediction(
  id,
  prediction
) {

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


// ============================================================
// ACTUAL PERFORMANCE
// ============================================================

export function attachActualPerformance(
  id,
  performance
) {

  const actual =
    clone(
      performance
    );


  const score =
    calculatePerformanceScore(
      actual
    );


  if (
    score !==
    null
  ) {

    actual.performanceScore =
      score;

  }


  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      actualPerformance:
        actual,

      status:
        EXPERIMENT_STATUS.PUBLISHED

    })
  );

}


// ============================================================
// PREDICTION VS REALITY
// ============================================================

export async function comparePredictionToReality(
  id
) {

  const experiment =
    getExperiment(
      id
    );


  if (
    !experiment
  ) {

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
    predictedOverall !==
      null &&
    actualOverall !==
      null
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
      prediction[
        metric
      ];


    const observed =
      actual[
        metric
      ];


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
      Number.isNaN(
        p
      ) ||
      Number.isNaN(
        a
      )
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
            p -
            a
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


  await updateExperiment(

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


// ============================================================
// CONTEXT
// ============================================================

export function addContext(
  id,
  contextItem
) {

  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      context: [

        ...(Array.isArray(
          experiment.context
        )
          ? experiment.context
          : []),

        clone(
          contextItem
        )

      ]

    })
  );

}


// ============================================================
// NOTES
// ============================================================

export function addNote(
  id,
  note
) {

  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      notes: [

        ...(Array.isArray(
          experiment.notes
        )
          ? experiment.notes
          : []),

        {

          id:
            generateId(
              "note"
            ),

          text:
            String(
              note
            ),

          createdAt:
            now()

        }

      ]

    })
  );

}


// ============================================================
// LEARNING
// ============================================================

export function attachLearning(
  id,
  learning
) {

  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      learning:
        clone(
          learning
        ),

      status:
        EXPERIMENT_STATUS.LEARNING

    })
  );

}


export function saveLearning(
  id,
  learning
) {

  return attachLearning(
    id,
    learning
  );

}


// ============================================================
// CONVERSATION
// ============================================================

export function addConversationMessage(
  id,
  message
) {

  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      conversation: [

        ...(Array.isArray(
          experiment.conversation
        )
          ? experiment.conversation
          : []),

        {

          ...clone(
            message
          ),

          createdAt:
            message?.createdAt ||
            now()

        }

      ]

    })
  );

}


export function saveConversationMessage(
  id,
  message
) {

  return addConversationMessage(
    id,
    message
  );

}


// ============================================================
// EXTRACTED DATA
// ============================================================

export function saveExtractedData(
  id,
  extractedData
) {

  return updateExperiment(
    id,
    experiment => ({

      ...experiment,

      extractedData:
        clone(
          extractedData
        )

    })
  );

}


// ============================================================
// SUMMARY
// ============================================================

export function getExperimentSummary() {

  const experiments =
    getAllExperiments();


  const summary = {

    total:
      experiments.length,

    draft:
      0,

    analyzed:
      0,

    published:
      0,

    learning:
      0,

    withPrediction:
      0,

    withPerformance:
      0,

    withComparison:
      0,

    withLearning:
      0

  };


  for (
    const experiment of
    experiments
  ) {

    if (
      experiment.status ===
      EXPERIMENT_STATUS.DRAFT
    ) {

      summary.draft++;

    }


    if (
      experiment.status ===
      EXPERIMENT_STATUS.ANALYZED
    ) {

      summary.analyzed++;

    }


    if (
      experiment.status ===
      EXPERIMENT_STATUS.PUBLISHED
    ) {

      summary.published++;

    }


    if (
      experiment.status ===
      EXPERIMENT_STATUS.LEARNING
    ) {

      summary.learning++;

    }


    if (
      experiment.prediction
    ) {

      summary.withPrediction++;

    }


    if (
      experiment.actualPerformance
    ) {

      summary.withPerformance++;

    }


    if (
      experiment.comparison
    ) {

      summary.withComparison++;

    }


    if (
      experiment.learning
    ) {

      summary.withLearning++;

    }

  }


  return summary;

}


// ============================================================
// ENGINE INFO
// ============================================================

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

    capabilities: [

      "experiments",

      "analysis",

      "prediction",

      "performance",

      "prediction-vs-reality",

      "learning",

      "conversation-memory",

      "context-memory",

      "account-isolation",

      "local-first"

    ]

  };

}


// ============================================================
// DEFAULT EXPORT
// ============================================================

const ExperimentEngine = {

  createExperiment,

  validateExperiment,

  getAllExperiments,

  getExperiment,

  saveExperiment,

  deleteExperiment,

  updateExperiment,

  setExperimentStatus,

  attachAnalysis,

  attachPrediction,

  attachActualPerformance,

  comparePredictionToReality,

  addContext,

  addNote,

  attachLearning,

  saveLearning,

  addConversationMessage,

  saveConversationMessage,

  saveExtractedData,

  calculatePerformanceScore,

  getExperimentSummary,

  getEngineInfo,

  ensureAccount

};


export default ExperimentEngine;
