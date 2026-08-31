import { analyzeVideo } from "./video-analyzer.js";

export async function analyzeReel(file) {
  const video = await analyzeVideo(file);

  const scores = {
    hook: calculateHookScore(video),
    pacing: calculatePacingScore(video),
    visual: calculateVisualScore(video),
    technical: calculateTechnicalScore(video)
  };

  const overall = calculateOverallScore(scores);

  return {
    version: "2.0",
    analyzedAt: new Date().toISOString(),

    video,

    scores,

    overall,

    diagnosis: generateDiagnosis(scores, video),

    recommendations: generateRecommendations(scores, video)
  };
}

function calculateHookScore(data) {
  let score = 50;

  const first = data.timing.firstHalfSecond;
  const second = data.timing.firstSecond;

  if (!first) return score;

  if (first.brightness !== second?.brightness) {
    score += 10;
  }

  if (first.motionData > 15) {
    score += 10;
  }

  if (data.video.duration <= 30) {
    score += 5;
  }

  return clamp(score);
}

function calculatePacingScore(data) {
  const duration = data.video.duration;

  if (duration <= 15) return 85;
  if (duration <= 30) return 75;
  if (duration <= 45) return 65;

  return 55;
}

function calculateVisualScore(data) {
  const values = [
    data.timing.firstHalfSecond,
    data.timing.firstSecond,
    data.timing.secondSecond,
    data.timing.thirdSecond
  ].filter(Boolean);

  if (!values.length) return 50;

  const brightness = values.map(v => v.brightness);

  const variation =
    Math.max(...brightness) -
    Math.min(...brightness);

  return clamp(55 + variation * 0.4);
}

function calculateTechnicalScore(data) {
  let score = 70;

  const ratio = data.video.aspectRatio;

  // Reel vertical format
  if (ratio >= 0.5 && ratio <= 0.65) {
    score += 20;
  }

  if (data.video.duration >= 5) {
    score += 5;
  }

  return clamp(score);
}

function calculateOverallScore(scores) {
  return Math.round(
    scores.hook * 0.35 +
    scores.pacing * 0.25 +
    scores.visual * 0.20 +
    scores.technical * 0.20
  );
}

function generateDiagnosis(scores, data) {
  const problems = [];

  if (scores.hook < 60) {
    problems.push("الهوك يحتاج تحسين في البداية");
  }

  if (scores.pacing < 65) {
    problems.push("الإيقاع قد يكون بطيئاً");
  }

  if (scores.visual < 60) {
    problems.push("التغيير البصري ضعيف");
  }

  if (scores.technical < 70) {
    problems.push("هناك ملاحظات تقنية على الفيديو");
  }

  if (!problems.length) {
    problems.push("البنية الأساسية للفيديو جيدة");
  }

  return problems;
}

function generateRecommendations(scores, data) {
  const recommendations = [];

  if (scores.hook < 70) {
    recommendations.push(
      "اختبر بداية أكثر مباشرة خلال أول 0.5 ثانية."
    );
  }

  if (scores.pacing < 70) {
    recommendations.push(
      "اختبر تقليل الفترات الثابتة وتسريع الانتقال بين الأفكار."
    );
  }

  if (scores.visual < 65) {
    recommendations.push(
      "أضف تغييراً بصرياً مبكراً لدعم الانتباه."
    );
  }

  if (data.video.duration > 30) {
    recommendations.push(
      "راجع كل ثانية للتأكد من أنها تضيف قيمة أو تدفع القصة للأمام."
    );
  }

  return recommendations;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
