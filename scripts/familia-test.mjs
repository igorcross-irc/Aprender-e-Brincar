// Teste do que é da família: "Para brincar agora" no início, Diário da Família e Voz da família nas histórias.
// Uso: npm run test:familia (gera o build antes).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { buildDiary } from '../src/core/family-diary.js';
import { todayPicks } from '../src/js/ui/app-screens.js';

const PORT = 4184;
const BASE = `http://localhost:${PORT}`;
if (!existsSync('dist/index.html')) { console.error('FAMILIA FAIL — dist/ ausente. Rode npm run build antes.'); process.exit(1); }

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const failures = [];
const fail = (m) => { failures.push(m); console.error('  ✗', m); };
const pass = (m) => console.log('  ✓', m);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) { try { if ((await fetch(BASE)).ok) return; } catch {} await wait(200); }
  throw new Error('servidor de preview não respondeu');
}

function unitTests() {
  console.log('Diário (lógica)');
  const store = { get: {}, getItem(k) { return this.get[k] ?? null; } };
  store.get.ab_stories_v1 = JSON.stringify({ 'o-patinho-feio': 3, borboletinha: 1 });
  store.get.ab_atelie_v1 = JSON.stringify({ visits: 2, done: { casa: 1, barco: 1 } });
  store.get.ab_cozinha_v1 = JSON.stringify({ visits: 2, made: { suco: 2, bolo: 1 } });
  store.get.ab_blocos_v1 = JSON.stringify({ visits: 1, built: { torre: 1, casa: 2 } });
  const d = buildDiary({ storage: store, progress: { sessions: { streak: 3, totalDurationMs: 600000 }, history: [] }, childName: 'Ana', now: new Date('2026-10-18T10:00:00Z') });
  const joined = d.highlights.join(' | ');
  if (d.title === 'Diário de Ana') pass('título com o nome'); else fail(`título: ${d.title}`);
  if (/2 histórias.*Patinho Feio.*3 vezes/.test(joined)) pass('conta histórias e destaca a favorita'); else fail(`histórias: ${joined}`);
  if (/2 desenhos/.test(joined)) pass('conta desenhos'); else fail(`desenhos: ${joined}`);
  if (/3 pratos/.test(joined) && /Suco/.test(joined)) pass('conta pratos pelo nome'); else fail(`pratos: ${joined}`);
  if (/3 vezes: .*Torre.*Casinha|3 vezes: .*Casinha.*Torre/.test(joined)) pass('conta construções'); else fail(`construções: ${joined}`);
  if (/3 dias seguidos/.test(joined)) pass('conta dias seguidos'); else fail(`sequência: ${joined}`);
  if (d.ideas.length >= 1 && d.text.includes('Ideias para brincar fora da tela')) pass('sugere brincadeiras fora da tela'); else fail('sem ideias');
  const empty = buildDiary({ storage: { getItem: () => null }, progress: {}, childName: '' });
  if (empty.highlights.length === 0 && empty.text.includes('Ainda está começando')) pass('diário vazio é gentil'); else fail('diário vazio estranho');
  console.log('Hoje (escolha dos jogos)');
  const picks = todayPicks('3-4y', {}, Date.parse('2026-10-18T10:00:00Z'));
  if (picks.length === 3 && new Set(picks.map((p) => p.id)).size === 3) pass(`3 jogos diferentes: ${picks.map((p) => p.id).join(', ')}`); else fail(`escolha: ${picks.map((p) => p.id)}`);
  const played = { [picks[0].id]: { lastPlayedAt: new Date().toISOString() } };
  const next = todayPicks('3-4y', played, Date.parse('2026-10-18T10:00:00Z'));
  if (next[0].id !== picks[0].id) pass('o que acabou de brincar sai do começo'); else fail('repetiu o último jogo');
  const baby = todayPicks('12-18m', {}, Date.now());
  if (baby.every((p) => p.ages.includes('12-18m'))) pass('só jogos da idade (12–18 meses)'); else fail('jogo fora da idade');
}

