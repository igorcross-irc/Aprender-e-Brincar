import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const fail = (message) => { console.error(`GAME AUDIT FAIL — ${message}`); process.exit(1); };

const app = read('src/js/app.js');
const world = read('src/content/world-catalog.js');
const catalog = read('src/content/activity-catalog.js');
const learning = read('src/js/games/learning-world.js');
const audio = read('src/js/engine/audio-engine.js');
const vocabulary = await import(`file://${resolve(root, 'src/data/vocabulary.js')}`);

for (const animal of vocabulary.vocabularyData.animals) {
  if (!animal.audio) fail(`animal sem áudio: ${animal.id}`);
  const file = resolve(root, 'public/assets/audio', animal.audio);
  if (!existsSync(file)) fail(`MP3 do animal ausente: ${animal.audio}`);
  if (statSync(file).size < 1000) fail(`MP3 suspeito/pequeno: ${animal.audio}`);
}

const activityIds = [...world.matchAll(/activityIds:\s*\[([\s\S]*?)\]/g)]
  .flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
const catalogIds = new Set([...catalog.matchAll(/\{ id: '([^']+)'/g)].map((m) => m[1]));
for (const id of activityIds) {
  if (!catalogIds.has(id)) fail(`atividade do mundo sem catálogo: ${id}`);
  if (!app.includes(`gameId === '${id}'`)) fail(`atividade sem rota explícita em app.js: ${id}`);
}

const rendererIds = [...learning.matchAll(/'([^']+)': \(\) => this\./g)].map((m) => m[1]);
const supportedModes = new Set(rendererIds);
for (const mode of ['discover-animals','discover-colors','find-color','find-animal','sound-guess','shape-match','odd-one-out','size-sort','count','number-match','syllables','sequence','attention','discover-objects','body-parts','match-pairs','classify-animals','opposites','rhythm','guided-movement','baby-discover','baby-colors','vocabulary','story-interactive','music-rhythm','sort-groups']) {
  if (!supportedModes.has(mode)) fail(`modo sem renderer: ${mode}`);
}

const discoverBlock = learning.match(/renderDiscover\([\s\S]*?\n  \}\n\n  renderChoice/);
if (!discoverBlock) fail('renderDiscover não encontrado');
if (/this\.nextRound\(\)/.test(discoverBlock[0])) fail('descoberta ainda avança automaticamente');
if (!audio.includes('inferAudioName')) fail('motor de áudio sem descoberta automática de MP3');
if (!audio.includes('this.speech?.cancel()')) fail('motor de áudio sem cancelamento seguro da fala');

console.log(`GAME AUDIT OK — ${vocabulary.vocabularyData.animals.length} animais com MP3, ${activityIds.length} atividades roteadas e ${supportedModes.size} modos verificados.`);
