import assert from "node:assert/strict";
import { LocalIntelligenceEngine } from "../src/ai/LocalIntelligenceEngine.js";

const engine = new LocalIntelligenceEngine();

const result = await engine.analyze({
  video: { dimensions: { duration: 8, width: 1080, height: 1920 } },
  hook: { score: 60, visualComponent: 60, audioComponent: null },
  pacing: { score: 55, cutsPerSecond: 0.3 },
  visual: { score: 70 },
  technical: { duration: 8 },
  audio: null,
  speech: { available: false, text: "", wordCount: 0, segments: [] },
  idea: { score: 30 },
  dropOff: { points: [] },
  scores: {}
}, {
  context: {
    scientificKnowledge: [],
    generalKnowledge: [],
    relevantKnowledge: [],
    benchmarks: {},
    evidencePolicy: null,
    personalMemory: null,
    accountLearning: null,
    activeContentAccount: null
  }
});

assert.ok(result);
assert.ok(result.prediction);
assert.equal(typeof result.prediction.retentionEstimate, "number");
assert.ok(result.limitations);
console.log("MTI intelligence runtime test: PASS");
