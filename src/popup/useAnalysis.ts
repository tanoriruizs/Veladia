import { useEffect, useState } from 'react';
import { MESSAGE } from '../shared/messages';
import type { AnalysisResult } from '../engine/types';

interface State { loading: boolean; result: AnalysisResult | null; }

export function useAnalysis(): State {
  const [state, setState] = useState<State>({ loading: true, result: null });
  useEffect(() => {
    let active = true;
    chrome.runtime.sendMessage(
      { type: MESSAGE.GET_RESULT },
      (response: { result: AnalysisResult | null } | undefined) => {
        if (!active) return;
        setState({ loading: false, result: response?.result ?? null });
      },
    );
    return () => { active = false; };
  }, []);
  return state;
}
