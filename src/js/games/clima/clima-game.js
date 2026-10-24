import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';
import { WEATHERS, ITEMS, PLAN_BY_AGE, buildRounds } from './clima-data.js';

// Que roupa eu visto? — HTML puro (roda igual em aparelhos antigos). Nenhuma derrota: a figura errada só balança.
const STORE_KEY = 'ab_clima_v1';

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, seen: v.seen && typeof v.seen === 'object' ? v.seen : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, seen: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class ClimaGame {
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
    this.index = 0; this.found = []; this.tries = 0; this.busy = false;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__clima = this; } catch (error) { /* sem armazenamento */ }
    this.container.innerHTML = gameShellMarkup({
      backId: 'clima-back',
      title: '🌦️ Que roupa eu visto?',
      body: '<div class="clima" id="clima"></div>'
    });
    this.root = this.container.querySelector('#clima');
    this.container.querySelector('#clima-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.render();
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  say(text, prompt = false) { if (prompt) this.audio?.prompt?.(null, text); else this.audio?.play?.(null, text); }
  get round() { return this.rounds[this.index]; }

  render() {
    if (this.index >= this.rounds.length) return this.finish();
    const r = this.round;
    const w = WEATHERS[r.weather];
    this.found = []; this.tries = 0; this.busy = false;
    this.root.innerHTML = `
      <div class="clima-scene" role="img" aria-label="${w.say}"><span class="clima-sky" aria-hidden="true">${w.icon}</span><span class="clima-kid" aria-hidden="true">🐻</span></div>
      <div class="clima-options" id="clima-options">
        ${r.options.map((id) => `<button class="clima-item" data-item="${id}" aria-label="${ITEMS[id].label}"><span aria-hidden="true">${ITEMS[id].icon}</span></button>`).join('')}
      </div>`;
    this.say(`${w.say} ${r.need > 1 ? 'Escolha duas coisas para ele usar.' : 'O que ele precisa usar?'}`, true);
    this.root.querySelectorAll('.clima-item').forEach((btn) => btn.addEventListener('click', () => this.pick(btn)));
  }

  pick(btn) {
    if (this.busy || this.finished || btn.classList.contains('right')) return;
    const r = this.round;
    const id = btn.dataset.item;
    if (r.goods.includes(id)) {
      btn.classList.add('right');
      this.found.push(id);
      playSfx('tap');
      this.say(`Isso! ${ITEMS[id].label[0].toUpperCase()}${ITEMS[id].label.slice(1)} ajuda quando tem ${WEATHERS[r.weather].label}.`);
      if (this.found.length >= r.need) {
        this.busy = true;
        this.save.seen[r.weather] = (this.save.seen[r.weather] || 0) + 1; writeSave(this.save);
        this.later(() => { playSfx('celebrate'); this.later(() => { this.index += 1; this.render(); }, 1100); }, 600);
      }
    } else {
      this.tries += 1;
      playSfx('retry');
      btn.classList.add('shake');
      this.later(() => btn.classList.remove('shake'), 400);
      this.say(`Hmm, ${ITEMS[id].label} não é para quando tem ${WEATHERS[r.weather].label}. Tente outra.`);
      if (this.tries >= 2) { const next = r.goods.find((g) => !this.found.includes(g)); this.root.querySelector(`[data-item="${next}"]`)?.classList.add('hint'); }
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.later(() => playInstrument('xylo', f, 0.9), i * 160));
    this.say('Parabéns! Agora ele está pronto para qualquer tempo!', true);
    const n = this.rounds.length;
    this.later(() => this.onComplete?.({ mode: 'explore', score: n, rounds: n, correct: n, attempts: n, maxScore: n, completedRounds: n, difficulty: this.difficulty.level, ageId: this.ageId }), 2200);
  }

  stop() { this.timers.forEach((t) => window.clearTimeout(t)); this.timers = []; this.finished = true; try { if (window.__clima === this) window.__clima = null; } catch (error) { /* ignora */ } }
}
