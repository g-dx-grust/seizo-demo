// 録画クリップ(webm) → Remotion用データの生成
//   1. clips/chN.webm を public/chN.mp4 に変換（30fps固定・H.264）
//   2. clips/meta.json のイベント時刻を実測動画長で補正し src/generated/demoData.json を出力
// 使い方: node prepare.mjs

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIPS = path.join(__dirname, 'clips');
const PUBLIC = path.join(__dirname, 'public');
const OUT_JSON = path.join(__dirname, 'src', 'generated', 'demoData.json');

const probeSec = (file) =>
  parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {
      encoding: 'utf8',
    }).trim(),
  );

const meta = JSON.parse(fs.readFileSync(path.join(CLIPS, 'meta.json'), 'utf8'));
fs.mkdirSync(PUBLIC, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const chapters = [];
for (const key of Object.keys(meta).sort((a, b) => Number(a) - Number(b))) {
  const m = meta[key];
  const webm = path.join(CLIPS, m.file);
  const mp4Name = m.file.replace(/\.webm$/, '.mp4');
  const mp4 = path.join(PUBLIC, mp4Name);

  // webmより新しいmp4があればスキップ（再録画した章だけ変換し直す）
  const needs =
    !fs.existsSync(mp4) || fs.statSync(mp4).mtimeMs < fs.statSync(webm).mtimeMs;
  if (needs) {
    console.log(`変換中: ${m.file} → public/${mp4Name}`);
    execFileSync('ffmpeg', [
      '-y', '-v', 'error',
      '-i', webm,
      '-vf', 'fps=30',
      '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      mp4,
    ]);
  }

  const videoSec = probeSec(mp4);
  const wallSec = m.wallMs / 1000;
  // 実測動画長と壁時計のズレを線形補正（通常 1.00 前後）
  const factor = videoSec / wallSec;
  const trimStartSec = (m.contentStart / 1000) * factor;
  const contentDurSec = Math.min(videoSec - trimStartSec, (m.wallMs - m.contentStart) / 1000 * factor);

  const rel = (tMs) => Math.max(0, ((tMs - m.contentStart) / 1000) * factor);
  const cues = m.events
    .filter((e) => e.type === 'cue')
    .map((e) => ({ start: rel(e.t), dur: e.dur / 1000, text: e.text }));
  const zooms = m.events
    .filter((e) => e.type === 'zoom')
    .map((e) => ({ start: rel(e.t), dur: e.dur / 1000, scale: e.scale ?? 1.28, box: e.box }));

  chapters.push({ chapter: m.chapter, src: mp4Name, trimStartSec, contentDurSec, cues, zooms });
  console.log(
    `ch${m.chapter}: video=${videoSec.toFixed(1)}s content=${contentDurSec.toFixed(1)}s factor=${factor.toFixed(3)} cues=${cues.length} zooms=${zooms.length}`,
  );
}

fs.writeFileSync(OUT_JSON, JSON.stringify({ chapters }, null, 2));
const total = chapters.reduce((s, c) => s + c.contentDurSec, 0);
console.log(`\nsrc/generated/demoData.json を出力（本編合計 ${(total / 60).toFixed(2)}分 + オープニング/カード/エンディング）`);
