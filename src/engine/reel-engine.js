/*
  MTI — LOCAL ANALYSIS ENGINE
  ---------------------------
  Local-first analysis engine.

  يحلل:
  - الفيديو تقنياً
  - الإطارات بصرياً
  - التغيرات الزمنية
  - أول 3 ثوانٍ
  - نقاط التغير المحتملة
  - الصوت/الكلام عبر Whisper عند توفره
  - المعرفة العامة/العلمية عند توفرها

  مهم:
  - لا Gemini
  - لا Claude
  - لا API خارجي
  - Knowledge لا يستبدل التحليل المحلي
  - Knowledge يفسر ويثري نتائج التحليل
  - فشل Knowledge لا يسقط تحليل الفيديو
*/

import { transcribeVideo } from "../ai/whisper.js";

import {
  knowledgeService
} from "../core/MTIKnowledgeService.js";



const ENGINE_VERSION =
  "3.1-local-first-knowledge";



export async function analyzeReel(
  file,
  options = {}
) {

  if (!file) {
    throw new Error("لم يتم اختيار فيديو");
  }

  if (
    !file.type ||
    !file.type.startsWith("video/")
  ) {
    throw new Error("الملف المختار ليس فيديو");
  }


  const video =
    await loadVideo(file);


  const metadata = {

    name:
      file.name,

    size:
      file.size,

    type:
      file.type,

    duration:
      round(
        video.duration,
        2
      ),

    width:
      video.videoWidth,

    height:
      video.videoHeight,

    aspectRatio:
      calculateAspectRatio(
        video.videoWidth,
        video.videoHeight
      )

  };



  /*
    --------------------------------------------------
    1. استخراج الإطارات
    --------------------------------------------------
  */

  const timestamps =
    buildTimestamps(
      video.duration
    );


  const frames = [];


  for (
    const time
    of timestamps
  ) {

    const frame =
      await captureFrame(
        video,
        time
      );


    if (frame) {

      frames.push(
        frame
      );

    }

  }



  /*
    --------------------------------------------------
    2. التحليل البصري
    --------------------------------------------------
  */

  const visual =
    analyzeFrames(
      frames
    );



  /*
    --------------------------------------------------
    3. الإيقاع
    --------------------------------------------------
  */

  const pacing =
    analyzePacing(
      frames,
      video.duration
    );



  /*
    --------------------------------------------------
    4. الـ Hook
    --------------------------------------------------
  */

  const hook =
    analyzeHook(
      frames,
      video.duration
    );



  /*
    --------------------------------------------------
    5. التحليل التقني
    --------------------------------------------------
  */

  const technical =
    analyzeTechnical(
      metadata
    );



  /*
    --------------------------------------------------
    6. تحليل الكلام
    --------------------------------------------------

    إذا فشل Whisper لا نسقط التحليل كله.
  */

  let speech = {

    available:
      false,

    text:
      "",

    segments:
      [],

    wordCount:
      0,

    error:
      null

  };


  if (
    options.transcribe !== false
  ) {

    try {

      speech =
        await transcribeVideo(
          file,
          {
            language:
              options.language ||
              "ar"
          }
        );


      speech.available =
        true;


    } catch (error) {

      speech = {

        available:
          false,

        text:
          "",

        segments:
          [],

        wordCount:
          0,

        error:
          error?.message ||
          "تعذر تحليل الصوت"

      };

    }

  }



  /*
    --------------------------------------------------
    7. تحليل الكلام والـ Hook
    --------------------------------------------------
  */

  const speechAnalysis =
    analyzeSpeech(
      speech,
      video.duration
    );



  /*
    --------------------------------------------------
    8. نقاط الهروب المحتملة
    --------------------------------------------------
  */

  const dropOff =
    detectDropOffPoints(
      frames,
      pacing,
      speech,
      video.duration,
      hook
    );



  /*
    --------------------------------------------------
    9. تحليل الفكرة
    --------------------------------------------------
  */

  const idea =
    analyzeIdea(
      speech,
      video.duration
    );



  /*
    --------------------------------------------------
    9-ج. جوهر الكلام (Idea Gist)
    --------------------------------------------------
  */

  const ideaGist =
    extractIdeaGist(
      speech
    );



  /*
    --------------------------------------------------
    9-ب. تحليل CTA (دعوة لاتخاذ إجراء)
    --------------------------------------------------
  */

  const cta =
    analyzeCTA(
      speech,
      video.duration
    );



  /*
    --------------------------------------------------
    9-د. تصنيف نوع المحتوى
    --------------------------------------------------
  */

  const contentType =
    classifyContentType(
      speech,
      options.nicheId
    );



  /*
    --------------------------------------------------
    9-هـ. المشاهد وخريطة الانتباه
    --------------------------------------------------
  */

  const scenes =
    buildScenes(
      frames,
      video.duration
    );


  const attentionMap =
    buildAttentionMap(
      scenes,
      dropOff,
      hook,
      cta
    );



  /*
    --------------------------------------------------
    10. الدرجات
    --------------------------------------------------
  */

  const scores = {

    hook:
      hook.score,

    pacing:
      pacing.score,

    visual:
      visual.score,

    technical:
      technical.score,

    speech:
      speechAnalysis.score,

    idea:
      idea.score

  };


  const overall =
    calculateOverall(
      scores
    );



  /*
    --------------------------------------------------
    11. التشخيص
    --------------------------------------------------
  */

  const diagnosis =
    buildDiagnosis({
      metadata,
      hook,
      pacing,
      visual,
      technical,
      speechAnalysis,
      idea,
      cta,
      dropOff
    });



  /*
    --------------------------------------------------
    12. التوصيات الأساسية
    --------------------------------------------------
  */

  const recommendations =
    buildRecommendations({
      metadata,
      hook,
      pacing,
      visual,
      technical,
      speechAnalysis,
      idea,
      cta,
      dropOff
    });



  /*
    --------------------------------------------------
    12-أ. ترتيب أولوية التوصيات
    --------------------------------------------------
  */

  const recommendationPriority =
    prioritizeRecommendations(
      recommendations.changes,
      scores
    );



  /*
    --------------------------------------------------
    12-ب. الملخص البشري
    --------------------------------------------------

    فقرة واحدة، بلغة طبيعية، توضح "شو صار بالفيديو"
    ككل — بدل ما يضطر المستخدم يجمّع الصورة بنفسه
    من أرقام متفرقة.
  */

  const summary =
    buildHumanSummary({
      scores,
      overall,
      hook,
      idea,
      ideaGist,
      cta,
      dropOff,
      duration:
        video.duration
    });



  /*
    --------------------------------------------------
    13. KNOWLEDGE CONTEXT
    --------------------------------------------------

    هون صار الربط الفعلي مع Knowledge Layer.

    المعرفة لا تعيد تحليل الفيديو من الصفر.
    هي تستقبل الإشارات الناتجة عن المحرك
    وتبحث عن المعرفة ذات الصلة بها.

    إذا فشل Knowledge:
    التحليل الأساسي يستمر بشكل طبيعي.
  */

  const knowledge =
    buildKnowledgeContext({

      metadata,

      scores,

      overall,

      hook,

      pacing,

      visual,

      technical,

      speechAnalysis,

      idea,

      dropOff,

      options

    });



  /*
    --------------------------------------------------
    14. KNOWLEDGE-ENRICHED DIAGNOSIS
    --------------------------------------------------

    لا نغيّر التشخيص المحلي.
    نضيف تفسيراً مبنياً على المعرفة فقط.
  */

  const knowledgeDiagnosis =
    buildKnowledgeDiagnosis(
      knowledge
    );



  /*
    --------------------------------------------------
    15. KNOWLEDGE-ENRICHED RECOMMENDATIONS
    --------------------------------------------------
  */

  const knowledgeRecommendations =
    buildKnowledgeRecommendations(
      knowledge
    );



  /*
    --------------------------------------------------
    FINAL RESULT
    --------------------------------------------------
  */

  return {

    version:
      ENGINE_VERSION,

    createdAt:
      new Date()
        .toISOString(),


    video: {

      file: {

        name:
          metadata.name,

        size:
          metadata.size,

        sizeFormatted:
          formatBytes(
            metadata.size
          ),

        type:
          metadata.type

      },


      dimensions: {

        duration:
          metadata.duration,

        width:
          metadata.width,

        height:
          metadata.height,

        aspectRatio:
          metadata.aspectRatio

      }

    },


    scores,

    overall,


    hook,

    pacing,

    visual,

    technical,


    speech: {

      available:
        speech.available,

      text:
        speech.text,

      segments:
        speech.segments,

      wordCount:
        speech.wordCount,

      analysis:
        speechAnalysis

    },


    idea,

    ideaGist,

    cta,

    contentType,

    dropOff,

    scenes,

    attentionMap,


    diagnosis,

    summary,


    recommendations,

    recommendationPriority,


    /*
      Knowledge Layer
    */

    knowledge: {

      available:
        knowledge.available,

      version:
        knowledge.version,

      relevantKnowledge:
        knowledge.relevantKnowledge,

      evidencePolicy:
        knowledge.evidencePolicy,

      diagnosis:
        knowledgeDiagnosis,

      recommendations:
        knowledgeRecommendations,

      source:
        "MTIKnowledgeService",

      localFirst:
        true,

      externalAI:
        false,

      externalAPI:
        false,

      error:
        knowledge.error

    }

  };

}


