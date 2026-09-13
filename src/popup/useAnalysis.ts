import { useEffect, useState } from 'react';
import { MESSAGE, type Message } from '../shared/messages';
import type { AnalysisResult } from '../engine/types';

interface State { loading: boolean; result: AnalysisResult | null; }

export function useAnalysis(): State {
  const [state, setState] = useState<State>({ loading: true, result: null });
  useEffect(() => {
    let active = true;
    let onPush: ((message: Message) => void) | null = null;

    // primero la pestaña activa; si no, un RESULT_PUSH de otra pestaña que
    // llegue antes de conocerla se aceptaría por error
    void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (!active) return;
      const currentTabId = tab?.id;

      chrome.runtime.sendMessage(
        { type: MESSAGE.GET_RESULT, tabId: currentTabId },
        (response: { result: AnalysisResult | null } | undefined) => {
          if (active) setState({ loading: false, result: response?.result ?? null });
        },
      );

      // refresca si el análisis termina con el popup ya abierto
      onPush = (message: Message) => {
        if (message.type !== MESSAGE.RESULT_PUSH) return;
        if (message.tabId !== currentTabId) return;
        if (active) setState({ loading: false, result: message.result });
      };
      chrome.runtime.onMessage.addListener(onPush);
    });

    return () => {
      active = false;
      if (onPush) chrome.runtime.onMessage.removeListener(onPush);
    };
  }, []);
  return state;
}
