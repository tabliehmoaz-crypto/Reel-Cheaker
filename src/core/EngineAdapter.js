/*
  MTI — Engine Adapter
  Bridge between Core and the existing ExperimentEngine.

  The existing ExperimentEngine is a module of named functions,
  not a class. This adapter provides one stable interface for Core.
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


function normalizeError(error) {

  if (error instanceof Error) {
    return error;
  }

  return new Error(
    error?.message ||
    String(error)
  );

}


export class EngineAdapter {

  constructor(options = {}) {

    this.name =
      options.name ||
      "ExperimentEngine";

    this.version =
      options.version ||
      "1.0.0";

    this.lastError =
      null;

  }


  getEngineInfo() {

    try {

      return getEngineInfo();

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


  createExperiment(data = {}) {

    try {

      const experiment =
        createExperiment(data);

      this.lastError =
        null;

      return experiment;

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  validateExperiment(experiment) {

    return validateExperiment(
      experiment
    );

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


  saveExperiment(experiment) {

    try {

      const saved =
        saveExperiment(
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


  getExperiment(id) {

    try {

      return getExperiment(id);

    } catch (error) {

      this.lastError =
        normalizeError(error);

      return null;

    }

  }


  deleteExperiment(id) {

    try {

      return deleteExperiment(
        id
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      return false;

    }

  }


  updateExperiment(
    id,
    updater
  ) {

    try {

      return updateExperiment(
        id,
        updater
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  setStatus(
    id,
    status
  ) {

    try {

      return setExperimentStatus(
        id,
        status
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  attachAnalysis(
    id,
    analysis
  ) {

    try {

      return attachAnalysis(
        id,
        analysis
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  attachPrediction(
    id,
    prediction
  ) {

    try {

      return attachPrediction(
        id,
        prediction
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  attachPerformance(
    id,
    performance
  ) {

    try {

      return attachActualPerformance(
        id,
        performance
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  comparePredictionToReality(
    id
  ) {

    try {

      return comparePredictionToReality(
        id
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addContext(
    id,
    variable
  ) {

    try {

      return addContextVariable(
        id,
        variable
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addNote(
    id,
    note
  ) {

    try {

      return addUserNote(
        id,
        note
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addLearningObservation(
    id,
    observation
  ) {

    try {

      return addLearningObservation(
        id,
        observation
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addLearningHypothesis(
    id,
    hypothesis
  ) {

    try {

      return addLearningHypothesis(
        id,
        hypothesis
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addLearningPattern(
    id,
    pattern
  ) {

    try {

      return addLearningPattern(
        id,
        pattern
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addConversationMessage(
    id,
    message
  ) {

    try {

      return addConversationMessage(
        id,
        message
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  addExtractedData(
    id,
    data
  ) {

    try {

      return addExtractedConversationData(
        id,
        data
      );

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  getSummary() {

    try {

      return getExperimentSummary();

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


  getCapabilities() {

    return {

      createExperiment: true,

      validateExperiment: true,

      getAllExperiments: true,

      saveExperiment: true,

      getExperiment: true,

      deleteExperiment: true,

      updateExperiment: true,

      setStatus: true,

      attachAnalysis: true,

      attachPrediction: true,

      attachPerformance: true,

      comparePredictionToReality: true,

      addContext: true,

      addNote: true,

      learning: true,

      conversation: true,

      summary: true

    };

  }


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


export function createEngineAdapter(
  options = {}
) {

  return new EngineAdapter(
    options
  );

}


export default EngineAdapter;
