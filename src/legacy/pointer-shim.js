// Aparelhos antigos (iOS < 13, Android 4–5): não têm Pointer Events, só toque e mouse.
// Este adaptador traduz toque/mouse em pointerdown/move/up/cancel para os jogos
// funcionarem igual. Em aparelhos novos não faz nada.
//
// - move/up/cancel vão para o elemento onde o dedo começou (como setPointerCapture),
//   e sobem até window, onde a pintura escuta o fim do traço;
// - arrastar em canvas, peças de quebra-cabeça e [data-drag] não rola a página.

const DRAG_SELECTOR = 'canvas, .puzzle-piece, [data-drag]';

function closest(el, selector) {
  for (let node = el; node && node.nodeType === 1; node = node.parentNode) {
    const matches = node.matches || node.webkitMatchesSelector || node.msMatchesSelector;
    if (matches && matches.call(node, selector)) return node;
  }
  return null;
}

function dispatch(target, type, point, pointerId, pointerType, isPrimary) {
  const event = document.createEvent('Event');
  event.initEvent(type, true, type !== 'pointercancel');
  event.pointerId = pointerId;
  event.pointerType = pointerType;
  event.isPrimary = isPrimary;
  event.button = 0;
  event.buttons = type === 'pointerup' || type === 'pointercancel' ? 0 : 1;
  event.clientX = point.clientX;
  event.clientY = point.clientY;
  event.pageX = point.pageX;
  event.pageY = point.pageY;
  event.screenX = point.screenX;
  event.screenY = point.screenY;
  target.dispatchEvent(event);
  return event.defaultPrevented;
}

export function installPointerShim() {
  if (typeof window === 'undefined' || window.PointerEvent) return;

  const proto = window.Element && window.Element.prototype;
  if (proto && !proto.setPointerCapture) {
    proto.setPointerCapture = function () {};
    proto.releasePointerCapture = function () {};
    proto.hasPointerCapture = function () { return false; };
  }

  const touches = {}; // identifier → elemento onde o toque começou
  let primaryId = null;
  let lastTouch = 0;

  const onTouch = (type) => (event) => {
    lastTouch = Date.now();
    const list = event.changedTouches;
    for (let i = 0; i < list.length; i++) {
      const touch = list[i];
      const id = touch.identifier + 2; // 1 fica para o mouse
      let target = touches[id];
      if (type === 'pointerdown') {
        target = touch.target.nodeType === 1 ? touch.target : touch.target.parentNode;
        touches[id] = target;
        if (primaryId === null) primaryId = id;
      }
      if (!target) continue;
      const prevented = dispatch(target, type, touch, id, 'touch', id === primaryId);
      if (type === 'pointermove' && (prevented || closest(target, DRAG_SELECTOR))) event.preventDefault();
      if (type === 'pointerup' || type === 'pointercancel') {
        delete touches[id];
        if (primaryId === id) primaryId = null;
      }
    }
  };

  document.addEventListener('touchstart', onTouch('pointerdown'), true);
  document.addEventListener('touchmove', onTouch('pointermove'), true);
  document.addEventListener('touchend', onTouch('pointerup'), true);
  document.addEventListener('touchcancel', onTouch('pointercancel'), true);

  // Mouse (computadores antigos). Ignora o clique que o navegador simula depois de um toque.
  let mouseTarget = null;
  const fromMouse = () => Date.now() - lastTouch > 800;
  document.addEventListener('mousedown', (event) => {
    if (!fromMouse()) return;
    mouseTarget = event.target;
    dispatch(mouseTarget, 'pointerdown', event, 1, 'mouse', true);
  }, true);
  document.addEventListener('mousemove', (event) => {
    if (!fromMouse()) return;
    dispatch(mouseTarget || event.target, 'pointermove', event, 1, 'mouse', true);
  }, true);
  document.addEventListener('mouseup', (event) => {
    if (!fromMouse()) return;
    dispatch(mouseTarget || event.target, 'pointerup', event, 1, 'mouse', true);
    mouseTarget = null;
  }, true);
}
