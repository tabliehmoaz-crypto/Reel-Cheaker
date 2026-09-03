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
      speech
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
      dropOff
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

    dropOff,


    diagnosis,


    recommendations,


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
   DROP-OFF
===================================================== */

function detectDropOffPoints(
  frames,
  pacing,
  speech
) {

  const points =
    [];


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


    if (
      visualChange < 4
    ) {

      points.push({

        time:
          current.time,

        type:
          "low_visual_change",

        confidence:
          "منخفضة",

        reason:
          "تغير بصري منخفض نسبياً؛ قد تستحق هذه المنطقة مراجعة من ناحية الإيقاع."

      });

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

        confidence:
          "متوسطة",

        reason:
          "الكلام يبدأ بعد فترة من بداية الفيديو؛ راجع ما إذا كانت هذه الفترة تخدم الهوك."

      });

    }

  }


  return points.slice(
    0,
    8
  );

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
    dropOff.length
  ) {

    list.push(
      `هناك ${dropOff.length} مناطق زمنية تستحق المراجعة من ناحية التغير البصري أو بداية الكلام.`
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
