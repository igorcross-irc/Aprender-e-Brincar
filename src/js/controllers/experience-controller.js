import { activityCatalog } from '../../content/activity-catalog.js';
import { getContentReadiness } from '../../core/content-readiness.js';
import { getAgeExperienceConfig, isAgeCompatible } from '../../core/age-experience-policy.js';

export class ExperienceController {
  constructor(app) { this.app = app; }

  launchGame(gameId, ageId) {
    const activity = activityCatalog.find((item) => item.id === gameId);
    if (!activity || !this.app.gameRegistry.has(gameId)) {
      console.warn('[experience] atividade indisponível', gameId);
      this.app.renderAgeSelection();
      return null;
    }
    if (ageId && !isAgeCompatible(activity, ageId)) {
      console.warn('[experience] faixa etária incompatível', { gameId, ageId, allowed: activity.ages });
      this.app.renderWorldMap(ageId);
      return null;
    }
    this.app.core.session.ensure(ageId, this.app.currentWorld);
    this.app.core.learning.remember(gameId);
    const playMode = this.app.gameRegistry.mode(gameId);
    let finished = false;
    const onWin = (result = {}) => {
      if (finished) return;
      finished = true;
      const sessionResult = this.app.core.session.complete(gameId, { ...result, mode: result.mode || playMode, durationMs: Number(result.durationMs || 0) });
      if (sessionResult.completed) {
        this.app.evaluateRewards(gameId);
        this.app.updateScoreUI();
        this.app.renderSessionResult(sessionResult);
      }
    };
    const onBack = () => this.app.renderWorld(this.app.currentWorld);
    const content = getContentReadiness(gameId);
    const adaptive = activity ? this.app.core.learning.getDifficulty(activity, ageId) : { level: 1, age: getAgeExperienceConfig(ageId, 1) };
    if (activity?.audio) this.app.audio.preload([activity.audio]);
    try {
      const result = this.app.gameRegistry.launch(gameId, { adaptive, ageId, onWin, onBack, content });
      if (result?.guided) return this.app.renderGuidedExperience(gameId, onWin, onBack, adaptive.age);
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
