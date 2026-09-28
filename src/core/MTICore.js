/* MTI Core — one public entry point for the product's intelligence layer. */

import { analysisOrchestrator as mtiAnalysisOrchestrator } from "./MTIAnalysisOrchestrator.js";
import { mtiBrain } from "./MTIBrain.js";
import { diagnoseReel } from "../editing/MTIDiagnosisEngine.js";
import { renderEditPlan } from "../editing/MTIEditEngine.js";
import { getMTIStage, MTI_STAGE_ORDER } from "./MTIStages.js";
import {
  getReelRoomContext,
  getReelHistory,
  createReelVersion
} from "./MTIContentService.js";
import {
  addReelConversationMessage,
  getReelConversation
} from "./MTIReelConversationService.js";

export const MTI_CORE_VERSION = "4.0.0";

export const mtiCore = {
  version: MTI_CORE_VERSION,

  async analyze(file, options = {}) {
    return mtiAnalysisOrchestrator.analyze(file, options);
  },

  getStage(id) { return getMTIStage(id); },
  getStages() { return MTI_STAGE_ORDER.map(getMTIStage).filter(Boolean); },

  getReelRoom(reelId) { return getReelRoomContext(reelId); },
  getReelHistory(reelId) { return getReelHistory(reelId); },
  createReelVersion(reelId, data) { return createReelVersion(reelId, data); },
  getReelConversation(reelId) { return getReelConversation(reelId); },
  addReelConversationMessage(reelId, message) {
    return addReelConversationMessage(reelId, message);
  },

  diagnose(report, options = {}) { return diagnoseReel(report, options); },
  async renderEdit(file, plan, options = {}) { return renderEditPlan(file, plan, options); },

  brain: mtiBrain
};

export default mtiCore;
