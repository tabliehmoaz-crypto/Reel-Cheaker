# MTI Engineering Audit — mti-development

## Scope
This audit targets **mti-development only**. It does not treat `main` or `v2-offline-engine` as the active MTI product branch.

## Current architecture observed

Browser UI (`index.html`)
→ Google/Firebase Auth
→ canonical Reel identity (`MTIContentService`)
→ `MTICore`
→ `MTIAnalysisOrchestrator`
→ `MTIAnalysisService`
→ `AnalysisPipeline`
→ `ReelEngineAdapter`
→ `ReelEngine`
→ `LocalSignalExtractor`
→ `MTIIntelligenceContext`
→ `LocalIntelligenceEngine`
→ `MTIAnalysisResult`
→ `MTIResultMemoryBridge`
→ `MTIMemoryService`
→ `reel-memory`

Parallel layers:
- `MTIKnowledgeService` / `IntelligenceKnowledge`
- `MTIGlobalLearningService`
- `MTIBrain`
- `MTIContentService` / Reel + Version identity
- `ReelAssetStore` / IndexedDB
- `MTI Diagnosis/Edit` + server FFmpeg renderer

## Findings

### P0 — Contract duplication
There are multiple historical contracts around analysis/results:
- `AnalysisContract`
- `AnalysisJob`
- `MTIAnalysisResult`
- legacy engine result shapes
- UI fallbacks that accept `run.analysis`, `run.result`, or `run`

This is a major source of silent shape drift. MTI needs one canonical result contract and explicit adapters at boundaries.

### P0 — Engine boundary must be single-path
The intended path is Core → Orchestrator → AnalysisService → Pipeline → ReelEngineAdapter → ReelEngine → LocalSignalExtractor → Intelligence → Result.
The UI currently contains compatibility fallbacks and historical naming. These must be reduced to one canonical boundary after the contract is stabilized.

### P0 — Prediction is currently a heuristic proxy
The Local Intelligence engine explicitly produces `retentionEstimate` as a local heuristic proxy. It is not platform retention and must remain clearly separated from actual Instagram performance.
Personal learning is only available after a minimum sample and is currently used as context rather than as a trained predictive model.

### P0 — Learning has multiple generations
The repository contains:
- private account memory in `reel-memory.js`
- `learning-engine.js`
- `GrowthLearningEngine.js`
- `MTIGlobalLearningService`
- result-to-memory bridge

These layers overlap conceptually. They need explicit ownership:
1. private account memory = canonical persisted facts
2. account learning = derived patterns from that account
3. global learning = anonymous aggregate knowledge only
4. intelligence = consumes snapshots; does not mutate learning during inference

### P0 — Google Auth is split between bootstrap and module
`index.html` manually binds the Google button and separately observes auth state, while `googleAuth.js` also exposes a complete high-level initializer. This duplicates responsibility and makes mobile/redirect behavior harder to reason about.
Auth needs one bootstrap owner and one state machine.

### P1 — Account isolation needs one authoritative source
Memory uses an account-scoped localStorage key, while IndexedDB assets use accountId metadata. Both are correct in intent, but there is no single account-session coordinator enforcing the same account identity across Auth, Memory, Content, Asset Store and Analysis.

### P1 — Reel/Version identity is split across UI + Experiment Engine
The UI creates the Reel/Version, then the orchestrator can also create an Experiment if an experimentId is missing. This is protected by current options, but the architecture should make duplicate creation impossible by contract.

### P1 — Edit pipeline is separate from analysis contract
Diagnosis → EditPlan → FFmpeg is structurally sensible, but it needs explicit version linkage: source version → edit plan → generated V2 asset → V2 analysis → prediction-vs-reality chain.

### P1 — Knowledge is split into legacy and general knowledge
The context layer combines `IntelligenceKnowledge` and `MTIKnowledgeBase`. This is useful, but the distinction must be formal:
- scientific/evidence knowledge
- product heuristics
- anonymous global learning
- personal account learning

No layer should masquerade as another.

### P1 — Browser-only runtime limits are real
Local frame/audio/Whisper analysis depends on browser decoding capabilities. Mobile uses a reduced real-frame sample. This is acceptable only if the result contract records exactly which measurements were available and the UI never converts unavailable signals into zeros.

### P2 — Version naming drift
Files and comments contain V4/V5/V5.1 identifiers simultaneously. Product version, engine version, result schema version, and memory schema version need separate explicit version constants.

## Target architecture

### 1. Single source of truth
`MTIContract` owns:
- result schema
- identity schema
- stage/status enums
- capability declarations
- error envelope
- evidence/measurement semantics

### 2. Single analysis pipeline
`UI → MTICore → Orchestrator → AnalysisService → Pipeline → ReelEngine → Local Signals → Intelligence → Result Validator → Memory`

No UI analysis fallback and no parallel engine path.

### 3. Three memory layers
- **Private Memory:** account-owned raw facts and reel history.
- **Account Learning:** derived patterns from verified account performance.
- **Global Learning:** anonymous aggregates only.

Inference reads snapshots. Learning writes only through explicit learning operations.

### 4. One identity chain
`accountId → reelId → versionId → assetId → analysisResultId → performanceId`

Every persisted artifact must carry the relevant identity.

### 5. Evidence-first intelligence
Every important recommendation/prediction must identify:
- measured evidence
- inference/mechanism
- confidence
- limitation
- whether it came from personal learning, general knowledge, or heuristic rules.

### 6. Auth state machine
`UNKNOWN → RESTORING → AUTHENTICATED / SIGNED_OUT / ERROR`

Only the Auth module changes auth state. UI only renders it.

### 7. Validation gates
No result reaches the UI or memory unless:
- identity is valid
- local measurements are internally consistent
- intelligence schema validates
- prediction has an explicit estimate type
- unavailable measurements are represented as unavailable, not zero
- account/reel/version ownership matches

## Required verification gates before MTI is called stable

1. Static module/import audit.
2. Syntax audit for every JS module.
3. Contract tests.
4. Memory isolation tests.
5. Reel/version identity tests.
6. Auth bootstrap/state tests where browser Firebase is available.
7. Real browser smoke test:
   - Google sign-in
   - upload
   - real frame extraction
   - audio extraction
   - intelligence
   - prediction
   - memory persistence
   - reload/session restore
   - second account isolation
8. Real V1 → Improve → V2 → re-analysis flow.
9. Prediction vs actual-performance learning flow.
10. Mobile Safari smoke test.

## Non-negotiable rule
A missing connection, placeholder engine, schema mismatch, duplicate memory path, or UI fallback is a **release blocker**, not a follow-up cleanup item.
