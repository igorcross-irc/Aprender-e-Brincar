#!/usr/bin/env node
// Voz não precisa de 192 kbps: recodifica os MP3 para mono 64 kbps (≈ 1/3 do tamanho, mesma
// clareza para fala em alto-falante de celular). Idempotente: pula o que já está leve.
// Uso: node scripts/compress-audio.mjs [--dry]
import { execFileSync } from 'node:child_process';
import { readdirSync, renameSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'public/assets/audio';
const TARGET_KBPS = 64;
const DRY = process.argv.includes('--dry');

const kbps = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=bit_rate', '-of', 'default=nw=1:nk=1', file]).toString().trim()) / 1000;
const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]).toString().trim());

let before = 0; let after = 0; let changed = 0;
for (const name of readdirSync(DIR).filter((n) => n.endsWith('.mp3'))) {
  const file = join(DIR, name);
  const size = statSync(file).size;
  before += size;
  if (kbps(file) <= TARGET_KBPS + 4) { after += size; continue; }
  if (DRY) { after += size / 3; changed += 1; continue; }
  const tmp = `${file}.tmp.mp3`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', `${TARGET_KBPS}k`, '-map_metadata', '-1', tmp]);
  if (Math.abs(seconds(tmp) - seconds(file)) > 0.15) { rmSync(tmp); throw new Error(`Duração mudou em ${name}; abortei.`); }
  renameSync(tmp, file);
  after += statSync(file).size;
  changed += 1;
}
console.log(`AUDIO — ${changed} arquivos recodificados; ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB${DRY ? ' (estimativa)' : ''}`);
