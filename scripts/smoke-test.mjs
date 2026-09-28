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
  'src/content/activity-catalog.js'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('SMOKE FAIL — arquivos ausentes:', missing.join(', '));
  process.exit(1);
}

const app = readFileSync('src/js/app.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
const sw = readFileSync('public/sw.js', 'utf8');

for (const token of ['registerPWA', 'AppCore', 'activityCatalog', 'escapeHtml']) {
  if (!app.includes(token)) throw new Error(`SMOKE FAIL — app.js sem ${token}`);
}
if (html.includes('cdn.tailwindcss.com')) throw new Error('SMOKE FAIL — Tailwind CDN ainda presente');
if (!sw.includes('addEventListener')) throw new Error('SMOKE FAIL — service worker inválido');

console.log('SMOKE OK — fundação, PWA e segurança básica presentes.');
