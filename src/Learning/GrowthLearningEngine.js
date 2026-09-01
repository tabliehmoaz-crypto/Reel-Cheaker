/*
  REELIQ — GROWTH LEARNING ENGINE
  --------------------------------
  مسؤول عن تحويل نتائج التجارب إلى معرفة
  قابلة للاستخدام لاحقاً.

  IMPORTANT:
  - Reel واحد = Observation
  - تكرار الإشارة = Pattern
  - لا يتم اعتبار أي Pattern موثوقاً من تجربة واحدة.
  - كل Learning يحمل Confidence.
  - لا يدّعي معرفة سبب النجاح/الفشل بدون بيانات كافية.

  يعمل محلياً في المتصفح.
*/


const STORAGE_KEY =
  "reeliq_growth_learning_v1";


const MIN_PATTERN_SAMPLES = 3;

const STRONG_PATTERN_SAMPLES = 5;

const MAX_OBSERVATIONS = 500;

const MAX_PATTERNS = 200;


/* =====================================================
   PUBLIC API
===================================================== */


/**
 * إضافة تجربة مكتملة إلى Learning Engine.
 *
 * experiment يجب أن يحتوي على:
 * - reel
 * - prediction
 * - actual
 * - context
 *
 * لا نعتبر النتيجة Learning مباشرة.
 * أولاً نستخرج Observations.
 */
export function learnFromExperiment(
  experiment
) {

  validateExperiment(
    experiment
  );


  const state =
    loadState();


  const observations =
    extractObservations(
      experiment
    );


  for (
    const observation of observations
  ) {

    state.observations.push(
      observation
    );

  }


  /*
    تنظيف الذاكرة إذا أصبحت كبيرة.
  */

  if (
    state.observations.length >
    MAX_OBSERVATIONS
  ) {

    state.observations =
      state.observations.slice(
        -MAX_OBSERVATIONS
      );

  }


  /*
    إعادة بناء الـPatterns
    من البيانات الموجودة فعلياً.
  */

  state.patterns =
    buildPatterns(
      state.observations
    );


  /*
    تحديث hypotheses.
  */

  state.hypotheses =
    buildHypotheses(
      state.observations,
      state.patterns
    );


  state.updatedAt =
    new Date().toISOString();


  saveState(
    state
  );


  return {

    observations,

    patterns:
      state.patterns,

    hypotheses:
      state.hypotheses,

    accountLearning:
      buildAccountLearning(
        state
      )

  };

}


/**
 * إعطاء Learning الحالي للحساب.
 *
 * يستخدم لاحقاً عند تحليل Reel جديد.
 */
export function getAccountLearning() {

  const state =
    loadState();


  return {

    observations:
      state.observations,

    patterns:
      state.patterns,

    hypotheses:
      state.hypotheses,

    summary:
      buildAccountLearning(
        state
      ),

    updatedAt:
      state.updatedAt

  };

}


/**
 * تحليل Reel جديد باستخدام المعرفة
 * التي تعلمها الحساب سابقاً.
 *
 * هذه الوظيفة لا تغير الذاكرة.
 */
export function evaluateAgainstAccount(
  reel
) {

  if (!reel) {

    return {

      matches: [],

      warnings: [],

      opportunities: [],

      confidence: 0

    };

  }


  const state =
    loadState();


  const matches = [];

  const warnings = [];

  const opportunities = [];


  for (
    const pattern of state.patterns
  ) {

    const similarity =
      calculatePatternSimilarity(
        reel,
        pattern
      );


    if (
      similarity >= 0.65
    ) {

      matches.push({

        patternId:
          pattern.id,

        label:
          pattern.label,

        similarity:
          round(
            similarity * 100
          ),

        confidence:
          pattern.confidence,

        direction:
          pattern.direction,

        samples:
          pattern.samples

      });

    }

  }


  /*
    ترتيب الأقرب أولاً.
  */

  matches.sort(
    (a, b) =>
      b.similarity -
      a.similarity
  );


  /*
    تحذيرات مبنية على Patterns
    سلبية متكررة.
  */

  for (
    const match of matches
  ) {

    if (
      match.direction ===
      "negative" &&
      match.confidence >= 60
    ) {

      warnings.push({

        message:
          `هذا الريل يشبه نمطاً ارتبط سابقاً بأداء أضعف: ${match.label}`,

        confidence:
          match.confidence,

        samples:
          match.samples

      });

    }


    if (
      match.direction ===
      "positive" &&
      match.confidence >= 60
    ) {

      opportunities.push({

        message:
          `هذا الريل يشبه نمطاً ارتبط سابقاً بأداء أفضل: ${match.label}`,

        confidence:
          match.confidence,

        samples:
          match.samples

      });

    }

  }


  const confidence =
    calculateEvaluationConfidence(
      matches
    );


  return {

    matches:
      matches.slice(
        0,
        10
      ),

    warnings:
      warnings.slice(
        0,
        5
      ),

    opportunities:
      opportunities.slice(
        0,
        5
      ),

    confidence

  };

}


