export const EMBEDDED_ALLOWLIST: ReadonlySet<string> = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'wikipedia.org', 'amazon.com',
  'microsoft.com', 'apple.com', 'netflix.com', 'linkedin.com', 'github.com',
  'reddit.com', 'paypal.com', 'cloudflare.com', 'mozilla.org', 'stackoverflow.com',
]);

export const EMBEDDED_BLOCKLIST: ReadonlySet<string> = new Set([
  'secure-paypal-login.tk',
  'account-verify-amazon.ml',
]);
