// Fichas para imprimir (como os "planos de aula" e fichas pedagógicas do Escola Games): atividades
// de papel e lápis para fazer junto com a criança, longe da tela. Retorna HTML pronto para imprimir.
import { developmentContent as content } from '../content/development-content.js';

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (list, n, random) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy.slice(0, n);
};

// Até quantos objetos contar, por idade.
const COUNT_MAX = { '18-24m': 3, '2-3y': 4, '3-4y': 6, '4-5y': 9 };

export function printableAges() { return Object.keys(COUNT_MAX); }

function countSheet(ageId, random) {
  const max = COUNT_MAX[ageId] || 4;
  const fruits = ['🍎', '🍌', '🍇', '🍊', '🎈', '⭐', '🐟', '🌸'];
  const rows = pick(Array.from({ length: max }, (_, i) => i + 1), Math.min(4, max), random).map((n, index) => {
    const icon = fruits[(index + Math.floor(random() * fruits.length)) % fruits.length];
    const options = Array.from({ length: max }, (_, i) => `<span class="circle">${i + 1}</span>`).join('');
    return `<div class="row"><div class="things">${Array.from({ length: n }, () => esc(icon)).join(' ')}</div><div class="answers">${options}</div></div>`;
  }).join('');
  return `<section><h2>🔢 Conte e circule o número</h2><p>Conte os desenhos com o dedinho e circule o número certo.</p>${rows}</section>`;
}

function matchSheet(ageId, random) {
  const n = ageId === '18-24m' ? 3 : ageId === '2-3y' ? 4 : 5;
  const shapes = pick(content.shapes.concat(content.objects.slice(0, 4)), n, random);
  const right = pick(shapes, shapes.length, random);
  const cells = shapes.map((item, i) => `<div class="pair"><span class="big">${esc(item.icon)}</span><span class="dot"></span><span class="line"></span><span class="dot"></span><span class="big">${esc(right[i].icon)}</span></div>`).join('');
  return `<section><h2>🔗 Ligue os iguais</h2><p>Faça uma linha ligando cada desenho ao seu igual.</p><div class="match">${cells}</div></section>`;
}

function sequenceSheet(ageId, random) {
  const list = pick(content.sequences, ageId === '18-24m' || ageId === '2-3y' ? 2 : 3, random);
  const rows = list.map((seq) => `<div class="seq">${seq.items.map((icon) => `<span class="box">${esc(icon)}</span>`).join('')}<span class="box blank">?</span></div>`).join('');
  return `<section><h2>🧩 O que vem depois?</h2><p>Olhe a fila e desenhe ou fale o que vem no quadrado vazio.</p>${rows}</section>`;
}

// Desenhos só de contorno (emoji sairia colorido e não dá para pintar).
const OUTLINES = {
  casa: '<polygon points="10,50 50,12 90,50"/><rect x="18" y="50" width="64" height="42"/><rect x="42" y="64" width="16" height="28"/>',
  estrela: '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38"/>',
  peixe: '<ellipse cx="42" cy="50" rx="34" ry="22"/><polygon points="72,50 96,30 96,70"/><circle cx="26" cy="44" r="3"/>',
  coracao: '<path d="M50 88 C10 56 6 30 26 20 C40 14 50 26 50 32 C50 26 60 14 74 20 C94 30 90 56 50 88 Z"/>',
  balao: '<ellipse cx="50" cy="38" rx="28" ry="32"/><polygon points="44,70 56,70 50,78"/><path d="M50 78 C42 88 58 92 50 98"/>',
  flor: '<circle cx="50" cy="50" r="12"/><circle cx="50" cy="24" r="14"/><circle cx="76" cy="50" r="14"/><circle cx="50" cy="76" r="14"/><circle cx="24" cy="50" r="14"/>',
  maca: '<path d="M50 30 C20 14 6 50 24 76 C34 90 44 88 50 84 C56 88 66 90 76 76 C94 50 80 14 50 30 Z"/><path d="M50 30 C50 20 54 12 60 8"/><path d="M54 22 C62 14 72 16 74 20 C66 26 58 26 54 22 Z"/>',
  sol: '<circle cx="50" cy="50" r="20"/><path d="M50 6V20M50 80V94M6 50H20M80 50H94M19 19L29 29M71 71L81 81M81 19L71 29M29 71L19 81"/>'
};

function paintSheet(ageId, random) {
  const names = pick(Object.keys(OUTLINES), 3, random);
  const draw = (name) => `<svg class="outline" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${OUTLINES[name]}</svg>`;
  return `<section><h2>🎨 Pinte do jeito que quiser</h2><p>Escolha as cores e pinte os desenhos. Conte para um adulto quais cores usou.</p><div class="paint">${names.map(draw).join('')}</div></section>`;
}

export function buildPrintableHtml(ageId = '2-3y', random = Math.random, childName = '') {
  const age = COUNT_MAX[ageId] ? ageId : '2-3y';
  const title = childName ? `Fichas de ${esc(childName)}` : 'Fichas para brincar';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:A4;margin:14mm}
body{font-family:Nunito,Arial,sans-serif;color:#1f2937;margin:0}
h1{font-size:22pt;margin:0 0 4mm;color:#4c1d95}
h2{font-size:15pt;margin:6mm 0 1mm;color:#4338ca}
p{margin:0 0 3mm;font-size:11pt}
section{break-inside:avoid;margin-bottom:4mm}
.row{display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed #cbd5e1;padding:2mm 0}
.things{font-size:22pt;letter-spacing:2px}
.circle{display:inline-block;width:11mm;height:11mm;line-height:11mm;text-align:center;border:1.5px solid #94a3b8;border-radius:50%;margin-left:2mm;font-size:14pt}
.match{display:flex;flex-direction:column;gap:3mm}
.pair{display:flex;align-items:center;justify-content:space-between}
.big{font-size:26pt}
.dot{width:4mm;height:4mm;border-radius:50%;background:#6366f1}
.line{flex:1;border-bottom:1px dotted #cbd5e1;margin:0 2mm}
.seq{display:flex;gap:2mm;margin-bottom:3mm}
.box{display:inline-flex;width:14mm;height:14mm;align-items:center;justify-content:center;border:1.5px solid #94a3b8;border-radius:3mm;font-size:18pt}
.blank{border-style:dashed;color:#94a3b8}
.paint{display:flex;gap:8mm}
.outline{width:46mm;height:46mm}
footer{margin-top:6mm;font-size:9pt;color:#64748b}
</style></head><body><h1>${title} 🧸</h1>
${countSheet(age, random)}${matchSheet(age, random)}${sequenceSheet(age, random)}${paintSheet(age, random)}
<footer>Aprender &amp; Brincar · Brinque junto, converse sobre o que está vendo e comemore cada tentativa. Não é avaliação.</footer>
</body></html>`;
}
