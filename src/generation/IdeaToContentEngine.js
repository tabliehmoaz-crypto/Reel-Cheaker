/**
 * IdeaToContentEngine.js
 * ---------------------------------------------------------
 * موديول التوليد: فكرة المستخدم ← هوكات ← سكربت ← تقسيم مونتاج
 *
 * هاد المسار العكسي لـ reel-engine.js:
 * reel-engine.js  : فيديو موجود  → تحليل
 * هاد الملف       : فكرة نصية   → خطة محتوى كاملة
 *
 * لا يستدعي أي API خارجي أو نموذج لغوي سحابي. كل الناتج
 * مبني على قاعدة المعرفة المحلية (MTIKnowledgeData) —
 * مبادئ الانتباه، الهوكات، المجالات، المنصات، المناطق،
 * وأنواع الـ CTA — وهاي بالضبط النقطة يلي بتخليه "مدرَّب"
 * مش شات بوت عام بيرتجل كل مرة.
 *
 * محلي بالكامل (local-first)، لا يوجد اتصال خارجي.
 */

import { MTIKnowledgeData } from "../knowledge/MTIKnowledgeData.js";

const {
  hooks: HOOK_TEMPLATES,
  niches: NICHES,
  platformSignals: PLATFORMS,
  audienceRegions: REGIONS,
  cta: CTA_TYPES
} = MTIKnowledgeData;

/* =========================================================
   أدوات مساعدة عامة
   ========================================================= */

function findById(list, id) {
  return list.find((item) => item.id === id) || null;
}

function findByField(list, field, value) {
  if (!value) return null;
  return (
    list.find(
      (item) =>
        item[field] === value ||
        item.id === value
    ) || null
  );
}

function pickN(list, n) {
  return list.slice(0, n);
}

/* =========================================================
   توليد نصوص الهوك من الفكرة
   ---------------------------------------------------------
   كل نوع هوك عنده طريقة صياغة مختلفة. هون منحول فكرة
   المستخدم (نص حر) لصياغة فعلية قابلة للاستخدام، مش بس
   شرح نظري عن نوع الهوك.
   ========================================================= */

