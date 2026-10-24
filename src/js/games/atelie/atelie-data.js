// Ateliê Mágico — os desenhos para pintar. Cada desenho é uma lista de formas em caminhos SVG (viewBox 400×400):
// a mesma descrição serve para o PixiJS (jogo completo) e para o SVG puro (modo lite). Só usamos M, L, C e Z.
// Formas "paint" são as que a criança pinta; as outras são detalhes fixos (olhos, raios, contornos).
// "group" liga a forma a um movimento que só começa quando o desenho ganha vida.

const f = (n) => Math.round(n * 10) / 10;
const KAPPA = 0.5523;

// ---------- construtores de formas ----------
function rot(x, y, cx, cy, a) { const c = Math.cos(a); const s = Math.sin(a); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; }
const fmt = (pts) => pts.map((p) => `${f(p[0])} ${f(p[1])}`);

export function ell(cx, cy, rx, ry, angle = 0) {
  const k = KAPPA;
  const raw = [
    [cx + rx, cy], [cx + rx, cy + ry * k], [cx + rx * k, cy + ry], [cx, cy + ry],
    [cx - rx * k, cy + ry], [cx - rx, cy + ry * k], [cx - rx, cy],
    [cx - rx, cy - ry * k], [cx - rx * k, cy - ry], [cx, cy - ry],
    [cx + rx * k, cy - ry], [cx + rx, cy - ry * k], [cx + rx, cy]
  ].map(([x, y]) => (angle ? rot(x, y, cx, cy, angle) : [x, y]));
  const p = fmt(raw);
  return `M${p[0]} C${p[1]} ${p[2]} ${p[3]} C${p[4]} ${p[5]} ${p[6]} C${p[7]} ${p[8]} ${p[9]} C${p[10]} ${p[11]} ${p[12]}Z`;
}
export const circ = (cx, cy, r) => ell(cx, cy, r, r);
export function poly(...pts) { const p = fmt(pts); return `M${p[0]}${p.slice(1).map((q) => ` L${q}`).join('')}Z`; }
export function rect(x, y, w, h, r = 0) {
  if (!r) return poly([x, y], [x + w, y], [x + w, y + h], [x, y + h]);
  const k = r * (1 - KAPPA);
  return `M${f(x + r)} ${f(y)} L${f(x + w - r)} ${f(y)} C${f(x + w - k)} ${f(y)} ${f(x + w)} ${f(y + k)} ${f(x + w)} ${f(y + r)} L${f(x + w)} ${f(y + h - r)} C${f(x + w)} ${f(y + h - k)} ${f(x + w - k)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} L${f(x + r)} ${f(y + h)} C${f(x + k)} ${f(y + h)} ${f(x)} ${f(y + h - k)} ${f(x)} ${f(y + h - r)} L${f(x)} ${f(y + r)} C${f(x)} ${f(y + k)} ${f(x + k)} ${f(y)} ${f(x + r)} ${f(y)}Z`;
}
// Pétalas em volta de (cx,cy): elipses que saem do centro.
export function petals(cx, cy, n, len, wid, start = -Math.PI / 2) {
  return Array.from({ length: n }, (_, i) => { const a = start + (Math.PI * 2 * i) / n; return ell(cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2, len / 2, wid / 2, a); }).join(' ');
}
// Raios do sol (triângulos).
export function rays(cx, cy, r1, r2, n, half = 0.14) {
  return Array.from({ length: n }, (_, i) => { const a = (Math.PI * 2 * i) / n; return poly([cx + Math.cos(a - half) * r1, cy + Math.sin(a - half) * r1], [cx + Math.cos(a) * r2, cy + Math.sin(a) * r2], [cx + Math.cos(a + half) * r1, cy + Math.sin(a + half) * r1]); }).join(' ');
}
const mapNums = (d, fn) => { let i = 0; return d.replace(/-?\d+(\.\d+)?/g, (m) => String(f(fn(Number(m), i++ % 2 === 0)))); };
export const mir = (d) => mapNums(d, (n, isX) => (isX ? 400 - n : n));
export const tr = (d, dx, dy) => mapNums(d, (n, isX) => (isX ? n + dx : n + dy));

