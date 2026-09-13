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
  it('detecta pares de letras que imitan otra letra (rn -> m)', () => {
    expect(detectTyposquatting('rnicrosoft.com')?.label).toContain('microsoft.com');
  });

  it('detecta el nombre exacto de una marca con otro TLD', () => {
    expect(detectTyposquatting('paypal.net')?.id).toBe('brand-tld');
    expect(detectTyposquatting('netflix.top')?.id).toBe('brand-tld');
  });
  it('detecta marca combinada con palabras', () => {
    expect(detectTyposquatting('paypal-login.com')?.id).toBe('brand-compound');
    expect(detectTyposquatting('secure-amazon-verify.com')?.id).toBe('brand-compound');
  });
  it('detecta la marca usada como subdominio de un dominio ajeno', () => {
    expect(detectTyposquatting('paypal.com-secure.top')?.id).toBe('brand-subdomain');
    expect(detectTyposquatting('login.netflix.cuenta-segura.com')?.id).toBe('brand-subdomain');
  });
  it('no marca subdominios legítimos de la propia marca', () => {
    expect(detectTyposquatting('accounts.google.com')).toBeNull();
  });

  it('no marca dominios cortos legítimos cercanos a marcas cortas', () => {
    // con el umbral antiguo (distancia <= 2 sin mirar el largo) todos fallaban
    expect(detectTyposquatting('abc.com')).toBeNull(); //  ~ hsbc.com
    expect(detectTyposquatting('art.com')).toBeNull(); //  ~ att.com
    expect(detectTyposquatting('api.com')).toBeNull(); //  ~ ups.com
    expect(detectTyposquatting('room.us')).toBeNull(); //  ~ zoom.us
    expect(detectTyposquatting('bts.com')).toBeNull(); //  ~ etsy.com
    expect(detectTyposquatting('dell.com')).toBeNull(); // ~ dhl.com
  });
  it('sigue detectando typos claros de marcas medianas y largas', () => {
    expect(detectTyposquatting('goggle.com')?.id).toBe('typosquatting');
    expect(detectTyposquatting('micosoft.com')?.id).toBe('typosquatting');
    expect(detectTyposquatting('mercadolibr.com')?.id).toBe('typosquatting');
  });
});

describe('skeleton', () => {
  it('normaliza caracteres confundibles a latino ASCII', () => {
    expect(skeleton('g00gle')).toBe('google');
    expect(skeleton('paypa1')).toBe('paypal');
    expect(skeleton('рayрal')).toBe('paypal'); // р cirílica
  });
});