function craftHookVariants(type, idea) {
  const clean = idea.trim();

  switch (type) {
    case "direct-benefit":
      return [
        `بهالفيديو رح تلاقي جواب واضح عن: "${clean}".`,
        `خلّيك لآخر الفيديو، رح أوريك طريقة عملية بخصوص: "${clean}".`,
        `في حل أبسط مما تتخيل لـ: "${clean}".`
      ];

    case "curiosity":
      return [
        `في تفصيل معظم الناس ما بيعرفوه بخصوص: "${clean}".`,
        `محدا بيحكيلك هالشي... وموضوعه: "${clean}".`,
        `فيه سبب خفي وراء: "${clean}" — وما حدا منتبهله.`
      ];

    case "contrarian":
      return [
        `يلي بيقولولك عادةً عن: "${clean}" مو دايماً صحيح.`,
        `انسى كل شي سمعته عن: "${clean}". هاد يلي فعلياً صار معي.`,
        `أغلب النصائح المتداولة عن: "${clean}" غلط جزئياً — وهون ليش.`
      ];

    case "story":
      return [
        `قبل فترة صار معي شي غيّر نظرتي بالكامل تجاه: "${clean}".`,
        `أول مرة جربت موضوع: "${clean}"، ما توقعت النتيجة تكون هيك.`,
        `هاي قصة حقيقية بخصوص: "${clean}"، وبتفيدك لو بتمر بنفس الشي.`
      ];

    case "question":
      return [
        `شو بتعرف فعلياً عن: "${clean}"؟`,
        `جربت قبل الموضوع يلي اسمه: "${clean}"؟`,
        `ليش أغلب الناس بتغلط بموضوع: "${clean}"؟`
      ];

    case "shock":
      return [
        `ما تصدق شو صار لما جربت: "${clean}".`,
        `النتيجة كانت صادمة بصراحة بخصوص: "${clean}".`,
        `شي واحد بس غيّر نظرتي بالكامل عن: "${clean}".`
      ];

    case "problem":
      return [
        `إذا بتعاني من موضوع: "${clean}"، هاد الفيديو إلك تحديداً.`,
        `أكبر مشكلة بترجع لموضوع: "${clean}" هي إنو حدا ما بيقلك هالتفصيل.`,
        `"${clean}" مشكلة أكبر مما نحس فيها، وهون ليش.`
      ];

    case "transformation":
      return [
        `من صفر خبرة لنتيجة حقيقية بخصوص: "${clean}".`,
        `شوف الفرق قبل وبعد ما طبقت هالطريقة بخصوص: "${clean}".`,
        `التغيير اللي صار معي بخصوص: "${clean}" خلال فترة قصيرة كان لافت.`
      ];

    case "confession":
      return [
        `رح اعترفلك بشي ما كنت أحب احكي عنه بخصوص: "${clean}".`,
        `بصراحة، لفترة طويلة كنت غلطان بموضوع: "${clean}".`,
        `ما كنت مرتاح احكي هالشي، بس حسيت لازم أشارك تجربتي مع: "${clean}".`
      ];

    case "pattern_interrupt":
      return [
        `وقف — قبل ما تكمل سكرول، لازم تشوف هاد بخصوص: "${clean}".`,
        `مش يلي متوقعه... وموضوعه: "${clean}".`,
        `هاد آخر شي كنت رح اتوقعه بخصوص: "${clean}".`
      ];

    case "prediction_error":
      return [
        `توقعت نتيجة معينة، بس يلي صار مع: "${clean}" كان عكس المتوقع.`,
        `المفروض تجي نتيجة معينة... بس اللي صار بخصوص: "${clean}" كان مختلف كلياً.`,
        `كل التوقعات انقلبت لما جربت هالطريقة بخصوص: "${clean}".`
      ];

    case "self_relevance":
      return [
        `إذا انت من ناس بتهتم بموضوع: "${clean}"، هاد الفيديو إلك بالضبط.`,
        `هاد الكلام موجه لكل حدا بيمر بنفس تجربة: "${clean}" هلق تحديداً.`,
        `لو بتشبهني بموضوع: "${clean}"، لازم تسمع هاد.`
      ];

    case "emotional_arousal":
      return [
        `فيه لحظة عشتها بخصوص: "${clean}" ما رح انساها أبداً.`,
        `صدقيني هالإحساس اللي جابه موضوع: "${clean}" ما بينوصف.`,
        `لسا فيني احس بنفس المشاعر لما بتذكر: "${clean}".`
      ];

    case "narrative_tension":
      return [
        `وصلت لنقطة بخصوص: "${clean}" حسيت فيها إنو ما في حل... لحد ما صار هاد.`,
        `كنت عالق/ة بموضوع: "${clean}" لفترة، وما كنت اعرف كيف رح تنحل القصة.`,
        `كل شي كان يوحي إنو موضوع: "${clean}" رح يفشل، لحد اللحظة الأخيرة.`
      ];

    case "novelty":
      return [
        `شي هيك بخصوص: "${clean}" ما شفته من قبل.`,
        `طريقة جديدة كلياً بخصوص: "${clean}"، مختلفة عن كل يلي شفته.`,
        `زاوية غير مطروقة أبداً عن: "${clean}".`
      ];

    default:
      return [clean];
  }
}

function buildHookOptions(niche, idea) {
  const styles =
    niche?.hookStyles?.length
      ? niche.hookStyles
      : ["curiosity", "direct-benefit", "question"];

  const options = [];

  for (const style of styles) {
    const template = findByField(HOOK_TEMPLATES, "type", style);

    if (!template) continue;

    options.push({
      type: style,
      variants: craftHookVariants(style, idea),
      basedOn: template.title,
      strength: template.strength,
      whyItFits: template.useWhen
    });
  }

  /*
    لو ما لقينا قوالب كافية (مثلاً مجال جديد بدون
    hookStyles معرّفة)، نرجع لخيارات افتراضية آمنة.
  */

  if (!options.length) {
    for (const template of pickN(HOOK_TEMPLATES, 3)) {
      options.push({
        type: template.type,
        variants: craftHookVariants(template.type, idea),
        basedOn: template.title,
        strength: template.strength,
        whyItFits: template.useWhen
      });
    }
  }

  return options;
}

/* =========================================================
   اختيار CTA مناسب حسب هدف المجال
   ========================================================= */

function pickCTA(niche) {
  if (!niche) return CTA_TYPES[0] || null;

  const goal = niche.primaryGoal || "";

  if (/شراء|حجز|تحويل|قرار/.test(goal)) {
    return findByField(CTA_TYPES, "type", "hard-conversion");
  }

  if (/ثقة|تذكر|برند/.test(goal)) {
    return findByField(CTA_TYPES, "type", "follow-identity");
  }

  if (/تفاعل|مشاركة/.test(goal)) {
    return findByField(CTA_TYPES, "type", "challenge-share");
  }

  return (
    findByField(CTA_TYPES, "type", "question-engagement") ||
    CTA_TYPES[0] ||
    null
  );
}

/* =========================================================
   بناء هيكل السكربت
   ---------------------------------------------------------
   بالاعتماد على درس "الجواب المبكر" (premature payoff) يلي
   بنيناه بالتحليل: السكربت المولّد هون مصمم أصلاً بحيث
   الجواب الكامل ما ينكشف بأول نص الفيديو، بل يتوزع على
   مراحل تحافظ على الفضول.
   ========================================================= */

