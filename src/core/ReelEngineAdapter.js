/*
  MTI — Reel Engine Adapter
  -------------------------
  Stable Core interface for the local Reel Analysis Engine.

  Responsibility:
  - Connect MTI Core with reel-engine.js
  - Keep Core independent from engine internals
  - Normalize engine access
  - Handle engine errors without hiding them

  The adapter does NOT:
  - Analyze video itself
  - Call Gemini / Claude
  - Manage UI
  - Manage experiment lifecycle
*/

import {
  analyzeReel
} from "../engine/reel-engine.js";


export class ReelEngineAdapter {

  constructor(
    options = {}
  ) {

    this.name =
      options.engineName ||
      "reel-engine";


    this.version =
      options.version ||
      "3.0-local-first";


    this.lastError =
      null;


    this.ready =
      true;

  }


  /* ===================================================
     ENGINE INFO
  =================================================== */

  getEngineInfo() {

    return {

      name:
        this.name,

      version:
        this.version,

      type:
        "local-analysis-engine",

      status:
        this.ready
          ? "ready"
          : "not-ready",

      capabilities: [

        "video-validation",

        "video-metadata",

        "frame-extraction",

        "visual-analysis",

        "pacing-analysis",

        "hook-analysis",

        "technical-analysis",

        "speech-analysis",

        "idea-analysis",

        "drop-off-detection",

        "diagnosis",

        "recommendations"

      ]

    };

  }


  /* ===================================================
     ANALYZE
  =================================================== */

  async analyze(
    file,
    options = {}
  ) {

    this.resetError();


    try {

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


      const result =
        await analyzeReel(
          file,
          options
        );


      if (!result) {

        throw new Error(
          "محرك التحليل لم يُرجع نتيجة."
        );

      }


      return result;

    } catch (error) {

      this.lastError =
        error;


      throw error;

    }

  }


  /* ===================================================
     READINESS
  =================================================== */

  isReady() {

    return (
      this.ready === true
    );

  }


  /* ===================================================
     ERROR STATE
  =================================================== */

  getLastError() {

    return this.lastError;

  }


  resetError() {

    this.lastError =
      null;

  }


  /* ===================================================
     CAPABILITIES
  =================================================== */

  getCapabilities() {

    return this
      .getEngineInfo()
      .capabilities;

  }


  /* ===================================================
     HEALTH
  =================================================== */

  healthCheck() {

    return {

      ready:
        this.isReady(),

      engine:
        this.name,

      version:
        this.version,

      error:
        this.lastError
          ? this.lastError.message
          : null

    };

  }

}


/* =====================================================
   FACTORY
===================================================== */

export function createReelEngineAdapter(
  options = {}
) {

  return new ReelEngineAdapter(
    options
  );

}


/* =====================================================
   DEFAULT
===================================================== */

export default ReelEngineAdapter;
