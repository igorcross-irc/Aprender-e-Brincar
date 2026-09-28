import { ResilientAudioEngine } from './engine/audio-engine.js';
import { StorageManager } from './storage.js';
import { AppCore } from '../core/app-core.js';
import { AGE_BANDS } from '../core/activity-registry.js';
import { activityCatalog } from '../content/activity-catalog.js';
import { learningWorlds } from '../content/world-catalog.js';
import { registerPWA } from '../pwa.js';
import { MemoryGame } from './games/memory.js';
import { CardsGame } from './games/cards.js';
import { CanvasGame } from './games/canvas.js';
import { PuzzleGame } from './games/puzzle.js';
import { BalloonPopGame } from './games/balloon-pop.js';
import { LearningWorldGame } from './games/learning-world.js';
import { vocabularyData } from '../data/vocabulary.js';

const GAME_ICONS = {
  'discovery-sounds':'👂','discovery-animals':'🐾','discovery-colors':'🎨','attention-auditory':'👂',
  colors:'🎨','find-color':'🌈',animals:'🐶','find-animal':'🔎','sound-guess':'🔊','shape-match':'🔷',
  'odd-one-out':'🧩','size-sort':'📏',sequence:'🔁',count:'🔢','number-match':'🔢',balloons:'🎈',
  phrases:'🗣️',syllables:'👄',rhymes:'🎵','sound-initial':'🔤','story-sequence':'📖',
  communication:'💬',memory:'🧠',puzzle:'🧩',canvas:'🎨',movement:'🏃','discover-objects':'🔎',
  'body-parts':'🧍','match-pairs':'🧩','classify-animals':'🐾',opposites:'↔️','sound-sequence':'👂',
  rhythm:'🎵','guided-movement':'🏃'
};

const AGE_LABELS = Object.fromEntries(AGE_BANDS.map((age) => [age.id, age.label]));

