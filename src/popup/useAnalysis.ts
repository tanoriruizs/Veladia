import { useEffect, useState } from 'react';
import { MESSAGE, type Message } from '../shared/messages';
import type { AnalysisResult } from '../engine/types';

interface State { loading: boolean; result: AnalysisResult | null; }

export function useAnalysis(): State {
  const [state, setState] = useState<State>({ loading: true, result: null });
  useEffect(() => {
    let active = true;
    let currentTabId: number | undefined;

    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      currentTabId = tab?.id;
    });

    chrome.runtime.sendMessage(
      { type: MESSAGE.GET_RESULT },
      (response: { result: AnalysisResult | null } | undefined) => {
        if (!active) return;
        setState({ loading: false, result: response?.result ?? null });
      },
    );

    // refresca si el análisis termina con el popup ya abierto
    const onPush = (message: Message) => {
      if (message.type !== MESSAGE.RESULT_PUSH) return;
      if (currentTabId !== undefined && message.tabId !== currentTabId) return;
      if (active) setState({ loading: false, result: message.result });
    };
    chrome.runtime.onMessage.addListener(onPush);

    return () => {
      active = false;
      chrome.runtime.onMessage.removeListener(onPush);
    };
  }, []);
  return state;
}
