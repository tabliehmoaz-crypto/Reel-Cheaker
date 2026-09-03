/*
  MTI — Engine Adapter
  --------------------

  Bridge between MTI Core and ExperimentEngine.

  ExperimentEngine uses module functions
  and account-scoped MTI Memory.

  This adapter provides one stable interface
  for MTI Core while preserving async behavior.
*/


import {
  createExperiment,
  validateExperiment,
  getAllExperiments,
  saveExperiment,
  getExperiment,
  deleteExperiment,
  updateExperiment,
  setExperimentStatus,
  attachAnalysis,
  attachPrediction,
  attachActualPerformance,
  comparePredictionToReality,
  addContextVariable,
  addUserNote,
  addLearningObservation,
  addLearningHypothesis,
  addLearningPattern,
  addConversationMessage,
  addExtractedConversationData,
  getExperimentSummary,
  getEngineInfo
} from "../engine/ExperimentEngine.js";



function normalizeError(
  error
) {

  if (
    error instanceof Error
  ) {

    return error;

  }


  return new Error(
    error?.message ||
    String(error)
  );

}



export class EngineAdapter {


  constructor(
    options = {}
  ) {

    this.name =
      options.name ||
      options.engineName ||
      "ExperimentEngine";


    this.version =
      options.version ||
      "3.0.0";


    this.lastError =
      null;

  }



  /* =======================================================
     ENGINE INFO
  ======================================================= */


  getEngineInfo() {

    try {

      const info =
        getEngineInfo();


      this.lastError =
        null;


      return info;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      return {

        name:
          this.name,

        version:
          this.version,

        error:
          this.lastError.message

      };

    }

  }



  /* =======================================================
     EXPERIMENTS
  ======================================================= */


  createExperiment(
    data = {}
  ) {

    try {

      const experiment =
        createExperiment(
          data
        );


      this.lastError =
        null;


      return experiment;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  validateExperiment(
    experiment
  ) {

    try {

      const result =
        validateExperiment(
          experiment
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  getAllExperiments() {

    try {

      const experiments =
        getAllExperiments();


      this.lastError =
        null;


      return experiments;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      return [];

    }

  }



  async saveExperiment(
    experiment
  ) {

    try {

      const saved =
        await saveExperiment(
          experiment
        );


      this.lastError =
        null;


      return saved;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  getExperiment(
    id
  ) {

    try {

      const experiment =
        getExperiment(
          id
        );


      this.lastError =
        null;


      return experiment;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      return null;

    }

  }



  async deleteExperiment(
    id
  ) {

    try {

      const result =
        await deleteExperiment(
          id
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      return false;

    }

  }



  async updateExperiment(
    id,
    updater
  ) {

    try {

      const result =
        await updateExperiment(
          id,
          updater
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     STATUS
  ======================================================= */


  async setStatus(
    id,
    status
  ) {

    try {

      const result =
        await setExperimentStatus(
          id,
          status
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     ANALYSIS
  ======================================================= */


  async attachAnalysis(
    id,
    analysis
  ) {

    try {

      const result =
        await attachAnalysis(
          id,
          analysis
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     PREDICTION
  ======================================================= */


  async attachPrediction(
    id,
    prediction
  ) {

    try {

      const result =
        await attachPrediction(
          id,
          prediction
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     PERFORMANCE
  ======================================================= */


  async attachPerformance(
    id,
    performance
  ) {

    try {

      const result =
        await attachActualPerformance(
          id,
          performance
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     COMPARISON
  ======================================================= */


  async comparePredictionToReality(
    id
  ) {

    try {

      const result =
        await comparePredictionToReality(
          id
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     CONTEXT
  ======================================================= */


  async addContext(
    id,
    variable
  ) {

    try {

      const result =
        await addContextVariable(
          id,
          variable
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     NOTES
  ======================================================= */


  async addNote(
    id,
    note
  ) {

    try {

      const result =
        await addUserNote(
          id,
          note
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     LEARNING
  ======================================================= */


  async addLearningObservation(
    id,
    observation
  ) {

    try {

      const result =
        await addLearningObservation(
          id,
          observation
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  async addLearningHypothesis(
    id,
    hypothesis
  ) {

    try {

      const result =
        await addLearningHypothesis(
          id,
          hypothesis
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  async addLearningPattern(
    id,
    pattern
  ) {

    try {

      const result =
        await addLearningPattern(
          id,
          pattern
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     CONVERSATION
  ======================================================= */


  async addConversationMessage(
    id,
    message
  ) {

    try {

      const result =
        await addConversationMessage(
          id,
          message
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  async addExtractedData(
    id,
    data
  ) {

    try {

      const result =
        await addExtractedConversationData(
          id,
          data
        );


      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      throw this.lastError;

    }

  }



  /* =======================================================
     SUMMARY
  ======================================================= */


  getSummary() {

    try {

      const summary =
        getExperimentSummary();


      this.lastError =
        null;


      return summary;

    } catch (error) {

      this.lastError =
        normalizeError(error);


      return {

        total: 0,

        draft: 0,

        analyzed: 0,

        published: 0,

        learning: 0

      };

    }

  }



  /* =======================================================
     CAPABILITIES
  ======================================================= */


  getCapabilities() {

    return {

      createExperiment:
        true,

      validateExperiment:
        true,

      getAllExperiments:
        true,

      saveExperiment:
        true,

      getExperiment:
        true,

      deleteExperiment:
        true,

      updateExperiment:
        true,

      setStatus:
        true,

      attachAnalysis:
        true,

      attachPrediction:
        true,

      attachPerformance:
        true,

      comparePredictionToReality:
        true,

      addContext:
        true,

      addNote:
        true,

      learning:
        true,

      conversation:
        true,

      summary:
        true,

      asyncOperations:
        true,

      accountIsolation:
        true,

      localFirst:
        true

    };

  }



  /* =======================================================
     STATE
  ======================================================= */


  isReady() {

    return true;

  }



  getLastError() {

    return this.lastError;

  }



  resetError() {

    this.lastError =
      null;


    return this;

  }

}



/* =========================================================
   FACTORY
========================================================= */


export function createEngineAdapter(
  options = {}
) {

  return new EngineAdapter(
    options
  );

}



export default EngineAdapter;
