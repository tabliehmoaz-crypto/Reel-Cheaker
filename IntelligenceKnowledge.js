/*
  MTI — Intelligence Knowledge Base
  ---------------------------------
  Scientific knowledge layer for MTI.

  IMPORTANT:
  This file does NOT claim that every marketing
  heuristic is a scientific law.

  Evidence levels:
  - strong       = well-established finding
  - moderate     = supported, but context-dependent
  - heuristic    = practical hypothesis / rule of thumb

  The AI must distinguish:
  evidence
  from
  interpretation
  from
  hypothesis.
*/


export const KNOWLEDGE_VERSION =
  "1.0.0";


export const EVIDENCE_LEVELS = {

  STRONG:
    "strong",

  MODERATE:
    "moderate",

  HEURISTIC:
    "heuristic"

};


export const KNOWLEDGE_BASE = [

  {
    id:
      "processing_fluency",

    domain:
      "cognition",

    principle:
      "Processing fluency",

    evidenceLevel:
      EVIDENCE_LEVELS.STRONG,

    mechanism:
      "processing_fluency",

    description:
      "Information that is easier to process can be experienced more fluently and may be evaluated more positively or understood more easily.",

    viewerEffect:
      [
        "continue",
        "understand",
        "trust"
      ],

    observableSignals:
      [
        "clear visual hierarchy",
        "legible text",
        "simple message structure",
        "low unnecessary complexity"
      ],

    misuseWarning:
      "Do not assume that simplicity always increases retention. Complexity can be useful when it carries meaningful information.",

    analysisRule:
      "Use observable evidence before assigning a psychological explanation."

  },


  {
    id:
      "cognitive_load",

    domain:
      "cognition",

    principle:
      "Cognitive load",

    evidenceLevel:
      EVIDENCE_LEVELS.STRONG,

    mechanism:
      "cognitive_load",

    description:
      "Working memory has limited capacity, and unnecessary cognitive demands can interfere with comprehension and learning.",

    viewerEffect:
      [
        "continue",
        "understand",
        "skip"
      ],

    observableSignals:
      [
        "too many simultaneous text elements",
        "rapid information changes",
        "unclear message hierarchy",
        "multiple competing visual focal points"
      ],

    misuseWarning:
      "Do not equate fast pacing with high cognitive load automatically.",

    analysisRule:
      "Identify the specific processing demand before predicting viewer behavior."

  },


  {
    id:
      "novelty",

    domain:
      "attention",

    principle:
      "Novelty and orienting response",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "novelty",

    description:
      "Unexpected or novel stimuli can attract attention and trigger orienting responses.",

    viewerEffect:
      [
        "attention",
        "continue"
      ],

    observableSignals:
      [
        "unexpected visual change",
        "new object entering frame",
        "unexpected sound",
        "unexpected statement"
      ],

    misuseWarning:
      "Novelty can capture attention without producing sustained interest.",

    analysisRule:
      "Separate attention capture from continued viewing."

  },


  {
    id:
      "prediction_error",

    domain:
      "attention",

    principle:
      "Prediction error",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "prediction_error",

    description:
      "Events that violate an observer's expectations can attract attention and increase information updating.",

    viewerEffect:
      [
        "attention",
        "continue",
        "rewatch"
      ],

    observableSignals:
      [
        "unexpected outcome",
        "visual contradiction",
        "unexpected reveal",
        "surprising transition"
      ],

    misuseWarning:
      "Surprise without relevance can increase attention briefly but fail to sustain viewing.",

    analysisRule:
      "Check whether the unexpected event is relevant to the video's promise."

  },


  {
    id:
      "curiosity_gap",

    domain:
      "curiosity",

    principle:
      "Information gap / curiosity",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "curiosity_gap",

    description:
      "Perceived gaps between what a person knows and what they want to know can motivate information seeking.",

    viewerEffect:
      [
        "continue"
      ],

    observableSignals:
      [
        "explicit unanswered question",
        "promised explanation",
        "incomplete information",
        "anticipated reveal"
      ],

    misuseWarning:
      "A vague mystery is not automatically a useful curiosity gap.",

    analysisRule:
      "The viewer must have a plausible reason to care about closing the information gap."

  },


  {
    id:
      "self_relevance",

    domain:
      "relevance",

    principle:
      "Self-relevance",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "self_relevance",

    description:
      "Information perceived as relevant to the self can receive greater attention and processing.",

    viewerEffect:
      [
        "attention",
        "continue",
        "share",
        "save"
      ],

    observableSignals:
      [
        "specific audience language",
        "recognizable personal problem",
        "identity-relevant framing",
        "clear consequence for the viewer"
      ],

    misuseWarning:
      "Audience relevance depends on the actual target viewer, not on generic personalization language.",

    analysisRule:
      "Identify the target audience before judging relevance."

  },


  {
    id:
      "emotional_arousal",

    domain:
      "emotion",

    principle:
      "Emotional arousal",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "emotional_arousal",

    description:
      "Emotionally arousing content can influence attention, memory, and sharing, but effects depend on emotion, context, and intensity.",

    viewerEffect:
      [
        "attention",
        "remember",
        "share"
      ],

    observableSignals:
      [
        "clear emotional expression",
        "emotionally meaningful language",
        "high-stakes consequence",
        "strong emotional transition"
      ],

    misuseWarning:
      "More emotional intensity is not automatically better.",

    analysisRule:
      "Identify emotion type and intensity instead of using a generic 'emotional' label."

  },


  {
    id:
      "narrative_tension",

    domain:
      "narrative",

    principle:
      "Narrative tension",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "narrative_tension",

    description:
      "A meaningful unresolved outcome can motivate continued attention while the viewer anticipates resolution.",

    viewerEffect:
      [
        "continue"
      ],

    observableSignals:
      [
        "unresolved problem",
        "clear goal",
        "anticipated outcome",
        "progress toward resolution"
      ],

    misuseWarning:
      "Artificial suspense without meaningful stakes can feel manipulative and reduce trust.",

    analysisRule:
      "Look for a genuine unresolved outcome, not merely delayed information."

  },


  {
    id:
      "information_gain",

    domain:
      "cognition",

    principle:
      "Information gain",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "information_gain",

    description:
      "New information can maintain interest when it is relevant and sufficiently understandable.",

    viewerEffect:
      [
        "continue",
        "learn",
        "save"
      ],

    observableSignals:
      [
        "new fact",
        "new example",
        "new visual information",
        "progressive explanation"
      ],

    misuseWarning:
      "Constant novelty without coherence can increase cognitive burden.",

    analysisRule:
      "Evaluate both novelty and comprehension."

  },


  {
    id:
      "reward_anticipation",

    domain:
      "reward",

    principle:
      "Reward anticipation",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "reward_anticipation",

    description:
      "Anticipating a desirable informational, emotional, or practical outcome can motivate continued engagement.",

    viewerEffect:
      [
        "continue"
      ],

    observableSignals:
      [
        "clear promised payoff",
        "visible progress",
        "anticipated reveal",
        "expected useful result"
      ],

    misuseWarning:
      "Do not use neuroscience language to claim that a specific editing pattern automatically releases dopamine.",

    analysisRule:
      "Describe observable anticipation rather than inventing neurochemical explanations."

  },


  {
    id:
      "pattern_interrupt",

    domain:
      "attention",

    principle:
      "Pattern interruption",

    evidenceLevel:
      EVIDENCE_LEVELS.HEURISTIC,

    mechanism:
      "pattern_interrupt",

    description:
      "A sudden change in visual, auditory, or structural pattern may redirect attention.",

    viewerEffect:
      [
        "attention",
        "continue"
      ],

    observableSignals:
      [
        "camera movement",
        "scene change",
        "sound change",
        "text change",
        "visual contrast"
      ],

    misuseWarning:
      "There is no universal rule that a pattern interrupt must happen every few seconds.",

    analysisRule:
      "Judge timing and relevance against the video's narrative rather than applying a fixed interval."

  },


  {
    id:
      "message_clarity",

    domain:
      "cognition",

    principle:
      "Message clarity",

    evidenceLevel:
      EVIDENCE_LEVELS.STRONG,

    mechanism:
      "message_clarity",

    description:
      "Clear communication reduces ambiguity and makes the intended message easier to understand.",

    viewerEffect:
      [
        "understand",
        "continue",
        "trust"
      ],

    observableSignals:
      [
        "single dominant idea",
        "clear language",
        "consistent visual message",
        "logical sequencing"
      ],

    misuseWarning:
      "Clarity does not require removing personality, creativity, or complexity that is useful.",

    analysisRule:
      "Judge clarity relative to the intended audience."

  },


  {
    id:
      "credibility",

    domain:
      "trust",

    principle:
      "Credibility and trust",

    evidenceLevel:
      EVIDENCE_LEVELS.MODERATE,

    mechanism:
      "credibility",

    description:
      "Perceived credibility can influence whether viewers accept and act on information.",

    viewerEffect:
      [
        "continue",
        "trust",
        "save",
        "share"
      ],

    observableSignals:
      [
        "specific evidence",
        "consistent claims",
        "transparent framing",
        "credible presentation"
      ],

    misuseWarning:
      "Confident presentation alone does not establish credibility.",

    analysisRule:
      "Separate confidence of delivery from evidence quality."

  }

];


