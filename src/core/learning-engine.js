import { activityCatalog } from '../content/activity-catalog.js';

export class LearningEngine {
  constructor(progressStore){this.progress=progressStore;}
  getProfile(){
    const s=this.progress.snapshot(), entries=Object.entries(s.activities||{});
    const weak=entries.map(([id,p])=>({id,p,a:activityCatalog.find(x=>x.id===id)})).filter(x=>x.a)
      .sort((a,b)=>Number(a.p.mastery||0)-Number(b.p.mastery||0));
    return {snapshot:s,weak};
  }
  getDifficulty(activity){
    const p=this.progress.getActivity(activity.id)||{}, mastery=Number(p.mastery||0), base=Number(activity.difficulty||1);
    let level=Math.max(1,Math.min(5,base+Math.floor(mastery/2)));
    if(Number(p.lastScore||0)<=1 && p.attempts) level=Math.max(1,level-1);
    if(Number(p.lastScore||0)>=4) level=Math.min(5,level+1);
    return {level,label:['','Descoberta','Explorar','Desafio','Avançado','Especialista'][level]};
  }
  recommend(ageId,worldId,limit=3){
    const s=this.progress.snapshot();
    return activityCatalog.filter(a=>a.ages?.includes(ageId)&&(!worldId||a.world===worldId)).map(activity=>{
      const p=s.activities?.[activity.id], mastery=Number(p?.mastery||0);
      const days=p?.lastPlayedAt?(Date.now()-new Date(p.lastPlayedAt).getTime())/86400000:999;
      const score=(p?20:45)+Math.min(days,30)+(5-mastery)*8-Number(p?.completions||0)*2;
      return {activity,score,reason:!p?'Nova descoberta':mastery<3?'Vale praticar novamente':'Boa hora para variar'};
    }).sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  labelDomain(d){return d;}
}