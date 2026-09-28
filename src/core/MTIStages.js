/* MTI — Product Intelligence Stages
   Stable names shared by Core, UI and future analytics. */

export const MTI_STAGES = Object.freeze({
  ANALYZE: { id: "analyze", name: "MTI Analyze", labelAr: "حلّل المحتوى" },
  UNDERSTAND: { id: "understand", name: "MTI Understand", labelAr: "افهم لماذا" },
  DIAGNOSE: { id: "diagnose", name: "MTI Diagnose", labelAr: "شخّص المشكلة" },
  IMPROVE: { id: "improve", name: "MTI Improve", labelAr: "حسّن المحتوى" },
  PREDICT: { id: "predict", name: "MTI Predict", labelAr: "توقّع قبل النشر" },
  PUBLISH: { id: "publish", name: "MTI Publish", labelAr: "جهّز للنشر" },
  LEARN: { id: "learn", name: "MTI Learn", labelAr: "تعلّم من النتيجة" },
  BRAIN: { id: "brain", name: "MTI Brain", labelAr: "ابنِ فكرة جديدة" }
});

export const MTI_STAGE_ORDER = Object.freeze([
  "analyze", "understand", "diagnose", "improve", "predict", "publish", "learn", "brain"
]);

export function getMTIStage(id) {
  return Object.values(MTI_STAGES).find(stage => stage.id === id) || null;
}

export default MTI_STAGES;
