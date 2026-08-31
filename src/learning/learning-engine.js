/*
  REEL CHECK — LOCAL LEARNING ENGINE
  -----------------------------------
  يتعلم من نتائج الريلز الحقيقية التي يدخلها المستخدم.
  
  مهم:
  هذا ليس نموذج Machine Learning ضخم.
  هو نظام تعلم محلي إحصائي:
  كلما زادت البيانات، أصبحت النصائح
  أكثر ارتباطاً بسلوك الحساب نفسه.
*/

import {
  getMemory,
  getPerformanceDataset
} from "../memory/reel-memory.js";


const MINIMUM_DATA = 3;


/* =====================================================
   BUILD ACCOUNT PROFILE
===================================================== */

export function buildAccountProfile() {

  const dataset =
    getPerformanceDataset();


  if (
    dataset.length < MINIMUM_DATA
  ) {

    return {

      ready: false,

      sampleSize:
        dataset.length,

      message:
        `نحتاج ${MINIMUM_DATA - dataset.length} ريل إضافي بنتائج حقيقية قبل بناء نمط موثوق للحساب.`,

      profile: null

    };

  }


  const profile = {

    sampleSize:
      dataset.length,

    averages:
      calculateAverages(
        dataset
      ),

    ranges:
      calculateRanges(
        dataset
      ),

    correlations:
      calculateCorrelations(
        dataset
      ),

    winners:
      findWinners(
        dataset
      ),

    weaknesses:
      findWeaknesses(
        dataset
      )

  };


  return {

    ready: true,

    sampleSize:
      dataset.length,

    message:
      "تم بناء ملف سلوك أولي للحساب.",

    profile

  };

}


/* =====================================================
   PREDICT RELATIVE PERFORMANCE
===================================================== */

export function estimatePerformance(
  analysis
) {

  const account =
    buildAccountProfile();


  /*
    بدون بيانات كافية:
    لا نخترع توقعات.
  */

  if (
    !account.ready
  ) {

    return {

      confidence: "منخفضة",

      estimatedLevel:
        "غير كافٍ للتوقع",

      explanation:
        account.message

    };

  }


  const profile =
    account.profile;


  const score =
    Number(
      analysis?.overall
    ) || 0;


  const hook =
    Number(
      analysis?.scores?.hook
    ) || 0;


  const pacing =
    Number(
      analysis?.scores?.pacing
    ) || 0;


  /*
    نقارن الريل الحالي
    بأداء الريلز السابقة.
  */

  const avgScore =
    profile.averages.score;


  const scoreDifference =
    score -
    avgScore;


  let estimatedLevel =
    "قريب من متوسط الحساب";


  if (
    scoreDifference >= 15
  ) {

    estimatedLevel =
      "أعلى من متوسط الحساب";

  } else if (
    scoreDifference <= -15
  ) {

    estimatedLevel =
      "أقل من متوسط الحساب";

  }


  /*
    فحص الـHook
  */

  const hookCorrelation =
    profile.correlations.hookViews;


  let hookSignal =
    "غير واضح";


  if (
    hookCorrelation !== null
  ) {

    if (
      hookCorrelation >= 0.5
    ) {

      hookSignal =
        "الـHook مرتبط إيجابياً بالمشاهدات في بيانات الحساب.";

    } else if (
      hookCorrelation <= -0.5
    ) {

      hookSignal =
        "الـHook لا يظهر السلوك المتوقع في البيانات الحالية.";

    } else {

      hookSignal =
        "ارتباط الـHook بالمشاهدات ضعيف حالياً.";

    }

  }


  /*
    مستوى الثقة يعتمد على كمية البيانات.
  */

  let confidence =
    "منخفضة";


  if (
    profile.sampleSize >= 5
  ) {

    confidence =
      "متوسطة";

  }


  if (
    profile.sampleSize >= 10
  ) {

    confidence =
      "جيدة";

  }


  if (
    profile.sampleSize >= 20
  ) {

    confidence =
      "أفضل";

  }


  return {

    confidence,

    estimatedLevel,

    scoreDifference:
      Math.round(
        scoreDifference
      ),

    hookSignal,

    pacingAverage:
      Math.round(
        profile.averages.pacing
      ),

    currentHook:
      hook,

    currentPacing:
      pacing

  };

}


