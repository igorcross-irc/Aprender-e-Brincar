export const AGE_BANDS = Object.freeze([
  { id: '6-12m', label: '6 a 12 meses', minMonths: 6, maxMonths: 12 },
  { id: '12-18m', label: '12 a 18 meses', minMonths: 12, maxMonths: 18 },
  { id: '18-24m', label: '18 a 24 meses', minMonths: 18, maxMonths: 24 },
  { id: '2-3y', label: '2 a 3 anos', minMonths: 24, maxMonths: 36 },
  { id: '3-4y', label: '3 a 4 anos', minMonths: 36, maxMonths: 48 },
  { id: '4-5y', label: '4 a 5 anos', minMonths: 48, maxMonths: 60 }
]);

export class ActivityRegistry {
  constructor() { this.activities = new Map(); }
  register(activity) {
    if (!activity?.id || !activity?.title || !activity?.type) throw new Error('Atividade inválida');
    this.activities.set(activity.id, Object.freeze({ ...activity }));
    return this.activities.get(activity.id);
  }
  registerMany(list = []) { list.forEach((item) => this.register(item)); return this; }
  get(id) { return this.activities.get(id) || null; }
  all() { return [...this.activities.values()]; }
  forAge(ageBand) { return this.all().filter((item) => item.ages?.includes(ageBand)); }
}
