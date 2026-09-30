/* MTI Core — single public application facade. */

import { analysisOrchestrator as mtiAnalysisOrchestrator } from "./MTIAnalysisOrchestrator.js?v=6.1.0";
import { mtiBrain } from "./MTIBrain.js";
import { diagnoseReel } from "../editing/MTIDiagnosisEngine.js";
import { renderEditPlan } from "../editing/MTIEditEngine.js";
import { getMTIStage, MTI_STAGE_ORDER } from "./MTIStages.js";
import { getAccountProfile, getActiveContentAccount } from "../account/MTIAccountProfileService.js";
import {
  getReelRoomContext,
  getReelHistory,
  createReelVersion,
  getReelConversation,
  getReelIdeas,
  addReelMessage,
  addReelBrainMessage,
  updateReelBrainContext
} from "./MTIContentService.js";

export const MTI_CORE_VERSION = "6.0.0";

export const mtiCore = {
  version: MTI_CORE_VERSION,

  async analyze(file, options = {}) {
    const profile = getAccountProfile();
    const contentAccount = getActiveContentAccount();
    return mtiAnalysisOrchestrator.analyze(file, {
      ...options,
      accountProfile: options.accountProfile || profile,
      contentAccount: options.contentAccount || contentAccount,
      contentAccountId: options.contentAccountId || contentAccount?.id || null,
      baselineViews: options.baselineViews ?? contentAccount?.typicalViews ?? profile.typicalViews ?? null,
      followerCount: options.followerCount ?? contentAccount?.followers ?? profile.followers ?? null,
      contentTypes: options.contentTypes || contentAccount?.declaredContentTypes || profile.declaredContentTypes || []
    });
  },

  getStage(id) {
    return getMTIStage(id);
  },

  getStages() {
    return MTI_STAGE_ORDER.map(getMTIStage).filter(Boolean);
  },

  /* ---------------------------------------------------------
     Canonical Reel Room
     ---------------------------------------------------------
     One call returns the persistent workspace for the Reel:
     versions + results + prediction/reality + learning +
     Brain context + ideas + conversation.
  */
  getReelRoom(reelId) {
    return getReelRoomContext(reelId);
  },

  getReelHistory(reelId) {
    return getReelHistory(reelId);
  },

  createReelVersion(reelId, data) {
    return createReelVersion(reelId, data);
  },

  getReelConversation(reelId) {
    return getReelConversation(reelId);
  },

  addReelConversationMessage(reelId, message) {
    return addReelMessage(reelId, message);
  },

  addReelBrainMessage(reelId, message) {
    return addReelBrainMessage(reelId, message);
  },

  getReelIdeas(reelId) {
    return getReelIdeas(reelId);
  },

  getReelAnalysis(reelId) {
    return getReelRoomContext(reelId)?.results || [];
  },

  getReelLearning(reelId) {
    return getReelRoomContext(reelId)?.learning || null;
  },

  getReelBrainContext(reelId) {
    return mtiBrain.getReelBrainContext(reelId);
  },

  async generateIdeasForReel(options = {}) {
    return mtiBrain.generateIdeasForReel(options);
  },

  async developIdeaForReel(options = {}) {
    return mtiBrain.developIdeaForReel(options);
  },

  updateReelBrainContext(reelId, context = {}) {
    return updateReelBrainContext(reelId, context);
  },

  diagnose(report, options = {}) {
    return diagnoseReel(report, options);
  },

  async renderEdit(file, plan, options = {}) {
    return renderEditPlan(file, plan, options);
  },

  brain: mtiBrain
};

export default mtiCore;
