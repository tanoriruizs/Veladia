import { describe, it, expect } from 'vitest';
import { sanitizeDomains, parseBackup, serializeBackup, mergeUnique } from '../src/shared/lists';

describe('sanitizeDomains', () => {
  it('normaliza y filtra entradas inválidas', () => {
    expect(sanitizeDomains([' Ejemplo.COM ', 'sub.dominio.mx', 'no válido', '', 42, 'sin-punto'])).toEqual([
      'ejemplo.com', 'sub.dominio.mx',
    ]);
  });
  it('devuelve vacío si la entrada no es un array', () => {
    expect(sanitizeDomains('ejemplo.com')).toEqual([]);
    expect(sanitizeDomains(null)).toEqual([]);
  });
  it('elimina duplicados', () => {
    expect(sanitizeDomains(['a.com', 'A.com', 'a.com'])).toEqual(['a.com']);
  });
});

describe('parseBackup', () => {
  it('acepta una copia exportada por serializeBackup', () => {
    const json = serializeBackup({ userAllowlist: ['bueno.com'], userBlocklist: ['malo.tk'] });
    expect(parseBackup(json)).toEqual({ userAllowlist: ['bueno.com'], userBlocklist: ['malo.tk'] });
  });
  it('rechaza JSON inválido o sin listas', () => {
    expect(parseBackup('no es json')).toBeNull();
    expect(parseBackup('{"otra":"cosa"}')).toBeNull();
  });
});

describe('mergeUnique', () => {
  it('une sin duplicar y conserva el orden', () => {
    expect(mergeUnique(['a.com', 'b.com'], ['b.com', 'c.com'])).toEqual(['a.com', 'b.com', 'c.com']);
  });
});
