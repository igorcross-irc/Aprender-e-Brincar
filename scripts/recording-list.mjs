// Gera a lista de locuções para gravar: docs/LOCUCOES.md (para ler e marcar) e docs/locucoes.csv (para importar).
// Junta três fontes:
//  1. falas capturadas jogando tudo (node scripts/play-all.mjs --speech tmp/spoken.json);
//  2. falas que variam por item (animal, cor, número...), geradas a partir dos dados do app;
//  3. banco de falas para o futuro (scripts/voice-bank-future.mjs).
// Uso: node scripts/recording-list.mjs [arquivo-de-falas-capturadas.json]
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { vocabularyData } from '../src/data/vocabulary.js';
import { developmentContent } from '../src/content/development-content.js';
import { activityCatalog } from '../src/content/activity-catalog.js';
import { learningWorlds } from '../src/content/world-catalog.js';
import { withArticle } from '../src/core/pt-grammar.js';
import { SORT_SETS } from '../src/js/games/toddler/sort-into.js';
import { WORD_SOUND_SETS } from '../src/js/games/language/word-sounds.js';
import { COMMUNICATION_CARDS } from '../src/js/games/toddler/communication-board.js';
import { futureVoiceBank } from './voice-bank-future.mjs';

const CHILD_NAME = 'Isadora';
const slugify = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const recorded = new Set(readdirSync('public/assets/audio').filter((name) => name.endsWith('.mp3')));
const entries = new Map();

function add(text, category, priority, usage = '') {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean || !/[a-zà-ú0-9]/i.test(clean)) return;
  const file = `${slugify(clean)}.mp3`;
  if (file === '.mp3') return;
  const current = entries.get(file);
  if (current) {
    if (priority < current.priority) Object.assign(current, { priority, category });
    if (usage) current.usage.add(usage);
    return;
  }
  entries.set(file, { text: clean, file, category, priority, usage: new Set(usage ? [usage] : []) });
}

// 1. Falas capturadas jogando
const titleOf = (id) => activityCatalog.find((activity) => activity.id === id)?.title || id;
const capturedPath = process.argv[2];
const personalized = new Set();
if (capturedPath && existsSync(capturedPath)) {
  const captured = JSON.parse(readFileSync(capturedPath, 'utf8'));
  const frequency = Object.entries(captured).map(([text, games]) => ({ text, games }));
  for (const { text, games } of frequency) {
    if (text.includes(CHILD_NAME)) { personalized.add(text.replace(CHILD_NAME, '{nome}')); continue; }
    const category = games.length >= 3 ? 'Mais usadas (várias brincadeiras)' : titleOf(games[0]);
    add(text, category, games.length >= 3 ? 1 : 2, games.map(titleOf).join(', '));
  }
}

// Falas fixas das telas (fora das brincadeiras)
['Oi! Vamos brincar?', 'Muito bem!', 'Você brincou de novo!', 'Novo adesivo!', 'Seus adesivos!', 'Brinque para ganhar adesivos!', 'Hora de descansar! Até mais tarde!']
  .forEach((text) => add(text, 'Telas do app', 1, 'início, resultado, álbum, descanso'));
learningWorlds.forEach((world) => add(world.title, 'Nomes dos mundos', 2, 'ao abrir o mundo'));
activityCatalog.forEach((activity) => add(activity.title, 'Nomes das brincadeiras', 3, 'para narrar a navegação no futuro'));

