import { ResilientAudioEngine } from './engine/audio-engine.js';
import { StorageManager } from './storage.js';
import { AppCore } from '../core/app-core.js';
import { activityCatalog } from '../content/activity-catalog.js';
import { registerPWA } from '../pwa.js';
import { createGameRegistry } from './game-registry.js';
import { vocabularyData } from '../data/vocabulary.js';
import { rewardCatalog } from '../content/reward-catalog.js';
import { getContentReadiness } from '../core/content-readiness.js';
import { AppScreens } from './ui/app-screens.js';

class App {
  constructor() {
    this.audio = new ResilientAudioEngine();
    this.storage = new StorageManager();
    this.core = new AppCore(this.audio, this.storage);
    this.core.activities.registerMany(activityCatalog);
    this.gameRegistry = createGameRegistry({ containerId: 'game-container', audio: this.audio, storage: this.storage });
    this.container = document.getElementById('game-container');
    this.starCountEl = document.getElementById('star-count');
    this.currentAge = null;
    this.currentWorld = null;
    this.screens = new AppScreens();
    ['renderAgeSelection','ageIcon','renderWorldMap','renderJourney','renderWorld','renderSessionResult','renderGuidedExperience'].forEach((method) => { this[method] = this.screens[method].bind(this); });
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
          <p class="mt-1">${completedCount} registro(s) de atividade. Esta visão descreve experiências oferecidas e não é uma avaliação clínica.</p>
          <div class="domain-list mt-2">${topDomains.map(([domain,count]) => `<span>${this.escape(this.core.learning.labelDomain(domain))} · ${count}</span>`).join('') || '<span>Ainda sem dados</span>'}</div>
          <div class="mt-3 text-xs text-slate-500">🧠 O nível se ajusta pela experiência registrada, sem classificação clínica.</div>
        </div>
        ${(() => { const profile=this.core.learning.getProfile(); const pct=profile.accuracy==null?null:profile.accuracy; return `
        <div class="w-full bg-indigo-50 rounded-2xl p-4 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-2"><strong class="text-indigo-800">🧭 Perfil de aprendizagem</strong><span class="text-xs font-black text-indigo-500">${profile.exploration} explorações</span></div>
          <p class="mt-1">O sistema usa apenas o histórico local para variar propostas, sem diagnóstico.</p>
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div class="bg-white rounded-xl p-3"><strong class="block text-indigo-700">${profile.evaluated}</strong><small>habilidades observadas</small></div>
            <div class="bg-white rounded-xl p-3"><strong class="block text-indigo-700">${pct==null?'—':pct+'%'}</strong><small>média das atividades avaliadas</small></div>
          </div>
          <div class="grid md:grid-cols-2 gap-3 mt-3">
            <div class="bg-white rounded-xl p-3"><strong class="text-emerald-700">✨ Mais exploradas</strong><div class="domain-list mt-2">${profile.strengths.map(([s,d])=>`<span>${this.escape(this.core.learning.labelDomain(s))} · ${d.mastery.toFixed(1)}/5</span>`).join('') || '<span>Ainda sem dados</span>'}</div></div>
            <div class="bg-white rounded-xl p-3"><strong class="text-violet-700">🌱 Próximas áreas</strong><div class="domain-list mt-2">${profile.areas.map(([s,d])=>`<span>${this.escape(this.core.learning.labelDomain(s))} · ${d.mastery.toFixed(1)}/5</span>`).join('') || '<span>Ainda sem dados</span>'}</div></div>
          </div>
        </div>`; })()}
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


}

document.addEventListener('DOMContentLoaded',()=>{
  window.app=new App();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch((error)=>console.warn('[pwa] service worker indisponível',error));
});
