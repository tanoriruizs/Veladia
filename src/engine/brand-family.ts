import { BRAND_FAMILIES } from '../data/brand-families';

const OWNER = new Map<string, number>();
BRAND_FAMILIES.forEach((family, i) => family.forEach((d) => OWNER.set(d, i)));

// mismo dominio o misma familia de marcas (mismo dueño)
export function sameOwner(a: string, b: string): boolean {
  if (a === b) return true;
  const owner = OWNER.get(a);
  return owner !== undefined && owner === OWNER.get(b);
}
