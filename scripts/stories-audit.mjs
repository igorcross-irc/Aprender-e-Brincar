// Auditoria do catálogo de histórias: node scripts/stories-audit.mjs
// Falha se o catálogo estiver incompleto (menos de 5 histórias por faixa, páginas sem texto/cena, créditos faltando)
// ou se o índice de arte/narração não bater com os arquivos. Mostra quantas já têm ilustração e narração.
import { existsSync } from 'node:fs';
import { stories } from '../src/content/stories/index.js';
import { STORY_ART, STORY_AUDIO } from '../src/content/stories/available.js';

const BANDS = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
const errors = [];
const seen = new Set();
for (const s of stories) {
  if (seen.has(s.id)) errors.push(`id repetido: ${s.id}`);
  seen.add(s.id);
  if (!s.title || !s.credit || !s.look) errors.push(`${s.id}: falta título, crédito ou descrição dos personagens`);
  if (!['f', 'm'].includes(s.voice)) errors.push(`${s.id}: voz inválida`);
  if (![4, 6].includes(s.pages.length)) errors.push(`${s.id}: ${s.pages.length} páginas (use 4 ou 6)`);
  s.pages.forEach(([text, scene], i) => {
    if (!text || !scene) errors.push(`${s.id} p${i + 1}: falta texto ou cena`);
    if (text.length > 230) errors.push(`${s.id} p${i + 1}: texto longo demais (${text.length})`);
    if (/<|>/.test(text)) errors.push(`${s.id} p${i + 1}: o texto não pode ter marcação`);
  });
  if (STORY_ART[s.id] != null) {
    for (let i = 1; i <= s.pages.length; i += 1) if (!existsSync(`public/assets/stories/${s.id}/p${i}.jpg`)) errors.push(`${s.id}: falta p${i}.jpg`);
  }
  const narrated = STORY_AUDIO[s.id];
  if (narrated) for (let i = 0; i < narrated.length; i += 1) if (narrated[i] === '1' && !existsSync(`public/assets/stories/${s.id}/p${i + 1}.mp3`)) errors.push(`${s.id}: p${i + 1}.mp3 indexado mas ausente`);
}
for (const band of BANDS) {
  const list = stories.filter((s) => s.ages.includes(band));
  if (list.length < 5) errors.push(`faixa ${band}: só ${list.length} histórias (mínimo 5)`);
}
console.log('Faixa     histórias  ilustradas  narradas');
for (const band of BANDS) {
  const list = stories.filter((s) => s.ages.includes(band));
  const art = list.filter((s) => STORY_ART[s.id] === s.pages.length).length;
  const voice = list.filter((s) => (STORY_AUDIO[s.id] || '').length === s.pages.length && !(STORY_AUDIO[s.id] || '').includes('0')).length;
  console.log(`${band.padEnd(9)} ${String(list.length).padStart(8)} ${String(art).padStart(10)} ${String(voice).padStart(9)}`);
}
if (errors.length) { console.error(`\nSTORIES AUDIT FAIL\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`\nSTORIES AUDIT OK — ${stories.length} histórias; ilustração e narração por faixa acima.`);
