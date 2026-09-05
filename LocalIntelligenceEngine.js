/*
  MTI — Local Intelligence Engine
  --------------------------------
  Local-first reasoning engine.

  هذا المحرك:
  - لا يستخدم Gemini
  - لا يستخدم Claude
  - لا يستخدم أي API خارجي
  - لا يقرأ Firebase
  - لا يدير UI

  يأخذ نتائج التحليل المحلي للفيديو
  ويحوّلها إلى استدلالات عن:

  - Attention
  - Curiosity
  - Cognition
  - Emotion
  - Narrative
  - Pacing
  - Viewer Journey
  - Drop-off Risks
  - Continuation Drivers
  - Recommendations
  - Prediction

  مهم:
  هذا المحرك ليس نموذجاً عصبياً مدرّباً.
  هو Local Reasoning Engine مبني على
  Knowledge + Evidence + Signals + Rules.

  الهدف:
  تحويل الإشارات القابلة للقياس إلى
  استنتاجات منضبطة، مع إظهار مستوى الثقة
  والقيود بدلاً من اختراع نتائج غير قابلة للإثبات.

  Knowledge Integration:
  - يستقبل Intelligence Context من MTIAnalysisService
  - يستخدم Scientific Knowledge
  - يستخدم General Knowledge
  - يستخدم Evidence Policy
  - لا يستخدم Global Private Data
*/


import {
  createIntelligenceResult,
  createEvidence,
  createMechanism,
  createViewerDecision,
  createRecommendation
} from "./IntelligenceSchema.js";


import {
  KNOWLEDGE_BASE,
  EVIDENCE_LEVELS
} from "./IntelligenceKnowledge.js";



/* =========================================================
   CONSTANTS
========================================================= */


const ENGINE_VERSION =
  "1.1.0-local-knowledge";


const CONFIDENCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
};


const SCORE_LIMIT = {
  MIN: 0,
  MAX: 100
};



/* =========================================================
   MAIN ENGINE
========================================================= */


export class LocalIntelligenceEngine {


  constructor(options = {}) {

    this.version =
      options.version ||
      ENGINE_VERSION;


    this.knowledge =
      options.knowledge ||
      KNOWLEDGE_BASE;


    this.lastResult =
      null;


    this.lastError =
      null;


    this.ready =
      true;

  }



  /* =======================================================
     PUBLIC API
  ======================================================= */


  async analyze(
    localAnalysis,
    options = {}
  ) {

    this.reset();


    try {

      this.validateInput(
        localAnalysis
      );


      const context =
        this.buildContext(
          localAnalysis,
          options
        );


      const evidence =
        this.collectEvidence(
          context
        );


      const viewerJourney =
        this.buildViewerJourney(
          context
        );


      const attention =
        this.buildAttention(
          context
        );


      const curiosity =
        this.buildCuriosity(
          context
        );


      const cognition =
        this.buildCognition(
          context
        );


      const emotion =
        this.buildEmotion(
          context
        );


      const narrative =
        this.buildNarrative(
          context
        );


      const pacing =
        this.buildPacing(
          context
        );


      const mechanisms =
        this.buildMechanisms(
          context
        );


      const dropOffRisks =
        this.buildDropOffRisks(
          context
        );


      const continuationDrivers =
        this.buildContinuationDrivers(
          context
        );


      const recommendations =
        this.buildRecommendations(
          context,
          {
            attention,
            curiosity,
            cognition,
            emotion,
            narrative,
            pacing,
            dropOffRisks,
            continuationDrivers
          }
        );


      const prediction =
        this.buildPrediction(
          context,
          {
            attention,
            curiosity,
            cognition,
            emotion,
            narrative,
            pacing
          }
        );


      const limitations =
        this.buildLimitations(
          context
        );


      const summary =
        this.buildSummary(
          {
            attention,
            curiosity,
            cognition,
            emotion,
            narrative,
            pacing,
            dropOffRisks,
            continuationDrivers
          }
        );


      const overallConfidence =
        this.calculateOverallConfidence(
          evidence,
          context
        );


      const result =
        createIntelligenceResult({

          version:
            this.version,

          summary,

          overallConfidence,

          viewerJourney,

          attention,

          curiosity,

          cognition,

          emotion,

          narrative,

          pacing,

          visual:
            this.buildVisual(
              context
            ),

          audio:
            this.buildAudio(
              context
            ),

          text:
            this.buildText(
              context
            ),

          mechanisms,

          evidence,

          dropOffRisks,

          continuationDrivers,

          recommendations,

          prediction,

          limitations

        });


      this.lastResult =
        result;


      return result;


    } catch (error) {

      this.lastError =
        error;


      throw error;

    }

  }



