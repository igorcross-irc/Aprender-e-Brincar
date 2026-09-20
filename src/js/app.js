import { AudioEngine } from './audio-engine.js';
import { StorageManager } from './storage.js';
import { MemoryGame } from './games/memory.js';
import { CardsGame } from './games/cards.js';
import { CanvasGame } from './games/canvas.js';
import { PuzzleGame } from './games/puzzle.js';
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
    this.setupHeaderEvents();
    this.renderAgeSelection();
  }

  updateScoreUI() {
    if (this.starCountEl) {
      this.starCountEl.textContent = this.storage.getStars();
    }
  }

  setupHeaderEvents() {
    const settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openParentalGate());
    }
  }

  // Desafio Matemático / Portão Parental
  openParentalGate() {
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 5) + 1;
    const answer = n1 + n2;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-4 text-center">
        <div class="text-4xl">🔒</div>
        <h3 class="text-xl font-bold text-slate-800">Área dos Pais</h3>
        <p class="text-sm text-slate-500">Para continuar, resolva a conta:</p>
        <div class="text-2xl font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl">${n1} + ${n2} = ?</div>
        <input type="number" id="gate-input" class="w-24 text-center text-2xl font-bold border-2 border-indigo-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500" />
        <div class="flex gap-2 w-full mt-2">
          <button id="btn-gate-cancel" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-xl">Cancelar</button>
          <button id="btn-gate-confirm" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl">Entrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const input = modal.querySelector('#gate-input');
    input.focus();

    const closeModal = () => modal.remove();

    modal.querySelector('#btn-gate-cancel').addEventListener('click', closeModal);
    modal.querySelector('#btn-gate-confirm').addEventListener('click', () => {
      if (parseInt(input.value, 10) === answer) {
        closeModal();
        this.openSettingsModal();
      } else {
        this.audio.play(null, 'Tente novamente!');
        input.value = '';
        input.focus();
      }
    });
  }

  // Modal de Configurações
  openSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div class="flex justify-between items-center border-b pb-3">
          <h3 class="text-xl font-bold text-slate-800">⚙️ Configurações dos Pais</h3>
          <button id="btn-close-settings" class="text-slate-400 text-2xl font-bold">✕</button>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-slate-600">Nome da Criança:</label>
          <input type="text" id="child-name-input" value="${this.storage.getChildName()}" class="border-2 border-slate-200 rounded-xl p-2 font-bold text-indigo-600 focus:outline-none focus:border-indigo-500" />
        </div>

        <div class="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
          <div>
            <div class="font-bold text-amber-800">Estrelas Conquistadas</div>
            <div class="text-xs text-amber-600">Total acumulado pelo pequeno</div>
          </div>
          <div class="text-xl font-bold text-amber-700">⭐ ${this.storage.getStars()}</div>
        </div>

        <button id="btn-reset-stars" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-xl text-sm transition">
          🗑️ Zerar Conquistas
        </button>

        <button id="btn-save-settings" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg mt-2">
          Salvar
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());

    modal.querySelector('#btn-reset-stars').addEventListener('click', () => {
      this.storage.resetStars();
      this.updateScoreUI();
      modal.remove();
      this.audio.play(null, 'Estrelas zeradas!');
    });

    modal.querySelector('#btn-save-settings').addEventListener('click', () => {
      const nameInput = modal.querySelector('#child-name-input').value;
      this.storage.setChildName(nameInput);
      modal.remove();
      this.audio.play(null, 'Configurações salvas!');
    });
  }

  // Tela Inicial (Seleção de Idade)
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
      this.audio.play(null, 'Primeiras descobertas!');
      this.renderMenu2to3();
    });

    document.getElementById('btn-4-5').addEventListener('click', () => {
      this.audio.play(null, 'Hora de aprender!');
      this.renderMenu4to5();
    });
  }

  // Menu 2-3 Anos
  renderMenu2to3() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-4">
        <button id="btn-back" class="self-start bg-white/80 hover:bg-white text-slate-700 px-4 py-2 rounded-full font-bold shadow-sm">⬅️ Voltar</button>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button id="g-colors" class="game-card bg-rose-200 p-6 rounded-2xl text-center text-xl font-bold text-rose-800 shadow">🎨 Cores</button>
          <button id="g-animals" class="game-card bg-amber-200 p-6 rounded-2xl text-center text-xl font-bold text-amber-800 shadow">🐶 Animais</button>
          <button id="g-canvas" class="game-card bg-emerald-200 p-6 rounded-2xl text-center text-xl font-bold text-emerald-800 shadow">✏️ Lousa</button>
        </div>
      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', () => this.renderAgeSelection());

    const cards = new CardsGame('game-container', this.audio, this.storage, () => {
      this.storage.addStar();
      this.updateScoreUI();
    });

    document.getElementById('g-colors').addEventListener('click', () => {
      cards.renderGrid(vocabularyData.colors, '🎨 Aprender Cores', 'colors');
    });

    document.getElementById('g-animals').addEventListener('click', () => {
      cards.renderGrid(vocabularyData.animals, '🐶 Som dos Animais', 'animals');
    });

    document.getElementById('g-canvas').addEventListener('click', () => {
      const canvas = new CanvasGame('game-container', this.audio, () => {
        this.storage.addStar();
        this.updateScoreUI();
      });
      canvas.start();
    });
  }

  // Menu 4-5 Anos
  renderMenu4to5() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-4">
        <button id="btn-back" class="self-start bg-white/80 hover:bg-white text-slate-700 px-4 py-2 rounded-full font-bold shadow-sm">⬅️ Voltar</button>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button id="g-phrases" class="game-card bg-indigo-200 p-6 rounded-2xl text-center text-xl font-bold text-indigo-800 shadow">🗣️ Frases</button>
          <button id="g-memory" class="game-card bg-purple-200 p-6 rounded-2xl text-center text-xl font-bold text-purple-800 shadow">🧠 Memória</button>
          <button id="g-puzzle" class="game-card bg-teal-200 p-6 rounded-2xl text-center text-xl font-bold text-teal-800 shadow">🧩 Encaixe</button>
        </div>
      </div>
    `;

    document.getElementById('btn-back').addEventListener('click', () => this.renderAgeSelection());

    document.getElementById('g-phrases').addEventListener('click', () => {
      const cards = new CardsGame('game-container', this.audio, this.storage, () => {
        this.storage.addStar();
        this.updateScoreUI();
      });
      cards.renderPhraseBuilder(vocabularyData.phrases);
    });

    document.getElementById('g-memory').addEventListener('click', () => {
      const memory = new MemoryGame('game-container', this.audio, () => {
        this.storage.addStar();
        this.updateScoreUI();
      });
      memory.start(vocabularyData.animals, 2);
    });

    document.getElementById('g-puzzle').addEventListener('click', () => {
      const puzzle = new PuzzleGame('game-container', this.audio, () => {
        this.storage.addStar();
        this.updateScoreUI();
      });
      puzzle.start(vocabularyData.animals);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});