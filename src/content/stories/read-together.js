// Leitura em dupla (leitura dialogada): uma pergunta curta por página para o ADULTO fazer em voz alta,
// no ritmo da criança. Esperar a resposta, repetir o que ela disse e acrescentar um pouquinho ajuda a linguagem.
// Ligada na Área da Família ("Perguntas para conversar"); a criança não precisa ler nada.
export const READ_TOGETHER_KEY = 'ab_read_together';

const SPECIFIC = {
  'a-dona-aranha': ['Onde a dona aranha está subindo? Mostre com o dedo.', 'O que aconteceu com a dona aranha? Como será que ela se sentiu?', 'O que a gente vê no céu quando a chuva passa?', 'A dona aranha desistiu? O que você faz quando alguma coisa é difícil?'],
  'borboletinha': ['Onde a borboletinha está? O que tem numa cozinha?', 'O que a borboletinha está fazendo? Você gosta de chocolate?', 'Vamos bater o pé no ritmo: poti, poti! Você consegue?', 'Que bicho aparece aqui? Como ele faz com o bico?'],
  'dedinhos': ['Mostre o seu dedo mindinho! Qual é o menorzinho?', 'Quem é o vizinho do mindinho? Vamos balançar os dedinhos.', 'Vamos contar nos dedos da mão: um, dois, três, quatro, cinco.', 'Faça cosquinha na barriga de quem está perto!'],
  'pombinha-branca': ['De que cor é a pombinha? O que ela está fazendo?', 'Você sabe o que é um casamento? Quem vai na festa?', 'Vamos fingir que nos lavamos e nos secamos, bem devagar.', 'Para onde a pombinha foi? O que ela vai fazer na janela?'],
  'palma-palma-palma': ['Vamos bater palmas juntos! Rápido e devagar.', 'Bata o pé no chão: pé, pé, pé! Quantas batidas?', 'Vamos rodar como uma roda. Para que lado?', 'Você já viu um caranguejo? Como ele anda?'],
  'o-sapo-nao-lava-o-pe': ['O que o sapo não faz? E você, lava os pés?', 'Por que será que ele não quer lavar? O que você acha?', 'Onde o sapo mora? Mostre a lagoa na figura.', 'Que cheiro será que ele tem? Vamos fazer cara de chulé!'],
  'sapo-cururu': ['Onde fica o sapo? O que tem na beira do rio?', 'Quem está com frio? O que a gente faz quando sente frio?', 'Quem está lá dentro? O que ela está fazendo?', 'Vamos fazer o barulho do sapo juntos?'],
  'pirulito-que-bate-bate': ['Você já comeu um pirulito? De que sabor?', 'Vamos bater palminhas no ritmo da música.', 'De quem a gente gosta? Diga os nomes das pessoas que você ama.', 'Vamos dar um abraço agora?'],
  'cai-cai-balao': ['De que cor é o balão? O que ele está fazendo?', 'Onde o balão vai cair? Vamos esticar a mão para pegar!', 'Será que o balão caiu na sua mão?', 'Para onde ele foi? Vamos assoprar bolhas de sabão?'],
  'a-barata-diz-que-tem': ['Quantas saias a barata disse que tem? Vamos contar.', 'E quantas ela tem de verdade? A barata inventou?', 'Vamos rir juntos: ha, ha, ha! Ho, ho, ho!', 'Você já inventou uma historinha? Conte para mim.'],
  'o-nabo-gigante': ['O que o vovô plantou? Como o nabo ficou?', 'O vovô conseguiu tirar o nabo sozinho? O que ele pode fazer?', 'Quem veio ajudar? Vamos contar quantos estão puxando.', 'Quem ajudou no final? O que a gente aprende quando todo mundo ajuda?'],
  'o-patinho-feio': ['Como era o patinho? Como os outros trataram ele?', 'Como o patinho se sentiu? O que você faria para ajudar?', 'Quem ajudou o patinho no frio? Por que isso foi bom?', 'Por que ele fugiu? O que a gente faz quando tem medo?', 'O que ele viu na lagoa? Como ele criou coragem?', 'O que ele descobriu no reflexo? Como ele se sentiu quando os cisnes o acolheram?']
};

// Perguntas gerais, usadas quando a história ainda não tem as suas: ver, sentir, imaginar, lembrar.
const GENERIC = [
  'O que você vê na figura? Mostre com o dedo.',
  'Quem está nesta página? O que ela está fazendo?',
  'Como será que ele está se sentindo? Por quê?',
  'O que será que vai acontecer agora?',
  'Você já viveu algo parecido? Conte para mim.',
  'Do que você mais gostou nesta página?'
];

// Pergunta da página (0-based). A última página (o "Fim") recebe uma pergunta de fechamento.
export function promptFor(storyId, page, totalPages) {
  if (page >= totalPages) return 'Do que você mais gostou na história? Quer ouvir de novo?';
  const own = SPECIFIC[storyId];
  if (own && own[page]) return own[page];
  return GENERIC[page % GENERIC.length];
}

export const hasSpecificPrompts = (storyId) => Boolean(SPECIFIC[storyId]);
export const readTogetherEnabled = () => { try { return localStorage.getItem(READ_TOGETHER_KEY) === '1'; } catch (error) { return false; } };
export const setReadTogether = (on) => { try { if (on) localStorage.setItem(READ_TOGETHER_KEY, '1'); else localStorage.removeItem(READ_TOGETHER_KEY); } catch (error) { /* sem armazenamento */ } };
