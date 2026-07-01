const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

export interface ParsedUrl {
  url: URL;
  hostname: string;
  protocol: string;
  isIpHost: boolean;
  labels: string[];
}

export function parseUrl(raw: string): ParsedUrl | null {
  try {
    const url = new URL(raw);
    const hostname = url.hostname.toLowerCase();
    return {
      url,
      hostname,
      protocol: url.protocol.replace(':', ''),
      isIpHost: IPV4.test(hostname),
      labels: hostname.split('.').filter(Boolean),
    };
  } catch {
    return null;
  }
}

const MULTI_PART_SLD = new Set(['co', 'com', 'org', 'net', 'gob', 'gov', 'edu', 'ac']);

export function registrableDomain(hostname: string): string {
  const labels = hostname.split('.').filter(Boolean);
  if (labels.length <= 2) return hostname;
  const secondLast = labels[labels.length - 2];
  if (MULTI_PART_SLD.has(secondLast) && labels.length >= 3) return labels.slice(-3).join('.');
  return labels.slice(-2).join('.');
}

export function hostOf(action: string, base: string): string | null {
  if (!action) return null;
  try {
    return new URL(action, base).hostname.toLowerCase();
  } catch {
    return null;
  }
}
