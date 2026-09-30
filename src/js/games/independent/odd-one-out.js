import { resolveGameDifficulty, getGameChoiceCount } from '../../../core/game-difficulty-policy.js';
export class OddOneOutGame {
  constructor(containerId, audio, onComplete, onBack) { this.container=document.getElementById(containerId); this.audio=audio; this.onComplete=onComplete; this.onBack=onBack; this.level=1; this.round=0; this.correct=0; this.attempts=0; this.finished=false; }
  start(items=[], level=1, options={}) {
    this.items=items; this.level=Math.max(1,Math.min(5,Number(level)||1)); this.round=0; this.correct=0; this.attempts=0; this.finished=false; this.render();
  }
  shuffle(a){ return [...a].sort(()=>Math.random()-0.5); }
  render(){
    if(this.round>=this.difficulty.rounds) return this.finish();
    const poolSize=Math.min(this.items.length, getGameChoiceCount(this.difficulty,2,1,5));
    const base=this.shuffle(this.items).slice(0,poolSize-1);
    const candidates=this.items.filter(x=>!base.some(b=>b.id===x.id));
    const odd=this.shuffle(candidates)[0]||base[0];
    const options=this.shuffle([...base,odd]);
    this.current=odd;
    this.container.innerHTML=`
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
        <div class="flex justify-between items-center"><button id="odd-back" class="bg-white/95 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button><div class="bg-white/90 px-4 py-2 rounded-full font-black text-indigo-700">🔎 Diferente • ${this.round+1}/${this.difficulty.rounds}</div></div>
        <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><p class="text-xl font-black text-indigo-700">Qual é diferente?</p><p class="text-sm text-slate-500 mt-1">Observe com calma e escolha um.</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">${options.map(x=>`<button data-id="${x.id}" class="odd-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[150px] shadow-lg touch-target"><span class="text-6xl block">${x.icon||'✨'}</span><span class="font-black text-indigo-800">${x.label||''}</span></button>`).join('')}</div>
        </div>
      </div>`;
    this.container.querySelector('#odd-back').onclick=()=>this.onBack();
    this.container.querySelectorAll('.odd-option').forEach(btn=>btn.onclick=()=>this.answer(btn,btn.dataset.id===String(this.current.id)));
  }
  answer(btn,correct){
    if(this.finished)return; this.attempts++;
    if(correct){this.correct++;btn.classList.add('border-emerald-400','bg-emerald-50');this.audio?.play(null,'Muito bem! Você encontrou o diferente.');this.round++;setTimeout(()=>this.render(),450);}
    else {btn.classList.add('border-rose-300','animate-shake');this.audio?.play(null,'Observe mais uma vez.');setTimeout(()=>btn.classList.remove('border-rose-300','animate-shake'),450);}
  }
  finish(){
    this.finished=true; const max=5; const score=Math.min(max,this.correct);
    this.onComplete?.({score,rounds:max,correct:this.correct,attempts:this.attempts,maxScore:max,completedRounds:this.correct,difficulty:this.level,ageId:this.ageId});
  }
}