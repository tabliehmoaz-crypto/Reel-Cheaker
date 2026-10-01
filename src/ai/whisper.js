import {
  pipeline,
  env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2/+esm";

/*
  REEL CHECK
  Local Whisper Engine

  الهدف:
  تحويل الكلام الموجود داخل الريل
  إلى نص مع توقيت تقريبي.

  ملاحظة:
  النموذج يعمل محلياً في المتصفح.
*/

env.allowLocalModels = false;
env.useBrowserCache = true;


// -----------------------------------------------------
// إعدادات آمنة وخفيفة
// -----------------------------------------------------

/*
  ملاحظة اختيار النموذج:
  whisper-tiny أخف وأسرع، لكن دقته ضعيفة نسبياً
  باللغة العربية تحديداً (نماذج Whisper الصغيرة
  أضعف بكثير في اللغات غير الإنجليزية).

  whisper-base أدق بشكل ملحوظ بالعربي مع بقائه
  خفيفاً بما يكفي للعمل داخل المتصفح.
*/

const DESKTOP_MODEL = "Xenova/whisper-base";
const MOBILE_MODEL = "Xenova/whisper-tiny";
const TARGET_SAMPLE_RATE = 16000;

// Real local speech analysis is enabled on supported desktop browsers.
// Mobile is still blocked inside loadWhisper/transcribeVideo to protect RAM.
const USE_LOCAL_WHISPER = true;

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

function getModel() {
  // لا نشغّل Whisper المحلي على الهواتف: هذا المسار هو الأكثر عرضة
  // لاستهلاك RAM/CPU والتسبب بانهيار التبويب.
  return isMobileDevice() ? MOBILE_MODEL : DESKTOP_MODEL;
}


let transcriber = null;
let loadingPromise = null;


// -----------------------------------------------------
// تحميل Whisper عند الحاجة فقط
// -----------------------------------------------------

async function loadWhisper() {

  if (!USE_LOCAL_WHISPER) {
    throw new Error("LOCAL_WHISPER_DISABLED_FOR_DIAGNOSTIC");
  }

  if (transcriber)
    return transcriber;

  if (loadingPromise)
    return loadingPromise;


  loadingPromise =
    createTranscriberWithFallback();


  try {

    transcriber =
      await loadingPromise;

    return transcriber;

  } finally {

    loadingPromise =
      null;

  }

}


// -----------------------------------------------------
// إنشاء المحرك مع خطة بديلة إذا فشل WebGPU
// -----------------------------------------------------

async function createTranscriberWithFallback() {

  const preferredDevice =
    getBestDevice();


  try {

    return await pipeline(
      "automatic-speech-recognition",
      getModel(),
      {
        device:
          preferredDevice,

        dtype:
          getBestDtype()
      }
    );

  } catch (error) {

    /*
      WebGPU موجود بالمتصفح لكن ممكن يفشل فعلياً
      بأجهزة/متصفحات كتير. لا نترك المستخدم بدون
      نتيجة — نرجع نحاول عبر CPU (wasm).
    */

    if (preferredDevice === "wasm") {

      throw error;

    }


    return await pipeline(
      "automatic-speech-recognition",
      getModel(),
      {
        device:
          "wasm",

        dtype:
          "q8"
      }
    );

  }

}


// -----------------------------------------------------
// اختيار الجهاز
// -----------------------------------------------------

function getBestDevice() {

  /*
    WebGPU إن كان متاحاً.
    وإلا يرجع CPU.

    لا يوجد تشغيل دائم.
  */

  if (
    typeof navigator !== "undefined" &&
    "gpu" in navigator
  ) {

    return "webgpu";

  }

  return "wasm";

}


// -----------------------------------------------------
// اختيار دقة النموذج
// -----------------------------------------------------

function getBestDtype() {

  if (
    typeof navigator !== "undefined" &&
    "gpu" in navigator
  ) {

    return "q4";

  }

  return "q8";

}


// -----------------------------------------------------
// استخراج الصوت من الفيديو
// -----------------------------------------------------

export async function extractAudio(
  videoFile
) {

  if (!USE_LOCAL_WHISPER) {
    throw new Error("LOCAL_WHISPER_DISABLED_FOR_DIAGNOSTIC");
  }

  /*
    المتصفح لا يحتاج رفع الفيديو.
    نستخدم Web Audio API.

    ملاحظة:
    هذه المرحلة تجهز المسار الصوتي
    للتحليل المحلي.
  */

  const arrayBuffer =
    await videoFile.arrayBuffer();


  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContext) {

    throw new Error(
      "المتصفح لا يدعم Web Audio."
    );

  }


  const audioContext =
    new AudioContext();


  try {

    const audioBuffer =
      await audioContext.decodeAudioData(
        arrayBuffer.slice(0)
      );


    return audioBuffer;

  } finally {

    await audioContext.close();

  }

}


