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
  },

  {
    id: "hook_shock",
    type: "shock",
    title: "Shock Hook",
    structure:
      "معلومة أو نتيجة صادمة/غير متوقعة تُقال فوراً بدون تمهيد.",
    strength: "high",
    useWhen: [
      "الرقم أو الحقيقة فعلاً غير متوقعة وموثوقة",
      "الجمهور عنده افتراض شائع بيتكسر بهالمعلومة"
    ]
  },

  {
    id: "hook_problem",
    type: "problem",
    title: "Problem Hook",
    structure:
      "تسمية مشكلة محددة يعيشها الجمهور بوضوح تام قبل أي حل.",
    strength: "high",
    useWhen: [
      "المشكلة معروفة ومؤلمة فعلاً للجمهور المستهدف",
      "في حل حقيقي جاي بالفيديو"
    ]
  },

  {
    id: "hook_transformation",
    type: "transformation",
    title: "Transformation Hook",
    structure:
      "عرض فرق واضح بين حالة قبل وحالة بعد (نتيجة ملموسة).",
    strength: "high",
    useWhen: [
      "في نتيجة قابلة للعرض بصرياً أو رقمياً",
      "المحتوى بصري (موضة/مكياج/لياقة) أو فيه دليل ملموس"
    ]
  },

  {
    id: "hook_confession",
    type: "confession",
    title: "Confession Hook",
    structure:
      "اعتراف شخصي صريح يخلق قرب وثقة فورية مع المشاهد.",
    strength: "medium-high",
    useWhen: [
      "برند شخصي أو محتوى فيه صدق وتجربة حقيقية",
      "الاعتراف فعلاً صحيح ومو مصطنع"
    ]
  },

  {
    id: "hook_pattern_interrupt",
    type: "pattern_interrupt",
    title: "Pattern Interrupt Hook",
    structure:
      "كسر توقع بصري أو لفظي مفاجئ يوقف عادة السكرول الآلي.",
    strength: "high",
    useWhen: [
      "في عنصر بصري أو حركي غير معتاد بأول لقطة",
      "الفيديو قادر يفي بالوعد بعد الكسر، مو خدعة فاضية"
    ]
  },

  {
    id: "hook_prediction_error",
    type: "prediction_error",
    title: "Prediction Error Hook",
    structure:
      "تقديم توقع بديهي ثم كسره فوراً بنتيجة عكسية أو غير متوقعة.",
    strength: "high",
    useWhen: [
      "في نتيجة حقيقية تخالف التوقع الشائع",
      "مجالات الصحة والمكياج (قبل/بعد غير متوقع)"
    ]
  },

  {
    id: "hook_self_relevance",
    type: "self_relevance",
    title: "Self-Relevance Hook",
    structure:
      "مخاطبة مباشرة لفئة محددة بحيث المشاهد يحس الفيديو موجّه له شخصياً.",
    strength: "high",
    useWhen: [
      "الجمهور المستهدف واضح ومحدد",
      "مجالات الصحة والتسويق حيث التخصيص مهم"
    ]
  },

  {
    id: "hook_emotional_arousal",
    type: "emotional_arousal",
    title: "Emotional Arousal Hook",
    structure:
      "جملة أو مشهد يستثير مشاعر قوية فورية (حماس، تأثر، غضب بنّاء) من الثانية الأولى.",
    strength: "high",
    useWhen: [
      "المحتوى التحفيزي أو العاطفي",
      "فيه لحظة حقيقية تستاهل الإحساس، مش استعراض مصطنع"
    ]
  },

  {
    id: "hook_narrative_tension",
    type: "narrative_tension",
    title: "Narrative Tension Hook",
    structure:
      "فتح قصة بلحظة توتر أو عقدة غير محلولة تخلق حاجة نفسية لمعرفة كيف انحلت.",
    strength: "high",
    useWhen: [
      "في قصة حقيقية فيها منعطف أو صعوبة",
      "المحتوى التحفيزي أو الشخصي"
    ]
  },

  {
    id: "hook_novelty",
    type: "novelty",
    title: "Novelty Hook",
    structure:
      "عرض شيء غير مألوف بصرياً أو مفاهيمياً يكسر التوقع الاعتيادي لهذا النوع من المحتوى.",
    strength: "medium-high",
    useWhen: [
      "مجالات الموضة والكوميدي حيث الجدة عنصر أساسي",
      "في زاوية أو تنفيذ لم يشاهده الجمهور من قبل فعلاً"
    ]
  }
];

/* =========================================================
   PLATFORM SIGNALS
   ========================================================= */

