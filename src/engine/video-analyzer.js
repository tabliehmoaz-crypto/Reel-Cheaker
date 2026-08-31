// REEL CHECK V2
// Local Video Analysis Engine
// No API / No server / No upload

export async function analyzeVideo(file) {
  if (!file || !file.type.startsWith("video/")) {
    throw new Error("الملف ليس فيديو صالحاً");
  }

  const video = document.createElement("video");

  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";

  const url = URL.createObjectURL(file);
  video.src = url;

  await waitForMetadata(video);

  const duration = video.duration;

  const result = {
    file: {
      name: file.name,
      type: file.type,
      size: file.size
    },

    video: {
      duration: round(duration, 2),
      width: video.videoWidth,
      height: video.videoHeight,
      aspectRatio: round(video.videoWidth / video.videoHeight, 3)
    },

    timing: {
      firstHalfSecond: await captureFrame(video, 0.25),
      firstSecond: await captureFrame(video, 0.75),
      secondSecond: await captureFrame(video, Math.min(1.8, duration - 0.05)),
      thirdSecond: await captureFrame(video, Math.min(2.8, duration - 0.05))
    }
  };

  URL.revokeObjectURL(url);

  return result;
}

function waitForMetadata(video) {
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = () => reject(new Error("تعذر قراءة الفيديو"));
  });
}

function captureFrame(video, time) {
  return new Promise((resolve) => {
    if (!isFinite(time) || time < 0 || time >= video.duration) {
      resolve(null);
      return;
    }

    video.currentTime = time;

    video.onseeked = () => {
      const canvas = document.createElement("canvas");

      const maxWidth = 320;
      const ratio = video.videoHeight / video.videoWidth;

      canvas.width = maxWidth;
      canvas.height = Math.round(maxWidth * ratio);

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true
      });

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const image = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      resolve({
        time: round(time, 2),
        width: canvas.width,
        height: canvas.height,
        brightness: calculateBrightness(image),
        motionData: calculateMotionPotential(image)
      });
    };
  });
}

function calculateBrightness(imageData) {
  const data = imageData.data;

  let total = 0;
  let pixels = 0;

  for (let i = 0; i < data.length; i += 16) {
    total += (
      data[i] * 0.299 +
      data[i + 1] * 0.587 +
      data[i + 2] * 0.114
    );

    pixels++;
  }

  return round(total / pixels, 1);
}

function calculateMotionPotential(imageData) {
  const data = imageData.data;

  let variation = 0;

  for (let i = 0; i < data.length - 16; i += 32) {
    variation += Math.abs(data[i] - data[i + 8]);
  }

  return round(
    variation / Math.max(1, data.length / 32),
    2
  );
}

function round(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}
