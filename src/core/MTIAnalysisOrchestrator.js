/*
  MTI — Analysis Orchestrator
  ---------------------------

  المسؤول عن دورة التحليل الكاملة:

  1. إنشاء Experiment
  2. حفظ Experiment
  3. تشغيل التحليل المحلي
  4. بناء النتيجة الموحدة
  5. حفظ النتيجة في Private Memory
  6. استخراج Recommendations

  Local-First:
  true

  External AI:
  false

  External API:
  false
*/


import {
  createExperiment,
  saveExperiment,
  setExperimentStatus
} from "../engine/ExperimentEngine.js";


import {
  analysisService
} from "./MTIAnalysisService.js";


import {
  createAnalysisResult
} from "./MTIAnalysisResult.js";


import {
  resultMemoryBridge
} from "./MTIResultMemoryBridge.js";



/* =========================================================
   ORCHESTRATOR
========================================================= */


export class MTIAnalysisOrchestrator {


  constructor(
    options = {}
  ) {

    this.analysis =
      options.analysisService ||
      analysisService;


    this.memory =
      options.memoryBridge ||
      resultMemoryBridge;


    this.lastError =
      null;

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


    let experiment =
      null;

    let savedExperiment =
      null;

    let experimentId =
      null;


    try {

      /*
        STEP 1
        Validate input
      */

      if (!file) {

        throw new Error(
          "لم يتم اختيار فيديو."
        );

      }


      if (
        !file.type ||
        !file.type.startsWith(
          "video/"
        )
      ) {

        throw new Error(
          "الملف المختار ليس فيديو."
        );

      }



      /*
        STEP 2
        Create Experiment
      */

      experiment =
        createExperiment({

          name:
            file.name,

          title:
            options.title ||
            file.name,

          platform:
            options.platform ||
            "instagram",

          niche:
            options.niche ||
            null,

          source:
            "local-analysis",

          metadata: {

            fileName:
              file.name,

            fileSize:
              file.size,

            fileType:
              file.type

          }

        });


      experimentId =
        experiment?.id ||
        null;


      if (!experimentId) {

        throw new Error(
          "تعذر إنشاء Experiment."
        );

      }



      /*
        STEP 3
        Save Experiment

        ExperimentEngine is now async.
      */

      savedExperiment =
        await saveExperiment(
          experiment
        );


      if (!savedExperiment) {

        throw new Error(
          "تعذر حفظ Experiment."
        );

      }



      /*
        STEP 4
        Set initial status
      */

      await setExperimentStatus(
        experimentId,
        "DRAFT"
      );



      /*
        STEP 5
        Local Analysis
      */

      const rawResult =
        await this.analysis.analyze(
          file,
          {
            ...options,

            experimentId

          }
        );



      if (!rawResult) {

        throw new Error(
          "لم تُرجع محرك التحليل نتيجة."
        );

      }



      /*
        STEP 6
        Build Unified Result
      */

      const result =
        createAnalysisResult({

          ...rawResult,

          experimentId,

          localAnalysis:
            rawResult,

          intelligence:
            rawResult.intelligence,

          prediction:
            rawResult.prediction ||
            rawResult
              ?.intelligence
              ?.prediction,

          recommendations:
            rawResult.recommendations ||
            rawResult
              ?.intelligence
              ?.recommendations ||
            []

        });



      /*
        STEP 7
        Save Complete Result
        into Private Memory

        Memory failure must NOT destroy
        an otherwise successful analysis.
      */

      let memoryResult =
        null;

      let memoryError =
        null;


      try {

        memoryResult =
          await this.memory.saveResult(
            experimentId,
            result
          );

      } catch (error) {

        memoryError =
          error;

      }



      /*
        STEP 8
        Mark Experiment as Analyzed

        Status update is independent from
        optional memory failure.
      */

      let statusError =
        null;


      try {

        await setExperimentStatus(
          experimentId,
          "ANALYZED"
        );

      } catch (error) {

        statusError =
          error;

      }



      /*
        STEP 9
        Return final result

        The analysis remains successful even
        if Memory or status update has a
        recoverable failure.
      */

      return {

        success:
          true,

        experiment:
          savedExperiment,

        experimentId,

        analysis:
          result,

        prediction:
          result.prediction,

        recommendations:
          result.recommendations,

        memory:
          memoryResult,

        warnings: {

          memory:
            memoryError
              ? (
                  memoryError?.message ||
                  "تعذر حفظ النتيجة في الذاكرة."
                )
              : null,

          status:
            statusError
              ? (
                  statusError?.message ||
                  "تعذر تحديث حالة Experiment."
                )
              : null

        }

      };

    } catch (error) {

      this.lastError =
        error;


      return {

        success:
          false,

        error:
          error?.message ||
          "حدث خطأ أثناء تحليل الفيديو.",

        details:
          error,

        experiment:
          savedExperiment ||
          experiment ||
          null,

        experimentId,

        analysis:
          null,

        prediction:
          null,

        recommendations:
          [],

        memory:
          null

      };

    }

  }



  /* =======================================================
     SAVE PERFORMANCE
  ======================================================= */


  savePerformance(
    experimentId,
    performance
  ) {

    return this.memory
      .savePerformance(
        experimentId,
        performance
      );

  }



  /* =======================================================
     SAVE COMPARISON
  ======================================================= */


  saveComparison(
    experimentId,
    comparison
  ) {

    return this.memory
      .saveComparison(
        experimentId,
        comparison
      );

  }



  /* =======================================================
     SAVE LEARNING
  ======================================================= */


  saveLearning(
    experimentId,
    learning
  ) {

    return this.memory
      .saveLearning(
        experimentId,
        learning
      );

  }



  /* =======================================================
     GET INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIAnalysisOrchestrator",

      version:
        "2.1.0",

      localFirst:
        true,

      externalAI:
        false,

      externalAPI:
        false,

      accountIsolation:
        true,

      pipeline: [

        "create-experiment",

        "save-experiment",

        "local-analysis",

        "unified-result",

        "private-memory",

        "recommendations",

        "analyzed-status"

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


export function createAnalysisOrchestrator(
  options = {}
) {

  return new MTIAnalysisOrchestrator(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const analysisOrchestrator =
  new MTIAnalysisOrchestrator();



export default analysisOrchestrator;
