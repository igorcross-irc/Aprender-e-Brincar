#!/usr/bin/env node
// Fila de geração por custo-benefício: cada fala custa 1 crédito por caractere,
// então vem primeiro o que é ouvido em mais jogos por crédito gasto.
// Uso: node scripts/generation-queue.mjs [falas-capturadas.json]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const csvPath = 'docs/locucoes.csv';
const capturedPath = process.argv[2];
const captured = capturedPath && existsSync(capturedPath) ? JSON.parse(readFileSync(capturedPath, 'utf8')) : {};

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((cells) => Object.fromEntries(header.map((key, i) => [key, cells[i] ?? ''])));
}

const rank = { P1: 0, P2: 1, P3: 2 };
const missing = parseCsv(readFileSync(csvPath, 'utf8'))
  .filter((row) => row.status === 'falta gravar')
  .map((row) => {
    const games = captured[row.texto]?.length || 0;
    const priority = row.prioridade.slice(0, 2);
    return { ...row, games, priority, credits: row.texto.length, score: (games + (priority === 'P1' ? 10 : 0)) / row.texto.length };
  })
  .sort((a, b) => rank[a.priority] - rank[b.priority] || b.score - a.score || a.credits - b.credits);

let total = 0;
const lines = missing.map((row, i) => {
  total += row.credits;
  return `| ${i + 1} | ${row.priority} | ${row.texto.replace(/\|/g, '/')} | \`${row.arquivo}\` | ${row.games || '—'} | ${row.credits} | ${total} |`;
});

const byPriority = ['P1', 'P2', 'P3'].map((p) => {
  const subset = missing.filter((row) => row.priority === p);
  return `| ${p} | ${subset.length} | ${subset.reduce((sum, row) => sum + row.credits, 0)} |`;
});

writeFileSync('docs/FILA_DE_GERACAO.md', `# Fila de geração — voz Dora (ElevenLabs)

Gerado por \`node scripts/generation-queue.mjs\`. Não edite à mão.

- Voz: **Dora - Contando histórias** (\`OARkYvAPkwW2xOP8T9FE\`), modelo **eleven_multilingual_v2**, 1 variação por fala.
- Custo: **1 crédito por caractere**. A coluna "Acumulado" mostra até onde um saldo alcança.
- Ordem: P1 → P2 → P3; dentro de cada grupo, primeiro o que aparece em mais jogos por crédito.
- Salve cada MP3 em \`public/assets/audio/<arquivo>\` e rode \`npm run build\` (o índice de áudios é refeito).

## Resumo
| Prioridade | Falas | Créditos |
| --- | --- | --- |
${byPriority.join('\n')}
| **Total** | **${missing.length}** | **${total}** |

## Imagens (créditos por imagem, 1 variação)
| Modelo | Créditos | Observação |
| --- | --- | --- |
| recraft-v4.1-flash | ~48 | mais barato; testar o estilo antes de usar em lote |
| gemini-3.1-flash-lite-image | ~206 | |
| bytedance-seedream-4.5 | ~242 | |
| gemini-3.1-flash-image | ~406 | |
| gpt-image-2 (com referências) | ~890 | usado em cachorro, gato e maçã |

## Fila
| # | Prior. | Texto | Arquivo | Jogos | Créditos | Acumulado |
| --- | --- | --- | --- | --- | --- | --- |
${lines.join('\n')}
`);
console.log(`FILA — ${missing.length} falas, ${total} créditos.`);
