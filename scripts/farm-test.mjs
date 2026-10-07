// Teste da Fazendinha Viva (WebGL): joga a sessão inteira em cada idade, arrastando comida, regando e colhendo,
// e confere o modo lite. Uso: npm run test:farm (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4176;
const BASE = `http://localhost:${PORT}`;
const AGES = ['12-18m', '2-3y', '4-5y'];
if (!existsSync('dist/index.html')) { console.error('FARM FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); }
  throw new Error('servidor de preview não respondeu');
}

async function openFarm(context, age, { lite = false, visits = 0 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, v]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    if (l) localStorage.setItem('ab_lite_graphics', '1');
    if (v > 0) localStorage.setItem('ab_farm_v1', JSON.stringify({ visits: v - 1, eggs: 0, harvest: 0 }));
  }, [lite, visits]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="discover"]'); await page.click('[data-game="farm"]');
  return { page, errors };
}

async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y); await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 6 });
  await page.mouse.move(to.x, to.y, { steps: 6 });
  await page.mouse.up();
}

async function playWebgl(context, age, visits) {
  const { page, errors } = await openFarm(context, age, { visits });
  await page.waitForSelector('#farm-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__farm && window.__farm.actors, null, { timeout: 20000 });
  await wait(800);
  const box = await (await page.$('#farm-stage')).boundingBox();
  const at = (p) => ({ x: box.x + p.x, y: box.y + p.y });
  const info = await page.evaluate(() => ({ actors: window.__farm.actors.map((a) => ({ x: a.cx, y: a.cy - 100 * a.base })), foods: window.__farm.foods.map((f) => ({ x: f.home.x, y: f.home.y })) }));
  // erro proposital: comida do 1º bicho no 2º (deve voltar sem punição)
  await drag(page, at(info.foods[0]), at(info.actors[1]));
  await wait(700);
  if (await page.evaluate(() => window.__farm.fedCount) === 0) pass(`${age}: comida errada volta e ninguém é alimentado`); else fail(`${age}: comida errada alimentou um bicho`);
  for (let i = 0; i < info.actors.length; i += 1) { await drag(page, at(info.foods[i]), at(info.actors[i])); await wait(1100); }
  if (await page.evaluate(() => window.__farm.fedCount) === info.actors.length) pass(`${age}: todos os ${info.actors.length} bichos alimentados`); else fail(`${age}: nem todos os bichos foram alimentados`);
  await page.waitForFunction(() => window.__farm.phase === 'garden', null, { timeout: 8000 }).then(() => pass(`${age}: horta aparece depois dos bichos`), () => fail(`${age}: horta não apareceu`));
  await wait(1200);
  const beds = await page.evaluate(() => window.__farm.beds.map((b) => ({ x: b.root.x, y: b.root.y - 28 })));
  for (const bed of beds) { await page.mouse.click(box.x + bed.x, box.y + bed.y); await wait(250); }
  await wait(1800);
  for (const bed of beds) { await page.mouse.click(box.x + bed.x, box.y + bed.y); await wait(700); }
  if (await page.evaluate(() => window.__farm.harvested) === beds.length) pass(`${age}: regou e colheu ${beds.length} canteiros`); else fail(`${age}: colheita incompleta`);
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${age}: noite chega e a comemoração abre`), () => fail(`${age}: a comemoração não abriu`));
  if (errors.length) fail(`${age}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${age}: sem erros de JavaScript`);
  await page.close();
}

async function playLite(context) {
  const { page, errors } = await openFarm(context, '2-3y', { lite: true });
  await page.waitForSelector('#farm-lite', { timeout: 10000 });
  const foods = await page.$$('[data-food]');
  for (const food of foods) { await food.click(); await wait(700); }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass('modo lite: sessão completa até a comemoração'), () => fail('modo lite: não terminou'));
  if (errors.length) fail(`modo lite: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('modo lite: sem erros de JavaScript');
  await page.close();
}

async function playUnlocks(context) {
  const { page } = await openFarm(context, '2-3y', { visits: 6 });
  await page.waitForFunction(() => window.__farm && window.__farm.actors, null, { timeout: 20000 });
  const state = await page.evaluate(() => ({ unlocked: [...window.__farm.unlocked].sort(), fresh: window.__farm.fresh, butterflies: window.__farm.butterflies.length, hasWindmill: Boolean(window.__farm.windmill), hasBalloon: Boolean(window.__farm.balloon), hasRainbow: Boolean(window.__farm.rainbow) }));
  if (state.unlocked.length === 5 && state.fresh === 'pintinho' && state.butterflies === 3 && state.hasWindmill && state.hasBalloon && state.hasRainbow) pass('6ª visita: borboletas, moinho, balão, arco-íris e pintinho presentes');
  else fail(`desbloqueios incorretos: ${JSON.stringify(state)}`);
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  for (const age of AGES) { console.log(`Fazendinha ${age}`); await playWebgl(context, age, 0); }
  console.log('Desbloqueios por visita'); await playUnlocks(context);
  console.log('Modo lite'); await playLite(context);
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nFARM FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nFARM OK — a Fazendinha joga do começo ao fim em todas as faixas e no modo lite.');
