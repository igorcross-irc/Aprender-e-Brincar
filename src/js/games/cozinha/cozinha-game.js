import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { createStage, shouldUseLite } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import * as farm from '../farm/art.js';
import * as art from './cozinha-art.js';
import { CozinhaLiteGame } from './cozinha-lite.js';
import { INGREDIENTS, RECIPES, PLAN_BY_AGE, NUMBER_WORDS, pickOrders, shelfFor } from './cozinha-data.js';

// Cozinha Maluca — a criança atende bichinhos que pedem um prato POR FIGURA e prepara a receita em etapas:
// juntar os ingredientes, contar colheres, mexer, assar e servir. Nenhuma derrota: ingrediente errado só balança e volta.
const STORE_KEY = 'ab_cozinha_v1';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, made: v.made && typeof v.made === 'object' ? v.made : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, made: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class CozinhaGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.inner = null;
    this.destroyed = false;
    this.timers = [];
  }

  start(level = 1, options = {}) {
    this.level = level;
    this.options = options;
    this.ageId = options.ageId || '3-4y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    this.plan = PLAN_BY_AGE[this.ageId] || PLAN_BY_AGE['3-4y'];
    this.save = loadSave();
    this.save.visits += 1;
    writeSave(this.save);
    this.orders = pickOrders(this.plan, this.save.visits - 1);
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'cozinha-back',
      title: '🍳 Cozinha Maluca',
      body: '<div class="cozinha-stage" id="cozinha-stage" aria-label="Cozinha Maluca: prepare o prato que o bichinho pediu"></div>'
    });
    this.container.querySelector('#cozinha-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Cozinha: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new CozinhaLiteGame(this.container.id, this.audio, this.onComplete, this.onBack);
    this.inner.start(this.level, { ...this.options, plan: this.plan, orders: this.orders, save: this.save });
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  async init() {
    const host = this.container.querySelector('#cozinha-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__cozinha = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, idle: 0, orderIndex: -1, step: 0, sub: 0, busy: false, finished: false, served: 0, buttons: {}, bakeProgress: 0 });
    this.bg = new PIXI.Graphics(); this.bg.eventMode = 'none';
    this.customerLayer = new PIXI.Container(); this.customerLayer.eventMode = 'none';
    this.workLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();
    this.fxLayer = new PIXI.Container(); this.fxLayer.eventMode = 'none';
    app.stage.addChild(this.bg, this.customerLayer, this.workLayer, this.uiLayer, this.fxLayer);
    this.particles = new Particles(PIXI, app);
    this.particles.layer.eventMode = 'none';
    app.stage.addChild(this.particles.layer);
    this.resizeHandler = () => this.relayout();
    app.renderer.on('resize', this.resizeHandler);
    app.ticker.add(this.onTick = (t) => this.update(t.deltaMS / 1000));
    this.nextOrder();
  }

  // ---------- cenário e pedido ----------
  drawBackground() {
    const { W, H } = this;
    const g = this.bg.clear();
    g.rect(0, 0, W, H).fill(0xffe3b8);
    for (let x = 0; x < W + 40; x += 44) for (let y = 0; y < H * 0.52; y += 44) g.circle(x + (y / 44 % 2) * 22, y, 3.5).fill({ color: 0xffc77a, alpha: 0.55 });
    g.rect(0, H * 0.3, W, H * 0.04).fill(0xff9fb8).rect(0, H * 0.34, W, H * 0.2).fill(0xffc16b).rect(0, H * 0.54, W, H * 0.46).fill(0x7ad6c1);
    for (let x = 0; x < W + 60; x += 60) g.rect(x, H * 0.54, 30, H * 0.46).fill({ color: 0x5cc4ad, alpha: 0.6 });
    g.rect(0, H * 0.54, W, 6).fill(0x2a1b3d);
  }

  nextOrder() {
    if (this.destroyed) return;
    this.orderIndex += 1;
    if (this.orderIndex >= this.orders.length) return this.finish();
    const { recipe, customer } = this.orders[this.orderIndex];
    this.recipe = recipe; this.customer = customer;
    this.step = 0; this.sub = 0; this.busy = false; this.bakeProgress = 0; this.stirred = 0; this.layers = 0; this.flying = 0; this.stepDone = false; this.dishReady = false;
    this.clearScene();
    this.W = this.app.screen.width; this.H = this.app.screen.height;
    this.drawBackground();
    this.buildCustomer();
    this.buildBubble();
    this.buildVessel();
    this.buildShelf();
    this.relayout();
    this.customerEnter();
    this.refreshSteps();
    this.say(recipe.audio || null, `${customer.label} quer ${recipe.label}!`, true);
    this.idle = 0;
  }

  clearScene() {
    [this.customerLayer, this.workLayer, this.uiLayer, this.fxLayer].forEach((l) => l.removeChildren().forEach((c) => c.destroy({ children: true })));
    this.buttons = {};
    this.oven = null;
  }

  buildCustomer() {
    const parts = farm.buildAnimal(this.PIXI, this.customer.id);
    this.actor = parts;
    this.customerLayer.addChild(parts.root);
  }

  buildBubble() {
    const { PIXI, recipe } = this;
    const b = new PIXI.Container();
    this.bubble = b;
    b.bg = new PIXI.Graphics();
    b.addChild(b.bg);
    const dish = art.buildDish(PIXI, recipe.id, RECIPES);
    b.dish = dish; b.addChild(dish);
    b.steps = recipe.steps.map((step, i) => {
      const c = new PIXI.Container();
      c.ring = new PIXI.Graphics();
      c.addChild(c.ring);
      const icon = art.buildStepIcon(PIXI, step);
      icon.scale.set(0.46);
      c.icon = icon; c.addChild(icon);
      if (step.n > 1) { for (let k = 1; k < step.n; k += 1) { const extra = art.buildStepIcon(PIXI, step); extra.scale.set(0.46); extra.position.set(k * 9, -k * 5); c.addChild(extra); } }
      c.i = i;
      b.addChild(c);
      return c;
    });
    this.uiLayer.addChild(b);
  }

  buildVessel() {
    const { PIXI, recipe } = this;
    const mixes = recipe.steps.some((s) => s.t === 'mix');
    const vessel = new PIXI.Container();
    this.vessel = vessel;
    vessel.base = mixes ? art.buildBowl(PIXI, 150) : art.buildPlate(PIXI, 170);
    vessel.addChild(vessel.base);
    vessel.contents = new PIXI.Container(); vessel.contents.eventMode = 'none';
    vessel.addChild(vessel.contents);
    vessel.isBowl = mixes;
    vessel.eventMode = 'static';
    vessel.cursor = 'pointer';
    vessel.hitArea = new PIXI.Rectangle(-90, -80, 180, 150);
    vessel.on('pointertap', () => this.onVessel());
    vessel.on('pointerdown', (e) => { this.drag = { last: null }; this.dragStart(e); });
    vessel.on('globalpointermove', (e) => this.dragMove(e));
    vessel.on('pointerup', () => { this.drag = null; });
    vessel.on('pointerupoutside', () => { this.drag = null; });
    this.workLayer.addChild(vessel);
    if (recipe.steps.some((s) => s.t === 'bake')) {
      const oven = art.buildOven(PIXI);
      oven.eventMode = 'static'; oven.cursor = 'pointer';
      oven.hitArea = new PIXI.Rectangle(-62, -56, 124, 120);
      oven.on('pointertap', () => this.onOven());
      oven.ring = new PIXI.Graphics(); oven.ring.eventMode = 'none';
      oven.addChild(oven.ring);
      this.oven = oven;
      this.workLayer.addChild(oven);
    }
  }

  buildShelf() {
    const { PIXI } = this;
    const ids = shelfFor(this.recipe, this.plan, this.save.visits + this.orderIndex);
    this.shelfIds = ids;
    this.shelfLayer = new PIXI.Container();
    this.uiLayer.addChild(this.shelfLayer);
    ids.forEach((id) => {
      const btn = new PIXI.Container();
      btn.id = id;
      btn.bg = new PIXI.Graphics();
      btn.addChild(btn.bg);
      const icon = art.buildIngredient(PIXI, id);
      btn.icon = icon; btn.addChild(icon);
      btn.eventMode = 'static'; btn.cursor = 'pointer';
      btn.on('pointertap', () => this.onShelf(btn));
      this.shelfLayer.addChild(btn);
      this.buttons[id] = btn;
    });
  }

  // ---------- posições ----------
  relayout() {
    if (!this.app || !this.recipe) return;
    const W = this.app.screen.width; const H = this.app.screen.height;
    this.W = W; this.H = H;
    this.drawBackground();
    const cs = clamp((H * 0.27) / 230, 0.3, 0.9);
    this.actor.root.scale.set(cs);
    this.actor.root.position.set(W * 0.24, H * 0.31);
    this.customerBase = { x: W * 0.24, y: H * 0.31, s: cs };
    // balão do pedido
    const bw = W * 0.5; const bh = H * 0.27;
    const b = this.bubble;
    b.position.set(W * 0.46, H * 0.015);
    b.bw = bw; b.bh = bh;
    b.bg.clear().roundRect(0, 0, bw, bh, 22).fill(0xffffff).roundRect(0, 0, bw, bh, 22).stroke({ width: 5, color: 0x2a1b3d });
    b.bg.poly([-12, bh * 0.55, 6, bh * 0.4, 6, bh * 0.7]).fill(0xffffff);
    const ds = clamp(Math.min(bw * 0.5, bh * 0.52) / 110, 0.35, 0.9);
    b.dish.scale.set(ds); b.dish.position.set(bw * 0.5, bh * 0.36);
    const n = b.steps.length; const slot = (bw - 20) / n; const isz = Math.min(slot * 0.96, bh * 0.3);
    b.steps.forEach((c, i) => { c.position.set(10 + slot * (i + 0.5), bh * 0.82); c.scale.set(isz / 72); });
    // área de trabalho
    const cy = H * 0.5; const hasOven = Boolean(this.oven);
    this.home = { x: hasOven ? W * 0.34 : W * 0.5, y: cy };
    const vs = clamp(Math.min(W * (hasOven ? 0.34 : 0.5), H * 0.3) / 160, 0.5, 1.15);
    this.vessel.scale.set(vs);
    this.vessel.position.set(this.home.x, cy);
    this.vessel.vs = vs;
    if (this.oven) { const os = clamp(Math.min(W * 0.3, H * 0.3) / 120, 0.5, 1.1); this.oven.scale.set(os); this.oven.position.set(W * 0.78, cy - 4); this.oven.os = os; }
    // prateleira
    const ids = this.shelfIds; const k = ids.length;
    const spacing = Math.min(W / (k + 0.3), 100); const r = Math.min(40, spacing * 0.42);
    const sy = H * 0.82;
    ids.forEach((id, i) => {
      const btn = this.buttons[id];
      btn.position.set(W / 2 - (spacing * (k - 1)) / 2 + i * spacing, sy);
      btn.r = r;
      btn.bg.clear().circle(0, 0, r).fill(0xffffff).circle(0, 0, r).stroke({ width: 5, color: 0x2a1b3d });
      btn.icon.scale.set((r * 1.15) / 40);
      btn.hitArea = new this.PIXI.Circle(0, 0, r * 1.2);
    });
  }

  customerEnter() {
    const { x, y } = this.customerBase;
    this.actor.root.x = -120; this.actor.root.y = y;
    this.tweens.run(this.calm ? 150 : 700, ease.outCubic, (k) => { this.actor.root.x = -120 + (x + 120) * k; });
  }

  // ---------- etapas ----------
  cur() { return this.recipe.steps[this.step]; }

  refreshSteps() {
    this.bubble.steps.forEach((c, i) => {
      const done = i < this.step; const now = i === this.step;
      c.ring.clear().circle(0, 0, 34).fill({ color: done ? 0xb6f0b8 : now ? 0xfff2a8 : 0xf3f3f3 }).circle(0, 0, 34).stroke({ width: now ? 6 : 3, color: now ? 0xff8a1f : 0x2a1b3d, alpha: done ? 0.4 : 1 });
      c.alpha = done ? 0.5 : 1;
      if (done) c.ring.moveTo(-14, 2).lineTo(-4, 12).lineTo(16, -12).stroke({ width: 7, color: 0x24a148, cap: 'round', join: 'round' });
    });
  }

  say(audioFile, text, prompt = false) { if (prompt) this.audio?.prompt?.(audioFile, text); else this.audio?.play?.(audioFile, text); }

  wrong(btn) {
    playSfx('retry');
    const x0 = btn.x;
    this.tweens.run(320, ease.linear, (k) => { btn.x = x0 + Math.sin(k * 18) * 8 * (1 - k); }, () => { btn.x = x0; });
    this.idle = 0;
  }

  onShelf(btn) {
    if (this.finished || this.busy || this.stepDone) return;
    const step = this.cur();
    this.idle = 0;
    if (!step || (step.t !== 'add' && step.t !== 'count') || step.ing !== btn.id) return this.wrong(btn);
    const ing = INGREDIENTS[btn.id];
    if (step.t === 'add') { playInstrument('xylo', 660 + this.sub * 90, 0.8); this.say(ing.audio || null, ing.label); }
    else { playInstrument('xylo', 520 + this.sub * 110, 0.8); const n = this.sub + 1; this.say(`num-${n}.mp3`, NUMBER_WORDS[n] || String(n)); }
    this.fly(btn, step);
    this.sub += 1;
    if (this.sub >= (step.n || 1)) { this.sub = 0; this.stepDone = true; this.advanceWhenLanded(); }
  }

  // A próxima etapa só começa depois que o último ingrediente pousou no prato.
  advanceWhenLanded() {
    if (this.destroyed) return;
    if (this.flying > 0) { this.later(() => this.advanceWhenLanded(), 60); return; }
    this.stepDone = false;
    this.advance();
  }

  fly(btn, step) {
    const { PIXI } = this;
    const icon = step.t === 'count' ? art.buildScoop(PIXI, step.ing) : art.buildIngredient(PIXI, step.ing);
    icon.scale.set(btn.r / 40 * 1.1);
    icon.position.set(btn.x, btn.y);
    this.fxLayer.addChild(icon);
    const to = { x: this.vessel.x, y: this.vessel.y - 56 * this.vessel.vs };
    const from = { x: btn.x, y: btn.y };
    const s0 = icon.scale.x; const idx = this.layers; this.layers += 1; this.flying += 1;
    this.tweens.run(this.calm ? 160 : 460, ease.inOutSine, (k) => {
      icon.x = from.x + (to.x - from.x) * k; icon.y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 90;
      icon.scale.set(s0 * (1 - 0.35 * k)); icon.rotation = k * 0.8;
    }, () => {
      icon.destroy({ children: true });
      this.flying = Math.max(0, this.flying - 1);
      if (this.destroyed || !this.vessel) return;
      this.addContent(step, idx);
      this.particles.burst(to.x, to.y + 10, 'spark', 5, { speed: 120, gravity: 200, life: 0.5, tint: [0xffffff, 0xffe08a] });
    });
  }

  addContent(step, idx) {
    const { PIXI, recipe, vessel } = this;
    const c = vessel.contents;
    if (recipe.stack && step.t === 'add') {
      const layer = art.buildLayer(PIXI, step.ing, step.ing === 'pao' ? idx : 0);
      layer.y = -8 - idx * 15; layer.scale.set(1.1);
      layer.alpha = 0; c.addChild(layer);
      this.tweens.run(260, ease.outBack, (k) => { if (layer.destroyed) return; layer.alpha = Math.min(1, k * 2); layer.y = (-8 - idx * 15) - (1 - k) * 30; });
      return;
    }
    let node;
    if (step.t === 'count') { node = new PIXI.Graphics().ellipse(0, 0, 13, 6).fill(step.ing === 'agua' ? 0x7fd8ff : 0xfff3d6); }
    else { node = art.buildIngredient(PIXI, step.ing); node.scale.set(0.5); }
    const n = c.children.length;
    node.position.set(-34 + (n % 3) * 34 + ((n * 7) % 9 - 4), -6 - Math.floor(n / 3) * 6 + (vessel.isBowl ? 4 : 0));
    node.scale.x *= 0.01; const target = node.scale.x * 100 || 1;
    c.addChild(node);
    const sx = target; const sy = node.scale.y;
    this.tweens.run(300, ease.outBack, (k) => { if (node.destroyed) return; node.scale.set(Math.max(0.01, sx * k), sy); });
  }

  advance() {
    this.step += 1;
    this.refreshSteps();
    const step = this.cur();
    this.idle = 0;
    if (!step) return;
    if (step.t === 'mix') { this.stirred = 0; this.say(null, 'Agora mexa, mexa, mexa!', true); }
    else if (step.t === 'bake') this.say(null, 'Vamos assar! Toque no forno.', true);
    else if (step.t === 'serve') this.later(() => this.readyToServe(), 340);
  }

  // ---------- mexer ----------
  dragStart(e) { if (this.cur()?.t === 'mix') this.drag = { last: null, acc: 0 }; this.lastP = e.global ? { x: e.global.x, y: e.global.y } : null; }

  dragMove(e) {
    if (!this.drag || this.cur()?.t !== 'mix' || this.busy) return;
    const c = this.vessel; const gx = e.global.x - c.x; const gy = e.global.y - c.y;
    const a = Math.atan2(gy, gx);
    if (this.drag.last != null) {
      let d = a - this.drag.last;
      if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      this.drag.acc = (this.drag.acc || 0) + Math.abs(d);
      if (this.drag.acc > 0.9) { this.drag.acc = 0; this.stirBy(0.12, true); }
    }
    this.drag.last = a;
  }

  stirBy(amount, silent = false) {
    if (this.cur()?.t !== 'mix') return;
    this.stirred += amount;
    this.idle = 0;
    this.vessel.contents.rotation = Math.sin(this.time * 30) * 0.06;
    if (!silent) playInstrument('xylo', 400 + this.stirred * 300, 0.6);
    this.wobble();
    if (this.stirred >= 1) this.finishMix();
  }

  wobble() {
    const vs = this.vessel.vs;
    this.tweens.run(260, ease.outElastic, (k) => this.vessel.scale.set(vs * (1 + 0.07 * (1 - k)), vs * (1 - 0.07 * (1 - k))));
  }

  finishMix() {
    if (this.busy) return;
    this.busy = true;
    const { PIXI, recipe, vessel } = this;
    playSfx('success');
    this.tweens.run(this.calm ? 150 : 600, ease.inOutSine, (k) => { vessel.contents.rotation = Math.sin(k * 14) * 0.1 * (1 - k); vessel.contents.alpha = 1 - Math.min(1, k * 1.3); }, () => {
      vessel.contents.removeChildren().forEach((ch) => ch.destroy({ children: true }));
      vessel.contents.rotation = 0; vessel.contents.alpha = 1;
      const mass = new PIXI.Graphics().ellipse(0, 4, 56, 10).fill(recipe.color || 0xffd27a).ellipse(-14, 2, 20, 4).fill({ color: 0xffffff, alpha: 0.35 });
      vessel.mass = mass; vessel.contents.addChild(mass);
      this.busy = false; this.stirred = 0;
      this.advance();
    });
  }

  // ---------- assar ----------
  onVessel() {
    if (this.finished) return;
    this.idle = 0;
    const step = this.cur();
    if (!step) return;
    if (step.t === 'mix' && !this.busy) { this.stirBy(0.34); return; }
    if (step.t === 'serve' && !this.busy && this.dishReady) this.serve();
  }

  onOven() {
    if (this.finished || this.busy) return;
    const step = this.cur();
    this.idle = 0;
    if (!step || step.t !== 'bake') { playSfx('retry'); return; }
    this.busy = true;
    const { vessel, oven } = this;
    const dur = this.calm ? 1200 : 2600;
    playSfx('pop');
    const from = { x: vessel.x, y: vessel.y, s: vessel.vs };
    this.tweens.run(500, ease.inOutSine, (k) => { vessel.x = from.x + (oven.x - from.x) * k; vessel.y = from.y + (oven.y - from.y) * k; vessel.scale.set(from.s * (1 - 0.45 * k)); vessel.alpha = 1 - k * 0.8; });
    this.later(() => {
      this.tweens.run(dur, ease.linear, (k) => {
        oven.glow.clear().roundRect(-36, -14, 72, 54, 10).fill({ color: 0xff8a1f, alpha: 0.45 + 0.4 * Math.sin(k * 30) * 0.5 });
        oven.ring.clear().arc(0, -2, 78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k).stroke({ width: 8, color: 0xffd93d, cap: 'round' });
        if (Math.random() < 0.18) this.particles.burst(oven.x, oven.y - 60 * oven.os, 'spark', 1, { speed: 40, gravity: -60, life: 0.9, tint: 0xffffff, spread: 0.6 });
      }, () => {
        oven.glow.clear().roundRect(-36, -14, 72, 54, 10).fill({ color: P_ORANGE, alpha: 0 }); oven.ring.clear();
        playInstrument('bell', 1318.5, 1); playSfx('success');
        this.particles.burst(oven.x, oven.y - 20, 'star', 10, { tint: [0xffcf1f, 0xffffff], speed: 240, life: 1 });
        if (vessel.mass) vessel.mass.tint = 0xe2a24a;
        vessel.contents.children.forEach((ch) => { ch.tint = 0xe2a24a; });
        this.tweens.run(500, ease.inOutSine, (k) => { vessel.x = oven.x + (from.x - oven.x) * k; vessel.y = oven.y + (from.y - oven.y) * k; vessel.scale.set(from.s * (0.55 + 0.45 * k)); vessel.alpha = 0.2 + 0.8 * k; }, () => { this.busy = false; this.advance(); });
      });
    }, 520);
  }

  // ---------- servir ----------
  readyToServe() {
    if (this.destroyed || !this.vessel) return;
    this.dishReady = true;
    const { PIXI, recipe, vessel } = this;
    vessel.contents.removeChildren().forEach((ch) => ch.destroy({ children: true }));
    const dish = art.buildDish(PIXI, recipe.id, RECIPES);
    dish.y = -6; vessel.contents.addChild(dish);
    if (vessel.isBowl) vessel.base.visible = false;
    if (vessel.isBowl) { const plate = art.buildPlate(PIXI, 170); vessel.addChildAt(plate, 0); vessel.plate = plate; }
    dish.scale.set(0.01);
    this.tweens.run(450, ease.outBack, (k) => { if (!dish.destroyed) dish.scale.set(Math.max(0.01, 1.05 * k)); });
    playInstrument('bell', 1046.5, 1);
    this.particles.burst(vessel.x, vessel.y - 40, 'star', 12, { tint: [0xffcf1f, 0xff6fa5, 0xffffff], speed: 260, life: 1.1 });
    this.say(null, 'Pronto! Leve para o cliente!', true);
  }

  serve() {
    this.busy = true;
    const { vessel, customerBase } = this;
    const from = { x: vessel.x, y: vessel.y, s: vessel.vs };
    const to = { x: customerBase.x + 40, y: customerBase.y - 90 * customerBase.s };
    playSfx('pop');
    this.tweens.run(this.calm ? 200 : 650, ease.inOutSine, (k) => { vessel.x = from.x + (to.x - from.x) * k; vessel.y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 60; vessel.scale.set(from.s * (1 - 0.5 * k)); }, () => {
      vessel.visible = false;
      this.served += 1;
      this.save.made[this.recipe.id] = (this.save.made[this.recipe.id] || 0) + 1;
      writeSave(this.save);
      playSfx('celebrate');
      this.particles.burst(customerBase.x, customerBase.y - 150 * customerBase.s, 'heart', 10, { tint: [0xff5d8f, 0xff9fb8], speed: 220, gravity: -40, life: 1.3, size: 1.2 });
      this.cheer();
      this.say('muito-bem.mp3', 'Muito bem!');
      this.later(() => this.leaveAndNext(), 1700);
    });
  }

  cheer() {
    const { head, mouth, smileG } = this.actor;
    let n = 0;
    const once = () => {
      if (this.destroyed || n >= 3) { if (mouth) mouth.visible = false; if (smileG) smileG.visible = true; return; }
      n += 1; if (mouth) mouth.visible = true; if (smileG) smileG.visible = false;
      this.tweens.run(240, ease.inOutSine, (k) => { const v = Math.sin(k * Math.PI); head.scale.set(1 + 0.07 * v, 1 - 0.1 * v); head.y = -120 + 9 * v; }, once);
    };
    once();
    const root = this.actor.root; const s = this.customerBase.s;
    this.tweens.run(600, ease.outElastic, (k) => root.scale.set(s * (1 + 0.15 * (1 - k)), s * (1 - 0.15 * (1 - k))));
  }

  leaveAndNext() {
    if (this.destroyed) return;
    const root = this.actor.root; const x0 = root.x;
    this.tweens.run(this.calm ? 150 : 600, ease.inOutSine, (k) => { root.x = x0 + (this.W + 160 - x0) * k; }, () => this.nextOrder());
  }

  // ---------- quadro a quadro ----------
  update(dt) {
    if (this.destroyed || !this.app || !this.recipe) return;
    this.time += dt; this.idle += dt;
    const step = this.cur();
    const hintNow = !this.finished && !this.busy && step && (this.plan.hint || this.idle > 6);
    Object.values(this.buttons).forEach((b) => {
      const on = hintNow && (step.t === 'add' || step.t === 'count') && step.ing === b.id;
      b.scale.set(on ? 1 + 0.09 * Math.sin(this.time * 7) : 1);
    });
    const pulse = (obj, base, on) => obj.scale.set(base * (on ? 1 + 0.05 * Math.sin(this.time * 7) : 1));
    if (!this.busy && this.vessel && this.vessel.visible && !this.tweensVesselBusy) {
      if (!(step && step.t === 'mix' && this.vessel.contents.rotation)) pulse(this.vessel, this.vessel.vs, hintNow && (step.t === 'mix' || step.t === 'serve'));
    }
    if (this.oven && !this.busy) pulse(this.oven, this.oven.os, hintNow && step.t === 'bake');
    // clientes respiram
    if (this.actor) this.actor.body.y = Math.sin(this.time * 2.2) * 1.2;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.particles.burst(this.W / 2, this.H * 0.4, 'star', 26, { tint: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a], speed: 360, life: 1.4, size: 1.3 });
    this.say('parabens.mp3', 'Parabéns, chef! Você serviu todo mundo!', true);
    this.later(() => {
      if (this.destroyed) return;
      this.onComplete?.({ mode: 'explore', score: this.served, rounds: this.orders.length, correct: this.served, attempts: this.served, maxScore: this.orders.length, completedRounds: this.served, difficulty: this.difficulty.level, ageId: this.ageId });
    }, 2600);
  }

  teardown() {
    this.destroyed = true;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    try { this.tweens?.destroy(); this.particles?.destroy(); if (this.onTick) this.app?.ticker.remove(this.onTick); if (this.resizeHandler) this.app?.renderer.off('resize', this.resizeHandler); this.app?.destroy(true, { children: true, texture: true }); } catch (error) { /* já destruído */ }
    this.app = null;
    try { if (window.__cozinha === this) window.__cozinha = null; } catch (error) { /* ignora */ }
  }

  stop() {
    if (this.inner) { this.inner.stop(); return; }
    this.teardown();
  }

  // Usado só pelo teste: o que fazer agora.
  nextAction() {
    const step = this.cur();
    if (!step || this.busy || this.stepDone || this.flying > 0) return null;
    if (step.t === 'add' || step.t === 'count') { const b = this.buttons[step.ing]; return { type: 'shelf', x: b.x, y: b.y }; }
    if (step.t === 'serve' && !this.dishReady) return null;
    if (step.t === 'mix' || step.t === 'serve') return { type: step.t, x: this.vessel.x, y: this.vessel.y - 10 };
    if (step.t === 'bake') return { type: 'bake', x: this.oven.x, y: this.oven.y };
    return null;
  }
}

const P_ORANGE = 0xff8a1f;
