export class BalloonPopGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.targetNumber = 1;
    this.score = 0;
  }

  start() {
    this.score = 0;
    this.targetNumber = Math.floor(Math.random() * 5) + 1;

    this.container.innerHTML = `
      <div class="w-full max-w-xl h-full flex flex-col justify-between my-auto relative overflow-hidden">
        <div class="flex justify-between items-center z-10 p-2">
          <button id="btn-back-balloon" class="bg-white/90 text-slate-700 px-4 py-2 rounded-full font-bold shadow">⬅️ Voltar</button>
          <div class="bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-full border border-indigo-300">
            Estoure o número: <span id="target-num" class="text-2xl font-black text-indigo-600">${this.targetNumber}</span>
          </div>
        </div>

        <div id="sky-area" class="flex-1 relative w-full h-[300px]"></div>
      </div>
    `;

    document.getElementById('btn-back-balloon').addEventListener('click', () => this.onBack());
    this.spawnBalloons();
  }

  spawnBalloons() {
    if (this.score >= 5) {
      this.audio.play(null, 'Parabéns! Você estourou todos os números!');
      if (this.onComplete) this.onComplete();
      this.showVictoryModal();
      return;
    }

    const sky = document.getElementById('sky-area');
    if (!sky) return;

    sky.innerHTML = '';

    // Garante 3 números distintos na tela, incluindo o correto
    const nums = new Set([this.targetNumber]);
    while (nums.size < 3) {
      nums.add(Math.floor(Math.random() * 5) + 1);
    }

    // Posições fixas para os 3 balões não sobreporem
    const slots = [10, 40, 70].sort(() => Math.random() - 0.5);
    const colors = ['bg-rose-400', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];

    this.audio.play(null, `Estoure o número ${this.targetNumber}`);

    [...nums].forEach((n, i) => {
      const balloon = document.createElement('button');
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      balloon.className = `absolute w-20 h-24 ${randomColor} rounded-full shadow-lg flex items-center justify-center text-3xl font-black text-white transition-all cursor-pointer animate-bounce`;
      balloon.style.left = `${slots[i]}%`;
      balloon.style.top = `${Math.random() * 30 + 20}%`;
      balloon.textContent = n;

      balloon.addEventListener('pointerdown', () => {
        if (n === this.targetNumber) {
          this.score++;
          this.audio.play(null, `Acertou! Número ${n}`);
          balloon.remove();
          this.targetNumber = Math.floor(Math.random() * 5) + 1;
          const targetEl = document.getElementById('target-num');
          if (targetEl) targetEl.textContent = this.targetNumber;
          setTimeout(() => this.spawnBalloons(), 600);
        } else {
          balloon.classList.add('animate-shake');
          this.audio.play(null, `Procure o número ${this.targetNumber}`);
          setTimeout(() => balloon.classList.remove('animate-shake'), 500);
        }
      });

      sky.appendChild(balloon);
    });
  }

  showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 max-w-sm">
        <span class="text-6xl">🎈</span>
        <h3 class="text-2xl font-bold text-indigo-600">Parabéns!</h3>
        <p class="text-slate-600 font-medium">+1 Estrela Conquistada! ⭐</p>
        <div class="flex gap-2 w-full">
          <button id="btn-back-menu-bal" class="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl">Menu</button>
          <button id="btn-restart-balloon" class="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-2xl shadow-lg">Jogar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-back-menu-bal').addEventListener('click', () => {
      modal.remove();
      this.onBack();
    });

    modal.querySelector('#btn-restart-balloon').addEventListener('click', () => {
      modal.remove();
      this.start();
    });
  }
}