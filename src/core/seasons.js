// Datas especiais do Brasil que enfeitam a tela inicial (como as coleções temáticas do Escola Games).
// Só emojis antigos, para aparecerem em aparelhos antigos.
const SEASONS = [
  { id: 'crianca', month: 9, emoji: '🎈', title: 'Mês da Criança', voice: 'Feliz mês da criança!' },
  { id: 'junina', month: 5, emoji: '🌽', title: 'Festa Junina', voice: 'Vamos à festa junina!' },
  { id: 'natal', month: 11, emoji: '🎄', title: 'Natal', voice: 'Feliz Natal!' }
];

export function seasonFor(date = new Date()) {
  return SEASONS.find((season) => season.month === date.getMonth()) || null;
}