/* =====================================================
   KNOWLEDGE CONTEXT
===================================================== */

function buildKnowledgeContext({
  metadata,
  scores,
  overall,
  hook,
  pacing,
  visual,
  technical,
  speechAnalysis,
  idea,
  dropOff,
  options
}) {

  const fallback = {

    available:
      false,

    version:
      null,

    relevantKnowledge:
      [],

    evidencePolicy:
      null,

    error:
      null

  };


  try {

    if (
      !knowledgeService ||
      typeof knowledgeService
        .buildAnalysisContext !==
        "function"
    ) {

      return {

        ...fallback,

        error:
          "Knowledge Service غير متوفر"

      };

    }


    /*
      نحول نتائج التحليل إلى Signals
      قابلة للبحث داخل Knowledge Base.
    */

    const signals = {

      engine:
        ENGINE_VERSION,

      duration:
        metadata.duration,

      aspectRatio:
        metadata.aspectRatio,

      overall,

      scores: {

        hook:
          scores.hook,

        pacing:
          scores.pacing,

        visual:
          scores.visual,

        technical:
          scores.technical,

        speech:
          scores.speech,

        idea:
          scores.idea

      },


      hook: {

        score:
          hook.score,

        risk:
          hook.risk,

        observations:
          hook.observations

      },


      pacing: {

        score:
          pacing.score,

        changeRate:
          pacing.changeRate,

        assessment:
          pacing.assessment

      },


      visual: {

        score:
          visual.score,

        averageBrightness:
          visual.averageBrightness,

        averageContrast:
          visual.averageContrast,

        averageSaturation:
          visual.averageSaturation,

        visualVariation:
          visual.visualVariation

      },


      technical: {

        score:
          technical.score,

        observations:
          technical.observations

      },


      speech: {

        score:
          speechAnalysis.score,

        available:
          speechAnalysis.available,

        wordsPerSecond:
          speechAnalysis.wordsPerSecond,

        observations:
          speechAnalysis.observations

      },


      idea: {

        score:
          idea.score,

        confidence:
          idea.confidence,

        reason:
          idea.reason

      },


      dropOff: {

        count:
          dropOff.length,

        points:
          dropOff.map(
            point => ({

              time:
                point.time,

              type:
                point.type,

              confidence:
                point.confidence,

              reason:
                point.reason

            })
          )

      },


      /*
        نضيف السياق النصي المتوفر
        حتى يستطيع Knowledge Service
        ربطه بالمبادئ المناسبة.
      */

      language:
        options?.language ||
        "ar",

      niche:
        options?.niche ||
        null,

      platform:
        options?.platform ||
        "reels",

      audience:
        options?.audience ||
        null

    };


    const context =
      knowledgeService
        .buildAnalysisContext(
          signals,
          {
            includeScientific:
              true,

            includeGlobal:
              true
          }
        );


    return {

      available:
        true,

      version:
        context.version ||
        null,

      relevantKnowledge:
        Array.isArray(
          context.relevantKnowledge
        )
          ? context.relevantKnowledge
          : [],

      evidencePolicy:
        context.evidencePolicy ||
        null,

      error:
        null

    };

  } catch (error) {

    return {

      ...fallback,

      error:
        error?.message ||
        "تعذر تحميل Knowledge Context"

    };

  }

}


/* =====================================================
   KNOWLEDGE DIAGNOSIS
===================================================== */

function buildKnowledgeDiagnosis(
  knowledge
) {

  if (
    !knowledge?.available
  ) {

    return [];

  }


  const items =
    Array.isArray(
      knowledge.relevantKnowledge
    )
      ? knowledge.relevantKnowledge
      : [];


  return items
    .slice(
      0,
      8
    )
    .map(
      item => ({

        id:
          item.id ||
          null,

        domain:
          item.domain ||
          null,

        mechanism:
          item.mechanism ||
          null,

        principle:
          item.principle ||
          null,

        explanation:
          item.description ||
          item.viewerEffect ||
          null,

        evidenceLevel:
          item.evidenceLevel ||
          item.evidence ||
          "heuristic"

      })
    )
    .filter(
      item =>
        item.id ||
        item.explanation
    );

}


/* =====================================================
   KNOWLEDGE RECOMMENDATIONS
===================================================== */

function buildKnowledgeRecommendations(
  knowledge
) {

  if (
    !knowledge?.available
  ) {

    return [];

  }


  const items =
    Array.isArray(
      knowledge.relevantKnowledge
    )
      ? knowledge.relevantKnowledge
      : [];


  return items
    .slice(
      0,
      6
    )
    .map(
      item => {

        const recommendation =
          item.recommendation ||
          item.application ||
          item.viewerEffect ||
          null;


        if (!recommendation) {

          return null;

        }


        return {

          id:
            item.id ||
            null,

          recommendation,

          evidenceLevel:
            item.evidenceLevel ||
            item.evidence ||
            "heuristic",

          domain:
            item.domain ||
            null

        };

      }
    )
    .filter(Boolean);

}


/* =====================================================
   VIDEO LOADER
===================================================== */

