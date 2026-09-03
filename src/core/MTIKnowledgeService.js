/*
  MTI — Knowledge Service
  -----------------------

  الطبقة التي تجمع بين:

  1. المعرفة العلمية الثابتة
     IntelligenceKnowledge

  2. التعلم الجماعي المجهّل
     MTIGlobalLearningService

  وتحول الاثنين إلى Knowledge Snapshot
  قابل للاستخدام من محركات MTI.

  مهم:
  - لا Gemini
  - لا Claude
  - لا API خارجي
  - لا بيانات مستخدم خاصة
  - لا فيديوهات خام

  Local-First:
  true
*/


import {
  KNOWLEDGE_BASE,
  EVIDENCE_LEVELS,
  getKnowledgeById,
  getKnowledgeByDomain,
  getKnowledgeByMechanism,
  getStrongEvidence,
  getModerateEvidence,
  getHeuristics,
  getKnowledgeSummary
} from "../ai/IntelligenceKnowledge.js";


import {
  globalLearningService
} from "./MTIGlobalLearningService.js";



const KNOWLEDGE_SERVICE_VERSION =
  "1.0.0";



/* =========================================================
   KNOWLEDGE SERVICE
========================================================= */


export class MTIKnowledgeService {


  constructor(
    options = {}
  ) {

    this.version =
      options.version ||
      KNOWLEDGE_SERVICE_VERSION;


    this.globalLearning =
      options.globalLearning ||
      globalLearningService;


    this.lastError =
      null;

  }



  /* =======================================================
     STATIC KNOWLEDGE
  ======================================================= */


  getScientificKnowledge() {

    return KNOWLEDGE_BASE;

  }



  getKnowledgeById(
    id
  ) {

    return getKnowledgeById(
      id
    );

  }



  getKnowledgeByDomain(
    domain
  ) {

    return getKnowledgeByDomain(
      domain
    );

  }



  getKnowledgeByMechanism(
    mechanism
  ) {

    return getKnowledgeByMechanism(
      mechanism
    );

  }



  getStrongEvidence() {

    return getStrongEvidence();

  }



  getModerateEvidence() {

    return getModerateEvidence();

  }



  getHeuristics() {

    return getHeuristics();

  }



  getKnowledgeSummary() {

    return getKnowledgeSummary();

  }



  /* =======================================================
     GLOBAL LEARNING
  ======================================================= */


  getGlobalAggregates() {

    return this.globalLearning
      .buildAggregates();

  }



  getGlobalPatterns() {

    return this.globalLearning
      .getPatterns();

  }



  getGlobalKnowledge() {

    return this.globalLearning
      .getKnowledgeSnapshot();

  }



  /* =======================================================
     COMBINED KNOWLEDGE
  ======================================================= */


  getSnapshot() {

    this.lastError =
      null;


    try {

      const scientific =
        this.getScientificKnowledge();


      const global =
        this.getGlobalKnowledge();


      return {

        version:
          this.version,

        generatedAt:
          new Date()
            .toISOString(),

        scientific: {

          version:
            "1.0.0",

          knowledge:
            scientific,

          summary:
            this.getKnowledgeSummary()

        },

        global: {

          sampleSize:
            global.sampleSize,

          aggregates:
            global.aggregates,

          patterns:
            global.patterns

        },

        evidencePolicy: {

          strong:
            EVIDENCE_LEVELS
              .STRONG,

          moderate:
            EVIDENCE_LEVELS
              .MODERATE,

          heuristic:
            EVIDENCE_LEVELS
              .HEURISTIC

        },

        localFirst:
          true,

        externalAI:
          false,

        externalAPI:
          false

      };

    } catch (error) {

      this.lastError =
        error;

      throw error;

    }

  }



  /* =======================================================
     GET KNOWLEDGE FOR ANALYSIS
  ======================================================= */


