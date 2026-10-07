// Teste do Mundo das Cenas (Fundo do Mar): descobre bichos tocando neles, em cada faixa de idade, nos 3 momentos do dia e no modo lite.
// Uso: npm run test:scenes (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4177;
const BASE = `http://localhost:${PORT}`;
const AGES = ['12-18m', '2-3y', '4-5y'];
if (!existsSync('dist/index.html')) { console.error('SCENES FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); }
  throw new Error('servidor de preview não respondeu');
}

async function openScene(context, age, { lite = false, visits = 1 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([l, v]) => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    localStorage.setItem('ab_scene_sea_v1', JSON.stringify({ visits: v - 1, found: {} }));
    if (l) localStorage.setItem('ab_lite_graphics', '1');
  }, [lite, visits]);
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'T'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await page.click('[data-world="discover"]'); await page.click('[data-game="scene-sea"]');
  return { page, errors };
}

async function playWebgl(context, age, visits) {
  const tag = `${age}, visita ${visits}`;
  const { page, errors } = await openScene(context, age, { visits });
  await page.waitForSelector('#scene-stage canvas', { timeout: 20000 });
  await page.waitForFunction(() => window.__scene && window.__scene.entities && window.__scene.entities.length, null, { timeout: 20000 });
  await wait(600);
  const box = await (await page.$('#scene-stage')).boundingBox();
  const info = await page.evaluate(() => ({ target: window.__scene.plan.target, creatures: window.__scene.entities.length, mood: window.__scene.mood.id }));
  const expected = { '12-18m': [6, 3], '2-3y': [10, 5], '4-5y': [15, 7] }[age];
  if (info.creatures === expected[0] && info.target === expected[1]) pass(`${tag}: ${info.creatures} bichos e ${info.target} descobertas (${info.mood})`); else fail(`${tag}: esperava ${expected}, veio ${info.creatures}/${info.target}`);
  let guard = 0;
  while (guard < 60) {
    guard += 1;
    const next = await page.evaluate(() => {
      const s = window.__scene;
      if (s.finished) return null;
      const e = s.entities.find((x) => !s.found.has(x.def.id) && x.holder.x > 30 && x.holder.x < s.W - 30 && x.holder.y > 80 && x.holder.y < s.H - 20);
      return e ? { id: e.def.id, x: e.holder.x, y: e.holder.y } : { id: null };
    });
    if (next === null) break;
    if (!next.id) { await wait(400); continue; }
    await page.mouse.click(box.x + next.x, box.y + next.y);
    await wait(250);
  }
  const found = await page.evaluate(() => window.__scene.found.size);
  if (found >= info.target) pass(`${tag}: descobriu ${found} bichos tocando neles`); else fail(`${tag}: só descobriu ${found} de ${info.target}`);
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass(`${tag}: comemoração abriu`), () => fail(`${tag}: a comemoração não abriu`));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('ab_scene_sea_v1')));
  if (stored.visits >= 1 && Object.keys(stored.found).length >= info.target) pass(`${tag}: descobertas guardadas no aparelho`); else fail(`${tag}: descobertas não foram guardadas`);
  if (errors.length) fail(`${tag}: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass(`${tag}: sem erros de JavaScript`);
  await page.close();
}

async function playReactions(context) {
  const { page, errors } = await openScene(context, '4-5y', { visits: 3 });
  await page.waitForFunction(() => window.__scene && window.__scene.entities && window.__scene.entities.length, null, { timeout: 20000 });
  await wait(600);
  const box = await (await page.$('#scene-stage')).boundingBox();
  for (const id of ['baiacu', 'bau', 'concha', 'polvo', 'estrela', 'caranguejo', 'baleia', 'golfinho', 'cardume']) {
    await page.evaluate((i) => {
      const s = window.__scene;
      s.entities.forEach((x) => { x.holder.visible = x.def.id === i; });
      const e = s.entities.find((x) => x.def.id === i);
      e.def.lane = 0.5; if (e.def.x != null) e.def.x = 0.5;
      e.holder.x = s.W * 0.5; e.holder.y = s.H * 0.5; e.dir = 1;
      if (e.leader) { e.leader.x = e.holder.x; e.leader.y = e.holder.y; }
    }, id);
    await wait(350); // o Pixi só atualiza a posição de toque no próximo quadro
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await wait(300);
    if (await page.evaluate((i) => window.__scene.found.has(i), id)) pass(`reação "${id}" funciona`); else fail(`reação "${id}" não registrou descoberta`);
  }
  await page.close();
  if (errors.length) fail(`reações: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('reações: sem erros de JavaScript');
}

async function playLite(context) {
  const { page, errors } = await openScene(context, '2-3y', { lite: true });
  await page.waitForSelector('#scene-lite', { timeout: 10000 });
  const buttons = await page.$$('.scene-lite-c');
  for (const b of buttons.slice(0, 6)) { await b.dispatchEvent('click'); await wait(300); }
  await page.waitForSelector('#session-again', { timeout: 15000 }).then(() => pass('modo lite: cena completa até a comemoração'), () => fail('modo lite: não terminou'));
  if (errors.length) fail(`modo lite: erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('modo lite: sem erros de JavaScript');
  await page.close();
}

try {
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block' });
  console.log('Fundo do Mar'); for (const [i, age] of AGES.entries()) await playWebgl(context, age, i + 1);
  console.log('Reações de cada bicho'); await playReactions(context);
  console.log('Modo lite'); await playLite(context);
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nSCENES FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nSCENES OK — o Fundo do Mar joga do começo ao fim em todas as faixas, nos 3 momentos do dia e no modo lite.');
