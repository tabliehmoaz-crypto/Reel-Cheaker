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
const TARGET_SAMPLE_RATE = 16000;

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

function getModel() {
  // لا نشغّل Whisper المحلي على الهواتف: هذا المسار هو الأكثر عرضة
  // لاستهلاك RAM/CPU والتسبب بانهيار التبويب.
  return DESKTOP_MODEL;
}


let transcriber = null;
let loadingPromise = null;


// -----------------------------------------------------
// تحميل Whisper عند الحاجة فقط
// -----------------------------------------------------

async function loadWhisper() {

  if (isMobileDevice()) {
    throw new Error("LOCAL_WHISPER_UNAVAILABLE_ON_MOBILE");
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

export async function transcribeVideo(
  videoFile,
  options = {}
) {

  if (!videoFile && !options.preDecodedAudioBuffer) {

    throw new Error(
      "لم يتم اختيار فيديو."
    );

  }


  if (isMobileDevice()) {
    return {
      text: "",
      segments: [],
      wordCount: 0,
      hasSpeech: false,
      unavailable: true,
      reason: "mobile-safe-mode"
    };
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
