/* MTI Brain — canonical reasoning layer.
   Brain does not replace Reel analysis.
   It consumes analysis + Reel Room + account learning + knowledge context
   and can generate ideas/directions without pretending that ideas are facts. */

import {
  generateFreshIdeas,
  generateContentFromIdea,
  analyzeIdea
} from "../generation/IdeaToContentEngine.js?v=6.3.0";

import {
  getReelRoomContext,
  saveReelIdea,
  updateReelBrainContext
} from "./MTIContentService.js";

export class MTIBrain {
  constructor(options = {}) {
    this.version = options.version || "2.0.0";
  }

  generateIdeas({ nicheId, count = 5, context = {} } = {}) {
    const result = generateFreshIdeas({ nicheId, count });
    if (!result?.success) return result;

    return result.ideas.map((idea, index) => ({
      ...idea,
      brainId: `brain_${Date.now()}_${index}`,
      context: { ...context }
    }));
  }

  developIdea(idea, context = {}) {
    if (!idea) throw new Error("MTI Brain يحتاج فكرة للبدء.");
    return generateContentFromIdea(idea, context);
  }

  analyzeIdea(idea, context = {}) {
    return analyzeIdea(idea, context);
  }

  createDirections({ analysis, nicheId, count = 5, context = {} } = {}) {
    const base = analysis?.intelligence?.summary || analysis?.summary || "";
    const ideas = this.generateIdeas({ nicheId, count, context });
    if (!Array.isArray(ideas)) return ideas;

    return ideas.map(idea => ({
      ...idea,
      inspiredBy: base ? "reel-analysis" : "context",
      sourceSignals: analysis?.evidence || []
    }));
  }

  /* ---------------------------------------------------------
     Reel-aware Brain
     --------------------------------------------------------- */

  getReelBrainContext(reelId) {
    const room = getReelRoomContext(reelId);
    if (!room) return null;

    return {
      reelId: room.reelId,
      title: room.title,
      latestVersion: room.latestVersion,
      versions: room.versions,
      results: room.results,
      learning: room.learning,
      brain: room.brain,
      ideas: room.ideas,
      messages: room.messages
    };
  }

  /**
   * Generate ideas using the actual Reel Room as context.
   * The generated ideas are persisted inside that Reel Room so they remain
   * attached to the content instead of disappearing after the UI session.
   */
  async generateIdeasForReel({
    reelId,
    nicheId,
    count = 5,
    context = {}
  } = {}) {
    if (!reelId) throw new Error("reelId مطلوب لتوليد أفكار داخل Reel Room.");

    const room = this.getReelBrainContext(reelId);
    if (!room) throw new Error("Reel غير موجود.");

    const mergedContext = {
      reelId,
      title: room.title,
      latestAnalysis: room.results?.[0]?.analysis || null,
      latestPrediction: room.results?.[0]?.prediction || null,
      reelLearning: room.learning?.reel || null,
      accountLearning: room.learning?.account || null,
      previousIdeas: room.ideas || [],
      conversation: room.messages || [],
      ...context
    };

    const result = this.generateIdeas({
      nicheId,
      count,
      context: mergedContext
    });

    if (!Array.isArray(result)) return result;

    const savedIdeas = [];
    for (const idea of result) {
      savedIdeas.push(
        await saveReelIdea(reelId, idea, {
          source: "mti-brain",
          basedOn: {
            latestVersionId: room.latestVersion?.versionId || null,
            analysisId: room.results?.[0]?.analysis?.id || null
          }
        })
      );
    }

    await updateReelBrainContext(reelId, {
      lastIdeaGenerationAt: new Date().toISOString(),
      lastIdeaGenerationCount: savedIdeas.length
    });

    return {
      success: true,
      reelId,
      ideas: savedIdeas,
      context: {
        analysisAware: !!mergedContext.latestAnalysis,
        learningAware: !!mergedContext.reelLearning || !!mergedContext.accountLearning,
        conversationAware: Array.isArray(mergedContext.conversation) && mergedContext.conversation.length > 0
      }
    };
  }

  /**
   * Develop one idea while retaining the Reel Room context.
   */
  async developIdeaForReel({
    reelId,
    idea,
    context = {}
  } = {}) {
    if (!reelId) throw new Error("reelId مطلوب.");
    if (!idea) throw new Error("الفكرة مطلوبة.");

    const room = this.getReelBrainContext(reelId);
    if (!room) throw new Error("Reel غير موجود.");

    const mergedContext = {
      reelId,
      title: room.title,
      latestAnalysis: room.results?.[0]?.analysis || null,
      latestPrediction: room.results?.[0]?.prediction || null,
      reelLearning: room.learning?.reel || null,
      accountLearning: room.learning?.account || null,
      conversation: room.messages || [],
      ...context
    };

    const plan = this.developIdea(idea, mergedContext);

    await saveReelIdea(reelId, plan, {
      source: "mti-brain-development",
      parentIdea: idea
    });

    await updateReelBrainContext(reelId, {
      lastDevelopedIdeaAt: new Date().toISOString()
    });

    return {
      success: true,
      reelId,
      plan
    };
  }
}

export const mtiBrain = new MTIBrain();
export default MTIBrain;
