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

let whisperModulePromise = null;

async function getWhisperModule() {
  if (!whisperModulePromise) {
    whisperModulePromise = import("../ai/whisper.js");
  }
  return whisperModulePromise;
}


/* =========================================================
   CONFIG
========================================================= */

const MAX_FRAME_SAMPLES = 48;
const MOBILE_MAX_FRAME_SAMPLES = 10;

// DIAGNOSTIC: local Whisper is disabled globally for this crash-isolation test.
const USE_LOCAL_WHISPER = true;
const FRAME_SAMPLE_SIZE = { width: 64, height: 114 }; // نسبة عمودية تقريبية
const HOOK_WINDOW_SECONDS = 3;
const AUDIO_WINDOW_MS = 100;
const SILENCE_RMS_THRESHOLD = 0.02;
const VIDEO_METADATA_TIMEOUT_MS = 12000;
const VIDEO_FRAME_LOAD_TIMEOUT_MS = 12000;


/* =========================================================
   PUBLIC API
========================================================= */

export async function extractLocalSignals(videoFile, progressCallback = () => {}) {
  if (!videoFile) throw new Error("لم يتم اختيار فيديو.");
  if (!videoFile.type?.startsWith("video/")) throw new Error("الملف المختار ليس فيديو.");

  // Mobile/Safari gets a lower-cost real decoding path — not a fake zero-signal fallback.
  // We still decode actual frames. Only expensive full-file audio/Whisper work is optional.
  const metadata = await getVideoMetadata(videoFile);
  progressCallback({ stage: "METADATA", progress: 10, message: "قراءة بيانات الفيديو الحقيقية..." });

  progressCallback({ stage: "FRAMES", progress: 22, message: "تحليل الإطارات الفعلية..." });
  const visualSignals = await extractVisualSignals(videoFile, metadata, progressCallback);

  progressCallback({ stage: "AUDIO", progress: 55, message: "تحليل الإشارة الصوتية..." });
  const decodedAudio = isMobileDevice() ? null : await decodeAudioOnce(videoFile);
  const audioSignals = decodedAudio ? computeAudioSignals(decodedAudio, metadata) : null;

  progressCallback({ stage: "SPEECH", progress: 70, message: "تحليل الكلام..." });
  const speechResult = await safeTranscribe(videoFile, decodedAudio);

  progressCallback({ stage: "SCORING", progress: 90, message: "ربط الأدلة وبناء الإشارات..." });

  const hook = buildHookSignal(visualSignals, audioSignals);
  const pacing = buildPacingSignal(visualSignals, metadata);
  const visual = buildVisualQualitySignal(visualSignals);
  const dropOff = buildDropOffSignal(visualSignals, metadata);
  const idea = buildIdeaSignal(speechResult, metadata);
  const speech = buildSpeechSignal(speechResult, metadata);
  const technical = buildTechnicalSignal(metadata);
  const scenes = buildSceneAnalysis(visualSignals.frames, metadata);
  const attentionMap = buildAttentionMap(visualSignals.frames, audioSignals, speechResult, metadata, { hook, pacing, dropOff });

  progressCallback({ stage: "COMPLETE", progress: 100, message: "اكتمل الاستخراج المحلي الحقيقي." });

  return {
    video: { dimensions: metadata },
    hook, pacing, visual, technical, speech, idea, dropOff,
    audio: audioSignals,
    scores: {},
    frames: visualSignals.frames.map((f) => f.thumbnailDataUrl).filter(Boolean),
    frameSignals: visualSignals.frames,
    scenes,
    attentionMap,
    extraction: {
      local: true,
      visualMeasured: visualSignals.frames.length > 0,
      audioMeasured: Boolean(audioSignals),
      speechMeasured: Boolean(speechResult?.hasSpeech),
      mobile: isMobileDevice(),
      limitations: [
        ...(audioSignals ? [] : ["full-audio-analysis-unavailable-on-mobile-or-decode-failed"]),
        ...(speechResult?.unavailable ? [speechResult.reason || "speech-analysis-unavailable"] : [])
      ]
    }
  };
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}


/* =========================================================
   METADATA
========================================================= */

