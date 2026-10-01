import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { withArticle } from '../../../core/pt-grammar.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

// Conjuntos de "onde vai?": um objeto aparece e a criança toca no lugar certo (sem arrastar).
export const SORT_SETS = {
  colors: {
    title: '🧺 Separar por Cor',
    prompt: (item, hint) => `Onde vai ${withArticle(item.label)}?${hint ? ` No cesto ${item.binLabel}!` : ''}`,
    bins: [
      { key: 'vermelho', label: 'vermelho', color: '#ef4444' },
      { key: 'amarelo', label: 'amarelo', color: '#facc15' },
      { key: 'azul', label: 'azul', color: '#3b82f6' },
      { key: 'verde', label: 'verde', color: '#22c55e' }
    ],
    items: [
      { icon: '🍎', label: 'Maçã', bin: 'vermelho' }, { icon: '🍓', label: 'Morango', bin: 'vermelho' }, { icon: '🚒', label: 'Caminhão', bin: 'vermelho' },
      { icon: '🍌', label: 'Banana', bin: 'amarelo' }, { icon: '🐤', label: 'Pintinho', bin: 'amarelo' }, { icon: '🌻', label: 'Girassol', bin: 'amarelo' },
      { icon: '🐳', label: 'Baleia', bin: 'azul' }, { icon: '🫐', label: 'Mirtilo', bin: 'azul' }, { icon: '🧢', label: 'Boné', bin: 'azul' },
      { icon: '🐸', label: 'Sapo', bin: 'verde' }, { icon: '🥦', label: 'Brócolis', bin: 'verde' }, { icon: '🍀', label: 'Trevo', bin: 'verde' }
    ]
  },
  shapes: {
    title: '🔷 Encaixe as Formas',
    prompt: (item) => `Onde encaixa ${withArticle(item.label)}?`,
    bins: [
      { key: 'circulo', label: 'círculo', shape: '🔴' },
      { key: 'quadrado', label: 'quadrado', shape: '🟦' },
      { key: 'triangulo', label: 'triângulo', shape: '🔺' },
      { key: 'estrela', label: 'estrela', shape: '⭐' },
      { key: 'coracao', label: 'coração', shape: '💜' }
    ],
    items: [
      { icon: '🔴', label: 'Círculo', bin: 'circulo' }, { icon: '🟦', label: 'Quadrado', bin: 'quadrado' },
      { icon: '🔺', label: 'Triângulo', bin: 'triangulo' }, { icon: '⭐', label: 'Estrela', bin: 'estrela' }, { icon: '💜', label: 'Coração', bin: 'coracao' }
    ]
  }
};

const BINS_BY_AGE = { '12-18m': 2, '18-24m': 2, '2-3y': 3, '3-4y': 4, '4-5y': 5 };

export class SortIntoGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timer = null;
  }

  // items aqui é o nome do conjunto ("colors" ou "shapes").
  start(setName = 'colors', level = 1, options = {}) {
    this.set = SORT_SETS[setName] || SORT_SETS.colors;
    this.setName = setName;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.rounds = this.difficulty.rounds;
    this.round = 0;
    this.finished = false;
    this.lastItem = null;
    this.render();
  }

  render() {
    if (this.round >= this.rounds) return this.finish();
    const count = Math.min(this.set.bins.length, BINS_BY_AGE[this.ageId] || 3);
    const bins = [...this.set.bins].sort(() => Math.random() - 0.5).slice(0, count);
    const candidates = this.set.items.filter((item) => bins.some((bin) => bin.key === item.bin) && item !== this.lastItem);
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastItem = item;
    const binLabel = bins.find((bin) => bin.key === item.bin).label;
    this.container.innerHTML = gameShellMarkup({
      backId: 'sort-back',
      title: this.set.title,
      round: this.round,
      rounds: this.rounds,
      body: `
        <div class="sort-item" aria-label="${item.label}"><span aria-hidden="true">${item.icon}</span></div>
        <div class="sort-bins sort-${this.setName}" style="--bins:${bins.length}">${bins.map((bin) => `
          <button class="sort-bin" data-bin="${bin.key}" aria-label="${this.setName === 'colors' ? `Cesto ${bin.label}` : `Buraco do ${bin.label}`}" ${bin.color ? `style="--bin:${bin.color}"` : ''}>
            ${bin.color ? '<span class="sort-basket" aria-hidden="true">🧺</span>' : `<span class="sort-hole" aria-hidden="true">${bin.shape}</span>`}
          </button>`).join('')}</div>`
    });
    this.container.querySelector('#sort-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    // Até 3 anos a voz dá a pista da cor; depois a criança descobre sozinha.
    this.audio?.prompt?.(null, this.set.prompt({ ...item, binLabel }, ['12-18m', '18-24m', '2-3y'].includes(this.ageId)));
    let done = false;
    this.container.querySelectorAll('.sort-bin').forEach((button) => button.addEventListener('click', () => {
      if (done) return;
      if (button.dataset.bin !== item.bin) {
        playSfx('retry');
        button.classList.add('animate-shake');
        this.audio?.play(null, 'Ops, tente de novo!');
        window.setTimeout(() => button.classList.remove('animate-shake'), 450);
        return;
      }
      done = true;
      playSfx('success');
      button.classList.add('filled');
      button.insertAdjacentHTML('beforeend', `<span class="sort-dropped" aria-hidden="true">${item.icon}</span>`);
      this.container.querySelector('.sort-item')?.classList.add('gone');
      this.audio?.play(null, 'Muito bem!');
      this.round += 1;
      this.timer = window.setTimeout(() => { if (this.container.querySelector('.sort-bins')) this.render(); }, 1300);
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
