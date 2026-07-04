import { useCallback, useEffect, useState } from 'react';
import { getHistory, clearHistory, type DetectionEntry } from '../shared/storage';

export function useHistory() {
  const [history, setHistory] = useState<DetectionEntry[]>([]);

  useEffect(() => { void getHistory().then(setHistory); }, []);

  const clear = useCallback(() => {
    void clearHistory().then(() => setHistory([]));
  }, []);

  return { history, clear };
}
