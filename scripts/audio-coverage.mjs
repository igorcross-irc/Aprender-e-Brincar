// Lista as falas do app e indica quais já têm MP3 gravado em public/assets/audio.
// Uso: npm run audio:coverage (gera docs/AUDIO_COVERAGE.md)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const AUDIO_DIR = 'public/assets/audio';
const recorded = new Set(readdirSync(AUDIO_DIR).filter((name) => name.endsWith('.mp3')));
const slugify = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : path.endsWith('.js') ? [path] : [];
  });
}

const phrases = new Map();
const add = (text, source) => {
  const clean = String(text).trim();
  if (!clean || clean.includes('${') || clean.length > 60) return;
  if (!phrases.has(clean)) phrases.set(clean, new Set());
  phrases.get(clean).add(source);
};

for (const file of walk('src')) {
  const source = readFileSync(file, 'utf8');
  const short = file.replace(/^src\//, '');
  for (const match of source.matchAll(/(?:prompt\??\.?\(|play\(|speak\()\s*(?:null|[\w.?]+)\s*,\s*(['`])([^'`]+)\1/g)) add(match[2], short);
  for (const match of source.matchAll(/(?:phrase|label):\s*['"]([^'"]+)['"]/g)) add(match[1], short);
}

const rows = [...phrases.entries()].map(([text, sources]) => ({ text, file: `${slugify(text)}.mp3`, sources: [...sources] }))
  .sort((a, b) => a.text.localeCompare(b.text, 'pt-BR'));
const missing = rows.filter((row) => !recorded.has(row.file));
const covered = rows.length - missing.length;

const lines = [
  '# Cobertura de áudio',
  '',
  'Gerado por `npm run audio:coverage`. Falas sem MP3 usam a voz do navegador (pt-BR) como alternativa.',
  'Para gravar: salve o arquivo com o nome indicado em `public/assets/audio/` — o app passa a usá-lo automaticamente.',
  '',
  `- Falas encontradas: ${rows.length}`,
  `- Com MP3 gravado: ${covered}`,
  `- Faltando: ${missing.length}`,
  '',
  '## Falta gravar',
  '',
  '| Fala | Arquivo |',
  '| --- | --- |',
  ...missing.map((row) => `| ${row.text.replace(/\|/g, '/')} | \`${row.file}\` |`),
  ''
];
writeFileSync('docs/AUDIO_COVERAGE.md', lines.join('\n'));
console.log(`AUDIO COVERAGE — ${covered}/${rows.length} falas com MP3; ${missing.length} para gravar (docs/AUDIO_COVERAGE.md).`);
if (!existsSync('docs/AUDIO_COVERAGE.md')) process.exit(1);
