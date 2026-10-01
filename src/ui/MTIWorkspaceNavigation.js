/*
 * MTI — Professional Workspace Navigation
 * Presentation-only: navigation never owns analysis logic.
 */

const STAGES = [
  ["analyze", "Analyze", "حلّل", "dashboardReportContainer"],
  ["understand", "Understand", "افهم", "aiInsightCore"],
  ["diagnose", "Diagnose", "شخّص", "dropOffList"],
  ["improve", "Improve", "حسّن", "mtiImprovePanel"],
  ["predict", "Predict", "توقّع", "valOverallScore"],
  ["publish", "Publish", "انشر", "uploadNewVersionBtn"],
  ["learn", "Learn", "تعلّم", "versionCompareContainer"],
  ["brain", "Brain", "فكّر", "dashboardReportContainer"]
];

function ensureStyles() {
  if (document.getElementById("mtiWorkspaceNavStyles")) return;
  const style = document.createElement("style");
  style.id = "mtiWorkspaceNavStyles";
  style.textContent = `
    .mti-workspace-nav {
      position: sticky;
      top: 80px;
      z-index: 25;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px;
      margin: -2px 0 2px;
      background: rgba(10,25,47,.88);
      border: 1px solid rgba(30,45,74,.9);
      border-radius: 16px;
      backdrop-filter: blur(16px);
      scrollbar-width: none;
    }
    .mti-workspace-nav::-webkit-scrollbar { display:none; }
    .mti-stage-link {
      flex: 0 0 auto;
      border: 1px solid transparent;
      color: #8d99a8;
      background: transparent;
      border-radius: 11px;
      padding: 8px 11px;
      font: 600 11px Inter,Tajawal,sans-serif;
      transition: .18s ease;
      cursor: pointer;
    }
    .mti-stage-link:hover {
      color: #F5F5F0;
      background: rgba(17,34,64,.8);
      border-color: #1E2D4A;
    }
    .mti-stage-link.is-active {
      color: #0A192F;
      background: #C5A059;
      border-color: #C5A059;
      box-shadow: 0 6px 22px rgba(197,160,89,.12);
    }
    .mti-stage-link .ar { display:block; opacity:.68; font-size:9px; margin-top:2px; }
    @media (max-width: 640px) {
      .mti-workspace-nav { top: 72px; border-radius: 13px; }
      .mti-stage-link { padding: 7px 9px; font-size:10px; }
    }
  `;
  document.head.appendChild(style);
}

function targetFor(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const visible = !el.closest(".hidden") && getComputedStyle(el).display !== "none";
  return visible ? el : null;
}

function scrollToStage(stageId) {
  const stage = STAGES.find(s => s[0] === stageId);
  if (!stage) return;
  const el = targetFor(stage[3]) || document.getElementById("dashboardReportContainer");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function installNav() {
  ensureStyles();
  if (document.getElementById("mtiWorkspaceNav")) return;

  const report = document.getElementById("dashboardReportContainer");
  if (!report) return;

  const nav = document.createElement("nav");
  nav.id = "mtiWorkspaceNav";
  nav.className = "mti-workspace-nav";
  nav.setAttribute("aria-label", "MTI workflow");

  for (const [id, en, ar] of STAGES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mti-stage-link";
    button.dataset.stage = id;
    button.innerHTML = `${en}<span class="ar">${ar}</span>`;
    button.addEventListener("click", () => scrollToStage(id));
    nav.appendChild(button);
  }

  report.parentElement?.insertBefore(nav, report);
}

function updateActiveStage() {
  const nav = document.getElementById("mtiWorkspaceNav");
  if (!nav) return;
  const visibleReport = !document.getElementById("dashboardReportContainer")?.classList.contains("hidden");
  if (!visibleReport) return;

  const candidates = STAGES
    .map(([id,, , target]) => ({ id, el: targetFor(target) }))
    .filter(x => x.el);

  let active = "analyze";
  let best = Infinity;
  for (const item of candidates) {
    const rect = item.el.getBoundingClientRect();
    const distance = Math.abs(rect.top - 150);
    if (rect.top <= window.innerHeight * .65 && distance < best) {
      best = distance;
      active = item.id;
    }
  }

  nav.querySelectorAll(".mti-stage-link").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.stage === active);
  });
}

function installSidebarRouting() {
  const buttons = [...document.querySelectorAll("aside button")];
  for (const button of buttons) {
    if (button.dataset.mtiNavBound) continue;
    button.dataset.mtiNavBound = "true";
    const title = (button.getAttribute("title") || "").toLowerCase();

    button.addEventListener("click", () => {
      if (title.includes("dashboard")) {
        (document.getElementById("dashboardReportContainer") || document.getElementById("emptyHeroState"))
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (title.includes("history")) {
        document.getElementById("myReelsSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (title.includes("knowledge")) {
        document.getElementById("limitationsList")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (title.includes("settings")) {
        document.getElementById("authWrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}

export function initMTIWorkspaceNavigation() {
  installNav();
  installSidebarRouting();
  window.addEventListener("scroll", updateActiveStage, { passive: true });
  const observer = new MutationObserver(() => {
    installNav();
    installSidebarRouting();
    updateActiveStage();
  });
  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
  updateActiveStage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMTIWorkspaceNavigation, { once: true });
} else {
  initMTIWorkspaceNavigation();
}
