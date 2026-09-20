export class MemoryGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.items = [];
    this.level = 1;
    this.flippedCards = [];
    this.matchedPairs = 0;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  start(items, level = 1) {
    this.items = items;
    this.level = level;
    this.matchedPairs = 0;
    this.flippedCards = [];

    const pairCount = level === 1 ? 2 : level === 2 ? 3 : 4;
    const selected = this.shuffle([...items]).slice(0, pairCount);
    const deck = this.shuffle([...selected, ...selected]);

    this.container.innerHTML = `
      <div class="w-full max-w-xl flex flex-col items-center gap-4 my-auto">
        <div class="w-full flex justify-between items-center">
          <button id="btn-back-memory" class="bg-white/90 hover:bg-white text-slate-700 px-5 py-2.5 rounded-full font-bold shadow">
            ⬅️ Voltar
          </button>
          <h2 class="text-2xl font-bold text-indigo-700">🧠 Jogo da Memória</h2>
        </div>

        <div class="memory-grid level-${level} gap-4 w-full">
          ${deck.map((item, idx) => `
            <button data-id="${item.id}" data-idx="${idx}" class="memory-card bg-white rounded-3xl p-4 h-28 flex items-center justify-center text-5xl shadow-md border-4 border-slate-200">
              <span class="card-back">❓</span>
              <span class="card-front hidden">${item.icon}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-back-memory').addEventListener('click', () => this.onBack());

    this.container.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const item = items.find(i => i.id === id);
        this.flipCard(card, item, deck.length / 2);
      });
    });
  }

  flipCard(card, item, totalPairs) {
    if (this.flippedCards.length === 2 || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    card.querySelector('.card-back').classList.add('hidden');
    card.querySelector('.card-front').classList.remove('hidden');
    
    this.audio.play(item.audio, item.label);
    this.flippedCards.push({ card, item });

    if (this.flippedCards.length === 2) {
      const [first, second] = this.flippedCards;
      if (first.item.id === second.item.id) {
        this.matchedPairs++;
        this.flippedCards = [];

        if (this.matchedPairs === totalPairs) {
          setTimeout(() => {
            this.audio.play(null, 'Parabéns! Você encontrou todos os pares!');
            if (this.onComplete) this.onComplete();
            this.showVictoryModal();
          }, 800);
        }
      } else {
        setTimeout(() => {
          first.card.classList.remove('flipped');
          first.card.querySelector('.card-back').classList.remove('hidden');
          first.card.querySelector('.card-front').classList.add('hidden');

          second.card.classList.remove('flipped');
          second.card.querySelector('.card-back').classList.remove('hidden');
          second.card.querySelector('.card-front').classList.add('hidden');
          this.flippedCards = [];
        }, 1000);
      }
    }
  }

  showVictoryModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 max-w-sm">
        <span class="text-6xl">🏆</span>
        <h3 class="text-2xl font-bold text-indigo-600">Você Venceu!</h3>
        <p class="text-slate-600 font-medium">+1 Estrela Conquistada! ⭐</p>
        <button id="btn-restart" class="bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg text-lg w-full">
          🔄 Jogar Novamente
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#btn-restart').addEventListener('click', () => {
      modal.remove();
      this.start(this.items, this.level);
    });
  }
}