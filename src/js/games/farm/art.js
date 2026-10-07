// Arte da fazenda desenhada em vetor (sem imagens): personagens, comidas e cenário.
// Cada personagem tem o pé no ponto (0,0) e ~200 unidades de altura.

const circle = (PIXI, parent, x, y, r, color, alpha = 1) => { const g = new PIXI.Graphics().circle(x, y, r).fill({ color, alpha }); parent.addChild(g); return g; };
const ellipse = (PIXI, parent, x, y, rx, ry, color, alpha = 1) => { const g = new PIXI.Graphics().ellipse(x, y, rx, ry).fill({ color, alpha }); parent.addChild(g); return g; };

function eyes(PIXI, x, y, gap = 18, r = 11) {
  const group = new PIXI.Container();
  group.position.set(x, y);
  [-gap, gap].forEach((dx) => {
    const eye = new PIXI.Container();
    eye.position.set(dx, 0);
    circle(PIXI, eye, 0, 0, r, 0xffffff);
    circle(PIXI, eye, 1, 1, r * 0.58, 0x2b2118);
    circle(PIXI, eye, -r * 0.2, -r * 0.25, r * 0.22, 0xffffff);
    group.addChild(eye);
  });
  return group;
}

function smile(PIXI, parent, x, y, w = 12) {
  const g = new PIXI.Graphics().moveTo(x - w, y).quadraticCurveTo(x, y + w * 0.9, x + w, y).stroke({ width: 3, color: 0x3a2a20, cap: 'round' });
  parent.addChild(g);
  return g;
}

function openMouth(PIXI, parent, x, y, w = 14) {
  const g = new PIXI.Container();
  ellipse(PIXI, g, x, y, w, w * 0.8, 0x4a1d1d);
  ellipse(PIXI, g, x, y + w * 0.35, w * 0.6, w * 0.4, 0xff7a8a);
  g.visible = false;
  parent.addChild(g);
  return g;
}

function cheeks(PIXI, parent, y, dx = 30) {
  circle(PIXI, parent, -dx, y, 8, 0xff8fa3, 0.45);
  circle(PIXI, parent, dx, y, 8, 0xff8fa3, 0.45);
}

