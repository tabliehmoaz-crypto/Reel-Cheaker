# MTI — Product Intelligence Architecture v1

## هدف إعادة البناء
MTI يجب أن يتصرف كـ Content Intelligence System، وليس كواجهة تقرير أو chatbot.

## الطبقات
1. Capture — video, audio, frames, text, post-publish screenshots.
2. Measure — visual/audio/speech/OCR/performance measurements.
3. Understand — meaning, delivery, pacing, story, psychology, content context.
4. Diagnose — root causes and risk points tied to evidence.
5. Improve — safe edit plans and versioned re-analysis.
6. Predict — local proxy only when evidence is sufficient.
7. Publish — collect observed platform outcomes.
8. Learn — account/Reel learning with sample-size gates.
9. Brain — context-aware explanation, conversation, ideation and decision support.
10. Knowledge — scientific principles, heuristics, niche/platform guidance.

## Data truth model
- measured: direct extraction/calculation.
- inferred: reasoned interpretation.
- predicted: forward-looking proxy.
- learned: repeated observed outcome.

Missing evidence is never converted into a score.

## Speech
Desktop: local Whisper + chunked transcription + timestamps.
Mobile: activity/prosody fallback when Whisper would threaten browser stability.
The UI must expose the mode and diagnostics.

## Post-publish learning
Instagram Insight screenshots are treated as evidence supplied by the creator.
OCR extracts candidate metrics; the creator reviews them before saving.
Saved metrics attach to the exact Reel Version.
Prediction-vs-reality comparison feeds learning.

## Brain
Brain answers are generated from:
- current Reel Room
- latest analysis
- version history
- actual performance
- account learning
- knowledge base
- conversation history

The current local Brain is deliberately evidence-grounded and does not pretend to be a general-purpose LLM.

## Training curriculum
The canonical curriculum lives in `src/ai/MTITrainingManifest.js`.
It defines domains, hard rules, and evidence levels. The scientific/practical knowledge itself lives in the existing knowledge datasets.

## Next engineering gates
- End-to-end browser test on the known Arabic comedy Reel.
- Desktop long-reel Whisper test.
- Mobile speech fallback test.
- Screenshot OCR test with real Instagram Insight images.
- Prediction vs reality persistence test.
- Account isolation test.
- Safari media/decode test.
- Final CI + syntax + runtime tests.
