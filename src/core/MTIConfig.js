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
    version: "3.0.0",
    environment: "offline",
    mode: "local-first"
  },


  engine: {

    default: "reel-engine",

    supported: [
      "ExperimentEngine",
      "reel-engine"
    ],

    version: "3.0.0"

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
      "visual",
      "audio",
      "text",
      "pacing",
      "storytelling",
      "speech",
      "idea",
      "technical",
      "dropOff",
      "diagnosis",

      "attentionMap",
      "sceneAnalysis",
      "viewerJourney",
      "curiosity",
      "cognition",
      "emotion",
      "narrative",

      "recommendations",
      "prediction",
      "learning"

    ]

  },


  memory: {

    localStorage: true,

    cloudSync: false,

    privateMemory: true,

    accountIsolation: true,

    accountScoped: true,

    globalLearning: false,

    maxExperiments: 500,

    maxLearnings: 500,

    maxNotes: 500

  },


  ai: {

    enabled: false,

    externalAI: false,

    provider: null,

    model: null,

    fallbackModel: null,

    timeoutMs: 0,

    maxRetries: 0

  },


  account: {

    authentication: "firebase",

    provider: "google",

    requireAuthentication: false,

    isolationKey: "uid"

  },


  features: {

    analysis: true,

    recommendations: true,

    prediction: true,

    memory: true,

    learning: true,

    attentionMap: true,

    sceneAnalysis: true,

    viewerJourney: true,

    psychology: true,

    storytelling: true,

    audio: true,

    speech: true,

    text: true,

    chatInsights: true,

    cloudSync: false,

    externalAI: false

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
