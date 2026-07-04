// helpers puros para exportar/importar las listas del usuario

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export interface ListsBackup {
  userAllowlist: string[];
  userBlocklist: string[];
}

export function sanitizeDomains(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<string>();
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const domain = item.trim().toLowerCase();
    if (DOMAIN_RE.test(domain)) out.add(domain);
  }
  return [...out];
}

export function serializeBackup(lists: ListsBackup): string {
  return JSON.stringify({ app: 'veladia', ...lists }, null, 2);
}

export function parseBackup(json: string): ListsBackup | null {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const userAllowlist = sanitizeDomains(data.userAllowlist);
    const userBlocklist = sanitizeDomains(data.userBlocklist);
    if (userAllowlist.length === 0 && userBlocklist.length === 0) return null;
    return { userAllowlist, userBlocklist };
  } catch {
    return null;
  }
}

export function mergeUnique(current: string[], incoming: string[]): string[] {
  return [...new Set([...current, ...incoming])];
}
