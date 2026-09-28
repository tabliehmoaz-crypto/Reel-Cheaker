import express from "express";
import path from "path";
import os from "os";
import fs from "fs";
import { promises as fsp } from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import multer from "multer";
import { spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const TEMP_DIR = path.join(os.tmpdir(), "mti-edit");
await fsp.mkdir(TEMP_DIR, { recursive: true });

app.use(express.static(__dirname));
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 250 * 1024 * 1024 }
});

function runBinary(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr.slice(-5000) || binary + " exited with code " + code));
    });
  });
}

async function probeVideo(input) {
  const result = await runBinary("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-show_streams",
    "-of", "json",
    input
  ]);
  const data = JSON.parse(result.stdout || "{}");
  const video = (data.streams || []).find(s => s.codec_type === "video");
  const audio = (data.streams || []).find(s => s.codec_type === "audio");
  return {
    duration: Number(data.format?.duration || video?.duration || 0),
    hasAudio: Boolean(audio)
  };
}

function escDrawtext(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%");
}

function normalizeOperations(raw, duration) {
  const operations = Array.isArray(raw?.operations) ? raw.operations : [];
  return operations
    .filter(op => op && op.executable !== false)
    .map(op => ({
      ...op,
      start: Number.isFinite(Number(op.start)) ? Math.max(0, Number(op.start)) : 0,
      end: Number.isFinite(Number(op.end)) ? Math.min(duration, Number(op.end)) : duration,
      confidence: Number(op.confidence || 0)
    }))
    .filter(op => op.confidence >= 0.65 && op.end > op.start);
}

function mergeIntervals(intervals, duration) {
  const sorted = intervals
    .map(([start, end]) => [Math.max(0, start), Math.min(duration, end)])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const item of sorted) {
    const last = merged[merged.length - 1];
    if (last && item[0] <= last[1] + 0.03) last[1] = Math.max(last[1], item[1]);
    else merged.push(item);
  }
  return merged;
}

function buildKeepSegments(duration, removed) {
  const keep = [];
  let cursor = 0;
  for (const [start, end] of removed) {
    if (start > cursor + 0.03) keep.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < duration - 0.03) keep.push([cursor, duration]);
  return keep.filter(([start, end]) => end - start >= 0.08);
}

