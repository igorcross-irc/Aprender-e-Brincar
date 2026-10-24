import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { BAND, noteFor } from './studio-data.js';

// Estúdio no modo lite: os mesmos bichos e instrumentos, em HTML/CSS (aparelhos antigos, sem WebGL ou com pouca memória).
export class StudioLiteGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
    this.taps = 0;
    this.index = 0;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = options.plan;
    this.free = this.plan.mode === 'free';
    this.band = BAND.slice(0, this.free ? this.plan.animals : 4);
    this.steps = this.free ? 0 : this.plan.steps;
    this.grid = this.band.map(() => Array.from({ length: this.steps }, () => false));
    this.step = -1;
    this.loops = 0;
    this.playing = false;
    const animals = this.band.map((b, i) => `<button class="studio-lite-animal" data-r="${i}" aria-label="${b.label}" style="--c:${b.css}"><span aria-hidden="true">${b.icon}</span></button>`).join('');
    const rows = this.free ? '' : `<div class="studio-lite-grid">${this.band.map((b, r) => `<div class="studio-lite-row">${Array.from({ length: this.steps }, (_, c) => `<button class="studio-lite-cell" data-r="${r}" data-c="${c}" aria-label="${b.label} ${c + 1}" style="--c:${b.css}"></button>`).join('')}</div>`).join('')}<div class="studio-lite-tools"><button class="studio-lite-play" id="studio-lite-play" aria-label="Tocar">▶</button><button class="studio-lite-clear" id="studio-lite-clear" aria-label="Limpar">✕</button></div></div>`;
    this.container.innerHTML = gameShellMarkup({
      backId: 'studio-back',
      title: '🎶 Estúdio dos Bichos',
      body: `<div class="studio-lite" id="studio-lite"><div class="studio-lite-band ${this.free ? 'free' : ''}">${animals}</div>${rows}</div>`
    });
    this.root = this.container.querySelector('#studio-lite');
    this.container.querySelector('#studio-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.root.querySelectorAll('.studio-lite-animal').forEach((el) => el.addEventListener('click', () => this.touchAnimal(Number(el.dataset.r), el)));
    this.root.querySelectorAll('.studio-lite-cell').forEach((el) => el.addEventListener('click', () => this.toggle(Number(el.dataset.r), Number(el.dataset.c), el)));
    const play = this.container.querySelector('#studio-lite-play');
    if (play) play.addEventListener('click', () => this.togglePlay(play));
    const clear = this.container.querySelector('#studio-lite-clear');
    if (clear) clear.addEventListener('click', () => this.clearAll());
    this.audio?.prompt?.(null, this.free ? 'Vamos fazer música! Toque nos bichinhos.' : 'Vamos fazer uma música! Toque nos quadradinhos e depois no botão de tocar.');
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  sound(r, index) {
    const def = this.band[r];
    playInstrument(def.kind, def.kind === 'xylo' || def.kind === 'bell' ? noteFor(def.kind, index) : 0, 1);
  }

  bounce(el) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }

  touchAnimal(r, el) {
    if (this.finished) return;
    this.sound(r, this.free ? this.index : Math.max(this.step, 0));
    this.bounce(el);
    if (!this.free) return;
    this.index += 1;
    this.taps += 1;
    if (this.taps === 1 || this.taps <= this.band.length) this.audio?.play?.(null, this.band[r].label);
    if (this.taps >= this.plan.target) this.finish();
  }

  toggle(r, c, el) {
    if (this.finished) return;
    this.grid[r][c] = !this.grid[r][c];
    el.classList.toggle('on', this.grid[r][c]);
    if (this.grid[r][c]) { this.sound(r, c); this.bounce(this.root.querySelectorAll('.studio-lite-animal')[r]); } else playSfx('tap');
  }

  count() { return this.grid.reduce((n, row) => n + row.filter(Boolean).length, 0); }

  clearAll() {
    this.grid.forEach((row, r) => row.forEach((_, c) => { this.grid[r][c] = false; }));
    this.root.querySelectorAll('.studio-lite-cell').forEach((el) => el.classList.remove('on'));
    this.loops = 0;
  }

  togglePlay(button) {
    if (this.finished) return;
    this.playing = !this.playing;
    button.textContent = this.playing ? '❚❚' : '▶';
    window.clearTimeout(this.tick);
    this.step = -1;
    if (this.playing) this.schedule();
  }

  schedule() {
    this.tick = this.later(() => {
      if (!this.playing || this.finished) return;
      this.step = (this.step + 1) % this.steps;
      this.root.querySelectorAll('.studio-lite-cell').forEach((el) => el.classList.toggle('now', Number(el.dataset.c) === this.step));
      this.band.forEach((b, r) => { if (this.grid[r][this.step]) { this.sound(r, this.step); this.bounce(this.root.querySelectorAll('.studio-lite-animal')[r]); } });
      if (this.step === this.steps - 1) {
        this.loops += 1;
        if (this.loops >= this.plan.loops && this.count() >= this.plan.minNotes) { this.finish(); return; }
      }
      this.schedule();
    }, this.plan.stepSeconds * 1000);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.playing = false;
    playSfx('celebrate');
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Que música linda!');
    const score = this.free ? this.taps : this.count();
    this.later(() => this.onComplete?.({ mode: 'explore', score, rounds: 1, correct: score, attempts: score, maxScore: this.free ? this.plan.target : this.plan.minNotes, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId }), 3200);
  }

  stop() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}
