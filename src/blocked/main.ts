// Página de bloqueo para sitios en blocklist. El service worker redirige la
// pestaña aquí, así que el sitio de phishing nunca puede ocultar este aviso.
import { addAcceptedRisk } from '../shared/storage';

function targetUrl(): URL | null {
  const raw = new URLSearchParams(location.search).get('u');
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

const target = targetUrl();

document.getElementById('host')!.textContent = target?.hostname ?? 'dirección desconocida';

document.getElementById('back')!.addEventListener('click', () => {
  // -2: salta también la entrada del propio sitio bloqueado para no volver a él
  if (history.length > 2) {
    history.go(-2);
  } else {
    void chrome.tabs.getCurrent().then((tab) => {
      if (tab?.id !== undefined) void chrome.tabs.remove(tab.id);
    });
  }
});

document.getElementById('proceed')!.addEventListener('click', () => {
  if (!target) return;
  void addAcceptedRisk(target.hostname).then(() => {
    location.replace(target.href);
  });
});
