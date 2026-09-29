import { activityCatalog } from '../content/activity-catalog.js';

export class SkillProgress {
  constructor(progress) { this.progress = progress; }

  get() {
    const snapshot = this.progress.snapshot();
    const map = {};
    for (const [id, p] of Object.entries(snapshot.activities || {})) {
      const activity = activityCatalog.find((item) => item.id === id);
      if (!activity) continue;
      const mastery = Number(p.mastery || 0);
      const evaluations = Number(p.evaluationCount || 0);
      const weight = Math.max(1, evaluations);
      const skills = [...new Set([...(activity.skills || []), ...(activity.developmentDomains || [])])];
      for (const skill of skills) {
        if (!map[skill]) map[skill] = { mastery: 0, activities: 0, completions: 0, attempts: 0, evaluations: 0, weightedMastery: 0 };
        map[skill].activities += 1;
        map[skill].completions += Number(p.completions || 0);
        map[skill].attempts += Number(p.attempts || 0);
        map[skill].evaluations += evaluations;
        map[skill].weightedMastery += mastery * weight;
      }
    }
    for (const value of Object.values(map)) {
      value.mastery = Math.round((value.weightedMastery / Math.max(1, value.evaluations)) * 10) / 10;
      delete value.weightedMastery;
    }
    return map;
  }

  weakest(limit = 4) {
    return Object.entries(this.get())
      .filter(([, value]) => value.evaluations > 0)
      .sort((a, b) => a[1].mastery - b[1].mastery)
      .slice(0, limit);
  }
}