const BUILDERS = {
  vaca(PIXI, parts) {
    const { back, body, head } = parts;
    ellipse(PIXI, body, 0, -68, 70, 60, 0xffffff);
    ellipse(PIXI, body, -34, -80, 20, 15, 0x2f2f3a);
    ellipse(PIXI, body, 40, -52, 17, 20, 0x2f2f3a);
    [-1, 1].forEach((s) => { ellipse(PIXI, body, s * 38, -14, 16, 10, 0xffffff); ellipse(PIXI, body, s * 38, -4, 14, 5, 0x6b4a3a); });
    const ears = [];
    [-1, 1].forEach((s) => {
      const ear = new PIXI.Container(); ear.position.set(s * 50, -158); ear.rotation = s * 0.5;
      ellipse(PIXI, ear, 0, 0, 20, 11, 0x2f2f3a); ellipse(PIXI, ear, 0, 0, 12, 6, 0xffb3c1);
      head.addChild(ear); ears.push(ear);
      const horn = new PIXI.Graphics().moveTo(s * 20, -190).quadraticCurveTo(s * 30, -212, s * 40, -204).quadraticCurveTo(s * 34, -194, s * 28, -188).fill(0xf3e2b3);
      head.addChild(horn);
    });
    circle(PIXI, head, 0, -150, 46, 0xffffff);
    ellipse(PIXI, head, -26, -170, 16, 12, 0x2f2f3a);
    ellipse(PIXI, head, 0, -128, 30, 21, 0xffb3c1);
    circle(PIXI, head, -10, -128, 3.5, 0xb0586e); circle(PIXI, head, 10, -128, 3.5, 0xb0586e);
    parts.ears = ears;
    parts.eyes = eyes(PIXI, 0, -156, 19, 11); head.addChild(parts.eyes);
    cheeks(PIXI, head, -138, 38);
    parts.mouth = openMouth(PIXI, head, 0, -118, 12);
    const tail = new PIXI.Container(); tail.position.set(66, -86);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(18, 10, 12, 40).stroke({ width: 5, color: 0x2f2f3a, cap: 'round' }));
    circle(PIXI, tail, 12, 42, 7, 0x2f2f3a);
    back.addChild(tail); parts.tail = tail;
  },
  galinha(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(40, -96);
    [-0.5, 0, 0.5].forEach((r) => { const f = ellipse(PIXI, tail, 18, 0, 26, 11, 0xf1f1f1); f.rotation = r - 0.5; f.pivot.set(0, 0); });
    back.addChild(tail); parts.tail = tail;
    ellipse(PIXI, body, 0, -66, 66, 58, 0xffffff);
    const wing = ellipse(PIXI, body, 38, -66, 24, 34, 0xf0e3d2); wing.rotation = 0.35; parts.wing = wing;
    [-1, 1].forEach((s) => { body.addChild(new PIXI.Graphics().moveTo(s * 20, -10).lineTo(s * 20, 0).moveTo(s * 20, 0).lineTo(s * 8, 4).moveTo(s * 20, 0).lineTo(s * 32, 4).stroke({ width: 5, color: 0xf59e0b, cap: 'round' })); });
    circle(PIXI, head, 0, -142, 40, 0xffffff);
    [-16, 0, 16].forEach((dx, i) => circle(PIXI, head, dx, -178 + (i === 1 ? -6 : 0), 12, 0xe53935));
    parts.eyes = eyes(PIXI, 0, -148, 17, 10); head.addChild(parts.eyes);
    head.addChild(new PIXI.Graphics().poly([-12, -136, 12, -136, 0, -118]).fill(0xffa726));
    ellipse(PIXI, head, 0, -112, 6, 10, 0xe53935);
    cheeks(PIXI, head, -134, 30);
    parts.mouth = openMouth(PIXI, head, 0, -126, 9);
    parts.ears = [];
  },
  pato(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(54, -76);
    tail.addChild(new PIXI.Graphics().poly([0, 0, 28, -22, 24, 6]).fill(0xffd23f)); back.addChild(tail); parts.tail = tail;
    ellipse(PIXI, body, 0, -62, 64, 54, 0xffd23f);
    const wing = ellipse(PIXI, body, 36, -62, 24, 32, 0xf4b400); wing.rotation = 0.3; parts.wing = wing;
    [-1, 1].forEach((s) => { body.addChild(new PIXI.Graphics().ellipse(s * 22, -4, 20, 9).fill(0xff9800)); });
    circle(PIXI, head, 0, -138, 40, 0xffd23f);
    parts.eyes = eyes(PIXI, 0, -146, 17, 10); head.addChild(parts.eyes);
    ellipse(PIXI, head, 0, -124, 30, 14, 0xff9800);
    ellipse(PIXI, head, 0, -128, 24, 8, 0xffb74d);
    cheeks(PIXI, head, -132, 34);
    parts.mouth = openMouth(PIXI, head, 0, -121, 11);
    parts.ears = [];
  },
  cachorro(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(58, -80); tail.pivot.set(0, 0);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(30, -10, 30, -46).stroke({ width: 14, color: 0xc98a4b, cap: 'round' }));
    back.addChild(tail); parts.tail = tail;
    ellipse(PIXI, body, 0, -64, 62, 56, 0xe0a76a);
    ellipse(PIXI, body, 0, -52, 36, 36, 0xf7e3c4);
    [-1, 1].forEach((s) => ellipse(PIXI, body, s * 34, -8, 17, 10, 0xe0a76a));
    const ears = [];
    [-1, 1].forEach((s) => { const ear = new PIXI.Container(); ear.position.set(s * 40, -178); ear.rotation = s * 0.25; ellipse(PIXI, ear, 0, 18, 17, 32, 0x8a5a2e); head.addChild(ear); ears.push(ear); });
    parts.ears = ears;
    circle(PIXI, head, 0, -148, 46, 0xe0a76a);
    ellipse(PIXI, head, 0, -128, 28, 22, 0xf7e3c4);
    circle(PIXI, head, -20, -154, 15, 0x8a5a2e, 0.9);
    parts.eyes = eyes(PIXI, 0, -156, 19, 11); head.addChild(parts.eyes);
    ellipse(PIXI, head, 0, -135, 11, 8, 0x2b2118);
    head.addChild(new PIXI.Graphics().moveTo(0, -128).lineTo(0, -120).moveTo(-12, -116).quadraticCurveTo(0, -108, 0, -120).quadraticCurveTo(0, -108, 12, -116).stroke({ width: 3, color: 0x3a2a20, cap: 'round' }));
    cheeks(PIXI, head, -136, 36);
    parts.mouth = openMouth(PIXI, head, 0, -116, 13);
  },
  gato(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(54, -50);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).bezierCurveTo(40, 10, 50, -30, 36, -70).stroke({ width: 13, color: 0xf08a3c, cap: 'round' }));
    back.addChild(tail); parts.tail = tail;
    ellipse(PIXI, body, 0, -62, 58, 54, 0xf6a04d);
    ellipse(PIXI, body, 0, -48, 30, 32, 0xfff1dc);
    [-1, 1].forEach((s) => ellipse(PIXI, body, s * 28, -8, 16, 10, 0xf6a04d));
    [-1, 1].forEach((s) => { body.addChild(new PIXI.Graphics().roundRect(s * 54 - 4, -86, 8, 20, 4).fill(0xe0782a)); });
    const ears = [];
    [-1, 1].forEach((s) => {
      const ear = new PIXI.Container(); ear.position.set(s * 32, -184);
      ear.addChild(new PIXI.Graphics().poly([-16 * s, 16, 16 * s, 16, 6 * s, -22]).fill(0xf6a04d));
      ear.addChild(new PIXI.Graphics().poly([-8 * s, 14, 9 * s, 14, 4 * s, -8]).fill(0xffb3c1));
      head.addChild(ear); ears.push(ear);
    });
    parts.ears = ears;
    circle(PIXI, head, 0, -148, 46, 0xf6a04d);
    [-12, 0, 12].forEach((dx) => head.addChild(new PIXI.Graphics().roundRect(dx - 3, -192, 6, 16, 3).fill(0xe0782a)));
    ellipse(PIXI, head, 0, -126, 24, 18, 0xfff1dc);
    parts.eyes = eyes(PIXI, 0, -156, 19, 11); head.addChild(parts.eyes);
    head.addChild(new PIXI.Graphics().poly([-6, -134, 6, -134, 0, -126]).fill(0xff7a95));
    [-1, 1].forEach((s) => { head.addChild(new PIXI.Graphics().moveTo(s * 20, -128).lineTo(s * 54, -134).moveTo(s * 20, -122).lineTo(s * 54, -118).stroke({ width: 2, color: 0x7a4a2a, cap: 'round' })); });
    smile(PIXI, head, 0, -122, 8);
    cheeks(PIXI, head, -134, 36);
    parts.mouth = openMouth(PIXI, head, 0, -118, 11);
  }
};

