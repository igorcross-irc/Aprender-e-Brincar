// Gera o pedido de imagem (prompt) da folha de ilustrações de uma história: node scripts/story-prompts.mjs <id|all> [--json]
import { stories, storyById } from '../src/content/stories/index.js';

const STYLE = 'Flat vector style, vibrant saturated colors, simple geometric shapes, dots and stripes, no outlines, big round dot eyes with white highlights, rosy cheeks, subtle gouache grain, cheerful Brazilian preschool animation style.';

export function sheetPrompt(story) {
  const { cols, rows } = story.sheet;
  const n = story.pages.length;
  const panels = story.pages.map(([, scene], i) => `Panel ${i + 1}: ${scene}.`).join(' ');
  return `Children's picture-book storyboard sheet: ${n} separate SQUARE illustrations in a ${cols} columns by ${rows} rows grid (read left to right, top to bottom), wide plain white gutters between panels, each panel a full-bleed painted scene with softly rounded corners, same characters identical in every panel. ${STYLE} NO text, letters, captions or numbers anywhere. Characters: ${story.look}. ${panels}`;
}

export function sheetSize(story) { return story.sheet.cols === 2 ? { width: 1024, height: 1024 } : { width: 1536, height: 1024 }; }

if (process.argv[1] && process.argv[1].endsWith('story-prompts.mjs')) {
  const arg = process.argv[2] || 'all';
  const list = arg === 'all' ? stories : [storyById(arg)].filter(Boolean);
  if (!list.length) { console.error('história não encontrada'); process.exit(1); }
  for (const s of list) {
    const size = sheetSize(s);
    if (process.argv.includes('--json')) console.log(JSON.stringify({ id: s.id, ...size, prompt: sheetPrompt(s) }));
    else console.log(`# ${s.id} (${size.width}x${size.height})\n${sheetPrompt(s)}\n`);
  }
}
