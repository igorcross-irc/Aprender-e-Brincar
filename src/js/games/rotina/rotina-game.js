import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playNote, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { SCRUBS, TOY_KINDS, PLAN_BY_AGE, kindsFor, toysFor, spotsFor } from './rotina-data.js';

// Rotina do Dia — HTML e SVG puros (roda igual em aparelhos antigos). Nenhuma derrota: o brinquedo na caixa errada só balança.
const STORE_KEY = 'ab_rotina_v1';
const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, done: v.done && typeof v.done === 'object' ? v.done : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, done: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

const teethSvg = () => `
<svg viewBox="0 0 300 180" class="rot-art" aria-hidden="true" focusable="false">
  <path d="M20 60 Q150 -10 280 60 Q290 150 150 165 Q10 150 20 60Z" fill="#ff7a8a" stroke="#2a1b3d" stroke-width="6"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${44 + i * 44}" y="${60 + (i === 0 || i === 4 ? 6 : 0)}" width="38" height="62" rx="14" fill="#fff" stroke="#2a1b3d" stroke-width="4"/>`).join('')}
</svg>`;

const bathSvg = () => `
<svg viewBox="0 0 300 180" class="rot-art" aria-hidden="true" focusable="false">
  <path d="M20 90 H280 V110 Q280 168 220 168 H80 Q20 168 20 110Z" fill="#7cc4ff" stroke="#2a1b3d" stroke-width="6"/>
  <rect x="50" y="168" width="14" height="10" fill="#2a1b3d"/><rect x="236" y="168" width="14" height="10" fill="#2a1b3d"/>
  <text x="150" y="86" font-size="74" text-anchor="middle">🐻</text>
