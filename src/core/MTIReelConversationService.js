/* MTI — Reel Room Conversation
   Every Reel owns a persistent conversation context.
   Messages stay scoped to the Reel, not globally mixed. */

import { addReelMessage, getReelRoomContext } from "./MTIContentService.js";

export async function getReelConversation(reelId) {
  const room = getReelRoomContext(reelId);
  return room ? room.messages || [] : [];
}

export async function addReelConversationMessage(reelId, message) {
  if (!message || !String(message.content || "").trim()) {
    throw new Error("رسالة المحادثة فارغة.");
  }
  return addReelMessage(reelId, {
    role: message.role || "user",
    content: String(message.content).trim(),
    metadata: message.metadata || null
  });
}

export async function buildReelConversationContext(reelId) {
  const room = getReelRoomContext(reelId);
  if (!room) return null;
  return {
    reelId: room.reelId,
    title: room.title,
    latestVersion: room.latestVersion,
    versions: room.versions,
    messages: room.messages || []
  };
}

export default {
  getReelConversation,
  addReelConversationMessage,
  buildReelConversationContext
};
