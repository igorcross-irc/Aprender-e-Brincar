#!/usr/bin/env node
// Importa MP3 gerados na Dora (ElevenLabs): padroniza (corta silêncio das pontas, volume ≈ -16 LUFS,
// mono 64 kbps como o resto do app), coloca no lugar da fala provisória e atualiza o manifesto.
// Uso: npm run voice:import -- <pasta-com-mp3> [--dry] [--keep-original]
// Nomes aceitos: exatamente o arquivo da fala (ex.: muito-bem.mp3) ou um nome que contenha o texto da
// fala (ex.: "ElevenLabs_..._muito_bem.mp3"). Em caso de dúvida (mais de uma fala combina), o arquivo é pulado.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AUDIO_DIR, classify, readManifest, slugify, writeManifest } from './lib/voice-common.mjs';

const args = process.argv.slice(2);
const dir = args.find((arg) => !arg.startsWith('--'));
const DRY = args.includes('--dry');
if (!dir || !existsSync(dir)) { console.error('Uso: npm run voice:import -- <pasta-com-mp3> [--dry]'); process.exit(1); }

const manifest = readManifest();
const targets = manifest.files.filter((item) => classify(item) === 'provisional');
const bySlug = new Map(targets.map((item) => [item.file.replace(/\.mp3$/, ''), item]));

function match(fileName) {
  const base = fileName.replace(/\.mp3$/i, '');
  if (bySlug.has(slugify(base))) return { item: bySlug.get(slugify(base)) };
  const slug = slugify(base);
  // Nome com o texto dentro: vale a fala cujo texto aparece inteiro, escolhendo a mais longa se houver duas.
  const hits = [...bySlug.entries()].filter(([key]) => ` ${slug.replace(/-/g, ' ')} `.includes(` ${key.replace(/-/g, ' ')} `));
  if (!hits.length) return { error: 'não combina com nenhuma fala provisória' };
  const longest = Math.max(...hits.map(([key]) => key.length));
  const best = hits.filter(([key]) => key.length === longest);
  return best.length === 1 ? { item: best[0][1] } : { error: `ambíguo: ${best.map(([key]) => key).join(', ')}` };
}

const tmp = mkdtempSync(join(tmpdir(), 'voice-import-'));
let done = 0; const skipped = [];
for (const name of readdirSync(dir).filter((n) => /\.mp3$/i.test(n)).sort()) {
  const found = match(name);
  if (!found.item) { skipped.push(`${name}: ${found.error}`); continue; }
  const item = found.item;
  if (DRY) { console.log(`  ${name} → ${item.file}`); done += 1; continue; }
  const out = join(tmp, item.file);
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB';
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(dir, name), '-af', `${trim},areverse,${trim},areverse,adelay=40,apad=pad_dur=0.06,loudnorm=I=-16:TP=-1.5:LRA=7`, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', '-map_metadata', '-1', out]);
  const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim());
  if (!(seconds > 0.15 && seconds < 15)) { skipped.push(`${name}: duração estranha (${seconds.toFixed(2)}s)`); continue; }
  copyFileSync(out, `${AUDIO_DIR}/${item.file}`);
  item.replacedWith = name;
  console.log(`  ✓ ${item.file}  «${item.text}»  (${seconds.toFixed(2)}s)`);
  done += 1;
}
rmSync(tmp, { recursive: true, force: true });

if (!DRY && done) {
  // Sai do manifesto o que foi trocado: o que resta é só o que ainda é provisório.
  manifest.files = manifest.files.filter((item) => !item.replacedWith);
  writeManifest(manifest);
}
console.log(`\nVOZ IMPORT — ${done} ${DRY ? 'seriam trocadas' : 'trocadas'}${skipped.length ? `, ${skipped.length} puladas` : ''}.`);
skipped.forEach((line) => console.log(`  ! ${line}`));
if (!DRY && done) console.log('Agora: npm run audit:audio && npm run voice:status && npm run build');
