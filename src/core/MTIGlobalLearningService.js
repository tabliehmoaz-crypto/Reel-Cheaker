/*
  MTI — Global Learning Service
  -----------------------------

  العقل الجماعي لـ MTI.

  المسؤوليات:
  - استقبال إشارات مجهّلة فقط
  - تجميع الأنماط
  - حساب المتوسطات
  - اكتشاف العلاقات المتكررة
  - بناء معرفة عامة من تجارب متعددة
  - منع تخزين هوية المستخدم

  مهم:
  هذا الملف لا يستقبل بيانات المستخدم الخام مباشرة.
  البيانات يجب أن تمر أولاً عبر MTIPrivacyService.

  Local-First:
  true

  External AI:
  false

  External API:
  false
*/


const GLOBAL_LEARNING_VERSION =
  "1.0.0";


const STORAGE_KEY =
  "mti_global_learning_v1";


const MAX_SIGNALS =
  5000;


const MAX_PATTERNS =
  1000;



/* =========================================================
   STORAGE
========================================================= */


function readStorage() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {

      return {
        version:
          GLOBAL_LEARNING_VERSION,

        signals: [],

        patterns: [],

        updatedAt:
          new Date().toISOString()
      };

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

    return {

      version:
        GLOBAL_LEARNING_VERSION,

      signals: [],

      patterns: [],

      updatedAt:
        new Date().toISOString()

    };

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

    const aggregates =
      this.buildAggregates();


    const patterns =
      this.getPatterns();


    return {

      version:
        this.version,

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

    const empty = {

      version:
        this.version,

      signals: [],

      patterns: [],

      updatedAt:
        now()

    };


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

      storage:
        "localStorage",

      localFirst:
        true,

      externalAPI:
        false,

      externalAI:
        false,

      anonymousOnly:
        true,

      accountIsolation:
        true,

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

        "privacy-safe-learning"

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
