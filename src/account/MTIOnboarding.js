/*
  MTI — Professional Account Onboarding
  -------------------------------------
  Lightweight first-run setup for creator context.

  The onboarding collects only information that materially improves
  account-aware analysis. It does not claim that user estimates are
  verified performance data.
*/

import {
  getAccountProfile,
  hasCompletedAccountProfile,
  saveAccountProfile,
  addContentAccount,
  getContentTypes
} from "./MTIAccountProfileService.js";

const LANGUAGE_KEY = "mti_language";
const MAX_CONTENT_TYPES = 3;

const COPY = {
  ar: {
    setup: "لنبدأ بفهم حسابك",
    setupBody: "بضع معلومات بسيطة تساعد MTI على تقديم تحليل أقرب إلى واقع حسابك.",
    privacy: "معلوماتك مرتبطة بحسابك وتُستخدم لتخصيص التحليل والتعلّم داخل MTI.",
    followers: "عدد المتابعين",
    followersHint: "أدخل العدد الحالي تقريباً.",
    views: "متوسط مشاهدات الريلز",
    viewsHint: "رقم تقريبي يكفي. سيُحدّث MTI هذا الخط الأساسي مع ظهور نتائج فعلية.",
    types: "نوع المحتوى",
    typesHint: "اختر حتى 3 أنواع تمثل محتواك بشكل أفضل.",
    account: "حساب المحتوى",
    accountHint: "يمكنك إضافة حساب آخر لاحقاً، ولكل حساب سياقه وتعلّمه الخاص.",
    handle: "اسم الحساب أو المعرّف",
    label: "اسم مختصر للحساب",
    addAnother: "إضافة حساب آخر",
    skip: "لاحقاً",
    continue: "متابعة",
    finish: "بدء استخدام MTI",
    back: "رجوع",
    optional: "اختياري",
    required: "يرجى إدخال قيمة صحيحة.",
    saved: "تم حفظ الإعدادات.",
    language: "اللغة",
    typesMap: {
      comedy: "ترفيهي / كوميدي",
      education: "تعليمي",
      tips: "نصائح / معلومات",
      fashion: "أزياء",
      advertising: "إعلانات / تجاري",
      lifestyle: "حياة يومية",
      "talking-head": "حديث مباشر / رأي",
      storytelling: "قصص / سرد",
      fitness: "لياقة",
      food: "طعام",
      travel: "سفر",
      creative: "إبداعي",
      psychology: "تطوير ذات / نفسي",
      commentary: "تعليق / رأي",
      other: "أخرى"
    }
  },
  en: {
    setup: "Let’s understand your account",
    setupBody: "A few simple details help MTI make its analysis more relevant to your actual account.",
    privacy: "Your information stays within your account context and is used to personalize analysis and learning in MTI.",
    followers: "Follower count",
    followersHint: "Enter your current count.",
    views: "Typical Reel views",
    viewsHint: "An estimate is enough. MTI will refine this baseline as real results become available.",
    types: "Content type",
    typesHint: "Choose up to 3 types that best describe your content.",
    account: "Content account",
    accountHint: "You can add another account later. Each account keeps its own context and learning.",
    handle: "Account handle",
    label: "Account name",
    addAnother: "Add another account",
    skip: "Later",
    continue: "Continue",
    finish: "Start using MTI",
    back: "Back",
    optional: "Optional",
    required: "Please enter valid values.",
    saved: "Settings saved.",
    language: "Language",
    typesMap: {
      comedy: "Comedy / Entertainment",
      education: "Education",
      tips: "Tips / Information",
      fashion: "Fashion",
      advertising: "Advertising / Commercial",
      lifestyle: "Lifestyle",
      "talking-head": "Talking head / Opinion",
      storytelling: "Storytelling",
      fitness: "Fitness",
      food: "Food",
      travel: "Travel",
      creative: "Creative",
      psychology: "Self-development / Psychology",
      commentary: "Commentary / Opinion",
      other: "Other"
    }
  }
};

function language() {
  return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "ar";
}

