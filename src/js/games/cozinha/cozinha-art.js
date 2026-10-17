import { buildFood, PALETTE as P } from '../farm/art.js';

// Arte vetorial da Cozinha Maluca (mesmo estilo chapado e vibrante da fazendinha). Tudo cabe em ~80 unidades.
const disc = (PIXI, parent, x, y, r, color, alpha = 1) => { const g = new PIXI.Graphics().circle(x, y, r).fill({ color, alpha }); parent.addChild(g); return g; };
const oval = (PIXI, parent, x, y, rx, ry, color, alpha = 1) => { const g = new PIXI.Graphics().ellipse(x, y, rx, ry).fill({ color, alpha }); parent.addChild(g); return g; };
const box = (PIXI, parent, x, y, w, h, r, color) => { const g = new PIXI.Graphics().roundRect(x, y, w, h, r).fill(color); parent.addChild(g); return g; };
const ink = (g, w = 4) => g.stroke({ width: w, color: P.ink, join: 'round', cap: 'round' });

// ---------- ingredientes ----------
export function buildIngredient(PIXI, id) {
  if (['tomate', 'alface', 'cenoura', 'peixe'].includes(id)) return buildFood(PIXI, id);
  const g = new PIXI.Container();
  const add = (gr) => { g.addChild(gr); return gr; };
  if (id === 'pao') {
    ink(add(new PIXI.Graphics().roundRect(-30, -22, 60, 46, 14).fill(0xe8a85a)));
    add(new PIXI.Graphics().roundRect(-30, -22, 60, 20, 12).fill(0xf2c27b));
    [[-12, -12], [4, -15], [16, -9]].forEach(([x, y]) => disc(PIXI, g, x, y, 2.4, 0xfff0cc, 0.9));
  } else if (id === 'queijo') {
    ink(add(new PIXI.Graphics().poly([-32, 20, 32, 20, 32, -12, -32, 6]).fill(P.sun)));
    [[-14, 12], [8, 6], [20, -2]].forEach(([x, y], i) => { disc(PIXI, g, x, y, 5 - i, 0xe6a800); });
  } else if (id === 'laranja') {
    ink(add(new PIXI.Graphics().circle(0, 4, 28).fill(P.orange)));
    disc(PIXI, g, -9, -6, 7, 0xffffff, 0.4);
    add(new PIXI.Graphics().ellipse(8, -26, 11, 6).fill(P.green));
    add(new PIXI.Graphics().rect(-1, -28, 3, 8).fill(0x2f8f43));
  } else if (id === 'ovo') {
    ink(add(new PIXI.Graphics().ellipse(0, 2, 20, 26).fill(0xfff6e0)));
    disc(PIXI, g, -7, -8, 5, 0xffffff, 0.7);
    [[6, 10], [-6, 14], [8, -2]].forEach(([x, y]) => disc(PIXI, g, x, y, 1.8, 0xe2c79a));
  } else if (id === 'morango') {
    ink(add(new PIXI.Graphics().poly([-24, -14, 24, -14, 0, 30]).fill(P.red)));
    add(new PIXI.Graphics().circle(-12, -12, 14).fill(P.red)); add(new PIXI.Graphics().circle(12, -12, 14).fill(P.red));
    [[-8, -2], [8, -2], [0, 8], [-3, 18], [3, -10]].forEach(([x, y]) => disc(PIXI, g, x, y, 2.2, 0xffe8a3));
    add(new PIXI.Graphics().poly([0, -22, 10, -30, 6, -18, 18, -22, 8, -12, -8, -12, -18, -22, -6, -18, -10, -30]).fill(P.green));
  } else if (id === 'farinha') {
    ink(add(new PIXI.Graphics().roundRect(-24, -16, 48, 46, 14).fill(0xf2dfb8)));
    add(new PIXI.Graphics().poly([-16, -16, -10, -28, 0, -18, 10, -28, 16, -16]).fill(0xd9c08a));
    add(new PIXI.Graphics().roundRect(-14, 0, 28, 14, 4).fill(P.sky));
    disc(PIXI, g, 0, 7, 3, 0xffffff);
  } else if (id === 'agua') {
    ink(add(new PIXI.Graphics().moveTo(0, -30).bezierCurveTo(22, -4, 26, 10, 14, 24).bezierCurveTo(4, 34, -14, 30, -20, 18).bezierCurveTo(-26, 4, -14, -8, 0, -30).fill(P.sky)));
    disc(PIXI, g, -8, 6, 5, 0xffffff, 0.55);
  } else if (id === 'colher') {
    add(new PIXI.Graphics().roundRect(-4, -4, 8, 44, 4).fill(0xc9b27c)).rotation = 0;
    ink(add(new PIXI.Graphics().ellipse(0, -14, 15, 19).fill(0xe0cb94)));
  }
  return g;
}

