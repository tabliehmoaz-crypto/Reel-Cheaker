/*
  MTI — Local Signal Extractor
  ----------------------------
  يستخرج إشارات حقيقية وقابلة للقياس من الفيديو مباشرة
  بالمتصفح، بدون أي اتصال بأي خدمة خارجية:

  - سطوع/تباين/تشبع لوني للإطارات (Canvas)
  - كثافة التغير الزمني بين الإطارات (Scene Cuts / Pacing)
  - إشارة الجذب بأول 3 ثوانٍ (Hook) من الصورة + الصوت
  - نقاط ركود محتملة (Drop-off) من فترات التغير المنخفض
  - مستوى الصوت ونسبة الصمت (Web Audio API)
  - نص الكلام عبر Whisper المحلي (اختياري، يعمل بالكامل بالمتصفح)

  هذا الملف لا يخترع نتائج. كل رقم ناتج عن قياس فعلي
  على بيانات الفيديو/الصوت. عند فشل قياس معيّن، يتم
  إرجاع قيمة محافظة مع الإفصاح عن ذلك بدل اختلاق رقم.
*/

import { transcribeVideo } from "../ai/whisper.js";


/* =========================================================
   CONFIG
========================================================= */

const MAX_FRAME_SAMPLES = 48;
const FRAME_SAMPLE_SIZE = { width: 64, height: 114 }; // نسبة عمودية تقريبية
const HOOK_WINDOW_SECONDS = 3;
const AUDIO_WINDOW_MS = 100;
const SILENCE_RMS_THRESHOLD = 0.02;


/* =========================================================
   PUBLIC API
========================================================= */

export async function extractLocalSignals(videoFile, progressCallback = () => {}) {

  progressCallback({ stage: "METADATA", progress: 5, message: "قراءة بيانات الفيديو..." });
  const metadata = await getVideoMetadata(videoFile);

  progressCallback({ stage: "FRAMES", progress: 20, message: "أخذ عينات من الإطارات وتحليلها..." });
  const visualSignals = await extractVisualSignals(videoFile, metadata);

  progressCallback({ stage: "AUDIO", progress: 55, message: "تحليل مستوى الصوت والصمت..." });
  const audioSignals = await extractAudioSignals(videoFile, metadata).catch((error) => {
    console.warn("MTI Audio Signal Error:", error);
    return null;
  });

  progressCallback({ stage: "SPEECH", progress: 70, message: "تفريغ الكلام محلياً (Whisper)..." });
  const speechResult = await safeTranscribe(videoFile);

  progressCallback({ stage: "SCORING", progress: 90, message: "بناء الإشارات النهائية..." });

  const hook = buildHookSignal(visualSignals, audioSignals);
  const pacing = buildPacingSignal(visualSignals, metadata);
  const visual = buildVisualQualitySignal(visualSignals);
  const dropOff = buildDropOffSignal(visualSignals, metadata);
  const idea = buildIdeaSignal(speechResult, metadata);
  const speech = buildSpeechSignal(speechResult, metadata);
  const technical = buildTechnicalSignal(metadata);

  progressCallback({ stage: "COMPLETE", progress: 100, message: "اكتمل الاستخراج المحلي." });

  return {
    video: { dimensions: metadata },
    hook,
    pacing,
    visual,
    technical,
    speech,
    idea,
    dropOff,
    // كائن أولي عام يُبقى فارغاً عمداً؛ الإشارات الفعلية
    // موزعة على الحقول أعلاه ليستخدمها LocalIntelligenceEngine.
    scores: {},
    frames: visualSignals.frames.map((f) => f.thumbnailDataUrl).filter(Boolean)
  };
}


/* =========================================================
   METADATA
========================================================= */

function getVideoMetadata(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(videoFile);

    video.onloadedmetadata = () => {
      resolve({
        duration: parseFloat((video.duration || 0).toFixed(2)),
        width: video.videoWidth,
        height: video.videoHeight,
        fileSize: videoFile.size,
        fileName: videoFile.name
      });
    };

    video.onerror = () => reject(new Error("تعذّرت قراءة بيانات الفيديو."));
  });
}