function getVideoMetadata(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectURL = URL.createObjectURL(videoFile);
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.onloadedmetadata = null;
      video.onerror = null;
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {}
      URL.revokeObjectURL(objectURL);
    };

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    };

    const timeoutId = setTimeout(() => {
      finish(reject, new Error("انتهت مهلة قراءة بيانات الفيديو على هذا المتصفح."));
    }, VIDEO_METADATA_TIMEOUT_MS);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!video.videoWidth || !video.videoHeight) {
        finish(reject, new Error("تعذّرت قراءة أبعاد الفيديو."));
        return;
      }

      finish(resolve, {
        duration: parseFloat(duration.toFixed(2)),
        width: video.videoWidth,
        height: video.videoHeight,
        fileSize: Number(videoFile.size || 0),
        fileName: videoFile.name || "video"
      });
    };

    video.onerror = () => {
      finish(reject, new Error("تعذّرت قراءة بيانات الفيديو على هذا المتصفح."));
    };

    video.src = objectURL;
    try {
      video.load();
    } catch (error) {
      finish(reject, error);
    }
  });
}


/* =========================================================
   VISUAL SIGNALS (Canvas frame sampling)
========================================================= */

async function extractVisualSignals(videoFile, metadata, progressCallback = () => {}) {

  const duration = Math.max(metadata.duration || 0, 0.5);
  const sampleCount = Math.min(
    isMobileDevice() ? MOBILE_MAX_FRAME_SAMPLES : MAX_FRAME_SAMPLES,
    Math.max(8, Math.round(duration * 4))
  );

  const timestamps = [];
  for (let i = 0; i < sampleCount; i++) {
    timestamps.push((duration * i) / (sampleCount - 1));
  }

  const video = document.createElement("video");
  const objectURL = URL.createObjectURL(videoFile);
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.src = objectURL;

  try {
    await waitForVideoFrameReady(video);
  } catch (error) {
    URL.revokeObjectURL(objectURL);
    throw error;
  }

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

    progressCallback({
      stage: "FRAMES",
      progress: Math.min(54, 22 + Math.round(((frames.length) / sampleCount) * 32)),
      message: `تحليل الإطار ${frames.length}/${sampleCount}...`
    });
  }

  URL.revokeObjectURL(objectURL);
  try {
    video.pause();
    video.removeAttribute("src");
    video.load();
  } catch {}

  return { frames, duration };
}

function waitForVideoFrameReady(video) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
    };

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    };

    const onReady = () => {
      // loadedmetadata/canplay alone is not enough for drawing, but readyState >= 2
      // confirms that at least the first decoded frame is available.
      if (video.readyState >= 2) {
        finish(resolve);
      }
    };

    const onError = () => {
      finish(reject, new Error("تعذّر تحميل الفيديو لاستخراج الإطارات."));
    };

    const timeoutId = setTimeout(() => {
      finish(reject, new Error("انتهت مهلة تجهيز إطارات الفيديو على هذا المتصفح."));
    }, VIDEO_FRAME_LOAD_TIMEOUT_MS);

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);

    try {
      video.load();
      if (video.readyState >= 2) onReady();
    } catch (error) {
      finish(reject, error);
    }
  });
}


function seekTo(video, timestamp) {
  return new Promise((resolve) => {
    const target = Math.min(timestamp, Math.max((video.duration || timestamp) - 0.05, 0));
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("timeupdate", onSeeked);
      clearTimeout(timeoutId);
      resolve();
    };

    const onSeeked = () => finish();
    const timeoutId = setTimeout(finish, 1500);

    // Safari/iOS can occasionally skip the seeked event for local object URLs.
    // timeupdate gives us a second signal without making the analysis hang.
    video.addEventListener("seeked", onSeeked, { once: false });
    video.addEventListener("timeupdate", onSeeked, { once: false });

    try {
      if (Math.abs((video.currentTime || 0) - target) < 0.015) {
        finish();
        return;
      }
      video.currentTime = target;
    } catch {
      finish();
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

async function decodeAudioOnce(videoFile) {
  try {
    return await extractAudio(videoFile);
  } catch (error) {
    console.warn("MTI Audio Decode Error (متابعة بدون تحليل صوتي):", error);
    return null;
  }
}

function computeAudioSignals(audioBuffer, metadata) {

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

async function safeTranscribe(videoFile, preDecodedAudioBuffer) {
  // Hard stop: do not invoke the local Whisper module in this diagnostic build.
  if (!USE_LOCAL_WHISPER) {
    return {
      text: "",
      wordCount: 0,
      hasSpeech: false,
      segments: [],
      unavailable: true,
      reason: "local-whisper-disabled-diagnostic"
    };
  }

  try {
    // على الهواتف Whisper المحلي ممنوع عمداً لحماية التبويب من ضغط الذاكرة.
    // باقي التحليل البصري والصوتي يستمر بشكل طبيعي.
    if (typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "")) {
      return {
        text: "",
        wordCount: 0,
        hasSpeech: false,
        segments: [],
        unavailable: true,
        reason: "mobile-safe-mode"
      };
    }

    return await withTimeout(
      transcribeVideo(videoFile, {
        language: "ar",
        preDecodedAudioBuffer
      }),
      45000,
      "انتهت مهلة تحميل/تشغيل محرك الكلام المحلي (Whisper)."
    );
  } catch (error) {
    console.warn("MTI Whisper Error (متابعة بدون نص):", error);
    return { text: "", wordCount: 0, hasSpeech: false, segments: [], unavailable: true };
  }
}

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timeoutId); resolve(value); },
      (error) => { clearTimeout(timeoutId); reject(error); }
    );
  });
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

  return {
    points: merged.slice(0, 4),
    basis: "visual_stagnation_proxy",
    measuredFrom: "sampled_video_frames",
    platformRetentionAvailable: false
  };
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


