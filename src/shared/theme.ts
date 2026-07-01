import type { ThemeMode } from '../engine/types';
import { getSettings } from './storage';

export function applyTheme(mode: ThemeMode): void {
  const el = document.documentElement;
  // 'auto' quita data-theme y deja mandar al sistema
  if (mode === 'auto') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', mode);
}

export function initTheme(): void {
  void getSettings().then((s) => applyTheme(s.theme)).catch(() => {});
}
