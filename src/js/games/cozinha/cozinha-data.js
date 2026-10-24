// Cozinha Maluca — dados: ingredientes, receitas em etapas visuais e clientes bichinhos.
// Nada é escrito para a criança: o pedido é uma figura, as etapas são ícones, as instruções são faladas.
export const INGREDIENTS = {
  pao: { label: 'Pão', emoji: '🍞', audio: 'pao.mp3' },
  queijo: { label: 'Queijo', emoji: '🧀', audio: 'queijo.mp3' },
  tomate: { label: 'Tomate', emoji: '🍅', audio: 'tomate.mp3' },
  alface: { label: 'Alface', emoji: '🥬' },
  cenoura: { label: 'Cenoura', emoji: '🥕' },
  laranja: { label: 'Laranja', emoji: '🍊' },
  ovo: { label: 'Ovo', emoji: '🥚' },
  morango: { label: 'Morango', emoji: '🍓' },
  peixe: { label: 'Peixe', emoji: '🐟' },
  farinha: { label: 'Farinha', emoji: '🌾' },
  agua: { label: 'Água', emoji: '💧' }
};

// Tipos de etapa: add (um ingrediente), count (colheres contadas), mix (mexer), bake (assar), serve (servir).
// "n" repete a etapa (2 laranjas). "color" é a cor da massa depois de misturar.
export const RECIPES = {
  sanduiche: {
    id: 'sanduiche', label: 'Sanduíche', emoji: '🥪', level: 1, audio: 'sanduiche.mp3', stack: true,
    steps: [{ t: 'add', ing: 'pao' }, { t: 'add', ing: 'queijo' }, { t: 'add', ing: 'tomate' }, { t: 'add', ing: 'pao' }, { t: 'serve' }]
  },
  suco: {
    id: 'suco', label: 'Suco de laranja', emoji: '🧃', level: 1, audio: 'suco.mp3', color: 0xffa31a,
    steps: [{ t: 'add', ing: 'laranja', n: 2 }, { t: 'mix' }, { t: 'serve' }]
  },
  salada: {
    id: 'salada', label: 'Salada', emoji: '🥗', level: 2, color: 0x7ddc4a,
    steps: [{ t: 'add', ing: 'alface' }, { t: 'add', ing: 'tomate' }, { t: 'add', ing: 'cenoura' }, { t: 'mix' }, { t: 'serve' }]
  },
  bolo: {
    id: 'bolo', label: 'Bolo de morango', emoji: '🎂', level: 3, audio: 'bolo.mp3', color: 0xf5d79a,
    steps: [{ t: 'count', ing: 'farinha', n: 3 }, { t: 'add', ing: 'ovo', n: 2 }, { t: 'mix' }, { t: 'bake' }, { t: 'add', ing: 'morango' }, { t: 'serve' }]
  },
  sopa: {
    id: 'sopa', label: 'Sopa de legumes', emoji: '🍲', level: 3, color: 0xff9440,
    steps: [{ t: 'add', ing: 'cenoura' }, { t: 'add', ing: 'tomate' }, { t: 'count', ing: 'agua', n: 2 }, { t: 'mix' }, { t: 'bake' }, { t: 'serve' }]
  },
  peixe: {
    id: 'peixe', label: 'Peixe assado', emoji: '🐟', level: 2, color: 0xd9a066,
    steps: [{ t: 'add', ing: 'peixe' }, { t: 'add', ing: 'tomate' }, { t: 'bake' }, { t: 'serve' }]
  }
};

export const CUSTOMERS = [
  { id: 'vaca', label: 'Vaca', likes: ['salada', 'suco', 'sanduiche', 'bolo', 'sopa'] },
  { id: 'galinha', label: 'Galinha', likes: ['salada', 'sopa', 'suco', 'sanduiche'] },
  { id: 'cachorro', label: 'Cachorro', likes: ['sanduiche', 'sopa', 'bolo', 'peixe'] },
  { id: 'gato', label: 'Gato', likes: ['peixe', 'suco', 'bolo', 'sanduiche'] },
  { id: 'pato', label: 'Pato', likes: ['salada', 'sanduiche', 'suco', 'sopa'] }
];

// pool: receitas possíveis na faixa; orders: pedidos por brincadeira; distractors: ingredientes a mais na prateleira;
// hint: o ingrediente certo pisca (3–4 anos); sem pista nos 4–5 anos, só o alinhamento das etapas.
export const PLAN_BY_AGE = {
  '3-4y': { pool: ['sanduiche', 'suco', 'salada', 'peixe'], orders: 2, distractors: 0, hint: true },
  '4-5y': { pool: ['sanduiche', 'suco', 'salada', 'bolo', 'sopa', 'peixe'], orders: 3, distractors: 2, hint: false }
};

export const NUMBER_WORDS = { 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro' };

// Escolhe os pedidos de uma visita: gira pelas receitas da faixa, com clientes que gostam delas.
export function pickOrders(plan, visit) {
  const pool = plan.pool;
  const orders = [];
  for (let i = 0; i < plan.orders; i += 1) {
    const recipe = RECIPES[pool[(visit * plan.orders + i) % pool.length]];
    const fans = CUSTOMERS.filter((c) => c.likes.includes(recipe.id));
    const customer = fans[(visit + i) % fans.length];
    orders.push({ recipe, customer });
  }
  return orders;
}

// Ingredientes da prateleira para uma receita (os usados, mais alguns a mais nas faixas maiores).
export function shelfFor(recipe, plan, seed = 0) {
  const used = [];
  recipe.steps.forEach((s) => { if ((s.t === 'add' || s.t === 'count') && !used.includes(s.ing)) used.push(s.ing); });
  const extras = Object.keys(INGREDIENTS).filter((k) => !used.includes(k) && k !== 'agua' && k !== 'farinha');
  const more = [];
  for (let i = 0; i < plan.distractors; i += 1) more.push(extras[(seed + i * 3) % extras.length]);
  const all = [...used, ...more.filter((m, i) => more.indexOf(m) === i && !used.includes(m))];
  // Ordem estável mas embaralhada por seed, para a criança não decorar a posição.
  return all.map((id, i) => ({ id, k: (i * 7 + seed * 5) % 11 })).sort((a, b) => a.k - b.k).map((x) => x.id);
}
