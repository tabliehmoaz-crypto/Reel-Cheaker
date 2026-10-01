/* MTI Training Manifest
   This is the curriculum contract for local reasoning.
   It defines what MTI is expected to understand and how evidence
   must be separated from inference, prediction and learned signals.
*/
export const MTI_TRAINING_MANIFEST = {
  version: "1.0.0",
  principle: "Evidence first. Inference second. Prediction third. Learning only from observed outcomes.",
  domains: [
    { id:"attention", label:"Attention", teaches:["opening signals","pattern interruption","information gaps","visual salience","timing"] },
    { id:"hook", label:"Hook", teaches:["direct benefit","curiosity","contrarian","story","question","problem","transformation","confession","prediction error","self relevance","novelty"] },
    { id:"speech", label:"Speech Intelligence", teaches:["transcription","timestamps","speech density","pauses","delivery","prosody","energy","pitch","final pause","payoff pause"] },
    { id:"storytelling", label:"Storytelling", teaches:["setup","tension","open loop","progression","payoff","resolution","comedy timing","before after","claim proof"] },
    { id:"pacing", label:"Pacing", teaches:["cuts","scene changes","temporal density","monotony","rhythm","silence as timing"] },
    { id:"visual", label:"Visual Intelligence", teaches:["brightness","contrast","saturation","frame changes","subject clarity","visual emphasis","attention map"] },
    { id:"audio", label:"Audio Intelligence", teaches:["RMS","silence ratio","dynamism","speech presence","voice signal"] },
    { id:"psychology", label:"Viewer Psychology", teaches:["curiosity","cognitive load","processing fluency","emotional salience","self relevance","identification","surprise"] },
    { id:"diagnosis", label:"Diagnosis", teaches:["root cause","risk points","evidence-linked recommendations","limitations"] },
    { id:"improve", label:"Improve", teaches:["safe edit operations","time-local edits","versioning","re-analysis"] },
    { id:"prediction", label:"Prediction", teaches:["local proxy","confidence","insufficient evidence","account calibration","prediction vs reality"] },
    { id:"learning", label:"Learning", teaches:["account memory","reel memory","sample-size gating","outcome observation","calibration"] },
    { id:"knowledge", label:"Knowledge", teaches:["scientific principles","evidence levels","heuristics","niche guidance","platform context"] },
    { id:"brain", label:"Brain", teaches:["reel context","conversation","knowledge retrieval","analysis explanation","idea generation","context-aware reasoning"] },
    { id:"publish", label:"Post-Publish Intelligence", teaches:["insight screenshot reading","metric extraction","actual performance","prediction error","learning feedback"] }
  ],
  evidenceLevels: {
    measured: "Directly extracted or calculated from the current Reel or supplied performance data.",
    inferred: "Reasoned interpretation from measured signals; must be labeled as inference.",
    predicted: "Forward-looking proxy; never presented as platform retention or guaranteed performance.",
    learned: "Pattern supported by repeated observed outcomes; single-Reel observations do not become strong account rules."
  },
  hardRules: [
    "Never turn missing evidence into a numeric score.",
    "Never call platform retention available unless real platform data was supplied.",
    "Never classify a pause as a drop-off from silence alone.",
    "Never learn a strong account rule from one Reel.",
    "Every recommendation should point back to evidence or a documented knowledge mechanism.",
    "Long-form speech must preserve timestamps and chunk boundaries.",
    "Mobile limitations must be visible instead of silently pretending transcription succeeded."
  ]
};

export function getMTITrainingManifest() {
  return JSON.parse(JSON.stringify(MTI_TRAINING_MANIFEST));
}

export default MTI_TRAINING_MANIFEST;