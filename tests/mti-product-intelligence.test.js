import assert from "node:assert/strict";
import { parseInstagramInsightText } from "../src/insights/MTIPostPublishInsights.js";
import { getMTITrainingManifest } from "../src/ai/MTITrainingManifest.js";

const sample = "Views 12.4K\nReach 8,100\nLikes 620\nComments 44\nShares 83\nSaves 71\nCompletion rate 42%\nSkip rate 31%";
const parsed = parseInstagramInsightText(sample);

assert.equal(parsed.metrics.views, 12400);
assert.equal(parsed.metrics.reach, 8100);
assert.equal(parsed.metrics.likes, 620);
assert.equal(parsed.metrics.comments, 44);
assert.equal(parsed.metrics.shares, 83);
assert.equal(parsed.metrics.saves, 71);
assert.equal(parsed.metrics.completionRate, 42);
assert.equal(parsed.metrics.skipRate, 31);

const manifest = getMTITrainingManifest();
assert.ok(manifest.domains.length >= 12);
assert.equal(manifest.evidenceLevels.measured.includes("Directly"), true);
assert.equal(manifest.hardRules.some(rule => rule.includes("missing evidence")), true);

console.log("MTI product intelligence tests passed.");
