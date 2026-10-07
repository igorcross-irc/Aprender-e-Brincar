// Motor gráfico 2D (PixiJS/WebGL) usado pelos jogos-âncora. Carregado só quando o jogo abre.
export function canRunPixi() {
  try {
    if (typeof Proxy === 'undefined' || typeof Promise === 'undefined' || !window.WebGLRenderingContext) return false;
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch (error) {
    return false;
  }
}

export async function createStage(host) {
  const PIXI = await import('pixi.js');
  const app = new PIXI.Application();
  await app.init({
    resizeTo: host,
    antialias: true,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    powerPreference: 'low-power'
  });
  app.canvas.style.touchAction = 'none';
  app.canvas.style.display = 'block';
  app.canvas.setAttribute('role', 'img');
  host.appendChild(app.canvas);
  app.stage.eventMode = 'static';
  return { PIXI, app };
}
