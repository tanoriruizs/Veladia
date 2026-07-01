import { parseUrl, registrableDomain } from './url-utils';
import { KNOWN_BRANDS } from '../data/brands';
import type { PageContext, Signal } from './types';

export function analyzeContent(ctx: PageContext): Signal[] {
  const parsed = parseUrl(ctx.url);
  if (!parsed) return [];

  const signals: Signal[] = [];
  const push = (s: Signal | null) => s && signals.push(s);
  const pageDomain = registrableDomain(parsed.hostname);

  push(checkCrossDomainLoginForm(ctx, pageDomain));
  push(checkPasswordOverHttp(ctx, parsed.protocol));
  push(checkBrandMismatch(ctx, pageDomain));
  push(checkFaviconMismatch(ctx, pageDomain));
  push(checkHiddenInputs(ctx));
  push(checkFullPageIframe(ctx));
  push(checkExternalLinkRatio(ctx));

  return signals;
}

function checkCrossDomainLoginForm(ctx: PageContext, pageDomain: string): Signal | null {
  const offending = ctx.forms.find(
    (f) => f.hasPasswordField && f.actionHost && registrableDomain(f.actionHost) !== pageDomain,
  );
  if (!offending) return null;
  return { id: 'cross-domain-login', label: 'Un formulario de acceso envía tus datos a otro dominio', weight: 40, category: 'content' };
}

function checkPasswordOverHttp(ctx: PageContext, protocol: string): Signal | null {
  if (protocol === 'https') return null;
  if (!ctx.forms.some((f) => f.hasPasswordField)) return null;
  return { id: 'password-http', label: 'Campo de contraseña en una página sin HTTPS', weight: 28, category: 'content' };
}

function checkBrandMismatch(ctx: PageContext, pageDomain: string): Signal | null {
  const title = ctx.title.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    const name = brand.split('.')[0];
    if (name.length >= 4 && title.includes(name) && registrableDomain(pageDomain) !== brand) {
      return { id: 'brand-mismatch', label: `La página menciona "${name}" pero el dominio no le pertenece`, weight: 25, category: 'content' };
    }
  }
  return null;
}

function checkFaviconMismatch(ctx: PageContext, pageDomain: string): Signal | null {
  if (!ctx.faviconHost) return null;
  const faviconDomain = registrableDomain(ctx.faviconHost);
  if (faviconDomain === pageDomain) return null;
  if (!KNOWN_BRANDS.includes(faviconDomain)) return null;
  const brand = faviconDomain.split('.')[0];
  return { id: 'favicon-mismatch', label: `El ícono proviene de "${brand}" pero el dominio no le pertenece`, weight: 18, category: 'content' };
}

function checkHiddenInputs(ctx: PageContext): Signal | null {
  if (ctx.hiddenInputCount < 6) return null;
  return { id: 'hidden-inputs', label: 'Muchos campos ocultos en los formularios', weight: 10, category: 'content' };
}

function checkFullPageIframe(ctx: PageContext): Signal | null {
  if (!ctx.hasFullPageIframe) return null;
  return { id: 'full-iframe', label: 'La página carga otro sitio dentro de un iframe a pantalla completa', weight: 18, category: 'content' };
}

function checkExternalLinkRatio(ctx: PageContext): Signal | null {
  if (ctx.externalLinkRatio < 0.85) return null;
  return { id: 'external-links', label: 'Casi todos los enlaces apuntan a dominios externos', weight: 8, category: 'content' };
}
