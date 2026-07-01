import type { AnalysisResult, Settings } from '../engine/types';

const SETTINGS_KEY = 'veladia:settings';
const RESULT_PREFIX = 'veladia:result:';

export const DEFAULT_SETTINGS: Settings = {
  sensitivity: 'normal',
  showBanner: true,
  theme: 'auto',
  userAllowlist: [],
  userBlocklist: [],
};

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] as Partial<Settings> | undefined) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function saveResult(tabId: number, result: AnalysisResult): Promise<void> {
  await chrome.storage.session.set({ [RESULT_PREFIX + tabId]: result });
}

export async function getResult(tabId: number): Promise<AnalysisResult | null> {
  const key = RESULT_PREFIX + tabId;
  const stored = await chrome.storage.session.get(key);
  return (stored[key] as AnalysisResult | undefined) ?? null;
}

export async function clearResult(tabId: number): Promise<void> {
  await chrome.storage.session.remove(RESULT_PREFIX + tabId);
}
