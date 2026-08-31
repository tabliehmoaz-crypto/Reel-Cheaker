/*
  REEL CHECK — LOCAL VIDEO ENGINE
  --------------------------------
  هذا المحرك لا يستخدم Gemini أو Claude أو أي API.
  كل العمليات تتم داخل المتصفح على الفيديو الذي اختاره المستخدم.
*/

export async function analyzeReel(file) {

  if (!file) {
    throw new Error("لم يتم اختيار فيديو");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("الملف المختار ليس فيديو");
  }

  const video = await loadVideo(file);

  const metadata = {
    name: file.name,
    size: file.size,
    type: file.type,

    duration: round(video.duration, 2),
    width: video.videoWidth,
    height: video.videoHeight,

    aspectRatio:
      calculateAspectRatio(
        video.videoWidth,
        video.videoHeight
      )
  };


  /*
    استخراج إطارات من الفيديو.

    نركز على:
    0.1s
    0.3s
    0.5s
    0.8s
    1.0s
    1.5s
    2.0s
    3.0s

    لأن البداية أهم منطقة لفحص الـHook.
  */

  const timestamps =
    buildTimestamps(
      video.duration
    );

  const frames = [];

  for (const time of timestamps) {

    const frame =
      await captureFrame(
        video,
        time
      );

    if (frame) {
      frames.push(frame);
    }
  }


  /*
    التحليل البصري المحلي
  */

  const visualAnalysis =
    analyzeFrames(frames);


  /*
    تحليل الإيقاع وتغير الصورة
  */

  const pacing =
    analyzePacing(
      frames,
      video.duration
    );


  /*
    تحليل البداية
  */

  const hook =
    analyzeHook(
      frames,
      video.duration
    );


  /*
    التحليل التقني
  */

  const technical =
    analyzeTechnical(
      metadata
    );


  /*
    درجة مركبة.

    ملاحظة:
    هذه ليست "توقعات خوارزمية Instagram".
    هي درجة تشخيصية مبنية على إشارات
    يمكن للمتصفح قياسها فعلياً.
  */

  const scores = {

    hook: hook.score,

    pacing: pacing.score,

    visual: visualAnalysis.score,

    technical: technical.score

  };


  const overall =
    calculateOverall(
      scores
    );


  /*
    تشخيص المشاكل
  */

  const diagnosis =
    buildDiagnosis({
      metadata,
      hook,
      pacing,
      visualAnalysis,
      technical
    });


  /*
    اقتراحات مرتبطة بالمشاكل
  */

  const recommendations =
    buildRecommendations({
      metadata,
      hook,
      pacing,
      visualAnalysis,
      technical
    });


  /*
    النتيجة النهائية
  */

  return {

    version: "2.0-local",

    createdAt:
      new Date().toISOString(),

    video: {

      file: {
        name: metadata.name,
        size: metadata.size,
        type: metadata.type
      },

      video: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        aspectRatio:
          metadata.aspectRatio
      },

      timing: {
        firstHalfSecond:
          frames.some(
            f => f.time <= 0.5
          )
      }

    },

    scores,

    overall,

    hook,

    pacing,

    visual: visualAnalysis,

    technical,

    diagnosis,

    recommendations

  };

}


/* =====================================================
   VIDEO LOADER
===================================================== */

function loadVideo(file) {

  return new Promise(
    (resolve, reject) => {

      const video =
        document.createElement("video");

      const url =
        URL.createObjectURL(file);

      video.preload = "metadata";

      video.muted = true;

      video.playsInline = true;

      video.setAttribute(
        "playsinline",
        ""
      );

      video.setAttribute(
        "webkit-playsinline",
        ""
      );

      video.onloadedmetadata = () => {

        URL.revokeObjectURL(url);

        if (
          !video.videoWidth ||
          !video.videoHeight
        ) {

          reject(
            new Error(
              "تعذر قراءة أبعاد الفيديو"
            )
          );

          return;
        }

        resolve(video);

      };


      video.onerror = () => {

        URL.revokeObjectURL(url);

        reject(
          new Error(
            "تعذر قراءة الفيديو"
          )
        );

      };


      video.src = url;

      video.load();

    }
  );

}


/* =====================================================
   TIMESTAMPS
===================================================== */

