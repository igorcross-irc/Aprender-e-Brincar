import { activityCatalog } from '../content/activity-catalog.js';

const DOMAIN_LABELS = {
  linguagem:'Linguagem', cognição:'Cognição', atenção:'Atenção', audição:'Audição',
  visão:'Percepção visual', comunicação:'Comunicação', 'pré-alfabetização':'Pré-alfabetização',
  'matemática inicial':'Matemática inicial', 'funções executivas':'Funções executivas',
  'motricidade fina':'Motricidade fina', 'motricidade ampla':'Motricidade ampla',
  criatividade:'Criatividade', fala:'Fala'
};

export class LearningEngine {
  constructor(progressStore) { this.progress = progressStore; }

  getProfile() {
    const snapshot = this.progress.snapshot();
    const activities = snapshot.activities || {};
    const entries = Object.entries(activities);
    const recent = entries
      .filter(([,p]) => p.lastPlayedAt)
      .sort((a,b) => new Date(b[1].lastPlayedAt) - new Date(a[1].lastPlayedAt))
      .slice(0, 8);
    const weak = entries
      .map(([id,p]) => ({ id, p, activity: activityCatalog.find(a=>a.id===id) }))
      .filter(x => x.activity)
      .map(x => ({...x, mastery: Number(x.p.mastery || 0)}))
      .sort((a,b) => a.mastery - b.mastery);
    const domains = {};
    entries.forEach(([id,p]) => {
      if (!p.explored) return;
      const activity = activityCatalog.find(a=>a.id===id);
      (activity?.developmentDomains || []).forEach(d => { domains[d]=(domains[d]||0)+(p.completions||0); });
    });
    return { snapshot, recent, weak, domains };
  }

  getDifficulty(activity, ageId) {
    const p = this.progress.getActivity(activity.id);
    const base = Number(activity.difficulty || 1);
    const mastery = Number(p?.mastery || 0);
    let level = Math.max(1, Math.min(5, base + Math.floor(mastery / 2)));
    if (p?.lastScore != null && p.lastScore <= 1) level = Math.max(1, level - 1);
    if (p?.lastScore >= 4) level = Math.min(5, level + 1);
    return { level, label: level <= 1 ? 'Descoberta' : level === 2 ? 'Explorar' : level === 3 ? 'Desafio' : level === 4 ? 'Avançado' : 'Especialista' };
  }

  recommend(ageId, worldId, limit=3) {
    const candidates = activityCatalog.filter(a => a.ages?.includes(ageId) && (!worldId || a.world===worldId));
    const snapshot = this.progress.snapshot();
    return candidates.map(activity => {
      const p = snapshot.activities?.[activity.id];
      const mastery = Number(p?.mastery || 0);
      const completions = Number(p?.completions || 0);
      const recent = p?.lastPlayedAt ? (Date.now()-new Date(p.lastPlayedAt).getTime())/86400000 : 999;
      const score = (p ? 20 : 45) + Math.min(recent,30) + (5-mastery)*8 + (activity.difficulty===1 ? 5 : 0) - completions*2;
      return { activity, score, reason: !p ? 'Nova descoberta' : mastery < 3 ? 'Vale praticar novamente' : 'Boa hora para variar' };
    }).sort((a,b)=>b.score-a.score).slice(0,limit);
  }

  labelDomain(domain) { return DOMAIN_LABELS[domain] || domain; }
}
