export class CanvasGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.isDrawing = false;
    this.currentColor = '#EF4444';
    this.currentTool = 'pen';
    this.currentStamp = '⭐';
    this.history = [];
    this.interactions = 0;
    this.completed = false;
    this._windowStopDraw = null;
  }

  start(level = 1) {
    if (this._windowStopDraw) {
      window.removeEventListener('pointerup', this._windowStopDraw);
      window.removeEventListener('pointercancel', this._windowStopDraw);
      this._windowStopDraw = null;
    }
    this.level = Math.max(1, Math.min(3, Number(level) || 1));
    this.interactions = 0;
    this.completed = false;
    this.isDrawing = false;
    this.history = [];
    this.currentStamp = this.level >= 3 ? '🚀' : this.level === 2 ? '🌈' : '⭐';
    this.container.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center gap-3 my-auto">
        <div class="flex justify-between items-center w-full">
          <button id="btn-back-canvas" class="bg-white/90 hover:bg-white text-slate-700 px-4 py-2 rounded-full font-bold shadow">⬅️ Voltar</button>
          <div class="bg-white/90 px-3 py-2 rounded-full text-xs font-black text-indigo-700">🎨 Nível ${this.level}</div>
          <div class="flex gap-2">
            <button id="btn-undo" class="bg-amber-400 text-white p-3 rounded-full shadow font-bold min-w-[48px]">↩️</button>
            <button id="btn-clear" class="bg-rose-500 text-white p-3 rounded-full shadow font-bold min-w-[48px]">🗑️</button>
          </div>
        </div>
        <canvas id="magic-canvas" class="bg-white rounded-3xl shadow-lg border-4 border-indigo-200 touch-none w-full h-[280px] cursor-crosshair"></canvas>
        <div class="flex flex-wrap justify-center gap-3 bg-white/90 p-3 rounded-3xl shadow w-full">
          ${['#EF4444', '#3B82F6', '#22C55E', '#FACC15', '#A855F7'].map(c => `
            <button data-color="${c}" class="tool-btn w-14 h-14 rounded-full shadow-md border-4 ${c === '#EF4444' ? 'border-slate-800 scale-110' : 'border-white'}" style="background-color: ${c}"></button>`).join('')}
          <button id="btn-eraser" class="tool-btn w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-2xl shadow-sm">🧽</button>
          ${['⭐', '🐾', '❤️'].map(s => `
            <button data-stamp="${s}" class="tool-btn w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-sm">${s}</button>`).join('')}
        </div>
        <div class="text-xs font-bold text-slate-500">Faça ${this.level === 1 ? 3 : this.level === 2 ? 4 : 5} movimentos para concluir ✨</div>
      </div>`;

    document.getElementById('btn-back-canvas').addEventListener('click', () => {
      this.cleanupListeners();
      this.onBack();
    });
    const canvas = document.getElementById('magic-canvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const saveState = () => {
      if (this.history.length > 10) this.history.shift();
      this.history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    saveState();

    const getCoords = (e) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    };
    const completeIfReady = () => {
      const target = this.level === 1 ? 3 : this.level === 2 ? 4 : 5;
      if (this.interactions >= target && !this.completed) {
        this.completed = true;
        this.audio.play(null, 'Que desenho incrível!');
        this.onComplete?.({ score: 5, rounds: 5 });
      }
    };
    const startDraw = (e) => {
      this.isDrawing = true;
      const { x, y } = getCoords(e);
      if (this.currentTool === 'stamp') {
        ctx.font = '36px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.currentStamp, x, y);
        saveState();
        this.interactions++;
        this.isDrawing = false;
        completeIfReady();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, this.currentTool === 'eraser' ? 12 : 3, 0, Math.PI * 2);
      ctx.fillStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = this.currentTool === 'eraser' ? '#FFFFFF' : this.currentColor;
      ctx.lineWidth = this.currentTool === 'eraser' ? 24 : 6;
    };
    const draw = (e) => {
      if (!this.isDrawing) return;
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const stopDraw = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      saveState();
      this.interactions++;
      completeIfReady();
    };

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    this._windowStopDraw = stopDraw;
    window.addEventListener('pointerup', this._windowStopDraw);
    window.addEventListener('pointercancel', this._windowStopDraw);

    this.container.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('border-slate-800', 'scale-110'));
        btn.classList.add('border-slate-800', 'scale-110');
        if (btn.dataset.color) {
          this.currentColor = btn.dataset.color;
          this.currentTool = 'pen';
        } else if (btn.dataset.stamp) {
          this.currentStamp = btn.dataset.stamp;
          this.currentTool = 'stamp';
        }
      });
    });
    document.getElementById('btn-eraser').addEventListener('click', (e) => {
      this.currentTool = 'eraser';
      this.container.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('border-slate-800', 'scale-110'));
      e.currentTarget.classList.add('border-slate-800', 'scale-110');
    });
    document.getElementById('btn-undo').addEventListener('click', () => {
      if (this.history.length > 1) {
        this.history.pop();
        ctx.putImageData(this.history[this.history.length - 1], 0, 0);
      }
    });
    document.getElementById('btn-clear').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveState();
    });
  }

  cleanupListeners() {
    if (!this._windowStopDraw) return;
    window.removeEventListener('pointerup', this._windowStopDraw);
    window.removeEventListener('pointercancel', this._windowStopDraw);
    this._windowStopDraw = null;
  }
}