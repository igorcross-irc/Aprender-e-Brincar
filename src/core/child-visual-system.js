const VISUAL_LIBRARY = Object.freeze({
  apple: { icon: '🍎', tone: 'rose', label: 'maçã', imagePath: '/assets/images/visual-library/apple.svg' },
  banana: { icon: '🍌', tone: 'amber', label: 'banana', imagePath: '/assets/images/visual-library/banana.svg' },
  ball: { icon: '⚽', tone: 'sky', label: 'bola', imagePath: '/assets/images/visual-library/ball.svg' },
  car: { icon: '🚗', tone: 'indigo', label: 'carro', imagePath: '/assets/images/visual-library/car.svg' },
  house: { icon: '🏠', tone: 'emerald', label: 'casa', imagePath: '/assets/images/visual-library/house.svg' },
  tree: { icon: '🌳', tone: 'green', label: 'árvore', imagePath: '/assets/images/visual-library/tree.svg' },
  cat: { icon: '🐱', tone: 'violet', label: 'gato', imagePath: '/assets/images/visual-library/cat.svg' },
  dog: { icon: '🐶', tone: 'amber', label: 'cachorro', imagePath: '/assets/images/visual-library/dog.svg' },
  bird: { icon: '🐦', tone: 'sky', label: 'pássaro', imagePath: '/assets/images/visual-library/bird.svg' },
  butterfly: { icon: '🦋', tone: 'pink', label: 'borboleta', imagePath: '/assets/images/visual-library/butterfly.svg' },
  sun: { icon: '☀️', tone: 'yellow', label: 'sol', imagePath: '/assets/images/visual-library/sun.svg' },
  flower: { icon: '🌸', tone: 'pink', label: 'flor', imagePath: '/assets/images/visual-library/flower.svg' },
  hand: { icon: '🖐️', tone: 'peach', label: 'mão', imagePath: '/assets/images/visual-library/hand.svg' },
  foot: { icon: '🦶', tone: 'sky', label: 'pé', imagePath: '/assets/images/visual-library/foot.svg' },
  cup: { icon: '🥤', tone: 'amber', label: 'copo', imagePath: '/assets/images/visual-library/cup.svg' },
  spoon: { icon: '🥄', tone: 'slate', label: 'colher', imagePath: '/assets/images/visual-library/spoon.svg' },
  book: { icon: '📖', tone: 'indigo', label: 'livro', imagePath: '/assets/images/visual-library/book.svg' },
  moon: { icon: '🌙', tone: 'violet', label: 'lua', imagePath: '/assets/images/visual-library/moon.svg' },
  star: { icon: '⭐', tone: 'yellow', label: 'estrela', imagePath: '/assets/images/visual-library/star.svg' },
  fish: { icon: '🐟', tone: 'sky', label: 'peixe', imagePath: '/assets/images/visual-library/fish.svg' },
  rabbit: { icon: '🐰', tone: 'pink', label: 'coelho', imagePath: '/assets/images/visual-library/rabbit.svg' },
  flowerRed: { icon: '🌷', tone: 'rose', label: 'tulipa', imagePath: '/assets/images/visual-library/flowerRed.svg' },
  milk: { icon: '🥛', tone: 'slate', label: 'leite', imagePath: '/assets/images/visual-library/milk.svg' },
  bed: { icon: '🛏️', tone: 'indigo', label: 'cama', imagePath: '/assets/images/visual-library/bed.svg' },
  shoe: { icon: '👟', tone: 'sky', label: 'sapato', imagePath: null }
});

const NORMALIZATION = Object.freeze({
  maçã: 'apple', maca: 'apple', banana: 'banana', bola: 'ball',
  carro: 'car', casa: 'house', árvore: 'tree', arvore: 'tree',
  gato: 'cat', cachorro: 'dog', pássaro: 'bird', passaro: 'bird',
  borboleta: 'butterfly', sol: 'sun', flor: 'flower',
  mão: 'hand', mao: 'hand', pé: 'foot', pe: 'foot', copo: 'cup', colher: 'spoon', livro: 'book', lua: 'moon', estrela: 'star', peixe: 'fish', coelho: 'rabbit', tulipa: 'flowerRed', leite: 'milk', cama: 'bed', sapato: 'shoe'
});

export function getVisualKey(value = '') {
  const raw = String(value).trim().toLowerCase();
  return NORMALIZATION[raw] || raw;
}

export function getChildVisual(value = '', fallbackIcon = '✨') {
  const key = getVisualKey(value);
  return VISUAL_LIBRARY[key] || { icon: fallbackIcon, tone: 'sky', label: value };
}

export function childVisualMarkup(value = '', { fallbackIcon = '✨', decorative = true, size = 'large', showLabel = false } = {}) {
  const visual = getChildVisual(value, fallbackIcon);
  const aria = decorative ? ' aria-hidden="true"' : ` role="img" aria-label="${escapeAttribute(visual.label || value)}"`;
  const sizeClass = size === 'small' ? 'text-5xl' : size === 'medium' ? 'text-6xl' : 'text-7xl';
  const visualBody = isVisualAssetPathSafe(visual.imagePath)
    ? `<img src="${escapeAttribute(visual.imagePath)}" alt="" loading="eager" draggable="false">`
    : escapeAttribute(visual.icon);
  const labelMarkup = showLabel && visual.label ? `<span class="child-visual-label">${escapeAttribute(visual.label)}</span>` : '';
  return `<span class="child-visual child-visual-${visual.tone} ${sizeClass}" data-visual-key="${escapeAttribute(getVisualKey(value))}"${aria}>${visualBody}${labelMarkup}</span>`;
}

export function childVisualLibrarySize() {
  return Object.keys(VISUAL_LIBRARY).length;
}

function escapeAttribute(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function isVisualAssetPathSafe(imagePath) {
  if (!imagePath) return false;
  const value = String(imagePath).trim();
  return value.startsWith('/') && !value.includes('..') && /\.(png|jpe?g|webp|avif|svg)$/i.test(value);
}

export function getVisualAssetStatus(value = '') {
  const visual = getChildVisual(value);
  return {
    key: getVisualKey(value),
    label: visual.label,
    hasAsset: isVisualAssetPathSafe(visual.imagePath),
    fallback: visual.icon
  };
}

export function getVisualLibrary() {
  return Object.fromEntries(Object.entries(VISUAL_LIBRARY).map(([key, visual]) => [key, { ...visual }]));
}

export function getVisualAssetManifest() {
  return Object.fromEntries(Object.entries(VISUAL_LIBRARY).map(([key, visual]) => [key, {
    label: visual.label,
    imagePath: visual.imagePath,
    fallback: visual.icon
  }]));
}