  /* =======================================================
     CONTEXT
  ======================================================= */


  buildContext(
    localAnalysis,
    options = {}
  ) {

    const video =
      localAnalysis.video ||
      {};


    const scores =
      localAnalysis.scores ||
      {};


    const hook =
      localAnalysis.hook ||
      {};


    const pacing =
      localAnalysis.pacing ||
      {};


    const visual =
      localAnalysis.visual ||
      {};


    const technical =
      localAnalysis.technical ||
      {};


    const speech =
      localAnalysis.speech ||
      {};


    const idea =
      localAnalysis.idea ||
      {};


    const dropOff =
      localAnalysis.dropOff ||
      {};


    /*
      Intelligence Context is built by
      MTIIntelligenceContext and passed through
      MTIAnalysisService.

      It may contain:
      - scientificKnowledge
      - generalKnowledge
      - relevantKnowledge
      - benchmarks
      - evidencePolicy
      - globalKnowledge

      Global knowledge remains disabled by config
      unless explicitly enabled in the system.
    */

    const intelligenceContext =
      options.context ||
      null;


    const scientificKnowledge =
      intelligenceContext?.scientificKnowledge ||
      [];


    const generalKnowledge =
      intelligenceContext?.generalKnowledge ||
      [];


    const relevantKnowledge =
      intelligenceContext?.relevantKnowledge ||
      [];


    const benchmarks =
      intelligenceContext?.benchmarks ||
      {};


    const evidencePolicy =
      intelligenceContext?.evidencePolicy ||
      null;


    return {

      video,

      scores,

      hook,

      pacing,

      visual,

      technical,

      speech,

      idea,

      dropOff,

      diagnosis:
        localAnalysis.diagnosis ||
        {},

      recommendations:
        localAnalysis.recommendations ||
        [],

      options,

      intelligenceContext,

      scientificKnowledge,

      generalKnowledge,

      relevantKnowledge,

      benchmarks,

      evidencePolicy,

      duration:
        video?.dimensions?.duration ||
        0,

      transcript:
        speech?.text ||
        "",

      speechAvailable:
        speech?.available === true

    };

  }



  /* =======================================================
     EVIDENCE
  ======================================================= */


