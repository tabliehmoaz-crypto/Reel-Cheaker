import assert from "node:assert/strict";
import { createEditPlan, normalizeEditOperation } from "../src/editing/MTIEditPlan.js";
import { diagnoseReel } from "../src/editing/MTIDiagnosisEngine.js";

const op = normalizeEditOperation({
  action: "cut",
  start: 2,
  end: 2.5,
  confidence: 0.8,
  reason: "test",
  evidence: ["timestamped_signal"]
});
assert.equal(op.executable, true);

const plan = createEditPlan({ operations: [op] });
assert.equal(plan.executableOperations.length, 1);
assert.equal(plan.blockedOperations.length, 0);

const diagnosis = diagnoseReel({
  video: { dimensions: { duration: 10 } },
  intelligence: {
    attention: { score: 35 },
    dropOffRisks: [{ timestamp: 5, risk: 80, reason: "measured test signal" }]
  },
  sceneAnalysis: [{ start: 0, end: 2, duration: 2 }]
});
assert.ok(diagnosis.editPlan.operations.length >= 2);
assert.ok(diagnosis.editPlan.executableOperations.length >= 2);

console.log("MTI edit contract tests: PASS");
