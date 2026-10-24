// Os cinco campos de experiência da Base Nacional Comum Curricular (BNCC) da Educação Infantil.
// Servem para a família ver, no Diário, por onde a criança tem brincado. Não há nota nem comparação.
export const CAMPOS = {
  eo: { id: 'eo', label: 'O eu, o outro e o nós', short: 'Eu e o outro' },
  cg: { id: 'cg', label: 'Corpo, gestos e movimentos', short: 'Corpo e movimento' },
  ts: { id: 'ts', label: 'Traços, sons, cores e formas', short: 'Sons, cores e formas' },
  ef: { id: 'ef', label: 'Escuta, fala, pensamento e imaginação', short: 'Fala e imaginação' },
  et: { id: 'et', label: 'Espaços, tempos, quantidades, relações e transformações', short: 'Quantidades e descobertas' }
};

// Campos de cada jogo-âncora (o campo principal primeiro).
const BY_ACTIVITY = {
  farm: ['et', 'ef'],
  'scene-sea': ['ef', 'et'],
  studio: ['ts', 'cg'],
  atelie: ['ts', 'cg'],
  cozinha: ['et', 'eo'],
  blocos: ['et', 'cg'],
  storybook: ['ef', 'eo'],
  sentimentos: ['eo', 'ef'],
  parlendas: ['ef', 'ts', 'cg'],
  communication: ['eo', 'ef'],
  movement: ['cg'], rhythm: ['ts', 'cg'], 'guided-movement': ['cg'], 'movement-copy': ['cg'], 'rhythm-copy': ['ts', 'cg'], 'music-keys': ['ts'], canvas: ['ts']
};

// Quando o jogo não está na lista, o campo vem das áreas de desenvolvimento da atividade.
const BY_DOMAIN = { motricidade: 'cg', linguagem: 'ef', cognição: 'et', audição: 'ts', socioemocional: 'eo' };

export function camposDe(activity) {
  if (!activity) return [];
  if (BY_ACTIVITY[activity.id]) return BY_ACTIVITY[activity.id];
  const found = [];
  (activity.developmentDomains || []).forEach((d) => { const c = BY_DOMAIN[d]; if (c && !found.includes(c)) found.push(c); });
  return found;
}

// Soma as brincadeiras concluídas por campo: [{ id, label, short, count }], do mais ao menos brincado.
export function resumoPorCampo(activitiesProgress = {}, catalog = []) {
  const totals = {};
  Object.entries(activitiesProgress).forEach(([id, progress]) => {
    const n = Number(progress?.completions) || 0;
    if (!n) return;
    camposDe(catalog.find((a) => a.id === id)).forEach((c, i) => { totals[c] = (totals[c] || 0) + n * (i === 0 ? 1 : 0.5); });
  });
  return Object.keys(CAMPOS).map((id) => ({ ...CAMPOS[id], count: Math.round(totals[id] || 0) })).sort((a, b) => b.count - a.count);
}