class App {
  constructor() {
    this.audio = new ResilientAudioEngine();
    this.storage = new StorageManager();
    this.core = new AppCore(this.audio, this.storage);
    this.core.activities.registerMany(activityCatalog);
    this.container = document.getElementById('game-container');
    this.starCountEl = document.getElementById('star-count');
    this.currentAge = null;
    this.currentWorld = null;
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

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
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
        muteBtn.textContent = this.audio.toggleMute() ? '🔇' : '🔊';
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
        <div class="text-5xl">👨‍👩‍👧</div>
        <h3 id="gate-title" class="text-xl font-black text-slate-800">Área da Família</h3>
        <p class="text-sm text-slate-500 text-center">Esta área é protegida para responsáveis.</p>
        <div class="text-2xl font-black text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl">${n1} × ${n2} = ?</div>
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
    const snapshot = this.core.progress.snapshot();
    const played = Object.keys(snapshot.activities || {}).length;
    const total = activityCatalog.length;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card max-w-lg" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="w-full flex justify-between items-center border-b pb-2">
          <h3 id="settings-title" class="text-xl font-black text-slate-800">👨‍👩‍👧 Área da Família</h3>
          <button id="btn-close-settings" class="touch-target text-slate-400 font-bold text-xl" aria-label="Fechar">✕</button>
        </div>
        <div class="w-full grid grid-cols-3 gap-2">
          <div class="bg-amber-50 rounded-2xl p-3 text-center"><div class="text-2xl">⭐</div><strong>${snapshot.stars || 0}</strong><small class="block text-slate-500">estrelas</small></div>
          <div class="bg-indigo-50 rounded-2xl p-3 text-center"><div class="text-2xl">🎮</div><strong>${played}</strong><small class="block text-slate-500">experiências</small></div>
          <div class="bg-emerald-50 rounded-2xl p-3 text-center"><div class="text-2xl">🌈</div><strong>${total}</strong><small class="block text-slate-500">disponíveis</small></div>
        </div>
        <div class="w-full flex flex-col gap-2">
          <label class="text-sm font-bold text-slate-600" for="child-name-input">Nome da criança</label>
          <input type="text" id="child-name-input" value="${safeName}" maxlength="15" autocomplete="off" class="border-2 border-slate-200 rounded-xl p-3 font-bold text-indigo-600" />
        </div>
        <div class="w-full bg-sky-50 rounded-2xl p-4 text-sm text-slate-600">
          <strong class="text-sky-800">Privacidade</strong>
          <p class="mt-1">O progresso desta versão é mantido localmente no dispositivo. Não usamos anúncios, perfil comportamental ou venda de dados.</p>
        </div>
        <button id="btn-reset-stars" class="w-full bg-rose-100 text-rose-700 font-bold py-3 rounded-xl text-sm touch-target">Zerar progresso</button>
        <button id="btn-save-settings" class="w-full bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg touch-target">Salvar</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());
    modal.querySelector('#btn-reset-stars').addEventListener('click', () => {
      if (confirm('Tem certeza que deseja zerar as conquistas acumuladas?')) {
        this.core.resetProgress(); this.updateScoreUI(); modal.remove();
      }
    });
    modal.querySelector('#btn-save-settings').addEventListener('click', () => {
      this.storage.setChildName(modal.querySelector('#child-name-input').value);
      modal.remove();
    });
  }

  renderAgeSelection() {
    this.currentAge = null; this.currentWorld = null;
    this.container.innerHTML = `
      <div class="w-full max-w-5xl my-auto">
        <div class="text-center mb-6">
          <div class="text-6xl mb-2">🌈🧸✨</div>
          <h2 class="text-3xl md:text-4xl font-black text-indigo-700">Mapa do Aprender & Brincar</h2>
          <p class="text-slate-600 mt-2 max-w-xl mx-auto">Escolha a idade e entre em um mundo de descobertas. Cada brincadeira pode ser repetida e explorada no seu ritmo.</p>
        </div>
        <div class="age-grid">
          ${AGE_BANDS.map((age) => `
            <button data-age="${age.id}" class="world-card bg-white p-5 rounded-[2rem] shadow-lg border-b-4 border-indigo-200 flex flex-col items-center gap-2 min-h-[165px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <span class="text-5xl">${this.ageIcon(age.id)}</span>
              <span class="text-xl font-black text-indigo-700">${age.label}</span>
              <span class="text-xs text-slate-500">Explorar • brincar • descobrir</span>
            </button>`).join('')}
        </div>
      </div>`;
    this.container.querySelectorAll('[data-age]').forEach((button) => button.addEventListener('click', () => this.renderWorldMap(button.dataset.age)));
  }

  ageIcon(ageId) {
    return ({'6-12m':'🌱','12-18m':'🧸','18-24m':'🐾','2-3y':'🎨','3-4y':'🧠','4-5y':'🚀'})[ageId] || '🌈';
  }

  renderWorldMap(ageId) {
    this.currentAge = ageId; this.currentWorld = null;
    const worlds = learningWorlds.map((world) => ({
      ...world,
      activities: world.activityIds.map((id) => activityCatalog.find((a) => a.id === id)).filter(Boolean).filter((a) => a.ages.includes(ageId))
    })).filter((world) => world.activities.length);
    const childName = this.storage.getChildName();
    this.container.innerHTML = `
      <div class="w-full max-w-5xl flex flex-col gap-5 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="btn-back-age" class="nav-pill touch-target">⬅️ Idades</button>
          <div class="text-right"><div class="text-sm text-slate-500">${childName ? this.escape(childName)+', ' : ''}${AGE_LABELS[ageId]}</div><h2 class="text-2xl md:text-3xl font-black text-indigo-700">Escolha um mundo</h2></div>
        </div>
        <div class="world-path">
          ${worlds.map((world, index) => `
            <button data-world="${world.id}" class="world-card world-card-${world.color} bg-white rounded-[2rem] p-5 text-left shadow-xl border-2 border-white min-h-[185px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <div class="flex items-start justify-between"><span class="text-5xl">${world.icon}</span><span class="world-step">${index + 1}</span></div>
              <h3 class="text-xl font-black text-slate-800 mt-3">${world.title}</h3>
              <p class="text-sm text-slate-500 mt-1">${world.description}</p>
              <span class="inline-flex mt-3 bg-slate-100 rounded-full px-3 py-1 text-xs font-bold text-slate-600">${world.activities.length} brincadeiras</span>
            </button>`).join('')}
        </div>
        <div class="text-center text-xs text-slate-500">💡 Não existe competição: cada descoberta vale por si.</div>
      </div>`;
    this.container.querySelector('#btn-back-age').addEventListener('click', () => this.renderAgeSelection());
    this.container.querySelectorAll('[data-world]').forEach((button) => button.addEventListener('click', () => this.renderWorld(button.dataset.world)));
  }

  renderWorld(worldId) {
    const world = learningWorlds.find((item) => item.id === worldId);
    if (!world || !this.currentAge) return this.renderAgeSelection();
    this.currentWorld = worldId;
    const activities = world.activityIds.map((id) => activityCatalog.find((a) => a.id === id)).filter(Boolean).filter((a) => a.ages.includes(this.currentAge));
    this.container.innerHTML = `
      <div class="w-full max-w-5xl flex flex-col gap-5 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="btn-back-worlds" class="nav-pill touch-target">⬅️ Mundos</button>
          <div class="text-right"><div class="text-4xl">${world.icon}</div><h2 class="text-2xl font-black text-indigo-700">${world.title}</h2></div>
        </div>
        <div class="bg-white/90 rounded-[2rem] p-5 shadow-lg text-center">
          <p class="text-slate-600">${world.description}</p>
          <div class="mt-2 text-xs font-bold text-indigo-500">${activities.length} experiências para ${AGE_LABELS[this.currentAge]}</div>
        </div>
        <div class="activity-grid">
          ${activities.map((activity) => {
            const progress = this.core.progress.getActivity(activity.id);
            return `
              <button data-game="${activity.id}" class="activity-card bg-white rounded-[1.75rem] p-5 text-left shadow-lg border-2 border-slate-100 min-h-[170px] focus-visible:ring-4 focus-visible:ring-indigo-300">
                <div class="flex justify-between items-start"><span class="text-4xl">${GAME_ICONS[activity.id] || '✨'}</span>${progress ? '<span class="text-xs font-black text-emerald-600">✓ explorado</span>' : ''}</div>
                <h3 class="text-lg font-black text-indigo-800 mt-3">${this.escape(activity.title)}</h3>
                <p class="text-xs text-slate-500 mt-1">${activity.skills?.slice(0,2).map((x)=>this.escape(x)).join(' • ') || ''}</p>
                <div class="mt-3 flex gap-2"><span class="difficulty">${'⭐'.repeat(Math.min(activity.difficulty || 1,3))}</span><span class="text-[10px] text-slate-400">${activity.type === 'activity' ? 'livre' : activity.type === 'creative' ? 'criativa' : 'jogo'}</span></div>
              </button>`;
          }).join('')}
        </div>
      </div>`;
    this.container.querySelector('#btn-back-worlds').addEventListener('click', () => this.renderWorldMap(this.currentAge));
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, this.currentAge)));
  }

  launchGame(gameId, ageId) {
    const onWin = () => this.complete(gameId);
    const onBack = () => this.renderWorld(this.currentWorld);
    const world = new LearningWorldGame('game-container', this.audio, onWin, onBack);
    if (gameId === 'discovery-sounds') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('attention',{items:vocabularyData.animals}); }
    if (gameId === 'discovery-animals' || gameId === 'animals') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('discover-animals',{items:vocabularyData.animals}); }
    if (gameId === 'discovery-colors' || gameId === 'colors') return world.start('discover-colors',{items:vocabularyData.colors});
    if (gameId === 'find-color') return world.start('find-color',{items:vocabularyData.colors});
    if (gameId === 'find-animal') return world.start('find-animal',{items:vocabularyData.animals});
    if (gameId === 'sound-guess') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('sound-guess',{items:vocabularyData.animals}); }
    if (gameId === 'shape-match') return world.start('shape-match');
    if (gameId === 'odd-one-out') return world.start('odd-one-out');
    if (gameId === 'size-sort') return world.start('size-sort');
    if (gameId === 'count') return world.start('count');
    if (gameId === 'number-match') return world.start('number-match');
    if (gameId === 'sequence') return world.start('sequence');
    if (gameId === 'syllables') return world.start('syllables');
    if (gameId === 'discover-objects') return world.start('discover-objects');
    if (gameId === 'body-parts') return world.start('body-parts');
    if (gameId === 'match-pairs') return world.start('match-pairs');
    if (gameId === 'classify-animals') return world.start('classify-animals');
    if (gameId === 'opposites') return world.start('opposites');
    if (gameId === 'rhythm') return world.start('rhythm');
    if (gameId === 'guided-movement') return world.start('guided-movement');
    if (gameId === 'attention-auditory') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('attention',{items:vocabularyData.animals}); }
    if (gameId === 'phrases' || gameId === 'communication') return new CardsGame('game-container',this.audio,this.storage,onWin,onBack).renderPhraseBuilder(vocabularyData.phrases);
    if (gameId === 'canvas') return new CanvasGame('game-container',this.audio,onBack).start();
    if (gameId === 'memory') return new MemoryGame('game-container',this.audio,onWin,onBack).start(vocabularyData.animals,ageId==='4-5y'?4:ageId==='3-4y'?3:2);
    if (gameId === 'puzzle') return new PuzzleGame('game-container',this.audio,onWin,onBack).start(vocabularyData.animals);
    if (gameId === 'balloons') return new BalloonPopGame('game-container',this.audio,onWin,onBack).start();
    return this.renderGuidedExperience(gameId,onWin,onBack);
  }

  renderGuidedExperience(gameId,onWin,onBack) {
    const guided={
      rhymes:['🎵','Rimas Divertidas','Encontre palavras que terminam de um jeito parecido.',['Gato','Rato','Bola','Mola']],
      'sound-initial':['🔤','Com Que Som Começa?','Ouça a palavra e observe seu começo.',['Macaco','Mala','Bola','Gato']],
      'story-sequence':['📖','Hora da História','Coloque as cenas na ordem e conte o que aconteceu.',['Primeiro','Depois','Por fim']],
      movement:['🏃','Mexa o Corpo!','Levante, imite e brinque junto.',['Bata palmas','Dê tchau','Pule','Dance']],
      'discover-objects':['🔎','Descobrir Objetos','Toque, veja e descubra nomes de coisas do dia a dia.',['Bola','Casa','Carro','Maçã']],
      'body-parts':['🧍','Meu Corpo','Vamos descobrir partes do corpo.',['Cabeça','Mão','Pé','Olho']],
      'match-pairs':['🧩','Encontre o Par','Procure coisas que combinam.',['Bola','Casa','Carro','Maçã']],
      'classify-animals':['🐾','Quem Pertence ao Grupo?','Observe e descubra o que combina.',['Animais','Comida','Brinquedos','Natureza']],
      opposites:['↔️','Opostos Divertidos','Brinque com ideias que são diferentes.',['Grande / pequeno','Alto / baixo','Cheio / vazio','Dia / noite']],
      'sound-sequence':['👂','Sequência de Sons','Ouça, lembre e tente repetir a sequência.',['Um som','Dois sons','Três sons','Ouvir de novo']],
      rhythm:['🎵','Brinque com o Ritmo','Imite o ritmo e movimente-se.',['Palmas','Tum tum','Palma e pausa','Dance']],
      'guided-movement':['🏃','Desafio do Movimento','Siga o comando e faça junto.',['Bata palmas','Pule','Gire','Dê tchau']]
    };
    const [icon,title,text,cards]=guided[gameId] || ['✨','Nova Brincadeira','Explore e descubra!',['Vamos brincar']];
    this.container.innerHTML=`
      <div class="w-full max-w-2xl flex flex-col gap-5 my-auto">
        <div class="flex justify-between items-center gap-3"><button id="guided-back" class="nav-pill touch-target">⬅️ Voltar</button><h2 class="text-xl md:text-2xl font-black text-indigo-700">${icon} ${title}</h2></div>
        <div class="bg-white/95 rounded-[2rem] p-6 shadow-xl text-center">
          <p class="text-slate-600 font-semibold mb-5">${this.escape(text)}</p>
          <div class="grid grid-cols-2 gap-4">${cards.map((label,index)=>`<button data-guided="${index}" class="activity-card bg-sky-50 border-4 border-sky-100 rounded-3xl p-6 min-h-[150px] shadow touch-target"><span class="text-5xl block">${['👏','👋','🦘','💃'][index%4]}</span><span class="font-black text-sky-800">${this.escape(label)}</span></button>`).join('')}</div>
        </div>
      </div>`;
    this.container.querySelector('#guided-back').addEventListener('click',onBack);
    let touched=0;
    this.container.querySelectorAll('[data-guided]').forEach((button)=>button.addEventListener('click',()=>{
      if(button.dataset.done==='1') return;
      button.dataset.done='1'; touched++; button.classList.add('border-emerald-400','bg-emerald-50'); this.audio.play(null,button.textContent.trim());
      if(touched>=cards.length){onWin();setTimeout(onBack,700);}
    }));
  }
}

document.addEventListener('DOMContentLoaded',()=>{window.app=new App();});
