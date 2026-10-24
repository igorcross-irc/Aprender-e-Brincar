import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { INGREDIENTS, NUMBER_WORDS, shelfFor } from './cozinha-data.js';

// Cozinha no modo lite: o mesmo pedido por figura e as mesmas etapas, em HTML/CSS com emojis (aparelhos antigos).
const ANIMALS = { vaca: '🐮', galinha: '🐔', cachorro: '🐶', gato: '🐱', pato: '🦆' };
const stepEmoji = (s) => (s.t === 'add' || s.t === 'count' ? INGREDIENTS[s.ing].emoji : s.t === 'mix' ? '🥄' : s.t === 'bake' ? '🔥' : '🍽️');

export class CozinhaLiteGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
    this.served = 0;
    this.orderIndex = -1;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '3-4y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = options.plan;
    this.orders = options.orders;
    this.save = options.save || { visits: 1, made: {} };
    this.container.innerHTML = gameShellMarkup({
      backId: 'cozinha-back',
      title: '🍳 Cozinha Maluca',
      body: '<div class="cozinha-lite" id="cozinha-lite"></div>'
    });
    this.root = this.container.querySelector('#cozinha-lite');
    this.container.querySelector('#cozinha-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.nextOrder();
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  nextOrder() {
    this.orderIndex += 1;
    if (this.orderIndex >= this.orders.length) return this.finish();
    const { recipe, customer } = this.orders[this.orderIndex];
    this.recipe = recipe; this.customer = customer;
    this.step = 0; this.sub = 0; this.stir = 0; this.busy = false; this.pile = [];
    this.shelf = shelfFor(recipe, this.plan, this.save.visits + this.orderIndex);
    this.render();
    this.audio?.prompt?.(recipe.audio || null, `${customer.label} quer ${recipe.label}!`);
  }

  render() {
    const steps = this.recipe.steps.map((s, i) => `<span class="cozinha-lite-step${i < this.step ? ' done' : ''}${i === this.step ? ' now' : ''}" aria-hidden="true">${stepEmoji(s)}${s.n > 1 ? `<small>×${s.n}</small>` : ''}</span>`).join('');
    const step = this.recipe.steps[this.step];
    const shelf = this.shelf.map((id) => `<button class="cozinha-lite-ing" data-ing="${id}" aria-label="${INGREDIENTS[id].label}"><span aria-hidden="true">${INGREDIENTS[id].emoji}</span></button>`).join('');
    const ready = step && step.t === 'serve';
    const pile = this.pile.join('');
    this.root.innerHTML = `<div class="cozinha-lite-order"><span class="cozinha-lite-who" role="img" aria-label="${this.customer.label}">${ANIMALS[this.customer.id]}</span><span class="cozinha-lite-want" aria-hidden="true">${this.recipe.emoji}</span><div class="cozinha-lite-steps">${steps}</div></div>
      <div class="cozinha-lite-work"><button class="cozinha-lite-vessel${ready ? ' ready' : ''}" id="cozinha-lite-vessel" aria-label="Prato"><span class="cozinha-lite-pile" aria-hidden="true">${ready ? this.recipe.emoji : pile}</span><span aria-hidden="true">${ready ? '🍽️' : '🥣'}</span></button>${this.recipe.steps.some((s) => s.t === 'bake') ? `<button class="cozinha-lite-oven${step && step.t === 'bake' ? ' now' : ''}" id="cozinha-lite-oven" aria-label="Forno"><span aria-hidden="true">🔥</span></button>` : ''}</div>
      <div class="cozinha-lite-shelf">${shelf}</div>`;
    this.root.querySelectorAll('.cozinha-lite-ing').forEach((el) => el.addEventListener('click', () => this.onShelf(el.dataset.ing, el)));
    this.root.querySelector('#cozinha-lite-vessel').addEventListener('click', () => this.onVessel());
    const oven = this.root.querySelector('#cozinha-lite-oven');
    if (oven) oven.addEventListener('click', () => this.onOven());
    if (this.plan.hint && step && (step.t === 'add' || step.t === 'count')) { const el = this.root.querySelector(`[data-ing="${step.ing}"]`); if (el) el.className += ' hint'; }
  }

  onShelf(id, el) {
    if (this.finished || this.busy) return;
    const step = this.recipe.steps[this.step];
    if (!step || (step.t !== 'add' && step.t !== 'count') || step.ing !== id) { playSfx('retry'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); return; }
    playInstrument('xylo', 520 + this.sub * 110, 0.8);
    if (step.t === 'count') { const n = this.sub + 1; this.audio?.play?.(`num-${n}.mp3`, NUMBER_WORDS[n] || String(n)); this.pile.push(id === 'agua' ? '💧' : '⚪'); }
    else { this.audio?.play?.(INGREDIENTS[id].audio || null, INGREDIENTS[id].label); this.pile.push(INGREDIENTS[id].emoji); }
    this.sub += 1;
    if (this.sub >= (step.n || 1)) { this.sub = 0; this.step += 1; if (this.recipe.steps[this.step] && this.recipe.steps[this.step].t === 'serve') playInstrument('bell', 1046.5, 1); }
    this.render();
  }

  onVessel() {
    if (this.finished || this.busy) return;
    const step = this.recipe.steps[this.step];
    if (!step) return;
    if (step.t === 'mix') {
      this.stir += 0.34; playInstrument('xylo', 400 + this.stir * 300, 0.6);
      const v = this.root.querySelector('#cozinha-lite-vessel'); v.classList.remove('stir'); void v.offsetWidth; v.classList.add('stir');
      if (this.stir >= 1) { this.stir = 0; this.pile = ['🥣']; this.step += 1; playSfx('success'); this.later(() => this.render(), 350); }
    } else if (step.t === 'serve') {
      this.busy = true;
      this.served += 1;
      this.save.made[this.recipe.id] = (this.save.made[this.recipe.id] || 0) + 1;
      try { localStorage.setItem('ab_cozinha_v1', JSON.stringify(this.save)); } catch (error) { /* sem armazenamento */ }
      playSfx('celebrate');
      this.audio?.play?.('muito-bem.mp3', 'Muito bem!');
      this.root.querySelector('.cozinha-lite-who').classList.add('happy');
      this.later(() => this.nextOrder(), 1700);
    }
  }

  onOven() {
    if (this.finished || this.busy) return;
    const step = this.recipe.steps[this.step];
    if (!step || step.t !== 'bake') { playSfx('retry'); return; }
    this.busy = true;
    playSfx('pop');
    const oven = this.root.querySelector('#cozinha-lite-oven'); oven.classList.add('baking');
    this.later(() => { playInstrument('bell', 1318.5, 1); this.step += 1; this.busy = false; this.render(); }, 2200);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.audio?.play?.('parabens.mp3', 'Parabéns, chef! Você serviu todo mundo!');
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.served, rounds: this.orders.length, correct: this.served, attempts: this.served, maxScore: this.orders.length, completedRounds: this.served, difficulty: this.difficulty.level, ageId: this.ageId }), 2400);
  }

  stop() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}
