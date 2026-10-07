import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { stories, storyById } from '../../../content/stories/index.js';
import { STORY_ART, STORY_AUDIO } from '../../../content/stories/available.js';

// Hora da Historinha: estante de capas e livro ilustrado narrado.
// Funciona em HTML/CSS puro (serve também para aparelhos antigos). A narração é um MP3 por página quando existir
// (public/assets/stories/<id>/p<N>.mp3); sem MP3 usa a voz do navegador.
const TEXT_BY_DEFAULT = new Set(['2-3y', '3-4y', '4-5y']);
const BASE = '/assets/stories/';
const READ_KEY = 'ab_stories_v1';

function loadRead() {
  try { const v = JSON.parse(localStorage.getItem(READ_KEY) || 'null'); if (v && typeof v === 'object') return v; } catch (error) { /* sem armazenamento */ }
  return {};
}
function saveRead(read) { try { localStorage.setItem(READ_KEY, JSON.stringify(read)); } catch (error) { /* sem armazenamento */ } }

const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Histórias da faixa que já têm ilustração; se faltarem, completa com as da faixa vizinha mais próxima.
export function shelfFor(ageId) {
  const ready = (s) => STORY_ART[s.id] === s.pages.length;
  const own = stories.filter((s) => s.ages.includes(ageId) && ready(s));
  if (own.length >= 5) return own;
  const order = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
  const at = order.indexOf(ageId);
  const others = stories.filter((s) => ready(s) && !s.ages.includes(ageId)).sort((a, b) => Math.abs(order.indexOf(a.ages[0]) - at) - Math.abs(order.indexOf(b.ages[0]) - at));
  return [...own, ...others.slice(0, 5 - own.length)];
}

