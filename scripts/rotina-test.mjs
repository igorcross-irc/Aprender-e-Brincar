// Teste de "Rotina do Dia": esfrega os sujinhos, guarda os brinquedos (erra uma caixa de propósito) e confere a lógica de cada faixa.
// Uso: npm run test:rotina (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { PLAN_BY_AGE, SCRUBS, TOY_KINDS, kindsFor, toysFor, spotsFor } from '../src/js/games/rotina/rotina-data.js';

const PORT = 4187;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('ROTINA FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer() { for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); } throw new Error('servidor de preview não respondeu'); }

function logic() {
  console.log('Rotina (lógica)');
  for (const [age, plan] of Object.entries(PLAN_BY_AGE)) {
    const okRoutines = plan.routines.every((r) => r === 'guardar' || SCRUBS[r]);
    if (okRoutines) pass(`${age}: rotinas válidas (${plan.routines.join(', ')})`); else fail(`${age}: rotina desconhecida`);
    const scrubOk = plan.routines.filter((r) => SCRUBS[r]).every((r) => spotsFor(r, plan).length === plan.spots);
    if (scrubOk) pass(`${age}: ${plan.spots} sujinhos em cada cena`); else fail(`${age}: faltam posições de sujinho`);
    if (plan.routines.includes('guardar')) {
      for (const visit of [0, 1, 2, 5]) {
        const kinds = kindsFor(plan, visit); const toys = toysFor(plan, visit);
        const ok = kinds.length === plan.boxes && new Set(kinds.map((k) => k.id)).size === kinds.length && toys.length === plan.toys && kinds.every((k) => toys.some((t) => t.kind === k.id)) && toys.every((t) => TOY_KINDS[t.kind]) && new Set(toys.map((t) => t.id)).size === toys.length;
        if (!ok) { fail(`${age}: arrumação inválida na visita ${visit}`); break; }
        if (visit === 5) pass(`${age}: ${plan.toys} brinquedos em ${plan.boxes} caixa(s), um de cada tipo pelo menos`);
      }
    }
  }
}

async function play(context, age, { wrongBox = false } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1'); });
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="create-move"]'); await page.click('[data-game="rotina"]');
  await page.waitForSelector('#rot');
  const plan = PLAN_BY_AGE[age];
  const seen = [];
  let triedWrong = false;
  for (let guard = 0; guard < 120; guard += 1) {
    if (await page.$('#session-again')) break;
    const st = await page.evaluate(() => { const g = window.__rot; return g ? { routine: g.routine, busy: g.busy, finished: g.finished } : null; });
    if (!st || st.busy || st.finished) { await wait(250); continue; }
    if (!seen.includes(st.routine)) seen.push(st.routine);
    if (st.routine === 'guardar') {
      const toys = await page.$$eval('.rot-toy:not(.in)', (els) => els.map((e) => ({ id: e.dataset.toy, kind: e.dataset.kind })));
      const multi = await page.$$eval('.rot-box', (els) => els.length > 1);
      if (!toys.length) { await wait(250); continue; }
      const toy = toys[0];
      if (multi) {
        if (wrongBox && !triedWrong) {
          triedWrong = true;
          const other = await page.$$eval('.rot-box', (els, kind) => els.map((e) => e.dataset.box).find((b) => b !== kind), toy.kind);
          await page.click(`.rot-toy[data-toy="${toy.id}"]`);
          await page.click(`.rot-box[data-box="${other}"]`);
          await wait(500);
          const stillOut = await page.$(`.rot-toy[data-toy="${toy.id}"]:not(.in)`);
          if (stillOut) pass(`${age}: caixa errada só balança, o brinquedo continua para tentar de novo`); else fail(`${age}: caixa errada guardou o brinquedo`);
        }
        await page.click(`.rot-toy[data-toy="${toy.id}"]`);
        await page.click(`.rot-box[data-box="${toy.kind}"]`);
      } else {
        await page.click(`.rot-toy[data-toy="${toy.id}"]`);
      }
      await wait(150);
    } else {
      const spots = await page.$$('.rot-spot:not(.clean)');
      for (const s of spots) { await s.click({ force: true }).catch(() => {}); await wait(60); }
      await wait(500);
    }
  }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${age}: terminou até a comemoração`), () => fail(`${age}: não terminou`));
  if (seen.join() === plan.routines.join()) pass(`${age}: rotinas na ordem (${seen.join(' → ')})`); else fail(`${age}: ordem inesperada ${seen.join(' → ')}`);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_rotina_v1')));
  if (saved && Object.keys(saved.done).length === plan.routines.length) pass(`${age}: as rotinas foram guardadas`); else fail(`${age}: nada guardado`);
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

try {
  logic();
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Jogando');
  for (const age of ['12-18m', '18-24m', '2-3y']) await play(context, age);
  await play(context, '3-4y', { wrongBox: true });
  await play(context, '4-5y', { wrongBox: true });
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nROTINA FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nROTINA OK — "Rotina do Dia" joga do começo ao fim em todas as faixas.');
