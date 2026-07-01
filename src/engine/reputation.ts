import { EMBEDDED_ALLOWLIST, EMBEDDED_BLOCKLIST } from '../data/allowlist';
import { registrableDomain } from './url-utils';
import type { Settings, Signal } from './types';

export type Reputation = 'blocked' | 'trusted' | 'unknown';

export function lookupReputation(hostname: string, settings: Settings): Reputation {
  const domain = registrableDomain(hostname);
  const userBlock = new Set(settings.userBlocklist);
  const userAllow = new Set(settings.userAllowlist);

  if (userBlock.has(hostname) || userBlock.has(domain)) return 'blocked';
  if (userAllow.has(hostname) || userAllow.has(domain)) return 'trusted';
  if (EMBEDDED_BLOCKLIST.has(hostname) || EMBEDDED_BLOCKLIST.has(domain)) return 'blocked';
  if (EMBEDDED_ALLOWLIST.has(domain)) return 'trusted';
  return 'unknown';
}

export function trustedSignal(): Signal {
  return { id: 'allowlisted', label: 'Dominio reconocido como legítimo', weight: -40, category: 'reputation' };
}
export function blockedSignal(): Signal {
  return { id: 'blocklisted', label: 'Dominio incluido en la lista de phishing conocido', weight: 100, category: 'reputation' };
}