/* =====================================================
   GENERATE LEARNED RECOMMENDATIONS
===================================================== */

export function generateLearnedRecommendations(
  analysis
) {

  const account =
    buildAccountProfile();


  if (
    !account.ready
  ) {

    return {

      ready: false,

      recommendations: [

        "استمر بتسجيل نتائج الريلز حتى تبدأ الأداة ببناء نمط خاص بحسابك."

      ]

    };

  }


  const profile =
    account.profile;


  const recommendations = [];


  /*
    أفضل عامل مرتبط بالمشاهدات
  */

  const factors = [

    {
      name:
        "hook",

      correlation:
        profile.correlations.hookViews,

      recommendation:
        "ركز أكثر على قوة أول ثانية والوضوح الفوري للفكرة."

    },

    {
      name:
        "pacing",

      correlation:
        profile.correlations.pacingViews,

      recommendation:
        "اختبر إيقاعاً أسرع وانتقالات أكثر عندما تكون اللقطات الطويلة مرتبطة بانخفاض الأداء."

    },

    {
      name:
        "overall",

      correlation:
        profile.correlations.scoreViews,

      recommendation:
        "حافظ على العناصر التي ترفع الدرجة العامة للريل قبل إضافة تغييرات عشوائية."

    }

  ];


  factors
    .filter(
      factor =>
        factor.correlation !== null
    )
    .sort(
      (
        a,
        b
      ) =>
        Math.abs(
          b.correlation
        ) -
        Math.abs(
          a.correlation
        )
    )
    .slice(
      0,
      2
    )
    .forEach(
      factor => {

        if (
          factor.correlation > 0.3
        ) {

          recommendations.push(
            factor.recommendation
          );

        }

      }
    );


  /*
    مقارنة الريل الحالي
    بأفضل الريلز.
  */

  const currentScore =
    Number(
      analysis?.overall
    ) || 0;


  if (
    currentScore <
    profile.averages.score - 10
  ) {

    recommendations.push(
      `درجة هذا الريل أقل من متوسط حسابك بحوالي ${Math.round(profile.averages.score - currentScore)} نقطة؛ لا تنشره قبل مراجعة نقطة الضعف الأساسية.`
    );

  }


  if (
    currentScore >
    profile.averages.score + 10
  ) {

    recommendations.push(
      "هذا الريل أعلى من متوسط جودة ريلاتك السابقة؛ لا تفرط في تعديله قبل الاختبار."
    );

  }


  if (
    !recommendations.length
  ) {

    recommendations.push(
      "لا توجد إشارة تعلم قوية كافية لتغيير القرار الحالي."
    );

  }


  return {

    ready: true,

    sampleSize:
      profile.sampleSize,

    recommendations

  };

}


/* =====================================================
   FIND BEST PATTERNS
===================================================== */

export function findBestPatterns() {

  const account =
    buildAccountProfile();


  if (
    !account.ready
  ) {

    return null;

  }


  return {

    bestReels:
      account.profile.winners,

    weaknesses:
      account.profile.weaknesses,

    averages:
      account.profile.averages,

    correlations:
      account.profile.correlations

  };

}


/* =====================================================
   AVERAGES
===================================================== */

function calculateAverages(
  dataset
) {

  return {

    score:
      average(
        dataset.map(
          item =>
            item.score
        )
      ),

    hook:
      average(
        dataset.map(
          item =>
            item.hookScore
        )
      ),

    pacing:
      average(
        dataset.map(
          item =>
            item.pacingScore
        )
      ),

    visual:
      average(
        dataset.map(
          item =>
            item.visualScore
        )
      ),

    technical:
      average(
        dataset.map(
          item =>
            item.technicalScore
        )
      ),

    views:
      average(
        dataset.map(
          item =>
            item.views
        )
      ),

    likes:
      average(
        dataset.map(
          item =>
            item.likes
        )
      ),

    shares:
      average(
        dataset.map(
          item =>
            item.shares
        )
      ),

    saves:
      average(
        dataset.map(
          item =>
            item.saves
        )
      ),

    completionRate:
      average(
        dataset.map(
          item =>
            item.completionRate
        )
      )

  };

}


/* =====================================================
   RANGES
===================================================== */

