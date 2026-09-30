import { resolveGameDifficulty, getGameChoiceCount } from '../../../core/game-difficulty-policy.js';
export class NumberOrderGame {
  constructor(containerId,audio,onComplete,onBack){this.container=document.getElementById(containerId);this.audio=audio;this.onComplete=onComplete;this.onBack=onBack;}
  start(level=1, options={}){this.ageId=options.ageId||'2-3y';this.difficulty=resolveGameDifficulty(this.ageId,level,options);this.level=this.difficulty.level;this.round=0;this.correct=0;this.attempts=0;this.finished=false;this.render();}
  shuffle(a){return [...a].sort(()=>Math.random()-0.5);}
  render(){
    if(this.round>=this.difficulty.rounds)return this.finish();
    const count=getGameChoiceCount(this.difficulty,3,1,5); const start=Math.floor(Math.random()*4)+1; const answer=start+count;
    const sequence=Array.from({length:count-1},(_,i)=>start+i); const options=this.shuffle([answer,answer+1,Math.max(1,answer-1),answer+2]);
    this.answerValue=answer;
    this.container.innerHTML=`
      <div class="w-full max-w-2xl flex flex-col gap-4 my-auto">
      <div class="flex justify-between items-center"><button id="num-back" class="bg-white/95 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button><div class="bg-white/90 px-4 py-2 rounded-full font-black text-indigo-700">🔢 Números • ${this.round+1}/${this.difficulty.rounds}</div></div>
      <div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center"><p class="text-xl font-black text-indigo-700">Qual número vem depois?</p><div class="flex justify-center gap-3 flex-wrap my-7">${sequence.map(n=>`<span class="w-16 h-16 rounded-2xl bg-sky-50 border-4 border-sky-100 flex items-center justify-center text-3xl font-black text-sky-700">${n}</span>`).join('')}<span class="w-16 h-16 rounded-2xl bg-amber-50 border-4 border-dashed border-amber-300 flex items-center justify-center text-3xl font-black">?</span></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">${options.map(n=>`<button data-number="${n}" class="num-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${n}</button>`).join('')}</div></div></div>`;
    this.container.querySelector('#num-back').onclick=()=>this.onBack();
    this.container.querySelectorAll('.num-option').forEach(btn=>btn.onclick=()=>this.answer(btn,Number(btn.dataset.number)===this.answerValue));
  }
  answer(btn,correct){this.attempts++;if(correct){this.correct++;btn.classList.add('border-emerald-400','bg-emerald-50');this.audio?.play(null,'Muito bem!');this.round++;setTimeout(()=>this.render(),450);}else{btn.classList.add('border-rose-300','animate-shake');this.audio?.play(null,'Vamos observar a sequência.');setTimeout(()=>btn.classList.remove('border-rose-300','animate-shake'),450);}}
  finish(){this.finished=true;this.onComplete?.({score:this.correct,rounds:this.difficulty.rounds,correct:this.correct,attempts:this.attempts,maxScore:this.difficulty.rounds,completedRounds:this.correct,difficulty:this.level,ageId:this.ageId});}
}