import { resolveGameDifficulty, getGameChoiceCount } from '../../core/game-difficulty-policy.js';

export class MemoryGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId); this.audio = audioEngine; this.onComplete = onComplete; this.onBack = onBack;
    this.items = []; this.level = 1; this.ageId = '2-3y'; this.flippedCards = []; this.matchedPairs = 0; this.moves = 0; this.finished = false;
  }
  shuffle(array) { for (let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];} return array; }
  start(items, level=1, options={}) {
    this.items=items; this.ageId=options.ageId||'2-3y'; this.level=Number(level)||1;
    this.difficulty=resolveGameDifficulty(this.ageId,this.level,options); this.level=this.difficulty.level;
    this.matchedPairs=0; this.flippedCards=[]; this.moves=0; this.finished=false;
    const pairCount=Math.min(items.length,getGameChoiceCount(this.difficulty,2,1,5));
    const selected=this.shuffle([...items]).slice(0,pairCount); const deck=this.shuffle([...selected,...selected]);
    this.container.innerHTML=`
      <div class="w-full max-w-3xl flex flex-col items-center gap-4 my-auto">
        <div class="w-full flex justify-between items-center gap-2"><button id="btn-back-memory" class="bg-white/95 text-slate-700 px-5 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
        <div class="text-right"><h2 class="text-2xl font-black text-indigo-700">🧠 Memória</h2><p class="text-xs text-slate-500">Nível ${this.level} • ${pairCount} pares</p></div></div>
        <div class="w-full flex justify-center gap-2 text-xs font-black text-indigo-700"><span class="bg-white/90 px-3 py-2 rounded-full shadow">Pares: <b id="memory-pairs">0</b>/${pairCount}</span><span class="bg-white/90 px-3 py-2 rounded-full shadow">Jogadas: <b id="memory-moves">0</b></span></div>
        <div class="memory-grid level-${this.level} gap-3 w-full">${deck.map((item,idx)=>`<button data-id="${item.id}" data-idx="${idx}" aria-label="Carta da memória" class="memory-card bg-white rounded-3xl p-3 min-h-[105px] md:min-h-[125px] flex items-center justify-center text-5xl shadow-md border-4 border-slate-200 touch-target"><span class="card-back">❓</span><span class="card-front hidden">${item.icon}</span></button>`).join('')}</div>
      </div>`;
    document.getElementById('btn-back-memory').addEventListener('click',()=>this.onBack());
    this.container.querySelectorAll('.memory-card').forEach(card=>card.addEventListener('click',()=>{const item=items.find(i=>i.id===card.dataset.id);this.flipCard(card,item,pairCount);}));
    this.audio.prompt(null,this.difficulty.audioFirst?'Vamos encontrar os pares!':'Encontre os pares iguais.');
  }
  flipCard(card,item,totalPairs){
    if(!item||this.flippedCards.length===2||card.classList.contains('flipped')||card.classList.contains('matched')||this.finished)return;
    card.classList.add('flipped'); card.querySelector('.card-back').classList.add('hidden'); card.querySelector('.card-front').classList.remove('hidden'); this.audio.play(item.audio,item.label); this.flippedCards.push({card,item});
    if(this.flippedCards.length===2){this.moves++; const movesEl=document.getElementById('memory-moves'); if(movesEl)movesEl.textContent=this.moves;
      const [first,second]=this.flippedCards;
      if(first.item.id===second.item.id){this.matchedPairs++; first.card.classList.add('matched','border-emerald-400','bg-emerald-50'); second.card.classList.add('matched','border-emerald-400','bg-emerald-50'); this.flippedCards=[]; const pairsEl=document.getElementById('memory-pairs'); if(pairsEl)pairsEl.textContent=this.matchedPairs; if(this.matchedPairs===totalPairs)setTimeout(()=>this.finish(),700);}
      else{this.audio.play(null,this.difficulty.feedback==='gentle'?'Vamos tentar de novo!':'Vamos comparar as duas cartas e tentar de novo!'); setTimeout(()=>{if(this.finished)return;[first.card,second.card].forEach(c=>{c.classList.remove('flipped');c.querySelector('.card-back').classList.remove('hidden');c.querySelector('.card-front').classList.add('hidden');});this.flippedCards=[];},this.level>=4?750:1000);}
    }
  }
  finish(){if(this.finished)return;this.finished=true;const rounds=Math.max(1,this.matchedPairs);const score=Math.max(0,Math.min(rounds,Math.round((rounds/Math.max(rounds,this.moves))*rounds)));this.audio.play(null,'Parabéns! Você encontrou todos os pares!');this.onComplete?.({score,rounds,correct:this.matchedPairs,attempts:this.moves,maxScore:rounds,completedRounds:this.matchedPairs,difficulty:this.level,ageId:this.ageId});}
}