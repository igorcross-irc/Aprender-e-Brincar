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
import { LearningWorldGame } from './games/learning-world.js';
import { vocabularyData } from '../data/vocabulary.js';
import { developmentContent } from '../content/development-content.js';

const GAME_ICONS = {
  'discovery-sounds': '👂', 'discovery-animals': '🐾', 'discovery-colors': '🎨',
  'attention-auditory': '👂', colors: '🎨', 'find-color': '🌈', animals: '🐶',
  'find-animal': '🔎', 'sound-guess': '🔊', 'shape-match': '🔷', 'odd-one-out': '🧩',
  'size-sort': '📏', sequence: '🔁', count: '🔢', 'number-match': '🔢',
  balloons: '🎈', phrases: '🗣️', syllables: '👄', rhymes: '🎵',
  'sound-initial': '🔤', 'story-sequence': '📖', communication: '💬',
  memory: '🧠', puzzle: '🧩', canvas: '🎨', movement: '🏃'
};

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
      <div class="w-full max-w-4xl my-auto">
        <div class="text-center mb-5">
          <div class="text-5xl mb-2">🌈🧸</div>
          <h2 class="text-2xl md:text-3xl font-black text-indigo-700">Vamos brincar!</h2>
          <p class="text-slate-600 mt-1">Escolha a faixa etária para ver experiências adequadas.</p>
        </div>
        <div class="age-grid">
          ${AGE_BANDS.map((age) => `
            <button data-age="${age.id}" class="game-card bg-white p-5 rounded-3xl shadow-lg border-b-4 border-indigo-200 flex flex-col items-center gap-2 min-h-[150px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <span class="text-4xl">${this.ageIcon(age.id)}</span>
              <span class="text-xl font-black text-indigo-700">${age.label}</span>
              <span class="text-xs text-slate-500">Explorar • brincar • desenvolver</span>
            </button>`).join('')}
        </div>
      </div>`;
    this.container.querySelectorAll('[data-age]').forEach((button) => {
      button.addEventListener('click', () => this.renderAgeHub(button.dataset.age));
    });
  }

  ageIcon(ageId) {
    return ({'6-12m':'🌱','12-18m':'🧸','18-24m':'🐾','2-3y':'🎨','3-4y':'🧠','4-5y':'🚀'})[ageId];
  }

  renderAgeHub(ageId) {
    const labels = {
      '6-12m': '🌱 Primeiras Descobertas',
      '12-18m': '🧸 Descobrir e Comunicar',
      '18-24m': '🐾 Explorar e Associar',
      '2-3y': '🎨 Brincar e Aprender',
      '3-4y': '🧠 Aprender Brincando',
      '4-5y': '🚀 Desafios e Descobertas'
    };
    const available = this.core.activities.forAge(ageId);
    this.renderGamesForAge(ageId, labels[ageId], available);
  }

  renderGamesForAge(ageId, title, activities) {
    const groups = [...new Set(activities.map((a) => a.category))];
    this.container.innerHTML = `
      <div class="w-full max-w-4xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="btn-back-menu" class="bg-white/95 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <div class="text-right">
            <h2 class="text-xl md:text-2xl font-black text-indigo-700">${title}</h2>
            <p class="text-xs text-slate-500">${activities.length} experiências disponíveis</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 justify-center">
          ${groups.map((group) => `<span class="bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-indigo-600">${group}</span>`).join('')}
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${activities.map((a) => `
            <button data-game="${a.id}" class="game-card bg-white p-5 rounded-3xl text-base font-black text-indigo-800 shadow border-b-4 border-indigo-100 min-h-[145px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <span class="text-4xl block mb-2">${GAME_ICONS[a.id] || '✨'}</span>
              <span>${a.title}</span>
              <span class="block text-[11px] text-slate-400 mt-2">${a.skills?.slice(0,2).join(' • ') || ''}</span>
            </button>`).join('')}
        </div>
      </div>`;
    this.container.querySelector('#btn-back-menu').addEventListener('click', () => this.renderAgeSelection());
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, ageId)));
  }

  launchGame(gameId, ageId) {
    const onWin = () => this.complete(gameId);
    const onBack = () => this.renderAgeHub(ageId);
    const world = new LearningWorldGame('game-container', this.audio, onWin, onBack);

    if (gameId === 'discovery-sounds') {\n      this.audio.preload(vocabularyData.animals.map((x) => x.audio));\n      return world.start('attention', { items: vocabularyData.animals });\n    }\n    if (gameId === 'discovery-animals' || gameId === 'animals') {
      this.audio.preload(vocabularyData.animals.map((x) => x.audio));
      return world.start('discover-animals', { items: vocabularyData.animals });
    }
    if (gameId === 'discovery-colors' || gameId === 'colors') {
      return world.start('discover-colors', { items: vocabularyData.colors });
    }
    if (gameId === 'find-color') return world.start('find-color', { items: vocabularyData.colors });
    if (gameId === 'find-animal') return world.start('find-animal', { items: vocabularyData.animals });
    if (gameId === 'sound-guess') {
      this.audio.preload(vocabularyData.animals.map((x) => x.audio));
      return world.start('sound-guess', { items: vocabularyData.animals });
    }
    if (gameId === 'shape-match') return world.start('shape-match');
    if (gameId === 'odd-one-out') return world.start('odd-one-out');
    if (gameId === 'size-sort') return world.start('size-sort');
    if (gameId === 'count') return world.start('count');
    if (gameId === 'number-match') return world.start('number-match');
    if (gameId === 'sequence') return world.start('sequence');
    if (gameId === 'syllables') return world.start('syllables');
    if (gameId === 'attention-auditory') {
      this.audio.preload(vocabularyData.animals.map((x) => x.audio));
      return world.start('attention', { items: vocabularyData.animals });
    }
    if (gameId === 'phrases' || gameId === 'communication') {
      return new CardsGame('game-container', this.audio, this.storage, onWin, onBack).renderPhraseBuilder(vocabularyData.phrases);
    }
    if (gameId === 'canvas') return new CanvasGame('game-container', this.audio, onBack).start();
    if (gameId === 'memory') return new MemoryGame('game-container', this.audio, onWin, onBack).start(vocabularyData.animals, ageId === '4-5y' ? 4 : ageId === '3-4y' ? 3 : 2);
    if (gameId === 'puzzle') return new PuzzleGame('game-container', this.audio, onWin, onBack).start(vocabularyData.animals);
    if (gameId === 'balloons') return new BalloonPopGame('game-container', this.audio, onWin, onBack).start();
    return this.renderGuidedExperience(gameId, ageId, onWin, onBack);
  }

  renderGuidedExperience(gameId, ageId, onWin, onBack) {
    const guided = {
      rhymes: { icon: '🎵', title: 'Rimas Divertidas', text: 'Ouça as palavras e encontre as que terminam de um jeito parecido.', cards: [['Gato','🐱'],['Rato','🐭'],['Bola','⚽'],['Mola','🌀']] },
      'sound-initial': { icon: '🔤', title: 'Com Que Som Começa?', text: 'Ouça a palavra e observe seu começo.', cards: [['Macaco','🐒'],['Mala','🧳'],['Bola','⚽'],['Gato','🐱']] },
      'story-sequence': { icon: '📖', title: 'Hora da História', text: 'Coloque as cenas na ordem e conte o que aconteceu.', cards: [['Primeiro','1️⃣'],['Depois','2️⃣'],['Por fim','3️⃣']] },
      movement: { icon: '🏃', title: 'Mexa o Corpo!', text: 'Levante, imite e brinque junto.', cards: [['Bata palmas','👏'],['Dê tchau','👋'],['Pule','🦘'],['Dance','💃']] },
      'discover-objects': { icon: '🔎', title: 'Descobrir Objetos', text: 'Toque, veja e descubra nomes de coisas do dia a dia.', cards: [['Bola','⚽'],['Casa','🏠'],['Carro','🚗'],['Maçã','🍎']] },
      'body-parts': { icon: '🧍', title: 'Meu Corpo', text: 'Vamos descobrir partes do corpo.', cards: [['Cabeça','🙂'],['Mão','✋'],['Pé','🦶'],['Olho','👀']] },
      'match-pairs': { icon: '🧩', title: 'Encontre o Par', text: 'Procure coisas que combinam.', cards: [['Bola','⚽'],['Casa','🏠'],['Carro','🚗'],['Maçã','🍎']] },
      'classify-animals': { icon: '🐾', title: 'Quem Pertence ao Grupo?', text: 'Observe e descubra o que combina.', cards: [['Animais','🐶'],['Comida','🍎'],['Brinquedos','🧸'],['Natureza','🌳']] },
      opposites: { icon: '↔️', title: 'Opostos Divertidos', text: 'Brinque com ideias que são diferentes.', cards: [['Grande / pequeno','🐘🐜'],['Alto / baixo','📏'],['Cheio / vazio','🥛'],['Dia / noite','☀️🌙']] },
      'sound-sequence': { icon: '👂', title: 'Sequência de Sons', text: 'Ouça uma sequência e tente lembrar.', cards: [['Um som','🔔'],['Dois sons','🔔🥁'],['Três sons','🔔🥁👏'],['Ouvir de novo','🔊']] },
      rhythm: { icon: '🎵', title: 'Brinque com o Ritmo', text: 'Imite o ritmo e movimente-se.', cards: [['Palmas','👏'],['Tum tum','🥁'],['Palma e pausa','👏⏸️'],['Dance','💃']] },
      'guided-movement': { icon: '🏃', title: 'Desafio do Movimento', text: 'Siga o comando e faça junto.', cards: [['Bata palmas','👏'],['Pule','🦘'],['Gire','🔄'],['Dê tchau','👋']] }
    };
    const data = guided[gameId] || { icon: '✨', title: 'Nova Brincadeira', text: 'Explore e descubra!', cards: [['Vamos brincar','🌟']] };
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-5 my-auto">
        <div class="flex justify-between items-center gap-3">
          <button id="guided-back" class="bg-white/95 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <h2 class="text-xl md:text-2xl font-black text-indigo-700">${data.icon} ${data.title}</h2>
        </div>
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
          <p class="text-slate-600 font-semibold mb-5">${data.text}</p>
          <div class="grid grid-cols-2 gap-4">
            ${data.cards.map(([label, icon], index) => `<button data-guided="${index}" class="bg-sky-50 border-4 border-sky-100 rounded-3xl p-6 min-h-[145px] shadow touch-target"><span class="text-6xl block">${icon}</span><span class="font-black text-sky-800">${label}</span></button>`).join('')}
          </div>
        </div>
      </div>`;
    this.container.querySelector('#guided-back').addEventListener('click', onBack);
    let touched = 0;
    this.container.querySelectorAll('[data-guided]').forEach((button) => button.addEventListener('click', () => {
      touched++;
      this.audio.play(null, button.textContent.trim());
      if (touched >= data.cards.length) { onWin(); setTimeout(() => onBack(), 700); }
    }));
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });