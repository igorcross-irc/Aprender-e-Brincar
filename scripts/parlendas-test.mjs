// Teste de "Parlendas e Gestos": passa por todos os versos em cada faixa, bate palmas no ritmo e confere o que aparece em cada idade.
// Uso: npm run test:parlendas (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { PARLENDAS, PLAN_BY_AGE, parlendasFor, lineDuration } from '../src/js/games/parlendas/parlendas-data.js';

const PORT = 4186;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('PARLENDAS FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer() { for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); } throw new Error('servidor de preview não respondeu'); }

function logic() {
  console.log('Parlendas (dados)');
  const all = Object.values(PARLENDAS);
  const ok = all.every((p) => p.lines.length >= 4 && p.lines.every((l) => l.text.length > 8 && l.gesture && l.how) && p.bpm >= 60 && p.bpm <= 110);
  if (ok) pass(`${all.length} parlendas completas (versos, gesto e ritmo)`); else fail('parlenda incompleta');
  const noScary = all.every((p) => !/morr|veneno|mat[ae]|sangue/i.test(p.lines.map((l) => l.text).join(' ')));
  if (noScary) pass('nenhuma rima assustadora para crianças pequenas'); else fail('rima inadequada para a idade');
  for (const [age, plan] of Object.entries(PLAN_BY_AGE)) {
    const a = parlendasFor(plan, 0).map((p) => p.id); const b = parlendasFor(plan, 1).map((p) => p.id);
    if (a.length === Math.min(plan.count || 1, plan.picks.length) && (plan.picks.length < 2 || a.join() !== b.join() || a.length === plan.picks.length)) pass(`${age}: ${a.length} parlenda(s) por visita e muda na visita seguinte`); else fail(`${age}: escolha estranha ${a} / ${b}`);
  }
  if (lineDuration('Corre, cotia, na casa da tia') >= 3600) pass('cada verso dura o bastante para fazer o gesto'); else fail('verso curto demais');
}

async function play(context, age) {
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
  await page.click('[data-world="create-move"]'); await page.click('[data-game="parlendas"]');
  await page.waitForSelector('#parl-beat');
  const plan = PLAN_BY_AGE[age];
  const textShown = !!(await page.$('#parl-line'));
  if (textShown === !!plan.text) pass(`${age}: ${plan.text ? 'o verso aparece escrito' : 'sem texto, só figura e voz'}`); else fail(`${age}: texto ${textShown ? 'apareceu' : 'sumiu'} contra o plano`);
  const gesture = await page.$eval('#parl-gesture', (el) => el.textContent.trim());
  if (plan.clapOnly ? gesture === '👏' : gesture.length > 0) pass(`${age}: gesto "${gesture}"`); else fail(`${age}: gesto inesperado "${gesture}"`);
  for (let i = 0; i < 4; i += 1) { await page.click('#parl-beat'); await wait(120); }
  const taps = await page.evaluate(() => window.__parl.totalTaps);
  if (taps >= 4) pass(`${age}: ${taps} palmas contadas`); else fail(`${age}: palmas não contaram (${taps})`);
  for (let guard = 0; guard < 40; guard += 1) {
    if (await page.$('#session-again')) break;
    const next = await page.$('#parl-next');
    if (next) await next.click().catch(() => {});
    await wait(250);
  }
  await page.waitForSelector('#session-again', { timeout: 20000 }).then(() => pass(`${age}: terminou até a comemoração`), () => fail(`${age}: não terminou`));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_parlendas_v1')));
  if (saved && Object.keys(saved.done).length >= 1) pass(`${age}: a parlenda foi guardada`); else fail(`${age}: nada guardado`);
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

try {
  logic();
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Jogando');
  for (const age of ['12-18m', '2-3y', '3-4y', '4-5y']) await play(context, age);
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nPARLENDAS FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nPARLENDAS OK — "Parlendas e Gestos" joga do começo ao fim em todas as faixas.');