function buildScriptSkeleton(idea, hookOption, niche, ctaChoice) {
  return {
    hook: {
      text: hookOption.variants[0],
      alternatives: hookOption.variants.slice(1),
      purpose: "شد الانتباه بأول 0.5-1 ثانية، بدون كشف الفكرة كاملة."
    },

    setup: {
      purpose:
        "وضع السياق: ليش هالموضوع مهم للمشاهد تحديداً، بدون إعطاء الجواب.",
      guidance: `اربط "${idea.trim()}" بمشكلة أو رغبة حقيقية يعرفها الجمهور المستهدف.`
    },

    escalation: {
      purpose:
        "طبقة توتر/فضول إضافية قبل الوصول للنتيجة — هاد يلي بيمنع 'الجواب المبكر' ويخلي المشاهد يكمل.",
      guidance:
        "ضيف تفصيل أو استثناء أو عائق كان لازم تتخطاه قبل ما توصل للنتيجة."
    },

    payoff: {
      purpose: "تسليم الفكرة/النتيجة الفعلية.",
      guidance:
        "لا تسلّم النتيجة كاملة إلا بعد ما المشاهد صار مستثمر بالقصة/السياق (تقريباً نص الفيديو أو بعده)."
    },

    cta: ctaChoice
      ? {
          type: ctaChoice.type,
          text: ctaChoice.example,
          purpose: ctaChoice.title
        }
      : null,

    nicheApplied: niche?.name || "عام"
  };
}

/* =========================================================
   تقسيم المونتاج (Montage Breakdown)
   ---------------------------------------------------------
   توزيع زمني تقريبي مبني على مبدأ الإيقاع (pacing) يلي
   استخدمناه بمحرك التحليل: مقاطع قصيرة أول الفيديو،
   وتغيير بصري واضح كل ٣-٥ ثواني تقريباً.
   ========================================================= */

