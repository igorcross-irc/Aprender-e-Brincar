export const CHILD_FEEDBACK = {
  success: { className: 'child-feedback-success', icon: '✨', text: 'Muito bem!' },
  retry: { className: 'child-feedback-retry', icon: '💛', text: 'Vamos tentar!' },
  selected: { className: 'child-feedback-selected', icon: '👆', text: '' }
};

export function getChildFeedback(type = 'selected') {
  return CHILD_FEEDBACK[type] || CHILD_FEEDBACK.selected;
}

export function showChildFeedback(container, type = 'selected', duration = 650) {
  if (!container) return;
  const feedback = getChildFeedback(type);
  const old = container.querySelector('.child-feedback-overlay');
  old?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'child-feedback-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<span class="child-feedback-bubble ${feedback.className}">${feedback.icon}</span>`;
  container.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), Math.max(250, Number(duration) || 650));
}