function loadVideo(file) {

  return new Promise(
    (resolve, reject) => {

      const video =
        document.createElement(
          "video"
        );


      const url =
        URL.createObjectURL(
          file
        );


      video.preload =
        "metadata";

      video.muted =
        true;

      video.playsInline =
        true;


      video.setAttribute(
        "playsinline",
        ""
      );


      video.setAttribute(
        "webkit-playsinline",
        ""
      );


      const cleanup =
        () => {

          URL.revokeObjectURL(
            url
          );

        };


      video.onloadedmetadata =
        () => {

          if (
            !video.videoWidth ||
            !video.videoHeight
          ) {

            cleanup();

            reject(
              new Error(
                "تعذر قراءة أبعاد الفيديو"
              )
            );

            return;

          }


          resolve(
            video
          );

        };


      video.onerror =
        () => {

          cleanup();

          reject(
            new Error(
              "تعذر قراءة الفيديو"
            )
          );

        };


      video.src =
        url;

      video.load();

    }
  );

}


/* =====================================================
   TIMESTAMPS
===================================================== */

function buildTimestamps(
  duration
) {

  const wanted = [

    0.05,
    0.15,
    0.30,
    0.50,
    0.75,
    1.00,
    1.25,
    1.50,
    2.00,
    2.50,
    3.00

  ];


  if (
    duration > 4
  ) {

    wanted.push(

      duration * 0.35,

      duration * 0.50,

      duration * 0.65,

      duration * 0.80,

      duration * 0.90

    );

  }


  return [

    ...new Set(

      wanted

        .filter(
          time =>
            time >= 0 &&
            time < duration
        )

        .map(
          time =>
            round(
              time,
              2
            )
        )

    )

  ].sort(
    (
      a,
      b
    ) =>
      a - b
  );

}


/* =====================================================
   FRAME CAPTURE
===================================================== */

async function captureFrame(
  video,
  time
) {

  return new Promise(
    resolve => {

      const canvas =
        document.createElement(
          "canvas"
        );


      const ctx =
        canvas.getContext(
          "2d",
          {
            willReadFrequently:
              true
          }
        );


      const targetWidth =
        240;


      const ratio =
        video.videoHeight /
        video.videoWidth;


      canvas.width =
        targetWidth;


      canvas.height =
        Math.max(
          1,
          Math.round(
            targetWidth *
            ratio
          )
        );


      let finished =
        false;


      const finish =
        result => {

          if (
            finished
          ) {

            return;

          }


          finished =
            true;


          clearTimeout(
            timeout
          );


          video.removeEventListener(
            "seeked",
            onSeeked
          );


          resolve(
            result
          );

        };


      const timeout =
        setTimeout(
          () =>
            finish(null),
          1800
        );


      const onSeeked =
        () => {

          try {

            ctx.drawImage(
              video,
              0,
              0,
              canvas.width,
              canvas.height
            );


            const image =
              ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );


            const analysis =
              analyzeImageData(
                image
              );


            finish({

              time,

              brightness:
                analysis.brightness,

              contrast:
                analysis.contrast,

              saturation:
                analysis.saturation,

              edgeDensity:
                analysis.edgeDensity

            });


          } catch {

            finish(
              null
            );

          }

        };


      video.addEventListener(
        "seeked",
        onSeeked
      );


      try {

        video.currentTime =
          Math.min(
            time,
            Math.max(
              0,
              video.duration -
              0.01
            )
          );

      } catch {

        finish(
          null
        );

      }

    }
  );

}


/* =====================================================
   IMAGE ANALYSIS
===================================================== */

function analyzeImageData(
  imageData
) {

  const data =
    imageData.data;


  const step =
    16;


  let brightness =
    0;


  let square =
    0;


  let saturation =
    0;


  let edges =
    0;


  let samples =
    0;


  let previous =
    null;


  for (
    let i = 0;
    i < data.length;
    i += 4 * step
  ) {

    const r =
      data[i];


    const g =
      data[i + 1];


    const b =
      data[i + 2];


    const gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;


    brightness +=
      gray;


    square +=
      gray * gray;


    const max =
      Math.max(
        r,
        g,
        b
      );


    const min =
      Math.min(
        r,
        g,
        b
      );


    saturation +=
      max === 0
        ? 0
        : (
            max - min
          ) / max;


    if (
      previous !== null &&
      Math.abs(
        gray -
        previous
      ) > 45
    ) {

      edges++;

    }


    previous =
      gray;


    samples++;

  }


  const avgBrightness =
    brightness /
    Math.max(
      1,
      samples
    );


  const variance =
    square /
    Math.max(
      1,
      samples
    ) -
    avgBrightness *
    avgBrightness;


  const contrast =
    Math.sqrt(
      Math.max(
        0,
        variance
      )
    );


  const edgeDensity =
    edges /
    Math.max(
      1,
      samples
    );


  return {

    brightness:
      round(
        normalize(
          avgBrightness,
          0,
          255
        ) * 100
      ),


    contrast:
      round(
        normalize(
          contrast,
          0,
          128
        ) * 100
      ),


    saturation:
      round(
        saturation /
        Math.max(
          1,
          samples
        ) *
        100
      ),


    edgeDensity:
      round(
        edgeDensity *
        100
      )

  };

}


/* =====================================================
   VISUAL
===================================================== */

function analyzeFrames(
  frames
) {

  if (
    !frames.length
  ) {

    return {

      score:
        0,

      averageBrightness:
        0,

      averageContrast:
        0,

      averageSaturation:
        0,

      visualVariation:
        0

    };

  }


  const average =
    key =>
      frames.reduce(
        (
          sum,
          frame
        ) =>
          sum +
          (
            Number(
              frame[key]
            ) || 0
          ),
        0
      ) /
      frames.length;


  const brightness =
    average(
      "brightness"
    );


  const contrast =
    average(
      "contrast"
    );


  const saturation =
    average(
      "saturation"
    );


  let variation =
    0;


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    variation +=

      Math.abs(
        frames[i].brightness -
        frames[i - 1].brightness
      ) +

      Math.abs(
        frames[i].contrast -
        frames[i - 1].contrast
      );

  }


  if (
    frames.length > 1
  ) {

    variation /=
      frames.length - 1;

  }


  let score =
    50;


  if (
    brightness >= 25 &&
    brightness <= 85
  ) {

    score +=
      12;

  }


  if (
    contrast >= 20
  ) {

    score +=
      12;

  }


  if (
    saturation >= 15 &&
    saturation <= 80
  ) {

    score +=
      8;

  }


  if (
    variation >= 4
  ) {

    score +=
      10;

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),


    averageBrightness:
      round(
        brightness
      ),


    averageContrast:
      round(
        contrast
      ),


    averageSaturation:
      round(
        saturation
      ),


    visualVariation:
      round(
        variation
      )

  };

}


/* =====================================================
   HOOK
===================================================== */

function analyzeHook(
  frames,
  duration
) {

  const first =
    frames.filter(
      frame =>
        frame.time <= 1
    );


  if (
    !first.length
  ) {

    return {

      score:
        0,

      risk:
        "تعذر تحليل البداية",

      observations:
        []

    };

  }


  let score =
    50;


  const observations =
    [];


  const firstFrame =
    first[0];


  if (
    firstFrame.brightness < 12
  ) {

    score -=
      18;

    observations.push(
      "البداية مظلمة جداً وقد لا تكون واضحة على شاشة الهاتف."
    );

  } else {

    score +=
      8;

  }


  if (
    firstFrame.contrast >= 25
  ) {

    score +=
      10;

    observations.push(
      "يوجد تباين بصري جيد في البداية."
    );

  } else {

    score -=
      8;

    observations.push(
      "التباين البصري في البداية منخفض."
    );

  }


  if (
    first.length >= 2
  ) {

    const earlyChange =
      Math.abs(
        first[1].brightness -
        first[0].brightness
      ) +
      Math.abs(
        first[1].contrast -
        first[0].contrast
      );


    if (
      earlyChange >= 12
    ) {

      score +=
        12;

      observations.push(
        "يوجد تغير بصري مبكر."
      );

    } else {

      score -=
        5;

      observations.push(
        "البداية ثابتة نسبياً."
      );

    }

  }


  let risk =
    "متوسط";


  if (
    score < 45
  ) {

    risk =
      "مرتفع";

  }


  if (
    score >= 70
  ) {

    risk =
      "منخفض";

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),

    risk,

    observations

  };

}


