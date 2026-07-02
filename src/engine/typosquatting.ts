import { KNOWN_BRANDS } from '../data/brands';
import { registrableDomain } from './url-utils';
import type { Signal } from './types';

// marcas que también son palabras comunes (no fiables por sí solas)
export const AMBIGUOUS_BRAND_WORDS: ReadonlySet<string> = new Set([
  'live', 'office', 'chase', 'discover', 'x',
  'visa', 'wise', 'claro', 'correos',
]);

// caracteres que parecen letras latinas
const CONFUSABLES: Record<string, string> = {
  '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
  $: 's', '|': 'l', '!': 'i',
  // cirílico
  а: 'a', в: 'b', е: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c',
  т: 't', у: 'y', х: 'x', і: 'i', ј: 'j', ѕ: 's', ԁ: 'd', ё: 'e',
  // griego
  ο: 'o', α: 'a', ρ: 'p', ε: 'e', ν: 'v', τ: 't', υ: 'u', χ: 'x', ι: 'i',
};

export function skeleton(input: string): string {
  return Array.from(input.toLowerCase()).map((c) => CONFUSABLES[c] ?? c).join('');
}

const BRAND_SKELETONS = new Map<string, string>(KNOWN_BRANDS.map((b) => [skeleton(b), b]));

// nombre de cada marca sin el TLD (google.com -> google), sin las ambiguas
export const brandBaseNames: readonly string[] = Array.from(
  new Set(
    KNOWN_BRANDS.map((b) => b.split('.')[0]).filter(
      (name) => name.length >= 4 && !AMBIGUOUS_BRAND_WORDS.has(name),
    ),
  ),
);

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

  // 1) homoglyph: mismo esqueleto que una marca (g00gle -> google)
  const impersonated = BRAND_SKELETONS.get(skeleton(domain));
  if (impersonated && impersonated !== domain) {
    return {
      id: 'typosquatting',
      label: `El dominio imita a "${impersonated}" con caracteres parecidos`,
      weight: 35,
      category: 'url',
    };
  }

  // 2) typo por distancia de edición
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
