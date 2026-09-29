import { activityCatalog } from '../content/activity-catalog.js';

export class SkillProgress {
  constructor(progress){this.progress=progress;}
  get(){
    const s=this.progress.snapshot(), map={};
    for(const [id,p] of Object.entries(s.activities||{})){
      const activity=activityCatalog.find(a=>a.id===id);
      if(!activity) continue;
      const mastery=Number(p.mastery||0);
      const weight=Math.max(1,Number(p.attempts||0));
      for(const skill of [...(activity.skills||[]),...(activity.developmentDomains||[])]) {
        if(!map[skill]) map[skill]={mastery:0,activities:0,completions:0,attempts:0,weightedMastery:0};
        map[skill].activities+=1;
        map[skill].completions+=Number(p.completions||0);
        map[skill].attempts+=weight;
        map[skill].weightedMastery+=mastery*weight;
      }
    }
    for(const value of Object.values(map)) {
      value.mastery=Math.round((value.weightedMastery/Math.max(1,value.attempts))*10)/10;
      delete value.weightedMastery;
    }
    return map;
  }
  weakest(limit=4){return Object.entries(this.get()).sort((a,b)=>a[1].mastery-b[1].mastery).slice(0,limit);}
}
