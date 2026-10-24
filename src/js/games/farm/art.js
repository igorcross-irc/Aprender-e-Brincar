// Arte da fazenda desenhada em vetor (sem imagens), em estilo "gouache" chapado:
// cores vibrantes, formas geométricas, bolinhas, listras e acessórios coloridos.
// Cada personagem tem o pé no ponto (0,0) e ~210 unidades de altura.

export const PALETTE = {
  ink: 0x2a1b3d, cream: 0xfff4dc, white: 0xffffff, pink: 0xff6fa5, magenta: 0xff3f8e, red: 0xff4b3e, orange: 0xff8a1f,
  sun: 0xffcf1f, yellow: 0xffe14d, lime: 0xb6e03a, green: 0x3dc15d, teal: 0x12b5a6, sky: 0x2fb6ee, blue: 0x2f7de1, purple: 0x7a3fd0, navy: 0x2b2a6b
};
const P = PALETTE;

const disc = (PIXI, parent, x, y, r, color, alpha = 1) => { const g = new PIXI.Graphics().circle(x, y, r).fill({ color, alpha }); parent.addChild(g); return g; };
const oval = (PIXI, parent, x, y, rx, ry, color, alpha = 1) => { const g = new PIXI.Graphics().ellipse(x, y, rx, ry).fill({ color, alpha }); parent.addChild(g); return g; };
const dotsOn = (PIXI, parent, pts, r, color, alpha = 1) => pts.forEach(([x, y]) => disc(PIXI, parent, x, y, r, color, alpha));

// Olhos simples e grandes (bolinhas pretas com brilho): leem bem em tela pequena.
function eyes(PIXI, x, y, gap = 20, r = 10) {
  const group = new PIXI.Container();
  group.position.set(x, y);
  [-gap, gap].forEach((dx) => {
    const eye = new PIXI.Container();
    eye.position.set(dx, 0);
    disc(PIXI, eye, 0, 0, r, P.ink);
    disc(PIXI, eye, -r * 0.32, -r * 0.34, r * 0.38, 0xffffff);
    disc(PIXI, eye, r * 0.3, r * 0.32, r * 0.16, 0xffffff, 0.85);
    group.addChild(eye);
  });
  return group;
}

function smileShape(PIXI, parent, x, y, w = 13) {
  const g = new PIXI.Graphics().moveTo(x - w, y).quadraticCurveTo(x, y + w * 1.1, x + w, y).stroke({ width: 4, color: P.ink, cap: 'round' });
  parent.addChild(g);
  return g;
}

function openMouth(PIXI, parent, x, y, w = 14) {
  const g = new PIXI.Container();
  oval(PIXI, g, x, y + 2, w, w * 0.85, 0x4a1030);
  oval(PIXI, g, x, y + w * 0.4, w * 0.62, w * 0.42, P.pink);
  g.visible = false;
  parent.addChild(g);
  return g;
}

const blush = (PIXI, parent, y, dx = 34, r = 9) => { disc(PIXI, parent, -dx, y, r, P.magenta, 0.4); disc(PIXI, parent, dx, y, r, P.magenta, 0.4); };

function bandana(PIXI, parent, y, base, dot) {
  const g = new PIXI.Container();
  g.addChild(new PIXI.Graphics().poly([-36, y - 6, 36, y - 6, 0, y + 40]).fill(base));
  g.addChild(new PIXI.Graphics().roundRect(-38, y - 12, 76, 14, 7).fill(base));
  dotsOn(PIXI, g, [[-18, y + 4], [0, y + 8], [18, y + 4], [-6, y + 22], [8, y + 22]], 3.4, dot);
  parent.addChild(g);
  return g;
}

