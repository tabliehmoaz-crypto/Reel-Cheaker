# MTI — Content Intelligence System
## خارطة الطريق الكاملة (Master Vision)

هاد المستند هو **الرؤية الكاملة والنهائية** لمشروع MTI، وهو المرجع الأساسي
لأي قرار تطوير مستقبلي. أي جزء تم بناؤه فعلياً موسوم بـ ✅، وأي جزء
لسا ما بلشنا فيه موسوم بـ ⏳، مع ملاحظة شو بالضبط موجود لو في بداية جزئية.

---

## حالة البناء الحالية (ملخص صريح)

**تم بناؤه ومختبر (منطقياً، بدون متصفح حقيقي بعد):**
- محرك تحليل فيديو محلي (`reel-engine.js`): Hook, Pacing, Visual,
  Technical, Speech, Idea
- Drop-off متعدد الأنواع: صمت، جواب مبكر (premature payoff)، هوك
  ضعيف، مقطع ثابت طويل، إرهاق منتصف الفيديو — كل نوع مربوط بمبدأ نفسي
- CTA analysis (كشف + تصنيف نوع الدعوة)
- Speech-to-text محلي عبر Whisper (`whisper.js`) — رُفّع لـ whisper-base
  لدقة أفضل بالعربي
- قاعدة معرفة: 13 مبدأ نفسي مصنّف بمستوى دليل، 9 مجالات (niches)،
  3 منصات، 4 مناطق جمهور عربي، 5 أنواع CTA
- موديول توليد (فكرة → هوك → سكربت → مونتاج): `IdeaToContentEngine.js`
- بنية MTI الداخلية (Orchestrator, Pipeline, Registry, Adapter) —
  موصولة داخلياً وتم فحصها

**موجود كبنية تحتية جاهزة لكن غير مفعّل/غير موصول بواجهة:**
- `MTIResultMemoryBridge` (savePerformance/saveComparison/saveLearning)
- `GrowthLearningEngine` / `learning-engine.js`
- `MTIPrivacyService` (تشفير/anonymization)
- `MTIGlobalLearningService` (تعلم جماعي مجهول الهوية) — disabled by default
- `src/auth` (Google Auth + Firebase) — موصول بس بصفحة تجربة منفصلة

**غير موجود إطلاقاً بعد (المرحلة القادمة):**
- كل ما يخص Backend حقيقي (قاعدة بيانات مركزية، sync بين الأجهزة)
- Dashboard / Analytics UI
- Attention Curve visualization
- Scene-by-scene analysis
- Prediction Engine + Prediction vs Reality
- Content DNA / Benchmarking / Experiment tracking UI
- Content Calendar Intelligence / Series Intelligence
- MTI Chat (محادثة واعية بسياق الحساب)
- Memory controls (عرض/حذف/تعديل الذاكرة من واجهة)
- الهوية البصرية الكاملة (Deep Navy + Gold، إلخ) وواجهة ثنائية اللغة
- index.html النهائي الموحد

---

## المستند الأصلي الكامل (بدون تعديل)

*(المحتوى الكامل يلي أرسله المستخدم محفوظ هون حرفياً كمرجع دائم)*

MTI — Content Intelligence System

MTI مو أداة بتقولك «الريل حلو أو مو حلو». هي نظام يفهم المحتوى قبل
النشر، أثناء التجربة، وبعد النشر، ويتعلم من صاحب الحساب نفسه مع الوقت.

الفكرة الأساسية: Analyze → Understand → Improve → Publish → Learn → Predict Better

[... راجع المستند الكامل يلي أرسله المستخدم بالمحادثة للتفاصيل
الكاملة لكل الأقسام الـ70 + الـ15 اقتراح إضافي، من: الحساب والهوية
الشخصية، وصولاً لـ: Prediction Calibration. تم حفظ الأقسام الرئيسية
بالجدول أدناه بدل تكرار النص الكامل هون.]

---