function buildFilterGraph(operations, duration, hasAudio) {
  const remove = operations
    .filter(op => op.action === "trim" || op.action === "cut")
    .map(op => [op.start, op.end]);

  const reordered = operations.find(op => op.action === "reorder" && Array.isArray(op.segments));
  let keepSegments = buildKeepSegments(duration, mergeIntervals(remove, duration));

  if (reordered?.segments?.length) {
    keepSegments = reordered.segments
      .map(s => [Number(s.start), Number(s.end)])
      .filter(s => Number.isFinite(s[0]) && Number.isFinite(s[1]) && s[1] > s[0]);
  }

  if (!keepSegments.length) throw new Error("التعديلات المقترحة تحذف كامل الفيديو.");

  const parts = [];
  for (let i = 0; i < keepSegments.length; i++) {
    const [start, end] = keepSegments[i];
    parts.push("[0:v]trim=start=" + start + ":end=" + end + ",setpts=PTS-STARTPTS[v" + i + "]");
    if (hasAudio) {
      parts.push("[0:a]atrim=start=" + start + ":end=" + end + ",asetpts=PTS-STARTPTS[a" + i + "]");
    }
  }

  if (keepSegments.length === 1) {
    parts.push("[v0]null[vbase]");
    if (hasAudio) parts.push("[a0]anull[abase]");
  } else {
    const inputsV = keepSegments.map((_, i) => "[v" + i + "]").join("");
    parts.push(inputsV + "concat=n=" + keepSegments.length + ":v=1:a=0[vbase]");
    if (hasAudio) {
      const inputsA = keepSegments.map((_, i) => "[a" + i + "]").join("");
      parts.push(inputsA + "concat=n=" + keepSegments.length + ":v=0:a=1[abase]");
    }
  }

  let videoLabel = "[vbase]";
  let audioLabel = hasAudio ? "[abase]" : null;

  const speedOps = operations.filter(op => op.action === "speed" && Number(op.speed) > 0);
  if (speedOps.length) {
    const factor = Math.max(0.5, Math.min(2, Number(speedOps[0].speed)));
    parts.push(videoLabel + "setpts=PTS/" + factor + "[vspeed]");
    videoLabel = "[vspeed]";
    if (hasAudio) {
      const atempo = Math.max(0.5, Math.min(2, factor));
      parts.push(audioLabel + "atempo=" + atempo + "[aspeed]");
      audioLabel = "[aspeed]";
    }
  }

  const audioOps = operations.filter(op => op.action === "audio");
  if (hasAudio && audioOps.length) {
    let current = audioLabel;
    for (let i = 0; i < audioOps.length; i++) {
      const op = audioOps[i];
      const next = "[aa" + i + "]";
      const filter = op.mute ? "volume=0" : ("volume=" + Math.max(0, Math.min(3, Number(op.volume ?? 1))));
      parts.push(current + filter + next);
      current = next;
    }
    audioLabel = current;
  }

  const textOps = operations.filter(op => op.action === "text" && op.text);
  for (let i = 0; i < textOps.length; i++) {
    const op = textOps[i];
    const next = "[vt" + i + "]";
    const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
    const position = op.position === "top" ? "x=(w-text_w)/2:y=80" :
      op.position === "bottom" ? "x=(w-text_w)/2:y=h-text_h-80" :
      "x=(w-text_w)/2:y=(h-text_h)/2";
    const between = op.start != null && op.end != null
      ? ":enable='between(t," + op.start + "," + op.end + ")'"
      : "";
    parts.push(videoLabel + "drawtext=fontfile=" + font + ":text='" + escDrawtext(op.text) + "':fontsize=52:fontcolor=white:borderw=3:bordercolor=black:" + position + between + next);
    videoLabel = next;
  }

  return { filter: parts.join(";"), videoLabel, audioLabel };
}

app.post("/api/mti/edit", upload.single("video"), async (req, res) => {
  const input = req.file?.path;
  let output = null;
  try {
    if (!input) return res.status(400).json({ error: "لم يتم إرسال فيديو." });

    let plan;
    try { plan = JSON.parse(req.body?.plan || "{}"); }
    catch { throw new Error("خطة التعديل غير صالحة."); }

    const meta = await probeVideo(input);
    if (!meta.duration) throw new Error("تعذّر قراءة مدة الفيديو.");

    const operations = normalizeOperations(plan, meta.duration);
    if (!operations.length) throw new Error("لا توجد عمليات تعديل قابلة للتنفيذ.");

    const graph = buildFilterGraph(operations, meta.duration, meta.hasAudio);
    output = path.join(TEMP_DIR, crypto.randomUUID() + ".mp4");

    const args = [
      "-y", "-i", input,
      "-filter_complex", graph.filter,
      "-map", graph.videoLabel
    ];
    if (graph.audioLabel) args.push("-map", graph.audioLabel);
    args.push(
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "160k",
      "-movflags", "+faststart",
      output
    );

    await runBinary(process.env.FFMPEG_PATH || "ffmpeg", args);
    const buffer = await fsp.readFile(output);
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-store");
    res.end(buffer);
  } catch (error) {
    console.error("[MTI Edit]", error);
    if (!res.headersSent) res.status(500).json({ error: error?.message || "فشل تعديل الفيديو." });
  } finally {
    for (const file of [input, output]) {
      if (file) await fsp.unlink(file).catch(() => {});
    }
  }
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    product: "MTI",
    version: "5.0.0",
    analysis: "local-first",
    editing: "ffmpeg",
    externalAI: false
  });
});

app.listen(PORT, () => console.log("MTI V5 running on port " + PORT));
