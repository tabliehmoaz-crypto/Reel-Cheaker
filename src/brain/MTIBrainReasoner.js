/* MTI Brain Reasoner — local, Reel-aware reasoning without an external LLM. */
import { getReelRoomContext, addReelMessage, addReelBrainMessage } from "../core/MTIContentService.js";
import { knowledgeService } from "../core/MTIKnowledgeService.js";

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function latest(room) {
  return room?.latestVersion || room?.versions?.[0] || null;
}

function classifyQuestion(question) {
  const q = clean(question).toLowerCase();
  if (/(ليش|لماذا|why|سبب|شو السبب)/i.test(q)) return "why";
  if (/(هوك|hook|افتتاح|بداية)/i.test(q)) return "hook";
  if (/(صوت|كلام|تفريغ|transcript|نبرة|نبر|وقف|سكت|pause|صمت)/i.test(q)) return "speech";
  if (/(تحسين|عدل|تعديل|قص|شو اعمل|شو بغير|improve)/i.test(q)) return "improve";
  if (/(توقع|prediction|احتفاظ|retention|استمرار)/i.test(q)) return "prediction";
  if (/(انسايت|insight|مشاهد|views|لايك|share|save|بعد النشر|performance|أداء)/i.test(q)) return "performance";
  if (/(تعلم|ذاكرة|memory|learn|حسابي|account)/i.test(q)) return "learning";
  if (/(فكرة|نسخة|brain|دماغ|محتوى جديد|idea)/i.test(q)) return "brain";
  return "general";
}

function evidenceLine(label, value) {
  if (value === undefined || value === null || value === "") return null;
  return "• " + label + ": " + value;
}

export class MTIBrainReasoner {
  constructor(options = {}) {
    this.version = options.version || "1.0.0";
  }

  getContext(reelId) {
    const room = getReelRoomContext(reelId);
    if (!room) throw new Error("Reel غير موجود لهذا الحساب.");
    const version = latest(room);
    return {
      room,
      version,
      analysis: version?.analysis || null,
      prediction: version?.prediction || version?.analysis?.intelligence?.prediction || null
    };
  }

