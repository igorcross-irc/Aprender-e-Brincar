// Partículas leves (corações, estrelas, brilhos) com texturas geradas uma única vez.
export class Particles {
  constructor(PIXI, app) {
    this.PIXI = PIXI;
    this.app = app;
    this.layer = new PIXI.Container();
    this.live = [];
    this.textures = {};
    this.tick = (t) => this.update(t.deltaMS / 1000);
    app.ticker.add(this.tick);
    this.build();
  }

  shape(draw) {
    const g = new this.PIXI.Graphics();
    draw(g);
    const texture = this.app.renderer.generateTexture({ target: g, resolution: 2 });
    g.destroy();
    return texture;
  }

  build() {
    this.textures.heart = this.shape((g) => g.moveTo(0, 10).bezierCurveTo(-18, -4, -10, -18, 0, -8).bezierCurveTo(10, -18, 18, -4, 0, 10).fill(0xff5d8f));
    this.textures.star = this.shape((g) => {
      const pts = [];
      for (let i = 0; i < 10; i += 1) { const r = i % 2 ? 6 : 14; const a = (Math.PI / 5) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
      g.poly(pts).fill(0xffd93d);
    });
    this.textures.spark = this.shape((g) => g.circle(0, 0, 6).fill(0xffffff));
    this.textures.note = this.shape((g) => { g.ellipse(-4, 8, 6, 4.5).fill(0xffffff); g.rect(1, -10, 2.5, 18).fill(0xffffff); g.moveTo(3.5, -10).quadraticCurveTo(12, -6, 9, 2).stroke({ width: 2.5, color: 0xffffff }); });
    this.textures.zzz = this.shape((g) => { g.moveTo(-8, -8).lineTo(8, -8).lineTo(-8, 8).lineTo(8, 8).stroke({ width: 4, color: 0xffffff, join: 'round' }); });
  }

  burst(x, y, kind = 'star', count = 10, options = {}) {
    const { tint = null, speed = 240, gravity = 380, life = 0.9, size = 1, spread = Math.PI * 2, angle = -Math.PI / 2 } = options;
    for (let i = 0; i < count; i += 1) {
      const sprite = new this.PIXI.Sprite(this.textures[kind]);
      sprite.anchor.set(0.5);
      sprite.position.set(x, y);
      if (tint != null) sprite.tint = Array.isArray(tint) ? tint[i % tint.length] : tint;
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.4 + Math.random() * 0.6);
      sprite.scale.set(0);
      this.layer.addChild(sprite);
      this.live.push({ sprite, vx: Math.cos(a) * v, vy: Math.sin(a) * v, gravity, life: life * (0.7 + Math.random() * 0.6), age: 0, spin: (Math.random() - 0.5) * 6, size: size * (0.7 + Math.random() * 0.7) });
    }
  }

  update(dt) {
    for (let i = this.live.length - 1; i >= 0; i -= 1) {
      const p = this.live[i];
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) { p.sprite.destroy(); this.live.splice(i, 1); continue; }
      p.vy += p.gravity * dt;
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.sprite.rotation += p.spin * dt;
      p.sprite.alpha = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
      p.sprite.scale.set(p.size * Math.min(1, k * 6) * (1 - k * 0.3));
    }
  }

  destroy() { this.app.ticker.remove(this.tick); this.live = []; }
}
