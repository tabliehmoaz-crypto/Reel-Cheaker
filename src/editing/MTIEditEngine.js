/*
 * MTI Edit Engine — client bridge to the real FFmpeg renderer.
 */
import { getExecutableOperations } from "./MTIEditPlan.js";
async function readError(response) {
  try { const body = await response.json(); return body?.error || body?.message || "فشل تنفيذ التعديل."; }
  catch { return "فشل تنفيذ التعديل (HTTP " + response.status + ")."; }
}
export async function renderEditPlan(file, plan, options = {}) {
  if (!(file instanceof Blob)) throw new Error("ملف الفيديو غير صالح.");
  const operations = getExecutableOperations(plan);
  if (!operations.length) throw new Error("لا توجد تعديلات قابلة للتنفيذ بثقة كافية.");
  const form = new FormData();
  form.append("video", file, file.name || "reel.mp4");
  form.append("plan", JSON.stringify({ version: plan?.version || "1.0.0", operations }));
  const response = await fetch(options.endpoint || "/api/mti/edit", { method:"POST", body:form });
  if (!response.ok) throw new Error(await readError(response));
  const blob = await response.blob();
  return new File([blob], options.fileName || ((file.name || "reel").replace(/\.[^.]+$/, "") + "_mti_edit.mp4"), { type:blob.type || "video/mp4" });
}
export async function inspectEditPlan(plan) {
  return { executable:getExecutableOperations(plan), count:getExecutableOperations(plan).length, blocked:Array.isArray(plan?.blockedOperations) ? plan.blockedOperations : [] };
}
export default { renderEditPlan, inspectEditPlan };
