// Teste do Ateliê Mágico: pintar cada desenho até ele ganhar vida (todas as faixas, os 5 desenhos) e o modo lite.
// Uso: npm run test:atelie (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const SHOTS = process.env.ATELIE_SHOTS || '';
if (!existsSync('dist/index.html')) { console.error('ATELIE FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }
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

async function openAtelie(context, age, { lite = false, visits = 1 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, v]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    localStorage.setItem('ab_atelie_v1', JSON.stringify({ visits: v - 1, done: {} }));
    if (l) localStorage.setItem('ab_lite_graphics', '1');
  }, [lite, visits]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="create-move"]'); await page.click('[data-game="atelie"]');
  return { page, errors };
}

async function playWebgl(context, age, visits) {
  const { page, errors } = await openAtelie(context, age, { visits });
  await page.waitForSelector('#atelie-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__atelie && window.__atelie.regions && window.__atelie.regions.length && window.__atelie.pots, null, { timeout: 20000 });
  await wait(500);
  const tag = `${age}, desenho ${visits}`;
  const box = await (await page.$('#atelie-stage')).boundingBox();
  const info = await page.evaluate(() => ({ id: window.__atelie.page.id, regions: window.__atelie.regions.length, auto: window.__atelie.plan.auto, need: Math.ceil(window.__atelie.regions.length * window.__atelie.plan.share) }));
  pass(`${tag}: "${info.id}" com ${info.regions} partes; precisa pintar ${info.need}`);
  let guard = 0;
  while (guard < 60) {
    guard += 1;
    const next = await page.evaluate(() => {
      const a = window.__atelie;
      if (a.alive) return null;
      const r = a.regions.find((x) => !x.painted);
      if (!r) return { none: true };
      const p = a.art.toGlobal({ x: r.item.pt[0], y: r.item.pt[1] });
      const pot = a.plan.auto ? null : a.pots[a.paintedCount % a.pots.length];
      return { x: p.x, y: p.y, pot: pot ? { x: pot.x, y: pot.y } : null };
    });
    if (next === null) break;
    if (next.none) { await wait(300); continue; }
    if (next.pot) { await page.mouse.click(box.x + next.pot.x, box.y + next.pot.y); await wait(120); }
    await page.mouse.click(box.x + next.x, box.y + next.y);
    await wait(220);
  }
  await page.waitForFunction(() => window.__atelie.alive, null, { timeout: 8000 }).then(() => pass(`${tag}: o desenho ganhou vida`), () => fail(`${tag}: o desenho não ganhou vida`));
  const painted = await page.evaluate(() => window.__atelie.paintedCount);
  if (painted >= info.need) pass(`${tag}: ${painted} partes pintadas`); else fail(`${tag}: só ${painted} partes pintadas`);
  if (SHOTS) { await wait(900); await page.screenshot({ path: `${SHOTS}/${age}-${visits}-vivo.png` }); }
  await page.waitForSelector('#session-again', { timeout: 20000 }).then(() => pass(`${tag}: comemoração abriu`), () => fail(`${tag}: a comemoração não abriu`));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_atelie_v1')));
  if (saved && saved.done && Object.keys(saved.done).length) pass(`${tag}: desenho guardado no aparelho`); else fail(`${tag}: desenho não foi guardado`);
  if (errors.length) fail(`${tag}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${tag}: sem erros de JavaScript`);
  await page.close();
}

async function playLite(context, age) {
  const { page, errors } = await openAtelie(context, age, { lite: true });
  await page.waitForSelector('#atelie-lite svg', { timeout: 10000 });
  const regions = await page.$$('.atelie-lite-region');
  const pots = await page.$$('.atelie-lite-pot');
  for (let i = 0; i < regions.length; i += 1) {
    if (pots.length) await pots[i % pots.length].dispatchEvent('click');
    await regions[i].dispatchEvent('click');
    await wait(80);
    if (await page.$('#atelie-lite-board.alive')) break;
  }
  await page.waitForSelector('#atelie-lite-board.alive', { timeout: 6000 }).then(() => pass(`modo lite (${age}): o desenho ganhou vida`), () => fail(`modo lite (${age}): o desenho não ganhou vida`));
  await page.waitForSelector('#session-again', { timeout: 20000 }).then(() => pass(`modo lite (${age}): comemoração abriu`), () => fail(`modo lite (${age}): não terminou`));
  if (errors.length) fail(`modo lite (${age}): erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`modo lite (${age}): sem erros de JavaScript`);
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Os 5 desenhos (3–4 anos)'); for (let v = 1; v <= 5; v += 1) await playWebgl(context, '3-4y', v);
  console.log('Outras faixas'); await playWebgl(context, '18-24m', 1); await playWebgl(context, '2-3y', 2); await playWebgl(context, '4-5y', 3);
  console.log('Modo lite'); await playLite(context, '3-4y'); await playLite(context, '18-24m');
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nATELIE FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nATELIE OK — o Ateliê Mágico joga do começo ao fim: os 5 desenhos ganham vida, em todas as faixas e no modo lite.');