/*
  IMPORTANT:
  Platform algorithms change frequently and are not publicly
  verifiable in detail. These entries are treated as
  "heuristic" / practical operating knowledge (format and
  audience-behavior differences), not confirmed algorithm
  facts. They should be revisited as the tool learns from
  real account performance (see MTIGlobalLearningService).
*/

const platformSignals = [
  {
    id: "platform_instagram_reels",
    platform: "instagram_reels",
    title: "Instagram Reels",
    evidenceLevel: "heuristic",
    audienceBehavior:
      "جمهور إنستغرام أقرب لاستكشاف بصري/لايف ستايل، وغالباً يتفاعل أكتر مع الشكل الجمالي والقصص الشخصية.",
    formatNotes: [
      "الكابشن وسيلة إضافية للسياق، مش بديل عن الهوك المرئي",
      "الصوت الترند بيزيد فرصة الوصول لكن ما بيعوض عن ضعف أول 3 ثواني",
      "الجمهور يتوقع جودة بصرية أعلى نسبياً من تيك توك"
    ],
    useWhen: ["برند شخصي", "لايف ستايل", "منتج/تسويق بصري"]
  },

  {
    id: "platform_tiktok",
    platform: "tiktok",
    title: "TikTok",
    evidenceLevel: "heuristic",
    audienceBehavior:
      "جمهور تيك توك أكتر تسامحاً مع الخام/غير المصقول، وبيكافئ الأصالة والسرعة بالوصول للفكرة أكتر من الصقل البصري.",
    formatNotes: [
      "التأخير بالوصول للفكرة أخطر هون من إنستغرام",
      "التفاعل بالتعليقات والـ duets/stitches جزء أساسي من دورة حياة الفيديو",
      "المحتوى الجدلي أو القابل للنقاش بينتشر أسرع"
    ],
    useWhen: ["محتوى جدلي/رأي", "تعليمي سريع", "ترند"]
  },

  {
    id: "platform_youtube_shorts",
    platform: "youtube_shorts",
    title: "YouTube Shorts",
    evidenceLevel: "heuristic",
    audienceBehavior:
      "جمهور يوتيوب شورتس غالباً بيجي من عادة بحث/تعلم، وبيكافئ الوضوح والقيمة المباشرة أكتر من الترند اللحظي.",
    formatNotes: [
      "العناوين الضمنية (أول جملة/نص على الشاشة) قريبة بوظيفتها من عنوان فيديو يوتيوب عادي",
      "الجمهور أكتر صبراً شوي مع مقدمة فيها سياق، طالما وصلت لفايدة واضحة بسرعة",
      "الفيديو ممكن يتضم بقنوات بحث طويل الأمد، مش بس اكتشاف لحظي"
    ],
    useWhen: ["تعليمي", "توثيقي/شرح", "محتوى بقيمة مرجعية طويلة الأمد"]
  }
];

/* =========================================================
   NICHES
   ========================================================= */

/*
  Niche-specific guidance layers.

  These do NOT replace the universal psychology/attention
  knowledge above — they specialize how it gets applied for
  a given content goal. A niche entry should never contradict
  a "strong" evidence-level principle; it only adjusts tone,
  hook style, and priorities.
*/