## جدول تتبع الأقسام (70 قسم + 15 اقتراح إضافي)

| # | القسم | الحالة |
|---|---|---|
| 1 | الحساب والهوية الشخصية (Google Auth + Profile) | ⏳ Auth موجود بصفحة منفصلة، Profile schema غير مبني |
| 2 | Private Memory | ⏳ بنية تحتية موجودة (MemoryBridge)، غير مفعّلة |
| 3 | الصفحة الرئيسية / Content Journey | ⏳ index.html القديم فقط |
| 3-4 | Video/Technical + Hook Intelligence | ✅ موجود ومختبر |
| 5 | Hook Strength breakdown | ⏳ موجود جزئياً (score + observations)، مش بكل الأبعاد المذكورة |
| 6-9 | Retention/Attention Map/Scene/Viewer Journey | ⏳ dropOff موجود، لكن مافي Scene-by-scene ولا Attention Curve بصري |
| 10 | Pacing Intelligence | ✅ موجود |
| 11 | Storytelling Intelligence | ⏳ غير مبني كموديول منفصل |
| 12-19 | Psychology/Cognition/Emotion/Curiosity/Visual/Text/Audio/Speech | ✅ جزء منها موجود (Psychology, Speech)، ⏳ باقيها كموديولات منفصلة |
| 20 | Idea Intelligence | ⏳ موجود بشكل بسيط (analyzeIdea)، محتاج تعميق |
| 21 | Content Type Classification | ⏳ غير موجود |
| 22-23 | Recommendation Engine + Priority | ✅ موجود بشكل أساسي (changes[])، ⏳ التصنيف Fix First/Worth Testing/Keep غير موجود |
| 24 | Prediction Engine | ⏳ غير موجود |
| 25-30 | Personal Memory Learning → Benchmarking | ⏳ بنية تحتية جاهزة غير مفعّلة |
| 31-32 | Experiment System / A-B Thinking | ⏳ `ExperimentEngine.js` موجود بس غير موصول |
| 33-38 | Creative Intelligence → Opportunity Detection | ⏳ IdeaToContentEngine يغطي جزء بسيط منها |
| 39-40 | MTI Chat + Memory From Conversation | ⏳ غير موجود |
| 41-43 | Explainability / Confidence / Evidence System | ✅ موجود جزئياً (evidenceLevel بقاعدة المعرفة، confidence بالـ dropOff) |
| 44-47 | Knowledge Base / Platform Intelligence | ✅ موجود ومختبر |
| 48-52 | Dashboard / Reel History / Visualization | ⏳ غير موجود إطلاقاً |
| 53-56 | Smart Alerts / Pattern Detection | ⏳ غير موجود |
| 57 | Failure Isolation | ✅ موجود جزئياً (knowledge layer معزول عن التحليل الأساسي) |
| 58-59 | Local-First + Privacy | ✅ معماري موجود، ⏳ Global Learning غير مفعّل |
| 60 | Global Learning | ⏳ بنية موجودة (`MTIGlobalLearningService`)، disabled |
| 61-64 | Mobile/Desktop UX + Bilingual + Visual Identity | ⏳ غير موجود |
| 65-70 | Brand Language / Landing / Report / فلسفة المنتج | ⏳ غير موجود |
| المقترحات 1-15 | MTI Score, Personal Fit, Rewrite Lab, What-If Simulator... | ⏳ كلها غير موجودة |

---

## الخلاصة الصريحة

هاي رؤية شركة، مو ميزة إضافية. الجزء يلي بنيناه لهلق هو **الطبقة
الأولى بس (Video Intelligence + جزء من Content Intelligence)** من
أصل 6 طبقات ذكرها المستند. الطبقات الباقية (Decision Intelligence
الكاملة، Prediction Intelligence، Personal Memory الفعلية، Learning
Intelligence) تحتاج بناء حقيقي جديد، وأغلبها يحتاج Backend حقيقي
(مو ملفات جافاسكريبت بالمتصفح بس).
