#!/usr/bin/env node
// Emojis novos viram quadradinho vazio em aparelhos antigos (o iOS 9.3 só desenha até o
// Emoji 2.0, de 2015). Este script varre o código, acha os emojis mais novos que isso e:
//   1. baixa a imagem de cada um (Noto Emoji, Google, licença Apache 2.0) para
//      public/assets/images/emoji/<código>.png (64 px);
//   2. escreve src/legacy/emoji-map.js, que src/legacy/emoji-fallback.js usa para trocar
//      o texto pela imagem — só em aparelhos antigos.
//
// Rode de novo sempre que usar um emoji novo no app:  node scripts/emoji-images.mjs
// `--check` só confere (usado pela auditoria): sai com erro se faltar imagem.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE = 'emoji-datasource-google@16.0.0';
const CDN = `https://cdn.jsdelivr.net/npm/${PACKAGE}`;
const MAX_SUPPORTED = 2; // iOS 9.3 desenha emojis até a versão 2.0
const IMAGES = 'public/assets/images/emoji';
const AGES = 'scripts/emoji-added-in.json'; // chave do emoji → versão em que surgiu
const OUT = 'src/legacy/emoji-map.js';
const CHECK = process.argv.includes('--check');

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

// Chave estável: pontos de código em hexadecimal, sem o seletor de variação FE0F.
const keyOf = (text) => [...text].map((char) => char.codePointAt(0).toString(16)).filter((hex) => hex !== 'fe0f').join('-');

async function loadAges() {
  if (existsSync(AGES)) return JSON.parse(readFileSync(AGES, 'utf8'));
  console.log('Baixando a tabela de emojis…');
  const data = await (await fetch(`${CDN}/emoji.json`)).json();
  const ages = {};
  for (const item of data) {
    const key = item.unified.toLowerCase().split('-').filter((hex) => hex !== 'fe0f').join('-');
    ages[key] = { v: Number(item.added_in), file: item.unified.toLowerCase() };
  }
  writeFileSync(AGES, `${JSON.stringify(ages)}\n`);
  return ages;
}

const EMOJI = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?|\p{Emoji_Modifier})*/gu;
const used = new Map(); // texto → arquivos
const files = [...walk('src').filter((path) => path.endsWith('.js') && !path.includes('src/legacy/emoji-map.js')), 'index.html'];
for (const path of files) {
  for (const [match] of readFileSync(path, 'utf8').matchAll(EMOJI)) {
    const text = match.replace(/️/g, '');
    if (!used.has(text)) used.set(text, new Set());
    used.get(text).add(path.split('/').pop());
  }
}

const ages = await loadAges();
const needed = [];
const unknown = [];
for (const [text, where] of used) {
  const info = ages[keyOf(text)];
  if (!info) { unknown.push(`${text} (${[...where][0]})`); continue; }
  if (info.v > MAX_SUPPORTED) needed.push({ text, key: keyOf(text), file: info.file, where: [...where] });
}

mkdirSync(IMAGES, { recursive: true });
const missing = [];
for (const item of needed) {
  const target = join(IMAGES, `${item.key}.png`);
  if (existsSync(target)) continue;
  if (CHECK) { missing.push(`${item.text} ${item.key}.png`); continue; }
  const response = await fetch(`${CDN}/img/google/64/${item.file}.png`);
  if (!response.ok) { missing.push(`${item.text} (HTTP ${response.status})`); continue; }
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  console.log(`  + ${item.text}  ${item.key}.png`);
}

if (!CHECK) {
  const sorted = [...needed].sort((a, b) => b.text.length - a.text.length || a.key.localeCompare(b.key));
  const lines = sorted.map((item) => `  '${item.text}': '${item.key}'`);
  writeFileSync(OUT, `// Gerado por scripts/emoji-images.mjs — não edite à mão.
// Emoji (texto) → arquivo em public/assets/images/emoji/<código>.png
// Só entram os emojis mais novos que o Emoji 2.0 (o que o iOS 9.3 sabe desenhar).
export const EMOJI_IMAGES = {
${lines.join(',\n')}
};
`);
}

if (unknown.length) console.log(`Sem dados (ignorados): ${unknown.join(', ')}`);
if (missing.length) {
  console.error(`EMOJI — faltam imagens: ${missing.join(', ')}${CHECK ? '\nRode: node scripts/emoji-images.mjs' : ''}`);
  process.exit(1);
}
console.log(`EMOJI — ${used.size} emojis no app, ${needed.length} precisam de imagem em aparelhos antigos.`);
