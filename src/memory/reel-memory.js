/*
  REEL CHECK — LOCAL MEMORY
  --------------------------------
  ذاكرة محلية تحفظ تحليلات الريلز ونتائجها على الجهاز.
  لا يوجد اتصال بأي خادم.
*/

const STORAGE_KEY = "reel_check_memory_v1";
const MAX_RECORDS = 100;


/* =====================================================
   GET MEMORY
===================================================== */

export function getMemory() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw)
      return [];

    const parsed =
      JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    return [];

  }

}


/* =====================================================
   SAVE ANALYSIS
===================================================== */

export function saveAnalysis(
  analysis
) {

  if (!analysis)
    return null;


  const memory =
    getMemory();


  const record = {

    id:
      createId(),

    createdAt:
      new Date().toISOString(),

    analysis

  };


  memory.unshift(
    record
  );


  /*
    لا نسمح للذاكرة
    أن تصبح ضخمة على الهاتف.
  */

  const limited =
    memory.slice(
      0,
      MAX_RECORDS
    );


  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        limited
      )
    );

  } catch (error) {

    /*
      إذا امتلأت مساحة التخزين
      نحذف أقدم النتائج ونحاول مجدداً.
    */

    try {

      const smaller =
        limited.slice(
          0,
          25
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          smaller
        )
      );

    } catch (storageError) {

      console.warn(
        "تعذر حفظ الذاكرة المحلية"
      );

    }

  }


  return record;

}


/* =====================================================
   SAVE REAL PERFORMANCE
===================================================== */

export function savePerformance(
  id,
  performance
) {

  const memory =
    getMemory();


  const index =
    memory.findIndex(
      item =>
        item.id === id
    );


  if (index === -1)
    return false;


  memory[index].performance = {

    ...performance,

    updatedAt:
      new Date().toISOString()

  };


  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        memory
      )
    );

    return true;

  } catch (error) {

    return false;

  }

}


/* =====================================================
   GET RECORD
===================================================== */

export function getRecord(
  id
) {

  const memory =
    getMemory();


  return (
    memory.find(
      item =>
        item.id === id
    ) ||
    null
  );

}


/* =====================================================
   DELETE RECORD
===================================================== */

export function deleteRecord(
  id
) {

  const memory =
    getMemory();


  const filtered =
    memory.filter(
      item =>
        item.id !== id
    );


  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        filtered
      )
    );

    return true;

  } catch (error) {

    return false;

  }

}


/* =====================================================
   CLEAR MEMORY
===================================================== */

export function clearMemory() {

  try {

    localStorage.removeItem(
      STORAGE_KEY
    );

    return true;

  } catch (error) {

    return false;

  }

}


/* =====================================================
   MEMORY SUMMARY
===================================================== */

export function getMemorySummary() {

  const memory =
    getMemory();


  if (!memory.length) {

    return {

      totalReels: 0,

      reelsWithResults: 0,

      averageScore: null,

      averageViews: null,

      bestReel: null,

      worstReel: null

    };

  }


  const analyses =
    memory.filter(
      item =>
        item.analysis
    );


  const scores =
    analyses
      .map(
        item =>
          Number(
            item.analysis?.overall
          )
      )
      .filter(
        Number.isFinite
      );


  const views =
    memory
      .map(
        item =>
          Number(
            item.performance?.views
          )
      )
      .filter(
        Number.isFinite
      );


  const best =
    analyses
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          (
            b.analysis?.overall || 0
          ) -
          (
            a.analysis?.overall || 0
          )
      )[0] || null;


  const worst =
    analyses
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          (
            a.analysis?.overall || 0
          ) -
          (
            b.analysis?.overall || 0
          )
      )[0] || null;


  return {

    totalReels:
      memory.length,

    reelsWithResults:
      analyses.length,

    averageScore:
      scores.length
        ? average(scores)
        : null,

    averageViews:
      views.length
        ? average(views)
        : null,

    bestReel:
      best,

    worstReel:
      worst

  };

}


/* =====================================================
   GET PERFORMANCE DATA
===================================================== */

export function getPerformanceDataset() {

  const memory =
    getMemory();


  return memory
    .filter(
      item =>
        item.performance
    )
    .map(
      item => ({

        id:
          item.id,

        createdAt:
          item.createdAt,

        score:
          item.analysis?.overall ??
          null,

        hookScore:
          item.analysis?.scores?.hook ??
          null,

        pacingScore:
          item.analysis?.scores?.pacing ??
          null,

        visualScore:
          item.analysis?.scores?.visual ??
          null,

        technicalScore:
          item.analysis?.scores?.technical ??
          null,

        views:
          Number(
            item.performance?.views
          ) || 0,

        likes:
          Number(
            item.performance?.likes
          ) || 0,

        comments:
          Number(
            item.performance?.comments
          ) || 0,

        shares:
          Number(
            item.performance?.shares
          ) || 0,

        saves:
          Number(
            item.performance?.saves
          ) || 0,

        watchTime:
          Number(
            item.performance?.watchTime
          ) || 0,

        completionRate:
          Number(
            item.performance?.completionRate
          ) || 0

      })
    );

}


