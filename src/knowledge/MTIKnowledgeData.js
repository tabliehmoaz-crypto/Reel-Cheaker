/**
 * MTI Knowledge Data
 * ==================
 *
 * General reusable knowledge for content analysis.
 * This layer is shared and contains NO personal account data.
 */

import {
  addKnowledge,
  addRule,
  addPrinciple,
  addPattern,
  addEvidence
} from "./MTIKnowledgeBase.js";

/* =========================================================
   PSYCHOLOGY
   ========================================================= */

const psychology = [
  {
    id: "psych_attention_is_limited",
    title: "Limited Attention",
    concept: "الانتباه مورد محدود",
    description:
      "المشاهد لا يملك انتباهاً غير محدود؛ لذلك يجب أن يعطي المحتوى سبباً مستمراً للاستمرار.",
    signals: [
      "وضوح الفكرة",
      "تغير بصري أو معلوماتي",
      "سؤال مفتوح",
      "توقع نتيجة",
      "معلومة جديدة"
    ]
  },

  {
    id: "psych_cognitive_load",
    title: "Cognitive Load",
    concept: "الحمل المعرفي",
    description:
      "زيادة المعلومات أو التعقيد دون تنظيم قد تجعل فهم الرسالة أصعب وتزيد احتمالية الانسحاب.",
    signals: [
      "جمل طويلة جداً",
      "عدة أفكار في وقت واحد",
      "نص بصري مزدحم",
      "شرح غير منظم"
    ]
  },

  {
    id: "psych_processing_fluency",
    title: "Processing Fluency",
    concept: "سهولة المعالجة",
    description:
      "المحتوى الأسهل في الفهم والمعالجة يمكن أن يقلل الاحتكاك المعرفي ويجعل الرسالة أوضح.",
    signals: [
      "لغة مباشرة",
      "ترتيب منطقي",
      "نص مقروء",
      "صورة مفهومة"
    ]
  },

  {
    id: "psych_emotional_salience",
    title: "Emotional Salience",
    concept: "البروز العاطفي",
    description:
      "المعلومات المرتبطة بمشاعر قوية قد تكون أكثر جذباً للانتباه والتذكر من المعلومات المحايدة.",
    signals: [
      "دهشة",
      "خوف",
      "فرح",
      "فضول",
      "تعاطف",
      "غضب"
    ]
  }
];

/* =========================================================
   ATTENTION
   ========================================================= */

const attention = [
  {
    id: "attention_first_seconds",
    title: "Initial Attention Window",
    concept: "نافذة الانتباه الأولى",
    description:
      "بداية الفيديو يجب أن تجعل المشاهد يفهم بسرعة لماذا يستحق الفيديو وقتَه.",
    signals: [
      "فكرة واضحة",
      "سؤال",
      "نتيجة متوقعة",
      "مفارقة",
      "تصريح غير متوقع"
    ]
  },

  {
    id: "attention_pattern_interrupt",
    title: "Pattern Interrupt",
    concept: "كسر النمط",
    description:
      "التغيير المفاجئ في الصورة أو الصوت أو الإيقاع يمكن أن يعيد توجيه الانتباه.",
    signals: [
      "قطع مفاجئ",
      "تغيير زاوية",
      "تغيير حجم اللقطة",
      "صمت مفاجئ",
      "عنصر بصري جديد"
    ]
  },

  {
    id: "attention_information_gap",
    title: "Information Gap",
    concept: "فجوة المعلومات",
    description:
      "وجود معلومة ناقصة يريد المشاهد معرفتها يمكن أن يخلق دافعاً للاستمرار.",
    signals: [
      "سؤال غير مجاب",
      "نتيجة مؤجلة",
      "معلومة ناقصة",
      "وعد بكشف لاحق"
    ]
  }
];

/* =========================================================
   HOOKS
   ========================================================= */

