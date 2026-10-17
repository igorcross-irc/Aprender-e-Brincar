// Teste da Cozinha Maluca: atende todos os pedidos (todas as receitas) em cada faixa e no modo lite.
// Uso: npm run test:cozinha (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { PLAN_BY_AGE, pickOrders } from '../src/js/games/cozinha/cozinha-data.js';

const PORT = 4182;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.COZINHA_SHOTS || '';
if (!existsSync('dist/index.html')) { console.error('COZINHA FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); }
  throw new Error('servidor de preview não respondeu');
}

async function openKitchen(context, age, { lite = false, visits = 1 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => { errors.push(e.message); if (process.env.STACK) console.error(e.stack); });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, v]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    localStorage.setItem('ab_cozinha_v1', JSON.stringify({ visits: v - 1, made: {} }));
    if (l) localStorage.setItem('ab_lite_graphics', '1');
  }, [lite, visits]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="create-move"]'); await page.click('[data-game="cozinha"]');
  return { page, errors };
}

async function playWebgl(context, age, visits) {
  const tag = `${age}, visita ${visits}`;
  const { page, errors } = await openKitchen(context, age, { visits });
  await page.waitForSelector('#cozinha-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__cozinha && window.__cozinha.recipe && window.__cozinha.buttons && Object.keys(window.__cozinha.buttons).length, null, { timeout: 20000 });
  if (process.env.DBG) await page.evaluate(() => { const t = window.__cozinha.tweens; const orig = t.update.bind(t); t.update = (dt) => { t.items.forEach((it) => { if (!it.__w) { it.__w = true; const u = it.update; it.update = (k) => { try { u(k); } catch (e) { console.error('TWEENFAIL ' + u.toString().slice(0, 300)); throw e; } }; } }); orig(dt); }; });
  const box = await (await page.$('#cozinha-stage')).boundingBox();
  const expected = pickOrders(PLAN_BY_AGE[age], visits - 1).map((o) => o.recipe.id);
  const made = [];
  let guard = 0; let shot = 0;
  while (guard < 140) {
    guard += 1;
    const state = await page.evaluate(() => { const c = window.__cozinha; return { finished: c.finished, id: c.recipe && c.recipe.id, order: c.orderIndex, step: c.step, action: c.nextAction() }; });
    if (state.finished) break;
    if (!state.action) { await wait(250); continue; }
    if (SHOTS && state.step === 2 && shot < 3) { shot += 1; await page.screenshot({ path: `${SHOTS}/${age}-${visits}-${state.id}.png` }); }
    if (SHOTS && state.action.type === 'serve') await page.screenshot({ path: `${SHOTS}/dish-${age}-${visits}-${state.id}.png` });
    if (state.action.type === 'mix') { for (let k = 0; k < 4; k += 1) { await page.mouse.click(box.x + state.action.x, box.y + state.action.y); await wait(160); } }
    else await page.mouse.click(box.x + state.action.x, box.y + state.action.y);
    if (state.action.type === 'bake') await wait(3600);
    else if (state.action.type === 'serve') { await wait(3200); if (!made.includes(state.id) || true) made.push(state.id); }
    else await wait(state.action.type === 'mix' ? 900 : 620);
  }
  if (JSON.stringify(made) === JSON.stringify(expected)) pass(`${tag}: serviu ${made.join(', ')}`); else fail(`${tag}: esperava ${expected.join(', ')}, serviu ${made.join(', ')}`);
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${tag}: comemoração abriu`), () => fail(`${tag}: a comemoração não abriu`));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_cozinha_v1')));
  if (saved && Object.keys(saved.made).length === new Set(expected).size) pass(`${tag}: livro de receitas guardou ${Object.keys(saved.made).join(', ')}`); else fail(`${tag}: livro de receitas incompleto (${saved && Object.keys(saved.made)})`);
  if (errors.length) fail(`${tag}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${tag}: sem erros de JavaScript`);
  await page.close();
}

async function wrongIngredient(context) {
  const { page, errors } = await openKitchen(context, '4-5y', { visits: 1 });
  await page.waitForFunction(() => window.__cozinha && window.__cozinha.buttons && Object.keys(window.__cozinha.buttons).length, null, { timeout: 20000 });
  await wait(900);
  const box = await (await page.$('#cozinha-stage')).boundingBox();
  const wrong = await page.evaluate(() => { const c = window.__cozinha; const need = c.cur().ing; const b = Object.values(c.buttons).find((x) => x.id !== need); return { x: b.x, y: b.y }; });
  await page.mouse.click(box.x + wrong.x, box.y + wrong.y);
  await wait(500);
  const still = await page.evaluate(() => window.__cozinha.step === 0);
  if (still) pass('ingrediente errado só balança e a etapa continua'); else fail('ingrediente errado avançou a etapa');
  if (errors.length) fail(`ingrediente errado: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('ingrediente errado: sem erros de JavaScript');
  await page.close();
}

async function playLite(context, age, visits) {
  const tag = `modo lite (${age})`;
  const { page, errors } = await openKitchen(context, age, { lite: true, visits });
  await page.waitForSelector('#cozinha-lite', { timeout: 10000 });
  const orders = pickOrders(PLAN_BY_AGE[age], visits - 1);
  for (const { recipe } of orders) {
    for (const step of recipe.steps) {
      if (step.t === 'add' || step.t === 'count') { for (let i = 0; i < (step.n || 1); i += 1) { await page.dispatchEvent(`[data-ing="${step.ing}"]`, 'click'); await wait(150); } }
      else if (step.t === 'mix') { for (let i = 0; i < 4; i += 1) { await page.dispatchEvent('#cozinha-lite-vessel', 'click'); await wait(120); } await wait(500); }
      else if (step.t === 'bake') { await page.dispatchEvent('#cozinha-lite-oven', 'click'); await wait(2700); }
      else { await page.dispatchEvent('#cozinha-lite-vessel', 'click'); await wait(2100); }
    }
  }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${tag}: pedidos servidos até a comemoração`), () => fail(`${tag}: não terminou`));
  if (errors.length) fail(`${tag}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${tag}: sem erros de JavaScript`);
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  if (process.env.ONLY) { await playWebgl(context, '3-4y', 1); } else {
  console.log('3–4 anos'); for (const v of [1, 2, 3]) await playWebgl(context, '3-4y', v);
  console.log('4–5 anos'); for (const v of [1, 2, 3, 4]) await playWebgl(context, '4-5y', v);
  console.log('Erro gentil'); await wrongIngredient(context);
  console.log('Modo lite'); await playLite(context, '3-4y', 2); await playLite(context, '4-5y', 2); }
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nCOZINHA FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nCOZINHA OK — a Cozinha Maluca joga do começo ao fim: todas as receitas, em todas as faixas e no modo lite.');
