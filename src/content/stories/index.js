import { babyStories } from './baby-6-12m.js';
import { toddlerRhymes } from './baby-12-18m.js';
import { firstTales } from './baby-18-24m.js';
import { littleTales } from './tales-2-3y.js';
import { classicTales } from './tales-3-4y.js';
import { greatTales } from './tales-4-5y.js';

// Catálogo de histórias. Todas de domínio público (autores mortos há mais de 70 anos, ou folclore/tradição oral);
// os textos são recontos próprios em português do Brasil. Ver docs/HISTORIAS.md.
export const stories = [...babyStories, ...toddlerRhymes, ...firstTales, ...littleTales, ...classicTales, ...greatTales].map((story) => ({
  ...story,
  pageCount: story.pages.length,
  // Folha de ilustrações: 4 páginas = grade 2×2; 6 páginas = grade 3×2.
  sheet: story.pages.length === 4 ? { cols: 2, rows: 2 } : { cols: 3, rows: 2 }
}));

export const storiesForAge = (ageId) => stories.filter((s) => s.ages.includes(ageId));
export const storyById = (id) => stories.find((s) => s.id === id) || null;