// ---------- itens ----------
const P = (id, d, pt, extra = {}) => ({ id, d, pt, paint: true, ...extra });
const D = (d, fill, extra = {}) => ({ d, fill, ...extra });
const L = (d, color, w, extra = {}) => ({ d, line: true, color, w, ...extra });

const INK = 0x2a1b3d; const WHITE = 0xffffff; const GREEN = 0x3dc15d; const SUN = 0xffcf1f;

const BUTTERFLY = (() => {
  const upper = 'M198 192 C168 78 44 92 56 172 C64 210 150 222 198 204Z';
  const lower = 'M198 208 C150 214 66 232 92 292 C114 330 178 296 198 232Z';
  const flower = (x, base) => [
    L(`M${x} 400 L${x} ${base + 20}`, GREEN, 9, { group: `flower${x}` }),
    P(`petals${x}`, petals(x, base, 5, 62, 32, -Math.PI / 2), [x, base - 30], { group: `flower${x}` }),
    D(circ(x, base, 15), SUN, { group: `flower${x}` })
  ];
  return {
    id: 'borboleta', title: 'Borboleta', hearts: true,
    groups: {
      fly: { anchor: [200, 210], anim: 'drift', ax: 26, ay: 20, speed: 0.9 },
      wingL: { parent: 'fly', anchor: [200, 200], anim: 'flap', amp: 0.7, speed: 6 },
      wingR: { parent: 'fly', anchor: [200, 200], anim: 'flap', amp: 0.7, speed: 6 },
      flower70: { anchor: [70, 400], anim: 'sway', amp: 0.07, speed: 2 },
      flower335: { anchor: [335, 400], anim: 'sway', amp: 0.07, speed: 2.4 },
      sun: { anchor: [335, 62], anim: 'spin', speed: 0.5 }
    },
    items: [
      P('ceu', rect(0, 0, 400, 400), [14, 14]),
      D(rays(335, 62, 44, 66, 10), SUN, { group: 'sun' }),
      P('sol', circ(335, 62, 38), [335, 62], { group: 'sun' }),
      P('grama', 'M0 338 C100 306 300 312 400 336 L400 400 L0 400Z', [200, 385]),
      ...flower(70, 332), ...flower(335, 338),
      P('asaSupE', upper, [150, 160], { group: 'wingL', parent: 'fly' }),
      P('asaInfE', lower, [118, 268], { group: 'wingL', parent: 'fly' }),
      P('asaSupD', mir(upper), [250, 160], { group: 'wingR', parent: 'fly' }),
      P('asaInfD', mir(lower), [282, 268], { group: 'wingR', parent: 'fly' }),
      P('pintaE', circ(100, 140, 17), [100, 140], { group: 'wingL', parent: 'fly' }),
      P('pintaD', circ(300, 140, 17), [300, 140], { group: 'wingR', parent: 'fly' }),
      L('M192 156 C180 118 160 104 146 110', INK, 5, { group: 'fly' }),
      L('M208 156 C220 118 240 104 254 110', INK, 5, { group: 'fly' }),
      D(circ(146, 110, 8), INK, { group: 'fly' }), D(circ(254, 110, 8), INK, { group: 'fly' }),
      P('corpo', ell(200, 220, 14, 54), [200, 230], { group: 'fly' }),
      P('cabeca', circ(200, 160, 22), [200, 156], { group: 'fly' }),
      D(circ(192, 157, 4.5), INK, { group: 'fly' }), D(circ(208, 157, 4.5), INK, { group: 'fly' }),
      L('M192 168 C198 175 202 175 208 168', INK, 3.5, { group: 'fly' })
    ]
  };
})();

