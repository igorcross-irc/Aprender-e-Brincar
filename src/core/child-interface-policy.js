export const CHILD_INTERFACE_POLICY = {
  '6-12m': { voiceFirst: true, showLabels: false, instructionMode: 'voice' },
  '12-18m': { voiceFirst: true, showLabels: false, instructionMode: 'voice' },
  '18-24m': { voiceFirst: true, showLabels: false, instructionMode: 'voice' },
  '2-3y': { voiceFirst: true, showLabels: true, instructionMode: 'voice-supported' },
  '3-4y': { voiceFirst: false, showLabels: true, instructionMode: 'mixed' },
  '4-5y': { voiceFirst: false, showLabels: true, instructionMode: 'mixed' }
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
    #game-container.voice-first .child-control { min-height:56px; }\n    #game-container.voice-first .child-visual { transform:scale(1.08); }\n    #game-container.voice-first .child-visual-label { display:none; }\n    .child-visual { display:inline-flex; align-items:center; justify-content:center; width:4.5rem; height:4.5rem; border-radius:1.5rem; line-height:1; }\n    .child-visual-small { width:3.5rem; height:3.5rem; border-radius:1rem; }\n    .child-visual-medium { width:4rem; height:4rem; border-radius:1.25rem; }\n    .child-visual-large { width:5.5rem; height:5.5rem; border-radius:1.5rem; }\n    .child-visual-sky { background:linear-gradient(145deg,#e0f2fe,#bae6fd); }\n    .child-visual-rose,.child-visual-pink { background:linear-gradient(145deg,#fce7f3,#fbcfe8); }\n    .child-visual-amber,.child-visual-yellow,.child-visual-peach { background:linear-gradient(145deg,#fef3c7,#fde68a); }\n    .child-visual-indigo,.child-visual-violet { background:linear-gradient(145deg,#ede9fe,#ddd6fe); }\n    .child-visual-emerald,.child-visual-green { background:linear-gradient(145deg,#d1fae5,#a7f3d0); }\n    #game-container.voice-first .learning-option .child-visual { width:5.5rem; height:5.5rem; }
    #game-container.voice-supported .child-instruction { max-width:38rem; margin-left:auto; margin-right:auto; }
    #game-container.voice-supported .child-instruction::before { content:'🔊 '; }
  `;
  document.head.appendChild(style);
}

export function applyChildInterfacePolicy(container, ageId) {
  ensureChildInterfaceStyles();
  if (!container) return getChildInterfacePolicy(ageId);
  const policy = getChildInterfacePolicy(ageId);
  container.dataset.childAge = ageId || '2-3y';
  container.classList.toggle('voice-first', policy.voiceFirst);
  container.classList.toggle('voice-supported', policy.instructionMode === 'voice-supported');
  container.classList.toggle('show-child-labels', policy.showLabels);
  return policy;
}
