/*
  MTI — Content / Reel Room Service
  ----------------------------------
  Canonical owner of Reel identity AND the persistent Reel Room.

  A Reel is not only a video. It is the long-lived workspace that keeps:
  - versions
  - analysis results
  - predictions / reality / comparisons
  - Reel-scoped learning
  - conversation
  - Brain context
  - ideas generated for that Reel

  Account-scoped through MTIMemoryService.
*/

import {
  createExperiment,
  saveExperiment,
  updateExperiment,
  getAllExperiments
} from "../engine/ExperimentEngine.js";

import { memoryService } from "./MTIMemoryService.js";

export const REEL_ROOM_SCHEMA_VERSION = "1.0.0";

function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureAccount() {
  memoryService.ensureInitialized();
  return memoryService.getActiveAccountId();
}

function emptyRoom(reelId, title = "Untitled Reel") {
  return {
    schemaVersion: REEL_ROOM_SCHEMA_VERSION,
    reelId,
    title,
    brain: {
      context: {},
      lastUpdatedAt: null
    },
    ideas: [],
    conversation: [],
    updatedAt: now()
  };
}

function normalizeRoom(room, reelId, title) {
  const base = emptyRoom(reelId, title);
  const source = room && typeof room === "object" ? room : {};

  return {
    ...base,
    ...clone(source),
    schemaVersion: REEL_ROOM_SCHEMA_VERSION,
    reelId,
    title: source.title || title || base.title,
    brain: {
      ...base.brain,
      ...(source.brain || {})
    },
    ideas: Array.isArray(source.ideas) ? source.ideas : [],
    conversation: Array.isArray(source.conversation)
      ? source.conversation
      : [],
    updatedAt: source.updatedAt || now()
  };
}

export async function createReel(data = {}) {
  const accountId = ensureAccount();
  const title = data.title || data.name || "Untitled Reel";
  const reel = createExperiment({
    ...data,
    type: "reel",
    reelId: data.reelId || undefined,
    versionNumber: 1,
    parentVersionId: null,
    accountId,
    reelRoom: emptyRoom(data.reelId || null, title)
  });

  // createExperiment generates reelId; update the room with the real permanent ID.
  reel.reelRoom = emptyRoom(reel.reelId, title);
  return saveExperiment(reel);
}

export async function createReelVersion(reelId, data = {}) {
  ensureAccount();

  const versions = getReelVersions(reelId);
  if (!versions.length) {
    throw new Error("Reel غير موجود لهذا الحساب.");
  }

  const latest = versions[0];
  const inheritedRoom = normalizeRoom(
    latest.reelRoom,
    reelId,
    latest.title || latest.name || "Untitled Reel"
  );

  const version = createExperiment({
    ...data,
    type: "reel",
    reelId,
    versionId: undefined,
    versionNumber: latest.versionNumber + 1,
    parentVersionId: latest.versionId,
    accountId: memoryService.getActiveAccountId(),
    status: data.status || "DRAFT",
    // Reel Room belongs to the permanent Reel, not to one version.
    reelRoom: inheritedRoom,
    // Preserve the conversation/ideas even when a new version becomes latest.
    conversation: clone(inheritedRoom.conversation),
    reelIdeas: clone(inheritedRoom.ideas)
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
    comparison: clone(version.comparison),
    learning: clone(version.learning)
  }));
}

export function getReel(reelId) {
  return getReelVersions(reelId)[0] || null;
}

