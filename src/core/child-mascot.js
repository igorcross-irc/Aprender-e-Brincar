const MASCOT_ID = 'aprender-mascote';

// Mascote: uma corujinha roxa. As expressões mudam olhos, bico e asas.
const EYES = {
  happy: `
    <circle cx="44" cy="52" r="13" fill="#fff"/><circle cx="76" cy="52" r="13" fill="#fff"/>
    <circle cx="46" cy="54" r="6.5" fill="#2e1065"/><circle cx="74" cy="54" r="6.5" fill="#2e1065"/>
    <circle cx="48" cy="51" r="2.2" fill="#fff"/><circle cx="76" cy="51" r="2.2" fill="#fff"/>`,
  curious: `
    <circle cx="44" cy="52" r="14" fill="#fff"/><circle cx="76" cy="52" r="14" fill="#fff"/>
    <circle cx="50" cy="50" r="7" fill="#2e1065"/><circle cx="82" cy="50" r="7" fill="#2e1065"/>
    <circle cx="52" cy="47" r="2.4" fill="#fff"/><circle cx="84" cy="47" r="2.4" fill="#fff"/>`,
  celebrate: `
    <circle cx="44" cy="52" r="13" fill="#fff"/><circle cx="76" cy="52" r="13" fill="#fff"/>
    <path d="M36 55q8-10 16 0M68 55q8-10 16 0" fill="none" stroke="#2e1065" stroke-width="4.5" stroke-linecap="round"/>`
};

const BEAK = {
  happy: '<path d="M54 66l6 8 6-8z" fill="#f59e0b" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>',
  curious: '<ellipse cx="60" cy="70" rx="5" ry="6" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>',
  celebrate: '<path d="M52 65q8 14 16 0z" fill="#f97316" stroke="#d97706" stroke-width="2" stroke-linejoin="round"/>'
};

const WINGS = {
  happy: '<path d="M22 72q-8 14 4 24q6-12 8-22z" fill="#7c3aed"/><path d="M98 72q8 14-4 24q-6-12-8-22z" fill="#7c3aed"/>',
  curious: '<path d="M22 72q-8 14 4 24q6-12 8-22z" fill="#7c3aed"/><path d="M98 72q8 14-4 24q-6-12-8-22z" fill="#7c3aed"/>',
  celebrate: '<path d="M24 70q-16-8-18-26q16 4 22 20z" fill="#7c3aed"/><path d="M96 70q16-8 18-26q-16 4-22 20z" fill="#7c3aed"/>'
};

export function childMascotMarkup({ size = 'medium', label = 'Corujinha do Aprender & Brincar', mood = 'happy' } = {}) {
  const scale = size === 'small' ? 72 : size === 'large' ? 150 : 104;
  const expression = EYES[mood] ? mood : 'happy';
  return `
    <div class="child-mascot child-mascot-${size} mascot-${expression}" data-mascot="${MASCOT_ID}" role="img" aria-label="${escapeHtml(label)}" style="width:${scale}px;height:${scale}px">
      <div class="child-mascot-glow" aria-hidden="true"></div>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        ${WINGS[expression]}
        <path d="M30 34l-6-18 18 10M90 34l6-18-18 10" fill="#8b5cf6" stroke="#7c3aed" stroke-width="3" stroke-linejoin="round"/>
        <ellipse cx="60" cy="68" rx="38" ry="42" fill="#a78bfa" stroke="#7c3aed" stroke-width="4"/>
        <ellipse cx="60" cy="86" rx="22" ry="20" fill="#ede9fe"/>
        <path d="M50 84q5 4 10 0q5 4 10 0M50 94q5 4 10 0q5 4 10 0" fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-linecap="round"/>
        ${EYES[expression]}
        ${BEAK[expression]}
        <circle cx="30" cy="66" r="6" fill="#f9a8d4" opacity=".7"/><circle cx="90" cy="66" r="6" fill="#f9a8d4" opacity=".7"/>
        <path d="M48 108l-4 6M60 110v6M72 108l4 6" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
      </svg>
    </div>`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
