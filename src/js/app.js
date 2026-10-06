import { installCompat } from '../legacy/compat.js';
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
import { setSfxEngine, installTapSounds } from './engine/sfx.js';
import '@fontsource-variable/nunito';
import { ScreenTime } from '../core/screen-time.js';
import { KidLock } from '../core/kid-lock.js';
import { AppUpdater } from '../core/app-update.js';
import { requestPersistence } from '../core/backup.js';
import { Favorites } from '../core/favorites.js';
import { registry, needsWhoPlays } from '../core/profiles.js';

const SCREEN_METHODS = ['childAge', 'renderHome', 'renderAgeSelection', 'renderWorldMap', 'renderWorld', 'renderSessionResult', 'renderGuidedExperience', 'renderSetup', 'renderAlbum', 'renderRest', 'renderFavorites', 'renderWhoPlays'];

class App {
  constructor() {
    this.audio = new ResilientAudioEngine();
    this.storage = new StorageManager();
    this.core = new AppCore(this.audio, this.storage);
    this.screenTime = new ScreenTime({ ageProvider: () => this.storage.getChildAge() });
    this.kidLock = new KidLock();
    this.updater = new AppUpdater();
    this.favorites = new Favorites({ isValid: (id) => activityCatalog.some((activity) => activity.id === id) });
    this.core.activities.registerMany(activityCatalog);
    this.gameRegistry = createGameRegistry({ containerId: 'game-container', audio: this.audio, storage: this.storage });
    this.container = document.getElementById('game-container');
    this.starCountEl = document.getElementById('star-count');
    this.currentAge = null;
    this.currentWorld = null;
    this.screens = new AppScreens();
    this.family = new FamilySettings(this);
    this.experience = new ExperienceController(this);
    SCREEN_METHODS.forEach((method) => { this[method] = this.screens[method].bind(this); });
    this.init();
  }

  init() {
    registerPWA();
    setSfxEngine(this.audio);
    installTapSounds(document);
    this.pwa = initPwaExperience();
    this.screenTime.start();
    this.kidLock.start();
    this.updater.start();
    // Ao atingir o limite, espera a brincadeira atual terminar antes de pedir descanso.
    this.screenTime.onLimit(() => { if (!this.experience.active && !this.container.querySelector('.rest-card')) this.renderRest(); });
    requestPersistence();
    this.updateScoreUI();
    this.setupHeaderEvents();
    this.updateProfileButton();
    if (needsWhoPlays()) this.renderWhoPlays(); else this.renderHome();
  }

  // Com mais de uma criança, o rosto dela aparece no cabeçalho e leva à tela "Quem vai brincar?".
  updateProfileButton() {
    const button = document.getElementById('btn-profile');
    if (!button) return;
    const profiles = registry().list();
    button.hidden = profiles.length < 2;
    const active = profiles.find((profile) => profile.id === registry().activeId);
    const avatar = document.getElementById('profile-avatar');
    if (avatar && active) avatar.textContent = active.avatar;
  }

  updateScoreUI() {
    if (this.starCountEl) this.starCountEl.textContent = this.core.stars();
  }

  // Estrela voa do centro da tela até o contador do cabeçalho.
  flyStarToCounter() {
    const target = document.getElementById('score-board');
    if (!target || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = target.getBoundingClientRect();
    const star = document.createElement('div');
    star.className = 'flying-star';
    star.textContent = '⭐';
    star.style.setProperty('--fly-x', `${rect.left + rect.width / 2 - window.innerWidth / 2}px`);
    star.style.setProperty('--fly-y', `${rect.top + rect.height / 2 - window.innerHeight / 2}px`);
    document.body.appendChild(star);
    star.addEventListener('animationend', () => {
      star.remove();
      target.classList.remove('bump');
      void target.offsetWidth;
      target.classList.add('bump');
    });
  }

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
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
    document.getElementById('btn-home-logo')?.addEventListener('click', () => {
      this.experience.stopActive();
      this.audio.stop();
      this.renderHome();
    });
    document.getElementById('btn-profile')?.addEventListener('click', () => {
      this.experience.stopActive();
      this.audio.stop();
      this.renderWhoPlays();
    });
    document.getElementById('btn-replay')?.addEventListener('click', () => this.audio.replayPrompt());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.openParentalGate());
  }
}

installCompat();
new App();
