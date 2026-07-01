import { KNOWN_BRANDS } from '../data/brands';
import { registrableDomain } from './url-utils';
import type { Signal } from './types';

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

export function detectTyposquatting(hostname: string): Signal | null {
  const domain = registrableDomain(hostname);
  if (KNOWN_BRANDS.includes(domain)) return null;

  for (const brand of KNOWN_BRANDS) {
    const distance = levenshtein(domain, brand);
    if (distance > 0 && distance <= 2 && Math.abs(domain.length - brand.length) <= 2) {
      return {
        id: 'typosquatting',
        label: `El dominio se parece a "${brand}" (posible suplantación)`,
        weight: 35,
        category: 'url',
      };
    }
  }
  return null;
}
