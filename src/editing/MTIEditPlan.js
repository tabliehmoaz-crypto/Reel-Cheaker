/*
 * MTI Edit Plan — stable contract between diagnosis, editor UI and renderer.
 */
export const MTI_EDIT_PLAN_VERSION = "1.0.0";
export const EDIT_ACTIONS = Object.freeze({
  TRIM: "trim", CUT: "cut", REORDER: "reorder", SPEED: "speed", TEXT: "text", AUDIO: "audio"
});
const TYPES = new Set(Object.values(EDIT_ACTIONS));
function number(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
export function normalizeEditOperation(input = {}, index = 0) {
  const action = String(input.action || "").toLowerCase();
  if (!TYPES.has(action)) return null;
  const confidence = Math.max(0, Math.min(1, number(input.confidence, 0)));
  const operation = {
    id: input.id || ("edit_" + Date.now() + "_" + index),
    action, target: input.target || null,
    start: number(input.start, null), end: number(input.end, null),
    speed: number(input.speed, null),
    text: input.text != null ? String(input.text) : null,
    position: input.position || "center",
    segments: Array.isArray(input.segments)
      ? input.segments.map(segment => ({ start: number(segment?.start, null), end: number(segment?.end, null) })).filter(segment => segment.start != null && segment.end != null && segment.end > segment.start)
      : [],
    volume: number(input.volume, null), mute: input.mute === true,
    reason: input.reason || "", evidence: Array.isArray(input.evidence) ? input.evidence : [],
    confidence, executable: input.executable !== false && confidence >= 0.65
  };
  if (operation.start != null) operation.start = Math.max(0, operation.start);
  if (operation.end != null) operation.end = Math.max(0, operation.end);
  if (operation.end != null && operation.start != null && operation.end <= operation.start) operation.executable = false;
  return operation;
}
export function createEditPlan(data = {}) {
  const operations = (Array.isArray(data.operations) ? data.operations : []).map(normalizeEditOperation).filter(Boolean);
  return {
    version: MTI_EDIT_PLAN_VERSION,
    id: data.id || ("plan_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8)),
    sourceVersionId: data.sourceVersionId || null,
    sourceExperimentId: data.sourceExperimentId || null,
    createdAt: data.createdAt || new Date().toISOString(),
    operations,
    executableOperations: operations.filter(op => op.executable),
    blockedOperations: operations.filter(op => !op.executable),
    summary: data.summary || "",
    warnings: Array.isArray(data.warnings) ? data.warnings : []
  };
}
export function getExecutableOperations(plan) {
  return Array.isArray(plan?.executableOperations)
    ? plan.executableOperations
    : Array.isArray(plan?.operations) ? plan.operations.filter(op => op?.executable) : [];
}
