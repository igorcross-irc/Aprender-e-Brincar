const VISUAL_LIBRARY = {
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
  foot: { icon: '🦶', tone: 'sky', label: 'pé', imagePath: null }
};

const NORMALIZATION = {
  maçã: 'apple', maca: 'apple', banana: 'banana', bola: 'ball',
  carro: 'car', casa: 'house', árvore: 'tree', arvore: 'tree',
  gato: 'cat', cachorro: 'dog', pássaro: 'bird', passaro: 'bird',
  borboleta: 'butterfly', sol: 'sun', flor: 'flower',
  mão: 'hand', mao: 'hand', pé: 'foot', pe: 'foot'
};

export function getVisualKey(value = '') {
  const raw = String(value).trim().toLowerCase();
  return NORMALIZATION[raw] || raw;
}

export function getChildVisual(value = '', fallbackIcon = '✨') {
  const key = getVisualKey(value);
  return VISUAL_LIBRARY[key] || { icon: fallbackIcon, tone: 'sky', label: value };
}

export function childVisualMarkup(value = '', { fallbackIcon = '✨', decorative = true, size = 'large' } = {}) {
  const visual = getChildVisual(value, fallbackIcon);
  const aria = decorative ? ' aria-hidden="true"' : ` role="img" aria-label="${String(visual.label || value).replace(/"/g, '&quot;')}"`;
  const sizeClass = size === 'small' ? 'text-5xl' : size === 'medium' ? 'text-6xl' : 'text-7xl';
  const visualBody = visual.imagePath
    ? `<img src="${visual.imagePath}" alt="" loading="lazy" draggable="false">`
    : visual.icon;
  return `<span class="child-visual child-visual-${visual.tone} ${sizeClass}" data-visual-key="${getVisualKey(value)}"${aria}>${visualBody}</span>`;
}

export function childVisualLibrarySize() {
  return Object.keys(VISUAL_LIBRARY).length;
}

export function getVisualAssetManifest() {
  return Object.fromEntries(Object.entries(VISUAL_LIBRARY).map(([key, visual]) => [key, {
    label: visual.label,
    imagePath: visual.imagePath,
    fallback: visual.icon
  }]));
}