export function buildAnimal(PIXI, id) {
  const root = new PIXI.Container();
  const shadow = new PIXI.Graphics().ellipse(0, 2, 74, 15).fill({ color: 0x000000, alpha: 0.18 });
  const back = new PIXI.Container();
  const body = new PIXI.Container();
  const head = new PIXI.Container();
  root.addChild(shadow, back, body, head);
  const parts = { root, shadow, back, body, head, ears: [], eyes: null, mouth: null, tail: null, wing: null };
  (BUILDERS[id] || BUILDERS.vaca)(PIXI, parts);
  parts.head.pivot.set(0, -120);
  parts.head.position.set(0, -120);
  parts.body.pivot.set(0, 0);
  parts.sleepy = false;
  return parts;
}

// ---------- comidas ----------
export function buildFood(PIXI, kind) {
  const g = new PIXI.Container();
  if (kind === 'feno') {
    for (let i = -3; i <= 3; i += 1) g.addChild(new PIXI.Graphics().moveTo(i * 6, 24).lineTo(i * 9 + (i % 2) * 4, -26).stroke({ width: 5, color: i % 2 ? 0xe8b923 : 0xf5cf47, cap: 'round' }));
    g.addChild(new PIXI.Graphics().roundRect(-24, -2, 48, 8, 4).fill(0xd8434b));
  } else if (kind === 'milho') {
    g.addChild(new PIXI.Graphics().ellipse(0, 0, 17, 32).fill(0xffd23f));
    for (let r = -3; r <= 3; r += 1) for (let c = -1; c <= 1; c += 1) g.addChild(new PIXI.Graphics().circle(c * 8, r * 8, 3.2).fill(0xf0a500));
    g.addChild(new PIXI.Graphics().moveTo(-4, 34).quadraticCurveTo(-30, 10, -16, -20).quadraticCurveTo(-14, 10, 0, 28).fill(0x5cb85c));
    g.addChild(new PIXI.Graphics().moveTo(4, 34).quadraticCurveTo(30, 10, 16, -20).quadraticCurveTo(14, 10, 0, 28).fill(0x43a047));
  } else if (kind === 'alface') {
    const pts = [];
    for (let i = 0; i < 24; i += 1) { const a = (Math.PI * 2 * i) / 24; const r = 30 + (i % 2) * 6; pts.push(Math.cos(a) * r, Math.sin(a) * r * 0.9); }
    g.addChild(new PIXI.Graphics().poly(pts).fill(0x7bcf5a));
    g.addChild(new PIXI.Graphics().circle(0, 0, 18).fill(0x9be07a));
    g.addChild(new PIXI.Graphics().moveTo(0, 28).lineTo(0, -20).moveTo(0, 6).lineTo(-14, -8).moveTo(0, 6).lineTo(14, -8).stroke({ width: 3, color: 0xd4f5c3, cap: 'round' }));
  } else if (kind === 'osso') {
    g.rotation = -0.5;
    g.addChild(new PIXI.Graphics().roundRect(-26, -7, 52, 14, 6).fill(0xfff6e2));
    [[-28, -9], [-28, 9], [28, -9], [28, 9]].forEach(([x, y]) => g.addChild(new PIXI.Graphics().circle(x, y, 10).fill(0xfff6e2)));
  } else if (kind === 'peixe') {
    g.addChild(new PIXI.Graphics().poly([14, 0, 40, -20, 40, 20]).fill(0x5aa9e6));
    g.addChild(new PIXI.Graphics().ellipse(-4, 0, 30, 20).fill(0x7fc4f5));
    g.addChild(new PIXI.Graphics().ellipse(-4, 6, 22, 9).fill(0xcfe9fb));
    g.addChild(new PIXI.Graphics().circle(-18, -5, 5).fill(0xffffff));
    g.addChild(new PIXI.Graphics().circle(-17, -5, 2.4).fill(0x1d2a35));
  }
  return g;
}