// 2. Falas que variam por item
const animals = vocabularyData.animals;
animals.forEach((animal) => {
  add(animal.label, 'Animais', 2, 'descobrir, memória, bolhas');
  add(animal.sound, 'Animais', 2, 'sons dos animais');
  add(`${animal.label}. ${animal.sound}`, 'Animais', 2, 'descobrir animais');
  add(`${animal.label}! ${animal.sound}`, 'Animais', 2, 'cartões');
  add(`Onde está ${withArticle(animal.label)}?`, 'Animais', 2, 'Encontre o Animal');
  add(`Cadê ${withArticle(animal.label)}? Onde se escondeu?`, 'Esconde-esconde', 2, 'Esconde-esconde');
  add(`Cadê ${withArticle(animal.label)}? Toque para achar!`, 'Esconde-esconde', 2, 'Esconde-esconde (bebês)');
  add(`Achou! ${animal.sound}`, 'Esconde-esconde', 2, 'Esconde-esconde');
  add(`Muito bem! ${animal.label}`, 'Quebra-cabeça', 2, 'Quebra-Cabeça');
});
vocabularyData.colors.forEach((color) => {
  add(color.label, 'Cores', 2, 'cores');
  add(`Onde está a cor ${color.label}?`, 'Cores', 2, 'Encontre a Cor');
  add(`Encontre a cor ${color.label}`, 'Cores', 2, 'Caça às Cores');
  add(`Muito bem! ${color.label}`, 'Cores', 2, 'Caça às Cores');
});
developmentContent.colorsAdvanced.forEach((color) => add(color.label, 'Cores', 2, 'Cores para Descobrir'));
developmentContent.shapes.forEach((shape) => add(`Encontre ${withArticle(shape.label)}.`, 'Formas', 2, 'Mundo das Formas'));
developmentContent.bodyParts.forEach((part) => { add(part.label, 'Corpo', 2, 'Meu Corpo'); add(`Onde está ${withArticle(part.label)}?`, 'Corpo', 2, 'Meu Corpo'); });
developmentContent.vocabulary.forEach((word) => { add(word.label, 'Palavras do dia a dia', 2, 'Palavras do Dia'); add(`Onde está ${withArticle(word.label)}?`, 'Palavras do dia a dia', 2, 'Palavras do Dia'); });
[...developmentContent.objects, ...developmentContent.objectsAdvanced].forEach((object) => {
  add(object.label, 'Objetos', 2, 'Descobrir Objetos, Encontre o Par');
  add(`O que combina com ${object.label}?`, 'Objetos', 2, 'Encontre o Par');
  add(`O que pertence ao mesmo grupo de ${object.label}?`, 'Objetos', 2, 'Quem Pertence ao Grupo?');
});
developmentContent.categories.forEach((category) => add(`O que pertence ao mesmo grupo de ${category.label}?`, 'Objetos', 2, 'Quem Pertence ao Grupo?'));
developmentContent.babyDiscoveries.forEach((item) => { add(item.label, 'Descobertas do bebê', 2, 'Descobrir com as Mãos'); add(item.sound, 'Descobertas do bebê', 2, 'Descobrir com as Mãos'); });
developmentContent.opposites.forEach((pair) => { add(`Qual é o contrário de ${pair.label}?`, 'Opostos', 2, 'Opostos'); add(pair.pair, 'Opostos', 2, 'Opostos'); });
developmentContent.syllables.forEach((word) => { add(word.label, 'Sílabas', 2, 'Brincar com Sílabas'); add(`${word.parts.join(' - ')}. Muito bem!`, 'Sílabas', 2, 'Brincar com Sílabas'); });
developmentContent.movements.forEach((move) => add(move.label, 'Movimento e ritmo', 2, 'Desafio do Movimento'));
[...developmentContent.rhythms, ...developmentContent.musicPatterns].forEach((rhythm) => add(rhythm.label, 'Movimento e ritmo', 2, 'ritmos'));
developmentContent.stories.forEach((story) => {
  add(story.title, 'Histórias', 2, 'histórias');
  story.words.forEach((sentence) => add(sentence, 'Histórias', 2, 'História Interativa, Hora da História'));
  add(`${story.title} Toque nas figuras na ordem da história. O que aconteceu primeiro?`, 'Histórias', 2, 'Hora da História');
});
const NUMBER_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
// A contagem toca num-N.mp3 e os balões numero-N.mp3, que já estão gravados.
NUMBER_WORDS.slice(1).forEach((word) => add(`${word}! Muito bem!`, 'Números', 2, 'Contar Tocando'));
for (let n = 1; n <= 7; n += 1) add(`Estoure o número ${n}`, 'Números', 2, 'Balões');
Object.values(SORT_SETS).forEach((set) => set.items.forEach((item) => {
  const binLabel = set.bins.find((bin) => bin.key === item.bin)?.label;
  add(set.prompt({ ...item, binLabel }, true), set.title.replace(/^\S+\s/, ''), 2, set.title.replace(/^\S+\s/, ''));
  add(set.prompt({ ...item, binLabel }, false), set.title.replace(/^\S+\s/, ''), 2, set.title.replace(/^\S+\s/, ''));
}));
Object.values(WORD_SOUND_SETS).forEach((set) => set.words.forEach((word) => {
  const category = set.title.replace(/^\S+\s/, '');
  add(set.prompt(word), category, 2, category);
  add(set.success(word, word.answer), category, 2, category);
  add(`Escute de novo: ${set.prompt(word)}`, category, 2, category);
}));
COMMUNICATION_CARDS.forEach((card) => add(card.phrase, 'Eu Quero… (comunicação)', 2, 'Eu Quero…'));
vocabularyData.phrases.forEach((word) => add(word.label, 'Montar Frases', 2, 'Montar Frases'));

