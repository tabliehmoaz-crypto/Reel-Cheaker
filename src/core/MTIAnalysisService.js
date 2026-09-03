/*
  MTI — Analysis Service
  ----------------------
  نقطة الدخول الرسمية لتحليل الريلز.

  المسؤوليات:
  - الحصول على محرك التحليل
  - إنشاء Analysis Job
  - تشغيل Analysis Pipeline
  - توحيد التعامل مع أخطاء التحليل
  - إبقاء UI و AI بعيدين عن تفاصيل المحرك
*/

import AnalysisPipeline from "./AnalysisPipeline.js";
import { getActiveAnalysisEngine } from "./MTIEngineSetup.js";
import { MTIError, normalizeError } from "./MTIError.js";


export class MTIAnalysisService {

  constructor(options = {}) {

    this.pipeline =
      options.pipeline ||
      new AnalysisPipeline();

    this.initialized =
      false;

    this.lastError =
      null;

  }


  initialize() {

    if (this.initialized) {
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
          code: "ANALYSIS_ENGINE_UNAVAILABLE",
          stage: "initialization",
          recoverable: false
        }
      );

    }


    this.pipeline.configure({
      analyzer: async (file, options = {}) => {

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
            type: "validation",
            severity: "warning",
            code: "VIDEO_REQUIRED",
            stage: "validation",
            recoverable: true
          }
        );

      }


      const result =
        await this.pipeline.execute(
          file,
          options
        );


      return result;

    } catch (error) {

      const normalized =
        normalizeError(
          error,
          {
            stage: "analysis"
          }
        );


      this.lastError =
        normalized;


      throw normalized;

    }

  }


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
            type: "validation",
            severity: "warning",
            code: "VIDEO_REQUIRED",
            stage: "validation",
            recoverable: true
          }
        );

      }


      const result =
        await this.pipeline.executeWithJob(
          file,
          options
        );


      return result;

    } catch (error) {

      const normalized =
        normalizeError(
          error,
          {
            stage: "analysis-job"
          }
        );


      this.lastError =
        normalized;


      throw normalized;

    }

  }


  getPipeline() {

    return this.pipeline;

  }


  getEngine() {

    return getActiveAnalysisEngine();

  }


  getEngineInfo() {

    const engine =
      this.getEngine();


    return engine?.getEngineInfo
      ? engine.getEngineInfo()
      : null;

  }


  isReady() {

    if (!this.initialized) {

      try {

        this.initialize();

      } catch {

        return false;

      }

    }


    return (
      this.initialized &&
      !!this.getEngine()
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


export function createAnalysisService(
  options = {}
) {

  return new MTIAnalysisService(
    options
  );

}


export const analysisService =
  new MTIAnalysisService();


export default analysisService;
