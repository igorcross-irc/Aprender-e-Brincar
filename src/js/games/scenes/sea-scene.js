// Cena "Fundo do Mar": dados puros. O motor (scene-game.js) lê esta lista e monta a cena;
// uma nova cena (floresta, quintal, espaço) é só outro arquivo como este, com a arte em public/assets/images/scenes/<pasta>/.
//
// Posições em frações da tela (x: 0 esquerda → 1 direita; lane: 0 topo → 1 fundo). Tamanhos em frações de "u"
// (u = menor entre a largura e 75% da altura), para que a cena tenha o mesmo jeito em celular e tablet.
//
// mode: swim (atravessa a tela) · drift (flutua) · bob (fica no lugar balançando) · walk (anda de lado no fundo)
//       idle (parado respirando) · school (cardume) · whale (grande, lento, ao fundo)
// react: o que acontece no toque (dart, spin, inflate, color, open, leap, spout, scuttle, loop, bounce, pulse, wiggle)
export const SEA_SCENE = {
  id: 'sea',
  title: 'Fundo do Mar',
  base: '/assets/images/scenes/sea/',
  plate: { file: 'plate.webp', width: 928, height: 1152 },
  // Ordem de prioridade: as primeiras entram nas faixas de idade menores.
  creatures: [
    { id: 'peixe-palhaco', label: 'Peixe-palhaço', file: 'peixe-palhaco.webp', frac: 0.3, mode: 'swim', lane: 0.64, speed: 0.2, amp: 0.025, freq: 1.7, react: 'dart', notes: [659, 880] },
    { id: 'tartaruga', label: 'Tartaruga', file: 'tartaruga.webp', frac: 0.42, mode: 'swim', lane: 0.55, speed: 0.1, amp: 0.02, freq: 0.9, react: 'dart', notes: [330, 392] },
    { id: 'golfinho', label: 'Golfinho', file: 'golfinho.webp', frac: 0.38, mode: 'swim', lane: 0.44, speed: 0.24, amp: 0.03, freq: 1.2, react: 'leap', leapEvery: 15, notes: [523, 784] },
    { id: 'caranguejo', label: 'Caranguejo', file: 'caranguejo.webp', frac: 0.3, mode: 'walk', x: 0.65, lane: 0.9, speed: 0.12, react: 'scuttle', notes: [440, 440, 523] },
    { id: 'estrela', label: 'Estrela-do-mar', file: 'estrela.webp', frac: 0.26, mode: 'idle', x: 0.2, lane: 0.84, react: 'spin', notes: [784, 988, 1175] },
    { id: 'baleia', label: 'Baleia', file: 'baleia.webp', frac: 0.62, mode: 'whale', lane: 0.2, speed: 0.04, amp: 0.02, freq: 0.5, react: 'spout', notes: [196, 165, 220], depth: true },
    { id: 'baiacu', label: 'Baiacu', file: 'baiacu.webp', alt: 'baiacu-inflado.webp', frac: 0.3, mode: 'swim', lane: 0.74, speed: 0.13, amp: 0.02, freq: 1.4, react: 'inflate', notes: [392, 523] },
    { id: 'agua-viva', label: 'Água-viva', file: 'agua-viva.webp', frac: 0.2, mode: 'drift', x: 0.27, lane: 0.34, speed: 0.03, amp: 0.04, freq: 0.8, react: 'pulse', notes: [587, 698], glow: true },
    { id: 'polvo', label: 'Polvo', file: 'polvo.webp', frac: 0.34, mode: 'bob', x: 0.16, lane: 0.74, amp: 0.012, freq: 1.1, react: 'color', notes: [349, 440, 523] },
    { id: 'bau', label: 'Baú do tesouro', file: 'bau-fechado.webp', alt: 'bau-aberto.webp', frac: 0.32, mode: 'idle', x: 0.5, lane: 0.9, react: 'open', notes: [523, 659, 784, 1047], sparkle: true },
    { id: 'concha', label: 'Concha', file: 'concha-fechada.webp', alt: 'concha-aberta.webp', frac: 0.26, mode: 'idle', x: 0.82, lane: 0.9, react: 'open', notes: [880, 1175], sparkle: true },
    { id: 'cavalo-marinho', label: 'Cavalo-marinho', file: 'cavalo-marinho.webp', frac: 0.15, mode: 'bob', x: 0.86, lane: 0.62, amp: 0.02, freq: 1.3, react: 'loop', notes: [698, 880] },
    { id: 'tubarao', label: 'Tubarão', file: 'tubarao.webp', frac: 0.44, mode: 'swim', lane: 0.34, speed: 0.11, amp: 0.015, freq: 0.7, react: 'wiggle', notes: [247, 294], depth: true },
    { id: 'peixe-anjo', label: 'Peixe-anjo', file: 'peixe-anjo.webp', frac: 0.26, mode: 'swim', lane: 0.5, speed: 0.15, amp: 0.025, freq: 1.5, react: 'dart', notes: [698, 932] },
    { id: 'cardume', label: 'Peixinhos', file: 'peixinho.webp', frac: 0.11, mode: 'school', lane: 0.7, speed: 0.17, count: 7, react: 'scatter', notes: [988, 1175] }
  ],
  // Quantos bichos entram e quantas descobertas encerram a brincadeira, por faixa de idade.
  byAge: {
    '6-12m': { creatures: 6, target: 3 },
    '12-18m': { creatures: 6, target: 3 },
    '18-24m': { creatures: 8, target: 4 },
    '2-3y': { creatures: 10, target: 5 },
    '3-4y': { creatures: 12, target: 6 },
    '4-5y': { creatures: 15, target: 7 }
  },
  // Visitas alternam o momento do dia (a mesma cena parece nova).
  moods: [
    { id: 'dia', tint: null, alpha: 0 },
    { id: 'entardecer', tint: 0xffa56b, alpha: 0.38 },
    { id: 'noite', tint: 0x2a3aa0, alpha: 0.5, glow: true }
  ]
};
