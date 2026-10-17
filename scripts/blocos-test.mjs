// Teste da Torre de Blocos: empilha e derruba (até 3 anos), copia construções (3–5 anos), toque e arrastar, e o modo lite.
// Uso: npm run test:blocos (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { PLAN_BY_AGE, modelsFor, MODELS } from '../src/js/games/blocos/blocos-data.js';

const PORT = 4183;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.BLOCOS_SHOTS || '';
if (!existsSync('dist/index.html')) { console.error('BLOCOS FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }
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

async function openBlocos(context, age, { lite = false, visits = 1 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => { errors.push(e.message); if (process.env.STACK) console.error(e.stack); });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, v]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    localStorage.setItem('ab_blocos_v1', JSON.stringify({ visits: v - 1, built: {} }));
    if (l) localStorage.setItem('ab_lite_graphics', '1');
  }, [lite, visits]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="create-move"]'); await page.click('[data-game="blocos"]');
  return { page, errors };
}

async function playWebgl(context, age, visits) {
  const tag = `${age}, visita ${visits}`;
  const { page, errors } = await openBlocos(context, age, { visits });
  await page.waitForSelector('#blocos-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__blocos && window.__blocos.trayNodes && Object.keys(window.__blocos.trayNodes).length, null, { timeout: 20000 });
  await wait(400);
  const box = await (await page.$('#blocos-stage')).boundingBox();
  const plan = PLAN_BY_AGE[age];
  let guard = 0; let drags = 0; let taps = 0;
  while (guard < 120) {
    guard += 1;
    const state = await page.evaluate(() => { const b = window.__blocos; return { finished: b.finished, action: b.nextAction(), n: b.placed.length }; });
    if (state.finished) break;
    const a = state.action;
    if (!a) { await wait(250); continue; }
    if (SHOTS && state.n === 2 && guard % 7 === 0) await page.screenshot({ path: `${SHOTS}/${age}-${visits}-meio.png` });
    if (a.type === 'tap') { await page.mouse.click(box.x + a.x, box.y + a.y); taps += 1; await wait(900); }
    else {
      await page.mouse.move(box.x + a.from.x, box.y + a.from.y); await page.mouse.down();
      await page.mouse.move(box.x + (a.from.x + a.to.x) / 2, box.y + (a.from.y + a.to.y) / 2, { steps: 6 });
      await page.mouse.move(box.x + a.to.x, box.y + a.to.y, { steps: 6 });
      await page.mouse.up(); drags += 1; await wait(900);
    }
  }
  const info = await page.evaluate(() => { const b = window.__blocos; return { finished: b.finished, completed: b.completed, placed: b.placed.length, knocked: b.knocked }; });
  if (plan.mode === 'models') {
    const want = modelsFor(plan, visits - 1).length;
    if (info.completed === want) pass(`${tag}: ${want} construções prontas (${taps} toques, ${drags} arrastos)`); else fail(`${tag}: esperava ${want} construções, fez ${info.completed}`);
  } else {
    if (info.knocked && info.placed >= plan.goal) pass(`${tag}: empilhou ${info.placed} peças e derrubou (${taps} toques, ${drags} arrastos)`); else fail(`${tag}: empilhou ${info.placed}/${plan.goal}, derrubou ${info.knocked}`);
  }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${tag}: comemoração abriu`), () => fail(`${tag}: a comemoração não abriu`));
  if (errors.length) fail(`${tag}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${tag}: sem erros de JavaScript`);
  await page.close();
}

// Peça no lugar errado só volta para a bandeja (4–5 anos): solta um cubo onde a casa pede um tijolo.
async function wrongPiece(context) {
  const { page, errors } = await openBlocos(context, '4-5y', { visits: 1 });
  await page.waitForFunction(() => window.__blocos && window.__blocos.trayNodes && Object.keys(window.__blocos.trayNodes).length, null, { timeout: 20000 });
  await wait(400);
  const box = await (await page.$('#blocos-stage')).boundingBox();
  const spot = await page.evaluate(() => { const b = window.__blocos; const id = Object.keys(b.trayNodes).find((k) => k !== b.model.slots[0].piece) || Object.keys(b.trayNodes)[0]; const t = b.trayNodes[id]; return { id, from: { x: t.x, y: t.y }, to: { x: b.x0, y: b.groundY - b.u * 0.5 } }; });
  await page.mouse.move(box.x + spot.from.x, box.y + spot.from.y); await page.mouse.down();
  await page.mouse.move(box.x + spot.to.x, box.y + spot.to.y, { steps: 8 }); await page.mouse.up();
  await wait(800);
  const n = await page.evaluate(() => window.__blocos.placed.length);
  if (n === 0) pass('peça errada só volta para a bandeja'); else fail('peça errada foi aceita');
  if (errors.length) fail(`peça errada: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('peça errada: sem erros de JavaScript');
  await page.close();
}

async function playLite(context, age) {
  const { page, errors } = await openBlocos(context, age, { lite: true });
  await page.waitForSelector('#blocos-lite .blocos-lite-btn', { timeout: 10000 });
  const plan = PLAN_BY_AGE[age];
  for (let i = 0; i < 40; i += 1) {
    const bell = await page.$('#blocos-lite-bell');
    if (bell) { await bell.dispatchEvent('click'); break; }
    if (await page.$('#session-again')) break;
    const hint = await page.$('.blocos-lite-btn.hint');
    const target = hint || (plan.mode === 'free' ? await page.$('.blocos-lite-btn') : null);
    if (target) await target.dispatchEvent('click');
    else {
      // 4–5 anos: sem dica, então lê a figura (peça pendente mais baixa) e toca na peça igual
      const next = await page.evaluate(() => { const g = document.querySelector('.blocos-lite-target .ghost:last-of-type'); const all = [...document.querySelectorAll('.blocos-lite-target .blocos-lite-piece.ghost')]; const el = all[all.length - 1]; return el ? [...el.classList].find((c) => c.startsWith('p-')).slice(2) : null; });
      if (next) await (await page.$(`.blocos-lite-btn[data-id="${next}"]`)).dispatchEvent('click');
    }
    await wait(120);
  }
  await page.waitForSelector('#session-again', { timeout: 20000 }).then(() => pass(`modo lite (${age}): terminou até a comemoração`), () => fail(`modo lite (${age}): não terminou`));
  if (errors.length) fail(`modo lite (${age}): erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`modo lite (${age}): sem erros de JavaScript`);
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Empilhar e derrubar'); await playWebgl(context, '18-24m', 1); await playWebgl(context, '2-3y', 1);
  console.log('Copiar construções'); await playWebgl(context, '3-4y', 1); await playWebgl(context, '3-4y', 2); await playWebgl(context, '4-5y', 1); await playWebgl(context, '4-5y', 2);
  console.log('Erro gentil'); await wrongPiece(context);
  console.log('Modo lite'); await playLite(context, '3-4y'); await playLite(context, '2-3y'); await playLite(context, '4-5y');
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nBLOCOS FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nBLOCOS OK — a Torre de Blocos joga do começo ao fim: empilhar e derrubar, copiar construções, toque e arrastar, e o modo lite.');
