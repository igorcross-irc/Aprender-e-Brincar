const VISUAL_LIBRARY = Object.freeze({
  apple: { icon: '🍎', tone: 'rose', label: 'maçã', imagePath: null },
  banana: { icon: '🍌', tone: 'amber', label: 'banana', imagePath: null },
  ball: { icon: '⚽', tone: 'sky', label: 'bola', imagePath: null },
  car: { icon: '🚗', tone: 'indigo', label: 'carro', imagePath: null },
  house: { icon: '🏠', tone: 'emerald', label: 'casa', imagePath: null },
  tree: { icon: '🌳', tone: 'green', label: 'árvore', imagePath: null },
  cat: { icon: '🐱', tone: 'violet', label: 'gato', imagePath: null },
  dog: { icon: '🐶', tone: 'amber', label: 'cachorro', imagePath: null },
  bird: { icon: '🐦', tone: 'sky', label: 'pássaro', imagePath: null },
  butterfly: { icon: '🦋', tone: 'pink', label: 'borboleta', imagePath: null },
  sun: { icon: '☀️', tone: 'yellow', label: 'sol', imagePath: null },
  flower: { icon: '🌸', tone: 'pink', label: 'flor', imagePath: null },
  hand: { icon: '🖐️', tone: 'peach', label: 'mão', imagePath: null },
  foot: { icon: '🦶', tone: 'sky', label: 'pé', imagePath: null },
  cup: { icon: '🥤', tone: 'amber', label: 'copo', imagePath: null },
  spoon: { icon: '🥄', tone: 'slate', label: 'colher', imagePath: null },
  book: { icon: '📖', tone: 'indigo', label: 'livro', imagePath: null },
  moon: { icon: '🌙', tone: 'violet', label: 'lua', imagePath: null },
  star: { icon: '⭐', tone: 'yellow', label: 'estrela', imagePath: null },
  fish: { icon: '🐟', tone: 'sky', label: 'peixe', imagePath: null },
  rabbit: { icon: '🐰', tone: 'pink', label: 'coelho', imagePath: null },
  flowerRed: { icon: '🌷', tone: 'rose', label: 'tulipa', imagePath: null },
  milk: { icon: '🥛', tone: 'slate', label: 'leite', imagePath: null },
  bed: { icon: '🛏️', tone: 'indigo', label: 'cama', imagePath: null },
  shoe: { icon: '👟', tone: 'sky', label: 'sapato', imagePath: null }
});

const NORMALIZATION = {
  maçã: 'apple', maca: 'apple', banana: 'banana', bola: 'ball',
  carro: 'car', casa: 'house', árvore: 'tree', arvore: 'tree',
  gato: 'cat', cachorro: 'dog', pássaro: 'bird', passaro: 'bird',
  borboleta: 'butterfly', sol: 'sun', flor: 'flower',
  mão: 'hand', mao: 'hand', pé: 'foot', pe: 'foot', copo: 'cup', colher: 'spoon', livro: 'book', lua: 'moon', estrela: 'star', peixe: 'fish', coelho: 'rabbit', tulipa: 'flowerRed', leite: 'milk', cama: 'bed', sapato: 'shoe'
};

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
