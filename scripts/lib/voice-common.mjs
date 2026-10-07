// Peças comuns das ferramentas de troca gradual da voz provisória pela voz principal (Dora).
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export const AUDIO_DIR = 'public/assets/audio';
export const MANIFEST = 'docs/voz-provisoria.json';

export const sha1 = (path) => createHash('sha1').update(readFileSync(path)).digest('hex');
export const slugify = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function readManifest() {
  if (!existsSync(MANIFEST)) return { files: [] };
  return JSON.parse(readFileSync(MANIFEST, 'utf8'));
}

export function writeManifest(manifest) {
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

// 'provisional' = ainda é o arquivo gerado; 'replaced' = alguém colocou outro por cima; 'missing' = sumiu.
export function classify(item) {
  const path = `${AUDIO_DIR}/${item.file}`;
  if (!existsSync(path)) return 'missing';
  if (!item.sha1) return 'provisional';
  return sha1(path) === item.sha1 ? 'provisional' : 'replaced';
}

export function parseCsv(text) {
  const rows = [];
  let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; } else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; } else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((cells) => Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])));
}

// Usos (brincadeiras) e prioridade de cada fala, vindos de docs/locucoes.csv, por nome de arquivo.
export function usageByFile() {
  const map = new Map();
  if (!existsSync('docs/locucoes.csv')) return map;
  for (const row of parseCsv(readFileSync('docs/locucoes.csv', 'utf8'))) {
    const games = row.uso.split(';')[0].split(',').map((g) => g.trim()).filter(Boolean);
    map.set(row.arquivo, { games, priority: (row.prioridade || 'P3').slice(0, 2) });
  }
  return map;
}