function setLanguage(value) {
  localStorage.setItem(LANGUAGE_KEY, value);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function inputNumber(id) {
  const raw = document.getElementById(id)?.value?.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function mount() {
  if (document.getElementById("mtiOnboarding")) return;
  if (hasCompletedAccountProfile()) return;

  const root = document.createElement("div");
  root.id = "mtiOnboarding";
  root.className = "fixed inset-0 z-[100] bg-brand-navy/95 backdrop-blur-md flex items-center justify-center p-4";
  root.innerHTML = renderStep(1);
  document.body.appendChild(root);
  bind();
}

function renderStep(step, state = {}) {
  const lang = language();
  const t = COPY[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const progress = step === 1 ? "1 / 3" : step === 2 ? "2 / 3" : "3 / 3";

  const languageControl = `
    <div class="flex items-center justify-between mb-7">
      <span class="text-[10px] uppercase tracking-[0.22em] text-gray-500">MTI</span>
      <div class="flex items-center gap-1 p-1 rounded-lg border border-brand-navyBorder bg-brand-navy">
        <button type="button" data-lang="ar" class="px-2 py-1 text-[10px] rounded ${lang === "ar" ? "bg-brand-navySurface text-brand-gold" : "text-gray-500"}">العربية</button>
        <button type="button" data-lang="en" class="px-2 py-1 text-[10px] rounded ${lang === "en" ? "bg-brand-navySurface text-brand-gold" : "text-gray-500"}">English</button>
      </div>
    </div>`;

  if (step === 1) {
    return `
      <div class="w-full max-w-lg bg-brand-navyElevated border border-brand-navyBorder rounded-3xl shadow-2xl p-6 sm:p-8" dir="${dir}">
        ${languageControl}
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] tracking-[0.18em] uppercase text-brand-gold">ACCOUNT SETUP</span>
          <span class="text-[10px] text-gray-500">${progress}</span>
        </div>
        <h2 class="font-syne font-bold text-2xl text-white">${t.setup}</h2>
        <p class="text-sm text-gray-400 leading-relaxed mt-2">${t.setupBody}</p>
        <div class="mt-6 space-y-4">
          <label class="block">
            <span class="block text-sm text-gray-200 mb-1.5">${t.followers}</span>
            <input id="mtiFollowers" type="number" min="0" inputmode="numeric" class="w-full bg-brand-navy border border-brand-navyBorder rounded-xl px-4 py-3 text-white outline-none focus:border-brand-gold" placeholder="2,000">
            <span class="block text-[11px] text-gray-500 mt-1.5">${t.followersHint}</span>
          </label>
          <label class="block">
            <span class="block text-sm text-gray-200 mb-1.5">${t.views}</span>
            <input id="mtiViews" type="number" min="0" inputmode="numeric" class="w-full bg-brand-navy border border-brand-navyBorder rounded-xl px-4 py-3 text-white outline-none focus:border-brand-gold" placeholder="3,000">
            <span class="block text-[11px] text-gray-500 mt-1.5">${t.viewsHint}</span>
          </label>
        </div>
        <div class="mt-6 p-3.5 rounded-xl border border-brand-navyBorder bg-brand-navy/60">
          <p class="text-[11px] leading-relaxed text-gray-400">${t.privacy}</p>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="button" id="mtiOnboardingNext" class="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-navy font-semibold text-sm">${t.continue}</button>
        </div>
      </div>`;
  }

  if (step === 2) {
    const types = getContentTypes().map(type => `
      <button type="button" data-content-type="${esc(type)}" class="mti-type px-3 py-2 rounded-xl border ${selectedTypes.includes(type) ? "border-brand-gold text-brand-gold" : "border-brand-navyBorder text-gray-300"} text-xs hover:border-brand-gold/60 transition">
        ${esc(t.typesMap[type] || type)}
      </button>`).join("");

    return `
      <div class="w-full max-w-2xl bg-brand-navyElevated border border-brand-navyBorder rounded-3xl shadow-2xl p-6 sm:p-8" dir="${dir}">
        ${languageControl}
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] tracking-[0.18em] uppercase text-brand-gold">CONTENT CONTEXT</span>
          <span class="text-[10px] text-gray-500">${progress}</span>
        </div>
        <h2 class="font-syne font-bold text-2xl text-white">${t.types}</h2>
        <p class="text-sm text-gray-400 leading-relaxed mt-2">${t.typesHint}</p>
        <div id="mtiTypes" class="flex flex-wrap gap-2 mt-6">${types}</div>
        <div class="mt-6 p-3.5 rounded-xl border border-brand-navyBorder bg-brand-navy/60">
          <p class="text-[11px] leading-relaxed text-gray-400">${t.typesHint} ${t.privacy}</p>
        </div>
        <div class="mt-6 flex justify-between">
          <button type="button" id="mtiOnboardingBack" class="px-4 py-2.5 rounded-xl border border-brand-navyBorder text-gray-300 text-sm">${t.back}</button>
          <button type="button" id="mtiOnboardingNext" class="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-navy font-semibold text-sm">${t.continue}</button>
        </div>
      </div>`;
  }

  const profile = getAccountProfile();
  const account = profile.contentAccounts?.[0] || {};
  return `
    <div class="w-full max-w-2xl bg-brand-navyElevated border border-brand-navyBorder rounded-3xl shadow-2xl p-6 sm:p-8" dir="${dir}">
      ${languageControl}
      <div class="flex items-center justify-between mb-3">
        <span class="text-[10px] tracking-[0.18em] uppercase text-brand-gold">CONTENT ACCOUNT</span>
        <span class="text-[10px] text-gray-500">${progress}</span>
      </div>
      <h2 class="font-syne font-bold text-2xl text-white">${t.account}</h2>
      <p class="text-sm text-gray-400 leading-relaxed mt-2">${t.accountHint}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        <input id="mtiAccountLabel" class="bg-brand-navy border border-brand-navyBorder rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-gold" placeholder="${esc(t.label)}">
        <input id="mtiAccountHandle" class="bg-brand-navy border border-brand-navyBorder rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand-gold" placeholder="${esc(t.handle)}">
      </div>
      <div class="mt-5 p-3.5 rounded-xl border border-brand-navyBorder bg-brand-navy/60">
        <p class="text-[11px] leading-relaxed text-gray-400">${t.accountHint}</p>
      </div>
      <div class="mt-6 flex justify-between gap-3">
        <button type="button" id="mtiOnboardingBack" class="px-4 py-2.5 rounded-xl border border-brand-navyBorder text-gray-300 text-sm">${t.back}</button>
        <div class="flex gap-2">
          <button type="button" id="mtiOnboardingSkipAccount" class="px-4 py-2.5 rounded-xl border border-brand-navyBorder text-gray-400 text-sm">${t.skip}</button>
          <button type="button" id="mtiOnboardingAddAccount" class="px-4 py-2.5 rounded-xl border border-brand-navyBorder text-gray-300 text-sm">${t.addAnother}</button>
                    <button type="button" id="mtiOnboardingFinish" class="px-5 py-2.5 rounded-xl bg-brand-gold text-brand-navy font-semibold text-sm">${t.finish}</button>
        </div>
      </div>
    </div>`;
}

let step = 1;
let selectedTypes = [];

function restoreOnboardingState() {
  const profile = getAccountProfile();
  selectedTypes = Array.isArray(profile.declaredContentTypes)
    ? [...profile.declaredContentTypes].slice(0, MAX_CONTENT_TYPES)
    : [];
}

function bind() {
  const root = document.getElementById("mtiOnboarding");
  if (!root) return;

  root.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
      root.innerHTML = renderStep(step);
      bind();
    });
  });

  root.querySelectorAll(".mti-type").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.contentType;
      if (selectedTypes.includes(type)) {
        selectedTypes = selectedTypes.filter(item => item !== type);
      } else if (selectedTypes.length < MAX_CONTENT_TYPES) {
        selectedTypes = [...selectedTypes, type];
      }
      root.querySelectorAll(".mti-type").forEach(item => {
        const active = selectedTypes.includes(item.dataset.contentType);
        item.classList.toggle("border-brand-gold", active);
        item.classList.toggle("text-brand-gold", active);
      });
    });
  });

  root.querySelector("#mtiOnboardingNext")?.addEventListener("click", () => {
    if (step === 1) {
      const followers = inputNumber("mtiFollowers");
      const views = inputNumber("mtiViews");
      if (followers === null || views === null) {
        alert(COPY[language()].required);
        return;
      }
      saveAccountProfile({ followers, typicalViews: views });
      step = 2;
      root.innerHTML = renderStep(step);
      bind();
      return;
    }

    if (step === 2) {
      if (!selectedTypes.length) {
        alert(COPY[language()].required);
        return;
      }
      saveAccountProfile({ declaredContentTypes: selectedTypes });
      step = 3;
      root.innerHTML = renderStep(step);
      bind();
    }
  });

  root.querySelector("#mtiOnboardingBack")?.addEventListener("click", () => {
    step = Math.max(1, step - 1);
    root.innerHTML = renderStep(step);
    bind();
  });

  root.querySelector("#mtiOnboardingSkipAccount")?.addEventListener("click", () => finish());
  root.querySelector("#mtiOnboardingFinish")?.addEventListener("click", () => finish());

  root.querySelector("#mtiOnboardingAddAccount")?.addEventListener("click", () => {
    addAnotherAccount();
  });
}

