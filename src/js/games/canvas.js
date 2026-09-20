export class CanvasGame {
  constructor(containerId, audioEngine, onComplete) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.isDrawing = false;
    this.currentColor = '#EF4444';
    this.currentTool = 'pen';
    this.currentStamp = '⭐';
  }

  start() {
    this.container.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center gap-3">
        <div class="flex justify-between items-center w-full px-2">
          <h2 class="text-xl font-bold text-indigo-700">🎨 Lousa Mágica</h2>
          <button id="btn-clear-canvas" class="bg-rose-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow">
            🗑️ Limpar
          </button>
        </div>

        <canvas id="magic-canvas" class="bg-white rounded-2xl shadow-lg border-4 border-indigo-200 touch-none w-full h-[300px] cursor-crosshair"></canvas>

        <div class="flex flex-wrap justify-center gap-2 bg-white/80 p-2 rounded-2xl shadow w-full">
          ${['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7', '#EC4899', '#1F2937'].map(color => `
            <button data-color="${color}" class="color-btn w-8 h-8 rounded-full shadow border-2 border-white" style="background-color: ${color};"></button>
          `).join('')}
          <div class="h-8 w-px bg-slate-300 my-auto"></div>
          ${['⭐', '🐾', '❤️', '🎈'].map(stamp => `
            <button data-stamp="${stamp}" class="stamp-btn w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg shadow-sm">${stamp}</button>
          `).join('')}
        </div>
      </div>
    `;

    const canvas = document.getElementById('magic-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      this.isDrawing = true;
      const { x, y } = getCoords(e);

      if (this.currentTool === 'stamp') {
        ctx.font = '30px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentStamp, x, y);
        this.audio.play(null, 'Carimbo!');
        this.isDrawing = false;
        if (this.onComplete) this.onComplete();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = this.currentColor;
    };

    const draw = (e) => {
      if (!this.isDrawing || this.currentTool !== 'pen') return;
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDraw = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        if (this.onComplete) this.onComplete();
      }
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDraw);

    this.container.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentColor = btn.dataset.color;
        this.currentTool = 'pen';
      });
    });

    this.container.querySelectorAll('.stamp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentStamp = btn.dataset.stamp;
        this.currentTool = 'stamp';
      });
    });

    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.audio.play(null, 'Lousa limpa!');
    });
  }
}