// Renomeia um lote exportado pelo gerador de voz (N_Chapter_1.mp3) para os nomes usados pelo app
// e copia para public/assets/audio, seguindo um mapa no formato ordem;arquivo_original;arquivo_renomeado[;texto].
// Uso: node scripts/rename-recordings.mjs <pasta-do-lote> <mapa.csv> [--dry-run]
import { readFileSync, existsSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const [folder, mapPath, flag] = process.argv.slice(2);
if (!folder || !mapPath) {
  console.error('Uso: node scripts/rename-recordings.mjs <pasta-do-lote> <mapa.csv> [--dry-run]');
  process.exit(1);
}
const dryRun = flag === '--dry-run';
const DEST = 'public/assets/audio';
const rows = readFileSync(mapPath, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map((line) => line.split(';'));

let copied = 0;
const missing = [];
const overwritten = [];
for (const [order, original, renamed] of rows) {
  const source = join(folder, original);
  if (!existsSync(source)) { missing.push(`${order}: ${original}`); continue; }
  const target = join(DEST, renamed);
  if (existsSync(target)) overwritten.push(renamed);
  if (!dryRun) copyFileSync(source, target);
  copied += 1;
}

console.log(`${dryRun ? '[simulação] ' : ''}${copied} arquivo(s) ${dryRun ? 'seriam copiados' : 'copiados'} para ${DEST}.`);
if (overwritten.length) console.log(`Substituídos (já existiam): ${overwritten.length} — ${overwritten.slice(0, 10).join(', ')}${overwritten.length > 10 ? '…' : ''}`);
if (missing.length) console.log(`Não encontrados na pasta do lote: ${missing.length} — ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`);
if (!dryRun && copied) console.log('Rode npm run build para o app reconhecer os novos áudios.');
