// Campos de experiência da BNCC para a Educação Infantil (o currículo oficial de 0 a 5 anos).
// Servem só para o responsável enxergar PARA ONDE a brincadeira aponta; é uma aproximação,
// não uma avaliação da criança. A lógica é pura (sem tela) para poder ser testada.
export const CAMPOS = Object.freeze({
  eu: { id: 'eu', title: 'O eu, o outro e o nós', icon: '👫', hint: 'Conviver, se expressar, escolher e pedir.', ideas: ['Deixe a criança escolher entre duas opções (camisa azul ou vermelha?).', 'Nomeie emoções durante o dia: “você ficou bravo, né?”.'] },
  corpo: { id: 'corpo', title: 'Corpo, gestos e movimentos', icon: '🤸', hint: 'Mexer o corpo, imitar, coordenar mãos e olhos.', ideas: ['Dancem uma música e congelem quando ela parar.', 'Façam um caminho no chão com almofadas para pular e engatinhar.'] },
  tracos: { id: 'tracos', title: 'Traços, sons, cores e formas', icon: '🎨', hint: 'Cores, formas, música, ritmo e desenho.', ideas: ['Procurem coisas vermelhas pela casa.', 'Batucar em panelas com colher de pau, devagar e depressa.'] },
  escuta: { id: 'escuta', title: 'Escuta, fala, pensamento e imaginação', icon: '🗣️', hint: 'Ouvir, falar, rimar, ouvir histórias.', ideas: ['Leia um livro apontando as figuras e perguntando “cadê?”.', 'Cante músicas com gestos antes de dormir.'] },
  espacos: { id: 'espacos', title: 'Espaços, tempos, quantidades, relações e transformações', icon: '🔢', hint: 'Contar, comparar, classificar, observar a natureza.', ideas: ['Contem degraus, passos e colheradas em voz alta.', 'Separem as meias por cor ou por tamanho.'] }
});

const BY_WORLD = {
  discover: ['espacos'],
  language: ['escuta'],
  'colors-shapes': ['tracos'],
  'animals-sounds': ['tracos', 'espacos'],
  'numbers-logic': ['espacos'],
  'memory-attention': ['escuta'],
  'create-move': ['corpo', 'tracos']
};

const BY_CATEGORY = {
  movimento: ['corpo'],
  comunicacao: ['eu', 'escuta'],
  musica: ['tracos', 'corpo'],
  'coordenação': ['corpo']
};

// Cada brincadeira aponta para um ou dois campos: a categoria manda, o mundo é o plano B.
export function camposFor(activity) {
  if (!activity) return [];
  const ids = BY_CATEGORY[activity.category] || BY_WORLD[activity.world] || [];
  return ids.map((id) => CAMPOS[id]);
}

// Quantas vezes a criança brincou em cada campo. progressById: { [activityId]: { completions } }.
export function campoTotals(activities, progressById = {}) {
  const totals = {};
  Object.keys(CAMPOS).forEach((id) => { totals[id] = 0; });
  (activities || []).forEach((activity) => {
    const plays = Math.max(0, Number(progressById[activity.id]?.completions) || 0);
    if (!plays) return;
    camposFor(activity).forEach((campo) => { totals[campo.id] += plays; });
  });
  return Object.keys(CAMPOS).map((id) => ({ ...CAMPOS[id], plays: totals[id] }));
}

// Faixas da BNCC da Educação Infantil: bebês (0 a 1 ano e 6 meses), crianças bem pequenas
// (1 ano e 7 meses a 3 anos e 11 meses) e crianças pequenas (4 a 5 anos e 11 meses).
export const FAIXAS_BNCC = Object.freeze({
  EI01: { code: 'EI01', title: 'Bebês', range: '0 a 1 ano e 6 meses' },
  EI02: { code: 'EI02', title: 'Crianças bem pequenas', range: '1 ano e 7 meses a 3 anos e 11 meses' },
  EI03: { code: 'EI03', title: 'Crianças pequenas', range: '4 anos a 5 anos e 11 meses' }
});

// Faixa do app → faixa da BNCC (a de 18 a 24 meses atravessa a divisa: vale a mais próxima de cada metade).
export function faixaBncc(ageBandId) {
  if (ageBandId === '6-12m' || ageBandId === '12-18m') return FAIXAS_BNCC.EI01;
  if (ageBandId === '4-5y') return FAIXAS_BNCC.EI03;
  return FAIXAS_BNCC.EI02;
}
