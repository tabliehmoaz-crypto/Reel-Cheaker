/*
  MTI — Analysis Job
  Core orchestration layer

  Flow:
  Upload
    ↓
  Create Job
    ↓
  Process
    ↓
  Save Result
    ↓
  Recommendations
    ↓
  Memory

  Important:
  - لا يستخدم AccountMemory القديم.
  - كل التخزين يمر عبر ExperimentEngine → MTIMemoryService → reel-memory.
  - كل Job مرتبط بحساب Google الحالي.
  - Optional stages لا تدمر نتيجة التحليل الأساسية.
*/

import {
  saveExperiment,
  getExperiment,
  attachPrediction,
  attachActualPerformance,
  setExperimentStatus
} from "../engine/ExperimentEngine.js";


const JOB_STATUS = Object.freeze({

  CREATED:
    "created",

  PROCESSING:
    "processing",

  ANALYZING:
    "analyzing",

  SAVING:
    "saving",

  RECOMMENDING:
    "recommending",

  COMPLETED:
    "completed",

  PARTIAL:
    "partial",

  FAILED:
    "failed"

});


const JOB_STAGE = Object.freeze({

  CREATED:
    "created",

  PROCESSING:
    "processing",

  ANALYSIS:
    "analysis",

  SAVE:
    "save",

  RECOMMENDATIONS:
    "recommendations",

  MEMORY:
    "memory",

  COMPLETED:
    "completed"

});


function createId(
  prefix = "job"
) {

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

}


function now() {

  return new Date()
    .toISOString();

}


function safeClone(value) {

  if (
    value === undefined
  ) {

    return undefined;

  }


  try {

    return JSON.parse(
      JSON.stringify(value)
    );

  } catch {

    return value;

  }

}


function normalizeError(
  error
) {

  if (!error) {

    return {

      message:
        "Unknown error",

      name:
        "UnknownError"

    };

  }


  return {

    message:
      error.message ||
      String(error),

    name:
      error.name ||
      "Error",

    stack:
      error.stack ||
      null

  };

}


/* =====================================================
   JOB
===================================================== */

export class AnalysisJob {

  constructor(
    options = {}
  ) {

    this.id =
      options.id ||
      createId("job");


    this.accountId =
      options.accountId ||
      null;


    this.status =
      JOB_STATUS.CREATED;


    this.stage =
      JOB_STAGE.CREATED;


    this.createdAt =
      now();


    this.startedAt =
      null;


    this.completedAt =
      null;


    this.input =
      null;


    this.result =
      null;


    this.recommendations =
      null;


    this.performance =
      null;


    this.comparison =
      null;


    this.learning =
      null;


    this.errors =
      [];


    this.warnings =
      [];


    this.history =
      [];


    this.meta = {

      version:
        "3.0.0",

      engine:
        "MTI",

      source:
        "offline"

    };


    this._record(
      "created"
    );

  }


  /* ===================================================
     HISTORY
  =================================================== */

  _record(
    event,
    data = {}
  ) {

    this.history.push({

      event,

      stage:
        this.stage,

      status:
        this.status,

      timestamp:
        now(),

      ...safeClone(data)

    });

  }


  _setStage(
    stage,
    status = this.status
  ) {

    this.stage =
      stage;

    this.status =
      status;


    this._record(
      "stage_changed",
      {
        stage,
        status
      }
    );

  }


  _addError(
    stage,
    error
  ) {

    const normalized =
      normalizeError(
        error
      );


    const entry = {

      stage,

      timestamp:
        now(),

      ...normalized

    };


    this.errors.push(
      entry
    );


    this._record(
      "error",
      entry
    );


    return entry;

  }


  _addWarning(
    stage,
    message
  ) {

    const warning = {

      stage,

      message,

      timestamp:
        now()

    };


    this.warnings.push(
      warning
    );


    this._record(
      "warning",
      warning
    );


    return warning;

  }


  /* ===================================================
     CREATE
  =================================================== */

  async create(
    input = {},
    options = {}
  ) {

    this.input =
      safeClone(
        input
      );


    this.accountId =
      options.accountId ||
      this.accountId ||
      null;


    this._setStage(

      JOB_STAGE.CREATED,

      JOB_STATUS.CREATED

    );


    this._record(
      "input_received",
      {

        hasInput:
          Boolean(input),

        accountId:
          this.accountId

      }
    );


    return this;

  }


  /* ===================================================
     PROCESS
  =================================================== */