export function buildEgg(PIXI) {
  const egg = new PIXI.Container();
  egg.addChild(new PIXI.Graphics().ellipse(0, 0, 17, 22).fill(0xfff4df).stroke({ width: 2, color: 0xe5cfa8 }));
  egg.addChild(new PIXI.Graphics().ellipse(-6, -8, 4, 7).fill({ color: 0xffffff, alpha: 0.8 }));
  return egg;
}

// ---------- cenário ----------
export function skyTexture(PIXI, top, bottom, h = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 4, h);
  return PIXI.Texture.from(canvas);
}

export function hills(PIXI, w, h, baseY, amp, color, phase = 0, freq = 1.6) {
  const g = new PIXI.Graphics();
  g.moveTo(0, h);
  for (let x = 0; x <= w; x += 8) g.lineTo(x, baseY + Math.sin((x / w) * Math.PI * freq + phase) * amp + Math.sin((x / w) * Math.PI * freq * 2.3 + phase * 2) * amp * 0.35);
  g.lineTo(w, h).closePath().fill(color);
  return g;
}

export function buildBarn(PIXI, w) {
  const s = w / 220;
  const barn = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(-110, -110, 220, 110, 6).fill(0xc8433a);
  g.poly([-122, -108, 0, -190, 122, -108]).fill(0x8d2f2a);
  g.poly([-110, -110, 0, -176, 110, -110]).fill(0xc8433a);
  g.roundRect(-44, -76, 88, 76, 4).fill(0x7a2a24);
  g.roundRect(-40, -72, 80, 72, 3).fill(0xfff4e6);
  g.moveTo(-40, -72).lineTo(40, 0).moveTo(40, -72).lineTo(-40, 0).stroke({ width: 6, color: 0xc8433a });
  g.rect(-40, -72, 80, 72).stroke({ width: 6, color: 0xc8433a });
  g.circle(0, -138, 17).fill(0xfff4e6).circle(0, -138, 11).fill(0x3b2a1f);
  barn.addChild(g);
  barn.scale.set(s);
  return barn;
}