/* =====================================================
   PACING
===================================================== */

function analyzePacing(
  frames,
  duration
) {

  if (
    frames.length < 2
  ) {

    return {

      score:
        50,

      changeRate:
        0,

      assessment:
        "بيانات غير كافية"

    };

  }


  let changes =
    0;


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    const change =

      Math.abs(
        frames[i].brightness -
        frames[i - 1].brightness
      ) +

      Math.abs(
        frames[i].contrast -
        frames[i - 1].contrast
      );


    if (
      change > 12
    ) {

      changes++;

    }

  }


  const rate =
    changes /
    Math.max(
      1,
      frames.length - 1
    );


  let score =
    55;


  if (
    duration <= 12
  ) {

    score +=
      10;

  }


  if (
    duration > 30
  ) {

    score -=
      10;

  }


  if (
    rate >= 0.25 &&
    rate <= 0.8
  ) {

    score +=
      15;

  }


  if (
    rate < 0.1
  ) {

    score -=
      15;

  }


  let assessment =
    "إيقاع متوسط";


  if (
    score >= 75
  ) {

    assessment =
      "إيقاع جيد";

  }


  if (
    score < 50
  ) {

    assessment =
      "الإيقاع قد يكون بطيئاً أو غير متنوع";

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),

    changeRate:
      round(
        rate * 100
      ),

    assessment

  };

}


/* =====================================================
   TECHNICAL
===================================================== */

function analyzeTechnical(
  metadata
) {

  let score =
    50;


  const observations =
    [];


  const vertical =
    metadata.height >
    metadata.width;


  if (
    vertical
  ) {

    score +=
      25;

  } else {

    score -=
      20;

    observations.push(
      "الفيديو ليس عمودياً."
    );

  }


  const ratio =
    metadata.width /
    metadata.height;


  if (
    ratio >= 0.53 &&
    ratio <= 0.60
  ) {

    score +=
      15;

  } else {

    observations.push(
      "نسبة الأبعاد ليست قريبة من 9:16."
    );

  }


  if (
    metadata.height >= 1280
  ) {

    score +=
      10;

  } else {

    observations.push(
      "الدقة العمودية أقل من 1280px."
    );

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),

    observations

  };

}


/* =====================================================
   SPEECH ANALYSIS
===================================================== */

function analyzeSpeech(
  speech,
  duration
) {

  if (
    !speech?.available ||
    !speech.text
  ) {

    return {

      score:
        50,

      available:
        false,

      assessment:
        "لم يتوفر تحليل كلام موثوق."

    };

  }


  const words =
    speech.wordCount ||
    0;


  const wordsPerSecond =
    duration > 0
      ? words / duration
      : 0;


  let score =
    60;


  const observations =
    [];


  if (
    wordsPerSecond >= 1.5 &&
    wordsPerSecond <= 3.5
  ) {

    score +=
      15;

    observations.push(
      "سرعة الكلام ضمن نطاق قابل للمتابعة."
    );

  }


  if (
    wordsPerSecond > 4
  ) {

    score -=
      15;

    observations.push(
      "الكلام سريع نسبياً وقد يرفع الحمل المعرفي."
    );

  }


  if (
    wordsPerSecond < 1
  ) {

    score -=
      10;

    observations.push(
      "الكلام بطيء نسبياً."
    );

  }


  const firstSegment =
    speech.segments?.find(
      segment =>
        segment.start !== null &&
        segment.start <= 1
    );


  if (
    firstSegment?.text
  ) {

    observations.push(
      "تم التعرف على كلام في بداية الفيديو."
    );

  } else {

    observations.push(
      "لم يتم التعرف على كلام واضح في أول ثانية."
    );

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),

    available:
      true,

    wordsPerSecond:
      round(
        wordsPerSecond,
        2
      ),

    observations

  };

}


/* =====================================================
   IDEA
===================================================== */

/* =====================================================
   IDEA GIST (جوهر الكلام)
   -----------------------------------------------------
   ملاحظة صادقة: هاد استخراج استخلاصي (Extractive) —
   بيلقط أهم جملة/جمل *قيلت فعلياً* بالفيديو، مش فهم
   دلالي عميق يعيد صياغة المعنى بكلام جديد (هاد بيحتاج
   نموذج لغوي حقيقي). كل الحساب هون محلي وحتمي، بدون
   أي استدعاء خارجي.
===================================================== */

function extractIdeaGist(
  speech
) {

  if (
    !speech?.available ||
    !speech.text
  ) {

    return {

      available:
        false,

      coreMessage:
        null,

      problemAddressed:
        null,

      promiseOrValue:
        null

    };

  }


  const text =
    speech.text.trim();


  const sentences =
    text
      .split(/[.!?؟\n]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 8);


  if (
    !sentences.length
  ) {

    return {

      available:
        false,

      coreMessage:
        null,

      problemAddressed:
        null,

      promiseOrValue:
        null

    };

  }


  const problemRegex =
    /(مشكلة|ليش|لماذا|خطأ|غلط|بتخسر|خسارة|ما عم|ما عاد|صعوبة|تعاني)/i;

  const promiseRegex =
    /(رح|سوف|طريقة|سر|حل|نتيجة|هيك بتقدر|بتضمن|بتحقق)/i;


  let problemAddressed =
    null;

  let promiseOrValue =
    null;


  let bestSentence =
    sentences[0];

  let bestScore =
    -Infinity;


  sentences.forEach(
    (sentence, index) => {

      let score =
        0;


      const isProblem =
        problemRegex.test(
          sentence
        );

      const isPromise =
        promiseRegex.test(
          sentence
        );


      if (
        isProblem
      ) {

        score += 2;

        if (
          !problemAddressed
        ) {

          problemAddressed =
            sentence;

        }

      }


      if (
        isPromise
      ) {

        score += 2;

        if (
          !promiseOrValue
        ) {

          promiseOrValue =
            sentence;

        }

      }


      /*
        طول معتدل أفضل مؤشر على جملة "خلاصة" مقارنة
        بجملة قصيرة جداً (غالباً حشو) أو طويلة جداً
        (غالباً جملة مركّبة تحتوي أكتر من فكرة).
      */

      if (
        sentence.length >= 20 &&
        sentence.length <= 140
      ) {

        score += 1;

      }


      /*
        أولوية بسيطة للجمل الأقرب لبداية الكلام،
        لأنو غالباً هون بتنقال الفكرة الأساسية —
        بدون ما يلغي دور premature-payoff detection
        المنفصل يلي بيحكم إذا التوقيت هالة خطر أو لأ.
      */

      if (
        index <=
        Math.ceil(
          sentences.length * 0.4
        )
      ) {

        score += 1;

      }


      if (
        score >= bestScore
      ) {

        bestScore =
          score;

        bestSentence =
          sentence;

      }

    }
  );


  return {

    available:
      true,

    coreMessage:
      bestSentence,

    problemAddressed,

    promiseOrValue,

    sentenceCount:
      sentences.length

  };

}


