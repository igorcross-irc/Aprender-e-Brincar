// Como eu me sinto? — emoções básicas para nomear, reconhecer em situações e saber o que fazer.
// Nada é escrito para a criança: a pergunta é falada e as respostas são carinhas e figuras.
export const EMOTIONS = {
  feliz: { id: 'feliz', label: 'feliz', color: '#ffd84a' },
  triste: { id: 'triste', label: 'triste', color: '#7cc4ff' },
  bravo: { id: 'bravo', label: 'bravo', color: '#ff7a6b' },
  assustado: { id: 'assustado', label: 'assustado', color: '#c4a3ff' },
  sonolento: { id: 'sonolento', label: 'com sono', color: '#9bb7ff' },
  surpreso: { id: 'surpreso', label: 'surpreso', color: '#ffb35c' }
};

// Situações simples do dia a dia, com figura e frase falada (3 a 5 anos).
export const SITUATIONS = [
  { emotion: 'feliz', icon: '🎂', say: 'Ganhou um bolo de aniversário. Como ele se sente?' },
  { emotion: 'feliz', icon: '🤗', say: 'Ganhou um abraço da vovó. Como ele se sente?' },
  { emotion: 'triste', icon: '🧸', say: 'O brinquedo quebrou. Como ele se sente?' },
  { emotion: 'triste', icon: '🌧️', say: 'Não pôde brincar no parque por causa da chuva. Como ele se sente?' },
  { emotion: 'bravo', icon: '😤', say: 'Um amigo pegou o brinquedo dele sem pedir. Como ele se sente?' },
  { emotion: 'assustado', icon: '⛈️', say: 'Veio um trovão bem forte. Como ele se sente?' },
  { emotion: 'assustado', icon: '🌑', say: 'O quarto ficou escuro de repente. Como ele se sente?' },
  { emotion: 'sonolento', icon: '🌙', say: 'Já é noite e os olhinhos estão fechando. Como ele se sente?' },
  { emotion: 'surpreso', icon: '🎁', say: 'Abriu uma caixa-surpresa! Como ele se sente?' }
];

// O que posso fazer? (4 a 5 anos): uma boa saída para cada emoção difícil.
export const STRATEGIES = {
  triste: { good: 'abraco', say: 'O que ajuda quando a gente está triste?' },
  bravo: { good: 'respirar', say: 'O que ajuda quando a gente está bravo?' },
  assustado: { good: 'ajuda', say: 'O que ajuda quando a gente está assustado?' },
  sonolento: { good: 'descansar', say: 'O que ajuda quando a gente está com sono?' }
};
export const ACTIONS = {
  abraco: { id: 'abraco', icon: '🤗', label: 'Pedir um abraço' },
  respirar: { id: 'respirar', icon: '🌬️', label: 'Respirar fundo' },
  ajuda: { id: 'ajuda', icon: '🙋', label: 'Chamar um adulto' },
  descansar: { id: 'descansar', icon: '😴', label: 'Descansar' },
  bater: { id: 'bater', icon: '💥', label: 'Bater' }
};

export const PLAN_BY_AGE = {
  '2-3y': { mode: 'faces', rounds: 4, options: 2, emotions: ['feliz', 'triste', 'bravo'] },
  '3-4y': { mode: 'situations', rounds: 5, options: 3, emotions: ['feliz', 'triste', 'bravo', 'assustado', 'sonolento'] },
  '4-5y': { mode: 'situations', rounds: 6, options: 3, strategies: true, emotions: ['feliz', 'triste', 'bravo', 'assustado', 'sonolento', 'surpreso'] }
};

const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// Monta as rodadas de uma visita: cada rodada tem a resposta certa, as opções e, se couber, a etapa "o que fazer".
export function buildRounds(plan, visit = 0) {
  const rounds = [];
  const emotions = plan.emotions.slice();
  const rot = visit % emotions.length;
  const order = [...emotions.slice(rot), ...emotions.slice(0, rot)];
  for (let i = 0; i < plan.rounds; i += 1) {
    const emotion = order[i % order.length];
    const wrongPool = shuffle(emotions.filter((e) => e !== emotion)).slice(0, plan.options - 1);
    const options = shuffle([emotion, ...wrongPool]);
    let situation = null;
    if (plan.mode === 'situations') {
      const fits = SITUATIONS.filter((s) => s.emotion === emotion);
      situation = fits.length ? fits[(visit + i) % fits.length] : null;
    }
    let strategy = null;
    if (plan.strategies && STRATEGIES[emotion]) {
      const good = STRATEGIES[emotion].good;
      const others = shuffle(Object.keys(ACTIONS).filter((a) => a !== good && a !== 'bater')).slice(0, 1);
      strategy = { say: STRATEGIES[emotion].say, good, options: shuffle([good, ...others, 'bater']) };
    }
    rounds.push({ emotion, options, situation, strategy });
  }
  return rounds;
}

