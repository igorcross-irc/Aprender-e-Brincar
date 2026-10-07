import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const audio = readFileSync(resolve(root, 'src/js/engine/audio-engine.js'), 'utf8');
const catalog = readFileSync(resolve(root, 'src/content/activity-catalog.js'), 'utf8');

const requiredEngineTokens = ['inferAudioName', 'preload', 'diagnostics', 'speechSynthesis', 'pt-BR', 'encodeURIComponent'];
for (const token of requiredEngineTokens) {
  if (!audio.includes(token)) throw new Error('AUDIO AUDIT FAIL — engine sem ' + token);
}

const explicitPaths = [...catalog.matchAll(/audio:\s*'([^']+)'/g)].map((m) => m[1]).filter(Boolean);
const missing = explicitPaths.filter((name) => !existsSync(resolve(root, 'public/assets/audio', name)));
if (missing.length) {
  throw new Error('AUDIO AUDIT FAIL — ' + missing.length + ' arquivos declarados no catálogo não existem: ' + missing.slice(0, 10).join(', '));
}

if (!audio.includes('fetchArrayBuffer(AUDIO_BASE + encodeURIComponent(name))')) {
  throw new Error('AUDIO AUDIT FAIL — carregamento não usa caminho codificado');
}
if (!audio.includes('this.speech?.cancel()')) {
  throw new Error('AUDIO AUDIT FAIL — fala anterior não é cancelada');
}

// --- Os arquivos de verdade: MP3 válido, leve e com o índice do build em dia ---
import { readdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
const dir = resolve(root, 'public/assets/audio');
const names = readdirSync(dir).filter((n) => n.endsWith('.mp3')).sort();
const BITRATES_V1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MAX_KBPS = 96; // voz não precisa de mais; evita voltar a arquivos de 192 kbps
const MAX_TOTAL_MB = 8;

function firstFrameKbps(path) {
  const fd = openSync(path, 'r');
  try {
    const head = Buffer.alloc(4096);
    const read = readSync(fd, head, 0, head.length, 0);
    let offset = 0;
    if (head.slice(0, 3).toString() === 'ID3') offset = 10 + ((head[6] & 0x7f) << 21 | (head[7] & 0x7f) << 14 | (head[8] & 0x7f) << 7 | (head[9] & 0x7f));
    const body = offset >= read ? (() => { const b = Buffer.alloc(8); readSync(fd, b, 0, 8, offset); return b; })() : head.slice(offset);
    for (let i = 0; i + 3 < body.length; i += 1) {
      if (body[i] !== 0xff || (body[i + 1] & 0xe0) !== 0xe0) continue;
      const version = (body[i + 1] >> 3) & 3; // 3 = MPEG1
      const layer = (body[i + 1] >> 1) & 3;   // 1 = Layer III
      const index = body[i + 2] >> 4;
      if (version !== 3 || layer !== 1 || index === 0 || index === 15) return { valid: true, kbps: null };
      return { valid: true, kbps: BITRATES_V1_L3[index] };
    }
    return { valid: false };
  } finally { closeSync(fd); }
}

let totalBytes = 0;
const broken = []; const heavy = [];
for (const name of names) {
  const path = resolve(dir, name);
  const size = statSync(path).size;
  totalBytes += size;
  const info = size < 300 ? { valid: false } : firstFrameKbps(path);
  if (!info.valid) broken.push(name);
  else if (info.kbps && info.kbps > MAX_KBPS) heavy.push(`${name} (${info.kbps} kbps)`);
}
if (broken.length) throw new Error('AUDIO AUDIT FAIL — MP3 inválido ou vazio: ' + broken.slice(0, 10).join(', '));
if (heavy.length) throw new Error(`AUDIO AUDIT FAIL — acima de ${MAX_KBPS} kbps (rode npm run audio:compress): ` + heavy.slice(0, 10).join(', '));
if (totalBytes > MAX_TOTAL_MB * 1048576) throw new Error(`AUDIO AUDIT FAIL — áudio com ${(totalBytes / 1048576).toFixed(1)} MB (limite ${MAX_TOTAL_MB} MB)`);

const indexed = readFileSync(resolve(root, 'src/content/audio-files.js'), 'utf8');
const stale = names.filter((n) => !indexed.includes(`"${n}"`));
if (stale.length) throw new Error('AUDIO AUDIT FAIL — índice do build desatualizado (rode npm run build): ' + stale.slice(0, 5).join(', '));

let provisionalLeft = 0;
try {
  const manifest = JSON.parse(readFileSync(resolve(root, 'docs/voz-provisoria.json'), 'utf8'));
  provisionalLeft = manifest.files.filter((item) => names.includes(item.file)).length;
} catch {}
if (provisionalLeft) console.log(`(informativo) ${provisionalLeft} falas ainda são da voz provisória: veja npm run voice:status`);

console.log(`AUDIO AUDIT OK — ${names.length} MP3 válidos (≤ ${MAX_KBPS} kbps, ${(totalBytes / 1048576).toFixed(1)} MB), índice em dia, ${explicitPaths.length} referências explícitas verificadas.`);
