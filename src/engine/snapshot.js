// Foto de uma cena PixiJS: devolve um JPEG pequeno (Blob) ou null se o aparelho não deixar. Nunca derruba o jogo.
export async function captureStage(app, { maxW = 360, crop = null, quality = 0.78 } = {}) {
  try {
    const src = await app.renderer.extract.canvas(app.stage);
    const f = src.width / Math.max(1, app.screen.width);
    const sx = crop ? Math.max(0, Math.round(crop.x * f)) : 0;
    const sy = crop ? Math.max(0, Math.round(crop.y * f)) : 0;
    const sw = crop ? Math.min(src.width - sx, Math.round(crop.w * f)) : src.width;
    const sh = crop ? Math.min(src.height - sy, Math.round(crop.h * f)) : src.height;
    const k = Math.min(1, maxW / sw);
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(sw * k));
    out.height = Math.max(1, Math.round(sh * k));
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return await new Promise((resolve) => out.toBlob((b) => resolve(b), 'image/jpeg', quality));
  } catch (error) {
    return null;
  }
}
