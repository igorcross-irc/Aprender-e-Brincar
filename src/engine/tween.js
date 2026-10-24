// Animações curtas presas ao relógio do Pixi: suaves, canceláveis e sem dependências.
export const ease = {
  linear: (k) => k,
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
  outQuad: (k) => 1 - (1 - k) * (1 - k),
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  outBack: (k) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  outElastic: (k) => (k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1)
};

export class Tweens {
  constructor(ticker) {
    this.items = new Set();
    this.tick = (t) => this.update(t.deltaMS);
    this.ticker = ticker;
    ticker.add(this.tick);
  }

  // update(k) recebe o progresso já suavizado (0 → 1).
  run(ms, easing, update, done) {
    const item = { ms: Math.max(1, ms), t: 0, easing: easing || ease.linear, update, done, dead: false };
    this.items.add(item);
    return item;
  }

  to(target, props, ms, easing, done) {
    const from = {};
    Object.keys(props).forEach((key) => { from[key] = target[key]; });
    return this.run(ms, easing, (k) => Object.keys(props).forEach((key) => { target[key] = from[key] + (props[key] - from[key]) * k; }), done);
  }

  cancel(item) { if (item) item.dead = true; }

  update(dt) {
    this.items.forEach((item) => {
      if (item.dead) { this.items.delete(item); return; }
      item.t += dt;
      const raw = Math.min(1, item.t / item.ms);
      item.update(item.easing(raw));
      if (raw >= 1) { this.items.delete(item); item.done?.(); }
    });
  }

  destroy() { this.ticker.remove(this.tick); this.items.clear(); }
}
