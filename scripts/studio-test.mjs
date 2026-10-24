// Teste do Estúdio dos Bichos: tocar nos bichos (até 3 anos), montar e tocar uma música (3–5 anos) e o modo lite.
// Uso: npm run test:studio (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4178;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('STUDIO FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); }
  throw new Error('servidor de preview não respondeu');
}

async function openStudio(context, age, { lite = false, saved = null } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, s]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    if (s) localStorage.setItem('ab_studio_v1', JSON.stringify(s));
    if (l) localStorage.setItem('ab_lite_graphics', '1');
  }, [lite, saved]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="discover"]'); await page.click('[data-game="studio"]');
  return { page, errors };
}

async function playFree(context, age, animals, target) {
  const { page, errors } = await openStudio(context, age);
  await page.waitForSelector('#studio-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__studio && window.__studio.actors && window.__studio.actors.length, null, { timeout: 20000 });
  await wait(500);
  const box = await (await page.$('#studio-stage')).boundingBox();
  const info = await page.evaluate(() => ({ n: window.__studio.actors.length, target: window.__studio.plan.target }));
  if (info.n === animals && info.target === target) pass(`${age}: ${info.n} bichos e ${info.target} toques`); else fail(`${age}: esperava ${animals}/${target}, veio ${info.n}/${info.target}`);
  for (let i = 0; i < target + 2; i += 1) {
    const done = await page.evaluate(() => window.__studio.finished);
    if (done) break;
    const pos = await page.evaluate((k) => { const a = window.__studio.actors[k % window.__studio.actors.length]; return { x: a.cx, y: a.cy - 90 * a.base }; }, i);
    await page.mouse.click(box.x + pos.x, box.y + pos.y);
    await wait(260);
  }
  const taps = await page.evaluate(() => window.__studio.taps);
  if (taps >= target) pass(`${age}: ${taps} toques nos bichos`); else fail(`${age}: só ${taps} de ${target} toques`);
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${age}: comemoração abriu`), () => fail(`${age}: a comemoração não abriu`));
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

async function playSequencer(context, age, steps, minNotes) {
  const { page, errors } = await openStudio(context, age);
  await page.waitForSelector('#studio-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__studio && window.__studio.cells && window.__studio.cells.length, null, { timeout: 20000 });
  await wait(500);
  const box = await (await page.$('#studio-stage')).boundingBox();
  const info = await page.evaluate(() => ({ tracks: window.__studio.cells.length, steps: window.__studio.steps }));
  if (info.tracks === 4 && info.steps === steps) pass(`${age}: 4 trilhas × ${info.steps} passos`); else fail(`${age}: esperava 4×${steps}, veio ${info.tracks}×${info.steps}`);
  for (let k = 0; k < minNotes; k += 1) {
    const pos = await page.evaluate(([r, c]) => { const cell = window.__studio.cells[r][c]; return { x: cell.x, y: cell.y }; }, [k % 4, k % steps]);
    await page.mouse.click(box.x + pos.x, box.y + pos.y);
    await wait(180);
  }
  const notes = await page.evaluate(() => window.__studio.count());
  if (notes >= minNotes) pass(`${age}: ${notes} quadradinhos marcados`); else fail(`${age}: só ${notes} quadradinhos marcados`);
  const play = await page.evaluate(() => ({ x: window.__studio.playBtn.x, y: window.__studio.playBtn.y }));
  await page.mouse.click(box.x + play.x, box.y + play.y);
  await wait(400);
  if (await page.evaluate(() => window.__studio.playing)) pass(`${age}: a música começou a tocar`); else fail(`${age}: o botão de tocar não funcionou`);
  await page.waitForSelector('#session-again', { timeout: 25000 }).then(() => pass(`${age}: comemoração depois das voltas da música`), () => fail(`${age}: a comemoração não abriu`));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_studio_v1') || 'null'));
  if (saved && saved.pattern && saved.pattern.flat().filter(Boolean).length >= minNotes) pass(`${age}: música guardada no aparelho`); else fail(`${age}: a música não foi guardada`);
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

async function playLiteFree(context) {
  const { page, errors } = await openStudio(context, '2-3y', { lite: true });
  await page.waitForSelector('#studio-lite', { timeout: 10000 });
  const animals = await page.$$('.studio-lite-animal');
  for (let i = 0; i < 12; i += 1) { await animals[i % animals.length].dispatchEvent('click'); await wait(150); }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass('modo lite (2–3 anos): comemoração abriu'), () => fail('modo lite (2–3 anos): não terminou'));
  if (errors.length) fail(`modo lite livre: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('modo lite livre: sem erros de JavaScript');
  await page.close();
}

async function playLiteSeq(context) {
  const { page, errors } = await openStudio(context, '3-4y', { lite: true });
  await page.waitForSelector('#studio-lite .studio-lite-cell', { timeout: 10000 });
  const cells = await page.$$('.studio-lite-cell');
  for (const i of [0, 5, 10, 15]) { await cells[i].dispatchEvent('click'); await wait(120); }
  await (await page.$('#studio-lite-play')).dispatchEvent('click');
  await page.waitForSelector('#session-again', { timeout: 20000 }).then(() => pass('modo lite (3–4 anos): música tocada até a comemoração'), () => fail('modo lite (3–4 anos): não terminou'));
  if (errors.length) fail(`modo lite sequência: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('modo lite sequência: sem erros de JavaScript');
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Tocar nos bichos'); await playFree(context, '12-18m', 3, 8); await playFree(context, '2-3y', 4, 12);
  console.log('Montar uma música'); await playSequencer(context, '3-4y', 4, 4); await playSequencer(context, '4-5y', 8, 8);
  console.log('Modo lite'); await playLiteFree(context); await playLiteSeq(context);
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nSTUDIO FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nSTUDIO OK — o Estúdio dos Bichos joga do começo ao fim em todas as faixas e no modo lite.');
