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
  ],
  objectsAdvanced: [
    { id:'copo', label:'Copo', icon:'🥛', group:'casa' },
    { id:'colher', label:'Colher', icon:'🥄', group:'casa' },
    { id:'sapato', label:'Sapato', icon:'👟', group:'roupas' },
    { id:'camisa', label:'Camisa', icon:'👕', group:'roupas' },
    { id:'escova', label:'Escova', icon:'🪥', group:'cuidados' },
    { id:'livro', label:'Livro', icon:'📚', group:'estudo' }
  ],
  bodyParts: [
    { id:'cabeca', label:'Cabeça', icon:'🙂' },
    { id:'olho', label:'Olho', icon:'👀' },
    { id:'nariz', label:'Nariz', icon:'👃' },
    { id:'boca', label:'Boca', icon:'👄' },
    { id:'mao', label:'Mão', icon:'✋' },
    { id:'pe', label:'Pé', icon:'🦶' }
  ],
  categories: [
    { id:'animal', label:'Animais', icon:'🐶', group:'seres-vivos' },
    { id:'fruta', label:'Frutas', icon:'🍎', group:'alimentos' },
    { id:'brinquedo', label:'Brinquedos', icon:'🧸', group:'objetos' },
    { id:'veiculo', label:'Veículos', icon:'🚗', group:'transportes' }
  ],
  opposites: [
    { id:'big', label:'Grande', pair:'Pequeno', icon:'🐘', pairIcon:'🐜' },
    { id:'up', label:'Alto', pair:'Baixo', icon:'⬆️', pairIcon:'⬇️' },
    { id:'day', label:'Dia', pair:'Noite', icon:'☀️', pairIcon:'🌙' },
    { id:'full', label:'Cheio', pair:'Vazio', icon:'🥛', pairIcon:'🥣' }
  ],
  rhythms: [
    { id:'one', label:'1 palma', pattern:['👏'] },
    { id:'two', label:'2 palmas', pattern:['👏','👏'] },
    { id:'mixed', label:'Palma e pausa', pattern:['👏','⏸️','👏'] },
    { id:'triple', label:'3 palmas', pattern:['👏','👏','👏'] }
  ],
  movements: [
    { id:'clap', label:'Bata palmas', icon:'👏' },
    { id:'wave', label:'Dê tchau', icon:'👋' },
    { id:'jump', label:'Pule', icon:'🦘' },
    { id:'spin', label:'Gire', icon:'🔄' },
    { id:'dance', label:'Dance', icon:'💃' }
  ],
  babyDiscoveries: [
    { id:'light', label:'Luz', icon:'☀️', sound:'Luz!' },
    { id:'ball', label:'Bola', icon:'⚽', sound:'Bola!' },
    { id:'flower', label:'Flor', icon:'🌸', sound:'Flor!' },
    { id:'star', label:'Estrela', icon:'⭐', sound:'Estrela!' },
    { id:'heart', label:'Coração', icon:'❤️', sound:'Coração!' },
    { id:'music', label:'Música', icon:'🎵', sound:'Música!' }
  ],
  colorsAdvanced: [
    { id:'red', label:'Vermelho', icon:'🔴' }, { id:'blue', label:'Azul', icon:'🔵' },
    { id:'yellow', label:'Amarelo', icon:'🟡' }, { id:'green', label:'Verde', icon:'🟢' },
    { id:'orange', label:'Laranja', icon:'🟠' }, { id:'purple', label:'Roxo', icon:'🟣' }
  ],
  vocabulary: [
    { id:'agua', label:'Água', icon:'💧', group:'rotina' }, { id:'comida', label:'Comida', icon:'🍽️', group:'rotina' },
    { id:'mamae', label:'Mamãe', icon:'👩', group:'pessoas' }, { id:'papai', label:'Papai', icon:'👨', group:'pessoas' },
    { id:'cachorro', label:'Cachorro', icon:'🐶', group:'animais' }, { id:'gato', label:'Gato', icon:'🐱', group:'animais' },
    { id:'casa', label:'Casa', icon:'🏠', group:'lugares' }, { id:'parque', label:'Parque', icon:'🌳', group:'lugares' }
  ],
  stories: [
    { id:'morning', title:'Bom dia!', scenes:['☀️','🧸','🍎'], words:['acordou','brincou','comeu'] },
    { id:'park', title:'No parque', scenes:['🏠','🌳','⚽'], words:['saiu','brincou','voltou'] },
    { id:'rain', title:'Dia de chuva', scenes:['☁️','🌧️','🌈'], words:['nuvem','chuva','arco-íris'] }
  ],
  musicPatterns: [
    { id:'p1', label:'Palma', pattern:['👏'] }, { id:'p2', label:'Duas palmas', pattern:['👏','👏'] },
    { id:'p3', label:'Palma e pausa', pattern:['👏','⏸️','👏'] }, { id:'p4', label:'Palma, palma, pausa', pattern:['👏','👏','⏸️'] }
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
