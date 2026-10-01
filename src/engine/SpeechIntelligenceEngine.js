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
      voiceProfile: analyzeVoiceDelivery(audioBuffer),
      mode: "mobile-activity-only",
      transcriptionReady: false,
      limitation: "mobile-local-transcription-disabled-until-device-safe-path-is-enabled",
      diagnostics: { stage: "mobile-guard", transcriptionAttempted: false }
    };
  }

  try {
    const whisper = await import("../ai/whisper.js?v=6.5.0");

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
      voiceProfile: analyzeVoiceDelivery(audioBuffer),
      mode: mobile ? "mobile-whisper-chunked" : "desktop-whisper-chunked",
      transcriptionReady: Boolean(result?.text),
      diagnostics: {
        stage: "transcription-complete",
        transcriptionAttempted: true,
        segmentCount: Array.isArray(result?.segments) ? result.segments.length : 0,
        textLength: String(result?.text || "").length
      }
    };
  } catch (error) {
    console.warn("MTI Speech Intelligence:", error);
    return {
      ...detectSpeechActivity(audioBuffer),
      voiceProfile: analyzeVoiceDelivery(audioBuffer),
      mode: mobile ? "mobile-activity-fallback" : "desktop-activity-fallback",
      transcriptionReady: false,
      unavailable: false,
      fallbackReason: error?.message || "local-transcription-failed",
      diagnostics: {
        stage: "transcription-failed",
        transcriptionAttempted: true,
        errorName: error?.name || "Error",
        errorMessage: error?.message || "local-transcription-failed"
      }
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

function analyzeVoiceDelivery(audioBuffer) {
  const sampleRate = audioBuffer?.sampleRate || 0;
  const length = audioBuffer?.length || 0;
  const channels = audioBuffer?.numberOfChannels || 0;

  if (!sampleRate || !length || !channels) {
    return { available: false, reason: "invalid-audio-buffer" };
  }

  const mono = new Float32Array(Math.min(length, sampleRate * 180));
  const source = audioBuffer.getChannelData(0);
  const step = Math.max(1, Math.floor(length / mono.length));
  for (let i = 0; i < mono.length; i++) mono[i] = source[i * step] || 0;

  const windowSize = Math.max(1, Math.floor(sampleRate * 0.04));
  const energies = [];
  const pitches = [];

  for (let start = 0; start + windowSize < mono.length; start += windowSize * 2) {
    let sum = 0;
    for (let i = start; i < start + windowSize; i++) {
      const s = mono[i];
      sum += s * s;
    }
    const rms = Math.sqrt(sum / windowSize);
    if (rms < 0.012) continue;

    energies.push(rms);
    const pitch = estimatePitch(mono, start, windowSize, sampleRate);
    if (pitch) pitches.push(pitch);
  }

  if (!energies.length) return { available: true, spoken: false };

  const energyMean = averageNumbers(energies);
  const energyStd = standardDeviation(energies, energyMean);
  const pitchMean = pitches.length ? averageNumbers(pitches) : null;
  const pitchStd = pitches.length ? standardDeviation(pitches, pitchMean) : null;

  return {
    available: true,
    spoken: true,
    energyMean: Number(energyMean.toFixed(4)),
    energyVariation: Number((energyStd / Math.max(energyMean, 0.0001)).toFixed(3)),
    pitchMeanHz: pitchMean ? Number(pitchMean.toFixed(1)) : null,
    pitchVariationHz: pitchStd ? Number(pitchStd.toFixed(1)) : null,
    expressiveEnergy: energyStd / Math.max(energyMean, 0.0001) >= 0.45,
    expressivePitch: Boolean(pitchStd && pitchStd >= 22),
    note: "Prosody is measured acoustically; emotion or intent is not claimed from these signals alone."
  };
}

function estimatePitch(samples, start, windowSize, sampleRate) {
  const minLag = Math.max(1, Math.floor(sampleRate / 400));
  const maxLag = Math.min(Math.floor(sampleRate / 80), windowSize - 1);
  let bestLag = 0;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 2) {
    let sum = 0;
    let energyA = 0;
    let energyB = 0;
    const limit = Math.min(windowSize - lag, 1200);
    for (let i = 0; i < limit; i++) {
      const a = samples[start + i];
      const b = samples[start + i + lag];
      sum += a * b;
      energyA += a * a;
      energyB += b * b;
    }
    const denom = Math.sqrt(energyA * energyB);
    const correlation = denom ? sum / denom : 0;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  return bestCorrelation >= 0.72 && bestLag ? sampleRate / bestLag : null;
}

function averageNumbers(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values, mean = averageNumbers(values)) {
  if (!values.length) return 0;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
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
