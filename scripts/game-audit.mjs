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
const health = read('src/core/experience-health.js');
const readiness = read('src/core/content-readiness.js');

// Detecta corrupção comum de geração de código: \\n literal fora de strings/template literals.
const sourceFiles = ['src/js/app.js', 'src/js/games/learning-world.js', 'src/js/games/memory.js', 'src/js/games/puzzle.js', 'src/js/games/balloon-pop.js', 'src/js/games/canvas.js', 'src/js/games/cards.js', 'src/js/engine/audio-engine.js', 'src/core/app-core.js', 'src/core/activity-registry.js', 'src/core/learning-engine.js', 'src/core/learning-session.js', 'src/core/progress-store.js', 'src/core/skill-progress.js', 'src/js/game-registry.js', 'src/js/games/independent/odd-one-out.js', 'src/js/games/independent/number-order.js', 'src/js/games/independent/color-hunt.js', 'src/js/games/independent/rhythm-copy.js', 'src/js/games/independent/sound-sequence.js'];
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
const registry = read('src/js/game-registry.js');
for (const id of activityIds) {
  if (!catalogIds.has(id)) fail(`atividade do mundo sem catálogo: ${id}`);
  if (!registry.includes(`'${id}'`)) fail(`atividade sem registro central: ${id}`);
}
for (const id of catalogIds) {
  if (!registry.includes(`'${id}'`)) fail(`atividade do catálogo sem registro central: ${id}`);
}
if (!registry.includes('export function createGameRegistry')) fail('registro central ausente');
if (!registry.includes('validateGameRegistry')) fail('validador do registro ausente');
for (const file of ['odd-one-out.js','number-order.js','color-hunt.js','rhythm-copy.js','sound-sequence.js']) {
  if (!read(`src/js/games/independent/${file}`).includes('onComplete?.({score')) fail(`jogo independente sem contrato de resultado: ${file}`);
}
if (!app.includes('createGameRegistry')) fail('app não usa registro central');
if (app.includes('renderers[this.mode] || renderers[\'discover-animals\']')) fail('fallback silencioso de renderer ainda presente');
const discoverBlock = learning.match(/renderDiscover\([\s\S]*?\n  \}\n\n  renderChoice/);
if (!discoverBlock) fail('renderDiscover não encontrado');
if (/this\.nextRound\(\)/.test(discoverBlock[0])) fail('descoberta ainda avança automaticamente');
if (!audio.includes('inferAudioName')) fail('motor de áudio sem descoberta automática de MP3');
if (!audio.includes('this.speech?.cancel()')) fail('motor de áudio sem cancelamento seguro da fala');
if (!audio.includes('diagnostics()')) fail('diagnóstico do motor de áudio ausente');
if (!health.includes('sanitizeProgressState')) fail('reparo de persistência ausente');
if (!readiness.includes('getContentReadiness')) fail('camada de prontidão de conteúdo ausente');
if (!app.includes('getContentReadiness') || !app.includes('audio.preload')) fail('integração de conteúdo/áudio ausente');

if (!existsSync(resolve(root, 'src/core/learning-engine.js'))) fail('motor adaptativo ausente');
const progress = read('src/core/progress-store.js');
if (!progress.includes('sessions') || !progress.includes('mastery') || !progress.includes('accuracy') || !progress.includes('lastAttempts')) fail('persistência adaptativa incompleta');
if (!app.includes('let finished = false') || !app.includes('if (finished) return')) fail('proteção contra conclusão duplicada ausente');
if (!app.includes('learning.recommend') || !app.includes('getDifficulty')) fail('integração adaptativa incompleta');
if (!app.includes('onWin({score:touched,rounds:cards.length})')) fail('experiências guiadas sem pontuação real');
if (!app.includes('core.session.ensure') || !app.includes('core.session.complete')) fail('controlador central de sessão não integrado');
if (!app.includes('renderSessionResult') || !app.includes('data-next')) fail('tela de resultado da sessão ausente');
if (!app.includes('journeyStage') || !app.includes('journey-node')) fail('jornada dinâmica ausente');
if (app.includes('setTimeout(onBack,700)')) fail('sessão encerra antes da criança escolher continuar');
if (!existsSync(resolve(root, 'src/core/learning-session.js'))) fail('controlador de sessão ausente');
if (!existsSync(resolve(root, 'src/core/skill-progress.js'))) fail('progresso por habilidade ausente');
if (!learning.includes('difficultyLabel')) fail('feedback visual de dificuldade ausente');
if (!learning.includes("level === 2 ? 5 : 7")) fail('dificuldade adaptativa não altera conjunto de desafios');
if (!registry.includes("'baby-discover'")) fail('baby-discover sem registro central');
if (!read('src/js/games/canvas.js').includes('this.level === 1 ? 3 : this.level === 2 ? 4 : 5')) fail('lousa sem adaptação real por nível');
const rendererIds = [...learning.matchAll(/(?:['\"]([^'\"]+)['\"]|([A-Za-z0-9-]+))\s*:\s*\(\)\s*=>\s*this\./g)].map((m) => m[1] || m[2]);
const supportedModes = new Set(rendererIds);
console.log(`GAME AUDIT OK — ${animals.length} animais com MP3, ${activityIds.length} atividades roteadas, ${supportedModes.size} modos verificados e núcleo adaptativo integrado.`);

const memory = read('src/js/games/memory.js');
const puzzle = read('src/js/games/puzzle.js');
const balloons = read('src/js/games/balloon-pop.js');
const canvas = read('src/js/games/canvas.js');
const cards = read('src/js/games/cards.js');
if (!memory.includes('attempts: this.moves') || !memory.includes('maxScore: rounds')) fail('memória sem métricas semânticas');
if (!puzzle.includes('attempts, maxScore: count')) fail('quebra-cabeça sem métricas semânticas');
if (!balloons.includes('attempts: this.attempts, maxScore: 5')) fail('balões sem métricas semânticas');
if (!canvas.includes("mode: 'explore'") || !canvas.includes('difficulty: this.level')) fail('lousa sem contrato de exploração');
if (!cards.includes("mode: 'explore'") || !cards.includes('completedRounds: 1')) fail('frases sem contrato de exploração');

console.log('Game audit OK');

const core = await read('src/core/app-core.js');
if (!core.includes('rewardActivity(activityId)')) fail('recompensa central nao encontrada');
if (!core.includes('this.progress.award(rewardId)')) fail('recompensa sem idempotencia');

const engine = await read('src/core/learning-engine.js');
if (!engine.includes('getOutcome(activityId)')) fail('resultado adaptativo ausente');
if (!engine.includes("recentAccuracy != null && recentAccuracy >= 85")) fail('regra de avanço ausente');
if (!engine.includes("accuracy >= 60")) fail('regra de prática ausente');