/**
 * حذف Learning الحساب بالكامل.
 *
 * نحتاجها لاحقاً من Settings.
 */
export function resetLearning() {

  try {

    localStorage.removeItem(
      STORAGE_KEY
    );

  } catch (
    error
  ) {

    console.warn(
      "REELIQ: Unable to reset learning.",
      error
    );

  }

}


/**
 * حالة الـLearning Engine.
 */
export function getLearningStatus() {

  const state =
    loadState();


  return {

    observations:
      state.observations.length,

    patterns:
      state.patterns.length,

    hypotheses:
      state.hypotheses.length,

    updatedAt:
      state.updatedAt,

    ready:
      state.observations.length >= 1,

    patternReady:
      state.patterns.some(
        pattern =>
          pattern.samples >=
          MIN_PATTERN_SAMPLES
      )

  };

}


/* =====================================================
   EXPERIMENT VALIDATION
===================================================== */

function validateExperiment(
  experiment
) {

  if (!experiment) {

    throw new Error(
      "Learning Engine: experiment is required."
    );

  }


  if (
    !experiment.reel
  ) {

    throw new Error(
      "Learning Engine: reel data is required."
    );

  }


  /*
    actual قد لا تكون موجودة أثناء
    مرحلة التحليل قبل النشر.

    لذلك التعلم الحقيقي لا يحدث
    إلا عندما توجد Actual Results.
  */

  if (
    !experiment.actual
  ) {

    throw new Error(
      "Learning Engine: actual performance data is required."
    );

  }

}


/* =====================================================
   OBSERVATION EXTRACTION
===================================================== */