  async process(
    processor
  ) {

    if (
      typeof processor !==
      "function"
    ) {

      const error =
        new Error(
          "Analysis processor must be a function."
        );


      this._addError(
        JOB_STAGE.PROCESSING,
        error
      );


      this.status =
        JOB_STATUS.FAILED;


      throw error;

    }


    this._setStage(

      JOB_STAGE.PROCESSING,

      JOB_STATUS.PROCESSING

    );


    if (!this.startedAt) {

      this.startedAt =
        now();

    }


    try {

      const processedData =
        await processor(

          safeClone(
            this.input
          ),

          this

        );


      this._record(

        "processing_completed",

        {

          hasResult:
            Boolean(
              processedData
            )

        }

      );


      return processedData;

    } catch (error) {

      this._addError(

        JOB_STAGE.PROCESSING,

        error

      );


      this.status =
        JOB_STATUS.FAILED;


      this._record(
        "processing_failed"
      );


      throw error;

    }

  }


  /* ===================================================
     ANALYZE
  =================================================== */

  async analyze(
    analyzer,
    processedData = null
  ) {

    if (
      typeof analyzer !==
      "function"
    ) {

      const error =
        new Error(
          "Analysis function must be a function."
        );


      this._addError(
        JOB_STAGE.ANALYSIS,
        error
      );


      this.status =
        JOB_STATUS.FAILED;


      throw error;

    }


    this._setStage(

      JOB_STAGE.ANALYSIS,

      JOB_STATUS.ANALYZING

    );


    try {

      const analysis =
        await analyzer(

          safeClone(
            processedData
          ),

          safeClone(
            this.input
          ),

          this

        );


      this.result =
        safeClone(
          analysis
        );


      this._record(

        "analysis_completed",

        {

          hasResult:
            Boolean(
              analysis
            )

        }

      );


      return this.result;

    } catch (error) {

      this._addError(

        JOB_STAGE.ANALYSIS,

        error

      );


      this.status =
        JOB_STATUS.FAILED;


      this._record(
        "analysis_failed"
      );


      throw error;

    }

  }


  /* ===================================================
     SAVE
  =================================================== */

  async save() {

    this._setStage(

      JOB_STAGE.SAVE,

      JOB_STATUS.SAVING

    );


    try {

      if (!this.result) {

        throw new Error(
          "Cannot save an empty analysis result."
        );

      }


      /*
        IMPORTANT:

        التخزين الآن يمر عبر:

        AnalysisJob
          ↓
        ExperimentEngine
          ↓
        MTIMemoryService
          ↓
        reel-memory.js
          ↓
        account-scoped localStorage

        وبالتالي كل حساب Google يبقى معزول.
      */

      const experiment = {

        id:
          this.id,

        accountId:
          this.accountId,

        type:
          "reel-analysis",

        status:
          "ANALYZED",

        createdAt:
          this.createdAt,

        updatedAt:
          now(),

        input:
          safeClone(
            this.input
          ),

        analysis:
          safeClone(
            this.result
          ),

        prediction:
          safeClone(
            this.result?.prediction ||
            null
          ),

        metadata:
          safeClone(
            this.meta
          )

      };


      const savedExperiment =
        await saveExperiment(
          experiment
        );


      if (!savedExperiment) {

        throw new Error(
          "Experiment could not be saved."
        );

      }


      this._record(

        "analysis_saved",

        {

          experimentSaved:
            Boolean(
              savedExperiment
            ),

          analysisSaved:
            true

        }

      );


      return {

        experiment:
          savedExperiment,

        analysis:
          safeClone(
            this.result
          )

      };

    } catch (error) {

      this._addError(

        JOB_STAGE.SAVE,

        error

      );


      this.status =
        JOB_STATUS.FAILED;


      this._record(
        "save_failed"
      );


      throw error;

    }

  }


  /* ===================================================
     RECOMMENDATIONS
  =================================================== */

  async generateRecommendations(
    generator
  ) {

    this._setStage(

      JOB_STAGE.RECOMMENDATIONS,

      JOB_STATUS.RECOMMENDING

    );


    if (
      typeof generator !==
      "function"
    ) {

      this._addWarning(

        JOB_STAGE.RECOMMENDATIONS,

        "Recommendation generator is not available."

      );


      this._record(
        "recommendations_skipped"
      );


      return null;

    }


    try {

      const recommendations =
        await generator(

          safeClone(
            this.result
          ),

          safeClone(
            this.input
          ),

          this

        );


      this.recommendations =
        safeClone(
          recommendations
        );


      this._record(

        "recommendations_completed",

        {

          hasRecommendations:
            Boolean(
              recommendations
            )

        }

      );


      return this.recommendations;

    } catch (error) {

      /*
        Recommendation failure
        must NEVER destroy analysis.
      */

      this._addError(

        JOB_STAGE.RECOMMENDATIONS,

        error

      );


      this._addWarning(

        JOB_STAGE.RECOMMENDATIONS,

        "Analysis was preserved although recommendations failed."

      );


      this._record(
        "recommendations_failed"
      );


      return null;

    }

  }


  /* ===================================================
     MEMORY
  =================================================== */

