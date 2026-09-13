import { KNOWN_BRANDS } from '../data/brands';
import { registrableDomain, multiTenantSuffix } from './url-utils';
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
  return Array.from(
    // pares que juntos parecen otra letra (rnicrosoft, vvise)
    input.toLowerCase().replace(/rn/g, 'm').replace(/vv/g, 'w'),
  )
    .map((c) => CONFUSABLES[c] ?? c)
    .join('');
}

interface Brand {
  domain: string; // google.com
  base: string; //   google
}

const BRANDS: readonly Brand[] = KNOWN_BRANDS.map((domain) => ({ domain, base: domain.split('.')[0] }));

// marcas cuyo nombre es distintivo: sirven para buscarlas dentro de otros dominios
const CLEAR_BRANDS: readonly Brand[] = BRANDS.filter(
  (b) => b.base.length >= 4 && !AMBIGUOUS_BRAND_WORDS.has(b.base),
);

const BRAND_SKELETONS = new Map<string, Brand>(BRANDS.map((b) => [skeleton(b.base), b]));

// nombre de cada marca sin el TLD (google.com -> google), sin las ambiguas
export const brandBaseNames: readonly string[] = Array.from(new Set(CLEAR_BRANDS.map((b) => b.base)));

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

// distancia tolerable proporcional al largo: "att" a 2 de distancia es cualquier
// cosa; "mercadolibre" a 2 de distancia es casi seguro un typo intencional
function maxEditDistance(brandBase: string): number {
  if (brandBase.length < 5) return 0; // demasiado corta: solo homoglyphs exactos
  if (brandBase.length <= 8) return 1;
  return 2;
}

function signal(id: string, label: string, weight: number): Signal {
  return { id, label, weight, category: 'url' };
}

export function detectTyposquatting(hostname: string): Signal | null {
  const domain = registrableDomain(hostname);
  if (KNOWN_BRANDS.includes(domain)) return null;
  const base = domain.split('.')[0];

  // 1) homoglyph: mismo esqueleto que una marca (g00gle -> google)
  const homoglyph = BRAND_SKELETONS.get(skeleton(base));
  if (homoglyph && base !== homoglyph.base) {
    return signal('typosquatting', `El dominio imita a "${homoglyph.domain}" con caracteres parecidos`, 35);
  }

  // 2) nombre exacto de marca con otro TLD (paypal.net);
  //    en hosting gratuito ya lo cubre brand-on-free-host
  if (!multiTenantSuffix(hostname)) {
    const exact = CLEAR_BRANDS.find((b) => b.base === base);
    if (exact) {
      return signal('brand-tld', `Usa el nombre "${exact.base}" con otra terminación (el sitio real es ${exact.domain})`, 20);
    }
  }

  // 3) marca combinada con palabras (paypal-login.com)
  const tokens = base.split('-');
  if (tokens.length > 1) {
    const compound = CLEAR_BRANDS.find((b) => tokens.includes(b.base));
    if (compound) {
      return signal('brand-compound', `El dominio combina "${compound.base}" con otras palabras (patrón típico de phishing)`, 30);
    }
  }

  // 4) marca como subdominio de un dominio ajeno (paypal.com-secure.top)
  const subLabels = hostname.split('.').filter(Boolean).slice(0, -domain.split('.').length);
  for (const label of subLabels) {
    const parts = label.split('-');
    const impersonated = CLEAR_BRANDS.find((b) => parts.includes(b.base));
    if (impersonated) {
      return signal('brand-subdomain', `"${impersonated.base}" aparece como subdominio de un dominio que no le pertenece`, 25);
    }
  }

  // 5) typo por distancia de edición (solo sobre el nombre, sin TLD)
  for (const b of CLEAR_BRANDS) {
    const max = maxEditDistance(b.base);
    if (max === 0) continue;
    const distance = levenshtein(base, b.base);
    if (distance > 0 && distance <= max) {
      return signal('typosquatting', `El dominio se parece a "${b.domain}" (posible suplantación)`, 35);
    }
  }
  return null;
}
