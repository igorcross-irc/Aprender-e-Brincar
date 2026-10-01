import { activityCatalog } from '../../content/activity-catalog.js';
import { getContentReadiness } from '../../core/content-readiness.js';
import { getAgeExperienceConfig, isAgeCompatible } from '../../core/age-experience-policy.js';
import { applyChildInterfacePolicy } from '../../core/child-interface-policy.js';

export class ExperienceController {
  constructor(app) { this.app = app; this.active = null; this.launchToken = 0; }

  // Interrompe timers, sons e ouvintes do jogo atual ao sair no meio.
  stopActive() {
    const game = this.active;
    this.active = null;
    this.launchToken += 1;
    if (!game) return;
    for (const method of ['clearPending', 'stop', 'stopSong', 'cleanupListeners']) {
      try { game[method]?.(); } catch {}
    }
    this.app.audio.stop();
  }

  launchGame(gameId, ageId) {
    this.stopActive();
    if (this.app.screenTime?.isOverLimit()) return this.app.renderRest();
    const activity = activityCatalog.find((item) => item.id === gameId);
    if (!activity || !this.app.gameRegistry.has(gameId)) {
      console.warn('[experience] atividade indisponível', gameId);
      this.app.renderHome();
      return null;
    }
    if (ageId && !isAgeCompatible(activity, ageId)) {
      console.warn('[experience] faixa etária incompatível', { gameId, ageId, allowed: activity.ages });
      this.app.renderHome();
      return null;
    }
    this.app.container.scrollTop = 0;
    this.app.core.session.ensure(ageId, this.app.currentWorld);
    applyChildInterfacePolicy(this.app.container, ageId);
    this.app.core.learning.remember(gameId);
    const playMode = this.app.gameRegistry.mode(gameId);
    const startedAt = Date.now();
    const token = ++this.launchToken;
    let finished = false;
    const onWin = (result = {}) => {
      // Ignora conclusões atrasadas de um jogo que a criança já deixou.
      if (finished || token !== this.launchToken) return;
      finished = true;
      const sessionResult = this.app.core.session.complete(gameId, { ...result, mode: result.mode || playMode, durationMs: Number(result.durationMs || Date.now() - startedAt) });
      this.active = null;
      if (sessionResult.completed) {
        this.app.evaluateRewards(gameId);
        this.app.updateScoreUI();
        this.app.renderSessionResult(sessionResult);
      } else {
        this.app.renderWorld(this.app.currentWorld);
      }
    };
    const onBack = () => (this.stopActive(), this.app.currentWorld ? this.app.renderWorld(this.app.currentWorld) : this.app.renderHome());
    const content = getContentReadiness(gameId);
    const adaptive = activity ? this.app.core.learning.getDifficulty(activity, ageId) : { level: 1, age: getAgeExperienceConfig(ageId, 1) };
    if (activity?.audio) this.app.audio.preload([activity.audio]);
    try {
      const result = this.app.gameRegistry.launch(gameId, { adaptive, ageId, onWin, onBack, content, title: activity.title });
      if (result?.guided) return this.app.renderGuidedExperience(gameId, onWin, onBack, adaptive.age);
      this.active = result || null;
      return result;
    } catch (error) {
      console.error('[game-registry] Falha ao iniciar atividade', gameId, error);
      this.app.container.innerHTML = `
        <div class="w-full max-w-xl bg-white/95 rounded-[2rem] p-8 shadow-xl text-center my-auto">
          <div class="text-6xl mb-3">🧩</div>
          <h2 class="text-2xl font-black text-indigo-700">Essa brincadeira ainda está sendo preparada.</h2>
          <p class="text-slate-600 mt-2 mb-6">Vamos escolher outra descoberta enquanto ela fica pronta.</p>
          <button id="game-registry-back" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl touch-target">Voltar</button>
        </div>`;
      this.app.container.querySelector('#game-registry-back')?.addEventListener('click', onBack);
      return null;
    }
  }

}
