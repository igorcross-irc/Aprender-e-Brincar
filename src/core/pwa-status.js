export function initPwaExperience({ statusId = "pwa-status", installId = "btn-install-app" } = {}) {
  let deferredPrompt = null;
  const status = document.getElementById(statusId);
  const install = document.getElementById(installId);

  const renderStatus = () => {
    if (!status) return;
    const offline = !navigator.onLine;
    status.textContent = offline ? "Offline" : "Online";
    status.classList.toggle("pwa-offline", offline);
    status.setAttribute("aria-label", offline ? "Aplicativo funcionando offline" : "Aplicativo conectado");
  };

  window.addEventListener("online", renderStatus);
  window.addEventListener("offline", renderStatus);
  renderStatus();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    install?.removeAttribute("hidden");
  });

  install?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch {}
    deferredPrompt = null;
    install.setAttribute("hidden", "");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    install?.setAttribute("hidden", "");
  });

  return {
    isOffline: () => !navigator.onLine,
    canInstall: () => Boolean(deferredPrompt),
    async promptInstall() {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch {}
      deferredPrompt = null;
      return true;
    }
  };
}
