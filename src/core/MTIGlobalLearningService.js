/*
  MTI — Global Learning Service
  -----------------------------

  Global / collective learning layer.

  IMPORTANT:
  - Disabled by default.
  - Never stores account-private memory.
  - Never stores raw reel content.
  - Never stores conversations or private notes.
  - Never stores Google account identity.
  - Account-private learning belongs to reel-memory.js.
  - This service is only for future anonymized global patterns.

  Local-First:
  true

  External AI:
  false

  External API:
  false
*/


import {
  getMTIConfig
} from "./MTIConfig.js";


const GLOBAL_LEARNING_VERSION =
  "2.0.0";


const STORAGE_KEY =
  "mti_global_learning_v2";


const MAX_SIGNALS =
  5000;


const MAX_PATTERNS =
  1000;



/* =========================================================
   CONFIG
========================================================= */


function isGlobalLearningEnabled() {

  return (
    getMTIConfig()
      ?.memory
      ?.globalLearning === true
  );

}



/* =========================================================
   STORAGE
========================================================= */


function createEmptyDatabase() {

  return {

    version:
      GLOBAL_LEARNING_VERSION,

    signals: [],

    patterns: [],

    updatedAt:
      new Date().toISOString()

  };

}



function readStorage() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {

      return createEmptyDatabase();

    }


    const parsed =
      JSON.parse(raw);


    return {

      version:
        GLOBAL_LEARNING_VERSION,

      signals:
        Array.isArray(
          parsed.signals
        )
          ? parsed.signals
          : [],

      patterns:
        Array.isArray(
          parsed.patterns
        )
          ? parsed.patterns
          : [],

      updatedAt:
        parsed.updatedAt ||
        new Date().toISOString()

    };

  } catch {

    return createEmptyDatabase();

  }

}



function writeStorage(
  data
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      data
    )
  );

}



/* =========================================================
   HELPERS
========================================================= */


function generateId(
  prefix = "gl"
) {

  return (

    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 8)

  );

}



function now() {

  return new Date()
    .toISOString();

}



function clone(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}