function analyzeIdea(
  speech,
  duration
) {

  if (
    !speech?.available ||
    !speech.text
  ) {

    return {

      score:
        50,

      confidence:
        "منخفضة",

      reason:
        "لا يوجد نص كلام كافٍ للحكم على الفكرة."

    };

  }


  const text =
    speech.text.trim();


  let score =
    55;


  const reasons =
    [];


  if (
    text.length >= 40
  ) {

    score +=
      10;

  }


  if (
    text.length >= 80
  ) {

    score +=
      5;

  }


  const hasQuestion =
    /[؟?]/.test(
      text
    );


  const hasProblemWords =
    /(مشكلة|ليش|لماذا|كيف|خطأ|غلط|بتخسر|خسارة|ما عم|ما عاد)/i
      .test(
        text
      );


  const hasPromiseWords =
    /(رح|سوف|طريقة|سر|كيف|بتقدر|تقدر|حل|نتيجة)/i
      .test(
        text
      );


  if (
    hasQuestion
  ) {

    score +=
      8;

    reasons.push(
      "يوجد عنصر سؤال/فضول."
    );

  }


  if (
    hasProblemWords
  ) {

    score +=
      8;

    reasons.push(
      "يوجد مؤشر واضح على مشكلة أو ألم."
    );

  }


  if (
    hasPromiseWords
  ) {

    score +=
      8;

    reasons.push(
      "يوجد مؤشر على وعد أو نتيجة."
    );

  }


  if (
    !reasons.length
  ) {

    reasons.push(
      "لم تظهر مؤشرات لغوية قوية على سؤال أو مشكلة أو وعد."
    );

  }


  return {

    score:
      clamp(
        Math.round(
          score
        ),
        0,
        100
      ),

    confidence:
      "متوسطة",

    reason:
      reasons.join(
        " "
      )

  };

}


/* =====================================================
   CONTENT TYPE CLASSIFICATION
   -----------------------------------------------------
   تصنيف heuristic مبني على كلمات مفتاحية بالنص المفرّغ +
   مجال المستخدم (لو محدد). تصنيف واحد أساسي + ثقة، مش
   قرار قطعي — فيديو ممكن يجمع أكتر من نوع فعلياً.
===================================================== */

function classifyContentType(
  speech,
  nicheId
) {

  const text =
    speech?.available && speech.text
      ? speech.text
      : "";


  const signals = [

    {
      type: "educational",
      regex: /(كيف|خطوات|طريقة|تعلم|شرح|درس)/i
    },

    {
      type: "storytelling",
      regex: /(قصة|صار معي|حكاية|تجربتي|مرة)/i
    },

    {
      type: "opinion",
      regex: /(برأيي|أنا بشوف|بحس إنو|وجهة نظري)/i
    },

    {
      type: "promotional",
      regex: /(الرابط بالبايو|احجز|اطلب|خصم|عرض خاص)/i
    },

    {
      type: "transformation",
      regex: /(قبل و بعد|قبل وبعد|تحول|تغيرت|فرق كبير)/i
    },

    {
      type: "tutorial",
      regex: /(خطوة أولى|أول شي|ثاني شي|بعدين|بالنهاية)/i
    },

    {
      type: "commentary",
      regex: /(بخصوص يلي صار|تعليقي على|رأيي بموضوع)/i
    }

  ];


  const matches =
    signals.filter(
      s => s.regex.test(text)
    );


  let primaryType =
    matches[0]?.type || null;


  /*
    المجال (لو محدد) بيرجّح النوع بحالة عدم وجود
    إشارة لغوية قوية.
  */

  if (
    !primaryType &&
    nicheId
  ) {

    const nicheDefaults = {

      niche_marketing:
        "promotional",

      niche_educational:
        "educational",

      niche_motivational:
        "storytelling",

      niche_comedy:
        "entertainment",

      niche_real_estate:
        "promotional",

      niche_makeup:
        "tutorial",

      niche_fashion:
        "lifestyle"

    };


    primaryType =
      nicheDefaults[nicheId] ||
      null;

  }


  return {

    primaryType:
      primaryType || "غير محدد",

    matchedSignals:
      matches.map(m => m.type),

    confidence:
      matches.length >= 2
        ? "متوسطة"
        : matches.length === 1
        ? "منخفضة"
        : "منخفضة جداً",

    note:
      "تصنيف heuristic مبني على كلمات مفتاحية، مو تحليل دلالي كامل — فيديو ممكن يجمع أكتر من نوع فعلياً."

  };

}


/* =====================================================
   CTA (CALL TO ACTION)
===================================================== */

function analyzeCTA(
  speech,
  duration
) {

  if (
    !speech?.available ||
    !speech.text
  ) {

    return {

      hasCTA:
        false,

      type:
        null,

      confidence:
        "منخفضة",

      reason:
        "لا يوجد نص كلام كافٍ لتحديد وجود دعوة لاتخاذ إجراء."

    };

  }


  const text =
    speech.text.trim();


  /*
    نركز على آخر جزء من النص (آخر ~35%)
    لأن الـ CTA غالباً بتكون قرب نهاية الفيديو.
  */

  /*
    نركز على آخر جزء من النص (آخر ~40% أو آخر 100
    حرف، أيهما أكبر) لأن الـ CTA غالباً بتكون قرب
    نهاية الفيديو. النصوص القصيرة (شائعة بالريلز)
    محتاجة نافذة أوسع نسبياً حتى ما نقص جزء الدعوة
    بالغلط.
  */

  const tailChars =
    Math.max(
      100,
      Math.floor(
        text.length * 0.4
      )
    );

  const tailStart =
    Math.max(
      0,
      text.length -
      tailChars
    );

  const tailText =
    text.slice(
      tailStart
    );


  const patterns = [

    {
      type:
        "hard-conversion",

      regex:
        /(الرابط بالبايو|رابط البايو|احجز|اطلب|تواصل معنا|تواصلوا|واتساب|دي إم|DM|تسوق الآن)/i

    },

    {
      type:
        "soft-engagement",

      regex:
        /(احفظوا|احفظ|شارك الفيديو|شاركوا الفيديو)/i

    },

    {
      type:
        "question-engagement",

      regex:
        /(شو رأيكن|قولولي|اكتبولي|علقوا|بالتعليقات)/i

    },

    {
      type:
        "follow-identity",

      regex:
        /(تابعوني|تابعونا|فولو|follow)/i

    },

    {
      type:
        "challenge-share",

      regex:
        /(شاركوا مع|شارك مع صاحب|تاغ صاحب|tag)/i

    }

  ];


  let matched =
    null;


  for (
    const pattern
    of patterns
  ) {

    if (
      pattern.regex.test(
        tailText
      )
    ) {

      matched =
        pattern.type;

      break;

    }

  }


  if (matched) {

    return {

      hasCTA:
        true,

      type:
        matched,

      confidence:
        "متوسطة",

      reason:
        "تم العثور على مؤشر لغوي لدعوة اتخاذ إجراء قرب نهاية الفيديو."

    };

  }


  return {

    hasCTA:
      false,

    type:
      null,

    confidence:
      "متوسطة",

    reason:
      "لم يظهر أي مؤشر لغوي واضح على دعوة لاتخاذ إجراء قرب نهاية الفيديو. هذا لا يعني بالضرورة عدم وجودها بصرياً (نص على الشاشة)، فالتحليل هنا يعتمد على الكلام المفرّغ فقط."

  };

}


/* =====================================================
   DROP-OFF
===================================================== */

