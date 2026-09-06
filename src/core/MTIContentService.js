/*
  MTI — Content Service
  ---------------------
  Canonical content identity layer.

  One Reel = permanent reelId.
  Every uploaded/edit version = separate Experiment/versionId.

  Account-scoped through MTIMemoryService.
*/

import {
  createExperiment,
  saveExperiment,
  updateExperiment,
  getExperiment,
  getAllExperiments
} from "../engine/ExperimentEngine.js";

import { memoryService } from "./MTIMemoryService.js";

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

function ensureAccount() {
  memoryService.ensureInitialized();
  return memoryService.getActiveAccountId();
}

export function createReel(data = {}) {
  ensureAccount();

  const reel = createExperiment({
    ...data,
    type: "reel",
    reelId: data.reelId || undefined,
    versionNumber: 1,
    parentVersionId: null,
    accountId: memoryService.getActiveAccountId()
  });

  return saveExperiment(reel);
}

export function createReelVersion(reelId, data = {}) {
  ensureAccount();

  const versions = getReelVersions(reelId);
  if (!versions.length) {
    throw new Error("Reel غير موجود لهذا الحساب.");
  }

  const latest = versions[0];
  const version = createExperiment({
    ...data,
    type: "reel",
    reelId,
    versionId: undefined,
    versionNumber: latest.versionNumber + 1,
    parentVersionId: latest.versionId,
    accountId: memoryService.getActiveAccountId(),
    status: data.status || "DRAFT"
  });

  return saveExperiment(version);
}

export function getReelVersions(reelId) {
  ensureAccount();

  return getAllExperiments()
    .filter(item => item.reelId === reelId)
    .sort((a, b) => Number(b.versionNumber || 0) - Number(a.versionNumber || 0));
}

export function getReelHistory(reelId) {
  return getReelVersions(reelId).map(version => ({
    reelId: version.reelId,
    versionId: version.versionId,
    versionNumber: version.versionNumber,
    parentVersionId: version.parentVersionId || null,
    assetId: version.assetId || null,
    status: version.status,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
    title: version.title,
    analysis: clone(version.analysis),
    prediction: clone(version.prediction),
    actualPerformance: clone(version.actualPerformance),
    comparison: clone(version.comparison)
  }));
}

export function getReel(reelId) {
  return getReelVersions(reelId)[0] || null;
}

export function getReelRoomContext(reelId) {
  const versions = getReelVersions(reelId);
  if (!versions.length) return null;

  const latest = versions[0];

  return {
    reelId,
    accountId: memoryService.getActiveAccountId(),
    title: latest.title || latest.name || "Untitled Reel",
    latestVersion: clone(latest),
    versions: versions.map(version => ({
      versionId: version.versionId,
      versionNumber: version.versionNumber,
      parentVersionId: version.parentVersionId || null,
      assetId: version.assetId || null,
      status: version.status,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    })),
    messages: clone(latest.conversation || []),
    updatedAt: now()
  };
}

export async function addReelMessage(reelId, message) {
  const latest = getReel(reelId);
  if (!latest) throw new Error("Reel غير موجود لهذا الحساب.");

  return updateExperiment(latest.id, current => {
    const conversation = Array.isArray(current.conversation)
      ? current.conversation
      : [];

    conversation.push({
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      role: message?.role || "user",
      content: String(message?.content || ""),
      createdAt: now()
    });

    return {
      ...current,
      conversation
    };
  });
}

export default {
  createReel,
  createReelVersion,
  getReel,
  getReelVersions,
  getReelHistory,
  getReelRoomContext,
  addReelMessage
};
