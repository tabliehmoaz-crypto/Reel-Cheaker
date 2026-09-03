/*
  MTI — Intelligence Context
  --------------------------

  يبني السياق الذي يحتاجه Local Intelligence
  قبل اتخاذ أي استنتاج.

  مصادر المعرفة:

  1. Scientific Knowledge
  2. MTI Knowledge Base
  3. Global Anonymous Learning
  4. Global Benchmarks
  5. Evidence Policy

  هذا الملف لا يحلل الفيديو.
  ولا يخزن بيانات المستخدم.
  ولا يتصل بأي API خارجي.

  Local-First:
  true
*/

import {
  knowledgeService
} from "./MTIKnowledgeService.js";

import {
  MTIKnowledgeBase
} from "../knowledge/MTIKnowledgeBase.js";

import "../knowledge/MTIKnowledgeData.js";


const CONTEXT_VERSION =
  "2.0.0";


/* =========================================================
   INTELLIGENCE CONTEXT
========================================================= */

export class MTIIntelligenceContext {

  constructor(options = {}) {

    this.version =
      options.version ||
      CONTEXT_VERSION;

    this.knowledge =
      options.knowledge ||
      knowledgeService;

    this.generalKnowledge =
      options.generalKnowledge ||
      MTIKnowledgeBase;

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

      /* ---------------------------------------------------
         EXISTING KNOWLEDGE SERVICE
      --------------------------------------------------- */

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


      /* ---------------------------------------------------
         GENERAL MTI KNOWLEDGE BASE
      --------------------------------------------------- */

      const generalKnowledgeSnapshot =
        this.generalKnowledge
          .getKnowledgeSnapshot();


      /* ---------------------------------------------------
         RELEVANT GENERAL KNOWLEDGE
      --------------------------------------------------- */

      let relevantGeneralKnowledge = [];

      try {

        const query =
          this.buildKnowledgeQuery(
            analysis
          );

        relevantGeneralKnowledge =
          this.generalKnowledge
            .searchKnowledge(
              query,
              {
                limit:
                  options.knowledgeLimit ||
                  25
              }
            );

      } catch (error) {

        /*
          Knowledge retrieval is optional.
          It must never destroy the core analysis.
        */

        relevantGeneralKnowledge = [];

      }


      /* ---------------------------------------------------
         BENCHMARKS
      --------------------------------------------------- */

      const benchmarks =
        options.includeBenchmarks === false
          ? null
          : this.knowledge
              .getBenchmarks();


      /* ---------------------------------------------------
         FINAL CONTEXT
      --------------------------------------------------- */

      return {

        version:
          this.version,

        generatedAt:
          new Date()
            .toISOString(),


        /* -----------------------------------------------
           ANALYSIS
        ----------------------------------------------- */

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
            null,

          storytelling:
            analysis.storytelling ||
            null,

          psychology:
            analysis.psychology ||
            null,

          audio:
            analysis.audio ||
            null,

          text:
            analysis.text ||
            null

        },


        /* -----------------------------------------------
           EXISTING KNOWLEDGE SYSTEM
        ----------------------------------------------- */

        knowledge:
          knowledgeContext,


        /* -----------------------------------------------
           NEW GENERAL KNOWLEDGE BRAIN
        ----------------------------------------------- */

        generalKnowledge: {

          version:
            generalKnowledgeSnapshot.version,

          relevant:
            relevantGeneralKnowledge,

          categories:
            generalKnowledgeSnapshot.categories,

          rules:
            generalKnowledgeSnapshot.rules,

          principles:
            generalKnowledgeSnapshot.principles,

          patterns:
            generalKnowledgeSnapshot.patterns,

          evidence:
            generalKnowledgeSnapshot.evidence,

          metadata:
            generalKnowledgeSnapshot.metadata

        },


        /* -----------------------------------------------
           BENCHMARKS
        ----------------------------------------------- */

        benchmarks,


        /* -----------------------------------------------
           EVIDENCE RULES
        ----------------------------------------------- */

        rules: {

          distinguishEvidence:
            true,

          distinguishInference:
            true,

          distinguishHypothesis:
            true,

          doNotTreatHeuristicsAsFacts:
            true,

          prioritizeObservedAccountData:
            true,

          generalKnowledgeIsNotPersonalMemory:
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
     BUILD KNOWLEDGE QUERY
  ======================================================= */

  buildKnowledgeQuery(
    analysis = {}
  ) {

    const parts = [];


    if (analysis.hook) {
      parts.push(
        "hook",
        "attention",
        "curiosity"
      );
    }


    if (analysis.pacing) {
      parts.push(
        "pacing",
        "retention"
      );
    }


    if (analysis.visual) {
      parts.push(
        "visual",
        "attention"
      );
    }


    if (
      analysis.psychology ||
      analysis.emotion
    ) {

      parts.push(
        "psychology",
        "emotion",
        "cognition"
      );

    }


    if (analysis.storytelling) {

      parts.push(
        "storytelling",
        "narrative",
        "retention"
      );

    }


    if (analysis.audio) {

      parts.push(
        "audio"
      );

    }


    if (analysis.text) {

      parts.push(
        "text",
        "cognition"
      );

    }


    if (analysis.idea) {

      parts.push(
        "idea",
        "curiosity",
        "content"
      );

    }


    if (!parts.length) {

      return [
        "psychology",
        "attention",
        "hooks",
        "retention",
        "storytelling",
        "pacing",
        "visual",
        "curiosity",
        "cognition"
      ].join(" ");

    }


    return [
      ...new Set(parts)
    ].join(" ");

  }


  /* =======================================================
     GET RELEVANT KNOWLEDGE
  ======================================================= */

  getRelevantKnowledge(
    analysis = {}
  ) {

    const legacyKnowledge =
      this.knowledge
        .findRelevantKnowledge(
          analysis
        );


    let generalKnowledge = [];

    try {

      generalKnowledge =
        this.generalKnowledge
          .searchKnowledge(
            this.buildKnowledgeQuery(
              analysis
            ),
            {
              limit: 25
            }
          );

    } catch (error) {

      generalKnowledge = [];

    }


    return {

      scientific:
        legacyKnowledge || [],

      general:
        generalKnowledge

    };

  }


  /* =======================================================
     GET BENCHMARKS
  ======================================================= */

  getBenchmarks() {

    return this.knowledge
      .getBenchmarks();

  }


  /* =======================================================
     GET KNOWLEDGE BASE
  ======================================================= */

  getKnowledgeBase() {

    return this.generalKnowledge
      .getKnowledgeSnapshot();

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
        "قاعدة عملية وليست حقيقة علمية.",

      personal:
        "إشارة مستندة إلى نتائج الحساب نفسه.",

      general:
        "معرفة عامة لا تمثل نتيجة هذا الحساب."

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
        "function" &&

      this.generalKnowledge &&

      typeof this.generalKnowledge
        .getKnowledgeSnapshot ===
        "function" &&

      typeof this.generalKnowledge
        .searchKnowledge ===
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

      knowledgeBase:
        this.generalKnowledge
          ?.version ||
        null,

      localFirst:
        true,

      externalAI:
        false,

      externalAPI:
        false,

      accountIsolation:
        true,

      personalMemorySeparated:
        true,

      capabilities: [

        "scientific-context",

        "general-knowledge",

        "knowledge-retrieval",

        "global-context",

        "benchmarks",

        "evidence-policy",

        "analysis-context",

        "privacy-safe-context",

        "personal-memory-separation"

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
