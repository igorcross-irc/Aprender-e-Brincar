#!/usr/bin/env node
// Auditoria da versão para aparelhos antigos (iPad com iOS 9, Android 5…).
//
// 1. Estático: a versão legada do JS é ES5; toda imagem .webp tem cópia .png;
//    a lista de cartões quadrados do compat.js bate com o CSS.
// 2. Simulação no Chromium: carrega só a versão legada (scripts nomodule), sem
//    Pointer Events, com toques reais e todas as alternativas de CSS ligadas
//    (.no-grid, .no-flexgap, .no-aspect, .no-webp). Abre e joga brincadeiras.
//
// Uso: npm run build && node scripts/legacy-audit.mjs [--shots pasta]
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as acorn from 'acorn';
import { chromium } from 'playwright';
import { SQUARE_SELECTORS } from '../src/legacy/compat.js';
import { EMOJI_IMAGES } from '../src/legacy/emoji-map.js';

const PORT = 4792;
const BASE = `http://localhost:${PORT}`;
const shotsIndex = process.argv.indexOf('--shots');
const SHOTS = shotsIndex >= 0 ? process.argv[shotsIndex + 1] : null;
const failures = [];
const fail = (message) => { failures.push(message); console.error('  ✗', message); };
const pass = (message) => console.log('  ✓', message);

console.log('Arquivos');
const buildDir = 'dist/build';
if (!existsSync(buildDir)) { console.error('Rode npm run build antes.'); process.exit(1); }
for (const file of readdirSync(buildDir).filter((name) => name.includes('legacy') && name.endsWith('.js'))) {
  try { acorn.parse(readFileSync(join(buildDir, file), 'utf8'), { ecmaVersion: 5 }); pass(`${file} é ES5`); }
  catch (error) { fail(`${file} não é ES5: ${error.message}`); }
}
const html = readFileSync('dist/index.html', 'utf8');
for (const script of html.match(/<script nomodule>([\s\S]*?)<\/script>/g) || []) {
  try { acorn.parse(script.replace(/<\/?script[^>]*>/g, ''), { ecmaVersion: 5 }); }
  catch (error) { fail(`script nomodule do index.html não é ES5: ${error.message}`); }
}
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const missingPng = walk('public/assets/images').filter((path) => path.endsWith('.webp') && !existsSync(path.replace(/\.webp$/, '.png')));
if (missingPng.length) fail(`imagens sem cópia .png (rode python3 scripts/webp-to-png.py): ${missingPng.join(', ')}`);
else pass('toda imagem .webp tem cópia .png');
try {
  execFileSync('node', ['scripts/emoji-images.mjs', '--check'], { stdio: 'pipe' });
  pass('todo emoji novo (que o iOS 9 não desenha) tem imagem');
} catch (error) {
  fail(String(error.stderr || error.message).trim().split('\n')[0]);
}
const css = readFileSync('src/css/styles.css', 'utf8');
const squareInCss = [...css.matchAll(/([^{}]+)\{[^}]*aspect-ratio:\s*1[\s;/]/g)]
  .flatMap((match) => match[1].split(',').map((sel) => sel.trim().split('\n').pop()));
const unlisted = squareInCss.filter((sel) => !SQUARE_SELECTORS.includes(sel));
if (unlisted.length) fail(`aspect-ratio sem alternativa em compat.js (SQUARE_SELECTORS): ${unlisted.join(', ')}`);
else pass('cartões quadrados têm alternativa de altura');

