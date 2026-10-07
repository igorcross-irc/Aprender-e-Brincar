import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playNote } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { canRunPixi, createStage } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import { BubblesGame } from '../toddler/bubbles.js';
import { buildAnimal, buildFood, buildEgg, buildBarn, buildTree, buildCloud, buildFence, buildGrassTuft, buildFlower, hills, skyTexture } from './art.js';

// Fazendinha Viva: os bichos acordam com fome, a criança leva a comida de cada um,
// o dia passa até a noite e todos vão dormir. A galinha põe ovos que se colecionam e contam.
const ROSTER = [
  { id: 'vaca', food: 'feno', foodLabel: 'feno' },
  { id: 'galinha', food: 'milho', foodLabel: 'milho' },
  { id: 'cachorro', food: 'osso', foodLabel: 'osso' },
  { id: 'gato', food: 'peixe', foodLabel: 'peixe' },
  { id: 'pato', food: 'alface', foodLabel: 'alface' }
];
const COUNT_BY_AGE = { '6-12m': 2, '12-18m': 2, '18-24m': 3, '2-3y': 3, '3-4y': 4, '4-5y': 5 };
const TAP_ASSIST = new Set(['6-12m', '12-18m']);
const SLOTS = {
  2: [[0.3, 0.74], [0.7, 0.74]],
  3: [[0.2, 0.70], [0.5, 0.78], [0.8, 0.70]],
  4: [[0.27, 0.62], [0.73, 0.62], [0.27, 0.79], [0.73, 0.79]],
  5: [[0.22, 0.60], [0.78, 0.60], [0.5, 0.69], [0.28, 0.80], [0.72, 0.80]]
};
const SKY = [['#fbb1bd', '#ffe5b4'], ['#5ec4ff', '#d8f3ff'], ['#7b5ea7', '#ffb26b'], ['#0b1646', '#3a4f9a']];
const LIGHT = [0xffe3d0, 0xffffff, 0xffcf9e, 0x7480c8];
const NUMBER_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco'];
const MAX_EGGS = 5;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mixColor = (a, b, k) => {
  const ar = (a >> 16) & 255; const ag = (a >> 8) & 255; const ab = a & 255;
  const br = (b >> 16) & 255; const bg = (b >> 8) & 255; const bb = b & 255;
  return ((ar + (br - ar) * k) << 16) | ((ag + (bg - ag) * k) << 8) | (ab + (bb - ab) * k);
};
const lightAt = (p) => { const i = clamp(Math.floor(p), 0, 2); return mixColor(LIGHT[i], LIGHT[i + 1], clamp(p - i, 0, 1)); };

