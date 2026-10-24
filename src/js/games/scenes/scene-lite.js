import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playNote } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

// Cena no modo lite: a mesma ilustração, com as figuras em HTML/CSS (aparelhos antigos, sem WebGL ou com pouca memória).
export class SceneLiteGame {
  constructor(containerId, audio, onComplete, onBack, scene) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.scene = scene;
    this.timers = [];
    this.found = {};
    this.count = 0;
    this.finished = false;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    const plan = options.plan || this.scene.byAge[this.ageId] || this.scene.byAge['2-3y'];
    this.target = plan.target;
    this.mood = options.mood || this.scene.moods[0];
    const { base } = this.scene;
    const list = this.scene.creatures.slice(0, plan.creatures);
    const used = [];
    const items = list.map((def, i) => {
      const x = def.x != null ? def.x * 100 : 12 + ((i * 37) % 70);
      const y = def.lane * 100;
      const width = Math.max(14, def.frac * 100 * (def.mode === 'school' ? 2.4 : 1));
      const motion = def.mode === 'swim' || def.mode === 'whale' ? 'swim' : def.mode === 'walk' ? 'walk' : def.mode === 'idle' ? 'still' : 'bob';
      used.push(def.id);
      return `<button class="scene-lite-c ${motion}" data-i="${i}" aria-label="${def.label}" style="left:${x}%;top:${y}%;width:${width}%;animation-duration:${8 + (i % 5) * 2}s;animation-delay:-${i * 1.7}s"><img src="${base}${def.file}" alt="" draggable="false" />${def.mode === 'school' ? `<img src="${base}${def.file}" alt="" draggable="false" class="s2" /><img src="${base}${def.file}" alt="" draggable="false" class="s3" />` : ''}</button>`;
    });
    this.list = list;
    const dots = Array.from({ length: this.target }, () => '<span class="scene-lite-dot"></span>').join('');
    this.container.innerHTML = gameShellMarkup({
      backId: 'scene-back',
      title: `🌊 ${this.scene.title}`,
      body: `<div class="scene-lite" id="scene-lite"><img class="scene-lite-plate" src="${base}${this.scene.plate.file}" alt="" draggable="false" />${items.join('')}<div class="scene-lite-mood" style="background:${this.mood.tint != null ? `rgba(${(this.mood.tint >> 16) & 255},${(this.mood.tint >> 8) & 255},${this.mood.tint & 255},${this.mood.alpha})` : 'transparent'}"></div><div class="scene-lite-dots" aria-hidden="true">${dots}</div></div>`
    });
    this.root = this.container.querySelector('#scene-lite');
    this.container.querySelector('#scene-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.root.querySelectorAll('.scene-lite-c').forEach((el) => el.addEventListener('click', () => this.touch(el)));
    this.audio?.prompt?.(null, 'Vamos explorar o fundo do mar! Toque nos bichinhos.');
  }

  later(fn, ms) { this.timers.push(window.setTimeout(fn, ms)); }

  touch(el) {
    if (this.finished) return;
    const def = this.list[Number(el.dataset.i)];
    playSfx('pop');
    this.audio?.play?.(null, def.label);
    (def.notes || []).forEach((n, i) => this.later(() => playNote(n, 0.3), i * 130));
    el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
    if (!this.found[def.id]) {
      this.found[def.id] = true;
      const dot = this.root.querySelectorAll('.scene-lite-dot')[this.count];
      if (dot) { dot.className += ' on'; }
      this.count += 1;
      if (this.count >= this.target) this.later(() => this.finish(), 1500);
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Você achou vários bichinhos!');
    this.later(() => this.onComplete?.({ mode: 'explore', score: this.count, rounds: 1, correct: this.count, attempts: this.count, maxScore: this.target, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId }), 3800);
  }

  stop() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}