function calculateRanges(
  dataset
) {

  return {

    views:
      range(
        dataset.map(
          item =>
            item.views
        )
      ),

    score:
      range(
        dataset.map(
          item =>
            item.score
        )
      ),

    hook:
      range(
        dataset.map(
          item =>
            item.hookScore
        )
      ),

    pacing:
      range(
        dataset.map(
          item =>
            item.pacingScore
        )
      )

  };

}


/* =====================================================
   CORRELATIONS
===================================================== */

function calculateCorrelations(
  dataset
) {

  return {

    hookViews:
      correlation(
        dataset.map(
          item =>
            item.hookScore
        ),
        dataset.map(
          item =>
            item.views
        )
      ),

    pacingViews:
      correlation(
        dataset.map(
          item =>
            item.pacingScore
        ),
        dataset.map(
          item =>
            item.views
        )
      ),

    visualViews:
      correlation(
        dataset.map(
          item =>
            item.visualScore
        ),
        dataset.map(
          item =>
            item.views
        )
      ),

    scoreViews:
      correlation(
        dataset.map(
          item =>
            item.score
        ),
        dataset.map(
          item =>
            item.views
        )
      ),

    hookShares:
      correlation(
        dataset.map(
          item =>
            item.hookScore
        ),
        dataset.map(
          item =>
            item.shares
        )
      ),

    pacingCompletion:
      correlation(
        dataset.map(
          item =>
            item.pacingScore
        ),
        dataset.map(
          item =>
            item.completionRate
        )
      )

  };

}


/* =====================================================
   WINNERS
===================================================== */

function findWinners(
  dataset
) {

  return dataset
    .slice()
    .sort(
      (
        a,
        b
      ) =>
        b.views -
        a.views
    )
    .slice(
      0,
      Math.min(
        5,
        dataset.length
      )
    );

}


/* =====================================================
   WEAKNESSES
===================================================== */

function findWeaknesses(
  dataset
) {

  const averageScore =
    average(
      dataset.map(
        item =>
          item.score
      )
    );


  const averageHook =
    average(
      dataset.map(
        item =>
          item.hookScore
      )
    );


  const averagePacing =
    average(
      dataset.map(
        item =>
          item.pacingScore
      )
    );


  const weaknesses = [];


  if (
    averageHook < 60
  ) {

    weaknesses.push(
      "Hook"
    );

  }


  if (
    averagePacing < 60
  ) {

    weaknesses.push(
      "Pacing"
    );

  }


  if (
    averageScore < 60
  ) {

    weaknesses.push(
      "Overall quality"
    );

  }


  return weaknesses;

}


/* =====================================================
   STATISTICAL HELPERS
===================================================== */

function average(
  values
) {

  const valid =
    values
      .map(Number)
      .filter(
        Number.isFinite
      );


  if (
    !valid.length
  ) {

    return 0;

  }


  return (
    valid.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    valid.length
  );

}


function range(
  values
) {

  const valid =
    values
      .map(Number)
      .filter(
        Number.isFinite
      );


  if (
    !valid.length
  ) {

    return {

      min: null,

      max: null

    };

  }


  return {

    min:
      Math.min(
        ...valid
      ),

    max:
      Math.max(
        ...valid
      )

  };

}


function correlation(
  x,
  y
) {

  const pairs = [];


  for (
    let i = 0;
    i < Math.min(
      x.length,
      y.length
    );
    i++
  ) {

    const a =
      Number(x[i]);

    const b =
      Number(y[i]);


    if (
      Number.isFinite(a) &&
      Number.isFinite(b)
    ) {

      pairs.push([
        a,
        b
      ]);

    }

  }


  if (
    pairs.length < 3
  ) {

    return null;

  }


  const meanX =
    average(
      pairs.map(
        p =>
          p[0]
      )
    );


  const meanY =
    average(
      pairs.map(
        p =>
          p[1]
      )
    );


  let numerator = 0;

  let denominatorX = 0;

  let denominatorY = 0;


  for (
    const [
      xValue,
      yValue
    ] of pairs
  ) {

    const dx =
      xValue -
      meanX;

    const dy =
      yValue -
      meanY;


    numerator +=
      dx * dy;

    denominatorX +=
      dx * dx;

    denominatorY +=
      dy * dy;

  }


  const denominator =
    Math.sqrt(
      denominatorX *
      denominatorY
    );


  if (
    denominator === 0
  ) {

    return null;

  }


  return (
    numerator /
    denominator
  );

}