// Cada bicho define: corpo (body), cabeça (head), traseira (back); devolve peças animáveis.
const BUILDERS = {
  vaca(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(68, -88);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(22, 12, 14, 44).stroke({ width: 6, color: P.navy, cap: 'round' }));
    disc(PIXI, tail, 14, 48, 9, P.magenta);
    back.addChild(tail); parts.tail = tail;
    oval(PIXI, body, 0, -66, 72, 58, P.white);
    oval(PIXI, body, -38, -84, 24, 18, P.navy);
    oval(PIXI, body, 42, -50, 20, 24, P.navy);
    oval(PIXI, body, 22, -92, 9, 7, P.navy);
    [-1, 1].forEach((s) => { oval(PIXI, body, s * 38, -12, 17, 11, P.white); oval(PIXI, body, s * 38, -2, 15, 6, P.navy); });
    bandana(PIXI, body, -108, P.teal, P.yellow);
    const ears = [];
    [-1, 1].forEach((s) => {
      const horn = new PIXI.Graphics().moveTo(s * 24, -196).quadraticCurveTo(s * 34, -222, s * 48, -214).quadraticCurveTo(s * 40, -202, s * 34, -192).fill(P.yellow);
      head.addChild(horn);
      const ear = new PIXI.Container(); ear.position.set(s * 58, -164); ear.rotation = s * 0.55;
      oval(PIXI, ear, 0, 0, 24, 13, P.navy); oval(PIXI, ear, 0, 0, 15, 7, P.pink);
      head.addChild(ear); ears.push(ear);
    });
    disc(PIXI, head, 0, -150, 56, P.white);
    oval(PIXI, head, -30, -172, 20, 15, P.navy);
    oval(PIXI, head, 0, -126, 36, 25, P.pink);
    oval(PIXI, head, -11, -126, 4.5, 6, 0xc23a74); oval(PIXI, head, 11, -126, 4.5, 6, 0xc23a74);
    [[-6, -196], [6, -198], [0, -204]].forEach(([x, y], i) => disc(PIXI, head, x * 1.2, y, 6, [P.magenta, P.sun, P.sky][i]));
    parts.eyes = eyes(PIXI, 0, -158, 22, 10.5); head.addChild(parts.eyes);
    blush(PIXI, head, -138, 44);
    parts.smileG = smileShape(PIXI, head, 0, -112, 11);
    parts.mouth = openMouth(PIXI, head, 0, -112, 12);
    parts.ears = ears;
  },
  galinha(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(46, -104);
    [[-0.9, P.magenta], [-0.45, P.orange], [0, P.teal]].forEach(([r, c]) => { const f = oval(PIXI, tail, 22, 0, 32, 13, c); f.rotation = r; });
    back.addChild(tail); parts.tail = tail;
    oval(PIXI, body, 0, -68, 70, 60, P.white);
    for (let r = 0; r < 3; r += 1) for (let c = -2 + (r % 2 ? 0.5 : 0); c <= 2; c += 1) body.addChild(new PIXI.Graphics().arc(c * 16, -62 + r * 16, 8, 0.15, Math.PI - 0.15).stroke({ width: 2.4, color: P.pink, cap: 'round' }));
    const wing = new PIXI.Container(); wing.position.set(46, -70);
    oval(PIXI, wing, 0, 0, 26, 38, P.orange); oval(PIXI, wing, 0, 8, 18, 26, P.yellow); oval(PIXI, wing, 0, 14, 10, 14, P.teal);
    wing.rotation = 0.3; body.addChild(wing); parts.wing = wing;
    [-1, 1].forEach((s) => { body.addChild(new PIXI.Graphics().moveTo(s * 22, -10).lineTo(s * 22, 2).moveTo(s * 22, 2).lineTo(s * 8, 8).moveTo(s * 22, 2).lineTo(s * 36, 8).stroke({ width: 6, color: P.orange, cap: 'round' })); });
    disc(PIXI, head, 0, -144, 46, P.white);
    [-20, -6, 8, 22].forEach((dx, i) => disc(PIXI, head, dx, -186 + (i === 1 || i === 2 ? -9 : 0), 12 + (i === 1 || i === 2 ? 2 : 0), P.red));
    parts.eyes = eyes(PIXI, 0, -150, 20, 10); head.addChild(parts.eyes);
    head.addChild(new PIXI.Graphics().poly([-14, -138, 14, -138, 0, -118]).fill(P.orange));
    oval(PIXI, head, 0, -112, 7, 12, P.red);
    blush(PIXI, head, -136, 36);
    parts.smileG = new PIXI.Container();
    parts.mouth = openMouth(PIXI, head, 0, -126, 10);
    parts.ears = [];
  },
  pato(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(58, -80);
    tail.addChild(new PIXI.Graphics().poly([0, 0, 34, -26, 28, 8]).fill(P.orange)); back.addChild(tail); parts.tail = tail;
    oval(PIXI, body, 0, -64, 68, 56, P.yellow);
    [[-30, -80], [-8, -92], [18, -78], [-18, -52], [10, -48], [34, -60], [-42, -58]].forEach(([x, y]) => disc(PIXI, body, x, y, 4, P.orange, 0.55));
    const wing = new PIXI.Container(); wing.position.set(40, -64);
    oval(PIXI, wing, 0, 0, 26, 36, P.sky); oval(PIXI, wing, 0, 10, 20, 22, P.blue);
    for (let i = -1; i <= 1; i += 1) wing.addChild(new PIXI.Graphics().moveTo(-14, i * 12).lineTo(14, i * 12).stroke({ width: 3, color: P.white, cap: 'round' }));
    wing.rotation = 0.3; body.addChild(wing); parts.wing = wing;
    [-1, 1].forEach((s) => { body.addChild(new PIXI.Graphics().ellipse(s * 24, -4, 22, 10).fill(P.orange)); });
    // gravatinha-borboleta
    const bow = new PIXI.Container(); bow.position.set(0, -104);
    bow.addChild(new PIXI.Graphics().poly([0, 0, -26, -14, -26, 14]).fill(P.magenta).poly([0, 0, 26, -14, 26, 14]).fill(P.magenta));
    disc(PIXI, bow, 0, 0, 7, P.sun); dotsOn(PIXI, bow, [[-17, 0], [17, 0]], 3, P.white);
    body.addChild(bow);
    disc(PIXI, head, 0, -142, 46, P.yellow);
    head.addChild(new PIXI.Graphics().moveTo(0, -186).quadraticCurveTo(-12, -204, 4, -208).quadraticCurveTo(-2, -198, 6, -190).stroke({ width: 4, color: P.orange, cap: 'round' }));
    parts.eyes = eyes(PIXI, 0, -152, 20, 10); head.addChild(parts.eyes);
    oval(PIXI, head, 0, -128, 34, 15, P.orange); oval(PIXI, head, 0, -132, 27, 8, 0xffb04d);
    blush(PIXI, head, -136, 38);
    parts.smileG = new PIXI.Container();
    parts.mouth = openMouth(PIXI, head, 0, -123, 11);
    parts.ears = [];
  },
  cachorro(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(62, -84);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(34, -10, 32, -50).stroke({ width: 16, color: P.orange, cap: 'round' }));
    disc(PIXI, tail, 32, -52, 9, P.cream);
    back.addChild(tail); parts.tail = tail;
    oval(PIXI, body, 0, -66, 66, 58, 0xf0a04a);
    oval(PIXI, body, 0, -52, 38, 38, P.cream);
    oval(PIXI, body, -42, -86, 18, 14, P.teal); oval(PIXI, body, 44, -64, 15, 18, P.teal);
    [-1, 1].forEach((s) => oval(PIXI, body, s * 36, -9, 19, 11, 0xf0a04a));
    bandana(PIXI, body, -108, P.sun, P.red);
    const ears = [];
    [-1, 1].forEach((s) => { const ear = new PIXI.Container(); ear.position.set(s * 48, -184); ear.rotation = s * 0.22; oval(PIXI, ear, 0, 22, 21, 38, 0x8a4a22); oval(PIXI, ear, 0, 24, 11, 24, 0xa55f30); head.addChild(ear); ears.push(ear); });
    parts.ears = ears;
    disc(PIXI, head, 0, -150, 54, 0xf0a04a);
    oval(PIXI, head, 0, -126, 32, 25, P.cream);
    disc(PIXI, head, -26, -160, 19, P.teal, 0.9);
    parts.eyes = eyes(PIXI, 0, -160, 22, 10.5); head.addChild(parts.eyes);
    oval(PIXI, head, 0, -138, 13, 9, P.ink); disc(PIXI, head, -4, -141, 3, P.white, 0.8);
    parts.smileG = new PIXI.Graphics().moveTo(0, -130).lineTo(0, -122).stroke({ width: 3.5, color: P.ink, cap: 'round' }).moveTo(-13, -118).quadraticCurveTo(0, -108, 0, -122).quadraticCurveTo(0, -108, 13, -118).stroke({ width: 3.5, color: P.ink, cap: 'round' });
    head.addChild(parts.smileG);
    blush(PIXI, head, -138, 40);
    parts.mouth = openMouth(PIXI, head, 0, -118, 14);
  },
  gato(PIXI, parts) {
    const { back, body, head } = parts;
    const tail = new PIXI.Container(); tail.position.set(58, -52);
    tail.addChild(new PIXI.Graphics().moveTo(0, 0).bezierCurveTo(46, 12, 58, -34, 40, -78).stroke({ width: 15, color: P.orange, cap: 'round' }));
    [0.3, 0.55, 0.8].forEach((k) => disc(PIXI, tail, 40 + (1 - k) * 8, -78 * k - 4, 5, 0xd86512));
    back.addChild(tail); parts.tail = tail;
    oval(PIXI, body, 0, -64, 62, 56, P.orange);
    oval(PIXI, body, 0, -48, 32, 34, P.cream);
    [-1, 1].forEach((s) => { oval(PIXI, body, s * 30, -9, 17, 11, P.orange); [-70, -56, -42].forEach((y) => body.addChild(new PIXI.Graphics().roundRect(s * 54 - 7 + (s > 0 ? -4 : 4), y - 3, 14, 6, 3).fill(0xd86512))); });
    // coleira com sininho
    body.addChild(new PIXI.Graphics().roundRect(-40, -112, 80, 14, 7).fill(P.purple));
    dotsOn(PIXI, body, [[-24, -105], [-8, -105], [8, -105], [24, -105]], 2.6, P.yellow);
    disc(PIXI, body, 0, -92, 9, P.sun); disc(PIXI, body, -3, -95, 2.6, P.white, 0.8);
    const ears = [];
    [-1, 1].forEach((s) => {
      const ear = new PIXI.Container(); ear.position.set(s * 36, -192);
      ear.addChild(new PIXI.Graphics().poly([-20 * s, 20, 20 * s, 20, 8 * s, -26]).fill(P.orange));
      ear.addChild(new PIXI.Graphics().poly([-10 * s, 17, 11 * s, 17, 5 * s, -9]).fill(P.pink));
      head.addChild(ear); ears.push(ear);
    });
    parts.ears = ears;
    disc(PIXI, head, 0, -150, 54, P.orange);
    [-14, 0, 14].forEach((dx) => head.addChild(new PIXI.Graphics().roundRect(dx - 3.5, -202, 7, 20 - Math.abs(dx) * 0.4, 3.5).fill(0xd86512)));
    oval(PIXI, head, 0, -128, 28, 21, P.cream);
    parts.eyes = eyes(PIXI, 0, -160, 22, 10.5); head.addChild(parts.eyes);
    head.addChild(new PIXI.Graphics().poly([-7, -138, 7, -138, 0, -129]).fill(P.magenta));
    [-1, 1].forEach((s) => { head.addChild(new PIXI.Graphics().moveTo(s * 22, -130).lineTo(s * 62, -138).moveTo(s * 22, -124).lineTo(s * 62, -122).stroke({ width: 2.6, color: P.ink, cap: 'round' })); });
    parts.smileG = smileShape(PIXI, head, 0, -126, 9);
    blush(PIXI, head, -138, 42);
    parts.mouth = openMouth(PIXI, head, 0, -121, 12);
  }
};