function buildTimestamps(duration) {

  const wanted = [

    0.1,
    0.3,
    0.5,
    0.8,
    1.0,
    1.5,
    2.0,
    3.0

  ];


  /*
    نضيف نقاطاً موزعة لاحقاً
    حتى نستطيع اكتشاف تغيرات المشاهد.
  */

  if (duration > 4) {

    wanted.push(
      duration * 0.35,
      duration * 0.5,
      duration * 0.7,
      duration * 0.85
    );

  }


  return [
    ...new Set(
      wanted
        .filter(
          t =>
            t >= 0 &&
            t < duration
        )
        .map(
          t =>
            round(t, 2)
        )
    )
  ].sort(
    (a, b) => a - b
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
            willReadFrequently: true
          }
        );


      const targetWidth = 240;

      const ratio =
        video.videoHeight /
        video.videoWidth;

      canvas.width =
        targetWidth;

      canvas.height =
        Math.max(
          1,
          Math.round(
            targetWidth * ratio
          )
        );


      let finished = false;


      const cleanup = () => {

        video.removeEventListener(
          "seeked",
          onSeeked
        );

      };


      const timeout =
        setTimeout(
          () => {

            if (finished)
              return;

            finished = true;

            cleanup();

            resolve(null);

          },
          1500
        );


      const onSeeked = () => {

        if (finished)
          return;

        finished = true;

        clearTimeout(timeout);

        cleanup();


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


          resolve({

            time,

            width:
              canvas.width,

            height:
              canvas.height,

            brightness:
              analysis.brightness,

            contrast:
              analysis.contrast,

            saturation:
              analysis.saturation,

            edgeDensity:
              analysis.edgeDensity,

            motionProxy:
              analysis.motionProxy

          });


        } catch (error) {

          resolve(null);

        }

      };


      video.addEventListener(
        "seeked",
        onSeeked,
        {
          once: true
        }
      );


      try {

        video.currentTime =
          Math.min(
            time,
            Math.max(
              0,
              video.duration - 0.01
            )
          );

      } catch (error) {

        clearTimeout(timeout);

        cleanup();

        resolve(null);

      }

    }
  );

}


/* =====================================================
   IMAGE ANALYSIS
===================================================== */

