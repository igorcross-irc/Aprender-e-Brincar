export const developmentContent = {
  shapes: [
    { id: 'circle', label: 'Círculo', icon: '🔵', group: 'redondo' },
    { id: 'square', label: 'Quadrado', icon: '🟦', group: 'lados' },
    { id: 'triangle', label: 'Triângulo', icon: '🔺', group: 'lados' },
    { id: 'star', label: 'Estrela', icon: '⭐', group: 'especial' },
    { id: 'diamond', label: 'Losango', icon: '🔶', group: 'lados' },
    { id: 'heart', label: 'Coração', icon: '❤️', group: 'especial' }
  ],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
    id: String(n), label: String(n), icon: ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'][n], value: n
  })),
  objects: [
    { id: 'bola', label: 'Bola', icon: '⚽', group: 'brinquedos', size: 'pequeno' },
    { id: 'boneca', label: 'Boneca', icon: '🪆', group: 'brinquedos', size: 'pequeno' },
    { id: 'carro', label: 'Carro', icon: '🚗', group: 'transportes', size: 'grande' },
    { id: 'aviao', label: 'Avião', icon: '✈️', group: 'transportes', size: 'grande' },
    { id: 'casa', label: 'Casa', icon: '🏠', group: 'lugares', size: 'grande' },
    { id: 'arvore', label: 'Árvore', icon: '🌳', group: 'natureza', size: 'grande' },
    { id: 'maca', label: 'Maçã', icon: '🍎', group: 'alimentos', size: 'pequeno' },
    { id: 'banana', label: 'Banana', icon: '🍌', group: 'alimentos', size: 'pequeno' },
    { id: 'uva', label: 'Uva', icon: '🍇', group: 'alimentos', size: 'pequeno' },
    { id: 'laranja', label: 'Laranja', icon: '🍊', group: 'alimentos', size: 'pequeno' },
    { id: 'bicicleta', label: 'Bicicleta', icon: '🚲', group: 'transportes', size: 'grande' },
    { id: 'onibus', label: 'Ônibus', icon: '🚌', group: 'transportes', size: 'grande' },
    { id: 'trem', label: 'Trem', icon: '🚂', group: 'transportes', size: 'grande' },
    { id: 'flor', label: 'Flor', icon: '🌸', group: 'natureza', size: 'pequeno' },
    { id: 'sol', label: 'Sol', icon: '☀️', group: 'natureza', size: 'grande' },
    { id: 'chapeu', label: 'Chapéu', icon: '🎩', group: 'roupas', size: 'pequeno' },
    { id: 'relogio', label: 'Relógio', icon: '⏰', group: 'casa', size: 'pequeno' }
  ],
  syllables: [
    { id: 'bola', label: 'BOLA', parts: ['BO', 'LA'], icon: '⚽' },
    { id: 'gato', label: 'GATO', parts: ['GA', 'TO'], icon: '🐱' },
    { id: 'pato', label: 'PATO', parts: ['PA', 'TO'], icon: '🦆' },
    { id: 'casa', label: 'CASA', parts: ['CA', 'SA'], icon: '🏠' },
    { id: 'mamae', label: 'MAMÃE', parts: ['MA', 'MÃE'], icon: '👩' },
    { id: 'sapo', label: 'SAPO', parts: ['SA', 'PO'], icon: '🐸' },
    { id: 'vaca', label: 'VACA', parts: ['VA', 'CA'], icon: '🐮' },
    { id: 'bolo', label: 'BOLO', parts: ['BO', 'LO'], icon: '🎂' },
    { id: 'lobo', label: 'LOBO', parts: ['LO', 'BO'], icon: '🐺' },
    { id: 'dedo', label: 'DEDO', parts: ['DE', 'DO'], icon: '☝️' },
    { id: 'sapato', label: 'SAPATO', parts: ['SA', 'PA', 'TO'], icon: '👟' }
  ],
  sequences: [
    { id: 'ab', label: 'Cores alternadas', items: ['🔴','🔵','🔴','🔵'], answer: '🔴' },
    { id: 'abc', label: 'Formas', items: ['🔵','🔺','⭐','🔵','🔺'], answer: '⭐' },
    { id: 'size', label: 'Tamanhos', items: ['🐜','🐘','🐜','🐘'], answer: '🐜' },
    { id: 'fruits', label: 'Frutas', items: ['🍎','🍌','🍎','🍌'], answer: '🍎' },
    { id: 'sky', label: 'Dia e noite', items: ['☀️','🌙','☀️','🌙'], answer: '☀️' },
    { id: 'pets', label: 'Bichinhos', items: ['🐶','🐱','🐶','🐱'], answer: '🐶' },
    { id: 'aab', label: 'Dois e um', items: ['🔴','🔴','🔵','🔴','🔴'], answer: '🔵' },
    { id: 'stars', label: 'Estrelas e formas', items: ['⭐','🔺','⭐','🔺'], answer: '⭐' }
  ],
  objectsAdvanced: [
    { id:'copo', label:'Copo', icon:'🥛', group:'casa' },
    { id:'colher', label:'Colher', icon:'🥄', group:'casa' },
    { id:'sapato', label:'Sapato', icon:'👟', group:'roupas' },
    { id:'camisa', label:'Camisa', icon:'👕', group:'roupas' },
    { id:'escova', label:'Escova', icon:'🪥', group:'cuidados' },
    { id:'livro', label:'Livro', icon:'📚', group:'estudo' },
    { id:'chave', label:'Chave', icon:'🔑', group:'casa' },
    { id:'sorvete', label:'Sorvete', icon:'🍦', group:'comida' },
    { id:'pao', label:'Pão', icon:'🍞', group:'comida' },
    { id:'balao', label:'Balão', icon:'🎈', group:'festa' },
    { id:'presente', label:'Presente', icon:'🎁', group:'festa' }
  ],
  bodyParts: [
    { id:'cabeca', label:'Cabeça', icon:'🙂' },
    { id:'olho', label:'Olho', icon:'👀' },
    { id:'nariz', label:'Nariz', icon:'👃' },
    { id:'boca', label:'Boca', icon:'👄' },
    { id:'mao', label:'Mão', icon:'✋' },
    { id:'pe', label:'Pé', icon:'🦶' },
    { id:'orelha', label:'Orelha', icon:'👂' },
    { id:'lingua', label:'Língua', icon:'👅' },
    { id:'braco', label:'Braço', icon:'💪' }
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
    { id:'full', label:'Cheio', pair:'Vazio', icon:'🥛', pairIcon:'🥣' },
    { id:'hot', label:'Quente', pair:'Frio', icon:'🔥', pairIcon:'❄️' },
    { id:'happy', label:'Feliz', pair:'Triste', icon:'😀', pairIcon:'😢' },
    { id:'fast', label:'Rápido', pair:'Devagar', icon:'🐇', pairIcon:'🐢' },
    { id:'sleep', label:'Dormindo', pair:'Acordado', icon:'😴', pairIcon:'😀' }
  ],
  rhythms: [
    { id:'one', label:'1 palma', pattern:['👏'] },
    { id:'two', label:'2 palmas', pattern:['👏','👏'] },
    { id:'mixed', label:'Palma e pausa', pattern:['👏','⏸️','👏'] },
    { id:'triple', label:'3 palmas', pattern:['👏','👏','👏'] },
    { id:'pause2', label:'Pausa e palma', pattern:['⏸️','👏'] },
    { id:'long', label:'Palma, pausa, palma, palma', pattern:['👏','⏸️','👏','👏'] }
  ],
  movements: [
    { id:'clap', label:'Bata palmas', icon:'👏' },
    { id:'wave', label:'Dê tchau', icon:'👋' },
    { id:'jump', label:'Pule', icon:'🦘' },
    { id:'spin', label:'Gire', icon:'🔄' },
    { id:'dance', label:'Dance', icon:'💃' },
    { id:'hug', label:'Dê um abraço', icon:'🤗' },
    { id:'kiss', label:'Mande um beijo', icon:'😘' },
    { id:'sleep', label:'Faça de conta que dorme', icon:'😴' },
    { id:'stretch', label:'Estique os braços', icon:'🙆' }
  ],
  babyDiscoveries: [
    { id:'light', label:'Luz', icon:'☀️', sound:'Luz!' },
    { id:'ball', label:'Bola', icon:'⚽', sound:'Bola!' },
    { id:'flower', label:'Flor', icon:'🌸', sound:'Flor!' },
    { id:'star', label:'Estrela', icon:'⭐', sound:'Estrela!' },
    { id:'heart', label:'Coração', icon:'❤️', sound:'Coração!' },
    { id:'music', label:'Música', icon:'🎵', sound:'Música!' },
    { id:'moon', label:'Lua', icon:'🌙', sound:'Lua!' },
    { id:'fish', label:'Peixe', icon:'🐟', sound:'Peixe!' },
    { id:'bird', label:'Passarinho', icon:'🐦', sound:'Passarinho!' },
    { id:'balloon', label:'Balão', icon:'🎈', sound:'Balão!' }
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
    { id:'casa', label:'Casa', icon:'🏠', group:'lugares' }, { id:'parque', label:'Parque', icon:'🌳', group:'lugares' },
    { id:'banho', label:'Banho', icon:'🛁', group:'rotina' }, { id:'sono', label:'Sono', icon:'😴', group:'rotina' },
    { id:'leite', label:'Leite', icon:'🥛', group:'rotina' }, { id:'pao', label:'Pão', icon:'🍞', group:'rotina' },
    { id:'sapato', label:'Sapato', icon:'👟', group:'coisas' }, { id:'bola', label:'Bola', icon:'⚽', group:'coisas' }
  ],
  stories: [
    { id:'morning', title:'Bom dia!', scenes:['☀️','🧸','🍎'], words:['O sol nasceu. Bom dia!','O ursinho acordou e foi brincar.','Depois, comeu uma maçã. Hum, que gostoso!'] },
    { id:'park', title:'No parque', scenes:['🏠','🌳','⚽'], words:['A família saiu de casa.','No parque tem uma árvore bem grande.','Vamos jogar bola? Chuta!'] },
    { id:'rain', title:'Dia de chuva', scenes:['☁️','🌧️','🌈'], words:['Apareceu uma nuvem no céu.','Começou a chover. Plic, ploc!','A chuva parou e apareceu o arco-íris!'] },
    { id:'bath', title:'Hora do banho', scenes:['🛁','🦆','👕'], words:['É hora do banho! Splash!','O patinho de borracha vai junto.','Depois, uma roupa limpinha e cheirosa.'] },
    { id:'party', title:'Dia de festa', scenes:['🎈','🎂','🎁'], words:['Os balões enfeitam a casa toda.','Cantamos parabéns e vem o bolo!','E ainda tem um presente de surpresa.'] },
    { id:'night', title:'Hora de dormir', scenes:['🌙','📚','😴'], words:['A lua apareceu no céu.','Mamãe lê uma história bem gostosa.','Boa noite! Hora de dormir.'] },
    { id:'farm', title:'No sítio', scenes:['🐄','🐔','🍳'], words:['A vaca dá bom dia: muuu!','A galinha canta: có có có!','E o café da manhã é ovo mexido.'] },
    { id:'boat', title:'Passeio de barco', scenes:['⛵','🐟','🌅'], words:['O barquinho saiu para passear.','Olha só quantos peixinhos!','O sol está indo dormir. Que lindo!'] }
  ],
  musicPatterns: [
    { id:'p1', label:'Palma', pattern:['👏'] }, { id:'p2', label:'Duas palmas', pattern:['👏','👏'] },
    { id:'p3', label:'Palma e pausa', pattern:['👏','⏸️','👏'] }, { id:'p4', label:'Palma, palma, pausa', pattern:['👏','👏','⏸️'] },
    { id:'p5', label:'Três palmas', pattern:['👏','👏','👏'] }, { id:'p6', label:'Pausa, palma, palma', pattern:['⏸️','👏','👏'] }
  ]
};