export function buildAnimal(PIXI, id) {
  const root = new PIXI.Container();
  const shadow = new PIXI.Graphics().ellipse(0, 3, 80, 16).fill({ color: P.navy, alpha: 0.2 });
  const back = new PIXI.Container();
  const body = new PIXI.Container();
  const head = new PIXI.Container();
  root.addChild(shadow, back, body, head);
  const parts = { root, shadow, back, body, head, ears: [], eyes: null, mouth: null, smileG: null, tail: null, wing: null };
  (BUILDERS[id] || BUILDERS.vaca)(PIXI, parts);
  parts.head.pivot.set(0, -120);
  parts.head.position.set(0, -120);
  return parts;
}

// ---------- comidas e colheitas ----------
export function buildFood(PIXI, kind) {
  const g = new PIXI.Container();
  const add = (gr) => { g.addChild(gr); return gr; };
  if (kind === 'feno') {
    for (let i = -3; i <= 3; i += 1) add(new PIXI.Graphics().moveTo(i * 7, 26).lineTo(i * 10 + (i % 2) * 5, -28).stroke({ width: 6, color: i % 2 ? P.sun : 0xffe27a, cap: 'round' }));
    add(new PIXI.Graphics().roundRect(-28, -3, 56, 11, 5.5).fill(P.magenta));
    dotsOn(PIXI, g, [[-16, 2.5], [0, 2.5], [16, 2.5]], 2.2, P.white);
  } else if (kind === 'milho') {
    add(new PIXI.Graphics().moveTo(-4, 38).quadraticCurveTo(-36, 12, -18, -26).quadraticCurveTo(-16, 12, 0, 32).fill(P.green));
    add(new PIXI.Graphics().moveTo(4, 38).quadraticCurveTo(36, 12, 18, -26).quadraticCurveTo(16, 12, 0, 32).fill(0x27a34a));
    add(new PIXI.Graphics().ellipse(0, -2, 19, 34).fill(P.sun));
    for (let r = -3; r <= 3; r += 1) for (let c = -1; c <= 1; c += 1) disc(PIXI, g, c * 9, r * 9 - 2, 3.6, P.orange);
  } else if (kind === 'alface') {
    const pts = [];
    for (let i = 0; i < 28; i += 1) { const a = (Math.PI * 2 * i) / 28; const r = 32 + (i % 2) * 7; pts.push(Math.cos(a) * r, Math.sin(a) * r * 0.9); }
    add(new PIXI.Graphics().poly(pts).fill(P.green));
    add(new PIXI.Graphics().circle(0, 0, 20).fill(P.lime));
    add(new PIXI.Graphics().moveTo(0, 30).lineTo(0, -22).moveTo(0, 6).lineTo(-15, -9).moveTo(0, 6).lineTo(15, -9).stroke({ width: 3.4, color: 0xe9ffd0, cap: 'round' }));
  } else if (kind === 'osso') {
    g.rotation = -0.5;
    add(new PIXI.Graphics().roundRect(-28, -8, 56, 16, 7).fill(P.cream));
    [[-30, -10], [-30, 10], [30, -10], [30, 10]].forEach(([x, y]) => disc(PIXI, g, x, y, 11, P.cream));
    dotsOn(PIXI, g, [[-10, 0], [0, 0], [10, 0]], 2.4, P.pink, 0.8);
  } else if (kind === 'peixe') {
    add(new PIXI.Graphics().poly([14, 0, 44, -22, 44, 22]).fill(P.blue));
    add(new PIXI.Graphics().ellipse(-4, 0, 32, 22).fill(P.sky));
    add(new PIXI.Graphics().ellipse(-4, 8, 24, 10).fill(0xcdf3ff));
    for (let i = 0; i < 3; i += 1) add(new PIXI.Graphics().arc(6 + i * 7, -6, 7, 0.2, Math.PI - 0.2, true).stroke({ width: 2.4, color: P.blue }));
    disc(PIXI, g, -20, -5, 5.5, P.white); disc(PIXI, g, -19, -5, 2.8, P.ink);
  } else if (kind === 'cenoura') {
    add(new PIXI.Graphics().poly([-17, -18, 17, -18, 0, 34]).fill(P.orange));
    [-6, 6, 14].forEach((y, i) => add(new PIXI.Graphics().moveTo(-10 + i * 3, y - 10).lineTo(-2 + i * 2, y - 10).stroke({ width: 2.2, color: 0xe06a00, cap: 'round' })));
    add(new PIXI.Graphics().ellipse(-9, -24, 7, 15).fill(P.green)); add(new PIXI.Graphics().ellipse(0, -28, 7, 17).fill(P.lime)); add(new PIXI.Graphics().ellipse(9, -24, 7, 15).fill(P.green));
  } else if (kind === 'tomate') {
    disc(PIXI, g, 0, 4, 26, P.red); disc(PIXI, g, -9, -6, 7, P.white, 0.45);
    add(new PIXI.Graphics().poly([0, -20, 8, -12, 20, -14, 10, -6, 14, 4, 0, -2, -14, 4, -10, -6, -20, -14, -8, -12]).fill(P.green));
  } else if (kind === 'abobora') {
    oval(PIXI, g, -14, 4, 15, 24, 0xff9a2e); oval(PIXI, g, 14, 4, 15, 24, 0xff9a2e); oval(PIXI, g, 0, 4, 17, 26, P.orange);
    add(new PIXI.Graphics().roundRect(-4, -26, 8, 12, 3).fill(P.green));
  }
  return g;
}

