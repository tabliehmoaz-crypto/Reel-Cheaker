/* MTI Post-Publish Insights */
import { getReel, getReelVersions } from "../core/MTIContentService.js";
import { updateExperiment, comparePredictionToReality, calculatePerformanceScore } from "../engine/ExperimentEngine.js";

const METRICS = [
  "views","reach","likes","comments","shares","saves",
  "watchTime","averageWatchTime","completionRate","skipRate","followersGained"
];

function normalizeArabicDigits(value) {
  return String(value || "")
    .replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[٫٬]/g, ".");
}

function parseMetricValue(raw) {
  if (raw == null) return null;
  let value = normalizeArabicDigits(raw).replace(/,/g, "").trim().toLowerCase();
  const multiplier = value.endsWith("m") || value.includes("مليون") ? 1000000
    : value.endsWith("k") || value.includes("ألف") || value.includes("الف") ? 1000
    : 1;
  value = value.replace(/[^0-9.+-]/g, "");
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * multiplier) : null;
}

function parsePercent(raw) {
  if (raw == null) return null;
  const normalized = normalizeArabicDigits(raw);
  const match = normalized.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const value = Number(match[0].replace(",", "."));
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
}

function escapeRegex(value) {
  return String(value)
    .replace(/[.*+?^()|[\]\\]/g, "\\$&")
    .replace(/\$/g, "\\$&");
}

function findMetric(text, aliases, parser = parseMetricValue) {
  const source = normalizeArabicDigits(text).replace(/,/g, "");
  for (const alias of aliases) {
    const escaped = escapeRegex(alias);
    const re = new RegExp(escaped + "\\s*[:\\-]?\\s*([0-9٠-٩.,]+(?:\\s*[kKmMألفمليون]+)?)", "i");
    const match = source.match(re);
    if (match) {
      const parsed = parser(match[1]);
      if (parsed != null) return parsed;
    }
  }
  return null;
}

export function parseInstagramInsightText(text = "") {
  const source = String(text || "");
  const metrics = {
    views: findMetric(source, ["views","مشاهدات","المشاهدات"]),
    reach: findMetric(source, ["reach","accounts reached","الوصول","الحسابات التي تم الوصول إليها"]),
    likes: findMetric(source, ["likes","الإعجابات","اعجاب","الإعجابات"]),
    comments: findMetric(source, ["comments","التعليقات","تعليقات"]),
    shares: findMetric(source, ["shares","المشاركات","مشاركات"]),
    saves: findMetric(source, ["saves","المحفوظات","الحفظ","محفوظات"]),
    followersGained: findMetric(source, ["followers","followers gained","المتابعون","متابعون جدد"]),
    averageWatchTime: findMetric(source, ["average watch time","avg watch time","متوسط وقت المشاهدة"]),
    watchTime: findMetric(source, ["watch time","وقت المشاهدة"]),
    completionRate: findMetric(source, ["completion rate","نسبة الإكمال","نسبة المشاهدة حتى النهاية"], parsePercent),
    skipRate: findMetric(source, ["skip rate","نسبة التخطي","skip"], parsePercent)
  };
  return {
    metrics,
    detectedMetrics: Object.entries(metrics).filter(([,v]) => v != null).map(([k]) => k),
    rawText: source
  };
}

async function loadTesseract() {
  if (globalThis.Tesseract?.createWorker) return globalThis.Tesseract;
  if (globalThis.__mtiTesseractPromise) return globalThis.__mtiTesseractPromise;

  globalThis.__mtiTesseractPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => globalThis.Tesseract?.createWorker
      ? resolve(globalThis.Tesseract)
      : reject(new Error("Tesseract loaded without createWorker."));
    script.onerror = () => reject(new Error("تعذّر تحميل OCR. يمكنك إدخال الأرقام يدوياً."));
    document.head.appendChild(script);
  });

  return globalThis.__mtiTesseractPromise;
}

export async function analyzeInsightImage(file, options = {}) {
  if (!file) throw new Error("صورة الـInsights مطلوبة.");
  if (!String(file.type || "").startsWith("image/")) throw new Error("الملف يجب أن يكون صورة.");

  const previewUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    const dimensions = await new Promise((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("تعذّر قراءة صورة الـInsights."));
      image.src = previewUrl;
    });

    let ocrText = "";
    let ocrStatus = "not_attempted";

    try {
      const Tesseract = await loadTesseract();
      ocrStatus = "running";
      const worker = await Tesseract.createWorker("eng+ara");
      const result = await worker.recognize(file);
      ocrText = result?.data?.text || "";
      await worker.terminate();
      ocrStatus = "complete";
    } catch (error) {
      ocrStatus = "unavailable";
      if (options.throwOnOCR) throw error;
    }

    const parsed = parseInstagramInsightText(ocrText);
    return {
      success: true,
      fileName: file.name,
      image: dimensions,
      ocr: { status: ocrStatus, text: ocrText },
      ...parsed,
      previewUrl
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

export async function savePostPublishInsights(reelId, metrics = {}, source = {}) {
  if (!reelId) throw new Error("reelId مطلوب.");
  const latest = getReel(reelId);
  if (!latest) throw new Error("Reel غير موجود.");

  const actual = {};
  METRICS.forEach(key => {
    const value = metrics[key];
    if (value !== undefined && value !== null && value !== "") {
      actual[key] = key === "completionRate" || key === "skipRate" ? parsePercent(value) : parseMetricValue(value);
    }
  });

  const performanceScore = calculatePerformanceScore(actual);
  if (performanceScore != null) actual.performanceScore = performanceScore;

  const updated = await updateExperiment(latest.id, current => ({
    ...current,
    actualPerformance: {
      ...(current.actualPerformance || {}),
      ...actual,
      insightSource: {
        type: source.type || "manual-or-screenshot",
        fileName: source.fileName || null,
        ocrStatus: source.ocrStatus || null,
        capturedAt: new Date().toISOString()
      }
    },
    metadata: {
      ...(current.metadata || {}),
      postPublishInsights: {
        ...(current.metadata?.postPublishInsights || {}),
        lastCapturedAt: new Date().toISOString(),
        source: source.type || "manual-or-screenshot",
        detectedMetrics: Object.keys(actual)
      }
    },
    status: "PUBLISHED"
  }));

  let comparison = null;
  if (updated?.prediction || updated?.analysis?.intelligence?.prediction) {
    try { comparison = await comparePredictionToReality(latest.id); } catch { comparison = null; }
  }

  return {
    success: true,
    reelId,
    versionId: updated.versionId,
    actualPerformance: updated.actualPerformance,
    comparison,
    performanceScore
  };
}

export function getPostPublishStatus(reelId) {
  const versions = getReelVersions(reelId);
  const latest = versions[0];
  return {
    available: !!latest?.actualPerformance,
    versionId: latest?.versionId || null,
    versionNumber: latest?.versionNumber || null,
    metrics: latest?.actualPerformance || null,
    comparison: latest?.comparison || null
  };
}

export default {
  parseInstagramInsightText,
  analyzeInsightImage,
  savePostPublishInsights,
  getPostPublishStatus
};