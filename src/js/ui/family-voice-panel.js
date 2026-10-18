import { stories } from '../../content/stories/index.js';
import { STORY_ART } from '../../content/stories/available.js';
import { familyVoice, startRecording } from '../../core/family-voice.js';

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

// Janela da Área da Família para gravar a voz de quem a criança ama nas histórias.
export function openFamilyVoicePanel() {
  const shelf = stories.filter((s) => STORY_ART[s.id] === s.pages.length);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  const canRecord = familyVoice.canRecord();
  modal.innerHTML = `
    <div class="modal-card family-panel family-voice" role="dialog" aria-modal="true" aria-labelledby="fv-title">
      <div class="family-head">
        <h3 id="fv-title">🎙️ Voz da família</h3>
        <button id="fv-close" class="touch-target" aria-label="Fechar">✕</button>
      </div>
      <p class="family-hint">Grave a história com a sua voz: a criança vai ouvir quem ela ama. As gravações ficam só neste aparelho e nunca são enviadas.</p>
      ${canRecord ? '' : '<p class="family-hint fv-warn">Este aparelho não consegue gravar. Grave num aparelho mais novo (as gravações ficam no aparelho onde foram feitas).</p>'}
      <label for="fv-who">Quem está lendo?</label>
      <input type="text" id="fv-who" maxlength="20" placeholder="Mamãe, Papai, Vovó…" value="${esc(familyVoice.who())}" autocomplete="off" />
      <label class="family-toggle"><input type="checkbox" id="fv-on" ${familyVoice.enabled() ? 'checked' : ''} /> Usar a voz da família nas histórias</label>
      <label for="fv-story">História</label>
      <select id="fv-story">${shelf.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select>
      <ol id="fv-pages" class="fv-pages"></ol>
      <p id="fv-status" class="family-hint" aria-live="polite"></p>
      <button id="fv-done" class="family-save">Pronto</button>
    </div>`;
  document.body.appendChild(modal);
  const q = (sel) => modal.querySelector(sel);
  const status = (text) => { q('#fv-status').textContent = text; };
  let recorder = null;
  let recordingPage = -1;
  let playing = null;

  const close = () => {
    try { recorder?.cancel(); } catch (error) { /* já parou */ }
    try { playing?.pause(); } catch (error) { /* já parou */ }
    familyVoice.setWho(q('#fv-who').value);
    familyVoice.setEnabled(q('#fv-on').checked);
    modal.remove();
  };

  async function renderPages() {
    const story = stories.find((s) => s.id === q('#fv-story').value);
    if (!story) return;
    const have = await familyVoice.pagesWithClips(story.id, story.pages.length);
    q('#fv-pages').innerHTML = story.pages.map((page, i) => `
      <li class="fv-row ${have[i] ? 'has' : ''}" data-page="${i}">
        <span class="fv-text">${esc(page[0])}</span>
        <span class="fv-actions">
          ${i === recordingPage
            ? `<button class="fv-stop" data-page="${i}" aria-label="Parar a gravação da página ${i + 1}">⏹ Parar</button>`
            : `<button class="fv-rec" data-page="${i}" ${canRecord && recordingPage < 0 ? '' : 'disabled'} aria-label="Gravar a página ${i + 1}">🎙️ ${have[i] ? 'Regravar' : 'Gravar'}</button>`}
          ${have[i] ? `<button class="fv-play" data-page="${i}" aria-label="Ouvir a página ${i + 1}">▶</button><button class="fv-del" data-page="${i}" aria-label="Apagar a página ${i + 1}">🗑</button>` : ''}
        </span>
      </li>`).join('');
    const done = Object.keys(have).length;
    status(done ? `${done} de ${story.pages.length} páginas gravadas.` : 'Nenhuma página gravada ainda.');
  }

  q('#fv-pages').addEventListener('click', async (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const page = Number(btn.dataset.page);
    const storyId = q('#fv-story').value;
    if (btn.classList.contains('fv-rec')) {
      try {
        recorder = await startRecording();
        recordingPage = page;
        status('Gravando… leia a página em voz alta e toque em Parar.');
        await renderPages();
        status('Gravando… leia a página em voz alta e toque em Parar.');
      } catch (error) { recorder = null; recordingPage = -1; status('Não consegui usar o microfone. Permita o microfone para este app e tente de novo.'); }
    } else if (btn.classList.contains('fv-stop')) {
      const blob = await recorder.stop();
      recorder = null; recordingPage = -1;
      if (blob.size > 800) { await familyVoice.save(storyId, page, blob); if (!q('#fv-who').value.trim()) familyVoice.setWho(''); }
      await renderPages();
      status(blob.size > 800 ? 'Gravado! Toque em ▶ para ouvir.' : 'A gravação saiu vazia. Tente de novo mais perto do microfone.');
    } else if (btn.classList.contains('fv-play')) {
      const clip = await familyVoice.get(storyId, page);
      if (clip?.blob) { try { playing?.pause(); } catch (error) { /* ok */ } playing = new Audio(URL.createObjectURL(clip.blob)); playing.play().catch(() => {}); }
    } else if (btn.classList.contains('fv-del')) {
      await familyVoice.remove(storyId, page);
      await renderPages();
    }
  });
  q('#fv-story').addEventListener('change', renderPages);
  q('#fv-close').addEventListener('click', close);
  q('#fv-done').addEventListener('click', close);
  renderPages();
  return modal;
}
