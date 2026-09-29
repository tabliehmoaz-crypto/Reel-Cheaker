# MTI — Product Goals & Scope

## 1. What MTI is

MTI is a local-first Content Intelligence Platform for short-form video.

It is not:
- a generic chatbot
- a simple Reel score calculator
- a collection of disconnected analyzers
- a wrapper around one external AI model

Its purpose is to understand content, explain why it behaves the way it does, improve it, learn from real outcomes, and carry that knowledge into the user's next content decisions.

## 2. Canonical product loop

Analyze → Understand → Diagnose → Improve → Predict → Publish → Learn → Brain → Create again.

Every stage must connect to the same Reel identity and account context.

## 3. Real content analysis

MTI should perform real local analysis when the browser/device allows it.

Target intelligence areas:
- Hook
- opening attention
- retention signals / attention opportunities
- pacing and rhythm
- scene changes
- visual structure
- motion/change density
- composition
- text/OCR
- audio
- speech/transcript
- Whisper when available
- storytelling
- psychology
- curiosity
- emotional signals
- CTA
- clarity
- viewer friction
- drop-off opportunities
- technical quality

Unavailable measurements must remain unavailable. MTI must never turn missing evidence into fake zeroes.

## 4. Understanding

MTI should turn raw measurements into an interpretation:
- what is happening
- what the viewer is likely being asked to process
- where attention may be won or lost
- what content structure is present
- which observations are measured versus inferred

MTI should distinguish evidence, inference, hypothesis and heuristic.

## 5. Diagnosis

Diagnosis should prioritize the actual problems in a Reel.

For each important issue:
- what is wrong
- evidence
- why it matters
- confidence
- what can be changed

The system should also identify strengths worth preserving.

## 6. Improvement

MTI should produce actionable improvements rather than generic advice.

Examples:
- stronger opening
- remove dead time
- reorder information
- change pacing
- improve visual change
- improve text timing
- strengthen CTA
- change story structure
- test an alternative hook

When an edit is executable, MTI can create an Edit Plan and render a new version.

Original versions must never be overwritten.

## 7. Prediction

Prediction is a local evidence-based estimate.

It can use:
- measured Reel signals
- general content knowledge
- account history
- account learning
- anonymous global aggregates when explicitly enabled

Prediction must expose:
- estimate
- confidence
- evidence
- limitations

Prediction is never presented as actual Instagram analytics.

## 8. Prediction vs Reality

After publication the user can enter real results.

Target metrics:
- views
- likes
- comments
- shares
- saves
- reach
- watch time
- average watch time
- completion rate
- skip rate
- followers gained

MTI compares prediction with reality and stores the difference as learning evidence.

Unknown metrics stay null.

## 9. Account learning

MTI should learn the user's own content patterns.

Examples:
- hooks that repeatedly perform well for this account
- pacing patterns associated with better results
- visual styles
- formats
- durations
- recurring weaknesses
- audience-response patterns

Learning must be evidence-based.

One Reel is an observation, not a rule.
Repeated observations can become candidate patterns.
Stronger patterns require more evidence.

Account learning is private and account-scoped.

## 10. Reel Room

Every Reel has a permanent Reel ID.

A Reel Room is the persistent workspace for that Reel.

It contains:
- Reel identity
- version history
- assets
- analysis results
- predictions
- actual performance
- prediction/reality comparisons
- Reel-scoped learning
- account-learning context
- Brain context
- Reel conversation
- Reel-specific ideas
- edit history
- experiment context

The user should be able to open a Reel later and continue from the same context.

## 11. Versioning

Example:

Reel R1
- V1 — original
- V2 — edited hook
- V3 — pacing experiment

Every version has its own:
- versionId
- asset
- analysis
- prediction
- performance
- comparison

This allows MTI to compare versions instead of losing history.

## 12. Reel conversation

Every Reel has its own persistent conversation.

The conversation should understand:
- the Reel
- current version
- previous versions
- analyses
- diagnosis
- recommendations
- prediction
- actual results
- learning
- ideas
- user notes

The conversation must not mix unrelated Reels.

## 13. MTI Brain

Brain is the reasoning layer over the complete MTI context.

Brain can:
- explain analysis
- discuss a Reel
- challenge an idea
- suggest improvements
- compare versions
- propose experiments
- generate hooks
- develop concepts
- create scripts
- create edit directions
- use account learning
- use Reel history

Brain does not invent measurements and does not replace the real analysis engine.

## 14. Idea Lab

MTI also needs an independent space for immature/raw ideas.

The user can:
- brainstorm
- discuss an idea
- generate variations
- generate hooks
- develop the idea into a script
- choose an angle
- turn the idea into a Reel
- then enter the normal analysis/prediction/learning loop

Ideas in the independent Idea Lab do not become performance-learning evidence until they are actually published and measured.

## 15. Reel-aware idea generation

Once an idea belongs to a Reel, Brain can generate new directions using:
- the Reel's current analysis
- previous versions
- known weaknesses
- previous ideas
- Reel conversation
- account learning
- actual historical performance

Generated ideas are persisted inside the Reel Room.

## 16. Experiments

MTI should support deliberate content experiments.

An experiment can contain:
- hypothesis
- control version
- variant versions
- predictions
- publication information
- actual performance
- comparison
- learning conclusion

This turns MTI from a passive analyzer into an iterative content intelligence system.

## 17. Knowledge

Knowledge has separate layers:
1. general/scientific content knowledge
2. MTI product heuristics
3. private account learning
4. anonymous global learning

They must not be silently merged.

## 18. Global learning

Global learning is optional and privacy-safe.

It must never store:
- account identity
- Google identity
- raw video
- private conversation
- private notes
- identifiable user content

Only explicitly safe anonymous aggregates may be used.

## 19. Local-first constraint

Core functionality should not depend on Gemini, Claude, OpenAI, or any single external model.

The tool must remain useful when:
- external AI is unavailable
- quota is exhausted
- the user is offline
- the user is in an environment where external APIs are unreliable

External intelligence can be considered later only where it creates a substantial accuracy gain without making MTI dependent on it.

## 20. Account isolation

Google/Firebase authentication identifies the account.

Canonical identity:
accountId → reelId → versionId → assetId → analysisId → performanceId.

Private memory, assets, conversations, Reel Rooms and learning must stay inside the authenticated account.

## 21. Mobile

MTI must work on:
- iPhone Safari
- iPhone Chrome
- desktop browsers

Mobile may use lighter real sampling because of browser memory constraints.

It must not switch to fake analysis.

## 22. UI

The product direction remains:
- professional
- dark navy / gold
- minimal
- bilingual Arabic/English
- short clear labels
- no clutter

The UI should expose the intelligence as a workflow rather than a wall of scores.

## 23. Long-term product direction

MTI should eventually become a personal content operating system:

Understand my content
→ remember my history
→ learn what works for me
→ understand why
→ help me create the next idea
→ test it
→ compare reality
→ learn again.

The core differentiator is not one clever score.

It is the persistent loop between:
Content → Evidence → Understanding → Action → Outcome → Learning → Better Content.
