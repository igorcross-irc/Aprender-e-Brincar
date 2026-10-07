// Joga todas as brincadeiras de todas as idades até o fim, como uma criança faria.
// Detecta travamentos (rodada sem resposta possível), erros de JavaScript e registra o texto de cada rodada.
// Uso: npm run build && node scripts/play-all.mjs [idade] [--shots pasta] [--legacy]
// --legacy: roda só a versão para aparelhos antigos (ES5, sem Pointer Events, alternativas de CSS).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const ALL_AGES = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
const args = process.argv.slice(2);
const shotsIndex = args.indexOf('--shots');
const SHOTS = shotsIndex >= 0 ? args[shotsIndex + 1] : null;
const AGES = args.filter((arg, index) => ALL_AGES.includes(arg) && index !== shotsIndex + 1);
const onlyIndex = args.indexOf('--only');
const ONLY = onlyIndex >= 0 ? args[onlyIndex + 1].split(',') : null;
const speechIndex = args.indexOf('--speech');
const SPEECH_OUT = speechIndex >= 0 ? args[speechIndex + 1] : null;
const spoken = {};
const LEGACY = args.includes('--legacy');
// Na versão legada não existe PointerEvent: o toque chega pelo adaptador (mousedown → pointerdown).
const POINTER = LEGACY ? 'mousedown' : 'pointerdown';
const ages = AGES.length ? AGES : ALL_AGES;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

if (!existsSync('dist/index.html')) { console.error('dist/ ausente. Rode npm run build.'); process.exit(1); }
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });

const CHOICES = ['.learning-option', '.odd-option', '.num-option', '.color-option', '.sq-option', '.talk-card', '.word-card', '[data-guided]:not([data-done])'];
const ADVANCE = ['#discover-next:not([disabled])', '#discover-object-next:not([disabled])', '#story-next', '#music-done:not([disabled])', '#movement-done', '#rh-done', '#btn-canvas-done:not([disabled])', '#talk-done:not([disabled])', '#btn-speak-sentence'];
const report = [];

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('preview não respondeu');
}

const snapshot = (page) => page.evaluate(() => {
  const root = document.getElementById('game-container');
  return (root?.innerText || '').replace(/\s+/g, ' ').trim();
});

async function openGame(page, ageId, gameId) {
  await page.evaluate((age) => localStorage.setItem('aprender_brincar_child_age', age), ageId);
  await page.click('#btn-home-logo');
  await page.waitForSelector('[data-world]');
  for (const world of await page.$$eval('[data-world]', (els) => els.map((el) => el.dataset.world))) {
    await page.click(`[data-world="${world}"]`);
    if (await page.$(`[data-game="${gameId}"]`)) { await page.click(`[data-game="${gameId}"]`); return; }
    await page.click('#btn-back-worlds');
  }
  throw new Error(`não encontrada: ${gameId}`);
}

async function listGames(page, ageId) {
  await page.evaluate((age) => localStorage.setItem('aprender_brincar_child_age', age), ageId);
  await page.click('#btn-home-logo');
  await page.waitForSelector('[data-world]');
  const games = [];
  for (const world of await page.$$eval('[data-world]', (els) => els.map((el) => el.dataset.world))) {
    await page.click(`[data-world="${world}"]`);
    for (const id of await page.$$eval('[data-game]', (els) => els.map((el) => el.dataset.game))) if (!games.includes(id)) games.push(id);
    await page.click('#btn-back-worlds');
  }
  return games;
}

const progressCount = (page) => page.evaluate(() => document.querySelectorAll('.game-dots span.done, .story-slot.filled').length + (document.getElementById('session-again') ? 100 : 0));

// Toca em cada opção até o progresso (bolinhas / encaixes) aumentar.
async function tapUntilProgress(page, selector) {
  const before = await progressCount(page);
  const total = (await page.$$(selector)).length;
  // Todas as opções já usadas: a rodada está terminando (narração final); espera a próxima.
  if (!(await page.$(`${selector}:not([disabled])`))) { await page.waitForTimeout(3000); return true; }
  for (let i = 0; i < total; i += 1) {
    const options = await page.$$(selector);
    if (!options[i]) continue;
    if (await options[i].isDisabled()) continue;
    await options[i].click();
    for (let wait = 0; wait < 14; wait += 1) {
      await page.waitForTimeout(250);
      if ((await progressCount(page)) > before) { await page.waitForTimeout(400); return true; }
    }
  }
  return 'stuck';
}

