export class CardsGame {
  constructor(containerId, audioEngine, storageManager, onComplete) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.storage = storageManager;
    this.onComplete = onComplete;
    this.sentenceShelf = [];
  }

  // Renderiza jogos de clicar e ouvir (Cores, Animais, Formas, Frutas)
  renderGrid(items, title, category) {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col items-center gap-4">
        <h2 class="text-2xl font-bold text-indigo-700">${title}</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          ${items.map(item => `
            <button 
              data-id="${item.id}" 
              class="card-item game-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md bg-white border-2 border-indigo-100"
              style="${item.hex ? `background-color: ${item.hex}; color: #fff;` : ''}"
            >
              <span class="text-5xl">${item.icon || '🎨'}</span>
              <span class="text-lg font-bold ${item.hex ? 'drop-shadow-md' : 'text-slate-700'}">${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.card-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          const textToSpeak = item.sound ? `${item.label}! ${item.sound}` : item.label;
          this.audio.play(item.audio, textToSpeak);
          if (this.onComplete) this.onComplete();
        }
      });
    });
  }

  // Renderiza o Construtor de Frases (CAA)
  renderPhraseBuilder(wordsData) {
    this.sentenceShelf = [];
    const childName = this.storage.getChildName();

    const renderShelf = () => {
      const shelfEl = document.getElementById('sentence-shelf');
      if (!shelfEl) return;

      shelfEl.innerHTML = this.sentenceShelf.length === 0 
        ? `<span class="text-slate-400 italic">Toque nas cartas abaixo para montar a frase...</span>`
        : this.sentenceShelf.map((word, idx) => `
            <button data-idx="${idx}" class="remove-word-btn bg-indigo-500 text-white px-3 py-2 rounded-xl text-lg font-bold flex items-center gap-1 shadow">
              <span>${word.icon}</span>
              <span>${word.label}</span>
              <span class="text-xs bg-indigo-700 px-1.5 py-0.5 rounded-full ml-1">✕</span>
            </button>
          `).join('');

      shelfEl.querySelectorAll('.remove-word-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.sentenceShelf.splice(idx, 1);
          renderShelf();
        });
      });
    };

    // Atualiza a primeira carta ("Eu") com o nome personalizado
    const words = wordsData.map(w => w.id === 'eu' ? { ...w, label: childName } : w);

    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col items-center gap-4">
        <h2 class="text-2xl font-bold text-indigo-700">🗣️ Montar Frases</h2>
        
        <!-- Prateleira de Montagem -->
        <div class="w-full bg-white/90 p-4 rounded-2xl shadow-inner border-2 border-indigo-200 min-h-[80px] flex items-center justify-between gap-2">
          <div id="sentence-shelf" class="flex flex-wrap gap-2 flex-1"></div>
          <button id="btn-speak-sentence" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span>🔊</span>
            <span>Falar!</span>
          </button>
        </div>

        <!-- Banco de Cartas -->
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3 w-full max-h-[300px] overflow-y-auto p-2">
          ${words.map(w => `
            <button data-id="${w.id}" class="word-card game-card bg-white p-3 rounded-xl shadow border border-slate-200 flex flex-col items-center gap-1">
              <span class="text-3xl">${w.icon}</span>
              <span class="text-xs font-bold text-slate-700 text-center">${w.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    renderShelf();

    this.container.querySelectorAll('.word-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const word = words.find(w => w.id === id);
        if (word && this.sentenceShelf.length < 5) {
          this.sentenceShelf.push(word);
          this.audio.play(word.audio, word.label);
          renderShelf();
        }
      });
    });

    document.getElementById('btn-speak-sentence').addEventListener('click', () => {
      if (this.sentenceShelf.length === 0) {
        this.audio.play(null, 'Escolha algumas palavras primeiro!');
        return;
      }
      const fullText = this.sentenceShelf.map(w => w.label).join(' ');
      this.audio.play(null, fullText);
      if (this.onComplete) this.onComplete();
    });
  }
}