#!/usr/bin/env node
// Situação da troca gradual: quantas falas ainda são provisórias, quais gerar primeiro com a Dora e
// quais brincadeiras ficam 100% com a voz principal depois de poucas falas.
// Uso: npm run voice:status [-- --credits 500] [-- --prune]
//   --credits N  mostra o próximo lote que cabe em N créditos (1 crédito = 1 caractere)
//   --prune      tira do manifesto o que já foi trocado/sumiu (o import já faz isso sozinho)
import { writeFileSync } from 'node:fs';
import { classify, readManifest, writeManifest, usageByFile } from './lib/voice-common.mjs';

const args = process.argv.slice(2);
const creditsArg = args.indexOf('--credits');
const budget = creditsArg >= 0 ? Number(args[creditsArg + 1]) : 0;
const manifest = readManifest();
const usage = usageByFile();
const states = manifest.files.map((item) => ({ ...item, state: classify(item) }));
const provisional = states.filter((item) => item.state === 'provisional');
const replaced = states.filter((item) => item.state === 'replaced');
const missing = states.filter((item) => item.state === 'missing');

if (args.includes('--prune')) {
  manifest.files = provisional.map(({ state, ...item }) => item);
  writeManifest(manifest);
}

const rank = { P1: 0, P2: 1, P3: 2 };
const queue = provisional.map((item) => {
  const info = usage.get(item.file) || { games: [], priority: 'P2' }; // sem dado de uso (conteúdo novo): conta como 1
  return { ...item, games: info.games, priority: info.priority, credits: item.text.length };
}).sort((a, b) => Math.max(1, b.games.length) / b.credits - Math.max(1, a.games.length) / a.credits || rank[a.priority] - rank[b.priority] || a.credits - b.credits);

let running = 0;
const rows = queue.map((item, i) => { running += item.credits; return { ...item, n: i + 1, running }; });

// Brincadeiras: quantas falas provisórias ainda tocam em cada uma.
const perGame = new Map();
for (const item of queue) for (const game of item.games) perGame.set(game, (perGame.get(game) || 0) + 1);
const games = [...perGame.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], 'pt-BR'));

const total = manifest.files.length;
writeFileSync('docs/FILA_PROVISORIAS.md', `# Fila de troca: falas provisórias → Dora

Gerado por \`npm run voice:status\`. Não edite à mão.

- Ainda provisórias: **${provisional.length}** de ${total} (${total - provisional.length} já trocadas ou removidas)
- Custo para trocar todas: **${running} créditos** (1 por caractere)
- Como trocar: gere cada fala na Dora, coloque os MP3 numa pasta e rode \`npm run voice:import -- <pasta>\`. O app mistura as duas vozes enquanto isso.

## Ordem sugerida (mais ouvidas por crédito primeiro)
| # | Fala | Arquivo | Brincadeiras | Créditos | Acumulado |
| --- | --- | --- | --- | --- | --- |
${rows.map((r) => `| ${r.n} | ${r.text.replace(/\|/g, '/')} | \`${r.file}\` | ${r.games.length || '—'} | ${r.credits} | ${r.running} |`).join('\n')}

## Brincadeiras que terminam primeiro (poucas falas provisórias sobrando)
${games.length ? games.slice(0, 15).map(([game, count]) => `- ${game}: ${count}`).join('\n') : '- (sem dados de uso)'}
`);
writeFileSync('docs/falas-para-elevenlabs.csv', `arquivo,texto,creditos\n${rows.map((r) => `${r.file},"${r.text.replace(/"/g, '""')}",${r.credits}`).join('\n')}\n`);

console.log(`VOZ — ${provisional.length} provisórias, ${replaced.length} trocadas (ainda no manifesto), ${missing.length} ausentes. Trocar todas: ${running} créditos.`);
if (budget > 0) {
  const batch = rows.filter((r) => r.running <= budget);
  console.log(`\nLote para ${budget} créditos: ${batch.length} falas (${batch.at(-1)?.running || 0} créditos)`);
  batch.forEach((r) => console.log(`  ${r.file}  «${r.text}»`));
}
console.log('Fila em docs/FILA_PROVISORIAS.md e lista para gerar em docs/falas-para-elevenlabs.csv');