// -----------------------------------------------------
// تحويل AudioBuffer إلى Float32
// -----------------------------------------------------

function audioBufferToMono(audioBuffer) {
  const channels = audioBuffer.numberOfChannels;
  const inputLength = audioBuffer.length;
  const inputRate = audioBuffer.sampleRate;

  // Whisper يعمل على 16 kHz. عدم downsample هنا كان يرسل 44.1/48 kHz
  // arrays ضخمة إلى النموذج ويزيد ضغط الذاكرة بدون فائدة.
  const outputLength = Math.max(1, Math.round(inputLength * TARGET_SAMPLE_RATE / inputRate));
  const mono = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourcePosition = i * inputRate / TARGET_SAMPLE_RATE;
    const left = Math.floor(sourcePosition);
    const right = Math.min(left + 1, inputLength - 1);
    const fraction = sourcePosition - left;

    let sample = 0;
    for (let channel = 0; channel < channels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      const a = data[left] || 0;
      const b = data[right] || 0;
      sample += a + (b - a) * fraction;
    }
    mono[i] = sample / channels;
  }

  return {
    data: mono,
    sampling_rate: TARGET_SAMPLE_RATE
  };
}

// -----------------------------------------------------
// تحليل الكلام
// -----------------------------------------------------

export async function transcribeAudioBufferChunked(audioBuffer, options = {}) {
  if (!audioBuffer) throw new Error("لم يتم توفير AudioBuffer.");

  const whisper = await loadWhisper();
  const sampleRate = audioBuffer.sampleRate || 48000;
  const channels = audioBuffer.numberOfChannels || 1;
  const chunkSeconds = Math.max(4, Math.min(Number(options.chunkLength || 12), 15));
  const overlapSeconds = Math.max(0, Math.min(Number(options.overlap || 1.5), 3));
  const totalDuration = audioBuffer.duration || (audioBuffer.length / sampleRate);
  const targetRate = TARGET_SAMPLE_RATE;
  const segments = [];
  const texts = [];

  const mono = audioBufferToMono(audioBuffer).data;
  const samplesPerSecond = targetRate;
  const chunkSamples = Math.max(1, Math.round(chunkSeconds * samplesPerSecond));
  const overlapSamples = Math.max(0, Math.round(overlapSeconds * samplesPerSecond));
  const stepSamples = Math.max(1, chunkSamples - overlapSamples);

  for (let startSample = 0; startSample < mono.length; startSample += stepSamples) {
    const endSample = Math.min(mono.length, startSample + chunkSamples);
    const chunk = mono.slice(startSample, endSample);
    const offset = startSample / samplesPerSecond;

    const result = await whisper(chunk, {
      chunk_length_s: Math.min(chunkSeconds, 15),
      stride_length_s: 1,
      return_timestamps: true,
      language: options.language || "ar",
      task: "transcribe"
    });

    const normalized = normalizeResult(result);
    if (normalized.text) texts.push(normalized.text);

    for (const segment of normalized.segments) {
      if (!segment.text) continue;
      const start = Number.isFinite(segment.start) ? segment.start + offset : offset;
      const end = Number.isFinite(segment.end) ? segment.end + offset : Math.min(totalDuration, offset + chunkSeconds);
      segments.push({
        text: segment.text,
        start: Number(Math.max(0, start).toFixed(2)),
        end: Number(Math.min(totalDuration, end).toFixed(2))
      });
    }

    if (endSample >= mono.length) break;
  }

  const deduped = dedupeTranscriptSegments(segments, texts);
  const text = deduped.text;
  const cleanSegments = deduped.segments;
  return {
    text,
    segments: cleanSegments,
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
    hasSpeech: cleanSegments.length > 0 || text.length > 0,
    chunked: true,
    chunkSeconds,
    totalDuration: Number(totalDuration.toFixed(2))
  };
}

