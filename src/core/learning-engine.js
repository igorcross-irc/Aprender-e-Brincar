import { activityCatalog } from '../content/activity-catalog.js';

export class LearningEngine {
  constructor(progressStore){this.progress=progressStore; this.historyKey='learning_recent_v1'; this.skills=null;}
  setSkillProgress(skillProgress){this.skills=skillProgress; return this;}
  getDifficulty(activity){
    const p=this.progress.getActivity(activity.id)||{}, mastery=Number(p.mastery||0), base=Number(activity.difficulty||1);
    let level=Math.max(1,Math.min(5,base+Math.floor(mastery/2)));
    const accuracy=p.accuracy==null?null:Number(p.accuracy);
    const recentAccuracy=p.recentAccuracy==null?accuracy:Number(p.recentAccuracy);
    if(recentAccuracy!=null && recentAccuracy<50) level=Math.max(1,level-1);
    if(recentAccuracy!=null && recentAccuracy>=85) level=Math.min(5,level+1);
    const recent= p.lastPlayedAt ? (Date.now()-new Date(p.lastPlayedAt).getTime())/86400000 : 999;
    const stale = recent > 21 && Number(p.evaluationCount||0) > 0;
    if(stale && recentAccuracy!=null && recentAccuracy<75) level=Math.max(1,level-1);
    return {level,label:['','Descoberta','Explorar','Desafio','Avançado','Especialista'][level],accuracy,recentAccuracy,mastery,stale};
  }
  recentIds(limit=6){ try{return JSON.parse(localStorage.getItem(this.historyKey)||'[]').filter(Boolean).slice(0,limit);}catch{return [];} }
  remember(activityId){ try{const ids=this.recentIds(12).filter(id=>id!==activityId); localStorage.setItem(this.historyKey,JSON.stringify([activityId,...ids].slice(0,12)));}catch{} }
  recommend(ageId,worldId,limit=3){
    const s=this.progress.snapshot(), recentIds=this.recentIds(5);
    const weakSkills=new Set((this.skills?.weakest?.(5)||[]).map(([skill])=>skill));
    return activityCatalog.filter(a=>a.ages?.includes(ageId)&&(!worldId||a.world===worldId)).map(activity=>{
      const p=s.activities?.[activity.id], mastery=Number(p?.mastery||0);
      const days=p?.lastPlayedAt?(Date.now()-new Date(p.lastPlayedAt).getTime())/86400000:999;
      const skillBoost=(activity.skills||[]).some(skill=>weakSkills.has(skill))?22:0;
      const accuracy=p?.accuracy==null?null:Number(p.accuracy);
      const recentAccuracy=p?.recentAccuracy==null?accuracy:Number(p.recentAccuracy);
      const performanceBoost=recentAccuracy!=null&&recentAccuracy<60?18:recentAccuracy!=null&&recentAccuracy>=85?-8:0;
      const recoveryBoost=recentAccuracy!=null&&accuracy!=null&&recentAccuracy>accuracy+10?8:0;
      const novelty=p?18:55;
      const score=novelty+Math.min(days,30)+(5-mastery)*9+skillBoost+performanceBoost+recoveryBoost-Number(p?.completions||0)*2-(recentIds.includes(activity.id)?35:0);
      const reason=!p?'Nova descoberta':recentAccuracy!=null&&recentAccuracy<60?'Vamos reforçar esta habilidade':recoveryBoost?'Você está evoluindo':'Boa hora para variar';
      return {activity,score,reason};
    }).sort((a,b)=>b.score-a.score).slice(0,limit);
  }
  getProfile(){
    const snapshot=this.progress.snapshot();
    const skills=this.skills?.get?.()||{};
    const ranked=Object.entries(skills).sort((a,b)=>b[1].mastery-a[1].mastery);
    const strengths=ranked.filter(([,v])=>v.activities>0).slice(0,3);
    const areas=ranked.filter(([,v])=>v.activities>0).sort((a,b)=>a[1].mastery-b[1].mastery).slice(0,3);
    const entries=Object.values(snapshot.activities||{});
    const evaluated=entries.filter(p=>Number(p.evaluationCount||0)>0);
    const exploration=entries.reduce((sum,p)=>sum+Number(p.explorationCount||0),0);
    const accuracy=evaluated.length?Math.round(evaluated.reduce((sum,p)=>sum+Number(p.recentAccuracy ?? p.accuracy ?? 0),0)/evaluated.length):null;
    const improving=evaluated.filter(p=>Array.isArray(p.accuracyHistory)&&p.accuracyHistory.length>=2&&Number(p.accuracyHistory.at(-1))>Number(p.accuracyHistory.at(-2))).length;
    return {strengths,areas,exploration,evaluated: evaluated.length,accuracy,improving,streak:Number(snapshot.sessions?.streak||0)};
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