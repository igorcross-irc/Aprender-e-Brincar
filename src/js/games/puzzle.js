export class PuzzleGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
  }

  start(itemsData) {
    const puzzleItems = [...itemsData].sort(() => Math.random() - 0.5).slice(0, 3);
    let matches = 0;

    this.container.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center gap-6 my-auto">
        <div class="w-full flex justify-between items-center">
          <button id="btn-back-game" class="bg-white/90 hover:bg-white text-slate-700 px-5 py-2.5 rounded-full font-bold shadow flex items-center gap-2">
            ⬅️ Voltar
          </button>
          <h2 class="text-2xl font-bold text-indigo-700">🧩 Encaixe as Formas</h2>
        </div>

        <div class="flex justify-center gap-4 w-full">
          ${puzzleItems.map(item => `
            <div data-target="${item.id}" class="puzzle-target w-24 h-24 bg-slate-200/80 rounded-2xl border-4 border-dashed border-slate-400 flex items-center justify-center text-5xl opacity-40 grayscale">
              ${item.icon}
            </div>
          `).join('')}
        </div>

        <div id="pieces-container" class="flex justify-center gap-4 w-full min-h-[100px]">
          ${[...puzzleItems].sort(() => Math.random() - 0.5).map(item => `
            <div class="puzzle-wrapper w-24 h-24">
              <div data-piece="${item.id}" class="puzzle-piece w-24 h-24 bg-white rounded-2xl shadow-lg border-2 border-indigo-200 flex items-center justify-center text-5xl cursor-grab touch-none">
                ${item.icon}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-back-game').addEventListener('click', () => this.onBack());

    this.container.querySelectorAll('.puzzle-piece').forEach(piece => {
      let active = false;

      const onPointerDown = (e) => {
        active = true;
        piece.style.transition = 'none'; // Elimina o delay visual no toque!
        piece.style.position = 'fixed';
        piece.style.zIndex = '1000';
        piece.setPointerCapture(e.pointerId);
        moveAt(e.clientX, e.clientY);
      };

      const moveAt = (pageX, pageY) => {
        if (!active) return;
        piece.style.left = `${pageX - 48}px`;
        piece.style.top = `${pageY - 48}px`;
      };

      const onPointerMove = (e) => {
        if (active) moveAt(e.clientX, e.clientY);
      };

      const onPointerUp = (e) => {
        if (!active) return;
        active = false;
        piece.style.zIndex = '1';

        piece.style.display = 'none';
        const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        piece.style.display = 'flex';

        const targetEl = elemBelow ? elemBelow.closest('.puzzle-target') : null;

        if (targetEl && targetEl.dataset.target === piece.dataset.piece) {
          targetEl.classList.remove('opacity-40', 'grayscale', 'border-dashed');
          targetEl.classList.add('border-solid', 'border-emerald-500', 'bg-emerald-100');
          piece.remove();

          const item = puzzleItems.find(i => i.id === targetEl.dataset.target);
          this.audio.play(item?.audio, `Muito bem! ${item?.label}`);
          matches++;

          if (matches === puzzleItems.length) {
            setTimeout(() => {
              this.audio.play(null, 'Parabéns! Você completou tudo!');
              if (this.onComplete) this.onComplete();
            }, 600);
          }
        } else {
          // Retorna à posição original de forma limpa
          piece.style.position = 'static';
          piece.style.transition = 'all 0.2s ease';
        }
      };

      piece.addEventListener('pointerdown', onPointerDown);
      piece.addEventListener('pointermove', onPointerMove);
      piece.addEventListener('pointerup', onPointerUp);
      piece.addEventListener('pointercancel', onPointerUp);
    });
  }
}