export function buildEgg(PIXI) {
  const egg = new PIXI.Container();
  egg.addChild(new PIXI.Graphics().ellipse(0, 0, 18, 23).fill(P.cream));
  egg.addChild(new PIXI.Graphics().moveTo(-17, 2).lineTo(-9, -4).lineTo(-1, 2).lineTo(7, -4).lineTo(17, 2).stroke({ width: 3, color: P.magenta, join: 'round' }));
  dotsOn(PIXI, egg, [[-8, 12], [4, 12]], 2.4, P.sky);
  egg.addChild(new PIXI.Graphics().ellipse(-8, -12, 3.5, 6).fill({ color: 0xffffff, alpha: 0.85 }));
  return egg;
}

export function buildChick(PIXI) {
  const c = new PIXI.Container();
  oval(PIXI, c, 0, -14, 17, 15, P.yellow); disc(PIXI, c, 0, -34, 13, P.yellow);
  c.addChild(new PIXI.Graphics().poly([-4, -33, 4, -33, 0, -26]).fill(P.orange));
  disc(PIXI, c, -5, -37, 2.6, P.ink); disc(PIXI, c, 5, -37, 2.6, P.ink);
  [-6, 6].forEach((x) => c.addChild(new PIXI.Graphics().moveTo(x, -1).lineTo(x, 3).stroke({ width: 3, color: P.orange, cap: 'round' })));
  return c;
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

// Textura de "papel/guache": pontinhos sutis que tiram o aspecto digital chapado.
export function grainTexture(PIXI, size = 160) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < size * 5; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(60,20,90,0.5)';
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5);
  }
  return PIXI.Texture.from(canvas);
}