const FISH = (() => {
  const weed = 'M58 352 C18 300 74 268 44 212 C88 244 88 304 92 352Z';
  const bubble = (id, x, y, r) => P(id, circ(x, y, r), [x, y], { group: 'bolhas' });
  return {
    id: 'peixe', title: 'Peixinho', hearts: false,
    groups: {
      fish: { anchor: [210, 200], anim: 'drift', ax: 44, ay: 10, speed: 0.8 },
      cauda: { parent: 'fish', anchor: [128, 200], anim: 'wag', amp: 0.34, speed: 5 },
      algaE: { anchor: [70, 352], anim: 'sway', amp: 0.09, speed: 1.6 },
      algaD: { anchor: [330, 352], anim: 'sway', amp: 0.09, speed: 1.9 },
      bolhas: { anchor: [330, 200], anim: 'rise', dist: 140, speed: 0.35 }
    },
    items: [
      P('agua', rect(0, 0, 400, 400), [14, 14]),
      P('areia', 'M0 346 C100 322 300 368 400 340 L400 400 L0 400Z', [200, 388]),
      P('algaE', weed, [66, 330], { group: 'algaE' }),
      P('algaD', mir(weed), [334, 330], { group: 'algaD' }),
      P('cauda', 'M132 200 L52 134 C74 184 74 218 52 268Z', [90, 200], { group: 'cauda', parent: 'fish' }),
      P('nadadeiraCima', 'M178 150 C196 96 250 98 258 152Z', [220, 135], { group: 'fish' }),
      P('nadadeiraBaixo', 'M214 252 C224 296 256 290 262 252Z', [238, 270], { group: 'fish' }),
      P('corpo', ell(212, 202, 98, 64), [150, 215], { group: 'fish' }),
      P('listraA', ell(186, 202, 13, 52), [186, 202], { group: 'fish' }),
      P('listraB', ell(234, 202, 11, 48), [234, 202], { group: 'fish' }),
      D(circ(282, 184, 18), WHITE, { group: 'fish' }), D(circ(286, 184, 9), INK, { group: 'fish' }), D(circ(289, 180, 3), WHITE, { group: 'fish' }),
      L('M308 214 C296 226 286 224 280 214', INK, 4, { group: 'fish' }),
      L('M258 196 C250 214 250 228 258 244', INK, 4, { group: 'fish' }),
      bubble('bolhaA', 326, 128, 16), bubble('bolhaB', 352, 84, 12), bubble('bolhaC', 318, 52, 9)
    ]
  };
})();

const GARDEN = (() => {
  const leaf = 'M206 338 C250 296 298 300 302 330 C272 358 236 358 206 338Z';
  const small = (x, y, key) => [
    L(`M${x} 400 L${x} ${y + 14}`, GREEN, 8, { group: key }),
    P(`pet${key}`, petals(x, y, 5, 52, 28, -Math.PI / 2), [x, y - 22], { group: key }),
    D(circ(x, y, 12), SUN, { group: key })
  ];
  return {
    id: 'jardim', title: 'Jardim', hearts: true,
    groups: {
      sun: { anchor: [78, 78], anim: 'spin', speed: 0.5 },
      big: { anchor: [200, 400], anim: 'sway', amp: 0.05, speed: 1.6 },
      smallL: { anchor: [86, 400], anim: 'sway', amp: 0.09, speed: 2.2 },
      smallR: { anchor: [322, 400], anim: 'sway', amp: 0.09, speed: 2.6 },
      bee: { anchor: [300, 140], anim: 'drift', ax: 48, ay: 30, speed: 1.7 }
    },
    items: [
      P('ceu', rect(0, 0, 400, 400), [200, 20]),
      D(rays(78, 78, 48, 72, 10), SUN, { group: 'sun' }),
      P('sol', circ(78, 78, 42), [78, 78], { group: 'sun' }),
      P('morro', 'M0 304 C120 250 280 332 400 284 L400 400 L0 400Z', [200, 380]),
      ...small(86, 292, 'smallL'), ...small(322, 300, 'smallR'),
      L('M200 400 L200 230', GREEN, 13, { group: 'big' }),
      P('folhaD', leaf, [262, 328], { group: 'big' }),
      P('folhaE', mir(leaf), [138, 328], { group: 'big' }),
      P('petalas', petals(200, 188, 8, 118, 60, -Math.PI / 2), [200, 118], { group: 'big' }),
      P('miolo', circ(200, 188, 40), [200, 172], { group: 'big' }),
      D(circ(186, 182, 5.5), INK, { group: 'big' }), D(circ(214, 182, 5.5), INK, { group: 'big' }),
      L('M184 200 C194 214 206 214 216 200', INK, 4, { group: 'big' }),
      P('abelha', ell(318, 140, 24, 16), [318, 140], { group: 'bee' }),
      D(ell(312, 140, 4, 15), INK, { group: 'bee' }), D(ell(326, 140, 4, 14), INK, { group: 'bee' }),
      D(ell(312, 120, 12, 8, -0.6), 0xbfeaff, { group: 'bee', alpha: 0.85 }), D(ell(326, 119, 12, 8, 0.6), 0xbfeaff, { group: 'bee', alpha: 0.85 }),
      D(circ(338, 136, 3), INK, { group: 'bee' })
    ]
  };
})();

