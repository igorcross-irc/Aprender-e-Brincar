import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { COLORS, toCss } from './atelie-data.js';

// Ateliê no modo lite: o mesmo desenho em SVG puro (aparelhos antigos, sem WebGL ou com pouca memória).
// Ao pintar o bastante o desenho inteiro dança e toca a música (sem os movimentos por partes do modo completo).
export class AtelieLiteGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
    this.alive = false;
    this.painted = {};
    this.count = 0;
    this.current = 0;
    this.nextColor = 0;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = options.plan;
    this.page = options.page;
    this.palette = COLORS.slice(0, this.plan.colors);
    this.regions = this.page.items.filter((i) => i.paint);
    const shapes = this.page.items.map((it) => {
      if (it.line) return `<path d="${it.d}" fill="none" stroke="${toCss(it.color)}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>`;
      if (!it.paint) return `<path d="${it.d}" fill="${toCss(it.fill)}" fill-opacity="${it.alpha == null ? 1 : it.alpha}" stroke="#2a1b3d" stroke-width="5" stroke-linejoin="round" pointer-events="none"/>`;
      return `<path class="atelie-lite-region" data-id="${it.id}" d="${it.d}" fill="#fff8ea" stroke="#2a1b3d" stroke-width="5" stroke-linejoin="round"/>`;
    }).join('');
    const pots = this.plan.auto
      ? `<span class="atelie-lite-next" id="atelie-lite-next" style="background:${this.palette[0].css}" aria-hidden="true"></span>`
      : this.palette.map((c, i) => `<button class="atelie-lite-pot${i === 0 ? ' on' : ''}" data-i="${i}" aria-label="${c.label}" style="background:${c.css}"></button>`).join('');
    this.container.innerHTML = gameShellMarkup({
      backId: 'atelie-back',
      title: '🎨 Ateliê Mágico',
      body: `<div class="atelie-lite" id="atelie-lite"><div class="atelie-lite-board" id="atelie-lite-board"><svg viewBox="0 0 400 400" role="img" aria-label="${this.page.title}: toque para pintar">${shapes}</svg></div><div class="atelie-lite-palette">${pots}</div></div>`
    });
    this.root = this.container.querySelector('#atelie-lite');
    this.board = this.container.querySelector('#atelie-lite-board');
    this.container.querySelector('#atelie-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.root.querySelectorAll('.atelie-lite-region').forEach((el) => el.addEventListener('click', () => this.paint(el)));
    this.root.querySelectorAll('.atelie-lite-pot').forEach((el) => el.addEventListener('click', () => this.pick(Number(el.dataset.i))));
    this.audio?.prompt?.(null, this.plan.auto ? 'Vamos pintar! Toque no desenho.' : 'Vamos pintar! Escolha uma cor e toque no desenho.');
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  pick(i) {
    this.current = i;
    this.root.querySelectorAll('.atelie-lite-pot').forEach((el, k) => { el.className = `atelie-lite-pot${k === i ? ' on' : ''}`; });
    playInstrument('xylo', this.palette[i].note, 0.8);
  }

  paint(el) {
    if (this.finished) return;
    const color = this.plan.auto ? this.palette[this.nextColor % this.palette.length] : this.palette[this.current];
    if (this.plan.auto) { this.nextColor += 1; const next = this.container.querySelector('#atelie-lite-next'); if (next) next.style.background = this.palette[this.nextColor % this.palette.length].css; }
    el.setAttribute('fill', color.css);
    playInstrument('xylo', color.note, 0.9);
    const id = el.getAttribute('data-id');
    if (!this.painted[id]) {
      this.painted[id] = true;
      this.count += 1;
      if (!this.alive && this.count >= Math.ceil(this.regions.length * this.plan.share)) this.later(() => this.makeAlive(), 700);
    }
  }

  makeAlive() {
    if (this.alive) return;
    this.alive = true;
    this.board.className += ' alive';
    playSfx('celebrate');
    this.audio?.prompt?.(null, 'Olha! O seu desenho ganhou vida!');
    [0, 2, 4, 3, 5, 4, 2, 0].forEach((t, i) => this.later(() => playInstrument(i % 4 === 3 ? 'bell' : 'xylo', COLORS[t].note, 0.9), i * 340));
    this.later(() => this.finish(), 6000);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Que desenho lindo!');
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.count, rounds: 1, correct: this.count, attempts: this.count, maxScore: this.regions.length, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId }), 1400);
  }

  stop() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}
