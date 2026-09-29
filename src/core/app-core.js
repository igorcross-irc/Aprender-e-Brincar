import { ActivityRegistry } from './activity-registry.js';
import { ProgressStore } from './progress-store.js';
import { LearningEngine } from './learning-engine.js';

export class AppCore {
  constructor(audio, storage) {
    this.audio = audio;
    this.storage = storage;
    this.progress = new ProgressStore();
    this.activities = new ActivityRegistry();
    this.learning = new LearningEngine(this.progress);
  }
  complete(activityId, options = {}) {
    const progress = this.progress.complete(activityId, options);
    if (options.reward !== false) {
      this.progress.addStar();
      this.storage?.syncStars?.(this.progress.getStars());
    }
    return progress;
  }
  stars() { return this.progress.getStars(); }
  resetProgress() { this.progress.reset(); this.storage?.resetStars?.(); }
}
