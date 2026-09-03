/*
  MTI — Analysis Service
  ----------------------
  نقطة الدخول الرسمية لتحليل الريلز.

  المسؤوليات:
  - الحصول على محرك التحليل المحلي
  - تشغيل تحليل الفيديو
  - تشغيل Local Intelligence
  - توحيد النتيجة
  - توحيد التعامل مع أخطاء التحليل

  لا يستخدم:
  - Gemini
  - Claude
  - أي API ذكاء اصطناعي خارجي
*/


import AnalysisPipeline from "./AnalysisPipeline.js";

import {
  getActiveAnalysisEngine
} from "./MTIEngineSetup.js";

import {
  MTIError,
  normalizeError
} from "./MTIError.js";

import {
  localIntelligenceEngine
} from "../ai/LocalIntelligenceEngine.js";



export class MTIAnalysisService {


  constructor(options = {}) {

    this.pipeline =
      options.pipeline ||
      new AnalysisPipeline();


    this.intelligence =
      options.intelligence ||
      localIntelligenceEngine;


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


    const engine =
      getActiveAnalysisEngine();


    if (!engine) {

      throw new MTIError(
        "محرك التحليل غير متوفر.",
        {
          type: "engine",
          severity: "critical",
          code:
            "ANALYSIS_ENGINE_UNAVAILABLE",
          stage:
            "initialization",
          recoverable:
            false
        }
      );

    }


    if (
      !this.intelligence ||
      !this.intelligence.isReady()
    ) {

      throw new MTIError(
        "محرك الذكاء المحلي غير متوفر.",
        {
          type: "engine",
          severity: "critical",
          code:
            "LOCAL_INTELLIGENCE_UNAVAILABLE",
          stage:
            "initialization",
          recoverable:
            false
        }
      );

    }


    this.pipeline.configure({

      analyzer:
        async (
          file,
          options = {}
        ) => {

          return engine.analyze(
            file,
            options
          );

        }

    });


    this.initialized =
      true;


    return this;

  }



  /* =======================================================
     ANALYZE
  ======================================================= */


  async analyze(
    file,
    options = {}
  ) {

    this.lastError =
      null;


    try {

      this.initialize();


      if (!file) {

        throw new MTIError(
          "لم يتم اختيار فيديو.",
          {
            type:
              "validation",

            severity:
              "warning",

            code:
              "VIDEO_REQUIRED",

            stage:
              "validation",

            recoverable:
              true
          }
        );

      }



      /*
        المرحلة الأولى:
        تحليل الفيديو محلياً
      */


      const localAnalysis =
        await this.pipeline.execute(
          file,
          options
        );



      /*
        المرحلة الثانية:
        تشغيل العقل المحلي
      */


      const intelligence =
        await this.intelligence.analyze(
          localAnalysis,
          options
        );



      /*
        المرحلة الثالثة:
        دمج النتيجتين
      */


      return {

        ...localAnalysis,

        intelligence,

        engine: {

          videoAnalysis:
            this.getEngineInfo(),

          intelligence:
            this.intelligence.getInfo()

        }

      };


    } catch (error) {

      const normalized =
        normalizeError(
          error,
          {
            stage:
              "analysis"
          }
        );


      this.lastError =
        normalized;


      throw normalized;

    }

  }



  /* =======================================================
     ANALYZE WITH JOB
  ======================================================= */


  async analyzeWithJob(
    file,
    options = {}
  ) {

    this.lastError =
      null;


    try {

      this.initialize();


      if (!file) {

        throw new MTIError(
          "لم يتم اختيار فيديو.",
          {
            type:
              "validation",

            severity:
              "warning",

            code:
              "VIDEO_REQUIRED",

            stage:
              "validation",

            recoverable:
              true
          }
        );

      }



      const result =
        await this.pipeline.executeWithJob(
          file,
          options
        );



      /*
        AnalysisPipeline / Job
        يعطي النتيجة المحلية.

        بعدها نمررها إلى
        Local Intelligence.
      */


      const localAnalysis =
        result?.analysis ||
        result;


      const intelligence =
        await this.intelligence.analyze(
          localAnalysis,
          options
        );



      /*
        إذا كانت النتيجة Job Snapshot
        نحافظ عليها ونضيف Intelligence.
      */


      if (
        result &&
        typeof result ===
        "object"
      ) {

        return {

          ...result,

          analysis:
            localAnalysis,

          intelligence

        };

      }


      return {

        analysis:
          localAnalysis,

        intelligence

      };


    } catch (error) {

      const normalized =
        normalizeError(
          error,
          {
            stage:
              "analysis-job"
          }
        );


      this.lastError =
        normalized;


      throw normalized;

    }

  }



  /* =======================================================
     GETTERS
  ======================================================= */


  getPipeline() {

    return this.pipeline;

  }



  getEngine() {

    return getActiveAnalysisEngine();

  }



  getIntelligenceEngine() {

    return this.intelligence;

  }



  getEngineInfo() {

    const engine =
      this.getEngine();


    return engine?.getEngineInfo
      ? engine.getEngineInfo()
      : null;

  }



  getIntelligenceInfo() {

    return this.intelligence?.getInfo
      ? this.intelligence.getInfo()
      : null;

  }



  isReady() {

    if (
      !this.initialized
    ) {

      try {

        this.initialize();

      } catch {

        return false;

      }

    }


    return (

      this.initialized &&

      !!this.getEngine() &&

      !!this.intelligence &&

      this.intelligence.isReady()

    );

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
