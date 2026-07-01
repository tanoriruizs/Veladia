import type { RiskLevel, Sensitivity, Signal } from './types';

interface Thresholds { suspicious: number; dangerous: number; }

const THRESHOLDS: Record<Sensitivity, Thresholds> = {
  strict: { suspicious: 20, dangerous: 45 },
  normal: { suspicious: 30, dangerous: 60 },
  relaxed: { suspicious: 45, dangerous: 75 },
};

export function computeScore(signals: Signal[]): number {
  const total = signals.reduce((acc, s) => acc + s.weight, 0);
  return Math.max(0, Math.min(100, total));
}

export function classify(score: number, sensitivity: Sensitivity): RiskLevel {
  const t = THRESHOLDS[sensitivity];
  if (score >= t.dangerous) return 'dangerous';
  if (score >= t.suspicious) return 'suspicious';
  return 'safe';
}
