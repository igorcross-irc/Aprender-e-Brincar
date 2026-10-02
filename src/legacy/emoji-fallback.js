// Emojis novos viram quadradinho vazio em aparelhos antigos (iOS 9.3, Android 5…).
// Aqui o texto do emoji vira uma imagem (public/assets/images/emoji, Noto Emoji).
//
// Só os emojis do mapa (src/legacy/emoji-map.js, gerado por scripts/emoji-images.mjs) são
// trocados, e só trechos novos da tela são examinados — o iPad antigo é lento.
import { EMOJI_IMAGES } from './emoji-map.js';

const BASE = '/assets/images/emoji/';
const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1 };

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const emojis = Object.keys(EMOJI_IMAGES).sort((a, b) => b.length - a.length);
// O seletor de variação (U+FE0F) pode vir colado ao emoji.
const PATTERN = emojis.length ? new RegExp(`(${emojis.map(escape).join('|')})\\uFE0F?`, 'g') : null;

function replaceInTextNode(node) {
  const text = node.nodeValue;
  if (!text) return;
  PATTERN.lastIndex = 0;
  if (!PATTERN.test(text)) return; // a maioria dos textos não tem emoji novo
  PATTERN.lastIndex = 0;
  const fragment = document.createDocumentFragment();
  let last = 0;
  let match;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
    const img = document.createElement('img');
    img.className = 'emoji-img';
    img.src = `${BASE}${EMOJI_IMAGES[match[1]]}.png`;
    img.alt = match[1];
    img.setAttribute('draggable', 'false');
    fragment.appendChild(img);
    last = match.index + match[0].length;
  }
  if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));
  node.parentNode.replaceChild(fragment, node);
}

function scan(root) {
  if (root.nodeType === 3) {
    if (root.parentNode && !SKIP[root.parentNode.nodeName]) replaceInTextNode(root);
    return;
  }
  if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
  const walker = document.createTreeWalker(root, 4 /* SHOW_TEXT */, null, false);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode); // a troca muda a árvore: junta antes
  nodes.forEach((node) => { if (node.parentNode && !SKIP[node.parentNode.nodeName]) replaceInTextNode(node); });
}

export function installEmojiFallback() {
  if (!PATTERN || !window.MutationObserver) return;
  let pending = [];
  let queued = false;
  const flush = () => {
    queued = false;
    const batch = pending;
    pending = [];
    batch.forEach((node) => { if (node.parentNode) scan(node); });
  };
  new MutationObserver((records) => {
    records.forEach((record) => {
      for (let i = 0; i < record.addedNodes.length; i++) pending.push(record.addedNodes[i]);
      if (record.type === 'characterData') pending.push(record.target);
    });
    if (!queued && pending.length) {
      queued = true;
      (window.requestAnimationFrame || setTimeout)(flush);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  scan(document.body);
}