  async updateMemory() {

    this._setStage(

      JOB_STAGE.MEMORY,

      JOB_STATUS.RECOMMENDING

    );


    try {

      /*
        Prediction
      */

      if (
        this.result?.prediction
      ) {

        await attachPrediction(

          this.id,

          safeClone(
            this.result.prediction
          )

        );

      }


      /*
        Performance
      */

      if (
        this.performance
      ) {

        await attachActualPerformance(

          this.id,

          safeClone(
            this.performance
          )

        );

      }


      /*
        Comparison / Learning

        يتم الحفاظ عليها داخل التجربة
        بدون استخدام AccountMemory القديم.
      */

      if (
        this.comparison ||
        this.learning
      ) {

        const current =
          getExperiment(
            this.id
          );


        if (current) {

          await saveExperiment({

            ...current,

            comparison:
              this.comparison
                ? safeClone(
                    this.comparison
                  )
                : current.comparison,

            learning:
              this.learning
                ? safeClone(
                    this.learning
                  )
                : current.learning

          });

        }

      }


      this._record(
        "memory_updated"
      );


      return true;

    } catch (error) {

      /*
        Memory failure must NOT
        destroy the analysis.
      */

      this._addError(

        JOB_STAGE.MEMORY,

        error

      );


      this._addWarning(

        JOB_STAGE.MEMORY,

        "Analysis remains available even though memory update failed."

      );


      return false;

    }

  }


  /* ===================================================
     SETTERS
  =================================================== */

  setPerformance(
    performance
  ) {

    this.performance =
      safeClone(
        performance
      );


    return this;

  }


  setComparison(
    comparison
  ) {

    this.comparison =
      safeClone(
        comparison
      );


    return this;

  }


  setLearning(
    learning
  ) {

    this.learning =
      safeClone(
        learning
      );


    return this;

  }


  /* ===================================================
     RUN
  =================================================== */

  async run(
    config = {}
  ) {

    const {

      processor =
        null,

      analyzer =
        null,

      recommendations =
        null,

      performance =
        null,

      comparison =
        null,

      learning =
        null,

      input =
        {},

      accountId =
        null

    } = config;


    try {

      await this.create(

        input,

        {
          accountId
        }

      );


      const processedData =
        await this.process(
          processor
        );


      await this.analyze(

        analyzer,

        processedData

      );


      /*
        CRITICAL:

        التحليل الأساسي يُحفظ
        قبل التوصيات.

        إذا فشلت التوصيات،
        النتيجة تبقى محفوظة.
      */

      await this.save();


      if (performance) {

        this.setPerformance(
          performance
        );

      }


      if (comparison) {

        this.setComparison(
          comparison
        );

      }


      if (learning) {

        this.setLearning(
          learning
        );

      }


      await this.generateRecommendations(
        recommendations
      );


      await this.updateMemory();


      this.status =
        this.errors.length > 0

          ? JOB_STATUS.PARTIAL

          : JOB_STATUS.COMPLETED;


      this.stage =
        JOB_STAGE.COMPLETED;


      this.completedAt =
        now();


      this._record(

        "completed",

        {

          status:
            this.status,

          errors:
            this.errors.length,

          warnings:
            this.warnings.length

        }

      );


      return this.getSnapshot();

    } catch (error) {

      this.status =
        JOB_STATUS.FAILED;


      this.completedAt =
        now();


      this._record(

        "failed",

        {

          error:
            normalizeError(
              error
            )

        }

      );


      throw error;

    }

  }


  /* ===================================================
     SNAPSHOT
  =================================================== */

  getSnapshot() {

    return {

      id:
        this.id,

      accountId:
        this.accountId,

      status:
        this.status,

      stage:
        this.stage,

      createdAt:
        this.createdAt,

      startedAt:
        this.startedAt,

      completedAt:
        this.completedAt,

      input:
        safeClone(
          this.input
        ),

      result:
        safeClone(
          this.result
        ),

      recommendations:
        safeClone(
          this.recommendations
        ),

      performance:
        safeClone(
          this.performance
        ),

      comparison:
        safeClone(
          this.comparison
        ),

      learning:
        safeClone(
          this.learning
        ),

      errors:
        safeClone(
          this.errors
        ),

      warnings:
        safeClone(
          this.warnings
        ),

      history:
        safeClone(
          this.history
        ),

      meta:
        safeClone(
          this.meta
        )

    };

  }


  /* ===================================================
     STATIC
  =================================================== */

  static getStatus() {

    return JOB_STATUS;

  }


  static getStages() {

    return JOB_STAGE;

  }


  static get(id) {

    if (!id) {

      return null;

    }


    try {

      return getExperiment(
        id
      );

    } catch (error) {

      console.error(

        "MTI — Failed to retrieve analysis job:",

        error

      );


      return null;

    }

  }

}


/* =====================================================
   EXPORTS
===================================================== */

export {
  JOB_STATUS,
  JOB_STAGE
};


export default AnalysisJob;
