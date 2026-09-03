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
  "1.0.0";



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
        1. Save complete analysis
      */

      const savedAnalysis =
        this.memory.saveAnalysis(
          experimentId,
          normalized
        );


      /*
        2. Save prediction
      */

      let savedPrediction =
        null;


      if (
        normalized.prediction
      ) {

        savedPrediction =
          this.memory.savePrediction(
            experimentId,
            normalized.prediction
          );

      }


      /*
        3. Save performance
      */

      let savedPerformance =
        null;


      if (
        normalized.performance
      ) {

        savedPerformance =
          this.memory.savePerformance(
            experimentId,
            normalized.performance
          );

      }


      /*
        4. Save comparison
      */

      let savedComparison =
        null;


      if (
        normalized.comparison
      ) {

        savedComparison =
          this.memory.saveComparison(
            experimentId,
            normalized.comparison
          );

      }


      /*
        5. Save learning
      */

      let savedLearning =
        null;


      if (
        normalized.learning
      ) {

        savedLearning =
          this.memory.saveLearning(
            experimentId,
            normalized.learning
          );

      }


      return {

        success:
          true,

        experimentId,

        result:
          normalized,

        saved: {

          analysis:
            !!savedAnalysis,

          prediction:
            !!savedPrediction,

          performance:
            !!savedPerformance,

          comparison:
            !!savedComparison,

          learning:
            !!savedLearning

        }

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
        "AccountMemory",

      localFirst:
        true,

      externalAPI:
        false,

      externalAI:
        false,

      accountPrivate:
        true,

      capabilities: [

        "result-persistence",

        "analysis-storage",

        "prediction-storage",

        "performance-storage",

        "comparison-storage",

        "learning-storage",

        "account-isolation"

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
