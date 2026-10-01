import { mtiBrainReasoner } from "../brain/MTIBrainReasoner.js";
import { analyzeInsightImage, savePostPublishInsights, getPostPublishStatus } from "../insights/MTIPostPublishInsights.js";
import { getReelRoomContext } from "../core/MTIContentService.js";

const STAGES = [
  ["Analyze","تحليل","dashboardReportContainer"],
  ["Understand","فهم","aiInsightCore"],
  ["Diagnose","تشخيص","dropOffList"],
  ["Improve","تحسين","mtiImprovePanel"],
  ["Predict","توقع","valOverallScore"],
  ["Publish","نشر","mtiPublishInsightsPanel"],
  ["Learn","تعلّم","versionCompareContainer"],
  ["Brain","Brain","mtiBrainPanel"]
];

const css = [
":root{--mti-navy:#0A192F;--mti-elevated:#0D1E38;--mti-border:#1E2D4A;--mti-gold:#C5A059;--mti-cream:#FAF5F0}",
".mti-stage-rail{position:sticky;top:80px;z-index:25;display:flex;gap:5px;overflow:auto;padding:8px 12px;background:rgba(10,25,47,.9);backdrop-filter:blur(16px);border-bottom:1px solid var(--mti-border);scrollbar-width:none}",
".mti-stage-rail::-webkit-scrollbar{display:none}.mti-stage{flex:0 0 auto;border:1px solid transparent;background:transparent;color:#718096;border-radius:10px;padding:7px 10px;font:600 10px Inter,Tajawal,sans-serif;cursor:pointer;transition:.2s}.mti-stage:hover,.mti-stage.active{color:var(--mti-gold);background:rgba(197,160,89,.08);border-color:rgba(197,160,89,.35)}.mti-stage small{display:block;font-size:8px;opacity:.65;margin-top:2px}",
".mti-command{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:11px 14px;border:1px solid var(--mti-border);border-radius:14px;background:#0D1E38;box-shadow:0 12px 35px rgba(0,0,0,.16)}.mti-command-title{color:#fff;font:700 13px Syne,Inter,sans-serif}.mti-command-sub{color:#718096;font-size:9px;margin-top:3px}.mti-mini-btn{border:1px solid var(--mti-border);background:#0A192F;color:#c8d0dc;border-radius:9px;padding:8px 10px;font-size:9px;cursor:pointer}.mti-mini-btn:hover{color:var(--mti-gold);border-color:rgba(197,160,89,.5)}",
".mti-panel{background:#0D1E38;border:1px solid var(--mti-border);border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.2)}.mti-panel-head{padding:16px 18px;border-bottom:1px solid var(--mti-border);display:flex;justify-content:space-between;gap:12px;align-items:center}.mti-kicker{color:var(--mti-gold);font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.mti-panel-title{color:#fff;font:700 16px Syne,Inter,sans-serif;margin-top:3px}.mti-panel-sub{color:#718096;font-size:10px;margin-top:4px;line-height:1.6}",
".mti-brain-body{padding:15px}.mti-chat-log{max-height:360px;overflow:auto;display:flex;flex-direction:column;gap:8px}.mti-msg{max-width:92%;padding:10px 12px;border-radius:13px;white-space:pre-wrap;line-height:1.65;font-size:11px}.mti-msg.user{align-self:flex-start;background:rgba(197,160,89,.12);color:#f6ead4;border:1px solid rgba(197,160,89,.22)}.mti-msg.assistant{align-self:flex-end;background:#112240;color:#d9e0ea;border:1px solid var(--mti-border)}.mti-chat-form{display:flex;gap:7px;margin-top:10px}.mti-chat-input{flex:1;min-width:0;border:1px solid var(--mti-border);background:#09172b;color:#fff;border-radius:11px;padding:10px;font-size:11px;outline:none}.mti-gold-btn{border:0;background:var(--mti-gold);color:var(--mti-navy);border-radius:10px;padding:10px 13px;font-size:9px;font-weight:800;cursor:pointer}",
".mti-upload{margin:14px 16px;padding:14px;border:1px dashed rgba(197,160,89,.4);border-radius:15px}.mti-upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mti-preview{min-height:170px;background:#081529;border:1px solid var(--mti-border);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden}.mti-preview img{width:100%;max-height:320px;object-fit:contain}.mti-metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px}.mti-metric{background:#09172b;border:1px solid var(--mti-border);border-radius:10px;padding:8px}.mti-metric label{display:block;color:#718096;font-size:8px;margin-bottom:3px}.mti-metric input{width:100%;border:0;background:transparent;color:#fff;outline:0;font-size:10px}.mti-status{color:#8793a5;font-size:9px;line-height:1.6;white-space:pre-wrap;margin-top:8px}.mti-learning{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:0 16px 15px}.mti-learning div{background:#09172b;border:1px solid var(--mti-border);border-radius:10px;padding:9px}.mti-learning span{display:block;color:#718096;font-size:8px}.mti-learning strong{display:block;color:#fff;font:700 15px Syne,Inter,sans-serif;margin-top:3px}",
"@media(max-width:760px){.mti-stage-rail{top:0}.mti-command{align-items:flex-start;flex-direction:column}.mti-upload-grid,.mti-learning{grid-template-columns:1fr}.mti-chat-log{max-height:300px}}"
].join("\\n");

