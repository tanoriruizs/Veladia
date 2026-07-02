import { describe, it, expect } from 'vitest';
import { levenshtein, detectTyposquatting, skeleton } from '../src/engine/typosquatting';

describe('levenshtein', () => {
  it('devuelve 0 para cadenas idénticas', () => { expect(levenshtein('paypal.com', 'paypal.com')).toBe(0); });
  it('cuenta sustituciones simples', () => {
    expect(levenshtein('paypa1.com', 'paypal.com')).toBe(1);
    expect(levenshtein('g00gle.com', 'google.com')).toBe(2);
  });
});

describe('detectTyposquatting', () => {
  it('marca dominios parecidos a una marca', () => {
    expect(detectTyposquatting('paypa1.com')?.id).toBe('typosquatting');
    expect(detectTyposquatting('faceboook.com')?.id).toBe('typosquatting');
  });
  it('no marca la marca real', () => {
    expect(detectTyposquatting('paypal.com')).toBeNull();
    expect(detectTyposquatting('www.google.com')).toBeNull();
  });
  it('no marca dominios totalmente distintos', () => { expect(detectTyposquatting('mi-blog-personal.com')).toBeNull(); });
  it('detecta homoglyphs con dígitos parecidos', () => {
    expect(detectTyposquatting('g00gle.com')?.label).toContain('imita');
    expect(detectTyposquatting('micros0ft.com')?.label).toContain('imita');
    expect(detectTyposquatting('app1e.com')?.label).toContain('apple.com');
  });
  it('detecta homoglyphs con caracteres cirílicos', () => {
    // "аpple.com" con "а" cirílica (U+0430)
    expect(detectTyposquatting('аpple.com')?.id).toBe('typosquatting');
  });
});

describe('skeleton', () => {
  it('normaliza caracteres confundibles a latino ASCII', () => {
    expect(skeleton('g00gle')).toBe('google');
    expect(skeleton('paypa1')).toBe('paypal');
    expect(skeleton('рayрal')).toBe('paypal'); // р cirílica
  });
});
