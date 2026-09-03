/*
  MTI — Analysis Service
  ----------------------

  الخدمة المركزية لتحليل الريلز.

  Pipeline:

  Video
    ↓
  Reel Engine
    ↓
  Local Analysis
    ↓
  Intelligence Context
    ↓
  Local Intelligence
    ↓
  Analysis Result

  Local-First:
  true

  External AI:
  false

  External API:
  false
*/


import {
  AnalysisPipeline
} from "./AnalysisPipeline.js";


import {
  getActiveAnalysisEngine
} from "./MTIEngineSetup.js";


import {
  intelligenceContext
} from "./MTIIntelligenceContext.js";


import {
  localIntelligenceEngine
} from "../ai/LocalIntelligenceEngine.js";


import {
  MTIError,
  normalizeError
} from "./MTIError.js";



/* =========================================================
   ANALYSIS SERVICE
========================================================= */


export class MTIAnalysisService {


  constructor(
    options = {}
  ) {

    this.pipeline =
      options.pipeline ||
      new AnalysisPipeline();


    this.engine =
      options.engine ||
      null;


    this.intelligence =
      options.intelligence ||
      localIntelligenceEngine;


    this.context =
      options.context ||
      intelligenceContext;


    this.initialized =
      false;


    this.lastError =
      null;

  }



  /* =======================================================
     INITIALIZE
  ======================================================= */


  initialize() {

    if (
      this.initialized
    ) {

      return this;

    }


    try {

      this.engine =
        this.engine ||
        getActiveAnalysisEngine();


      if (
        !this.engine
      ) {

        throw new MTIError({

          message:
            "لم يتم العثور على محرك تحليل الفيديو.",

          type:
            "engine",

          code:
            "ANALYSIS_ENGINE_NOT_FOUND",

          stage:
            "initialization"

        });

      }


      if (
        typeof this.engine.analyze !==
        "function"
      ) {

        throw new MTIError({

          message:
            "محرك التحليل لا يدعم عملية analyze.",

          type:
            "engine",

          code:
            "ANALYSIS_ENGINE_INVALID",

          stage:
            "initialization"

        });

      }


      if (
        !this.intelligence ||
        typeof this.intelligence.analyze !==
          "function"
      ) {

        throw new MTIError({

          message:
            "محرك الذكاء المحلي غير جاهز.",

          type:
            "ai",

          code:
            "LOCAL_INTELLIGENCE_NOT_READY",

          stage:
            "initialization"

        });

      }


      if (
        !this.context ||
        typeof this.context.build !==
          "function"
      ) {

        throw new MTIError({

          message:
            "سياق الذكاء غير جاهز.",

          type:
            "unknown",

          code:
            "INTELLIGENCE_CONTEXT_NOT_READY",

          stage:
            "initialization"

        });

      }


      this.pipeline.configure({

        processor:
          async (
            file,
            options = {}
          ) =>
            this.engine.analyze(
              file,
              options
            ),

        analyzer:
          async (
            processedData
          ) =>
            processedData

      });


      this.initialized =
        true;


      this.lastError =
        null;


      return this;

    } catch (error) {

      this.lastError =
        normalizeError(
          error,
          {
            stage:
              "initialization"
          }
        );


      throw this.lastError;

    }

  }



  /* =======================================================
     ANALYZE
  ======================================================= */


  async analyze(
    file,
    options = {}
  ) {

    this.initialize();


    this.lastError =
      null;


    try {

      /*
        STEP 1
        Local video analysis
      */

      const localAnalysis =
        await this.pipeline.execute(
          file,
          options
        );


      /*
        STEP 2
        Build intelligence context
      */

      const context =
        this.context.build(
          localAnalysis,
          {

            includeGlobal:
              options.includeGlobalKnowledge !== false,

            includeScientific:
              options.includeScientificKnowledge !== false,

            includeBenchmarks:
              options.includeBenchmarks !== false

          }
        );


      /*
        STEP 3
        Local intelligence
      */

      const intelligence =
        await this.intelligence.analyze(
          localAnalysis,
          {

            ...options,

            context

          }
        );


      /*
        STEP 4
        Final result
      */

      return {

        ...localAnalysis,

        intelligence,

        intelligenceContext:
          context,

        engine: {

          videoAnalysis:
            this.getEngineInfo(),

          intelligence:
            this.intelligence
              .getInfo?.() ||
            null,

          knowledge:
            this.context
              .getInfo?.() ||
            null

        }

      };

    } catch (error) {

      this.lastError =
        normalizeError(
          error,
          {
            stage:
              "analysis"
          }
        );


      throw this.lastError;

    }

  }



  /* =======================================================
     ANALYZE WITH JOB
  ======================================================= */


  async analyzeWithJob(
    file,
    options = {}
  ) {

    this.initialize();


    this.lastError =
      null;


    try {

      /*
        STEP 1
        Create or reuse AnalysisJob
      */

      const job =
        options.job instanceof AnalysisJob
          ? options.job
          : this.pipeline.createJob(
              options.accountId ||
              null
            );


      /*
        STEP 2
        Run local analysis through
        the existing AnalysisJob
      */

      const result =
        await this.pipeline.executeWithJob(
          job,
          file,
          options
        );


      const localAnalysis =
        result?.analysis ||
        result;


      /*
        STEP 3
        Build knowledge context
      */

      const context =
        this.context.build(
          localAnalysis,
          {

            includeGlobal:
              options.includeGlobalKnowledge !== false,

            includeScientific:
              options.includeScientificKnowledge !== false,

            includeBenchmarks:
              options.includeBenchmarks !== false

          }
        );


      /*
        STEP 4
        Run local intelligence
      */

      const intelligence =
        await this.intelligence.analyze(
          localAnalysis,
          {

            ...options,

            context

          }
        );


      /*
        STEP 5
        Return unified pipeline result
      */

      return {

        ...result,

        analysis:
          localAnalysis,

        intelligence,

        intelligenceContext:
          context

      };

    } catch (error) {

      this.lastError =
        normalizeError(
          error,
          {
            stage:
              "analysis-job"
          }
        );


      throw this.lastError;

    }

  }



  /* =======================================================
     GETTERS
  ======================================================= */


  getPipeline() {

    this.initialize();


    return this.pipeline;

  }



  getEngine() {

    this.initialize();


    return this.engine;

  }



  getIntelligenceEngine() {

    this.initialize();


    return this.intelligence;

  }



  getIntelligenceContext() {

    this.initialize();


    return this.context;

  }



  getEngineInfo() {

    this.initialize();


    if (
      typeof this.engine
        .getEngineInfo ===
      "function"
    ) {

      return this.engine
        .getEngineInfo();

    }


    if (
      typeof this.engine
        .getInfo ===
      "function"
    ) {

      return this.engine
        .getInfo();

    }


    return {

      name:
        "unknown",

      status:
        "unknown"

    };

  }



  getIntelligenceInfo() {

    this.initialize();


    if (
      typeof this.intelligence
        .getInfo ===
      "function"
    ) {

      return this.intelligence
        .getInfo();

    }


    return null;

  }



  getContextInfo() {

    this.initialize();


    if (
      typeof this.context
        .getInfo ===
      "function"
    ) {

      return this.context
        .getInfo();

    }


    return null;

  }



  isReady() {

    try {

      this.initialize();


      return (

        this.initialized === true &&

        !!this.engine &&

        !!this.intelligence &&

        !!this.context

      );

    } catch {

      return false;

    }

  }



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


export function createAnalysisService(
  options = {}
) {

  return new MTIAnalysisService(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const analysisService =
  new MTIAnalysisService();



export default analysisService;
