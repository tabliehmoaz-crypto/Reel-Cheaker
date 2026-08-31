import { getReelHistory } from "../memory/reel-memory.js";

export function generateAccountInsights() {
  const history = getReelHistory();

  const completed = history.filter(
    reel => reel.actualPerformance
  );

  if (completed.length < 5) {
    return {
      status: "insufficient_data",
      message: "نحتاج 5 ريلز على الأقل مع نتائج فعلية قبل استخراج أنماط موثوقة.",
      insights: []
    };
  }

  const insights = [];

  const averageViews = average(
    completed.map(r => r.actualPerformance.views)
  );

  const highPerformers = completed.filter(
    r => r.actualPerformance.views > averageViews * 1.5
  );

  const lowPerformers = completed.filter(
    r => r.actualPerformance.views < averageViews * 0.5
  );

  if (highPerformers.length >= 3) {
    const highHookScore = average(
      highPerformers.map(
        r => r.analysis?.scores?.hook
      )
    );

    const lowHookScore = average(
      lowPerformers.map(
        r => r.analysis?.scores?.hook
      )
    );

    if (
      highHookScore !== null &&
      lowHookScore !== null &&
      highHookScore > lowHookScore + 10
    ) {
      insights.push({
        type: "hook",
        confidence: calculateConfidence(
          highPerformers.length,
          completed.length
        ),
        finding:
          "الريلز ذات تقييم Hook أعلى تحقق أداء أفضل في بيانات حسابك.",
        evidence: {
          highPerformerAverageHook: Math.round(highHookScore),
          lowPerformerAverageHook: Math.round(lowHookScore)
        }
      });
    }
  }

  const shortVideos = completed.filter(
    r => r.analysis?.video?.video?.duration <= 20
  );

  const longVideos = completed.filter(
    r => r.analysis?.video?.video?.duration > 20
  );

  if (shortVideos.length >= 3 && longVideos.length >= 3) {
    const shortViews = average(
      shortVideos.map(r => r.actualPerformance.views)
    );

    const longViews = average(
      longVideos.map(r => r.actualPerformance.views)
    );

    if (shortViews > longViews * 1.3) {
      insights.push({
        type: "duration",
        confidence: 60,
        finding:
          "الريلز الأقصر تحقق حالياً أداءً أفضل من الأطول في بيانات حسابك.",
        evidence: {
          shortAverageViews: shortViews,
          longAverageViews: longViews
        }
      });
    }
  }

  return {
    status: "ready",
    analyzedReels: completed.length,
    averageViews,
    insights
  };
}

function average(values) {
  const valid = values.filter(
    value =>
      typeof value === "number" &&
      Number.isFinite(value)
  );

  if (!valid.length) return null;

  return (
    valid.reduce((sum, value) => sum + value, 0) /
    valid.length
  );
}

function calculateConfidence(sample, total) {
  const ratio = sample / total;

  return Math.min(
    95,
    Math.round(40 + ratio * 55)
  );
}