// Estratégias específicas para jogos que não são de "tocar na resposta".
async function playSpecial(page) {
  if (await page.$('.story-card')) return tapUntilProgress(page, '.story-card');
  if (await page.$('.peek-spot')) return tapUntilProgress(page, '.peek-spot');
  if (await page.$('.sort-bin')) return tapUntilProgress(page, '.sort-bin');
  if (await page.$('.word-option')) return tapUntilProgress(page, '.word-option');
  if (await page.$('.memory-card')) {
    const ids = await page.$$eval('.memory-card:not(.matched)', (els) => els.map((el) => el.dataset.idx + ':' + el.dataset.id));
    if (!ids.length) { await page.waitForTimeout(1200); return true; }
    const byId = {};
    ids.forEach((entry) => { const [idx, id] = entry.split(':'); (byId[id] ||= []).push(idx); });
    for (const [a, b] of Object.values(byId)) {
      await page.click(`.memory-card[data-idx="${a}"]`);
      await page.click(`.memory-card[data-idx="${b}"]`);
      await page.waitForTimeout(200);
    }
    return true;
  }
  if (await page.$('.puzzle-piece')) {
    for (const piece of await page.$$('.puzzle-piece')) {
      const id = await piece.getAttribute('data-piece');
      const target = await page.$(`.puzzle-target[data-target="${id}"]`);
      const from = await piece.boundingBox();
      const to = await target.boundingBox();
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(150);
    }
    return true;
  }
  if (await page.$('#sky-area')) {
    const target = (await page.textContent('#target-num')).trim();
    const balloon = await page.$(`#sky-area button[aria-label="Balão número ${target}"]`);
    if (!balloon) return 'stuck';
    await balloon.dispatchEvent(POINTER);
    await page.waitForTimeout(600);
    return true;
  }
  if (await page.$('#magic-canvas')) {
    const box = await page.locator('#magic-canvas').boundingBox();
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.move(box.x + 30 + i * 25, box.y + 40); await page.mouse.down();
      await page.mouse.move(box.x + 60 + i * 25, box.y + 150, { steps: 3 }); await page.mouse.up();
    }
    await page.click('#btn-canvas-done');
    return true;
  }
  if (await page.$('.bubble')) {
    const bubble = await page.$('.bubble:not(.popping)');
    if (bubble) await bubble.dispatchEvent(POINTER);
    await page.waitForTimeout(250);
    return true;
  }
  if (await page.$('.count-item')) {
    const item = await page.$('.count-item:not(.counted)');
    if (item) await item.click(); else await page.waitForTimeout(500);
    return true;
  }
  if (await page.$('.story-cover')) { await page.click('.story-cover'); await page.waitForTimeout(500); return true; }
  if (await page.$('#storybook')) {
    for (let i = 0; i < 8 && !(await page.$('#session-again')); i += 1) { await page.click('#sb-next'); await page.waitForTimeout(300); }
    return true;
  }
  if (await page.$('#scene-lite')) {
    for (const creature of await page.$$('.scene-lite-c')) { await creature.dispatchEvent('click'); await page.waitForTimeout(250); }
    await page.waitForTimeout(5000);
    return true;
  }
  if (await page.$('#farm-lite')) {
    for (const food of await page.$$('[data-food]:not([disabled])')) { await food.click(); await page.waitForTimeout(500); }
    await page.waitForTimeout(6000);
    return true;
  }
  if (await page.$('.piano-key')) {
    for (let i = 0; i < 10; i += 1) await page.dispatchEvent(`[data-key="${i % 5}"]`, POINTER);
    await page.click('#music-done');
    return true;
  }
  if (await page.$('.talk-card')) {
    const cards = await page.$$('.talk-card');
    for (const card of cards.slice(0, 3)) await card.click();
    await page.click('#talk-done');
    return true;
  }
  if (await page.$('[data-guided]')) {
    for (const card of await page.$$('[data-guided]:not([data-done])')) await card.click();
    await page.waitForTimeout(400);
    return true;
  }
  if (await page.$('.word-card')) {
    await page.click('.word-card');
    await page.click('#btn-speak-sentence');
    return true;
  }
  return false;
}

// Tenta cada opção até a tela mudar; se nenhuma muda, a rodada está travada.
async function playChoiceRound(page) {
  const before = await snapshot(page);
  for (const selector of ADVANCE) {
    const button = await page.$(selector);
    if (button) {
      if (selector.startsWith('#discover')) {
        const first = await page.$('[data-discover], [data-object]');
        if (first) await first.click();
      }
      await button.click();
      await page.waitForTimeout(900);
      return (await snapshot(page)) !== before ? true : 'stuck';
    }
  }
  if (await page.$('[data-discover], [data-object]')) {
    await page.click('[data-discover], [data-object]');
    return true;
  }
  const choices = await page.$$(CHOICES.join(','));
  if (!choices.length) return false;
  for (let i = 0; i < choices.length; i += 1) {
    const current = await page.$$(CHOICES.join(','));
    if (!current[i]) break;
    await current[i].click();
    await page.waitForTimeout(950);
    if (await page.$('#session-again')) return true;
    if ((await snapshot(page)) !== before) return true;
  }
  return 'stuck';
}

