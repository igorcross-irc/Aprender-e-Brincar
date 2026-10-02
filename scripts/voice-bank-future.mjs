// Banco de locuções para o futuro: vocabulário e frases que o app ainda não usa, mas provavelmente usará.
// Gravar junto com as atuais evita sessões extras de gravação e mantém a mesma voz em todo o app.
const article = (feminine, word) => `${feminine ? 'a' : 'o'} ${word}`;

// Mesmas palavras do lote já gravado (a-de-abelha.mp3 … z-de-zebra.mp3), para não duplicar gravações.
const letters = [
  ['A', 'Abelha'], ['B', 'Bola'], ['C', 'Casa'], ['D', 'Dado'], ['E', 'Elefante'], ['F', 'Fogo'], ['G', 'Gato'],
  ['H', 'Hipopótamo'], ['I', 'Igreja'], ['J', 'Jacaré'], ['K', 'Kiwi'], ['L', 'Leão'], ['M', 'Macaco'], ['N', 'Navio'],
  ['O', 'Ovelha'], ['P', 'Pato'], ['Q', 'Queijo'], ['R', 'Rato'], ['S', 'Sapo'], ['T', 'Tartaruga'], ['U', 'Uva'], ['V', 'Vaca'],
  ['W', 'Wifi'], ['X', 'Xícara'], ['Y', 'Yakisoba'], ['Z', 'Zebra']
];
const letterNames = { A: 'A', B: 'Bê', C: 'Cê', D: 'Dê', E: 'É', F: 'Efe', G: 'Gê', H: 'Agá', I: 'I', J: 'Jota', K: 'Cá', L: 'Ele', M: 'Eme', N: 'Ene', O: 'Ó', P: 'Pê', Q: 'Quê', R: 'Erre', S: 'Esse', T: 'Tê', U: 'U', V: 'Vê', W: 'Dáblio', X: 'Xis', Y: 'Ípsilon', Z: 'Zê' };
const numberWords = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
const colors = [['Vermelho', false], ['Azul', false], ['Amarelo', false], ['Verde', false], ['Laranja', false], ['Roxo', false], ['Rosa', false], ['Marrom', false], ['Preto', false], ['Branco', false], ['Cinza', false], ['Dourado', false]];
const shapes = [['Círculo', false], ['Quadrado', false], ['Triângulo', false], ['Estrela', true], ['Coração', false], ['Retângulo', false], ['Losango', false], ['Oval', false]];
const animals = [
  ['Cachorro', false, 'Au au!'], ['Gato', false, 'Miau!'], ['Vaca', true, 'Muuu!'], ['Cavalo', false, 'Iiiirrí!'], ['Porco', false, 'Óinc óinc!'],
  ['Ovelha', true, 'Méééé!'], ['Galinha', true, 'Có có có!'], ['Pato', false, 'Quá quá!'], ['Sapo', false, 'Croac!'], ['Leão', false, 'Grrr!'],
  ['Elefante', false, 'Fuuuu!'], ['Macaco', false, 'Uh uh ah ah!'], ['Passarinho', false, 'Piu piu!'], ['Coruja', true, 'Uhu uhu!'], ['Abelha', true, 'Zzzz!'],
  ['Cobra', true, 'Sssss!'], ['Lobo', false, 'Auuuuu!'], ['Rato', false, 'Ic ic!'], ['Peixe', false, 'Blub blub!'], ['Baleia', true, 'Uuuuu!'],
  ['Girafa', true, ''], ['Zebra', true, ''], ['Tartaruga', true, ''], ['Coelho', false, ''], ['Borboleta', true, ''], ['Urso', false, 'Grrrr!'],
  ['Tigre', false, 'Grrr!'], ['Pinguim', false, ''], ['Jacaré', false, ''], ['Formiga', true, '']
];
const bodyParts = [['Cabeça', true], ['Cabelo', false], ['Olho', false], ['Orelha', true], ['Nariz', false], ['Boca', true], ['Dente', false], ['Língua', true], ['Bochecha', true], ['Pescoço', false], ['Barriga', true], ['Braço', false], ['Mão', true], ['Dedo', false], ['Perna', true], ['Joelho', false], ['Pé', false]];
const emotions = ['feliz', 'triste', 'bravo', 'com medo', 'surpreso', 'calmo', 'cansado', 'animado', 'com fome', 'com sono'];
const people = ['Mamãe', 'Papai', 'Vovó', 'Vovô', 'Irmão', 'Irmã', 'Titia', 'Titio', 'Bebê', 'Amigo', 'Amiga', 'Professora', 'Professor'];
const foods = [['Maçã', true], ['Banana', true], ['Uva', true], ['Laranja', true], ['Morango', false], ['Melancia', true], ['Pera', true], ['Abacaxi', false], ['Mamão', false], ['Manga', true], ['Pão', false], ['Leite', false], ['Água', true], ['Suco', false], ['Arroz', false], ['Feijão', false], ['Ovo', false], ['Queijo', false], ['Cenoura', true], ['Batata', true], ['Brócolis', false], ['Bolo', false], ['Biscoito', false], ['Sopa', true]];
const transports = [['Carro', false], ['Ônibus', false], ['Caminhão', false], ['Moto', true], ['Bicicleta', true], ['Avião', false], ['Barco', false], ['Trem', false], ['Helicóptero', false], ['Foguete', false], ['Ambulância', true], ['Caminhão de bombeiro', false]];
const objects = [['Bola', true], ['Boneca', true], ['Carrinho', false], ['Livro', false], ['Copo', false], ['Colher', true], ['Prato', false], ['Sapato', false], ['Meia', true], ['Camisa', true], ['Chapéu', false], ['Escova de dentes', true], ['Cama', true], ['Travesseiro', false], ['Cadeira', true], ['Mesa', true], ['Porta', true], ['Janela', true], ['Chave', true], ['Telefone', false], ['Relógio', false], ['Óculos', false], ['Guarda-chuva', false], ['Mochila', true]];

