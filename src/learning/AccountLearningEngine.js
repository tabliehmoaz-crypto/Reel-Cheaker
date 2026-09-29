/*
  MTI — Account Learning Engine
  -----------------------------
  Canonical private learning derivation layer.

  It does NOT own storage.
  It reads the account-scoped Reel Memory dataset and derives:
  - observations
  - patterns
  - correlations
  - account profile
  - prediction context

  This replaces the need for multiple competing learning engines.
*/

import { memoryService } from "../core/MTIMemoryService.js";

export const ACCOUNT_LEARNING_VERSION = "1.0.0";
export const MIN_ACCOUNT_SAMPLES = 3;
export const STRONG_ACCOUNT_SAMPLES = 5;

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function average(values) {
  const valid = values.map(finite).filter(v => v !== null);
  return valid.length
    ? valid.reduce((sum, value) => sum + value, 0) / valid.length
    : null;
}

function correlation(xs, ys) {
  const pairs = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i += 1) {
    const x = finite(xs[i]);
    const y = finite(ys[i]);
    if (x !== null && y !== null) pairs.push([x, y]);
  }

  if (pairs.length < MIN_ACCOUNT_SAMPLES) return null;

  const mx = average(pairs.map(p => p[0]));
  const my = average(pairs.map(p => p[1]));

  let numerator = 0;
  let dx2 = 0;
  let dy2 = 0;

  for (const [x, y] of pairs) {
    const dx = x - mx;
    const dy = y - my;
    numerator += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }

  const denominator = Math.sqrt(dx2 * dy2);
  return denominator ? numerator / denominator : null;
}

function extractScore(item, key) {
  return (
    item?.analysis?.scores?.[key] ??
    item?.analysis?.[key]?.score ??
    item?.analysis?.[key] ??
    null
  );
}

export class AccountLearningEngine {
  constructor(options = {}) {
    this.version = options.version || ACCOUNT_LEARNING_VERSION;
    this.minSamples = options.minSamples || MIN_ACCOUNT_SAMPLES;
    this.strongSamples = options.strongSamples || STRONG_ACCOUNT_SAMPLES;
  }

  getDataset() {
    memoryService.ensureInitialized();
    return memoryService.getLearningDataset() || [];
  }

  getSnapshot() {
    memoryService.ensureInitialized();
    const dataset = this.getDataset();
    const stored = memoryService.getLearnings();

    return {
      version: this.version,
      sampleSize: dataset.length,
      stage:
        dataset.length === 0
          ? "cold-start"
          : dataset.length < this.minSamples
            ? "observation"
            : dataset.length < this.strongSamples
              ? "early-learning"
              : "pattern-learning",
      observations: stored?.observations || [],
      hypotheses: stored?.hypotheses || [],
      patterns: stored?.patterns || [],
      profile: this.buildProfile(dataset),
      updatedAt: new Date().toISOString()
    };
  }

  buildProfile(dataset = this.getDataset()) {
    const scores = dataset.map(item => finite(item?.analysis?.overall));
    const hooks = dataset.map(item => extractScore(item, "hook"));
    const pacing = dataset.map(item => extractScore(item, "pacing"));
    const visual = dataset.map(item => extractScore(item, "visual"));
    const views = dataset.map(item => finite(item?.actual?.views));

    return {
      averages: {
        overall: average(scores),
        hook: average(hooks),
        pacing: average(pacing),
        visual: average(visual),
        views: average(views)
      },
      correlations: {
        overallViews: correlation(scores, views),
        hookViews: correlation(hooks, views),
        pacingViews: correlation(pacing, views),
        visualViews: correlation(visual, views)
      }
    };
  }

  evaluate(analysis = {}) {
    const dataset = this.getDataset();

    if (dataset.length < this.minSamples) {
      return {
        ready: false,
        sampleSize: dataset.length,
        confidence: "low",
        reason: `Need at least ${this.minSamples} published reels with real performance before making account-specific patterns.`
      };
    }

    const profile = this.buildProfile(dataset);
    const current = {
      overall: finite(analysis?.overall),
      hook: extractScore({ analysis }, "hook"),
      pacing: extractScore({ analysis }, "pacing"),
      visual: extractScore({ analysis }, "visual")
    };

    const compare = (value, avg) =>
      value === null || avg === null
        ? null
        : Math.round(value - avg);

    return {
      ready: true,
      sampleSize: dataset.length,
      confidence: dataset.length >= this.strongSamples ? "medium" : "low",
      current,
      deltasFromAccountAverage: {
        overall: compare(current.overall, profile.averages.overall),
        hook: compare(current.hook, profile.averages.hook),
        pacing: compare(current.pacing, profile.averages.pacing),
        visual: compare(current.visual, profile.averages.visual)
      },
      profile
    };
  }

  getInfo() {
    return {
      name: "AccountLearningEngine",
      version: this.version,
      storageOwner: "MTIMemoryService",
      accountScoped: true,
      minSamples: this.minSamples,
      strongSamples: this.strongSamples
    };
  }
}

export const accountLearningEngine = new AccountLearningEngine();
export default accountLearningEngine;