const HOUSE = (() => ({
  id: 'casinha', title: 'Casinha', hearts: true,
  groups: {
    sun: { anchor: [66, 62], anim: 'spin', speed: 0.5 },
    fumaca: { anchor: [260, 120], anim: 'rise', dist: 90, speed: 0.4 },
    porta: { anchor: [178, 292], anim: 'flap', amp: 0.55, speed: 2.2 },
    arvore: { anchor: [341, 322], anim: 'sway', amp: 0.05, speed: 1.8 }
  },
  items: [
    P('ceu', rect(0, 0, 400, 400), [20, 20]),
    D(rays(66, 62, 42, 64, 10), SUN, { group: 'sun' }),
    P('sol', circ(66, 62, 36), [66, 62], { group: 'sun' }),
    P('chao', 'M0 322 C120 308 280 336 400 318 L400 400 L0 400Z', [200, 380]),
    P('fumacaA', circ(259, 110, 12), [259, 110], { group: 'fumaca' }),
    P('fumacaB', circ(272, 84, 15), [272, 84], { group: 'fumaca' }),
    P('fumacaC', circ(288, 54, 18), [288, 54], { group: 'fumaca' }),
    P('chamine', rect(240, 126, 32, 62), [256, 140]),
    P('parede', rect(108, 196, 184, 130, 6), [150, 300]),
    P('telhado', poly([90, 206], [200, 116], [310, 206]), [200, 170]),
    P('janelaE', rect(128, 230, 40, 40, 6), [148, 250]),
    L('M148 230 L148 270 M128 250 L168 250', INK, 3.5),
    P('janelaD', rect(232, 230, 40, 40, 6), [252, 250]),
    L('M252 230 L252 270 M232 250 L272 250', INK, 3.5),
    P('porta', rect(178, 252, 44, 74, 8), [200, 300], { group: 'porta' }),
    D(circ(212, 292, 4), SUN, { group: 'porta' }),
    P('tronco', rect(330, 262, 22, 62), [341, 300], { group: 'arvore' }),
    P('copa', ell(341, 236, 50, 54), [341, 226], { group: 'arvore' }),
    L('M20 350 C60 340 90 360 130 350', GREEN, 6), L('M270 360 C310 352 350 366 390 356', GREEN, 6)
  ]
}))();

