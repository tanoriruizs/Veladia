import { describe, it, expect } from 'vitest';
import { analyzeUrl } from '../src/engine/url-rules';

const ids = (url: string) => analyzeUrl(url).map((s) => s.id);

describe('analyzeUrl', () => {
  it('detecta IP como host', () => { expect(ids('http://192.168.10.5/login')).toContain('ip-host'); });
  it('detecta símbolo @', () => { expect(ids('https://banco.com@evil.com/')).toContain('at-symbol'); });
  it('detecta TLD sospechoso', () => { expect(ids('https://login-secure.tk/')).toContain('suspicious-tld'); });
  it('detecta ausencia de HTTPS con palabra gancho', () => {
    const s = ids('http://account-verify.example/login');
    expect(s).toContain('no-https');
    expect(s).toContain('phishing-keywords');
  });
  it('no genera señales para una URL legítima simple', () => { expect(analyzeUrl('https://www.wikipedia.org/')).toHaveLength(0); });
});
