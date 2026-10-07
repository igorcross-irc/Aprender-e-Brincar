// Teste de ponta a ponta: abre o build real no Chromium e joga as brincadeiras como uma criança.
// Uso: npm run test:e2e (gera o build antes). Requer o Chromium do Playwright instalado.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { DRAFT_ACTIVITY_IDS } from '../src/content/activity-catalog.js';

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const AGES = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
const DRAFTS = DRAFT_ACTIVITY_IDS;

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

async function setAge(page, ageId) {
  await page.evaluate((age) => localStorage.setItem('aprender_brincar_child_age', age), ageId);
}

async function goHome(page) {
  await page.click('#btn-home-logo');
  await page.waitForSelector('[data-world]');
}

// Navega idade → mundo → brincadeira pela interface. Retorna false se a brincadeira não aparece.
async function openGame(page, ageId, gameId) {
  await setAge(page, ageId);
  await goHome(page);
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
  await setAge(page, ageId);
  await goHome(page);
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
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', serviceWorkers: 'block', permissions: ['microphone'] });
  // O Modo criança tem a própria seção no fim; aqui ele ficaria cobrindo os cliques do robô.
  await context.addInitScript(() => localStorage.setItem('ab_kid_lock', 'off'));
  await context.addInitScript(() => { document.addEventListener('securitypolicyviolation', (event) => { window.__csp = (window.__csp || []).concat(`${event.violatedDirective} ${event.blockedURI}`); }); });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('dialog', (dialog) => dialog.accept());
  page.on('console', (message) => { if (message.type() === 'error') pageErrors.push(message.text()); });
  await page.goto(BASE);

  console.log('Primeira abertura');
  await page.waitForSelector('#setup-start');
  if (await page.$('[data-world]')) fail('mundos aparecem antes da configuração');
  await page.fill('#setup-name', 'Teste');
  await page.click('[data-setup-age="2-3y"]');
  await page.click('#setup-start');
  await page.waitForSelector('[data-world]');
  if ((await page.textContent('.home-greeting')).includes('Teste')) pass('configuração leva ao início com saudação pelo nome');
  else fail('saudação sem o nome configurado');
  if (await page.$('[data-age]')) fail('criança ainda vê escolha de idade');
  const adultWords = ['%', 'aproveitamento', 'dias de sequência', 'Perfil de aprendizagem'];
  const homeText = await page.textContent('#game-container');
  const leaked = adultWords.filter((word) => homeText.includes(word));
  if (leaked.length) fail(`informação de adulto no início: ${leaked.join(', ')}`);

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
  if (await page.$('.result-star')) pass('primeira vez ganha estrela');
  else fail('primeira conclusão não mostrou estrela');
  await page.click('#session-again');
  await page.waitForSelector('.memory-card');
  await playMemory(page);
  await expectResultScreen(page, 'memória repetida');
  if (!(await page.$('.result-star')) && await page.$('.result-subtitle')) pass('repetição comemora sem estrela extra');
  else fail('repetição não sinalizou a brincadeira repetida');

  await openGame(page, '2-3y', 'animals');
  await playDiscover(page);
  await expectResultScreen(page, 'descobrir animais');

  await openGame(page, '2-3y', 'discover-objects');
  for (let round = 0; round < 5; round += 1) {
    await page.click('[data-object]');
    await page.click('#discover-object-next');
    await page.waitForTimeout(800);
  }
  await expectResultScreen(page, 'descobrir objetos');

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

  console.log('Brincadeiras novas (2 a 3 anos)');
  await openGame(page, '2-3y', 'bubbles');
  for (let i = 0; i < 40 && !(await page.$('#session-again')); i += 1) {
    const bubble = await page.$('.bubble:not(.popping)');
    if (bubble) await bubble.dispatchEvent('pointerdown');
    await page.waitForTimeout(250);
  }
  await expectResultScreen(page, 'bolhas');

  await openGame(page, '2-3y', 'count-tap');
  for (let i = 0; i < 60 && !(await page.$('#session-again')); i += 1) {
    const item = await page.$('.count-item:not(.counted)');
    if (item) await item.click();
    else await page.waitForTimeout(400);
  }
  await expectResultScreen(page, 'contar tocando');

  await openGame(page, '2-3y', 'music-keys');
  for (let i = 0; i < 10; i += 1) await page.dispatchEvent(`[data-key="${i % 8}"]`, 'pointerdown');
  await page.click('#music-done');
  await expectResultScreen(page, 'piano dos animais');

  await openGame(page, '2-3y', 'communication');
  for (const id of ['agua', 'colo', 'brincar']) await page.click(`[data-talk="${id}"]`);
  await page.click('#talk-done');
  await expectResultScreen(page, 'prancha eu quero');

  await openGame(page, '2-3y', 'phrases');
  await page.click('.word-card');
  await page.click('#btn-speak-sentence');
  await expectResultScreen(page, 'montar frases');

  await goHome(page);
  await page.click('#btn-album');
  const stickers = await page.$$eval('.sticker.earned', (els) => els.length);
  if (stickers >= 5) pass(`álbum mostra ${stickers} adesivos conquistados`);
  else fail(`álbum mostra só ${stickers} adesivos`);

  console.log('Área da Família');
  const openFamily = async () => {
    await page.click('#btn-settings');
    const eq = await page.textContent('#gate-title ~ div');
    const [p1, p2] = eq.match(/\d+/g).map(Number);
    await page.fill('#gate-input', '1');
    await page.click('#btn-gate-confirm');
    if (!(await page.$('#gate-error:not([hidden])'))) fail('verificação aceitou resposta errada');
    await page.fill('#gate-input', String(p1 * p2));
    await page.click('#btn-gate-confirm');
    await page.waitForSelector('.family-panel');
  };
  await goHome(page);
  await openFamily();
  await page.fill('#child-name-input', 'Bia');
  await page.click('[data-family-age="4-5y"]');
  await page.uncheck('#sound-toggle');
  await page.click('#btn-save-settings');
  await page.waitForSelector('[data-world]');
  const greeting = await page.textContent('.home-greeting');
  const age = await page.evaluate(() => localStorage.getItem('aprender_brincar_child_age'));
  const muted = await page.evaluate(() => localStorage.getItem('ab_muted'));
  if (greeting.includes('Bia') && age === '4-5y' && muted === 'true') pass('perfil, idade e som salvos pela Área da Família');
  else fail(`configurações não salvas (saudação="${greeting}", idade=${age}, mudo=${muted})`);
  await openFamily();
  await page.check('#sound-toggle');
  await page.click('[data-family-age="2-3y"]');
  await page.click('#btn-reset-stars');
  await page.waitForSelector('[data-world]');
  if ((await page.textContent('#star-count')).trim() === '0') pass('zerar progresso volta as estrelas a 0');
  else fail('zerar progresso não zerou as estrelas');
  await page.evaluate(() => localStorage.setItem('aprender_brincar_child_age', '2-3y'));

  console.log('Saída no meio e tempo de tela');
  pageErrors.length = 0;
  await openGame(page, '2-3y', 'bubbles');
  await goHome(page);
  await page.waitForTimeout(1500);
  if (pageErrors.length) fail(`sair das bolhas gerou erro: ${pageErrors[0]}`);
  else pass('sair de uma brincadeira no meio não deixa erros');

  await page.evaluate(() => {
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    localStorage.setItem('aprender_brincar_screen_time_v1', JSON.stringify({ limitMinutes: 15, explicit: true, days: { [day]: 20 * 60000 }, extraMinutes: {} }));
  });
  await page.reload();
  await page.waitForSelector('.rest-card');
  if (!(await page.$('[data-world]'))) pass('limite diário atingido mostra a tela de descanso');
  else fail('mundos continuam disponíveis após o limite');
  await page.click('#rest-family');
  const equation = await page.textContent('#gate-title ~ div');
  const [x, y] = equation.match(/\d+/g).map(Number);
  await page.fill('#gate-input', String(x * y));
  await page.click('#btn-gate-confirm');
  await page.click('#btn-extra-time');
  await page.waitForSelector('[data-world]');
  pass('adulto libera mais 10 minutos pela Área da Família');

  console.log('Novidades: limite padrão, portão, backup, favoritos');
  const solveGate = async () => {
    const text = await page.textContent('#gate-title ~ div');
    const [a, b] = text.match(/\d+/g).map(Number);
    await page.fill('#gate-input', String(a * b));
    await page.click('#btn-gate-confirm');
  };
  // Limite padrão por idade: sem o responsável escolher nada, já há um limite.
  await page.evaluate(() => { localStorage.removeItem('aprender_brincar_screen_time_v1'); localStorage.removeItem('ab_gate_guard'); });
  await page.reload();
  await page.waitForSelector('[data-world]');
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  const limitLabel = await page.textContent('.family-limits .selected');
  if (/padrão/.test(limitLabel)) pass(`limite padrão por idade já vem ligado (${limitLabel.trim()})`);
  else fail(`sem limite padrão (selecionado: ${limitLabel})`);

  // Backup: baixa o arquivo, bagunça os dados e restaura.
  await page.evaluate(() => localStorage.setItem('aprender_brincar_child_name', 'Isa'));
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-backup-file')]);
  const { readFile } = await import('node:fs/promises');
  const code = (await readFile(await download.path(), 'utf8')).trim();
  await page.evaluate(() => localStorage.setItem('aprender_brincar_child_name', 'Outra'));
  await page.fill('#backup-input', code);
  await Promise.all([page.waitForNavigation(), page.click('#btn-backup-restore')]);
  await page.waitForSelector('[data-world]');
  const restored = await page.evaluate(() => localStorage.getItem('aprender_brincar_child_name'));
  if (code.startsWith('AEB1.') && restored === 'Isa') pass('backup baixado e restaurado devolve os dados');
  else fail(`backup não restaurou (nome=${restored})`);

  // Código adulterado é recusado.
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  await page.fill('#backup-input', `${code.slice(0, 40)}XXXX${code.slice(44)}`);
  await page.click('#btn-backup-restore');
  const msg = await page.textContent('#backup-msg');
  if (/incompleto|inválido|ler/.test(msg)) pass('código de backup adulterado é recusado');
  else fail(`código adulterado aceito? "${msg}"`);
  await page.click('#btn-close-settings');

  // Favoritos e "Brincar agora" na tela inicial.
  await page.evaluate(() => localStorage.setItem('ab_favorites', JSON.stringify(['memory'])));
  await page.click('#btn-home-logo');
  await page.waitForSelector('#btn-today');
  const todayGame = await page.getAttribute('#btn-today', 'data-game');
  if (todayGame) pass(`"Brincar agora" sugere uma brincadeira (${todayGame})`);
  else fail('home sem sugestão do dia');
  await page.reload();
  await page.waitForSelector('#btn-favorites');
  await page.click('#btn-favorites');
  await page.waitForSelector('[data-game="memory"]');
  pass('favoritos aparecem na tela inicial e abrem a lista');
  await page.click('#btn-back-worlds');

  // Idade que avança sozinha pelo mês de nascimento.
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  const year = new Date().getFullYear() - 3;
  await page.selectOption('#birth-month', '01');
  await page.selectOption('#birth-year', String(year));
  await page.click('#btn-save-settings');
  await page.waitForSelector('[data-world]');
  const birth = await page.evaluate(() => localStorage.getItem('aprender_brincar_child_birth'));
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  const bandLabel = await page.textContent('.family-ages .selected');
  if (birth === `${year}-01` && /3 a 4 anos/.test(bandLabel)) pass('mês de nascimento define a faixa sozinha (3 a 4 anos)');
  else fail(`nascimento não aplicado (birth=${birth}, faixa="${bandLabel}")`);

  // Grave a sua voz: microfone falso do Chromium; grava, guarda, mostra e apaga.
  await page.click('[data-voice] [data-act="rec"]');
  await page.waitForTimeout(1200);
  await page.click('[data-voice] [data-act="rec"]');
  try {
    await page.waitForSelector('[data-voice] .voice-badge:not([hidden])', { timeout: 5000 });
    const stored = await page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('ab_voice', 1);
      req.onsuccess = () => { const all = req.result.transaction('clips').objectStore('clips').getAll(); all.onsuccess = () => resolve(all.result.map((c) => c.blob.size)); };
      req.onerror = () => resolve([]);
    }));
    if (stored.length === 1 && stored[0] > 500) pass(`gravação da voz guardada no aparelho (${stored[0]} bytes)`);
    else fail(`gravação não ficou no IndexedDB: ${JSON.stringify(stored)}`);
  } catch { fail(`gravação não concluiu: ${await page.textContent('#voice-msg')}`); }
  await page.click('[data-voice] [data-act="play"]');
  await page.click('[data-voice] [data-act="del"]');
  await page.waitForSelector('[data-voice] .voice-badge[hidden]', { state: 'attached' });
  pass('gravação da voz pode ser ouvida e apagada');
  // A gravação passa na frente do MP3 do app: ao ouvir, o arquivo "nao.mp3" nem é pedido à rede.
  const requested = [];
  page.on('request', (request) => { if (request.url().includes('/assets/audio/nao.mp3')) requested.push(request.url()); });
  await page.click('[data-voice="nao.mp3"] [data-act="rec"]');
  await page.waitForTimeout(1000);
  await page.click('[data-voice="nao.mp3"] [data-act="rec"]');
  await page.waitForSelector('[data-voice="nao.mp3"] .voice-badge:not([hidden])', { timeout: 5000 });
  await page.click('[data-voice="nao.mp3"] [data-act="play"]');
  await page.waitForTimeout(800);
  if (requested.length === 0) pass('a voz gravada tem prioridade sobre o MP3 do app');
  else fail(`o MP3 do app foi pedido mesmo com gravação (${requested.length}x)`);
  await page.click('[data-voice="nao.mp3"] [data-act="del"]');
  await page.click('[data-family-age="2-3y"]');
  await page.click('#btn-save-settings');
  await page.waitForSelector('[data-world]');
  const birthAfter = await page.evaluate(() => localStorage.getItem('aprender_brincar_child_birth'));
  if (!birthAfter) pass('escolher a faixa na mão vale mais que o nascimento');
  else fail('nascimento continuou valendo após escolha manual');

  // Irmãos: cada criança com os próprios dados.
  await page.evaluate(() => localStorage.removeItem('ab_gate_guard'));
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  const firstName = await page.evaluate(() => localStorage.getItem('aprender_brincar_child_name') || '');
  await page.click('#btn-add-kid');
  await page.fill('#kid-name', 'Léo');
  await page.selectOption('#kid-age', '3-4y');
  await Promise.all([page.waitForNavigation(), page.click('#btn-create-kid')]);
  await page.waitForSelector('[data-world]');
  const kidGreeting = await page.textContent('.home-greeting');
  const keys = await page.evaluate(() => ({ second: localStorage.getItem('aprender_brincar_child_name:p2'), first: localStorage.getItem('aprender_brincar_child_name') || '', active: JSON.parse(localStorage.getItem('ab_profiles_v1')).active }));
  if (/Léo/.test(kidGreeting) && keys.second === 'Léo' && keys.first === firstName && keys.active === 'p2') pass('segunda criança criada, com dados separados da primeira');
  else fail(`irmão não separado (saudação="${kidGreeting}", chaves=${JSON.stringify(keys)})`);
  if (await page.isVisible('#btn-profile')) pass('rosto da criança aparece no cabeçalho com 2 perfis');
  else fail('botão de trocar de criança não apareceu');
  // Abrir o app de novo (aba nova) pergunta quem vai brincar.
  const fresh = await context.newPage();
  await fresh.goto(BASE);
  try { await fresh.waitForSelector('.who-grid [data-profile]', { timeout: 6000 }); pass('abrir o app com 2 crianças mostra "Quem vai brincar?"'); }
  catch { fail('tela "Quem vai brincar?" não apareceu'); }
  await fresh.click('[data-profile="p1"]');
  await fresh.waitForSelector('[data-world]');
  const back = await fresh.textContent('.home-greeting');
  if (firstName ? back.includes(firstName) : !/Léo/.test(back)) pass('escolher a primeira criança volta aos dados dela');
  else fail(`escolha de perfil não trocou (saudação="${back}")`);
  await fresh.close();
  // Apagar a segunda criança.
  await page.click('#btn-profile');
  await page.waitForSelector('.who-grid');
  await Promise.all([page.waitForNavigation(), page.click('[data-profile="p1"]')]);
  await page.waitForSelector('[data-world]');
  await page.click('#btn-settings');
  await solveGate();
  await page.waitForSelector('.family-panel');
  await Promise.all([page.waitForNavigation(), page.click('[data-kid="p2"] [data-kid-act="del"]')]);
  await page.waitForSelector('[data-world]');
  const afterDelete = await page.evaluate(() => ({ second: localStorage.getItem('aprender_brincar_child_name:p2'), count: JSON.parse(localStorage.getItem('ab_profiles_v1')).profiles.length }));
  if (afterDelete.second === null && afterDelete.count === 1 && !(await page.isVisible('#btn-profile'))) pass('apagar a criança remove os dados dela e o seletor some');
  else fail(`apagar criança falhou ${JSON.stringify(afterDelete)}`);

  // Portão: 3 erros seguidos travam a entrada.
  await page.click('#btn-settings');
  for (let i = 0; i < 3; i += 1) { await page.fill('#gate-input', '1'); await page.click('#btn-gate-confirm'); }
  const locked = await page.$eval('#gate-input', (el) => el.disabled);
  const lockMsg = await page.textContent('#gate-error');
  if (locked && /Muitas tentativas/.test(lockMsg)) pass('3 erros no portão bloqueiam por um tempo');
  else fail(`portão não bloqueou (disabled=${locked}, msg="${lockMsg}")`);
  await page.evaluate(() => localStorage.removeItem('ab_gate_guard'));

  // A política de segurança do app (CSP) não pode ter sido violada em nenhuma tela até aqui.
  const violations = await page.evaluate(() => window.__csp || []);
  if (violations.length === 0) pass('nenhuma violação da política de segurança (CSP)');
  else fail(`violações de CSP: ${violations.slice(0, 3).join(' | ')}`);

  await context.close();

  console.log('Modo criança');
  const lockContext = await browser.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await lockContext.addInitScript(() => localStorage.setItem('aprender_brincar_child_age', '2-3y'));
  const lockPage = await lockContext.newPage();
  const lockErrors = [];
  lockPage.on('pageerror', (error) => lockErrors.push(error.message));
  const isFullscreen = () => lockPage.evaluate(() => Boolean(document.fullscreenElement));
  await lockPage.goto(BASE);
  await lockPage.waitForSelector('[data-world]');
  await lockPage.mouse.click(512, 700);
  await lockPage.waitForTimeout(300);
  if (await isFullscreen()) pass('primeiro toque abre em tela cheia');
  else fail('primeiro toque não abriu a tela cheia');
  await lockPage.evaluate(() => document.exitFullscreen());
  await lockPage.waitForSelector('.kid-lock-return');
  await lockPage.click('.kid-lock-button', { force: true });
  await lockPage.waitForTimeout(300);
  if (await isFullscreen() && !(await lockPage.$('.kid-lock-return'))) pass('saiu da tela cheia: botão ▶ volta');
  else fail('o botão ▶ não voltou para a tela cheia');
  const lockUrl = lockPage.url();
  await lockPage.goBack().catch(() => {});
  await lockPage.waitForTimeout(300);
  if (lockPage.url() === lockUrl && await lockPage.$('[data-world]')) pass('botão Voltar não sai do app');
  else fail('botão Voltar saiu do app');
  await lockPage.click('#btn-settings');
  const lockEquation = await lockPage.textContent('#gate-title ~ div');
  const [l1, l2] = lockEquation.match(/\d+/g).map(Number);
  await lockPage.fill('#gate-input', String(l1 * l2));
  await lockPage.click('#btn-gate-confirm');
  await lockPage.click('#btn-exit-fullscreen');
  await lockPage.waitForTimeout(300);
  await lockPage.mouse.click(512, 700);
  await lockPage.waitForTimeout(300);
  if (!(await isFullscreen()) && !(await lockPage.$('.kid-lock-return'))) pass('adulto sai da tela cheia pela Área da Família');
  else fail('a saída pela Área da Família não liberou a tela cheia');
  if (lockErrors.length) fail(`Modo criança gerou erro: ${lockErrors[0]}`);
  await lockContext.close();

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

  // De verdade sem internet: baixa o pacote pela Área da Família, corta a rede e brinca.
  await swPage.evaluate(() => localStorage.setItem('aprender_brincar_child_age', '2-3y'));
  await swPage.reload();
  await swPage.waitForSelector('[data-world]');
  await swPage.evaluate(async () => { await navigator.serviceWorker.ready; });
  await swPage.reload(); // agora a página já é controlada pelo service worker
  await swPage.waitForSelector('[data-world]');
  await swPage.click('#btn-settings');
  const eq = (await swPage.textContent('#gate-title ~ div')).match(/\d+/g).map(Number);
  await swPage.fill('#gate-input', String(eq[0] * eq[1]));
  await swPage.click('#btn-gate-confirm');
  await swPage.waitForSelector('#btn-download-pack');
  await swPage.click('#btn-download-pack');
  try {
    await swPage.waitForFunction(() => /Tudo guardado/.test(document.querySelector('#pack-status')?.textContent || ''), null, { timeout: 90000 });
    pass('"Baixar para usar sem internet" guardou falas e imagens');
  } catch { fail(`pacote offline não concluiu: ${await swPage.textContent('#pack-status')}`); }
  await swPage.click('#btn-close-settings');
  await swContext.setOffline(true);
  const offline = await swPage.evaluate(async () => {
    const audio = await fetch('/assets/audio/agua.mp3').then((r) => r.ok).catch(() => false);
    const image = await fetch('/assets/images/figures/gato.webp').then((r) => r.ok).catch(() => false);
    return { audio, image };
  });
  if (offline.audio && offline.image) pass('sem internet: fala e imagem vêm do aparelho');
  else fail(`sem internet faltou arquivo (${JSON.stringify(offline)})`);
  await swPage.reload();
  try { await swPage.waitForSelector('[data-world]', { timeout: 8000 }); pass('sem internet: o app abre e mostra os mundos'); }
  catch { fail('sem internet o app não abriu'); }
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