function extractObservations(
  experiment
) {

  const observations = [];


  const reel =
    experiment.reel || {};


  const prediction =
    experiment.prediction || {};


  const actual =
    experiment.actual || {};


  const context =
    experiment.context || {};


  const performance =
    calculatePerformance(
      actual
    );


  /*
    -----------------------------------------
    OBSERVATION 1
    Prediction accuracy
    -----------------------------------------
  */

  if (
    prediction.overall != null &&
    performance.score != null
  ) {

    const predicted =
      Number(
        prediction.overall
      );


    const actualScore =
      Number(
        performance.score
      );


    const difference =
      actualScore -
      predicted;


    observations.push({

      id:
        createId(
          "obs"
        ),

      type:
        "prediction_accuracy",

      createdAt:
        new Date().toISOString(),

      experimentId:
        experiment.id ||
        null,

      features:
        extractReelFeatures(
          reel
        ),

      outcome: {

        predicted,

        actual:
          actualScore,

        difference:
          round(
            difference
          )

      },

      context:
        sanitizeContext(
          context
        )

    });

  }


  /*
    -----------------------------------------
    OBSERVATION 2
    Hook
    -----------------------------------------
  */

  if (
    reel.hook
  ) {

    const hookOutcome =
      calculateMetricOutcome(
        actual,
        "hook"
      );


    if (
      hookOutcome !== null
    ) {

      observations.push({

        id:
          createId(
            "obs"
          ),

        type:
          "hook_performance",

        createdAt:
          new Date().toISOString(),

        experimentId:
          experiment.id ||
          null,

        features: {

          hookType:
            getHookType(
              reel.hook
            ),

          hookScore:
            Number(
              reel.hook.score ||
              0
            )

        },

        outcome:
          hookOutcome,

        context:
          sanitizeContext(
            context
          )

      });

    }

  }


  /*
    -----------------------------------------
    OBSERVATION 3
    Duration
    -----------------------------------------
  */

  if (
    reel.duration != null
  ) {

    observations.push({

      id:
        createId(
          "obs"
        ),

      type:
        "duration_performance",

      createdAt:
        new Date().toISOString(),

      experimentId:
        experiment.id ||
        null,

      features: {

        duration:
          Number(
            reel.duration
          ),

        durationBucket:
          getDurationBucket(
            reel.duration
          )

      },

      outcome:
        performance,

      context:
        sanitizeContext(
          context
        )

    });

  }


  /*
    -----------------------------------------
    OBSERVATION 4
    Content type
    -----------------------------------------
  */

  if (
    reel.contentType
  ) {

    observations.push({

      id:
        createId(
          "obs"
        ),

      type:
        "content_type_performance",

      createdAt:
        new Date().toISOString(),

      experimentId:
        experiment.id ||
        null,

      features: {

        contentType:
          String(
            reel.contentType
          )

      },

      outcome:
        performance,

      context:
        sanitizeContext(
          context
        )

    });

  }


  /*
    -----------------------------------------
    OBSERVATION 5
    Prediction vs Reality
    -----------------------------------------
  */

  if (
    prediction &&
    actual
  ) {

    const metrics =
      comparePredictionToReality(
        prediction,
        actual
      );


    observations.push({

      id:
        createId(
          "obs"
        ),

      type:
        "prediction_reality",

      createdAt:
        new Date().toISOString(),

      experimentId:
        experiment.id ||
        null,

      features:
        extractReelFeatures(
          reel
        ),

      outcome:
        metrics,

      context:
        sanitizeContext(
          context
        )

    });

  }


  return observations;

}


/* =====================================================
   FEATURE EXTRACTION
===================================================== */

function extractReelFeatures(
  reel
) {

  return {

    duration:
      reel.duration != null
        ? Number(
            reel.duration
          )
        : null,

    durationBucket:
      reel.duration != null
        ? getDurationBucket(
            reel.duration
          )
        : null,

    hookType:
      getHookType(
        reel.hook
      ),

    contentType:
      reel.contentType ||
      null,

    hasSpeech:
      Boolean(
        reel.hasSpeech
      ),

    hasText:
      Boolean(
        reel.hasText
      ),

    visualStyle:
      reel.visualStyle ||
      null,

    pacing:
      reel.pacing != null
        ? Number(
            reel.pacing
          )
        : null

  };

}


/* =====================================================
   PERFORMANCE
===================================================== */

function calculatePerformance(
  actual
) {

  const views =
    positiveNumber(
      actual.views
    );


  const reach =
    positiveNumber(
      actual.reach
    );


  const likes =
    positiveNumber(
      actual.likes
    );


  const shares =
    positiveNumber(
      actual.shares
    );


  const saves =
    positiveNumber(
      actual.saves
    );


  const comments =
    positiveNumber(
      actual.comments
    );


  const follows =
    positiveNumber(
      actual.follows
    );


  const watchTime =
    positiveNumber(
      actual.averageWatchTime
    );


  const retention =
    percentage(
      actual.retention
    );


  /*
    لا نحسب metric غير موجود.
  */

  const components = [];


  if (
    views !== null &&
    reach !== null &&
    reach > 0
  ) {

    components.push(
      clamp(
        views /
        reach *
        50,
        0,
        100
      )
    );

  }


  if (
    likes !== null &&
    views !== null &&
    views > 0
  ) {

    components.push(
      clamp(
        likes /
        views *
        500,
        0,
        100
      )
    );

  }


  if (
    shares !== null &&
    views !== null &&
    views > 0
  ) {

    components.push(
      clamp(
        shares /
        views *
        2000,
        0,
        100
      )
    );

  }


  if (
    saves !== null &&
    views !== null &&
    views > 0
  ) {

    components.push(
      clamp(
        saves /
        views *
        1500,
        0,
        100
      )
    );

  }


  if (
    comments !== null &&
    views !== null &&
    views > 0
  ) {

    components.push(
      clamp(
        comments /
        views *
        1000,
        0,
        100
      )
    );

  }


  if (
    follows !== null &&
    reach !== null &&
    reach > 0
  ) {

    components.push(
      clamp(
        follows /
        reach *
        2000,
        0,
        100
      )
    );

  }


  if (
    watchTime !== null
  ) {

    components.push(
      clamp(
        watchTime /
        30 *
        100,
        0,
        100
      )
    );

  }


  if (
    retention !== null
  ) {

    components.push(
      clamp(
        retention,
        0,
        100
      )
    );

  }


  if (
    !components.length
  ) {

    return {

      score:
        null,

      sampleSize:
        0

    };

  }


  const score =
    components.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    components.length;


  return {

    score:
      round(
        score
      ),

    sampleSize:
      components.length

  };

}


