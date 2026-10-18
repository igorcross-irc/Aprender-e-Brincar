import { stories } from '../content/stories/index.js';
import { MODELS } from '../js/games/blocos/blocos-data.js';
import { RECIPES } from '../js/games/cozinha/cozinha-data.js';
import { activityCatalog } from '../content/activity-catalog.js';
import { resumoPorCampo } from './campos-de-experiencia.js';

// Diário da Família: um retrato afetuoso do que a criança viveu no app, montado só com o que já está guardado
// no aparelho (nada é enviado). Não avalia nem compara: conta o que ela fez e sugere brincadeiras fora da tela.
const KEYS = { read: 'ab_stories_v1', atelie: 'ab_atelie_v1', cozinha: 'ab_cozinha_v1', blocos: 'ab_blocos_v1', sea: 'ab_scene_sea_v1', studio: 'ab_studio_v1', farm: 'ab_farm_v1' };

function readJson(storage, key) {
  try { const v = JSON.parse(storage.getItem(key) || 'null'); return v && typeof v === 'object' ? v : null; } catch (error) { return null; }
}
const sumValues = (obj) => Object.values(obj || {}).reduce((n, v) => n + (Number(v) || 0), 0);
const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const IDEAS = {
  stories: 'Peça que ela conte a história de hoje com as próprias palavras, nem que invente o final. Vocês podem fazer as vozes dos personagens.',
  atelie: 'Desenhem juntos com giz ou lápis de cor o mesmo desenho que ganhou vida na tela e deem um nome para ele.',
  cozinha: 'Na cozinha de verdade, peça que ela escolha dois ingredientes e conte com você: "um, dois". Misturar em uma tigela é brincadeira séria.',
  blocos: 'Com caixas, copos ou almofadas, construam uma torre e contem as peças em voz alta antes de derrubar.',
  studio: 'Façam música com panelas e colheres: bata quatro vezes devagar e peça que ela repita o seu ritmo.',
  sea: 'Escolha um bicho do mar e imitem juntos como ele se mexe e que som ele faria.',
  farm: 'Plantem uma sementinha de feijão num copo com algodão e acompanhem o broto crescer.',
  none: 'Escolha um brinquedo, esconda e dê pistas: "está perto, está longe". Procurar juntos treina a atenção e a linguagem.'
};

export function buildDiary({ storage = localStorage, progress = {}, childName = '', now = new Date() } = {}) {
  const read = readJson(storage, KEYS.read) || {};
  const atelie = readJson(storage, KEYS.atelie) || {};
  const cozinha = readJson(storage, KEYS.cozinha) || {};
  const blocos = readJson(storage, KEYS.blocos) || {};
  const sea = readJson(storage, KEYS.sea) || {};
  const studio = readJson(storage, KEYS.studio) || {};
  const farm = readJson(storage, KEYS.farm) || {};
  const sessions = progress.sessions || {};
  const name = String(childName || '').trim();

  const readIds = Object.keys(read).filter((id) => Number(read[id]) > 0);
  const favorite = readIds.sort((a, b) => read[b] - read[a])[0];
  const storyTitle = (id) => stories.find((s) => s.id === id)?.title || id;
  const made = Object.keys(cozinha.made || {}).map((id) => RECIPES[id]?.label).filter(Boolean);
  const built = Object.keys(blocos.built || {}).map((id) => MODELS[id]?.label).filter(Boolean);
  const drawings = Object.keys(atelie.done || {}).length;
  const found = Object.keys(sea.found || {}).length;
  const dishes = sumValues(cozinha.made);
  const buildings = sumValues(blocos.built);

  const highlights = [];
  if (readIds.length) highlights.push(`Ouviu ${plural(readIds.length, 'história', 'histórias')}${favorite && read[favorite] > 1 ? ` — a favorita é "${storyTitle(favorite)}" (${read[favorite]} vezes)` : ''}.`);
  if (drawings) highlights.push(`Pintou e deu vida a ${plural(drawings, 'desenho', 'desenhos')}.`);
  if (dishes) highlights.push(`Cozinhou ${plural(dishes, 'prato', 'pratos')}: ${list(made)}.`);
  if (buildings) highlights.push(`Construiu ${plural(buildings, 'vez', 'vezes')}: ${list(built)}.`);
  if (found) highlights.push(`Descobriu ${plural(found, 'bicho', 'bichos')} no Fundo do Mar.`);
  if (studio.pattern?.length) highlights.push('Criou uma música no Estúdio dos Bichos e ela está guardada.');
  if (Number(farm.visits) > 0) highlights.push(`Visitou a Fazendinha ${plural(Number(farm.visits), 'vez', 'vezes')}.`);
  if (Number(sessions.streak) > 1) highlights.push(`Brincou ${sessions.streak} dias seguidos.`);

  const used = [];
  if (readIds.length) used.push('stories');
  if (drawings) used.push('atelie');
  if (dishes) used.push('cozinha');
  if (buildings) used.push('blocos');
  if (studio.pattern?.length || Number(studio.visits) > 0) used.push('studio');
  if (found) used.push('sea');
  if (Number(farm.visits) > 0) used.push('farm');
  const pool = used.length ? used : ['none'];
  const day = Math.floor(now.getTime() / 86400000);
  const ideas = [0, 1, 2].map((i) => IDEAS[pool[(day + i) % pool.length]]).filter((idea, i, all) => all.indexOf(idea) === i);

  const recent = (progress.history || []).slice(0, 5).map((h) => activityCatalog.find((a) => a.id === h.activityId)?.title).filter(Boolean);
  const stats = [
    { icon: '⏱️', label: 'minutos de tela', value: Math.round((Number(sessions.totalDurationMs) || 0) / 60000) },
    { icon: '📖', label: 'histórias', value: readIds.length },
    { icon: '🎨', label: 'desenhos', value: drawings },
    { icon: '🍳', label: 'pratos', value: dishes },
    { icon: '🧱', label: 'construções', value: buildings }
  ];
  const campos = resumoPorCampo(progress.activities || {}, activityCatalog);
  const title = name ? `Diário de ${name}` : 'Diário da criança';
  const text = [
    title,
    ...(highlights.length ? highlights.map((h) => `• ${h}`) : ['• Ainda está começando: brinquem juntos e volte aqui depois.']),
    ...(campos.some((c) => c.count) ? ['', `Por onde brincou (campos de experiência da BNCC): ${campos.filter((c) => c.count).map((c) => `${c.short} (${c.count})`).join(', ')}.`] : []),
    '',
    'Ideias para brincar fora da tela:',
    ...ideas.map((i) => `- ${i}`),
    '',
    'Um retrato das brincadeiras, não uma avaliação. Não substitui acompanhamento profissional.'
  ].join('\n');
  return { title, stats, highlights, ideas, recent, campos, text };
}

export const DIARY_KEYS = KEYS;
