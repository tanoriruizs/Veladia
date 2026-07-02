import { collectPageContext } from './collect-context';
import { showWarningBanner, removeWarningBanner } from './banner';
import { MESSAGE } from '../shared/messages';
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
        if (response.showBanner && response.result.level === 'dangerous') {
          showWarningBanner(response.result);
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

// parchea History API para reanalizar en navegación de SPAs
function installSpaHooks(): void {
  const fire = () => window.dispatchEvent(new Event('veladia:locationchange'));
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      fire();
      return result;
    };
  }
  window.addEventListener('popstate', fire);

  let scheduled = false;
  window.addEventListener('veladia:locationchange', () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      onNavigation();
    }, 350);
  });
}

// reanaliza si aparece contenido nuevo (formularios inyectados por JS)
function installContentObserver(): void {
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      if (contentSignature() !== lastSignature) analyzeCurrentPage();
    }, 800);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function start(): void {
  lastUrl = location.href;
  installSpaHooks();
  installContentObserver();
  analyzeCurrentPage();
}

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', start, { once: true });
}
