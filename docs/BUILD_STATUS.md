# MTI — حالة البناء الحية

⚠️ هاد الملف بيتحدث بعد **كل تعديل حقيقي** على المشروع. أي وقت
بدك تعرف "وين وصلنا بالضبط"، افتح هاد الملف بس — ما تحتاج تراجع
المحادثات القديمة ولا تسأل من جديد.

آخر تحديث: (يتحدث تلقائياً مع كل تعديل)

---

## طريقة القراءة

- ✅ **تم + مختبر** = مبني، واختبرته بالكود فعلياً (مش بس مكتوب)
- 🔨 **تم + غير مختبر بمتصفح** = الكود صحيح نحوياً ومنطقياً، بس محتاج
  اختبار حقيقي بمتصفح (فيديو حقيقي) قبل ما نعتبره جاهز ١٠٠٪
- ⏳ **لسا ما بلشنا فيه**

---

## PHASE 0 — الأساس (Video Intelligence)

| الميزة | الحالة | الملف |
|---|---|---|
| تحليل فيديو محلي (Hook/Pacing/Visual/Technical) | ✅ | `src/engine/reel-engine.js` |
| تحويل كلام لنص (Whisper محلي) | 🔨 | `src/ai/whisper.js` |
| كشف الجواب المبكر (Premature Payoff) | ✅ | `reel-engine.js` |
| كشف فجوات الصمت | ✅ | `reel-engine.js` |
| كشف هوك افتتاحي ضعيف | ✅ | `reel-engine.js` |
| كشف مقطع ثابت بصرياً طويل | ✅ | `reel-engine.js` |
| كشف إرهاق منتصف الفيديو | ✅ | `reel-engine.js` |
| تحليل CTA | ✅ | `reel-engine.js` |
| ربط داخلي كامل (Orchestrator→Pipeline→Adapter) | ✅ | `src/core/*` |

## PHASE 1 — قاعدة المعرفة (Content Intelligence - جزء)

| الميزة | الحالة | الملف |
|---|---|---|
| 13 مبدأ نفسي (evidence-graded) | ✅ | `src/ai/IntelligenceKnowledge.js` |
| 9 مجالات (Niches) | ✅ | `src/knowledge/MTIKnowledgeData.js` |
| 3 منصات (Platform Signals) | ✅ | نفس الملف |
| 4 مناطق جمهور عربي | ✅ | نفس الملف |
| 5 أنواع CTA | ✅ | نفس الملف |
| موديول توليد (فكرة←هوك←سكربت←مونتاج) | ✅ | `src/generation/IdeaToContentEngine.js` |

## PHASE 2 — توسيع الذكاء (شغالين فيها هلق)

| الميزة | الحالة |
|---|---|
| ملخص نهائي بلغة بشرية عن الفيديو (مو بس أرقام) | ✅ `buildHumanSummary` — اختبرته الآن بمعطيات واقعية، طلع نص عربي طبيعي |
| 🐛 إصلاح: `diagnosis` كان يترحسب ويضيع بصمت، صار يوصل بالنتيجة | ✅ |
| أنواع هوك أكتر (15 بدل 10) + 3 صياغات لكل نوع، مصلّحة لتكون مقاومة نحوياً لشكل الفكرة (جملة كاملة أو عبارة قصيرة) — مختبرة | ✅ |
| استخلاص "جوهر الكلام" الفعلي (extractive، مش فهم دلالي كامل) — `extractIdeaGist` مبني ومختبر. قيد معروف: ما بيفهم النفي (كلمة "مشكلة" بجملة "بدون مشكلة" بتنكشف غلط) | ✅ |
| توليد أفكار من الصفر (بدون فكرة من المستخدم) — `generateFreshIdeas` مبني ومختبر بمجالين + حالة خطأ. صياغة بعض الأفكار غير مصقولة أحياناً (بعض `painPoints` مكتوبة كوصف سلوك جمهور مش مشكلة مباشرة) | ✅ |
| Scene-by-scene analysis (`buildScenes` — تقسيم حسب نقاط تغير بصري فعلية) | ✅ |
| Attention Map (`buildAttentionMap` — مبنية على نفس نقاط dropOff/hook/CTA الموجودة، مش قراءة عقل) | ✅ |
| Content Type Classification (`classifyContentType` — heuristic بكلمات مفتاحية + مجال) | ✅ |
| Recommendation Priority (Fix First/Worth Testing/Keep) — `prioritizeRecommendations` | ✅ |

**PHASE 2 مكتملة بالكامل ✅**

## PHASE 3 — الحساب والذاكرة الشخصية

| الميزة | الحالة |
|---|---|
| Google Auth موصول بالتطبيق الرئيسي | 🔨 Firebase Google Redirect + account memory — يحتاج اختبار OAuth على الدومين النهائي |
| Account Profile (niche, جمهور, أهداف...) | ⏳ |
| Private Memory مفعّلة | ⏳ (بنية جاهزة: `MTIResultMemoryBridge`) |
| محادثة ما بعد النشر (إدخال Views/Shares...) | ⏳ |
| أفضل أيام/ساعات نشر | ⏳ |
| Learning Engine مفعّل | ⏳ (بنية جاهزة: `GrowthLearningEngine`) |

## PHASE 4 — التنبؤ والمقارنة

| الميزة | الحالة |
|---|---|
| Prediction Engine (توقع أداء قبل النشر) | ⏳ |
| Prediction vs Reality | ⏳ |
| Content DNA / Benchmarking | ⏳ |
| Experiment System موصول | ⏳ (بنية جاهزة: `ExperimentEngine.js`) |

## PHASE 5 — التعلم الجماعي والخصوصية

| الميزة | الحالة |
|---|---|
| Privacy Service مفعّل | ⏳ (بنية جاهزة: `MTIPrivacyService`) |
| Global Learning مفعّل | ⏳ (بنية جاهزة: `MTIGlobalLearningService`، معطّل حالياً) |
| Backend حقيقي لتجميع الأنماط المجهولة | ⏳ (يحتاج سيرفر/Firestore، مو موجود) |

## PHASE 6 — الواجهة والهوية

| الميزة | الحالة |
|---|---|
| index.html موحد يستخدم كل الطبقات فوق | 🔨 مبني، متصل فعلياً بـ analyzeReel + IdeaToContentEngine، صحيح نحوياً — محتاج اختبار حقيقي بمتصفح |
| الهوية البصرية (ألوان/خطوط/لوغو) | 🔨 MTI Navy/Gold/Syne/Inter + Dashboard/Landing responsive مطابق للمرجع — يحتاج اختبار بصري نهائي |
| واجهة ثنائية اللغة (عربي/English) | 🔨 مطبقة على الواجهة الأساسية والأزرار والحالات |
| تجربة موبايل/ديسكتوب منفصلة | 🔨 Responsive desktop/mobile layout |
| MTI Chat (محادثة واعية بسياق الحساب) | ⏳ |

---

## قاعدة العمل من هلق وصاعد

1. **ما نبني أي ميزة بدون ما نحدثلها سطر بهالجدول فوراً**
2. **ما ننتقل لمرحلة جديدة قبل ما نخلص يلي قبلها** (إلا لو كان في سبب واضح نحكيه)
3. **أي شك "شو صار معنا؟" → هاد الملف هو الجواب، مش الذاكرة**