const hooks = [
  {
    id: "hook_direct_benefit",
    type: "direct-benefit",
    title: "Direct Benefit Hook",
    structure:
      "إذا كنت تريد X، شاهد هذا لأنك ستتعلم Y.",
    strength: "high",
    useWhen: [
      "المحتوى تعليمي",
      "هناك نتيجة واضحة",
      "الجمهور يعرف المشكلة"
    ]
  },

  {
    id: "hook_curiosity",
    type: "curiosity",
    title: "Curiosity Hook",
    structure:
      "هناك معلومة أو نتيجة غير متوقعة سيتم كشفها.",
    strength: "high",
    useWhen: [
      "الفكرة تحمل مفاجأة",
      "هناك معلومة غير بديهية",
      "يمكن تأخير الإجابة دون خداع"
    ]
  },

  {
    id: "hook_contrarian",
    type: "contrarian",
    title: "Contrarian Hook",
    structure:
      "تحدي اعتقاد شائع أو تقديم وجهة نظر معاكسة.",
    strength: "high",
    useWhen: [
      "الفكرة قابلة للنقاش",
      "يوجد اعتقاد شائع يمكن تحديه",
      "المحتوى يستطيع دعم الادعاء"
    ]
  },

  {
    id: "hook_story",
    type: "story",
    title: "Story Hook",
    structure:
      "ابدأ بلحظة أو مشكلة ثم اجعل المشاهد يريد معرفة ما حدث.",
    strength: "high",
    useWhen: [
      "التجربة الشخصية قوية",
      "هناك تحول",
      "هناك نتيجة تستحق المعرفة"
    ]
  },

  {
    id: "hook_question",
    type: "question",
    title: "Question Hook",
    structure:
      "سؤال محدد يهم الجمهور ويخلق حاجة للإجابة.",
    strength: "medium-high",
    useWhen: [
      "السؤال مرتبط مباشرة بالجمهور",
      "الإجابة ذات قيمة"
    ]
  }
];

/* =========================================================
   RETENTION
   ========================================================= */

const retention = [
  {
    id: "retention_progress",
    title: "Visible Progress",
    concept: "التقدم المستمر",
    description:
      "إظهار أن الفيديو يتحرك نحو نتيجة يقلل الإحساس بالجمود.",
    signals: [
      "مراحل",
      "قبل/بعد",
      "خطوات",
      "كشف تدريجي",
      "تصاعد"
    ]
  },

  {
    id: "retention_open_loop",
    title: "Open Loop",
    concept: "الحلقة المفتوحة",
    description:
      "ترك سؤال أو نتيجة غير مكتملة يدفع المشاهد لمتابعة الفيديو.",
    signals: [
      "سؤال",
      "وعد",
      "نتيجة مؤجلة",
      "قصة غير مكتملة"
    ]
  },

  {
    id: "retention_payoff",
    title: "Payoff",
    concept: "المكافأة",
    description:
      "يجب أن يحصل المشاهد على نتيجة أو معلومة أو شعور يتناسب مع الوعد الأول.",
    signals: [
      "إجابة",
      "كشف",
      "نتيجة",
      "تحول",
      "خلاصة"
    ]
  }
];

/* =========================================================
   STORYTELLING
   ========================================================= */

const storytelling = [
  {
    id: "story_problem_tension_resolution",
    title: "Problem → Tension → Resolution",
    structure: [
      "مشكلة",
      "تصعيد أو توتر",
      "حل أو نتيجة"
    ]
  },

  {
    id: "story_before_after",
    title: "Before → After",
    structure: [
      "الحالة السابقة",
      "التحول",
      "الحالة الجديدة"
    ]
  },

  {
    id: "story_personal_transformation",
    title: "Personal Transformation",
    structure: [
      "كنت أعتقد",
      "حدث شيء",
      "اكتشفت",
      "تغيرت"
    ]
  }
];

/* =========================================================
   PACING
   ========================================================= */

const pacing = [
  {
    id: "pacing_change_rate",
    title: "Change Rate",
    concept: "معدل التغيير",
    description:
      "الإيقاع لا يعني السرعة فقط؛ بل مقدار التغيير البصري أو المعلوماتي عبر الزمن.",
    signals: [
      "تغير اللقطات",
      "حركة",
      "نص جديد",
      "تغير صوتي",
      "معلومة جديدة"
    ]
  },

  {
    id: "pacing_monotony",
    title: "Monotony Risk",
    concept: "خطر الرتابة",
    description:
      "استمرار نفس الصورة والصوت والإيقاع لفترة طويلة قد يزيد احتمال فقدان الانتباه."
  }
];

/* =========================================================
   VISUAL
   ========================================================= */

