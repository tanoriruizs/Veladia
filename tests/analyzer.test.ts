import { describe, it, expect } from 'vitest';
import { analyze } from '../src/engine/analyzer';
import { DEFAULT_SETTINGS } from '../src/shared/storage';
import type { PageContext, Settings } from '../src/engine/types';

const settings: Settings = DEFAULT_SETTINGS;
const baseCtx = (over: Partial<PageContext>): PageContext => ({
  url: 'https://example.com/', title: '', forms: [],
  hasFullPageIframe: false, hiddenInputCount: 0, externalLinkRatio: 0, faviconHost: null, ...over,
});

describe('analyze (integración)', () => {
  it('clasifica un sitio legítimo como seguro', () => {
    const r = analyze('https://www.wikipedia.org/', settings);
    expect(r.level).toBe('safe');
    expect(r.score).toBeLessThan(30);
  });
  it('clasifica phishing evidente como peligroso', () => {
    const r = analyze('http://paypa1.com@192.168.0.1/secure-login/verify', settings);
    expect(r.level).toBe('dangerous');
  });
  it('la blocklist embebida fuerza peligro', () => {
    const r = analyze('https://secure-paypal-login.tk/', settings);
    expect(r.score).toBe(100);
    expect(r.level).toBe('dangerous');
  });
  it('detecta formulario de login cross-domain', () => {
    const ctx = baseCtx({ url: 'https://mi-banco-falso.com/login', forms: [{ actionHost: 'collector.evil.ru', hasPasswordField: true }] });
    const r = analyze(ctx.url, settings, ctx);
    expect(r.signals.map((s) => s.id)).toContain('cross-domain-login');
  });
  it('detecta favicon de marca en dominio ajeno', () => {
    const ctx = baseCtx({ url: 'https://paypal-seguro.tk/', faviconHost: 'www.paypal.com' });
    const r = analyze(ctx.url, settings, ctx);
    expect(r.signals.map((s) => s.id)).toContain('favicon-mismatch');
  });
  it('la allowlist del usuario reduce el riesgo', () => {
    const custom: Settings = { ...settings, userAllowlist: ['mi-empresa.tk'] };
    const r = analyze('https://mi-empresa.tk/', custom);
    expect(r.signals.some((s) => s.id === 'allowlisted')).toBe(true);
  });
});