// Pares para os jogos da memória temáticos (cada tema = um conjunto de figuras que combinam entre si).
export const memoryThemes = {
  fruits: [
    { id: 'maca', label: 'Maçã', icon: '🍎' }, { id: 'banana', label: 'Banana', icon: '🍌' }, { id: 'uva', label: 'Uva', icon: '🍇' },
    { id: 'laranja', label: 'Laranja', icon: '🍊' }, { id: 'morango', label: 'Morango', icon: '🍓' }, { id: 'melancia', label: 'Melancia', icon: '🍉' },
    { id: 'abacaxi', label: 'Abacaxi', icon: '🍍' }, { id: 'pera', label: 'Pera', icon: '🍐' }
  ],
  transport: [
    { id: 'carro', label: 'Carro', icon: '🚗' }, { id: 'aviao', label: 'Avião', icon: '✈️' }, { id: 'onibus', label: 'Ônibus', icon: '🚌' },
    { id: 'bicicleta', label: 'Bicicleta', icon: '🚲' }, { id: 'trem', label: 'Trem', icon: '🚂' }, { id: 'barco', label: 'Barco', icon: '⛵' },
    { id: 'foguete', label: 'Foguete', icon: '🚀' }, { id: 'helicoptero', label: 'Helicóptero', icon: '🚁' }
  ],
  toys: [
    { id: 'bola', label: 'Bola', icon: '⚽' }, { id: 'ursinho', label: 'Ursinho', icon: '🧸' }, { id: 'balao', label: 'Balão', icon: '🎈' },
    { id: 'tambor', label: 'Tambor', icon: '🥁' }, { id: 'dado', label: 'Dado', icon: '🎲' }, { id: 'violao', label: 'Violão', icon: '🎸' },
    { id: 'palhaco', label: 'Palhaço', icon: '🤡' }, { id: 'cavalinho', label: 'Cavalinho', icon: '🐴' }
  ],
  party: [
    { id: 'bolo', label: 'Bolo', icon: '🎂' }, { id: 'presente', label: 'Presente', icon: '🎁' }, { id: 'balao-festa', label: 'Balão', icon: '🎈' },
    { id: 'chapeu', label: 'Chapéu', icon: '🎩' }, { id: 'sorvete', label: 'Sorvete', icon: '🍦' }, { id: 'musica', label: 'Música', icon: '🎵' },
    { id: 'estrela', label: 'Estrela', icon: '⭐' }, { id: 'coracao', label: 'Coração', icon: '❤️' }
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
