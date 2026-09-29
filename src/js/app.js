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
import { FamilySettings } from './ui/family-settings.js';

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
    this.family = new FamilySettings(this);
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

  evaluateRewards(activityId) { return this.family.evaluateRewards(activityId); }

  openParentalGate() { return this.family.openParentalGate(); }

  openSettingsModal() { return this.family.openSettingsModal(); }

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
          