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

// Modo lite: aparelhos antigos, sem WebGL, com pouca memória ou escolhido pela família (Área da Família → Gráficos).
export function shouldUseLite() {
  try {
    if (localStorage.getItem('ab_lite_graphics') === '1') return true;
    if (document.documentElement.classList.contains('lite')) return true;
    if (navigator.deviceMemory && navigator.deviceMemory < 2) return true;
  } catch (error) { /* ignora */ }
  return !canRunPixi();
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
