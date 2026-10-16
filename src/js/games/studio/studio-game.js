import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { createStage, shouldUseLite } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import * as art from '../farm/art.js';
import { StudioLiteGame } from './studio-lite.js';
import { BAND, SCALE, PLAN_BY_AGE, noteFor } from './studio-data.js';

// Estúdio dos Bichos — banda de bichos que tocam instrumentos de verdade (sintetizados no aparelho).
// Até 3 anos: tocar nos bichos e ouvir (sem objetivo, só causa e efeito). A partir de 3 anos: sequenciador de quadradinhos
// para montar a própria música; a música fica guardada no aparelho. Sem derrota, sem relógio, sem texto.
const STORE_KEY = 'ab_studio_v1';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, steps: Number(v.steps) || 0, pattern: Array.isArray(v.pattern) ? v.pattern : null }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, steps: 0, pattern: null };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class StudioGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.inner = null;
    this.destroyed = false;
  }

  start(level = 1, options = {}) {
    this.level = level;
    this.options = options;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    this.plan = PLAN_BY_AGE[this.ageId] || PLAN_BY_AGE['2-3y'];
    this.save = loadSave();
    this.save.visits += 1;
    writeSave(this.save);
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'studio-back',
      title: '🎶 Estúdio dos Bichos',
      body: '<div class="studio-stage" id="studio-stage" aria-label="Estúdio dos Bichos: toque nos bichos para fazer música"></div>'
    });
    this.container.querySelector('#studio-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Estúdio: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new StudioLiteGame(this.container.id, this.audio, this.onComplete, this.onBack);
    this.inner.start(this.level, { ...this.options, plan: this.plan, save: this.save });
  }

  async init() {
    const host = this.container.querySelector('#studio-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__studio = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, taps: 0, notes: 0, loops: 0, step: -1, playing: false, finished: false, spoken: new Set(), stepTimer: 0, freeIndex: 0 });
    this.free = this.plan.mode === 'free';
    this.band = BAND.slice(0, this.free ? this.plan.animals : 4);
    this.steps = this.free ? 0 : this.plan.steps;
    this.grid = this.band.map(() => Array.from({ length: this.steps }, () => false));
    if (!this.free && this.save.pattern && this.save.steps === this.steps && this.save.pattern.length === this.band.length) {
      this.save.pattern.forEach((row, r) => row.forEach((on, c) => { if (c < this.steps && on) this.grid[r][c] = true; }));
    }
    this.buildBackdrop();
    this.particles = new Particles(PIXI, app);
    this.particles.layer.eventMode = 'none';
    this.actors = this.band.map((def) => this.makeActor(def));
    this.actorLayer.addChild(...this.actors.map((a) => a.parts.root));
    if (!this.free) this.buildControls();
    app.stage.addChild(this.particles.layer);
    this.layout();
    this.resizeHandler = () => this.layout();
    app.renderer.on('resize', this.resizeHandler);
    app.ticker.add(this.onTick = (t) => this.update(t.deltaMS / 1000));
    this.audio?.prompt?.(null, this.free ? 'Vamos fazer música! Toque nos bichinhos.' : 'Vamos fazer uma música! Toque nos quadradinhos e depois no botão de tocar.');
  }

  buildBackdrop() {
    const { PIXI, app } = this;
    const back = new PIXI.Container();
    back.eventMode = 'none';
    this.sky = new PIXI.Sprite(art.skyTexture(PIXI, '#7a3fd0', '#ff9a4d'));
    this.floor = new PIXI.Graphics();
    this.lights = new PIXI.Graphics();
    this.bunting = art.buildBunting(PIXI, 600, 22);
    this.bunting.eventMode = 'none';
    back.addChild(this.sky, this.lights, this.floor, this.bunting);
    this.back = back;
    this.actorLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    app.stage.addChild(back, this.actorLayer, this.uiLayer);
  }

  makeActor(def) {
    const { PIXI } = this;
    const parts = art.buildAnimal(PIXI, def.id);
    const actor = { def, parts, base: 1, cx: 0, cy: 0, phase: Math.random() * 6, hits: 0 };
    parts.root.eventMode = 'static';
    parts.root.cursor = 'pointer';
    parts.root.hitArea = new PIXI.Rectangle(-85, -220, 170, 225);
    parts.root.on('pointertap', () => this.touchActor(actor));
    return actor;
  }

  // ---------- controles do sequenciador ----------
  buildControls() {
    const { PIXI } = this;
    this.cells = [];
    this.band.forEach((def, r) => {
      const row = [];
      for (let c = 0; c < this.steps; c += 1) {
        const cell = new PIXI.Container();
        cell.bg = new PIXI.Graphics();
        cell.addChild(cell.bg);
        cell.eventMode = 'static';
        cell.cursor = 'pointer';
        cell.on('pointertap', () => this.toggle(r, c));
        cell.r = r; cell.c = c; cell.size = 40;
        this.uiLayer.addChild(cell);
        row.push(cell);
      }
      this.cells.push(row);
    });
    this.playBtn = new PIXI.Container();
    this.playBtn.gfx = new PIXI.Graphics();
    this.playBtn.addChild(this.playBtn.gfx);
    this.playBtn.eventMode = 'static';
    this.playBtn.cursor = 'pointer';
    this.playBtn.on('pointertap', () => this.togglePlay());
    this.clearBtn = new PIXI.Container();
    this.clearBtn.gfx = new PIXI.Graphics();
    this.clearBtn.addChild(this.clearBtn.gfx);
    this.clearBtn.eventMode = 'static';
    this.clearBtn.cursor = 'pointer';
    this.clearBtn.on('pointertap', () => this.clearAll());
    this.uiLayer.addChild(this.playBtn, this.clearBtn);
    this.drawButtons();
  }

  drawButtons() {
    const R = 44;
    const g = this.playBtn.gfx.clear();
    g.circle(0, 0, R).fill(this.playing ? 0xff4b3e : 0x3dc15d).circle(0, 0, R).stroke({ width: 5, color: 0xffffff });
    if (this.playing) g.roundRect(-16, -18, 12, 36, 3).fill(0xffffff).roundRect(4, -18, 12, 36, 3).fill(0xffffff);
    else g.poly([-12, -20, 22, 0, -12, 20]).fill(0xffffff);
    this.playBtn.hitArea = new this.PIXI.Circle(0, 0, R + 8);
    const h = this.clearBtn.gfx.clear();
    h.circle(0, 0, 30).fill(0x2f7de1).circle(0, 0, 30).stroke({ width: 4, color: 0xffffff });
    h.moveTo(-10, -10).lineTo(10, 10).moveTo(10, -10).lineTo(-10, 10).stroke({ width: 5, color: 0xffffff, cap: 'round' });
    this.clearBtn.hitArea = new this.PIXI.Circle(0, 0, 38);
  }

  drawCell(cell) {
    const { r, c, size } = cell;
    const color = this.band[r].color;
    const on = this.grid[r][c];
    const here = this.playing && this.step === c;
    cell.bg.clear();
    cell.bg.roundRect(-size / 2, -size / 2, size, size, size * 0.24).fill(on ? color : 0xffffff).roundRect(-size / 2, -size / 2, size, size, size * 0.24).stroke({ width: here ? 5 : 3, color: here ? 0xffffff : color, alpha: on ? 1 : 0.55 });
    if (!on) cell.bg.alpha = here ? 0.95 : 0.78; else cell.bg.alpha = 1;
    if (on) cell.bg.circle(-size * 0.16, -size * 0.16, size * 0.11).fill({ color: 0xffffff, alpha: 0.5 });
    cell.hitArea = new this.PIXI.Rectangle(-size * 0.58, -size * 0.58, size * 1.16, size * 1.16);
  }

  // ---------- layout ----------
  layout() {
    const { app } = this;
    const W = app.screen.width; const H = app.screen.height;
    this.W = W; this.H = H;
    this.sky.width = W; this.sky.height = H;
    this.lights.clear();
    [0.12, 0.38, 0.62, 0.88].forEach((fx, i) => this.lights.circle(W * fx, H * 0.1, H * 0.22).fill({ color: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a][i], alpha: 0.12 }));
    const floorY = this.free ? H * 0.8 : H * 0.42;
    this.floor.clear();
    this.floor.rect(0, floorY - 4, W, H - floorY + 4).fill(0x2b2a6b).rect(0, floorY - 4, W, 8).fill(0xffcf1f);
    this.bunting.scale.set(W / 600, 1);
    this.bunting.position.set(0, 0);
    const n = this.actors.length;
    const slot = W / n;
    const topArea = this.free ? H * 0.8 : H * 0.42;
    const scale = clamp(Math.min((slot * 0.92) / 180, (topArea * 0.78) / 230), 0.35, 1.5);
    this.actors.forEach((actor, i) => {
      actor.base = scale;
      actor.cx = slot * (i + 0.5);
      actor.cy = floorY - (this.free ? H * 0.04 : 6);
      actor.parts.root.scale.set(scale);
      actor.parts.root.position.set(actor.cx, actor.cy);
    });
    if (this.free) return;
    const gridTop = H * 0.47; const gridH = H * 0.5;
    const cell = Math.min((W * 0.74) / this.steps, gridH / this.band.length) * 0.88;
    const gapX = Math.min(W * 0.74 / this.steps, gridH / this.band.length);
    const left = W * 0.5 - (gapX * this.steps) / 2 + gapX / 2 - Math.min(40, W * 0.04);
    this.cells.forEach((row, r) => row.forEach((c, i) => {
      c.size = cell;
      c.position.set(left + i * gapX, gridTop + (r + 0.5) * (gridH / this.band.length));
      this.drawCell(c);
    }));
    const bx = clamp(left + gapX * (this.steps - 0.5) + 70, 60, W - 60);
    this.playBtn.position.set(bx, gridTop + gridH * 0.3);
    this.clearBtn.position.set(bx, gridTop + gridH * 0.72);
    this.playBtn.scale.set(clamp(H / 700, 0.7, 1.2));
    this.clearBtn.scale.set(clamp(H / 700, 0.7, 1.2));
  }

  // ---------- sons e reações ----------
  sound(r, step = null) {
    const def = this.band[r];
    const index = step == null ? this.freeIndex : step;
    playInstrument(def.kind, def.kind === 'xylo' || def.kind === 'bell' ? noteFor(def.kind, index) : 0, 1);
  }

  react(actor, power = 0.2) {
    if (this.destroyed) return;
    const b = actor.base;
    this.tweens.run(this.calm ? 200 : 520, ease.outElastic, (k) => actor.parts.root.scale.set(b * (1 + power * (1 - k)), b * (1 - power * (1 - k))));
    const { head, mouth, smileG } = actor.parts;
    if (mouth) mouth.visible = true; if (smileG) smileG.visible = false;
    this.tweens.run(260, ease.inOutSine, (k) => { const v = Math.sin(k * Math.PI); head.scale.set(1 + 0.06 * v, 1 - 0.1 * v); head.y = -120 + 8 * v; }, () => { if (mouth) mouth.visible = false; if (smileG) smileG.visible = true; });
    this.particles.burst(actor.cx, actor.cy - 150 * b, 'note', 3, { tint: [0xffffff, actor.def.color, 0xffcf1f], speed: 150, gravity: -60, life: 1.1, size: 1.1, spread: 1.2 });
  }

  touchActor(actor) {
    if (this.finished || !this.free) { if (!this.free) { this.sound(this.actors.indexOf(actor), this.step >= 0 ? this.step : 0); this.react(actor, 0.12); } return; }
    const r = this.actors.indexOf(actor);
    this.sound(r);
    this.freeIndex += 1;
    this.react(actor);
    this.taps += 1;
    if (!this.spoken.has(actor.def.id)) { this.spoken.add(actor.def.id); this.audio?.play?.(null, actor.def.label); }
    if (this.taps >= this.plan.target) this.finish();
  }

  toggle(r, c) {
    if (this.finished) return;
    this.grid[r][c] = !this.grid[r][c];
    this.drawCell(this.cells[r][c]);
    if (this.grid[r][c]) { this.sound(r, c); this.react(this.actors[r], 0.12); }
    else playSfx('tap');
    this.persist();
  }

  persist() { this.save.steps = this.steps; this.save.pattern = this.grid.map((row) => row.slice()); writeSave(this.save); }

  count() { return this.grid.reduce((n, row) => n + row.filter(Boolean).length, 0); }

  clearAll() {
    this.grid.forEach((row, r) => row.forEach((_, c) => { this.grid[r][c] = false; this.drawCell(this.cells[r][c]); }));
    this.loops = 0;
    this.persist();
    playSfx('tap');
  }

  togglePlay() {
    if (this.finished) return;
    this.playing = !this.playing;
    this.step = -1;
    this.stepTimer = 0.25;
    if (this.playing && this.count() === 0) { this.audio?.prompt?.(null, 'Toque nos quadradinhos para escolher os sons.'); }
    this.drawButtons();
    this.cells.forEach((row) => row.forEach((c) => this.drawCell(c)));
  }

  update(dt) {
    if (this.destroyed || !this.app) return;
    this.time += dt;
    this.actors.forEach((actor, i) => {
      const bob = this.calm ? 0 : Math.sin(this.time * 2.2 + actor.phase) * 0.012;
      actor.parts.root.rotation = Math.sin(this.time * 1.4 + actor.phase) * (this.calm ? 0 : 0.02);
      actor.parts.body.y = bob * 60;
    });
    if (!this.free && this.playing && !this.finished) {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) { this.stepTimer += this.plan.stepSeconds; this.advance(); }
    }
  }

  advance() {
    const prev = this.step;
    this.step = (this.step + 1) % this.steps;
    if (prev >= 0) this.cells.forEach((row) => this.drawCell(row[prev]));
    this.cells.forEach((row) => this.drawCell(row[this.step]));
    this.band.forEach((def, r) => { if (this.grid[r][this.step]) { this.sound(r, this.step); this.react(this.actors[r], 0.16); } });
    if (this.step === this.steps - 1) {
      this.loops += 1;
      if (this.loops >= this.plan.loops && this.count() >= this.plan.minNotes) this.finish();
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.playing = false;
    if (!this.free) { this.persist(); this.drawButtons(); }
    playSfx('celebrate');
    this.actors.forEach((actor, i) => this.tweens.run(200 + i * 80, ease.outQuad, () => {}, () => this.react(actor, 0.3)));
    this.particles.burst(this.W / 2, this.H * 0.3, 'star', 24, { tint: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a], speed: 320, life: 1.3, size: 1.2 });
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Que música linda!');
    window.setTimeout(() => {
      if (this.destroyed) return;
      this.onComplete?.({ mode: 'explore', score: this.free ? this.taps : this.count(), rounds: 1, correct: this.free ? this.taps : this.count(), attempts: this.free ? this.taps : this.count(), maxScore: this.free ? this.plan.target : this.plan.minNotes, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
    }, 3200);
  }

  teardown() {
    this.destroyed = true;
    try { this.tweens?.destroy(); this.particles?.destroy(); if (this.onTick) this.app?.ticker.remove(this.onTick); if (this.resizeHandler) this.app?.renderer.off('resize', this.resizeHandler); this.app?.destroy(true, { children: true, texture: true }); } catch (error) { /* já destruído */ }
    this.app = null;
    try { if (window.__studio === this) window.__studio = null; } catch (error) { /* ignora */ }
  }

  stop() {
    if (this.inner) { this.inner.stop(); return; }
    this.teardown();
  }
}