function analyzeImageData(imageData) {

  const data =
    imageData.data;

  const pixels =
    data.length / 4;


  let brightnessSum = 0;

  let saturationSum = 0;

  let squareSum = 0;

  let edgeCount = 0;

  let previousGray = null;


  /*
    نأخذ عينات وليس كل بكسل
    حتى يبقى الأداء جيداً على iPhone.
  */

  const step = 16;


  for (
    let i = 0;
    i < data.length;
    i += 4 * step
  ) {

    const r = data[i];

    const g = data[i + 1];

    const b = data[i + 2];


    const gray =
      (
        0.299 * r +
        0.587 * g +
        0.114 * b
      );


    brightnessSum += gray;

    squareSum += gray * gray;


    const max =
      Math.max(r, g, b);

    const min =
      Math.min(r, g, b);


    const saturation =
      max === 0
        ? 0
        : (max - min) / max;


    saturationSum +=
      saturation;


    if (
      previousGray !== null &&
      Math.abs(
        gray -
        previousGray
      ) > 45
    ) {

      edgeCount++;

    }


    previousGray =
      gray;

  }


  const brightness =
    brightnessSum /
    Math.max(
      1,
      Math.ceil(
        pixels / step
      )
    );


  const saturation =
    saturationSum /
    Math.max(
      1,
      Math.ceil(
        pixels / step
      )
    );


  const variance =
    squareSum /
    Math.max(
      1,
      Math.ceil(
        pixels / step
      )
    ) -
    brightness *
    brightness;


  const contrast =
    Math.sqrt(
      Math.max(
        0,
        variance
      )
    );


  const edgeDensity =
    edgeCount /
    Math.max(
      1,
      Math.ceil(
        pixels / step
      )
    );


  /*
    motionProxy هنا ليس Motion حقيقياً.
    هو مؤشر بصري تقريبي داخل الإطار.
  */

  const motionProxy =
    Math.min(
      100,
      edgeDensity * 250
    );


  return {

    brightness:
      round(
        normalize(
          brightness,
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
        saturation * 100
      ),

    edgeDensity:
      round(
        edgeDensity * 100
      ),

    motionProxy:
      round(
        motionProxy
      )

  };

}


/* =====================================================
   VISUAL ANALYSIS
===================================================== */

function analyzeFrames(frames) {

  if (!frames.length) {

    return {

      score: 0,

      averageBrightness: 0,

      averageContrast: 0,

      averageSaturation: 0,

      visualVariation: 0

    };

  }


  const average = key => {

    return (
      frames.reduce(
        (sum, frame) =>
          sum + (
            Number(
              frame[key]
            ) || 0
          ),
        0
      ) /
      frames.length
    );

  };


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


  /*
    التغير بين الإطارات
  */

  let variation = 0;


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    variation +=
      Math.abs(
        frames[i].brightness -
        frames[i - 1].brightness
      );

  }


  if (frames.length > 1) {

    variation /=
      frames.length - 1;

  }


  /*
    نفضل صورة ليست مظلمة جداً
    وليست مسطحة تماماً.
  */

  let score = 50;


  if (
    brightness >= 25 &&
    brightness <= 85
  ) {

    score += 12;

  }


  if (contrast >= 20) {

    score += 12;

  }


  if (
    saturation >= 15 &&
    saturation <= 80
  ) {

    score += 8;

  }


  if (variation >= 4) {

    score += 10;

  }


  return {

    score:
      clamp(
        Math.round(score),
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
   HOOK ANALYSIS
===================================================== */

function analyzeHook(
  frames,
  duration
) {

  const firstFrames =
    frames.filter(
      frame =>
        frame.time <= 1
    );


  if (!firstFrames.length) {

    return {

      score: 0,

      risk: "تعذر تحليل البداية",

      observations: []

    };

  }


  let score = 50;

  const observations = [];


  const first =
    firstFrames[0];


  /*
    البداية المظلمة جداً
    قد تكون مشكلة إذا استمرت.
  */

  if (
    first.brightness < 12
  ) {

    score -= 18;

    observations.push(
      "البداية مظلمة جداً وقد لا توقف السكرول بصرياً."
    );

  } else {

    score += 8;

  }


  /*
    contrast
  */

  if (
    first.contrast >= 25
  ) {

    score += 10;

    observations.push(
      "هناك تباين بصري جيد في البداية."
    );

  } else {

    score -= 8;

    observations.push(
      "التباين البصري في البداية منخفض."
    );

  }


  /*
    تغير مبكر
  */

  if (
    firstFrames.length >= 2
  ) {

    const earlyChange =
      Math.abs(
        firstFrames[1].brightness -
        firstFrames[0].brightness
      );


    if (
      earlyChange >= 8
    ) {

      score += 12;

      observations.push(
        "يوجد تغير بصري مبكر يساعد على كسر النمط."
      );

    } else {

      score -= 5;

      observations.push(
        "البداية ثابتة نسبياً ولا يظهر تغير بصري سريع."
      );

    }

  }


  /*
    لا نستطيع من الصورة وحدها معرفة
    معنى الكلام أو قوة الجملة.
  */

  observations.push(
    "تحليل النص والصوت والمعنى غير محسوب في هذه المرحلة."
  );


  let risk =
    "متوسط";


  if (score < 45)
    risk = "مرتفع";

  if (score >= 70)
    risk = "منخفض";


  return {

    score:
      clamp(
        Math.round(score),
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

      score: 50,

      changeRate: 0,

      assessment:
        "بيانات غير كافية"

    };

  }


  let changes = 0;


  for (
    let i = 1;
    i < frames.length;
    i++
  ) {

    const brightnessChange =
      Math.abs(
        frames[i].brightness -
        frames[i - 1].brightness
      );


    const contrastChange =
      Math.abs(
        frames[i].contrast -
        frames[i - 1].contrast
      );


    const change =
      brightnessChange +
      contrastChange;


    if (change > 12) {

      changes++;

    }

  }


  const changeRate =
    changes /
    Math.max(
      1,
      frames.length - 1
    );


  let score = 55;


  if (
    duration <= 12
  ) {

    score += 10;

  } else if (
    duration > 30
  ) {

    score -= 10;

  }


  if (
    changeRate >= 0.25 &&
    changeRate <= 0.8
  ) {

    score += 15;

  }


  if (
    changeRate < 0.1
  ) {

    score -= 15;

  }


  if (
    changeRate > 0.9
  ) {

    score -= 5;

  }


  let assessment =
    "إيقاع متوسط";


  if (score >= 75)
    assessment =
      "إيقاع جيد";

  if (score < 50)
    assessment =
      "الإيقاع قد يكون بطيئاً أو غير متنوع";


  return {

    score:
      clamp(
        Math.round(score),
        0,
        100
      ),

    changeRate:
      round(
        changeRate * 100
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

  let score = 50;

  const observations = [];


  /*
    Vertical video
  */

  const vertical =
    metadata.height >
    metadata.width;


  if (vertical) {

    score += 25;

    observations.push(
      "الفيديو عمودي ومناسب للفورمات القصير."
    );

  } else {

    score -= 20;

    observations.push(
      "الفيديو ليس عمودياً؛ قد يحتاج إلى إعادة تأطير."
    );

  }


  /*
    9:16 تقريباً
  */

  const ratio =
    metadata.width /
    metadata.height;


  if (
    ratio >= 0.53 &&
    ratio <= 0.60
  ) {

    score += 15;

  } else {

    observations.push(
      "نسبة الأبعاد ليست 9:16 تقريباً."
    );

  }


  /*
    Resolution
  */

  if (
    metadata.height >= 1280
  ) {

    score += 10;

  } else {

    observations.push(
      "الدقة أقل من 1280px عمودياً."
    );

  }


  return {

    score:
      clamp(
        Math.round(score),
        0,
        100
      ),

    observations

  };

}


/* =====================================================
   OVERALL
===================================================== */

function calculateOverall(
  scores
) {

  /*
    الـHook يأخذ وزناً أعلى
    لأن البداية نقطة مهمة جداً
    في الفيديوهات القصيرة.

    هذه ليست معادلة Instagram الرسمية.
  */

  const weighted =

    scores.hook * 0.35 +

    scores.pacing * 0.25 +

    scores.visual * 0.20 +

    scores.technical * 0.20;


  return clamp(
    Math.round(
      weighted
    ),
    0,
    100
  );

}


/* =====================================================
   DIAGNOSIS
===================================================== */

function buildDiagnosis({
  metadata,
  hook,
  pacing,
  visualAnalysis,
  technical
}) {

  const list = [];


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
    visualAnalysis.score < 60
  ) {

    list.push(
      "التركيب البصري يحتاج تحسيناً من ناحية الإضاءة والتباين والتغير البصري."
    );

  }


  if (
    technical.score < 70
  ) {

    list.push(
      ...technical.observations
    );

  }


  if (!list.length) {

    list.push(
      "لم يتم اكتشاف مشكلة تقنية أو بصرية كبيرة في القياسات المتاحة."
    );

  }


  return list;

}


/* =====================================================
   RECOMMENDATIONS
===================================================== */

function buildRecommendations({
  metadata,
  hook,
  pacing,
  visualAnalysis,
  technical
}) {

  const list = [];


  if (
    hook.score < 60
  ) {

    list.push(
      "اختبر بداية مختلفة خلال أول 0.5–1 ثانية: حركة، تغيير بصري، أو جملة واضحة تعطي سبباً فورياً للاستمرار."
    );

    list.push(
      "ضع الفكرة الأساسية أو الوعد للمشاهد في بداية الفيديو بدلاً من تأجيله."
    );

  }


  if (
    pacing.score < 60
  ) {

    list.push(
      "اختصر اللقطات التي لا تضيف معلومة أو إحساساً جديداً، واختبر انتقالاً أسرع في المقاطع البطيئة."
    );

  }


  if (
    visualAnalysis.averageBrightness < 20
  ) {

    list.push(
      "ارفع إضاءة اللقطات الأولى، خصوصاً إذا كان العنصر الأساسي غير واضح على شاشة الهاتف."
    );

  }


  if (
    visualAnalysis.averageContrast < 20
  ) {

    list.push(
      "زد التباين البصري بين الشخص/العنصر الأساسي والخلفية."
    );

  }


  if (
    technical.score < 70
  ) {

    list.push(
      "حافظ على فيديو عمودي قريب من 9:16 وبأبعاد مناسبة للفيديوهات القصيرة."
    );

  }


  if (!list.length) {

    list.push(
      "لا توجد تعديلات تقنية واضحة من القياسات الحالية. التركيز التالي يجب أن يكون على المعنى، الصوت، النص والـHook."
    );

  }


  return list;

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

  if (!height)
    return "unknown";


  const ratio =
    width / height;


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


function formatBytes(bytes) {

  if (!bytes)
    return "0 B";


  if (
    bytes <
    1024
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
    (1024 * 1024)
  ).toFixed(1)} MB`;

}
