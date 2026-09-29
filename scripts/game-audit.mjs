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

// Detecta corrupção comum de geração de código: \\n literal fora de strings/template literals.
const sourceFiles = ['src/js/app.js', 'src/js/games/learning-world.js', 'src/js/games/memory.js', 'src/js/games/puzzle.js', 'src/js/games/balloon-pop.js', 'src/js/games/canvas.js', 'src/js/games/cards.js', 'src/js/engine/audio-engine.js', 'src/core/app-core.js', 'src/core/activity-registry.js', 'src/core/learning-engine.js', 'src/core/learning-session.js', 'src/core/progress-store.js', 'src/core/skill-progress.js'];
for (const file of sourceFiles) {
  const content = read(file);
  if (content.includes(');\\n')) fail(`escape literal suspeito em ${file}`);
}
const vocabularySource = read('src/data/vocabulary.js');
const animals = [...vocabularySource.matchAll(/\{ id: \"([^\"]+)\", label: \"[^\"]+\", icon: \"[^\"]+\", sound: \"[^\"]+\", audio: \"([^\"]+)\" \}/g)].map((m) => ({ id: m[1], audio: m[2] }));

for (const animal of animals) {
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

if (!existsSync(resolve(root, 'src/core/learning-engine.js'))) fail('motor adaptativo ausente');
const progress = read('src/core/progress-store.js');
if (!progress.includes('sessions') || !progress.includes('mastery') || !progress.includes('accuracy')) fail('persistência adaptativa incompleta');
if (!app.includes('let finished = false') || !app.includes('if (finished) return')) fail('proteção contra conclusão duplicada ausente');
if (!app.includes('learning.recommend') || !app.includes('getDifficulty')) fail('integração adaptativa incompleta');
if (!app.includes('onWin({score:touched,rounds:cards.length})')) fail('experiências guiadas sem pontuação real');
if (!app.includes('core.session.ensure') || !app.includes('core.session.complete')) fail('controlador central de sessão não integrado');
if (!app.includes('renderSessionResult') || !app.includes('data-next')) fail('tela de resultado da sessão ausente');
if (app.includes('setTimeout(onBack,700)')) fail('sessão encerra antes da criança escolher continuar');
if (!existsSync(resolve(root, 'src/core/learning-session.js'))) fail('controlador de sessão ausente');
if (!existsSync(resolve(root, 'src/core/skill-progress.js'))) fail('progresso por habilidade ausente');
if (!learning.includes('difficultyLabel')) fail('feedback visual de dificuldade ausente');
if (!learning.includes("level === 2 ? 5 : 7")) fail('dificuldade adaptativa não altera conjunto de desafios');
if (!app.includes("world.start('baby-discover',{difficulty:adaptive.level})")) fail('baby-discover sem dificuldade adaptativa');
if (!read('src/js/games/canvas.js').includes('this.level === 1 ? 3 : this.level === 2 ? 4 : 5')) fail('lousa sem adaptação real por nível');
console.log(`GAME AUDIT OK — ${animals.length} animais com MP3, ${activityIds.length} atividades roteadas, ${supportedModes.size} modos verificados e núcleo adaptativo integrado.`);

const memory = read('src/js/games/memory.js');
const puzzle = read('src/js/games/puzzle.js');
const balloons = read('src/js/games/balloon-pop.js');
const canvas = read('src/js/games/canvas.js');
const cards = read('src/js/games/cards.js');
if (!memory.includes('onComplete?.({ score, rounds })')) fail('memória sem contrato de resultado');
if (!puzzle.includes('onComplete?.({ score, rounds: count })')) fail('quebra-cabeça sem contrato de resultado');
if (!balloons.includes('onComplete?.({ score, rounds: 5 })')) fail('balões sem contrato de resultado');
if (!canvas.includes('onComplete?.({ score: 5, rounds: 5 })')) fail('lousa sem conclusão integrada');
if (!cards.includes('onComplete({ score: Math.min(5, Math.max(1, this.sentenceShelf.length)), rounds: 5 })')) fail('frases sem pontuação de sessão');
if (!app.includes("new CanvasGame('game-container',this.audio,onWin,onBack).start(adaptive.level)")) fail('lousa sem dificuldade adaptativa');
if (!app.includes("new MemoryGame('game-container',this.audio,onWin,onBack).start(vocabularyData.animals,adaptive.level)")) fail('memória sem dificuldade adaptativa');
if (!app.includes("new PuzzleGame('game-container',this.audio,onWin,onBack).start(vocabularyData.animals,adaptive.level)")) fail('quebra-cabeça sem dificuldade adaptativa');
if (!app.includes("new BalloonPopGame('game-container',this.audio,onWin,onBack).start(adaptive.level)")) fail('balões sem dificuldade adaptativa');
for (const route of [
  "world.start('discover-objects',{difficulty: adaptive.level})",
  "world.start('classify-animals',{difficulty: adaptive.level})",
  "world.start('vocabulary',{difficulty: adaptive.level})",
  "world.start('story-interactive',{difficulty: adaptive.level})",
  "world.start('match-pairs',{difficulty: adaptive.level})",
  "world.start('music-rhythm',{difficulty: adaptive.level})",
  "world.start('guided-movement',{difficulty: adaptive.level})"
]) if (!app.includes(route)) fail(`rota sem dificuldade adaptativa: ${route}`);

console.log('Game audit OK');

const core = await read('src/core/app-core.js');
if (!core.includes('rewardActivity(activityId)')) fail('recompensa central nao encontrada');
if (!core.includes('this.progress.award(rewardId)')) fail('recompensa sem idempotencia');

const engine = await read('src/core/learning-engine.js');
if (!engine.includes('getOutcome(activityId)')) fail('resultado adaptativo ausente');
if (!engine.includes('accuracy>=85')) fail('regra de avanço ausente');
if (!engine.includes('accuracy>=60')) fail('regra de prática ausente');
