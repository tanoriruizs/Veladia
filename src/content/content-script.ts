import { collectPageContext } from './collect-context';
import { showWarningBanner, removeWarningBanner } from './banner';
import { MESSAGE, type Message } from '../shared/messages';
import type { AnalysisResult } from '../engine/types';

let lastUrl = '';
let lastSignature = '';

// firma de lo que importa; si no cambia, no re-analizamos
function contentSignature(): string {
  const forms = document.forms.length;
  const passwords = document.querySelectorAll('input[type="password"]').length;
  const iframes = document.querySelectorAll('iframe').length;
  return `${forms}|${passwords}|${iframes}`;
}

function analyzeCurrentPage(): void {
  lastSignature = contentSignature();
  const context = collectPageContext();
  try {
    chrome.runtime.sendMessage(
      { type: MESSAGE.ANALYZE_CONTENT, context },
      (response: { result: AnalysisResult | null; showBanner?: boolean } | undefined) => {
        if (chrome.runtime.lastError || !response?.result) return;
        const result = response.result;
        // los sitios en blocklist los intercepta el service worker con la
        // página de bloqueo; aquí solo se gestiona el banner
        if (response.showBanner && result.level === 'dangerous') {
          showWarningBanner(result);
        } else {
          removeWarningBanner();
        }
      },
    );
  } catch {
    // extensión recargada, contexto ya no válido
  }
}

function onNavigation(): void {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  removeWarningBanner();
  analyzeCurrentPage();
}

// pequeña espera para que la SPA termine de pintar la nueva vista
let scheduled = false;
function scheduleNavigation(): void {
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    onNavigation();
  }, 350);
}

// navegación de SPAs: el service worker detecta el cambio de URL
// (tabs.onUpdated) y nos avisa; popstate cubre el botón atrás/adelante.
// Nota: parchear history.pushState aquí no sirve — el content script vive en
// un "isolated world" y la página nunca llama a la versión parcheada.
chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === MESSAGE.URL_CHANGED) scheduleNavigation();
});
window.addEventListener('popstate', scheduleNavigation);

// reanaliza si aparece contenido nuevo (formularios inyectados por JS)
function installContentObserver(): void {
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      if (contentSignature() !== lastSignature) analyzeCurrentPage();
    }, 800);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function start(): void {
  lastUrl = location.href;
  installContentObserver();
  analyzeCurrentPage();
}

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', start, { once: true });
}