function getActiveReelId(){
  return typeof window.__mtiGetActiveReelId === "function" ? window.__mtiGetActiveReelId() : window.__mtiActiveReelId || null;
}
function esc(v){return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

function addStyles(){
  if(document.getElementById("mti-product-styles")) return;
  const s=document.createElement("style"); s.id="mti-product-styles"; s.textContent=css; document.head.appendChild(s);
}

function addStageRail(){
  if(document.getElementById("mtiStageRail")) return;
  const header=document.querySelector("header"); if(!header)return;
  const nav=document.createElement("nav"); nav.id="mtiStageRail"; nav.className="mti-stage-rail";
  nav.innerHTML=STAGES.map((x,i)=>'<button class="mti-stage '+(i===0?"active":"")+'" data-target="'+x[2]+'"><span>'+esc(x[0])+'</span><small>'+esc(x[1])+'</small></button>').join("");
  header.insertAdjacentElement("afterend",nav);
  nav.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.target)?.scrollIntoView({behavior:"smooth",block:"start"})));
  const io=new IntersectionObserver(entries=>{
    const e=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if(!e)return;
    const b=nav.querySelector('[data-target="'+e.target.id+'"]'); if(!b)return;
    nav.querySelectorAll(".mti-stage").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  },{rootMargin:"-20% 0px -65% 0px"});
  STAGES.forEach(x=>{const n=document.getElementById(x[2]);if(n)io.observe(n);});
}

function addCommandBar(){
  if(document.getElementById("mtiCommandBar"))return;
  const main=document.querySelector("main");if(!main)return;
  const bar=document.createElement("section");bar.id="mtiCommandBar";bar.className="mti-command";
  bar.innerHTML='<div><div class="mti-command-title">MTI Intelligence Workspace</div><div class="mti-command-sub">Analyze → Understand → Diagnose → Improve → Predict → Publish → Learn → Brain</div></div><div><button class="mti-mini-btn" data-jump="mtiPublishInsightsPanel">Post-publish Insights</button> <button class="mti-mini-btn" data-jump="mtiBrainPanel">Ask MTI Brain</button></div>';
  main.prepend(bar);
  bar.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.jump)?.scrollIntoView({behavior:"smooth"})));
}

function appendMessage(role,text){
  const log=document.getElementById("mtiBrainChatLog");if(!log)return;
  const item=document.createElement("div");item.className="mti-msg "+role;item.textContent=text;log.appendChild(item);log.scrollTop=log.scrollHeight;
}
async function hydrateBrain(){
  const id=getActiveReelId(),log=document.getElementById("mtiBrainChatLog");if(!id||!log)return;
  try{const room=getReelRoomContext(id);log.innerHTML="";(room?.messages||[]).slice(-10).forEach(m=>appendMessage(m.role==="user"?"user":"assistant",m.content));}catch{}
}

function addBrain(){
  if(document.getElementById("mtiBrainPanel"))return;
  const anchor=document.getElementById("dashboardReportContainer")||document.querySelector("main");if(!anchor)return;
  const p=document.createElement("section");p.id="mtiBrainPanel";p.className="mti-panel";
  p.innerHTML='<div class="mti-panel-head"><div><div class="mti-kicker">MTI BRAIN</div><div class="mti-panel-title">اسأل MTI عن هالريل</div><div class="mti-panel-sub">الجواب مربوط بالتحليل والنسخة والذاكرة والمعرفة والتعلّم.</div></div><span class="mti-kicker">REEL-AWARE</span></div><div class="mti-brain-body"><div id="mtiBrainChatLog" class="mti-chat-log"></div><form id="mtiBrainForm" class="mti-chat-form"><input id="mtiBrainInput" class="mti-chat-input" placeholder="ليش؟ شو بغير؟ شو صار بالصوت؟"><button class="mti-gold-btn">Ask</button></form><div id="mtiBrainStatus" class="mti-status"></div></div>';
  anchor.insertAdjacentElement("afterend",p);
  p.querySelector("#mtiBrainForm").addEventListener("submit",async e=>{
    e.preventDefault();const input=p.querySelector("#mtiBrainInput"),q=input.value.trim(),id=getActiveReelId(),status=p.querySelector("#mtiBrainStatus");if(!id){status.textContent="حلّل ريل أولاً.";return}if(!q)return;
    appendMessage("user",q);input.value="";status.textContent="MTI عم يقرأ سياق الريل…";
    try{const r=await mtiBrainReasoner.ask({reelId:id,question:q});appendMessage("assistant",r.answer);status.textContent="تمت الإجابة من الأدلة المحلية المتاحة.";}catch(err){status.textContent=err?.message||"تعذرت قراءة السياق.";}
  });
}

