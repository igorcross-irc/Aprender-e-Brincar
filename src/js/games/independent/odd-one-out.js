import { playSfx } from '../../engine/sfx.js';
import { resolveGameDifficulty, getGameChoiceCount } from '../../../core/game-difficulty-policy.js';

// Mostra vários objetos iguais e um diferente: a criança toca no que não combina.
export class OddOneOutGame {
  constructor(containerId, audio, onComplete, onBack) { this.container=document.getElementById(containerId); this.audio=audio; this.onComplete=onComplete; this.onBack=onBack; this.level=1; this.round=0; this.correct=0; this.attempts=0; this.finished=false; }
  start(items=[], level=1, options={}) {
    this.items=Array.isArray(items)?items:[]; this.ageId=options.ageId||'2-3y'; this.difficulty=resolveGameDifficulty(this.ageId,level,options); this.level=this.difficulty.level; this.round=0; this.correct=0; this.attempts=0; this.finished=false; this.render();
  }
  shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];} return r; }
  render(){
    if(this.round>=this.difficulty.rounds) return this.finish();
    const [same,odd]=this.shuffle(this.items);
    if(!same||!odd) return this.finish();
    const total=Math.max(3,getGameChoiceCount(this.difficulty,3,1,5));
    const options=this.shuffle([...Array.from({length:total-1},()=>({item:same,odd:false})),{item:odd,odd:true}]);
    this.container.innerHTML=`
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
        <div class="flex justify-between items-center"><button id="odd-back" class="game-back" aria-label="Voltar">⬅️</button><div class="bg-white/90 px-4 py-2 rounded-full font-black text-indigo-700">🔎 Diferente • ${this.round+1}/${this.difficulty.rounds}</div></div>
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><p class="text-xl font-black text-indigo-700">Qual é diferente?</p><p class="text-sm text-slate-500 mt-1">Observe com calma e escolha um.</p>
          <div class="grid grid-cols-2 ${options.length<=3?'md:grid-cols-3':'md:grid-cols-4'} gap-4 mt-5">${options.map((x,i)=>`<button data-index="${i}" aria-label="${x.item.label||'Objeto'}" class="odd-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[150px] shadow-lg touch-target"><span class="text-6xl block">${x.item.icon||'✨'}</span></button>`).join('')}</div>
        </div>
      </div>`;
    this.container.querySelector('#odd-back').onclick=()=>this.onBack();
    this.container.querySelectorAll('.odd-option').forEach(btn=>btn.onclick=()=>this.answer(btn,options[Number(btn.dataset.index)]?.odd===true));
    this.audio?.prompt?.(null,'Qual é diferente?');
  }
  answer(btn,correct){
    if(this.finished)return; this.attempts++;
    if(correct){playSfx('success');this.correct++;btn.classList.add('border-emerald-400','bg-emerald-50');this.audio?.play(null,'Isso mesmo!');this.round++;setTimeout(()=>this.render(),450);}
    else {playSfx('retry');btn.classList.add('border-rose-300','animate-shake');this.audio?.play(null,'Ops, tente de novo!');setTimeout(()=>btn.classList.remove('border-rose-300','animate-shake'),450);}
  }
  finish(){
    if(this.finished)return;
    this.finished=true; const max=this.difficulty.rounds; const score=Math.min(max,this.correct);
    this.onComplete?.({score,rounds:max,correct:this.correct,attempts:this.attempts,maxScore:max,completedRounds:this.correct,difficulty:this.level,ageId:this.ageId});
  }
}
