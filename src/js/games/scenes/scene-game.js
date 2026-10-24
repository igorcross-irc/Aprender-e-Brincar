import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playNote } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { createStage, shouldUseLite } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import { SceneLiteGame } from './scene-lite.js';
import { SEA_SCENE } from './sea-scene.js';

// Mundo das Cenas — um motor para cenas ilustradas para explorar. A arte é uma ilustração de fundo mais figuras
// recortadas; aqui só entram movimento, reações ao toque, descobertas e o "peixinho guia". Nenhuma derrota, nenhum relógio.
const STORE_PREFIX = 'ab_scene_';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

function loadSave(id) {
  try { const v = JSON.parse(localStorage.getItem(`${STORE_PREFIX}${id}_v1`) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, found: v.found && typeof v.found === 'object' ? v.found : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, found: {} };
}
function writeSave(id, save) { try { localStorage.setItem(`${STORE_PREFIX}${id}_v1`, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class SceneGame {
  constructor(containerId, audio, onComplete, onBack, scene = SEA_SCENE) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.scene = scene;
    this.inner = null;
    this.destroyed = false;
  }

  start(level = 1, options = {}) {
    this.level = level;
    this.options = options;
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    const plan = this.scene.byAge[this.ageId] || this.scene.byAge['2-3y'];
    this.plan = plan;
    this.save = loadSave(this.scene.id);
    this.save.visits += 1;
    writeSave(this.scene.id, this.save);
    this.mood = this.scene.moods[(this.save.visits - 1) % this.scene.moods.length];
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'scene-back',
      title: `🌊 ${this.scene.title}`,
      body: `<div class="scene-stage" id="scene-stage" aria-label="${this.scene.title}: toque nos bichinhos para descobrir quem são"></div>`
    });
    this.container.querySelector('#scene-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Cena: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new SceneLiteGame(this.container.id, this.audio, this.onComplete, this.onBack, this.scene);
    this.inner.start(this.level, { ...this.options, plan: this.plan, save: this.save, mood: this.mood });
  }

  async init() {
    const host = this.container.querySelector('#scene-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__scene = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, idle: 0, found: new Set(), finished: false, entities: [], bubbles: [], guide: null, lastGuide: 0, ring: null, unitCache: 0 });

    const urls = [this.scene.base + this.scene.plate.file, this.scene.base + 'peixinho.webp'];
    this.active = this.scene.creatures.slice(0, this.plan.creatures);
    this.active.forEach((def) => { urls.push(this.scene.base + def.file); if (def.alt) urls.push(this.scene.base + def.alt); });
    this.textures = {};
    const loaded = await PIXI.Assets.load([...new Set(urls)]);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    Object.entries(loaded).forEach(([src, tex]) => { this.textures[src.split('/').pop()] = tex; });

    this.bgLayer = new PIXI.Container();
    this.raysLayer = new PIXI.Container();
    this.world = new PIXI.Container();
    this.bubbleLayer = new PIXI.Container();
    this.fxLayer = new PIXI.Container();
    this.moodLayer = new PIXI.Container();
    this.hudLayer = new PIXI.Container();
    this.particles = new Particles(PIXI, app);
    [this.bgLayer, this.raysLayer, this.fxLayer, this.moodLayer, this.hudLayer, this.particles.layer].forEach((layer) => { layer.eventMode = 'none'; });
    app.stage.addChild(this.bgLayer, this.raysLayer, this.bubbleLayer, this.world, this.fxLayer, this.moodLayer, this.hudLayer, this.particles.layer);

    this.plate = new PIXI.Sprite(this.textures[this.scene.plate.file]);
    this.plate.anchor.set(0.5, 1);
    this.bgLayer.addChild(this.plate);
    this.buildRays();
    this.buildMood();
    this.buildBubbleTexture();
    this.active.forEach((def) => this.makeEntity(def));
    this.makeHud();
    this.layout();
    this.resetPositions();

    app.renderer.on('resize', () => { this.layout(); this.resetPositions(true); });
    app.ticker.add(this.update, this);
    app.stage.on('pointerdown', () => { this.idle = 0; });
    app.stage.hitArea = app.screen;

    this.audio?.prompt?.(null, 'Vamos explorar o fundo do mar! Toque nos bichinhos.');
  }

  // ---------- montagem ----------
  get unit() { return Math.min(this.W, this.H * 0.75); }

  buildRays() {
    const { PIXI } = this;
    this.rays = [];
    for (let i = 0; i < 5; i += 1) {
      const ray = new PIXI.Graphics();
      ray.blendMode = 'add';
      ray.phase = i * 1.3;
      ray.base = i;
      this.raysLayer.addChild(ray);
      this.rays.push(ray);
    }
  }

  buildMood() {
    const { PIXI } = this;
    this.tint = new PIXI.Graphics();
    this.tint.blendMode = 'multiply';
    this.moodLayer.addChild(this.tint);
    this.plankton = [];
    if (this.mood.glow) {
      for (let i = 0; i < 26; i += 1) {
        const p = new PIXI.Graphics().circle(0, 0, 1.6 + Math.random() * 2.2).fill({ color: i % 3 === 0 ? 0xb6ffea : 0xfff3a0, alpha: 0.9 });
        p.blendMode = 'add'; p.phase = Math.random() * 6; p.fx = Math.random(); p.fy = Math.random();
        this.moodLayer.addChild(p); this.plankton.push(p);
      }
    }
  }

  buildBubbleTexture() {
    const { PIXI } = this;
    const g = new PIXI.Graphics().circle(0, 0, 22).fill({ color: 0xffffff, alpha: 0.22 }).circle(0, 0, 22).stroke({ width: 3, color: 0xffffff, alpha: 0.85 }).circle(-8, -8, 5).fill({ color: 0xffffff, alpha: 0.9 });
    this.bubbleTexture = this.app.renderer.generateTexture({ target: g, resolution: 2 });
    g.destroy();
    const glow = new PIXI.Graphics();
    for (let r = 64; r > 0; r -= 4) glow.circle(0, 0, r).fill({ color: 0xffffff, alpha: 0.035 });
    this.glowTexture = this.app.renderer.generateTexture({ target: glow, resolution: 1 });
    glow.destroy();
  }

  makeEntity(def) {
    const { PIXI } = this;
    const holder = new PIXI.Container();
    holder.eventMode = 'static';
    holder.cursor = 'pointer';
    const parts = def.mode === 'school' ? Array.from({ length: def.count }, () => this.makeSprite(def.file)) : [this.makeSprite(def.file)];
    if (def.depth) parts.forEach((p) => { p.alpha = 0.9; p.tint = 0xcfe3ff; });
    const entity = { def, holder, parts, sprite: parts[0], dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 6, busy: false, speedMul: 1, scale: 1, nextLeap: rand(6, def.leapEvery || 14), fish: [] };
    if (def.glow) {
      entity.glow = new PIXI.Sprite(this.glowTexture);
      entity.glow.anchor.set(0.5);
      entity.glow.blendMode = 'add';
      entity.glow.tint = 0xff9ad6;
      entity.glow.alpha = this.mood.glow ? 0.55 : 0;
      holder.addChildAt(entity.glow, 0);
    }
    if (def.mode === 'school') {
      parts.forEach((fish, i) => { fish.px = 0; fish.py = 0; fish.ox = (i % 3 - 1) * 1; fish.oy = (Math.floor(i / 3) - 1) * 1; fish.vx = 0; fish.vy = 0; holder.addChild(fish); });
    } else holder.addChild(entity.sprite);
    holder.on('pointertap', () => this.touch(entity));
    this.world.addChild(holder);
    this.entities.push(entity);
    return entity;
  }

  makeSprite(file) {
    const sprite = new this.PIXI.Sprite(this.textures[file]);
    sprite.anchor.set(0.5);
    return sprite;
  }

  makeHud() {
    const { PIXI } = this;
    this.badgeBack = new PIXI.Graphics();
    this.hudLayer.addChild(this.badgeBack);
    this.badges = Array.from({ length: this.plan.target }, () => {
      const badge = new PIXI.Container();
      badge.addChild(new PIXI.Graphics().circle(0, 0, 21).fill({ color: 0xffffff, alpha: 0.3 }).circle(0, 0, 21).stroke({ width: 3, color: 0xffe14d, alpha: 0.9 }));
      badge.addChild(new PIXI.Graphics().poly(Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 4.5 : 10; const a = (Math.PI / 5) * i - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; }).flat()).fill({ color: 0xffffff, alpha: 0.6 }));
      this.hudLayer.addChild(badge);
      return badge;
    });
  }

  layout() {
    const { width: W, height: H } = this.app.screen;
    this.W = W; this.H = H;
    const { plate } = this;
    const tex = this.textures[this.scene.plate.file];
    const cover = Math.max(W / tex.width, H / tex.height) * 1.04;
    plate.scale.set(cover);
    plate.position.set(W / 2, H + (cover * tex.height - H) * 0.0 + 4);
    this.entities.forEach((e) => this.sizeEntity(e));
    this.badgeBack.clear().roundRect(8, 8, 18 + this.badges.length * 48, 54, 27).fill({ color: 0x0b3b66, alpha: 0.3 });
    this.badges.forEach((b, i) => b.position.set(36 + i * 48, 35));
    this.tint.clear();
    if (this.mood.tint != null) this.tint.rect(0, 0, W, H).fill({ color: this.mood.tint, alpha: this.mood.alpha });
  }

  sizeEntity(e) {
    const { def } = e;
    const tex = this.textures[def.file];
    const width = this.unit * def.frac * (this.ageId === '6-12m' || this.ageId === '12-18m' ? 1.18 : 1);
    e.scale = width / tex.width;
    if (def.mode === 'school') {
      e.parts.forEach((p) => p.scale.set(e.scale));
      e.holder.hitArea = new this.PIXI.Circle(0, 0, this.unit * 0.18);
    } else {
      e.sprite.scale.set(e.scale);
      const r = Math.max(width, tex.height * e.scale) * 0.5;
      e.holder.hitArea = new this.PIXI.Circle(0, 0, Math.max(r * 0.9, 46));
      if (e.glow) e.glow.scale.set((width * 2.2) / 128);
    }
    e.width = width;
  }

  resetPositions(keepProgress = false) {
    const { W, H } = this;
    this.entities.forEach((e, i) => {
      const { def } = e;
      if (keepProgress && e.holder.x) { e.holder.y = H * def.lane; return; }
      const x = def.x != null ? def.x * W : rand(0.15, 0.85) * W;
      e.holder.position.set(x, H * def.lane);
      e.home = { x, y: H * def.lane };
      e.holder.zIndex = def.lane * 1000;
      e.holder.scale.x = e.dir;
      if (def.mode === 'school') { e.leader = { x, y: H * def.lane }; }
    });
    this.world.sortableChildren = true;
  }

  // ---------- toques e reações ----------
  say(def) { this.audio?.play?.(null, def.label); }

  touch(e) {
    if (this.finished) return;
    this.idle = 0;
    const { def } = e;
    this.say(def);
    this.react(e);
    (def.notes || []).forEach((n, i) => window.setTimeout(() => !this.destroyed && playNote(n, 0.35), i * 130));
    if (!this.found.has(def.id)) this.discover(e);
  }

  discover(e) {
    this.found.add(e.def.id);
    this.save.found[e.def.id] = (this.save.found[e.def.id] || 0) + 1;
    writeSave(this.scene.id, this.save);
    const index = this.found.size - 1;
    if (index < this.badges.length) {
      const badge = this.badges[index];
      const mini = new this.PIXI.Sprite(this.textures[e.def.file]);
      mini.anchor.set(0.5);
      mini.scale.set(34 / Math.max(mini.texture.width, mini.texture.height));
      badge.addChild(mini);
      this.tweens.run(600, ease.outElastic, (k) => { badge.scale.set(1 + 0.35 * (1 - k)); });
    }
    this.particles.burst(e.holder.x, e.holder.y - e.width * 0.2, 'star', this.calm ? 5 : 12, { tint: [0xffe14d, 0xff6fa5, 0x7fe0ff], speed: 260, gravity: 280, life: 1, size: 1.1 });
    if (this.found.size >= this.plan.target) window.setTimeout(() => !this.destroyed && this.finish(), 1600);
  }

  react(e) {
    const { def, sprite, holder } = e;
    const s = e.scale;
    const bursts = (kind = 'spark', n = 8, o = {}) => this.particles.burst(holder.x, holder.y, kind, n, { tint: 0xffffff, speed: 160, gravity: -120, life: 1.1, size: 0.9, spread: Math.PI * 2, ...o });
    playSfx('pop');
    const squash = (p = 0.22) => this.tweens.run(520, ease.outElastic, (k) => sprite.scale.set(s * (1 + p * (1 - k)), s * (1 - p * (1 - k))));
    switch (def.react) {
      case 'dart': { e.speedMul = 3.2; squash(); bursts('spark', 8); this.tweens.run(1400, ease.outQuad, (k) => { e.speedMul = 3.2 - 2.2 * k; }); break; }
      case 'wiggle': { squash(0.12); this.tweens.run(900, ease.linear, (k) => { sprite.rotation = Math.sin(k * Math.PI * 8) * 0.18 * (1 - k); }); bursts('spark', 8); this.scatterNearby(holder, this.unit * 0.5); break; }
      case 'leap': { if (!e.busy) this.leap(e); break; }
      case 'spin': { if (e.busy) break; e.busy = true; this.tweens.run(1100, ease.outCubic, (k) => { sprite.rotation = k * Math.PI * 4; }, () => { sprite.rotation = 0; e.busy = false; }); this.particles.burst(holder.x, holder.y, 'star', 10, { tint: [0xffe14d, 0xff6fa5], speed: 240, gravity: 220, life: 1, size: 1 }); break; }
      case 'inflate': {
        if (e.busy) break; e.busy = true;
        const big = this.textures[def.alt]; const small = this.textures[def.file];
        sprite.texture = big;
        const k0 = s * (small.width / big.width) * 1.0;
        this.tweens.run(1700, ease.linear, (k) => { const v = k < 0.2 ? ease.outBack(k / 0.2) : k > 0.8 ? 1 - ease.outQuad((k - 0.8) / 0.2) : 1; const f = 1 + 0.55 * v; sprite.scale.set(k0 * f); }, () => { sprite.texture = small; sprite.scale.set(s); e.busy = false; });
        bursts('spark', 10);
        break;
      }
      case 'color': {
        if (e.busy) break; e.busy = true;
        const tints = [0xff9ad6, 0x8fe6ff, 0xb8ff8f, 0xffe14d, 0xffffff];
        squash(0.25);
        let i = 0;
        const step = () => { if (this.destroyed) return; sprite.tint = tints[i]; i += 1; if (i < tints.length) window.setTimeout(step, 260); else e.busy = false; };
        step();
        bursts('spark', 10, { tint: [0xff9ad6, 0x8fe6ff, 0xffe14d] });
        break;
      }
      case 'open': {
        if (e.busy) break; e.busy = true;
        const open = this.textures[def.alt]; const closed = this.textures[def.file];
        sprite.texture = open; sprite.scale.set(s * (closed.width / open.width));
        const base = s * (closed.width / open.width);
        this.tweens.run(500, ease.outElastic, (k) => sprite.scale.set(base * (1 + 0.18 * (1 - k))));
        this.particles.burst(holder.x, holder.y - e.width * 0.3, 'star', this.calm ? 6 : 16, { tint: [0xffe14d, 0xffffff, 0x7fe0ff, 0xff6fa5], speed: 300, gravity: 240, life: 1.2, size: 1.2 });
        window.setTimeout(() => { if (this.destroyed) return; sprite.texture = closed; sprite.scale.set(s); e.busy = false; }, 2600);
        break;
      }
      case 'spout': { squash(0.1); this.particles.burst(holder.x - e.dir * e.width * 0.25, holder.y - e.width * 0.3, 'spark', 20, { tint: 0xd8f6ff, speed: 260, gravity: 380, life: 1.2, size: 1.2, spread: 0.7 }); [0, 1, 2].forEach((i) => window.setTimeout(() => !this.destroyed && playNote([196, 165, 147][i], 0.9), i * 380)); break; }
      case 'scuttle': { e.speedMul = 4; this.tweens.run(1000, ease.outQuad, (k) => { e.speedMul = 4 - 3 * k; sprite.rotation = Math.sin(k * Math.PI * 10) * 0.12 * (1 - k); }); break; }
      case 'loop': { if (e.busy) break; e.busy = true; this.tweens.run(1200, ease.inOutSine, (k) => { sprite.rotation = k * Math.PI * 2; sprite.y = -Math.sin(k * Math.PI) * 50; }, () => { sprite.rotation = 0; sprite.y = 0; e.busy = false; }); this.particles.burst(holder.x, holder.y, 'heart', 4, { speed: 120, gravity: -40, life: 1.2 }); break; }
      case 'pulse': { squash(0.35); if (e.glow) this.tweens.run(1200, ease.outQuad, (k) => { e.glow.alpha = 0.9 * (1 - k) + (this.mood.glow ? 0.55 * k : 0); }); this.tweens.run(900, ease.outQuad, (k) => { e.lift = -70 * Math.sin(k * Math.PI); }); bursts('spark', 8, { tint: 0xffc2ea }); break; }
      case 'scatter': { this.scatterSchool(e); bursts('spark', 10); break; }
      default: squash();
    }
  }

  leap(e) {
    e.busy = true;
    const { holder, sprite } = e;
    const startX = holder.x; const dir = e.dir; const arc = this.H * 0.26; const baseY = holder.y;
    playSfx('success');
    this.tweens.run(1700, ease.linear, (k) => {
      holder.x = startX + dir * this.unit * 0.9 * k;
      const lift = Math.sin(k * Math.PI);
      e.leapY = -lift * arc;
      sprite.rotation = -dir * (0.9 - 1.8 * k) * 0.55;
      if (k > 0.08 && k < 0.12) this.particles.burst(holder.x, baseY, 'spark', 5, { speed: 120, gravity: -60, life: 0.8 });
    }, () => { e.leapY = 0; sprite.rotation = 0; e.busy = false; });
  }

  scatterNearby(from, radius) {
    this.entities.forEach((o) => { if (o.def.mode === 'school' && Math.hypot(o.holder.x - from.x, o.holder.y - from.y) < radius) this.scatterSchool(o); });
  }

  scatterSchool(e) {
    e.parts.forEach((f) => { const a = Math.random() * Math.PI * 2; f.vx = Math.cos(a) * this.unit * 0.9; f.vy = Math.sin(a) * this.unit * 0.6; });
    e.scattered = 1.2;
  }

  // ---------- bolhas ----------
  spawnBubble(x, y) {
    if (this.bubbles.length > 14) return;
    const b = new this.PIXI.Sprite(this.bubbleTexture);
    b.anchor.set(0.5);
    const s = rand(0.5, 1.15) * clamp(this.unit / 380, 0.8, 1.5);
    b.scale.set(s);
    b.position.set(x ?? rand(0.05, 0.95) * this.W, y ?? this.H * rand(0.85, 1.02));
    b.vy = rand(40, 80) * clamp(this.unit / 380, 0.8, 1.4);
    b.phase = Math.random() * 6;
    b.eventMode = 'static';
    b.cursor = 'pointer';
    b.hitArea = new this.PIXI.Circle(0, 0, 34);
    b.on('pointertap', () => this.popBubble(b));
    this.bubbleLayer.addChild(b);
    this.bubbles.push(b);
  }

  popBubble(b) {
    this.idle = 0;
    playSfx('pop');
    this.particles.burst(b.x, b.y, 'spark', 7, { tint: 0xdff7ff, speed: 140, gravity: 40, life: 0.6, size: 0.7 });
    this.removeBubble(b);
  }

  removeBubble(b) {
    const i = this.bubbles.indexOf(b);
    if (i >= 0) this.bubbles.splice(i, 1);
    b.destroy();
  }

  // ---------- fim ----------
  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Você achou vários bichinhos!');
    for (let i = 0; i < 14; i += 1) window.setTimeout(() => !this.destroyed && this.particles.burst(rand(0.1, 0.9) * this.W, rand(0.25, 0.8) * this.H, ['star', 'heart'][i % 2], 8, { tint: [0xffe14d, 0xff6fa5, 0x7fe0ff, 0xb8ff8f], speed: 260, gravity: 200, life: 1.2, size: 1.2 }), i * 220);
    for (let i = 0; i < 10; i += 1) window.setTimeout(() => !this.destroyed && this.spawnBubble(), i * 120);
    [262, 330, 392, 523].forEach((f, i) => window.setTimeout(() => !this.destroyed && playNote(f, 0.7), 400 + i * 260));
    window.setTimeout(() => !this.destroyed && this.complete(), 4200);
  }

  complete() {
    this.onComplete?.({ mode: 'explore', score: this.found.size, rounds: 1, correct: this.found.size, attempts: this.found.size, maxScore: this.plan.target, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
  }

  // ---------- peixinho guia ----------
  hintNext() {
    if (this.finished) return;
    const pending = this.entities.filter((e) => !this.found.has(e.def.id) && e.holder.x > 40 && e.holder.x < this.W - 40);
    if (!pending.length) return;
    const fresh = pending.filter((e) => !this.save.found[e.def.id]);
    const pool = fresh.length ? fresh : pending;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const guide = this.guide || (this.guide = this.makeSprite('peixinho.webp'));
    if (!guide.parent) this.fxLayer.addChild(guide);
    guide.eventMode = 'none';
    const gs = this.unit * 0.15 / guide.texture.width;
    guide.scale.set(gs);
    const fromX = target.holder.x > this.W / 2 ? -60 : this.W + 60;
    guide.dirSign = fromX < 0 ? 1 : -1;
    guide.scale.x = gs * guide.dirSign;
    guide.position.set(fromX, target.holder.y - 20);
    guide.alpha = 1;
    const to = { x: target.holder.x + (fromX < 0 ? -1 : 1) * target.width * 0.6, y: target.holder.y - target.width * 0.35 };
    this.tweens.run(1500, ease.outCubic, (k) => { guide.x = fromX + (to.x - fromX) * k; guide.y = target.holder.y - 20 + (to.y - target.holder.y + 20) * k + Math.sin(k * 12) * 6; }, () => {
      const ring = new this.PIXI.Graphics();
      ring.eventMode = 'none';
      this.fxLayer.addChild(ring);
      this.tweens.run(1500, ease.outQuad, (k) => { ring.clear().circle(target.holder.x, target.holder.y, target.width * (0.35 + 0.5 * (k % 0.5) * 2)).stroke({ width: 5, color: 0xffe14d, alpha: 0.9 * (1 - (k % 0.5) * 2) }); }, () => ring.destroy());
      this.tweens.run(900, ease.inQuad || ease.outQuad, (k) => { guide.x = to.x + (fromX < 0 ? -1 : 1) * -1 * 0; guide.alpha = 1 - k; guide.y = to.y - k * 40; }, () => { guide.alpha = 0; });
    });
  }

  // ---------- quadro a quadro ----------
  update(ticker) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, ticker.deltaMS / 1000);
    const { W, H } = this;
    const u = this.unit;
    this.time += dt;
    this.idle += dt;
    if (this.idle > 10 && !this.finished) { this.idle = 5; this.hintNext(); }

    // fundo: respiração leve
    const drift = this.calm ? 0 : Math.sin(this.time * 0.35) * 6;
    this.plate.x = W / 2 + drift;
    this.drawRays(drift);
    this.plankton.forEach((p) => { p.x = ((p.fx + this.time * 0.01 * (1 + p.phase * 0.05)) % 1) * W; p.y = H * (0.2 + p.fy * 0.7) + Math.sin(this.time + p.phase) * 10; p.alpha = 0.35 + 0.5 * Math.abs(Math.sin(this.time * 1.4 + p.phase)); });

    // bolhas
    if (Math.random() < dt * 0.9) this.spawnBubble();
    for (let i = this.bubbles.length - 1; i >= 0; i -= 1) {
      const b = this.bubbles[i];
      b.y -= b.vy * dt;
      b.x += Math.sin(this.time * 2 + b.phase) * 14 * dt;
      if (b.y < -40) this.removeBubble(b);
    }

    this.entities.forEach((e) => this.moveEntity(e, dt, u));
  }

  drawRays(drift) {
    const { W, H } = this;
    this.rays.forEach((r) => {
      const sway = this.calm ? 0 : Math.sin(this.time * 0.4 + r.phase) * W * 0.04;
      const x = W * (0.1 + r.base * 0.2) + sway + drift;
      r.clear().poly([x - W * 0.025, 0, x + W * 0.025, 0, x + W * 0.16 + sway, H * 0.75, x - W * 0.1 + sway, H * 0.75]).fill({ color: 0xfff6b0, alpha: 0.07 + 0.03 * Math.sin(this.time + r.phase) });
    });
  }

  moveEntity(e, dt, u) {
    const { def, holder, sprite } = e;
    const { W, H } = this;
    e.t += dt;
    const sp = (def.speed || 0) * u * e.speedMul;
    const lift = e.lift || 0; const leapY = e.leapY || 0;
    switch (def.mode) {
      case 'swim': case 'whale': {
        holder.x += e.dir * sp * dt;
        holder.y = H * def.lane + Math.sin(e.t * (def.freq || 1)) * (def.amp || 0) * H + leapY;
        const margin = e.width * 0.7;
        if ((e.dir > 0 && holder.x > W + margin) || (e.dir < 0 && holder.x < -margin)) { e.dir *= -1; e.lane = def.lane + rand(-0.02, 0.03); }
        holder.scale.x += (e.dir - holder.scale.x) * Math.min(1, dt * 5);
        if (!e.busy) sprite.rotation = Math.sin(e.t * (def.freq || 1) * 3) * 0.04;
        if (def.react === 'leap') { e.nextLeap -= dt; if (e.nextLeap <= 0 && !e.busy) { e.nextLeap = def.leapEvery; this.leap(e); } }
        if (def.mode === 'swim' && def.react !== 'leap') this.nudgeSchools(e);
        break;
      }
      case 'drift': {
        holder.x = def.x * W + Math.sin(e.t * 0.4) * u * 0.12;
        holder.y = H * def.lane + Math.sin(e.t * (def.freq || 1)) * (def.amp || 0) * H + lift;
        const pulse = 1 + 0.07 * Math.sin(e.t * 3);
        sprite.scale.set(e.scale * (1 - (pulse - 1) * 0.5), e.scale * pulse);
        if (e.glow && !e.busy) e.glow.alpha = this.mood.glow ? 0.35 + 0.2 * Math.sin(e.t * 2.4) : 0;
        break;
      }
      case 'bob': {
        holder.x = def.x * W;
        holder.y = H * def.lane + Math.sin(e.t * (def.freq || 1)) * (def.amp || 0) * H;
        if (!e.busy) sprite.rotation = Math.sin(e.t * 1.2) * 0.08;
        break;
      }
      case 'walk': {
        if (e.pause > 0) e.pause -= dt;
        else { holder.x += e.dir * sp * dt; if (Math.random() < dt * 0.35) { e.pause = rand(0.6, 1.8); if (Math.random() < 0.5) e.dir *= -1; } }
        const lo = W * 0.12; const hi = W * 0.88;
        if (holder.x < lo) { holder.x = lo; e.dir = 1; } else if (holder.x > hi) { holder.x = hi; e.dir = -1; }
        holder.y = H * def.lane;
        sprite.rotation = e.pause > 0 ? Math.sin(e.t * 9) * 0.03 : Math.sin(e.t * 14) * 0.05;
        break;
      }
      case 'idle': {
        holder.y = H * def.lane;
        if (!e.busy) { const b = 1 + Math.sin(e.t * 2 + def.lane * 9) * 0.025; sprite.scale.set(e.scale * b, e.scale / b); }
        break;
      }
      case 'school': this.moveSchool(e, dt, u); break;
      default: break;
    }
  }

  nudgeSchools(from) {
    this.entities.forEach((o) => {
      if (o.def.mode !== 'school' || o.scattered > 0) return;
      if (Math.hypot(o.holder.x - from.holder.x, o.holder.y - from.holder.y) < this.unit * 0.3 && (from.def.id === 'tubarao')) this.scatterSchool(o);
    });
  }

  moveSchool(e, dt, u) {
    const { W, H } = this;
    const { def, holder } = e;
    e.leader.x += e.dir * def.speed * u * dt * e.speedMul;
    e.leader.y = H * def.lane + Math.sin(e.t * 0.9) * H * 0.05;
    const margin = u * 0.3;
    if ((e.dir > 0 && e.leader.x > W + margin) || (e.dir < 0 && e.leader.x < -margin)) { e.dir *= -1; }
    holder.position.set(e.leader.x, e.leader.y);
    holder.scale.x = 1;
    if (e.scattered > 0) e.scattered -= dt;
    e.parts.forEach((f, i) => {
      const wantX = (i % 3 - 1) * u * 0.1 + Math.sin(e.t * 1.7 + i) * u * 0.02 - e.dir * u * 0.04 * Math.floor(i / 3);
      const wantY = (Math.floor(i / 3) - 1) * u * 0.09 + Math.cos(e.t * 1.3 + i * 2) * u * 0.02;
      if (e.scattered > 0) { f.px += f.vx * dt; f.py += f.vy * dt; f.vx *= 0.96; f.vy *= 0.96; } else { f.px += (wantX - f.px) * Math.min(1, dt * 3.2); f.py += (wantY - f.py) * Math.min(1, dt * 3.2); f.vx = f.vy = 0; }
      f.position.set(f.px, f.py);
      f.scale.x = e.scale * (e.dir > 0 ? 1 : -1);
      f.rotation = Math.sin(e.t * 8 + i) * 0.06;
    });
    holder.hitArea = new this.PIXI.Circle(0, 0, u * 0.2);
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

export class SeaSceneGame extends SceneGame {
  constructor(containerId, audio, onComplete, onBack) { super(containerId, audio, onComplete, onBack, SEA_SCENE); }
}