const visual = [
  {
    id: "visual_subject_clarity",
    title: "Subject Clarity",
    concept: "وضوح العنصر الرئيسي",
    description:
      "يجب أن يكون واضحاً للمشاهد ما هو العنصر أو الشخص الذي ينبغي التركيز عليه."
  },

  {
    id: "visual_text_readability",
    title: "Text Readability",
    concept: "قابلية قراءة النص",
    signals: [
      "حجم مناسب",
      "تباين",
      "وقت ظهور كاف",
      "عدم ازدحام الشاشة"
    ]
  },

  {
    id: "visual_composition",
    title: "Composition",
    concept: "التكوين البصري",
    signals: [
      "توازن",
      "وضوح",
      "مساحة",
      "موضع الشخص",
      "مسار العين"
    ]
  }
];

/* =========================================================
   AUDIO
   ========================================================= */

const audio = [
  {
    id: "audio_voice_clarity",
    title: "Voice Clarity",
    concept: "وضوح الصوت",
    signals: [
      "وضوح الكلام",
      "مستوى مناسب",
      "ضجيج منخفض",
      "عدم تشويه"
    ]
  },

  {
    id: "audio_silence",
    title: "Strategic Silence",
    concept: "الصمت الاستراتيجي",
    description:
      "الصمت يمكن أن يستخدم لتأكيد لحظة أو خلق توقع بدلاً من اعتباره دائماً خطأ."
  }
];

/* =========================================================
   TEXT
   ========================================================= */

const text = [
  {
    id: "text_compression",
    title: "Information Compression",
    concept: "ضغط المعلومات",
    description:
      "النص على الشاشة يجب أن يضيف قيمة أو يوضح الرسالة بدلاً من تكرار الكلام حرفياً دائماً."
  },

  {
    id: "text_emphasis",
    title: "Visual Emphasis",
    concept: "التأكيد البصري",
    signals: [
      "كلمة أساسية",
      "رقم",
      "عبارة قصيرة",
      "تغيير بصري"
    ]
  }
];

/* =========================================================
   CURIOSITY
   ========================================================= */

const curiosity = [
  {
    id: "curiosity_unexpected",
    title: "Unexpected Information",
    concept: "المعلومة غير المتوقعة"
  },

  {
    id: "curiosity_prediction",
    title: "Prediction",
    concept: "التنبؤ",
    description:
      "جعل المشاهد يتوقع ما سيحدث ثم تقديم النتيجة يمكن أن يخلق مشاركة معرفية."
  }
];

/* =========================================================
   COGNITION
   ========================================================= */

const cognition = [
  {
    id: "cognition_chunking",
    title: "Chunking",
    concept: "تجميع المعلومات",
    description:
      "تقسيم المعلومات إلى وحدات مفهومة يمكن أن يساعد على تقليل التعقيد."
  },

  {
    id: "cognition_schema",
    title: "Existing Schemas",
    concept: "المعرفة السابقة",
    description:
      "فهم ما يعرفه الجمهور مسبقاً يساعد على تحديد مقدار الشرح المطلوب."
  }
];

/* =========================================================
   EMOTION
   ========================================================= */

const emotion = [
  {
    id: "emotion_surprise",
    title: "Surprise",
    concept: "المفاجأة"
  },

  {
    id: "emotion_identification",
    title: "Identification",
    concept: "التماهي",
    description:
      "عندما يرى المشاهد نفسه أو تجربته في المحتوى، يمكن أن تصبح الرسالة أكثر ارتباطاً به."
  }
];

/* =========================================================
   VIEWER BEHAVIOR
   ========================================================= */

const viewerBehavior = [
  {
    id: "viewer_value_vs_effort",
    title: "Perceived Value vs Effort",
    description:
      "قرار الاستمرار يتأثر بالقيمة المتوقعة مقارنة بالجهد والوقت المطلوبين."
  },

  {
    id: "viewer_expectation_match",
    title: "Expectation Matching",
    description:
      "إذا وعدت البداية بشيء ثم قدم الفيديو شيئاً مختلفاً، قد يتضرر الاحتفاظ والثقة."
  }
];

/* =========================================================
   CONTENT PATTERNS
   ========================================================= */

