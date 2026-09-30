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

export function applyChildInterfacePolicy(container, ageId) {
  if (!container) return getChildInterfacePolicy(ageId);
  const policy = getChildInterfacePolicy(ageId);
  container.dataset.childAge = ageId || '2-3y';
  container.classList.toggle('voice-first', policy.voiceFirst);
  container.classList.toggle('voice-supported', policy.instructionMode === 'voice-supported');
  container.classList.toggle('show-child-labels', policy.showLabels);
  return policy;
}
