/*
  MTI — Memory Service
  --------------------

  الجسر الرسمي بين MTI Core و Reel Memory.

  المسؤوليات:
  - حفظ نتائج التحليل
  - حفظ Prediction
  - حفظ Performance
  - حفظ Comparison
  - حفظ Learning
  - استرجاع تجارب الحساب
  - ربط الحساب الحالي بالـ Private Memory

  Local-first.

  لا Gemini.
  لا Claude.
  لا External API.
*/


import {
  setActiveAccount,
  getActiveAccountId,
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
} from "../memory/reel-memory.js";



/* =========================================================
   MEMORY SERVICE
========================================================= */


export class MTIMemoryService {


  constructor(
    options = {}
  ) {

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

    try {

      this.lastError =
        null;


      /*
        تحديد الحساب الحالي قبل تهيئة الذاكرة.

        كل Google account يمتلك
        localStorage bucket مستقل.

        لا يتم دمج بيانات الحسابات.
      */

      if (
        accountData?.id
      ) {

        setActiveAccount(
          accountData.id
        );

      }


      const account =
        initializeAccount(
          accountData
        );


      this.initialized =
        true;


      return account;

    } catch (error) {

      this.lastError =
        error;


      throw error;

    }

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


  setAccount(
    accountData = {}
  ) {

    this.initialized =
      false;


    return this.initialize(
      accountData
    );

  }


  getActiveAccountId() {

    this.ensureInitialized();


    return getActiveAccountId();

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
     CONTENT SIGNALS
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

    this.ensureInitialized();


    return this.execute(
      () =>
        importMemory(
          json
        )
    );

  }



  clearMemory() {

    this.ensureInitialized();


    return this.execute(
      () =>
        clearMemory()
    );

  }



  /* =======================================================
     INFO
  ======================================================= */


  getMemoryInfo() {

    this.ensureInitialized();


    return this.execute(
      () =>
        getMemoryInfo()
    );

  }


  /*
    Alias رسمي للـ Core services.

    بعض طبقات MTI تستخدم:
      memoryService.getInfo()

    لذلك نحتفظ بـ getMemoryInfo()
    ونعطي getInfo() كواجهة موحدة.
  */

  getInfo() {

    return this.getMemoryInfo();

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
     SERVICE INFO
  ======================================================= */


  getServiceInfo() {

    return {

      name:
        "MTIMemoryService",

      version:
        "2.1.0",

      provider:
        "ReelMemory",

      storage:
        "account-scoped-localStorage",

      localFirst:
        true,

      externalAPI:
        false,

      externalAI:
        false,

      cloudSync:
        false,

      accountIsolation:
        true,

      capabilities: [

        "account",

        "account-isolation",

        "private-memory",

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

        "export",

        "clear"

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
