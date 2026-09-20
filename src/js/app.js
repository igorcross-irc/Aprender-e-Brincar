import { ResilientAudioEngine } from './engine/audio-engine.js';
import { StorageManager } from './storage.js';
import { MemoryGame } from './games/memory.js';
import { CardsGame } from './games/cards.js';
import { CanvasGame } from './games/canvas.js';
import { PuzzleGame } from './games/puzzle.js';
import { BalloonPopGame } from './games/balloon-pop.js';
import { vocabularyData } from '../data/vocabulary.js';

class App {
  constructor() {
    this.audio = new ResilientAudioEngine();
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
    if (this.starCountEl) this.starCountEl.textContent = this.storage.getStars();
  }

  setupHeaderEvents() {
    document.getElementById('btn-home-logo')?.addEventListener('click', () => this.renderAgeSelection());
    
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.textContent = this.audio.isMuted ? '🔇' : '🔊';
      muteBtn.addEventListener('click', () => {
        const muted = this.audio.toggleMute();
        muteBtn.textContent = muted ? '🔇' : '🔊';
      });
    }

    document.getElementById('btn-settings')?.addEventListener('click', () => this.openParentalGate());
  }

  openParentalGate() {
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 4) + 2;
    const answer = n1 * n2;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-4 text-center">
        <h3 class="text-xl font-bold text-slate-800">🔒 Área dos Pais</h3>
        <p class="text-sm text-slate-500">Resolva a conta para continuar:</p>
        <div class="text-2xl font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl">${n1} × ${n2} = ?</div>
        <input type="number" id="gate-input" class="w-24 text-center text-2xl font-bold border-2 border-indigo-200 rounded-xl p-2" />
        <div class="flex gap-2 w-full">
          <button id="btn-gate-cancel" class="flex-1 bg-slate-100 font-bold py-2 rounded-xl">Cancelar</button>
          <button id="btn-gate-confirm" class="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-xl">Entrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-gate-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-gate-confirm').addEventListener('click', () => {
      const input = modal.querySelector('#gate-input');
      if (parseInt(input.value, 10) === answer) {
        modal.remove();
        this.openSettingsModal();
      } else {
        input.value = '';
      }
    });
  }

  openSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div class="flex justify-between items-center border-b pb-2">
          <h3 class="text-xl font-bold text-slate-800">⚙️ Configurações</h3>
          <button id="btn-close-settings" class="text-slate-400 font-bold text-xl">✕</button>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-slate-600">Nome da Criança:</label>
          <input type="text" id="child-name-input" value="${this.storage.getChildName()}" maxlength="15" class="border-2 border-slate-200 rounded-xl p-2 font-bold text-indigo-600" />
        </div>
        <button id="btn-reset-stars" class="bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-sm">Zerar Estrelas</button>
        <button id="btn-save-settings" class="bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg">Salvar</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());

    modal.querySelector('#btn-reset-stars').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja zerar as conquistas acumuladas?')) {
        this.storage.resetStars();
        this.updateScoreUI();
        modal.remove();
      }
    });

    modal.querySelector('#btn-save-settings').addEventListener('click', () => {
      const name = modal.querySelector('#child-name-input').value;
      this.storage.setChildName(name);
      modal.remove();
    });
  }

  renderAgeSelection() {
    this.container.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 w-full max-w-xl p-4 my-auto">
        <button id="btn-2-3" class="game-card flex-1 bg-pink-400 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4">
          <img src="/assets/images/icon-animais.png" class="w-24 h-24 object-contain" alt="2 a 3 anos" />
          <span class="text-2xl font-bold">2 a 3 anos</span>
          <span class="text-sm bg-pink-600/40 px-3 py-1 rounded-full">Primeiras Descobertas</span>
        </button>

        <button id="btn-4-5" class="game-card flex-1 bg-sky-400 text-white p-6 rounded-3xl shadow-lg flex flex-col items-center gap-4">
          <img src="/assets/images/icon-numeros.png" class="w-24 h-24 object-contain" alt="4 a 5 anos" />
          <span class="text-2xl font-bold">4 a 5 anos</span>
          <span class="text-sm bg-sky-600/40 px-3 py-1 rounded-full">Aprendizado e Jogos</span>
        </button>
      </div>
    `;

    document.getElementById('btn-2-3').addEventListener('click', () => this.renderMenu2to3());
    document.getElementById('btn-4-5').addEventListener('click', () => this.renderMenu4to5());
  }

  renderMenu2to3() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
        <button id="btn-back-menu" class="self-start bg-white/90 text-slate-700 px-4 py-2 rounded-full font-bold shadow">⬅️ Voltar</button>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button id="g-colors" class="game-card bg-rose-200 p-6 rounded-2xl text-xl font-bold text-rose-800 shadow">🎨 Cores</button>
          <button id="g-animals" class="game-card bg-amber-200 p-6 rounded-2xl text-xl font-bold text-amber-800 shadow">🐶 Animais</button>
          <button id="g-canvas" class="game-card bg-emerald-200 p-6 rounded-2xl text-xl font-bold text-emerald-800 shadow">✏️ Lousa</button>
        </div>
      </div>
    `;
    document.getElementById('btn-back-menu').addEventListener('click', () => this.renderAgeSelection());

    const onWin = () => { this.storage.addStar(); this.updateScoreUI(); };
    const onBack = () => this.renderMenu2to3();

    document.getElementById('g-colors').addEventListener('click', () => {
      const cards = new CardsGame('game-container', this.audio, this.storage, onWin, onBack);
      cards.renderGrid(vocabularyData.colors, '🎨 Aprender Cores');
    });

    document.getElementById('g-animals').addEventListener('click', () => {
      const cards = new CardsGame('game-container', this.audio, this.storage, onWin, onBack);
      cards.renderGrid(vocabularyData.animals, '🐶 Som dos Animais');
    });

    document.getElementById('g-canvas').addEventListener('click', () => {
      const canvas = new CanvasGame('game-container', this.audio, onBack);
      canvas.start();
    });
  }

  renderMenu4to5() {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
        <button id="btn-back-menu" class="self-start bg-white/90 text-slate-700 px-4 py-2 rounded-full font-bold shadow">⬅️ Voltar</button>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button id="g-phrases" class="game-card bg-indigo-200 p-6 rounded-2xl text-xl font-bold text-indigo-800 shadow">🗣️ Frases</button>
          <button id="g-memory" class="game-card bg-purple-200 p-6 rounded-2xl text-xl font-bold text-purple-800 shadow">🧠 Memória</button>
          <button id="g-puzzle" class="game-card bg-teal-200 p-6 rounded-2xl text-xl font-bold text-teal-800 shadow">🧩 Encaixe</button>
          <button id="g-balloons" class="game-card bg-sky-200 p-6 rounded-2xl text-xl font-bold text-sky-800 shadow">🎈 Balões</button>
        </div>
      </div>
    `;
    document.getElementById('btn-back-menu').addEventListener('click', () => this.renderAgeSelection());

    const onWin = () => { this.storage.addStar(); this.updateScoreUI(); };
    const onBack = () => this.renderMenu4to5();

    document.getElementById('g-phrases').addEventListener('click', () => {
      const cards = new CardsGame('game-container', this.audio, this.storage, onWin, onBack);
      cards.renderPhraseBuilder(vocabularyData.phrases);
    });

    document.getElementById('g-memory').addEventListener('click', () => {
      const memory = new MemoryGame('game-container', this.audio, onWin, onBack);
      memory.start(vocabularyData.animals, 2);
    });

    document.getElementById('g-puzzle').addEventListener('click', () => {
      const puzzle = new PuzzleGame('game-container', this.audio, onWin, onBack);
      puzzle.start(vocabularyData.animals);
    });

    document.getElementById('g-balloons').addEventListener('click', () => {
      const balloons = new BalloonPopGame('game-container', this.audio, onWin, onBack);
      balloons.start();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });