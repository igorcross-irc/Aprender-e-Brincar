export const CHILD_INTERFACE_POLICY = {
  '6-12m': { voiceFirst: true, showLabels: false, instructionMode: 'voice', maxChoices: 2, visualScale: 'large' },
  '12-18m': { voiceFirst: true, showLabels: false, instructionMode: 'voice', maxChoices: 3, visualScale: 'large' },
  '18-24m': { voiceFirst: true, showLabels: false, instructionMode: 'voice', maxChoices: 3, visualScale: 'large' },
  '2-3y': { voiceFirst: true, showLabels: true, instructionMode: 'voice-supported', maxChoices: 4, visualScale: 'large' },
  '3-4y': { voiceFirst: false, showLabels: true, instructionMode: 'mixed', maxChoices: 4, visualScale: 'medium' },
  '4-5y': { voiceFirst: false, showLabels: true, instructionMode: 'mixed', maxChoices: 5, visualScale: 'medium' }
};

export function getChildInterfacePolicy(ageId = '2-3y') {
  return CHILD_INTERFACE_POLICY[ageId] || CHILD_INTERFACE_POLICY['2-3y'];
}

function ensureChildInterfaceStyles() {
  if (document.getElementById('child-interface-policy-style')) return;
  const style = document.createElement('style');
  style.id = 'child-interface-policy-style';
  style.textContent = `
    #game-container.voice-first .child-instruction { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    #game-container.voice-first .child-label { display:none; }
    #game-container.voice-first .child-control { min-height:56px; }
    #game-container.voice-first .child-visual { transform:scale(1.08); }
    #game-container.voice-first .child-visual-label { display:none; }
    .child-visual img { width:82%; height:82%; object-fit:contain; user-select:none; pointer-events:none; }
    .child-visual { display:inline-flex; align-items:center; justify-content:center; width:4.5rem; height:4.5rem; border-radius:1.5rem; line-height:1; }
    .child-visual-small { width:3.5rem; height:3.5rem; border-radius:1rem; }
    .child-visual-medium { width:4rem; height:4rem; border-radius:1.25rem; }
    .child-visual-large { width:5.5rem; height:5.5rem; border-radius:1.5rem; }
    .child-visual-sky { background:linear-gradient(145deg,#e0f2fe,#bae6fd); }
    .child-visual-rose,.child-visual-pink { background:linear-gradient(145deg,#fce7f3,#fbcfe8); }
    .child-visual-amber,.child-visual-yellow,.child-visual-peach { background:linear-gradient(145deg,#fef3c7,#fde68a); }
    .child-visual-indigo,.child-visual-violet { background:linear-gradient(145deg,#ede9fe,#ddd6fe); }
    .child-visual-emerald,.child-visual-green { background:linear-gradient(145deg,#d1fae5,#a7f3d0); }
    #game-container.voice-first .learning-option .child-visual { width:5.5rem; height:5.5rem; }
    #game-container.voice-supported .child-instruction { max-width:38rem; margin-left:auto; margin-right:auto; }
    #game-container.voice-supported .child-instruction::before { content:'🔊 '; }
    .child-feedback-overlay { position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center; z-index:30; animation:child-feedback-fade .65s ease-out both; }
    .child-feedback-bubble { width:7rem; height:7rem; display:flex; align-items:center; justify-content:center; border-radius:999px; font-size:4rem; background:rgba(255,255,255,.94); box-shadow:0 12px 35px rgba(15,23,42,.16); }
    .child-feedback-success { animation:child-feedback-pop .65s ease-out both; }
    .child-feedback-retry { animation:child-feedback-pop .5s ease-out both; }
    @keyframes child-feedback-pop { 0%{transform:scale(.65);opacity:0} 55%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    @keyframes child-feedback-fade { 0%{opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{opacity:0} }
    @media (prefers-reduced-motion: reduce) { .child-feedback-overlay, .child-feedback-bubble { animation:none !important; } }
  `;
  document.head.appendChild(style);
}

export function applyChildInterfacePolicy(container, ageId) {
  ensureChildInterfaceStyles();
  if (!container) return getChildInterfacePolicy(ageId);
  const policy = getChildInterfacePolicy(ageId);
  container.dataset.childAge = ageId || '2-3y';
  container.dataset.childMaxChoices = String(policy.maxChoices || 4);
  container.dataset.childVisualScale = policy.visualScale || 'medium';
  container.classList.toggle('voice-first', policy.voiceFirst);
  container.classList.toggle('voice-supported', policy.instructionMode === 'voice-supported');
  container.classList.toggle('show-child-labels', policy.showLabels);
  return policy;
}
