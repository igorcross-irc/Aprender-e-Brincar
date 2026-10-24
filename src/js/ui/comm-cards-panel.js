import { COMMUNICATION_CARDS } from '../games/toddler/communication-board.js';
import { commCards, resizePhoto } from '../../core/comm-cards.js';
import { startRecording } from '../../core/family-voice.js';

const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

// Janela da Área da Família: trocar a figura e a voz dos cartões da prancha "Eu quero…" ou criar cartões novos.
export function openCommCardsPanel() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card family-panel family-voice" role="dialog" aria-modal="true" aria-labelledby="cc-title">
      <div class="family-head"><h3 id="cc-title">💬 Cartões de comunicação</h3><button id="cc-close" class="touch-target" aria-label="Fechar">✕</button></div>
      <p class="family-hint">Coloque a foto de verdade (a mamadeira, o cachorro, a vovó) e grave a sua voz. A criança toca no cartão e ouve você. Tudo fica só neste aparelho.</p>
      <ol id="cc-list" class="fv-pages"></ol>
      <h4>Novo cartão</h4>
      <label for="cc-new-label">Nome do cartão</label>
      <input type="text" id="cc-new-label" maxlength="20" placeholder="Ex.: Vovó" autocomplete="off" />
      <label for="cc-new-phrase">O que o cartão fala</label>
      <input type="text" id="cc-new-phrase" maxlength="60" placeholder="Ex.: Eu quero ver a vovó" autocomplete="off" />
      <button id="cc-add" class="family-button">➕ Criar cartão</button>
      <p id="cc-status" class="family-hint" aria-live="polite"></p>
      <button id="cc-done" class="family-save">Pronto</button>
    </div>`;
  document.body.appendChild(modal);
  const q = (sel) => modal.querySelector(sel);
  const status = (t) => { q('#cc-status').textContent = t; };
  let recorder = null; let recordingId = null; let playing = null; let urls = [];
  const url = (blob) => { const u = URL.createObjectURL(blob); urls.push(u); return u; };
  const canRecord = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const close = () => { try { recorder?.cancel(); } catch (e) { /* ok */ } try { playing?.pause(); } catch (e) { /* ok */ } urls.forEach((u) => URL.revokeObjectURL(u)); modal.remove(); };

  async function render() {
    urls.forEach((u) => URL.revokeObjectURL(u)); urls = [];
    const mine = await commCards.list();
    const byId = new Map(mine.map((c) => [c.id, c]));
    const rows = [...COMMUNICATION_CARDS.map((c) => ({ ...c, custom: false })), ...mine.filter((c) => c.id.startsWith('c-')).map((c) => ({ id: c.id, icon: '⭐', label: c.label, phrase: c.phrase, custom: true }))];
    q('#cc-list').innerHTML = rows.map((c) => {
      const m = byId.get(c.id) || {};
      const thumb = m.photo ? `<img class="cc-thumb" src="${url(m.photo)}" alt="" />` : `<span class="cc-icon" aria-hidden="true">${c.icon}</span>`;
      const rec = recordingId === c.id
        ? `<button class="cc-stop" data-id="${c.id}" aria-label="Parar a gravação">⏹ Parar</button>`
        : `<button class="cc-rec" data-id="${c.id}" ${canRecord && !recordingId ? '' : 'disabled'} aria-label="Gravar a voz de ${esc(c.label)}">🎙️</button>`;
      return `<li class="fv-row ${m.photo || m.voice ? 'has' : ''}" data-id="${c.id}">
        ${thumb}<span class="fv-text"><b>${esc(m.label || c.label)}</b><br><small>${esc(m.phrase || c.phrase)}</small></span>
        <span class="fv-actions">
          <label class="cc-photo" aria-label="Escolher a foto de ${esc(c.label)}">📷<input type="file" accept="image/*" data-id="${c.id}" class="cc-file" hidden /></label>
          ${rec}
          ${m.voice ? `<button class="cc-play" data-id="${c.id}" aria-label="Ouvir">▶</button>` : ''}
          ${(m.photo || m.voice || c.custom) ? `<button class="cc-del" data-id="${c.id}" aria-label="${c.custom ? 'Apagar o cartão' : 'Voltar ao cartão padrão'}">${c.custom ? '🗑' : '↩'}</button>` : ''}
        </span></li>`;
    }).join('');
    modal.querySelectorAll('.cc-file').forEach((input) => input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try { const photo = await resizePhoto(file); await commCards.save({ id: input.dataset.id, photo, ...(String(input.dataset.id).startsWith('c-') ? {} : { label: undefined }) }); status('Foto guardada!'); } catch (error) { status('Não consegui usar essa foto. Tente outra.'); }
      await render();
    }));
  }

  q('#cc-list').addEventListener('click', async (event) => {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('cc-rec')) {
      try { recorder = await startRecording(); recordingId = id; status('Gravando… diga a frase e toque em Parar.'); await render(); status('Gravando… diga a frase e toque em Parar.'); } catch (error) { recorder = null; recordingId = null; status('Não consegui usar o microfone. Permita o microfone para este app e tente de novo.'); }
    } else if (btn.classList.contains('cc-stop')) {
      const blob = await recorder.stop(); recorder = null; recordingId = null;
      if (blob.size > 800) { await commCards.save({ id, voice: blob }); status('Voz guardada! Toque em ▶ para ouvir.'); } else status('A gravação saiu vazia. Tente de novo mais perto do microfone.');
      await render();
    } else if (btn.classList.contains('cc-play')) {
      const c = await commCards.get(id).catch(() => null);
      if (c?.voice) { try { playing?.pause(); } catch (e) { /* ok */ } const u = url(c.voice); playing = new Audio(u); playing.play().catch(() => {}); }
    } else if (btn.classList.contains('cc-del')) {
      await commCards.remove(id); status('Pronto.'); await render();
    }
  });
  q('#cc-add').addEventListener('click', async () => {
    const label = q('#cc-new-label').value.trim();
    const phrase = q('#cc-new-phrase').value.trim() || label;
    if (!label) { status('Dê um nome ao cartão.'); return; }
    await commCards.save({ id: commCards.newId(), label, phrase });
    q('#cc-new-label').value = ''; q('#cc-new-phrase').value = '';
    status('Cartão criado! Agora coloque a foto e a voz.');
    await render();
  });
  q('#cc-close').addEventListener('click', close);
  q('#cc-done').addEventListener('click', close);
  render();
  return modal;
}
