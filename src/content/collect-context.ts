import type { FormInfo, PageContext } from '../engine/types';
import { hostOf } from '../engine/url-utils';

export function collectPageContext(): PageContext {
  const url = location.href;

  const forms: FormInfo[] = Array.from(document.forms).map((form) => ({
    actionHost: hostOf(form.getAttribute('action') ?? '', url),
    hasPasswordField: form.querySelector('input[type="password"]') !== null,
  }));

  const iframes = Array.from(document.querySelectorAll('iframe'));
  const hasFullPageIframe = iframes.some((f) => {
    const r = f.getBoundingClientRect();
    return r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9;
  });

  const hiddenInputCount = document.querySelectorAll('input[type="hidden"]').length;

  const anchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
  const externalLinks = anchors.filter((a) => {
    const host = hostOf(a.getAttribute('href') ?? '', url);
    return host !== null && host !== location.hostname;
  });
  const externalLinkRatio = anchors.length > 0 ? externalLinks.length / anchors.length : 0;

  const faviconEl = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  const faviconHost = faviconEl ? hostOf(faviconEl.href, url) : null;

  return {
    url,
    title: document.title,
    forms,
    hasFullPageIframe,
    hiddenInputCount,
    externalLinkRatio,
    faviconHost,
  };
}
