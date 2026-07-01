import { parseUrl, type ParsedUrl } from './url-utils';
import { SUSPICIOUS_TLDS } from '../data/suspicious-tlds';
import { detectTyposquatting } from './typosquatting';
import type { Signal } from './types';

const PHISHING_KEYWORDS = [
  'login', 'log-in', 'signin', 'verify', 'verification', 'secure', 'account',
  'update', 'confirm', 'banking', 'password', 'webscr', 'wallet', 'unlock',
];

const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
  'cutt.ly', 'rebrand.ly', 'shorturl.at',
]);

export function analyzeUrl(rawUrl: string): Signal[] {
  const parsed = parseUrl(rawUrl);
  if (!parsed) return [];

  const signals: Signal[] = [];
  const push = (s: Signal | null) => s && signals.push(s);

  push(checkIpHost(parsed));
  push(checkAtSymbol(parsed));
  push(checkPunycode(parsed));
  push(checkSuspiciousTld(parsed));
  push(checkSubdomainDepth(parsed));
  push(checkPhishingKeywords(parsed));
  push(checkUrlLength(parsed));
  push(checkHyphenSpam(parsed));
  push(checkUrlShortener(parsed));
  push(checkInsecureProtocol(parsed));
  push(detectTyposquatting(parsed.hostname));

  return signals;
}

function checkIpHost(p: ParsedUrl): Signal | null {
  if (!p.isIpHost) return null;
  return { id: 'ip-host', label: 'La dirección usa una IP en lugar de un dominio', weight: 30, category: 'url' };
}
function checkAtSymbol(p: ParsedUrl): Signal | null {
  if (!p.url.href.includes('@')) return null;
  return { id: 'at-symbol', label: 'La URL contiene "@", lo que oculta el destino real', weight: 30, category: 'url' };
}
function checkPunycode(p: ParsedUrl): Signal | null {
  if (!p.labels.some((l) => l.startsWith('xn--'))) return null;
  return { id: 'punycode', label: 'Dominio con Punycode: puede imitar caracteres de una marca real', weight: 30, category: 'url' };
}
function checkSuspiciousTld(p: ParsedUrl): Signal | null {
  const tld = p.labels[p.labels.length - 1];
  if (!tld || !SUSPICIOUS_TLDS.has(tld)) return null;
  return { id: 'suspicious-tld', label: `Dominio de nivel superior poco confiable (.${tld})`, weight: 18, category: 'url' };
}
function checkSubdomainDepth(p: ParsedUrl): Signal | null {
  if (p.isIpHost || p.labels.length <= 3) return null;
  return { id: 'subdomain-depth', label: 'Demasiados subdominios anidados (técnica de ofuscación)', weight: 15, category: 'url' };
}
function checkPhishingKeywords(p: ParsedUrl): Signal | null {
  const haystack = `${p.hostname}${p.url.pathname}`.toLowerCase();
  const hits = PHISHING_KEYWORDS.filter((k) => haystack.includes(k));
  if (hits.length === 0) return null;
  return { id: 'phishing-keywords', label: `Palabras típicas de phishing en la URL (${hits.slice(0, 3).join(', ')})`, weight: Math.min(15, hits.length * 6), category: 'url' };
}
function checkUrlLength(p: ParsedUrl): Signal | null {
  if (p.url.href.length <= 75) return null;
  return { id: 'url-length', label: 'URL inusualmente larga', weight: 8, category: 'url' };
}
function checkHyphenSpam(p: ParsedUrl): Signal | null {
  const hyphens = (p.hostname.match(/-/g) || []).length;
  if (hyphens < 4) return null;
  return { id: 'hyphen-spam', label: 'El dominio tiene muchos guiones (común en phishing)', weight: 10, category: 'url' };
}
function checkUrlShortener(p: ParsedUrl): Signal | null {
  if (!URL_SHORTENERS.has(p.hostname)) return null;
  return { id: 'url-shortener', label: 'Acortador de URL: oculta el destino final', weight: 10, category: 'url' };
}
function checkInsecureProtocol(p: ParsedUrl): Signal | null {
  if (p.protocol === 'https') return null;
  return { id: 'no-https', label: 'La conexión no usa HTTPS (sin cifrado)', weight: 12, category: 'url' };
}