export class FarmGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.inner = null;
    this.destroyed = false;
  }

  start(items = [], level = 1, options = {}) {
    this.items = items;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    if (!canRunPixi()) {
      this.inner = new BubblesGame(this.container.id, this.audio, this.onComplete, this.onBack);
      this.inner.start(items, level, options);
      return;
    }
    this.container.innerHTML = gameShellMarkup({
      backId: 'farm-back',
      title: '🌾 Fazendinha',
      body: '<div class="farm-stage" id="farm-stage" aria-label="Fazendinha: leve a comida para cada bichinho"></div>'
    });
    this.container.querySelector('#farm-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Fazendinha: gráficos indisponíveis, usando bolhas.', error);
      this.inner = new BubblesGame(this.container.id, this.audio, this.onComplete, this.onBack);
      this.inner.start(this.items, level, options);
    });
  }

  async init() {
    const host = this.container.querySelector('#farm-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    this.tweens = new Tweens(app.ticker);
    this.time = 0;
    this.fedCount = 0;
    this.attempts = 0;
    this.wrong = 0;
    this.eggs = 0;
    this.pendingEgg = null;
    this.finished = false;
    this.sleeping = false;
    this.idle = 0;
    this.targetP = 0.6;
    this.p = 0.6;
    this.drag = null;

    const count = clamp(COUNT_BY_AGE[this.ageId] || 3, 2, 5);
    const picked = ROSTER.slice().sort(() => Math.random() - 0.5).slice(0, count);
    this.total = picked.length;

    this.skyLayer = new PIXI.Container();
    this.sceneryLayer = new PIXI.Container();
    this.world = new PIXI.Container();
    this.world.sortableChildren = true;
    this.fxLayer = new PIXI.Container();
    this.hudLayer = new PIXI.Container();
    this.foodLayer = new PIXI.Container();
    this.particles = new Particles(PIXI, app);
    app.stage.addChild(this.skyLayer, this.sceneryLayer, this.world, this.fxLayer, this.hudLayer, this.foodLayer, this.particles.layer);

    this.skySprites = SKY.map(([top, bottom]) => { const s = new PIXI.Sprite(skyTexture(PIXI, top, bottom)); this.skyLayer.addChild(s); return s; });
    this.stars = [];
    this.celestial = new PIXI.Container();
    this.sun = new PIXI.Container();
    this.sun.addChild(new PIXI.Graphics().circle(0, 0, 62).fill({ color: 0xfff3a0, alpha: 0.28 }).circle(0, 0, 44).fill({ color: 0xffe066, alpha: 0.4 }).circle(0, 0, 30).fill(0xffd93d));
    this.moon = new PIXI.Container();
    this.moon.addChild(new PIXI.Graphics().circle(0, 0, 40).fill({ color: 0xfff9d6, alpha: 0.25 }).circle(0, 0, 28).fill(0xfff4c7).circle(-8, -6, 6).fill({ color: 0xe8dca8, alpha: 0.8 }).circle(10, 8, 4).fill({ color: 0xe8dca8, alpha: 0.8 }));
    this.cloudLayer = new PIXI.Container();
    this.fireflies = [];

    this.actors = picked.map((def) => this.makeActor(def));
    this.makeHud();
    this.makeFoods();
    this.buildScenery();
    this.layout();

    app.renderer.on('resize', () => { this.buildScenery(); this.layout(); });
    app.ticker.add(this.update, this);
    app.stage.on('globalpointermove', (e) => this.onMove(e));
    app.stage.on('pointerup', (e) => this.onUp(e));
    app.stage.on('pointerupoutside', (e) => this.onUp(e));
    app.stage.on('pointerdown', () => { this.idle = 0; });

    this.audio?.prompt?.(null, 'Os bichinhos estão com fome! Leve a comida para cada um.');
  }

  // ---------- montagem ----------
  animalItem(id) { return (this.items || []).find((it) => it.id === id) || { id, label: id }; }

  makeActor(def) {
    const { PIXI } = this;
    const parts = buildAnimal(PIXI, def.id);
    const actor = { def, item: this.animalItem(def.id), parts, root: parts.root, fed: false, phase: Math.random() * 6, blink: 1 + Math.random() * 3, blinking: 0, base: 1, cx: 0, cy: 0 };
    parts.root.eventMode = 'static';
    parts.root.cursor = 'pointer';
    parts.root.hitArea = new PIXI.Rectangle(-80, -215, 160, 220);
    parts.root.on('pointertap', () => this.touchActor(actor));
    this.world.addChild(parts.root);
    actor.bubble = this.makeBubble(def.food);
    this.fxLayer.addChild(actor.bubble);
    return actor;
  }

  makeBubble(food) {
    const { PIXI } = this;
    const bubble = new PIXI.Container();
    bubble.addChild(new PIXI.Graphics().poly([-10, 24, 10, 24, 0, 40]).fill(0xffffff).circle(0, 0, 36).fill(0xffffff).circle(0, 0, 36).stroke({ width: 3, color: 0xffd7a8 }));
    const icon = buildFood(PIXI, food);
    icon.scale.set(0.62);
    bubble.addChild(icon);
    bubble.icon = icon;
    return bubble;
  }

  makeFoods() {
    const { PIXI } = this;
    this.foods = this.actors.map((actor) => {
      const food = new PIXI.Container();
      food.addChild(new PIXI.Graphics().circle(0, 0, 44).fill({ color: 0xffffff, alpha: 0.001 }));
      const art = buildFood(PIXI, actor.def.food);
      food.addChild(art);
      food.art = art;
      food.hitArea = new PIXI.Circle(0, 0, 50);
      food.eventMode = 'static';
      food.cursor = 'grab';
      food.actor = actor;
      food.used = false;
      food.on('pointerdown', (e) => this.onFoodDown(food, e));
      this.foodLayer.addChild(food);
      actor.food = food;
      return food;
    });
  }

  makeHud() {
    const { PIXI } = this;
    this.badgeBack = new PIXI.Graphics();
    this.hudLayer.addChild(this.badgeBack);
    this.badges = this.actors.map((actor) => {
      const badge = new PIXI.Container();
      badge.addChild(new PIXI.Graphics().circle(0, 0, 19).fill({ color: 0xffffff, alpha: 0.9 }).circle(0, 0, 19).stroke({ width: 3, color: 0xffd7a8 }));
      const icon = buildFood(PIXI, actor.def.food);
      icon.scale.set(0.34);
      badge.addChild(icon);
      badge.alpha = 0.5;
      this.hudLayer.addChild(badge);
      return badge;
    });
    this.basket = new PIXI.Container();
    const b = new PIXI.Graphics();
    b.roundRect(-34, -4, 68, 36, 10).fill(0xb5773a).roundRect(-34, -4, 68, 10, 5).fill(0x8d5a2b);
    for (let x = -22; x <= 22; x += 14) b.moveTo(x, 8).lineTo(x, 28).stroke({ width: 2, color: 0x8d5a2b });
    this.basketEggs = new PIXI.Container();
    this.basket.addChild(this.basketEggs, b);
    this.basket.visible = false;
    this.hudLayer.addChild(this.basket);
  }

  buildScenery() {
    const { PIXI } = this;
    const { width: W, height: H } = this.app.screen;
    this.W = W; this.H = H;
    const horizon = H * 0.5;
    this.sceneryLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.celestial.removeChildren();
    this.cloudLayer.removeChildren();
    this.stars.length = 0;
    this.fireflies.length = 0;
    this.skySprites.forEach((s) => { s.width = W; s.height = H; });
    this.skyLayer.removeChild(this.celestial);
    this.skyLayer.removeChild(this.cloudLayer);

    for (let i = 0; i < 36; i += 1) {
      const star = new PIXI.Graphics().circle(0, 0, 1.2 + Math.random() * 1.6).fill(0xffffff);
      star.position.set(Math.random() * W, Math.random() * horizon * 0.95);
      star.phase = Math.random() * 6;
      this.celestial.addChild(star);
      this.stars.push(star);
    }
    this.celestial.addChild(this.sun, this.moon);
    for (let i = 0; i < 4; i += 1) {
      const cloud = buildCloud(PIXI, 34 + Math.random() * 26);
      cloud.position.set(Math.random() * W, 30 + Math.random() * horizon * 0.5);
      cloud.speed = 6 + Math.random() * 9;
      this.cloudLayer.addChild(cloud);
    }
    this.skyLayer.addChild(this.celestial, this.cloudLayer);

    const scenery = this.sceneryLayer;
    scenery.addChild(hills(PIXI, W, H, horizon - H * 0.07, H * 0.045, 0x8ccf7d, 0.4, 1.5));
    scenery.addChild(hills(PIXI, W, H, horizon + H * 0.01, H * 0.035, 0x6fbe5e, 2.2, 1.9));
    const tree = buildTree(PIXI, H * 0.32, 0x4aa84f); tree.position.set(W * 0.88, horizon + H * 0.08); scenery.addChild(tree);
    const tree2 = buildTree(PIXI, H * 0.22, 0x5bb85e); tree2.position.set(W * 0.7, horizon + H * 0.03); scenery.addChild(tree2);
    const barn = buildBarn(PIXI, Math.min(W * 0.4, H * 0.5)); barn.position.set(W * 0.2, horizon + H * 0.06); scenery.addChild(barn);
    scenery.addChild(hills(PIXI, W, H, horizon + H * 0.09, H * 0.02, 0x58ad4c, 4.5, 1.2));
    const fence = buildFence(PIXI, W - 40); fence.position.set(14, horizon + H * 0.1); fence.scale.set(0.8); scenery.addChild(fence);
    const ground = new PIXI.Graphics().rect(0, horizon + H * 0.1, W, H).fill(0x4f9f44);
    scenery.addChild(ground);
    scenery.addChild(hills(PIXI, W, H, horizon + H * 0.1, 3, 0x4f9f44, 1, 3));
    this.tufts = [];
    for (let i = 0; i < 16; i += 1) {
      const tuft = buildGrassTuft(PIXI);
      tuft.position.set(Math.random() * W, horizon + H * 0.14 + Math.random() * H * 0.34);
      tuft.phase = Math.random() * 6;
      scenery.addChild(tuft); this.tufts.push(tuft);
    }
    [0xff6b9a, 0xffd93d, 0xffffff, 0xb28cff].forEach((color, i) => {
      for (let n = 0; n < 3; n += 1) { const f = buildFlower(PIXI, color); f.position.set(Math.random() * W, horizon + H * 0.15 + Math.random() * H * 0.3); f.scale.set(0.8 + Math.random() * 0.5); scenery.addChild(f); }
    });
    const shelfY = H * 0.865;
    scenery.addChild(new PIXI.Graphics().roundRect(10, shelfY, W - 20, H * 0.135 - 6, 16).fill(0xc58b4e).roundRect(10, shelfY, W - 20, 12, 8).fill(0xdba86a).roundRect(10, shelfY + 12, W - 20, 4, 2).fill({ color: 0x000000, alpha: 0.12 }));
    for (let i = 0; i < 10; i += 1) {
      const f = new PIXI.Graphics().circle(0, 0, 2.6).fill({ color: 0xffd93d, alpha: 0.9 });
      f.position.set(Math.random() * W, horizon * (0.3 + Math.random() * 0.9));
      f.phase = Math.random() * 6;
      this.skyLayer.addChild(f); f.visible = false;
      this.fireflies.push(f);
    }
    this.layer = { horizon };
  }

  layout() {
    const { W, H } = this;
    const n = this.actors.length;
    const slots = SLOTS[n];
    const s = Math.min(W / (n <= 3 ? 460 : 420), H / (n <= 3 ? 640 : 760));
    this.actors.forEach((actor, i) => {
      const [fx, fy] = slots[i];
      const depth = 0.84 + 0.16 * clamp((fy - 0.58) / 0.22, 0, 1);
      actor.base = s * depth;
      actor.cx = W * fx; actor.cy = H * fy;
      actor.root.position.set(actor.cx, actor.cy);
      actor.root.scale.set(actor.base);
      actor.root.zIndex = actor.cy;
      actor.bubble.position.set(actor.cx, actor.cy - 272 * actor.base);
      actor.bubble.base = actor.bubble.position.y;
      actor.bubble.scale.set(clamp(actor.base * 1.35, 0.7, 1.15));
    });
    const fs = Math.min(1.3, W / (n * 88));
    this.foods.forEach((food, i) => {
      food.home = { x: W * (0.12 + (0.76 * (i + 0.5)) / n) - W * 0.0, y: H * 0.93 };
      if (!food.dragging) { food.position.set(food.home.x, food.home.y); food.scale.set(fs); }
      food.baseScale = fs;
    });
    this.badges.forEach((badge, i) => badge.position.set(34 + i * 44, 32));
    this.badgeBack.clear().roundRect(8, 8, 52 + (n - 1) * 44 - 8 + 8, 48, 24).fill({ color: 0x000000, alpha: 0.22 });
    this.basket.position.set(W - 48, 18);
    this.renderBasket();
  }

  // ---------- jogo ----------
  say(item, text) { this.audio?.play?.(item?.audio || null, text || item?.label); }

  touchActor(actor) {
    if (this.finished) return;
    this.idle = 0;
    playSfx('pop');
    this.squash(actor);
    this.say(actor.item, actor.item.label);
    const { parts } = actor;
    this.particles.burst(actor.cx, actor.cy - 130 * actor.base, 'note', 3, { tint: [0xffffff, 0xffd93d], speed: 140, gravity: -60, life: 1.1, size: 1.1, spread: 1.2 });
    this.nod(actor, 2);
    if (parts.eyes && actor.fed && actor.def.id === 'galinha') this.layEgg(actor);
  }

  squash(actor, power = 0.2) {
    const b = actor.base;
    this.tweens.run(520, ease.outElastic, (k) => actor.root.scale.set(b * (1 + power * (1 - k)), b * (1 - power * (1 - k))));
  }

  nod(actor, times = 3, ms = 220) {
    const { head, mouth } = actor.parts;
    let n = 0;
    const once = () => {
      if (this.destroyed || n >= times) { mouth && (mouth.visible = false); return; }
      n += 1;
      if (mouth) mouth.visible = true;
      this.tweens.run(ms, ease.inOutSine, (k) => { const v = Math.sin(k * Math.PI); head.scale.set(1 + 0.06 * v, 1 - 0.1 * v); head.y = -120 + 8 * v; }, () => { if (mouth) mouth.visible = false; once(); });
    };
    once();
  }

  shake(actor) {
    const r = actor.root;
    this.tweens.run(520, ease.linear, (k) => { r.rotation = Math.sin(k * Math.PI * 6) * 0.09 * (1 - k); });
    const { eyes } = actor.parts;
    if (eyes) this.tweens.run(300, ease.inOutSine, (k) => { eyes.scale.y = 1 - 0.7 * Math.sin(k * Math.PI); });
  }

  onFoodDown(food, event) {
    if (this.finished || food.used || this.drag) return;
    this.idle = 0;
    const p = event.global;
    this.drag = { food, startX: p.x, startY: p.y, ox: food.x - p.x, oy: food.y - p.y, moved: false };
    food.dragging = true;
    this.foodLayer.addChild(food);
    this.tweens.to(food.scale, { x: food.baseScale * 1.25, y: food.baseScale * 1.25 }, 140, ease.outBack);
    playSfx('tap');
  }

  onMove(event) {
    const d = this.drag;
    if (!d) return;
    const p = event.global;
    if (Math.abs(p.x - d.startX) + Math.abs(p.y - d.startY) > 10) d.moved = true;
    if (d.moved) d.food.position.set(p.x + d.ox, p.y + d.oy - 20);
  }

  onUp(event) {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    const { food } = d;
    food.dragging = false;
    this.attempts += 1;
    if (!d.moved) {
      // toque simples: os menores alimentam sozinho; os maiores ganham uma dica.
      if (TAP_ASSIST.has(this.ageId)) return this.feed(food.actor, food);
      this.glideHome(food);
      return this.hint(food.actor);
    }
    const target = this.nearestActor(food.x, food.y);
    if (!target) return this.glideHome(food);
    if (target === food.actor) return this.feed(target, food);
    this.wrong += 1;
    playSfx('retry');
    this.shake(target);
    this.glideHome(food);
  }

  nearestActor(x, y) {
    let best = null; let bestD = Infinity;
    this.actors.forEach((a) => {
      if (a.fed) return;
      const d = Math.hypot(a.cx - x, (a.cy - 100 * a.base) - y);
      if (d < bestD) { bestD = d; best = a; }
    });
    return best && bestD < Math.max(95, 120 * best.base) ? best : null;
  }

  glideHome(food) {
    const from = { x: food.x, y: food.y };
    this.tweens.run(380, ease.outBack, (k) => { food.position.set(from.x + (food.home.x - from.x) * k, from.y + (food.home.y - from.y) * k); });
    this.tweens.to(food.scale, { x: food.baseScale, y: food.baseScale }, 260, ease.outQuad);
  }

  hint(actor) {
    if (!actor || this.finished) return;
    const food = actor.food;
    if (food && !food.used) this.tweens.run(700, ease.linear, (k) => { food.art.rotation = Math.sin(k * Math.PI * 6) * 0.25 * (1 - k); });
    const b = actor.bubble;
    this.tweens.run(600, ease.linear, (k) => { b.scale.set(clamp(actor.base * 1.35, 0.7, 1.15) * (1 + 0.25 * Math.sin(k * Math.PI))); });
  }

  feed(actor, food) {
    if (actor.fed) return;
    actor.fed = true;
    food.used = true;
    food.eventMode = 'none';
    this.fedCount += 1;
    this.targetP = 0.6 + (this.fedCount / this.total) * 2.4;
    const mouthX = actor.cx; const mouthY = actor.cy - 128 * actor.base;
    const from = { x: food.x, y: food.y };
    const sc = food.scale.x;
    this.tweens.run(320, ease.outQuad, (k) => { food.position.set(from.x + (mouthX - from.x) * k, from.y + (mouthY - from.y) * k - Math.sin(k * Math.PI) * 50); food.scale.set(sc * (1 - 0.6 * k)); food.alpha = 1 - 0.3 * k; }, () => {
      food.visible = false;
      playSfx('success');
      this.nod(actor, 3, 200);
      this.squash(actor, 0.14);
      this.particles.burst(actor.cx, actor.cy - 150 * actor.base, 'heart', this.calm ? 4 : 9, { speed: 210, gravity: 120, life: 1.2, size: 1.1, spread: Math.PI * 1.1 });
      this.particles.burst(actor.cx, actor.cy - 120 * actor.base, 'star', this.calm ? 3 : 7, { speed: 260, gravity: 340, life: 0.9, size: 0.9 });
      this.say(actor.item, actor.item.label);
    });
    this.tweens.run(260, ease.outBack, (k) => { actor.bubble.scale.set(clamp(actor.base * 1.35, 0.7, 1.15) * (1 - k)); }, () => { actor.bubble.visible = false; });
    const badge = this.badges[this.actors.indexOf(actor)];
    this.tweens.run(500, ease.outElastic, (k) => { badge.alpha = 0.5 + 0.5 * k; badge.scale.set(1 + 0.3 * (1 - k)); });
    if (actor.def.id === 'galinha') window.setTimeout(() => !this.destroyed && this.layEgg(actor), 1100);
    if (this.fedCount >= this.total) window.setTimeout(() => !this.destroyed && this.goodNight(), 1700);
  }

  layEgg(hen) {
    if (this.destroyed || this.pendingEgg || this.eggs >= MAX_EGGS) return;
    const egg = buildEgg(this.PIXI);
    const x = hen.cx + 78 * hen.base; const y = hen.cy - 8;
    egg.position.set(x, y - 30); egg.scale.set(0);
    egg.eventMode = 'static'; egg.cursor = 'pointer'; egg.hitArea = new this.PIXI.Circle(0, 0, 40);
    this.fxLayer.addChild(egg);
    this.pendingEgg = egg;
    playSfx('pop');
    this.squash(hen, 0.12);
    this.tweens.run(520, ease.outBounce || ease.outBack, (k) => { egg.scale.set(1.1 * k); egg.y = y - 30 + 30 * k; });
    this.particles.burst(x, y - 10, 'spark', 6, { tint: 0xfff2b0, speed: 120, gravity: 60, life: 0.7 });
    egg.once('pointertap', () => this.collectEgg(egg));
  }

  collectEgg(egg) {
    if (!this.pendingEgg) return;
    this.pendingEgg = null;
    this.idle = 0;
    egg.eventMode = 'none';
    this.eggs += 1;
    const n = this.eggs;
    this.basket.visible = true;
    const from = { x: egg.x, y: egg.y };
    const to = { x: this.basket.x, y: this.basket.y + 6 };
    playSfx('tap');
    this.audio?.play?.(`num-${n}`, NUMBER_WORDS[n] || String(n));
    this.tweens.run(520, ease.outCubic, (k) => { egg.position.set(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 70); egg.scale.set(1.1 - 0.5 * k); }, () => {
      egg.destroy();
      this.renderBasket();
      this.particles.burst(to.x, to.y, 'star', 5, { speed: 150, gravity: 200, life: 0.7, size: 0.8 });
      this.tweens.run(360, ease.outElastic, (k) => this.basket.scale.set(1 + 0.25 * (1 - k)));
    });
  }

  renderBasket() {
    this.basketEggs.removeChildren().forEach((c) => c.destroy());
    for (let i = 0; i < this.eggs; i += 1) {
      const e = buildEgg(this.PIXI);
      e.scale.set(0.9);
      e.position.set(-24 + (i % 3) * 24, -6 - Math.floor(i / 3) * 14);
      this.basketEggs.addChild(e);
    }
    this.basket.visible = this.eggs > 0;
  }

  goodNight() {
    if (this.finished) return;
    this.finished = true;
    this.sleeping = true;
    this.targetP = 3;
    playSfx('celebrate');
    this.audio?.play?.('boa-noite-ate-amanha.mp3', 'Boa noite, até amanhã!');
    [392, 329.63, 261.63, 329.63, 392, 523.25].forEach((freq, i) => window.setTimeout(() => !this.destroyed && playNote(freq, 0.9), 2200 + i * 520));
    window.setTimeout(() => !this.destroyed && this.complete(), 6200);
  }

  complete() {
    this.onComplete?.({ mode: 'explore', score: this.fedCount, rounds: 1, correct: this.fedCount, attempts: this.attempts, maxScore: this.total, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId, extra: { eggs: this.eggs } });
  }

  // ---------- quadro a quadro ----------
  update(ticker) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, ticker.deltaMS / 1000);
    const { W, H } = this;
    this.time += dt;
    this.idle += dt;
    if (this.idle > 9 && !this.finished) {
      this.idle = 5;
      this.hint(this.actors.find((a) => !a.fed));
    }
    this.p += (this.targetP - this.p) * Math.min(1, dt * 1.4);
    const p = this.p;
    this.skySprites.forEach((s, i) => { s.alpha = i === 0 ? 1 : clamp(p - (i - 1), 0, 1); });
    const tint = lightAt(p);
    this.sceneryLayer.tint = tint;
    this.world.tint = tint;
    this.cloudLayer.tint = mixColor(0xffffff, 0x8a94d8, clamp((p - 1.6) / 1.2, 0, 1));
    const arc = clamp(p / 2.7, 0, 1);
    this.sun.position.set(W * (0.08 + 0.84 * arc), this.layer.horizon * 0.95 - Math.sin(Math.PI * arc) * this.layer.horizon * 0.78);
    this.sun.alpha = 1 - clamp((p - 2.3) / 0.5, 0, 1);
    this.sun.tint = p > 1.8 ? mixColor(0xffffff, 0xff9a5a, clamp((p - 1.8) / 0.5, 0, 1)) : 0xffffff;
    const night = clamp((p - 2.2) / 0.8, 0, 1);
    this.moon.position.set(W * 0.78, H * 0.14);
    this.moon.alpha = night;
    this.stars.forEach((s) => { s.alpha = night * (0.55 + 0.45 * Math.sin(this.time * 2 + s.phase)); });
    this.cloudLayer.children.forEach((c) => { if (!this.calm) { c.x += c.speed * dt; if (c.x > W + 80) c.x = -80; } });
    this.tufts.forEach((t) => { t.rotation = Math.sin(this.time * 1.8 + t.phase) * 0.12; });
    this.fireflies.forEach((f) => {
      f.visible = night > 0.6;
      f.alpha = 0.5 + 0.5 * Math.sin(this.time * 3 + f.phase);
      f.x += Math.cos(this.time * 0.7 + f.phase) * 18 * dt;
      f.y += Math.sin(this.time * 0.9 + f.phase * 1.3) * 14 * dt;
    });

    this.actors.forEach((a) => {
      const { parts } = a;
      const t = this.time + a.phase;
      const breath = this.sleeping ? Math.sin(t * 1.2) * 0.025 : Math.sin(t * 2.4) * 0.018;
      parts.body.scale.y = 1 + breath;
      parts.body.scale.x = 1 - breath * 0.5;
      parts.head.rotation = Math.sin(t * 1.5) * (this.sleeping ? 0.05 : 0.03);
      if (parts.tail) parts.tail.rotation = Math.sin(t * (a.fed ? 9 : 4)) * (a.def.id === 'cachorro' ? 0.35 : 0.15);
      parts.ears.forEach((e, i) => { e.rotation += (Math.sin(t * 2 + i) * 0.04) * 0.2; });
      if (parts.wing) parts.wing.rotation = 0.32 + Math.sin(t * 3) * 0.04;
      if (parts.eyes) {
        if (this.sleeping) parts.eyes.scale.y += (0.08 - parts.eyes.scale.y) * Math.min(1, dt * 4);
        else {
          a.blink -= dt;
          if (a.blink <= 0) { a.blinking = 0.14; a.blink = 2 + Math.random() * 3; }
          if (a.blinking > 0) { a.blinking -= dt; parts.eyes.scale.y = 0.1; } else if (parts.eyes.scale.y < 1) parts.eyes.scale.y = Math.min(1, parts.eyes.scale.y + dt * 8);
        }
      }
      if (!a.fed && a.bubble.visible) a.bubble.y = a.bubble.base + Math.sin(t * 3) * 5;
      if (this.sleeping && !this.calm && Math.random() < dt * 0.7) this.particles.burst(a.cx + 30 * a.base, a.cy - 190 * a.base, 'zzz', 1, { tint: 0xcfd8ff, speed: 40, gravity: -30, life: 1.8, size: 1.1, spread: 0.6 });
    });
  }

  stop() {
    this.destroyed = true;
    if (this.inner) { this.inner.stop?.(); return; }
    try {
      this.tweens?.destroy();
      this.particles?.destroy();
      this.app?.ticker?.remove(this.update, this);
      this.app?.destroy(true, { children: true, texture: true });
    } catch (error) { /* a tela já foi trocada */ }
    this.app = null;
  }
}
