const MASCOT_ID = "aprender-mascote";

export function childMascotMarkup({ size = "medium", label = "Companheiro do Aprender & Brincar", mood = "happy" } = {}) {
  const scale = size === "small" ? 72 : size === "large" ? 150 : 104;
  const face = mood === "celebrate" ? "✨" : mood === "curious" ? "👀" : "😊";
  return `
    <div class="child-mascot child-mascot-${size}" data-mascot="${MASCOT_ID}" role="img" aria-label="${escapeHtml(label)}" style="width:${scale}px;height:${scale}px">
      <div class="child-mascot-glow" aria-hidden="true"></div>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <circle cx="60" cy="62" r="43" fill="#fff" stroke="#6366f1" stroke-width="4"/>
        <path d="M28 49C27 23 43 10 60 10s33 13 32 39c-10-10-20-14-32-14S38 39 28 49Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/>
        <circle cx="45" cy="60" r="5" fill="#334155"/>
        <circle cx="75" cy="60" r="5" fill="#334155"/>
        <path d="M47 78c8 8 18 8 26 0" fill="none" stroke="#ec4899" stroke-width="4" stroke-linecap="round"/>
        <circle cx="25" cy="72" r="8" fill="#fbcfe8" opacity=".8"/>
        <circle cx="95" cy="72" r="8" fill="#fbcfe8" opacity=".8"/>
        <path d="M17 92c10 9 21 13 43 13s33-4 43-13" fill="#a7f3d0" stroke="#10b981" stroke-width="4"/>
      </svg>
      <span class="child-mascot-face" aria-hidden="true">${face}</span>
    </div>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char]));
}
