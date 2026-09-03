/*
  MTI — REEL MEMORY V3
  --------------------

  Private account memory for MTI.

  مسؤوليتها:
  - حفظ Experiments
  - حفظ التحليلات
  - حفظ Predictions
  - حفظ النتائج الحقيقية
  - حفظ Context
  - حفظ Learnings
  - حفظ Conversation Data
  - تجهيز البيانات للـ Learning Engine
  - عزل بيانات كل حساب عن الحسابات الأخرى

  Local-first.
  لا Gemini.
  لا Claude.
  لا External AI.

  Cloud / Google Sync لاحقاً يمكن إضافته
  بدون تغيير الـ API الأساسي.
*/


const STORAGE_PREFIX =
  "mti_reel_memory_v3";


const SCHEMA_VERSION =
  "3.0.0";


const MAX_EXPERIMENTS =
  500;


const MAX_LEARNINGS =
  500;


/* =====================================================
   ACTIVE ACCOUNT
===================================================== */


let activeAccountId =
  null;


/*
  Set the account currently using MTI.

  إذا لم يوجد Account ID،
  نستخدم local account ثابت لهذا الجهاز.
*/


export function setActiveAccount(
  accountId
) {

  activeAccountId =
    accountId ||
    "local";

  return activeAccountId;

}


export function getActiveAccountId() {

  if (!activeAccountId) {

    activeAccountId =
      "local";

  }

  return activeAccountId;

}


/* =====================================================
   STORAGE KEY
===================================================== */


function getStorageKey() {

  const accountId =
    sanitizeAccountId(
      getActiveAccountId()
    );

  return (
    STORAGE_PREFIX +
    "_" +
    accountId
  );

}


function sanitizeAccountId(
  value
) {

  return String(
    value || "local"
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    )
    .slice(
      0,
      120
    ) || "local";

}


/* =====================================================
   ACCOUNT
===================================================== */


export function getAccount() {

  const state =
    loadState();

  return state.account;

}


export function initializeAccount(
  accountData = {}
) {

  /*
    إذا وصلنا Account ID
    نستخدمه كـ storage isolation key.
  */

  if (
    accountData.id
  ) {

    setActiveAccount(
      accountData.id
    );

  }


  const state =
    loadState();


  state.account = {

    id:
      accountData.id ||
      state.account?.id ||
      getActiveAccountId(),

    provider:
      accountData.provider ||
      state.account?.provider ||
      "local",

    email:
      accountData.email ??
      state.account?.email ??
      null,

    name:
      accountData.name ??
      state.account?.name ??
      null,

    photoURL:
      accountData.photoURL ??
      state.account?.photoURL ??
      null,

    createdAt:
      state.account?.createdAt ||
      now(),

    updatedAt:
      now()

  };


  /*
    إذا الحساب الحقيقي مختلف
    عن activeAccountId، نزامن الاثنين.
  */

  setActiveAccount(
    state.account.id
  );


  saveState(
    state
  );


  return state.account;

}


/* =====================================================
   EXPERIMENTS
===================================================== */


export function saveExperiment(
  experiment
) {

  if (
    !experiment ||
    typeof experiment !== "object"
  ) {

    throw new Error(
      "MTI Reel Memory: invalid experiment."
    );

  }


  const state =
    loadState();


  const normalized =
    normalizeExperiment(
      experiment
    );


  const index =
    state.experiments.findIndex(
      item =>
        item.id ===
        normalized.id
    );


  if (
    index === -1
  ) {

    state.experiments.unshift(
      normalized
    );

  } else {

    state.experiments[index] =
      mergeExperiment(
        state.experiments[index],
        normalized
      );

  }


  state.experiments =
    state.experiments.slice(
      0,
      MAX_EXPERIMENTS
    );


  touch(
    state
  );


  saveState(
    state
  );


  return normalized;

}


export function getExperiment(
  id
) {

  if (!id)
    return null;


  const state =
    loadState();


  return (
    state.experiments.find(
      experiment =>
        experiment.id === id
    ) ||
    null
  );

}


