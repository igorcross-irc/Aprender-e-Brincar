import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { PIECES, slotOrder } from './blocos-data.js';

// Torre de Blocos no modo lite: as peças viram blocos de CSS que se empilham em uma coluna (aparelhos antigos).
// Modo livre: empilha até a meta e toca o sino para derrubar. Modelos: a figura mostra a ordem, de baixo para cima.
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const pieceHtml = (id, extra = '') => `<span class="blocos-lite-piece p-${id}${extra}" style="background:${hex(PIECES[id].color)}" aria-hidden="true"></span>`;

export class BlocosLiteGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
    this.completed = 0;
    this.placed = [];
    this.modelIndex = 0;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = options.plan;
    this.models = options.models || [];
    this.save = options.save || { visits: 1, built: {} };
    this.container.innerHTML = gameShellMarkup({
      backId: 'blocos-back',
      title: '🧱 Torre de Blocos',
      body: '<div class="blocos-lite" id="blocos-lite"></div>'
    });
    this.root = this.container.querySelector('#blocos-lite');
    this.container.querySelector('#blocos-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.model = this.models[0] || null;
    this.order = this.model ? slotOrder(this.model) : [];
    this.trayIds = this.model ? [...new Set(this.models.flatMap((m) => m.slots.map((s) => s.piece)))] : this.plan.pieces;
    this.render();
    this.audio?.prompt?.(null, this.model ? 'Vamos construir! Copie o desenho!' : 'Vamos empilhar blocos!');
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  nextId() { return this.model ? (this.order[this.placed.length] || {}).piece : null; }

  render(knock = false) {
    const goalDone = !this.model && this.placed.length >= this.plan.goal;
    const target = this.model ? `<div class="blocos-lite-target" aria-hidden="true"><span class="blocos-lite-label">${this.model.emoji}</span><div class="blocos-lite-stack">${this.order.map((s, i) => pieceHtml(s.piece, i < this.placed.length ? ' done' : ' ghost')).reverse().join('')}</div></div>` : '';
    const stack = this.placed.map((id) => pieceHtml(id, knock ? ' fall' : '')).reverse().join('');
    const next = this.nextId();
    const tray = this.trayIds.map((id) => `<button class="blocos-lite-btn${this.plan.assist && next === id ? ' hint' : ''}" data-id="${id}" aria-label="${PIECES[id].label}">${pieceHtml(id)}</button>`).join('');
    this.root.innerHTML = `<div class="blocos-lite-board">${target}<div class="blocos-lite-stack mine" id="blocos-lite-mine" aria-live="polite">${stack}</div></div>${goalDone && !this.knocked ? '<button class="blocos-lite-bell hint" id="blocos-lite-bell" aria-label="Derrubar">🔔</button>' : ''}<div class="blocos-lite-tray">${tray}</div>`;
    this.root.querySelectorAll('.blocos-lite-btn').forEach((b) => b.addEventListener('click', () => this.place(b.dataset.id, b)));
    const bell = this.root.querySelector('#blocos-lite-bell');
    if (bell) bell.addEventListener('click', () => this.knockDown());
  }

  place(id, btn) {
    if (this.finished || this.busy) return;
    if (this.model) {
      if (this.nextId() !== id) { playSfx('retry'); btn.classList.add('shake'); this.later(() => btn.classList.remove('shake'), 400); return; }
    } else if (this.placed.length >= this.plan.goal) return;
    this.placed.push(id);
    playInstrument('xylo', PIECES[id].note, 0.9);
    if (this.plan.count && !this.model && this.placed.length <= 10) this.audio?.play?.(`num-${this.placed.length}.mp3`, String(this.placed.length));
    this.render();
    if (this.model && this.placed.length >= this.order.length) return this.modelDone();
    if (!this.model && this.placed.length >= this.plan.goal) this.audio?.prompt?.(null, 'Que torre! Toque no sino para derrubar!');
  }

  modelDone() {
    this.busy = true;
    this.completed += 1;
    this.save.built[this.model.id] = (this.save.built[this.model.id] || 0) + 1;
    try { localStorage.setItem('ab_blocos_v1', JSON.stringify(this.save)); } catch (error) { /* sem armazenamento */ }
    playSfx('celebrate');
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Ficou igualzinho!');
    this.later(() => {
      this.modelIndex += 1;
      this.busy = false;
      if (this.modelIndex >= this.models.length) return this.finish();
      this.model = this.models[this.modelIndex];
      this.order = slotOrder(this.model);
      this.placed = [];
      this.render();
    }, 1800);
  }

  knockDown() {
    if (this.knocked || this.finished) return;
    this.knocked = true;
    this.busy = true;
    playSfx('pop');
    this.render(true);
    this.later(() => this.finish(), 1500);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.audio?.prompt?.('parabens.mp3', 'Parabéns, construtor! Que lindo!');
    const rounds = this.model ? this.models.length : this.plan.goal;
    const correct = this.model ? this.completed : Math.min(this.placed.length, this.plan.goal);
    this.later(() => this.onComplete?.({ mode: 'explore', score: correct, rounds, correct, attempts: correct, maxScore: rounds, completedRounds: correct, difficulty: this.difficulty.level, ageId: this.ageId }), 1800);
  }

  stop() { this.timers.forEach((t) => window.clearTimeout(t)); this.timers = []; this.finished = true; }
}