const contentPatterns = [
  {
    id: "pattern_hook_payoff",
    title: "Hook → Development → Payoff",
    structure: [
      "Hook",
      "Development",
      "Payoff"
    ]
  },

  {
    id: "pattern_problem_solution",
    title: "Problem → Solution",
    structure: [
      "Problem",
      "Why it matters",
      "Solution"
    ]
  },

  {
    id: "pattern_claim_proof",
    title: "Claim → Proof",
    structure: [
      "Claim",
      "Evidence",
      "Conclusion"
    ]
  }
];

/* =========================================================
   GENERAL PRINCIPLES
   ========================================================= */

const principles = [
  {
    id: "principle_clarity_before_complexity",
    title: "Clarity Before Complexity",
    statement:
      "وضوح الفكرة أهم من إضافة عناصر كثيرة."
  },

  {
    id: "principle_promise_payoff",
    title: "Promise → Payoff",
    statement:
      "كل وعد في البداية يجب أن يحصل على مكافأة أو تفسير مناسب."
  },

  {
    id: "principle_context_matters",
    title: "Context Matters",
    statement:
      "لا يوجد Hook أو أسلوب واحد مضمون لكل جمهور أو موضوع أو منصة."
  },

  {
    id: "principle_measure_reality",
    title: "Measure Reality",
    statement:
      "النتائج الفعلية للحساب يجب أن تستخدم لتحديث التوصيات الشخصية."
  }
];

/* =========================================================
   GENERAL RULES
   ========================================================= */

const rules = [
  {
    id: "rule_hook_relevance",
    condition: "hook_relevance",
    rule:
      "قوة الهوك لا تعني شيئاً إذا لم يكن مرتبطاً مباشرة بوعد الفيديو."
  },

  {
    id: "rule_retention_context",
    condition: "retention",
    rule:
      "انخفاض الاحتفاظ لا يعني تلقائياً أن المشكلة في الهوك؛ يجب فحص الإيقاع، وضوح الفكرة، التطور والمكافأة."
  },

  {
    id: "rule_visual_audio_interaction",
    condition: "multimodal",
    rule:
      "الصورة والصوت والنص يجب تحليلها كمنظومة واحدة وليس كعناصر منفصلة فقط."
  },

  {
    id: "rule_personal_learning_priority",
    condition: "personal_memory_available",
    rule:
      "عند توفر نتائج حقيقية كافية للحساب، يجب إعطاء وزن أعلى للإشارات الشخصية مقارنة بالافتراضات العامة."
  }
];

/* =========================================================
   LOAD DATA
   ========================================================= */

psychology.forEach((item) => addKnowledge("psychology", item));
attention.forEach((item) => addKnowledge("attention", item));
hooks.forEach((item) => addKnowledge("hooks", item));
retention.forEach((item) => addKnowledge("retention", item));
storytelling.forEach((item) => addKnowledge("storytelling", item));
pacing.forEach((item) => addKnowledge("pacing", item));
visual.forEach((item) => addKnowledge("visual", item));
audio.forEach((item) => addKnowledge("audio", item));
text.forEach((item) => addKnowledge("text", item));
curiosity.forEach((item) => addKnowledge("curiosity", item));
cognition.forEach((item) => addKnowledge("cognition", item));
emotion.forEach((item) => addKnowledge("emotion", item));
viewerBehavior.forEach((item) =>
  addKnowledge("viewerBehavior", item)
);
contentPatterns.forEach((item) =>
  addKnowledge("contentPatterns", item)
);

principles.forEach((item) => addPrinciple(item));
rules.forEach((item) => addRule(item));

contentPatterns.forEach((item) => addPattern(item));

/* =========================================================
   EVIDENCE FOUNDATION
   ========================================================= */

addEvidence({
  id: "evidence_foundation_psychology",
  type: "research-domain",
  domain: "psychology",
  note:
    "Knowledge structure is designed to accommodate research-backed findings and later source-level references."
});

addEvidence({
  id: "evidence_foundation_content",
  type: "research-domain",
  domain: "content-science",
  note:
    "Content patterns should be treated as hypotheses and updated against observed performance."
});

/* =========================================================
   EXPORT
   ========================================================= */

export const MTIKnowledgeData = {
  psychology,
  attention,
  hooks,
  retention,
  storytelling,
  pacing,
  visual,
  audio,
  text,
  curiosity,
  cognition,
  emotion,
  viewerBehavior,
  contentPatterns,
  principles,
  rules
};

export default MTIKnowledgeData;
