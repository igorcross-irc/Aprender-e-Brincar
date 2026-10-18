// Parlendas e Gestos — rimas faladas do folclore brasileiro (domínio público), com um gesto para cada verso.
// A criança escuta, faz o gesto e bate palmas no ritmo. Nada é escrito para quem não lê: o gesto é uma figura e a rima é falada.
export const PARLENDAS = {
  feijao: {
    id: 'feijao', title: 'Um, dois, feijão com arroz', icon: '🍚', bpm: 88,
    lines: [
      { text: 'Um, dois, feijão com arroz', gesture: '👏', how: 'Bata palmas' },
      { text: 'Três, quatro, feijão no prato', gesture: '🍽️', how: 'Mostre o prato' },
      { text: 'Cinco, seis, falar inglês', gesture: '🗣️', how: 'Mexa a boca' },
      { text: 'Sete, oito, comer biscoito', gesture: '🍪', how: 'Finja comer' },
      { text: 'Nove, dez, comer pastéis', gesture: '😋', how: 'Esfregue a barriga' }
    ]
  },
  galinha: {
    id: 'galinha', title: 'A galinha do vizinho', icon: '🐔', bpm: 92,
    lines: [
      { text: 'A galinha do vizinho', gesture: '🐔', how: 'Bata os braços como asas' },
      { text: 'Bota ovo amarelinho', gesture: '🥚', how: 'Faça um ovo com as mãos' },
      { text: 'Bota um, bota dois, bota três, bota quatro, bota cinco', gesture: '🖐️', how: 'Conte nos dedos' },
      { text: 'Bota seis, bota sete, bota oito, bota nove, bota dez', gesture: '🙌', how: 'Mostre as duas mãos' }
    ]
  },
  serra: {
    id: 'serra', title: 'Serra, serra, serrador', icon: '🪚', bpm: 80,
    lines: [
      { text: 'Serra, serra, serrador', gesture: '↔️', how: 'Balance os braços indo e vindo' },
      { text: 'Serra o papo do vovô', gesture: '👴', how: 'Faça cosquinha no vovô' },
      { text: 'Quantas tábuas já serrou?', gesture: '🤔', how: 'Faça cara de pensar' },
      { text: 'Já serrei quatrocentas e cinquenta e dez', gesture: '💪', how: 'Mostre os músculos' }
    ]
  },
  batatinha: {
    id: 'batatinha', title: 'Batatinha quando nasce', icon: '🥔', bpm: 72,
    lines: [
      { text: 'Batatinha quando nasce', gesture: '🥔', how: 'Agache e levante devagarinho' },
      { text: 'Esparrama pelo chão', gesture: '🙌', how: 'Abra bem os braços' },
      { text: 'Menininha quando dorme', gesture: '😴', how: 'Feche os olhinhos' },
      { text: 'Põe a mão no coração', gesture: '❤️', how: 'Mão no coração' }
    ]
  },
  cotia: {
    id: 'cotia', title: 'Corre, cotia', icon: '🐹', bpm: 100,
    lines: [
      { text: 'Corre, cotia, na casa da tia', gesture: '🏃', how: 'Corra no lugar' },
      { text: 'Corre, cipó, na casa da vovó', gesture: '🌿', how: 'Rode as mãos' },
      { text: 'Lencinho na mão, caiu no chão', gesture: '🧣', how: 'Deixe o lencinho cair' },
      { text: 'Moça bonita do meu coração', gesture: '💖', how: 'Mande um beijinho' }
    ]
  }
};

// Quantas parlendas por visita e o que aparece, por faixa. Até 2 anos só o gesto de palmas e um verso por vez.
export const PLAN_BY_AGE = {
  '12-18m': { picks: ['feijao'], clapOnly: true, text: false },
  '18-24m': { picks: ['feijao', 'galinha'], clapOnly: true, text: false, count: 1 },
  '2-3y': { picks: ['galinha', 'feijao', 'batatinha'], count: 2, text: false },
  '3-4y': { picks: ['batatinha', 'serra', 'galinha', 'feijao'], count: 2, text: true },
  '4-5y': { picks: ['cotia', 'serra', 'batatinha', 'galinha', 'feijao'], count: 3, text: true }
};

// Parlendas de uma visita: gira pela lista da faixa para a brincadeira parecer nova.
export function parlendasFor(plan, visit = 0) {
  const list = plan.picks;
  const n = Math.min(plan.count || 1, list.length);
  const out = [];
  for (let i = 0; i < n; i += 1) out.push(PARLENDAS[list[(visit + i) % list.length]]);
  return out;
}

// Tempo (ms) de um verso: no ritmo da fala, com um mínimo para a criança fazer o gesto.
export const lineDuration = (text) => Math.max(3600, text.length * 120);
