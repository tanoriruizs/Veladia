export type RiskLevel = 'safe' | 'suspicious' | 'dangerous';
export type SignalCategory = 'url' | 'content' | 'reputation';
export type ThemeMode = 'auto' | 'light' | 'dark';

export interface Signal {
  id: string;
  label: string;
  weight: number;
  category: SignalCategory;
}

export interface FormInfo {
  actionHost: string | null;
  hasPasswordField: boolean;
}

export interface PageContext {
  url: string;
  title: string;
  forms: FormInfo[];
  hasFullPageIframe: boolean;
  hiddenInputCount: number;
  externalLinkRatio: number;
  faviconHost: string | null;
}

export type Sensitivity = 'relaxed' | 'normal' | 'strict';

export interface Settings {
  sensitivity: Sensitivity;
  showBanner: boolean;
  theme: ThemeMode;
  userAllowlist: string[];
  userBlocklist: string[];
}

export interface AnalysisResult {
  url: string;
  hostname: string;
  score: number;
  level: RiskLevel;
  signals: Signal[];
  analyzedAt: number;
}
