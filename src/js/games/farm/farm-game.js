import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playNote } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { canRunPixi, createStage } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import { FarmLiteGame } from './farm-lite.js';
import * as art from './art.js';

// Fazendinha Viva — uma "sessão" completa, em três atos:
//  1) Manhã: os bichos acordam com fome; a criança leva a comida certa a cada um.
//  2) Tarde: a horta; regar, ver crescer e colher (a colheita e os ovos são contados em voz alta).
//  3) Noite: o céu escurece, vaga-lumes aparecem e todos dormem ao som de uma cantiga.
// A cada visita a fazenda ganha uma novidade (borboletas, moinho, balão, arco-íris, pintinho).
const { PALETTE: C } = art;

const ROSTER = [
  { id: 'vaca', food: 'feno' },
  { id: 'galinha', food: 'milho' },
  { id: 'cachorro', food: 'osso' },
  { id: 'gato', food: 'peixe' },
  { id: 'pato', food: 'alface' }
];
const VEGGIES = ['cenoura', 'tomate', 'abobora'];
const COUNT_BY_AGE = { '6-12m': 2, '12-18m': 2, '18-24m': 3, '2-3y': 3, '3-4y': 4, '4-5y': 5 };
const TAP_ASSIST = new Set(['6-12m', '12-18m']);
const SLOTS = {
  2: [[0.3, 0.72], [0.7, 0.72]],
  3: [[0.2, 0.68], [0.5, 0.76], [0.8, 0.68]],
  4: [[0.14, 0.72], [0.38, 0.78], [0.62, 0.72], [0.86, 0.78]],
  5: [[0.12, 0.72], [0.31, 0.78], [0.5, 0.72], [0.69, 0.78], [0.88, 0.72]]
};
const SKY = [['#ff9ec4', '#ffe9a8'], ['#27b9f0', '#bff3ff'], ['#7a3fd0', '#ff9a4d'], ['#10154f', '#4a3f9a']];
const LIGHT = [0xffe0d0, 0xffffff, 0xffc9a0, 0x7a86d0];
const NUMBER_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis'];
const MAX_EGGS = 3;
const UNLOCKS = [
  { id: 'borboletas', at: 2 }, { id: 'moinho', at: 3 }, { id: 'balao', at: 4 }, { id: 'arcoiris', at: 5 }, { id: 'pintinho', at: 6 }
];
const STORE_KEY = 'ab_farm_v1';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mixColor = (a, b, k) => {
  const ar = (a >> 16) & 255; const ag = (a >> 8) & 255; const ab = a & 255;
  const br = (b >> 16) & 255; const bg = (b >> 8) & 255; const bb = b & 255;
  return ((ar + (br - ar) * k) << 16) | ((ag + (bg - ag) * k) << 8) | (ab + (bb - ab) * k);
};
const lightAt = (p) => { const i = clamp(Math.floor(p), 0, 2); return mixColor(LIGHT[i], LIGHT[i + 1], clamp(p - i, 0, 1)); };

function loadProgress() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, eggs: Number(v.eggs) || 0, harvest: Number(v.harvest) || 0 }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, eggs: 0, harvest: 0 };
}
function saveProgress(progress) { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (error) { /* sem armazenamento */ } }