export function getExperiments(
  filters = {}
) {

  const state =
    loadState();


  let results =
    [
      ...state.experiments
    ];


  if (
    filters.platform
  ) {

    results =
      results.filter(
        experiment =>
          experiment.platform ===
          filters.platform
      );

  }


  if (
    filters.status
  ) {

    results =
      results.filter(
        experiment =>
          experiment.status ===
          filters.status
      );

  }


  if (
    filters.contentType
  ) {

    results =
      results.filter(
        experiment =>
          experiment.content?.type ===
          filters.contentType
      );

  }


  return results;

}


export function deleteExperiment(
  id
) {

  const state =
    loadState();


  const before =
    state.experiments.length;


  state.experiments =
    state.experiments.filter(
      experiment =>
        experiment.id !== id
    );


  if (
    state.experiments.length ===
    before
  ) {

    return false;

  }


  touch(
    state
  );


  saveState(
    state
  );


  return true;

}


/* =====================================================
   ANALYSIS
===================================================== */


export function saveAnalysis(
  experimentId,
  analysis
) {

  return updateExperiment(
    experimentId,
    experiment => {

      experiment.analysis =
        clone(
          analysis
        );


      experiment.updatedAt =
        now();


      return experiment;

    }
  );

}


/* =====================================================
   PREDICTION
===================================================== */


export function savePrediction(
  experimentId,
  prediction
) {

  return updateExperiment(
    experimentId,
    experiment => {

      experiment.prediction = {

        ...clone(
          prediction
        ),

        savedAt:
          now()

      };


      return experiment;

    }
  );

}


/* =====================================================
   REAL PERFORMANCE
===================================================== */


export function savePerformance(
  experimentId,
  performance
) {

  return updateExperiment(
    experimentId,
    experiment => {

      experiment.actualPerformance = {

        ...clone(
          performance
        ),

        recordedAt:
          performance?.recordedAt ||
          now(),

        source:
          performance?.source ||
          "manual"

      };


      return experiment;

    }
  );

}


/* =====================================================
   PREDICTION VS REALITY
===================================================== */


export function saveComparison(
  experimentId,
  comparison
) {

  return updateExperiment(
    experimentId,
    experiment => {

      experiment.comparison =
        clone(
          comparison
        );


      return experiment;

    }
  );

}


/* =====================================================
   CONTEXT
===================================================== */


export function addContext(
  experimentId,
  variable
) {

  return updateExperiment(
    experimentId,
    experiment => {

      if (
        !experiment.context
      ) {

        experiment.context = {

          variables: [],
          notes: [],
          publishingContext: {},
          experimentNotes: []

        };

      }


      if (
        !Array.isArray(
          experiment.context.variables
        )
      ) {

        experiment.context.variables =
          [];

      }


      experiment.context.variables.push({

        id:
          createId(
            "context"
          ),

        name:
          variable?.name ??
          null,

        value:
          variable?.value ??
          null,

        type:
          variable?.type ??
          "unknown",

        source:
          variable?.source ??
          "user",

        createdAt:
          now()

      });


      return experiment;

    }
  );

}


/* =====================================================
   USER NOTES
===================================================== */


export function addNote(
  experimentId,
  note
) {

  if (
    typeof note !== "string" ||
    !note.trim()
  ) {

    throw new Error(
      "MTI Reel Memory: note is empty."
    );

  }


  return updateExperiment(
    experimentId,
    experiment => {

      if (
        !experiment.context
      ) {

        experiment.context = {

          variables: [],
          notes: [],
          publishingContext: {},
          experimentNotes: []

        };

      }


      if (
        !Array.isArray(
          experiment.context.notes
        )
      ) {

        experiment.context.notes =
          [];

      }


      experiment.context.notes.push({

        id:
          createId(
            "note"
          ),

        text:
          note.trim(),

        createdAt:
          now()

      });


      return experiment;

    }
  );

}


/* =====================================================
   CONVERSATION
===================================================== */


export function saveConversationMessage(
  experimentId,
  message
) {

  return updateExperiment(
    experimentId,
    experiment => {

      if (
        !experiment.conversation
      ) {

        experiment.conversation = {

          messages: [],
          extractedData: []

        };

      }


      if (
        !Array.isArray(
          experiment.conversation.messages
        )
      ) {

        experiment.conversation.messages =
          [];

      }


      experiment.conversation.messages.push({

        id:
          createId(
            "msg"
          ),

        role:
          message?.role ||
          "user",

        content:
          String(
            message?.content ||
            ""
          ),

        createdAt:
          now()

      });


      return experiment;

    }
  );

}