/* =========================================================
   TEMPORAL CONTENT MAP
   These are measurements/interpolations from sampled frames.
   They are not claims about actual platform retention.
========================================================= */

function buildSceneAnalysis(frames, metadata) {
  if (!Array.isArray(frames) || frames.length < 2) return [];

  const changes = frames.map(f => Number(f.changeMagnitude || 0));
  const mean = average(changes);
  const deviation = stdDev(changes);
  const cutThreshold = Math.max(8, mean + deviation * 1.25);
  const boundaries = [0];

  for (let i = 1; i < frames.length; i++) {
    if (changes[i] >= cutThreshold) boundaries.push(i);
  }
  boundaries.push(frames.length - 1);

  const unique = [...new Set(boundaries)].sort((a, b) => a - b);
  const scenes = [];
  for (let i = 0; i < unique.length - 1; i++) {
    const startFrame = frames[unique[i]];
    const endFrame = frames[unique[i + 1]];
    if (!startFrame || !endFrame || endFrame.timestamp - startFrame.timestamp < 0.35) continue;

    const slice = frames.slice(unique[i], unique[i + 1] + 1);
    scenes.push({
      id: `scene_${i + 1}`,
      index: i,
      start: Number(startFrame.timestamp.toFixed(2)),
      end: Number(endFrame.timestamp.toFixed(2)),
      duration: Number((endFrame.timestamp - startFrame.timestamp).toFixed(2)),
      averageBrightness: Number(average(slice.map(f => f.avgLuma)).toFixed(1)),
      averageContrast: Number(average(slice.map(f => f.contrast)).toFixed(1)),
      averageSaturation: Number(average(slice.map(f => f.avgSaturation)).toFixed(1)),
      visualChange: Number(average(slice.map(f => f.changeMagnitude)).toFixed(2)),
      evidence: "sampled_video_frames"
    });
  }
  return scenes;
}

function buildAttentionMap(frames, audioSignals, speechResult, metadata, signals) {
  if (!Array.isArray(frames) || !frames.length) return [];

  const maxChange = Math.max(...frames.map(f => Number(f.changeMagnitude || 0)), 1);
  const maxContrast = Math.max(...frames.map(f => Number(f.contrast || 0)), 1);
  const duration = Math.max(metadata.duration || 1, 1);
  const words = Array.isArray(speechResult?.segments) ? speechResult.segments : [];

  return frames.map(frame => {
    const visual = clamp((Number(frame.changeMagnitude || 0) / maxChange) * 100);
    const contrast = clamp((Number(frame.contrast || 0) / maxContrast) * 100);
    const speech = words.some(seg => Number(seg.start || 0) <= frame.timestamp && Number(seg.end || 0) >= frame.timestamp) ? 65 : 0;
    const audio = audioSignals ? clamp((audioSignals.earlyAvgRms || audioSignals.avgRms || 0) > 0 ? 55 : 0) : 0;
    const score = clamp(visual * 0.55 + contrast * 0.15 + speech * 0.20 + audio * 0.10);
    return {
      timestamp: Number(frame.timestamp.toFixed(2)),
      score: Number(score.toFixed(1)),
      components: { visual: Number(visual.toFixed(1)), contrast: Number(contrast.toFixed(1)), speech, audio },
      evidence: ["frame_change", "frame_contrast", ...(speech ? ["speech_segment"] : []), ...(audioSignals ? ["audio_signal"] : [])],
      basis: "local_attention_proxy",
      platformRetentionAvailable: false
    };
  });
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