/* =====================================================
   PATTERN BUILDER
===================================================== */

function buildPatterns(
  observations
) {

  const groups =
    new Map();


  for (
    const observation of observations
  ) {

    const keys =
      generatePatternKeys(
        observation
      );


    for (
      const key of keys
    ) {

      if (
        !groups.has(
          key
        )
      ) {

        groups.set(
          key,
          []
        );

      }


      groups
        .get(key)
        .push(
          observation
        );

    }

  }


  const patterns = [];


  for (
    const [
      key,
      group
    ]
    of groups
  ) {

    if (
      group.length <
      MIN_PATTERN_SAMPLES
    ) {

      continue;

    }


    const outcome =
      aggregateOutcome(
        group
      );


    if (
      outcome === null
    ) {

      continue;

    }


    const direction =
      outcome >= 55
        ? "positive"
        : outcome <= 45
          ? "negative"
          : "neutral";


    const confidence =
      calculatePatternConfidence(
        group.length,
        group
      );


    patterns.push({

      id:
        createStableId(
          key
        ),

      label:
        humanizePatternKey(
          key
        ),

      key,

      samples:
        group.length,

      direction,

      outcome:
        round(
          outcome
        ),

      confidence,

      firstObserved:
        group
          .map(
            item =>
              item.createdAt
          )
          .sort()[0] ||
        null,

      lastObserved:
        group
          .map(
            item =>
              item.createdAt
          )
          .sort()
          .slice(-1)[0] ||
        null

    });

  }


  patterns.sort(
    (a, b) => {

      /*
        نفضل الثقة أولاً،
        ثم عدد العينات.
      */

      if (
        b.confidence !==
        a.confidence
      ) {

        return (
          b.confidence -
          a.confidence
        );

      }


      return (
        b.samples -
        a.samples
      );

    }
  );


  return patterns.slice(
    0,
    MAX_PATTERNS
  );

}


/* =====================================================
   PATTERN KEYS
===================================================== */

function generatePatternKeys(
  observation
) {

  const features =
    observation.features ||
    {};


  const keys = [];


  if (
    features.hookType
  ) {

    keys.push(
      `hook:${features.hookType}`
    );

  }


  if (
    features.contentType
  ) {

    keys.push(
      `content:${features.contentType}`
    );

  }


  if (
    features.durationBucket
  ) {

    keys.push(
      `duration:${features.durationBucket}`
    );

  }


  if (
    features.visualStyle
  ) {

    keys.push(
      `visual:${features.visualStyle}`
    );

  }


  /*
    Combination patterns
    تصبح أهم لاحقاً عندما
    يكون لدينا بيانات أكثر.
  */

  if (
    features.hookType &&
    features.contentType
  ) {

    keys.push(
      `hook:${features.hookType}|content:${features.contentType}`
    );

  }


  if (
    features.hookType &&
    features.durationBucket
  ) {

    keys.push(
      `hook:${features.hookType}|duration:${features.durationBucket}`
    );

  }


  return keys;

}


/* =====================================================
   OUTCOME AGGREGATION
===================================================== */

