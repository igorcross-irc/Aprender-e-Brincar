export const CHILD_FEEDBACK = {
  success: { className: 'child-feedback-success', icon: '✨', text: 'Muito bem!' },
  retry: { className: 'child-feedback-retry', icon: '💛', text: 'Vamos tentar!' },
  selected: { className: 'child-feedback-selected', icon: '👆', text: '' },
  encourage: { className: 'child-feedback-encourage', icon: '🌟', text: 'Você conseguiu!' },
  calm: { className: 'child-feedback-calm', icon: '🌿', text: 'Vamos devagar.' }
};

const feedbackTimers = new WeakMap();

export function getChildFeedback(type = 'selected') {
  return CHILD_FEEDBACK[type] || CHILD_FEEDBACK.selected;
}

export function getChildFeedbackMessage(type = 'selected') {
  return getChildFeedback(type).text;
}

export function showChildFeedback(container, type = 'selected', duration = 650) {
  if (!container) return;
  const feedback = getChildFeedback(type);
  const oldTimer = feedbackTimers.get(container);
  if (oldTimer) window.clearTimeout(oldTimer);

  const old = container.querySelector('.child-feedback-overlay');
  old?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'child-feedback-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<span class="child-feedback-bubble ${feedback.className}">${feedback.icon}</span>`;
  container.appendChild(overlay);

  const timer = window.setTimeout(() => {
    if (container.querySelector('.child-feedback-overlay') === overlay) overlay.remove();
    feedbackTimers.delete(container);
  }, Math.max(250, Number(duration) || 650));
  feedbackTimers.set(container, timer);
}

export function clearChildFeedback(container) {
  if (!container) return;
  const timer = feedbackTimers.get(container);
  if (timer) window.clearTimeout(timer);
  feedbackTimers.delete(container);
  container.querySelector('.child-feedback-overlay')?.remove();
}

export function showChildFeedbackText(container, type = 'selected', duration = 650) {
  if (!container) return;
  const feedback = getChildFeedback(type);
  showChildFeedback(container, type, duration);
  const bubble = container.querySelector('.child-feedback-bubble');
  if (bubble && feedback.text) bubble.insertAdjacentHTML('beforeend', `<span class="child-feedback-text">${feedback.text}</span>`);
}