// 3. Banco para o futuro
futureVoiceBank().forEach(({ category, text }) => add(text, category, 3, 'futuro'));

// Saída
const all = [...entries.values()];
const priorityName = { 1: 'P1 — mais usadas', 2: 'P2 — usadas hoje', 3: 'P3 — futuro' };
const missing = all.filter((entry) => !recorded.has(entry.file));
const byPriority = (p) => missing.filter((entry) => entry.priority === p);

const sectionsFor = (list) => {
  const groups = {};
  list.forEach((entry) => (groups[entry.category] ||= []).push(entry));
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'pt-BR')).map(([category, items]) => [
    `### ${category} (${items.length})`, '',
    ...items.sort((a, b) => a.text.localeCompare(b.text, 'pt-BR')).map((entry) => `- [ ] ${entry.text} → \`${entry.file}\``),
    ''
  ].join('\n')).join('\n');
};

const md = [
  '# Locuções para gravar — Aprender & Brincar',
  '',
  'Gerado por `node scripts/recording-list.mjs`. Marque `[x]` conforme gravar. A mesma lista, para importar em planilha ou banco de dados, está em `docs/locucoes.csv`.',
  '',
  '## Resumo',
  '',
  `| | Falas | Já gravadas | Falta gravar |`,
  `| --- | ---: | ---: | ---: |`,
  ...[1, 2, 3].map((p) => { const total = all.filter((e) => e.priority === p).length; const left = byPriority(p).length; return `| ${priorityName[p]} | ${total} | ${total - left} | ${left} |`; }),
  `| **Total** | **${all.length}** | **${all.length - missing.length}** | **${missing.length}** |`,
  '',
  '## Gerar em lote (mesmo processo do lote anterior)',
  '',
  '1. Use `docs/LOCUCOES_ROTEIRO.txt` no gerador de voz: uma fala por parágrafo, já na ordem certa (P1, depois P2, depois P3).',
  '2. O gerador exporta `1_Chapter_1.mp3`, `2_Chapter_1.mp3`… na mesma ordem.',
  '3. `docs/MAPA_RENOMEACOES_NOVAS.csv` tem o mesmo formato do `MAPA_RENOMEACOES.csv` (`ordem;arquivo_original;arquivo_renomeado`, mais a coluna `texto`).',
  '4. Para renomear e copiar tudo de uma vez: `node scripts/rename-recordings.mjs <pasta-com-os-Chapter> docs/MAPA_RENOMEACOES_NOVAS.csv`.',
  '',
  'Se gerar só uma parte (ex.: só P1 e P2), as primeiras linhas do roteiro e do mapa correspondem exatamente a essa parte.',
  '',
  '## Como gravar (voz humana)',
  '',
  '- **Arquivo:** MP3, mono, 44,1 kHz, 128 kbps. Um arquivo por fala, com o **nome exato** indicado (o app procura pelo nome).',
  '- **Onde colocar:** `public/assets/audio/`. Depois rode `npm run build` (ou faça o deploy) — o app passa a usar o arquivo automaticamente; falas sem arquivo continuam na voz do navegador.',
  '- **Voz:** calma, alegre e clara, um pouco mais lenta que o normal. Sorria ao falar. Mesma pessoa e mesmo microfone em todas as falas.',
  '- **Ambiente:** cômodo silencioso, celular a ~20 cm da boca, sem eco. Deixe meio segundo de silêncio no início e no fim e depois corte.',
  '- **Volume:** normalize todas as falas para o mesmo nível (ex.: −16 LUFS) para nenhuma ficar mais alta que as outras.',
  '- **Perguntas** terminam com entonação de pergunta; **comemorações** com energia; **instruções** com calma.',
  '- **Ordem sugerida:** P1 primeiro (aparece o tempo todo), depois P2 por brincadeira e, por fim, P3.',
  '',
  personalized.size ? [
    '## Falas com o nome da criança',
    '',
    'Estas falas incluem o nome configurado na Área da Família e, por isso, usam a voz do navegador. Grave a versão sem nome (já incluída em P1) — ela é usada quando não há nome configurado.',
    '',
    ...[...personalized].sort().map((text) => `- ${text}`),
    ''
  ].join('\n') : '',
  `## ${priorityName[1]}`, '', sectionsFor(byPriority(1)),
  `## ${priorityName[2]}`, '', sectionsFor(byPriority(2)),
  `## ${priorityName[3]}`, '', 'Vocabulário e frases que o app ainda não usa, mas que novas brincadeiras provavelmente vão precisar. Gravar agora mantém a mesma voz em todo o app.', '', sectionsFor(byPriority(3))
].join('\n');