function aggregateOutcome(
  observations
) {

  const values = [];


  for (
    const observation of observations
  ) {

    const outcome =
      observation.outcome;


    if (
      outcome == null
    ) {

      continue;

    }


    if (
      typeof outcome ===
      "number"
    ) {

      values.push(
        outcome
      );

      continue;

    }


    if (
      outcome.score != null
    ) {

      values.push(
        Number(
          outcome.score
        )
      );

      continue;

    }


    if (
      outcome.actual != null
    ) {

      values.push(
        Number(
          outcome.actual
        )
      );

    }

  }


  if (
    !values.length
  ) {

    return null;

  }


  return (
    values.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    values.length
  );

}


/* =====================================================
   PATTERN CONFIDENCE
===================================================== */

function calculatePatternConfidence(
  sampleCount,
  observations
) {

  /*
    عدد العينات يعطي الأساس.

    3 تجارب = Pattern أولي.
    5+ = أقوى.
    لا نسمح للثقة أن تصبح 100%
    بسهولة.
  */

  let confidence =
    20;


  if (
    sampleCount >=
    MIN_PATTERN_SAMPLES
  ) {

    confidence += 25;

  }


  if (
    sampleCount >=
    STRONG_PATTERN_SAMPLES
  ) {

    confidence += 20;

  }


  if (
    sampleCount >= 10
  ) {

    confidence += 15;

  }


  const consistency =
    calculateConsistency(
      observations
    );


  confidence +=
    consistency * 20;


  return clamp(
    Math.round(
      confidence
    ),
    0,
    95
  );

}


/* =====================================================
   CONSISTENCY
===================================================== */

function calculateConsistency(
  observations
) {

  const values =
    observations
      .map(
        observation => {

          if (
            typeof observation.outcome ===
            "number"
          ) {

            return observation.outcome;

          }


          if (
            observation.outcome?.score !=
            null
          ) {

            return Number(
              observation.outcome.score
            );

          }


          if (
            observation.outcome?.actual !=
            null
          ) {

            return Number(
              observation.outcome.actual
            );

          }


          return null;

        }
      )
      .filter(
        value =>
          Number.isFinite(
            value
          )
      );


  if (
    values.length < 2
  ) {

    return 0;

  }


  const mean =
    values.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    values.length;


  const variance =
    values.reduce(
      (
        sum,
        value
      ) =>
        sum +
        Math.pow(
          value - mean,
          2
        ),
      0
    ) /
    values.length;


  const deviation =
    Math.sqrt(
      variance
    );


  /*
    كلما قل التشتت زادت consistency.
  */

  return clamp(
    1 -
    deviation / 50,
    0,
    1
  );

}


/* =====================================================
   HYPOTHESES
===================================================== */

function buildHypotheses(
  observations,
  patterns
) {

  const hypotheses = [];


  for (
    const pattern of patterns
  ) {

    if (
      pattern.samples <
      MIN_PATTERN_SAMPLES
    ) {

      continue;

    }


    if (
      pattern.confidence <
      50
    ) {

      continue;

    }


    if (
      pattern.direction ===
      "positive"
    ) {

      hypotheses.push({

        id:
          createStableId(
            `hypothesis:${pattern.key}`
          ),

        statement:
          `قد يكون ${pattern.label} مرتبطاً بأداء أفضل لهذا الحساب.`,

        evidence:

          `${pattern.samples} تجارب، والنتيجة المجمعة ${pattern.outcome}/100.`,

        confidence:
          pattern.confidence,

        status:
          pattern.samples >=
          STRONG_PATTERN_SAMPLES
            ? "pattern"
            : "observation"

      });

    }


    if (
      pattern.direction ===
      "negative"
    ) {

      hypotheses.push({

        id:
          createStableId(
            `hypothesis:${pattern.key}:negative`
          ),

        statement:
          `قد يكون ${pattern.label} مرتبطاً بأداء أضعف لهذا الحساب.`,

        evidence:

          `${pattern.samples} تجارب، والنتيجة المجمعة ${pattern.outcome}/100.`,

        confidence:
          pattern.confidence,

        status:
          pattern.samples >=
          STRONG_PATTERN_SAMPLES
            ? "pattern"
            : "observation"

      });

    }

  }


  /*
    منع التكرار.
  */

  const unique =
    new Map();


  for (
    const hypothesis of hypotheses
  ) {

    unique.set(
      hypothesis.id,
      hypothesis
    );

  }


  return Array
    .from(
      unique.values()
    )
    .sort(
      (a, b) =>
        b.confidence -
        a.confidence
    )
    .slice(
      0,
      50
    );

}


