# MTI — System Architecture
## Canonical Engineering Architecture

Target branch: mti-development
Purpose: canonical architecture for the MTI Content Intelligence Platform.
Rule: this document defines ownership and dependency direction. Existing files may be migrated into these responsibilities; no parallel subsystem should silently bypass the canonical path.

## 1. Product model
MTI is a local-first Content Intelligence Platform for short-form video.

Canonical loop:
AUTH → ACCOUNT → REEL/VERSION → ASSET → ANALYZE → UNDERSTAND → DIAGNOSE → IMPROVE → PREDICT → PUBLISH → PERFORMANCE → LEARN → BRAIN → future content.

## 2. Non-negotiable rules
1. One canonical analysis path: UI → MTICore → MTIAnalysisOrchestrator → MTIAnalysisService → AnalysisPipeline → ReelEngineAdapter → ReelEngine → LocalSignalExtractor → LocalIntelligenceEngine → MTIAnalysisResult → ResultValidator → MemoryBridge.
2. One canonical public result: MTIAnalysisResult. AnalysisContract, AnalysisJob and historical result shapes may only exist as internal migration adapters.
3. UI must never use result fallbacks such as run.analysis ?? run.result ?? run.
4. One identity chain: accountId → reelId → versionId → assetId → analysisId → performanceId.
5. Analysis may read memory/learning but must not mutate learning during inference.
6. Missing evidence is null/unavailable with an explicit reason. Unavailable is never zero.
7. Prediction is an estimate, not real Instagram analytics. Actual platform metrics enter through Performance.
8. Private account memory never enters global learning unless explicitly anonymized and aggregated.

## 3. Logical repository structure

src/app/
  MTIApp.js — application composition root
  MTISession.js — auth/session/account state
  MTIWorkspace.js — current account/reel/version context

src/auth/
  googleAuth.js
  googleConfig.js

src/core/
  MTICore.js — public application facade
  MTIConfig.js
  MTIStages.js
  MTIError.js
  MTILogger.js
  EventBus.js

src/identity/
  MTIContentService.js — Reel/version identity
  MTIWorkspaceService.js

src/analysis/
  MTIAnalysisOrchestrator.js
  MTIAnalysisService.js
  AnalysisPipeline.js
  AnalysisJob.js — execution state only
  AnalysisContract.js — input/legacy adapter only
  MTIAnalysisResult.js — canonical result
  MTIResultValidator.js — canonical validation
  EngineAdapter.js
  EngineRegistry.js
  ReelEngineAdapter.js

src/engine/
  reel-engine.js
  LocalSignalExtractor.js
  ExperimentEngine.js

src/intelligence/
  LocalIntelligenceEngine.js
  MTIIntelligenceContext.js
  IntelligenceSchema.js
  IntelligencePrompt.js
  IntelligenceKnowledge.js
  whisper.js

src/diagnosis/
  MTIDiagnosisEngine.js

src/improvement/
  MTIEditPlan.js
  MTIEditEngine.js

src/memory/
  MTIMemoryService.js
  MTIResultMemoryBridge.js
  reel-memory.js
  ReelAssetStore.js

src/performance/
  MTIPerformanceService.js
  MTIPerformanceContract.js
  MTIPredictionRealityService.js

src/learning/
  AccountLearningEngine.js
  GrowthLearningEngine.js — migration source
  learning-engine.js — migration source
  MTIGlobalLearningService.js

src/knowledge/
  MTIKnowledgeService.js
  MTIKnowledgeBase.js
  MTIKnowledgeData.js

src/brain/
  MTIBrain.js
  MTIReelConversationService.js
  IdeaToContentEngine.js

src/privacy/
  MTIPrivacyService.js

tests/
  contracts/
  identity/
  auth/
  analysis/
  memory/
  learning/
  prediction/
  editing/
  integration/

Physical file migration can happen incrementally. Ownership and dependency direction are mandatory.

## 4. Layer ownership
Presentation: renders login, library, analysis, diagnosis, improvement, prediction, performance, learning and Brain. It must not own algorithms, persistence, identity generation, learning calculations or Firebase state.
Application: coordinates user actions and workflows.
Domain/Core: owns canonical contracts, orchestration, identity and business rules.
Engine: owns measurable video/audio signals.
Intelligence: interprets evidence using knowledge and learning snapshots.
Persistence: owns assets, memory, performance and learning storage.
Infrastructure: Firebase, IndexedDB, FFmpeg/server and browser APIs.

