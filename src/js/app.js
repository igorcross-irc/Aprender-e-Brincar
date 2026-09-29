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
import { rewardCatalog } from '../content/reward-catalog.js';

const GAME_ICONS = {
  'discovery-sounds':'👂','discovery-animals':'🐾','discovery-colors':'🎨','attention-auditory':'👂',
  colors:'🎨','find-color':'🌈',animals:'🐶','find-animal':'🔎','sound-guess':'🔊','shape-match':'🔷',
  'odd-one-out':'🧩','size-sort':'📏',sequence:'🔁',count:'🔢','number-match':'🔢',balloons:'🎈',
  phrases:'🗣️',syllables:'👄',rhymes:'🎵','sound-initial':'🔤','story-sequence':'📖',
  communication:'💬',memory:'🧠',puzzle:'🧩',canvas:'🎨',movement:'🏃','discover-objects':'🔎',
  'body-parts':'🧍','match-pairs':'🧩','classify-animals':'🐾',opposites:'↔️','sound-sequence':'👂',
  rhythm:'🎵','guided-movement':'🏃','baby-discover':'🌱','baby-colors':'🌈','vocabulary':'🗣️','story-interactive':'📖','music-rhythm':'🎵','sort-groups':'🧩','object-hunt':'🔎','animal-families':'🐾','action-words':'🗣️','story-choices':'📖','phrase-builder-2':'💬','color-hunt-2':'🌈','shape-sequence':'🔷','compare-sizes':'📏','animal-sound-memory':'🔊','animal-homes':'🏠','count-more':'🔢','number-order':'🔢','memory-objects':'🧠','attention-path':'👀','rhythm-copy':'🎵','movement-copy':'🏃'
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
    this.evaluateRewards(activityId);
    this.updateScoreUI();
  }

  evaluateRewards(activityId) {
    const snapshot = this.core.progress.snapshot();
    const explored = Object.values(snapshot.activities || {}).filter((item) => item.explored).length;
    const worlds = new Set();
    Object.entries(snapshot.activities || {}).forEach(([id, item]) => { if (!item.explored) return; const activity = activityCatalog.find((a) => a.id === id); if (activity?.world) worlds.add(activity.world); });
    const candidates = [];
    if (explored >= 1) candidates.push('first-discovery');
    if (explored >= 5) candidates.push('five-discoveries');
    if (explored >= 10) candidates.push('ten-discoveries');
    if (worlds.size >= 3) candidates.push('world-explorer');
    const current = snapshot.activities?.[activityId];
    if ((current?.completions || 0) >= 2) candidates.push('repeat-player');
    candidates.forEach((id) => this.core.progress.award(id));
  }

  getRewards() { const snapshot = this.core.progress.snapshot(); return rewardCatalog.map((reward) => ({ ...reward, earned: Boolean(snapshot.rewards?.[reward.id]) })); }

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
    const completedCount = Object.values(snapshot.activities || {}).reduce((sum, item) => sum + (item.completions || 0), 0);
    const domains = {};
    Object.entries(snapshot.activities || {}).forEach(([id, item]) => { if (!item.explored) return; const activity = activityCatalog.find((a) => a.id === id); (activity?.developmentDomains || []).forEach((domain) => { domains[domain] = (domains[domain] || 0) + 1; }); });
    const topDomains = Object.entries(domains).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card max-w-lg" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="w-full flex justify-between items-center border-b pb-2">
          <h3 id="settings-title" class="text-xl font-black text-slate-800">👨‍👩‍👧 Área da Família</h3>
          <button id="btn-close-settings" class="touch-target text-slate-400 font-bold text-xl" aria-label="Fechar">✕</button>
        </div>
        <div class="w-full grid grid-cols-4 gap-2">
          <div class="bg-amber-50 rounded-2xl p-3 text-center"><div class="text-2xl">⭐</div><strong>${snapshot.stars || 0}</strong><small class="block text-slate-500">estrelas</small></div>
          <div class="bg-indigo-50 rounded-2xl p-3 text-center"><div class="text-2xl">🎮</div><strong>${played}</strong><small class="block text-slate-500">experiências</small></div>
          <div class="bg-emerald-50 rounded-2xl p-3 text-center"><div class="text-2xl">🌈</div><strong>${total}</strong><small class="block text-slate-500">disponíveis</small></div>
          <div class="bg-violet-50 rounded-2xl p-3 text-center"><div class="text-2xl">🔥</div><strong>${snapshot.sessions?.streak || 0}</strong><small class="block text-slate-500">dias seguidos</small></div>
        </div>
        <div class="w-full bg-violet-50 rounded-2xl p-4">
          <strong class="text-violet-800">🏅 Conquistas</strong>
          <div class="reward-grid mt-3">${this.getRewards().map((reward) => `<div class="reward-chip ${reward.earned ? 'earned' : 'locked'}"><span>${reward.earned ? reward.icon : '🔒'}</span><div><strong>${this.escape(reward.title)}</strong><small>${this.escape(reward.description)}</small></div></div>`).join('')}</div>
        </div>
        <div class="w-full bg-emerald-50 rounded-2xl p-4 text-sm text-slate-600">
          <strong class="text-emerald-800">🌱 Visão do desenvolvimento</strong>
          <p class="mt-1">${completedCount} exploração(ões) realizadas. Esta visão descreve as experiências oferecidas e não é uma avaliação clínica.</p>
          <div class="domain-list mt-2">${topDomains.map(([domain,count]) => `<span>${this.escape(this.core.learning.labelDomain(domain))} · ${count}</span>`).join('') || '<span>Ainda sem dados</span>'}</div>
          <div class="mt-3 text-xs text-slate-500">🧠 O nível se ajusta pela experiência registrada, sem classificação clínica.</div>
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
        <div class="bg-violet-50 rounded-[1.75rem] p-4 shadow-sm border border-violet-100">\n          <div class="flex items-center justify-between gap-3">\n            <div><strong class="text-violet-800">🧠 Sugestões para agora</strong><p class="text-xs text-violet-600 mt-1">O app adapta as próximas brincadeiras ao histórico local.</p></div>\n            <span class="text-xs font-black text-violet-500">${this.core.progress.snapshot().sessions?.streak || 0} dia(s) de sequência</span>\n          </div>\n          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">\n            ${this.core.learning.recommend(this.currentAge, worldId, 3).map(({activity,reason})=>`<button data-recommend="${activity.id}" class="bg-white rounded-xl p-3 text-left border border-violet-100 shadow-sm touch-target"><span class="font-black text-indigo-700">${GAME_ICONS[activity.id]||'✨'} ${this.escape(activity.title)}</span><span class="block text-[11px] text-slate-500 mt-1">${this.escape(reason)}</span></button>`).join('')}\n          </div>\n        </div>\n        <div class="activity-grid">
          ${activities.map((activity) => {
            const progress = this.core.progress.getActivity(activity.id);
            return `
              <button data-game="${activity.id}" class="activity-card bg-white rounded-[1.75rem] p-5 text-left shadow-lg border-2 border-slate-100 min-h-[170px] focus-visible:ring-4 focus-visible:ring-indigo-300">
                <div class="flex justify-between items-start"><span class="text-4xl">${GAME_ICONS[activity.id] || '✨'}</span>${progress ? `<span class="text-xs font-black text-emerald-600">✓ nível ${progress.level || 1}</span>` : ''}</div>
                <h3 class="text-lg font-black text-indigo-800 mt-3">${this.escape(activity.title)}</h3>
                <p class="text-xs text-slate-500 mt-1">${activity.skills?.slice(0,2).map((x)=>this.escape(x)).join(' • ') || ''}</p>
                <div class="mt-3 flex gap-2"><span class="difficulty">${'⭐'.repeat(Math.min(activity.difficulty || 1,3))}</span><span class="text-[10px] text-slate-400">${activity.type === 'activity' ? 'livre' : activity.type === 'creative' ? 'criativa' : 'jogo'}</span></div>
                ${progress ? `<div class="progress-track mt-3"><span style="width:${Math.min((progress.completions || 0) * 20, 100)}%"></span></div><div class="text-[10px] text-slate-400 mt-1">${progress.completions || 0} exploração(ões)</div>` : ''}
              </button>`;
          }).join('')}
        </div>
      </div>`;
    this.container.querySelector('#btn-back-worlds').addEventListener('click', () => this.renderWorldMap(this.currentAge));
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, this.currentAge)));\n    this.container.querySelectorAll('[data-recommend]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.recommend, this.currentAge)));
  }

  launchGame(gameId, ageId) {
    this.core.session.ensure(ageId, this.currentWorld);
    this.core.learning.remember(gameId);
    let finished = false;
    const onWin = (result = {}) => {
      if (finished) return;
      finished = true;
      const sessionResult = this.core.session.complete(gameId, { score: result.score ?? 0, rounds: result.rounds ?? 5 });
      if (sessionResult.completed) {
        this.evaluateRewards(gameId);
        this.updateScoreUI();
      }
    };
    const onBack = () => this.renderWorld(this.currentWorld);
    const activity = activityCatalog.find((item) => item.id === gameId);\n    const adaptive = activity ? this.core.learning.getDifficulty(activity, ageId) : { level: 1 };\n    const world = new LearningWorldGame('game-container', this.audio, onWin, onBack);
    if (gameId === 'discovery-sounds') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('attention',{items:vocabularyData.animals, difficulty: adaptive.level}); }
    if (gameId === 'discovery-animals' || gameId === 'animals') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('discover-animals',{items:vocabularyData.animals, difficulty: adaptive.level}); }
    if (gameId === 'discovery-colors' || gameId === 'colors') return world.start('discover-colors',{items:vocabularyData.colors, difficulty: adaptive.level});
    if (gameId === 'find-color') return world.start('find-color',{items:vocabularyData.colors, difficulty: adaptive.level});
    if (gameId === 'find-animal') return world.start('find-animal',{items:vocabularyData.animals, difficulty: adaptive.level});
    if (gameId === 'sound-guess') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('sound-guess',{items:vocabularyData.animals, difficulty: adaptive.level}); }
    if (gameId === 'shape-match') return world.start('shape-match',{difficulty: adaptive.level});
    if (gameId === 'odd-one-out') return world.start('odd-one-out',{difficulty: adaptive.level});
    if (gameId === 'size-sort') return world.start('size-sort',{difficulty: adaptive.level});
    if (gameId === 'count') return world.start('count',{difficulty: adaptive.level});
    if (gameId === 'number-match') return world.start('number-match',{difficulty: adaptive.level});
    if (gameId === 'sequence') return world.start('sequence',{difficulty: adaptive.level});
    if (gameId === 'syllables') return world.start('syllables',{difficulty: adaptive.level});
    if (gameId === 'discover-objects') return world.start('discover-objects',{difficulty: adaptive.level});
    if (gameId === 'body-parts') return world.start('body-parts',{difficulty: adaptive.level});
    if (gameId === 'match-pairs') return world.start('match-pairs',{difficulty: adaptive.level});
    if (gameId === 'classify-animals') return world.start('classify-animals',{difficulty: adaptive.level});
    if (gameId === 'opposites') return world.start('opposites',{difficulty: adaptive.level});
    if (gameId === 'rhythm') return world.start('rhythm',{difficulty: adaptive.level});
    if (gameId === 'guided-movement') return world.start('guided-movement',{difficulty: adaptive.level});
    if (gameId === 'baby-discover') return world.start('baby-discover');
    if (gameId === 'baby-colors') return world.start('baby-colors');
    if (gameId === 'vocabulary') return world.start('vocabulary');
    if (gameId === 'story-interactive') return world.start('story-interactive');
    if (gameId === 'music-rhythm') return world.start('music-rhythm');
    if (gameId === 'sort-groups') return world.start('sort-groups');
    if (gameId === 'object-hunt') return world.start('discover-objects');
    if (gameId === 'animal-families') return world.start('classify-animals');
    if (gameId === 'action-words') return world.start('vocabulary');
    if (gameId === 'story-choices') return world.start('story-interactive');
    if (gameId === 'phrase-builder-2') return new CardsGame('game-container',this.audio,this.storage,onWin,onBack).renderPhraseBuilder(vocabularyData.phrases);
    if (gameId === 'color-hunt-2') return world.start('find-color',{items:vocabularyData.colors, difficulty: adaptive.level});
    if (gameId === 'shape-sequence') return world.start('sequence',{difficulty: adaptive.level});
    if (gameId === 'compare-sizes') return world.start('size-sort',{difficulty: adaptive.level});
    if (gameId === 'animal-sound-memory') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('sound-guess',{items:vocabularyData.animals, difficulty: adaptive.level}); }
    if (gameId === 'animal-homes') return world.start('find-animal',{items:vocabularyData.animals, difficulty: adaptive.level});
    if (gameId === 'count-more') return world.start('count',{difficulty: adaptive.level});
    if (gameId === 'number-order') return world.start('sequence',{difficulty: adaptive.level});
    if (gameId === 'memory-objects') return world.start('match-pairs');
    if (gameId === 'attention-path') return world.start('attention',{items:vocabularyData.animals, difficulty: adaptive.level});
    if (gameId === 'rhythm-copy') return world.start('music-rhythm');
    if (gameId === 'movement-copy') return world.start('guided-movement');
    if (gameId === 'attention-auditory') { this.audio.preload(vocabularyData.animals.map((x)=>x.audio)); return world.start('attention',{items:vocabularyData.animals, difficulty: adaptive.level}); }
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
