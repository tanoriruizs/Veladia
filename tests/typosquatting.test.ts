import { describe, it, expect } from 'vitest';
import { levenshtein, detectTyposquatting } from '../src/engine/typosquatting';

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
});