/* =====================================================
   CONVERSATION → DATA
===================================================== */


export function saveExtractedData(
  experimentId,
  data
) {

  return updateExperiment(
    experimentId,
    experiment => {

      if (
        !experiment.conversation
      ) {

        experiment.conversation = {

          messages: [],
          extractedData: []

        };

      }


      if (
        !Array.isArray(
          experiment.conversation.extractedData
        )
      ) {

        experiment.conversation.extractedData =
          [];

      }


      experiment.conversation.extractedData.push({

        id:
          createId(
            "extracted"
          ),

        type:
          data?.type ||
          "unknown",

        field:
          data?.field ??
          null,

        value:
          data?.value ??
          null,

        confidence:
          normalizeScore(
            data?.confidence
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


/* =====================================================
   LEARNING
===================================================== */


export function saveLearning(
  experimentId,
  learning
) {

  return updateExperiment(
    experimentId,
    experiment => {

      if (
        !experiment.learning
      ) {

        experiment.learning = {

          observations: [],
          hypotheses: [],
          patterns: []

        };

      }


      if (
        learning?.observation
      ) {

        experiment.learning
          .observations
          .push(
            normalizeObservation(
              learning.observation
            )
          );

      }


      if (
        learning?.hypothesis
      ) {

        experiment.learning
          .hypotheses
          .push(
            normalizeHypothesis(
              learning.hypothesis
            )
          );

      }


      if (
        learning?.pattern
      ) {

        experiment.learning
          .patterns
          .push(
            normalizePattern(
              learning.pattern
            )
          );

      }


      return experiment;

    }
  );

}


/* =====================================================
   ACCOUNT LEARNING DATASET
===================================================== */


export function getLearningDataset() {

  const state =
    loadState();


  return state.experiments
    .filter(
      experiment =>
        experiment.actualPerformance
    )
    .map(
      experiment => ({

        experimentId:
          experiment.id,

        platform:
          experiment.platform,

        content:
          clone(
            experiment.content
          ),

        analysis:
          clone(
            experiment.analysis
          ),

        prediction:
          clone(
            experiment.prediction
          ),

        actual:
          clone(
            experiment.actualPerformance
          ),

        comparison:
          clone(
            experiment.comparison
          ),

        context:
          clone(
            experiment.context
          ),

        /*
          Conversation remains PRIVATE.
          It is available only inside
          the account's own dataset.
        */

        conversation:
          clone(
            experiment.conversation
          ),

        createdAt:
          experiment.createdAt,

        updatedAt:
          experiment.updatedAt

      })
    );

}


/* =====================================================
   ACCOUNT MEMORY SUMMARY
===================================================== */


export function getMemorySummary() {

  const state =
    loadState();


  const experiments =
    state.experiments;


  const published =
    experiments.filter(
      experiment =>
        Boolean(
          experiment.actualPerformance
        )
    );


  const scores =
    published
      .map(
        experiment =>
          Number(
            experiment.analysis?.overall
          )
      )
      .filter(
        Number.isFinite
      );


  const views =
    published
      .map(
        experiment =>
          Number(
            experiment.actualPerformance?.views
          )
      )
      .filter(
        Number.isFinite
      );


  const best =
    [
      ...published
    ]
      .sort(
        (a, b) =>
          (
            Number(
              b.actualPerformance?.views
            ) || 0
          ) -
          (
            Number(
              a.actualPerformance?.views
            ) || 0
          )
      )[0] ||
      null;


  return {

    account:
      state.account,

    totalExperiments:
      experiments.length,

    publishedExperiments:
      published.length,

    analyzedExperiments:
      experiments.filter(
        experiment =>
          Boolean(
            experiment.analysis
          )
      ).length,

    experimentsWithPrediction:
      experiments.filter(
        experiment =>
          Boolean(
            experiment.prediction
          )
      ).length,

    experimentsWithLearning:
      experiments.filter(
        experiment =>
          Boolean(
            experiment.learning
          )
      ).length,

    averageAnalysisScore:
      average(
        scores
      ),

    averageViews:
      average(
        views
      ),

    bestExperiment:
      best,

    learningReady:
      published.length >= 3,

    patternReady:
      published.length >= 5,

    adaptiveReady:
      published.length >= 10,

    updatedAt:
      state.updatedAt

  };

}


/* =====================================================
   STRONGEST CONTENT SIGNALS
===================================================== */


export function getContentSignals() {

  const dataset =
    getLearningDataset();


  if (
    dataset.length < 3
  ) {

    return {

      enoughData:
        false,

      signals:
        []

    };

  }


  const signals =
    [];


  const hookScores =
    dataset
      .map(
        item =>
          Number(
            item.analysis?.scores?.hook
          )
      )
      .filter(
        Number.isFinite
      );


  const pacingScores =
    dataset
      .map(
        item =>
          Number(
            item.analysis?.scores?.pacing
          )
      )
      .filter(
        Number.isFinite
      );


  const visualScores =
    dataset
      .map(
        item =>
          Number(
            item.analysis?.scores?.visual
          )
      )
      .filter(
        Number.isFinite
      );


  const views =
    dataset
      .map(
        item =>
          Number(
            item.actual?.views
          )
      )
      .filter(
        Number.isFinite
      );


  const hookCorrelation =
    correlation(
      hookScores,
      views
    );


  if (
    hookCorrelation !== null
  ) {

    signals.push({

      type:
        "hook_vs_views",

      correlation:
        round(
          hookCorrelation,
          3
        ),

      confidence:
        confidenceFromSample(
          dataset.length
        ),

      interpretation:
        interpretCorrelation(
          hookCorrelation,
          "Hook"
        )

    });

  }


  const pacingCorrelation =
    correlation(
      pacingScores,
      views
    );


  if (
    pacingCorrelation !== null
  ) {

    signals.push({

      type:
        "pacing_vs_views",

      correlation:
        round(
          pacingCorrelation,
          3
        ),

      confidence:
        confidenceFromSample(
          dataset.length
        ),

      interpretation:
        interpretCorrelation(
          pacingCorrelation,
          "Pacing"
        )

    });

  }


  const visualCorrelation =
    correlation(
      visualScores,
      views
    );


  if (
    visualCorrelation !== null
  ) {

    signals.push({

      type:
        "visual_vs_views",

      correlation:
        round(
          visualCorrelation,
          3
        ),

      confidence:
        confidenceFromSample(
          dataset.length
        ),

      interpretation:
        interpretCorrelation(
          visualCorrelation,
          "Visual quality"
        )

    });

  }


  return {

    enoughData:
      dataset.length >= 3,

    sampleSize:
      dataset.length,

    signals

  };

}


/* =====================================================
   ALL LEARNINGS
===================================================== */


export function getLearnings() {

  const state =
    loadState();


  const observations =
    [];


  const hypotheses =
    [];


  const patterns =
    [];


  for (
    const experiment of
    state.experiments
  ) {

    const learning =
      experiment.learning;


    if (!learning)
      continue;


    if (
      Array.isArray(
        learning.observations
      )
    ) {

      observations.push(
        ...learning.observations
      );

    }


    if (
      Array.isArray(
        learning.hypotheses
      )
    ) {

      hypotheses.push(
        ...learning.hypotheses
      );

    }


    if (
      Array.isArray(
        learning.patterns
      )
    ) {

      patterns.push(
        ...learning.patterns
      );

    }

  }


  return {

    observations:
      observations.slice(
        -MAX_LEARNINGS
      ),

    hypotheses:
      hypotheses.slice(
        -MAX_LEARNINGS
      ),

    patterns:
      patterns.slice(
        -MAX_LEARNINGS
      )

  };

}


/* =====================================================
   EXPORT
===================================================== */


export function exportMemory() {

  const state =
    loadState();


  return JSON.stringify(
    state,
    null,
    2
  );

}


/* =====================================================
   IMPORT
===================================================== */


export function importMemory(
  json
) {

  try {

    const parsed =
      JSON.parse(
        json
      );


    if (
      !parsed ||
      typeof parsed !== "object"
    ) {

      return false;

    }


    const state =
      normalizeState(
        parsed
      );


    /*
      Import remains inside
      the currently active account.
    */

    state.account.id =
      getActiveAccountId();


    saveState(
      state
    );


    return true;

  } catch {

    return false;

  }

}


/* =====================================================
   CLEAR
===================================================== */


export function clearMemory() {

  try {

    localStorage.removeItem(
      getStorageKey()
    );


    return true;

  } catch {

    return false;

  }

}


/* =====================================================
   UPDATE EXPERIMENT
===================================================== */


function updateExperiment(
  id,
  updater
) {

  const state =
    loadState();


  const index =
    state.experiments.findIndex(
      experiment =>
        experiment.id === id
    );


  if (
    index === -1
  ) {

    throw new Error(
      `MTI Reel Memory: Experiment not found: ${id}`
    );

  }


  const current =
    state.experiments[index];


  const updated =
    updater(
      current
    );


  if (
    !updated
  ) {

    throw new Error(
      "MTI Reel Memory: updater must return experiment."
    );

  }


  updated.updatedAt =
    now();


  state.experiments[index] =
    updated;


  touch(
    state
  );


  saveState(
    state
  );


  return updated;

}


/* =====================================================
   NORMALIZATION
===================================================== */


function normalizeExperiment(
  experiment
) {

  const timestamp =
    experiment.createdAt ||
    now();


  return {

    schemaVersion:
      SCHEMA_VERSION,

    id:
      experiment.id ||
      createId(
        "experiment"
      ),

    status:
      experiment.status ||
      "DRAFT",

    createdAt:
      timestamp,

    updatedAt:
      experiment.updatedAt ||
      timestamp,


    /*
      IMPORTANT:
      Preserve experiment metadata.
    */

    name:
      experiment.name ??
      null,

    title:
      experiment.title ??
      null,

    niche:
      experiment.niche ??
      null,

    source:
      experiment.source ??
      "local",


    metadata:
      clone(
        experiment.metadata ||
        {}
      ),


    platform:
      experiment.platform ||
      "instagram",


    content:
      normalizeContent(
        experiment.content
      ),


    analysis:
      clone(
        experiment.analysis ||
        null
      ),


    prediction:
      clone(
        experiment.prediction ||
        null
      ),


    actualPerformance:
      clone(
        experiment.actualPerformance ||
        null
      ),


    comparison:
      clone(
        experiment.comparison ||
        null
      ),


    context:
      normalizeContext(
        experiment.context
      ),


    learning:
      normalizeLearning(
        experiment.learning
      ),


    conversation:
      normalizeConversation(
        experiment.conversation
      )

  };

}


function mergeExperiment(
  oldExperiment,
  newExperiment
) {

  return {

    ...oldExperiment,

    ...newExperiment,


    content:
      {
        ...oldExperiment.content,
        ...newExperiment.content
      },


    context:
      {
        ...oldExperiment.context,
        ...newExperiment.context
      },


    conversation:
      {
        ...oldExperiment.conversation,
        ...newExperiment.conversation
      },


    learning:
      {
        ...oldExperiment.learning,
        ...newExperiment.learning
      },


    metadata:
      {
        ...oldExperiment.metadata,
        ...newExperiment.metadata
      },


    updatedAt:
      now()

  };

}


function normalizeContent(
  content
) {

  const source =
    content || {};


  return {

    type:
      source.type ??
      null,

    topic:
      source.topic ??
      null,

    hook:
      source.hook ??
      null,

    script:
      source.script ??
      null,

    duration:
      numberOrNull(
        source.duration
      ),

    visualStructure:
      source.visualStructure ??
      null,

    audio:
      source.audio ??
      null,

    editing:
      source.editing ??
      null,

    psychology:
      source.psychology ??
      null

  };

}


function normalizeContext(
  context
) {

  const source =
    context || {};


  return {

    variables:
      Array.isArray(
        source.variables
      )
        ? source.variables
        : [],

    notes:
      Array.isArray(
        source.notes
      )
        ? source.notes
        : [],

    publishingContext:
      source.publishingContext ||
      {},

    experimentNotes:
      Array.isArray(
        source.experimentNotes
      )
        ? source.experimentNotes
        : []

  };

}


function normalizeLearning(
  learning
) {

  const source =
    learning || {};


  return {

    observations:
      Array.isArray(
        source.observations
      )
        ? source.observations
        : [],

    hypotheses:
      Array.isArray(
        source.hypotheses
      )
        ? source.hypotheses
        : [],

    patterns:
      Array.isArray(
        source.patterns
      )
        ? source.patterns
        : []

  };

}


function normalizeConversation(
  conversation
) {

  const source =
    conversation || {};


  return {

    messages:
      Array.isArray(
        source.messages
      )
        ? source.messages
        : [],

    extractedData:
      Array.isArray(
        source.extractedData
      )
        ? source.extractedData
        : []

  };

}


function normalizeObservation(
  observation
) {

  return {

    id:
      observation?.id ||
      createId(
        "observation"
      ),

    type:
      observation?.type ||
      "observation",

    statement:
      observation?.statement ??
      observation?.text ??
      null,

    evidence:
      observation?.evidence ??
      null,

    confidence:
      normalizeScore(
        observation?.confidence
      ),

    createdAt:
      observation?.createdAt ||
      now()

  };

}


function normalizeHypothesis(
  hypothesis
) {

  return {

    id:
      hypothesis?.id ||
      createId(
        "hypothesis"
      ),

    statement:
      hypothesis?.statement ??
      null,

    evidence:
      hypothesis?.evidence ??
      null,

    confidence:
      normalizeScore(
        hypothesis?.confidence
      ),

    status:
      hypothesis?.status ||
      "UNTESTED",

    createdAt:
      hypothesis?.createdAt ||
      now()

  };

}


function normalizePattern(
  pattern
) {

  return {

    id:
      pattern?.id ||
      createId(
        "pattern"
      ),

    key:
      pattern?.key ??
      null,

    statement:
      pattern?.statement ??
      null,

    samples:
      Number(
        pattern?.samples ||
        pattern?.evidenceCount ||
        1
      ),

    confidence:
      normalizeScore(
        pattern?.confidence
      ),

    direction:
      pattern?.direction ||
      "neutral",

    createdAt:
      pattern?.createdAt ||
      now()

  };

}


/* =====================================================
   STATE
===================================================== */


function loadState() {

  const empty =
    createEmptyState();


  try {

    const raw =
      localStorage.getItem(
        getStorageKey()
      );


    if (!raw)
      return empty;


    const parsed =
      JSON.parse(
        raw
      );


    return normalizeState(
      parsed
    );

  } catch {

    return empty;

  }

}


function normalizeState(
  state
) {

  const normalized =
    createEmptyState();


  if (
    state?.account
  ) {

    normalized.account = {

      ...normalized.account,

      ...state.account,

      id:
        getActiveAccountId()

    };

  }


  if (
    Array.isArray(
      state?.experiments
    )
  ) {

    normalized.experiments =
      state.experiments
        .map(
          normalizeExperiment
        )
        .slice(
          0,
          MAX_EXPERIMENTS
        );

  }


  normalized.updatedAt =
    state?.updatedAt ||
    null;


  return normalized;

}


function createEmptyState() {

  return {

    schemaVersion:
      SCHEMA_VERSION,


    account: {

      id:
        getActiveAccountId(),

      provider:
        "local",

      email:
        null,

      name:
        null,

      photoURL:
        null,

      createdAt:
        now(),

      updatedAt:
        now()

    },


    experiments:
      [],


    updatedAt:
      null

  };

}


/* =====================================================
   STORAGE
===================================================== */


function saveState(
  state
) {

  try {

    localStorage.setItem(

      getStorageKey(),

      JSON.stringify(
        state
      )

    );


    return true;

  } catch {

    /*
      إذا امتلأت مساحة التخزين،
      نحافظ على أحدث البيانات.
    */

    try {

      state.experiments =
        state.experiments.slice(
          0,
          100
        );


      localStorage.setItem(

        getStorageKey(),

        JSON.stringify(
          state
        )

      );


      return true;

    } catch {

      return false;

    }

  }

}


function touch(
  state
) {

  state.updatedAt =
    now();


  if (
    state.account
  ) {

    state.account.updatedAt =
      now();

  }

}


/* =====================================================
   STATISTICS
===================================================== */


function correlation(
  x,
  y
) {

  const pairs =
    [];


  const length =
    Math.min(
      x.length,
      y.length
    );


  for (
    let i = 0;
    i < length;
    i++
  ) {

    const a =
      Number(
        x[i]
      );


    const b =
      Number(
        y[i]
      );


    if (
      Number.isFinite(a) &&
      Number.isFinite(b)
    ) {

      pairs.push([
        a,
        b
      ]);

    }

  }


  if (
    pairs.length < 3
  ) {

    return null;

  }


  const meanX =
    average(
      pairs.map(
        pair =>
          pair[0]
      )
    );


  const meanY =
    average(
      pairs.map(
        pair =>
          pair[1]
      )
    );


  let numerator =
    0;


  let denominatorX =
    0;


  let denominatorY =
    0;


  for (
    const [
      a,
      b
    ] of pairs
  ) {

    const dx =
      a - meanX;


    const dy =
      b - meanY;


    numerator +=
      dx * dy;


    denominatorX +=
      dx * dx;


    denominatorY +=
      dy * dy;

  }


  const denominator =
    Math.sqrt(
      denominatorX *
      denominatorY
    );


  if (
    denominator === 0
  ) {

    return null;

  }


  return (
    numerator /
    denominator
  );

}


function confidenceFromSample(
  sampleSize
) {

  if (
    sampleSize < 3
  )
    return 0;


  if (
    sampleSize < 5
  )
    return 35;


  if (
    sampleSize < 10
  )
    return 55;


  if (
    sampleSize < 20
  )
    return 70;


  if (
    sampleSize < 50
  )
    return 82;


  return 90;

}


function interpretCorrelation(
  value,
  variable
) {

  const absolute =
    Math.abs(
      value
    );


  if (
    absolute < 0.2
  ) {

    return `${variable} لا يظهر ارتباطاً واضحاً بالمشاهدات حالياً.`;

  }


  if (
    value > 0
  ) {

    return `${variable} يرتبط إيجابياً بالمشاهدات ضمن بيانات الحساب الحالية، لكن الارتباط لا يثبت السببية.`;

  }


  return `${variable} يرتبط سلبياً بالمشاهدات ضمن بيانات الحساب الحالية، لكن الارتباط لا يثبت السببية.`;

}


/* =====================================================
   HELPERS
===================================================== */


function createId(
  prefix
) {

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
    "function"
  ) {

    return (
      prefix +
      "_" +
      crypto.randomUUID()
    );

  }


  return (

    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(
        2,
        10
      )

  );

}


function now() {

  return new Date()
    .toISOString();

}


function clone(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return value;

  }


  try {

    if (
      typeof structuredClone ===
      "function"
    ) {

      return structuredClone(
        value
      );

    }

  } catch {}


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


function numberOrNull(
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


function average(
  values
) {

  const valid =
    values
      .map(Number)
      .filter(
        Number.isFinite
      );


  if (
    !valid.length
  ) {

    return null;

  }


  return (
    valid.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    valid.length
  );

}


function round(
  value,
  decimals = 2
) {

  const factor =
    10 ** decimals;


  return (
    Math.round(
      value * factor
    ) /
    factor
  );

}


/* =====================================================
   DEBUG
===================================================== */


export function getMemoryInfo() {

  const state =
    loadState();


  return {

    name:
      "MTI Reel Memory",

    version:
      SCHEMA_VERSION,

    accountId:
      state.account?.id,

    provider:
      state.account?.provider,

    experiments:
      state.experiments.length,

    learningDataset:
      getLearningDataset().length,

    storageKey:
      getStorageKey(),

    localFirst:
      true,

    externalAI:
      false,

    externalAPI:
      false,

    accountIsolation:
      true

  };

}


/* =====================================================
   DEFAULT
===================================================== */


export default {

  setActiveAccount,

  getActiveAccountId,

  getAccount,

  initializeAccount,

  saveExperiment,

  getExperiment,

  getExperiments,

  deleteExperiment,

  saveAnalysis,

  savePrediction,

  savePerformance,

  saveComparison,

  addContext,

  addNote,

  saveConversationMessage,

  saveExtractedData,

  saveLearning,

  getLearningDataset,

  getMemorySummary,

  getContentSignals,

  getLearnings,

  exportMemory,

  importMemory,

  clearMemory,

  getMemoryInfo

};
