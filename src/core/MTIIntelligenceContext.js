/*
  MTI — Intelligence Context
  --------------------------

  يبني السياق الذي يحتاجه Local Intelligence
  قبل اتخاذ أي استنتاج.

  مصادر المعرفة:

  1. Scientific Knowledge
  2. Global Anonymous Learning
  3. Global Benchmarks
  4. Evidence Policy

  هذا الملف لا يحلل الفيديو.
  ولا يخزن بيانات المستخدم.
  ولا يتصل بأي API خارجي.

  Local-First:
  true
*/


import {
  knowledgeService
} from "./MTIKnowledgeService.js";



const CONTEXT_VERSION =
  "1.0.0";



/* =========================================================
   INTELLIGENCE CONTEXT
========================================================= */


export class MTIIntelligenceContext {


  constructor(
    options = {}
  ) {

    this.version =
      options.version ||
      CONTEXT_VERSION;


    this.knowledge =
      options.knowledge ||
      knowledgeService;


    this.lastError =
      null;

  }



  /* =======================================================
     BUILD CONTEXT
  ======================================================= */


  build(
    analysis = {},
    options = {}
  ) {

    this.lastError =
      null;


    try {

      const knowledgeContext =
        this.knowledge
          .buildAnalysisContext(
            analysis,
            {
              includeGlobal:
                options.includeGlobal !== false,

              includeScientific:
                options.includeScientific !== false
            }
          );


      const benchmarks =
        options.includeBenchmarks === false
          ? null
          : this.knowledge
              .getBenchmarks();


      return {

        version:
          this.version,

        generatedAt:
          new Date()
            .toISOString(),

        analysis: {

          scores:
            analysis.scores ||
            {},

          overall:
            analysis.overall ??
            null,

          hook:
            analysis.hook ||
            null,

          pacing:
            analysis.pacing ||
            null,

          visual:
            analysis.visual ||
            null,

          technical:
            analysis.technical ||
            null,

          speech:
            analysis.speech ||
            null,

          idea:
            analysis.idea ||
            null,

          dropOff:
            analysis.dropOff ||
            null

        },

        knowledge:
          knowledgeContext,

        benchmarks,

        rules: {

          distinguishEvidence:
            true,

          distinguishInference:
            true,

          distinguishHypothesis:
            true,

          doNotTreatHeuristicsAsFacts:
            true,

          doNotExposePrivateData:
            true

        }

      };

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     GET RELEVANT KNOWLEDGE
  ======================================================= */


  getRelevantKnowledge(
    analysis = {}
  ) {

    return this.knowledge
      .findRelevantKnowledge(
        analysis
      );

  }



  /* =======================================================
     GET BENCHMARKS
  ======================================================= */


  getBenchmarks() {

    return this.knowledge
      .getBenchmarks();

  }



  /* =======================================================
     GET EVIDENCE POLICY
  ======================================================= */


  getEvidencePolicy() {

    return {

      strong:
        "يمكن الاعتماد عليه كدليل قوي.",

      moderate:
        "يدعم الاستنتاج لكنه لا يثبت السببية.",

      heuristic:
        "قاعدة عملية وليست حقيقة علمية."

    };

  }



  /* =======================================================
     CHECK READINESS
  ======================================================= */


  isReady() {

    return (

      this.knowledge &&

      typeof this.knowledge
        .buildAnalysisContext ===
        "function" &&

      typeof this.knowledge
        .getBenchmarks ===
        "function"

    );

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIIntelligenceContext",

      version:
        this.version,

      knowledgeService:
        this.knowledge
          ?.getInfo?.()
          ?.name ||
        null,

      localFirst:
        true,

      externalAI:
        false,

      externalAPI:
        false,

      capabilities: [

        "scientific-context",

        "global-context",

        "benchmarks",

        "evidence-policy",

        "analysis-context",

        "privacy-safe-context"

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


export function createIntelligenceContext(
  options = {}
) {

  return new MTIIntelligenceContext(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const intelligenceContext =
  new MTIIntelligenceContext();



export default intelligenceContext;
