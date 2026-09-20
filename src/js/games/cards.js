export class CardsGame {
  constructor(containerId, audioEngine, storageManager, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.storage = storageManager;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.sentenceShelf = [];
    this.targetColor = null;
    this.colorScore = 0;
  }

  renderGrid(items, title) {
    let cardsHtml = '';
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const bgColor = item.hex ? item.hex : '#FFFFFF';
      const textColor = item.textDark ? '#1F2937' : '#FFFFFF';
      const iconDisplay = item.icon ? item.icon : '🎨';
      const borderClass = item.border ? 'border-4 border-slate-300' : 'border-2 border-indigo-100';
      const textShadowClass = item.textDark ? '' : 'drop-shadow-md';

      cardsHtml += '<button data-id="' + item.id + '" class="card-item game-card p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md ' + borderClass + '" style="background-color: ' + bgColor + '; color: ' + textColor + ';">';
      cardsHtml += '<span class="text-5xl">' + iconDisplay + '</span>';
      cardsHtml += '<span class="text-lg font-bold ' + textShadowClass + '">' + item.label + '</span>';
      cardsHtml += '</button>';
    }

    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col items-center gap-4 my-auto">
        <div class="w-full flex justify-between items-center">
          <button id="btn-back-cards" class="bg-white/90 hover:bg-white text-slate-700 px-5 py-2.5 rounded-full font-bold shadow flex items-center gap-2">
            ⬅️ Voltar
          </button>
          <h2 class="text-2xl font-bold text-indigo-700">${title}</h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          ${cardsHtml}
        </div>
      </div>
    `;

    document.getElementById('btn-back-cards').addEventListener('click', () => this.onBack());

    this.container.querySelectorAll('.card-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          const textToSpeak = item.sound ? `${item.label}! ${item.sound}` : item.label;
          this.audio.play(item.audio, textToSpeak);
        }
      });
    });
  }

  renderColorGame(colors) {
    this.colorScore = 0;
    const selectedColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);

    const askColor = () => {
      if (this.colorScore >= 3) {
        this.audio.play(null, 'Parabéns! Você acertou todas as cores!');
        if (this.onComplete) this.onComplete();
        this.showVictoryModal(colors);
        return;
      }

      this.targetColor = selectedColors[Math.floor(Math.random() * selectedColors.length)];
      
      this.container.innerHTML = `
        <div class="w-full max-w-2xl flex flex-col items-center gap-4 my-auto">
          <div class="w-full flex justify-between items-center">
            <button id="btn-back-colors" class="bg-white/90 text-slate-700 px-5 py-2.5 rounded-full font-bold shadow">⬅️ Voltar</button>
            <div class="bg-indigo-100 text-indigo-800 font-bold px-4 py-2 rounded-full border border-indigo-300">
              Onde está o: <span class="text-xl font-black text-indigo-600">${this.targetColor.label}</span>?
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 w-full">
            ${selectedColors.map(c => {
              const bgBtn = c.hex ? c.hex : '#FFFFFF';
              const textBtn = c.textDark ? 'text-slate-800' : 'text-white';
              return `
                <button data-id="${c.id}" class="color-game-btn p-8 rounded-3xl shadow-lg border-4 border-white h-32 flex items-center justify-center text-2xl font-bold ${textBtn}" style="background-color: ${bgBtn}">
                  ${c.label}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      document.getElementById('btn-back-colors').addEventListener('click', () => this.onBack());
      this.audio.play(null, `Onde está o ${this.targetColor.label}?`);

      this.container.querySelectorAll('.color-game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.id === this.targetColor.id) {
            this.colorScore++;
            this.audio.play(null, 'Muito bem! Você acertou!');
            setTimeout(askColor, 1000);
          } else {
            btn.classList.add('animate-shake');
            this.audio.play(null, 'Tente novamente! Procure a cor certa.');
            setTimeout(() => btn.classList.remove('animate-shake'), 500);
          }
        });
      });
    };

    askColor();
  }

  showVictoryModal(colors) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 max-w-sm">
        <span class="text-6xl">🎨</span>
        <h3 class="text-2xl font-bold text-indigo-600">Parabéns!</h3>
        <p class="text-slate-600 font-medium">+1 Estrela Conquistada! ⭐</p>
        <div class="flex gap-2 w-full">
          <button id="btn-back-menu-vic" class="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl">Menu</button>
          <button id="btn-restart-color" class="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-2xl shadow-lg">Jogar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-back-menu-vic').addEventListener('click', () => {
      modal.remove();
      this.onBack();
    });

    modal.querySelector('#btn-restart-color').addEventListener('click', () => {
      modal.remove();
      this.renderColorGame(colors);
    });
  }

  renderPhraseBuilder(wordsData) {
    this.sentenceShelf = [];
    const childName = this.storage.getChildName();
    const displayName = childName ? `Eu (${childName})` : 'Eu';

    const renderShelf = () => {
      const shelfEl = document.getElementById('sentence-shelf');
      if (!shelfEl) return;

      let shelfContent = '';
      if (this.sentenceShelf.length === 0) {
        shelfContent = `<span class="text-slate-400 italic">Toque nas cartas abaixo para montar a frase...</span>`;
      } else {
        shelfContent = this.sentenceShelf.map((word, idx) => `
          <button data-idx="${idx}" class="remove-word-btn bg-indigo-500 text-white px-3 py-2 rounded-xl text-lg font-bold flex items-center gap-1 shadow">
            <span>${word.icon}</span>
            <span>${word.label}</span>
            <span class="text-xs bg-indigo-700 px-1.5 py-0.5 rounded-full ml-1">✕</span>
          </button>
        `).join('');
      }

      shelfEl.innerHTML = shelfContent;

      shelfEl.querySelectorAll('.remove-word-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.sentenceShelf.splice(idx, 1);
          renderShelf();
        });
      });
    };

    const words = wordsData.map(w => {
      if (w.id === 'eu') {
        return { ...w, label: displayName };
      }
      return w;
    });

    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col items-center gap-4 my-auto">
        <div class="w-full flex justify-between items-center">
          <button id="btn-back-phrases" class="bg-white/90 hover:bg-white text-slate-700 px-5 py-2.5 rounded-full font-bold shadow">
            ⬅️ Voltar
          </button>
          <h2 class="text-2xl font-bold text-indigo-700">🗣️ Montar Frases</h2>
        </div>
        
        <div class="w-full bg-white/90 p-4 rounded-2xl shadow-inner border-2 border-indigo-200 min-h-[80px] flex items-center justify-between gap-2">
          <div id="sentence-shelf" class="flex flex-wrap gap-2 flex-1"></div>
          <button id="btn-speak-sentence" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span>🔊</span> Falar!
          </button>
        </div>

        <div class="grid grid-cols-3 md:grid-cols-4 gap-3 w-full max-h-[280px] overflow-y-auto p-2">
          ${words.map(w => `
            <button data-id="${w.id}" class="word-card game-card bg-white p-3 rounded-xl shadow border border-slate-200 flex flex-col items-center gap-1">
              <span class="text-3xl">${w.icon}</span>
              <span class="text-xs font-bold text-slate-700 text-center">${w.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-back-phrases').addEventListener('click', () => this.onBack());
    renderShelf();

    this.container.querySelectorAll('.word-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const word = words.find(w => w.id === id);
        if (word) {
          if (this.sentenceShelf.length < 5) {
            this.sentenceShelf.push(word);
            const speakText = word.id === 'eu' ? 'Eu' : word.label;
            this.audio.play(word.audio, speakText);
            renderShelf();
          } else {
            this.audio.play(null, 'A frase já está cheia!');
          }
        }
      });
    });

    let phraseSpoken = false;

    document.getElementById('btn-speak-sentence').addEventListener('click', () => {
      if (this.sentenceShelf.length === 0) {
        this.audio.play(null, 'Escolha algumas palavras primeiro!');
        return;
      }
      
      const fullText = this.sentenceShelf.map(w => {
        return w.id === 'eu' ? 'Eu' : w.label;
      }).join(' ');
      
      this.audio.play(null, fullText);

      if (!phraseSpoken) {
        phraseSpoken = true;
        if (this.onComplete) this.onComplete();
      }
    });
  }
}