function dedupeTranscriptSegments(segments, fallbackTexts = []) {
  const sorted = [...segments]
    .filter((s) => s && String(s.text || "").trim())
    .map((s) => ({
      ...s,
      text: String(s.text || "").replace(/\s+/g, " ").trim(),
      start: Number.isFinite(Number(s.start)) ? Number(s.start) : null,
      end: Number.isFinite(Number(s.end)) ? Number(s.end) : null
    }))
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  const clean = [];
  for (const segment of sorted) {
    const previous = clean[clean.length - 1];
    if (
      previous &&
      previous.end != null &&
      segment.start != null &&
      segment.start <= previous.end + 0.65 &&
      (
        previous.text === segment.text ||
        previous.text.includes(segment.text) ||
        segment.text.includes(previous.text)
      )
    ) {
      if (segment.text.length > previous.text.length) previous.text = segment.text;
      previous.end = Math.max(previous.end ?? 0, segment.end ?? previous.end ?? 0);
      continue;
    }
    clean.push(segment);
  }

  const finalSegments = clean.map((s) => ({
    text: s.text,
    start: s.start,
    end: s.end
  }));

  const text = finalSegments.length
    ? finalSegments.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim()
    : String(fallbackTexts.join(" ") || "").replace(/\s+/g, " ").trim();

  return { text, segments: finalSegments };
}

export async function transcribeVideo(
  videoFile,
  options = {}
) {

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

  if (!videoFile && !options.preDecodedAudioBuffer) {

    throw new Error(
      "لم يتم اختيار فيديو."
    );

  }


  const whisper =
    await loadWhisper();


  // إذا كان الصوت مفكوك الترميز مسبقاً (لتفادي فك الترميز مرتين
  // وتخفيف الضغط على الذاكرة)، استخدمه مباشرة بدل إعادة القراءة.
  const audioBuffer =
    options.preDecodedAudioBuffer ||
    await extractAudio(
      videoFile
    );


  const audio =
    audioBufferToMono(
      audioBuffer
    );


  const result =
    await whisper(
      audio,
      {
        chunk_length_s:
          options.chunkLength || 20,

        stride_length_s:
          options.stride || 3,

        return_timestamps:
          true,

        language:
          options.language || "ar",

        task:
          "transcribe"
      }
    );


  return normalizeResult(
    result
  );

}


// -----------------------------------------------------
// تنظيم النتيجة
// -----------------------------------------------------

function normalizeResult(
  result
) {

  const text =
    (result?.text || "")
      .trim();


  const chunks =
    Array.isArray(
      result?.chunks
    )
      ? result.chunks
      : [];


  const segments =
    chunks.map(
      chunk => {

        const timestamp =
          chunk.timestamp;


        let start =
          null;

        let end =
          null;


        if (
          Array.isArray(
            timestamp
          )
        ) {

          start =
            Number(
              timestamp[0]
            );

          end =
            Number(
              timestamp[1]
            );

        }


        return {
          text:
            (chunk.text || "")
              .trim(),

          start,

          end
        };

      }
    );


  return {

    text,

    segments,

    wordCount:
      text
        ? text.split(/\s+/).length
        : 0,

    hasSpeech:
      text.length > 0

  };

}


// -----------------------------------------------------
// حالة المحرك
// -----------------------------------------------------

export function getWhisperStatus() {

  return {

    loaded:
      Boolean(
        transcriber
      ),

    model:
      getModel(),

    local:
      true,

    gpu:
      typeof navigator !== "undefined" &&
      "gpu" in navigator

  };

}


// -----------------------------------------------------
// تفريغ النموذج من الذاكرة
// -----------------------------------------------------

export function unloadWhisper() {

  transcriber =
    null;

  loadingPromise =
    null;

}