function detectDropOffPoints(
  frames,
  pacing,
  speech,
  duration,
  hook
) {

  const points =
    [];


  /*
    مقاطع ثابتة بصرياً لفترة طويلة (Long Static Stretch)

    بدل ما نبلّغ عن كل فريمين متتاليين فيهم تغير
    بسيط (شي بيصير كتير وبيصير ضجيج مش مفيد)، نراقب
    التتابع: إذا استمر التغير البصري منخفض لفترة
    حقيقية (~3 ثواني فأكتر)، هاد مؤشر أقوى بكتير على
    خطر ملل/سكرول من نقطة واحدة معزولة.
  */

  let staticRunStart =
    null;


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    const previous =
      frames[i - 1];


    const current =
      frames[i];


    const visualChange =

      Math.abs(
        current.brightness -
        previous.brightness
      ) +

      Math.abs(
        current.contrast -
        previous.contrast
      );


    const isStatic =
      visualChange < 4;


    if (
      isStatic &&
      staticRunStart === null
    ) {

      staticRunStart =
        previous.time;

    }


    const runEndsHere =
      !isStatic ||
      i === frames.length - 1;


    if (
      runEndsHere &&
      staticRunStart !== null
    ) {

      const runEnd =
        isStatic
          ? current.time
          : previous.time;

      const runLength =
        runEnd -
        staticRunStart;


      if (
        runLength >= 3
      ) {

        points.push({

          time:
            round(
              staticRunStart,
              1
            ),

          type:
            "long_static_stretch",

          principle:
            "processing_fluency",

          confidence:
            "متوسطة",

          reason:
            `مقطع ثابت بصرياً لحوالي ${round(runLength, 1)} ثانية بدون تغيير ملحوظ؛ منطقة عالية الخطورة لتوقف السكرول لأنو ما في محفز بصري جديد.`

        });

      }


      staticRunStart =
        null;

    }

  }


  /*
    هوك افتتاحي ضعيف (Weak Opening Hook)

    أول لحظة قرار عند المشاهد فعلياً هي أول 0.5-1
    ثانية. إذا الهوك سجل درجة منخفضة، هاد بحد ذاته
    أخطر نقطة هروب بالفيديو كله ولازم تظهر ضمن نفس
    قائمة نقاط الخطر، مش بس بتقرير الهوك المنفصل.
  */

  if (
    hook &&
    hook.score < 55
  ) {

    points.push({

      time:
        0,

      type:
        "weak_opening_hook",

      principle:
        "pattern_interrupt",

      confidence:
        "عالية",

      reason:
        "درجة الهوك منخفضة؛ أعلى خطر هروب فعلياً هو بأول لحظة من الفيديو، قبل أي مشكلة تانية بالمحتوى."

    });

  }


  /*
    إرهاق منتصف الفيديو (Mid-Video Fatigue)

    بالفيديوهات الأطول نسبياً (٢٥ ثانية فأكتر)، إذا
    الثلث الأوسط ما فيه أي تغيير بصري حقيقي مقارنة
    بباقي الفيديو، هاد مؤشر على منطقة ركود بالمنتصف
    ممكن يخلي المشاهد يسكرول حتى لو البداية كانت قوية.
  */

  if (
    duration >= 25 &&
    frames.length >= 6
  ) {

    const middleStart =
      duration * 0.35;

    const middleEnd =
      duration * 0.65;


    const middleFrames =
      frames.filter(
        f =>
          f.time >= middleStart &&
          f.time <= middleEnd
      );


    if (
      middleFrames.length >= 2
    ) {

      let middleChanges =
        0;


      for (
        let i = 1;
        i < middleFrames.length;
        i++
      ) {

        const change =

          Math.abs(
            middleFrames[i].brightness -
            middleFrames[i - 1].brightness
          ) +

          Math.abs(
            middleFrames[i].contrast -
            middleFrames[i - 1].contrast
          );


        if (
          change > 12
        ) {

          middleChanges++;

        }

      }


      const middleRate =
        middleChanges /
        Math.max(
          1,
          middleFrames.length - 1
        );


      if (
        middleRate === 0
      ) {

        points.push({

          time:
            round(
              middleStart,
              1
            ),

          type:
            "mid_video_fatigue",

          principle:
            "novelty",

          confidence:
            "منخفضة",

          reason:
            "منطقة منتصف الفيديو ما فيها أي تغيير بصري ملحوظ مقارنة بباقي الفيديو؛ خطر ركود حتى لو البداية كانت قوية."

        });

      }

    }

  }


  /*
    فجوات الصمت (Silence Gaps)

    فجوة كبيرة بين مقطعين من الكلام بمنتصف الفيديو
    ممكن تكون منطقة "هواء ميت" بتخلي المشاهد يكمل سكرول
    لأنو مافي محفز واضح (لا كلام، لا سبب انتباه).
  */

  if (
    speech?.available &&
    speech.segments?.length > 1
  ) {

    for (
      let i = 1;
      i < speech.segments.length;
      i++
    ) {

      const previous =
        speech.segments[i - 1];

      const current =
        speech.segments[i];


      if (
        previous.end === null ||
        current.start === null
      ) {

        continue;

      }


      const gap =
        current.start -
        previous.end;


      if (
        gap >= 2.5
      ) {

        points.push({

          time:
            round(
              previous.end,
              1
            ),

          type:
            "silence_gap",

          principle:
            "curiosity_gap",

          confidence:
            "متوسطة",

          reason:
            `فجوة صمت حوالي ${round(gap, 1)} ثانية بدون كلام؛ من دون محفز بصري قوي بهالفترة، الخطر إنو المشاهد يكمل سكرول.`

        });

      }

    }

  }


  if (
    speech?.available &&
    speech.segments?.length
  ) {

    const firstSpeech =
      speech.segments[0];


    if (
      firstSpeech.start !== null &&
      firstSpeech.start > 0.8
    ) {

      points.unshift({

        time:
          firstSpeech.start,

        type:
          "late_speech_start",

        principle:
          "cognitive_load",

        confidence:
          "متوسطة",

        reason:
          "الكلام يبدأ بعد فترة من بداية الفيديو؛ راجع ما إذا كانت هذه الفترة تخدم الهوك."

      });

    }

  }


  /*
    الجواب/الفكرة المبكرة (Premature Payoff)

    إذا انحكى جوهر الفكرة أو الجواب أو النتيجة
    بوقت مبكر من الفيديو، وما فيه سبب جديد يخلي
    المشاهد يكمل (سؤال جديد، تفصيل إضافي، تحدي)،
    فالخطر إنو المشاهد ياخد المعلومة ويسكرول قبل
    ما يخلص الفيديو، حتى لو المحتوى نفسه ممتاز.
  */

  if (
    speech?.available &&
    speech.segments?.length > 1 &&
    duration > 8
  ) {

    const payoffRegex =
      /(السر هو|الجواب هو|الحل هو|النتيجة هي|بالمختصر|بكل بساطة|يعني ببساطة|خلاصة الموضوع|أهم شي)/i;

    const renewalRegex =
      /(بس|لكن|كمان|بالإضافة|مشكلة|سؤال|؟)/;


    let payoffSegment =
      null;


    for (
      const segment
      of speech.segments
    ) {

      if (
        segment.start === null
      ) {

        continue;

      }


      if (
        payoffRegex.test(
          segment.text
        )
      ) {

        payoffSegment =
          segment;

        break;

      }

    }


    if (payoffSegment) {

      const relativePosition =
        payoffSegment.start /
        duration;


      const laterText =
        speech.segments
          .filter(
            s =>
              s.start !== null &&
              s.start >
                payoffSegment.start
          )
          .map(
            s => s.text
          )
          .join(" ");


      const hasRenewal =
        renewalRegex.test(
          laterText
        );


      if (
        relativePosition < 0.45 &&
        !hasRenewal
      ) {

        points.push({

          time:
            round(
              payoffSegment.start,
              1
            ),

          type:
            "premature_payoff",

          principle:
            "information_gain",

          confidence:
            "متوسطة",

          reason:
            "يبدو إنو جوهر الفكرة أو الجواب انحكى بوقت مبكر نسبياً (قبل تقريباً نص الفيديو) بدون سبب واضح يخلي المشاهد يكمل — خطر إنو ياخد المعلومة ويسكرول."

        });

      }

    }

  }


  return points.slice(
    0,
    8
  );

}


