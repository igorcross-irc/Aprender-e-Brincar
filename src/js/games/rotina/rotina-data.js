// Rotina do Dia — escovar os dentes, tomar banho e guardar os brinquedos, como brincadeira.
// Tudo é falado e mostrado em figura; nada é escrito para quem ainda não lê. Não há derrota.

// Cenas de "esfregar": cada sujinho é tocado (ou varrido com o dedo) até a cena ficar limpa.
// x e y são porcentagens da cena; o sujinho é um círculo grande para dedos pequenos.
export const SCRUBS = {
  dentes: {
    id: 'dentes', title: 'Escovar os dentes', icon: '🪥', tool: '🪥',
    ask: 'Vamos escovar os dentes! Esfregue os sujinhos.',
    done: 'Dentes limpinhos e brilhando!',
    spots: [[22, 40], [38, 58], [52, 36], [66, 58], [78, 40], [50, 62], [30, 30], [70, 32]]
  },
  banho: {
    id: 'banho', title: 'Hora do banho', icon: '🛁', tool: '🧽',
    ask: 'Hora do banho! Esfregue a espuma para o bichinho ficar limpinho.',
    done: 'Cheirosinho e limpinho!',
    spots: [[28, 38], [50, 28], [72, 38], [40, 56], [62, 56], [50, 46], [24, 58], [76, 58]]
  }
};

// Brinquedos para guardar. Cada tipo tem a sua caixa (com a figura do tipo).
export const TOY_KINDS = {
  bichos: { id: 'bichos', box: '🧸', label: 'bichinhos', toys: [{ icon: '🧸', name: 'urso' }, { icon: '🐶', name: 'cachorrinho' }, { icon: '🐰', name: 'coelhinho' }] },
  carros: { id: 'carros', box: '🚗', label: 'carrinhos', toys: [{ icon: '🚗', name: 'carrinho' }, { icon: '🚂', name: 'trenzinho' }, { icon: '🚜', name: 'trator' }] },
  bolas: { id: 'bolas', box: '⚽', label: 'bolas', toys: [{ icon: '⚽', name: 'bola de futebol' }, { icon: '🏀', name: 'bola de basquete' }, { icon: '🎾', name: 'bola de tênis' }] }
};

// O que cada faixa faz: quais rotinas, quantos sujinhos e quantos brinquedos em quantas caixas.
// boxes = 1: o toque no brinquedo já o leva à caixa. boxes >= 2: a criança escolhe a caixa certa.
export const PLAN_BY_AGE = {
  '12-18m': { routines: ['dentes'], spots: 3 },
  '18-24m': { routines: ['dentes', 'guardar'], spots: 4, toys: 3, boxes: 1 },
  '2-3y': { routines: ['dentes', 'banho', 'guardar'], spots: 5, toys: 4, boxes: 1 },
  '3-4y': { routines: ['dentes', 'banho', 'guardar'], spots: 6, toys: 4, boxes: 2 },
  '4-5y': { routines: ['banho', 'dentes', 'guardar'], spots: 7, toys: 6, boxes: 3 }
};

const KIND_IDS = Object.keys(TOY_KINDS);

// Tipos de brinquedo de uma visita: gira a cada visita para a arrumação parecer nova.
export function kindsFor(plan, visit = 0) {
  const n = Math.max(1, plan.boxes || 1);
  return Array.from({ length: n }, (_, i) => TOY_KINDS[KIND_IDS[(visit + i) % KIND_IDS.length]]);
}

// Brinquedos da arrumação: sorteio estável (sem Math.random) e sempre com pelo menos 1 de cada tipo escolhido.
export function toysFor(plan, visit = 0) {
  const kinds = kindsFor(plan, visit);
  const out = [];
  for (let i = 0; out.length < (plan.toys || 0); i += 1) {
    const kind = kinds[i % kinds.length];
    const toy = kind.toys[(Math.floor(i / kinds.length) + visit) % kind.toys.length];
    out.push({ id: `${kind.id}-${i}`, kind: kind.id, icon: toy.icon, name: toy.name });
  }
  // Embaralha de forma estável para os tipos não ficarem em fila.
  return out.map((t, i) => ({ t, k: (i * 7 + visit * 3) % 11 })).sort((a, b) => a.k - b.k).map((x) => x.t);
}

// Os sujinhos de uma cena na quantidade da faixa.
export const spotsFor = (scrubId, plan) => SCRUBS[scrubId].spots.slice(0, plan.spots);