const METRICS=[["views","Views"],["reach","Reach"],["likes","Likes"],["comments","Comments"],["shares","Shares"],["saves","Saves"],["averageWatchTime","Avg watch time"],["completionRate","Completion %"],["skipRate","Skip %"],["followersGained","Followers gained"]];

function addPublishPanel(){
  if(document.getElementById("mtiPublishInsightsPanel"))return;
  const anchor=document.getElementById("dashboardReportContainer")||document.querySelector("main");if(!anchor)return;
  const p=document.createElement("section");p.id="mtiPublishInsightsPanel";p.className="mti-panel";
  p.innerHTML='<div class="mti-panel-head"><div><div class="mti-kicker">PUBLISH → LEARN</div><div class="mti-panel-title">اقرأ الـInsights بعد النشر</div><div class="mti-panel-sub">ارفع Screenshot من Instagram. MTI يحاول قراءتها، ثم يربط الواقع بالتوقع السابق.</div></div><label class="mti-gold-btn">Upload Insights<input id="mtiInsightFile" type="file" accept="image/*" hidden></label></div><div class="mti-upload"><div class="mti-upload-grid"><div id="mtiPreview" class="mti-preview"><span style="color:#718096;font-size:9px">Screenshot preview</span></div><div><div id="mtiMetrics" class="mti-metrics"></div><button id="mtiSaveInsights" class="mti-gold-btn" style="margin-top:9px;width:100%">Save & Compare</button><div id="mtiInsightStatus" class="mti-status"></div></div></div></div><div id="mtiLearning" class="mti-learning"></div>';
  anchor.insertAdjacentElement("afterend",p);
  p.querySelector("#mtiMetrics").innerHTML=METRICS.map(x=>'<div class="mti-metric"><label>'+x[1]+'</label><input data-metric="'+x[0]+'" placeholder="—"></div>').join("");
  p.querySelector("#mtiInsightFile").addEventListener("change",handleInsight);
  p.querySelector("#mtiSaveInsights").addEventListener("click",saveInsights);
}

async function handleInsight(e){
  const file=e.target.files?.[0];if(!file)return;const status=document.getElementById("mtiInsightStatus"),preview=document.getElementById("mtiPreview");status.textContent="عم نقرأ الصورة…";preview.innerHTML="";
  const img=document.createElement("img");img.src=URL.createObjectURL(file);preview.appendChild(img);
  try{const r=await analyzeInsightImage(file);Object.entries(r.metrics||{}).forEach(([k,v])=>{const input=document.querySelector('[data-metric="'+k+'"]');if(input&&v!=null)input.value=v;});status.textContent=r.ocr.status==="complete"?"تمت قراءة الصورة عبر OCR. راجع الأرقام قبل الحفظ؛ OCR قد يخطئ.":"الصورة انقرت، لكن OCR غير متاح حالياً. فيك تدخل الأرقام يدوياً.";}catch(err){status.textContent=err?.message||"تعذرت قراءة الصورة.";}
}

async function saveInsights(){
  const id=getActiveReelId(),status=document.getElementById("mtiInsightStatus");if(!id){status.textContent="حلّل ريل أولاً.";return}
  const metrics={};document.querySelectorAll("[data-metric]").forEach(i=>{if(i.value.trim())metrics[i.dataset.metric]=i.value.trim();});if(!Object.keys(metrics).length){status.textContent="حط رقم واحد على الأقل.";return}
  status.textContent="عم نحفظ الواقع ونقارن التوقع…";
  try{const r=await savePostPublishInsights(id,metrics,{type:"screenshot-or-manual"});status.textContent="تم الحفظ. Performance Score: "+(r.performanceScore??"—")+"\\nPrediction error: "+(r.comparison?.overallError??"—")+"\\nهالبيانات تدخل بالتعلم كعينة جديدة، مو كقاعدة من ريل واحد.";renderLearning(r);}catch(err){status.textContent=err?.message||"فشل الحفظ.";}
}
function renderLearning(r){
  const id=getActiveReelId(),box=document.getElementById("mtiLearning");if(!id||!box)return;const s=r||getPostPublishStatus(id),a=s.actualPerformance||s.metrics||{},c=s.comparison||{};
  box.innerHTML='<div><span>Performance</span><strong>'+(a.performanceScore??"—")+'</strong></div><div><span>Prediction error</span><strong>'+(c.overallError??"—")+'</strong></div><div><span>Learning</span><strong>'+(Object.keys(a).length?"Saved":"Waiting")+'</strong></div>';
}

export function initMTIProductExperience(){
  if(window.__mtiProductExperienceReady)return;window.__mtiProductExperienceReady=true;
  addStyles();addStageRail();addCommandBar();addPublishPanel();addBrain();
  const refresh=()=>setTimeout(()=>{hydrateBrain();renderLearning();},100);
  document.addEventListener("mti:analysis-complete",refresh);
  document.addEventListener("mti:reel-opened",refresh);
  window.addEventListener("mti:reel-changed",refresh);
  refresh();
}
export default initMTIProductExperience;