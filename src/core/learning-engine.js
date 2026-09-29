import { activityCatalog } from '../content/activity-catalog.js';

export class LearningEngine {
  constructor(progressStore){this.progress=progressStore; this.historyKey='learning_recent_v1'; this.skills=null;}
  setSkillProgress(skillProgress){this.skills=skillProgress; return this;}
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
  recentIds(limit=6){ try{return JSON.parse(localStorage.getItem(this.historyKey)||'[]').slice(0,limit);}catch{return [];} }
  remember(activityId){ try{const ids=this.recentIds(12).filter(id=>id!==activityId); localStorage.setItem(this.historyKey,JSON.stringify([activityId,...ids].slice(0,12)));}catch{} }
  recommend(ageId,worldId,limit=3){
    const s=this.progress.snapshot(), recentIds=this.recentIds(5);
    const weakSkills=new Set((this.skills?.weakest?.(5)||[]).map(([skill])=>skill));
    return activityCatalog.filter(a=>a.ages?.includes(ageId)&&(!worldId||a.world===worldId)).map(activity=>{
      const p=s.activities?.[activity.id], mastery=Number(p?.mastery||0);
      const days=p?.lastPlayedAt?(Date.now()-new Date(p.lastPlayedAt).getTime())/86400000:999;
      const skillBoost=(activity.skills||[]).some(skill=>weakSkills.has(skill))?18:0;
      const score=(p?20:45)+Math.min(days,30)+(5-mastery)*8+skillBoost-Number(p?.completions||0)*2-(recentIds.includes(activity.id)?35:0);
      return {activity,score,reason:!p?'Nova descoberta':mastery<3?'Vale praticar novamente':'Boa hora para variar'};
    }).sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  getOutcome(activityId){
    const p=this.progress.getActivity(activityId)||{};
    const accuracy=p.accuracy==null?null:Number(p.accuracy);
    if (accuracy==null) return {type:'explore',label:'Exploração',message:'Vamos conhecer mais antes de aumentar o desafio.'};
    if (accuracy>=85) return {type:'advance',label:'Avançando',message:'Já está dominando este desafio. Podemos experimentar algo um pouco mais difícil.'};
    if (accuracy>=60) return {type:'practice',label:'Praticar',message:'Está no caminho. Repetir ou variar ajuda a consolidar.'};
    return {type:'support',label:'Reforçar',message:'Vamos voltar a uma proposta mais simples e tentar novamente.'};
  }
  labelDomain(d){return d;}
}