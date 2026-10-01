import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { withArticle } from '../../../core/pt-grammar.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

const HIDING_SPOTS = ['🌳', '🌷', '📦', '🪴', '☁️'];
const SPOTS_BY_AGE = { '6-12m': 1, '12-18m': 2, '18-24m': 2, '2-3y': 3, '3-4y': 4, '4-5y': 5 };

// Esconde-esconde: um animal se esconde atrás de um dos esconderijos; a criança toca para encontrar.
export class PeekabooGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timer = null;
  }

  start(items = [], level = 1, options = {}) {
    this.items = items;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.rounds = this.difficulty.rounds;
    this.round = 0;
    this.finished = false;
    this.render();
  }

  render() {
    if (this.round >= this.rounds) return this.finish();
    const animal = this.items[Math.floor(Math.random() * this.items.length)] || { label: 'Gato', icon: '🐱' };
    const spots = Math.max(1, SPOTS_BY_AGE[this.ageId] || 3);
    const hideAt = Math.floor(Math.random() * spots);
    const covers = [...HIDING_SPOTS].sort(() => Math.random() - 0.5).slice(0, spots);
    let found = false;
    this.container.innerHTML = gameShellMarkup({
      backId: 'peek-back',
      title: '🙈 Esconde-esconde',
      round: this.round,
      rounds: this.rounds,
      body: `<div class="peek-field" style="--spots:${spots}">${covers.map((cover, index) => `
        <button class="peek-spot" data-spot="${index}" aria-label="Esconderijo ${index + 1}">
          <span class="peek-animal" aria-hidden="true">${index === hideAt ? animal.icon : ''}</span>
          <span class="peek-cover" aria-hidden="true">${cover}</span>
        </button>`).join('')}</div>`
    });
    this.container.querySelector('#peek-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.audio?.prompt?.(null, spots === 1 ? `Cadê ${withArticle(animal.label)}? Toque para achar!` : `Cadê ${withArticle(animal.label)}? Onde se escondeu?`);

    this.container.querySelectorAll('.peek-spot').forEach((button) => button.addEventListener('click', () => {
      if (found || button.classList.contains('open')) return;
      button.classList.add('open');
      if (Number(button.dataset.spot) !== hideAt) {
        playSfx('retry');
        this.audio?.play(null, 'Hum, vamos procurar de novo!');
        this.timer = window.setTimeout(() => button.classList.remove('open'), 1200);
        return;
      }
      found = true;
      playSfx('success');
      this.audio?.play(animal.audio, `Achou! ${animal.sound || animal.label}`);
      this.round += 1;
      this.timer = window.setTimeout(() => { if (this.container.querySelector('.peek-field')) this.render(); }, 1800);
    }));
  }

  stop() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.onComplete?.({ mode: 'explore', score: this.rounds, rounds: this.rounds, correct: this.rounds, attempts: this.rounds, maxScore: this.rounds, completedRounds: this.rounds, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
