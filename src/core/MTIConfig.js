/*
  MTI — Core Configuration
  Central configuration for the application.

  No UI logic.
  No AI logic.
  No engine implementation.
*/

export const MTI_CONFIG = Object.freeze({

  app: {
    name: "MTI",
    version: "2.0.0",
    environment: "offline",
    mode: "local-first"
  },


  engine: {

    default: "auto",

    supported: [
      "ExperimentEngine",
      "reel-engine"
    ],

    version: "2.0.0"

  },


  analysis: {

    maxFileSizeMB: 500,

    supportedVideoTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v"
    ],

    maxDurationSeconds: 180,

    defaultLanguage: "ar",

    features: [

      "hook",
      "retention",
      "psychology",
      "visuals",
      "audio",
      "text",
      "pacing",
      "storytelling",
      "attentionMap",
      "prediction",
      "sceneAnalysis",
      "recommendations"

    ]

  },


  memory: {

    localStorage: true,

    cloudSync: false,

    privateMemory: true,

    globalLearning: false,

    maxExperiments: 500,

    maxLearnings: 500,

    maxNotes: 500

  },


  ai: {

    enabled: true,

    provider: "gemini",

    model: "gemini-2.5-flash",

    fallbackModel: "gemini-flash-latest",

    timeoutMs: 60000,

    maxRetries: 2

  },


  account: {

    authentication: "firebase",

    provider: "google",

    requireAuthentication: false

  },


  features: {

    analysis: true,

    recommendations: true,

    prediction: true,

    memory: true,

    learning: true,

    attentionMap: true,

    sceneAnalysis: true,

    chatInsights: true,

    cloudSync: false

  },


  development: {

    debug: false,

    verboseLogging: false,

    testMode: false

  }

});


export function getMTIConfig() {

  return MTI_CONFIG;

}


export function getAnalysisConfig() {

  return MTI_CONFIG.analysis;

}


export function getAIConfig() {

  return MTI_CONFIG.ai;

}


export function getMemoryConfig() {

  return MTI_CONFIG.memory;

}


export function isFeatureEnabled(
  feature
) {

  return Boolean(
    MTI_CONFIG.features?.[feature]
  );

}


export default MTI_CONFIG;