/* =====================================================
   ACCOUNT LEARNING SUMMARY
===================================================== */

function buildAccountLearning(
  state
) {

  const patterns =
    state.patterns || [];


  const positive =
    patterns
      .filter(
        pattern =>
          pattern.direction ===
          "positive"
      )
      .slice(
        0,
        5
      );


  const negative =
    patterns
      .filter(
        pattern =>
          pattern.direction ===
          "negative"
      )
      .slice(
        0,
        5
      );


  const reliable =
    patterns
      .filter(
        pattern =>
          pattern.confidence >=
          70
      )
      .length;


  return {

    experimentsObserved:
      countExperiments(
        state.observations
      ),

    observations:
      state.observations.length,

    patterns:
      patterns.length,

    reliablePatterns:
      reliable,

    strongestPatterns:
      positive,

    weakestPatterns:
      negative,

    hypotheses:
      state.hypotheses.length,

    learningStage:
      getLearningStage(
        state.observations.length,
        patterns.length
      )

  };

}


/* =====================================================
   REEL SIMILARITY
===================================================== */

function calculatePatternSimilarity(
  reel,
  pattern
) {

  const features =
    extractReelFeatures(
      reel
    );


  const key =
    pattern.key ||
    "";


  const parts =
    key.split(
      "|"
    );


  let matched = 0;

  let total = 0;


  for (
    const part of parts
  ) {

    total++;


    const [
      field,
      value
    ] =
      part.split(
        ":"
      );


    if (
      features[
        mapPatternField(
          field
        )
      ] != null &&
      String(
        features[
          mapPatternField(
            field
          )
        ]
      ) ===
      value
    ) {

      matched++;

    }

  }


  if (
    !total
  ) {

    return 0;

  }


  return matched /
    total;

}


/* =====================================================
   PREDICTION COMPARISON
===================================================== */

function comparePredictionToReality(
  prediction,
  actual
) {

  const result = {};


  const metricPairs = [

    [
      "overall",
      "overall"
    ],

    [
      "hook",
      "hook"
    ],

    [
      "pacing",
      "pacing"
    ],

    [
      "visual",
      "visual"
    ],

    [
      "shareability",
      "shareability"
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
      Number(
        prediction[
          predictedKey
        ]
      );


    const actualValue =
      Number(
        actual[
          actualKey
        ]
      );


    if (
      Number.isFinite(
        predicted
      ) &&
      Number.isFinite(
        actualValue
      )
    ) {

      result[
        predictedKey
      ] = {

        predicted,

        actual:
          actualValue,

        difference:
          round(
            actualValue -
            predicted
          )

      };

    }

  }


  return result;

}


/* =====================================================
   CONTEXT
===================================================== */

function sanitizeContext(
  context
) {

  if (
    !context ||
    typeof context !==
    "object"
  ) {

    return {};

  }


  /*
    Context variables لا تتحول
    إلى facts عن الحساب.
  */

  return {

    variables:
      Array.isArray(
        context.variables
      )
        ? context.variables
            .slice(
              0,
              30
            )
        : [],

    notes:
      typeof context.notes ===
      "string"
        ? context.notes.slice(
            0,
            1000
          )
        : ""

  };

}


/* =====================================================
   HELPERS
===================================================== */

function loadState() {

  const empty = {

    version:
      1,

    observations: [],

    patterns: [],

    hypotheses: [],

    updatedAt:
      null

  };


  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {

      return empty;

    }


    const parsed =
      JSON.parse(
        raw
      );


    return {

      ...empty,

      ...parsed,

      observations:
        Array.isArray(
          parsed.observations
        )
          ? parsed.observations
          : [],

      patterns:
        Array.isArray(
          parsed.patterns
        )
          ? parsed.patterns
          : [],

      hypotheses:
        Array.isArray(
          parsed.hypotheses
        )
          ? parsed.hypotheses
          : []

    };

  } catch (
    error
  ) {

    console.warn(
      "REELIQ: Learning storage could not be read.",
      error
    );


    return empty;

  }

}