  getAnalysisKnowledge(
    options = {}
  ) {

    const snapshot =
      this.getSnapshot();


    let knowledge =
      snapshot
        .scientific
        .knowledge;


    if (
      options.domain
    ) {

      knowledge =
        this.getKnowledgeByDomain(
          options.domain
        );

    }


    if (
      options.mechanism
    ) {

      knowledge =
        this.getKnowledgeByMechanism(
          options.mechanism
        );

    }


    return {

      knowledge,

      global:

        options.includeGlobal === false
          ? null
          : snapshot.global,

      evidencePolicy:
        snapshot.evidencePolicy,

      version:
        this.version

    };

  }



  /* =======================================================
     FIND RELEVANT KNOWLEDGE
  ======================================================= */


  findRelevantKnowledge(
    signals = {}
  ) {

    const matches = [];


    const text =
      JSON.stringify(
        signals
      )
        .toLowerCase();


    for (
      const item
      of KNOWLEDGE_BASE
    ) {

      const searchable =
        [

          item.id,

          item.domain,

          item.mechanism,

          item.principle,

          item.description,

          item.viewerEffect

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      if (
        text.includes(
          item.id
            .toLowerCase()
        )
      ) {

        matches.push(
          item
        );

        continue;

      }


      if (
        text.includes(
          item.mechanism
            ?.toLowerCase()
        )
      ) {

        matches.push(
          item
        );

        continue;

      }


      if (
        text.includes(
          item.domain
            ?.toLowerCase()
        )
      ) {

        matches.push(
          item
        );

      }

    }


    return this.uniqueKnowledge(
      matches
    );

  }



  /* =======================================================
     UNIQUE KNOWLEDGE
  ======================================================= */


  uniqueKnowledge(
    items
  ) {

    const seen =
      new Set();


    return items.filter(
      item => {

        if (
          !item?.id
        ) {

          return false;

        }


        if (
          seen.has(
            item.id
          )
        ) {

          return false;

        }


        seen.add(
          item.id
        );


        return true;

      }
    );

  }



  /* =======================================================
     BUILD ANALYSIS CONTEXT
  ======================================================= */


  buildAnalysisContext(
    signals = {},
    options = {}
  ) {

    const relevant =
      this.findRelevantKnowledge(
        signals
      );


    const global =
      options.includeGlobal === false
        ? null
        : this.getGlobalKnowledge();


    return {

      version:
        this.version,

      relevantKnowledge:
        relevant,

      scientificKnowledge:
        options.includeScientific === false
          ? []
          : this.getScientificKnowledge(),

      globalKnowledge:
        global,

      evidencePolicy: {

        strong:
          EVIDENCE_LEVELS
            .STRONG,

        moderate:
          EVIDENCE_LEVELS
            .MODERATE,

        heuristic:
          EVIDENCE_LEVELS
            .HEURISTIC

      }

    };

  }



  /* =======================================================
     BENCHMARK
  ======================================================= */


  getBenchmarks() {

    const global =
      this.getGlobalKnowledge();


    return {

      sampleSize:
        global.sampleSize,

      averages:
        global.aggregates
          ?.averages ||
        {},

      patterns:
        global.patterns ||
        []

    };

  }



  /* =======================================================
     STATUS
  ======================================================= */


  isReady() {

    return (

      Array.isArray(
        KNOWLEDGE_BASE
      ) &&

      this.globalLearning &&
      typeof this.globalLearning
        .getKnowledgeSnapshot ===
        "function"

    );

  }



  /* =======================================================
     INFO
  ======================================================= */


  getInfo() {

    return {

      name:
        "MTIKnowledgeService",

      version:
        this.version,

      knowledgeVersion:
        "1.0.0",

      globalLearningVersion:
        this.globalLearning
          ?.version ||
        null,

      localFirst:
        true,

      externalAI:
        false,

      externalAPI:
        false,

      scientificKnowledge:
        Array.isArray(
          KNOWLEDGE_BASE
        )
          ? KNOWLEDGE_BASE.length
          : 0,

      capabilities: [

        "scientific-knowledge",

        "global-learning",

        "knowledge-snapshot",

        "analysis-context",

        "relevance-matching",

        "benchmarks",

        "evidence-levels"

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


export function createKnowledgeService(
  options = {}
) {

  return new MTIKnowledgeService(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const knowledgeService =
  new MTIKnowledgeService();



export default knowledgeService;
