// Gera src/content/stories/available.js: quais histórias têm todas as ilustrações e quais páginas têm narração gravada.
// Roda antes do build (prebuild). Ilustração: public/assets/stories/<id>/p<N>.jpg · narração: p<N>.mp3 (mesma pasta).
import { existsSync, writeFileSync } from 'node:fs';
import { stories } from '../src/content/stories/index.js';

const art = {};
const audio = {};
for (const story of stories) {
  const dir = `public/assets/stories/${story.id}`;
  const pages = story.pages.length;
  const hasArt = Array.from({ length: pages }, (_, i) => existsSync(`${dir}/p${i + 1}.jpg`)).every(Boolean);
  if (hasArt) art[story.id] = pages;
  const narrated = Array.from({ length: pages }, (_, i) => existsSync(`${dir}/p${i + 1}.mp3`));
  if (narrated.some(Boolean)) audio[story.id] = narrated.map((v) => (v ? 1 : 0)).join('');
}
const body = `// Gerado por scripts/stories-index.mjs — não editar à mão.\nexport const STORY_ART = ${JSON.stringify(art)};\nexport const STORY_AUDIO = ${JSON.stringify(audio)};\n`;
writeFileSync('src/content/stories/available.js', body);
console.log(`STORIES INDEX — ${Object.keys(art).length} de ${stories.length} histórias ilustradas, ${Object.keys(audio).length} com narração.`);