// Página que só roda a versão legada: tira os módulos e libera os scripts nomodule.
const legacyHtml = html
  .replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<link rel="modulepreload"[^>]*>/g, '')
  .replace(/<script nomodule/g, '<script');

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('servidor de preview não respondeu');
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch();
  // iPad (1024×768), com toque.
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    window.__AB_SIMULATE_LEGACY__ = true;
    delete window.PointerEvent;
    // O que o Safari 9 não tem e não dá para completar (Proxy) ou tem alternativa própria (fetch, normalize).
    delete window.Proxy;
    delete window.fetch;
    delete String.prototype.normalize;
    // Sem gap e sem aspect-ratio, como no iOS 9 (o display:grid é anulado pelas regras .no-grid).
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = '* { gap: 0 !important; row-gap: 0 !important; column-gap: 0 !important; aspect-ratio: auto !important; }';
      document.head.appendChild(style);
    });
    localStorage.setItem('ab_kid_lock', 'off');
    localStorage.setItem('aprender_brincar_child_name', 'Isa');
  });
  await context.route(`${BASE}/`, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: legacyHtml }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: join(SHOTS, `${name}.png`) }); };
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  // Nenhum emoji novo pode sobrar como texto (viraria quadradinho vazio) e as imagens têm de carregar.
  const emojiKeys = Object.keys(EMOJI_IMAGES);
  const checkEmoji = async (where) => {
    await page.waitForTimeout(300);
    const result = await page.evaluate((keys) => {
      const text = document.body.textContent || '';
      const leftover = keys.filter((key) => text.indexOf(key) !== -1);
      const imgs = Array.prototype.slice.call(document.querySelectorAll('img.emoji-img'));
      const broken = imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'));
      return { leftover, broken, images: imgs.length };
    }, emojiKeys);
    if (result.leftover.length) fail(`${where}: emoji novo como texto: ${result.leftover.join(' ')}`);
    else if (result.broken.length) fail(`${where}: imagem de emoji quebrada: ${result.broken.join(', ')}`);
    else pass(`${where}: emojis novos como imagem (${result.images})`);
  };

  console.log('Versão legada no "iPad antigo"');
  await page.goto(BASE);
  const legacyLoaded = await page.evaluate(() => Boolean(window.System) && !window.PointerEvent);
  if (legacyLoaded) pass('carregou a versão legada (SystemJS) sem Pointer Events');
  else fail('não carregou a versão legada');

  const setAge = (age) => page.evaluate((value) => localStorage.setItem('aprender_brincar_child_age', value), age);
  await setAge('2-3y');
  await page.reload();
  await page.waitForSelector('[data-world]', { timeout: 15000 });
  const classes = await page.evaluate(() => document.documentElement.className);
  if (/no-grid/.test(classes) && /no-flexgap/.test(classes) && /no-aspect/.test(classes) && /no-webp/.test(classes)) pass('alternativas ligadas: grid, gap, quadrados, PNG');
  else fail(`alternativas não ligadas: "${classes}"`);
  await page.waitForTimeout(400);
  const webpLeft = await page.$$eval('img', (imgs) => imgs.filter((img) => /\.webp$/.test(img.getAttribute('src') || '')).length);
  if (!webpLeft) pass('imagens trocadas para PNG');
  else fail(`${webpLeft} imagens continuam .webp`);
  const brokenImages = await page.$$eval('img', (imgs) => imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src')));
  if (brokenImages.length) fail(`imagens quebradas: ${brokenImages.join(', ')}`);

  // Os mundos ficam lado a lado (não um embaixo do outro).
  const tiles = await page.$$eval('[data-world]', (els) => els.map((el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }));
  const rows = new Set(tiles.map((tile) => tile.y)).size;
  if (tiles.length >= 4 && rows < tiles.length && tiles.every((tile) => tile.w > 80 && Math.abs(tile.w - tile.h) < 4)) pass(`mapa de mundos em grade: ${tiles.length} cartões quadrados em ${rows} linhas`);
  else fail(`mapa de mundos desmontado: ${JSON.stringify(tiles.slice(0, 4))}`);
  await checkEmoji('mapa de mundos');
  await shot('01-mundos');

  const openGame = async (age, gameId) => {
    await setAge(age);
    await page.tap('#btn-home-logo');
    await page.waitForSelector('[data-world]');
    const worlds = await page.$$eval('[data-world]', (els) => els.map((el) => el.dataset.world));
    for (const world of worlds) {
      await page.tap(`[data-world="${world}"]`);
      await page.waitForTimeout(150);
      if (await page.$(`[data-game="${gameId}"]`)) {
        await shot(`02-mundo-${world}`);
        await page.tap(`[data-game="${gameId}"]`);
        await page.waitForTimeout(500);
        return;
      }
      await page.tap('#btn-back-worlds');
    }
    throw new Error(`${gameId} não está disponível para ${age}`);
  };

  // Fazendinha: aparelho antigo recebe a versão lite (HTML/CSS), não a de WebGL.
  await openGame('2-3y', 'farm');
  if (await page.$('#farm-lite')) pass('fazendinha usa o modo lite no aparelho antigo');
  else fail('fazendinha não entrou no modo lite');
  const foods = await page.$$('[data-food]');
  if (foods.length) { await foods[0].tap(); await page.waitForTimeout(700); if (await page.$('.farm-lite-animal.fed')) pass('fazendinha lite: tocar na comida alimenta o bicho'); else fail('fazendinha lite não alimentou o bicho'); }
  await shot('02b-fazendinha-lite');
  // Cena do fundo do mar: aparelho antigo recebe a versão lite (HTML/CSS).
  await openGame('2-3y', 'scene-sea');
  if (await page.$('#scene-lite')) pass('fundo do mar usa o modo lite no aparelho antigo');
  else fail('fundo do mar não entrou no modo lite');
  const creature = await page.$('.scene-lite-c');
  if (creature) { await creature.dispatchEvent('click'); await page.waitForTimeout(300); if (await page.$('.scene-lite-dot.on')) pass('fundo do mar lite: tocar no bicho conta uma descoberta'); else fail('fundo do mar lite não contou a descoberta'); }
  await checkEmoji('fundo do mar');
  await shot('02c-fundo-do-mar-lite');
  // Toques: bolhas, piano e balões usam pointerdown (via adaptador de toque).
  await openGame('2-3y', 'bubbles');
  const bubble = await page.$('.bubble');
  if (bubble) { await bubble.tap({ force: true }); await page.waitForTimeout(100); }
  const fill = await page.$eval('#bubble-fill', (el) => parseFloat(el.style.width) || 0).catch(() => 0);
  if (bubble && fill > 0) pass('toque estoura bolha (adaptador de toque)');
  else fail('toque não estourou bolha');
  await checkEmoji('bolhas');
  await shot('03-bolhas');

  await openGame('2-3y', 'music-keys');
  const keys = await page.$$eval('.piano-key', (els) => els.map((el) => { const r = el.getBoundingClientRect(); return Math.round(r.top); }));
  if (keys.length > 1 && new Set(keys).size === 1) pass(`piano com ${keys.length} teclas numa linha`);
  else fail(`teclas do piano desalinhadas: ${keys.join(',')}`);
  await page.tap('.piano-key');
  await shot('04-piano');

  await openGame('3-4y', 'memory');
  const cards = await page.$$eval('.memory-card', (els) => els.map((el) => { const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  // Altura mínima vem do próprio jogo (min-h-[105px]); aqui importa a grade montada.
  if (cards.length && cards.every(([w, h]) => w > 60 && h >= w - 4)) pass(`memória: ${cards.length} cartas em grade`);
  else fail(`cartas da memória com tamanho errado: ${JSON.stringify(cards.slice(0, 3))}`);
  await page.tap('.memory-card');
  await shot('05-memoria');

  await openGame('3-4y', 'puzzle');
  await checkEmoji('quebra-cabeça');
  await shot('06-quebra-cabeca');
  await openGame('3-4y', 'canvas');
  const canvasBox = await page.$eval('canvas', (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const client = await page.context().newCDPSession(page);
  const touch = (type, x, y) => client.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', canvasBox.x, canvasBox.y);
  for (let i = 1; i <= 8; i++) await touch('touchMove', canvasBox.x + i * 10, canvasBox.y + i * 4);
  await touch('touchEnd');
  const painted = await page.$eval('canvas', (el) => {
    const ctx = el.getContext('2d');
    const data = ctx.getImageData(0, 0, el.width, el.height).data;
    let colored = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 0 && !(data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245)) colored++;
    return colored;
  });
  if (painted > 20) pass('arrastar o dedo pinta na Lousa Mágica');
  else fail('arrastar o dedo não pintou');
  await shot('07-lousa');

  await openGame('2-3y', 'sort-into').catch(() => {});
  await shot('08-separar');
  await page.tap('#btn-home-logo');
  await page.waitForSelector('[data-world]');
  const album = await page.$('[data-album]');
  if (album) { await album.tap(); await page.waitForTimeout(300); await shot('09-album'); }

  await page.tap('#btn-home-logo');
  await page.tap('#btn-settings');
  const equation = await page.textContent('#gate-title ~ div');
  const [a, b] = equation.match(/\d+/g).map(Number);
  await page.fill('#gate-input', String(a * b));
  await page.tap('#btn-gate-confirm');
  await page.waitForSelector('.family-panel');
  await shot('10-familia');

  if (errors.length) fail(`erros na versão legada: ${[...new Set(errors)].slice(0, 5).join(' | ')}`);
  else pass('nenhum erro de JavaScript na versão legada');
  await browser.close();
}

try {
  await run();
} catch (error) {
  fail(`execução interrompida: ${error.message.split('\n')[0]}`);
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`LEGACY AUDIT FAIL — ${failures.length} problema(s)`);
  process.exit(1);
}
console.log('LEGACY AUDIT OK — versão para aparelhos antigos carrega, mostra as telas e responde ao toque.');