  collectEvidence(
    context
  ) {

    const evidence = [];


    if (
      context.hook?.score !== undefined
    ) {

      evidence.push(
        createEvidence({

          type: "temporal",

          source: "hook",

          signal:
            "early_attention_signal",

          value:
            context.hook.score,

          confidence:
            this.scoreConfidence(
              context.hook.score
            ),

          description:
            "إشارة قابلة للقياس من سلوك الفيديو في بدايته."

        })
      );

    }


    if (
      context.pacing?.score !== undefined
    ) {

      evidence.push(
        createEvidence({

          type: "temporal",

          source: "pacing",

          signal:
            "temporal_change_density",

          value:
            context.pacing.score,

          confidence:
            this.scoreConfidence(
              context.pacing.score
            ),

          description:
            "قياس محلي لكثافة التغيرات الزمنية."

        })
      );

    }


    if (
      context.visual?.score !== undefined
    ) {

      evidence.push(
        createEvidence({

          type: "visual",

          source: "visual",

          signal:
            "visual_quality_signal",

          value:
            context.visual.score,

          confidence:
            this.scoreConfidence(
              context.visual.score
            ),

          description:
            "إشارة مستخرجة من خصائص الإطارات."

        })
      );

    }


    if (
      context.speechAvailable
    ) {

      evidence.push(
        createEvidence({

          type: "speech",

          source: "speech",

          signal:
            "speech_availability",

          value:
            context.speech.wordCount || 0,

          confidence:
            CONFIDENCE.MEDIUM,

          description:
            "بيانات كلام مستخرجة محلياً عند توفرها."

        })
      );

    }


    if (
      context.dropOff?.points
    ) {

      evidence.push(
        createEvidence({

          type: "temporal",

          source: "dropOff",

          signal:
            "potential_drop_off_points",

          value:
            context.dropOff.points.length,

          confidence:
            CONFIDENCE.MEDIUM,

          description:
            "نقاط خطر محتملة مستنتجة من الإشارات الزمنية."

        })
      );

    }


    /*
      Knowledge evidence

      وجود Knowledge مرتبط لا يعني أن
      المعرفة أثبتت أداء الفيديو.
      لذلك نستخدمها كـ reasoning support
      وليس كـ performance evidence.
    */

    if (
      context.relevantKnowledge.length > 0 ||
      context.scientificKnowledge.length > 0 ||
      context.generalKnowledge.length > 0
    ) {

      evidence.push(
        createEvidence({

          type: "knowledge",

          source:
            "MTI Knowledge System",

          signal:
            "knowledge_supported_reasoning",

          value:
            this.clamp(
              Math.min(
                100,
                (
                  context.relevantKnowledge.length +
                  context.scientificKnowledge.length +
                  context.generalKnowledge.length
                ) * 15
              )
            ),

          confidence:
            this.getKnowledgeConfidence(
              context
            ),

          description:
            "المعرفة تستخدم لتفسير الإشارات المحلية، وليست دليلاً مباشراً على أداء هذا الفيديو."

        })
      );

    }


    return evidence;

  }



  /* =======================================================
     VIEWER JOURNEY
  ======================================================= */


  buildViewerJourney(
    context
  ) {

    const hookScore =
      this.normalize(
        context.hook?.score
      );


    const pacingScore =
      this.normalize(
        context.pacing?.score
      );


    const visualScore =
      this.normalize(
        context.visual?.score
      );


    const ideaScore =
      this.normalize(
        context.idea?.score
      );


    const continueScore =
      this.weightedAverage({

        hook: [hookScore, 0.35],

        pacing: [pacingScore, 0.20],

        visual: [visualScore, 0.20],

        idea: [ideaScore, 0.25]

      });


    return [

      createViewerDecision({

        decision: "continue",

        probability:
          continueScore,

        stage:
          "opening",

        reasons:
          this.reasonList(
            context,
            continueScore
          )

      }),


      createViewerDecision({

        decision: "pause",

        probability:
          this.clamp(
            35 +
            (context.visual?.score || 0) * 0.3
          ),

        stage:
          "middle",

        reasons: [

          "وجود نقطة اهتمام بصرية أو معلوماتية قد يدفع للتوقف."

        ]

      }),


      createViewerDecision({

        decision: "rewatch",

        probability:
          this.calculateRewatchPotential(
            context
          ),

        stage:
          "middle/end",

        reasons: [

          "إعادة المشاهدة تحتاج عادةً إلى قيمة أو غموض أو كثافة معلوماتية كافية."

        ]

      }),


      createViewerDecision({

        decision: "share",

        probability:
          this.calculateSharePotential(
            context
          ),

        stage:
          "end",

        reasons: [

          "قابلية المشاركة لا يمكن إثباتها من الفيديو وحده، لذلك تبقى هذه قراءة احتمالية."

        ]

      }),


      createViewerDecision({

        decision: "save",

        probability:
          this.calculateSavePotential(
            context
          ),

        stage:
          "end",

        reasons: [

          "الحفظ يرتبط غالباً بقيمة يمكن الرجوع إليها أو فائدة واضحة."

        ]

      }),


      createViewerDecision({

        decision: "skip",

        probability:
          this.clamp(
            100 -
            continueScore
          ),

        stage:
          "opening",

        reasons: [

          "ضعف إشارات الاستمرار المبكر يرفع خطر التخطي."

        ]

      })

    ];

  }