async function setup(context, age) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    localStorage.setItem('ab_kid_lock', 'off'); localStorage.setItem('ab_test_hook', '1');
    window.__played = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function p(...a) { try { window.__played.push(this.currentSrc || this.src); } catch (e) { /* ignora */ } return play.apply(this, a); };
  });
  await page.goto(BASE);
  if (await page.$('#setup-start')) { await page.fill('#setup-name', 'Ana'); await page.click(`[data-setup-age="${age}"]`); await page.click('#setup-start'); }
  await page.waitForSelector('[data-world]');
  await page.evaluate((a) => localStorage.setItem('aprender_brincar_child_age', a), age);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  return { page, errors };
}

async function openGate(page) {
  await page.click('#btn-settings');
  await page.waitForSelector('#gate-input');
  const text = await page.textContent('.modal-card .text-2xl');
  const m = text.match(/(\d+)\s*×\s*(\d+)/);
  await page.fill('#gate-input', String(Number(m[1]) * Number(m[2])));
  await page.click('#btn-gate-confirm');
  await page.waitForSelector('#family-diary');
}

async function homeAndDiary(context) {
  console.log('Início e diário (telas)');
  const { page, errors } = await setup(context, '3-4y');
  const tiles = await page.$$('[data-today]');
  if (tiles.length >= 1) pass(`início mostra ${tiles.length} jogos para brincar agora`); else fail('início sem jogos do dia');
  if (await page.$('.home-hero .child-mascot')) pass('mascote no início'); else fail('mascote sumiu');
  await openGate(page);
  const items = await page.$$('#family-diary .diary-list li');
  if (items.length >= 2) pass('diário aparece na Área da Família'); else fail('diário vazio na tela');
  await page.click('#btn-copy-diary');
  await page.waitForFunction(() => document.querySelector('#diary-copied')?.textContent.length > 0, null, { timeout: 4000 }).then(() => pass('botão de copiar responde'), () => fail('copiar não respondeu'));
  await page.click('#btn-save-settings');
  await page.waitForSelector('[data-today]');
  await page.click('[data-today]');
  await page.waitForFunction(() => !document.querySelector('[data-today]'), null, { timeout: 8000 }).then(() => pass('tocar num jogo do dia abre o jogo'), () => fail('o jogo do dia não abriu'));
  if (errors.length) fail(`erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('sem erros de JavaScript');
  await page.close();
}

async function voice(context) {
  console.log('Voz da família');
  const { page, errors } = await setup(context, '3-4y');
  await page.click('[data-world="discover"]');
  await page.click('[data-game="storybook"]');
  await page.waitForSelector('[data-story]');
  const storyId = await page.$eval('[data-story]', (el) => el.dataset.story);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await openGate(page);
  await page.click('#btn-family-voice');
  await page.waitForSelector('#fv-story');
  await page.selectOption('#fv-story', storyId);
  await page.waitForSelector('.fv-rec[data-page="0"]:not([disabled])');
  await page.click('.fv-rec[data-page="0"]');
  await page.waitForSelector('.fv-stop');
  await wait(1200);
  await page.click('.fv-stop');
  await page.waitForSelector('.fv-row.has[data-page="0"]', { timeout: 8000 }).then(() => pass('gravou a página 1 e ela aparece como gravada'), () => fail('a gravação não foi guardada'));
  const stored = await page.evaluate(async () => new Promise((resolve) => {
    const req = indexedDB.open('ab_family_voice', 1);
    req.onsuccess = () => { const r = req.result.transaction('clips').objectStore('clips').count(); r.onsuccess = () => resolve(r.result); r.onerror = () => resolve(-1); };
    req.onerror = () => resolve(-1);
  }));
  if (stored >= 1) pass('o áudio ficou no IndexedDB do aparelho'); else fail('nada no IndexedDB');
  await page.click('.fv-del[data-page="0"]').catch(() => {});
  await page.click('.fv-rec[data-page="0"]'); await page.waitForSelector('.fv-stop'); await wait(1000); await page.click('.fv-stop');
  await page.waitForSelector('.fv-row.has[data-page="0"]');
  await page.fill('#fv-who', 'Mamãe');
  await page.click('#fv-done');
  await page.click('#btn-save-settings');
  await page.waitForSelector('[data-world]');
  await page.evaluate(() => { window.__played = []; });
  await page.click('[data-world="discover"]');
  await page.click('[data-game="storybook"]');
  await page.click(`[data-story="${storyId}"]`);
  await page.waitForFunction(() => window.__played.some((s) => String(s).startsWith('blob:')), null, { timeout: 8000 }).then(() => pass('o leitor toca a voz da família em vez da voz padrão'), () => fail('o leitor não usou a voz da família'));
  if (errors.length) fail(`erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('sem erros de JavaScript');
  await page.close();
}

async function galleryAndBook(context) {
  console.log('Galeria e Meu Livro');
  const { page, errors } = await setup(context, '18-24m');
  await page.click('[data-world="create-move"]');
  await page.click('[data-game="blocos"]');
  await page.waitForFunction(() => window.__blocos && window.__blocos.trayNodes && Object.keys(window.__blocos.trayNodes).length, null, { timeout: 20000 });
  await wait(400);
  const box = await (await page.$('#blocos-stage')).boundingBox();
  for (let guard = 0; guard < 60; guard += 1) {
    const st = await page.evaluate(() => { const b = window.__blocos; return { done: b.finished, a: b.nextAction() }; });
    if (st.done) break;
    if (!st.a) { await wait(250); continue; }
    if (st.a.type === 'tap') { await page.mouse.click(box.x + st.a.x, box.y + st.a.y); await wait(800); }
    else { await page.mouse.move(box.x + st.a.from.x, box.y + st.a.from.y); await page.mouse.down(); await page.mouse.move(box.x + st.a.to.x, box.y + st.a.to.y, { steps: 8 }); await page.mouse.up(); await wait(800); }
  }
  await page.waitForSelector('#session-again', { timeout: 15000 });
  const count = await page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open('ab_gallery', 1);
    req.onsuccess = () => { const c = req.result.transaction('works').objectStore('works').count(); c.onsuccess = () => resolve(c.result); c.onerror = () => resolve(-1); };
    req.onerror = () => resolve(-1);
  }));
  if (count >= 1) pass('a construção virou uma foto na galeria'); else fail(`galeria vazia (${count})`);
  await page.click('#btn-home-logo'); await page.waitForSelector('[data-world]');
  await openGate(page);
  await page.waitForSelector('.gal-item', { timeout: 5000 }).then(() => pass('a foto aparece na Área da Família'), () => fail('a galeria não mostrou a foto'));
  const imgOk = await page.$eval('.gal-item img', (img) => new Promise((r) => { if (img.complete && img.naturalWidth > 0) r(true); else { img.onload = () => r(img.naturalWidth > 0); img.onerror = () => r(false); } }));
  if (imgOk) pass('a foto tem imagem de verdade'); else fail('a foto veio em branco');
  await page.click('#btn-meu-livro');
  await page.waitForSelector('.book-print .book-page');
  const pages = await page.$$eval('.book-print .book-page', (els) => els.length);
  if (pages >= 3) pass(`Meu Livro com ${pages} páginas (capa, obras e fim)`); else fail(`Meu Livro com ${pages} páginas`);
  const cover = await page.textContent('.book-cover');
  if (/Meu Livro/.test(cover) && /Ana/.test(cover)) pass('a capa leva o nome da criança'); else fail('capa sem o nome');
  await page.click('#book-close');
  if (!(await page.$('.book-print'))) pass('o livro fecha'); else fail('o livro não fechou');
  if (errors.length) fail(`erros de JavaScript: ${errors.slice(0, 2).join(' | ')}`); else pass('sem erros de JavaScript');
  await page.close();
}

try {
  unitTests();
  await waitForServer();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const context = await browser.newContext({ viewport: { width: 420, height: 860 }, serviceWorkers: 'block', permissions: ['microphone'] });
  await homeAndDiary(context);
  await voice(context);
  await galleryAndBook(context);
  await browser.close();
} catch (error) {
  fail(`falha inesperada: ${error.message}`);
} finally {
  server.kill();
}
if (failures.length) { console.error(`\nFAMILIA FAIL — ${failures.length} problema(s)`); process.exit(1); }
console.log('\nFAMILIA OK — início com jogos do dia, diário da família e voz da família funcionando.');
