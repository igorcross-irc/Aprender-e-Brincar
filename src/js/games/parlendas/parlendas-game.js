import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { PLAN_BY_AGE, parlendasFor, lineDuration } from './parlendas-data.js';

// Parlendas e Gestos — HTML puro (roda igual em aparelhos antigos). A rima é falada verso a verso, com o gesto em figura,
// um pulso suave no ritmo e um botão de palmas livre. Sem acertos e erros: bater no ritmo é só brincar.
const STORE_KEY = 'ab_parlendas_v1';

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, done: v.done && typeof v.done === 'object' ? v.done : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, done: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class ParlendasGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timers = [];
    this.finished = false;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.plan = PLAN_BY_AGE[this.ageId] || PLAN_BY_AGE['2-3y'];
    this.save = loadSave();
    this.save.visits += 1;
    writeSave(this.save);
    this.list = parlendasFor(this.plan, this.save.visits - 1);
    this.index = 0; this.lineIndex = 0; this.taps = 0; this.totalTaps = 0; this.busy = false;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__parl = this; } catch (error) { /* sem armazenamento */ }
    this.container.innerHTML = gameShellMarkup({
      backId: 'parl-back',
      title: '👏 Parlendas e Gestos',
      body: '<div class="parl" id="parl"></div>'
    });
    this.root = this.container.querySelector('#parl');
    this.container.querySelector('#parl-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.renderLine(true);
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  get parlenda() { return this.list[this.index]; }
  get line() { return this.parlenda.lines[this.lineIndex]; }

  renderLine(first = false) {
    if (this.finished) return;
    const p = this.parlenda;
    const line = this.line;
    const gesture = this.plan.clapOnly ? { gesture: '👏', how: 'Bata palmas' } : line;
    this.timers.forEach((t) => window.clearTimeout(t)); this.timers = [];
    this.root.innerHTML = `
      <div class="parl-title" aria-hidden="true"><span>${p.icon}</span> ${p.title}</div>
      <div class="parl-gesture" id="parl-gesture" role="img" aria-label="${gesture.how}"><span aria-hidden="true">${gesture.gesture}</span></div>
      ${this.plan.text ? `<p class="parl-line" id="parl-line">${line.text}</p>` : ''}
      <button class="parl-beat" id="parl-beat" aria-label="Bater palmas no ritmo">👏</button>
      <div class="parl-bar"><span class="parl-dots" aria-hidden="true">${p.lines.map((l, i) => `<i class="${i < this.lineIndex ? 'done' : i === this.lineIndex ? 'current' : ''}"></i>`).join('')}</span>
      <button class="parl-next" id="parl-next" aria-label="Próximo verso">▶</button></div>`;
    this.root.querySelector('#parl-beat').addEventListener('click', () => this.clap());
    this.root.querySelector('#parl-next').addEventListener('click', () => this.advance());
    this.audio?.[first && this.lineIndex === 0 ? 'prompt' : 'play']?.(null, line.text);
    this.startPulse(p.bpm);
    this.later(() => this.advance(), lineDuration(line.text));
  }

  // Pulso suave no ritmo da parlenda para a criança sentir o tempo.
  startPulse(bpm) {
    if (this.pulse) window.clearInterval(this.pulse);
    const step = Math.round(60000 / bpm);
    let n = 0;
    this.pulse = window.setInterval(() => {
      if (this.finished) return;
      const g = this.root?.querySelector('#parl-gesture');
      if (g) { g.classList.remove('beat'); void g.offsetWidth; g.classList.add('beat'); }
      playInstrument('kick', n % 4 === 0 ? 110 : 90, 0.22);
      n += 1;
    }, step);
  }

  clap() {
    if (this.finished) return;
    this.taps += 1; this.totalTaps += 1;
    playInstrument(this.taps % 2 ? 'snare' : 'kick', this.taps % 2 ? 220 : 140, 0.8);
    const b = this.root.querySelector('#parl-beat');
    if (b) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  }

  advance() {
    if (this.finished || this.busy) return;
    this.lineIndex += 1;
    if (this.lineIndex >= this.parlenda.lines.length) return this.endParlenda();
    this.renderLine();
  }

  endParlenda() {
    this.busy = true;
    if (this.pulse) { window.clearInterval(this.pulse); this.pulse = null; }
    this.timers.forEach((t) => window.clearTimeout(t)); this.timers = [];
    this.save.done[this.parlenda.id] = (this.save.done[this.parlenda.id] || 0) + 1; writeSave(this.save);
    playSfx('celebrate');
    this.audio?.play?.('muito-bem.mp3', 'Muito bem!');
    this.root.innerHTML = `<div class="parl-gesture parl-win" aria-hidden="true"><span>🎉</span></div>`;
    this.later(() => {
      this.index += 1; this.lineIndex = 0; this.taps = 0; this.busy = false;
      if (this.index >= this.list.length) return this.finish();
      this.renderLine(true);
    }, 1800);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    if (this.pulse) { window.clearInterval(this.pulse); this.pulse = null; }
    this.audio?.prompt?.('parabens.mp3', 'Parabéns! Que festa de palmas!');
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.list.length, rounds: this.list.length, correct: this.list.length, attempts: this.list.length, maxScore: this.list.length, completedRounds: this.list.length, difficulty: this.difficulty.level, ageId: this.ageId }), 1800);
  }

  stop() {
    this.finished = true;
    this.timers.forEach((t) => window.clearTimeout(t)); this.timers = [];
    if (this.pulse) { window.clearInterval(this.pulse); this.pulse = null; }
    try { if (window.__parl === this) window.__parl = null; } catch (error) { /* ignora */ }
  }
}
