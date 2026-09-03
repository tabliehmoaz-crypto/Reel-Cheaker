/*
  MTI — Result Memory Bridge
  --------------------------

  الجسر بين:

  MTI Analysis Result
        ↓
  Private Account Memory

  المسؤوليات:
  - توحيد نتيجة التحليل قبل الحفظ
  - حفظ Analysis
  - حفظ Prediction
  - حفظ Performance
  - حفظ Comparison
  - حفظ Learning
  - الحفاظ على فصل بيانات الحساب

  مهم:
  - لا يحلل الفيديو
  - لا يتعلم مباشرة من مستخدم آخر
  - لا يرسل بيانات خارجية
  - لا يستخدم Gemini / Claude
  - Global Learning له مسار منفصل

  Local-First:
  true
*/


import {
  normalizeAnalysisResult
} from "./MTIAnalysisResult.js";


import {
  memoryService
} from "./MTIMemoryService.js";



const BRIDGE_VERSION =
  "1.1.0";



/* =========================================================
   RESULT MEMORY BRIDGE
========================================================= */


export class MTIResultMemoryBridge {


  constructor(
    options = {}
  ) {

    this.memory =
      options.memory ||
      memoryService;


    this.version =
      options.version ||
      BRIDGE_VERSION;


    this.lastError =
      null;

  }



  /* =======================================================
     SAVE COMPLETE RESULT
  ======================================================= */


  saveResult(
    experimentId,
    result
  ) {

    this.lastError =
      null;


    try {

      if (
        !experimentId
      ) {

        throw new Error(
          "لا يمكن حفظ النتيجة بدون Experiment ID."
        );

      }


      if (!result) {

        throw new Error(
          "لا توجد نتيجة تحليل لحفظها."
        );

      }


      const normalized =
        normalizeAnalysisResult(
          result
        );


      /*
        =====================================================
        CORE RESULT
        =====================================================

        هذا هو الجزء الأساسي.

        إذا فشل حفظ Analysis نفسه،
        نعتبر عملية الحفظ الأساسية فاشلة.
      */

      const savedAnalysis =
        this.memory.saveAnalysis(
          experimentId,
          normalized
        );


      if (!savedAnalysis) {

        throw new Error(
          "تعذر حفظ نتيجة التحليل في الذاكرة."
        );

      }


      /*
        =====================================================
        OPTIONAL MEMORY LAYERS
        =====================================================

        كل طبقة مستقلة.

        فشل Prediction مثلاً لا يجب أن
        يمنع حفظ Analysis أو باقي البيانات.
      */


      const saved = {

        analysis:
          true,

        prediction:
          false,

        performance:
          false,

        comparison:
          false,

        learning:
          false

      };


      const errors = [];



      /* ===================================================
         PREDICTION
      =================================================== */


      if (
        normalized.prediction
      ) {

        try {

          const savedPrediction =
            this.memory.savePrediction(
              experimentId,
              normalized.prediction
            );


          saved.prediction =
            !!savedPrediction;

        } catch (error) {

          errors.push({

            stage:
              "prediction",

            message:
              error?.message ||
              "تعذر حفظ Prediction."

          });

        }

      }



      /* ===================================================
         PERFORMANCE
      =================================================== */


      if (
        normalized.performance
      ) {

        try {

          const savedPerformance =
            this.memory.savePerformance(
              experimentId,
              normalized.performance
            );


          saved.performance =
            !!savedPerformance;

        } catch (error) {

          errors.push({

            stage:
              "performance",

            message:
              error?.message ||
              "تعذر حفظ Performance."

          });

        }

      }



      /* ===================================================
         COMPARISON
      =================================================== */


      if (
        normalized.comparison
      ) {

        try {

          const savedComparison =
            this.memory.saveComparison(
              experimentId,
              normalized.comparison
            );


          saved.comparison =
            !!savedComparison;

        } catch (error) {

          errors.push({

            stage:
              "comparison",

            message:
              error?.message ||
              "تعذر حفظ Comparison."

          });

        }

      }



      /* ===================================================
         LEARNING
      =================================================== */


      if (
        normalized.learning
      ) {

        try {

          const savedLearning =
            this.memory.saveLearning(
              experimentId,
              normalized.learning
            );


          saved.learning =
            !!savedLearning;

        } catch (error) {

          errors.push({

            stage:
              "learning",

            message:
              error?.message ||
              "تعذر حفظ Learning."

          });

        }

      }



      /*
        =====================================================
        FINAL MEMORY STATUS
        =====================================================
      */

      return {

        success:
          true,

        partial:
          errors.length > 0,

        experimentId,

        result:
          normalized,

        saved,

        errors

      };

    } catch (error) {

      this.lastError =
        error;


      throw error;

    }

  }



  /* =======================================================
     SAVE PERFORMANCE AFTER PUBLISHING
  ======================================================= */


  savePerformance(
    experimentId,
    performance
  ) {

    this.lastError =
      null;


    try {

      return this.memory
        .savePerformance(
          experimentId,
          performance
        );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     SAVE COMPARISON
  ======================================================= */


  saveComparison(
    experimentId,
    comparison
  ) {

    this.lastError =
      null;


    try {

      return this.memory
        .saveComparison(
          experimentId,
          comparison
        );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     SAVE LEARNING
  ======================================================= */


  saveLearning(
    experimentId,
    learning
  ) {

    this.lastError =
      null;


    try {

      return this.memory
        .saveLearning(
          experimentId,
          learning
        );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     LOAD RESULT
  ======================================================= */


  getResult(
    experimentId
  ) {

    this.lastError =
      null;


    try {

      return this.memory
        .getExperiment(
          experimentId
        );

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     GET ACCOUNT MEMORY
  ======================================================= */


  getMemory() {

    return this.memory;

  }



  /* =======================================================
     CHECK
  ======================================================= */


  isReady() {

    return (

      !!this.memory &&

      typeof this.memory
        .saveAnalysis ===
        "function" &&

      typeof this.memory
        .savePrediction ===
        "function" &&

      typeof this.memory
        .savePerformance ===
        "function" &&

      typeof this.memory
        .saveComparison ===
        "function" &&

      typeof this.memory
        .saveLearning ===
        "function"

    );

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIResultMemoryBridge",

      version:
        this.version,

      storage:
        "MTIMemoryService → reel-memory.js",

      storageModel:
        "account-scoped-localStorage",

      localFirst:
        true,

      externalAPI:
        false,

      externalAI:
        false,

      cloudSync:
        false,

      accountPrivate:
        true,

      accountIsolation:
        true,

      capabilities: [

        "result-persistence",

        "analysis-storage",

        "prediction-storage",

        "performance-storage",

        "comparison-storage",

        "learning-storage",

        "account-isolation",

        "failure-isolation"

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


export function createResultMemoryBridge(
  options = {}
) {

  return new MTIResultMemoryBridge(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const resultMemoryBridge =
  new MTIResultMemoryBridge();



export default resultMemoryBridge;
