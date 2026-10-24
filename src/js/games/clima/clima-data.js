// Que roupa eu visto? — o tempo de hoje e o que o bichinho precisa vestir ou levar.
// A pergunta é falada e as respostas são figuras; nada é escrito para quem não lê. Não há derrota.
export const WEATHERS = {
  sol: { id: 'sol', icon: '☀️', label: 'sol', say: 'Hoje está de sol e muito calor.', good: ['camiseta', 'bone', 'oculos'] },
  chuva: { id: 'chuva', icon: '🌧️', label: 'chuva', say: 'Hoje está chovendo.', good: ['guardachuva', 'bota'] },
  frio: { id: 'frio', icon: '❄️', label: 'frio', say: 'Hoje está muito frio.', good: ['casaco', 'cachecol', 'luvas'] }
};

export const ITEMS = {
  camiseta: { id: 'camiseta', icon: '👕', label: 'camiseta' },
  bone: { id: 'bone', icon: '🧢', label: 'boné' },
  oculos: { id: 'oculos', icon: '🕶️', label: 'óculos de sol' },
  guardachuva: { id: 'guardachuva', icon: '☂️', label: 'guarda-chuva' },
  bota: { id: 'bota', icon: '🥾', label: 'bota' },
  casaco: { id: 'casaco', icon: '🧥', label: 'casaco' },
  cachecol: { id: 'cachecol', icon: '🧣', label: 'cachecol' },
  luvas: { id: 'luvas', icon: '🧤', label: 'luvas' }
};

// rounds: quantas perguntas; options: quantas figuras na tela; need: quantas respostas certas por pergunta.
export const PLAN_BY_AGE = {
  '2-3y': { rounds: 3, options: 2, need: 1, prompt: false },
  '3-4y': { rounds: 4, options: 3, need: 1, prompt: false },
  '4-5y': { rounds: 4, options: 4, need: 2, prompt: true }
};

const WEATHER_IDS = Object.keys(WEATHERS);

// Perguntas de uma visita: o tempo gira a cada visita e as figuras erradas vêm de outros tempos.
export function buildRounds(plan, visit = 0) {
  const rounds = [];
  for (let i = 0; i < plan.rounds; i += 1) {
    const weather = WEATHERS[WEATHER_IDS[(visit + i) % WEATHER_IDS.length]];
    const goods = weather.good.map((_, k) => weather.good[(k + visit + i) % weather.good.length]).slice(0, plan.need);
    const wrongPool = WEATHER_IDS.filter((w) => w !== weather.id).flatMap((w) => WEATHERS[w].good.filter((g) => !weather.good.includes(g)));
    const wrongs = [];
    for (let k = 0; wrongs.length < plan.options - plan.need && k < wrongPool.length * 2; k += 1) {
      const id = wrongPool[(visit * 3 + i * 5 + k * 2) % wrongPool.length];
      if (!wrongs.includes(id)) wrongs.push(id);
    }
    const options = [...goods, ...wrongs].map((id, idx) => ({ id, k: (idx * 7 + visit + i * 3) % 11 })).sort((a, b) => a.k - b.k).map((o) => o.id);
    rounds.push({ weather: weather.id, goods, options, need: plan.need });
  }
  return rounds;
}
