const STORAGE_KEY = "reel_check_memory_v2";

export function saveReelAnalysis(analysis) {
  const history = getReelHistory();

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),

    analysis,

    actualPerformance: null
  };

  history.push(record);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );

  return record;
}

export function getReelHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function updateReelPerformance(id, performance) {
  const history = getReelHistory();

  const index = history.findIndex(
    reel => reel.id === id
  );

  if (index === -1) {
    throw new Error("الريل غير موجود في الذاكرة");
  }

  history[index].actualPerformance = {
    ...performance,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );

  return history[index];
}

export function clearReelMemory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getLearningData() {
  const history = getReelHistory();

  const completed = history.filter(
    reel => reel.actualPerformance
  );

  return {
    totalReels: history.length,
    completedReels: completed.length,
    pendingResults: history.length - completed.length,

    averageViews: average(
      completed.map(r => r.actualPerformance.views)
    ),

    averageWatchTime: average(
      completed.map(r => r.actualPerformance.averageWatchTime)
    ),

    averageShares: average(
      completed.map(r => r.actualPerformance.shares)
    ),

    averageSaves: average(
      completed.map(r => r.actualPerformance.saves)
    )
  };
}

function average(values) {
  const valid = values.filter(
    value => typeof value === "number" && !isNaN(value)
  );

  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) /
    valid.length
  );
}