// Colher "cheia" com o ingrediente da contagem (farinha, água).
export function buildScoop(PIXI, kind) {
  const g = new PIXI.Container();
  g.addChild(new PIXI.Graphics().roundRect(-3, -2, 6, 36, 3).fill(0xc9b27c));
  const bowl = new PIXI.Graphics().ellipse(0, -10, 14, 12).fill(0xe0cb94);
  ink(bowl, 3.5); g.addChild(bowl);
  g.addChild(new PIXI.Graphics().ellipse(0, -14, 11, 6).fill(kind === 'agua' ? P.sky : 0xfff3d6));
  return g;
}

// ---------- utensílios ----------
export function buildBowl(PIXI, w = 150) {
  const g = new PIXI.Container();
  const s = w / 150;
  g.addChild(new PIXI.Graphics().ellipse(0, 52 * s, 66 * s, 11 * s).fill({ color: P.navy, alpha: 0.2 }));
  const body = new PIXI.Graphics().moveTo(-70 * s, 0).bezierCurveTo(-68 * s, 56 * s, -34 * s, 58 * s, 0, 58 * s).bezierCurveTo(34 * s, 58 * s, 68 * s, 56 * s, 70 * s, 0).closePath().fill(P.sky);
  ink(body, 5); g.addChild(body);
  g.addChild(new PIXI.Graphics().moveTo(-62 * s, 12 * s).bezierCurveTo(-58 * s, 36 * s, -40 * s, 46 * s, -20 * s, 48 * s).stroke({ width: 5, color: 0xffffff, alpha: 0.5, cap: 'round' }));
  const rim = new PIXI.Graphics().ellipse(0, 0, 72 * s, 13 * s).fill(0x7fd8ff);
  ink(rim, 5); g.addChild(rim);
  // dentro da tigela
  g.inside = new PIXI.Graphics().ellipse(0, 2, 62 * s, 8 * s).fill(0x2a8fc2);
  g.addChild(g.inside);
  return g;
}

export function buildPlate(PIXI, w = 160) {
  const g = new PIXI.Container();
  const s = w / 160;
  g.addChild(new PIXI.Graphics().ellipse(0, 12 * s, 78 * s, 14 * s).fill({ color: P.navy, alpha: 0.2 }));
  const outer = new PIXI.Graphics().ellipse(0, 0, 76 * s, 15 * s).fill(0xffffff); ink(outer, 5); g.addChild(outer);
  g.addChild(new PIXI.Graphics().ellipse(0, 0, 54 * s, 9 * s).fill(0xe6f4ff));
  return g;
}

export function buildOven(PIXI) {
  const g = new PIXI.Container();
  g.addChild(new PIXI.Graphics().ellipse(0, 62, 62, 10).fill({ color: P.navy, alpha: 0.2 }));
  const body = new PIXI.Graphics().roundRect(-56, -50, 112, 108, 18).fill(P.purple); ink(body, 5); g.addChild(body);
  g.addChild(new PIXI.Graphics().roundRect(-56, -50, 112, 20, 14).fill(0x9a62e8));
  [[-30, -40], [0, -40], [30, -40]].forEach(([x, y]) => { disc(PIXI, g, x, y, 6, P.sun); });
  const win = new PIXI.Graphics().roundRect(-40, -18, 80, 62, 12).fill(0x2a1b3d); g.addChild(win);
  g.glow = new PIXI.Graphics().roundRect(-36, -14, 72, 54, 10).fill({ color: P.orange, alpha: 0.0 });
  g.addChild(g.glow);
  g.addChild(new PIXI.Graphics().roundRect(-34, -12, 24, 8, 4).fill({ color: 0xffffff, alpha: 0.35 }));
  return g;
}

