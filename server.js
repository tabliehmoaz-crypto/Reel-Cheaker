import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 150 * 1024 * 1024 }
});

const UI_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>REEL CHECK - فحص الريلز</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-neutral-950 text-neutral-100 min-h-screen p-4 pb-12">
  <div class="max-w-md mx-auto">
    <header class="text-center my-6">
      <div class="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-xs text-neutral-400 mb-2">
        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> فحص ما قبل النشر
      </div>
      <h1 class="text-2xl font-black tracking-tight">REEL CHECK</h1>
      <p class="text-xs text-neutral-400 mt-1">حلّل الريلز بصرياً وصوتياً قبل نشره على إنستغرام/تيك توك</p>
    </header>

    <div id="uploadSection" class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-center shadow-xl">
      <div class="border-2 border-dashed border-neutral-700 rounded-xl p-6 mb-4">
        <svg class="w-10 h-10 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <p class="text-sm font-medium mb-1">اختر فيديو من ألبوم الكاميرا</p>
        <p class="text-xs text-neutral-500">يدعم HEVC, MOV, MP4 الخاصة بالآيفون</p>
        <input type="file" id="videoInput" accept="video/*" class="hidden">
        <button onclick="document.getElementById('videoInput').click()" class="mt-4 bg-white text-black font-semibold text-xs py-2.5 px-5 rounded-full shadow hover:bg-neutral-200">
          تحديد الفيديو
        </button>
      </div>

      <div id="selectedFileText" class="text-xs text-neutral-400 mb-3 hidden"></div>

      <button id="analyzeBtn" onclick="startAnalysis()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 hidden">
        بدء الفحص والتحليل الذكي
      </button>

      <div id="loading" class="hidden py-6 text-center space-y-3">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-neutral-300 font-medium animate-pulse">جاري فحص الإطارات والصوت ونصوص الشاشة...</p>
      </div>
    </div>

    <div id="reportSection" class="hidden space-y-4 mt-6">
      <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span id="decisionBadge" class="text-xs font-bold px-3 py-1 rounded-full border"></span>
          <div class="text-left">
            <span id="totalScore" class="text-2xl font-black"></span>
            <span class="text-neutral-500 text-xs">/ 100</span>
          </div>
        </div>
        <p id="verdictText" class="text-xs text-neutral-200 leading-relaxed font-medium"></p>
      </div>

      <div class="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4">
        <div class="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">أهم تعديل فوري لرفع المشاهدات</div>
        <p id="singleFix" class="text-xs font-semibold text-blue-200"></p>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
        <h3 class="text-xs font-bold text-neutral-300">تحليل أول 3 ثوانٍ (Hook)</h3>
        <p id="hookSummary" class="text-xs text-neutral-400 leading-relaxed"></p>
      </div>

      <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
        <h3 class="text-xs font-bold text-neutral-300">3 خيارات لهوك أقوى للفيديو</h3>
        <div id="betterHooksList" class="space-y-2"></div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <h4 class="text-[11px] font-bold text-red-400 mb-1">أشياء يُفضل حذفها (Cut)</h4>
          <ul id="cutList" class="text-[10px] text-neutral-300 list-disc pr-3 space-y-1"></ul>
        </div>
        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
          <h4 class="text-[11px] font-bold text-amber-400 mb-1">أشياء غيّرها (Change)</h4>
          <ul id="changeList" class="text-[10px] text-neutral-300 list-disc pr-3 space-y-1"></ul>
        </div>
      </div>

      <button onclick="location.reload()" class="w-full bg-neutral-800 text-neutral-300 text-xs font-bold py-3 rounded-xl">
        فحص فيديو آخر
      </button>
    </div>
  </div>

  <script>
    const videoInput = document.getElementById('videoInput');
    const selectedFileText = document.getElementById('selectedFileText');
    const analyzeBtn = document.getElementById('analyzeBtn');

    videoInput.addEventListener('change', () => {
      if (videoInput.files[0]) {
        selectedFileText.textContent = 'تم اختيار: ' + videoInput.files[0].name;
        selectedFileText.classList.remove('hidden');
        analyzeBtn.classList.remove('hidden');
      }
    });

    async function startAnalysis() {
      const file = videoInput.files[0];
      if (!file) return;

      document.getElementById('loading').classList.remove('hidden');
      analyzeBtn.classList.add('hidden');
      document.querySelector('.border-dashed').classList.add('hidden');

      const formData = new FormData();
      formData.append('video', file);

      try {
        const res = await fetch('/api/analyze', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'فشل التحليل');
        renderReport(data.report);
      } catch (err) {
        alert('خطأ: ' + err.message);
        location.reload();
      }
    }

    function renderReport(r) {
      document.getElementById('uploadSection').classList.add('hidden');
      document.getElementById('reportSection').classList.remove('hidden');

      const badge = document.getElementById('decisionBadge');
      badge.textContent = r.decision;
      if (r.decision === 'PUBLISH') badge.className = 'text-xs font-bold px-3 py-1 rounded-full border bg-emerald-950 text-emerald-400 border-emerald-600';
      else if (r.decision.includes('MINOR')) badge.className = 'text-xs font-bold px-3 py-1 rounded-full border bg-amber-950 text-amber-400 border-amber-600';
      else badge.className = 'text-xs font-bold px-3 py-1 rounded-full border bg-rose-950 text-rose-400 border-rose-600';

      document.getElementById('totalScore').textContent = r.score.total;
      document.getElementById('verdictText').textContent = r.verdict;
      document.getElementById('singleFix').textContent = r.single_most_important_change.action;
      document.getElementById('hookSummary').textContent = r.hook.first_3_seconds_summary;

      const hooksList = document.getElementById('betterHooksList');
      hooksList.innerHTML = r.better_hooks.map(h => \`
        <div class="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
          <span class="text-[10px] text-neutral-500 font-bold block mb-1">\${h.category}</span>
          <p class="text-white font-medium">"\${h.script}"</p>
        </div>
      \`).join('');

      document.getElementById('cutList').innerHTML = r.recommendations.cut.map(i => \`<li>\${i}</li>\`).join('') || '<li>لا يوجد</li>';
      document.getElementById('changeList').innerHTML = r.recommendations.change.map(i => \`<li>\${i}</li>\`).join('') || '<li>لا يوجد</li>';
    }
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(UI_HTML);
});

app.post('/api/analyze', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لم يتم رفع فيديو' });

  const tempDir = path.join('/tmp', uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });
  const framesDir = path.join(tempDir, 'frames');
  fs.mkdirSync(framesDir);
  const audioPath = path.join(tempDir, 'audio.mp3');

  try {
    await new Promise((resolve) => {
      ffmpeg(req.file.path)
        .noVideo()
        .audioCodec('libmp3lame')
        .save(audioPath)
        .on('end', resolve)
        .on('error', () => resolve(null));
    });

    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .screenshots({
          timestamps: [0.2, 0.8, 1.5, 2.5, 4.0, 6.0],
          filename: 'frame_%s.jpg',
          folder: framesDir,
          size: '640x?'
        })
        .on('end', resolve)
        .on('error', reject);
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('مفتاح GEMINI_API_KEY غير موجود في إعدادات السيرفر.');

    const ai = new GoogleGenAI({ apiKey });
    const contents = [];

    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
    for (const f of frameFiles) {
      const b64 = fs.readFileSync(path.join(framesDir, f)).toString('base64');
      contents.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } });
    }

    if (fs.existsSync(audioPath)) {
      const audioB64 = fs.readFileSync(audioPath).toString('base64');
      contents.push({ inlineData: { mimeType: 'audio/mp3', data: audioB64 } });
    }

    contents.push({
      text: "Analyze this vertical short-form video (Reel). Return detailed editorial feedback in JSON format in Arabic."
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.OBJECT,
              properties: { total: { type: Type.NUMBER } },
              required: ["total"]
            },
            decision: { type: Type.STRING, enum: ["PUBLISH", "PUBLISH AFTER MINOR FIXES", "REWORK", "DO NOT PUBLISH YET"] },
            verdict: { type: Type.STRING },
            hook: {
              type: Type.OBJECT,
              properties: { first_3_seconds_summary: { type: Type.STRING } },
              required: ["first_3_seconds_summary"]
            },
            single_most_important_change: {
              type: Type.OBJECT,
              properties: { action: { type: Type.STRING } },
              required: ["action"]
            },
            better_hooks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { category: { type: Type.STRING }, script: { type: Type.STRING } },
                required: ["category", "script"]
              }
            },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                cut: { type: Type.ARRAY, items: { type: Type.STRING } },
                change: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["cut", "change"]
            }
          },
          required: ["score", "decision", "verdict", "hook", "single_most_important_change", "better_hooks", "recommendations"]
        }
      }
    });

    const report = JSON.parse(response.text);

    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(req.file.path);

    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'خطأ أثناء المعالجة' });
  }
});

app.listen(PORT, () => console.log(`Reel Check running on port ${PORT}`));
