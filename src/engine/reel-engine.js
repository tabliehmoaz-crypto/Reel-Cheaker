/**
 * MTI — Reel Engine
 * -----------------
 * Canonical LOCAL extraction layer.
 *
 * Responsibility:
 *   Video -> measurable local signals
 *
 * Intelligence/reasoning is intentionally owned by
 * MTIAnalysisService so the Core has one, and only one,
 * reasoning pass.
 */

import { extractLocalSignals } from "./LocalSignalExtractor.js";

export class ReelEngine {
  constructor() {
    this.version = "4.0.0";
  }

  async analyze(videoFile, userContext = {}, progressCallback = () => {}) {
    if (!videoFile) {
      throw new Error("لم يتم اختيار فيديو.");
    }
    if (!videoFile.type?.startsWith("video/")) {
      throw new Error("الملف المختار ليس فيديو.");
    }

    const localAnalysis = await extractLocalSignals(videoFile, progressCallback);

    progressCallback({
      stage: "LOCAL_COMPLETE",
      progress: 92,
      message: "اكتمل استخراج الأدلة المحلية."
    });

    return {
      ...localAnalysis,
      engine: {
        name: "reel-engine",
        version: this.version,
        type: "local-signal-extractor",
        userContextUsed: Boolean(userContext && Object.keys(userContext).length)
      }
    };
  }

  getEngineInfo() {
    return {
      name: "reel-engine",
      version: this.version,
      type: "local-signal-extractor",
      localFirst: true,
      externalAI: false
    };
  }

  isReady() {
    return true;
  }

  healthCheck() {
    return {
      ready: true,
      engine: "reel-engine",
      version: this.version,
      error: null
    };
  }
}

export default ReelEngine;