</svg>`;

export class RotinaGame {
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
    this.visit = this.save.visits - 1;
    this.routineIndex = 0; this.remaining = 0; this.placed = 0; this.busy = false; this.kind = null;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__rot = this; } catch (error) { /* sem armazenamento */ }
    this.container.innerHTML = gameShellMarkup({
      backId: 'rot-back',
      title: '🪥 Rotina do Dia',
      body: '<div class="rot" id="rot"></div>'
    });
    this.root = this.container.querySelector('#rot');
    this.container.querySelector('#rot-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.nextRoutine();
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  say(text, prompt = false) { if (prompt) this.audio?.prompt?.(null, text); else this.audio?.play?.(null, text); }

  nextRoutine() {
    if (this.routineIndex >= this.plan.routines.length) return this.finish();
    const id = this.plan.routines[this.routineIndex];
    this.routine = id; this.busy = false;
    if (id === 'guardar') this.renderTidy(); else this.renderScrub(id);
  }

  endRoutine(message) {
    this.busy = true;
    this.save.done[this.routine] = (this.save.done[this.routine] || 0) + 1; writeSave(this.save);
    playSfx('celebrate');
    [0, 1, 2].forEach((i) => this.later(() => playInstrument('xylo', SCALE[i * 2], 0.8), i * 150));
    this.say(message, true);
    this.root.insertAdjacentHTML('beforeend', `<div class="rot-banner" role="status">${message}</div>`);
    this.later(() => { this.routineIndex += 1; this.nextRoutine(); }, 2200);
  }

  // —— Escovar os dentes e tomar banho: esfregar os sujinhos ——
  renderScrub(id) {
    const scrub = SCRUBS[id];
    const spots = spotsFor(id, this.plan);
    this.remaining = spots.length; this.total = spots.length;
    this.root.innerHTML = `
      <div class="rot-title" aria-hidden="true">${scrub.icon}</div>
      <div class="rot-scene rot-${id}" id="rot-scene">
        ${id === 'dentes' ? teethSvg() : bathSvg()}
        ${spots.map(([x, y], i) => `<button class="rot-spot" data-spot="${i}" style="left:${x}%;top:${y}%" aria-label="sujinho"><span aria-hidden="true">${id === 'dentes' ? '🟤' : '🫧'}</span></button>`).join('')}
      </div>
      <div class="rot-tool" aria-hidden="true">${scrub.tool}</div>`;
    this.say(scrub.ask, true);
    const scene = this.root.querySelector('#rot-scene');
    scene.querySelectorAll('.rot-spot').forEach((btn) => btn.addEventListener('click', () => this.scrubSpot(btn)));
    // Esfregar com o dedo: passa por cima dos sujinhos e eles saem (onde há toque com ponteiro).
    if (window.PointerEvent) {
      scene.style.touchAction = 'none';
      scene.addEventListener('pointermove', (e) => {
        if (!e.buttons && e.pointerType === 'mouse') return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const spot = el && el.closest ? el.closest('.rot-spot') : null;
        if (spot) this.scrubSpot(spot);
      });
    }
  }

  scrubSpot(btn) {
    if (this.busy || this.finished || btn.classList.contains('clean')) return;
    btn.classList.add('clean');
    this.remaining -= 1;
    playNote(SCALE[(this.total - this.remaining - 1) % SCALE.length], 0.25);
    if (this.remaining <= 0) this.later(() => this.endRoutine(SCRUBS[this.routine].done), 350);
  }

  // —— Guardar brinquedos ——
  renderTidy() {
    this.kinds = kindsFor(this.plan, this.visit);
    this.toys = toysFor(this.plan, this.visit);
    this.placed = 0; this.selected = null; this.tries = 0;
    const multi = this.kinds.length > 1;
    this.root.innerHTML = `
      <div class="rot-title" aria-hidden="true">🧺</div>
      <div class="rot-toys" id="rot-toys">
        ${this.toys.map((t) => `<button class="rot-toy" data-toy="${t.id}" data-kind="${t.kind}" aria-label="${t.name}"><span aria-hidden="true">${t.icon}</span></button>`).join('')}
      </div>
      <div class="rot-boxes" id="rot-boxes">
        ${this.kinds.map((k) => `<button class="rot-box" data-box="${k.id}" aria-label="caixa de ${k.label}"><span class="rot-box-icon" aria-hidden="true">${multi ? k.box : '📦'}</span><span class="rot-count" data-count="${k.id}" aria-hidden="true"></span></button>`).join('')}
      </div>`;
    this.say(multi ? 'Hora de guardar os brinquedos! Toque num brinquedo e depois na caixa certa.' : 'Hora de guardar os brinquedos! Toque em cada brinquedo para pôr na caixa.', true);
    this.root.querySelectorAll('.rot-toy').forEach((btn) => btn.addEventListener('click', () => this.pickToy(btn)));
    this.root.querySelectorAll('.rot-box').forEach((btn) => btn.addEventListener('click', () => this.pickBox(btn)));
  }

  pickToy(btn) {
    if (this.busy || this.finished || btn.classList.contains('in')) return;
    if (this.kinds.length === 1) return this.store(btn, this.kinds[0].id);
    this.root.querySelectorAll('.rot-toy.sel').forEach((el) => el.classList.remove('sel'));
    btn.classList.add('sel'); this.selected = btn;
    playNote(SCALE[0], 0.2);
  }

  pickBox(box) {
    if (this.busy || this.finished || !this.selected) return;
    const toy = this.selected;
    this.tries += 1;
    if (toy.dataset.kind === box.dataset.box) { this.tries = 0; this.store(toy, box.dataset.box); return; }
    playSfx('retry');
    box.classList.add('shake'); this.later(() => box.classList.remove('shake'), 400);
    this.say(`Hmm, essa caixa é de ${TOY_KINDS[box.dataset.box].label}. Tente outra caixa.`);
    if (this.tries >= 2) this.root.querySelector(`.rot-box[data-box="${toy.dataset.kind}"]`)?.classList.add('hint');
  }

  store(toy, kindId) {
    toy.classList.remove('sel'); toy.classList.add('in'); this.selected = null;
    this.root.querySelectorAll('.rot-box.hint').forEach((el) => el.classList.remove('hint'));
    this.placed += 1;
    const counter = this.root.querySelector(`[data-count="${kindId}"]`);
    if (counter) counter.textContent = String(Number(counter.textContent || 0) + 1);
    playNote(SCALE[(this.placed - 1) % SCALE.length], 0.25);
    if (this.placed >= this.toys.length) this.later(() => this.endRoutine('Tudo arrumadinho!'), 350);
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.say('Parabéns! Você cuidou de tudo hoje!', true);
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.plan.routines.length, rounds: this.plan.routines.length, correct: this.plan.routines.length, attempts: this.plan.routines.length, maxScore: this.plan.routines.length, completedRounds: this.plan.routines.length, difficulty: this.difficulty.level, ageId: this.ageId }), 1600);
  }

  stop() { this.timers.forEach((t) => window.clearTimeout(t)); this.timers = []; this.finished = true; try { if (window.__rot === this) window.__rot = null; } catch (error) { /* ignora */ } }
}