  /* =======================================================
     ATTENTION
  ======================================================= */


  buildAttention(
    context
  ) {

    const hook =
      this.normalize(
        context.hook?.score
      );


    const visual =
      this.normalize(
        context.visual?.score
      );


    const pacing =
      this.normalize(
        context.pacing?.score
      );


    const score =
      this.weightedAverage({

        hook: [hook, 0.50],

        visual: [visual, 0.25],

        pacing: [pacing, 0.25]

      });


    return {

      score,

      strength:
        this.classifyScore(
          score
        ),

      signals: [

        "early_visual_change",

        "opening_signal",

        "temporal_change"

      ],

      interpretation:
        this.attentionInterpretation(
          score
        ),

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "attention",
            "hook",
            "novelty",
            "pattern"
          ]
        )

    };

  }



  /* =======================================================
     CURIOSITY
  ======================================================= */


  buildCuriosity(
    context
  ) {

    const ideaScore =
      this.normalize(
        context.idea?.score
      );


    const speechText =
      context.transcript;


    const questionSignal =
      /؟|\?/.test(
        speechText
      )
        ? 75
        : 35;


    const promiseSignal =
      /(رح|سوف|كيف|ليش|لماذا|سر|طريقة|خطأ|الحل|نتيجة)/i
        .test(
          speechText
        )
        ? 75
        : 35;


    const knowledgeGapSignal =
      this.hasKnowledgeMechanism(
        context,
        [
          "curiosity_gap",
          "information_gap",
          "open_loop"
        ]
      )
        ? 10
        : 0;


    const score =
      this.weightedAverage({

        idea: [ideaScore, 0.40],

        question: [
          questionSignal,
          0.30
        ],

        promise: [
          promiseSignal,
          0.30
        ]

      });


    return {

      score:
        this.clamp(
          score +
          knowledgeGapSignal
        ),

      strength:
        this.classifyScore(
          score +
          knowledgeGapSignal
        ),

      signals: {

        question:
          questionSignal,

        promise:
          promiseSignal,

        knowledgeSupport:
          knowledgeGapSignal

      },

      interpretation:
        score >= 70
          ? "توجد إشارات جيدة إلى وجود فجوة معلوماتية أو وعد يدفع للاستمرار."
          : "لا توجد إشارات محلية كافية لإثبات فضول قوي.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "curiosity",
            "curiosity_gap",
            "information_gap",
            "open_loop"
          ]
        )

    };

  }



  /* =======================================================
     COGNITION
  ======================================================= */


  buildCognition(
    context
  ) {

    const textLength =
      context.transcript.length;


    const duration =
      Math.max(
        context.duration,
        1
      );


    const wordsPerSecond =
      context.speech?.analysis
        ?.wordsPerSecond ||
      (
        (context.speech?.wordCount || 0) /
        duration
      );


    let loadScore =
      50;


    if (
      wordsPerSecond > 3
    ) {

      loadScore += 20;

    }


    if (
      wordsPerSecond < 1
    ) {

      loadScore -= 10;

    }


    if (
      textLength > 500
    ) {

      loadScore += 15;

    }


    loadScore =
      this.clamp(
        loadScore
      );


    return {

      score:
        this.clamp(
          100 -
          loadScore * 0.45
        ),

      cognitiveLoad:
        loadScore,

      wordsPerSecond,

      interpretation:
        loadScore > 70
          ? "قد تكون كثافة المعالجة مرتفعة نسبياً."
          : "لا توجد إشارة قوية إلى حمل معرفي مرتفع من البيانات المتاحة.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "cognition",
            "cognitive_load",
            "processing_fluency",
            "chunking"
          ]
        )

    };

  }



  /* =======================================================
     EMOTION
  ======================================================= */


  buildEmotion(
    context
  ) {

    const visual =
      this.normalize(
        context.visual?.score
      );


    const speech =
      this.normalize(
        context.speech?.analysis?.score
      );


    const emotionalWords =
      this.countEmotionalSignals(
        context.transcript
      );


    const score =
      this.weightedAverage({

        visual: [visual, 0.35],

        speech: [speech, 0.35],

        language: [
          emotionalWords,
          0.30
        ]

      });


    return {

      score,

      strength:
        this.classifyScore(
          score
        ),

      emotionalSignals:
        emotionalWords,

      interpretation:
        score >= 70
          ? "توجد إشارات يمكن أن تدعم التفعيل العاطفي، لكنها لا تثبت شعور المشاهد."
          : "الإشارات العاطفية المباشرة محدودة.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "emotion",
            "emotional_salience",
            "identification",
            "surprise"
          ]
        )

    };

  }



  /* =======================================================
     NARRATIVE
  ======================================================= */


  buildNarrative(
    context
  ) {

    const idea =
      this.normalize(
        context.idea?.score
      );


    const speech =
      context.speech?.wordCount ||
      0;


    const score =
      this.weightedAverage({

        idea: [idea, 0.60],

        speechPresence: [

          speech > 0
            ? 70
            : 20,

          0.40

        ]

      });


    return {

      score,

      strength:
        this.classifyScore(
          score
        ),

      interpretation:
        score >= 70
          ? "هناك بنية معلوماتية أو فكرة واضحة يمكن أن تدعم مساراً سردياً."
          : "البنية السردية غير واضحة بما يكفي من الإشارات المحلية.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "narrative",
            "storytelling",
            "problem_solution",
            "claim_proof",
            "before_after"
          ]
        )

    };

  }



  /* =======================================================
     PACING
  ======================================================= */


  buildPacing(
    context
  ) {

    const score =
      this.normalize(
        context.pacing?.score
      );


    const duration =
      context.duration;


    return {

      score,

      strength:
        this.classifyScore(
          score
        ),

      duration,

      interpretation:
        score >= 70
          ? "الإيقاع يحتوي على مستوى جيد من التغيرات الزمنية."
          : "الإيقاع قد يحتاج إلى مراجعة بحسب طبيعة المحتوى.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "pacing",
            "change_rate",
            "monotony"
          ]
        )

    };

  }



  /* =======================================================
     VISUAL
  ======================================================= */


  buildVisual(
    context
  ) {

    const score =
      this.normalize(
        context.visual?.score
      );


    return {

      score,

      strength:
        this.classifyScore(
          score
        ),

      brightness:
        context.visual?.averageBrightness ??
        null,

      contrast:
        context.visual?.averageContrast ??
        null,

      saturation:
        context.visual?.averageSaturation ??
        null,

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "visual",
            "attention",
            "visual_emphasis",
            "subject_clarity"
          ]
        )

    };

  }



  /* =======================================================
     AUDIO
  ======================================================= */


  buildAudio(
    context
  ) {

    const available =
      context.speechAvailable;


    const score =
      this.normalize(
        context.speech?.analysis?.score
      );


    return {

      available,

      score,

      speechDetected:
        available,

      wordCount:
        context.speech?.wordCount ||
        0,

      interpretation:
        available
          ? "توجد بيانات كلام يمكن استخدامها في التحليل."
          : "لا تتوفر بيانات كلام كافية للتحليل الصوتي العميق.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "audio",
            "voice",
            "speech",
            "silence"
          ]
        )

    };

  }



  /* =======================================================
     TEXT
  ======================================================= */


  buildText(
    context
  ) {

    const transcript =
      context.transcript;


    const length =
      transcript.length;


    return {

      available:
        length > 0,

      characterCount:
        length,

      claritySignal:
        this.clamp(
          40 +
          Math.min(
            length / 8,
            60
          )
        ),

      interpretation:
        length > 0
          ? "يوجد نص يمكن استخدامه لفهم الرسالة وبنية الفكرة."
          : "لا يوجد نص مستخرج.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          [
            "text",
            "clarity",
            "processing_fluency",
            "information_compression"
          ]
        )

    };

  }



  /* =======================================================
     MECHANISMS
  ======================================================= */


  buildMechanisms(
    context
  ) {

    const mechanisms = [];


    if (
      context.hook?.score >= 65
    ) {

      mechanisms.push(
        createMechanism({

          id:
            "novelty",

          strength:
            this.normalize(
              context.hook.score
            ),

          evidenceLevel:
            this.getEvidenceLevel(
              "novelty",
              context
            ),

          reason:
            "توجد إشارة مبكرة إلى تغير أو جذب انتباه."

        })
      );

    }


    if (
      context.idea?.score >= 65
    ) {

      mechanisms.push(
        createMechanism({

          id:
            "curiosity_gap",

          strength:
            this.normalize(
              context.idea.score
            ),

          evidenceLevel:
            this.getEvidenceLevel(
              "curiosity_gap",
              context
            ),

          reason:
            "الفكرة تحتوي على إشارة يمكن أن تخلق فجوة معلوماتية."

        })
      );

    }


    if (
      context.pacing?.score >= 70
    ) {

      mechanisms.push(
        createMechanism({

          id:
            "information_gain",

          strength:
            this.normalize(
              context.pacing.score
            ),

          evidenceLevel:
            this.getEvidenceLevel(
              "information_gain",
              context
            ),

          reason:
            "الإيقاع يوفر تغيرات زمنية قد ترتبط بتجدد المعلومات."

        })
      );

    }


    if (
      context.transcript
    ) {

      mechanisms.push(
        createMechanism({

          id:
            "message_clarity",

          strength:
            this.calculateMessageClarity(
              context
            ),

          evidenceLevel:
            this.getEvidenceLevel(
              "message_clarity",
              context
            ),

          reason:
            "تم استخدام وجود النص وكثافته كإشارة أولية للوضوح."

        })
      );

    }


    /*
      Add mechanisms supported by the
      Knowledge Context only when the local
      video signals provide a reason to use them.
    */

    if (
      context.idea?.score >= 60 &&
      this.hasKnowledgeMechanism(
        context,
        [
          "curiosity_gap",
          "information_gap",
          "open_loop"
        ]
      )
    ) {

      const alreadyExists =
        mechanisms.some(
          item =>
            item.id ===
            "curiosity_gap"
        );


      if (!alreadyExists) {

        mechanisms.push(
          createMechanism({

            id:
              "knowledge_supported_curiosity",

            strength:
              this.normalize(
                context.idea.score
              ),

            evidenceLevel:
              this.getEvidenceLevel(
                "curiosity_gap",
                context
              ),

            reason:
              "تم دعم تفسير إشارة الفكرة بمبدأ معرفي مرتبط بالفضول أو فجوة المعلومات."

          })
        );

      }

    }


    return mechanisms;

  }



  /* =======================================================
     DROP-OFF RISKS
  ======================================================= */


  buildDropOffRisks(
    context
  ) {

    const risks = [];


    const hook =
      this.normalize(
        context.hook?.score
      );


    const pacing =
      this.normalize(
        context.pacing?.score
      );


    if (
      hook < 45
    ) {

      risks.push({
