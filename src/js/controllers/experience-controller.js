import { activityCatalog } from '../../content/activity-catalog.js';
import { getContentReadiness } from '../../core/content-readiness.js';
import { getAgeExperienceConfig } from '../../core/age-experience-policy.js';

export class ExperienceController {
  constructor(app) { this.app = app; }

  launchGame(gameId, ageId) {
    this.core.session.ensure(ageId, this.currentWorld);
    this.core.learning.remember(gameId);
    const playMode = this.gameRegistry.mode(gameId);
    let finished = false;
    const onWin = (result = {}) => {
      if (finished) return;
      finished = true;
      const sessionResult = this.core.session.complete(gameId, { ...result, mode: result.mode || playMode });
      if (sessionResult.completed) {
        this.evaluateRewards(gameId);
        this.updateScoreUI();
        this.renderSessionResult(sessionResult);
      }
    };
    const onBack = () => this.renderWorld(this.currentWorld);
    const activity = activityCatalog.find((item) => item.id === gameId);
    const content = getContentReadiness(gameId);
    const adaptive = activity ? this.core.learning.getDifficulty(activity, ageId) : { level: 1, age: getAgeExperienceConfig(ageId, 1) };
    if (activity?.audio) this.audio.preload([activity.audio]);
    try {
      const result = this.gameRegistry.launch(gameId, { adaptive, ageId, onWin, onBack, content });
      if (result?.guided) return this.renderGuidedExperience(gameId, onWin, onBack, adaptive.age);
      return result;
    } catch (error) {
      console.error('[game-registry] Falha ao iniciar atividade', gameId, error);
      this.container.innerHTML = `
        <div class="w-full max-w-xl bg-white/95 rounded-[2rem] p-8 shadow-xl text-center my-auto">
          <div class="text-6xl mb-3">🧩</div>
          <h2 class="text-2xl font-black text-indigo-700">Essa brincadeira ainda está sendo preparada.</h2>
          <p class="text-slate-600 mt-2 mb-6">Vamos escolher outra descoberta enquanto ela fica pronta.</p>
          <button id="game-registry-back" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl touch-target">Voltar</button>
        </div>`;
      this.container.querySelector('#game-registry-back')?.addEventListener('click', onBack);
      return null;
    }
  }

}