function hillPath(g, w, h, baseY, amp, phase, freq) {
  g.moveTo(0, h);
  for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, baseY + Math.sin((x / w) * Math.PI * freq + phase) * amp + Math.sin((x / w) * Math.PI * freq * 2.3 + phase * 2) * amp * 0.35);
  g.lineTo(w, h).closePath();
  return g;
}

// Morro com padrão (listras, bolinhas ou zigue-zague) recortado pelo próprio contorno.
export function patternHill(PIXI, w, h, baseY, amp, phase, freq, base, accent, pattern) {
  const root = new PIXI.Container();
  root.addChild(hillPath(new PIXI.Graphics(), w, h, baseY, amp, phase, freq).fill(base));
  const deco = new PIXI.Graphics();
  const top = baseY - amp * 1.5;
  if (pattern === 'stripes') for (let x = -h; x < w + h; x += 38) deco.poly([x, top, x + 16, top, x + 16 - 150, h, x - 150, h]).fill({ color: accent, alpha: 0.55 });
  if (pattern === 'dots') for (let y = top + 20; y < h; y += 34) for (let x = ((y / 34) % 2) * 17; x < w; x += 34) deco.circle(x, y, 6).fill({ color: accent, alpha: 0.6 });
  if (pattern === 'zigzag') for (let y = top + 24; y < h; y += 30) { deco.moveTo(0, y); for (let x = 0; x < w + 20; x += 20) deco.lineTo(x + 10, y + ((x / 20) % 2 ? 10 : -10)); deco.stroke({ width: 4, color: accent, alpha: 0.6, join: 'round' }); }
  const mask = hillPath(new PIXI.Graphics(), w, h, baseY, amp, phase, freq).fill(0xffffff);
  deco.mask = mask;
  root.addChild(deco, mask);
  return root;
}

