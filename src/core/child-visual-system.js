const VISUAL_LIBRARY = {
  apple: { icon: '🍎', tone: 'rose', label: 'maçã' },
  banana: { icon: '🍌', tone: 'amber', label: 'banana' },
  ball: { icon: '⚽', tone: 'sky', label: 'bola' },
  car: { icon: '🚗', tone: 'indigo', label: 'carro' },
  house: { icon: '🏠', tone: 'emerald', label: 'casa' },
  tree: { icon: '🌳', tone: 'green', label: 'árvore' },
  cat: { icon: '🐱', tone: 'violet', label: 'gato' },
  dog: { icon: '🐶', tone: 'amber', label: 'cachorro' },
  bird: { icon: '🐦', tone: 'sky', label: 'pássaro' },
  butterfly: { icon: '🦋', tone: 'pink', label: 'borboleta' },
  sun: { icon: '☀️', tone: 'yellow', label: 'sol' },
  flower: { icon: '🌸', tone: 'pink', label: 'flor' },
  hand: { icon: '🖐️', tone: 'peach', label: 'mão' },
  foot: { icon: '🦶', tone: 'sky', label: 'pé' }
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
  return `<span class="child-visual child-visual-${visual.tone} ${sizeClass}" data-visual-key="${getVisualKey(value)}"${aria}>${visual.icon}</span>`;
}

export function childVisualLibrarySize() {
  return Object.keys(VISUAL_LIBRARY).length;
}
