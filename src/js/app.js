import { ResilientAudioEngine } from './engine/audio-engine.js';
import { StorageManager } from './storage.js';
import { AppCore } from '../core/app-core.js';
import { activityCatalog } from '../content/activity-catalog.js';
import { registerPWA } from '../pwa.js';
import { createGameRegistry } from './game-registry.js';
import { AppScreens } from './ui/app-screens.js';
import { FamilySettings } from './ui/family-settings.js';
import { ExperienceController } from './controllers/experience-controller.js';
import { initPwaExperience } from '../core/pwa-status.js';

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
    this.experience = new ExperienceController(this);
    ['renderAgeSelection','renderChildStart','ageIcon','renderWorldMap','renderJourney','renderWorld','renderSessionResult','renderGuidedExperience'].forEach((method) => { this[method] = this.screens[method].bind(this); });
    this.init();
  }

  init() {
    registerPWA();
    initPwaExperience();
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

  launchGame(gameId, ageId) { return this.experience.launchGame(gameId, ageId); }

  openParentalGate() { return this.family.openParentalGate(); }

  openSettingsModal() { return this.family.openSettingsModal(); }

  setupHeaderEvents() {
    document.getElementById('btn-home-logo')?.addEventListener('click', () => this.renderAgeSelection({ force: true }));
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      muteBtn.textContent = this.audio.isMuted ? '🔇' : '🔊';
      muteBtn.addEventListener('click', () => {
        muteBtn.textContent = this.audio.toggleMute() ? '🔇' : '🔊';
      });
    }
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openParentalGate());
  }
}

new App();
