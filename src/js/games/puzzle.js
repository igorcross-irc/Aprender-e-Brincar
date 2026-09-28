export class PuzzleGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.level = 1;
  }

  start(itemsData, level = this.level) {
    this.level = Math.max(1, Math.min(4, level));
    const count = Math.min(itemsData.length, this.level + 2);
    const puzzleItems = [...itemsData].sort(() => Math.random() - 0.5).slice(0, count);
    let matches = 0;
    let attempts = 0;

    this.container.innerHTML = `
      <div class="w-full max-w-3xl flex flex-col items-center gap-5 my-auto">
        <div class="w-full flex justify-between items-center gap-2">
          <button id="btn-back-game" class="bg-white/95 text-slate-700 px-5 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <div class="text-right"><h2 class="text-2xl font-black text-indigo-700">🧩 Quebra-Cabeça</h2><p class="text-xs text-slate-500">Nível ${this.level} • ${count} peças</p></div>
        </div>
        <div class="bg-white/80 rounded-full px-4 py-2 text-sm font-black text-indigo-700 shadow">Peças: <span id="puzzle-count">0</span>/${count} • Tentativas: <span id="puzzle-attempts">0</span></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-items-center">
          ${puzzleItems.map(item => `
            <button data-target="${item.id}" class="puzzle-target w-28 h-28 md:w-32 md:h-32 bg-slate-100 rounded-3xl border-4 border-dashed border-slate-300 flex items-center justify-center text-6xl opacity-50 grayscale shadow-inner touch-target">${item.icon}</button>
          `).join('')}
        </div>
        <div id="pieces-container" class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-items-center min-h-[130px]">
          ${[...puzzleItems].sort(() => Math.random() - 0.5).map(item => `
            <button data-piece="${item.id}" class="puzzle-piece w-28 h-28 md:w-32 md:h-32 bg-white rounded-3xl shadow-lg border-4 border-indigo-100 flex items-center justify-center text-6xl touch-target touch-none">${item.icon}</button>
          `).join('')}
        </div>
      </div>`;

    document.getElementById('btn-back-game').addEventListener('click', () => this.onBack());

    this.container.querySelectorAll('.puzzle-piece').forEach((piece) => {
      let active = false;
      const originalParent = piece.parentElement;
      const onPointerDown = (e) => {
        active = true;
        piece.style.transition = 'none';
        piece.style.position = 'fixed';
        piece.style.zIndex = '1000';
        piece.setPointerCapture(e.pointerId);
        moveAt(e.clientX, e.clientY);
      };
      const moveAt = (x, y) => { if (active) { piece.style.left = `${x - 56}px`; piece.style.top = `${y - 56}px`; } };
      piece.addEventListener('pointermove', (e) => moveAt(e.clientX, e.clientY));
      const onPointerUp = (e) => {
        if (!active) return;
        active = false;
        attempts++;
        const attemptsEl = document.getElementById('puzzle-attempts');
        if (attemptsEl) attemptsEl.textContent = attempts;
        piece.style.display = 'none';
        const below = document.elementFromPoint(e.clientX, e.clientY);
        piece.style.display = 'flex';
        const target = below?.closest('.puzzle-target');
        if (target?.dataset.target === piece.dataset.piece) {
          target.classList.remove('opacity-50', 'grayscale', 'border-dashed');
          target.classList.add('border-solid', 'border-emerald-400', 'bg-emerald-50');
          piece.remove();
          matches++;
          document.getElementById('puzzle-count').textContent = matches;
          const item = puzzleItems.find((i) => i.id === target.dataset.target);
          this.audio.play(item?.audio, `Muito bem! ${item?.label || ''}`);
          if (matches === puzzleItems.length) {
            setTimeout(() => this.finish(puzzleItems.length, attempts), 600);
          }
        } else {
          piece.style.position = 'static';
          piece.style.zIndex = '';
          piece.style.left = '';
          piece.style.top = '';
          piece.style.transition = 'transform 0.2s ease';
          originalParent?.appendChild(piece);
          this.audio.play(null, 'Quase! Tente encaixar no lugar certo.');
        }
      };
      piece.addEventListener('pointerup', onPointerUp);
      piece.addEventListener('pointercancel', onPointerUp);
    });
  }

  finish(count, attempts) {
    this.audio.play(null, 'Parabéns! Você completou o quebra-cabeça!');
    this.onComplete?.();
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `<div class="bg-white rounded-3xl p-7 text-center shadow-2xl max-w-sm w-full"><div class="text-7xl">🧩</div><h3 class="text-3xl font-black text-indigo-600 mt-3">Quebra-cabeça completo!</h3><p class="text-slate-600 mt-2">${count} peças • ${attempts} tentativas</p><div class="flex gap-3 mt-6"><button id="puzzle-menu" class="flex-1 bg-slate-100 font-black py-3 rounded-2xl touch-target">Menu</button><button id="puzzle-next" class="flex-1 bg-emerald-500 text-white font-black py-3 rounded-2xl touch-target">Próximo nível</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#puzzle-menu').addEventListener('click', () => { modal.remove(); this.onBack(); });
    modal.querySelector('#puzzle-next').addEventListener('click', () => { modal.remove(); this.start(this.itemsData || [], Math.min(4, this.level + 1)); });
  }
}