export function buildSpoonBig(PIXI) {
  const g = new PIXI.Container();
  g.addChild(new PIXI.Graphics().roundRect(-5, -10, 10, 90, 5).fill(0xc9b27c));
  const b = new PIXI.Graphics().ellipse(0, -28, 22, 28).fill(0xe0cb94); ink(b, 4); g.addChild(b);
  return g;
}

// ---------- ícones das etapas ----------
export function buildStepIcon(PIXI, step) {
  if (step.t === 'add' || step.t === 'count') { const c = buildIngredient(PIXI, step.ing); return c; }
  const g = new PIXI.Container();
  if (step.t === 'mix') {
    g.addChild(new PIXI.Graphics().circle(0, 0, 30).fill(0xe6f4ff));
    const sp = new PIXI.Graphics().moveTo(0, 0);
    for (let i = 0; i <= 40; i += 1) { const a = i * 0.34; const r = 1.4 * i * 0.55; sp.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    sp.stroke({ width: 5, color: P.blue, cap: 'round', join: 'round' }); g.addChild(sp);
  } else if (step.t === 'bake') {
    g.addChild(new PIXI.Graphics().circle(0, 4, 30).fill(0xfff0e0));
    g.addChild(new PIXI.Graphics().moveTo(0, -32).bezierCurveTo(22, -10, 26, 6, 14, 22).bezierCurveTo(4, 32, -14, 30, -18, 16).bezierCurveTo(-26, 2, -8, -10, 0, -32).fill(P.orange));
    g.addChild(new PIXI.Graphics().moveTo(0, -8).bezierCurveTo(10, 4, 12, 12, 6, 20).bezierCurveTo(0, 24, -8, 22, -9, 14).bezierCurveTo(-10, 6, -2, 2, 0, -8).fill(P.sun));
  } else {
    g.addChild(new PIXI.Graphics().circle(0, 0, 30).fill(0xffffff));
    ink(g.addChild(new PIXI.Graphics().ellipse(0, 6, 22, 7).fill(0xe6f4ff)), 3);
    g.addChild(new PIXI.Graphics().poly([-14, -6, 14, -6, 8, -22, -8, -22]).fill(P.pink));
  }
  return g;
}

// ---------- ingredientes dentro do prato / tigela ----------
// Camadas do sanduíche, uma a uma (o pão de cima fecha).
export function buildLayer(PIXI, id, index) {
  const g = new PIXI.Container();
  if (id === 'pao') {
    const top = index > 0;
    g.addChild(new PIXI.Graphics().roundRect(-52, -12, 104, 24, top ? 14 : 8).fill(top ? 0xf2c27b : 0xe8a85a));
    if (top) { g.addChild(new PIXI.Graphics().roundRect(-52, -12, 104, 22, 14).fill(0xf2c27b)); [[-22, -3], [0, -5], [22, -2]].forEach(([x, y]) => disc(PIXI, g, x, y, 2.4, 0xfff0cc)); }
    ink(g.children[g.children.length - 1], 4);
  } else if (id === 'queijo') {
    ink(g.addChild(new PIXI.Graphics().roundRect(-56, -6, 112, 12, 4).fill(P.sun)), 3);
    g.addChild(new PIXI.Graphics().poly([30, 6, 56, 6, 44, 20]).fill(P.sun));
  } else if (id === 'tomate') {
    ink(g.addChild(new PIXI.Graphics().roundRect(-48, -6, 96, 12, 6).fill(P.red)), 3);
    [-24, 0, 24].forEach((x) => disc(PIXI, g, x, 0, 2.6, 0xff9a8f));
  } else if (id === 'alface') {
    const pts = [];
    for (let i = 0; i < 14; i += 1) { pts.push(-58 + i * 8.9, (i % 2 ? 7 : -3)); }
    pts.push(58, 7, -58, 7);
    ink(g.addChild(new PIXI.Graphics().poly(pts).fill(P.green)), 3);
  } else {
    ink(g.addChild(new PIXI.Graphics().roundRect(-44, -6, 88, 12, 5).fill(P.lime)), 3);
  }
  return g;
}

// Prato final de cada receita (substitui a montagem quando está pronto).
export function buildDish(PIXI, recipeIdIn, recipes = {}) {
  const def = recipes[recipeIdIn] || {};
  const recipeId = def.dish || recipeIdIn;
  const g = new PIXI.Container();
  const add = (gr) => { g.addChild(gr); return gr; };
  if (recipeId === 'sanduiche') {
    ink(add(new PIXI.Graphics().roundRect(-54, -2, 108, 26, 12).fill(0xe8a85a)), 4);
    ink(add(new PIXI.Graphics().roundRect(-56, -14, 112, 14, 4).fill(P.sun)), 3);
    ink(add(new PIXI.Graphics().roundRect(-50, -22, 100, 12, 6).fill(P.red)), 3);
    ink(add(new PIXI.Graphics().roundRect(-52, -52, 104, 36, 18).fill(0xf2c27b)), 4);
    [[-24, -38], [0, -42], [24, -38]].forEach(([x, y]) => disc(PIXI, g, x, y, 2.6, 0xfff0cc));
  } else if (recipeId === 'suco') {
    ink(add(new PIXI.Graphics().moveTo(-28, -50).lineTo(28, -50).lineTo(22, 22).quadraticCurveTo(0, 30, -22, 22).closePath().fill(0xe6f6ff)), 4);
    add(new PIXI.Graphics().moveTo(-25, -30).lineTo(25, -30).lineTo(20, 20).quadraticCurveTo(0, 27, -20, 20).closePath().fill(def.liquid || P.orange));
    add(new PIXI.Graphics().roundRect(-18, -26, 6, 36, 3).fill({ color: 0xffffff, alpha: 0.5 }));
    add(new PIXI.Graphics().roundRect(10, -66, 8, 44, 4).fill(P.pink)).rotation = 0.25;
    ink(add(new PIXI.Graphics().ellipse(26, -52, 12, 12).fill(P.sun)), 3);
  } else if (recipeId === 'salada' || recipeId === 'sopa') {
    const soup = recipeId === 'sopa';
    ink(add(new PIXI.Graphics().moveTo(-58, -14).bezierCurveTo(-56, 30, -26, 34, 0, 34).bezierCurveTo(26, 34, 56, 30, 58, -14).closePath().fill(soup ? 0xffd9a8 : 0xffffff)), 4);
    add(new PIXI.Graphics().ellipse(0, -14, 58, 12).fill(soup ? P.orange : P.green));
    if (soup) { [[-24, -14], [4, -12], [26, -15]].forEach(([x, y]) => disc(PIXI, g, x, y, 5, P.sun)); add(new PIXI.Graphics().moveTo(-14, -30).quadraticCurveTo(-24, -44, -12, -54).stroke({ width: 4, color: 0xffffff, alpha: 0.8, cap: 'round' })); }
    else { [[-30, -22, P.red], [-6, -26, P.orange], [20, -22, P.red], [34, -16, P.lime]].forEach(([x, y, c]) => disc(PIXI, g, x, y, 9, c)); [[-18, -18], [12, -18]].forEach(([x, y]) => add(new PIXI.Graphics().ellipse(x, y, 12, 6).fill(P.lime))); }
  } else if (recipeId === 'bolo') {
    ink(add(new PIXI.Graphics().roundRect(-52, -16, 104, 44, 10).fill(0xf5d79a)), 4);
    add(new PIXI.Graphics().roundRect(-52, -16, 104, 18, 10).fill(P.pink));
    [-36, -12, 14, 38].forEach((x) => add(new PIXI.Graphics().roundRect(x - 6, -6, 12, 18, 6).fill(P.pink)));
    ink(add(new PIXI.Graphics().roundRect(-52, -16, 104, 44, 10).fill({ color: 0xffffff, alpha: 0 })), 4);
    [-30, 0, 30].forEach((x) => { add(new PIXI.Graphics().circle(x, -26, 12).fill(P.red)); add(new PIXI.Graphics().rect(x - 1, -42, 3, 8).fill(P.green)); disc(PIXI, g, x - 3, -29, 2, 0xffe8a3); });
  } else if (recipeId === 'omelete') {
    ink(add(new PIXI.Graphics().ellipse(0, 6, 62, 30).fill(0xffffff)), 4);
    ink(add(new PIXI.Graphics().moveTo(-48, 8).bezierCurveTo(-44, -26, 44, -26, 48, 8).bezierCurveTo(30, 22, -30, 22, -48, 8).closePath().fill(0xffd84a)), 4);
    [[-22, -2], [4, -8], [26, 0]].forEach(([x, y]) => disc(PIXI, g, x, y, 5, P.sun));
    add(new PIXI.Graphics().poly([-8, 4, 10, 4, 2, 14]).fill(0xfff2a0));
    [[-30, 6, P.red], [30, 8, P.green]].forEach(([x, y, c]) => disc(PIXI, g, x, y, 4, c));
  } else if (recipeId === 'frutas') {
    ink(add(new PIXI.Graphics().moveTo(-58, -14).bezierCurveTo(-56, 30, -26, 34, 0, 34).bezierCurveTo(26, 34, 56, 30, 58, -14).closePath().fill(0xffffff)), 4);
    [[-34, -22, P.red], [-12, -30, P.orange], [14, -26, P.red], [34, -18, P.orange], [-2, -14, P.sun], [22, -8, P.red], [-26, -8, P.orange]].forEach(([x, y, c]) => { disc(PIXI, g, x, y, 11, c); disc(PIXI, g, x - 3, y - 3, 2.4, 0xffffff, 0.7); });
    add(new PIXI.Graphics().ellipse(0, -36, 6, 3).fill(P.green));
  } else if (recipeId === 'bolocenoura') {
    ink(add(new PIXI.Graphics().roundRect(-52, -16, 104, 44, 10).fill(0xf0a04a)), 4);
    add(new PIXI.Graphics().roundRect(-52, -16, 104, 18, 10).fill(0x7a4a2b));
    [-36, -12, 14, 38].forEach((x) => add(new PIXI.Graphics().roundRect(x - 6, -6, 12, 16, 6).fill(0x7a4a2b)));
    [-24, 22].forEach((x) => { add(new PIXI.Graphics().poly([x - 8, -34, x + 8, -34, x, -8]).fill(P.orange)); add(new PIXI.Graphics().ellipse(x, -38, 9, 5).fill(P.green)); });
  } else if (recipeId === 'peixe') {
    ink(add(new PIXI.Graphics().poly([34, 0, 66, -24, 66, 24]).fill(0xd98a4a)), 4);
    ink(add(new PIXI.Graphics().ellipse(-6, 0, 46, 28).fill(0xe6a866)), 4);
    [[-26, -6], [-8, -8], [10, -4]].forEach(([x, y]) => add(new PIXI.Graphics().arc(x, y, 10, 0.3, Math.PI - 0.3).stroke({ width: 3, color: 0xb0692f, cap: 'round' })));
    disc(PIXI, g, -34, -8, 5, 0xffffff); disc(PIXI, g, -33, -8, 2.6, P.ink);
    disc(PIXI, g, 14, 10, 9, P.red, 0.9); add(new PIXI.Graphics().ellipse(30, 14, 10, 5).fill(P.green));
  }
  return g;
}