/* =====================================================
   SCENE-BY-SCENE ANALYSIS
   -----------------------------------------------------
   تقسيم الفيديو لمشاهد بناءً على نقاط التغير البصري
   الحقيقية بين الفريمات الملتقطة. الدقة محدودة بعدد
   الفريمات المتوفر فعلياً (مش تحليل كل فريم بالفيديو).
===================================================== */

function buildScenes(
  frames,
  duration
) {

  if (
    !frames?.length ||
    frames.length < 2
  ) {

    return [{
      index: 0,
      start: 0,
      end: duration,
      duration
    }];

  }


  const cutPoints =
    [0];


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    const previous =
      frames[i - 1];

    const current =
      frames[i];


    const change =

      Math.abs(
        current.brightness -
        previous.brightness
      ) +

      Math.abs(
        current.contrast -
        previous.contrast
      );


    if (
      change > 15
    ) {

      cutPoints.push(
        current.time
      );

    }

  }


  cutPoints.push(
    duration
  );


  const uniqueSorted =
    [...new Set(cutPoints)]
      .sort((a, b) => a - b);


  const scenes =
    [];


  for (
    let i = 0;
    i < uniqueSorted.length - 1;
    i++
  ) {

    const start =
      uniqueSorted[i];

    const end =
      uniqueSorted[i + 1];


    if (
      end - start < 0.3
    ) {

      continue;

    }


    scenes.push({
      index: scenes.length,
      start:
        round(start, 1),
      end:
        round(end, 1),
      duration:
        round(end - start, 1)
    });

  }


  return scenes.length
    ? scenes
    : [{
        index: 0,
        start: 0,
        end: duration,
        duration
      }];

}


/* =====================================================
   ATTENTION MAP
   -----------------------------------------------------
   خريطة زمنية مبنية على نفس نقاط الخطر المكتشفة فعلياً
   (dropOff) + سجل الهوك + الـ CTA. مش "قراءة عقل
   المشاهد" — هي عرض منظم لنفس الإشارات المتوفرة أصلاً،
   موزعة على المشاهد.
===================================================== */

function buildAttentionMap(
  scenes,
  dropOff,
  hook,
  cta
) {

  return scenes.map(
    (scene, i) => {

      const risksInScene =
        dropOff.filter(
          p =>
            p.time >= scene.start &&
            p.time < scene.end
        );


      let label;

      let reason;


      if (
        risksInScene.length
      ) {

        label =
          "خطر (Risk)";

        reason =
          risksInScene
            .map(r => r.reason)
            .join(" ");

      } else if (
        i === 0 &&
        hook &&
        hook.score >= 65
      ) {

        label =
          "احتمال انتباه عالي";

        reason =
          "درجة هوك قوية بأول مشهد.";

      } else if (
        i === scenes.length - 1 &&
        cta?.hasCTA
      ) {

        label =
          "منطقة CTA";

        reason =
          "دعوة لاتخاذ إجراء قرب النهاية.";

      } else {

        label =
          "منطقة مستقرة";

        reason =
          "لا توجد إشارة خطر أو تميّز خاص بناءً على المعطيات المتوفرة.";

      }


      return {

        scene:
          scene.index,

        timeRange:
          `${scene.start}s - ${scene.end}s`,

        label,

        reason

      };

    }
  );

}


/* =====================================================
   RECOMMENDATION PRIORITY
   -----------------------------------------------------
   إعادة ترتيب نفس التوصيات المبنية أصلاً (changes[])
   لثلاث فئات: أول شي تصلحه، يستاهل تجربته، لا تغيره.
===================================================== */

function prioritizeRecommendations(
  changes,
  scores
) {

  const labels = {

    hook: "الهوك",
    pacing: "الإيقاع",
    visual: "العنصر البصري",
    technical: "الجانب التقني",
    speech: "الكلام",
    idea: "وضوح الفكرة"

  };


  const keep =
    Object.entries(scores)
      .filter(([, v]) => v >= 80)
      .map(([k]) => labels[k] || k);


  return {

    fixFirst:
      changes.slice(0, 3),

    worthTesting:
      changes.slice(3),

    keep:
      keep.length
        ? keep
        : ["لا يوجد عنصر بدرجة عالية بما يكفي ليُصنَّف كـ Keep بعد."]

  };

}


/* =====================================================
   DIAGNOSIS
===================================================== */

function buildDiagnosis({
  hook,
  pacing,
  visual,
  technical,
  speechAnalysis,
  idea,
  cta,
  dropOff
}) {

  const list =
    [];


  if (
    hook.score < 60
  ) {

    list.push(
      ...hook.observations
    );

  }


  if (
    pacing.score < 60
  ) {

    list.push(
      `الإيقاع يحتاج مراجعة. مؤشر التغير البصري ${pacing.changeRate}%.`
    );

  }


  if (
    visual.score < 60
  ) {

    list.push(
      "الإشارات البصرية تحتاج تحسيناً."
    );

  }


  if (
    technical.score < 70
  ) {

    list.push(
      ...technical.observations
    );

  }


  if (
    speechAnalysis.score < 60
  ) {

    list.push(
      ...(
        speechAnalysis.observations ||
        []
      )
    );

  }


  if (
    idea.score < 60
  ) {

    list.push(
      idea.reason
    );

  }


  if (
    cta &&
    !cta.hasCTA &&
    speechAnalysis.score >= 40
  ) {

    list.push(
      cta.reason
    );

  }


  if (
    dropOff.length
  ) {

    list.push(
      `هناك ${dropOff.length} مناطق زمنية تستحق المراجعة من ناحية التغير البصري أو بداية الكلام أو فجوات الصمت.`
    );

  }


  if (
    !list.length
  ) {

    list.push(
      "لم يتم اكتشاف مشكلة واضحة ضمن الإشارات التي يستطيع المحرك قياسها محلياً."
    );

  }


  return list;

}


/* =====================================================
   RECOMMENDATIONS
===================================================== */

