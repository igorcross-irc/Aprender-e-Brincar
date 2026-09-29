import { readFileSync, existsSync } from 'node:fs';

const required = [
  'index.html',
  'manifest.json',
  'package.json',
  'tailwind.config.js',
  'postcss.config.js',
  'public/sw.js',
  'src/js/app.js',
  'src/js/engine/audio-engine.js',
  'src/core/app-core.js',
  'src/core/activity-registry.js',
  'src/core/progress-store.js',
  'src/core/experience-health.js',
  'src/core/content-readiness.js',
  'src/content/activity-catalog.js',
  'src/content/world-catalog.js',
  'src/js/games/learning-world.js',
  'src/js/games/cards.js',
  'src/js/games/memory.js',
  'src/js/games/puzzle.js',
  'src/js/games/balloon-pop.js',
  'src/js/games/canvas.js'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('SMOKE FAIL — arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const app = readFileSync('src/js/app.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

for (const token of ['registerPWA', 'AppCore', 'activityCatalog', 'escape', 'renderAgeSelection', 'renderWorldMap', 'renderJourney', 'launchGame']) {
  if (!app.includes(token)) throw new Error(`SMOKE FAIL — app.js sem ${token}`);
}
if (html.includes('cdn.tailwindcss.com')) throw new Error('SMOKE FAIL — Tailwind CDN ainda presente');
if (!sw.includes('addEventListener')) throw new Error('SMOKE FAIL — service worker inválido');
if (!html.includes('min-h-0') || !html.includes('overflow-y-auto')) throw new Error('SMOKE FAIL — container principal sem rolagem robusta');

const audio = readFileSync('src/js/engine/audio-engine.js', 'utf8');
for (const token of ['AudioContext', 'sessionStorage', 'localStorage', 'preload', 'speak']) {
  if (!audio.includes(token)) throw new Error(`SMOKE FAIL — audio-engine sem ${token}`);
}

const css = readFileSync('src/css/styles.css', 'utf8');
for (const token of ['page-enter', 'hero-panel', 'page-toolbar', 'world-progress', 'journey-highlight', 'journey-node', 'overflow-y:auto']) {
  if (!css.includes(token)) throw new Error(`SMOKE FAIL — estilos de jornada sem ${token}`);
}

console.log('SMOKE OK — fundação, PWA e segurança básica presentes.');
