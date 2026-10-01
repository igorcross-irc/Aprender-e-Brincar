import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';

// Bolhas com animais sobem pela tela; cada toque estoura uma bolha e diz o nome do animal.
export class BubblesGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timer = null;
  }

  start(items = [], level = 1, options = {}) {
    this.items = items.length ? items : [{ id: 'estrela', label: 'Estrela', icon: '⭐' }];
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.target = Math.max(6, this.difficulty.rounds * 2);
    this.popped = 0;
    this.finished = false;
    this.static = prefersReducedMotion();
    this.container.innerHTML = gameShellMarkup({
      backId: 'bubbles-back',
      title: '🫧 Bolhas',
      body: `<div class="bubble-sky" id="bubble-sky" aria-label="Toque nas bolhas"></div>
             <div class="bubble-meter" aria-hidden="true"><span id="bubble-fill" style="width:0%"></span></div>`
    });
    this.sky = this.container.querySelector('#bubble-sky');
    this.container.querySelector('#bubbles-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.audio?.prompt?.(null, 'Estoure as bolhas!');
    const initial = this.static ? 5 : 3;
    for (let i = 0; i < initial; i += 1) this.spawn();
    if (!this.static) this.timer = window.setInterval(() => this.tick(), 900);
  }

  tick() {
    if (!this.container.contains(this.sky)) return this.stop();
    if (this.sky.querySelectorAll('.bubble:not(.popping)').length < 6) this.spawn();
  }

  spawn() {
    if (this.finished) return;
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const bubble = document.createElement('button');
    bubble.className = 'bubble';
    bubble.dataset.noTap = '';
    bubble.setAttribute('aria-label', `Bolha com ${item.label}`);
    bubble.innerHTML = `<span aria-hidden="true">${item.icon}</span>`;
    const size = 84 + Math.round(Math.random() * 36);
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.round(Math.random() * 78)}%`;
    if (this.static) bubble.style.top = `${10 + Math.round(Math.random() * 60)}%`;
    else {
      bubble.style.animationDuration = `${6 + Math.random() * 3}s`;
      bubble.addEventListener('animationend', () => bubble.remove());
    }
    bubble.addEventListener('pointerdown', () => this.pop(bubble, item), { once: true });
    this.sky.appendChild(bubble);
  }

  pop(bubble, item) {
    if (this.finished) return;
    bubble.classList.add('popping');
    playSfx('pop');
    this.audio?.play(item.audio, item.label);
    window.setTimeout(() => bubble.remove(), 260);
    this.popped += 1;
    const fill = this.container.querySelector('#bubble-fill');
    if (fill) fill.style.width = `${Math.min(100, (this.popped / this.target) * 100)}%`;
    if (this.popped >= this.target) return this.finish();
    if (this.static) window.setTimeout(() => this.spawn(), 200);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.stop();
    window.setTimeout(() => this.onComplete?.({ mode: 'explore', score: this.popped, rounds: 1, correct: 0, attempts: 0, maxScore: this.target, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId }), 500);
  }
}