## 5. Authentication and session
Canonical auth state machine:
UNKNOWN → RESTORING → AUTHENTICATED / SIGNED_OUT / ERROR.
Firebase/Google auth owns authentication. UI only subscribes to auth state.
Canonical accountId is firebaseUser.uid. Never derive identity from email, display name or random local IDs.
Session object:
status, accountId, provider, user(uid,email,displayName,photoURL).

## 6. Identity model
Reel = logical content project.
Version = concrete content state.
Example: Reel R1 → V1 original → V2 edited hook → V3 new CTA.
Every analysis belongs to exactly one version.
Canonical chain: accountId → reelId → versionId → assetId → analysisId → performanceId.

## 7. Asset model
Asset owns binary media and metadata: assetId, accountId, reelId, versionId, type, mimeType, size, duration, storage, createdAt.
Analysis receives an asset reference/File. Memory stores derived metadata/signals rather than unnecessary binary duplicates.

## 8. Canonical analysis execution
Request contains accountId, reelId, versionId, assetId and options.
Execution:
MTICore.analyze → Orchestrator → AnalysisService → AnalysisPipeline → EngineAdapter → ReelEngine → Signal Extraction → Intelligence → Canonical Result → Validation → Memory Bridge.

Pipeline phases:
1. Metadata — duration, dimensions, FPS, orientation, file size, decode capability.
2. Visual — real frame sampling, scenes, brightness, motion, composition, subject presence, visual change, OCR where available.
3. Audio — presence, energy, silence, speech, transcript and Whisper confidence where available.
4. Temporal — pacing, cuts, scene duration, opening dynamics and rhythm.
5. Understanding — hook, story, CTA, clarity, curiosity, emotion and viewer friction.
6. Intelligence — measured signals + general knowledge + account memory + account learning + global knowledge.
7. Diagnosis — prioritized problems and strengths.
8. Improvement — actionable recommendations and edit plan.
9. Prediction — evidence-based estimate with confidence and limitations.

## 9. Canonical analysis result
Every successful analysis must contain:
schemaVersion, analysisId, identity(accountId/reelId/versionId/assetId), engine(name/version), input(metadata), availability, signals(visual/audio/temporal/text/speech/scenes/hook/story/cta), understanding, diagnosis(issues/strengths/priorities), improvement(recommendations/editPlan), prediction(type/estimate/confidence/evidence/limitations), provenance(measured/inferred/learned/unavailable), timestamps.
UI, Memory, Learning and Brain consume this object.

## 10. Evidence semantics
Important signals should carry value, confidence, source and availability.
Sources: measured, inferred, learned, general_knowledge, unavailable.
This prevents heuristics from being presented as facts.

## 11. Memory architecture
Reel Memory: versions, analyses, edit history, experiments, predictions, actual performance and Reel conversation.
Account Memory: private persistent facts about style, audience, formats, preferences and history.
Account Learning: derived patterns from multiple published Reels.
Global Learning: anonymous aggregated patterns only.

## 12. Learning lifecycle
Analysis → Prediction → Publish → Actual metrics → Prediction vs Reality → Learning observation → Account pattern detection → Account profile update → future prediction context.
Evidence policy: one observation is an observation; two are weak evidence; three or more may form a candidate pattern; five or more can support a stronger account pattern. Exact thresholds can evolve, but one Reel must never become a robust rule.

## 13. Performance contract
Performance contains performanceId, accountId, reelId, versionId, publishedAt, capturedAt, metrics, source and confidence.
Metrics may include views, likes, comments, shares, saves, reach, averageWatchTime, completionRate and follows.
Unknown metrics remain null. Never silently default unknown metrics to zero.

## 14. Prediction vs Reality
Every prediction is linked to predictionId, versionId, prediction, actualPerformance and error.
This enables calibration: MTI can learn where it overpredicts, underpredicts, which signals matter for an account, and which heuristics should lose weight.

