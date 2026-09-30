// Auditoria no navegador real (Chromium via playwright-core).
// Parte A — abre TODAS as atividades do catálogo em TODAS as faixas etárias compatíveis e falha se alguma quebrar.
// Parte B — sobre o build (dist/), servido como no Vercel (sem fallback de SPA): jornada infantil por idade,
//           persistência após reload, instalação do Service Worker e reabertura offline.
// Uso: npm run build && npm run test:browser
import { createServer as createViteServer } from 'vite';
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { activityCatalog } from '../src/content/activity-catalog.js';

const AGES = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
const BROKEN_TEXT = 'sendo preparada';
const MOBILE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const failures = [];
const fail = (message) => { failures.push(message); console.error('  ✗ ' + message); };

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (text.startsWith('Failed to load resource')) return; // 404 de áudio opcional já tem fallback e é tratado pela auditoria de áudio
    errors.push(text.split('\n')[0]);
  });
  return errors;
}

async function auditActivities(browser) {
  const vite = await createViteServer({ server: { port: 0, strictPort: false }, logLevel: 'error' });
  await vite.listen();
  const base = vite.resolvedUrls.local[0];
  let checked = 0;
  try {
    for (const age of AGES) {
      const context = await browser.newContext({ ...MOBILE, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = watchErrors(page);
      await page.goto(base);
      await page.waitForFunction(() => window.__abApp);
      for (const activity of activityCatalog.filter((item) => item.ages?.includes(age))) {
        errors.length = 0;
        const launched = await page.evaluate(({ id, ageId }) => {
          try { window.__abApp.launchGame(id, ageId); return true; } catch (error) { return 'exceção: ' + error.message; }
        }, { id: activity.id, ageId: age });
        await page.waitForTimeout(350);
        const text = await page.locator('#game-container').innerText();
        checked += 1;
        if (launched !== true) fail(`${age} ${activity.id}: ${launched}`);
        else if (text.includes(BROKEN_TEXT)) fail(`${age} ${activity.id}: tela "brincadeira sendo preparada" — ${errors[0] || 'sem erro no console'}`);
        else if (errors.length) fail(`${age} ${activity.id}: ${errors[0]}`);
      }
      await context.close();
    }
  } finally {
    await vite.close();
  }
  console.log(`Parte A — ${checked} combinações idade × atividade abertas.`);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.webp': 'image/webp' };

function serveDist(root) {
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
    const file = normalize(join(root, path === '/' ? 'index.html' : path));
    if (!file.startsWith(root) || !existsSync(file)) { response.writeHead(404); response.end('not found'); return; }
    try {
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
      response.end(body);
    } catch (error) { response.writeHead(404); response.end(); }
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

async function auditJourney(browser) {
  const root = join(process.cwd(), 'dist');
  if (!existsSync(join(root, 'index.html'))) { fail('dist/ não encontrado — rode npm run build antes'); return; }
  const server = await serveDist(root);
  const base = `http://localhost:${server.address().port}/`;
  const screenText = (page) => page.locator('#game-container').innerText();
  try {
    for (const age of AGES) {
      const context = await browser.newContext({ ...MOBILE, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = watchErrors(page);
      await page.goto(base);
      await page.locator(`[data-age="${age}"]`).tap();
      const start = page.locator('#child-start-button');
      if (await start.count()) await start.tap();
      else await page.locator('[data-world]').first().tap().then(() => page.locator('#game-container [data-game]').first().tap());
      await page.waitForTimeout(700);
      const text = await screenText(page);
      if (text.includes(BROKEN_TEXT)) fail(`jornada ${age}: primeira brincadeira quebrada — ${errors[0] || ''}`);
      if (await page.locator('[data-age]').count()) fail(`jornada ${age}: voltou para a escolha de idade depois de começar`);
      if (errors.length) fail(`jornada ${age}: ${errors[0]}`);
      await page.reload();
      await page.waitForTimeout(500);
      if (await page.locator('[data-age]').count()) fail(`jornada ${age}: reload voltou para a escolha de idade (idade não persistiu)`);
      await context.close();
    }
    console.log('Parte B — jornada infantil verificada nas 6 faixas.');

    const context = await browser.newContext(MOBILE);
    const page = await context.newPage();
    await page.goto(base);
    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker.state === 'activated') return 'activated';
      return new Promise((resolve) => {
        worker.addEventListener('statechange', () => { if (['activated', 'redundant'].includes(worker.state)) resolve(worker.state); });
        setTimeout(() => resolve('timeout:' + worker.state), 15000);
      });
    });
    if (state !== 'activated') fail(`Service Worker não instalou (estado: ${state}) — PWA/offline indisponível`);
    else {
      await context.setOffline(true);
      await page.reload();
      await page.waitForTimeout(800);
      const offlineOk = (await page.locator('[data-age], #child-start-button').count()) > 0;
      if (!offlineOk) fail('app não abre offline depois da primeira visita');
      await context.setOffline(false);
    }
    await context.close();
    console.log(`Parte B — Service Worker: ${state}.`);
  } finally {
    server.close();
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  await auditActivities(browser);
  await auditJourney(browser);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\nBROWSER AUDIT FAIL — ${failures.length} problema(s).`);
  process.exit(1);
}
console.log('\nBROWSER AUDIT PASS — atividades, jornada, persistência e PWA offline.');
