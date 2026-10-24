// Plano de narração: node scripts/narration-plan.mjs [id|all]
// Imprime, por história, o texto único para a IA de voz (páginas separadas por pausa longa) e o custo em créditos.
// A narração é gerada em UM áudio por história e depois cortada nas pausas: python3 scripts/split-narration.py <audio> <id>.
import { stories, storyById } from '../src/content/stories/index.js';

const VOICES = { f: 'GFPGeIuI7dxt6YeFLE7l (Ayres — calorosa e suave, pt-BR)', m: 'hetAnQsiAFr5QM0HWVes (Milton Alencar — calmo e amigável, pt-BR)' };
export const BREAK = ' <break time="2.4s" /> ';
export const narrationText = (story) => story.pages.map((p) => p[0]).join(BREAK);

if (process.argv[1] && process.argv[1].endsWith('narration-plan.mjs')) {
  const arg = process.argv[2] || 'all';
  const list = arg === 'all' ? stories : [storyById(arg)].filter(Boolean);
  let total = 0;
  for (const s of list) {
    const text = narrationText(s);
    total += text.length;
    if (arg === 'all') console.log(`${s.id.padEnd(40)} ${String(text.length).padStart(5)} créditos  voz ${s.voice}  ${s.pages.length} páginas`);
    else console.log(`# ${s.id} · modelo eleven_multilingual_v2 · voz ${VOICES[s.voice]}\n${text}\n`);
  }
  if (arg === 'all') console.log(`\nTOTAL ${total} créditos (1 crédito por caractere) para ${list.length} histórias.`);
}