function isNumber(
  value
) {

  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
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



/* =========================================================
   GLOBAL LEARNING SERVICE
========================================================= */


export class MTIGlobalLearningService {


  constructor(
    options = {}
  ) {

    this.version =
      options.version ||
      GLOBAL_LEARNING_VERSION;


    this.maxSignals =
      options.maxSignals ||
      MAX_SIGNALS;


    this.maxPatterns =
      options.maxPatterns ||
      MAX_PATTERNS;


    this.lastError =
      null;

  }



  /* =======================================================
     STATUS
  ======================================================= */


  isEnabled() {

    return isGlobalLearningEnabled();

  }



  /* =======================================================
     READ DATABASE
  ======================================================= */


  getDatabase() {

    return readStorage();

  }



  /* =======================================================
     ADD SAFE SIGNAL
  ======================================================= */


  addSignal(
    signal
  ) {

    this.lastError =
      null;


    try {

      if (
        !this.isEnabled()
      ) {

        throw new Error(
          "Global Learning is disabled. Account-private learning remains active through MTI Memory."
        );

      }


      this.validateSignal(
        signal
      );


      const database =
        readStorage();


      const record = {

        id:
          generateId(
            "signal"
          ),

        createdAt:
          now(),

        anonymous:
          true,

        aggregate:
          signal.aggregate === true,

        sample:
          isNumber(
            signal.sample
          )
            ? signal.sample
            : 1,

        data:
          clone(
            signal.data ||
            signal.signal ||
            {}
          )

      };


      database.signals.push(
        record
      );


      if (
        database.signals.length >
        this.maxSignals
      ) {

        database.signals =
          database.signals.slice(
            -this.maxSignals
          );

      }


      database.updatedAt =
        now();


      writeStorage(
        database
      );


      return clone(
        record
      );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     VALIDATE SIGNAL
  ======================================================= */


  validateSignal(
    signal
  ) {

    if (!signal) {

      throw new Error(
        "إشارة التعلم غير موجودة."
      );

    }


    if (
      signal.anonymous !==
      true
    ) {

      throw new Error(
        "Global Learning يقبل البيانات المجهّلة فقط."
      );

    }


    if (
      signal.containsIdentity ===
      true
    ) {

      throw new Error(
        "تم رفض البيانات لأنها تحتوي هوية."
      );

    }


    if (
      signal.containsRawContent ===
      true
    ) {

      throw new Error(
        "تم رفض البيانات لأنها تحتوي محتوى خام."
      );

    }


    if (
      signal.containsPrivateNotes ===
      true
    ) {

      throw new Error(
        "تم رفض البيانات لأنها تحتوي ملاحظات خاصة."
      );

    }


    if (
      signal.containsConversation ===
      true
    ) {

      throw new Error(
        "تم رفض البيانات لأنها تحتوي محادثات."
      );

    }


    if (
      signal.accountId ||
      signal.userId ||
      signal.uid ||
      signal.email
    ) {

      throw new Error(
        "تم رفض البيانات لأنها تحتوي معرف حساب."
      );

    }


    return true;

  }



  /* =======================================================
     LEARN FROM PRIVACY-SAFE DATA
  ======================================================= */


  learn(
    safeData
  ) {

    return this.addSignal(
      safeData
    );

  }



  /* =======================================================
     GET SIGNALS
  ======================================================= */


  getSignals(
    filters = {}
  ) {

    const database =
      readStorage();


    let signals =
      database.signals;


    if (
      filters.limit
    ) {

      signals =
        signals.slice(
          -filters.limit
        );

    }


    return clone(
      signals
    );

  }



  /* =======================================================
     BUILD AGGREGATES
  ======================================================= */


  buildAggregates() {

    const signals =
      this.getSignals();


    const scores = {

      hook: [],

      pacing: [],

      visual: [],

      audio: [],

      text: [],

      psychology: [],

      overall: []

    };


    for (
      const signal
      of signals
    ) {

      const data =
        signal.data ||
        {};


      this.collectScore(
        scores.hook,
        data.hook
      );


      this.collectScore(
        scores.pacing,
        data.pacing
      );


      this.collectScore(
        scores.visual,
        data.visual
      );


      this.collectScore(
        scores.audio,
        data.audio
      );


      this.collectScore(
        scores.text,
        data.text
      );


      this.collectScore(
        scores.psychology,
        data.psychology
      );


      this.collectScore(
        scores.overall,
        data.overall
      );


      if (
        data.scores
      ) {

        this.collectScore(
          scores.hook,
          data.scores.hook
        );

        this.collectScore(
          scores.pacing,
          data.scores.pacing
        );

        this.collectScore(
          scores.visual,
          data.scores.visual
        );

        this.collectScore(
          scores.audio,
          data.scores.audio
        );

        this.collectScore(
          scores.text,
          data.scores.text
        );

        this.collectScore(
          scores.overall,
          data.scores.overall
        );

      }

    }


    return {

      sampleSize:
        signals.length,

      averages: {

        hook:
          this.average(
            scores.hook
          ),

        pacing:
          this.average(
            scores.pacing
          ),

        visual:
          this.average(
            scores.visual
          ),

        audio:
          this.average(
            scores.audio
          ),

        text:
          this.average(
            scores.text
          ),

        psychology:
          this.average(
            scores.psychology
          ),

        overall:
          this.average(
            scores.overall
          )

      },

      updatedAt:
        now()

    };

  }



  /* =======================================================
     SCORE COLLECTION
  ======================================================= */


  collectScore(
    target,
    value
  ) {

    if (
      isNumber(
        value
      )
    ) {

      target.push(
        clamp(
          value
        )
      );

      return;

    }


    if (
      value &&
      isNumber(
        value.score
      )
    ) {

      target.push(
        clamp(
          value.score
        )
      );

    }

  }



  /* =======================================================
     AVERAGE
  ======================================================= */


  average(
    values
  ) {

    if (
      !values.length
    ) {

      return null;

    }


    const total =
      values.reduce(
        (
          sum,
          value
        ) =>
          sum + value,
        0
      );


    return Number(
      (
        total /
        values.length
      ).toFixed(
        2
      )
    );

  }



  /* =======================================================
     BUILD PATTERNS
  ======================================================= */


  buildPatterns() {

    const aggregates =
      this.buildAggregates();


    const patterns = [];


    const averages =
      aggregates.averages;


    if (
      isNumber(
        averages.hook
      ) &&
      isNumber(
        averages.overall
      )
    ) {

      patterns.push({

        id:
          "hook-overall",

        type:
          "relationship",

        description:
          "العلاقة بين قوة الـ Hook والأداء العام.",

        evidence:
          aggregates.sampleSize,

        values: {

          hook:
            averages.hook,

          overall:
            averages.overall

        }

      });

    }


    if (
      isNumber(
        averages.pacing
      )
    ) {

      patterns.push({

        id:
          "pacing",

        type:
          "benchmark",

        description:
          "المتوسط الجماعي لقوة الإيقاع.",

        evidence:
          aggregates.sampleSize,

        average:
          averages.pacing

      });

    }


    if (
      isNumber(
        averages.visual
      )
    ) {

      patterns.push({

        id:
          "visual",

        type:
          "benchmark",

        description:
          "المتوسط الجماعي للقوة البصرية.",

        evidence:
          aggregates.sampleSize,

        average:
          averages.visual

      });

    }


    if (
      isNumber(
        averages.overall
      )
    ) {

      patterns.push({

        id:
          "overall",

        type:
          "benchmark",

        description:
          "المتوسط الجماعي للأداء التحليلي.",

        evidence:
          aggregates.sampleSize,

        average:
          averages.overall

      });

    }


    this.savePatterns(
      patterns
    );


    return clone(
      patterns
    );

  }



  /* =======================================================
     SAVE PATTERNS
  ======================================================= */


  savePatterns(
    patterns
  ) {

    if (
      !this.isEnabled()
    ) {

      return false;

    }


    const database =
      readStorage();


    const timestamp =
      now();


    const prepared =
      patterns.map(
        pattern => ({

          ...pattern,

          generatedAt:
            timestamp,

          anonymous:
            true

        })
      );


    database.patterns =
      prepared.slice(
        -this.maxPatterns
      );


    database.updatedAt =
      timestamp;


    writeStorage(
      database
    );


    return true;

  }



  /* =======================================================
     GET PATTERNS
  ======================================================= */


  getPatterns() {

    const database =
      readStorage();


    return clone(
      database.patterns
    );

  }



  /* =======================================================
     GLOBAL KNOWLEDGE SNAPSHOT
  ======================================================= */


  getKnowledgeSnapshot() {

    if (
      !this.isEnabled()
    ) {

      return {

        version:
          this.version,

        enabled:
          false,

        sampleSize:
          0,

        aggregates:
          null,

        patterns: [],

        anonymous:
          true,

        containsIdentity:
          false,

        containsRawContent:
          false,

        generatedAt:
          now()

      };

    }


    const aggregates =
      this.buildAggregates();


    const patterns =
      this.getPatterns();


    return {

      version:
        this.version,

      enabled:
        true,

      sampleSize:
        aggregates.sampleSize,

      aggregates,

      patterns,

      anonymous:
        true,

      containsIdentity:
        false,

      containsRawContent:
        false,

      generatedAt:
        now()

    };

  }



  /* =======================================================
     RESET
  ======================================================= */


  clear() {

    const empty =
      createEmptyDatabase();


    writeStorage(
      empty
    );


    return true;

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    const database =
      readStorage();


    return {

      name:
        "MTIGlobalLearningService",

      version:
        this.version,

      enabled:
        this.isEnabled(),

      storage:
        "localStorage",

      storageKey:
        STORAGE_KEY,

      localFirst:
        true,

      externalAPI:
        false,

      externalAI:
        false,

      anonymousOnly:
        true,

      accountIsolation:
        "global-layer-separated-from-private-memory",

      privateAccountMemory:
        "reel-memory.js",

      signals:
        database.signals.length,

      patterns:
        database.patterns.length,

      capabilities: [

        "anonymous-learning",

        "signal-aggregation",

        "benchmarks",

        "pattern-detection",

        "global-knowledge",

        "privacy-safe-learning",

        "private-memory-separation"

      ]

    };

  }



  /* =======================================================
     ERROR
  ======================================================= */


  getLastError() {

    return this.lastError;

  }



  resetError() {

    this.lastError =
      null;

  }

}



/* =========================================================
   FACTORY
========================================================= */


export function createGlobalLearningService(
  options = {}
) {

  return new MTIGlobalLearningService(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const globalLearningService =
  new MTIGlobalLearningService();



export default globalLearningService;
