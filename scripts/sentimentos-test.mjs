// Teste de "Como eu me sinto?": acerta todas as rodadas em cada faixa, erra de propósito uma vez e confere a lógica das rodadas.
// Uso: npm run test:sentimentos (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { PLAN_BY_AGE, buildRounds, EMOTIONS, STRATEGIES } from '../src/js/games/sentimentos/sentimentos-data.js';

const PORT = 4185;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('SENTIMENTOS FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer() { for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); } throw new Error('servidor de preview não respondeu'); }

function logic() {
  console.log('Rodadas (lógica)');
  for (const [age, plan] of Object.entries(PLAN_BY_AGE)) {
    const rounds = buildRounds(plan, 3);
    const ok = rounds.length === plan.rounds && rounds.every((r) => r.options.includes(r.emotion) && new Set(r.options).size === r.options.length && r.options.length === plan.options && r.options.every((o) => EMOTIONS[o]));
    if (ok) pass(`${age}: ${rounds.length} rodadas, a carinha certa sempre está entre as opções`); else fail(`${age}: rodadas inválidas`);
    const situ = plan.mode === 'situations' ? rounds.every((r) => r.situation && r.situation.emotion === r.emotion) : true;
    if (situ) pass(`${age}: cada situação combina com a emoção`); else fail(`${age}: situação não combina`);
    if (plan.strategies) {
      const strat = rounds.filter((r) => STRATEGIES[r.emotion]).every((r) => r.strategy && r.strategy.options.includes(r.strategy.good) && r.strategy.options.includes('bater'));
      if (strat) pass(`${age}: "o que fazer" tem a boa saída entre as opções`); else fail(`${age}: estratégia inválida`);
    }
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
  await page.click('[data-world="language"]'); await page.click('[data-game="sentimentos"]');
  await page.waitForSelector('.sent-face');
  let did = false;
  for (let guard = 0; guard < 80; guard += 1) {
    if (await page.$('#session-again')) break;
    const st = await page.evaluate(() => { const s = window.__sent; return s ? { step: s.step, busy: s.busy, emotion: s.round?.emotion, good: s.round?.strategy?.good, bad: s.round?.options.find((o) => o !== s.round.emotion), finished: s.finished } : null; });
    if (!st || st.busy || st.finished) { await wait(250); continue; }
    if (wrongFirst && !did && st.step === 'emotion') {
      did = true;
      await page.click(`.sent-face[data-emotion="${st.bad}"]`);
      await wait(500);
      const stillThere = await page.$('.sent-face');
      if (stillThere && !(await page.$('.sent-face.right'))) pass(`${age}: carinha errada só balança e deixa tentar de novo`); else fail(`${age}: errar quebrou a rodada`);
      continue;
    }
    if (st.step === 'emotion') await page.click(`.sent-face[data-emotion="${st.emotion}"]`);
    else await page.click(`.sent-action[data-action="${st.good}"]`);
    await wait(2000);
  }
  await page.waitForSelector('#session-again', { timeout: 10000 }).then(() => pass(`${age}: terminou até a comemoração`), () => fail(`${age}: não terminou`));
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

try {
  logic();
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Jogando'); await play(context, '2-3y', { wrongFirst: true }); await play(context, '3-4y'); await play(context, '4-5y', { wrongFirst: true });
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nSENTIMENTOS FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nSENTIMENTOS OK — "Como eu me sinto?" joga do começo ao fim em todas as faixas.');
