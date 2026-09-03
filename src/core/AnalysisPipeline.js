/*
  MTI — Analysis Pipeline
  Core execution pipeline

  Responsibility:
  - Connect AnalysisJob with the analysis engine.
  - Keep execution order predictable.
  - Keep AI / UI / integrations outside the pipeline.
  - Preserve successful analysis when optional stages fail.
*/

import AnalysisJob from "./AnalysisJob.js";


export class AnalysisPipeline {

  constructor(options = {}) {

    this.processor =
      options.processor || null;

    this.analyzer =
      options.analyzer || null;

    this.recommendations =
      options.recommendations || null;

    this.name =
      options.name || "MTI Analysis Pipeline";

    this.version =
      options.version || "2.0.0";

  }


  configure(options = {}) {

    if (options.processor !== undefined) {
      this.processor = options.processor;
    }

    if (options.analyzer !== undefined) {
      this.analyzer = options.analyzer;
    }

    if (options.recommendations !== undefined) {
      this.recommendations =
        options.recommendations;
    }

    if (options.name !== undefined) {
      this.name = options.name;
    }

    if (options.version !== undefined) {
      this.version = options.version;
    }

    return this;

  }


  validate() {

    const errors = [];

    if (typeof this.processor !== "function") {
      errors.push(
        "Analysis processor is not configured."
      );
    }

    if (typeof this.analyzer !== "function") {
      errors.push(
        "Analysis analyzer is not configured."
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };

  }


  async execute(input = {}, options = {}) {

    const job =
      options.job instanceof AnalysisJob
        ? options.job
        : new AnalysisJob({
            accountId:
              options.accountId || null
          });


    const processor =
      options.processor !== undefined
        ? options.processor
        : this.processor;


    const analyzer =
      options.analyzer !== undefined
        ? options.analyzer
        : this.analyzer;


    const recommendations =
      options.recommendations !== undefined
        ? options.recommendations
        : this.recommendations;


    /*
      A pipeline can execute with different
      processors/analyzers for different engines.

      The actual engine implementation is injected
      from outside this layer.
    */

    return job.run({

      input,

      accountId:
        options.accountId || null,

      processor,

      analyzer,

      recommendations,

      performance:
        options.performance || null,

      comparison:
        options.comparison || null,

      learning:
        options.learning || null

    });

  }


  async executeWithJob(job, input = {}, options = {}) {

    if (!(job instanceof AnalysisJob)) {

      throw new Error(
        "executeWithJob requires an AnalysisJob instance."
      );

    }


    return this.execute(
      input,
      {
        ...options,
        job
      }
    );

  }


  createJob(accountId = null) {

    return new AnalysisJob({
      accountId
    });

  }


  getInfo() {

    return {

      name: this.name,

      version: this.version,

      processorConfigured:
        typeof this.processor === "function",

      analyzerConfigured:
        typeof this.analyzer === "function",

      recommendationsConfigured:
        typeof this.recommendations === "function"

    };

  }

}


export function createAnalysisPipeline(options = {}) {

  return new AnalysisPipeline(options);

}


export default AnalysisPipeline;