function saveState(
  state
) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        state
      )
    );

  } catch (
    error
  ) {

    console.warn(
      "REELIQ: Learning storage could not be saved.",
      error
    );

  }

}


function createId(
  prefix
) {

  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(
        2,
        8
      )
  );

}


function createStableId(
  value
) {

  let hash = 0;


  for (
    let i = 0;
    i < value.length;
    i++
  ) {

    hash =
      (
        hash << 5
      ) -
      hash +
      value.charCodeAt(
        i
      );


    hash |= 0;

  }


  return (
    "pattern_" +
    Math.abs(
      hash
    ).toString(
      36
    )
  );

}


function getDurationBucket(
  duration
) {

  const value =
    Number(
      duration
    );


  if (
    !Number.isFinite(
      value
    )
  ) {

    return null;

  }


  if (
    value < 8
  ) {

    return "0-7s";

  }


  if (
    value < 15
  ) {

    return "8-14s";

  }


  if (
    value < 30
  ) {

    return "15-29s";

  }


  if (
    value < 60
  ) {

    return "30-59s";

  }


  return "60s+";

}


function getHookType(
  hook
) {

  if (
    typeof hook ===
    "string"
  ) {

    return hook;

  }


  if (
    hook?.type
  ) {

    return String(
      hook.type
    );

  }


  return null;

}


function mapPatternField(
  field
) {

  const map = {

    hook:
      "hookType",

    content:
      "contentType",

    duration:
      "durationBucket",

    visual:
      "visualStyle"

  };


  return (
    map[field] ||
    field
  );

}


function humanizePatternKey(
  key
) {

  return key
    .split(
      "|"
    )
    .map(
      part => {

        const [
          field,
          value
        ] =
          part.split(
            ":"
          );


        const labels = {

          hook:
            "نوع الـHook",

          content:
            "نوع المحتوى",

          duration:
            "مدة الريل",

          visual:
            "النمط البصري"

        };


        return (
          labels[field] ||
          field
        ) +
        ": " +
        value;

      }
    )
    .join(
      " + "
    );

}


function calculateMetricOutcome(
  actual,
  key
) {

  const value =
    actual?.[
      key
    ];


  if (
    value == null
  ) {

    return null;

  }


  if (
    typeof value ===
    "number"
  ) {

    return value;

  }


  return null;

}


function positiveNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  ) &&
    number >= 0
    ? number
    : null;

}


function percentage(
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


  return clamp(
    number,
    0,
    100
  );

}


function countExperiments(
  observations
) {

  return new Set(
    observations
      .map(
        observation =>
          observation.experimentId
      )
      .filter(
        Boolean
      )
  ).size;

}


function calculateEvaluationConfidence(
  matches
) {

  if (
    !matches.length
  ) {

    return 0;

  }


  const top =
    matches
      .slice(
        0,
        5
      );


  const weighted =
    top.reduce(
      (
        sum,
        match
      ) =>
        sum +
        (
          match.confidence *
          (
            match.similarity /
            100
          )
        ),
      0
    );


  const weight =
    top.reduce(
      (
        sum,
        match
      ) =>
        sum +
        (
          match.similarity /
          100
        ),
      0
    );


  if (
    !weight
  ) {

    return 0;

  }


  return clamp(
    Math.round(
      weighted /
      weight
    ),
    0,
    95
  );

}


function getLearningStage(
  observations,
  patterns
) {

  if (
    observations === 0
  ) {

    return "cold-start";

  }


  if (
    patterns === 0
  ) {

    return "observation";

  }


  if (
    observations < 10
  ) {

    return "early-learning";

  }


  if (
    observations < 25
  ) {

    return "pattern-learning";

  }


  return "adaptive";

}


function round(
  value,
  decimals = 0
) {

  const factor =
    10 ** decimals;


  return Math.round(
    value *
    factor
  ) /
  factor;

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
