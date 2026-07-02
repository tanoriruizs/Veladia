// Regenera src/data/allowlist.ts desde Tranco (allowlist) y OpenPhish (blocklist).
// Uso: npm run update-lists
// Si un feed falla, se queda con la semilla de abajo y no rompe.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../src/data/allowlist.ts');

const ALLOWLIST_SIZE = 5000; // sitios de mayor confianza a incluir
const FETCH_TIMEOUT_MS = 30_000;

// respaldo por si un feed falla
const ALLOW_SEED = [
  'google.com', 'youtube.com', 'facebook.com', 'wikipedia.org', 'amazon.com',
  'microsoft.com', 'apple.com', 'netflix.com', 'linkedin.com', 'github.com',
  'reddit.com', 'paypal.com', 'cloudflare.com', 'mozilla.org', 'stackoverflow.com',
];
const BLOCK_SEED = [
  'secure-paypal-login.tk',
  'account-verify-amazon.ml',
];

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

async function fetchText(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { 'user-agent': 'veladia-reputation-updater' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

// la API "latest" da el id de la lista del día
async function fetchTranco(size) {
  const meta = JSON.parse(await fetchText('https://tranco-list.eu/api/lists/date/latest'));
  if (!meta.available || !meta.list_id) throw new Error('lista Tranco no disponible');
  const csv = await fetchText(`https://tranco-list.eu/download/${meta.list_id}/${size}`);
  const domains = csv
    .split('\n')
    .map((line) => line.split(',')[1]?.trim().toLowerCase())
    .filter((d) => d && d.includes('.') && !IPV4.test(d));
  if (domains.length === 0) throw new Error('Tranco devolvió una lista vacía');
  return { domains, date: meta.created_on?.slice(0, 10) ?? 'desconocida' };
}

// guardamos el host exacto, no el dominio (para no bloquear hosting compartido)
async function fetchOpenPhish() {
  const feed = await fetchText('https://openphish.com/feed.txt');
  const hosts = new Set();
  for (const line of feed.split('\n')) {
    const raw = line.trim();
    if (!raw) continue;
    try {
      const host = new URL(raw).hostname.toLowerCase();
      if (host && !IPV4.test(host)) hosts.add(host);
    } catch {
      // línea que no es una URL válida
    }
  }
  if (hosts.size === 0) throw new Error('OpenPhish devolvió una lista vacía');
  return hosts;
}

function serializeSet(name, values) {
  const sorted = [...values].sort();
  const lines = [];
  for (let i = 0; i < sorted.length; i += 5) {
    lines.push('  ' + sorted.slice(i, i + 5).map((d) => `'${d}'`).join(', ') + ',');
  }
  return `export const ${name}: ReadonlySet<string> = new Set([\n${lines.join('\n')}\n]);`;
}

async function main() {
  const allow = new Set(ALLOW_SEED);
  const block = new Set(BLOCK_SEED);
  const sources = [];

  try {
    const { domains, date } = await fetchTranco(ALLOWLIST_SIZE);
    domains.forEach((d) => allow.add(d));
    sources.push(`Tranco (${domains.length} dominios, lista ${date})`);
    console.log(`✓ Tranco: ${domains.length} dominios`);
  } catch (err) {
    sources.push('Tranco: FALLÓ, solo semilla curada');
    console.warn(`✗ Tranco falló (${err.message}); se usa la semilla curada.`);
  }

  try {
    const hosts = await fetchOpenPhish();
    hosts.forEach((h) => { if (!allow.has(h)) block.add(h); });
    sources.push(`OpenPhish (${hosts.size} hosts de phishing)`);
    console.log(`✓ OpenPhish: ${hosts.size} hosts`);
  } catch (err) {
    sources.push('OpenPhish: FALLÓ, solo semilla curada');
    console.warn(`✗ OpenPhish falló (${err.message}); se usa la semilla curada.`);
  }

  const header =
    `// GENERADO por scripts/update-reputation.mjs — NO editar a mano.\n` +
    `// Actualiza con: npm run update-lists\n` +
    `// Generado: ${new Date().toISOString()}\n` +
    `// Fuentes: ${sources.join(' · ')}\n`;

  const body =
    `${header}\n` +
    `${serializeSet('EMBEDDED_ALLOWLIST', allow)}\n\n` +
    `${serializeSet('EMBEDDED_BLOCKLIST', block)}\n`;

  await writeFile(OUTPUT, body, 'utf8');
  console.log(`\n→ ${OUTPUT}`);
  console.log(`   allowlist: ${allow.size} · blocklist: ${block.size}`);
}

main().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