  answerFromContext(question, context) {
    const { room, version, analysis, prediction } = context;
    const intel = analysis?.intelligence || analysis?.localAnalysis?.intelligence || {};
    const local = analysis?.localSignals || analysis?.localAnalysis || analysis || {};
    const kind = classifyQuestion(question);
    const lines = [];

    if (kind === "hook") {
      const hook = intel.attention?.score;
      const transcript = clean(local.speech?.text || local.transcript);
      lines.push("قرأت افتتاحية الريل من الإشارات المتاحة، مو من قاعدة عامة جاهزة.");
      lines.push(evidenceLine("النص المستخرج", transcript ? "\"" + transcript.slice(0, 180) + "\"" : "ما في تفريغ كلام موثوق"));
      lines.push(evidenceLine("إشارة الجذب المحلية", hook != null ? String(Math.round(hook)) + "/100" : "غير متاحة"));
      lines.push(evidenceLine("التفسير", intel.attention?.interpretation));
    } else if (kind === "speech") {
      const speech = local.speech || {};
      const delivery = local.deliveryPattern || analysis?.deliveryPattern || {};
      lines.push("طبقة الصوت عندي منفصلة عن طبقة الصورة، لذلك ما بعتبر الصمت تلقائياً مشكلة.");
      lines.push(evidenceLine("وضع التفريغ", speech.mode || (speech.transcriptionReady ? "transcription" : "activity-only")));
      lines.push(evidenceLine("الكلام", clean(speech.text) || "غير متاح"));
      lines.push(evidenceLine("عدد الكلمات", speech.wordCount));
      lines.push(evidenceLine("النمط الزمني", delivery.type || "غير متاح"));
      if (delivery.finalPause != null) lines.push(evidenceLine("الصمت النهائي", String(delivery.finalPause) + "s"));
      if (delivery.likelyPayoffPause) lines.push("• القراءة: الصمت النهائي متوافق مع pause ذات وظيفة كوميدية/درامية محتملة، وليس drop-off مثبت.");
    } else if (kind === "improve") {
      const rec = intel.recommendations?.[0];
      lines.push("رح أفصل بين المشكلة المقاسة وبين اقتراح التحسين.");
      lines.push(evidenceLine("المشكلة", rec?.problem || "ما في نقطة ضعف واضحة ضمن الأدلة المتاحة."));
      lines.push(evidenceLine("الإجراء", rec?.action));
      lines.push(evidenceLine("الثقة", rec?.confidence != null ? String(Math.round(rec.confidence * 100)) + "%" : "غير متاحة"));
    } else if (kind === "prediction") {
      lines.push("التوقع المحلي هو proxy مبني على إشارات الفيديو، وليس retention فعلي من Instagram.");
      lines.push(evidenceLine("التقدير", prediction?.retentionEstimate != null ? String(Math.round(prediction.retentionEstimate)) + "/100" : "غير متاح"));
      lines.push(evidenceLine("نوع التقدير", prediction?.estimateType));
      lines.push(evidenceLine("الثقة", prediction?.confidence));
      lines.push(evidenceLine("العينة التعليمية", prediction?.accountLearning?.sampleSize != null ? String(prediction.accountLearning.sampleSize) + " ريل" : "0"));
    } else if (kind === "performance") {
      const actual = version?.actualPerformance;
      const comparison = version?.comparison;
      lines.push("هون MTI ينتقل من التنبؤ إلى الواقع: أرقام النشر الفعلية هي المصدر الأقوى للتعلم.");
      if (actual) {
        ["views","reach","likes","comments","shares","saves","averageWatchTime","completionRate","skipRate","followersGained","performanceScore"].forEach(key => {
          if (actual[key] != null) lines.push(evidenceLine(key, actual[key]));
        });
      } else {
        lines.push("• ما انحفظت نتائج النشر لهالنسخة بعد.");
      }
      if (comparison) lines.push(evidenceLine("خطأ التوقع", comparison.overallError != null ? String(comparison.overallError) + " نقطة" : "غير محسوب"));
    } else if (kind === "learning") {
      const learning = room.learning?.account || room.learning?.reel;
      lines.push("MTI ما لازم يتعلم قاعدة قوية من ريل واحد. التعلم يبدأ لما تتجمع ملاحظات فعلية كافية.");
      lines.push(evidenceLine("عينة الحساب", learning?.sampleSize ?? "غير متاحة"));
      lines.push(evidenceLine("مرحلة التعلم", learning?.stage || "cold-start"));
      lines.push(evidenceLine("آخر نسخة", version?.versionNumber != null ? "V" + version.versionNumber : null));
    } else if (kind === "brain") {
      lines.push("Brain هون بيشتغل فوق التحليل والذاكرة والمعرفة، مو منفصل عنهم.");
      lines.push(evidenceLine("أفكار محفوظة", room.ideas?.length || 0));
      lines.push(evidenceLine("رسائل الغرفة", room.messages?.length || 0));
      lines.push(evidenceLine("نسخ الريل", room.versions?.length || 0));
    } else {
      lines.push(intel.summary || "ما عندي ملخص كافي لهالريل بعد.");
      lines.push(evidenceLine("الهوك", intel.attention?.score != null ? String(Math.round(intel.attention.score)) + "/100" : "غير متاح"));
      lines.push(evidenceLine("الإيقاع", intel.pacing?.score != null ? String(Math.round(intel.pacing.score)) + "/100" : "غير متاح"));
      lines.push(evidenceLine("التوقع", prediction?.retentionEstimate != null ? String(Math.round(prediction.retentionEstimate)) + "/100" : "غير متاح"));
    }

    const knowledge = knowledgeService.findRelevantKnowledge({ question, analysis: intel, type: kind }).slice(0, 3);
    const knowledgeLines = knowledge.map(item => "• معرفة داعمة: " + (item.title || item.concept || item.id) + " — " + (item.description || item.principle || ""));
    return [...lines.filter(Boolean), ...knowledgeLines].join("\n");
  }

  async ask({ reelId, question, persist = true } = {}) {
    if (!reelId) throw new Error("reelId مطلوب للمحادثة.");
    const q = clean(question);
    if (!q) throw new Error("اكتب سؤالك أولاً.");
    const context = this.getContext(reelId);
    const answer = this.answerFromContext(q, context);
    if (persist) {
      await addReelMessage(reelId, { role: "user", content: q, metadata: { source: "mti-brain" } });
      await addReelBrainMessage(reelId, { content: answer, metadata: { source: "mti-brain", version: this.version } });
    }
    return {
      success: true,
      reelId,
      answer,
      context: { versionId: context.version?.versionId || null, analysisAvailable: !!context.analysis }
    };
  }
}

export const mtiBrainReasoner = new MTIBrainReasoner();
export default mtiBrainReasoner;