// Orçamento de tamanho do app: o código que carrega ao abrir precisa continuar pequeno (aparelho fraco, internet ruim).
// Os jogos-âncora baixam o próprio código só quando abrem; o motor PixiJS só quando um jogo gráfico abre.
// Uso: node scripts/budget-check.mjs (depois do build). Os limites ficam aqui para o CI cobrar.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMITS = {
  entry: 340_000,        // código principal ao abrir (navegador moderno)
  entryLegacy: 720_000,  // idem no navegador antigo (inclui o que o aparelho velho precisa)
  game: 90_000,          // cada jogo-âncora separado
  pixi: 960_000          // motor gráfico (carregado só nos jogos gráficos)
};
const dir = 'dist/build';
const html = readFileSync('dist/index.html', 'utf8');
const size = (file) => statSync(join(dir, file)).size;
const failures = [];
const note = [];
const check = (label, bytes, limit) => { note.push(`${label}: ${(bytes / 1000).toFixed(0)} kB (limite ${(limit / 1000).toFixed(0)} kB)`); if (bytes > limit) failures.push(`${label} passou do limite: ${(bytes / 1000).toFixed(0)} kB > ${(limit / 1000).toFixed(0)} kB`); };

const entryFile = (html.match(/src="\/build\/(index-(?!legacy)[^"]+\.js)"/) || [])[1];
const legacyFile = (html.match(/src="\/build\/(index-legacy-[^"]+\.js)"/) || [])[1];
if (!entryFile) failures.push('não achei o código principal no index.html');
else check('código principal', size(entryFile), LIMITS.entry);
if (legacyFile) check('código principal (aparelho antigo)', size(legacyFile), LIMITS.entryLegacy);

const files = readdirSync(dir).filter((f) => f.endsWith('.js') && !f.includes('legacy'));
const games = files.filter((f) => /^(farm|scene|studio|atelie|cozinha|blocos|sentimentos)-game-/.test(f));
if (games.length < 7) failures.push(`esperava 7 jogos separados do código principal, achei ${games.length}`);
games.forEach((f) => check(f.replace(/-[A-Za-z0-9_-]{8}\.js$/, ''), size(f), LIMITS.game));
const pixi = files.map((f) => ({ f, s: size(f) })).filter((x) => x.f !== entryFile).sort((a, b) => b.s - a.s)[0];
if (pixi) check('motor gráfico (PixiJS)', pixi.s, LIMITS.pixi);

console.log(note.join('\n'));
if (failures.length) { console.error(`\nBUDGET FAIL\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nBUDGET OK — o app abre leve e os jogos baixam só quando abrem.');
