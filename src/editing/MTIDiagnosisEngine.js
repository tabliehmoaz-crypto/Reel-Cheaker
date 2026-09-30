/*
 * MTI Diagnosis Engine — measured signals -> evidence-backed edit actions.
 */
import { createEditPlan } from "./MTIEditPlan.js";
function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, Number(value) || 0)); }
function num(value, fallback = null) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function getLocal(report = {}) { return report?.localAnalysis || report?.localSignals || report || {}; }
function getScenes(local) { return local?.sceneAnalysis || local?.scenes || local?.scene?.scenes || []; }
function getDropOff(local, intel) {
  const localDropOff =
    local?.dropOff?.points ||
    local?.dropOff?.risks ||
    local?.dropOff ||
    null;

  if (Array.isArray(localDropOff) && localDropOff.length) {
    return localDropOff;
  }

  return Array.isArray(intel?.dropOffRisks)
    ? intel.dropOffRisks
    : [];
}
function getHookScore(local, intel) { return num(intel?.attention?.score ?? local?.hook?.score ?? local?.scores?.hook, null); }
function getDuration(report, local) {
  return num(report?.video?.dimensions?.duration ?? report?.metadata?.duration ?? local?.video?.dimensions?.duration ?? local?.technical?.duration, null);
}
function addOperation(operations, op) {
  if (!op) return;
  if (operations.some(x => x.action === op.action && Math.abs((x.start ?? -1) - (op.start ?? -1)) < 0.35 && Math.abs((x.end ?? -1) - (op.end ?? -1)) < 0.35)) return;
  operations.push(op);
}
export function diagnoseReel(report = {}, options = {}) {
  const local = getLocal(report), intel = report?.intelligence || local?.intelligence || {};
  const duration = getDuration(report, local), hookScore = getHookScore(local, intel);
  const scenes = getScenes(local), dropOff = getDropOff(local, intel);
  const operations = [], issues = [];
  const firstScene = scenes[0];
  const deliveryPattern = local?.deliveryPattern || {};
  const preserveSpokenPause = deliveryPattern.type === "spoken_setup_pause";

  if (hookScore != null && hookScore < 55 && !preserveSpokenPause && firstScene && num(firstScene.duration, 0) > 1.35) {
    const end = Math.min(num(firstScene.end, 1.2), 1.15);
    addOperation(operations, {
      action: "trim", target: "intro", start: 0, end,
      reason: "الافتتاح أطول من اللازم مقارنة بإشارة الهوك المقاسة.",
      evidence: ["hook_score", "first_scene_duration"],
      confidence: clamp(0.68 + (55 - hookScore) / 100)
    });
    issues.push({ id:"weak_intro", type:"hook", severity:"medium", start:0, end, evidence:["hook_score","first_scene_duration"], reason:"بداية طويلة مع إشارة جذب منخفضة نسبياً." });
  }
  for (const risk of dropOff.slice(0, 4)) {
    const timestamp = num(risk?.timestamp ?? risk?.start, null), riskScore = num(risk?.risk, 0);
    if (timestamp == null || riskScore < 60 || !duration) continue;
    const window = Math.min(0.45, Math.max(0.18, duration * 0.018));
    const start = Math.max(0, timestamp - window), end = Math.min(duration, timestamp + window);
    addOperation(operations, {
      action:"cut", target:"drop_off_risk", start, end,
      reason: risk?.reason || "إشارة توقف بصري/زمني مقاسة.",
      evidence:["drop_off_signal","timestamped_video_signal"],
      confidence:clamp(0.64 + riskScore / 250)
    });
    issues.push({ id:"dropoff_" + timestamp, type:"retention", severity:riskScore >= 75 ? "high" : "medium", start, end, evidence:["drop_off_signal"], reason:risk?.reason || "نقطة خطر زمنية." });
  }
  const cutsPerSecond = num(local?.pacing?.cutsPerSecond, null);
  if (cutsPerSecond != null && cutsPerSecond > 1.25 && duration) {
    addOperation(operations, {
      action:"speed", target:"whole_reel", start:0, end:duration, speed:0.92,
      reason:"كثافة القطع مرتفعة جداً وفق الإشارة المحلية؛ تخفيف السرعة قليلاً يحافظ على قابلية المتابعة.",
      evidence:["cuts_per_second"], confidence:0.67
    });
    issues.push({ id:"overpaced", type:"pacing", severity:"medium", evidence:["cuts_per_second"], reason:"إيقاع قطع مرتفع جداً." });
  }
  const editPlan = createEditPlan({
    sourceVersionId: options.versionId || report?.versionId || null,
    sourceExperimentId: options.experimentId || report?.experimentId || null,
    operations,
    summary: operations.length
      ? "تم استخراج تعديلات قابلة للتنفيذ من إشارات مقاسة."
      : preserveSpokenPause
        ? "تم الحفاظ على السكتة المحتملة لأنها قد تكون جزءاً من الـdelivery والـpayoff."
        : "لم تظهر حالياً تعديلات آمنة بثقة كافية للتنفيذ.",
    warnings: operations.some(op => op.action === "cut") ? ["القص المقترح مبني على proxy محلي وليس على retention فعلي من Instagram."] : []
  });
  return {
    version: "1.1.0",
    generatedAt: new Date().toISOString(),
    issues,
    suggestedActions: editPlan.operations,
    editPlan,
    provenance: {
      mode: "evidence-backed",
      retentionSource: "local-proxy",
      instagramRetentionVerified: false
    }
  };
}
export default diagnoseReel;
