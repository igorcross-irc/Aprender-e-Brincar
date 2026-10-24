// Teste de "Que roupa eu visto?": acerta todas as perguntas em cada faixa, erra de propósito uma vez e confere a lógica das rodadas.
// Uso: npm run test:clima (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { PLAN_BY_AGE, WEATHERS, ITEMS, buildRounds } from '../src/js/games/clima/clima-data.js';

const PORT = 4188;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('CLIMA FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer() { for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); } throw new Error('servidor de preview não respondeu'); }

function logic() {
  console.log('Rodadas (lógica)');
  for (const [age, plan] of Object.entries(PLAN_BY_AGE)) {
    for (const visit of [0, 1, 2, 7]) {
      const rounds = buildRounds(plan, visit);
      const ok = rounds.length === plan.rounds && rounds.every((r) => {
        const w = WEATHERS[r.weather];
        return r.options.length === plan.options && new Set(r.options).size === r.options.length && r.goods.length === plan.need
          && r.goods.every((g) => w.good.includes(g) && r.options.includes(g)) && r.options.every((o) => ITEMS[o])
          && r.options.filter((o) => !w.good.includes(o)).length === plan.options - plan.need;
      });
      if (!ok) { fail(`${age}: rodadas inválidas na visita ${visit}`); break; }
      if (visit === 7) pass(`${age}: ${plan.rounds} perguntas, ${plan.need} certa(s) entre ${plan.options} figuras, erradas de outros tempos`);
    }
    const a = buildRounds(plan, 0).map((r) => r.weather).join(); const b = buildRounds(plan, 1).map((r) => r.weather).join();
    if (a !== b) pass(`${age}: o tempo muda na visita seguinte`); else fail(`${age}: a visita seguinte repete o mesmo tempo`);
  }
}

async function play(context, age, { wrongFirst = false } = {}) {
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
  await page.click('[data-world="discover"]'); await page.click('[data-game="clima"]');
  await page.waitForSelector('.clima-item');
  let did = false;
  for (let guard = 0; guard < 80; guard += 1) {
    if (await page.$('#session-again')) break;
    const st = await page.evaluate(() => { const g = window.__clima; const r = g?.round; return g && r ? { busy: g.busy, finished: g.finished, goods: r.goods, found: g.found.slice(), wrong: r.options.find((o) => !r.goods.includes(o)) } : null; });
    if (!st || st.busy || st.finished) { await wait(250); continue; }
    if (wrongFirst && !did) {
      did = true;
      await page.click(`.clima-item[data-item="${st.wrong}"]`);
      await wait(500);
      const ok = (await page.$('.clima-item')) && !(await page.$('.clima-item.right'));
      if (ok) pass(`${age}: figura errada só balança e deixa tentar de novo`); else fail(`${age}: errar quebrou a pergunta`);
      continue;
    }
    const next = st.goods.find((g) => !st.found.includes(g));
    await page.click(`.clima-item[data-item="${next}"]`);
    await wait(400);
  }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${age}: terminou até a comemoração`), () => fail(`${age}: não terminou`));
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

try {
  logic();
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Jogando');
  await play(context, '2-3y', { wrongFirst: true }); await play(context, '3-4y'); await play(context, '4-5y', { wrongFirst: true });
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nCLIMA FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nCLIMA OK — "Que roupa eu visto?" joga do começo ao fim em todas as faixas.');