export function getKnowledgeById(
  id
) {

  return KNOWLEDGE_BASE.find(
    item =>
      item.id === id
  ) || null;

}


export function getKnowledgeByDomain(
  domain
) {

  return KNOWLEDGE_BASE.filter(
    item =>
      item.domain === domain
  );

}


export function getKnowledgeByMechanism(
  mechanism
) {

  return KNOWLEDGE_BASE.filter(
    item =>
      item.mechanism === mechanism
  );

}


export function getStrongEvidence() {

  return KNOWLEDGE_BASE.filter(
    item =>
      item.evidenceLevel ===
      EVIDENCE_LEVELS.STRONG
  );

}


export function getModerateEvidence() {

  return KNOWLEDGE_BASE.filter(
    item =>
      item.evidenceLevel ===
      EVIDENCE_LEVELS.MODERATE
  );

}


export function getHeuristics() {

  return KNOWLEDGE_BASE.filter(
    item =>
      item.evidenceLevel ===
      EVIDENCE_LEVELS.HEURISTIC
  );

}


export function getKnowledgeSummary() {

  return {

    version:
      KNOWLEDGE_VERSION,

    total:
      KNOWLEDGE_BASE.length,

    strong:
      getStrongEvidence().length,

    moderate:
      getModerateEvidence().length,

    heuristic:
      getHeuristics().length

  };

}


export default KNOWLEDGE_BASE;
