import { gallery } from '../../core/gallery.js';
import { buildDiary } from '../../core/family-diary.js';
import { isNativeApp } from '../../core/kid-lock.js';

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
const CAPTION = {
  atelie: (label) => `Pintei e deu vida: ${esc(label)}!`,
  cozinha: (label) => `Eu cozinhei: ${esc(label)}!`,
  blocos: (label) => `Eu construí: ${esc(label)}!`
};
const caption = (work) => (CAPTION[work.kind] ? CAPTION[work.kind](work.label || '') : esc(work.label || ''));
const dateBr = (at) => new Date(at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// Miniaturas da galeria dentro da Área da Família; cada obra pode ser apagada. Devolve uma função que libera os endereços.
export async function renderGallery(host, onChange) {
  const works = await gallery.list().catch(() => []);
  const urls = works.map((w) => URL.createObjectURL(w.blob));
  host.innerHTML = works.length
    ? works.map((w, i) => `<figure class="gal-item" data-id="${w.id}"><img src="${urls[i]}" alt="${esc(caption(w).replace(/&[a-z#0-9]+;/g, ''))}" loading="lazy" /><figcaption>${caption(w)}<button class="gal-del" data-id="${w.id}" aria-label="Apagar esta obra">🗑</button></figcaption></figure>`).join('')
    : '<p class="family-hint">Ainda não há obras. Quando ela terminar um desenho, um prato ou uma construção, a foto aparece aqui.</p>';
  host.querySelectorAll('.gal-del').forEach((btn) => btn.addEventListener('click', async () => { await gallery.remove(Number(btn.dataset.id)); urls.forEach((u) => URL.revokeObjectURL(u)); await renderGallery(host, onChange); onChange?.(); }));
  return { count: works.length, release: () => urls.forEach((u) => URL.revokeObjectURL(u)) };
}

// "Meu Livro": as obras da criança em páginas prontas para imprimir ou salvar como PDF (impressão do navegador).
export async function openMeuLivro({ childName = '', progress = {} } = {}) {
  const works = (await gallery.list().catch(() => [])).slice().reverse();
  const urls = works.map((w) => URL.createObjectURL(w.blob));
  const diary = buildDiary({ storage: localStorage, progress, childName });
  const name = String(childName || '').trim();
  const root = document.createElement('div');
  root.className = 'book-print';
  root.innerHTML = `
    <div class="book-toolbar">
      <button id="book-print" class="family-button">🖨️ Imprimir ou salvar em PDF</button>
      <button id="book-close" class="family-button">Fechar</button>
      ${isNativeApp() ? '<p class="family-hint">No aplicativo Android, se a impressão não abrir, abra o Meu Livro no navegador do celular ou tire fotos das páginas.</p>' : ''}
    </div>
    <section class="book-page book-cover">
      <h1>Meu Livro</h1>
      <p class="book-name">${name ? `de ${esc(name)}` : ''}</p>
      <p class="book-date">${esc(dateBr(Date.now()))}</p>
      <p class="book-owl" aria-hidden="true">🦉</p>
    </section>
    ${works.map((w, i) => `<section class="book-page book-work"><img src="${urls[i]}" alt="" /><p>${caption(w)}</p><small>${esc(dateBr(w.at))}</small></section>`).join('') || '<section class="book-page"><p>Ainda não há obras. Brinque mais um pouquinho e volte!</p></section>'}
    <section class="book-page book-end">
      <h2>O que eu fiz${name ? `, ${esc(name)}` : ''}</h2>
      <ul>${diary.highlights.map((h) => `<li>${esc(h)}</li>`).join('') || '<li>Muito mais vem por aí!</li>'}</ul>
      <p class="book-owl" aria-hidden="true">🌙</p>
    </section>`;
  document.body.appendChild(root);
  document.body.classList.add('printing-book');
  const close = () => { root.remove(); document.body.classList.remove('printing-book'); urls.forEach((u) => URL.revokeObjectURL(u)); };
  root.querySelector('#book-close').addEventListener('click', close);
  root.querySelector('#book-print').addEventListener('click', () => { try { window.print(); } catch (error) { /* sem impressão neste aparelho */ } });
  return { root, close, pages: works.length + 2 };
}