export function buildSun(PIXI) {
  const sun = new PIXI.Container();
  const rays = new PIXI.Container();
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    const ray = new PIXI.Graphics().poly([-7, -50, 7, -50, 0, -78]).fill(i % 2 ? P.orange : P.sun);
    ray.rotation = a; rays.addChild(ray);
  }
  sun.addChild(rays);
  disc(PIXI, sun, 0, 0, 52, 0xffe14d, 0.35);
  disc(PIXI, sun, 0, 0, 44, P.sun);
  disc(PIXI, sun, -14, -4, 5, P.ink); disc(PIXI, sun, 14, -4, 5, P.ink);
  sun.addChild(new PIXI.Graphics().moveTo(-14, 10).quadraticCurveTo(0, 26, 14, 10).stroke({ width: 4, color: P.ink, cap: 'round' }));
  disc(PIXI, sun, -26, 8, 7, P.magenta, 0.4); disc(PIXI, sun, 26, 8, 7, P.magenta, 0.4);
  sun.rays = rays;
  return sun;
}

export function buildMoon(PIXI) {
  const moon = new PIXI.Container();
  disc(PIXI, moon, 0, 0, 50, 0xfff9d6, 0.25);
  disc(PIXI, moon, 0, 0, 40, 0xfff2b5);
  disc(PIXI, moon, 12, 12, 7, 0xf0dd9a, 0.8); disc(PIXI, moon, -18, 14, 4, 0xf0dd9a, 0.8);
  [-1, 1].forEach((s) => moon.addChild(new PIXI.Graphics().moveTo(s * 18 - 7, -4).quadraticCurveTo(s * 18, 4, s * 18 + 7, -4).stroke({ width: 3.4, color: P.ink, cap: 'round' })));
  moon.addChild(new PIXI.Graphics().moveTo(-7, 12).quadraticCurveTo(0, 18, 7, 12).stroke({ width: 3, color: P.ink, cap: 'round' }));
  disc(PIXI, moon, -26, 8, 5, P.magenta, 0.35); disc(PIXI, moon, 26, 8, 5, P.magenta, 0.35);
  return moon;
}

export function buildCloud(PIXI, size, tint = P.white) {
  const c = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.circle(0, 0, size * 0.5).circle(size * 0.58, size * 0.12, size * 0.4).circle(-size * 0.58, size * 0.14, size * 0.36).circle(size * 0.22, -size * 0.3, size * 0.4).circle(size * 1.05, size * 0.2, size * 0.28).circle(-size * 1.0, size * 0.22, size * 0.26).fill(tint);
  const under = new PIXI.Graphics().roundRect(-size * 1.2, size * 0.28, size * 2.5, size * 0.2, size * 0.1).fill({ color: P.pink, alpha: 0.28 });
  c.addChild(under, g);
  return c;
}

export function buildBarn(PIXI, w) {
  const s = w / 230;
  const barn = new PIXI.Container();
  const g = new PIXI.Graphics();
  g.roundRect(-112, -112, 224, 112, 8).fill(P.red);
  for (let x = -100; x < 112; x += 22) g.rect(x, -112, 5, 112).fill({ color: 0xd63a2f, alpha: 0.7 });
  g.poly([-128, -106, 0, -196, 128, -106]).fill(P.purple);
  for (let r = 0; r < 4; r += 1) for (let c = -6 + (r % 2 ? 0.5 : 0); c <= 6; c += 1) { const x = c * 20, y = -112 - r * 17; if (Math.abs(x) < 128 - r * 28) g.arc(x, y, 10, 0, Math.PI).fill(r % 2 ? 0x8f5be0 : 0x6a30c0); }
  g.roundRect(-46, -80, 92, 80, 5).fill(P.cream);
  g.moveTo(-46, -80).lineTo(46, 0).moveTo(46, -80).lineTo(-46, 0).stroke({ width: 7, color: P.red });
  g.rect(-46, -80, 92, 80).stroke({ width: 7, color: P.red });
  g.circle(0, -146, 19).fill(P.cream).circle(0, -146, 12).fill(P.sun);
  barn.addChild(g);
  barn.scale.set(s);
  return barn;
}