## 15. Knowledge architecture
General Knowledge = stable content-science knowledge.
Product Heuristics = MTI-specific rules.
Account Learning = private learned evidence.
Global Learning = anonymous aggregate evidence.
These sources must not be merged into one undocumented knowledge blob.

## 16. MTI Brain
Brain is not another analysis engine.
Brain reasons over: general knowledge + account memory + account learning + global learning + current Reel context + current analysis.
Brain responsibilities: explain findings, answer Reel questions, generate ideas/hooks/scripts, compare alternatives, propose experiments and use account patterns.
Brain must never invent measurements.

## 17. Idea Lab
Idea → audience/context → concept → hook variants → story structure → script → shot/edit plan → optional analysis → experiment.
An idea becomes learning evidence only after publication and measurement.

## 18. Diagnosis
Diagnosis consumes canonical analysis only.
Priority can combine severity × confidence × expected impact × actionability.
Every issue should answer: what is wrong, what evidence shows it, why it matters, what should change, and confidence.

## 19. Improvement/Edit Engine
Analysis → Diagnosis → EditPlan → Validation → FFmpeg/Edit Engine → New Asset → New Version → Re-analysis → V1/V2 comparison.
An edited video never overwrites the original. Every generated edit is a new Version.

## 20. Experiments
Experiment contains hypothesis, controlVersionId, variantVersionIds, predictions, publication data, actual performance and conclusion.
Experiment Engine owns experiment lifecycle. Learning consumes completed evidence.

## 21. Account isolation
Every persistent operation verifies request.accountId === authenticatedSession.accountId.
This applies to memory, assets, reels, versions, experiments, performance, learning and Brain context.
UI-provided account IDs are never trusted without session validation.

## 22. Error architecture
Use typed errors such as AUTH_REQUIRED, AUTH_FAILED, ACCOUNT_CONTEXT_MISSING, ASSET_INVALID, ASSET_DECODE_FAILED, VIDEO_UNSUPPORTED, AUDIO_UNAVAILABLE, ANALYSIS_FAILED, ANALYSIS_CONTRACT_INVALID, ANALYSIS_INCOMPLETE, MEMORY_READ_FAILED, MEMORY_WRITE_FAILED, PERFORMANCE_INVALID, LEARNING_INSUFFICIENT_DATA, EDIT_FAILED and PREDICTION_UNAVAILABLE.
Core services never manipulate UI directly. UI translates domain errors into user-facing messages.

## 23. Observability
Every analysis exposes analysisId, accountId, reelId, versionId, engineVersion, schemaVersion, stage, start/end times, duration, available signals, unavailable signals, warnings and errors.
Long operations emit progress states: queued → loading → decoding → extracting → understanding → diagnosing → predicting → persisting → complete/failed.
This is required to diagnose infinite 0% loading and silent failures.

## 24. Mobile strategy
Mobile is constrained real analysis, not a fake-analysis mode.
If Safari/Chrome cannot measure something, return unavailable with a reason.
Sampling may be reduced, but frames/audio remain real when available.
Expose analysis coverage, for example visual 0.82, audio 1.00, OCR 0.00.

## 25. Versioning
Use independent PRODUCT_VERSION, ENGINE_VERSION, RESULT_SCHEMA_VERSION, MEMORY_SCHEMA_VERSION and LEARNING_SCHEMA_VERSION.
Do not use V4/V5/V5.1 as a generic version label for all layers.

## 26. Dependency direction
Allowed direction: Presentation → Application → Domain/Core → Engines/Services → Persistence/Infrastructure.
Forbidden: Engine → UI; Memory → UI; Learning → UI; Brain → Firebase directly; UI → Engine internals; UI → Memory internals.

## 27. Service ownership
Auth owns Firebase authentication.
Session owns authenticated account context.
Content owns Reel/version identity.
AssetStore owns binary assets.
Orchestrator owns workflow.
AnalysisService owns analysis execution.
ReelEngine owns measurable signals.
Intelligence owns interpretation.
ResultValidator owns result integrity.
Memory owns persistence/history.
Performance owns actual metrics.
AccountLearning owns learned patterns.
GlobalLearning owns anonymous aggregates.
Knowledge owns general evidence.
Diagnosis owns problems/priorities.
EditEngine owns media transformation.
Brain owns reasoning/generation.
UI owns presentation.