/* =========================================================
   VISUAL SIGNALS (Canvas frame sampling)
========================================================= */

async function extractVisualSignals(videoFile, metadata) {

  const duration = Math.max(metadata.duration || 0, 0.5);
  const sampleCount = Math.min(
    MAX_FRAME_SAMPLES,
    Math.max(8, Math.round(duration * 4))
  );

  const timestamps = [];
  for (let i = 0; i < sampleCount; i++) {
    timestamps.push((duration * i) / (sampleCount - 1));
  }

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = URL.createObjectURL(videoFile);

  await new Promise((resolve, reject) => {
    video.onloadeddata = resolve;
    video.onerror = () => reject(new Error("تعذّر تحميل الفيديو لاستخراج الإطارات."));
  });

  const canvas = document.createElement("canvas");
  canvas.width = FRAME_SAMPLE_SIZE.width;
  canvas.height = FRAME_SAMPLE_SIZE.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const frames = [];
  let previousLuma = null;

  for (const timestamp of timestamps) {

    await seekTo(video, timestamp);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const { avgLuma, avgSaturation, contrast } = analyzePixels(imageData);

    const changeMagnitude =
      previousLuma === null ? 0 : Math.abs(avgLuma - previousLuma);

    previousLuma = avgLuma;

    frames.push({
      timestamp,
      avgLuma,
      avgSaturation,
      contrast,
      changeMagnitude,
      // صورة مصغّرة اختيارية لعرضها بالواجهة فقط (ليست جزءاً من التحليل)
      thumbnailDataUrl:
        timestamp <= duration * 0.75 && frames.length % 6 === 0
          ? canvas.toDataURL("image/jpeg", 0.5)
          : null
    });
  }

  URL.revokeObjectURL(video.src);

  return { frames, duration };
}


function seekTo(video, timestamp) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    try {
      video.currentTime = Math.min(timestamp, Math.max(video.duration - 0.05, 0));
    } catch {
      resolve();
    }
  });
}


function analyzePixels(data) {
  let lumaSum = 0;
  let satSum = 0;
  const lumas = [];
  const step = 4 * 2; // كل بكسل ثاني تسريعاً للأداء

  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    lumaSum += luma;
    lumas.push(luma);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    satSum += max === 0 ? 0 : (max - min) / max;
  }

  const count = lumas.length || 1;
  const avgLuma = lumaSum / count;
  const avgSaturation = (satSum / count) * 100;

  const variance =
    lumas.reduce((acc, v) => acc + (v - avgLuma) ** 2, 0) / count;
  const contrast = Math.sqrt(variance);

  return { avgLuma, avgSaturation, contrast };
}


/* =========================================================
   AUDIO SIGNALS (Web Audio API)
========================================================= */

async function extractAudioSignals(videoFile, metadata) {

  const arrayBuffer = await videoFile.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("المتصفح لا يدعم Web Audio API.");
  }

  const audioContext = new AudioContextClass();

  let audioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await audioContext.close();
  }

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const windowSize = Math.floor((AUDIO_WINDOW_MS / 1000) * sampleRate);

  const windows = [];
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sumSquares = 0;
    let n = 0;
    for (let j = i; j < Math.min(i + windowSize, channelData.length); j++) {
      sumSquares += channelData[j] * channelData[j];
      n++;
    }
    const rms = n > 0 ? Math.sqrt(sumSquares / n) : 0;
    windows.push({ time: i / sampleRate, rms });
  }

  const rmsValues = windows.map((w) => w.rms);
  const avgRms = average(rmsValues);
  const silenceRatio =
    rmsValues.filter((v) => v < SILENCE_RMS_THRESHOLD).length /
    Math.max(rmsValues.length, 1);
  const dynamism = stdDev(rmsValues);

  const earlyWindows = windows.filter((w) => w.time <= HOOK_WINDOW_SECONDS);
  const earlyAvgRms = average(earlyWindows.map((w) => w.rms));

  return {
    avgRms,
    silenceRatio,
    dynamism,
    earlyAvgRms,
    duration: metadata.duration
  };
}


