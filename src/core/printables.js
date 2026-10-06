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

function paintSheet(ageId, random) {
  const icons = pick(['🍎', '🐟', '🌸', '⭐', '🏠', '🎈', '🐢', '🌳'], 3, random);
  return `<section><h2>🎨 Pinte do jeito que quiser</h2><p>Escolha as cores e pinte os desenhos. Conte para um adulto quais cores usou.</p><div class="paint">${icons.map((icon) => `<span class="outline">${esc(icon)}</span>`).join('')}</div></section>`;
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
.outline{font-size:60pt;color:transparent;-webkit-text-stroke:2px #1f2937;text-shadow:none}
footer{margin-top:6mm;font-size:9pt;color:#64748b}
</style></head><body><h1>${title} 🧸</h1>
${countSheet(age, random)}${matchSheet(age, random)}${sequenceSheet(age, random)}${paintSheet(age, random)}
<footer>Aprender &amp; Brincar · Brinque junto, converse sobre o que está vendo e comemore cada tentativa. Não é avaliação.</footer>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});</script>
</body></html>`;
}
