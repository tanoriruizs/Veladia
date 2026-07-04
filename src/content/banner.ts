import type { AnalysisResult } from '../engine/types';

const BANNER_ID = 'veladia-warning-banner';

const SHIELD_SVG =
  '<svg width="20" height="20" viewBox="305 271 660 660" fill="none" aria-hidden="true">' +
  '<g transform="translate(0,1254) scale(0.1,-0.1)" fill="#fff" stroke="none">' +
  '<path d="M6235 9496 c-363 -40 -677 -132 -1010 -296 -616 -303 -1106 -816 -1385 -1450 -360 -816 -359 -1674 2 -2485 298 -669 855 -1212 1533 -1494 607 -253 1288 -275 1905 -62 651 224 1186 666 1545 1276 104 177 194 378 258 580 52 162 52 166 10 95 -399 -669 -1069 -1097 -1833 -1171 -284 -27 -635 18 -925 118 -55 19 -168 68 -251 108 -710 345 -1202 1025 -1310 1812 -23 167 -23 484 0 636 45 302 120 538 257 807 266 523 744 948 1330 1184 302 121 592 181 934 195 l160 6 -150 42 c-147 41 -291 71 -450 93 -126 18 -483 21 -620 6z"/>' +
  '<path d="M6900 8200 c-14 -11 -86 -59 -160 -107 -356 -229 -765 -397 -1153 -473 l-59 -12 5 -386 c5 -416 7 -433 68 -682 169 -686 618 -1253 1238 -1565 l92 -46 125 65 c462 241 822 612 1040 1072 70 146 113 266 158 435 68 261 86 428 86 830 l0 276 -62 12 c-429 83 -845 261 -1244 532 -56 38 -103 69 -105 69 -2 0 -15 -9 -29 -20z"/>' +
  '</g></svg>';

export function removeWarningBanner(): void {
  document.getElementById(BANNER_ID)?.remove();
}

export function showWarningBanner(result: AnalysisResult): void {
  removeWarningBanner();

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'alert');
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0', left: '0', right: '0',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    background: '#b91c1c',
    color: '#fff',
    font: '500 13.5px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  });

  const icon = document.createElement('span');
  icon.style.flex = 'none';
  icon.style.display = 'inline-flex';
  icon.innerHTML = SHIELD_SVG;

  const text = document.createElement('span');
  text.style.flex = '1';
  text.innerHTML =
    `<strong style="font-weight:600">Veladia:</strong> este sitio muestra señales de phishing ` +
    `(riesgo ${result.score}/100). No introduzcas contraseñas ni datos personales.`;

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = 'Entiendo el riesgo';
  Object.assign(dismiss.style, {
    flex: 'none',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,.55)',
    background: 'transparent',
    color: '#fff',
    padding: '7px 13px',
    borderRadius: '8px',
    font: 'inherit',
    fontWeight: '600',
  });
  dismiss.addEventListener('click', () => banner.remove());

  banner.append(icon, text, dismiss);
  document.documentElement.appendChild(banner);
}
