import { useCallback, useEffect, useState } from 'react';
import { getSettings, saveSettings, DEFAULT_SETTINGS } from '../shared/storage';
import type { Settings } from '../engine/types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => { void getSettings().then(setSettings); }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next).then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      });
      return next;
    });
  }, []);

  return { settings, update, saved };
}
