// Torre de Blocos — dados: peças, construções-modelo e o plano de cada faixa de idade.
// Medidas em "células": 1 célula = a largura de um cubo. cx é o centro da peça (0 = meio da tela); row, a fileira (0 = chão).
export const PIECES = {
  cubo: { id: 'cubo', label: 'Cubo', w: 1, h: 1, shape: 'rect', color: 0xff4d6d, note: 523.25 },
  tijolo: { id: 'tijolo', label: 'Tijolo', w: 2, h: 1, shape: 'rect', color: 0x2fb6ee, note: 659.25 },
  coluna: { id: 'coluna', label: 'Coluna', w: 1, h: 2, shape: 'rect', color: 0xffcf1f, note: 783.99 },
  prancha: { id: 'prancha', label: 'Prancha', w: 3, h: 1, shape: 'rect', color: 0x7ddc4a, note: 880 },
  telhado: { id: 'telhado', label: 'Telhado', w: 2, h: 1, shape: 'tri', color: 0xff8a1f, note: 987.77, top: true },
  cupula: { id: 'cupula', label: 'Cúpula', w: 2, h: 1, shape: 'dome', color: 0x9a62e8, note: 1046.5, top: true }
};

// Construções para copiar: o contorno aparece no chão e cada peça vai no seu lugar (de baixo para cima).
export const MODELS = {
  torre: { id: 'torre', label: 'Torre', emoji: '🗼', slots: [{ piece: 'cubo', cx: 0, row: 0 }, { piece: 'cubo', cx: 0, row: 1 }, { piece: 'cubo', cx: 0, row: 2 }] },
  casa: { id: 'casa', label: 'Casinha', emoji: '🏠', slots: [{ piece: 'tijolo', cx: 0, row: 0 }, { piece: 'telhado', cx: 0, row: 1 }] },
  ponte: { id: 'ponte', label: 'Ponte', emoji: '🌉', slots: [{ piece: 'cubo', cx: -1, row: 0 }, { piece: 'cubo', cx: 1, row: 0 }, { piece: 'prancha', cx: 0, row: 1 }] },
  escada: { id: 'escada', label: 'Escada', emoji: '🪜', slots: [{ piece: 'prancha', cx: 0, row: 0 }, { piece: 'tijolo', cx: -0.5, row: 1 }, { piece: 'cubo', cx: -1, row: 2 }] },
  farol: { id: 'farol', label: 'Farol', emoji: '🗼', slots: [{ piece: 'coluna', cx: 0, row: 0 }, { piece: 'cubo', cx: 0, row: 2 }, { piece: 'telhado', cx: 0, row: 3 }] },
  castelo: { id: 'castelo', label: 'Castelo', emoji: '🏰', slots: [{ piece: 'tijolo', cx: 0, row: 0 }, { piece: 'cubo', cx: -0.5, row: 1 }, { piece: 'cubo', cx: 0.5, row: 1 }, { piece: 'cupula', cx: 0, row: 2 }] }
};

// free: constrói do jeito que quiser até "goal" peças e depois derruba tudo com o sino.
// models: copia as construções; assist: o toque numa peça já a leva ao lugar certo e a próxima peça pisca.
export const PLAN_BY_AGE = {
  '12-18m': { mode: 'free', pieces: ['cubo', 'tijolo'], goal: 4, count: false },
  '18-24m': { mode: 'free', pieces: ['cubo', 'tijolo'], goal: 5, count: false },
  '2-3y': { mode: 'free', pieces: ['cubo', 'tijolo', 'coluna'], goal: 6, count: true },
  '3-4y': { mode: 'models', models: ['torre', 'casa', 'escada'], assist: true },
  '4-5y': { mode: 'models', models: ['casa', 'ponte', 'castelo', 'farol'], assist: false }
};

// Modelos de uma visita: a lista da faixa gira a cada visita, e a brincadeira parece nova.
export function modelsFor(plan, visit) {
  const list = plan.models;
  const r = visit % list.length;
  return [...list.slice(r), ...list.slice(0, r)].map((id) => MODELS[id]);
}

// Peças que o modelo usa (mais a bandeja da faixa) — sem repetir.
export function trayFor(models) {
  const used = [];
  models.forEach((m) => m.slots.forEach((s) => { if (!used.includes(s.piece)) used.push(s.piece); }));
  return used;
}

// Uma peça está sobre outra se os vãos se cruzam.
export const overlaps = (a, aw, b, bw) => Math.abs(a - b) < (aw + bw) / 2 - 0.001;

// Sequência de peças, de baixo para cima, para o modo lite (e a ordem de dica).
export function slotOrder(model) {
  return model.slots.map((s, i) => ({ ...s, i })).sort((a, b) => a.row - b.row || a.cx - b.cx);
}
