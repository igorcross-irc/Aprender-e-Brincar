// Moldura comum das brincadeiras: botão de voltar, título e progresso em bolinhas.
export function gameShellMarkup({ backId, title, round = null, rounds = null, body = '', done = null }) {
  const dots = rounds ? `<div class="game-dots" aria-label="Rodada ${Math.min(round + 1, rounds)} de ${rounds}">${Array.from({ length: rounds }, (_, index) => `<span class="${index < round ? 'done' : index === round ? 'current' : ''}"></span>`).join('')}</div>` : '';
  return `
    <div class="game-screen page-enter">
      <div class="game-bar">
        <button id="${backId}" class="game-back" aria-label="Voltar">⬅️</button>
        <h2 class="game-title">${title}</h2>
        ${dots}
      </div>
      ${body}
      ${done ? `<button id="${done.id}" class="game-done" ${done.enabled ? '' : 'disabled'}>✅ ${done.label || 'Pronto!'}</button>` : ''}
    </div>`;
}

export function enableDoneButton(button) {
  if (!button || !button.disabled) return;
  button.disabled = false;
  button.classList.add('ready');
}

export function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