function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (!arr.length) return 0;
  const avg = average(arr);
  const variance = average(arr.map((v) => (v - avg) ** 2));
  return Math.sqrt(variance);
}


/* =========================================================
   SPEECH (local Whisper — runs fully in-browser)
========================================================= */

async function safeTranscribe(videoFile) {
  try {
    const result = await transcribeVideo(videoFile, { language: "ar" });
    return result;
  } catch (error) {
    console.warn("MTI Whisper Error (متابعة بدون نص):", error);
    return { text: "", wordCount: 0, hasSpeech: false, segments: [] };
  }
}


/* =========================================================
   SCORE BUILDERS
   (تحويل القياسات الخام إلى إشارات 0-100 مفهومة للمحرك)
========================================================= */

function clamp(v, min = 0, max = 100) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

function buildHookSignal(visualSignals, audioSignals) {

  const earlyFrames = visualSignals.frames.filter(
    (f) => f.timestamp <= HOOK_WINDOW_SECONDS
  );

  const earlyChange = average(earlyFrames.map((f) => f.changeMagnitude));
  // 0-40 من فرق السطوع يعتبر مجالاً واقعياً لمعظم اللقطات العادية
  const visualHookScore = clamp((earlyChange / 40) * 100);

  const audioHookScore = audioSignals
    ? clamp((audioSignals.earlyAvgRms / 0.15) * 100)
    : 0;

  const score = audioSignals
    ? clamp(visualHookScore * 0.6 + audioHookScore * 0.4)
    : visualHookScore;

  return {
    score,
    visualComponent: visualHookScore,
    audioComponent: audioSignals ? audioHookScore : null,
    measuredWindowSeconds: HOOK_WINDOW_SECONDS
  };
}

function buildPacingSignal(visualSignals, metadata) {

  const magnitudes = visualSignals.frames.map((f) => f.changeMagnitude);
  const avgMagnitude = average(magnitudes);
  const threshold = avgMagnitude + stdDev(magnitudes) * 1.2;

  const cuts = magnitudes.filter((m) => m > threshold && m > 8).length;
  const duration = Math.max(metadata.duration || 1, 1);
  const cutsPerSecond = cuts / duration;

  // ~0.6 قطع/ثانية تقريباً تعتبر إيقاعاً نشطاً بالفيديوهات القصيرة
  const score = clamp((cutsPerSecond / 0.6) * 100);

  return {
    score,
    cuts,
    cutsPerSecond: Number(cutsPerSecond.toFixed(2))
  };
}

function buildVisualQualitySignal(visualSignals) {

  const avgLuma = average(visualSignals.frames.map((f) => f.avgLuma));
  const avgContrast = average(visualSignals.frames.map((f) => f.contrast));
  const avgSaturation = average(visualSignals.frames.map((f) => f.avgSaturation));

  // عقوبة على السطوع المتطرف (مظلم جداً أو محروق جداً)
  let brightnessScore = 100;
  if (avgLuma < 40) brightnessScore = clamp(avgLuma * 2);
  else if (avgLuma > 220) brightnessScore = clamp((255 - avgLuma) * 2.8);

  const contrastScore = clamp((avgContrast / 60) * 100);
  const saturationScore = clamp((avgSaturation / 40) * 100);

  const score = clamp(
    brightnessScore * 0.4 + contrastScore * 0.35 + saturationScore * 0.25
  );

  return {
    score,
    averageBrightness: Number(avgLuma.toFixed(1)),
    averageContrast: Number(avgContrast.toFixed(1)),
    averageSaturation: Number(avgSaturation.toFixed(1))
  };
}