export function buildTree(PIXI, size, tone = 0x4caf50) {
  const t = new PIXI.Container();
  t.addChild(new PIXI.Graphics().roundRect(-8, -size * 0.5, 16, size * 0.5, 6).fill(0x8d5a34));
  t.addChild(new PIXI.Graphics().circle(0, -size * 0.7, size * 0.38).fill(tone).circle(-size * 0.25, -size * 0.55, size * 0.27).fill(tone).circle(size * 0.25, -size * 0.55, size * 0.27).fill(tone));
  t.addChild(new PIXI.Graphics().circle(-size * 0.1, -size * 0.8, size * 0.15).fill({ color: 0xffffff, alpha: 0.12 }));
  return t;
}

export function buildCloud(PIXI, size) {
  const c = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.circle(0, 0, size * 0.5).circle(size * 0.55, size * 0.1, size * 0.4).circle(-size * 0.55, size * 0.12, size * 0.36).circle(size * 0.2, -size * 0.28, size * 0.38).fill({ color: 0xffffff, alpha: 0.92 });
  c.addChild(g);
  return c;
}

export function buildFence(PIXI, w) {
  const g = new PIXI.Graphics();
  for (let x = 0; x <= w; x += 46) g.roundRect(x, -46, 14, 50, 4).fill(0xf6ead2).roundRect(x + 3, -42, 3, 42, 2).fill({ color: 0xffffff, alpha: 0.5 });
  g.roundRect(0, -36, w + 14, 8, 3).fill(0xe9d5ae).roundRect(0, -16, w + 14, 8, 3).fill(0xe9d5ae);
  return g;
}

export function buildGrassTuft(PIXI) {
  const g = new PIXI.Graphics();
  [-8, 0, 8].forEach((dx, i) => g.moveTo(dx, 0).quadraticCurveTo(dx + (i - 1) * 6, -14, dx + (i - 1) * 10, -22 - i % 2 * 6).stroke({ width: 3.5, color: 0x3f9e44, cap: 'round' }));
  return g;
}

export function buildFlower(PIXI, color) {
  const f = new PIXI.Container();
  f.addChild(new PIXI.Graphics().moveTo(0, 0).lineTo(0, -22).stroke({ width: 3, color: 0x3f9e44, cap: 'round' }));
  for (let i = 0; i < 5; i += 1) { const a = (Math.PI * 2 * i) / 5; f.addChild(new PIXI.Graphics().circle(Math.cos(a) * 6, -24 + Math.sin(a) * 6, 5).fill(color)); }
  f.addChild(new PIXI.Graphics().circle(0, -24, 4).fill(0xffe066));
  return f;
}
