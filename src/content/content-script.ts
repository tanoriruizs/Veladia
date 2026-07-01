import { collectPageContext } from './collect-context';
import { showWarningBanner, removeWarningBanner } from './banner';
import { MESSAGE } from '../shared/messages';
import type { AnalysisResult } from '../engine/types';

let lastUrl = '';

function analyzeCurrentPage(): void {
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

function start(): void {
  lastUrl = location.href;
  installSpaHooks();
  analyzeCurrentPage();
}

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', start, { once: true });
}
