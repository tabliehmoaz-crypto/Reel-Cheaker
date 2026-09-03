/*
  MTI — Memory Service
  --------------------
  الجسر الرسمي بين MTI Core و AccountMemory.

  المسؤوليات:
  - حفظ نتائج التحليل
  - حفظ Prediction
  - حفظ Performance
  - حفظ Comparison
  - حفظ Learning
  - استرجاع تجارب الحساب
  - إعطاء Core واجهة ثابتة للذاكرة

  مهم:
  - لا يوجد Gemini
  - لا يوجد Claude
  - لا يوجد API خارجي
  - لا يدير UI
  - لا يحتوي منطق تحليل الفيديو

  AccountMemory هي الذاكرة الأساسية.
*/


import {
  initializeAccount,
  getAccount,
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
} from "../memory/AccountMemory.js";



/* =========================================================
   MEMORY SERVICE
========================================================= */


export class MTIMemoryService {


  constructor(options = {}) {

    this.initialized =
      false;


    this.lastError =
      null;


    this.autoInitialize =
      options.autoInitialize !== false;

  }



  /* =======================================================
     INITIALIZE
  ======================================================= */


  initialize(
    accountData = {}
  ) {

    if (
      this.initialized
    ) {

      return this.getAccount();

    }


    const account =
      initializeAccount(
        accountData
      );


    this.initialized =
      true;


    return account;

  }



  ensureInitialized() {

    if (
      !this.initialized
    ) {

      this.initialize();

    }


    return this;

  }



  /* =======================================================
     ACCOUNT
  ======================================================= */


  getAccount() {

    this.ensureInitialized();


    return getAccount();

  }



  /* =======================================================
     EXPERIMENTS
  ======================================================= */


  saveExperiment(
    experiment
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveExperiment(
          experiment
        )
    );

  }



  getExperiment(
    experimentId
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        getExperiment(
          experimentId
        )
    );

  }



  getExperiments(
    filters = {}
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        getExperiments(
          filters
        )
    );

  }



  deleteExperiment(
    experimentId
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        deleteExperiment(
          experimentId
        )
    );

  }



  /* =======================================================
     ANALYSIS
  ======================================================= */


  saveAnalysis(
    experimentId,
    analysis
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveAnalysis(
          experimentId,
          analysis
        )
    );

  }



  /* =======================================================
     PREDICTION
  ======================================================= */


  savePrediction(
    experimentId,
    prediction
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        savePrediction(
          experimentId,
          prediction
        )
    );

  }



  /* =======================================================
     PERFORMANCE
  ======================================================= */


  savePerformance(
    experimentId,
    performance
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        savePerformance(
          experimentId,
          performance
        )
    );

  }



  /* =======================================================
     COMPARISON
  ======================================================= */


  saveComparison(
    experimentId,
    comparison
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveComparison(
          experimentId,
          comparison
        )
    );

  }



  /* =======================================================
     CONTEXT
  ======================================================= */


  addContext(
    experimentId,
    variable
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        addContext(
          experimentId,
          variable
        )
    );

  }



  /* =======================================================
     NOTES
  ======================================================= */


  addNote(
    experimentId,
    note
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        addNote(
          experimentId,
          note
        )
    );

  }



  /* =======================================================
     CONVERSATION
  ======================================================= */


  saveConversationMessage(
    experimentId,
    message
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveConversationMessage(
          experimentId,
          message
        )
    );

  }



  saveExtractedData(
    experimentId,
    data
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveExtractedData(
          experimentId,
          data
        )
    );

  }



  /* =======================================================
     LEARNING
  ======================================================= */


  saveLearning(
    experimentId,
    learning
  ) {

    this.ensureInitialized();


    return this.execute(
      () =>
        saveLearning(
          experimentId,
          learning
        )
    );

  }



  getLearningDataset() {

    this.ensureInitialized();


    return this.execute(
      () =>
        getLearningDataset()
    );

  }



  getLearnings() {

    this.ensureInitialized();


    return this.execute(
      () =>
        getLearnings()
    );

  }



  /* =======================================================
     INTELLIGENCE DATA
  ======================================================= */


  getContentSignals() {

    this.ensureInitialized();


    return this.execute(
      () =>
        getContentSignals()
    );

  }



  getMemorySummary() {

    this.ensureInitialized();


    return this.execute(
      () =>
        getMemorySummary()
    );

  }



  /* =======================================================
     IMPORT / EXPORT
  ======================================================= */


  exportMemory() {

    this.ensureInitialized();


    return this.execute(
      () =>
        exportMemory()
    );

  }



  importMemory(
    json
  ) {

    return this.execute(
      () =>
        importMemory(
          json
        )
    );

  }



  clearMemory() {

    return this.execute(
      () =>
        clearMemory()
    );

  }



  getMemoryInfo() {

    return this.execute(
      () =>
        getMemoryInfo()
    );

  }



  /* =======================================================
     SAFE EXECUTION
  ======================================================= */


  execute(
    operation
  ) {

    try {

      this.lastError =
        null;


      return operation();

    } catch (error) {

      this.lastError =
        error;


      throw error;

    }

  }



  /* =======================================================
     STATE
  ======================================================= */


  isReady() {

    try {

      this.ensureInitialized();

      return true;

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



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIMemoryService",

      version:
        "1.0.0",

      provider:
        "AccountMemory",

      storage:
        "localStorage",

      localFirst:
        true,

      externalAPI:
        false,

      cloudSync:
        false,

      capabilities: [

        "account",

        "experiments",

        "analysis",

        "prediction",

        "performance",

        "comparison",

        "learning",

        "context",

        "notes",

        "conversation",

        "content-signals",

        "import",

        "export"

      ]

    };

  }

}



/* =========================================================
   FACTORY
========================================================= */


export function createMemoryService(
  options = {}
) {

  return new MTIMemoryService(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const memoryService =
  new MTIMemoryService();



export default memoryService;