export function getReelRoomContext(reelId) {
  const versions = getReelVersions(reelId);
  if (!versions.length) return null;

  const latest = versions[0];
  const title = latest.title || latest.name || "Untitled Reel";
  const room = normalizeRoom(latest.reelRoom, reelId, title);

  // Account learning is read-only context here. It is not copied into the Reel's
  // private room as a new learning observation.
  let accountLearning = null;
  try {
    accountLearning = memoryService.getLearnings();
  } catch {
    accountLearning = null;
  }

  return {
    schemaVersion: REEL_ROOM_SCHEMA_VERSION,
    reelId,
    accountId: memoryService.getActiveAccountId(),
    title,
    latestVersion: clone(latest),
    versions: versions.map(version => ({
      versionId: version.versionId,
      versionNumber: version.versionNumber,
      parentVersionId: version.parentVersionId || null,
      assetId: version.assetId || null,
      status: version.status,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      analysis: clone(version.analysis),
      prediction: clone(version.prediction),
      actualPerformance: clone(version.actualPerformance),
      comparison: clone(version.comparison),
      learning: clone(version.learning)
    })),
    results: versions
      .filter(version => version.analysis)
      .map(version => ({
        versionId: version.versionId,
        versionNumber: version.versionNumber,
        analysis: clone(version.analysis),
        prediction: clone(version.prediction),
        comparison: clone(version.comparison)
      })),
    learning: {
      reel: clone(latest.learning),
      account: clone(accountLearning)
    },
    brain: clone(room.brain),
    ideas: clone(room.ideas),
    messages: clone(room.conversation),
    updatedAt: room.updatedAt
  };
}

export async function updateReelRoom(reelId, updater) {
  const latest = getReel(reelId);
  if (!latest) throw new Error("Reel غير موجود لهذا الحساب.");

  const currentRoom = normalizeRoom(
    latest.reelRoom,
    reelId,
    latest.title || latest.name || "Untitled Reel"
  );

  const nextRoom =
    typeof updater === "function"
      ? updater(clone(currentRoom))
      : { ...currentRoom, ...clone(updater) };

  const room = normalizeRoom(
    nextRoom,
    reelId,
    latest.title || latest.name || "Untitled Reel"
  );

  room.updatedAt = now();

  return updateExperiment(latest.id, current => ({
    ...current,
    reelRoom: room,
    // Compatibility fields for older UI/storage readers.
    conversation: clone(room.conversation),
    reelIdeas: clone(room.ideas)
  }));
}

export async function addReelMessage(reelId, message) {
  if (!message || !String(message.content || "").trim()) {
    throw new Error("رسالة المحادثة فارغة.");
  }

  return updateReelRoom(reelId, room => {
    room.conversation.push({
      id: id("msg"),
      role: message.role || "user",
      content: String(message.content).trim(),
      metadata: clone(message.metadata || null),
      createdAt: now()
    });
    return room;
  });
}

export async function addReelBrainMessage(reelId, message) {
  return addReelMessage(reelId, {
    ...message,
    role: message?.role || "assistant"
  });
}

export async function saveReelIdea(reelId, idea, metadata = {}) {
  if (!idea) throw new Error("لا يمكن حفظ فكرة فارغة.");

  return updateReelRoom(reelId, room => {
    const record = {
      id: id("idea"),
      idea: typeof idea === "string" ? idea : clone(idea),
      metadata: clone(metadata),
      createdAt: now(),
      status: "generated"
    };

    room.ideas.push(record);
    return room;
  });
}

export async function updateReelBrainContext(reelId, context = {}) {
  return updateReelRoom(reelId, room => {
    room.brain = {
      ...(room.brain || {}),
      context: {
        ...(room.brain?.context || {}),
        ...clone(context)
      },
      lastUpdatedAt: now()
    };
    return room;
  });
}

export async function attachReelLearning(reelId, learning) {
  const latest = getReel(reelId);
  if (!latest) throw new Error("Reel غير موجود لهذا الحساب.");

  return updateExperiment(latest.id, current => ({
    ...current,
    learning: clone(learning)
  }));
}

export async function getReelConversation(reelId) {
  const room = getReelRoomContext(reelId);
  return room ? room.messages || [] : [];
}

export async function getReelIdeas(reelId) {
  const room = getReelRoomContext(reelId);
  return room ? room.ideas || [] : [];
}

export default {
  createReel,
  createReelVersion,
  getReel,
  getReelVersions,
  getReelHistory,
  getReelRoomContext,
  updateReelRoom,
  addReelMessage,
  addReelBrainMessage,
  saveReelIdea,
  updateReelBrainContext,
  attachReelLearning,
  getReelConversation,
  getReelIdeas
};