const TRAIN = (() => {
  const wheel = (key, x, y, r) => [
    P(key, circ(x, y, r), [x + r * 0.55, y - r * 0.55], { group: key }),
    L(`M${x - r * 0.8} ${y} L${x + r * 0.8} ${y} M${x} ${y - r * 0.8} L${x} ${y + r * 0.8}`, INK, 4, { group: key }),
    D(circ(x, y, 5), INK, { group: key })
  ];
  return {
    id: 'trem', title: 'Trenzinho', hearts: false,
    groups: {
      train: { anchor: [210, 250], anim: 'drift', ax: 36, ay: 3, speed: 0.9 },
      roda1: { parent: 'train', anchor: [128, 296], anim: 'spin', speed: 3.2 },
      roda2: { parent: 'train', anchor: [208, 306], anim: 'spin', speed: 4.2 },
      roda3: { parent: 'train', anchor: [268, 306], anim: 'spin', speed: 4.2 },
      roda4: { parent: 'train', anchor: [328, 306], anim: 'spin', speed: 4.2 },
      fumaca: { parent: 'train', anchor: [300, 110], anim: 'rise', dist: 90, speed: 0.4 },
      sun: { anchor: [72, 66], anim: 'spin', speed: 0.5 }
    },
    items: [
      P('ceu', rect(0, 0, 400, 400), [200, 20]),
      D(rays(72, 66, 40, 60, 10), SUN, { group: 'sun' }),
      P('sol', circ(72, 66, 34), [72, 66], { group: 'sun' }),
      P('morro', 'M0 292 C100 236 220 300 400 252 L400 400 L0 400Z', [200, 390]),
      D(rect(0, 334, 400, 8), INK), D(rect(18, 342, 16, 20), 0x7a3fd0), D(rect(84, 342, 16, 20), 0x7a3fd0), D(rect(150, 342, 16, 20), 0x7a3fd0), D(rect(216, 342, 16, 20), 0x7a3fd0), D(rect(282, 342, 16, 20), 0x7a3fd0), D(rect(348, 342, 16, 20), 0x7a3fd0),
      P('fumacaA', circ(300, 104, 14), [300, 104], { group: 'fumaca', parent: 'train' }),
      P('fumacaB', circ(314, 76, 18), [314, 76], { group: 'fumaca', parent: 'train' }),
      P('fumacaC', circ(334, 44, 21), [334, 44], { group: 'fumaca', parent: 'train' }),
      P('chamine', poly([284, 196], [284, 148], [272, 140], [328, 140], [316, 148], [316, 196]), [300, 168], { group: 'train' }),
      P('caldeira', rect(158, 190, 176, 90, 30), [270, 236], { group: 'train' }),
      P('cabine', rect(96, 150, 92, 130, 10), [105, 245], { group: 'train' }),
      P('teto', rect(88, 138, 108, 20, 8), [142, 148], { group: 'train' }),
      P('janela', rect(112, 172, 58, 50, 8), [141, 197], { group: 'train' }),
      P('domo', ell(236, 190, 26, 18), [236, 188], { group: 'train' }),
      P('farol', circ(336, 238, 14), [336, 238], { group: 'train' }),
      P('frente', poly([332, 282], [372, 312], [332, 312]), [360, 308], { group: 'train' }),
      P('base', rect(92, 276, 252, 16, 6), [238, 284], { group: 'train' }),
      ...wheel('roda1', 128, 296, 38), ...wheel('roda2', 208, 306, 26), ...wheel('roda3', 268, 306, 26), ...wheel('roda4', 328, 306, 22)
    ]
  };
})();

export const PAGES = [BUTTERFLY, FISH, GARDEN, HOUSE, TRAIN];

// Paleta: cada cor tem a sua nota (a criança "toca" as cores). Ordem = pentatônica ascendente.
export const COLORS = [
  { id: 'vermelho', hex: 0xff4b3e, css: '#ff4b3e', note: 523.25, label: 'Vermelho' },
  { id: 'laranja', hex: 0xff8a1f, css: '#ff8a1f', note: 587.33, label: 'Laranja' },
  { id: 'amarelo', hex: 0xffd93d, css: '#ffd93d', note: 659.25, label: 'Amarelo' },
  { id: 'verde', hex: 0x3dc15d, css: '#3dc15d', note: 783.99, label: 'Verde' },
  { id: 'azul-claro', hex: 0x2fb6ee, css: '#2fb6ee', note: 880, label: 'Azul-claro' },
  { id: 'azul', hex: 0x2f5de1, css: '#2f5de1', note: 1046.5, label: 'Azul' },
  { id: 'roxo', hex: 0x8a46d8, css: '#8a46d8', note: 1174.66, label: 'Roxo' },
  { id: 'rosa', hex: 0xff6fa5, css: '#ff6fa5', note: 1318.51, label: 'Rosa' }
];

// Quantas formas precisam estar pintadas para o desenho ganhar vida, e se a cor é escolhida pela criança.
export const PLAN_BY_AGE = {
  '18-24m': { auto: true, share: 0.4, colors: 8 },
  '2-3y': { auto: false, share: 0.55, colors: 6 },
  '3-4y': { auto: false, share: 0.75, colors: 8 },
  '4-5y': { auto: false, share: 0.85, colors: 8 }
};

export const toCss = (hex) => `#${hex.toString(16).padStart(6, '0')}`;
