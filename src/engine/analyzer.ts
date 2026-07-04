import { analyzeUrl } from './url-rules';
import { analyzeContent } from './content-rules';
import { computeScore, classify } from './scoring';
import { lookupReputation, trustedSignal, blockedSignal } from './reputation';
import { parseUrl } from './url-utils';
import type { AnalysisResult, PageContext, Settings } from './types';

// en un dominio legítimo, decir que "imita a una marca" no tiene sentido
const IMPERSONATION = new Set(['brand-mismatch', 'favicon-mismatch', 'brand-on-free-host', 'typosquatting']);

export function analyze(url: string, settings: Settings, pageContext?: PageContext): AnalysisResult {
  const parsed = parseUrl(url);
  const hostname = parsed?.hostname ?? '';
  const analyzedAt = Date.now();

  const reputation = lookupReputation(hostname, settings);

  if (reputation === 'blocked') {
    return { url, hostname, score: 100, level: 'dangerous', signals: [blockedSignal()], analyzedAt };
  }

  let signals = [...analyzeUrl(url)];
  if (pageContext) signals.push(...analyzeContent(pageContext));
  if (reputation === 'trusted') {
    signals = signals.filter((s) => !IMPERSONATION.has(s.id));
    signals.push(trustedSignal());
  }

  const score = computeScore(signals);
  const level = classify(score, settings.sensitivity);

  return { url, hostname, score, level, signals, analyzedAt };
}