## 28. Current duplicate files
Keep as canonical: MTICore, MTIApp, MTIAnalysisOrchestrator, MTIAnalysisService, AnalysisPipeline, ReelEngineAdapter, ReelEngine, LocalSignalExtractor, LocalIntelligenceEngine, MTIAnalysisResult, MTIContentService, ReelAssetStore, MTIMemoryService, MTIResultMemoryBridge, MTIKnowledgeService, MTIGlobalLearningService, MTIBrain, MTIDiagnosisEngine, MTIEditPlan, MTIEditEngine and ExperimentEngine.
Convert to migration adapters/sources: AnalysisContract, AnalysisJob, learning-engine.js and GrowthLearningEngine.js. They must not remain competing public APIs.
Knowledge consolidation: IntelligenceKnowledge, MTIKnowledgeBase and MTIKnowledgeData are separated by responsibility and exposed through MTIKnowledgeService.

## 29. Required end-to-end flows
First analysis: Google login → session → account → create Reel → create V1 → save asset → analyze V1 → validate → persist → render.
Improve: V1 analysis → diagnosis → edit plan → render V2 → save V2 → analyze V2 → compare.
Learn: V1 analysis → prediction → publish → actual metrics → prediction/reality → observation → account learning.
Brain: user question → current Reel context → analysis → account memory → account learning → knowledge → Brain → answer/action.
Idea to Reel: Idea Lab → concept → hooks → script → edit plan → Reel → V1 → analysis → prediction → publish → learn.

## 30. Definition of complete
A feature is complete only when its contract, owner, input validation, output validation, persistence path, UI path, error path, account isolation and tests exist, and its end-to-end flow works.

## 31. Completion gates
Static integrity: imports resolve, exports resolve, no syntax errors, no dead canonical services.
Contract integrity: canonical result validates and unavailable is never zero.
Auth integrity: Google login, redirect/popup completion, restoration, logout and account isolation.
Analysis integrity: real video, real frames, real audio when available, transcript when available, no fake analysis.
Persistence integrity: Reel, Version, Asset, Analysis, Experiment and Performance.
Learning integrity: performance input, prediction/reality, account learning and thresholds.
Brain integrity: account context, learning context, knowledge context and Reel context.
Mobile integrity: Safari, iPhone Chrome, reduced sampling and explicit unavailable signals.
Editing integrity: preserve V1, create V2, re-analyze V2 and compare.
Regression integrity: automated tests, CI, browser smoke tests, and no changes to main or v2-offline-engine.

## 32. Migration strategy
Phase 1 Contracts: canonical result, validator, identity, performance and prediction contracts.
Phase 2 Session: one auth owner, session coordinator and account isolation.
Phase 3 Analysis: remove UI result fallback, canonical orchestrator path, engine boundary and availability semantics.
Phase 4 Memory: canonical memory API, Reel memory, Account memory and result persistence.
Phase 5 Learning: performance input, prediction/reality, AccountLearningEngine and global boundary.
Phase 6 Brain: unified context snapshot, account learning, knowledge, Reel conversation and Idea Lab.
Phase 7 Editing: diagnosis, edit plan, render, new version and re-analysis.
Phase 8 UI: UI becomes a consumer of canonical domain contracts rather than owning application logic.

## 33. Canonical dependency map
AUTH → SESSION/ACCOUNT → REEL/VERSION → ASSET/EXPERIMENT → ANALYSIS → REAL ENGINE → INTELLIGENCE → CANONICAL RESULT.
Canonical Result branches to DIAGNOSIS → IMPROVEMENT → NEW VERSION → RE-ANALYSIS, and to PREDICTION → PUBLISH → PERFORMANCE → LEARNING → BRAIN.
Brain closes the loop by feeding account-aware context into future content decisions.

## 34. Architectural objective
MTI is not complete because many smart files exist.
The target is one coherent system where every input has an owner; every output has a contract; every ID has one source of truth; every measurement has provenance; every prediction has limitations; every learning event has evidence; every private datum has an account boundary; every edit creates a new version; every Brain answer has context; and every UI result comes from the same canonical pipeline.