function finish() {
  const root = document.getElementById("mtiOnboarding");
  const profile = getAccountProfile();

  const accounts = Array.isArray(profile.contentAccounts) ? profile.contentAccounts : [];
  if (!accounts.some(item => item.isPrimary === true)) {
    const primary = {
      id: `content_${Date.now()}`,
      label: document.getElementById("mtiAccountLabel")?.value?.trim() || "Primary Instagram",
      handle: document.getElementById("mtiAccountHandle")?.value?.trim() || null,
      followers: profile.followers,
      typicalViews: profile.typicalViews,
      declaredContentTypes: profile.declaredContentTypes,
      baselineSource: "user_estimate",
      isPrimary: true
    };
    saveAccountProfile({
      contentAccounts: [primary, ...accounts],
      activeContentAccountId: primary.id
    });
  }

  root?.remove();
  window.dispatchEvent(new CustomEvent("mti-onboarding-complete"));
}

function addAnotherAccount() {
  const profile = getAccountProfile();
  const t = COPY[language()];
  const label = window.prompt(t.label);
  if (!label) return;
  const handle = window.prompt(t.handle) || null;
  addContentAccount({
    label,
    handle,
    followers: null,
    typicalViews: null,
    declaredContentTypes: []
  });
}

export function initMTIOnboarding() {
  if (hasCompletedAccountProfile()) return;
  if (!document.body) {
    window.addEventListener("DOMContentLoaded", initMTIOnboarding, { once: true });
    return;
  }
  mount();
}
export default initMTIOnboarding;
