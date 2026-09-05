/**
 * MTI Knowledge Base
 * ===================
 *
 * Shared, local-first knowledge layer for MTI.
 *
 * This is NOT personal account memory.
 * It contains general knowledge used to understand:
 * - psychology
 * - attention
 * - hooks
 * - retention
 * - storytelling
 * - pacing
 * - visual communication
 * - audio
 * - text
 * - curiosity
 * - cognition
 * - emotion
 * - viewer behavior
 * - platform signals (Reels / TikTok / Shorts differences)
 * - niches (marketing, personal brand, motivational, educational, comedy...)
 * - content patterns
 *
 * Personal account data MUST remain inside reel-memory.js.
 */

const KNOWLEDGE_VERSION = "1.0.0";

const knowledgeBase = {
  version: KNOWLEDGE_VERSION,

  status: "active",

  sourceModel: "structured-general-knowledge",

  categories: {
    psychology: [],
    attention: [],
    hooks: [],
    retention: [],
    storytelling: [],
    pacing: [],
    visual: [],
    audio: [],
    text: [],
    curiosity: [],
    cognition: [],
    emotion: [],
    narrative: [],
    viewerBehavior: [],
    platformSignals: [],
    niches: [],
    audienceRegions: [],
    cta: [],
    contentPatterns: []
  },

  rules: [],

  principles: [],

  patterns: [],

  evidence: [],

  metadata: {
    localFirst: true,
    externalAI: false,
    externalAPI: false,
    accountPrivate: false,
    sharedKnowledge: true,
    personalMemorySeparated: true
  }
};

/**
 * Add a knowledge item.
 */
export function addKnowledge(category, item) {
  if (!category || !knowledgeBase.categories[category]) {
    throw new Error(`Unknown knowledge category: ${category}`);
  }

  if (!item || typeof item !== "object") {
    throw new Error("Knowledge item must be an object.");
  }

  knowledgeBase.categories[category].push({
    id:
      item.id ||
      `${category}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    ...item,

    category,

    addedAt: item.addedAt || new Date().toISOString()
  });

  return knowledgeBase.categories[category][
    knowledgeBase.categories[category].length - 1
  ];
}

/**
 * Add a general rule.
 */
export function addRule(rule) {
  if (!rule || typeof rule !== "object") {
    throw new Error("Rule must be an object.");
  }

  const normalized = {
    id:
      rule.id ||
      `rule_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    ...rule,

    addedAt: rule.addedAt || new Date().toISOString()
  };

  knowledgeBase.rules.push(normalized);

  return normalized;
}

/**
 * Add a general principle.
 */
export function addPrinciple(principle) {
  if (!principle || typeof principle !== "object") {
    throw new Error("Principle must be an object.");
  }

  const normalized = {
    id:
      principle.id ||
      `principle_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    ...principle,

    addedAt: principle.addedAt || new Date().toISOString()
  };

  knowledgeBase.principles.push(normalized);

  return normalized;
}

/**
 * Add a reusable content pattern.
 */
export function addPattern(pattern) {
  if (!pattern || typeof pattern !== "object") {
    throw new Error("Pattern must be an object.");
  }

  const normalized = {
    id:
      pattern.id ||
      `pattern_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    ...pattern,

    addedAt: pattern.addedAt || new Date().toISOString()
  };

  knowledgeBase.patterns.push(normalized);

  return normalized;
}

/**
 * Add evidence/reference metadata.
 */
export function addEvidence(evidence) {
  if (!evidence || typeof evidence !== "object") {
    throw new Error("Evidence must be an object.");
  }

  const normalized = {
    id:
      evidence.id ||
      `evidence_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    ...evidence,

    addedAt: evidence.addedAt || new Date().toISOString()
  };

  knowledgeBase.evidence.push(normalized);

  return normalized;
}

/**
 * Get one category.
 */
export function getKnowledgeCategory(category) {
  if (!category || !knowledgeBase.categories[category]) {
    return [];
  }

  return [...knowledgeBase.categories[category]];
}

/**
 * Search the general knowledge base.
 *
 * This is intentionally simple for V1.
 * A semantic/vector retrieval layer can replace it later
 * without changing the public API.
 */
export function searchKnowledge(query, options = {}) {
  const text = String(query || "")
    .toLowerCase()
    .trim();

  if (!text) {
    return [];
  }

  const requestedCategories = Array.isArray(options.categories)
    ? options.categories
    : Object.keys(knowledgeBase.categories);

  const limit = Number.isFinite(options.limit)
    ? Math.max(1, options.limit)
    : 20;

  const results = [];

  for (const category of requestedCategories) {
    const items = knowledgeBase.categories[category] || [];

    for (const item of items) {
      const searchableText = JSON.stringify(item).toLowerCase();

      if (!searchableText.includes(text)) {
        continue;
      }

      results.push({
        ...item,
        relevance: 1,
        source: "MTI Knowledge Base"
      });
    }
  }

  return results.slice(0, limit);
}

/**
 * Get a snapshot for the Intelligence Engine.
 *
 * IMPORTANT:
 * This snapshot contains only shared/general knowledge.
 * It never contains account memory.
 */
export function getKnowledgeSnapshot() {
  return {
    version: knowledgeBase.version,

    categories: Object.fromEntries(
      Object.entries(knowledgeBase.categories).map(
        ([category, items]) => [category, [...items]]
      )
    ),

    rules: [...knowledgeBase.rules],

    principles: [...knowledgeBase.principles],

    patterns: [...knowledgeBase.patterns],

    evidence: [...knowledgeBase.evidence],

    metadata: {
      ...knowledgeBase.metadata
    }
  };
}

/**
 * Get lightweight statistics.
 */
export function getKnowledgeStats() {
  const categoryCounts = {};

  for (const [category, items] of Object.entries(
    knowledgeBase.categories
  )) {
    categoryCounts[category] = items.length;
  }

  return {
    version: KNOWLEDGE_VERSION,

    totalKnowledgeItems: Object.values(
      categoryCounts
    ).reduce((sum, count) => sum + count, 0),

    rules: knowledgeBase.rules.length,

    principles: knowledgeBase.principles.length,

    patterns: knowledgeBase.patterns.length,

    evidence: knowledgeBase.evidence.length,

    categories: categoryCounts,

    localFirst: knowledgeBase.metadata.localFirst,

    externalAI: knowledgeBase.metadata.externalAI,

    personalMemorySeparated:
      knowledgeBase.metadata.personalMemorySeparated
  };
}

/**
 * Health check.
 */
export function healthCheck() {
  return {
    ready: true,
    version: KNOWLEDGE_VERSION,
    status: knowledgeBase.status,
    categories: Object.keys(knowledgeBase.categories).length,
    totalItems: getKnowledgeStats().totalKnowledgeItems,
    localFirst: true,
    externalAI: false,
    accountIsolation: true,
    personalMemorySeparated: true
  };
}

/**
 * Public service object.
 */
export const MTIKnowledgeBase = {
  version: KNOWLEDGE_VERSION,

  addKnowledge,
  addRule,
  addPrinciple,
  addPattern,
  addEvidence,

  getKnowledgeCategory,
  searchKnowledge,
  getKnowledgeSnapshot,
  getKnowledgeStats,
  healthCheck
};

export default MTIKnowledgeBase;