function buildDropOffSignal(visualSignals, metadata) {

  const frames = visualSignals.frames;
  if (frames.length < 4) return { points: [] };

  const magnitudes = frames.map((f) => f.changeMagnitude);
  const overallAvg = average(magnitudes);
  const points = [];

  const windowSize = 3; // إطارات متتالية
  for (let i = windowSize; i < frames.length - 1; i++) {
    const window = frames.slice(i - windowSize, i);
    const windowAvg = average(window.map((f) => f.changeMagnitude));

    const isLowChange = windowAvg < overallAvg * 0.25;
    const isMidVideo =
      frames[i].timestamp > 2.5 &&
      frames[i].timestamp < (metadata.duration || 0) - 1;

    if (isLowChange && isMidVideo) {
      points.push({
        stage: "middle",
        timestamp: Number(frames[i].timestamp.toFixed(1)),
        risk: clamp(70 - (windowAvg / (overallAvg || 1)) * 40),
        reason: `انخفاض ملحوظ بالتغير البصري حوالي الثانية ${frames[i].timestamp.toFixed(1)}.`
      });
    }
  }

  // دمج النقاط المتقاربة زمنياً بدل تكرارها
  const merged = [];
  for (const point of points) {
    const last = merged[merged.length - 1];
    if (last && point.timestamp - last.timestamp < 1.5) continue;
    merged.push(point);
  }

  return { points: merged.slice(0, 4) };
}

const IDEA_STRUCTURE_MARKERS = [
  "بعدين", "لكن", "لأن", "السبب", "النتيجة", "الحل", "المشكلة",
  "أول شي", "بالنهاية", "يعني", "مثلاً", "بالنسبة", "أهم شي"
];

function buildIdeaSignal(speechResult, metadata) {

  if (!speechResult?.hasSpeech || !speechResult.text) {
    // بدون كلام، لا يمكن قياس بنية الفكرة من النص؛
    // نعطي قيمة متحفظة بدل اختلاق تقييم.
    return { score: 30, basis: "no_speech_detected" };
  }

  const text = speechResult.text;
  const wordCount = speechResult.wordCount || 0;
  const duration = Math.max(metadata.duration || 1, 1);
  const density = wordCount / duration;

  const markerHits = IDEA_STRUCTURE_MARKERS.filter((m) => text.includes(m)).length;

  // كثافة كلام معقولة (لا فقيرة جداً ولا حشو) حوالي 1.5-3 كلمة/ثانية
  const densityScore = clamp(100 - Math.abs(density - 2.2) * 22);
  const markerScore = clamp(markerHits * 18);

  const score = clamp(densityScore * 0.55 + markerScore * 0.45);

  return {
    score,
    basis: "speech_structure_proxy",
    wordsPerSecond: Number(density.toFixed(2)),
    structureMarkersFound: markerHits
  };
}

function buildSpeechSignal(speechResult, metadata) {

  const wordCount = speechResult?.wordCount || 0;
  const duration = Math.max(metadata.duration || 1, 1);
  const wordsPerSecond = wordCount / duration;

  const deliveryScore = speechResult?.hasSpeech
    ? clamp(100 - Math.abs(wordsPerSecond - 2.4) * 22)
    : 0;

  return {
    available: Boolean(speechResult?.hasSpeech),
    text: speechResult?.text || "",
    wordCount,
    segments: speechResult?.segments || [],
    analysis: {
      score: deliveryScore,
      wordsPerSecond: Number(wordsPerSecond.toFixed(2))
    }
  };
}

function buildTechnicalSignal(metadata) {

  const isVertical = metadata.height > metadata.width;
  const aspectRatio =
    metadata.width && metadata.height
      ? Number((metadata.width / metadata.height).toFixed(3))
      : null;

  return {
    width: metadata.width,
    height: metadata.height,
    aspectRatio,
    isVerticalFormat: isVertical,
    duration: metadata.duration,
    fileSizeMB: Number((metadata.fileSize / (1024 * 1024)).toFixed(2))
  };
}