const niches = [
  {
    id: "niche_marketing",
    name: "تسويق ومنتجات",
    primaryGoal: "دفع قرار (شراء، تسجيل، تجربة منتج)",
    hookStyles: ["direct-benefit", "contrarian", "curiosity"],
    painPoints: [
      "الجمهور متشكك بشكل افتراضي من أي محتوى يشبه إعلان",
      "الوعد لازم يكون قابل للإثبات بسرعة داخل نفس الفيديو"
    ],
    toneGuidance:
      "مباشر وواثق، بس بدون مبالغة تخلي المحتوى يحس متل إعلان تقليدي.",
    commonMistakes: [
      "تأخير ذكر الفايدة الفعلية للمنتج لآخر الفيديو",
      "الاعتماد على الحماس بدل الدليل/العرض الفعلي"
    ]
  },

  {
    id: "niche_personal_brand",
    name: "برند شخصي",
    primaryGoal: "بناء ثقة وتذكر طويل الأمد، مش بالضرورة فيرال لحظي",
    hookStyles: ["story", "confession", "question"],
    painPoints: [
      "الاتساق بالصوت/الأسلوب أهم من أي فيديو منفرد",
      "الجمهور بيتذكر الشخص أكتر من المعلومة الواحدة"
    ],
    toneGuidance:
      "أصيل ومتّسق مع نفس النبرة عبر كل الفيديوهات — التنوع بالموضوع أوكي، التنوع بالشخصية لأ.",
    commonMistakes: [
      "تقليد أسلوب صانع محتوى تاني بدل تطوير صوت شخصي واضح",
      "عدم وجود خيط واحد واضح يربط بين الفيديوهات (مين انت وليش حدا يتابعك)"
    ]
  },

  {
    id: "niche_motivational",
    name: "تحفيزي",
    primaryGoal: "إثارة عاطفة/طاقة تدفع لفعل أو تغيير شعور",
    hookStyles: ["story", "transformation", "contrarian"],
    painPoints: [
      "الكليشيهات الجاهزة بتفقد تأثيرها بسرعة مع التكرار",
      "غياب مثال/دليل ملموس بيخلي الكلام يحس عام وسطحي"
    ],
    toneGuidance:
      "عاطفي بس مبني على مثال أو تجربة محددة، مش شعارات عامة بدون سياق.",
    commonMistakes: [
      "الاعتماد الكامل على موسيقى/نبرة صوت لخلق تأثير بدون محتوى فعلي وراها",
      "رسالة عامة جداً ممكن تنقال بأي فيديو تاني بدون تغيير"
    ]
  },

  {
    id: "niche_educational",
    name: "تعليمي",
    primaryGoal: "نقل معلومة/مهارة بوضوح قابل للتطبيق",
    hookStyles: ["direct-benefit", "question", "curiosity"],
    painPoints: [
      "الحمل المعرفي أخطر خطر هون — كتير معلومات بوقت قصير",
      "الجمهور بيقيّم المصداقية بسرعة من طريقة الشرح"
    ],
    toneGuidance:
      "واضح ومنظم، فكرة وحدة أساسية بالفيديو مش عدة أفكار متزاحمة.",
    commonMistakes: [
      "محاولة تغطية كل شي عن الموضوع بفيديو وحد بدل التركيز",
      "غياب مثال عملي يوضح المعلومة النظرية"
    ]
  },

  {
    id: "niche_comedy",
    name: "كوميدي/ترفيهي",
    primaryGoal: "تفاعل وإعادة مشاهدة/مشاركة",
    hookStyles: ["pattern_interrupt", "shock", "curiosity"],
    painPoints: [
      "التوقيت (timing) أهم من النص نفسه بكتير من الأحيان",
      "الإطالة بعد نقطة الذروة بتضعف الأثر"
    ],
    toneGuidance:
      "خفيف وسريع الإيقاع، ونهاية حادة بدون سحب زايد بعد النكتة/المفاجأة.",
    commonMistakes: [
      "شرح النكتة بعد ما تنقال (بيقتل تأثيرها)",
      "مونتاج بطيء بمنطقة الذروة"
    ]
  },

  {
    id: "niche_health",
    name: "صحة ولياقة",
    primaryGoal: "بناء ثقة معرفية ودفع لتغيير سلوك أو عادة",
    hookStyles: ["shock", "problem", "direct-benefit"],
    painPoints: [
      "الجمهور حسّاس تجاه الادعاءات المبالغ فيها ومتشكك منها بسرعة",
      "معلومة صحية غير دقيقة أو غير مسندة بتضرب مصداقية الحساب كامل"
    ],
    toneGuidance:
      "واثق بس حذر، وتجنب القطعية بمواضيع فيها خلاف علمي أو تحتاج رأي مختص.",
    commonMistakes: [
      "تعميم نتيجة فردية أو حالة واحدة كأنها قاعدة عامة للكل",
      "غياب أي تنويه إنو المحتوى مو بديل عن استشارة مختص عند الحاجة"
    ]
  },

  {
    id: "niche_real_estate",
    name: "عقارات",
    primaryGoal: "بناء ثقة وجذب استفسار جدي (لييد) أكتر من فيرال لحظي",
    hookStyles: ["curiosity", "direct-benefit", "contrarian"],
    painPoints: [
      "الجمهور بيقيّم المصداقية من التفاصيل الملموسة (سعر، موقع، مساحة) مش الكلام العام",
      "محتوى عقاري بيتقدم غالباً كجولة/عرض بصري أكتر من كلام مباشر بالكاميرا"
    ],
    toneGuidance:
      "عملي ومباشر، مع إبراز رقم أو تفصيل ملموس بأول ثواني (سعر، عائد، ميزة فريدة).",
    commonMistakes: [
      "جولة بصرية طويلة بدون أي معلومة أو سياق مكتوب على الشاشة",
      "غياب أي دعوة واضحة لخطوة تالية (تواصل، حجز معاينة)"
    ]
  },

  {
    id: "niche_fashion",
    name: "موضة وأزياء",
    primaryGoal: "إلهام بصري وتموضع ذوق/ستايل شخصي",
    hookStyles: ["transformation", "curiosity", "pattern_interrupt"],
    painPoints: [
      "المحتوى بصري بشكل أساسي — جودة الصورة والإضاءة تلعب دور مباشر بالانطباع الأول",
      "الترند بيتغير بسرعة، والمحتوى القديم بيفقد قيمته الترويجية أسرع من مجالات تانية"
    ],
    toneGuidance:
      "بصري وسريع، مع لحظة تحول أو مقارنة واضحة (قبل/بعد، تركيبة/نتيجة).",
    commonMistakes: [
      "عرض قطع/ستايلات بدون أي تنظيم بصري أو نقطة تركيز واضحة",
      "غياب لحظة 'تحول' واضحة بتشد الاستمرار بالمشاهدة"
    ]
  },

  {
    id: "niche_makeup",
    name: "مكياج وتجميل",
    primaryGoal: "إثبات مهارة/نتيجة وبناء ثقة بالتقنية أو المنتج",
    hookStyles: ["transformation", "curiosity", "direct-benefit"],
    painPoints: [
      "قبل/بعد هو النواة الفعلية للإقناع، والتأخير بالوصول لأول لمحة نتيجة مكلف جداً",
      "الجمهور بيفرق بسرعة بين مهارة حقيقية وفلاتر/تعديل مبالغ فيه"
    ],
    toneGuidance:
      "واثق وعملي، مع إظهار خطوة أو نتيجة ملموسة بأول ثواني قليلة.",
    commonMistakes: [
      "شرح كل خطوة بالتفصيل بدل التركيز على اللحظة الأهم (النتيجة أو التقنية المميزة)",
      "الاعتماد الكامل على الفلتر/الإضاءة لإخفاء ضعف بالتنفيذ الفعلي"
    ]
  }
];

