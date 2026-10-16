// Dados do Estúdio dos Bichos: a banda, a escala e o plano por faixa de idade.
// Ordem da banda = ordem em que os bichos entram nas idades menores (a sequência completa tem 4 trilhas).
export const BAND = [
  { id: 'vaca', kind: 'kick', label: 'Vaca', color: 0xff6fa5, css: '#ff6fa5', icon: '🐄' },
  { id: 'galinha', kind: 'xylo', label: 'Galinha', color: 0xffcf1f, css: '#ffcf1f', icon: '🐔' },
  { id: 'cachorro', kind: 'snare', label: 'Cachorro', color: 0x2f7de1, css: '#2f7de1', icon: '🐶' },
  { id: 'gato', kind: 'bell', label: 'Gato', color: 0x7a3fd0, css: '#7a3fd0', icon: '🐱' }
];

// Escala pentatônica de dó: qualquer combinação soa bem.
export const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
export const noteFor = (kind, index) => (kind === 'bell' ? SCALE[(index * 2 + 1) % SCALE.length] : SCALE[index % SCALE.length]);

// mode 'free': tocar nos bichos (target = toques para a comemoração).
// mode 'seq': sequenciador (steps colunas × 4 trilhas; a comemoração vem depois de `loops` voltas com pelo menos `minNotes` quadradinhos).
export const PLAN_BY_AGE = {
  '6-12m': { mode: 'free', animals: 2, target: 8 },
  '12-18m': { mode: 'free', animals: 3, target: 8 },
  '18-24m': { mode: 'free', animals: 4, target: 10 },
  '2-3y': { mode: 'free', animals: 4, target: 12 },
  '3-4y': { mode: 'seq', steps: 4, minNotes: 4, loops: 2, stepSeconds: 0.5 },
  '4-5y': { mode: 'seq', steps: 8, minNotes: 8, loops: 2, stepSeconds: 0.32 }
};
