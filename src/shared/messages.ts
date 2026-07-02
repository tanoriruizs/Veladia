import type { AnalysisResult, PageContext } from '../engine/types';

export type Message =
  | { type: 'ANALYZE_CONTENT'; context: PageContext }
  | { type: 'GET_RESULT'; tabId?: number }
  | { type: 'RESULT'; result: AnalysisResult | null }
  | { type: 'RESULT_PUSH'; tabId: number; result: AnalysisResult };

export const MESSAGE = {
  ANALYZE_CONTENT: 'ANALYZE_CONTENT',
  GET_RESULT: 'GET_RESULT',
  RESULT: 'RESULT',
  RESULT_PUSH: 'RESULT_PUSH',
} as const;