export function buildWindmill(PIXI, size) {
  const m = new PIXI.Container();
  m.addChild(new PIXI.Graphics().poly([-size * 0.14, 0, size * 0.14, 0, size * 0.08, -size * 0.8, -size * 0.08, -size * 0.8]).fill(P.cream));
  m.addChild(new PIXI.Graphics().poly([-size * 0.1, -size * 0.8, size * 0.1, -size * 0.8, 0, -size * 0.98]).fill(P.red));
  const blades = new PIXI.Container(); blades.position.set(0, -size * 0.82);
  [P.teal, P.sun, P.magenta, P.sky].forEach((c, i) => { const b = new PIXI.Graphics().poly([0, 0, size * 0.1, -size * 0.1, size * 0.1, -size * 0.52, -size * 0.02, -size * 0.52]).fill(c); b.rotation = (Math.PI / 2) * i; blades.addChild(b); });
  disc(PIXI, blades, 0, 0, size * 0.06, P.ink);
  m.addChild(blades); m.blades = blades;
  return m;
}

export function buildBalloon(PIXI, size) {
  const b = new PIXI.Container();
  const colors = [P.red, P.sun, P.teal, P.magenta, P.purple];
  for (let i = 0; i < 5; i += 1) { const w = size * (0.5 - Math.abs(i - 2) * 0.1); b.addChild(new PIXI.Graphics().ellipse((i - 2) * size * 0.2, 0, size * 0.2, size * 0.5).fill(colors[i])); }
  b.addChild(new PIXI.Graphics().roundRect(-size * 0.16, size * 0.62, size * 0.32, size * 0.2, size * 0.04).fill(0xb5773a));
  b.addChild(new PIXI.Graphics().moveTo(-size * 0.28, size * 0.38).lineTo(-size * 0.12, size * 0.62).moveTo(size * 0.28, size * 0.38).lineTo(size * 0.12, size * 0.62).stroke({ width: 2, color: P.ink }));
  return b;
}

export function buildRainbow(PIXI, w) {
  const r = new PIXI.Graphics();
  [P.red, P.orange, P.sun, P.green, P.sky, P.purple].forEach((c, i) => r.arc(0, 0, w * 0.5 - i * (w * 0.035), Math.PI, 0).stroke({ width: w * 0.034, color: c, alpha: 0.85 }));
  return r;
}

export function buildButterfly(PIXI, color) {
  const b = new PIXI.Container();
  const wings = new PIXI.Container(); b.addChild(wings);
  const l = new PIXI.Graphics().ellipse(-9, -3, 10, 8).fill(color).ellipse(-7, 7, 7, 6).fill(P.sun); wings.addChild(l);
  const rr = new PIXI.Graphics().ellipse(9, -3, 10, 8).fill(color).ellipse(7, 7, 7, 6).fill(P.sun); wings.addChild(rr);
  b.addChild(new PIXI.Graphics().roundRect(-1.5, -8, 3, 18, 1.5).fill(P.ink));
  b.wings = wings; b.left = l; b.right = rr;
  return b;
}

export function buildBird(PIXI, color) {
  const b = new PIXI.Container();
  const l = new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(-10, -12, -22, -4).stroke({ width: 4, color, cap: 'round' });
  const r = new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(10, -12, 22, -4).stroke({ width: 4, color, cap: 'round' });
  b.addChild(l, r); b.l = l; b.r = r;
  return b;
}

export function buildTree(PIXI, size, tone = P.green, kind = 'round') {
  const t = new PIXI.Container();
  t.addChild(new PIXI.Graphics().roundRect(-9, -size * 0.52, 18, size * 0.52, 7).fill(0xa05a2c));
  t.addChild(new PIXI.Graphics().roundRect(-3, -size * 0.5, 4, size * 0.48, 2).fill({ color: 0xffffff, alpha: 0.18 }));
  if (kind === 'round') {
    t.addChild(new PIXI.Graphics().circle(0, -size * 0.72, size * 0.4).circle(-size * 0.26, -size * 0.56, size * 0.28).circle(size * 0.26, -size * 0.56, size * 0.28).fill(tone));
    [[-0.12, -0.84], [0.16, -0.7], [-0.28, -0.6], [0.04, -0.62], [0.28, -0.84]].forEach(([x, y]) => disc(PIXI, t, x * size, y * size, size * 0.05, P.lime, 0.8));
    [[0.12, -0.92], [-0.18, -0.74]].forEach(([x, y]) => disc(PIXI, t, x * size, y * size, size * 0.045, P.red));
  } else {
    [0, 1, 2].forEach((i) => t.addChild(new PIXI.Graphics().poly([-size * (0.34 - i * 0.07), -size * (0.46 + i * 0.2), size * (0.34 - i * 0.07), -size * (0.46 + i * 0.2), 0, -size * (0.86 + i * 0.2)]).fill(i % 2 ? tone : 0x1ea04a)));
  }
  return t;
}

