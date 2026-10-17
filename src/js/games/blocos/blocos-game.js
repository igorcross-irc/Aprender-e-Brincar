import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx, playInstrument } from '../../engine/sfx.js';
import { gameShellMarkup, prefersReducedMotion } from '../game-shell.js';
import { createStage, shouldUseLite } from '../../../engine/stage.js';
import { Tweens, ease } from '../../../engine/tween.js';
import { Particles } from '../../../engine/particles.js';
import { PALETTE as P } from '../farm/art.js';
import { BlocosLiteGame } from './blocos-lite.js';
import { PIECES, MODELS, PLAN_BY_AGE, modelsFor, trayFor, overlaps } from './blocos-data.js';

// Torre de Blocos — construir com peças que caem e se encaixam. Até 2 anos a criança empilha e derruba (causa e efeito);
// aos 2–3 anos conta as peças; dos 3 aos 5 copia construções (cubo, tijolo, telhado, ponte, castelo). Nenhuma derrota:
// peça no lugar errado só balança e volta para a bandeja.
const STORE_KEY = 'ab_blocos_v1';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function loadSave() {
  try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (v && typeof v === 'object') return { visits: Number(v.visits) || 0, built: v.built && typeof v.built === 'object' ? v.built : {} }; } catch (error) { /* sem armazenamento */ }
  return { visits: 0, built: {} };
}
function writeSave(save) { try { localStorage.setItem(STORE_KEY, JSON.stringify(save)); } catch (error) { /* sem armazenamento */ } }

const ink = (g, w = 4) => g.stroke({ width: w, color: P.ink, join: 'round', cap: 'round' });

// Uma peça desenhada em torno do próprio centro; u = tamanho de uma célula em pixels.
export function buildPiece(PIXI, id, u, ghost = false) {
  const def = PIECES[id];
  const W = def.w * u; const H = def.h * u;
  const g = new PIXI.Container();
  const body = new PIXI.Graphics();
  const a = ghost ? 0.2 : 1;
  if (def.shape === 'tri') body.poly([-W / 2 + 2, H / 2 - 2, W / 2 - 2, H / 2 - 2, 0, -H / 2 + 2]).fill({ color: def.color, alpha: a });
  else if (def.shape === 'dome') body.moveTo(-W / 2 + 2, H / 2 - 2).bezierCurveTo(-W / 2 + 2, -H * 0.85, W / 2 - 2, -H * 0.85, W / 2 - 2, H / 2 - 2).closePath().fill({ color: def.color, alpha: a });
  else body.roundRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4, Math.min(12, u * 0.2)).fill({ color: def.color, alpha: a });
  ink(body, ghost ? 3 : 4);
  if (ghost) body.alpha = 0.7;
  g.addChild(body);
  if (!ghost) {
    const hi = new PIXI.Graphics();
    if (def.shape === 'rect') hi.roundRect(-W / 2 + 10, -H / 2 + 9, W - 20, 7, 3.5).fill({ color: 0xffffff, alpha: 0.4 });
    else if (def.shape === 'tri') hi.poly([-W * 0.12, -H * 0.1, W * 0.02, -H * 0.38, W * 0.1, -H * 0.1]).fill({ color: 0xffffff, alpha: 0.4 });
    else hi.ellipse(-W * 0.18, -H * 0.12, W * 0.12, H * 0.12).fill({ color: 0xffffff, alpha: 0.4 });
    g.addChild(hi);
    const dots = Math.max(1, Math.round(def.w * def.h));
    for (let i = 0; i < dots; i += 1) {
      const x = dots === 1 ? 0 : -W / 2 + W * (i + 0.5) / dots;
      g.addChild(new PIXI.Graphics().circle(x, def.shape === 'rect' ? H * 0.16 : H * 0.22, u * 0.07).fill({ color: 0xffffff, alpha: 0.55 }));
    }
  }
  return g;
}