function buildMontageBreakdown(targetDuration) {
  const duration = targetDuration || 20;

  const hookEnd = Math.min(2, duration * 0.1);
  const setupEnd = hookEnd + duration * 0.25;
  const escalationEnd = setupEnd + duration * 0.3;
  const payoffEnd = escalationEnd + duration * 0.25;

  return [
    {
      segment: "hook",
      timeRange: `0s - ${round1(hookEnd)}s`,
      purpose: "أول لقطة/جملة تشد الانتباه فوراً",
      editingNote: "قص سريع بدون مقدمة بصرية بطيئة، ابدأ من وسط الفعل."
    },
    {
      segment: "setup",
      timeRange: `${round1(hookEnd)}s - ${round1(setupEnd)}s`,
      purpose: "بناء السياق",
      editingNote: "تغيير بصري بسيط (زاوية/قربة) عشان ما تركد الصورة."
    },
    {
      segment: "escalation",
      timeRange: `${round1(setupEnd)}s - ${round1(escalationEnd)}s`,
      purpose: "طبقة فضول/توتر إضافية",
      editingNote: "ممكن نص على الشاشة أو وقفة قصيرة قبل الكشف."
    },
    {
      segment: "payoff",
      timeRange: `${round1(escalationEnd)}s - ${round1(payoffEnd)}s`,
      purpose: "تسليم النتيجة",
      editingNote: "لقطة أوضح/أقرب هون، هاد أهم جزء بصرياً بالفيديو."
    },
    {
      segment: "cta",
      timeRange: `${round1(payoffEnd)}s - ${round1(duration)}s`,
      purpose: "دعوة لاتخاذ إجراء",
      editingNote: "نص واضح على الشاشة يكرر الدعوة الصوتية."
    }
  ];
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

/* =========================================================
   ملاحظات المنصة والمنطقة (اختيارية)
   ========================================================= */

function getPlatformNotes(platformId) {
  const platform = findById(PLATFORMS, platformId) ||
    findByField(PLATFORMS, "platform", platformId);

  if (!platform) return null;

  return {
    platform: platform.title,
    audienceBehavior: platform.audienceBehavior,
    formatNotes: platform.formatNotes
  };
}

function getRegionNotes(regionId) {
  const region = findById(REGIONS, regionId) ||
    findByField(REGIONS, "region", regionId);

  if (!region) return null;

  return {
    region: region.region,
    dialectNotes: region.dialectNotes,
    formatPreferences: region.formatPreferences,
    sensitivities: region.sensitivities
  };
}

/* =========================================================
   الدالة الرئيسية
   ========================================================= */

/**
 * @param {Object} input
 * @param {string} input.idea - فكرة المستخدم كنص حر (مطلوب)
 * @param {string} [input.nicheId] - مثال: "niche_marketing"
 * @param {string} [input.platformId] - مثال: "instagram_reels"
 * @param {string} [input.regionId] - مثال: "region_jordan"
 * @param {number} [input.targetDuration] - بالثواني، افتراضي 20
 */
export function generateContentPlan({
  idea,
  nicheId,
  platformId,
  regionId,
  targetDuration
} = {}) {
  if (!idea || !idea.trim()) {
    return {
      success: false,
      error: "لازم تزودنا بفكرة نصية (idea) قبل التوليد."
    };
  }

  const niche = findById(NICHES, nicheId);

  const hookOptions = buildHookOptions(niche, idea);

  const chosenHook = hookOptions[0];

  const ctaChoice = pickCTA(niche);

  const script = buildScriptSkeleton(idea, chosenHook, niche, ctaChoice);

  const montage = buildMontageBreakdown(targetDuration);

  const platformNotes = getPlatformNotes(platformId);

  const regionNotes = getRegionNotes(regionId);

  return {
    success: true,

    idea: idea.trim(),

    niche: niche
      ? { id: niche.id, name: niche.name, primaryGoal: niche.primaryGoal }
      : null,

    hookOptions,

    script,

    montage,

    ctaOptions: pickN(CTA_TYPES, 3),

    platformNotes,

    regionNotes,

    warnings: [
      ...(!niche
        ? [
            "ما انحدد مجال (niche) معروف — استخدمنا هوكات عامة. حدد المجال لنتائج أدق."
          ]
        : []),
      ...(niche?.commonMistakes || []).map(
        (m) => `تنبيه لهالمجال: ${m}`
      )
    ]
  };
}

export default generateContentPlan;

/* =========================================================
   توليد أفكار من الصفر (بدون فكرة من المستخدم)
   ---------------------------------------------------------
   صراحة مهمة: هاد مو "إبداع" بمعنى فهم لغوي حر — هو نظام
   تركيبي (combinatorial) بيولّد أفكار حقيقية عبر مزج
   "زوايا محتوى" عامة (Angles) مع نقاط الألم والأخطاء
   الشائعة الحقيقية المخزنة أصلاً لكل مجال بقاعدة المعرفة.
   يعني كل فكرة طالعة مبنية على معطى حقيقي عن المجال، مش
   نص عشوائي أو مولّد من فراغ.
   ========================================================= */

const IDEA_ANGLES = [
  {
    id: "mistake_reveal",
    hookType: "contrarian",
    fromField: "commonMistakes",
    template: (item) => `أكتر غلطة شايفها بهالمجال: ${item}`
  },

  {
    id: "pain_point_solution",
    hookType: "problem",
    fromField: "painPoints",
    template: (item) => `طريقة عملية للتعامل مع: ${item}`
  },

  {
    id: "myth_bust",
    hookType: "prediction_error",
    fromField: "commonMistakes",
    template: (item) => `وهم شائع بهالمجال بخصوص: ${item} — والحقيقة مختلفة`
  },

  {
    id: "listicle",
    hookType: "curiosity",
    fromField: "painPoints",
    template: (item) => `أشياء ما حدا بيقلك ياها عن: ${item}`
  },

  {
    id: "personal_experience",
    hookType: "story",
    fromField: "painPoints",
    template: (item) => `قصة شخصية حقيقية حول التعامل مع: ${item}`
  }
];

/**
 * @param {Object} input
 * @param {string} input.nicheId - مطلوب، مثال: "niche_health"
 * @param {number} [input.count] - عدد الأفكار المطلوبة، افتراضي 5
 */
export function generateFreshIdeas({ nicheId, count = 5 } = {}) {
  const niche = findById(NICHES, nicheId);

  if (!niche) {
    return {
      success: false,
      error:
        "لازم تحدد مجال (nicheId) معروف حتى نقدر نولّد أفكار من قاعدة المعرفة الخاصة فيه."
    };
  }

  const ideas = [];

  for (const angle of IDEA_ANGLES) {
    const sourceItems = niche[angle.fromField] || [];

    for (const item of sourceItems) {
      ideas.push({
        idea: angle.template(item),
        angle: angle.id,
        suggestedHookType: angle.hookType,
        basedOn: item
      });

      if (ideas.length >= count) break;
    }

    if (ideas.length >= count) break;
  }

  return {
    success: true,

    niche: { id: niche.id, name: niche.name },

    ideas: ideas.slice(0, count),

    note:
      "هاي أفكار مبنية تركيبياً من نقاط ألم وأخطاء حقيقية مسجلة لهالمجال — مش توليد حر. اختر فكرة وحطها بـ generateContentPlan لتطويرها لهوك وسكربت كامل."
  };
}
