export const developmentContent = {
  shapes: [
    { id: 'circle', label: 'Círculo', icon: '🔵', group: 'redondo' },
    { id: 'square', label: 'Quadrado', icon: '🟦', group: 'lados' },
    { id: 'triangle', label: 'Triângulo', icon: '🔺', group: 'lados' },
    { id: 'star', label: 'Estrela', icon: '⭐', group: 'especial' }
  ],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    id: String(n), label: String(n), icon: ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][n], value: n
  })),
  objects: [
    { id: 'bola', label: 'Bola', icon: '⚽', group: 'brinquedos', size: 'pequeno' },
    { id: 'boneca', label: 'Boneca', icon: '🪆', group: 'brinquedos', size: 'pequeno' },
    { id: 'carro', label: 'Carro', icon: '🚗', group: 'transportes', size: 'pequeno' },
    { id: 'aviao', label: 'Avião', icon: '✈️', group: 'transportes', size: 'grande' },
    { id: 'casa', label: 'Casa', icon: '🏠', group: 'lugares', size: 'grande' },
    { id: 'arvore', label: 'Árvore', icon: '🌳', group: 'natureza', size: 'grande' },
    { id: 'maca', label: 'Maçã', icon: '🍎', group: 'alimentos', size: 'pequeno' },
    { id: 'banana', label: 'Banana', icon: '🍌', group: 'alimentos', size: 'pequeno' }
  ],
  syllables: [
    { id: 'bola', label: 'BOLA', parts: ['BO', 'LA'], icon: '⚽' },
    { id: 'gato', label: 'GATO', parts: ['GA', 'TO'], icon: '🐱' },
    { id: 'pato', label: 'PATO', parts: ['PA', 'TO'], icon: '🦆' },
    { id: 'casa', label: 'CASA', parts: ['CA', 'SA'], icon: '🏠' },
    { id: 'mamae', label: 'MAMÃE', parts: ['MA', 'MÃE'], icon: '👩' }
  ],
  sequences: [
    { id: 'ab', label: 'Cores alternadas', items: ['🔴','🔵','🔴','🔵'], answer: '🔴' },
    { id: 'abc', label: 'Formas', items: ['🔵','🔺','⭐','🔵','🔺'], answer: '⭐' },
    { id: 'size', label: 'Tamanhos', items: ['🐜','🐘','🐜','🐘'], answer: '🐜' }
  ]
};

export const developmentAudioQueue = [
  { id: 'boas-vindas', text: 'Vamos brincar e aprender!', priority: 'base' },
  { id: 'muito-bem', text: 'Muito bem!', priority: 'base' },
  { id: 'vamos-tentar', text: 'Vamos tentar de novo!', priority: 'base' },
  { id: 'qual-e', text: 'Qual é?', priority: 'base' },
  { id: 'onde-esta', text: 'Onde está?', priority: 'base' },
  { id: 'ouca', text: 'Escute com atenção.', priority: 'base' },
  { id: 'repita', text: 'Vamos falar juntos!', priority: 'fala' },
  { id: 'bata-palmas', text: 'Bata palmas para as sílabas.', priority: 'fala' },
  { id: 'qual-comeca', text: 'Qual palavra começa com esse som?', priority: 'fala' },
  { id: 'conte', text: 'Vamos contar juntos!', priority: 'cognicao' },
  { id: 'complete-sequencia', text: 'O que vem depois?', priority: 'cognicao' },
  { id: 'encontre-diferente', text: 'Qual é diferente?', priority: 'cognicao' }
];
