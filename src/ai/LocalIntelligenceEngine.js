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
          continueScore / 100,

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
          ) / 100,

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
          ) / 100,

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
          ) / 100,

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
          ) / 100,

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
          ) / 100,

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

        stage: "opening",

        risk: this.clamp(100 - hook),

        reason:
          "إشارة الجذب في البداية ضعيفة نسبياً، ما بيرفع احتمال ترك الفيديو بأول ثوانٍ.",

        knowledgeSupport:
          this.getRelevantKnowledge(
            context,
            ["attention", "hook", "novelty"]
          )

      });

    }


    if (
      pacing < 40
    ) {

      risks.push({

        stage: "middle",

        risk: this.clamp(100 - pacing),

        reason:
          "كثافة التغيرات الزمنية بمنتصف الفيديو منخفضة، هالشي ممكن يزيد الرتابة.",

        knowledgeSupport:
          this.getRelevantKnowledge(
            context,
            ["pacing", "monotony", "change_rate"]
          )

      });

    }


    if (
      context.dropOff?.points?.length
    ) {

      for (
        const point of context.dropOff.points
      ) {

        risks.push({

          stage:
            point.stage || "unspecified",

          risk:
            this.clamp(
              point.risk ?? 50
            ),

          reason:
            point.reason ||
            "نقطة زمنية بإشارات تغير منخفضة مستخرجة محلياً من الفيديو.",

          knowledgeSupport: []

        });

      }

    }


    if (
      !context.speechAvailable &&
      context.duration > 8
    ) {

      risks.push({

        stage: "throughout",

        risk: 55,

        reason:
          "لا يوجد كلام مكتشف بفيديو أطول من 8 ثوانٍ، هالشي ممكن يضعف وضوح الرسالة لبعض الجمهور.",

        knowledgeSupport:
          this.getRelevantKnowledge(
            context,
            ["audio", "speech", "message_clarity"]
          )

      });

    }


    return risks;

  }



  /* =======================================================
     CONTINUATION DRIVERS
  ======================================================= */


  buildContinuationDrivers(context) {

    const drivers = [];

    const hook = this.normalize(context.hook?.score);
    const idea = this.normalize(context.idea?.score);
    const pacing = this.normalize(context.pacing?.score);
    const visual = this.normalize(context.visual?.score);

    if (hook >= 55) {
      drivers.push({
        driver: "early_attention",
        strength: hook,
        reason: "إشارة جذب مبكرة قابلة للقياس تدعم استمرار المشاهدة."
      });
    }

    if (idea >= 55) {
      drivers.push({
        driver: "information_value",
        strength: idea,
        reason: "توجد بنية فكرة أو معلومة يمكن أن تحافظ على اهتمام المشاهد."
      });
    }

    if (pacing >= 55) {
      drivers.push({
        driver: "temporal_variety",
        strength: pacing,
        reason: "التغيرات الزمنية المتكررة تقلل احتمال الملل."
      });
    }

    if (visual >= 55) {
      drivers.push({
        driver: "visual_quality",
        strength: visual,
        reason: "جودة الإطارات البصرية تدعم راحة المشاهدة."
      });
    }

    return drivers;

  }



  /* =======================================================
     RECOMMENDATIONS
  ======================================================= */


  buildRecommendations(context, domains) {

    const recommendations = [];

    const push = (data) =>
      recommendations.push(createRecommendation(data));

    if (this.normalize(domains.attention?.score) < 55) {
      push({
        priority: "high",
        category: "attention",
        problem: "إشارة الجذب بأول 3 ثوانٍ ضعيفة حسب القياس المحلي.",
        action: "أضف تغيير بصري أو صوتي واضح (قصة/حركة/جملة مباشرة) بأول ثانيتين.",
        reason: "الفيديوهات القصيرة بتخسر جزء كبير من المشاهدين إذا ما في إشارة جذب مبكرة.",
        expectedEffect: "رفع محتمل بنسبة الاستمرار بالثواني الأولى.",
        confidence: this.scoreConfidence(domains.attention?.score ?? 0)
      });
    }

    if (this.normalize(domains.pacing?.score) < 50) {
      push({
        priority: "medium",
        category: "pacing",
        problem: "كثافة التغيرات الزمنية بمنتصف الفيديو منخفضة.",
        action: "قصّر اللقطات الطويلة الثابتة أو أضف قطع/زاوية جديدة كل 2-3 ثوانٍ.",
        reason: "قلة التغير الزمني بترفع احتمال فقدان الانتباه بمنتصف المقطع.",
        expectedEffect: "تحسين محتمل بالاحتفاظ بالمشاهدين لمنتصف الفيديو.",
        confidence: this.scoreConfidence(domains.pacing?.score ?? 0)
      });
    }

    if (!context.speechAvailable && context.duration > 8) {
      push({
        priority: "medium",
        category: "text",
        problem: "لا يوجد كلام أو نص مكتشف بفيديو أطول من 8 ثوانٍ.",
        action: "أضف تعليق صوتي أو نص توضيحي على الشاشة يشرح الفكرة الأساسية.",
        reason: "غياب النص أو الكلام بيصعّب على المشاهد فهم الرسالة بسرعة.",
        expectedEffect: "وضوح أعلى للرسالة، خصوصاً بدون صوت.",
        confidence: CONFIDENCE.MEDIUM
      });
    }

    if (this.normalize(domains.curiosity?.score) < 50) {
      push({
        priority: "medium",
        category: "curiosity",
        problem: "إشارات الفضول أو الوعد بمعلومة قليلة بالنص المستخرج.",
        action: "استخدم سؤال أو وعد صريح بأول جملة (مثال: كيف/ليش/شو رح يصير).",
        reason: "فجوة معلوماتية واضحة بترفع احتمال الاستمرار بالمشاهدة.",
        expectedEffect: "رفع محتمل بالفضول ونية الاستمرار.",
        confidence: this.scoreConfidence(domains.curiosity?.score ?? 0)
      });
    }

    if (recommendations.length === 0) {
      push({
        priority: "low",
        category: "general",
        problem: "لا توجد نقطة ضعف واضحة حسب الإشارات المحلية المتاحة.",
        action: "حافظ على نفس البنية، وجرّب اختبار A/B على الهوك بفيديوهات مشابهة.",
        reason: "الإشارات المقاسة ضمن نطاق جيد.",
        expectedEffect: "استقرار الأداء الحالي.",
        confidence: CONFIDENCE.MEDIUM
      });
    }

    return recommendations;

  }



  /* =======================================================
     PREDICTION
  ======================================================= */


  buildPrediction(context, domains) {

    const score = this.weightedAverage({
      attention: [this.normalize(domains.attention?.score), 0.30],
      curiosity: [this.normalize(domains.curiosity?.score), 0.20],
      cognition: [this.normalize(domains.cognition?.score), 0.10],
      emotion: [this.normalize(domains.emotion?.score), 0.15],
      narrative: [this.normalize(domains.narrative?.score), 0.10],
      pacing: [this.normalize(domains.pacing?.score), 0.15]
    });

    const decision =
      score >= 65
        ? "PUBLISH"
        : score >= 45
          ? "PUBLISH AFTER MINOR FIXES"
          : "REWORK";

    return {

      retentionEstimate: score,

      estimateType: "local_heuristic_proxy",

      basis: [
        "local_hook_signal",
        "local_pacing_signal",
        "local_visual_signal",
        "local_text_or_speech_signal",
        "local_emotion_narrative_rules"
      ],

      platformRetentionAvailable: false,

      decision,

      confidence:
        this.scoreConfidence(score),

      explanation:
        "هذا تقدير مبني على تجميع إشارات محلية قابلة للقياس (جذب، إيقاع، فكرة، عاطفة، سردية)، وليس ضمانة أداء فعلي على المنصة.",

      knowledgeSupport:
        this.getRelevantKnowledge(
          context,
          ["prediction", "retention"]
        )

    };

  }



  /* =======================================================
     SUMMARY
  ======================================================= */


  buildSummary(domains) {

    const scored = [
      ["الجذب المبكر", domains.attention?.score],
      ["الفضول", domains.curiosity?.score],
      ["الإيقاع", domains.pacing?.score],
      ["التفاعل العاطفي", domains.emotion?.score],
      ["البنية السردية", domains.narrative?.score]
    ]
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([label, v]) => [label, this.normalize(v)]);

    if (scored.length === 0) {
      return "لا توجد إشارات محلية كافية لبناء ملخص موثوق.";
    }

    const strongest = scored.reduce((a, b) => (b[1] > a[1] ? b : a));
    const weakest = scored.reduce((a, b) => (b[1] < a[1] ? b : a));

    return `أقوى إشارة محلية بهذا الفيديو هي "${strongest[0]}" (${Math.round(strongest[1])}/100)، بينما أضعف إشارة هي "${weakest[0]}" (${Math.round(weakest[1])}/100). التفاصيل والتوصيات بالأسفل مبنية على قياسات فعلية من الفيديو نفسه.`;

  }



  /* =======================================================
     LIMITATIONS
  ======================================================= */


  buildLimitations(context) {

    const limitations = [

      "هذا محرك قواعد محلي (Local Reasoning Engine) وليس نموذج ذكاء اصطناعي مدرّب، ويعتمد فقط على إشارات قابلة للقياس من الصورة والصوت والنص.",

      "النتائج مؤشرات احتمالية مبنية على الأدلة المتاحة، وليست ضمانة لأداء الفيديو الفعلي على أي منصة."

    ];

    if (!context.speechAvailable) {
      limitations.push(
        "لم يتم اكتشاف كلام واضح، لذلك تحليل الفكرة والبنية السردية أقل موثوقية."
      );
    }

    if (context.duration && context.duration < 3) {
      limitations.push(
        "مدة الفيديو قصيرة جداً، ما بيسمح بقياس كافٍ لبعض المؤشرات (خصوصاً الإيقاع)."
      );
    }

    return limitations;

  }



  /* =======================================================
     OVERALL CONFIDENCE
  ======================================================= */


  calculateOverallConfidence(evidence, context) {

    let points = 0;

    if (context.hook?.score !== undefined) points++;
    if (context.pacing?.score !== undefined) points++;
    if (context.visual?.score !== undefined) points++;
    if (context.speechAvailable) points++;
    if (Array.isArray(evidence) && evidence.length >= 4) points++;

    if (points >= 4) return CONFIDENCE.HIGH;
    if (points >= 2) return CONFIDENCE.MEDIUM;
    return CONFIDENCE.LOW;

  }



  /* =======================================================
     LIFECYCLE HELPERS
  ======================================================= */


  reset() {
    this.lastResult = null;
    this.lastError = null;
  }


  validateInput(localAnalysis) {
    if (!localAnalysis || typeof localAnalysis !== "object") {
      throw new Error(
        "MTI Local Intelligence: localAnalysis غير صالح أو مفقود."
      );
    }
  }



  /* =======================================================
     NUMERIC HELPERS
  ======================================================= */


  clamp(value, min = SCORE_LIMIT.MIN, max = SCORE_LIMIT.MAX) {
    const num = Number(value);
    if (Number.isNaN(num)) return min;
    return Math.min(max, Math.max(min, num));
  }


  normalize(score) {
    if (score === undefined || score === null || Number.isNaN(Number(score))) {
      return 0;
    }
    return this.clamp(score);
  }


  weightedAverage(map) {
    let total = 0;
    let weightSum = 0;
    for (const key in map) {
      const [value, weight] = map[key];
      total += (this.normalize(value)) * weight;
      weightSum += weight;
    }
    if (weightSum === 0) return 0;
    return this.clamp(total / weightSum);
  }


  classifyScore(score) {
    const s = this.normalize(score);
    if (s >= 75) return "قوي";
    if (s >= 50) return "متوسط";
    if (s >= 25) return "ضعيف";
    return "ضعيف جداً";
  }


  scoreConfidence(score) {
    const s = this.normalize(score);
    if (s >= 70) return CONFIDENCE.HIGH;
    if (s >= 40) return CONFIDENCE.MEDIUM;
    return CONFIDENCE.LOW;
  }



  /* =======================================================
     INTERPRETATION HELPERS
  ======================================================= */


  attentionInterpretation(score) {
    const s = this.normalize(score);
    if (s >= 70) {
      return "إشارات الجذب المبكرة قوية نسبياً حسب القياس المحلي.";
    }
    if (s >= 45) {
      return "إشارات الجذب المبكرة متوسطة، في مجال للتحسين بأول ثوانٍ.";
    }
    return "إشارات الجذب المبكرة ضعيفة، احتمال ترك الفيديو بالثواني الأولى مرتفع نسبياً.";
  }


  countEmotionalSignals(text) {
    if (!text) return 0;
    const matches = text.match(
      /(فرح|حزين|صدمة|خوف|قلق|حماس|غضب|مفاجأة|رهيب|جنون|بكيت|ضحكت|قهر|فخر)/g
    );
    if (!matches) return 0;
    return this.clamp(matches.length * 15);
  }


  calculateMessageClarity(context) {
    const length = context.transcript?.length || 0;
    return this.clamp(35 + Math.min(length / 6, 55));
  }


  reasonList(context, continueScore) {
    const reasons = [];
    if (this.normalize(context.hook?.score) >= 55) {
      reasons.push("إشارة جذب مبكرة كافية حسب القياس المحلي.");
    }
    if (this.normalize(context.pacing?.score) >= 55) {
      reasons.push("إيقاع فيه تغيرات زمنية كافية.");
    }
    if (this.normalize(context.idea?.score) >= 55) {
      reasons.push("توجد بنية فكرة يمكن أن تشد الانتباه.");
    }
    if (reasons.length === 0) {
      reasons.push("الإشارات المحلية المتاحة لا تدعم استمراراً قوياً بشكل واضح.");
    }
    return reasons;
  }


  calculateRewatchPotential(context) {
    const idea = this.normalize(context.idea?.score);
    const cognition = this.normalize(context.speech?.wordCount ? 60 : 30);
    return this.clamp(idea * 0.6 + cognition * 0.4);
  }


  calculateSharePotential(context) {
    const emotionalWords = this.countEmotionalSignals(context.transcript);
    const idea = this.normalize(context.idea?.score);
    return this.clamp(emotionalWords * 0.5 + idea * 0.5);
  }


  calculateSavePotential(context) {
    const idea = this.normalize(context.idea?.score);
    const wordCount = context.speech?.wordCount || 0;
    const infoDensity = wordCount > 20 ? 65 : 35;
    return this.clamp(idea * 0.5 + infoDensity * 0.5);
  }



  /* =======================================================
     KNOWLEDGE HELPERS
  ======================================================= */


  getRelevantKnowledge(context, tags = []) {

    const pool = [
      ...(context.relevantKnowledge || []),
      ...(context.scientificKnowledge || []),
      ...(context.generalKnowledge || []),
      ...(this.knowledge || [])
    ];

    if (!tags.length) return [];

    const seen = new Set();
    const results = [];

    for (const item of pool) {
      if (!item) continue;
      const key = item.id || item.mechanism || JSON.stringify(item).slice(0, 40);
      if (seen.has(key)) continue;

      const haystack = [item.id, item.mechanism, item.domain]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const isMatch = tags.some((tag) =>
        haystack.some((h) => h.includes(String(tag).toLowerCase()))
      );

      if (isMatch) {
        seen.add(key);
        results.push({
          id: item.id,
          principle: item.principle,
          evidenceLevel: item.evidenceLevel,
          mechanism: item.mechanism
        });
      }
    }

    return results;

  }


  hasKnowledgeMechanism(context, mechanismIds = []) {
    return this.getRelevantKnowledge(context, mechanismIds).length > 0;
  }


  getEvidenceLevel(mechanismId, context) {

    const pool = [
      ...(context.relevantKnowledge || []),
      ...(this.knowledge || [])
    ];

    const found = pool.find(
      (item) => item?.mechanism === mechanismId || item?.id === mechanismId
    );

    return found?.evidenceLevel || EVIDENCE_LEVELS.HEURISTIC;

  }


  getKnowledgeConfidence(context) {
    const total =
      (context.relevantKnowledge?.length || 0) +
      (context.scientificKnowledge?.length || 0) +
      (context.generalKnowledge?.length || 0);

    if (total >= 3) return CONFIDENCE.HIGH;
    if (total >= 1) return CONFIDENCE.MEDIUM;
    return CONFIDENCE.LOW;
  }

}
