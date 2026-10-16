import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { createStage, shouldUseLite } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import { AtelieLiteGame } from './atelie-lite.js';
import { PAGES, COLORS, PLAN_BY_AGE } from './atelie-data.js';

// Ateliê Mágico — pinte o desenho e ele ganha vida. A criança escolhe uma cor (cada cor tem a sua nota) e toca nas partes
// do desenho; quando uma boa parte está pintada, o desenho se mexe e toca uma música. Sem erro possível, sem relógio.
// Até 2 anos a cor é escolhida pelo próprio ateliê (arco-íris); depois a criança escolhe. O progresso fica no aparelho.
const STORE_KEY = 'ab_atelie_v1';
const INK = 0x2a1b3d;
const CREAM = 0xfff8ea;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, k) => (((((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * k) << 16) | ((((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * k) << 8) | ((a & 255) + ((b & 255) - (a & 255)) * k));

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, done: v.done && typeof v.done === 'object' ? v.done : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, done: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

export class AtelieGame {
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
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.calm = prefersReducedMotion();
    this.plan = PLAN_BY_AGE[this.ageId] || PLAN_BY_AGE['2-3y'];
    this.save = loadSave();
    this.save.visits += 1;
    writeSave(this.save);
    this.pageIndex = (this.save.visits - 1) % PAGES.length;
    this.page = PAGES[this.pageIndex];
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'atelie-back',
      title: '🎨 Ateliê Mágico',
      body: '<div class="atelie-stage" id="atelie-stage" aria-label="Ateliê Mágico: escolha uma cor e toque no desenho para pintar"></div>'
    });
    this.container.querySelector('#atelie-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Ateliê: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new AtelieLiteGame(this.container.id, this.audio, this.onComplete, this.onBack);
    this.inner.start(this.level, { ...this.options, plan: this.plan, page: this.page, save: this.save });
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }

  async init() {
    const host = this.container.querySelector('#atelie-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__atelie = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, idle: 0, alive: false, finished: false, nextColor: 0, hintAt: 0, regions: [], groups: {}, paintedCount: 0 });
    this.palette = COLORS.slice(0, this.plan.colors);
    this.current = 0;
    this.buildDesk();
    this.buildArt();
    this.buildPalette();
    this.particles = new Particles(PIXI, app);
    this.particles.layer.eventMode = 'none';
    app.stage.addChild(this.particles.layer);
    this.layout();
    this.resizeHandler = () => this.layout();
    app.renderer.on('resize', this.resizeHandler);
    app.ticker.add(this.onTick = (t) => this.update(t.deltaMS / 1000));
    this.audio?.prompt?.(null, this.plan.auto ? 'Vamos pintar! Toque no desenho.' : 'Vamos pintar! Escolha uma cor e toque no desenho.');
  }

  // ---------- montagem ----------
  buildDesk() {
    const { PIXI, app } = this;
    this.desk = new PIXI.Graphics();
    this.desk.eventMode = 'none';
    this.board = new PIXI.Graphics();
    this.board.eventMode = 'none';
    app.stage.addChild(this.desk, this.board);
  }

  buildArt() {
    const { PIXI } = this;
    this.art = new PIXI.Container();
    this.paths = new Map();
    const pathOf = (item) => { if (!this.paths.has(item)) this.paths.set(item, new PIXI.GraphicsPath(item.d)); return this.paths.get(item); };
    Object.entries(this.page.groups).forEach(([name, cfg]) => {
      const c = new PIXI.Container();
      c.pivot.set(cfg.anchor[0], cfg.anchor[1]);
      c.position.set(cfg.anchor[0], cfg.anchor[1]);
      this.groups[name] = { name, cfg, container: c, phase: Math.random() * 6, spin: 0 };
    });
    // Cada grupo entra na ordem de desenho quando aparece o primeiro item dele (senão o fundo cobriria os grupos).
    const attach = (name) => {
      const g = this.groups[name];
      if (g.attached) return;
      g.attached = true;
      if (g.cfg.parent) { attach(g.cfg.parent); this.groups[g.cfg.parent].container.addChild(g.container); } else this.art.addChild(g.container);
    };
    this.page.items.forEach((item) => {
      if (item.group) attach(item.group);
      const host = item.group ? this.groups[item.group].container : this.art;
      const gfx = new PIXI.Graphics();
      gfx.eventMode = 'none';
      if (item.line) {
        gfx.path(pathOf(item)).stroke({ width: item.w, color: item.color, cap: 'round', join: 'round' });
        host.addChild(gfx);
        return;
      }
      if (!item.paint) {
        gfx.path(pathOf(item)).fill({ color: item.fill, alpha: item.alpha ?? 1 }).stroke({ width: 5, color: INK, join: 'round' });
        host.addChild(gfx);
        return;
      }
      const wrap = new PIXI.Container();
      wrap.pivot.set(item.pt[0], item.pt[1]);
      wrap.position.set(item.pt[0], item.pt[1]);
      wrap.addChild(gfx);
      gfx.eventMode = 'static';
      gfx.cursor = 'pointer';
      const region = { item, id: item.id, gfx, wrap, color: CREAM, painted: false, path: pathOf(item) };
      this.drawRegion(region, CREAM);
      gfx.on('pointertap', () => this.paint(region));
      host.addChild(wrap);
      this.regions.push(region);
    });
    this.app.stage.addChild(this.art);
  }

  drawRegion(region, color) {
    region.color = color;
    region.gfx.clear();
    region.gfx.path(region.path).fill({ color }).stroke({ width: 5, color: INK, join: 'round', cap: 'round' });
  }

  buildPalette() {
    const { PIXI } = this;
    this.palLayer = new PIXI.Container();
    this.pots = this.palette.map((color, i) => {
      const pot = new PIXI.Container();
      pot.gfx = new PIXI.Graphics();
      pot.addChild(pot.gfx);
      pot.color = color;
      pot.eventMode = this.plan.auto ? 'none' : 'static';
      pot.cursor = 'pointer';
      pot.on('pointertap', () => this.pick(i));
      this.palLayer.addChild(pot);
      return pot;
    });
    this.app.stage.addChild(this.palLayer);
  }

  drawPot(pot, selected, r) {
    const g = pot.gfx.clear();
    g.circle(0, 5, r).fill({ color: 0x2a1b3d, alpha: 0.18 });
    g.circle(0, 0, r).fill(pot.color.hex).circle(0, 0, r).stroke({ width: selected ? 7 : 4, color: selected ? 0xffffff : 0x2a1b3d });
    g.circle(-r * 0.3, -r * 0.32, r * 0.2).fill({ color: 0xffffff, alpha: 0.55 });
    pot.hitArea = new this.PIXI.Circle(0, 0, r * 1.22);
  }

  // ---------- layout ----------
  layout() {
    const { app } = this;
    const W = app.screen.width; const H = app.screen.height;
    this.W = W; this.H = H;
    const palH = clamp(H * 0.15, 64, 110);
    const size = Math.min(W * 0.96, H - palH - 20);
    const bx = (W - size) / 2; const by = 8;
    this.boardRect = { x: bx, y: by, size };
    this.desk.clear().rect(0, 0, W, H).fill(0xffe9b8).rect(0, by + size + 4, W, H).fill(0xffd27a);
    this.board.clear().roundRect(bx - 6, by - 6, size + 12, size + 12, 18).fill(0xffffff).roundRect(bx - 6, by - 6, size + 12, size + 12, 18).stroke({ width: 5, color: 0x2a1b3d, alpha: 0.9 });
    this.art.scale.set(size / 400);
    this.art.position.set(bx, by);
    const maskG = this.maskG || (this.maskG = new this.PIXI.Graphics());
    maskG.clear().roundRect(bx, by, size, size, 12).fill(0xffffff);
    if (!maskG.parent) this.app.stage.addChild(maskG);
    this.art.mask = maskG;
    const n = this.pots.length;
    const slot = Math.min(size / n, 96);
    const r = Math.min(slot * 0.38, palH * 0.4);
    const y = by + size + 6 + (H - (by + size + 6)) / 2;
    this.pots.forEach((pot, i) => {
      if (this.plan.auto) { pot.visible = i === this.nextColor % n; pot.position.set(W / 2, y); }
      else pot.position.set(W / 2 - (slot * (n - 1)) / 2 + i * slot, y);
      this.drawPot(pot, !this.plan.auto && i === this.current, r);
      pot.baseR = r;
    });
  }

  // ---------- pintar ----------
  pick(i) {
    if (this.finished) return;
    this.current = i;
    const pot = this.pots[i];
    playInstrument('xylo', pot.color.note, 0.8);
    this.layout();
    this.tweens.run(420, ease.outElastic, (k) => pot.scale.set(1 + 0.25 * (1 - k)));
    this.idle = 0;
  }

  paint(region) {
    if (this.finished && !this.alive) return;
    this.idle = 0;
    const color = this.plan.auto ? this.palette[this.nextColor % this.palette.length] : this.palette[this.current];
    if (this.plan.auto) { this.nextColor += 1; this.pots.forEach((p, i) => { p.visible = i === this.nextColor % this.pots.length; }); }
    const from = region.color;
    const to = color.hex;
    this.tweens.run(this.calm ? 120 : 380, ease.outQuad, (k) => this.drawRegion(region, mix(from, to, k)));
    if (!this.calm) this.tweens.run(520, ease.outElastic, (k) => region.wrap.scale.set(1 + 0.08 * (1 - k)));
    playInstrument('xylo', color.note, 0.9);
    const p = this.art.toGlobal({ x: region.item.pt[0], y: region.item.pt[1] });
    this.particles.burst(p.x, p.y, 'spark', 7, { tint: [color.hex, 0xffffff], speed: 170, gravity: 120, life: 0.7, size: 1.1 });
    if (!region.painted) {
      region.painted = true;
      this.paintedCount += 1;
      if (!this.alive && this.paintedCount >= Math.ceil(this.regions.length * this.plan.share)) this.later(() => this.makeAlive(), 700);
    }
  }

  // ---------- o desenho ganha vida ----------
  makeAlive() {
    if (this.alive || this.destroyed) return;
    this.alive = true;
    playSfx('celebrate');
    this.audio?.prompt?.(null, 'Olha! O seu desenho ganhou vida!');
    const { x, y, size } = this.boardRect;
    this.particles.burst(x + size / 2, y + size / 2, 'star', 26, { tint: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a], speed: 360, life: 1.4, size: 1.3 });
    const tune = [0, 2, 4, 3, 5, 4, 2, 0];
    const play = () => { tune.forEach((t, i) => this.later(() => { if (!this.destroyed) playInstrument(i % 4 === 3 ? 'bell' : 'xylo', COLORS[t].note, 0.9); }, i * 340)); };
    play();
    this.later(play, 3000);
    this.sparkleTimer = window.setInterval(() => {
      if (this.destroyed) return;
      const px = x + Math.random() * size; const py = y + Math.random() * size * 0.7;
      this.particles.burst(px, py, this.page.hearts ? 'heart' : 'star', 2, { tint: [0xff6fa5, 0xffcf1f, 0xffffff], speed: 70, gravity: -40, life: 1.2, size: 1.1, spread: 2 });
    }, 320);
    this.later(() => this.finish(), 7200);
  }

  update(dt) {
    if (this.destroyed || !this.app) return;
    this.time += dt;
    this.idle += dt;
    if (!this.alive && !this.finished && this.idle > 8 && this.time - this.hintAt > 6) {
      this.hintAt = this.time;
      const open = this.regions.filter((r) => !r.painted);
      const r = open[Math.floor(Math.random() * open.length)];
      if (r) this.tweens.run(900, ease.inOutSine, (k) => { const v = Math.sin(k * Math.PI); r.wrap.scale.set(1 + 0.09 * v); });
    }
    Object.values(this.groups).forEach((g) => {
      const { cfg, container } = g;
      const [ax, ay] = cfg.anchor;
      if (!this.alive) { container.rotation = 0; container.scale.set(1); container.position.set(ax, ay); container.alpha = 1; return; }
      const t = this.time * (this.calm ? 0.5 : 1);
      switch (cfg.anim) {
        case 'drift': container.position.set(ax + Math.sin(t * cfg.speed) * cfg.ax, ay + Math.cos(t * cfg.speed * 1.3) * cfg.ay); break;
        case 'flap': container.scale.x = 1 - cfg.amp * (0.5 + 0.5 * Math.sin(t * cfg.speed)); break;
        case 'sway': container.rotation = Math.sin(t * cfg.speed + g.phase) * cfg.amp; break;
        case 'wag': container.rotation = Math.sin(t * cfg.speed) * cfg.amp; break;
        case 'spin': g.spin += dt * cfg.speed; container.rotation = g.spin; break;
        case 'rise': { const k = (t * cfg.speed) % 1; container.position.set(ax, ay - k * cfg.dist); container.alpha = 1 - k * k; break; }
        default: break;
      }
    });
  }

  finish() {
    if (this.finished || this.destroyed) return;
    this.finished = true;
    window.clearInterval(this.sparkleTimer);
    this.save.done[this.page.id] = this.regions.map((r) => (r.painted ? r.color : null));
    writeSave(this.save);
    this.audio?.play?.('muito-bem.mp3', 'Muito bem! Que desenho lindo!');
    this.later(() => {
      if (this.destroyed) return;
      this.onComplete?.({ mode: 'explore', score: this.paintedCount, rounds: 1, correct: this.paintedCount, attempts: this.paintedCount, maxScore: this.regions.length, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
    }, 1400);
  }

  teardown() {
    this.destroyed = true;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    window.clearInterval(this.sparkleTimer);
    try { this.tweens?.destroy(); this.particles?.destroy(); if (this.onTick) this.app?.ticker.remove(this.onTick); if (this.resizeHandler) this.app?.renderer.off('resize', this.resizeHandler); this.app?.destroy(true, { children: true, texture: true }); } catch (error) { /* já destruído */ }
    this.app = null;
    try { if (window.__atelie === this) window.__atelie = null; } catch (error) { /* ignora */ }
  }

  stop() {
    if (this.inner) { this.inner.stop(); return; }
    this.teardown();
  }
}
