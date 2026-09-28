import { ResilientAudioEngine } from './engine/audio-engine.js';
import { StorageManager } from './storage.js';
import { AppCore } from '../core/app-core.js';
import { AGE_BANDS } from '../core/activity-registry.js';
import { activityCatalog } from '../content/activity-catalog.js';
import { registerPWA } from '../pwa.js';
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
    this.core = new AppCore(this.audio, this.storage);
    this.core.activities.registerMany(activityCatalog);
    this.container = document.getElementById('game-container');
    this.starCountEl = document.getElementById('star-count');
    this.init();
  }

  init() {
    registerPWA();
    this.updateScoreUI();
    this.setupHeaderEvents();
    this.renderAgeSelection();
  }

  updateScoreUI() {
    if (this.starCountEl) this.starCountEl.textContent = this.core.stars();
  }

  complete(activityId, options = {}) {
    this.core.complete(activityId, options);
    this.updateScoreUI();
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
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <h3 id="gate-title" class="text-xl font-bold text-slate-800">🔒 Área dos Pais</h3>
        <p class="text-sm text-slate-500">Resolva a conta para continuar:</p>
        <div class="text-2xl font-bold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl">${n1} × ${n2} = ?</div>
        <input type="number" id="gate-input" inputmode="numeric" aria-label="Resposta da conta" class="w-24 text-center text-2xl font-bold border-2 border-indigo-200 rounded-xl p-2" />
        <div class="flex gap-2 w-full">
          <button id="btn-gate-cancel" class="flex-1 bg-slate-100 font-bold py-3 rounded-xl touch-target">Cancelar</button>
          <button id="btn-gate-confirm" class="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl touch-target">Entrar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#btn-gate-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-gate-confirm').addEventListener('click', () => {
      const input = modal.querySelector('#gate-input');
      if (Number.parseInt(input.value, 10) === answer) { modal.remove(); this.openSettingsModal(); }
      else { input.value = ''; input.focus(); }
    });
    modal.querySelector('#gate-input').focus();
  }

  openSettingsModal() {
    const safeName = this.storage.escapeHtml(this.storage.getChildName());
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card max-w-md" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="flex justify-between items-center border-b pb-2">
          <h3 id="settings-title" class="text-xl font-bold text-slate-800">⚙️ Configurações</h3>
          <button id="btn-close-settings" class="touch-target text-slate-400 font-bold text-xl" aria-label="Fechar">✕</button>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-slate-600" for="child-name-input">Nome da Criança:</label>
          <input type="text" id="child-name-input" value="${safeName}" maxlength="15" autocomplete="off" class="border-2 border-slate-200 rounded-xl p-3 font-bold text-indigo-600" />
        </div>
        <button id="btn-reset-stars" class="bg-rose-100 text-rose-700 font-bold py-3 rounded-xl text-sm touch-target">Zerar Estrelas e Progresso</button>
        <button id="btn-save-settings" class="bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg touch-target">Salvar</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-reset-stars').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja zerar as conquistas acumuladas?')) {
        this.core.resetProgress();
        this.updateScoreUI();
        modal.remove();
      }
    });
    modal.querySelector('#btn-save-settings').addEventListener('click', () => {
      this.storage.setChildName(modal.querySelector('#child-name-input').value);
      modal.remove();
    });
  }

  renderAgeSelection() {
    this.container.innerHTML = `
      <div class="w-full max-w-3xl my-auto">
        <div class="text-center mb-5">
          <h2 class="text-2xl md:text-3xl font-black text-indigo-700">Vamos brincar!</h2>
          <p class="text-slate-600 mt-1">Escolha a faixa etária</p>
        </div>
        <div class="age-grid">
          ${AGE_BANDS.map((age) => `
            <button data-age="${age.id}" class="game-card bg-white p-5 rounded-3xl shadow-lg border-b-4 border-indigo-200 flex flex-col items-center gap-2 min-h-[150px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <span class="text-4xl">${age.id === '6-12m' ? '🌱' : age.id === '12-18m' ? '🧸' : age.id === '18-24m' ? '🐾' : age.id === '2-3y' ? '🎨' : age.id === '3-4y' ? '🧠' : '🚀'}</span>
              <span class="text-xl font-black text-indigo-700">${age.label}</span>
              <span class="text-xs text-slate-500">Explorar e brincar</span>
            </button>`).join('')}
        </div>
      </div>`;
    this.container.querySelectorAll('[data-age]').forEach((button) => {
      button.addEventListener('click', () => this.renderAgeHub(button.dataset.age));
    });
  }

  renderAgeHub(ageId) {
    const labels = {
      '6-12m': '🌱 Primeiras Descobertas',
      '12-18m': '🧸 Descobrir e Tocar',
      '18-24m': '🐾 Explorar e Associar',
      '2-3y': '🎨 Primeiras Brincadeiras',
      '3-4y': '🧠 Aprender Brincando',
      '4-5y': '🚀 Desafios e Descobertas'
    };
    const available = this.core.activities.forAge(ageId);
    const supported = available.filter((a) => ['colors','animals','canvas','phrases','memory','puzzle','balloons'].includes(a.id));
    if (ageId === '6-12m' || ageId === '12-18m') {
      this.container.innerHTML = `
        <div class="w-full max-w-xl text-center my-auto bg-white/90 rounded-3xl p-7 shadow-lg">
          <div class="text-6xl mb-3">${ageId === '6-12m' ? '🌱' : '🧸'}</div>
          <h2 class="text-2xl font-black text-indigo-700">${labels[ageId]}</h2>
          <p class="text-slate-600 mt-3">A fundação para essas faixas já está pronta. O catálogo específico está sendo expandido sem retirar os recursos existentes.</p>
          <button id="btn-back-age" class="mt-6 bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl touch-target">⬅️ Escolher outra faixa</button>
        </div>`;
      document.getElementById('btn-back-age').addEventListener('click', () => this.renderAgeSelection());
      return;
    }
    this.renderGamesForAge(ageId, labels[ageId], supported);
  }

  renderGamesForAge(ageId, title, activities) {
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="btn-back-menu" class="bg-white/90 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <h2 class="text-xl md:text-2xl font-black text-indigo-700 text-right">${title}</h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          ${activities.map((a) => `<button data-game="${a.id}" class="game-card bg-white p-5 rounded-2xl text-lg font-black text-indigo-800 shadow border-b-4 border-indigo-100 min-h-[120px] focus-visible:ring-4 focus-visible:ring-indigo-300"><span class="text-3xl block mb-2">${({colors:'🎨',animals:'🐶',canvas:'✏️',phrases:'🗣️',memory:'🧠',puzzle:'🧩',balloons:'🎈'})[a.id]}</span>${a.title}</button>`).join('')}
        </div>
      </div>`;
    document.getElementById('btn-back-menu').addEventListener('click', () => this.renderAgeSelection());
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, ageId)));
  }

  launchGame(gameId, ageId) {
    const onWin = () => this.complete(gameId);
    const onBack = () => this.renderAgeHub(ageId);
    if (gameId === 'colors') {
      const cards = new CardsGame('game-container', this.audio, this.storage, onWin, onBack);
      cards.renderGrid(vocabularyData.colors, '🎨 Aprender Cores');
    } else if (gameId === 'animals') {
      const cards = new CardsGame('game-container', this.audio, this.storage, onWin, onBack);
      this.audio.preload(vocabularyData.animals.map((x) => x.audio));
      cards.renderGrid(vocabularyData.animals, '🐶 Som dos Animais');
    } else if (gameId === 'canvas') {
      new CanvasGame('game-container', this.audio, onBack).start();
    } else if (gameId === 'phrases') {
      new CardsGame('game-container', this.audio, this.storage, onWin, onBack).renderPhraseBuilder(vocabularyData.phrases);
    } else if (gameId === 'memory') {
      new MemoryGame('game-container', this.audio, onWin, onBack).start(vocabularyData.animals, ageId === '4-5y' ? 3 : 2);
    } else if (gameId === 'puzzle') {
      new PuzzleGame('game-container', this.audio, onWin, onBack).start(vocabularyData.animals);
    } else if (gameId === 'balloons') {
      new BalloonPopGame('game-container', this.audio, onWin, onBack).start();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });