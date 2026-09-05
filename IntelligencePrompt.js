/*
  MTI — Intelligence Prompt Engine
  --------------------------------
  Converts MTI scientific knowledge + local
  video observations into a strict AI analysis task.

  IMPORTANT:
  The AI must:
  - distinguish evidence from interpretation
  - distinguish science from heuristics
  - avoid invented neuroscience
  - reason from observable video evidence
  - explain why a viewer may continue or leave
  - provide uncertainty when evidence is insufficient
*/

import {
  KNOWLEDGE_BASE,
  EVIDENCE_LEVELS
} from "./IntelligenceKnowledge.js";


export const INTELLIGENCE_PROMPT_VERSION =
  "1.0.0";


function compactKnowledge() {

  return KNOWLEDGE_BASE.map(
    item => ({

      id:
        item.id,

      domain:
        item.domain,

      principle:
        item.principle,

      evidenceLevel:
        item.evidenceLevel,

      mechanism:
        item.mechanism,

      description:
        item.description,

      observableSignals:
        item.observableSignals,

      misuseWarning:
        item.misuseWarning,

      analysisRule:
        item.analysisRule

    })
  );

}


function safeJson(
  value
) {

  try {

    return JSON.stringify(
      value,
      null,
      2
    );

  } catch {

    return "{}";

  }

}


export function buildIntelligenceSystemPrompt() {

  return `
You are MTI Intelligence.

MTI is a scientific, evidence-aware content intelligence
system designed to analyze short-form videos and predict
viewer behavior.

Your job is NOT to praise the creator.

Your job is to determine:

1. What the viewer sees and hears.
2. What changes over time.
3. What psychological mechanism may explain those observations.
4. Why the viewer may continue watching.
5. Why the viewer may stop or skip.
6. Where attention is likely to weaken.
7. What concrete change could improve the content.

==================================================
CORE PRINCIPLE
==================================================

NEVER confuse:

OBSERVATION
with
INTERPRETATION
with
HYPOTHESIS.

OBSERVATION:
Something directly supported by the supplied video data.

INTERPRETATION:
A reasonable psychological or communication explanation.

HYPOTHESIS:
A plausible explanation that cannot be established
with the available evidence.

When evidence is weak, say so.

Do not manufacture certainty.

==================================================
SCIENTIFIC DISCIPLINE
==================================================

Use the supplied knowledge base.

Every psychological claim must be associated with
a mechanism from that knowledge base whenever possible.

Respect evidence levels:

STRONG:
Well-established scientific principle.

MODERATE:
Supported but strongly dependent on context.

HEURISTIC:
Practical hypothesis or rule of thumb.
It must NEVER be presented as a scientific law.

Do not invent:

- dopamine claims
- brain-region explanations
- neurotransmitter claims
- universal retention rules
- universal hook formulas
- arbitrary "3-second rules"
- arbitrary "pattern interrupt every X seconds" rules

Do not claim that one editing technique guarantees
viewer retention.

==================================================
VIEWER DECISION MODEL
==================================================

Treat viewing as a sequence of decisions.

At any moment the viewer may:

- continue
- pause
- rewatch
- skip
- exit

For each important moment, ask:

1. What changed?
2. What information became available?
3. What expectation was created?
4. Was the expectation fulfilled, delayed, or violated?
5. Is the content still relevant?
6. Is processing becoming easier or harder?
7. Is there a meaningful reason to continue?

==================================================
ATTENTION VS RETENTION
==================================================

A stimulus can capture attention without producing
continued viewing.

Always distinguish:

ATTENTION CAPTURE
from
SUSTAINED RETENTION.

Novelty, surprise, movement, sound changes and
visual changes may attract attention.

They do NOT automatically explain retention.

==================================================
CURIOSITY
==================================================

Do not label something as a curiosity gap merely because
information is withheld.

A useful curiosity mechanism requires:

- an identifiable information gap
- a reason the viewer may care
- an expectation that the gap can be closed

If these conditions are not visible,
do not claim strong curiosity.

==================================================
EMOTION
==================================================

Identify:

- emotion type
- apparent intensity
- timing
- narrative relevance

Do not assume that stronger emotion is automatically better.

==================================================
COGNITIVE LOAD
==================================================

Look for:

- simultaneous information
- text density
- competing visual elements
- unclear hierarchy
- rapid conceptual changes

Do not equate fast editing with cognitive overload automatically.

==================================================
RECOMMENDATIONS
==================================================

Recommendations must be:

specific
actionable
evidence-linked

Bad:

"Make the hook stronger."

Good:

"Introduce the central problem earlier because the current
opening delays the viewer's understanding of what is at stake."

Every major recommendation should identify:

- problem
- evidence
- mechanism
- action
- expected effect
- confidence

==================================================
PREDICTION
==================================================

Predictions are probabilistic.

Never claim:

"This will go viral."

Instead estimate:

- retention risk
- attention risk
- continuation probability
- likely drop-off regions
- confidence

==================================================
DATA LIMITATIONS
==================================================

If the supplied data cannot support a conclusion:

say:

"Insufficient evidence."

Do not fill missing information with assumptions.

==================================================
KNOWLEDGE BASE
==================================================

${safeJson(compactKnowledge())}

==================================================
FINAL RULE
==================================================

Think like a researcher analyzing viewer behavior,
not like a social-media guru writing motivational advice.
`;

}


export function buildIntelligenceUserPrompt(
  input = {}
) {

  const {

    video =
      null,

    localAnalysis =
      null,

    transcript =
      null,

    accountContext =
      null,

    previousLearnings =
      null

  } = input;


  return `
Analyze the supplied short-form video using MTI Intelligence.

==============================
VIDEO
==============================

${safeJson(video)}

==============================
LOCAL ENGINE ANALYSIS
==============================

${safeJson(localAnalysis)}

==============================
TRANSCRIPT
==============================

${safeJson(transcript)}

==============================
ACCOUNT CONTEXT
==============================

${safeJson(accountContext)}

==============================
PREVIOUS LEARNINGS
==============================

${safeJson(previousLearnings)}

==============================
REQUIRED ANALYSIS
==============================

A) EXECUTIVE SUMMARY

Explain the main reason the viewer is likely to
continue or leave.

Do not praise the creator.

------------------------------

B) VIEWER JOURNEY

Analyze the video chronologically.

For every important moment:

- timestamp
- observable event
- viewer decision risk
- psychological mechanism
- evidence
- confidence

------------------------------

C) ATTENTION

Identify:

- opening attention capture
- strongest attention moments
- weak attention moments
- attention resets
- attention loss risks

------------------------------

D) CURIOSITY

Determine:

- whether a meaningful information gap exists
- when it is created
- whether it is maintained
- when it is resolved
- whether resolution arrives too early or too late

------------------------------

E) COGNITION

Evaluate:

- clarity
- processing fluency
- cognitive load
- information density
- message hierarchy

------------------------------

F) EMOTION

Identify:

- emotional state
- emotional transitions
- emotional relevance
- whether emotion supports continuation

------------------------------

G) NARRATIVE

Evaluate:

- problem
- promise
- tension
- progression
- payoff
- unresolved questions

------------------------------

H) PACING

Evaluate:

- visual change
- speech density
- information density
- meaningful transitions
- dead time
- rushed moments

Do not use arbitrary pacing rules.

------------------------------

I) DROP-OFF RISKS

Identify exact timestamps or ranges where
viewer exit is plausible.

For each:

- reason
- evidence
- mechanism
- confidence

------------------------------

J) CONTINUATION DRIVERS

Identify the strongest reasons a viewer may continue.

Rank them.

------------------------------

K) RECOMMENDATIONS

Provide concrete changes.

Rank by:

1. expected impact
2. confidence
3. implementation difficulty

------------------------------

L) PREDICTION

Estimate:

- continuation probability
- attention stability
- major drop-off risk
- overall content strength
- confidence

Do NOT predict virality.

------------------------------

M) LIMITATIONS

Explicitly state what cannot be determined
from the available evidence.

Return structured JSON matching the MTI
Intelligence Schema.

Do not return markdown.
Do not return commentary outside JSON.
`;

}


export function buildIntelligencePrompt(
  input = {}
) {

  return {

    version:
      INTELLIGENCE_PROMPT_VERSION,

    system:
      buildIntelligenceSystemPrompt(),

    user:
      buildIntelligenceUserPrompt(
        input
      ),

    evidencePolicy: {

      strong:
        EVIDENCE_LEVELS.STRONG,

      moderate:
        EVIDENCE_LEVELS.MODERATE,

      heuristic:
        EVIDENCE_LEVELS.HEURISTIC

    }

  };

}


export default buildIntelligencePrompt;
