import { AudioEngine } from './audio-engine.js';
import { StorageManager } from './storage.js';
import { MemoryGame } from './games/memory.js';
import vocabularyData from '../data/vocabulary.json';

class App {
  constructor() {
    this.audio = new AudioEngine();
    this.storage = new StorageManager();
    this.container = document.getElementById('game-container');
    this.starCountEl = document.getElementById('star-count');
    
    this.init();
  }

  init() {
    this.updateScoreUI();
    this.renderAgeSelection();
  }

  updateScoreUI() {
    if (this.starCountEl) {
      this.starCountEl.textContent = this.storage.getStars();
    }
  }

  renderAgeSelection() {
    this.container.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 w-full max-w-xl p-4">
        <button id="btn-2-3" class="game-card flex-1 bg-pink-400 hover:bg-pink-500 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4">
          <span class="text-6xl">🍦🚚</span>
          <span class="text-2xl font-bold">2 a 3 anos</span>
          <span class="text-sm bg-pink-600/40 px-3 py-1 rounded-full">Primeiras Descobertas</span>
        </button>

        <button id="btn-4-5" class="game-card flex-1 bg-sky-400 hover:bg-sky-500 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4">
          <span class="text-6xl">🚌🏫</span>
          <span class="text-2xl font-bold">4 a 5 anos</span>
          <span class="text-sm bg-sky-600/40 px-3 py-1 rounded-full">Aprendizado & Frases</span>
        </button>
      </div>
    `;

    document.getElementById('btn-2-3').addEventListener('click', () => {
      this.audio.play(null, 'Descobertas! Vamos brincar!');
      this.renderMenu2to3();
    });

    document.getElementById('btn-4-5').addEventListener('click', () => {
      this.audio.play(null, 'Aprendizado! Escolha um jogo!');
      this.renderMenu4to5();
    });
  }

  renderMenu2to3() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl">
        <button id="btn-back" class="mb-4 bg-slate-200 px-4 py-2 rounded-full font-bold">⬅️ Voltar</button>
        <div class="grid grid-cols-2 gap-4">
          <button id="game-colors" class="game-card bg-rose-200 p-6 rounded-2xl text-center text-xl font-bold">🎨 Cores</button>
          <button id="game-animals" class="game-card bg-amber-200 p-6 rounded-2xl text-center text-xl font-bold">🐶 Animais</button>
        </div>
      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', () => this.renderAgeSelection());
  }

  renderMenu4to5() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl">
        <button id="btn-back" class="mb-4 bg-slate-200 px-4 py-2 rounded-full font-bold">⬅️ Voltar</button>
        <div class="grid grid-cols-2 gap-4">
          <button id="game-memory" class="game-card bg-purple-200 p-6 rounded-2xl text-center text-xl font-bold">🧠 Memória</button>
        </div>
      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', () => this.renderAgeSelection());
    
    document.getElementById('game-memory').addEventListener('click', () => {
      const memory = new MemoryGame('game-container', this.audio, () => {
        this.storage.addStar();
        this.updateScoreUI();
      });
      memory.start(vocabularyData.animals, 1);
    });
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});