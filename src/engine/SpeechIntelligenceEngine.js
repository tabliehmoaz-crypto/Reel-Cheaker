/*
 * MTI — Speech Intelligence Engine
 * ---------------------------------
 * Owns speech extraction/transcription decisions so the rest of MTI
 * consumes one stable speech result instead of knowing Whisper details.
 *
 * Design:
 * - Audio is decoded once by LocalSignalExtractor.
 * - Desktop: local Whisper transcription is processed in bounded chunks.
 * - Mobile: stays activity-only until a device-safe local transcription
 *   capability is explicitly enabled; this prevents another tab crash.
 * - No network transcription is used here.
 */

const DESKTOP_TIMEOUT_MS = 180000;

export async function analyzeSpeech(audioBuffer, options = {}) {
  if (!audioBuffer) {
    return unavailable("no-decoded-audio");
  }

  const mobile = isMobileDevice();

  if (mobile && options.mobileWhisper !== true) {
    return {
      ...detectSpeechActivity(audioBuffer),
      mode: "mobile-activity-only",
      transcriptionReady: false,
      limitation: "mobile-local-transcription-disabled-until-device-safe-path-is enabled"
    };
  }

  try {
    const whisper = await import("../ai/whisper.js");

    if (typeof whisper.transcribeAudioBufferChunked !== "function") {
      throw new Error("Chunked local transcription engine is unavailable.");
    }

    const result = await withTimeout(
      whisper.transcribeAudioBufferChunked(audioBuffer, {
        language: options.language || "ar",
        chunkLength: mobile ? 8 : 12,
        overlap: mobile ? 1 : 1.5
      }),
      mobile ? 120000 : DESKTOP_TIMEOUT_MS,
      "Local speech transcription timed out."
    );

    return {
      ...result,
      mode: mobile ? "mobile-whisper-chunked" : "desktop-whisper-chunked",
      transcriptionReady: Boolean(result?.text)
    };
  } catch (error) {
    console.warn("MTI Speech Intelligence:", error);
    return {
      ...detectSpeechActivity(audioBuffer),
      mode: mobile ? "mobile-activity-fallback" : "desktop-activity-fallback",
      transcriptionReady: false,
      unavailable: false,
      fallbackReason: error?.message || "local-transcription-failed"
    };
  }
}

function detectSpeechActivity(audioBuffer) {
  const channelCount = audioBuffer?.numberOfChannels || 0;
  const sampleRate = audioBuffer?.sampleRate || 0;
  const length = audioBuffer?.length || 0;

  if (!channelCount || !sampleRate || !length) {
    return unavailable("invalid-audio-buffer");
  }

  const windowSize = Math.max(1, Math.floor(sampleRate * 0.10));
  const threshold = 0.018;
  const segments = [];
  let activeStart = null;
  let activeEnd = null;

  for (let offset = 0; offset < length; offset += windowSize) {
    const end = Math.min(length, offset + windowSize);
    let sum = 0;
    let count = 0;

    for (let channel = 0; channel < channelCount; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = offset; i < end; i += 4) {
        const sample = data[i] || 0;
        sum += sample * sample;
        count++;
      }
    }

    const rms = count ? Math.sqrt(sum / count) : 0;
    const startSec = offset / sampleRate;
    const endSec = end / sampleRate;

    if (rms >= threshold) {
      if (activeStart == null) activeStart = startSec;
      activeEnd = endSec;
    } else if (activeStart != null) {
      if (activeEnd - activeStart >= 0.20) {
        segments.push({ text: "", start: Number(activeStart.toFixed(2)), end: Number(activeEnd.toFixed(2)) });
      }
      activeStart = null;
      activeEnd = null;
    }
  }

  if (activeStart != null && activeEnd - activeStart >= 0.20) {
    segments.push({ text: "", start: Number(activeStart.toFixed(2)), end: Number(activeEnd.toFixed(2)) });
  }

  return {
    text: "",
    wordCount: 0,
    hasSpeech: segments.length > 0,
    segments,
    unavailable: false,
    activityOnly: true,
    reason: "speech-activity-detection"
  };
}

function unavailable(reason) {
  return {
    text: "",
    wordCount: 0,
    hasSpeech: false,
    segments: [],
    unavailable: true,
    reason
  };
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

function withTimeout(promise, ms, message) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      value => { clearTimeout(timeoutId); resolve(value); },
      error => { clearTimeout(timeoutId); reject(error); }
    );
  });
}

export default analyzeSpeech;
