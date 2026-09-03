/*
  MTI — Engine Adapter
  Bridge between Core and existing analysis engines.

  Responsibility:
  - Keep Core independent from engine implementation.
  - Normalize different engine APIs.
  - Support ExperimentEngine and reel-engine.
  - Prevent engine-specific logic from leaking into Core.
*/

import ExperimentEngine from "../engine/ExperimentEngine.js";
import ReelEngine from "../engine/reel-engine.js";


function isFunction(value) {
  return typeof value === "function";
}


function normalizeError(error) {
  if (!error) {
    return new Error("Unknown engine error.");
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(
    error.message || String(error)
  );
}


function resolveMethod(engine, methods = []) {

  if (!engine) {
    return null;
  }

  for (const method of methods) {
    if (isFunction(engine[method])) {
      return engine[method].bind(engine);
    }
  }

  return null;
}


export class EngineAdapter {

  constructor(options = {}) {

    this.engine = null;

    this.engineName =
      options.engineName || "auto";

    this.engineVersion =
      options.engineVersion || "2.0.0";

    this.initialized = false;

    this.lastError = null;

    this.lastResult = null;

    if (options.engine) {
      this.setEngine(options.engine);
    }

  }


  setEngine(engine) {

    if (!engine) {
      throw new Error(
        "MTI EngineAdapter: engine is required."
      );
    }

    this.engine = engine;

    this.initialized = true;

    this.lastError = null;

    return this;

  }


  createExperimentEngine(options = {}) {

    try {

      const engine =
        new ExperimentEngine(options);

      this.setEngine(engine);

      this.engineName =
        "ExperimentEngine";

      return engine;

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  createReelEngine(options = {}) {

    try {

      const engine =
        new ReelEngine(options);

      this.setEngine(engine);

      this.engineName =
        "reel-engine";

      return engine;

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  getEngine() {

    return this.engine;

  }


  isReady() {

    return Boolean(
      this.engine &&
      this.initialized
    );

  }


  getCapabilities() {

    if (!this.engine) {

      return {
        ready: false,
        methods: []
      };

    }


    const possibleMethods = [

      "analyze",

      "analyse",

      "run",

      "process",

      "execute",

      "analyzeReel",

      "analyzeVideo",

      "processVideo",

      "processReel"

    ];


    const methods =
      possibleMethods.filter(
        (method) =>
          isFunction(
            this.engine[method]
          )
      );


    return {

      ready: true,

      engine:
        this.engineName,

      methods

    };

  }


  async process(input = {}, context = {}) {

    if (!this.engine) {

      throw new Error(
        "MTI EngineAdapter: no engine configured."
      );

    }


    const processMethod =
      resolveMethod(
        this.engine,
        [
          "process",
          "processVideo",
          "processReel"
        ]
      );


    if (!processMethod) {

      /*
        Some engines perform extraction
        and analysis in a single operation.

        In that case Core can pass the
        original input directly to analyze().
      */

      return input;

    }


    try {

      const result =
        await processMethod(
          input,
          context
        );


      this.lastResult =
        result;

      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  async analyze(input = {}, context = {}) {

    if (!this.engine) {

      throw new Error(
        "MTI EngineAdapter: no engine configured."
      );

    }


    const analyzeMethod =
      resolveMethod(
        this.engine,
        [
          "analyze",
          "analyse",
          "analyzeReel",
          "analyzeVideo",
          "run",
          "execute"
        ]
      );


    if (!analyzeMethod) {

      throw new Error(
        "MTI EngineAdapter: the configured engine does not expose a supported analysis method."
      );

    }


    try {

      const result =
        await analyzeMethod(
          input,
          context
        );


      this.lastResult =
        result;

      this.lastError =
        null;


      return result;

    } catch (error) {

      this.lastError =
        normalizeError(error);

      throw this.lastError;

    }

  }


  async run(input = {}, context = {}) {

    return this.analyze(
      input,
      context
    );

  }


  async execute(input = {}, context = {}) {

    return this.analyze(
      input,
      context
    );

  }


  async analyzeVideo(video, options = {}) {

    return this.analyze(
      {
        video,
        ...options
      },
      options
    );

  }


  async analyzeReel(reel, options = {}) {

    return this.analyze(
      {
        reel,
        ...options
      },
      options
    );

  }


  getLastResult() {

    return this.lastResult;

  }


  getLastError() {

    return this.lastError;

  }


  reset() {

    this.lastResult = null;

    this.lastError = null;

    return this;

  }


  getInfo() {

    return {

      name:
        "MTI Engine Adapter",

      version:
        this.engineVersion,

      engine:
        this.engineName,

      ready:
        this.isReady(),

      capabilities:
        this.getCapabilities()

    };

  }

}


export function createEngineAdapter(options = {}) {

  return new EngineAdapter(options);

}


export default EngineAdapter;
