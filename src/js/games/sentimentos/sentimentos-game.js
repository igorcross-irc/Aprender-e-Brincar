import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { EMOTIONS, ACTIONS, PLAN_BY_AGE, buildRounds, faceSvg } from './sentimentos-data.js';

// Como eu me sinto? — HTML e SVG puros (roda igual em aparelhos antigos). Nenhuma derrota: se errar, a carinha certa pisca e a criança tenta de novo.
const STORE_KEY = 'ab_sentimentos_v1';

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, seen: v.seen && typeof v.seen === 'object' ? v.seen : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, seen: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class SentimentosGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '3-4y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = PLAN_BY_AGE[this.ageId] || PLAN_BY_AGE['3-4y'];
    this.save = loadSave();
    this.save.visits += 1;
    writeSave(this.save);
    this.rounds = buildRounds(this.plan, this.save.visits - 1);
    this.index = 0; this.correct = 0; this.tries = 0; this.step = 'emotion';
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__sent = this; } catch (error) { /* sem armazenamento */ }
    this.container.innerHTML = gameShellMarkup({
      backId: 'sent-back',
      title: '🙂 Como eu me sinto?',
      body: '<div class="sent" id="sent"></div>'
    });
    this.root = this.container.querySelector('#sent');
    this.container.querySelector('#sent-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.render();
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  say(text, prompt = false) { if (prompt) this.audio?.prompt?.(null, text); else this.audio?.play?.(null, text); }
  get round() { return this.rounds[this.index]; }

  render() {
    if (this.index >= this.rounds.length) return this.finish();
    const r = this.round;
    const e = EMOTIONS[r.emotion];
    this.tries = 0; this.step = 'emotion'; this.busy = false;
    const head = r.situation
      ? `<div class="sent-scene" role="img" aria-label="${r.situation.say}"><span aria-hidden="true">${r.situation.icon}</span></div>`
      : `<div class="sent-scene sent-ask" aria-hidden="true">${faceSvg(r.emotion, 120)}</div>`;
    this.root.innerHTML = `
      ${head}
      <div class="sent-options" id="sent-options">
        ${r.options.map((id) => `<button class="sent-face" data-emotion="${id}" aria-label="${EMOTIONS[id].label}">${faceSvg(id, 92)}</button>`).join('')}
      </div>`;
    const prompt = r.situation ? r.situation.say : `Quem está ${e.label}? Toque na carinha.`;
    this.say(prompt, true);
    this.root.querySelectorAll('.sent-face').forEach((btn) => btn.addEventListener('click', () => this.pick(btn)));
  }

  pick(btn) {
    if (this.busy || this.finished) return;
    const r = this.round;
    this.tries += 1;
    if (btn.dataset.emotion === r.emotion) {
      this.busy = true;
      this.correct += this.tries === 1 ? 1 : 0;
      this.save.seen[r.emotion] = (this.save.seen[r.emotion] || 0) + 1; writeSave(this.save);
      btn.classList.add('right');
      playSfx('celebrate');
      this.say(`Isso! ${EMOTIONS[r.emotion].label[0].toUpperCase()}${EMOTIONS[r.emotion].label.slice(1)}!`);
      this.later(() => (r.strategy ? this.renderStrategy() : this.next()), 1600);
    } else {
      playSfx('retry');
      btn.classList.add('shake');
      this.later(() => btn.classList.remove('shake'), 400);
      this.say(`Hmm, olhe de novo. Esta é a carinha ${EMOTIONS[btn.dataset.emotion].label}.`);
      if (this.tries >= 2) this.root.querySelector(`[data-emotion="${r.emotion}"]`)?.classList.add('hint');
    }
  }

  renderStrategy() {
    const r = this.round;
    this.step = 'strategy'; this.tries = 0; this.busy = false;
    this.root.innerHTML = `
      <div class="sent-scene sent-ask" aria-hidden="true">${faceSvg(r.emotion, 110)}</div>
      <div class="sent-options" id="sent-options">
        ${r.strategy.options.map((id) => `<button class="sent-action" data-action="${id}" aria-label="${ACTIONS[id].label}"><span aria-hidden="true">${ACTIONS[id].icon}</span><small>${ACTIONS[id].label}</small></button>`).join('')}
      </div>`;
    this.say(r.strategy.say, true);
    this.root.querySelectorAll('.sent-action').forEach((btn) => btn.addEventListener('click', () => this.pickAction(btn)));
  }

  pickAction(btn) {
    if (this.busy || this.finished) return;
    const r = this.round;
    this.tries += 1;
    if (btn.dataset.action === r.strategy.good) {
      this.busy = true;
      btn.classList.add('right');
      playSfx('celebrate');
      this.say(`Boa ideia! ${ACTIONS[btn.dataset.action].label} ajuda.`);
      this.later(() => this.next(), 1700);
    } else {
      playSfx('retry');
      btn.classList.add('shake');
      this.later(() => btn.classList.remove('shake'), 400);
      this.say(btn.dataset.action === 'bater' ? 'Bater machuca os outros. Vamos achar outra ideia.' : 'Pode ser. Mas tem uma ideia que ajuda mais. Tente outra.');
      if (this.tries >= 2) this.root.querySelector(`[data-action="${r.strategy.good}"]`)?.classList.add('hint');
    }
  }

  next() {
    this.index += 1;
    this.render();
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.later(() => playInstrument('xylo', f, 0.9), i * 160));
    this.say('Parabéns! Você conhece muito bem os sentimentos!', true);
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.rounds.length, rounds: this.rounds.length, correct: this.rounds.length, attempts: this.rounds.length, maxScore: this.rounds.length, completedRounds: this.rounds.length, difficulty: this.difficulty.level, ageId: this.ageId }), 2200);
  }

  stop() { this.timers.forEach((t) => window.clearTimeout(t)); this.timers = []; this.finished = true; try { if (window.__sent === this) window.__sent = null; } catch (error) { /* ignora */ } }
}
