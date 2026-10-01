import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

const NUMBER_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const MAX_BY_AGE = { '6-12m': 2, '12-18m': 3, '18-24m': 3, '2-3y': 5, '3-4y': 7, '4-5y': 10 };

// Contar tocando: cada objeto tocado recebe um número falado em voz alta (correspondência um a um).
export class CountTapGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
  }

  start(items = [], level = 1, options = {}) {
    this.items = items;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.rounds = this.difficulty.rounds;
    this.round = 0;
    this.finished = false;
    this.lastCount = 0;
    this.render();
  }

  pickCount() {
    const max = MAX_BY_AGE[this.ageId] || 5;
    let count = 1 + Math.floor(Math.random() * max);
    if (count === this.lastCount && max > 1) count = (count % max) + 1;
    this.lastCount = count;
    return count;
  }

  render() {
    if (this.round >= this.rounds) return this.finish();
    const item = this.items[Math.floor(Math.random() * this.items.length)] || { label: 'Estrela', plural: 'estrelas', icon: '⭐' };
    const count = this.pickCount();
    let counted = 0;
    this.container.innerHTML = gameShellMarkup({
      backId: 'count-back',
      title: '👆 Contar Tocando',
      round: this.round,
      rounds: this.rounds,
      body: `<div class="count-board">${Array.from({ length: count }, (_, index) => `<button class="count-item" data-index="${index}" aria-label="${item.label}"><span aria-hidden="true">${item.icon}</span></button>`).join('')}</div>`
    });
    this.container.querySelector('#count-back').addEventListener('click', () => this.onBack());
    this.audio?.prompt?.(null, 'Vamos contar juntos!');
    this.container.querySelectorAll('.count-item').forEach((button) => button.addEventListener('click', () => {
      if (button.classList.contains('counted') || this.finished) return;
      counted += 1;
      button.classList.add('counted');
      button.insertAdjacentHTML('beforeend', `<b class="count-badge">${counted}</b>`);
      // num-N.mp3 já existe no lote gravado; a palavra é o texto alternativo.
      this.audio?.play(`num-${counted}`, NUMBER_WORDS[counted] || String(counted));
      if (counted < count) return;
      playSfx('success');
      window.setTimeout(() => this.audio?.play(null, `${NUMBER_WORDS[count] || count}! Muito bem!`), 700);
      this.round += 1;
      window.setTimeout(() => { if (this.container.querySelector('.count-board')) this.render(); }, 2000);
    }));
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.onComplete?.({ mode: 'explore', score: this.rounds, rounds: this.rounds, correct: this.rounds, attempts: this.rounds, maxScore: this.rounds, completedRounds: this.rounds, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
