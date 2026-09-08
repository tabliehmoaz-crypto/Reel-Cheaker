/* MTI Brain — idea intelligence, independent from Reel analysis.
   Generates concepts from the user's niche/context and can turn an analysis
   into new directions without pretending that an idea is guaranteed to work. */

import {
  generateFreshIdeas,
  generateContentFromIdea,
  analyzeIdea
} from "../generation/IdeaToContentEngine.js";

export class MTIBrain {
  constructor(options = {}) {
    this.version = options.version || "1.0.0";
  }

  generateIdeas({ nicheId, count = 5, context = {} } = {}) {
    const ideas = generateFreshIdeas({ nicheId, count });
    return ideas.map((idea, index) => ({
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
    return ideas.map(idea => ({
      ...idea,
      inspiredBy: base ? "reel-analysis" : "context",
      sourceSignals: analysis?.evidence || []
    }));
  }
}

export const mtiBrain = new MTIBrain();
export default MTIBrain;
