import { analyze } from '../engine/analyzer';
import type { AnalysisResult, RiskLevel } from '../engine/types';
import { getSettings, saveResult, getResult, clearResult } from '../shared/storage';
import { MESSAGE, type Message } from '../shared/messages';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    void chrome.tabs.create({ url: chrome.runtime.getURL('src/welcome/index.html') });
  }
});

const ICON_SIZES = [16, 32, 48, 128] as const;

function statusIconPath(level: RiskLevel): Record<number, string> {
  return Object.fromEntries(
    ICON_SIZES.map((size) => [size, `icons/state-${level}-${size}.png`]),
  );
}

async function updateBadge(tabId: number, result: AnalysisResult): Promise<void> {
  try {
    await chrome.action.setIcon({ tabId, path: statusIconPath(result.level) });
    await chrome.action.setTitle({ tabId, title: `Veladia — riesgo ${result.score}/100 (${result.level})` });
  } catch {
    // la pestaña pudo cerrarse
  }
}

// avisa al popup si está abierto (si no hay nadie, ignora el error)
function pushResult(tabId: number, result: AnalysisResult): void {
  chrome.runtime
    .sendMessage({ type: MESSAGE.RESULT_PUSH, tabId, result })
    .catch(() => {});
}

async function quickAnalyze(tabId: number, url: string): Promise<void> {
  if (!/^https?:/.test(url)) return;
  const settings = await getSettings();
  const result = analyze(url, settings);
  await saveResult(tabId, result);
  await updateBadge(tabId, result);
  pushResult(tabId, result);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    void quickAnalyze(tabId, changeInfo.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void clearResult(tabId);
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  if (message.type === MESSAGE.ANALYZE_CONTENT) {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return false;
    void (async () => {
      const settings = await getSettings();
      const result = analyze(message.context.url, settings, message.context);
      await saveResult(tabId, result);
      await updateBadge(tabId, result);
      pushResult(tabId, result);
      sendResponse({ type: MESSAGE.RESULT, result, showBanner: settings.showBanner });
    })();
    return true;
  }

  if (message.type === MESSAGE.GET_RESULT) {
    void (async () => {
      const tabId =
        message.tabId ?? (await chrome.tabs.query({ active: true, currentWindow: true }))[0]?.id;
      const result = tabId !== undefined ? await getResult(tabId) : null;
      sendResponse({ type: MESSAGE.RESULT, result });
    })();
    return true;
  }

  return false;
});
