/*
  MTI — Account Profile Service
  -----------------------------
  Canonical private context for a creator/content account.

  The Google/Firebase identity identifies the MTI user.
  A content account identifies one publishing context owned by that user.

  Example:
    Creator → Personal Instagram
            → Cove Instagram

  Profile data is intentionally small:
  - follower baseline
  - estimated typical Reel views
  - declared content types
  - account label / handle
  - optional platform metadata

  User-entered estimates are baselines, not facts. Verified performance
  learned later by MTI must remain separate from these declarations.
*/

import { memoryService } from "../core/MTIMemoryService.js";

export const ACCOUNT_PROFILE_SCHEMA_VERSION = "1.0.0";

const STORAGE_PREFIX = "mti_account_profiles_v1";

const CONTENT_TYPES = Object.freeze([
  "comedy",
  "education",
  "tips",
  "fashion",
  "advertising",
  "lifestyle",
  "talking-head",
  "storytelling",
  "fitness",
  "food",
  "travel",
  "creative",
  "psychology",
  "commentary",
  "other"
]);

function now() {
  return new Date().toISOString();
}

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function accountId() {
  memoryService.ensureInitialized();
  return memoryService.getActiveAccountId();
}

function storageKey() {
  const id = String(accountId() || "local")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
  return `${STORAGE_PREFIX}_${id || "local"}`;
}

function emptyProfile() {
  return {
    schemaVersion: ACCOUNT_PROFILE_SCHEMA_VERSION,
    profileVersion: 1,
    accountId: accountId(),
    platform: "instagram",
    label: null,
    handle: null,
    followers: null,
    typicalViews: null,
    declaredContentTypes: [],
    baselineSource: "user_estimate",
    createdAt: now(),
    updatedAt: now()
  };
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function normalizeContentTypes(types) {
  if (!Array.isArray(types)) return [];
  return [...new Set(
    types
      .map(type => String(type || "").trim())
      .filter(type => CONTENT_TYPES.includes(type))
  )].slice(0, 3);
}

function normalizeProfile(profile = {}) {
  const base = emptyProfile();
  return {
    ...base,
    ...clone(profile),
    schemaVersion: ACCOUNT_PROFILE_SCHEMA_VERSION,
    accountId: accountId(),
    platform: "instagram",
    followers: normalizeNumber(profile.followers),
    typicalViews: normalizeNumber(profile.typicalViews),
    declaredContentTypes: normalizeContentTypes(profile.declaredContentTypes),
    baselineSource: "user_estimate",
    updatedAt: now()
  };
}

function read() {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.accountId !== accountId()) return null;
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}

function write(profile) {
  localStorage.setItem(storageKey(), JSON.stringify(normalizeProfile(profile)));
}

export function getAccountProfile() {
  return read() || emptyProfile();
}

export function hasCompletedAccountProfile() {
  const profile = read();
  return Boolean(
    profile &&
    profile.followers !== null &&
    profile.typicalViews !== null &&
    profile.declaredContentTypes.length > 0
  );
}

export function saveAccountProfile(data = {}) {
  const current = read() || emptyProfile();
  const next = normalizeProfile({
    ...current,
    ...clone(data)
  });
  write(next);
  return clone(next);
}

export function updateAccountProfile(patch = {}) {
  return saveAccountProfile(patch);
}

export function addContentAccount(data = {}) {
  const current = getAccountProfile();
  const accounts = Array.isArray(current.contentAccounts)
    ? current.contentAccounts
    : [];

  const contentAccount = {
    id: data.id || `content_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    platform: "instagram",
    label: data.label || data.handle || "Instagram account",
    handle: data.handle || null,
    followers: normalizeNumber(data.followers),
    typicalViews: normalizeNumber(data.typicalViews),
    declaredContentTypes: normalizeContentTypes(data.declaredContentTypes),
    baselineSource: "user_estimate",
    createdAt: data.createdAt || now(),
    updatedAt: now()
  };

  const next = saveAccountProfile({
    contentAccounts: [...accounts, contentAccount],
    activeContentAccountId: current.activeContentAccountId || contentAccount.id
  });

  return next.contentAccounts.find(item => item.id === contentAccount.id) || contentAccount;
}

export function setActiveContentAccount(contentAccountId) {
  const current = getAccountProfile();
  const accounts = Array.isArray(current.contentAccounts)
    ? current.contentAccounts
    : [];

  if (!accounts.some(item => item.id === contentAccountId)) {
    throw new Error("MTI: content account not found.");
  }

  return saveAccountProfile({
    activeContentAccountId: contentAccountId
  });
}

export function getContentAccounts() {
  const profile = getAccountProfile();
  return Array.isArray(profile.contentAccounts)
    ? clone(profile.contentAccounts)
    : [];
}

export function getActiveContentAccount() {
  const profile = getAccountProfile();
  const accounts = Array.isArray(profile.contentAccounts)
    ? profile.contentAccounts
    : [];

  return clone(
    accounts.find(item => item.id === profile.activeContentAccountId) ||
    accounts[0] ||
    null
  );
}

export function getContentTypes() {
  return [...CONTENT_TYPES];
}

export function deleteAccountProfile() {
  try {
    localStorage.removeItem(storageKey());
    return true;
  } catch {
    return false;
  }
}

export default {
  ACCOUNT_PROFILE_SCHEMA_VERSION,
  getAccountProfile,
  hasCompletedAccountProfile,
  saveAccountProfile,
  updateAccountProfile,
  addContentAccount,
  setActiveContentAccount,
  getContentAccounts,
  getActiveContentAccount,
  getContentTypes,
  deleteAccountProfile
};
