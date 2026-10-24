import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

// Fazendinha no modo lite: mesma ideia (levar a comida a cada bicho, até a noite chegar),
// só com HTML/CSS e um toque por comida. Roda em aparelhos antigos (iOS 9, Android 5) e sem WebGL.
const ROSTER = [
  { id: 'vaca', food: '🌾', foodName: 'feno' },
  { id: 'galinha', food: '🌽', foodName: 'milho' },
  { id: 'cachorro', food: '🍖', foodName: 'osso' },
  { id: 'gato', food: '🐟', foodName: 'peixe' },
  { id: 'pato', food: '🍃', foodName: 'folhas' }
];
const COUNT_BY_AGE = { '6-12m': 2, '12-18m': 2, '18-24m': 3, '2-3y': 3, '3-4y': 3, '4-5y': 4 };

export class FarmLiteGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
  }

  start(items = [], level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    const byId = (id) => (items || []).find((it) => it.id === id) || { id, label: id, icon: '🐾' };
    const count = COUNT_BY_AGE[this.ageId] || 3;
    this.animals = ROSTER.slice().sort(() => Math.random() - 0.5).slice(0, count).map((r) => ({ ...r, item: byId(r.id), fed: false }));
    this.fed = 0;
    this.container.innerHTML = gameShellMarkup({
      backId: 'farm-back',
      title: '🌾 Fazendinha',
      body: `<div class="farm-lite" id="farm-lite">
        <div class="farm-lite-sky" aria-hidden="true"><span class="farm-lite-sun">☀️</span><span class="farm-lite-cloud c1">☁️</span><span class="farm-lite-cloud c2">☁️</span><span class="farm-lite-moon">🌙</span></div>
        <div class="farm-lite-field">${this.animals.map((a, i) => `<div class="farm-lite-animal" data-animal="${i}" role="img" aria-label="${a.item.label}"><span class="farm-lite-want" aria-hidden="true">${a.food}</span><span class="farm-lite-body" aria-hidden="true">${a.item.icon}</span></div>`).join('')}</div>
        <div class="farm-lite-shelf">${this.animals.map((a, i) => `<button class="farm-lite-food" data-food="${i}" aria-label="Dar ${a.foodName} para ${a.item.label}"><span aria-hidden="true">${a.food}</span></button>`).join('')}</div>
      </div>`
    });
    this.root = this.container.querySelector('#farm-lite');
    this.container.querySelector('#farm-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.root.querySelectorAll('[data-food]').forEach((btn) => btn.addEventListener('click', () => this.feed(Number(btn.dataset.food), btn)));
    this.root.querySelectorAll('[data-animal]').forEach((el) => el.addEventListener('click', () => { playSfx('pop'); const a = this.animals[Number(el.dataset.animal)]; this.audio?.play?.(a.item.audio || null, a.item.label); this.bounce(el); }));
    this.audio?.prompt?.(null, 'Os bichinhos estão com fome! Toque na comida de cada um.');
  }

  bounce(el) { el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce'); }

  later(fn, ms) { this.timers.push(window.setTimeout(fn, ms)); }

  feed(index, btn) {
    const animal = this.animals[index];
    if (!animal || animal.fed || this.finished) return;
    animal.fed = true;
    this.fed += 1;
    const el = this.root.querySelector(`[data-animal="${index}"]`);
    const from = btn.getBoundingClientRect();
    const to = el.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 3 - (from.top + from.height / 2);
    btn.disabled = true;
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(.4)`;
    btn.style.opacity = '0.2';
    playSfx('tap');
    this.later(() => { btn.style.visibility = 'hidden'; }, 460);
    this.later(() => {
      playSfx('success');
      el.classList.add('fed');
      this.bounce(el);
      el.querySelector('.farm-lite-want').textContent = '❤️';
      this.audio?.play?.(animal.item.audio || null, animal.item.label);
    }, 420);
    if (this.fed >= this.animals.length) this.later(() => this.goodNight(), 2200);
  }

  goodNight() {
    if (this.finished) return;
    this.finished = true;
    this.root.classList.add('night');
    this.root.querySelectorAll('.farm-lite-want').forEach((w) => { w.textContent = '💤'; });
    playSfx('celebrate');
    this.audio?.play?.('boa-noite-ate-amanha.mp3', 'Boa noite, até amanhã!');
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.fed, rounds: 1, correct: this.fed, attempts: this.fed, maxScore: this.animals.length, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId }), 4600);
  }

  stop() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}
