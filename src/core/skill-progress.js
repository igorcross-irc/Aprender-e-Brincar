export class SkillProgress {
  constructor(progress){this.progress=progress;}
  get(){
    const s=this.progress.snapshot(), map={};
    for(const [id,p] of Object.entries(s.activities||{})){
      const mastery=Number(p.mastery||0), a=p.activity || {};
      for(const domain of (a.developmentDomains||[])) map[domain]=Math.max(map[domain]||0,mastery);
    }
    return map;
  }
}