function buildRecommendations({
  hook,
  pacing,
  visual,
  technical,
  speechAnalysis,
  idea,
  cta,
  dropOff
}) {

  const changes =
    [];


  if (
    hook.score < 60
  ) {

    changes.push(
      "اختبر أول 0.5–1 ثانية كمنطقة مستقلة: ابدأ بالفعل أو النتيجة أو السؤال قبل الشرح."
    );

    changes.push(
      "قارن نسخة الهوك الحالية بنسخة ثانية مختلفة فعلياً، وليس مجرد تغيير كلمة."
    );

  }


  if (
    pacing.score < 60
  ) {

    changes.push(
      "راجع اللقطات التي لا تضيف معلومة أو إحساساً جديداً، واختبر تقصيرها."
    );

  }


  if (
    speechAnalysis.score < 60
  ) {

    changes.push(
      "راجع سرعة الكلام: الهدف ليس السرعة دائماً، بل وضوح الجملة وتقليل الحمل المعرفي."
    );

  }


  if (
    idea.score < 60
  ) {

    changes.push(
      "اجعل الفكرة قابلة للفهم بجملة واحدة: مشكلة/رغبة واضحة + سبب للاستمرار + نتيجة أو وعد."
    );

  }


  if (
    visual.score < 60
  ) {

    changes.push(
      "حسّن وضوح العنصر الرئيسي والتباين في اللقطات الأولى قبل إضافة مؤثرات."
    );

  }


  if (
    technical.score < 70
  ) {

    changes.push(
      "استخدم إطاراً عمودياً قريباً من 9:16 ودقة مناسبة."
    );

  }


  if (
    cta &&
    !cta.hasCTA &&
    speechAnalysis.score >= 40
  ) {

    changes.push(
      "أضف دعوة واضحة لاتخاذ إجراء قرب نهاية الفيديو (تعليق، حفظ، متابعة، أو رابط) بدل ما تخلي الفيديو ينتهي بدون طلب واضح."
    );

  }


  if (
    dropOff.length
  ) {

    const first =
      dropOff[0];


    changes.push(
      `راجع المنطقة حول الثانية ${round(first.time, 1)}؛ توجد إشارة محلية تستحق الاختبار.`
    );

  }


  if (
    !changes.length
  ) {

    changes.push(
      "لا تغيّر الفيديو عشوائياً. اختبر نسخة بديلة للهوك أو الإيقاع وقارن النتائج الفعلية."
    );

  }


  return {

    priority:
      changes[0],

    changes

  };

}


/* =====================================================
   HUMAN SUMMARY
===================================================== */

/*
  فقرة ملخص واحدة بلغة طبيعية — الهدف إنو المستخدم
  يفهم "شو صار بالفيديو" بقراءة واحدة، بدل ما يجمّع
  الصورة بنفسه من 6-7 أرقام متفرقة.

  هاد تجميع نصي لنتائج موجودة أصلاً (مش تحليل جديد)،
  فمافي خطر تناقض مع باقي التحليل.
*/

function buildHumanSummary({
  scores,
  overall,
  hook,
  idea,
  ideaGist,
  cta,
  dropOff,
  duration
}) {

  const parts =
    [];


  /*
    الجملة الأولى: تقييم عام
  */

  let overallLine =
    `الفيديو (${round(duration, 1)} ثانية) `;


  if (
    overall >= 75
  ) {

    overallLine +=
      "بمستوى قوي بشكل عام.";

  } else if (
    overall >= 55
  ) {

    overallLine +=
      "بمستوى متوسط، فيه نقاط قوة وأخرى محتاجة تحسين.";

  } else {

    overallLine +=
      "بمستوى ضعيف نسبياً ومحتاج مراجعة جدية قبل النشر.";

  }


  parts.push(
    overallLine
  );


  /*
    الجملة الثانية: جوهر الكلام (إن وُجد)
  */

  if (
    ideaGist?.available
  ) {

    parts.push(
      `أقرب جملة للفكرة الأساسية اللي انحكت: "${ideaGist.coreMessage}".`
    );

  }


  /*
    الجملة الثانية: أقوى وأضعف عنصر
  */

  const entries =
    Object.entries(
      scores
    );


  const strongest =
    entries.reduce(
      (a, b) =>
        b[1] > a[1] ? b : a
    );


  const weakest =
    entries.reduce(
      (a, b) =>
        b[1] < a[1] ? b : a
    );


  const labels = {

    hook:
      "الهوك",

    pacing:
      "الإيقاع",

    visual:
      "العنصر البصري",

    technical:
      "الجانب التقني",

    speech:
      "الكلام",

    idea:
      "وضوح الفكرة"

  };


  parts.push(
    `أقوى نقطة هي ${labels[strongest[0]] || strongest[0]} (${strongest[1]})، بينما ${labels[weakest[0]] || weakest[0]} (${weakest[1]}) هو الجزء الأكتر احتياجاً للتحسين.`
  );


  /*
    الجملة الثالثة: أخطر خطر هروب (إن وجد)
  */

  if (
    dropOff.length
  ) {

    const topRisk =
      dropOff[0];


    const riskLabels = {

      weak_opening_hook:
        "ضعف بأول لحظة من الفيديو",

      premature_payoff:
        "كشف الفكرة الأساسية بدري بدون سبب يخلي المشاهد يكمل",

      silence_gap:
        "فجوة صمت طويلة بدون محفز",

      long_static_stretch:
        "مقطع ثابت بصرياً لفترة طويلة",

      mid_video_fatigue:
        "ركود بمنتصف الفيديو",

      late_speech_start:
        "تأخر بداية الكلام"

    };


    parts.push(
      `أخطر منطقة لاحتمال توقف المشاهد عن السكرول هي حوالي الثانية ${round(topRisk.time, 1)} — بسبب ${riskLabels[topRisk.type] || topRisk.type}.`
    );

  } else {

    parts.push(
      "ما في مناطق خطر واضحة لتوقف المشاهد بناءً على الإشارات المتوفرة."

    );

  }


  /*
    الجملة الرابعة: CTA
  */

  if (
    cta &&
    !cta.hasCTA
  ) {

    parts.push(
      "الفيديو ينتهي بدون دعوة واضحة لاتخاذ إجراء."
    );

  }


  return parts.join(
    " "
  );

}


/* =====================================================
   OVERALL
===================================================== */

function calculateOverall(
  scores
) {

  const weights = {

    hook:
      0.25,

    pacing:
      0.18,

    visual:
      0.15,

    technical:
      0.10,

    speech:
      0.17,

    idea:
      0.15

  };


  return clamp(

    Math.round(

      scores.hook *
        weights.hook +

      scores.pacing *
        weights.pacing +

      scores.visual *
        weights.visual +

      scores.technical *
        weights.technical +

      scores.speech *
        weights.speech +

      scores.idea *
        weights.idea

    ),

    0,
    100

  );

}


/* =====================================================
   HELPERS
===================================================== */

function clamp(
  value,
  min,
  max
) {

  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );

}


function normalize(
  value,
  min,
  max
) {

  return clamp(

    (
      value - min
    ) /
    (
      max - min
    ),

    0,
    1

  );

}


function round(
  value,
  decimals = 0
) {

  const factor =
    10 ** decimals;


  return Math.round(
    value * factor
  ) / factor;

}


function calculateAspectRatio(
  width,
  height
) {

  if (
    !height
  ) {

    return "unknown";

  }


  const ratio =
    width /
    height;


  if (
    Math.abs(
      ratio - 9 / 16
    ) < 0.04
  ) {

    return "9:16";

  }


  if (
    Math.abs(
      ratio - 1
    ) < 0.04
  ) {

    return "1:1";

  }


  if (
    Math.abs(
      ratio - 16 / 9
    ) < 0.04
  ) {

    return "16:9";

  }


  return round(
    ratio,
    2
  );

}


function formatBytes(
  bytes
) {

  if (
    !bytes
  ) {

    return "0 B";

  }


  if (
    bytes < 1024
  ) {

    return `${bytes} B`;

  }


  if (
    bytes <
    1024 * 1024
  ) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }


  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(1)} MB`;

}
