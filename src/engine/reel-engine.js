/**
 * MTI — Reel Engine
 * -----------------
 * ينسّق بين استخراج الإشارات المحلية الحقيقية
 * (src/engine/LocalSignalExtractor.js) ومحرك الاستدلال
 * المحلي (src/ai/LocalIntelligenceEngine.js).
 *
 * لا يستخدم أي API خارجي ولا يرسل الفيديو لأي سيرفر.
 */

import { LocalIntelligenceEngine } from "../ai/LocalIntelligenceEngine.js";
import { extractLocalSignals } from "./LocalSignalExtractor.js";

export class ReelEngine {

  constructor(options = {}) {
    this.ai = options.ai || new LocalIntelligenceEngine();
  }

  async analyze(videoFile, userContext = {}, progressCallback = () => {}) {

    if (!videoFile) {
      throw new Error("لم يتم اختيار فيديو.");
    }

    // 1) استخراج إشارات حقيقية من الفيديو نفسه (صورة + صوت + كلام)
    const localAnalysis = await extractLocalSignals(videoFile, progressCallback);

    // 2) تحويل الإشارات إلى استدلال منظم عبر محرك القواعد المحلي
    progressCallback({ stage: "REASONING", progress: 96, message: "بناء التحليل النهائي..." });

    const intelligence = await this.ai.analyze(localAnalysis, {
      context: userContext.intelligenceContext || null
    });

    progressCallback({ stage: "COMPLETE", progress: 100, message: "اكتمل التحليل الفعلي." });

    return {
      metadata: localAnalysis.video.dimensions,
      frames: localAnalysis.frames,
      localSignals: {
        hook: localAnalysis.hook,
        pacing: localAnalysis.pacing,
        visual: localAnalysis.visual,
        technical: localAnalysis.technical,
        speech: localAnalysis.speech,
        idea: localAnalysis.idea
      },
      intelligence
    };
  }
}