const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
const csv = ['texto,arquivo,categoria,prioridade,status,uso',
  ...all.sort((a, b) => a.priority - b.priority || a.category.localeCompare(b.category, 'pt-BR') || a.text.localeCompare(b.text, 'pt-BR'))
    .map((entry) => [entry.text, entry.file, entry.category, priorityName[entry.priority], recorded.has(entry.file) ? 'gravado' : 'falta gravar', [...entry.usage].join('; ')].map(csvCell).join(','))
].join('\n');

// Lote no mesmo formato do anterior: um roteiro (uma fala por linha, na ordem) e o mapa
// ordem;arquivo_original;arquivo_renomeado — o gerador de voz exporta N_Chapter_1.mp3 na ordem do roteiro.
const batch = [1, 2, 3].flatMap((p) => byPriority(p).sort((a, b) => a.category.localeCompare(b.category, 'pt-BR') || a.text.localeCompare(b.text, 'pt-BR')));
const script = batch.map((entry) => entry.text).join('\n\n');
const map = ['ordem;arquivo_original;arquivo_renomeado;texto', ...batch.map((entry, index) => `${index + 1};${index + 1}_Chapter_1.mp3;${entry.file};${entry.text.replace(/;/g, ',')}`)].join('\r\n');

writeFileSync('docs/LOCUCOES.md', md);
writeFileSync('docs/locucoes.csv', `${csv}\n`);
writeFileSync('docs/LOCUCOES_ROTEIRO.txt', `${script}\n`);
writeFileSync('docs/MAPA_RENOMEACOES_NOVAS.csv', `﻿${map}\r\n`);
console.log(`LOCUÇÕES — ${all.length} falas (${missing.length} para gravar). Gerados: docs/LOCUCOES.md, docs/locucoes.csv, docs/LOCUCOES_ROTEIRO.txt, docs/MAPA_RENOMEACOES_NOVAS.csv.`);