async function playGame(page, ageId, gameId, errors) {
  errors.length = 0;
  const entry = { ageId, gameId, rounds: [], status: 'ok', errors: [] };
  await openGame(page, ageId, gameId);
  await page.waitForTimeout(400);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${ageId}__${gameId}.png` });
  const text = await snapshot(page);
  if (text.includes('ainda está sendo preparada')) { entry.status = 'não abre'; return entry; }
  let lastText = '';
  for (let step = 0; step < 80; step += 1) {
    if (await page.$('#session-again')) break;
    const current = await snapshot(page);
    if (current !== lastText) { entry.rounds.push(current.slice(0, 220)); lastText = current; }
    const special = await playSpecial(page);
    const result = special === false ? await playChoiceRound(page) : special;
    if (result === 'stuck') { entry.status = 'TRAVOU'; entry.stuckAt = current.slice(0, 300); if (SHOTS) await page.screenshot({ path: `${SHOTS}/${ageId}__${gameId}__TRAVOU.png` }); break; }
    if (result === false) {
      await page.waitForTimeout(1500);
      if (await page.$('#session-again')) break;
      if ((await snapshot(page)) !== current) continue;
      entry.status = 'sem ação possível'; entry.stuckAt = current.slice(0, 300); break;
    }
  }
  if (entry.status === 'ok' && !(await page.$('#session-again'))) entry.status = 'não terminou';
  entry.errors = [...errors];
  if (entry.errors.length && entry.status === 'ok') entry.status = 'erro JS';
  return entry;
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => { localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_lite_graphics', '1'); });
  if (LEGACY) {
    const legacyHtml = readFileSync('dist/index.html', 'utf8')
      .replace(/<script type="module"[^>]*>[\s\S]*?<\/script>/g, '')
      .replace(/<link rel="modulepreload"[^>]*>/g, '')
      .replace(/<script nomodule/g, '<script');
    await context.route(`${BASE}/`, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: legacyHtml }));
    await context.addInitScript(() => { window.__AB_SIMULATE_LEGACY__ = true; delete window.PointerEvent; delete window.Proxy; delete window.fetch; delete String.prototype.normalize; });
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('dialog', (dialog) => dialog.accept());
  await page.addInitScript(() => localStorage.setItem('aprender_brincar_child_name', 'Isadora'));
  // Registra tudo que foi falado pela voz do navegador (= falas sem MP3 gravado).
  await page.addInitScript(() => {
    window.__spoken = [];
    const synth = window.speechSynthesis;
    if (synth) { const original = synth.speak.bind(synth); synth.speak = (utterance) => { window.__spoken.push(utterance.text); return original(utterance); }; }
  });
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem('aprender_brincar_child_age', '2-3y'));
  await page.reload();
  for (const ageId of ages) {
    const games = (await listGames(page, ageId)).filter((id) => !ONLY || ONLY.includes(id));
    for (const gameId of games) {
      let entry;
      try { entry = await playGame(page, ageId, gameId, errors); }
      catch (error) { entry = { ageId, gameId, status: 'exceção', errors: [error.message.split('\n')[0]], rounds: [] }; }
      await page.waitForTimeout(700);
      if (SPEECH_OUT) {
        for (const text of await page.evaluate(() => window.__spoken.splice(0))) (spoken[text] ||= new Set()).add(gameId);
      }
      report.push(entry);
      console.log(`${entry.status === 'ok' ? '✓' : '✗'} ${ageId} ${gameId} — ${entry.status} (${entry.rounds.length} telas)${entry.errors.length ? ' · ' + entry.errors[0].split('\n')[0] : ''}`);
    }
  }
  await browser.close();
} finally {
  server.kill();
}

writeFileSync('play-all-report.json', JSON.stringify(report, null, 2));
if (SPEECH_OUT) writeFileSync(SPEECH_OUT, JSON.stringify(Object.fromEntries(Object.entries(spoken).map(([text, games]) => [text, [...games]])), null, 2));
const bad = report.filter((entry) => entry.status !== 'ok');
console.log(`\nPLAY-ALL — ${report.length - bad.length}/${report.length} brincadeiras jogadas até o fim.`);
process.exit(bad.length ? 1 : 0);