/* =========================================================
   AUDIENCE REGIONS
   ========================================================= */

/*
  IMPORTANT:
  These entries describe dialect, tone, and content-format
  preferences that are common practice in Arabic-language
  content/marketing work. They are heuristic and about
  communication style and format — NOT claims about people's
  character, intelligence, or worth. They should never be
  used to stereotype individuals, only to inform tone/dialect
  choices for content aimed at a given audience.
*/

const audienceRegions = [
  {
    id: "region_gulf",
    region: "الخليج",
    evidenceLevel: "heuristic",
    dialectNotes:
      "جمهور متعدد اللهجات الخليجية (سعودي، إماراتي، كويتي...)؛ اللهجة البيضاء/الفصحى المبسطة غالباً أوسع وصولاً من لهجة محلية واحدة محددة.",
    formatPreferences: [
      "محتوى فخم/عالي الإنتاج بيلقى تقبل جيد، خصوصاً بمجالات المنتجات والعقارات",
      "الجمهور فيه شريحة واسعة مهتمة بمحتوى الأعمال وريادة الأعمال والاستثمار"
    ],
    sensitivities: [
      "تجنب النكات أو الإشارات الدينية/السياسية الحساسة",
      "الفروقات الثقافية بين دول الخليج نفسها موجودة، تعميم لهجة وحدة على كل الخليج بيقلل الدقة"
    ]
  },

  {
    id: "region_levant_lebanon",
    region: "لبنان",
    evidenceLevel: "heuristic",
    dialectNotes:
      "اللهجة اللبنانية قريبة بالفهم من باقي الشام، والمزج بين العربية والفرنسية/الإنجليزية شائع وطبيعي بمحتوى الموضة/لايف ستايل.",
    formatPreferences: [
      "الجمهور متقبل للفكاهة الساخرة/اللاذعة أكتر من مناطق تانية",
      "محتوى الموضة والطعام ولايف ستايل عنده تفاعل قوي تاريخياً"
    ],
    sensitivities: [
      "المواضيع السياسية/الطائفية حساسة جداً وبتنقسم الجمهور بسرعة",
      "الوضع الاقتصادي مؤثر على نبرة المحتوى (حساسية تجاه الاستعراض المبالغ فيه بمحتوى الرفاهية)"
    ]
  },

  {
    id: "region_levant_syria",
    region: "سوريا",
    evidenceLevel: "heuristic",
    dialectNotes:
      "اللهجة الشامية قريبة من اللبنانية والأردنية بالفهم، مع فروقات محلية بالمفردات بين المدن.",
    formatPreferences: [
      "محتوى فيه دفء إنساني/عائلي بيلقى صدى قوي",
      "القصص الشخصية والتجارب الحقيقية بتشتغل أفضل من المحتوى الترويجي المباشر"
    ],
    sensitivities: [
      "الوضع السياسي/الإنساني حساس جداً، تجنب أي إشارة عابرة أو سطحية إله",
      "الفروقات الاقتصادية بين الجمهور واسعة، محتوى الرفاهية لازم يُقدَّم بحذر"
    ]
  },

  {
    id: "region_jordan",
    region: "الأردن",
    evidenceLevel: "heuristic",
    dialectNotes:
      "اللهجة الأردنية وسط بين الشامية والخليجية بالنطق، وقريبة الفهم لمعظم الجمهور العربي.",
    formatPreferences: [
      "الجمهور متوازن بين المحتوى الجدي (تعليمي/أعمال) والترفيهي",
      "محتوى الشباب وريادة الأعمال الصغيرة له حضور واضح"
    ],
    sensitivities: [
      "الحذر بالمواضيع الإقليمية/السياسية الحساسة بالمنطقة",
      "تجنب تعميم اللهجة الأردنية كأنها هوية واحدة متجانسة — فيها فروقات بين عمان والمحافظات"
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
   CALL TO ACTION (CTA)
   ========================================================= */

const cta = [
  {
    id: "cta_soft_engagement",
    type: "soft-engagement",
    title: "دعوة تفاعل خفيفة",
    structure:
      "طلب فعل منخفض التكلفة (تعليق، حفظ، مشاركة) مرتبط مباشرة بمحتوى الفيديو نفسه.",
    example:
      "احفظوا الفيديو قبل ما تنسوا الخطوات.",
    strength: "medium",
    useWhen: [
      "الجمهور بعده بمرحلة تعارف/ثقة أولية",
      "المحتوى تعليمي أو مرجعي (بيستاهل حفظ)"
    ]
  },

  {
    id: "cta_question_engagement",
    type: "question-engagement",
    title: "دعوة تفاعل بسؤال",
    structure:
      "سؤال مباشر للجمهور بآخر الفيديو بيحفز تعليقات حقيقية بدل طلب عام.",
    example:
      "شو رأيكن، جربتوا هالشي قبل؟ قولولي بالتعليقات.",
    strength: "medium-high",
    useWhen: [
      "الموضوع فيه مجال لآراء متعددة",
      "الهدف زيادة التفاعل مش بس الوصول"
    ]
  },

  {
    id: "cta_hard_conversion",
    type: "hard-conversion",
    title: "دعوة تحويل مباشرة",
    structure:
      "طلب فعل واضح وملموس خارج الفيديو (رابط بالبايو، تواصل، حجز، شراء).",
    example:
      "الرابط بالبايو لو حابين تجربوا/تحجزوا.",
    strength: "high",
    useWhen: [
      "الهدف تسويقي/عقاري/بيع مباشر",
      "فيه ثقة كافية مبنية بالفيديو قبل الطلب"
    ]
  },

  {
    id: "cta_follow_identity",
    type: "follow-identity",
    title: "دعوة متابعة مبنية على هوية",
    structure:
      "ربط المتابعة بوعد مستمر (نوع محتوى قادم) مش بطلب عام بدون سبب.",
    example:
      "تابعوني إذا بدكن أشارك أكتر عن هالموضوع.",
    strength: "medium",
    useWhen: [
      "برند شخصي وهدفه بناء جمهور طويل الأمد",
      "فيه خيط واضح لمحتوى قادم مرتبط"
    ]
  },

  {
    id: "cta_challenge_share",
    type: "challenge-share",
    title: "دعوة تحدي/مشاركة",
    structure:
      "تحدي بسيط بيشجع المشاهد يشارك تجربته أو يشارك الفيديو مع حدا تاني.",
    example:
      "شاركوا الفيديو مع صاحب/صاحبة بتعرفوا محتاجينه.",
    strength: "medium-high",
    useWhen: [
      "المحتوى فيه قيمة واضحة تستاهل تشارك مع طرف تالت",
      "كوميدي/تحفيزي وفيه لحظة تستاهل تنعاد"
    ]
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
platformSignals.forEach((item) =>
  addKnowledge("platformSignals", item)
);
niches.forEach((item) =>
  addKnowledge("niches", item)
);
audienceRegions.forEach((item) =>
  addKnowledge("audienceRegions", item)
);
cta.forEach((item) =>
  addKnowledge("cta", item)
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
  platformSignals,
  niches,
  audienceRegions,
  cta,
  contentPatterns,
  principles,
  rules
};

export default MTIKnowledgeData;
