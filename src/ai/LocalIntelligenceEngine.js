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
  "1.0.0-local";


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

      score,

      strength:
        this.classifyScore(
          score
        ),

      signals: {

        question:
          questionSignal,

        promise:
          promiseSignal

      },

      interpretation:
        score >= 70
          ? "توجد إشارات جيدة إلى وجود فجوة معلوماتية أو وعد يدفع للاستمرار."
          : "لا توجد إشارات محلية كافية لإثبات فضول قوي."

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
          : "لا توجد إشارة قوية إلى حمل معرفي مرتفع من البيانات المتاحة."

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
          : "الإشارات العاطفية المباشرة محدودة."

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
          : "البنية السردية غير واضحة بما يكفي من الإشارات المحلية."

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
          : "الإيقاع قد يحتاج إلى مراجعة بحسب طبيعة المحتوى."

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
        null

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
          : "لا تتوفر بيانات كلام كافية للتحليل الصوتي العميق."

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
          : "لا يوجد نص مستخرج."

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
              "novelty"
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
              "curiosity_gap"
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
              "information_gain"
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
              "message_clarity"
            ),

          reason:
            "تم استخدام وجود النص وكثافته كإشارة أولية للوضوح."

        })
      );

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

        type:
          "weak-opening",

        severity:
          "high",

        stage:
          "opening",

        reason:
          "إشارة الجذب المبكر منخفضة نسبياً.",

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    if (
      pacing < 45
    ) {

      risks.push({

        type:
          "low-temporal-change",

        severity:
          "medium",

        stage:
          "middle",

        reason:
          "كثافة التغيرات الزمنية منخفضة نسبياً.",

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    if (
      context.dropOff?.points?.length
    ) {

      risks.push({

        type:
          "detected-risk-points",

        severity:
          "medium",

        stage:
          "detected",

        reason:
          "محرك التحليل المحلي حدد نقاطاً محتملة لخطر الانخفاض.",

        points:
          context.dropOff.points,

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    return risks;

  }



  /* =======================================================
     CONTINUATION DRIVERS
  ======================================================= */


  buildContinuationDrivers(
    context
  ) {

    const drivers = [];


    if (
      context.hook?.score >= 65
    ) {

      drivers.push({

        type:
          "early-attention",

        strength:
          this.normalize(
            context.hook.score
          ),

        reason:
          "الإشارة المبكرة تساعد على جذب الانتباه في بداية الفيديو.",

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    if (
      context.idea?.score >= 65
    ) {

      drivers.push({

        type:
          "information-value",

        strength:
          this.normalize(
            context.idea.score
          ),

        reason:
          "الفكرة تحمل قيمة معلوماتية محتملة.",

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    if (
      context.pacing?.score >= 65
    ) {

      drivers.push({

        type:
          "temporal-change",

        strength:
          this.normalize(
            context.pacing.score
          ),

        reason:
          "التغيرات الزمنية قد تساعد على تجديد الانتباه.",

        confidence:
          CONFIDENCE.MEDIUM

      });

    }


    return drivers;

  }



  /* =======================================================
     RECOMMENDATIONS
  ======================================================= */


  buildRecommendations(
    context,
    analysis
  ) {

    const recommendations = [];


    if (
      analysis.dropOffRisks
        .some(
          item =>
            item.type ===
            "weak-opening"
        )
    ) {

      recommendations.push(
        createRecommendation({

          priority:
            "high",

          category:
            "hook",

          title:
            "قوّي بداية الفيديو",

          action:
            "اختبر افتتاحية تقدم سبباً واضحاً للاستمرار قبل الدخول في التفاصيل.",

          reason:
            "إشارة الجذب المبكر منخفضة نسبياً.",

          confidence:
            CONFIDENCE.MEDIUM

        })
      );

    }


    if (
      analysis.pacing.score < 55
    ) {

      recommendations.push(
        createRecommendation({

          priority:
            "medium",

          category:
            "pacing",

          title:
            "راجع الإيقاع",

          action:
            "اختبر تقليل المقاطع التي لا تضيف معلومة أو تغيراً بصرياً مهماً.",

          reason:
            "الإيقاع المحلي منخفض نسبياً.",

          confidence:
            CONFIDENCE.MEDIUM

        })
      );

    }


    if (
      analysis.curiosity.score < 55 &&
      context.transcript
    ) {

      recommendations.push(
        createRecommendation({

          priority:
            "medium",

          category:
            "curiosity",

          title:
            "ارفع قيمة السؤال أو الوعد",

          action:
            "اختبر صياغة تخلق سؤالاً واضحاً أو وعداً بمعلومة يحتاج المشاهد للوصول إليها.",

          reason:
            "إشارات الفضول محدودة.",

          confidence:
            CONFIDENCE.LOW

        })
      );

    }


    if (
      recommendations.length === 0
    ) {

      recommendations.push(
        createRecommendation({

          priority:
            "low",

          category:
            "optimization",

          title:
            "اختبر النسخة الحالية",

          action:
            "احتفظ بالبنية الحالية واستخدم الأداء الحقيقي لتحديد المتغير الذي يستحق الاختبار التالي.",

          reason:
            "لم تظهر مشكلة محلية واضحة تستدعي تغييراً كبيراً.",

          confidence:
            CONFIDENCE.MEDIUM

        })
      );

    }


    return recommendations;

  }



  /* =======================================================
     PREDICTION
  ======================================================= */


  buildPrediction(
    context,
    analysis
  ) {

    const overall =
      this.weightedAverage({

        attention:
          [analysis.attention.score, 0.25],

        curiosity:
          [analysis.curiosity.score, 0.15],

        cognition:
          [analysis.cognition.score, 0.10],

        emotion:
          [analysis.emotion.score, 0.10],

        narrative:
          [analysis.narrative.score, 0.10],

        pacing:
          [analysis.pacing.score, 0.15],

        visual:
          [
            this.normalize(
              context.visual?.score
            ),
            0.15
          ]

      });


    return {

      score:
        overall,

      confidence:
        this.calculatePredictionConfidence(
          context
        ),

      level:
        this.classifyScore(
          overall
        ),

      basis: [

        "local-video-signals",

        "behavioral-heuristics",

        "psychology-knowledge-base"

      ],

      note:
        "هذه توقعات احتمالية وليست ضماناً للأداء الفعلي."

    };

  }



  /* =======================================================
     SUMMARY
  ======================================================= */


  buildSummary(
    analysis
  ) {

    const strongest =
      this.findStrongest(
        analysis
      );


    const weakest =
      this.findWeakest(
        analysis
      );


    return {

      strongestArea:
        strongest,

      weakestArea:
        weakest,

      continuationRisk:
        analysis.dropOffRisks.length > 0
          ? "present"
          : "low",

      overallInterpretation:

        strongest === weakest
          ? "الإشارات متقاربة ولا توجد نقطة تفوق أو ضعف واضحة."
          : `أقوى إشارة حالياً هي ${strongest}، وأضعف إشارة هي ${weakest}.`

    };

  }



  /* =======================================================
     LIMITATIONS
  ======================================================= */


  buildLimitations(
    context
  ) {

    const limitations = [

      "التحليل المحلي يستنتج سلوك المشاهد من خصائص الفيديو ولا يراقب مشاهدين حقيقيين.",

      "لا يمكن إثبات علاقة سببية بين إشارة نفسية واحدة وقرار المشاهدة.",

      "التنبؤ يصبح أقوى عندما تتوفر بيانات أداء حقيقية من نفس الحساب.",

      "غياب بيانات الصوت أو النص يقلل دقة بعض الاستنتاجات.",

      "قواعد علم النفس هنا تستخدم كإطار استدلال وليست بديلاً عن تجربة فعلية."

    ];


    if (
      !context.speechAvailable
    ) {

      limitations.push(
        "لم تتوفر بيانات كلام كافية، لذلك تم تخفيض الثقة في بعض تحليلات الصوت والنص."
      );

    }


    return limitations;

  }



  /* =======================================================
     HELPERS — PSYCHOLOGY
  ======================================================= */


  attentionInterpretation(
    score
  ) {

    if (score >= 75) {

      return "إشارات قوية نسبياً لالتقاط الانتباه المبكر.";

    }


    if (score >= 55) {

      return "إشارات متوسطة لالتقاط الانتباه.";

    }


    return "إشارات محدودة لالتقاط الانتباه.";

  }



  calculateRewatchPotential(
    context
  ) {

    const information =
      this.normalize(
        context.idea?.score
      );


    const pacing =
      this.normalize(
        context.pacing?.score
      );


    return this.weightedAverage({

      information:
        [information, 0.60],

      pacing:
        [pacing, 0.40]

    });

  }



  calculateSharePotential(
    context
  ) {

    const emotion =
      this.countEmotionalSignals(
        context.transcript
      );


    const idea =
      this.normalize(
        context.idea?.score
      );


    return this.weightedAverage({

      emotional:
        [emotion, 0.45],

      idea:
        [idea, 0.55]

    });

  }



  calculateSavePotential(
    context
  ) {

    const idea =
      this.normalize(
        context.idea?.score
      );


    const speech =
      context.speech?.wordCount > 0
        ? 65
        : 30;


    return this.weightedAverage({

      information:
        [idea, 0.70],

      speech:
        [speech, 0.30]

    });

  }



  calculateMessageClarity(
    context
  ) {

    if (
      !context.transcript
    ) {

      return 30;

    }


    const length =
      context.transcript.length;


    if (
      length < 20
    ) {

      return 45;

    }


    if (
      length < 250
    ) {

      return 75;

    }


    if (
      length < 500
    ) {

      return 65;

    }


    return 50;

  }



  countEmotionalSignals(
    text
  ) {

    if (
      !text
    ) {

      return 25;

    }


    const matches =
      text.match(
        /(بحب|بكره|خوف|خايف|فرح|حزين|صدمة|مشكلة|نجاح|فشل|غلط|ندم|فرصة|خسارة|ربح|خطير|مهم)/gi
      );


    const count =
      matches
        ? matches.length
        : 0;


    return this.clamp(
      30 +
      count * 10
    );

  }



  /* =======================================================
     HELPERS — KNOWLEDGE
  ======================================================= */


  getEvidenceLevel(
    id
  ) {

    const item =
      this.knowledge.find(
        knowledge =>
          knowledge.id === id
      );


    return (
      item?.evidenceLevel ||
      EVIDENCE_LEVELS.HEURISTIC
    );

  }



  /* =======================================================
     HELPERS — SCORES
  ======================================================= */


  normalize(
    value
  ) {

    const number =
      Number(
        value
      );


    if (
      !Number.isFinite(
        number
      )
    ) {

      return 50;

    }


    return this.clamp(
      number
    );

  }



  clamp(
    value
  ) {

    return Math.min(

      SCORE_LIMIT.MAX,

      Math.max(
        SCORE_LIMIT.MIN,
        Number(value) || 0
      )

    );

  }



  weightedAverage(
    values
  ) {

    let total =
      0;

    let weight =
      0;


    for (
      const [
        ,
        [score, factor]
      ]
      of Object.entries(values)
    ) {

      const safeScore =
        this.normalize(
          score
        );


      total +=
        safeScore *
        factor;


      weight +=
        factor;

    }


    if (
      weight === 0
    ) {

      return 0;

    }


    return this.clamp(
      total / weight
    );

  }



  classifyScore(
    score
  ) {

    const value =
      this.normalize(
        score
      );


    if (
      value >= 75
    ) {

      return "strong";

    }


    if (
      value >= 55
    ) {

      return "moderate";

    }


    return "weak";

  }



  scoreConfidence(
    score
  ) {

    const value =
      this.normalize(
        score
      );


    if (
      value >= 70
    ) {

      return CONFIDENCE.HIGH;

    }


    if (
      value >= 45
    ) {

      return CONFIDENCE.MEDIUM;

    }


    return CONFIDENCE.LOW;

  }



  calculateOverallConfidence(
    evidence,
    context
  ) {

    if (
      evidence.length >= 5 &&
      context.speechAvailable
    ) {

      return CONFIDENCE.HIGH;

    }


    if (
      evidence.length >= 3
    ) {

      return CONFIDENCE.MEDIUM;

    }


    return CONFIDENCE.LOW;

  }



  calculatePredictionConfidence(
    context
  ) {

    let confidence =
      40;


    if (
      context.hook?.score !== undefined
    ) {

      confidence +=
        10;

    }


    if (
      context.pacing?.score !== undefined
    ) {

      confidence +=
        10;

    }


    if (
      context.visual?.score !== undefined
    ) {

      confidence +=
        10;

    }


    if (
      context.speechAvailable
    ) {

      confidence +=
        15;

    }


    if (
      context.idea?.score !== undefined
    ) {

      confidence +=
        15;

    }


    return this.clamp(
      confidence
    );

  }



  /* =======================================================
     HELPERS — REASONING
  ======================================================= */


  reasonList(
    context,
    score
  ) {

    const reasons = [];


    if (
      context.hook?.score >= 65
    ) {

      reasons.push(
        "إشارة جذب مبكرة جيدة."
      );

    }


    if (
      context.pacing?.score >= 65
    ) {

      reasons.push(
        "التغير الزمني يدعم استمرار الانتباه."
      );

    }


    if (
      context.visual?.score >= 65
    ) {

      reasons.push(
        "الإشارات البصرية جيدة نسبياً."
      );

    }


    if (
      reasons.length === 0
    ) {

      reasons.push(
        "لا توجد إشارة قوية كافية لضمان الاستمرار."
      );

    }


    return reasons;

  }



  findStrongest(
    analysis
  ) {

    const areas = {

      Attention:
        analysis.attention.score,

      Curiosity:
        analysis.curiosity.score,

      Cognition:
        analysis.cognition.score,

      Emotion:
        analysis.emotion.score,

      Narrative:
        analysis.narrative.score,

      Pacing:
        analysis.pacing.score

    };


    return Object.entries(
      areas
    )
      .sort(
        (
          [, a],
          [, b]
        ) =>
          b - a
      )[0][0];

  }



  findWeakest(
    analysis
  ) {

    const areas = {

      Attention:
        analysis.attention.score,

      Curiosity:
        analysis.curiosity.score,

      Cognition:
        analysis.cognition.score,

      Emotion:
        analysis.emotion.score,

      Narrative:
        analysis.narrative.score,

      Pacing:
        analysis.pacing.score

    };


    return Object.entries(
      areas
    )
      .sort(
        (
          [, a],
          [, b]
        ) =>
          a - b
      )[0][0];

  }



  /* =======================================================
     VALIDATION
  ======================================================= */


  validateInput(
    localAnalysis
  ) {

    if (
      !localAnalysis ||
      typeof localAnalysis !==
      "object"
    ) {

      throw new Error(
        "LocalIntelligenceEngine: local analysis is required."
      );

    }


    if (
      !localAnalysis.video &&
      !localAnalysis.scores
    ) {

      throw new Error(
        "LocalIntelligenceEngine: invalid local analysis result."
      );

    }

  }



  /* =======================================================
     STATE
  ======================================================= */


  reset() {

    this.lastError =
      null;

  }



  isReady() {

    return (
      this.ready === true
    );

  }



  getLastResult() {

    return this.lastResult;

  }



  getLastError() {

    return this.lastError;

  }



  getVersion() {

    return this.version;

  }



  getKnowledge() {

    return this.knowledge;

  }



  getInfo() {

    return {

      name:
        "LocalIntelligenceEngine",

      version:
        this.version,

      type:
        "local-reasoning-engine",

      externalAI:
        false,

      externalAPIs:
        false,

      knowledgeVersion:
        "1.0.0",

      status:
        this.isReady()
          ? "ready"
          : "not-ready"

    };

  }

}



/* =========================================================
   FACTORY
========================================================= */


export function createLocalIntelligenceEngine(
  options = {}
) {

  return new LocalIntelligenceEngine(
    options
  );

}



/* =========================================================
   SINGLETON
========================================================= */


export const localIntelligenceEngine =
  new LocalIntelligenceEngine();



export default localIntelligenceEngine;
