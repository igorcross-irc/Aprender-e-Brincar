// Teste de ponta a ponta: abre o build real no Chromium e joga as brincadeiras como uma criança.
// Uso: npm run test:e2e (gera o build antes). Requer o Chromium do Playwright instalado.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const AGES = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
const DRAFTS = ['phrases', 'communication', 'phrase-builder-2', 'rhymes', 'sound-initial', 'story-sequence'];

if (!existsSync('dist/index.html')) {
  console.error('E2E FAIL — dist/ ausente. Rode npm run build antes.');
  process.exit(1);
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (message) => { failures.push(message); console.error('  ✗', message); };
const pass = (message) => console.log('  ✓', message);

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('servidor de preview não respondeu');
}

async function goHome(page) {
  await page.click('#btn-home-logo');
  await page.waitForSelector('[data-age]');
}

// Navega idade → mundo → brincadeira pela interface. Retorna false se a brincadeira não aparece.
async function openGame(page, ageId, gameId) {
  await goHome(page);
  await page.click(`[data-age="${ageId}"]`);
  const worlds = await page.$$eval('[data-world]', (els) => els.map((el) => el.dataset.world));
  for (const world of worlds) {
    await page.click(`[data-world="${world}"]`);
    if (await page.$(`[data-game="${gameId}"]`)) {
      await page.click(`[data-game="${gameId}"]`);
      return true;
    }
    await page.click('#btn-back-worlds');
  }
  throw new Error(`${gameId} não está disponível para ${ageId}`);
}

async function listGames(page, ageId) {
  await goHome(page);
  await page.click(`[data-age="${ageId}"]`);
  const worlds = await page.$$eval('[data-world]', (els) => els.map((el) => el.dataset.world));
  const games = new Set();
  for (const world of worlds) {
    await page.click(`[data-world="${world}"]`);
    (await page.$$eval('[data-game]', (els) => els.map((el) => el.dataset.game))).forEach((id) => games.add(id));
    await page.click('#btn-back-worlds');
  }
  return [...games];
}

async function expectResultScreen(page, label) {
  try {
    await page.waitForSelector('#session-again', { timeout: 4000 });
  } catch {
    return fail(`${label}: tela de resultado não apareceu`);
  }
  const overlays = await page.$$eval('body > .fixed.inset-0', (els) => els.length);
  if (overlays) return fail(`${label}: ${overlays} aviso(s) sobrepostos à tela de resultado`);
  pass(`${label}: termina em uma única tela de resultado`);
}

async function playDiscover(page) {
  for (let round = 0; round < 5; round += 1) {
    await page.click('[data-discover]');
    await page.click('#discover-next');
    await page.waitForTimeout(800);
  }
}

async function playMemory(page) {
  const ids = await page.$$eval('.memory-card', (els) => els.map((el) => el.dataset.id));
  const positions = {};
  ids.forEach((id, index) => { (positions[id] ||= []).push(index); });
  for (const [first, second] of Object.values(positions)) {
    const cards = await page.$$('.memory-card');
    await cards[first].click();
    await cards[second].click();
    await page.waitForTimeout(150);
  }
}

async function run() {
  await waitForServer();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()); });
  await page.goto(BASE);

  console.log('Todas as brincadeiras abrem em todas as idades');
  for (const ageId of AGES) {
    const games = await listGames(page, ageId);
    const drafts = games.filter((id) => DRAFTS.includes(id));
    if (drafts.length) fail(`${ageId}: rascunhos visíveis (${drafts.join(', ')})`);
    for (const gameId of games) {
      pageErrors.length = 0;
      await openGame(page, ageId, gameId);
      await page.waitForTimeout(250);
      const text = await page.textContent('#game-container');
      if (text.includes('ainda está sendo preparada')) fail(`${ageId}/${gameId}: não abre`);
      else if (pageErrors.length) fail(`${ageId}/${gameId}: erro — ${pageErrors[0].split('\n')[0]}`);
    }
    pass(`${ageId}: ${games.length} brincadeiras verificadas`);
  }

  console.log('Fluxos completos');
  await openGame(page, '3-4y', 'number-order');
  await page.waitForSelector('.num-option');
  const sequence = await page.$$eval('span.w-16.bg-sky-50', (els) => els.map((el) => Number(el.textContent)).filter(Number.isFinite));
  const expected = sequence[sequence.length - 1] + 1;
  await page.click(`[data-number="${expected}"]`);
  await page.waitForTimeout(600);
  if ((await page.textContent('#game-container')).includes('2/')) pass(`sequência ${sequence.join(',')} aceita ${expected}`);
  else fail(`sequência ${sequence.join(',')} não aceitou ${expected}`);

  await openGame(page, '2-3y', 'memory');
  await playMemory(page);
  await expectResultScreen(page, 'memória');
  if ((await page.textContent('#game-container')).includes('+1')) pass('primeira vez ganha estrela');
  else fail('primeira conclusão não mostrou estrela');
  await page.click('#session-again');
  await page.waitForSelector('.memory-card');
  await playMemory(page);
  await expectResultScreen(page, 'memória repetida');
  if ((await page.textContent('#game-container')).includes('De novo!')) pass('repetição mostra "De novo!" sem estrela extra');
  else fail('repetição não sinalizou "De novo!"');

  await openGame(page, '2-3y', 'animals');
  await playDiscover(page);
  await expectResultScreen(page, 'descobrir animais');

  await openGame(page, '2-3y', 'object-hunt');
  for (let round = 0; round < 5; round += 1) {
    await page.click('[data-object]');
    await page.click('#discover-object-next');
    await page.waitForTimeout(800);
  }
  await expectResultScreen(page, 'caça aos objetos');

  await openGame(page, '2-3y', 'odd-one-out');
  for (let round = 0; round < 10 && await page.$('.odd-option'); round += 1) {
    const labels = await page.$$eval('.odd-option', (els) => els.map((el) => el.getAttribute('aria-label')));
    const odd = labels.findIndex((label) => labels.filter((x) => x === label).length === 1);
    await page.click(`.odd-option[data-index="${odd}"]`);
    await page.waitForTimeout(600);
  }
  await expectResultScreen(page, 'qual é diferente');

  await openGame(page, '2-3y', 'canvas');
  const box = await page.locator('#magic-canvas').boundingBox();
  for (let stroke = 0; stroke < 6; stroke += 1) {
    await page.mouse.move(box.x + 30 + stroke * 20, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 60 + stroke * 20, box.y + 120, { steps: 4 });
    await page.mouse.up();
  }
  if ((await page.$('#session-again'))) fail('desenho interrompido antes de a criança terminar');
  await page.click('#btn-canvas-done');
  await expectResultScreen(page, 'desenho');

  await context.close();

  console.log('Modo offline');
  const swContext = await browser.newContext();
  const swPage = await swContext.newPage();
  await swPage.goto(BASE);
  const cached = await swPage.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    const shell = keys.find((key) => key.endsWith('-shell'));
    return shell ? Boolean(await (await caches.open(shell)).match('/manifest.json')) : false;
  });
  if (cached) pass('service worker instalado com o manifest em cache');
  else fail('service worker não guardou o shell');
  await browser.close();
}

try {
  await run();
} catch (error) {
  fail(`execução interrompida: ${error.message}`);
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`E2E FAIL — ${failures.length} problema(s)`);
  process.exit(1);
}
console.log('E2E OK — brincadeiras abrem, terminam e o app funciona offline.');
