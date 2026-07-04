import type { AnalysisResult, RiskLevel, Settings } from '../engine/types';

const SETTINGS_KEY = 'veladia:settings';
const RESULT_PREFIX = 'veladia:result:';
const HISTORY_KEY = 'veladia:history';
const HISTORY_MAX = 50;

export interface DetectionEntry {
  hostname: string;
  level: RiskLevel;
  score: number;
  at: number;
}

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

export async function getHistory(): Promise<DetectionEntry[]> {
  const stored = await chrome.storage.local.get(HISTORY_KEY);
  return (stored[HISTORY_KEY] as DetectionEntry[] | undefined) ?? [];
}

// guarda la detección más reciente por host (solo sospechoso/peligroso)
export async function recordDetection(result: AnalysisResult): Promise<void> {
  if (result.level === 'safe' || !result.hostname) return;
  const history = await getHistory();
  const rest = history.filter((e) => e.hostname !== result.hostname);
  rest.unshift({ hostname: result.hostname, level: result.level, score: result.score, at: result.analyzedAt });
  await chrome.storage.local.set({ [HISTORY_KEY]: rest.slice(0, HISTORY_MAX) });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.remove(HISTORY_KEY);
}