export class StorybookGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.sound = null;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = options.age || {};
    this.read = loadRead();
    this.showText = TEXT_BY_DEFAULT.has(this.ageId);
    this.auto = false;
    this.renderShelf();
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  // ---------- estante ----------
  renderShelf() {
    this.stopSound();
    const shelf = shelfFor(this.ageId);
    this.container.innerHTML = gameShellMarkup({
      backId: 'story-back',
      title: '📖 Hora da Historinha',
      body: `<div class="story-shelf">${shelf.map((s) => `<button class="story-cover" data-story="${s.id}" aria-label="${esc(s.title)}"><img src="${BASE}${s.id}/p1.jpg" alt="" draggable="false" /><span class="story-cover-title">${esc(s.title)}</span>${this.read[s.id] ? '<span class="story-cover-star" aria-hidden="true">⭐</span>' : ''}</button>`).join('')}</div>`
    });
    this.container.querySelector('#story-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.container.querySelectorAll('[data-story]').forEach((btn) => btn.addEventListener('click', () => { playSfx('tap'); this.openBook(btn.dataset.story); }));
    this.audio?.prompt?.(null, 'Qual historinha você quer ouvir?');
  }

  // ---------- livro ----------
  openBook(id) {
    this.story = storyById(id);
    this.page = 0;
    this.finished = false;
    const total = this.story.pages.length;
    this.container.innerHTML = gameShellMarkup({
      backId: 'story-back',
      title: `📖 ${esc(this.story.title)}`,
      body: `<div class="storybook" id="storybook">
        <div class="sb-page" id="sb-page"><img class="sb-img" id="sb-img" alt="" draggable="false" /></div>
        <p class="sb-text" id="sb-text"></p>
        <div class="sb-nav">
          <button class="sb-arrow sb-prev" id="sb-prev" aria-label="Página anterior"><span></span></button>
          <div class="sb-dots" aria-hidden="true">${Array.from({ length: total + 1 }, () => '<i></i>').join('')}</div>
          <button class="sb-arrow sb-next" id="sb-next" aria-label="Próxima página"><span></span></button>
        </div>
        <div class="sb-tools">
          <button class="sb-tool" id="sb-replay" aria-label="Ouvir de novo">🔊</button>
          <button class="sb-tool" id="sb-text-toggle" aria-label="Mostrar ou esconder o texto">Aa</button>
          <button class="sb-tool" id="sb-auto" aria-label="Virar as páginas sozinho">Auto</button>
        </div>
      </div>`
    });
    const q = (sel) => this.container.querySelector(sel);
    q('#story-back').addEventListener('click', () => { this.stopSound(); this.renderShelf(); });
    q('#sb-next').addEventListener('click', () => this.go(1));
    q('#sb-prev').addEventListener('click', () => this.go(-1));
    q('#sb-replay').addEventListener('click', () => this.narrate());
    q('#sb-page').addEventListener('click', () => this.narrate());
    q('#sb-text-toggle').addEventListener('click', () => { this.showText = !this.showText; this.paint(); });
    q('#sb-auto').addEventListener('click', () => { this.auto = !this.auto; q('#sb-auto').classList.toggle('on', this.auto); if (this.auto) this.narrate(); });
    let startX = null;
    const page = q('#sb-page');
    page.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
    page.addEventListener('touchend', (e) => { if (startX == null) return; const dx = e.changedTouches[0].clientX - startX; startX = null; if (Math.abs(dx) > 45) this.go(dx < 0 ? 1 : -1); }, { passive: true });
    this.paint(true);
  }

  go(step) {
    if (this.finished) return;
    const total = this.story.pages.length;
    const next = this.page + step;
    if (next < 0) return;
    this.clearTimers();
    if (next > total) return this.finish();
    this.page = next;
    playSfx('tap');
    this.paint(true);
  }

  paint(speak = false) {
    const total = this.story.pages.length;
    const img = this.container.querySelector('#sb-img');
    const text = this.container.querySelector('#sb-text');
    const isEnd = this.page === total;
    const src = `${BASE}${this.story.id}/p${isEnd ? 1 : this.page + 1}.jpg`;
    if (!img.src.endsWith(src)) {
      img.classList.remove('turn'); void img.offsetWidth; img.classList.add('turn');
      img.src = src;
    }
    text.hidden = !this.showText;
    text.textContent = isEnd ? `Fim · ${this.story.credit}` : this.story.pages[this.page][0];
    text.classList.toggle('sb-credit', isEnd);
    this.container.querySelectorAll('.sb-dots i').forEach((dot, i) => { dot.className = i < this.page ? 'done' : i === this.page ? 'current' : ''; });
    this.container.querySelector('#sb-prev').style.visibility = this.page === 0 ? 'hidden' : 'visible';
    this.container.querySelector('#sb-next').classList.remove('pulse');
    if (speak) this.narrate();
  }

  stopSound() {
    this.clearTimers();
    if (this.sound) { try { this.sound.pause(); } catch (error) { /* ignora */ } this.sound = null; }
    try { window.speechSynthesis?.cancel(); } catch (error) { /* ignora */ }
  }

  clearTimers() { this.timers.forEach((t) => window.clearTimeout(t)); this.timers = []; }

  narrate() {
    this.clearTimers();
    if (this.sound) { try { this.sound.pause(); } catch (error) { /* ignora */ } this.sound = null; }
    const total = this.story.pages.length;
    const isEnd = this.page === total;
    const done = () => {
      const next = this.container.querySelector('#sb-next');
      next?.classList.add('pulse');
      if (this.auto && !this.finished) this.later(() => this.go(1), isEnd ? 600 : 1400);
    };
    if (this.audio?.isMuted) return this.later(done, 2200);
    if (isEnd) return this.later(done, 900);
    const text = this.story.pages[this.page][0];
    const hasMp3 = (STORY_AUDIO[this.story.id] || '')[this.page] === '1';
    if (hasMp3) {
      try {
        const sound = new Audio(`${BASE}${this.story.id}/p${this.page + 1}.mp3`);
        this.sound = sound;
        sound.onended = done;
        sound.onerror = () => this.speak(text, done);
        const p = sound.play();
        if (p && p.catch) p.catch(() => this.later(done, 2500));
        return undefined;
      } catch (error) { /* cai para a voz do navegador */ }
    }
    return this.speak(text, done);
  }

  speak(text, done) {
    this.audio?.speak?.(text);
    // A voz do navegador não avisa o fim de forma confiável: estima pelo tamanho do texto.
    this.later(done, Math.max(2200, text.length * 85));
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.stopSound();
    this.read[this.story.id] = (this.read[this.story.id] || 0) + 1;
    saveRead(this.read);
    playSfx('celebrate');
    this.later(() => this.onComplete?.({ mode: 'explore', score: 1, rounds: 1, correct: 1, attempts: 1, maxScore: 1, completedRounds: 1, difficulty: this.difficulty.level || 1, ageId: this.ageId }), 500);
  }

  stop() {
    this.stopSound();
  }
}