/* =====================================================
   SIMPLE LEARNING SIGNALS
===================================================== */

export function learnFromPerformance() {

  const dataset =
    getPerformanceDataset();


  if (
    dataset.length < 3
  ) {

    return {

      enoughData: false,

      message:
        "نحتاج على الأقل 3 ريلز بنتائج حقيقية قبل استخراج أنماط مفيدة.",

      patterns: []

    };

  }


  const patterns = [];


  /*
    العلاقة بين Hook Score
    والمشاهدات.
  */

  const hookCorrelation =
    calculateCorrelation(
      dataset.map(
        item =>
          item.hookScore
      ),
      dataset.map(
        item =>
          item.views
      )
    );


  if (
    hookCorrelation !== null
  ) {

    patterns.push({

      type:
        "hook_vs_views",

      correlation:
        round(
          hookCorrelation,
          2
        ),

      interpretation:
        interpretCorrelation(
          hookCorrelation,
          "الـHook"
        )

    });

  }


  /*
    العلاقة بين الإيقاع
    والمشاهدات.
  */

  const pacingCorrelation =
    calculateCorrelation(
      dataset.map(
        item =>
          item.pacingScore
      ),
      dataset.map(
        item =>
          item.views
      )
    );


  if (
    pacingCorrelation !== null
  ) {

    patterns.push({

      type:
        "pacing_vs_views",

      correlation:
        round(
          pacingCorrelation,
          2
        ),

      interpretation:
        interpretCorrelation(
          pacingCorrelation,
          "الإيقاع"
        )

    });

  }


  /*
    أفضل الريلز حسب المشاهدات.
  */

  const sorted =
    dataset
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          b.views -
          a.views
      );


  const top =
    sorted.slice(
      0,
      Math.max(
        1,
        Math.ceil(
          sorted.length * 0.25
        )
      )
    );


  const bottom =
    sorted.slice(
      Math.floor(
        sorted.length * 0.75
      )
    );


  patterns.push({

    type:
      "top_vs_bottom",

    topAverageHook:
      average(
        top.map(
          item =>
            item.hookScore
        )
      ),

    bottomAverageHook:
      average(
        bottom.map(
          item =>
            item.hookScore
        )
      ),

    topAveragePacing:
      average(
        top.map(
          item =>
            item.pacingScore
        )
      ),

    bottomAveragePacing:
      average(
        bottom.map(
          item =>
            item.pacingScore
        )
      )

  });


  return {

    enoughData: true,

    sampleSize:
      dataset.length,

    patterns

  };

}


/* =====================================================
   EXPORT MEMORY
===================================================== */

export function exportMemory() {

  const memory =
    getMemory();


  return JSON.stringify(
    memory,
    null,
    2
  );

}


/* =====================================================
   IMPORT MEMORY
===================================================== */

export function importMemory(
  json
) {

  try {

    const parsed =
      JSON.parse(json);


    if (
      !Array.isArray(parsed)
    ) {

      return false;

    }


    const limited =
      parsed.slice(
        0,
        MAX_RECORDS
      );


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        limited
      )
    );


    return true;

  } catch (error) {

    return false;

  }

}


/* =====================================================
   HELPERS
===================================================== */

function createId() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2, 8)
  );

}


function average(
  values
) {

  const valid =
    values
      .map(Number)
      .filter(
        Number.isFinite
      );


  if (!valid.length)
    return 0;


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


function calculateCorrelation(
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
        p => p[0]
      )
    );


  const meanY =
    average(
      pairs.map(
        p => p[1]
      )
    );


  let numerator = 0;

  let denominatorX = 0;

  let denominatorY = 0;


  for (
    const [
      a,
      b
    ] of pairs
  ) {

    const dx =
      a - meanX;

    const dy =
      b - meanY;


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


function interpretCorrelation(
  value,
  variable
) {

  const abs =
    Math.abs(value);


  if (
    abs < 0.2
  ) {

    return `${variable} لا يظهر ارتباطاً واضحاً بالمشاهدات ضمن البيانات الحالية.`;

  }


  if (
    value > 0
  ) {

    return `${variable} يظهر ارتباطاً إيجابياً مع المشاهدات ضمن بيانات الحساب الحالية، لكن هذا لا يعني وجود علاقة سببية.`;

  }


  return `${variable} يظهر ارتباطاً سلبياً مع المشاهدات ضمن بيانات الحساب الحالية، ويحتاج ذلك إلى بيانات أكثر للتأكد.`;

}
