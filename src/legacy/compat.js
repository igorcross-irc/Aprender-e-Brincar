// Compatibilidade com aparelhos antigos (iPad com iOS 9, Android 5…).
// Descobre o que o navegador não tem e liga a alternativa correspondente:
//   .no-grid / .no-flexgap → regras geradas por scripts/postcss-legacy.cjs
//   .no-aspect             → altura = largura nos cartões quadrados (abaixo)
//   .no-webp               → imagens .webp trocadas pelas cópias .png
//   sem Pointer Events     → src/legacy/pointer-shim.js
// Em aparelhos novos tudo é detectado como presente e nada é ligado.
import { installPointerShim } from './pointer-shim.js';

// Elementos com aspect-ratio: 1 em src/css/styles.css (o legacy-audit confere a lista).
export const SQUARE_SELECTORS = ['.world-tile', '.peek-spot', '.story-slot', '.story-card', '.sticker', '.memory-card'];

const WEBP_PROBE = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';

const html = () => document.documentElement;
const addClass = (name) => { html().className += ` ${name}`; };
const forEach = (list, fn) => Array.prototype.forEach.call(list, fn);

function supports(prop, value) {
  try { return Boolean(window.CSS && window.CSS.supports && window.CSS.supports(prop, value)); } catch { return false; }
}

function supportsFlexGap() {
  const box = document.createElement('div');
  box.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';
  box.appendChild(document.createElement('div'));
  box.appendChild(document.createElement('div'));
  html().appendChild(box);
  const ok = box.scrollHeight === 1;
  box.parentNode.removeChild(box);
  return ok;
}

// Observa o app inteiro e chama fn (no máximo uma vez por quadro) quando algo muda.
function onDomChange(fn, attributes) {
  let queued = false;
  const run = () => { queued = false; fn(); };
  const schedule = () => {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(run);
  };
  if (window.MutationObserver) {
    const options = { childList: true, subtree: true };
    if (attributes) { options.attributes = true; options.attributeFilter = attributes; }
    new MutationObserver(schedule).observe(document.body, options);
  }
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  schedule();
}

function squareFallback() {
  const selector = SQUARE_SELECTORS.join(',');
  onDomChange(() => {
    forEach(document.querySelectorAll(selector), (el) => {
      const width = el.offsetWidth;
      if (width && el.style.height !== `${width}px`) el.style.height = `${width}px`;
    });
  });
}

function webpFallback() {
  const swap = () => {
    forEach(document.querySelectorAll('img[src$=".webp"]'), (img) => {
      img.setAttribute('src', img.getAttribute('src').replace(/\.webp$/, '.png'));
    });
  };
  addClass('no-webp');
  onDomChange(swap, ['src']);
}

export function installCompat() {
  // scripts/legacy-audit.mjs simula um aparelho antigo no Chromium ligando tudo.
  const simulate = window.__AB_SIMULATE_LEGACY__ === true;
  if (simulate || !supports('display', 'grid')) addClass('no-grid');
  if (simulate || !supportsFlexGap()) addClass('no-flexgap');
  if (simulate || !supports('aspect-ratio', '1')) { addClass('no-aspect'); squareFallback(); }

  if (simulate) webpFallback();
  else {
    const probe = new Image();
    probe.onload = () => { if (!(probe.width > 0 && probe.height > 0)) webpFallback(); };
    probe.onerror = webpFallback;
    probe.src = WEBP_PROBE;
  }

  installPointerShim();
}