// Modo lite: aparelhos antigos, sem WebGL, com pouca memória ou escolhido pela família.
export function shouldUseLite() {
  try {
    if (localStorage.getItem('ab_lite_graphics') === '1') return true;
    if (document.documentElement.classList.contains('lite')) return true;
    if (navigator.deviceMemory && navigator.deviceMemory < 2) return true;
  } catch (error) { /* ignora */ }
  return !canRunPixi();
}

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
    this.level = level;
    this.options = options;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'farm-back',
      title: '🌾 Fazendinha',
      body: '<div class="farm-stage" id="farm-stage" aria-label="Fazendinha: leve a comida para cada bichinho"></div>'
    });
    this.container.querySelector('#farm-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Fazendinha: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new FarmLiteGame(this.container.id, this.audio, this.onComplete, this.onBack);
    this.inner.start(this.items, this.level, this.options);
  }

  async init() {
    const host = this.container.querySelector('#farm-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    // Gancho de teste (scripts/farm-test.mjs): só existe em desenvolvimento ou com ab_test_hook=1.
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__farm = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, fedCount: 0, attempts: 0, wrong: 0, collected: [], pendingEgg: null, eggsLaid: 0, harvested: 0, watered: 0, phase: 'feed', finished: false, sleeping: false, idle: 0, targetP: 0.6, p: 0.6, drag: null, beds: [], butterflies: [], birds: [], chick: null, chickHop: 0 });

    this.progress = loadProgress();
    this.progress.visits += 1;
    saveProgress(this.progress);
    this.unlocked = new Set(UNLOCKS.filter((u) => u.at <= this.progress.visits).map((u) => u.id));
    this.fresh = UNLOCKS.find((u) => u.at === this.progress.visits)?.id || null;

    const count = clamp(COUNT_BY_AGE[this.ageId] || 3, 2, app.screen.width < 520 ? 4 : 5);
    const picked = ROSTER.slice().sort(() => Math.random() - 0.5).slice(0, count);
    this.total = picked.length;
    this.bedCount = this.total <= 2 ? 2 : 3;
    this.veggies = VEGGIES.slice().sort(() => Math.random() - 0.5).slice(0, this.bedCount);

    this.skyLayer = new PIXI.Container();
    this.sceneryLayer = new PIXI.Container();
    this.world = new PIXI.Container();
    this.world.sortableChildren = true;
    this.flyLayer = new PIXI.Container();
    this.fxLayer = new PIXI.Container();
    this.grain = new PIXI.TilingSprite({ texture: art.grainTexture(PIXI), width: 10, height: 10 });
    this.grain.alpha = 0.055;
    this.hudLayer = new PIXI.Container();
    this.foodLayer = new PIXI.Container();
    this.particles = new Particles(PIXI, app);
    // Camadas só de enfeite não podem interceptar toques (o Pixi pararia a busca no primeiro objeto sob o dedo).
    [this.grain, this.flyLayer, this.hudLayer, this.particles.layer].forEach((layer) => { layer.eventMode = 'none'; });
    app.stage.addChild(this.skyLayer, this.sceneryLayer, this.world, this.flyLayer, this.fxLayer, this.grain, this.hudLayer, this.foodLayer, this.particles.layer);

    this.skySprites = SKY.map(([top, bottom]) => { const s = new PIXI.Sprite(art.skyTexture(PIXI, top, bottom)); this.skyLayer.addChild(s); return s; });
    this.sun = art.buildSun(PIXI);
    this.moon = art.buildMoon(PIXI);
    this.celestial = new PIXI.Container();
    this.cloudLayer = new PIXI.Container();
    this.stars = [];
    this.fireflies = [];

    this.actors = picked.map((def) => this.makeActor(def));
    this.makeHud();
    this.makeFoods();
    this.makeCan();
    this.spawnChick();
    this.buildScenery();
    this.layout();
    this.pickUpFresh();

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
    const parts = art.buildAnimal(PIXI, def.id);
    const actor = { def, item: this.animalItem(def.id), parts, root: parts.root, fed: false, phase: Math.random() * 6, blink: 1 + Math.random() * 3, blinking: 0, base: 1, cx: 0, cy: 0 };
    parts.root.eventMode = 'static';
    parts.root.cursor = 'pointer';
    parts.root.hitArea = new PIXI.Rectangle(-85, -220, 170, 225);
    parts.root.on('pointertap', () => this.touchActor(actor));
    this.world.addChild(parts.root);
    actor.bubble = this.makeBubble(def.food);
    this.fxLayer.addChild(actor.bubble);
    return actor;
  }

  makeBubble(food) {
    const { PIXI } = this;
    const bubble = new PIXI.Container();
    bubble.eventMode = 'none';
    bubble.addChild(new PIXI.Graphics().poly([-11, 26, 11, 26, 0, 44]).fill(0xffffff).circle(0, 0, 38).fill(0xffffff).circle(0, 0, 38).stroke({ width: 4, color: C.sun }));
    const icon = art.buildFood(PIXI, food);
    icon.scale.set(0.66);
    bubble.addChild(icon);
    return bubble;
  }

  makeFoods() {
    const { PIXI } = this;
    this.foods = this.actors.map((actor) => {
      const food = new PIXI.Container();
      food.addChild(new PIXI.Graphics().circle(0, 0, 44).fill({ color: 0xffffff, alpha: 0.001 }));
      food.art = art.buildFood(PIXI, actor.def.food);
      food.addChild(food.art);
      Object.assign(food, { hitArea: new PIXI.Circle(0, 0, 50), eventMode: 'static', cursor: 'grab', actor, used: false });
      food.on('pointerdown', (e) => this.onItemDown(food, e));
      this.foodLayer.addChild(food);
      actor.food = food;
      return food;
    });
  }

  makeCan() {
    const { PIXI } = this;
    const can = new PIXI.Container();
    can.addChild(new PIXI.Graphics().circle(0, 0, 44).fill({ color: 0xffffff, alpha: 0.001 }));
    can.art = art.buildWateringCan(PIXI);
    can.addChild(can.art);
    Object.assign(can, { hitArea: new PIXI.Circle(0, 0, 52), eventMode: 'static', cursor: 'grab', isCan: true, visible: false });
    can.on('pointerdown', (e) => this.onItemDown(can, e));
    this.foodLayer.addChild(can);
    this.can = can;
  }

  makeHud() {
    const { PIXI } = this;
    this.badgeBack = new PIXI.Graphics();
    this.hudLayer.addChild(this.badgeBack);
    this.badges = this.actors.map((actor) => this.makeBadge(actor.def.food));
    this.basket = new PIXI.Container();
    const b = new PIXI.Graphics();
    b.roundRect(-40, -4, 80, 40, 12).fill(0xb5773a).roundRect(-40, -4, 80, 11, 5).fill(0x8d5a2b);
    for (let x = -26; x <= 26; x += 13) b.moveTo(x, 9).lineTo(x, 32).stroke({ width: 2.4, color: 0x8d5a2b });
    this.basketItems = new PIXI.Container();
    this.basket.addChild(this.basketItems, b);
    this.basket.visible = false;
    this.hudLayer.addChild(this.basket);
  }

  makeBadge(kind) {
    const { PIXI } = this;
    const badge = new PIXI.Container();
    badge.addChild(new PIXI.Graphics().circle(0, 0, 20).fill({ color: 0xffffff, alpha: 0.95 }).circle(0, 0, 20).stroke({ width: 3, color: C.sun }));
    const icon = art.buildFood(PIXI, kind);
    icon.scale.set(0.35);
    badge.addChild(icon);
    badge.alpha = 0.5;
    this.hudLayer.addChild(badge);
    return badge;
  }

  buildScenery() {
    const { PIXI } = this;
    const { width: W, height: H } = this.app.screen;
    this.W = W; this.H = H;
    const horizon = H * 0.5;
    this.horizon = horizon;
    this.sceneryLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.celestial.removeChildren();
    this.cloudLayer.removeChildren();
    this.flyLayer.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.skyLayer.children.slice(SKY.length).forEach((c) => { this.skyLayer.removeChild(c); if (![this.celestial, this.cloudLayer].includes(c)) c.destroy({ children: true }); });
    this.stars.length = 0; this.fireflies.length = 0; this.butterflies.length = 0; this.birds.length = 0;
    this.skySprites.forEach((s) => { s.width = W; s.height = H; });
    this.grain.width = W; this.grain.height = H;

    for (let i = 0; i < 40; i += 1) {
      const star = new PIXI.Graphics().circle(0, 0, 1.3 + Math.random() * 1.8).fill(i % 5 === 0 ? 0xffe14d : 0xffffff);
      star.position.set(Math.random() * W, Math.random() * horizon * 0.95);
      star.phase = Math.random() * 6;
      this.celestial.addChild(star); this.stars.push(star);
    }
    this.celestial.addChild(this.sun, this.moon);
    [[0.18, 0.16, 40], [0.52, 0.1, 30], [0.86, 0.22, 36], [0.7, 0.34, 24]].forEach(([fx, fy, size]) => {
      const cloud = art.buildCloud(PIXI, size);
      cloud.position.set(W * fx, H * fy);
      cloud.speed = 5 + Math.random() * 8;
      this.cloudLayer.addChild(cloud);
    });
    if (this.unlocked.has('arcoiris')) {
      this.rainbow = art.buildRainbow(PIXI, Math.min(W * 0.95, H * 0.8));
      this.rainbow.position.set(W * 0.5, horizon + H * 0.02);
      this.skyLayer.addChild(this.rainbow);
    } else this.rainbow = null;
    this.skyLayer.addChild(this.celestial, this.cloudLayer);
    for (let i = 0; i < 3; i += 1) { const bird = art.buildBird(PIXI, C.ink); bird.position.set(-60 - i * 34, H * (0.12 + (i % 2) * 0.05)); bird.scale.set(0.7); bird.phase = i; this.skyLayer.addChild(bird); this.birds.push(bird); }
    if (this.unlocked.has('balao')) {
      this.balloon = art.buildBalloon(PIXI, Math.min(70, W * 0.18));
      this.balloon.position.set(W * 0.72, H * 0.3);
      this.skyLayer.addChild(this.balloon);
    } else this.balloon = null;

    const S = this.sceneryLayer;
    S.addChild(art.patternHill(PIXI, W, H, horizon - H * 0.07, H * 0.045, 0.4, 1.5, 0x2fc4a8, 0x62e8cc, 'stripes'));
    S.addChild(art.patternHill(PIXI, W, H, horizon + H * 0.012, H * 0.035, 2.2, 1.9, 0x8fe04d, 0xc6f57a, 'dots'));
    if (this.unlocked.has('moinho')) {
      this.windmill = art.buildWindmill(PIXI, Math.min(H * 0.24, W * 0.34));
      this.windmill.position.set(W * 0.6, horizon + H * 0.03);
      S.addChild(this.windmill);
    } else this.windmill = null;
    const tree = art.buildTree(PIXI, H * 0.34, 0x2fb85a); tree.position.set(W * 0.9, horizon + H * 0.09); S.addChild(tree);
    const pine = art.buildTree(PIXI, H * 0.26, 0x35c46a, 'pine'); pine.position.set(W * 0.72, horizon + H * 0.045); S.addChild(pine);
    const barn = art.buildBarn(PIXI, Math.min(W * 0.46, H * 0.55)); barn.position.set(W * 0.22, horizon + H * 0.045); S.addChild(barn);
    const bunting = art.buildBunting(PIXI, W * 0.5, 26); bunting.position.set(W * 0.22, horizon - H * 0.065); S.addChild(bunting);
    this.bunting = bunting;
    S.addChild(art.patternHill(PIXI, W, H, horizon + H * 0.1, H * 0.018, 4.5, 1.2, 0x45c765, 0x2fa84f, 'zigzag'));
    const fence = art.buildFence(PIXI, W - 40); fence.position.set(14, horizon + H * 0.115); fence.scale.set(0.78); S.addChild(fence);
    const ground = new PIXI.Graphics().rect(0, horizon + H * 0.115, W, H).fill(0x3dc15d);
    for (let y = horizon + H * 0.14, i = 0; y < H; y += 34, i += 1) if (i % 2) ground.rect(0, y, W, 17).fill({ color: 0x2fae52, alpha: 0.5 });
    S.addChild(ground);
    this.tufts = [];
    for (let i = 0; i < 16; i += 1) { const tuft = art.buildGrassTuft(PIXI); tuft.position.set(Math.random() * W, horizon + H * 0.15 + Math.random() * H * 0.33); tuft.phase = Math.random() * 6; S.addChild(tuft); this.tufts.push(tuft); }
    [C.magenta, C.sun, C.white, C.purple, C.orange, C.sky].forEach((color, i) => { for (let n = 0; n < 2; n += 1) { const f = art.buildFlower(PIXI, color, i % 2 === 0); f.position.set(Math.random() * W, horizon + H * 0.16 + Math.random() * H * 0.3); f.scale.set(0.85 + Math.random() * 0.5); S.addChild(f); } });
    const shelfY = H * 0.865;
    S.addChild(new PIXI.Graphics().roundRect(8, shelfY, W - 16, H * 0.135 - 4, 18).fill(0xc9854a).roundRect(8, shelfY, W - 16, 13, 9).fill(0xe3a566).roundRect(8, shelfY + 13, W - 16, 4, 2).fill({ color: 0x000000, alpha: 0.14 }));
    for (let x = 30, i = 0; x < W - 20; x += 44, i += 1) S.addChild(new PIXI.Graphics().poly([x, shelfY + 26, x + 14, shelfY + 26, x + 7, shelfY + 36]).fill({ color: [C.teal, C.sun, C.magenta][i % 3], alpha: 0.8 }));
    for (let i = 0; i < 10; i += 1) { const f = new PIXI.Graphics().circle(0, 0, 3).fill(0xffe14d); f.position.set(Math.random() * W, horizon * (0.3 + Math.random() * 0.9)); f.phase = Math.random() * 6; f.visible = false; this.skyLayer.addChild(f); this.fireflies.push(f); }

    if (this.unlocked.has('borboletas')) {
      [C.magenta, C.sky, C.orange].forEach((color, i) => { const b = art.buildButterfly(PIXI, color); b.phase = i * 2.1; b.cx = W * (0.25 + i * 0.25); b.cy = H * (0.58 + (i % 2) * 0.08); this.flyLayer.addChild(b); this.butterflies.push(b); });
    }
    this.sun.scale.set(clamp(W / 420, 0.7, 1.1)); this.moon.scale.set(clamp(W / 420, 0.7, 1.1));
  }

  layout() {
    const { W, H } = this;
    const n = this.actors.length;
    const slots = SLOTS[n];
    const s = n <= 3 ? Math.min(W / 450, H / 640) : Math.min(W / (n * 148), H / 700);
    this.actors.forEach((actor, i) => {
      const [fx, fy] = slots[i];
      const depth = 0.9 + 0.1 * clamp((fy - 0.66) / 0.14, 0, 1);
      actor.base = s * depth;
      actor.cx = W * fx; actor.cy = H * fy;
      actor.root.position.set(actor.cx, actor.cy);
      actor.root.scale.set(actor.base);
      actor.root.zIndex = actor.cy;
      actor.bubble.position.set(actor.cx, actor.cy - 276 * actor.base);
      actor.bubble.base = actor.bubble.position.y;
      actor.bubbleScale = clamp(actor.base * 1.35, 0.7, 1.15);
      actor.bubble.scale.set(actor.bubbleScale);
    });
    const fs = Math.min(1.3, W / (n * 88));
    this.foods.forEach((food, i) => {
      food.home = { x: W * (0.12 + (0.76 * (i + 0.5)) / n), y: H * 0.93 };
      if (!food.dragging) { food.position.set(food.home.x, food.home.y); food.scale.set(fs); }
      food.baseScale = fs;
    });
    this.can.home = { x: W * 0.5, y: H * 0.93 };
    this.can.baseScale = Math.min(1.25, W / 300);
    if (!this.can.dragging && !this.can.visible) this.can.position.set(this.can.home.x, this.can.home.y);
    this.layoutBadges();
    this.basket.position.set(W - 52, 16);
    this.renderBasket();
    this.beds.forEach((bed, i) => { bed.root.position.set(...this.bedPos(i)); });
  }

  layoutBadges() {
    const list = this.activeBadges || this.badges;
    list.forEach((badge, i) => badge.position.set(34 + i * 46, 34));
    this.badgeBack.clear().roundRect(8, 8, 18 + list.length * 46, 52, 26).fill({ color: C.navy, alpha: 0.28 });
  }

  bedPos(i) {
    const n = this.bedCount;
    return [this.W * (n === 2 ? (i ? 0.7 : 0.3) : 0.2 + 0.3 * i), this.H * 0.845];
  }

  // ---------- jogo: manhã ----------
  say(item, text) { this.audio?.play?.(item?.audio || null, text || item?.label); }

  touchActor(actor) {
    if (this.finished) return;
    this.idle = 0;
    playSfx('pop');
    this.squash(actor);
    this.say(actor.item, actor.item.label);
    this.particles.burst(actor.cx, actor.cy - 140 * actor.base, 'note', 3, { tint: [0xffffff, C.sun, C.pink], speed: 150, gravity: -60, life: 1.1, size: 1.1, spread: 1.2 });
    this.nod(actor, 2);
    if (actor.fed && actor.def.id === 'galinha') this.layEgg(actor);
  }

  squash(actor, power = 0.2) {
    const b = actor.base;
    this.tweens.run(520, ease.outElastic, (k) => actor.root.scale.set(b * (1 + power * (1 - k)), b * (1 - power * (1 - k))));
  }

  nod(actor, times = 3, ms = 220) {
    const { head, mouth, smileG } = actor.parts;
    let n = 0;
    const mouthOpen = (open) => { if (mouth) mouth.visible = open; if (smileG) smileG.visible = !open; };
    const once = () => {
      if (this.destroyed || n >= times) { mouthOpen(false); return; }
      n += 1;
      mouthOpen(true);
      this.tweens.run(ms, ease.inOutSine, (k) => { const v = Math.sin(k * Math.PI); head.scale.set(1 + 0.06 * v, 1 - 0.1 * v); head.y = -120 + 8 * v; }, () => { mouthOpen(false); once(); });
    };
    once();
  }

  shake(actor) {
    const r = actor.root;
    this.tweens.run(520, ease.linear, (k) => { r.rotation = Math.sin(k * Math.PI * 6) * 0.09 * (1 - k); });
    const { eyes } = actor.parts;
    if (eyes) this.tweens.run(300, ease.inOutSine, (k) => { eyes.scale.y = 1 - 0.7 * Math.sin(k * Math.PI); });
  }

  onItemDown(item, event) {
    if (this.finished || item.used || this.drag) return;
    this.idle = 0;
    const p = event.global;
    this.drag = { item, startX: p.x, startY: p.y, ox: item.x - p.x, oy: item.y - p.y, moved: false };
    item.dragging = true;
    this.foodLayer.addChild(item);
    this.tweens.to(item.scale, { x: item.baseScale * 1.25, y: item.baseScale * 1.25 }, 140, ease.outBack);
    playSfx('tap');
  }

  onMove(event) {
    const d = this.drag;
    if (!d) return;
    const p = event.global;
    if (Math.abs(p.x - d.startX) + Math.abs(p.y - d.startY) > 10) d.moved = true;
    if (d.moved) d.item.position.set(p.x + d.ox, p.y + d.oy - 20);
  }

  onUp() {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    const { item } = d;
    item.dragging = false;
    this.attempts += 1;
    if (item.isCan) return this.dropCan(item, d.moved);
    if (!d.moved) {
      if (TAP_ASSIST.has(this.ageId)) return this.feed(item.actor, item);
      this.glideHome(item);
      return this.hint(item.actor);
    }
    const target = this.nearestActor(item.x, item.y);
    if (!target) return this.glideHome(item);
    if (target === item.actor) return this.feed(target, item);
    this.wrong += 1;
    playSfx('retry');
    this.shake(target);
    this.glideHome(item);
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

  glideHome(item) {
    const from = { x: item.x, y: item.y };
    this.tweens.run(380, ease.outBack, (k) => { item.position.set(from.x + (item.home.x - from.x) * k, from.y + (item.home.y - from.y) * k); });
    this.tweens.to(item.scale, { x: item.baseScale, y: item.baseScale }, 260, ease.outQuad);
  }

  pulse(target, base, power = 0.25, ms = 600) {
    this.tweens.run(ms, ease.linear, (k) => { target.scale.set(base * (1 + power * Math.sin(k * Math.PI))); });
  }

  hint(actor) {
    if (!actor || this.finished) return;
    if (actor.food && !actor.food.used) this.tweens.run(700, ease.linear, (k) => { actor.food.art.rotation = Math.sin(k * Math.PI * 6) * 0.25 * (1 - k); });
    this.pulse(actor.bubble, actor.bubbleScale);
  }

  feed(actor, food) {
    if (actor.fed) return;
    actor.fed = true;
    food.used = true;
    food.eventMode = 'none';
    this.fedCount += 1;
    this.targetP = 0.6 + (this.fedCount / this.total) * 0.9;
    const mouthX = actor.cx; const mouthY = actor.cy - 130 * actor.base;
    const from = { x: food.x, y: food.y };
    const sc = food.scale.x;
    this.tweens.run(320, ease.outQuad, (k) => { food.position.set(from.x + (mouthX - from.x) * k, from.y + (mouthY - from.y) * k - Math.sin(k * Math.PI) * 50); food.scale.set(sc * (1 - 0.6 * k)); food.alpha = 1 - 0.3 * k; }, () => {
      food.visible = false;
      playSfx('success');
      this.nod(actor, 3, 200);
      this.squash(actor, 0.14);
      this.particles.burst(actor.cx, actor.cy - 150 * actor.base, 'heart', this.calm ? 4 : 10, { speed: 220, gravity: 120, life: 1.2, size: 1.1, spread: Math.PI * 1.1 });
      this.particles.burst(actor.cx, actor.cy - 120 * actor.base, 'star', this.calm ? 3 : 8, { tint: [C.sun, C.pink, C.sky], speed: 270, gravity: 340, life: 0.9, size: 0.9 });
      this.say(actor.item, actor.item.label);
    });
    this.tweens.run(260, ease.outBack, (k) => { actor.bubble.scale.set(actor.bubbleScale * (1 - k)); }, () => { actor.bubble.visible = false; });
    const badge = this.badges[this.actors.indexOf(actor)];
    this.tweens.run(500, ease.outElastic, (k) => { badge.alpha = 0.5 + 0.5 * k; badge.scale.set(1 + 0.3 * (1 - k)); });
    if (actor.def.id === 'galinha') window.setTimeout(() => !this.destroyed && this.layEgg(actor), 1100);
    if (this.fedCount >= this.total) window.setTimeout(() => !this.destroyed && this.startGarden(), 1900);
  }

  // ---------- jogo: tarde (horta) ----------
  startGarden() {
    if (this.phase !== 'feed') return;
    this.phase = 'garden';
    this.targetP = 1.5;
    this.audio?.prompt?.(null, 'Agora vamos cuidar da horta! Regue a terra.');
    playSfx('celebrate');
    this.badges.forEach((b) => this.tweens.to(b, { alpha: 0 }, 300, ease.outQuad, () => { b.visible = false; }));
    this.activeBadges = this.veggies.map((kind) => this.makeBadge(kind));
    this.layoutBadges();
    this.beds = this.veggies.map((kind, i) => this.makeBed(kind, i));
    this.can.visible = true;
    this.can.position.set(this.can.home.x, this.can.home.y);
    this.can.scale.set(0);
    this.tweens.run(600, ease.outBack, (k) => this.can.scale.set(this.can.baseScale * k));
    this.beds.forEach((bed) => this.particles.burst(bed.root.x, bed.root.y - 10, 'star', 6, { tint: [C.sun, C.lime], speed: 160, gravity: 260, life: 0.8, size: 0.8 }));
  }

  makeBed(kind, i) {
    const { PIXI } = this;
    const root = new PIXI.Container();
    root.zIndex = this.H + 10;
    const bw = Math.min(110, this.W * 0.26);
    root.addChild(art.buildBed(PIXI, bw));
    root.eventMode = 'static';
    root.cursor = 'pointer';
    root.hitArea = new PIXI.Rectangle(-bw / 2, -76, bw, 96);
    root.position.set(...this.bedPos(i));
    root.scale.set(0);
    this.world.addChild(root);
    this.tweens.run(520 + i * 120, ease.outBack, (k) => root.scale.set(k));
    const bed = { kind, root, bw, watered: false, ready: false, harvested: false, plant: null, veg: null };
    root.on('pointertap', () => { this.idle = 0; if (bed.ready) this.harvest(bed); else if (!bed.watered) this.water(bed); });
    return bed;
  }

  dropCan(can, moved) {
    const target = moved ? this.nearestBed(can.x, can.y) : null;
    this.glideHome(can);
    if (target) return this.water(target);
    if (!moved) {
      const next = this.beds.find((b) => !b.watered);
      if (TAP_ASSIST.has(this.ageId) && next) return this.water(next);
      if (next) this.pulse(next.root, 1, 0.2);
    }
  }

  nearestBed(x, y) {
    let best = null; let bestD = Infinity;
    this.beds.forEach((b) => { if (b.watered) return; const d = Math.hypot(b.root.x - x, (b.root.y - 30) - y); if (d < bestD) { bestD = d; best = b; } });
    return best && bestD < 110 ? best : null;
  }

  gardenProgress() { this.targetP = 1.5 + ((this.watered * 0.5 + this.harvested * 0.5) / this.bedCount) * 0.8; }

  water(bed) {
    if (bed.watered || this.finished) return;
    bed.watered = true;
    this.watered += 1;
    this.gardenProgress();
    const { x, y } = bed.root;
    playSfx('pop');
    this.particles.burst(x, y - 90, 'spark', this.calm ? 6 : 16, { tint: [0x7fd8ff, 0xffffff], speed: 70, gravity: 760, life: 0.7, size: 0.8, spread: 0.7, angle: Math.PI / 2 });
    const sprout = art.buildSprout(this.PIXI);
    sprout.scale.set(0);
    bed.root.addChild(sprout);
    bed.plant = sprout;
    this.tweens.run(800, ease.outElastic, (k) => sprout.scale.set(1.3 * k));
    window.setTimeout(() => {
      if (this.destroyed) return;
      const veg = art.buildFood(this.PIXI, bed.kind);
      veg.position.set(0, -34); veg.scale.set(0);
      bed.root.addChild(veg);
      bed.veg = veg; bed.ready = true;
      this.tweens.run(700, ease.outBack, (k) => veg.scale.set(0.95 * k));
      this.particles.burst(x, y - 50, 'star', 7, { tint: [C.sun, C.pink], speed: 170, gravity: 280, life: 0.8, size: 0.9 });
      playSfx('success');
    }, 900);
  }

  harvest(bed) {
    if (!bed.ready || bed.harvested) return;
    bed.harvested = true;
    bed.ready = false;
    this.harvested += 1;
    this.gardenProgress();
    const veg = bed.veg;
    const wp = bed.root.toGlobal(veg.position);
    this.fxLayer.addChild(veg);
    veg.position.set(wp.x, wp.y);
    veg.scale.set(0.95);
    this.addToBasket(veg, bed.kind, () => {
      const badge = this.activeBadges[this.beds.indexOf(bed)];
      this.tweens.run(500, ease.outElastic, (k) => { badge.alpha = 0.5 + 0.5 * k; badge.scale.set(1 + 0.3 * (1 - k)); });
      if (this.harvested >= this.beds.length) window.setTimeout(() => !this.destroyed && this.goodNight(), 1400);
    });
    if (bed.plant) this.tweens.run(300, ease.outQuad, (k) => bed.plant.scale.set(1.3 * (1 - k)));
    this.progress.harvest += 1;
    saveProgress(this.progress);
  }

  // ---------- ovos e cesta ----------
  layEgg(hen) {
    if (this.destroyed || this.pendingEgg || this.eggsLaid >= MAX_EGGS) return;
    this.eggsLaid += 1;
    const egg = art.buildEgg(this.PIXI);
    const x = hen.cx + 82 * hen.base; const y = hen.cy - 8;
    egg.position.set(x, y - 30); egg.scale.set(0);
    egg.eventMode = 'static'; egg.cursor = 'pointer'; egg.hitArea = new this.PIXI.Circle(0, 0, 42);
    this.fxLayer.addChild(egg);
    this.pendingEgg = egg;
    playSfx('pop');
    this.squash(hen, 0.12);
    this.tweens.run(520, ease.outBack, (k) => { egg.scale.set(1.1 * k); egg.y = y - 30 + 30 * k; });
    this.particles.burst(x, y - 10, 'spark', 6, { tint: 0xfff2b0, speed: 120, gravity: 60, life: 0.7 });
    egg.once('pointertap', () => { this.pendingEgg = null; this.idle = 0; egg.eventMode = 'none'; this.progress.eggs += 1; saveProgress(this.progress); this.addToBasket(egg, 'egg'); });
  }

  addToBasket(node, kind, done) {
    if (this.collected.length >= 6) { node.destroy({ children: true }); done?.(); return; }
    this.collected.push(kind);
    const n = this.collected.length;
    this.basket.visible = true;
    const from = { x: node.x, y: node.y };
    const to = { x: this.basket.x, y: this.basket.y + 8 };
    const s0 = node.scale.x;
    playSfx('tap');
    this.audio?.play?.(`num-${n}`, NUMBER_WORDS[n] || String(n));
    this.tweens.run(560, ease.outCubic, (k) => { node.position.set(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 70); node.scale.set(s0 * (1 - 0.5 * k)); }, () => {
      node.destroy({ children: true });
      this.renderBasket();
      this.particles.burst(to.x, to.y, 'star', 5, { tint: [C.sun, C.pink], speed: 150, gravity: 200, life: 0.7, size: 0.8 });
      this.tweens.run(360, ease.outElastic, (k) => this.basket.scale.set(1 + 0.25 * (1 - k)));
      done?.();
    });
  }

  renderBasket() {
    this.basketItems.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.collected.forEach((kind, i) => {
      const e = kind === 'egg' ? art.buildEgg(this.PIXI) : art.buildFood(this.PIXI, kind);
      e.scale.set(kind === 'egg' ? 0.8 : 0.42);
      e.position.set(-26 + (i % 3) * 26, -4 - Math.floor(i / 3) * 18);
      this.basketItems.addChild(e);
    });
    this.basket.visible = this.collected.length > 0;
  }

  // ---------- novidades por visita ----------
  pickUpFresh() {
    if (!this.fresh) return;
    const id = this.fresh;
    window.setTimeout(() => {
      if (this.destroyed) return;
      let target = null; let pos = [this.W * 0.5, this.H * 0.6];
      if (id === 'moinho') { target = this.windmill; pos = [this.W * 0.6, this.horizon - this.H * 0.12]; }
      if (id === 'balao') { target = this.balloon; pos = [this.balloon.x, this.balloon.y]; }
      if (id === 'arcoiris') { target = this.rainbow; pos = [this.W * 0.5, this.horizon - this.H * 0.2]; }
      if (id === 'pintinho' && this.chick) { target = this.chick; pos = [this.chick.x, this.chick.y - 30]; }
      playSfx('celebrate');
      this.audio?.play?.(null, 'Olha só! Uma novidade na fazenda!');
      this.particles.burst(pos[0], pos[1], 'star', 16, { tint: [C.sun, C.pink, C.sky, C.lime], speed: 280, gravity: 200, life: 1.2, size: 1.2 });
      if (target) { const b = target.scale.x; this.tweens.run(900, ease.outElastic, (k) => target.scale.set(b * k)); }
    }, 1400);
  }

  spawnChick() {
    const hen = this.actors.find((a) => a.def.id === 'galinha');
    if (!hen || !this.unlocked.has('pintinho')) return;
    const chick = art.buildChick(this.PIXI);
    chick.hen = hen; chick.phase = 0;
    chick.eventMode = 'static'; chick.cursor = 'pointer'; chick.hitArea = new this.PIXI.Circle(0, -26, 36);
    chick.on('pointertap', () => { playSfx('pop'); this.chickHop = 1; this.particles.burst(chick.x, chick.y - 40, 'heart', 3, { speed: 120, gravity: 100, life: 0.9 }); this.audio?.play?.(null, 'Piu piu!'); });
    chick.scale.set(1.1);
    this.world.addChild(chick);
    this.chick = chick;
  }

  goodNight() {
    if (this.finished) return;
    this.finished = true;
    this.sleeping = true;
    this.targetP = 3;
    this.can.visible = false;
    playSfx('celebrate');
    this.audio?.play?.('boa-noite-ate-amanha.mp3', 'Boa noite, até amanhã!');
    [392, 329.63, 261.63, 329.63, 392, 523.25].forEach((freq, i) => window.setTimeout(() => !this.destroyed && playNote(freq, 0.9), 2200 + i * 520));
    window.setTimeout(() => !this.destroyed && this.complete(), 6400);
  }

  complete() {
    this.onComplete?.({ mode: 'explore', score: this.fedCount + this.harvested, rounds: 1, correct: this.fedCount + this.harvested, attempts: this.attempts, maxScore: this.total + this.bedCount, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
  }

  // ---------- quadro a quadro ----------
  update(ticker) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, ticker.deltaMS / 1000);
    const { W, H } = this;
    this.time += dt;
    this.idle += dt;
    if (this.idle > 9 && !this.finished) { this.idle = 5; this.autoHint(); }
    this.p += (this.targetP - this.p) * Math.min(1, dt * 1.4);
    const p = this.p;
    this.skySprites.forEach((s, i) => { s.alpha = i === 0 ? 1 : clamp(p - (i - 1), 0, 1); });
    const tint = lightAt(p);
    this.sceneryLayer.tint = tint; this.world.tint = tint; this.flyLayer.tint = tint;
    this.cloudLayer.tint = mixColor(0xffffff, 0x9aa2ee, clamp((p - 1.6) / 1.2, 0, 1));
    const arc = clamp(p / 2.7, 0, 1);
    this.sun.position.set(W * (0.1 + 0.8 * arc), this.horizon * 0.95 - Math.sin(Math.PI * arc) * this.horizon * 0.72);
    this.sun.alpha = 1 - clamp((p - 2.3) / 0.5, 0, 1);
    this.sun.rays.rotation += dt * 0.25;
    const night = clamp((p - 2.2) / 0.8, 0, 1);
    this.moon.position.set(W * 0.76, H * 0.15);
    this.moon.alpha = night;
    this.stars.forEach((s) => { s.alpha = night * (0.55 + 0.45 * Math.sin(this.time * 2 + s.phase)); });
    if (!this.calm) this.cloudLayer.children.forEach((c) => { c.x += c.speed * dt; if (c.x > W + 100) c.x = -100; });
    this.tufts.forEach((t) => { t.rotation = Math.sin(this.time * 1.8 + t.phase) * 0.12; });
    if (this.bunting) this.bunting.skew.x = Math.sin(this.time * 1.4) * 0.03;
    this.fireflies.forEach((f) => { f.visible = night > 0.6; f.alpha = 0.5 + 0.5 * Math.sin(this.time * 3 + f.phase); f.x += Math.cos(this.time * 0.7 + f.phase) * 18 * dt; f.y += Math.sin(this.time * 0.9 + f.phase * 1.3) * 14 * dt; });
    if (this.windmill) this.windmill.blades.rotation += dt * (this.calm ? 0.3 : 1.3);
    if (this.balloon) { this.balloon.x = W * 0.7 + Math.sin(this.time * 0.25) * W * 0.18; this.balloon.y = H * 0.3 + Math.sin(this.time * 0.8) * 8; this.balloon.alpha = 1 - night * 0.6; }
    if (this.rainbow) this.rainbow.alpha = 0.9 * (1 - night);
    this.birds.forEach((b) => { b.x += (40 + b.phase * 4) * dt; if (b.x > W + 60) b.x = -80; b.y += Math.sin(this.time * 2 + b.phase) * 4 * dt; const f = Math.sin(this.time * 8 + b.phase); b.l.rotation = f * 0.35; b.r.rotation = -f * 0.35; b.alpha = 1 - night; });
    this.butterflies.forEach((b) => { const t = this.time * 0.6 + b.phase; b.x = b.cx + Math.sin(t) * W * 0.22; b.y = b.cy + Math.sin(t * 2) * 26; b.rotation = Math.cos(t) * 0.35; b.wings.scale.x = 0.35 + Math.abs(Math.sin(this.time * 10 + b.phase)) * 0.65; b.alpha = 1 - night * 0.9; });
    if (this.chick) {
      const c = this.chick;
      c.phase += dt;
      const hop = Math.max(0, Math.sin(c.phase * 5)) * 10 * (this.chickHop ? 2 : 1);
      c.position.set(c.hen.cx - 84 * c.hen.base + Math.sin(c.phase * 0.7) * 14, c.hen.cy - hop + 6);
      c.zIndex = c.hen.cy + 1;
      if (this.chickHop) this.chickHop = Math.max(0, this.chickHop - dt);
    }

    this.actors.forEach((a) => {
      const { parts } = a;
      const t = this.time + a.phase;
      const breath = this.sleeping ? Math.sin(t * 1.2) * 0.025 : Math.sin(t * 2.4) * 0.018;
      parts.body.scale.y = 1 + breath;
      parts.body.scale.x = 1 - breath * 0.5;
      parts.head.rotation = Math.sin(t * 1.5) * (this.sleeping ? 0.05 : 0.03);
      if (parts.tail) parts.tail.rotation = Math.sin(t * (a.fed ? 9 : 4)) * (a.def.id === 'cachorro' ? 0.35 : 0.15);
      parts.ears.forEach((e, i) => { e.rotation += (Math.sin(t * 2 + i) * 0.04) * 0.2; });
      if (parts.wing) parts.wing.rotation = 0.3 + Math.sin(t * 3) * 0.05;
      if (parts.eyes) {
        if (this.sleeping) parts.eyes.scale.y += (0.08 - parts.eyes.scale.y) * Math.min(1, dt * 4);
        else {
          a.blink -= dt;
          if (a.blink <= 0) { a.blinking = 0.14; a.blink = 2 + Math.random() * 3; }
          if (a.blinking > 0) { a.blinking -= dt; parts.eyes.scale.y = 0.1; } else if (parts.eyes.scale.y < 1) parts.eyes.scale.y = Math.min(1, parts.eyes.scale.y + dt * 8);
        }
      }
      if (!a.fed && a.bubble.visible) a.bubble.y = a.bubble.base + Math.sin(t * 3) * 5;
      if (this.sleeping && !this.calm && Math.random() < dt * 0.7) this.particles.burst(a.cx + 30 * a.base, a.cy - 195 * a.base, 'zzz', 1, { tint: 0xcfd8ff, speed: 40, gravity: -30, life: 1.8, size: 1.1, spread: 0.6 });
    });
  }

  autoHint() {
    if (this.phase === 'feed') return this.hint(this.actors.find((a) => !a.fed));
    const ready = this.beds.find((b) => b.ready);
    if (ready) return this.pulse(ready.veg, 0.95, 0.3);
    const dry = this.beds.find((b) => !b.watered);
    if (dry) {
      this.tweens.run(700, ease.linear, (k) => { this.can.art.rotation = Math.sin(k * Math.PI * 6) * 0.25 * (1 - k); });
      this.pulse(dry.root, 1, 0.2);
    }
  }

  teardown() {
    try {
      this.tweens?.destroy();
      this.particles?.destroy();
      this.app?.ticker?.remove(this.update, this);
      this.app?.destroy(true, { children: true, texture: true });
    } catch (error) { /* a tela já foi trocada */ }
    this.app = null;
  }

  stop() {
    this.destroyed = true;
    if (this.inner) { this.inner.stop?.(); return; }
    this.teardown();
  }
}
