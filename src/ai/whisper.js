import {
  pipeline,
  env
} from "@huggingface/transformers";

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

const MODEL =
  "Xenova/whisper-tiny";


let transcriber = null;
let loadingPromise = null;


// -----------------------------------------------------
// تحميل Whisper عند الحاجة فقط
// -----------------------------------------------------

async function loadWhisper() {

  if (transcriber)
    return transcriber;

  if (loadingPromise)
    return loadingPromise;


  loadingPromise =
    pipeline(
      "automatic-speech-recognition",
      MODEL,
      {
        device:
          getBestDevice(),

        dtype:
          getBestDtype()
      }
    );


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

async function extractAudio(
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

function audioBufferToMono(
  audioBuffer
) {

  const channels =
    audioBuffer.numberOfChannels;


  const length =
    audioBuffer.length;


  const mono =
    new Float32Array(
      length
    );


  for (
    let channel = 0;
    channel < channels;
    channel++
  ) {

    const data =
      audioBuffer.getChannelData(
        channel
      );


    for (
      let i = 0;
      i < length;
      i++
    ) {

      mono[i] +=
        data[i] / channels;

    }

  }


  return {
    data: mono,
    sampling_rate:
      audioBuffer.sampleRate
  };

}


// -----------------------------------------------------
// تحليل الكلام
// -----------------------------------------------------

export async function transcribeVideo(
  videoFile,
  options = {}
) {

  if (!videoFile) {

    throw new Error(
      "لم يتم اختيار فيديو."
    );

  }


  const whisper =
    await loadWhisper();


  const audioBuffer =
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
      MODEL,

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