export function buildFence(PIXI, w) {
  const g = new PIXI.Graphics();
  const caps = [P.teal, P.sun, P.magenta, P.sky, P.orange];
  g.roundRect(0, -34, w + 14, 8, 3).fill(P.cream).roundRect(0, -14, w + 14, 8, 3).fill(P.cream);
  let i = 0;
  for (let x = 0; x <= w; x += 46, i += 1) {
    g.roundRect(x, -50, 15, 56, 5).fill(P.white);
    g.poly([x, -50, x + 15, -50, x + 7.5, -62]).fill(caps[i % caps.length]);
  }
  return g;
}

export function buildBunting(PIXI, w, sag) {
  const g = new PIXI.Graphics();
  const colors = [P.magenta, P.sun, P.teal, P.sky, P.orange, P.purple];
  g.moveTo(0, 0).quadraticCurveTo(w / 2, sag * 2, w, 0).stroke({ width: 2.4, color: P.ink });
  for (let i = 1; i < 10; i += 1) {
    const k = i / 10;
    const x = w * k; const y = 2 * sag * k * (1 - k) * 1;
    g.poly([x - 9, y, x + 9, y, x, y + 20]).fill(colors[i % colors.length]);
  }
  return g;
}

export function buildGrassTuft(PIXI) {
  const g = new PIXI.Graphics();
  [-9, 0, 9].forEach((dx, i) => g.moveTo(dx, 0).quadraticCurveTo(dx + (i - 1) * 7, -16, dx + (i - 1) * 12, -26 - (i % 2) * 7).stroke({ width: 4, color: i % 2 ? P.lime : 0x2fa84f, cap: 'round' }));
  return g;
}

export function buildFlower(PIXI, color, big = false) {
  const f = new PIXI.Container();
  const h = big ? 34 : 24; const pr = big ? 8 : 6;
  f.addChild(new PIXI.Graphics().moveTo(0, 0).lineTo(0, -h).stroke({ width: 3.4, color: 0x2fa84f, cap: 'round' }));
  f.addChild(new PIXI.Graphics().ellipse(7, -h * 0.4, 7, 3.4).fill(P.green));
  for (let i = 0; i < 6; i += 1) { const a = (Math.PI * 2 * i) / 6; disc(PIXI, f, Math.cos(a) * pr * 1.15, -h + Math.sin(a) * pr * 1.15, pr, color); }
  disc(PIXI, f, 0, -h, pr * 0.8, P.sun);
  return f;
}

// Brotinho que cresce (regado): caule + folhas; a colheita aparece por cima na hora de colher.
export function buildSprout(PIXI) {
  const s = new PIXI.Container();
  s.addChild(new PIXI.Graphics().moveTo(0, 0).quadraticCurveTo(-3, -16, 0, -26).stroke({ width: 4, color: 0x2fa84f, cap: 'round' }));
  s.addChild(new PIXI.Graphics().ellipse(-10, -24, 11, 6).fill(P.lime));
  s.addChild(new PIXI.Graphics().ellipse(10, -28, 11, 6).fill(P.green));
  s.children[1].rotation = -0.5; s.children[2].rotation = 0.5;
  return s;
}

export function buildBed(PIXI, w) {
  const b = new PIXI.Container();
  b.addChild(new PIXI.Graphics().ellipse(0, 0, w * 0.5, w * 0.19).fill(0x6b3f23));
  b.addChild(new PIXI.Graphics().ellipse(0, -3, w * 0.45, w * 0.15).fill(0x8a5430));
  dotsOn(PIXI, b, [[-w * 0.2, -4], [0, 0], [w * 0.2, -4], [-w * 0.08, -9], [w * 0.1, -8]], 2.4, 0x5a3219);
  return b;
}

export function buildWateringCan(PIXI) {
  const c = new PIXI.Container();
  c.addChild(new PIXI.Graphics().poly([14, -4, 42, -26, 46, -20, 22, 6]).fill(P.sky));
  c.addChild(new PIXI.Graphics().roundRect(-28, -22, 48, 40, 9).fill(P.blue));
  c.addChild(new PIXI.Graphics().roundRect(-28, -22, 48, 10, 5).fill(P.sky));
  c.addChild(new PIXI.Graphics().moveTo(-28, -12).quadraticCurveTo(-52, -4, -28, 10).stroke({ width: 7, color: P.blue, cap: 'round' }));
  c.addChild(new PIXI.Graphics().roundRect(40, -32, 14, 18, 4).fill(P.purple));
  dotsOn(PIXI, c, [[-14, 0], [-2, 8], [8, -2]], 3, P.white, 0.85);
  return c;
}