// Carinha em SVG (serve também para aparelhos antigos): olhos, sobrancelhas e boca mudam com a emoção.
export function faceSvg(emotion, size = 96) {
  const e = EMOTIONS[emotion] || EMOTIONS.feliz;
  const eyes = {
    feliz: '<path d="M30 42q6-8 12 0M58 42q6-8 12 0" fill="none" stroke="#2a1b3d" stroke-width="4" stroke-linecap="round"/>',
    triste: '<circle cx="36" cy="44" r="5" fill="#2a1b3d"/><circle cx="64" cy="44" r="5" fill="#2a1b3d"/><path d="M28 34l14 4M72 34l-14 4" stroke="#2a1b3d" stroke-width="3.5" stroke-linecap="round"/>',
    bravo: '<circle cx="36" cy="46" r="5" fill="#2a1b3d"/><circle cx="64" cy="46" r="5" fill="#2a1b3d"/><path d="M26 34l16 8M74 34l-16 8" stroke="#2a1b3d" stroke-width="4.5" stroke-linecap="round"/>',
    assustado: '<circle cx="36" cy="44" r="8" fill="#fff" stroke="#2a1b3d" stroke-width="3"/><circle cx="64" cy="44" r="8" fill="#fff" stroke="#2a1b3d" stroke-width="3"/><circle cx="36" cy="45" r="3" fill="#2a1b3d"/><circle cx="64" cy="45" r="3" fill="#2a1b3d"/><path d="M28 30q8-6 16 0M56 30q8-6 16 0" fill="none" stroke="#2a1b3d" stroke-width="3" stroke-linecap="round"/>',
    sonolento: '<path d="M28 46q8 6 16 0M56 46q8 6 16 0" fill="none" stroke="#2a1b3d" stroke-width="4" stroke-linecap="round"/>',
    surpreso: '<circle cx="36" cy="44" r="7" fill="#2a1b3d"/><circle cx="64" cy="44" r="7" fill="#2a1b3d"/><path d="M28 28q8-8 16 0M56 28q8-8 16 0" fill="none" stroke="#2a1b3d" stroke-width="3.5" stroke-linecap="round"/>'
  }[emotion] || '';
  const mouth = {
    feliz: '<path d="M32 62q18 22 36 0z" fill="#2a1b3d"/><path d="M38 66q12 10 24 0" fill="#ff7a8a"/>',
    triste: '<path d="M34 74q16-16 32 0" fill="none" stroke="#2a1b3d" stroke-width="4.5" stroke-linecap="round"/><path d="M30 54q-4 8 0 12q4-4 0-12z" fill="#7cc4ff"/>',
    bravo: '<path d="M34 74q16-12 32 0" fill="none" stroke="#2a1b3d" stroke-width="5" stroke-linecap="round"/>',
    assustado: '<ellipse cx="50" cy="70" rx="8" ry="10" fill="#2a1b3d"/>',
    sonolento: '<ellipse cx="50" cy="70" rx="6" ry="4" fill="#2a1b3d"/><text x="70" y="26" font-size="16" fill="#2a1b3d">z</text><text x="78" y="18" font-size="12" fill="#2a1b3d">z</text>',
    surpreso: '<circle cx="50" cy="70" r="9" fill="#2a1b3d"/>'
  }[emotion] || '';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="46" fill="${e.color}" stroke="#2a1b3d" stroke-width="4"/>${eyes}${mouth}${emotion === 'bravo' ? '<circle cx="24" cy="62" r="5" fill="#ff5d4d" opacity=".5"/><circle cx="76" cy="62" r="5" fill="#ff5d4d" opacity=".5"/>' : ''}</svg>`;
}