const routine = ['Hora de acordar!', 'Hora do café da manhã!', 'Hora de comer!', 'Hora do banho!', 'Hora de escovar os dentes!', 'Hora de dormir!', 'Hora de guardar os brinquedos!', 'Vamos lavar as mãos?', 'Vamos vestir a roupa?', 'Vamos calçar o sapato?', 'Vamos passear?', 'Vamos tomar água?'];
const time = ['Bom dia!', 'Boa tarde!', 'Boa noite!', 'Hoje', 'Amanhã', 'Ontem', 'Manhã', 'Tarde', 'Noite', 'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const weather = ['Sol', 'Chuva', 'Nuvem', 'Vento', 'Frio', 'Calor', 'Arco-íris', 'Neve', 'Trovão', 'Está fazendo sol!', 'Está chovendo!', 'Está frio!', 'Está calor!'];
const opposites = [['Grande', 'Pequeno'], ['Alto', 'Baixo'], ['Cheio', 'Vazio'], ['Quente', 'Frio'], ['Rápido', 'Devagar'], ['Dentro', 'Fora'], ['Em cima', 'Embaixo'], ['Aberto', 'Fechado'], ['Limpo', 'Sujo'], ['Molhado', 'Seco'], ['Dia', 'Noite'], ['Perto', 'Longe']];
const encouragement = ['Isso mesmo!', 'Você conseguiu!', 'Que legal!', 'Uau!', 'Parabéns!', 'Mandou bem!', 'Você é demais!', 'Que orgulho!', 'Continue assim!', 'Quase lá!', 'Tente outra vez!', 'Sem pressa.', 'Vamos juntos?', 'Que bonito!', 'Que divertido!', 'Você está aprendendo muito!', 'Olha só o que você fez!', 'Boa tentativa!', 'Respira fundo e tenta de novo.', 'Eu sabia que você conseguia!'];
const instructions = ['Toque aqui.', 'Toque na figura.', 'Toque no animal.', 'Toque na cor.', 'Arraste até aqui.', 'Escute com atenção.', 'Olhe com atenção.', 'Escolha um.', 'Vamos de novo?', 'Quer brincar de novo?', 'Vamos para o próximo.', 'Agora é a sua vez.', 'Agora outra!', 'Vamos ouvir a história.', 'Que tal outra brincadeira?', 'Escolha uma brincadeira.', 'Escolha um mundo.', 'Vamos ver seus adesivos!', 'Você ganhou um adesivo!', 'Você ganhou uma estrela!', 'Até amanhã!', 'Tchau, tchau!', 'Repita comigo.', 'Fale junto comigo.', 'Vamos cantar?', 'Vamos dançar?', 'Bata palmas!', 'Pule!', 'Gire!', 'Dê tchau!', 'Mande um beijo!', 'Faça silêncio. Shhh!', 'Qual é o maior?', 'Qual é o menor?', 'Quantos tem?', 'Vamos contar juntos!', 'O que vem depois?', 'Qual é diferente?', 'Quem fez esse som?', 'Qual começa igual?', 'O que rima?'];

export function futureVoiceBank() {
  const bank = [];
  const add = (category, text) => bank.push({ category, text });
  // "Letra A" → letra-a.mp3 e "Número 1" → numero-1.mp3 seguem os nomes do lote já gravado.
  letters.forEach(([letter, word]) => { add('Alfabeto', `Letra ${letter}`); add('Alfabeto', `${letter} de ${word}`); add('Alfabeto', `Onde está a letra ${letterNames[letter]}?`); });
  numberWords.forEach((word, n) => { if (n >= 1) add('Números', `Número ${n}`); if (n >= 1 && n <= 10) add('Números', `Onde está o número ${word}?`); });
  add('Números', 'Vamos contar até cinco!'); add('Números', 'Vamos contar até dez!');
  colors.forEach(([color]) => { add('Cores', color); add('Cores', `Onde está a cor ${color.toLowerCase()}?`); });
  shapes.forEach(([shape, fem]) => { add('Formas', shape); add('Formas', `Onde está ${article(fem, shape.toLowerCase())}?`); });
  animals.forEach(([name, fem, sound]) => {
    add('Animais', name); add('Animais', `Onde está ${article(fem, name.toLowerCase())}?`); add('Animais', `Cadê ${article(fem, name.toLowerCase())}?`);
    if (sound) { add('Animais', sound); add('Animais', `${article(fem, name.toLowerCase()).replace(/^./, (c) => c.toUpperCase())} faz ${sound.toLowerCase()}`); }
  });
  bodyParts.forEach(([part, fem]) => { add('Corpo', part); add('Corpo', `Onde está ${article(fem, part.toLowerCase())}?`); add('Corpo', `Mostre ${article(fem, part.toLowerCase())}!`); });
  emotions.forEach((emotion) => { add('Emoções', emotion.charAt(0).toUpperCase() + emotion.slice(1)); add('Emoções', `Eu estou ${emotion}.`); });
  add('Emoções', 'Como você está se sentindo?'); add('Emoções', 'Tudo bem ficar triste às vezes.'); add('Emoções', 'Vamos respirar juntos?');
  people.forEach((person) => add('Família e pessoas', person));
  foods.forEach(([food, fem]) => { add('Comidas', food); add('Comidas', `Onde está ${article(fem, food.toLowerCase())}?`); });
  transports.forEach(([vehicle, fem]) => { add('Transportes', vehicle); add('Transportes', `Onde está ${article(fem, vehicle.toLowerCase())}?`); });
  objects.forEach(([object, fem]) => { add('Objetos', object); add('Objetos', `Onde está ${article(fem, object.toLowerCase())}?`); });
  routine.forEach((text) => add('Rotina', text));
  time.forEach((text) => add('Tempo e dias', text));
  weather.forEach((text) => add('Clima', text));
  opposites.forEach(([a, b]) => { add('Opostos', a); add('Opostos', b); add('Opostos', `Qual é o contrário de ${a.toLowerCase()}?`); });
  encouragement.forEach((text) => add('Incentivos', text));
  instructions.forEach((text) => add('Instruções gerais', text));
  return bank;
}
