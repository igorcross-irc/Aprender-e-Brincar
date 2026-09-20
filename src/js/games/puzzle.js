export class PuzzleGame {
  constructor(containerId, audioEngine, onComplete) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
  }

  start(animalsData) {
    const puzzleItems = [...animalsData].sort(() => Math.random() - 0.5).slice(0, 3);

    this.container.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center gap-6">
        <h2 class="text-2xl font-bold text-indigo-700">🧩 Encaixe as Formas</h2>

        <div id="targets-area" class="flex justify-center gap-6 w-full">
          ${puzzleItems.map(item => `
            <div data-target="${item.id}" class="puzzle-target w-20 h-20 bg-slate-200/80 rounded-2xl border-4 border-dashed border-slate-400 flex items-center justify-center text-4xl grayscale opacity-50 shadow-inner">
              ${item.icon}
            </div>
          `).join('')}
        </div>

        <div id="pieces-area" class="flex justify-center gap-6 w-full min-h-[90px]">
          ${[...puzzleItems].sort(() => Math.random() - 0.5).map(item => `
            <div data-piece="${item.id}" class="puzzle-piece game-card w-20 h-20 bg-white rounded-2xl shadow-lg border-2 border-indigo-200 flex items-center justify-center text-4xl cursor-grab touch-none select-none">
              ${item.icon}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    let matches = 0;

    this.container.querySelectorAll('.puzzle-piece').forEach(piece => {
      const onTouchMove = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        piece.style.position = 'fixed';
        piece.style.zIndex = '1000';
        piece.style.left = `${touch.clientX - 40}px`;
        piece.style.top = `${touch.clientY - 40}px`;
      };

      const onTouchEnd = (e) => {
        const touch = e.changedTouches ? e.changedTouches[0] : e;
        piece.style.zIndex = '1';
        
        piece.style.display = 'none';
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        piece.style.display = 'flex';

        const targetEl = elemBelow ? elemBelow.closest('.puzzle-target') : null;

        if (targetEl && targetEl.dataset.target === piece.dataset.piece) {
          targetEl.classList.remove('grayscale', 'opacity-50', 'border-dashed');
          targetEl.classList.add('border-solid', 'border-emerald-500', 'bg-emerald-100');
          piece.remove();

          const item = puzzleItems.find(i => i.id === targetEl.dataset.target);
          this.audio.play(item ? item.audio : null, `Muito bem! ${item ? item.label : ''}`);
          
          matches++;
          if (matches === puzzleItems.length) {
            setTimeout(() => {
              this.audio.play(null, 'Parabéns!');
              if (this.onComplete) this.onComplete();
            }, 800);
          }
        } else {
          piece.style.position = 'static';
          piece.style.left = 'auto';
          piece.style.top = 'auto';
        }

        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('mousemove', onTouchMove);
        window.removeEventListener('mouseup', onTouchEnd);
      };

      piece.addEventListener('touchstart', () => {
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);
      });

      piece.addEventListener('mousedown', () => {
        window.addEventListener('mousemove', onTouchMove);
        window.addEventListener('mouseup', onTouchEnd);
      });
    });
  }
}