export class BlocosGame {
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
    this.models = this.plan.mode === 'models' ? modelsFor(this.plan, this.save.visits - 1) : [];
    if (shouldUseLite()) return this.startLite();
    this.container.innerHTML = gameShellMarkup({
      backId: 'blocos-back',
      title: '🧱 Torre de Blocos',
      body: '<div class="blocos-stage" id="blocos-stage" aria-label="Torre de Blocos: toque ou arraste as peças para construir"></div>'
    });
    this.container.querySelector('#blocos-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.init().catch((error) => {
      if (this.destroyed) return;
      console.warn('Blocos: gráficos indisponíveis, usando o modo lite.', error);
      this.teardown();
      this.startLite();
    });
  }

  startLite() {
    this.inner = new BlocosLiteGame(this.container.id, this.audio, this.onComplete, this.onBack);
    this.inner.start(this.level, { ...this.options, plan: this.plan, models: this.models, save: this.save });
  }

  later(fn, ms) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  say(audioFile, text, prompt = false) { if (prompt) this.audio?.prompt?.(audioFile, text); else this.audio?.play?.(audioFile, text); }

  async init() {
    const host = this.container.querySelector('#blocos-stage');
    const { PIXI, app } = await createStage(host);
    if (this.destroyed) { app.destroy(true, { children: true, texture: true }); return; }
    this.PIXI = PIXI;
    this.app = app;
    try { if (import.meta.env?.DEV || localStorage.getItem('ab_test_hook') === '1') window.__blocos = this; } catch (error) { /* sem armazenamento */ }
    this.tweens = new Tweens(app.ticker);
    Object.assign(this, { time: 0, idle: 0, placed: [], modelIndex: 0, completed: 0, finished: false, busy: 0, drag: null, knocked: false, trayNodes: {}, slotNodes: [], filled: new Set() });
    this.bg = new PIXI.Graphics(); this.bg.eventMode = 'none';
    this.ghostLayer = new PIXI.Container(); this.ghostLayer.eventMode = 'none';
    this.worldLayer = new PIXI.Container(); this.worldLayer.eventMode = 'none';
    this.uiLayer = new PIXI.Container();
    this.dragLayer = new PIXI.Container(); this.dragLayer.eventMode = 'none';
    this.fxLayer = new PIXI.Container(); this.fxLayer.eventMode = 'none';
    app.stage.addChild(this.bg, this.ghostLayer, this.worldLayer, this.uiLayer, this.dragLayer, this.fxLayer);
    this.particles = new Particles(PIXI, app);
    this.particles.layer.eventMode = 'none';
    app.stage.addChild(this.particles.layer);
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointermove', (e) => this.onMove(e));
    app.stage.on('pointerup', (e) => this.onUp(e));
    app.stage.on('pointerupoutside', (e) => this.onUp(e));
    this.resizeHandler = () => this.rebuild();
    app.renderer.on('resize', this.resizeHandler);
    app.ticker.add(this.onTick = (t) => this.update(t.deltaMS / 1000));
    if (this.plan.mode === 'models') this.model = this.models[0];
    this.trayIds = this.plan.mode === 'models' ? trayFor(this.models) : this.plan.pieces;
    this.rebuild();
    this.say(null, this.plan.mode === 'models' ? 'Vamos construir! Copie o desenho!' : 'Vamos empilhar blocos!', true);
  }

  // ---------- medidas e cenário ----------
  measure() {
    this.W = this.app.screen.width; this.H = this.app.screen.height;
    this.u = clamp(Math.min(this.W / 7.6, this.H / 10), 34, 78);
    this.x0 = this.W / 2;
    this.groundY = this.H * 0.68;
    this.half = this.W / (2 * this.u) - 0.15;
  }

  drawBackground() {
    const { W, H, groundY } = this;
    const g = this.bg.clear();
    g.rect(0, 0, W, H).fill(0xbfe9ff);
    g.rect(0, H * 0.3, W, H * 0.4).fill({ color: 0xd9f3ff, alpha: 0.7 });
    [[0.18, 0.12, 1], [0.62, 0.2, 0.8], [0.85, 0.09, 0.6]].forEach(([x, y, s]) => {
      g.circle(W * x, H * y, 22 * s).circle(W * x + 26 * s, H * y + 6 * s, 18 * s).circle(W * x - 26 * s, H * y + 6 * s, 16 * s).fill(0xffffff);
    });
    g.circle(W * 0.88, H * 0.13, 28).fill(0xffd84a);
    g.ellipse(W * 0.2, groundY, W * 0.5, H * 0.1).fill(0x9be08a).ellipse(W * 0.85, groundY, W * 0.45, H * 0.08).fill(0x7ad66f);
    g.rect(0, groundY, W, H - groundY).fill(0x7fd36a);
    g.rect(0, groundY, W, 6).fill(0x2a1b3d);
    g.rect(0, groundY + 6, W, H - groundY - 6).fill(0xfff1c9);
    for (let x = 12; x < W; x += 54) g.circle(x, groundY + 22, 3).fill({ color: 0xffe08a, alpha: 0.8 });
  }

  // Posição na tela do centro de uma peça (cx, row).
  slotXY(piece, cx, row) { return { x: this.x0 + cx * this.u, y: this.groundY - (row + PIECES[piece].h / 2) * this.u }; }

  // Redesenha tudo a partir do estado (também no resize).
  rebuild() {
    if (this.destroyed || !this.app) return;
    this.measure();
    this.drawBackground();
    [this.ghostLayer, this.worldLayer, this.uiLayer].forEach((l) => l.removeChildren().forEach((c) => c.destroy({ children: true })));
    this.placed.forEach((p) => { p.node = this.makeNode(p.id); this.worldLayer.addChild(p.node); const xy = this.slotXY(p.id, p.cx, p.row); p.node.position.set(xy.x, xy.y); });
    this.buildGhosts();
    this.buildTray();
    this.buildKnock();
  }

  makeNode(id) { const n = buildPiece(this.PIXI, id, this.u); n.pieceId = id; return n; }

  buildGhosts() {
    this.slotNodes = [];
    if (!this.model) return;
    this.model.slots.forEach((s, i) => {
      if (this.filled.has(i)) { this.slotNodes.push(null); return; }
      const n = buildPiece(this.PIXI, s.piece, this.u, true);
      const xy = this.slotXY(s.piece, s.cx, s.row);
      n.position.set(xy.x, xy.y);
      this.ghostLayer.addChild(n);
      this.slotNodes.push(n);
    });
  }

  buildTray() {
    this.trayNodes = {};
    const ids = this.trayIds;
    const n = ids.length;
    const slotW = this.W / n;
    const y = this.groundY + (this.H - this.groundY) / 2 + 6;
    ids.forEach((id, i) => {
      const def = PIECES[id];
      const holder = new this.PIXI.Container();
      const plate = new this.PIXI.Graphics().roundRect(-slotW / 2 + 6, -this.u * 0.95, slotW - 12, this.u * 1.9, 18).fill({ color: 0xffffff, alpha: 0.75 });
      ink(plate, 3);
      const node = buildPiece(this.PIXI, id, this.u);
      const sc = Math.min(0.72, (slotW * 0.8) / (def.w * this.u), (this.u * 1.5) / (def.h * this.u));
      node.scale.set(sc);
      holder.addChild(plate, node);
      holder.node = node; holder.sc = sc; holder.id = id;
      holder.position.set(slotW * (i + 0.5), y);
      holder.eventMode = 'static'; holder.cursor = 'pointer';
      holder.on('pointerdown', (e) => this.onDown(e, id, holder));
      this.uiLayer.addChild(holder);
      this.trayNodes[id] = holder;
    });
    this.trayY = y;
  }

  buildKnock() {
    this.knock = null;
    if (this.plan.mode !== 'free') return;
    const b = new this.PIXI.Container();
    b.addChild(new this.PIXI.Graphics().circle(0, 0, 34).fill(0xffcf1f).circle(0, 0, 34));
    b.children[0].stroke({ width: 4, color: P.ink });
    const bell = new this.PIXI.Text({ text: '🔔', style: { fontSize: 36 } });
    bell.anchor.set(0.5);
    b.addChild(bell);
    b.position.set(this.W - 48, this.groundY - this.u * 2.4);
    b.eventMode = 'static'; b.cursor = 'pointer';
    b.on('pointertap', () => this.knockDown());
    b.visible = this.placed.length >= this.plan.goal && !this.knocked;
    this.uiLayer.addChild(b);
    this.knock = b;
  }

  // ---------- arrastar e soltar ----------
  onDown(e, id, holder) {
    if (this.finished || this.busy || this.drag) return;
    const pos = e.global;
    const node = this.makeNode(id);
    node.position.set(pos.x, pos.y - this.u * 0.6);
    node.alpha = 0.95;
    this.dragLayer.addChild(node);
    holder.node.alpha = 0.35;
    this.drag = { id, holder, node, sx: pos.x, sy: pos.y, moved: false };
    this.idle = 0;
    playSfx('pop');
  }

  onMove(e) {
    const d = this.drag;
    if (!d) return;
    const pos = e.global;
    if (!d.moved && Math.hypot(pos.x - d.sx, pos.y - d.sy) > 10) d.moved = true;
    if (d.moved) d.node.position.set(pos.x, pos.y - this.u * 0.6);
  }

  onUp(e) {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    const pos = e.global;
    const dropX = d.moved ? pos.x : null;
    d.holder.node.alpha = 1;
    const from = { x: d.node.x, y: d.node.y };
    d.node.destroy({ children: true });
    this.dropPiece(d.id, dropX, from, !d.moved);
  }

  // Entrada única do toque e do arrastar: x = onde soltou (null = toque na bandeja).
  dropPiece(id, dropX, from, tapped) {
    if (this.finished || this.busy) return;
    this.idle = 0;
    const def = PIECES[id];
    const tray = this.trayNodes[id];
    const start = tapped ? { x: tray.x, y: tray.y } : from;
    if (!tapped && from.y > this.groundY + this.u * 0.2) { this.returnPiece(id, start); return; }
    if (this.model) return this.dropInModel(id, dropX, start, tapped);
    // modo livre: encaixa na grade de meia célula
    let cx = tapped ? this.freeCx(id, 0) : clamp(Math.round(((dropX - this.x0) / this.u) * 2) / 2, -(this.half - def.w / 2), this.half - def.w / 2);
    if (cx !== null && !tapped && this.blockedByTop(id, cx)) cx = null;
    if (cx === null) { this.wrong(id, start); return; }
    this.land(id, cx, this.restRow(id, cx), start);
  }

  // Peças "de topo" (telhado, cúpula) não suportam nada em cima.
  blockedByTop(id, cx) {
    const w = PIECES[id].w;
    return this.placed.some((p) => PIECES[p.id].top && overlaps(cx, w, p.cx, PIECES[p.id].w));
  }

  restRow(id, cx) {
    const w = PIECES[id].w;
    let row = 0;
    this.placed.forEach((p) => { const pd = PIECES[p.id]; if (overlaps(cx, w, p.cx, pd.w)) row = Math.max(row, p.row + pd.h); });
    return row;
  }

  freeCx(id, pref) {
    const w = PIECES[id].w;
    for (const off of [0, 1, -1, 2, -2, 3, -3]) {
      const cx = clamp(pref + off, -(this.half - w / 2), this.half - w / 2);
      if (!this.blockedByTop(id, cx)) return cx;
    }
    return null;
  }

  dropInModel(id, dropX, start, tapped) {
    const ready = this.readySlots(id);
    if (!ready.length) { this.wrong(id, start); return; }
    let slot = null;
    if (tapped) {
      if (!this.plan.assist) { this.wrong(id, start); return; }
      slot = ready[0];
    } else {
      const cx = (dropX - this.x0) / this.u;
      slot = ready.map((i) => ({ i, d: Math.abs(this.model.slots[i].cx - cx) })).sort((a, b) => a.d - b.d)[0];
      if (!slot || slot.d > 1.25) { this.wrong(id, start); return; }
      slot = slot.i;
    }
    this.land(id, this.model.slots[slot].cx, this.model.slots[slot].row, start, slot);
  }

  // Peças do modelo que podem ser postas agora: do tipo certo e com tudo o que fica embaixo já no lugar.
  readySlots(id) {
    const slots = this.model.slots;
    return slots.map((s, i) => i).filter((i) => {
      const s = slots[i];
      if (s.piece !== id || this.filled.has(i)) return false;
      return slots.every((o, j) => !(o.row < s.row && overlaps(s.cx, PIECES[s.piece].w, o.cx, PIECES[o.piece].w) && !this.filled.has(j)));
    });
  }

  wrong(id, start) {
    this.busy += 1;
    playSfx('retry');
    const node = this.makeNode(id);
    node.position.set(start.x, start.y);
    this.dragLayer.addChild(node);
    const tray = this.trayNodes[id];
    const to = { x: tray.x, y: tray.y };
    this.tweens.run(this.calm ? 120 : 420, ease.inOutSine, (k) => { node.x = start.x + (to.x - start.x) * k + Math.sin(k * 20) * 6 * (1 - k); node.y = start.y + (to.y - start.y) * k; node.scale.set(1 - (1 - tray.sc) * k); }, () => { node.destroy({ children: true }); this.busy = Math.max(0, this.busy - 1); });
    this.idle = 0;
  }

  returnPiece(id, start) { this.wrong(id, start); }

  // A peça cai até o lugar, quica, e a construção avança.
  land(id, cx, row, start, slot = null) {
    this.busy += 1;
    const def = PIECES[id];
    const node = this.makeNode(id);
    this.worldLayer.addChild(node);
    const to = this.slotXY(id, cx, row);
    const fromY = Math.min(start.y, to.y - this.u * 1.2);
    node.position.set(to.x, fromY);
    const rec = { id, cx, row, node, slot };
    this.placed.push(rec);
    if (slot !== null) { this.filled.add(slot); const g = this.slotNodes[slot]; if (g) { g.destroy({ children: true }); this.slotNodes[slot] = null; } }
    this.tweens.run(this.calm ? 120 : 520, ease.outBounce || ease.outBack, (k) => { if (node.destroyed) return; node.y = fromY + (to.y - fromY) * k; node.x = start.x + (to.x - start.x) * Math.min(1, k * 1.6); }, () => {
      if (node.destroyed) return;
      node.position.set(to.x, to.y);
      playInstrument('xylo', def.note, 0.9);
      this.particles.burst(to.x, to.y + def.h * this.u / 2, 'spark', 6, { tint: [def.color, 0xffffff], speed: 150, life: 0.6 });
      this.busy = Math.max(0, this.busy - 1);
      this.afterPlace();
    });
  }

  afterPlace() {
    if (this.finished) return;
    if (this.model) {
      if (this.filled.size >= this.model.slots.length) return this.modelDone();
      return;
    }
    const n = this.placed.length;
    if (this.plan.count && n <= 10) this.say(`num-${n}.mp3`, String(n));
    if (n >= this.plan.goal && !this.knocked && this.knock) {
      this.knock.visible = true;
      this.say(null, 'Que torre! Toque no sino para derrubar!', true);
    }
  }

  // ---------- construção pronta ----------
  modelDone() {
    this.busy += 1;
    this.completed += 1;
    this.save.built[this.model.id] = (this.save.built[this.model.id] || 0) + 1;
    writeSave(this.save);
    playSfx('celebrate');
    this.particles.burst(this.x0, this.groundY - this.u * 1.5, 'star', 18, { tint: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a], speed: 320, life: 1.2, size: 1.2 });
    this.say('muito-bem.mp3', 'Muito bem! Ficou igualzinho!');
    this.placed.forEach((p, i) => {
      const y0 = p.node.y;
      this.later(() => { if (!p.node.destroyed) this.tweens.run(420, ease.outElastic, (k) => { if (p.node.destroyed) return; p.node.scale.set(1 + 0.08 * Math.sin(k * Math.PI)); p.node.y = y0 - 10 * Math.sin(k * Math.PI); }); }, i * 120);
    });
    this.later(() => this.nextModel(), 2300);
  }

  nextModel() {
    if (this.destroyed) return;
    this.modelIndex += 1;
    this.busy = Math.max(0, this.busy - 1);
    if (this.modelIndex >= this.models.length) return this.finish();
    this.placed.forEach((p) => p.node?.destroy({ children: true }));
    this.placed = []; this.filled = new Set();
    this.model = this.models[this.modelIndex];
    this.rebuild();
    this.say(null, 'Agora, esta construção!', true);
  }

  // ---------- derrubar (modo livre) ----------
  knockDown() {
    if (this.knocked || this.finished || this.busy) return;
    this.knocked = true;
    this.busy += 1;
    if (this.knock) this.knock.visible = false;
    playSfx('pop');
    const items = this.placed.slice().sort((a, b) => b.row - a.row);
    items.forEach((p, i) => {
      const from = { x: p.node.x, y: p.node.y };
      const dir = (i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.35);
      const to = { x: clamp(from.x + dir * this.u * 2.4, 30, this.W - 30), y: this.groundY - this.u * 0.28 };
      this.later(() => {
        if (this.destroyed || p.node.destroyed) return;
        playInstrument('xylo', PIECES[p.id].note * 0.5, 0.8);
        this.tweens.run(this.calm ? 150 : 700, ease.outBounce || ease.outBack, (k) => { if (p.node.destroyed) return; p.node.x = from.x + (to.x - from.x) * k; p.node.y = from.y + (to.y - from.y) * k; p.node.rotation = dir * 1.4 * k; });
        this.particles.burst(from.x, from.y, 'spark', 5, { tint: [PIECES[p.id].color, 0xffffff], speed: 200, life: 0.6 });
      }, i * 140);
    });
    this.later(() => { this.busy = Math.max(0, this.busy - 1); this.finish(); }, items.length * 140 + 1200);
  }

  update(dt) {
    if (this.destroyed || !this.app) return;
    this.time += dt; this.idle += dt;
    const next = this.hintPiece();
    Object.values(this.trayNodes).forEach((h) => {
      const on = next === h.id;
      h.scale.set(on ? 1 + 0.07 * Math.sin(this.time * 7) : 1);
    });
    if (this.model && this.plan.assist) {
      this.model.slots.forEach((s, i) => { const g = this.slotNodes[i]; if (g) g.alpha = (next === s.piece && this.readySlots(s.piece).includes(i)) ? 0.65 + 0.35 * Math.sin(this.time * 7) : 1; });
    }
    if (this.knock && this.knock.visible) this.knock.scale.set(1 + 0.08 * Math.sin(this.time * 6));
  }

  // Peça da dica: só no modo com ajuda (3–4 anos) ou depois de uma pausa longa.
  hintPiece() {
    if (this.finished || this.busy || this.drag || !this.model) return null;
    if (!(this.plan.assist || this.idle > 7)) return null;
    for (let i = 0; i < this.model.slots.length; i += 1) {
      const s = this.model.slots[i];
      if (!this.filled.has(i) && this.readySlots(s.piece).includes(i)) return s.piece;
    }
    return null;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    playSfx('celebrate');
    this.particles.burst(this.W / 2, this.H * 0.4, 'star', 26, { tint: [0xffcf1f, 0xff6fa5, 0x2fb6ee, 0xb6e03a], speed: 360, life: 1.4, size: 1.3 });
    this.say('parabens.mp3', 'Parabéns, construtor! Que lindo!', true);
    const rounds = this.model ? this.models.length : this.plan.goal;
    const correct = this.model ? this.completed : Math.min(this.placed.length, this.plan.goal);
    this.later(() => {
      if (this.destroyed) return;
      this.onComplete?.({ mode: 'explore', score: correct, rounds, correct, attempts: correct, maxScore: rounds, completedRounds: correct, difficulty: this.difficulty.level, ageId: this.ageId });
    }, 2600);
  }

  teardown() {
    this.destroyed = true;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    try { this.tweens?.destroy(); this.particles?.destroy(); if (this.onTick) this.app?.ticker.remove(this.onTick); if (this.resizeHandler) this.app?.renderer.off('resize', this.resizeHandler); this.app?.destroy(true, { children: true, texture: true }); } catch (error) { /* ignora */ }
    this.app = null;
    try { if (window.__blocos === this) window.__blocos = null; } catch (error) { /* ignora */ }
  }

  stop() {
    if (this.inner) { this.inner.stop(); return; }
    this.teardown();
  }

  // Usado só pelo teste: o que fazer agora (coordenadas dentro do palco).
  nextAction() {
    if (this.finished || this.busy || this.drag) return null;
    if (this.model) {
      for (let i = 0; i < this.model.slots.length; i += 1) {
        const s = this.model.slots[i];
        if (this.filled.has(i) || !this.readySlots(s.piece).includes(i)) continue;
        const tray = this.trayNodes[s.piece];
        if (this.plan.assist) return { type: 'tap', x: tray.x, y: tray.y };
        const to = this.slotXY(s.piece, s.cx, s.row);
        return { type: 'drag', from: { x: tray.x, y: tray.y }, to: { x: to.x, y: to.y + this.u * 0.6 } };
      }
      return null;
    }
    if (this.placed.length >= this.plan.goal) {
      if (this.knock && this.knock.visible) return { type: 'tap', x: this.knock.x, y: this.knock.y };
      return null;
    }
    const id = this.trayIds[this.placed.length % this.trayIds.length];
    const tray = this.trayNodes[id];
    if (this.placed.length % 2 === 1) { const to = this.slotXY(id, this.placed.length % 2 ? 1.5 : -1.5, 0); return { type: 'drag', from: { x: tray.x, y: tray.y }, to: { x: to.x, y: to.y + this.u * 0.6 } }; }
    return { type: 'tap', x: tray.x, y: tray.y };
  }
}

export { MODELS };
