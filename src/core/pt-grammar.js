// Artigo definido para perguntas faladas ("Onde está a galinha?").
const FEMININE = new Set([
  'galinha', 'vaca', 'ovelha', 'girafa', 'zebra', 'baleia', 'abelha', 'borboleta', 'formiga', 'tartaruga', 'aranha', 'coruja',
  'cabeça', 'mão', 'boca', 'barriga', 'perna', 'orelha', 'língua', 'bochecha',
  'estrela', 'bola', 'boneca', 'casa', 'árvore', 'maçã', 'banana', 'pera', 'uva', 'laranja', 'cenoura', 'fruta', 'comida', 'sopa',
  'água', 'colher', 'camisa', 'cama', 'lua', 'flor', 'cor', 'mesa', 'cadeira', 'porta', 'janela', 'chupeta', 'mamadeira', 'escova',
  'toalha', 'meia', 'calça', 'bolsa', 'mamãe', 'vovó', 'titia', 'bicicleta', 'nuvem', 'chuva', 'xícara', 'tulipa', 'praia', 'escola'
]);

export function withArticle(label = '') {
  const word = String(label).trim().toLowerCase();
  if (!word) return '';
  return `${FEMININE.has(word) ? 'a' : 'o'} ${word}`;
}
